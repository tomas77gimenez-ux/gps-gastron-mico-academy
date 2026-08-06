import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface PaymentFailedProps {
  name?: string
  planName?: string
  amount?: string
  ctaUrl?: string
}

const PaymentFailed = ({
  name,
  planName = 'tu suscripción',
  amount,
  ctaUrl = 'https://plataforma-test1.lovable.app/perfil',
}: PaymentFailedProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>No pudimos procesar tu pago en {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>
          {name ? `${name}, no pudimos procesar tu pago` : 'No pudimos procesar tu pago'}
        </Heading>
        <Text style={styles.text}>
          Intentamos cobrar {amount ? `${amount} de ` : ''}<strong>{planName}</strong> y la operación fue
          rechazada por tu banco o tarjeta.
        </Text>
        <Text style={styles.text}>
          Actualizá tu medio de pago para no perder el acceso a los cursos y a las herramientas.
          Vamos a reintentar el cobro automáticamente en los próximos días.
        </Text>
        <Button style={styles.button} href={ctaUrl}>Actualizar medio de pago</Button>
        <Text style={styles.footer}>
          Si ya lo resolviste, podés ignorar este mensaje. Cualquier duda, respondé este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentFailed,
  subject: 'No pudimos procesar tu pago',
  displayName: 'Pago rechazado',
  previewData: { name: 'Tomás', planName: 'Plan Premium', amount: 'US$ 128,00' },
} satisfies TemplateEntry

export default PaymentFailed