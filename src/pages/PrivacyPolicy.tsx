
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-iced-coffee-50 to-iced-matcha-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-iced-coffee-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-iced-coffee-900">
              Privacy Policy
            </CardTitle>
            <CardDescription className="text-lg text-iced-coffee-600">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-iced-coffee-800">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">1.1 Information You Provide</h3>
                <p className="leading-relaxed">
                  When you connect your Google Analytics or Instagram accounts to AI Marketing Bestie, we collect:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account authentication tokens to access your analytics data</li>
                  <li>Basic profile information (name, email) for account identification</li>
                  <li>Analytics configuration data (property IDs, account settings)</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6">1.2 Analytics Data</h3>
                <p className="leading-relaxed">
                  We access and process your analytics data solely to provide AI-powered insights, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Website traffic statistics and user behaviour data from Google Analytics</li>
                  <li>Instagram post performance metrics and engagement data</li>
                  <li>Aggregated statistics for generating personalised insights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use your information exclusively to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate AI-powered insights and analytics reports</li>
                <li>Provide conversational analytics through our chat interface</li>
                <li>Maintain secure connections to your analytics accounts</li>
                <li>Improve our service quality and user experience</li>
              </ul>
              <p className="leading-relaxed mt-4 font-medium">
                We do not sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">3.1 Security Measures</h3>
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encrypted data transmission using HTTPS/TLS</li>
                  <li>Secure cloud storage with access controls</li>
                  <li>OAuth 2.0 authentication for third-party integrations</li>
                  <li>Regular security audits and updates</li>
                </ul>
                
                <h3 className="text-xl font-medium mt-6">3.2 Data Retention</h3>
                <p className="leading-relaxed">
                  We retain your data only as long as necessary to provide our services. You can request data deletion at any time through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Integrations</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">4.1 Google Analytics</h3>
                <p className="leading-relaxed">
                  Our integration with Google Analytics follows Google's API Terms of Service and privacy requirements. We only access data you explicitly authorise.
                </p>
                
                <h3 className="text-xl font-medium">4.2 Instagram Basic Display API</h3>
                <p className="leading-relaxed">
                  Our Instagram integration uses Meta's Instagram Basic Display API and complies with Meta's Platform Terms and Developer Policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
              <p className="leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Disconnect any linked analytics accounts</li>
                <li>Opt out of data processing (note: this may limit service functionality)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
              <p className="leading-relaxed">
                AI Marketing Bestie is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-iced-coffee-50 rounded-lg">
                <p className="font-medium">AI Marketing Bestie Support</p>
                <p>Email: aimarketingbestie@gmail.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
