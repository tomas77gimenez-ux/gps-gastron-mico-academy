import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface SubscriptionWelcomeProps {
  name?: string
  planName?: string
  amount?: string
  interval?: string
  trialEndDate?: string
  nextChargeDate?: string
  tier?: 'basico' | 'premium' | 'elite' | string
  ctaUrl?: string
}

const SubscriptionWelcome = ({
  name,
  planName = 'tu plan',
  amount,
  interval = 'mensual',
  trialEndDate,
  nextChargeDate,
  tier = 'basico',
  ctaUrl = 'https://plataforma-test1.lovable.app/dashboard',
}: SubscriptionWelcomeProps) => {
  const steps = [
    'Entrá a Mentoría y empezá por el Módulo 1 del Curso GPS Gastronómico.',
    'Abrí la Caja de Herramientas y cargá tu primer DRE o cierre de caja.',
  ]
  if (tier === 'premium' || tier === 'elite') {
    steps.push('Reservá tu lugar en la próxima Sala Pro y revisá los casos del mes.')
  }
  if (tier === 'elite') {
    steps.push('Agendá tu llamada 1 a 1 con Daniel para tu diagnóstico personalizado.')
  }

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Bienvenido a {planName}: tu acceso ya está activo</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <div style={styles.brandBar} />
          <Text style={styles.logo}>{brand.siteName}</Text>
          <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
          <Heading style={styles.h1}>
            {name ? `${name}, bienvenido a ${planName}` : `Bienvenido a ${planName}`}
          </Heading>
          <Text style={styles.text}>
            Tu suscripción ya está activa. A partir de ahora tenés acceso a la plataforma
            y a todo lo que incluye tu plan.
          </Text>
          <Text style={styles.text}>
            <strong>Plan:</strong> {planName}
            <br />
            <strong>Facturación:</strong> {interval}
            {amount ? ` · ${amount}` : ''}
            <br />
            {trialEndDate ? (
              <>
                <strong>Prueba gratuita hasta:</strong> {trialEndDate} (el primer cobro se hace ese día)
              </>
            ) : nextChargeDate ? (
              <>
                <strong>Próximo cobro:</strong> {nextChargeDate}
              </>
            ) : null}
          </Text>
          <Heading as="h2" style={{ ...styles.h1, fontSize: '17px', margin: '4px 0 12px' }}>
            Primeros pasos
          </Heading>
          {steps.map((step, i) => (
            <Text key={i} style={{ ...styles.text, margin: '0 0 10px' }}>
              {i + 1}. {step}
            </Text>
          ))}
          <Text style={{ ...styles.text, margin: '20px 0' }}>
            Empezá por acá:
          </Text>
          <Button style={styles.button} href={ctaUrl}>Entrar a la plataforma</Button>
          <Text style={styles.footer}>
            Podés gestionar o cancelar tu suscripción en cualquier momento desde tu perfil.
            Si tenés dudas, respondé este correo y te ayudamos.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SubscriptionWelcome,
  subject: (data: Record<string, any>) => `Bienvenido a ${data?.planName ?? 'GPS Gastronômico'}`,
  displayName: 'Bienvenida a suscripción',
  previewData: {
    name: 'Tomás',
    planName: 'Academy Pro',
    amount: 'USD 87.00',
    interval: 'mensual',
    trialEndDate: '18/08/2026',
    tier: 'premium',
  },
} satisfies TemplateEntry

export default SubscriptionWelcome
