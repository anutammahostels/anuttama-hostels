const Privacy = () => {
  return (
    <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: June 9, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Who We Are</h2>
          <p>
            Anuttama Hostels operates this internal platform for managing hostel
            accommodation, payments, and resident services. This Privacy Policy
            explains how we collect, use, and protect the information of students,
            parents/guardians, and staff who use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identity details: name, form number, enrollment, contact details.</li>
            <li>Accommodation details: property, room, and bed allocation.</li>
            <li>Financial details: invoices, payment transactions, refunds.</li>
            <li>Operational data: gate passes, complaints, maintenance requests.</li>
            <li>Authentication data: login email, hashed credentials, session info.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>
            We use your information to manage hostel operations, process payments,
            communicate notices, handle complaints and maintenance, comply with
            statutory obligations, and improve the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Payment Data</h2>
          <p>
            Online payments are processed through HDFC SmartGateway. We do not store
            full card numbers, CVV, or net-banking credentials on our servers. Only
            transaction references, status, and amount are retained for reconciliation
            and audit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
          <p>
            We share data only with authorised hostel staff, payment processors, and
            service providers strictly to deliver the platform. We do not sell personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
          <p>
            Access is protected by role-based access control, row-level security, and
            encrypted transport (HTTPS). Sensitive secrets are stored in a managed
            secret store and never exposed to the browser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
          <p>
            Operational and financial records are retained for the duration required
            by applicable law and internal audit policy. Records linked to active
            students remain available throughout their stay.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Your Rights</h2>
          <p>
            You may request access to or correction of your personal information held
            on the platform by contacting the hostel administration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
          <p>
            For privacy-related questions, write to{" "}
            <a href="mailto:contact@anuttamahostels.com" className="text-primary hover:underline">
              contact@anuttamahostels.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Privacy;
