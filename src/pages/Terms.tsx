const Terms = () => {
  return (
    <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-muted-foreground mb-8">Last updated: June 9, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This platform is an internal operations workspace owned and operated by
            Anuttama Hostels. It is provided to our residents, staff, and authorised
            users solely for managing hostel operations, accommodation, payments, and
            related services. By accessing or using this platform you agree to these
            Terms & Conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Eligibility & Accounts</h2>
          <p>
            Access is restricted to enrolled students, parents/guardians, and Anuttama
            Hostels' authorised staff. You are responsible for maintaining the
            confidentiality of your credentials and for all activity that occurs under
            your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Payments</h2>
          <p>
            Online payments are processed via HDFC SmartGateway. All amounts are in
            Indian Rupees (INR). Successful payments are reflected in your invoice
            ledger. Failed or abandoned transactions will not be considered paid until
            settlement is confirmed by the gateway.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Refunds & Cancellations</h2>
          <p>
            Refunds for hostel fees, security deposits, and other charges are governed
            by the Anuttama Hostels admission and exit policy in force at the time of
            payment. Pro-rata refunds, where applicable, are processed back to the
            original payment instrument within standard banking timelines.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
          <p>
            You agree not to misuse the platform, attempt unauthorised access, upload
            malicious content, or interfere with the normal functioning of the
            services. Violations may result in suspension of access and further action
            under applicable law and hostel rules.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
          <p>
            All content, branding, and software on this platform are the property of
            Anuttama Hostels and its technology partners and are protected by
            applicable intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p>
            The platform is provided on an "as is" basis. To the maximum extent
            permitted by law, Anuttama Hostels shall not be liable for indirect,
            incidental, or consequential damages arising out of your use of the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of the courts at the registered
            office location of Anuttama Hostels.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
          <p>
            For any questions regarding these terms, write to{" "}
            <a href="mailto:contact@anuttamahostels.com" className="text-primary hover:underline">
              contact@anuttamahostels.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Terms;
