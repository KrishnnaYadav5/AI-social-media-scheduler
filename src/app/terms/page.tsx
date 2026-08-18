export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground text-sm">Last updated: August 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Provision of Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree and acknowledge that the application is entitled to modify, improve or discontinue any of its services at its sole discretion and without notice to you even if it may result in you being prevented from accessing any information contained in it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Proprietary Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You acknowledge and agree that the application may contain proprietary and confidential information including trademarks, service marks and patents protected by intellectual property laws and international intellectual property treaties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Termination of Agreement</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Terms of this agreement will continue to apply in perpetuity until terminated by either party without notice at any time for any reason. Terms that are to continue in perpetuity shall be unaffected by the termination of this agreement.
          </p>
        </section>
        
        <div className="pt-8 border-t border-border">
          <a href="/dashboard" className="text-accent hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
