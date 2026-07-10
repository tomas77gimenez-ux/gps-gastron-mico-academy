import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

/**
 * Sends the welcome email once per user, on first sign-in.
 * Uses profiles.welcomed_at as a durable idempotency flag so the email
 * is never sent twice, even across devices/sessions.
 */
export async function sendWelcomeIfNeeded(session: Session): Promise<void> {
  const user = session.user
  if (!user?.email) return

  // Check if this user has already been welcomed.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('welcomed_at, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) return
  if (profile?.welcomed_at) return

  // Mark first (optimistic) so a race can't fire twice from two tabs.
  const nowIso = new Date().toISOString()
  const { error: markError } = await supabase
    .from('profiles')
    .update({ welcomed_at: nowIso })
    .eq('user_id', user.id)
    .is('welcomed_at', null)

  if (markError) return

  const displayName =
    profile?.display_name ??
    (user.user_metadata as Record<string, unknown> | undefined)?.display_name ??
    user.email.split('@')[0]

  try {
    const res = await fetch('/lovable/email/transactional/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        templateName: 'welcome',
        recipientEmail: user.email,
        idempotencyKey: `welcome-${user.id}`,
        templateData: {
          name: displayName,
          ctaUrl: `${window.location.origin}/dashboard`,
        },
      }),
    })

    if (!res.ok) {
      // Roll back the mark so a later sign-in retries.
      await supabase
        .from('profiles')
        .update({ welcomed_at: null })
        .eq('user_id', user.id)
    }
  } catch {
    await supabase
      .from('profiles')
      .update({ welcomed_at: null })
      .eq('user_id', user.id)
  }
}