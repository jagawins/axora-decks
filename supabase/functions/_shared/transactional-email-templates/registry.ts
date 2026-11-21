/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  /** Signed-in users may trigger this template (recipient must be fixed via `to`). */
  userSendable?: boolean
  displayName?: string
  previewData?: Record<string, any>
}

import { template as subscriptionCanceled } from './subscription-canceled.tsx'
import { template as cancellationFeedback } from './cancellation-feedback.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'subscription-canceled': subscriptionCanceled,
  'cancellation-feedback': cancellationFeedback,
}
