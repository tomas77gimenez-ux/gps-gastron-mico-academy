import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmá el cambio de correo en {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Confirmá el cambio de correo</Heading>
        <Text style={styles.text}>
          Solicitaste cambiar tu dirección de correo de <strong>{oldEmail}</strong> a{' '}
          <strong>{newEmail}</strong>.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirmar cambio</Button>
        <Text style={styles.footer}>
          Si no solicitaste este cambio, protegé tu cuenta de inmediato.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
