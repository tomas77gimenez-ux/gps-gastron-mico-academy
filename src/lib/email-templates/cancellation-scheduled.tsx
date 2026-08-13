import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

interface CancellationScheduledProps {
  planName?: string
  accessUntil?: string
  ctaUrl?: string
}

const CancellationScheduled = ({
  planName = 'tu suscripción',
  accessUntil,
  ctaUrl = 'https://plataforma-test1.lovable.app/perfil',
}: CancellationScheduledProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>
      Tu suscripción se cancelará{accessUntil ? ` el ${accessUntil}` : ' al final del período'}
    </Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <div style={styles.brandBar} />
        <Text style={styles.logo}>{brand.siteName}</Text>
        <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
        <Heading style={styles.h1}>
          Tu suscripción se cancelará{accessUntil ? ` el ${accessUntil}` : ''}
        </Heading>
        <Text style={styles.text}>
          Registramos tu pedido de cancelación de <strong>{planName}</strong>. No se te va a
          cobrar de nuevo.
        </Text>
        <Text style={styles.text}>
          <strong>
            Tu acceso sigue activo{accessUntil ? ` hasta el ${accessUntil}` : ' hasta el final del período pagado'}
          </strong>
          , así que podés seguir usando la plataforma con normalidad hasta esa fecha.
        </Text>
        <Text style={styles.text}>
          Si cambiás de idea, podés reactivar tu suscripción en un clic y no perdés nada de tu
          progreso ni de tus datos cargados en las herramientas.
        </Text>
        <Button style={styles.button} href={ctaUrl}>Reactivar mi suscripción</Button>
        <Text style={styles.footer}>
          ¿Algo no funcionó como esperabas? Respondé este correo y contanos: nos sirve para
          mejorar y quizá podamos ayudarte a resolverlo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CancellationScheduled,
  subject: (data: Record<string, any>) =>
    data?.accessUntil
      ? `Tu suscripción se cancelará el ${data.accessUntil}`
      : 'Tu suscripción se cancelará al final del período',
  displayName: 'Cancelación programada',
  previewData: { planName: 'Academy Pro', accessUntil: '12/09/2026' },
} satisfies TemplateEntry

export default CancellationScheduled
