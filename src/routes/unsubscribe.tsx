import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/unsubscribe')({
  head: () => ({
    meta: [
      { title: 'Cancelar suscripción · GPS Gastronômico' },
      { name: 'description', content: 'Cancelá tu suscripción a los correos de GPS Gastronômico.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

type Status = 'loading' | 'ready' | 'confirming' | 'success' | 'already' | 'invalid' | 'error'

function UnsubscribePage() {
  const [status, setStatus] = React.useState<Status>('loading')
  const [errorMsg, setErrorMsg] = React.useState<string>('')

  const token = React.useMemo(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('token') ?? ''
  }, [])

  React.useEffect(() => {
    let cancelled = false
    if (!token) {
      setStatus('invalid')
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setStatus('invalid')
          return
        }
        if (body.valid === false && body.reason === 'already_unsubscribed') {
          setStatus('already')
          return
        }
        if (body.valid) {
          setStatus('ready')
          return
        }
        setStatus('invalid')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  async function confirm() {
    setStatus('confirming')
    setErrorMsg('')
    try {
      const res = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const body = await res.json()
      if (!res.ok) {
        setErrorMsg(body.error ?? 'No pudimos procesar tu solicitud.')
        setStatus('error')
        return
      }
      if (body.success) setStatus('success')
      else if (body.reason === 'already_unsubscribed') setStatus('already')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          GPS Gastronômico
        </p>
        <h1 className="text-2xl font-bold mb-4">Cancelar suscripción</h1>

        {status === 'loading' && (
          <p className="text-muted-foreground">Validando tu enlace…</p>
        )}

        {status === 'ready' && (
          <>
            <p className="text-muted-foreground mb-6">
              ¿Confirmás que querés dejar de recibir correos de GPS Gastronômico?
            </p>
            <button
              onClick={confirm}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition"
            >
              Confirmar cancelación
            </button>
          </>
        )}

        {status === 'confirming' && (
          <p className="text-muted-foreground">Procesando…</p>
        )}

        {status === 'success' && (
          <p className="text-foreground">
            Listo. No recibirás más correos. Podés cerrar esta ventana.
          </p>
        )}

        {status === 'already' && (
          <p className="text-muted-foreground">
            Este correo ya había sido dado de baja anteriormente.
          </p>
        )}

        {status === 'invalid' && (
          <p className="text-muted-foreground">
            El enlace no es válido o expiró. Contactanos si necesitás ayuda.
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="text-destructive mb-4">
              Ocurrió un problema. {errorMsg}
            </p>
            <button
              onClick={confirm}
              className="w-full rounded-md border border-border py-3 hover:bg-accent transition"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}