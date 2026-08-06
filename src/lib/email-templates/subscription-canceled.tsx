import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface SubscriptionCanceledProps {
  name?: string
  planName?: string
  accessUntil?: string
  ctaUrl?: string
}

const SubscriptionCanceled = ({
  name,
  planName = 'tu suscripción',
  accessUntil,
  ctaUrl = 'https://plataforma-test1.lovable.app/planes',
}: SubscriptionCanceledProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu suscripción a {brand.siteName} fue cancelada</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>
          {name ? `${name}, tu suscripción fue cancelada` : 'Tu suscripción fue cancelada'}
        </Heading>
        <Text style={styles.text}>
          Confirmamos la cancelación de <strong>{planName}</strong>. No se realizarán nuevos cobros.
          {accessUntil ? ` Mantenés el acceso hasta el ${accessUntil}.` : ''}
        </Text>
        <Text style={styles.text}>
          Gracias por haber formado parte. Si en algún momento querés volver, tu cuenta y tu progreso
          en los cursos siguen guardados.
        </Text>
        <Button style={styles.button} href={ctaUrl}>Ver planes</Button>
        <Text style={styles.footer}>
          ¿Nos contás por qué te vas? Respondé este correo: nos ayuda a mejorar.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionCanceled,
  subject: 'Tu suscripción fue cancelada',
  displayName: 'Suscripción cancelada',
  previewData: { name: 'Tomás', planName: 'Plan Premium', accessUntil: '12/09/2026' },
} satisfies TemplateEntry

export default SubscriptionCanceled