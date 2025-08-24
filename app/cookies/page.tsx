"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/sections/Footer";

const CookiesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="container max-w-screen-lg mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Cookie Policy — Day in Role</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

          <div className="space-y-8 text-sm leading-7">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. What are cookies?</h2>
              <p className="text-foreground/80">
                Cookies are small text files stored on your device to ensure the Service functions properly, remember your preferences,
                and help us understand how the Service is used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Types of cookies we use</h2>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li><strong>Essential</strong> — required for core features such as authentication (e.g., Clerk).</li>
                <li><strong>Functional</strong> — remember settings and preferences.</li>
                <li><strong>Analytics</strong> — help us improve the Service in aggregate; set only with your consent where required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Managing cookies</h2>
              <p className="text-foreground/80">
                You can manage or delete cookies in your browser settings. Blocking some cookies may impact the Service’s functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Legal basis</h2>
              <p className="text-foreground/80">
                We rely on your consent for non‑essential cookies (e.g., analytics) and on legitimate interests or contract performance
                for essential cookies necessary to deliver the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Retention</h2>
              <p className="text-foreground/80">
                Cookies may persist for a session or a longer period. Specific durations depend on the cookie and your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
              <p className="text-foreground/80">
                Questions about this policy? Email <a href="mailto:support@dayinrole.app" className="text-primary underline">support@dayinrole.app</a>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPage; 