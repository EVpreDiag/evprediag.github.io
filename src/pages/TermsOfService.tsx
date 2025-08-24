import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
            <FileText className="h-16 w-16 text-primary electric-glow" />
          </div>
          <h1 className="text-4xl font-bold font-orbitron holographic-text mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground font-exo">
            Last updated: {new Date().toLocaleDateString('en-AU')}
          </p>
        </div>

        <Card className="electric-border tech-shadow">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground font-exo leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and EVPreDiag Pty Ltd (ACN [ACN Number]) ("EVPreDiag", "we", "us", or "our") regarding your use of our vehicle diagnostic platform. By accessing or using our services, you agree to be bound by these Terms. These Terms are governed by Australian law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground font-exo mb-4">
                EVPreDiag provides a cloud-based platform for automotive service stations to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>Conduct comprehensive vehicle diagnostics for EV, ICE, and PHEV vehicles</li>
                <li>Generate detailed diagnostic reports and analytics</li>
                <li>Manage user accounts and access controls</li>
                <li>Store and retrieve diagnostic records</li>
                <li>Facilitate communication between technicians and management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">3. Eligibility and Registration</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Eligibility</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>You must be at least 18 years old</li>
                    <li>You must be authorized to enter into this agreement</li>
                    <li>Your use must comply with Australian laws and regulations</li>
                    <li>You must operate a legitimate automotive service business</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Account Registration</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>Provide accurate and complete registration information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Promptly update any changes to your information</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">4. User Responsibilities and Acceptable Use</h2>
              <p className="text-muted-foreground font-exo mb-4">You agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>Use the service only for legitimate business purposes</li>
                <li>Comply with all applicable Australian laws and regulations</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain confidentiality of customer information</li>
                <li>Not attempt to reverse engineer or hack the platform</li>
                <li>Not share access credentials with unauthorized parties</li>
                <li>Report any security vulnerabilities or data breaches immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">5. Subscription and Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Trial Period</h3>
                  <p className="text-muted-foreground font-exo">
                    We offer a 6-month free trial period. During this period, you have full access to all platform features without charge. The trial automatically expires after 6 months unless converted to a paid subscription.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Paid Subscriptions</h3>
                  <ul className="list-disc list-inside text-muted-foreground font-exo space-y-1">
                    <li>Subscription fees are charged in Australian Dollars (AUD)</li>
                    <li>All prices include GST where applicable</li>
                    <li>Fees are billed monthly or annually in advance</li>
                    <li>Payment methods include credit card and bank transfer</li>
                    <li>Failed payments may result in service suspension</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Refunds and Cancellation</h3>
                  <p className="text-muted-foreground font-exo">
                    In accordance with Australian Consumer Law, you may be entitled to a refund if our service fails to meet consumer guarantees. You may cancel your subscription at any time with 30 days' written notice.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">6. Intellectual Property Rights</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Our IP</h3>
                  <p className="text-muted-foreground font-exo">
                    EVPreDiag retains all rights, title, and interest in the platform, including software, algorithms, user interfaces, and related intellectual property. You receive a limited, non-exclusive license to use the service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Your Data</h3>
                  <p className="text-muted-foreground font-exo">
                    You retain ownership of your business data and diagnostic records. You grant us a license to process this data to provide our services and improve our platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">7. Data Protection and Privacy</h2>
              <p className="text-muted-foreground font-exo">
                We handle your personal information in accordance with our Privacy Policy and the Privacy Act 1988 (Cth). You acknowledge that you are responsible for obtaining appropriate consents from your customers for the collection and processing of their vehicle data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">8. Service Availability and Support</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Availability</h3>
                  <p className="text-muted-foreground font-exo">
                    We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Planned maintenance will be scheduled during off-peak hours with advance notice.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Support</h3>
                  <p className="text-muted-foreground font-exo">
                    Technical support is available during Australian business hours. Support levels vary by subscription tier.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground font-exo mb-4">
                To the maximum extent permitted by Australian law:
              </p>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li>Our liability for any breach is limited to the amount paid by you in the 12 months preceding the breach</li>
                <li>We exclude liability for indirect, consequential, or special damages</li>
                <li>Nothing in these Terms limits our liability for death, personal injury, or fraudulent misrepresentation</li>
                <li>Australian Consumer Law guarantees cannot be excluded and may give you rights beyond these Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground font-exo">
                You agree to indemnify and hold EVPreDiag harmless from any claims, damages, or expenses arising from your use of the service, violation of these Terms, or infringement of third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">11. Termination</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">By You</h3>
                  <p className="text-muted-foreground font-exo">
                    You may terminate your account at any time with 30 days' written notice. You remain responsible for all charges incurred prior to termination.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">By Us</h3>
                  <p className="text-muted-foreground font-exo">
                    We may terminate or suspend your account immediately for material breach of these Terms, non-payment, or illegal activity.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-orbitron mb-2">Effect of Termination</h3>
                  <p className="text-muted-foreground font-exo">
                    Upon termination, your access will cease and we will provide you with an opportunity to export your data for 30 days.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">12. Dispute Resolution</h2>
              <p className="text-muted-foreground font-exo mb-4">
                These Terms are governed by the laws of [State/Territory], Australia. Any disputes will be resolved through:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground font-exo space-y-2">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation through an accredited mediator</li>
                <li>Arbitration or court proceedings in [State/Territory], Australia</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">13. General Provisions</h2>
              <ul className="list-disc list-inside text-muted-foreground font-exo space-y-2">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between the parties</li>
                <li><strong>Amendments:</strong> We may update these Terms with reasonable notice</li>
                <li><strong>Severability:</strong> Invalid provisions do not affect the validity of remaining Terms</li>
                <li><strong>Waiver:</strong> Failure to enforce any provision does not constitute a waiver</li>
                <li><strong>Assignment:</strong> You may not assign these Terms without our written consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-primary mb-4">14. Contact Information</h2>
              <div className="text-muted-foreground font-exo space-y-2">
                <p><strong>EVPreDiag Pty Ltd</strong></p>
                <p>ACN: [ACN Number]</p>
                <p>Email: legal@evprediag.com.au</p>
                <p>Phone: 1300 EVP DIAG (1300 387 3424)</p>
                <p>Address: [Business Address], Australia</p>
              </div>
              <p className="text-muted-foreground font-exo mt-4">
                For general inquiries, visit our support page or contact support@evprediag.com.au
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}