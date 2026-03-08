/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Verify your email to get started with Axiva</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${siteUrl}/favicon.png`}
            width="40"
            height="40"
            alt="Axiva"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Welcome to Axiva</Heading>
        <Text style={text}>
          Your first executive-grade deck is one prompt away. Verify your email
          address to get started.
        </Text>
        <Text style={textMuted}>
          Confirming for{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
        </Text>
        <Button style={button} href={confirmationUrl}>
          Get Started →
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { borderRadius: '8px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0f1117',
  margin: '0 0 12px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: '#0f1117',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const textMuted = {
  fontSize: '14px',
  color: '#7a8194',
  lineHeight: '1.5',
  margin: '0 0 28px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(210, 100%, 55%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '32px 0 0', lineHeight: '1.5' }
