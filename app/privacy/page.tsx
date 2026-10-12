import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold">StockInsight</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              StockInsight ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our stock market 
              analytics platform ("Service").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Data:</strong> Investment preferences, risk tolerance, and notification settings</li>
              <li><strong>Portfolio Data:</strong> Stock holdings, purchase prices, and quantities you choose to track</li>
              <li><strong>Communication:</strong> Information you provide when contacting our support team</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
              <li><strong>Cookies:</strong> Small data files stored on your device for functionality and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our Service</li>
              <li>Personalize your experience and provide tailored content</li>
              <li>Process and manage your portfolio data</li>
              <li>Send you notifications about your portfolio and market updates</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Analyze usage patterns to improve our features</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> With third-party vendors who help us operate our Service 
                (e.g., hosting, analytics, authentication)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
              <li><strong>Safety:</strong> To protect the rights, property, or safety of StockInsight, our users, 
                or the public</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments and monitoring</li>
              <li>Access controls limiting who can access your data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you with the Service. 
              We will retain and use your information as necessary to comply with legal obligations, resolve disputes, 
              and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@stockinsight.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">We use the following types of cookies:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling certain cookies may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">Our Service integrates with third-party services including:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Clerk:</strong> For authentication and user management</li>
              <li><strong>Market Data Providers:</strong> For stock quotes and financial data</li>
              <li><strong>Analytics Services:</strong> For understanding usage patterns</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you become aware that a child has provided us with personal information, 
              please contact us so we can take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. We take appropriate safeguards to ensure your 
              information remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
              Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none mt-4 space-y-2 text-muted-foreground">
              <li><strong>Email:</strong> privacy@stockinsight.com</li>
              <li><strong>Data Protection Officer:</strong> dpo@stockinsight.com</li>
              <li><strong>Address:</strong> 123 Financial District, Suite 100, New York, NY 10004</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
