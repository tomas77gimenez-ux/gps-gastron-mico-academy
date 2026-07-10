import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu enlace de acceso a {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Tu enlace de acceso</Heading>
        <Text style={styles.text}>
          Hacé clic en el botón para ingresar a {brand.siteName}. El enlace vence en breve.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Ingresar</Button>
        <Text style={styles.footer}>
          Si no solicitaste este enlace, podés ignorar este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
