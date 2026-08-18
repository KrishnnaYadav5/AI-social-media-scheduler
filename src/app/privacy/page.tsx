export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: August 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information Collection</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information from you when you register on our site, log into your account, and/or use our services.
            The collected information includes your name, email address, profile picture, and associated social media account tokens.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Use of Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Any of the information we collect from you may be used in one of the following ways:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
            <li>To improve our application in order to better serve you.</li>
            <li>To securely connect with third-party social media APIs on your behalf.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Information Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Third-Party Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
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
