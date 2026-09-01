import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useI18n, tFor } from '@/lib/i18n'
import { readPrefs } from '@/lib/prefs'

export const Route = createFileRoute('/unsubscribe')({
  head: () => {
    const t = tFor(readPrefs().lang)
    return {
      meta: [
        { title: t('unsub.headTitle') },
        { name: 'description', content: t('unsub.headDesc') },
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  component: UnsubscribePage,
})

type Status = 'loading' | 'ready' | 'confirming' | 'success' | 'already' | 'invalid' | 'error'

function UnsubscribePage() {
  const { t } = useI18n()
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
        setErrorMsg(body.error ?? t('unsub.errorDefault'))
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
        <h1 className="text-2xl font-bold mb-4">{t('unsub.title')}</h1>

        {status === 'loading' && (
          <p className="text-muted-foreground">{t('unsub.validating')}</p>
        )}

        {status === 'ready' && (
          <>
            <p className="text-muted-foreground mb-6">
              {t('unsub.confirmQuestion')}
            </p>
            <button
              onClick={confirm}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition"
            >
              {t('unsub.confirmButton')}
            </button>
          </>
        )}

        {status === 'confirming' && (
          <p className="text-muted-foreground">{t('unsub.processing')}</p>
        )}

        {status === 'success' && (
          <p className="text-foreground">
            {t('unsub.success')}
          </p>
        )}

        {status === 'already' && (
          <p className="text-muted-foreground">
            {t('unsub.already')}
          </p>
        )}

        {status === 'invalid' && (
          <p className="text-muted-foreground">
            {t('unsub.invalid')}
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="text-destructive mb-4">
              {t('unsub.errorPrefix')} {errorMsg}
            </p>
            <button
              onClick={confirm}
              className="w-full rounded-md border border-border py-3 hover:bg-accent transition"
            >
              {t('unsub.retry')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
