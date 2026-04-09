import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AXIVA'
const SITE_URL = 'https://axiva.ai'

interface SubscriptionCanceledProps {
  name?: string
}

const SubscriptionCanceledEmail = ({ name }: SubscriptionCanceledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your membership has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${SITE_URL}/favicon.png`}
            width="40"
            height="40"
            alt="AXIVA"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Membership Cancelled</Heading>
        <Text style={text}>
          Hi {name || 'there'},
        </Text>
        <Text style={text}>
          We have received and processed your request to cancel your Pro membership.
        </Text>
        <Text style={text}>
          Your membership has now been cancelled and you will not be charged any further membership fees.
        </Text>
        <Text style={text}>
          I hope to welcome you back in the future.
        </Text>
        <Text style={text}>
          Thank you,
        </Text>
        <Text style={signoff}>
          The {SITE_NAME} Team
        </Text>
        <Text style={footer}>
          If you have any questions, please contact us at support@axiva.ai.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionCanceledEmail,
  subject: 'Your AXIVA membership has been cancelled',
  displayName: 'Subscription cancelled',
  previewData: { name: 'Jagadeesan Mariappan' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { borderRadius: '8px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0f1117',
  margin: '0 0 24px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: '#0f1117',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const signoff = {
  fontSize: '15px',
  color: '#0f1117',
  lineHeight: '1.6',
  margin: '0 0 24px',
  fontWeight: '600' as const,
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '32px 0 0', lineHeight: '1.5' }
