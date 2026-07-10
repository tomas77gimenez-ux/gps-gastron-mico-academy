import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Restablecer tu contraseña de {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Restablecé tu contraseña</Heading>
        <Text style={styles.text}>
          Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón
          para elegir una nueva.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Restablecer contraseña</Button>
        <Text style={styles.footer}>
          Si no solicitaste este cambio, ignorá este correo. Tu contraseña no será modificada.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
