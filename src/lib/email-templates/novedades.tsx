import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import { brand, styles } from './_styles'
import type { TemplateEntry } from './registry'

export interface NovedadItem {
  kind: 'lesson' | 'material' | 'recording' | 'case'
  title: string
  description?: string
  url: string
  pro?: boolean
}

const KIND_LABEL: Record<NovedadItem['kind'], string> = {
  lesson: '▶ Clase',
  material: '📄 Planilla / Material',
  recording: '🎥 Grabación',
  case: '⭐ Caso Real del Mes',
}

interface NovedadesProps {
  items?: NovedadItem[]
  name?: string
  upgradeUrl?: string
  perfilUrl?: string
}

const SITE = 'https://plataforma-test1.lovable.app'

const Novedades = ({
  items = [],
  name,
  upgradeUrl = `${SITE}/planes`,
  perfilUrl = `${SITE}/perfil`,
}: NovedadesProps) => {
  const hasPro = items.some((i) => i.pro)
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>
        {items.length > 0 ? `Nuevo en tu Academy: ${items[0]!.title}` : 'Nuevo en tu Academy'}
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <div style={styles.brandBar} />
          <Text style={styles.logo}>{brand.siteName} Academy</Text>
          <Text style={styles.tagline}>Gestión · Procesos · Sustentabilidad</Text>
          <Heading style={styles.h1}>
            {name ? `${name}, hay contenido nuevo` : 'Hay contenido nuevo en tu Academy'}
          </Heading>
          <Text style={styles.text}>
            Esto es lo que se sumó {items.length === 1 ? 'a la plataforma' : 'a la plataforma en las últimas horas'}:
          </Text>

          {items.map((item, idx) => (
            <Section key={`${item.kind}-${idx}`} style={itemBox}>
              <Text style={kindLine}>
                {KIND_LABEL[item.kind]}
                {item.pro ? <span style={proTag}> PRO</span> : null}
              </Text>
              <Text style={itemTitle}>{item.title}</Text>
              {item.description ? <Text style={itemDesc}>{item.description}</Text> : null}
              <Button style={smallButton} href={item.url}>
                Ver ahora
              </Button>
            </Section>
          ))}

          {hasPro ? (
            <Section style={upgradeBox}>
              <Text style={{ ...itemDesc, margin: '0 0 12px' }}>
                Los ítems marcados <strong>PRO</strong> son parte de la Sala Pro: reunión semanal de
                implementación en vivo, grabaciones y el Caso Real del Mes.
              </Text>
              <Button style={smallButton} href={upgradeUrl}>
                Conocé Academy Pro
              </Button>
            </Section>
          ) : null}

          <Text style={styles.footer}>
            Podés desactivar estos avisos desde tu Perfil ({perfilUrl}).
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const itemBox = {
  border: `1px solid ${brand.border}`,
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 12px',
} as const

const kindLine = {
  fontSize: '11px',
  fontWeight: 700 as const,
  color: brand.primary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  margin: '0 0 6px',
}

const proTag = {
  backgroundColor: brand.dark,
  color: '#ffffff',
  borderRadius: '4px',
  padding: '2px 6px',
  marginLeft: '6px',
  fontSize: '10px',
}

const itemTitle = {
  fontSize: '15px',
  fontWeight: 600 as const,
  color: brand.dark,
  lineHeight: '1.4',
  margin: '0 0 6px',
}

const itemDesc = {
  fontSize: '13px',
  color: brand.text,
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const smallButton = {
  ...styles.button,
  fontSize: '13px',
  padding: '10px 18px',
}

const upgradeBox = {
  ...itemBox,
  backgroundColor: '#fff8f2',
  borderColor: brand.primary,
}

export const template = {
  component: Novedades,
  subject: (data: Record<string, any>) => {
    const items = (data?.items ?? []) as NovedadItem[]
    const first = items[0]?.title ?? 'contenido nuevo'
    const rest = Math.max(items.length - 1, 0)
    return `Nuevo en tu Academy: ${first}${rest > 0 ? ` y ${rest} más` : ''}`
  },
  displayName: 'Novedades',
  previewData: {
    name: 'Tomás',
    items: [
      { kind: 'lesson', title: 'Módulo 3.2 — Control de CMV', description: 'Cómo auditar tus compras semana a semana.', url: `${SITE}/cursos` },
      { kind: 'case', title: 'Caso Real de agosto', description: 'CMV 42% → 33% en 90 días.', url: `${SITE}/sala-pro`, pro: true },
    ],
  },
} satisfies TemplateEntry

export default Novedades
