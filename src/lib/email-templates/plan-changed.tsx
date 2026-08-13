import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface PlanChangedProps {
  planName?: string
  previousPlanName?: string
  amount?: string
  interval?: string
  nextChargeDate?: string
  tier?: 'basico' | 'premium' | 'elite' | string
  ctaUrl?: string
}

const UNLOCKS: Record<string, string[]> = {
  basico: [
    'Curso GPS Gastronómico completo (7 módulos)',
    'Caja de Herramientas: DRE, flujo de caja, punto de equilibrio y CMV',
  ],
  premium: [
    'Todo lo del plan Academy',
    'Sala Pro: sesiones en vivo y grabaciones',
    'Casos del mes con métricas reales',
    'Herramienta SUP y grupo VIP de WhatsApp',
  ],
  elite: [
    'Todo lo del plan Academy Pro',
    'Llamada 1 a 1 con Daniel para diagnóstico personalizado',
    'Acompañamiento prioritario',
  ],
}

const PlanChanged = ({
  planName = 'tu nuevo plan',
  previousPlanName,
  amount,
  interval = 'mensual',
  nextChargeDate,
  tier = 'basico',
  ctaUrl = 'https://plataforma-test1.lovable.app/dashboard',
}: PlanChangedProps) => {
  const unlocks = UNLOCKS[tier] ?? UNLOCKS['basico']!
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Actualizaste tu plan a {planName}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <div style={styles.brandBar} />
          <Text style={styles.logo}>{brand.siteName}</Text>
          <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
          <Heading style={styles.h1}>Actualizaste tu plan a {planName}</Heading>
          <Text style={styles.text}>
            Tu cambio de plan{previousPlanName ? ` desde ${previousPlanName}` : ''} ya está
            aplicado. El acceso nuevo está disponible ahora mismo, sin esperas.
          </Text>
          <Heading as="h2" style={{ ...styles.h1, fontSize: '17px', margin: '4px 0 12px' }}>
            Lo que tenés disponible
          </Heading>
          {unlocks.map((item, i) => (
            <Text key={i} style={{ ...styles.text, margin: '0 0 8px' }}>
              · {item}
            </Text>
          ))}
          <Text style={{ ...styles.text, margin: '20px 0' }}>
            <strong>Facturación:</strong> {interval}
            {amount ? ` · ${amount}` : ''}
            {nextChargeDate ? (
              <>
                <br />
                <strong>Próximo cobro:</strong> {nextChargeDate}
              </>
            ) : null}
          </Text>
          <Button style={styles.button} href={ctaUrl}>Ver mi nuevo acceso</Button>
          <Text style={styles.footer}>
            Cualquier duda con la facturación o el acceso, respondé este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PlanChanged,
  subject: (data: Record<string, any>) =>
    `Actualizaste tu plan a ${data?.planName ?? 'tu nuevo plan'}`,
  displayName: 'Cambio de plan',
  previewData: {
    planName: 'Academy Élite',
    previousPlanName: 'Academy Pro',
    amount: 'USD 167.00',
    interval: 'mensual',
    nextChargeDate: '12/09/2026',
    tier: 'elite',
  },
} satisfies TemplateEntry

export default PlanChanged
