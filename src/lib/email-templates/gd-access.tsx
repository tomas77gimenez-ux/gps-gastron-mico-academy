import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface GdAccessProps {
  productName?: string
  hasAccount?: boolean
  ctaUrl?: string
  signupUrl?: string
  email?: string
}

const GdAccess = ({
  productName = 'Gerente Digital',
  hasAccount = true,
  ctaUrl = 'https://plataforma-test1.lovable.app/perfil',
  signupUrl = 'https://plataforma-test1.lovable.app/registro',
  email,
}: GdAccessProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu {productName} ya está disponible</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Tu {productName} ya está disponible</Heading>
        <Text style={styles.text}>
          ¡Gracias por tu compra! Ya podés acceder a los archivos de {productName} y
          empezar a auditar tu operación hoy mismo.
        </Text>
        {hasAccount ? (
          <Button style={styles.button} href={ctaUrl}>Acceder a mi Gerente Digital</Button>
        ) : (
          <>
            <Text style={styles.text}>
              Para desbloquear el acceso, creá tu cuenta con este mismo correo
              {email ? ` (${email})` : ''} y tu compra se activa automáticamente.
            </Text>
            <Button style={styles.button} href={signupUrl}>Crear mi cuenta</Button>
          </>
        )}
        <Text style={styles.footer}>
          Si tenés dudas, respondé este correo y te ayudamos.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: GdAccess,
  subject: (data: Record<string, any>) => `Tu ${data?.productName ?? 'Gerente Digital'} ya está disponible`,
  displayName: 'Acceso a Gerente Digital',
  previewData: {
    productName: 'Gerente Digital 1 — Salón y Atención',
    hasAccount: true,
    ctaUrl: 'https://plataforma-test1.lovable.app/perfil',
  },
} satisfies TemplateEntry

export default GdAccess