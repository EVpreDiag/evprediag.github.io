import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b electric-border tech-blur bg-background/70 relative z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/landing" className="flex items-center space-x-2 animate-fade-in-up">
            <Zap className="h-8 w-8 text-primary animate-electric-pulse" />
            <span className="text-2xl font-bold font-orbitron holographic-text">
              EVPreDiag
            </span>
          </Link>
          <Link to="/landing">
            <Button variant="outline" className="electric-border hover:electric-glow font-exo">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary electric-glow" />
          </div>
          <h1 className="text-4xl font-bold font-orbitron holographic-text mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground font-exo">
            Last updated: {new Date().toLocaleDateString('en-AU')}
          </p>
        </div>

        <Card className="electric-border tech-shadow">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">1. Introduction</h2>
              <p className="text-muted-foreground font-exo leading-relaxed">
                EVPreDiag ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our vehicle diagnostic platform. This policy complies with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>Contact details (name, email address, phone number)</li>
                    <li>Business information (company name, ABN, address)</li>
                    <li>User account credentials and profile information</li>
                    <li>Payment information (processed through secure third-party providers)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Vehicle Data</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>Vehicle identification numbers (VINs)</li>
                    <li>Diagnostic records and technical data</li>
                    <li>Service history and maintenance records</li>
                    <li>Customer vehicle information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>IP addresses and device identifiers</li>
                    <li>Browser type and operating system</li>
                    <li>Usage patterns and session data</li>
                    <li>Log files and error reports</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>To provide and maintain our diagnostic platform services</li>
                <li>To process your registration and manage your account</li>
                <li>To generate diagnostic reports and analytics</li>
                <li>To provide customer support and technical assistance</li>
                <li>To process payments and manage subscriptions</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal obligations and industry regulations</li>
                <li>To send important service updates and notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground font-exo mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>With your explicit consent</li>
                <li>To service providers who assist in our operations (subject to confidentiality agreements)</li>
                <li>When required by Australian law or court order</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">5. Data Security</h2>
              <p className="text-muted-foreground font-exo mb-4">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication systems</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Staff training on data protection and privacy</li>
                <li>Secure data centers with physical security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">6. Your Rights Under Australian Privacy Law</h2>
              <p className="text-muted-foreground font-exo mb-4">
                Under the Privacy Act 1988 (Cth), you have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Complaint:</strong> Lodge a complaint about our handling of your information</li>
                <li><strong>Notification:</strong> Be notified of data breaches that may cause serious harm</li>
              </ul>
              <p className="text-muted-foreground font-exo mt-4">
                To exercise these rights, contact us at privacy@evprediag.com.au
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground font-exo">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. Diagnostic records may be retained for up to 7 years in accordance with automotive industry standards and Australian Consumer Law requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground font-exo">
                Your data is primarily stored in Australian data centers. Any international transfers will be conducted in accordance with Australian privacy laws and will include appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground font-exo">
                We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences. Essential cookies are necessary for the platform to function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground font-exo">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform. Your continued use of our services constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">11. Contact Information</h2>
              <div className="text-muted-foreground font-exo space-y-2">
                <p><strong>EVPreDiag Pty Ltd</strong></p>
                <p>Email: privacy@evprediag.com.au</p>
                <p>Phone: 1300 EVP DIAG (1300 387 3424)</p>
                <p>Address: [Business Address], Australia</p>
              </div>
              <p className="text-muted-foreground font-exo mt-4">
                If you have concerns about our handling of your personal information, you may also contact the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}