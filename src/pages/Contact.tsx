import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact | AXIVA</title>
        <meta name="description" content="Contact AXIVA for support, partnership, or press inquiries. Get in touch with the team behind the AI executive deck generator." />
        <link rel="canonical" href="https://axiva.ai/contact" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="container-wide max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Contact</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              For support, partnership, or press inquiries:
            </p>

            <div className="flex items-center gap-3 p-6 rounded-lg border border-border bg-card">
              <Mail className="h-6 w-6 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <a 
                  href="mailto:jagawins@gmail.com" 
                  className="text-lg font-medium text-accent hover:underline"
                >
                  jagawins@gmail.com
                </a>
              </div>
            </div>

            <p className="text-muted-foreground">
              If you are reporting a security issue, include "Security" in the subject line.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
