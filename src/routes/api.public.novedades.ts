import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import type { NovedadItem } from '@/lib/email-templates/novedades'

const SITE = 'https://plataforma-test1.lovable.app'

interface Collected {
  items: NovedadItem[]
  ids: {
    lessons: string[]
    materials: string[]
    recordings: string[]
    cases: string[]
  }
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export const Route = createFileRoute('/api/public/novedades')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.slice(7).trim()
        const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

        let mode: 'cron' | 'manual' = 'cron'
        try {
          const body = await request.json()
          if (body?.mode === 'manual') mode = 'manual'
        } catch {
          /* empty body = cron */
        }

        const isServiceCaller = token === serviceKey
        if (!isServiceCaller) {
          const { data: userRes, error: userErr } = await admin.auth.getUser(token)
          if (userErr || !userRes?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }
          const { data: isAdmin } = await admin.rpc('has_role', {
            _user_id: userRes.user.id,
            _role: 'admin',
          })
          if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })
          mode = 'manual'
        }

        // ---- 1. Collect unannounced content -------------------------------
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const windowed = <T extends { gte: (c: string, v: string) => T }>(q: T): T =>
          mode === 'cron' ? q.gte('created_at', since) : q

        const [lessons, materials, recordings, cases] = await Promise.all([
          windowed(
            admin.from('lessons').select('id, title, description, course_id, created_at').is('announced_at', null) as any,
          ),
          windowed(
            admin.from('course_materials').select('id, title, course_id, created_at').is('announced_at', null) as any,
          ),
          windowed(
            admin.from('pro_recordings').select('id, title, notes, session_date, created_at').is('announced_at', null) as any,
          ),
          windowed(
            admin.from('pro_cases').select('id, title, description, month, year, created_at').is('announced_at', null) as any,
          ),
        ])

        const collected: Collected = { items: [], ids: { lessons: [], materials: [], recordings: [], cases: [] } }

        for (const l of (lessons.data ?? []) as any[]) {
          collected.ids.lessons.push(l.id)
          collected.items.push({
            kind: 'lesson',
            title: l.title,
            description: (l.description ?? '').slice(0, 140) || undefined,
            url: l.course_id ? `${SITE}/cursos/${l.course_id}` : `${SITE}/cursos`,
          })
        }
        for (const m of (materials.data ?? []) as any[]) {
          collected.ids.materials.push(m.id)
          collected.items.push({
            kind: 'material',
            title: m.title,
            description: 'Nuevo material de apoyo disponible para descargar.',
            url: m.course_id ? `${SITE}/cursos/${m.course_id}` : `${SITE}/cursos`,
          })
        }
        for (const r of (recordings.data ?? []) as any[]) {
          collected.ids.recordings.push(r.id)
          collected.items.push({
            kind: 'recording',
            title: r.title,
            description: (r.notes ?? '').slice(0, 140) || 'Grabación de la reunión semanal de implementación.',
            url: `${SITE}/sala-pro`,
            pro: true,
          })
        }
        for (const c of (cases.data ?? []) as any[]) {
          collected.ids.cases.push(c.id)
          const monthLabel = MONTHS[(c.month ?? 1) - 1] ?? ''
          collected.items.push({
            kind: 'case',
            title: c.title,
            description: (c.description ?? '').slice(0, 140) || `Caso Real de ${monthLabel} ${c.year ?? ''}`.trim(),
            url: `${SITE}/sala-pro`,
            pro: true,
          })
        }

        if (collected.items.length === 0) {
          return Response.json({ success: true, sent: 0, items: 0, reason: 'no_new_content' })
        }

        // ---- 2. Resolve recipients ---------------------------------------
        const [{ data: subs }, { data: profiles }, { data: roles }] = await Promise.all([
          admin.from('subscriptions').select('user_id, status'),
          admin.from('profiles').select('user_id, display_name, email_novedades, tools_free_access, pro_access'),
          admin.from('user_roles').select('user_id, role'),
        ])

        const eligible = new Set<string>()
        for (const s of subs ?? []) {
          if (['active', 'trialing', 'past_due'].includes(s.status)) eligible.add(s.user_id)
        }
        for (const p of profiles ?? []) {
          if (p.tools_free_access || p.pro_access) eligible.add(p.user_id)
        }
        for (const r of roles ?? []) {
          if (r.role === 'admin') eligible.add(r.user_id)
        }

        const optedOut = new Set(
          (profiles ?? []).filter((p) => p.email_novedades === false).map((p) => p.user_id),
        )
        const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name ?? null]))

        // Emails come from auth.users (not reachable via the Data API).
        const emails: Array<{ id: string; email: string }> = []
        for (let page = 1; page <= 20; page++) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
          if (error) break
          for (const u of data.users) {
            if (u.email && eligible.has(u.id) && !optedOut.has(u.id)) {
              emails.push({ id: u.id, email: u.email })
            }
          }
          if (data.users.length < 200) break
        }

        // ---- 3. Send one consolidated email per recipient -----------------
        const origin = new URL(request.url).origin
        const batchId = crypto.randomUUID().slice(0, 8)
        let sent = 0
        const failures: string[] = []

        for (const rec of emails) {
          try {
            const res = await fetch(`${origin}/lovable/email/transactional/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
              body: JSON.stringify({
                templateName: 'novedades',
                recipientEmail: rec.email,
                idempotencyKey: `novedades-${batchId}-${rec.id}`,
                templateData: {
                  name: nameByUser.get(rec.id) ?? undefined,
                  items: collected.items,
                  upgradeUrl: `${SITE}/planes`,
                  perfilUrl: `${SITE}/perfil`,
                },
              }),
            })
            if (res.ok) sent++
            else failures.push(rec.id)
          } catch {
            failures.push(rec.id)
          }
        }

        // ---- 4. Mark items as announced ----------------------------------
        const nowIso = new Date().toISOString()
        const marks: Array<PromiseLike<unknown>> = []
        if (collected.ids.lessons.length)
          marks.push(admin.from('lessons').update({ announced_at: nowIso }).in('id', collected.ids.lessons))
        if (collected.ids.materials.length)
          marks.push(admin.from('course_materials').update({ announced_at: nowIso }).in('id', collected.ids.materials))
        if (collected.ids.recordings.length)
          marks.push(admin.from('pro_recordings').update({ announced_at: nowIso }).in('id', collected.ids.recordings))
        if (collected.ids.cases.length)
          marks.push(admin.from('pro_cases').update({ announced_at: nowIso }).in('id', collected.ids.cases))
        await Promise.all(marks)

        console.log('[novedades] batch', { mode, items: collected.items.length, sent, failed: failures.length })

        return Response.json({
          success: true,
          mode,
          items: collected.items.length,
          recipients: emails.length,
          sent,
          failed: failures.length,
        })
      },
    },
  },
})
