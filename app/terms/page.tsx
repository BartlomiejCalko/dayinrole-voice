"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/sections/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="container max-w-screen-lg mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service — Day in Role</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

          <div className="space-y-8 text-sm leading-7">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
              <p className="text-foreground/80">
                These Terms of Service ("Terms") govern your access to and use of Day in Role (the "Service"). By using the
                Service, you agree to these Terms. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. What we provide</h2>
              <p className="text-foreground/80">
                Day in Role provides AI-assisted tools to help you understand a typical "day in the role" and practice interviews.
                Content may be generated with AI and is provided for informational purposes only. It is not legal, career, hiring,
                or financial advice, and should not be solely relied upon to make decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Eligibility</h2>
              <p className="text-foreground/80">
                You must be at least 16 years old to use the Service. If you use the Service on behalf of an organisation, you
                represent you have authority to bind that organisation to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Accounts and security</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Authentication is provided through Clerk. Keep your credentials secure and do not share your account.</li>
                <li>You are responsible for all activity under your account.</li>
                <li>We may suspend or terminate access for violations of these Terms or applicable law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Plans, billing, and payments</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Payments are processed by Stripe. Your billing information is handled by Stripe in accordance with their terms.</li>
                <li>Subscriptions renew automatically until cancelled. Prices may change; we will provide reasonable notice of material changes.</li>
                <li>Taxes may apply based on your location and will be added where required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Cancellation policy</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>You can cancel your subscription at any time in your account settings.</li>
                <li>Cancellation takes effect at the end of the current billing period. You retain access until then.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Refund and dispute policy</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li><strong>EEA/Norway consumers:</strong> If you are a consumer located in Norway or the EEA, you may have a 14‑day right of withdrawal for your first purchase of a subscription. If you request immediate access to digital services and acknowledge that this waives the withdrawal right, we may provide access immediately and the statutory withdrawal right may not apply.</li>
                <li>We consider good‑faith refund requests for billing errors or accidental charges. Contact <a href="mailto:support@dayinrole.net" className="text-primary underline">support@dayinrole.net</a> before initiating a chargeback so we can help.</li>
                <li>Except as required by law or expressly stated above, fees are non‑refundable and partial periods are not credited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Promotions</h2>
              <p className="text-foreground/80">
                Promotional offers may have separate terms and dates. If terms conflict, the promotional terms govern for that offer.
                Promotions are non‑transferable and may be changed or withdrawn at any time as permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Acceptable use</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>No unlawful, infringing, or harmful content.</li>
                <li>No attempts to reverse engineer, disrupt, or overload the Service.</li>
                <li>No use that violates third‑party rights or applicable law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Intellectual property</h2>
              <p className="text-foreground/80">
                The Service, including trademarks, logos, UI, and code, is owned by Day in Role or licensors. You receive a
                limited, revocable, non‑exclusive licence to use the Service as intended. You retain rights to content you upload,
                subject to a licence for us to operate and improve the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. AI content disclaimer</h2>
              <p className="text-foreground/80">
                AI‑generated content may be inaccurate or incomplete. Always verify important information independently. Day in Role
                is not responsible for outcomes based on reliance on generated content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Limitation of liability</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>The Service is provided “as is” without warranties.</li>
                <li>To the maximum extent permitted by law, we are not liable for indirect or consequential losses.</li>
                <li>Our aggregate liability is limited to amounts paid by you for the Service in the 12 months prior to the event giving rise to liability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">13. Governing law and venue</h2>
              <p className="text-foreground/80">
                These Terms are governed by the laws of Norway. Courts of Norway shall have exclusive jurisdiction, without prejudice to
                mandatory consumer protection rules that apply in your country of residence within the EEA.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">14. Changes to these Terms</h2>
              <p className="text-foreground/80">
                We may update these Terms from time to time. Material changes will be notified via the Service. Continued use after
                changes take effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">15. Contact</h2>
              <p className="text-foreground/80">
                Questions? Contact us at <a href="mailto:support@dayinrole.net" className="text-primary underline">support@dayinrole.net</a>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage; 