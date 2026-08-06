import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface TrialEndingProps {
  name?: string
  planName?: string
  amount?: string
  trialEndDate?: string
  ctaUrl?: string
}

const TrialEnding = ({
  name,
  planName = 'tu plan',
  amount,
  trialEndDate,
  ctaUrl = 'https://plataforma-test1.lovable.app/perfil',
}: TrialEndingProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu prueba gratuita de {brand.siteName} termina pronto</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>
          {name ? `${name}, tu prueba termina pronto` : 'Tu prueba termina pronto'}
        </Heading>
        <Text style={styles.text}>
          Tu prueba gratuita de <strong>{planName}</strong>
          {trialEndDate ? ` finaliza el ${trialEndDate}` : ' finaliza en pocos días'}.
          {amount
            ? ` A partir de ese momento se cobrará ${amount} y tu acceso continúa sin interrupciones.`
            : ' A partir de ese momento comienza el cobro de tu plan y tu acceso continúa sin interrupciones.'}
        </Text>
        <Text style={styles.text}>
          Si no querés continuar, podés cancelar en un clic desde tu cuenta antes de esa fecha y no se
          te cobrará nada.
        </Text>
        <Button style={styles.button} href={ctaUrl}>Gestionar mi suscripción</Button>
        <Text style={styles.footer}>
          ¿Dudas sobre qué plan te conviene? Respondé este correo y te ayudamos.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TrialEnding,
  subject: 'Tu prueba gratuita termina pronto',
  displayName: 'Fin de prueba gratuita',
  previewData: {
    name: 'Tomás',
    planName: 'Plan Premium',
    amount: 'US$ 128,00 por mes',
    trialEndDate: '12/08/2026',
  },
} satisfies TemplateEntry

export default TrialEnding