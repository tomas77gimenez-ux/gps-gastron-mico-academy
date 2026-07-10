import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmá tu correo para {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Confirmá tu correo</Heading>
        <Text style={styles.text}>
          Gracias por registrarte en{' '}
          <Link href={siteUrl} style={styles.link}><strong>{brand.siteName}</strong></Link>.
        </Text>
        <Text style={styles.text}>
          Confirmá tu dirección (<strong>{recipient}</strong>) haciendo clic en el botón:
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Verificar correo</Button>
        <Text style={styles.footer}>
          Si no creaste esta cuenta, podés ignorar este mensaje.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
