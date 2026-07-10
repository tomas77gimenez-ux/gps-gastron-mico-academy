import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Confirmá tu identidad</Heading>
        <Text style={styles.text}>Usá este código para continuar:</Text>
        <Text style={styles.code}>{token}</Text>
        <Text style={styles.footer}>
          El código vence en breve. Si no lo solicitaste, ignorá este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
