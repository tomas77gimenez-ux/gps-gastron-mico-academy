import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface WelcomeProps {
  name?: string
  ctaUrl?: string
}

const Welcome = ({ name, ctaUrl = 'https://plataforma-test1.lovable.app/dashboard' }: WelcomeProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Bienvenido a {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>
          {name ? `¡Bienvenido, ${name}!` : '¡Bienvenido!'}
        </Heading>
        <Text style={styles.text}>
          Gracias por sumarte a {brand.siteName}. Ya podés acceder a los cursos, el
          asistente de gestión y todas las herramientas de tu plan.
        </Text>
        <Button style={styles.button} href={ctaUrl}>Ir a mi panel</Button>
        <Text style={styles.footer}>
          Si tenés dudas, respondé este correo y te ayudamos.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Welcome,
  subject: 'Bienvenido a GPS Gastronômico',
  displayName: 'Bienvenida',
  previewData: { name: 'Tomás', ctaUrl: 'https://plataforma-test1.lovable.app/dashboard' },
} satisfies TemplateEntry

export default Welcome