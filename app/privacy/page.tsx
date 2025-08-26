"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/sections/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="container max-w-screen-lg mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy — Day in Role</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

          <div className="space-y-8 text-sm leading-7">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Controller</h2>
              <p className="text-foreground/80">
                Day in Role (the "Controller") is responsible for your personal data when you use our services. For privacy matters,
                contact: <a href="mailto:support@dayinrole.net" className="text-primary underline">support@dayinrole.net</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. What data we collect</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li><strong>Account data</strong> via Clerk (name, email, auth identifiers).</li>
                <li><strong>Usage data</strong> (feature usage, session and device events, settings, limits usage).</li>
                <li><strong>Content</strong> you provide or generate with the Service (e.g., prompts, interview answers).</li>
                <li><strong>Payment data</strong> handled by Stripe as an independent controller (we do not store full card details).</li>
                <li><strong>Cookies/analytics data</strong> as described in our Cookie Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Purposes and legal bases (GDPR)</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li><strong>Provide and operate the Service</strong> — performance of a contract (Art. 6(1)(b)).</li>
                <li><strong>Billing and compliance</strong> — legal obligation and legitimate interests (Art. 6(1)(c) and (f)).</li>
                <li><strong>Security and fraud prevention</strong> — legitimate interests (Art. 6(1)(f)).</li>
                <li><strong>Support and communication</strong> — legitimate interests (Art. 6(1)(f)).</li>
                <li><strong>Analytics and improvements</strong> — consent where required (Art. 6(1)(a)) and legitimate interests (Art. 6(1)(f)).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Sharing and processors</h2>
              <p className="text-foreground/80">
                We share data with service providers acting as processors, including hosting, authentication (Clerk), and payments (Stripe).
                These providers process data under our instructions and appropriate agreements. Stripe may also act as an independent controller for payments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. International transfers</h2>
              <p className="text-foreground/80">
                Where data is transferred outside the EEA, we rely on recognised safeguards such as the European Commission’s Standard
                Contractual Clauses and additional measures as needed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Retention</h2>
              <p className="text-foreground/80">
                We retain personal data for as long as necessary to provide the Service and meet legal, tax, and accounting obligations, and then
                delete or anonymise it in line with our retention practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Your rights (EEA/Norway)</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Access, rectification, erasure, restriction, portability, and objection.</li>
                <li>If processing is based on consent, you may withdraw it at any time.</li>
                <li>You have the right to lodge a complaint with the Norwegian Data Protection Authority (Datatilsynet) or your local EEA authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Security</h2>
              <p className="text-foreground/80">
                We implement technical and organisational measures designed to protect your data against unauthorised access, loss, misuse,
                alteration, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Children</h2>
              <p className="text-foreground/80">
                The Service is not directed to children under 16. If you believe a child provided us with personal data, contact us to request deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Cookies</h2>
              <p className="text-foreground/80">
                See our <a href="/cookies" className="text-primary underline">Cookie Policy</a> for details on the cookies and similar technologies we use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Changes</h2>
              <p className="text-foreground/80">
                We may update this Privacy Policy from time to time. Material changes will be communicated through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Contact</h2>
              <p className="text-foreground/80">
                For privacy questions, contact <a href="mailto:support@dayinrole.net" className="text-primary underline">support@dayinrole.net</a>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage; 