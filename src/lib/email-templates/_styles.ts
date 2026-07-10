// Shared brand styles for GPS Gastronômico emails.
// Body background must stay white per email best-practices.
export const brand = {
  primary: '#ff7a1a', // orange accent
  dark: '#0a0a0a',
  text: '#3a3a3a',
  muted: '#8a8a8a',
  border: '#ececec',
  siteName: 'GPS Gastronômico',
}

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', Arial, sans-serif",
    margin: 0,
    padding: '32px 0',
  } as const,
  container: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '32px 28px',
    border: `1px solid ${brand.border}`,
    borderRadius: '12px',
    backgroundColor: '#ffffff',
  } as const,
  brandBar: {
    borderTop: `4px solid ${brand.primary}`,
    borderRadius: '12px 12px 0 0',
    marginBottom: '24px',
  } as const,
  logo: {
    fontSize: '18px',
    fontWeight: 700 as const,
    color: brand.dark,
    letterSpacing: '-0.01em',
    margin: '0 0 4px',
  } as const,
  tagline: {
    fontSize: '11px',
    color: brand.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: '0 0 24px',
  } as const,
  h1: {
    fontSize: '22px',
    fontWeight: 700 as const,
    color: brand.dark,
    margin: '0 0 16px',
    lineHeight: '1.3',
  } as const,
  text: {
    fontSize: '15px',
    color: brand.text,
    lineHeight: '1.6',
    margin: '0 0 20px',
  } as const,
  link: { color: brand.primary, textDecoration: 'underline' } as const,
  button: {
    backgroundColor: brand.primary,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600 as const,
    borderRadius: '8px',
    padding: '13px 24px',
    textDecoration: 'none',
    display: 'inline-block',
  } as const,
  code: {
    display: 'inline-block',
    fontFamily: "'Courier New', monospace",
    fontSize: '26px',
    fontWeight: 700 as const,
    color: brand.dark,
    letterSpacing: '0.25em',
    padding: '14px 22px',
    backgroundColor: '#f7f7f7',
    border: `1px solid ${brand.border}`,
    borderRadius: '8px',
    margin: '0 0 24px',
  } as const,
  footer: {
    fontSize: '12px',
    color: brand.muted,
    lineHeight: '1.5',
    margin: '32px 0 0',
    borderTop: `1px solid ${brand.border}`,
    paddingTop: '20px',
  } as const,
}