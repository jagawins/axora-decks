

# Enterprise SSO (SAML) — Assessment & Plan

## Reality Check

SAML/SSO is a **backend infrastructure feature** that requires capabilities beyond what's currently available in Lovable Cloud:

1. **SAML requires server-side XML parsing** — processing SAML assertions, validating signatures, and managing identity provider metadata
2. **Lovable Cloud's auth layer** supports email/password, magic link, Google, and Apple OAuth — but **not SAML 2.0**
3. The underlying auth system does support SAML on its enterprise tier, but this is **not exposed** through Lovable Cloud's managed interface

## What You Can Do Now

### Option A: "Contact Us for Enterprise" gate (recommended immediate step)

Add an Enterprise tier to your pricing page with a "Contact Sales" CTA that collects company info. This is exactly what Gamma and Beautiful.ai do — they don't self-serve SAML either. Implementation:

- Add an Enterprise card to the Pricing page with SSO/SAML listed as a feature
- Wire the CTA to your Contact page or a Calendly/HubSpot link
- No backend changes needed

### Option B: Future SAML implementation path

When you're ready to truly support SAML, you'd need to:

1. Move to an enterprise-tier backend plan that exposes SAML configuration
2. Build an admin UI for customers to configure their Identity Provider (Okta, Azure AD, OneLogin, etc.)
3. Handle SP-initiated and IdP-initiated login flows
4. Map SAML attributes to your user profiles

This is typically a 2-4 week engineering effort outside of Lovable.

## Recommendation

Ship **Option A now** — add the Enterprise tier to pricing with SSO/SAML as a listed feature and a "Contact Sales" flow. This signals enterprise readiness immediately while you evaluate the backend path.

Want me to implement Option A?

