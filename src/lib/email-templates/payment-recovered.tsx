import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface PaymentRecoveredProps {
  planName?: string
  amount?: string
  nextChargeDate?: string
  ctaUrl?: string
}

const PaymentRecovered = ({
  planName = 'tu suscripción',
  amount,
  nextChargeDate,
  ctaUrl = 'https://plataforma-test1.lovable.app/perfil',
}: PaymentRecoveredProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu pago se procesó correctamente y tu acceso está restablecido</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Tu pago se procesó correctamente</Heading>
        <Text style={styles.text}>
          Listo: recibimos el pago de <strong>{planName}</strong>
          {amount ? ` por ${amount}` : ''} y tu acceso a la plataforma quedó
          completamente restablecido. No tenés que hacer nada más.
        </Text>
        {nextChargeDate ? (
          <Text style={styles.text}>
            <strong>Próxima renovación:</strong> {nextChargeDate}
          </Text>
        ) : null}
        <Button style={styles.button} href={ctaUrl}>Ver mi suscripción</Button>
        <Text style={styles.footer}>
          Podés revisar tus facturas y métodos de pago desde tu perfil en cualquier momento.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentRecovered,
  subject: 'Tu pago se procesó correctamente',
  displayName: 'Pago recuperado',
  previewData: {
    planName: 'Academy Pro',
    amount: 'USD 87.00',
    nextChargeDate: '12/09/2026',
  },
} satisfies TemplateEntry

export default PaymentRecovered
