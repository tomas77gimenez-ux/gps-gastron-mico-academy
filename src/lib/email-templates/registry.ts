import type { ComponentType } from 'react'
import { template as welcomeTemplate } from './welcome'
import { template as trialEndingTemplate } from './trial-ending'
import { template as paymentFailedTemplate } from './payment-failed'
import { template as subscriptionCanceledTemplate } from './subscription-canceled'
import { template as novedadesTemplate } from './novedades'
import { template as gdAccessTemplate } from './gd-access'
import { template as subscriptionWelcomeTemplate } from './subscription-welcome'
import { template as paymentRecoveredTemplate } from './payment-recovered'
import { template as cancellationScheduledTemplate } from './cancellation-scheduled'
import { template as planChangedTemplate } from './plan-changed'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: welcomeTemplate,
  'trial-ending': trialEndingTemplate,
  'payment-failed': paymentFailedTemplate,
  'subscription-canceled': subscriptionCanceledTemplate,
  novedades: novedadesTemplate,
  'gd-access': gdAccessTemplate,
  'subscription-welcome': subscriptionWelcomeTemplate,
  'payment-recovered': paymentRecoveredTemplate,
  'cancellation-scheduled': cancellationScheduledTemplate,
  'plan-changed': planChangedTemplate,
}
