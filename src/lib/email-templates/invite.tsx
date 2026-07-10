import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Fuiste invitado a {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>Recibiste una invitación</Heading>
        <Text style={styles.text}>
          Fuiste invitado a unirte a{' '}
          <Link href={siteUrl} style={styles.link}><strong>{brand.siteName}</strong></Link>.
          Aceptá la invitación y creá tu cuenta:
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Aceptar invitación</Button>
        <Text style={styles.footer}>
          Si no esperabas esta invitación, podés ignorar este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
