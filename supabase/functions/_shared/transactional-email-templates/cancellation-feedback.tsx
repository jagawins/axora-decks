import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "AXIVA"

interface CancellationFeedbackProps {
  reason?: string
  followUp?: string
  feedback?: string
}

const CancellationFeedbackEmail = ({ reason, followUp, feedback }: CancellationFeedbackProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Cancellation feedback from {SITE_NAME} user</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Cancellation Feedback</Heading>
        <Text style={text}>A user just cancelled their subscription. Here's their feedback:</Text>

        <Text style={labelStyle}>Reason for leaving:</Text>
        <Text style={valueStyle}>{reason || 'Not specified'}</Text>

        <Text style={labelStyle}>Follow-up details:</Text>
        <Text style={valueStyle}>{followUp || 'No details provided'}</Text>

        <Hr style={hr} />

        <Text style={labelStyle}>What could we have done better:</Text>
        <Text style={valueStyle}>{feedback || 'No additional feedback'}</Text>

        <Hr style={hr} />
        <Text style={footer}>This is an automated notification from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CancellationFeedbackEmail,
  subject: 'User Cancellation Feedback',
  displayName: 'Cancellation feedback',
  previewData: { reason: 'Too expensive', followUp: 'Would prefer $15/mo', feedback: 'Great product but price is high' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '580px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 15px' }
const labelStyle = { fontSize: '12px', color: '#999999', fontWeight: 'bold' as const, margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const valueStyle = { fontSize: '14px', color: '#111111', lineHeight: '1.5', margin: '0 0 20px', padding: '10px 14px', backgroundColor: '#f5f5f5', borderRadius: '6px' }
const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '20px 0 0' }
