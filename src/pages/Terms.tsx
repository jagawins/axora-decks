import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | AXIVA</title>
        <meta name="description" content="AXIVA terms of service. Read about your rights and responsibilities when using our AI deck generator." />
        <link rel="canonical" href="https://axiva.ai/terms" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="container-wide max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">Effective date: January 18, 2026</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              These Terms govern your access to and use of AXIVA at axiva.ai. By using the service, you agree to these Terms.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. The service</h2>
              <p className="text-muted-foreground">
                AXIVA provides tools to create, edit, and export presentation content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility and accounts</h2>
              <p className="text-muted-foreground">
                You must provide accurate information and keep your account secure. You are responsible for activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Acceptable use</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Break the law or violate others' rights.</li>
                <li>Attempt to gain unauthorized access or disrupt the service.</li>
                <li>Upload malware or exploit the platform.</li>
                <li>Use the service to generate content that is illegal or harmful.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Your content</h2>
              <p className="text-muted-foreground">
                You retain ownership of content you submit. You grant AXIVA a limited license to host, process, and display your content only to operate the service and provide requested outputs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. AI generated output</h2>
              <p className="text-muted-foreground">
                Outputs are generated based on your inputs and may be inaccurate. You are responsible for reviewing outputs before relying on them, sharing them, or presenting them as factual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Subscriptions and billing</h2>
              <p className="text-muted-foreground">
                If you purchase a paid plan, you authorize charges as described at checkout. Fees are non refundable except where required by law. We may change pricing for future periods with notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual property</h2>
              <p className="text-muted-foreground">
                AXIVA and its software, design, and branding are owned by AXIVA or its licensors. You may not copy or resell the service except as allowed by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third party services</h2>
              <p className="text-muted-foreground">
                The service may rely on third party providers. We are not responsible for third party services outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="text-muted-foreground">
                You may stop using the service at any time. We may suspend or terminate access if you violate these Terms or if needed to protect the service or users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers</h2>
              <p className="text-muted-foreground">
                The service is provided as is and as available. We disclaim warranties to the fullest extent allowed by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of liability</h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, AXIVA will not be liable for indirect, incidental, special, consequential, or punitive damages. Our total liability for any claim will not exceed the amount you paid to AXIVA in the 12 months before the event giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes</h2>
              <p className="text-muted-foreground">
                We may update these Terms. We will post updates with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
              <p className="text-muted-foreground">
                Questions:{" "}
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

export default Terms;
