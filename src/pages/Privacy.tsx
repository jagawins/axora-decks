import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AXIVA</title>
        <meta name="description" content="AXIVA privacy policy. Learn what information we collect, how we use it, and how we protect your data." />
        <link rel="canonical" href="https://axiva.ai/privacy" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="container-wide max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-8">Effective date: January 18, 2026</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              AXIVA values privacy. This policy explains what we collect, why we collect it, and how we handle it when you use axiva.ai and related services.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information we collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Account information:</strong> name, email, authentication identifiers.</li>
                <li><strong className="text-foreground">Usage information:</strong> pages viewed, actions taken in the product, device and browser details.</li>
                <li><strong className="text-foreground">Content you provide:</strong> outlines, text, and other material you input to generate or edit decks.</li>
                <li><strong className="text-foreground">Payment information:</strong> if you subscribe, payments are processed by our payment provider. We do not store full card details.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How we use information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and operate the service, including generating and editing decks.</li>
                <li>Maintain security, prevent abuse, and enforce our policies.</li>
                <li>Improve product quality, reliability, and performance.</li>
                <li>Communicate with you about product updates, support, and account notices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. AI and content processing</h2>
              <p className="text-muted-foreground">
                When you generate or refine content, your input may be sent to AI infrastructure to produce outputs. We use this processing to provide the feature you requested. We do not sell your content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Sharing and disclosure</h2>
              <p className="text-muted-foreground mb-4">We share information only when needed to operate the service:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Service providers:</strong> hosting, analytics, email delivery, payment processing.</li>
                <li><strong className="text-foreground">Legal and safety:</strong> to comply with law, respond to valid requests, and protect users and the service.</li>
                <li><strong className="text-foreground">Business changes:</strong> if AXIVA is involved in a merger, acquisition, or asset sale, information may transfer as part of that transaction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data retention</h2>
              <p className="text-muted-foreground">
                We retain information as long as needed to provide the service, meet legal obligations, resolve disputes, and enforce agreements. You may request deletion where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
              <p className="text-muted-foreground">
                We use reasonable administrative, technical, and organizational controls to protect information. No system is perfectly secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your choices</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You can access and update account details within the product.</li>
                <li>You can request deletion by contacting us.</li>
                <li>You can opt out of non essential emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International users</h2>
              <p className="text-muted-foreground">
                If you access AXIVA from outside the United States, your information may be processed in the United States or other locations where our providers operate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to this policy</h2>
              <p className="text-muted-foreground">
                We may update this policy from time to time. We will post the updated version with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-muted-foreground">
                Questions or requests:{" "}
                <a href="mailto:jagawins@gmail.com" className="text-accent hover:underline">
                  jagawins@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Privacy;
