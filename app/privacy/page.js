"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Mail, ExternalLink } from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Privacy Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-poppins text-gray-800">
                    Privacy Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="mb-6 text-lg">
                      At TopTours.ai<span className="text-xs align-super">™</span>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h3>
                    <p className="mb-4">
                      We collect information that you provide directly to us and information that is automatically collected when you use our services:
                    </p>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Information You Provide:</h4>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Account Information:</strong> Email address, display name (nickname), and password when you create an account</li>
                      <li><strong>Profile Information:</strong> Display name, travel preferences, and any other information you choose to provide</li>
                      <li><strong>Payment Information:</strong> When you purchase promotion points or subscriptions, payment information is processed by Stripe. We do not store your full payment card details on our servers.</li>
                      <li><strong>Promotion Data:</strong> Information about tours you promote, points spent, and subscription details</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Automatically Collected Information:</h4>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, features used</li>
                      <li><strong>Device Information:</strong> Browser type, device type, IP address, and operating system</li>
                      <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies as described in our <a href="/cookie-policy" className="text-blue-600 hover:text-blue-700 underline">Cookie Policy</a></li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h3>
                    <p className="mb-4">We use the information we collect to:</p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process your account registration and manage your account</li>
                      <li>Process payments for promotion points and subscriptions</li>
                      <li>Display your display name and promotion activity on leaderboards and public sections of the platform</li>
                      <li>Send you service-related communications (account updates, subscription information)</li>
                      <li>Respond to your inquiries and provide customer support</li>
                      <li>Detect, prevent, and address technical issues and security threats</li>
                      <li>Comply with legal obligations and enforce our Terms of Service</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">3. How We Share Your Information</h3>
                    <p className="mb-4">We may share your information in the following circumstances:</p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Service Providers:</strong> We use third-party services to operate our platform:
                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                          <li><strong>Supabase:</strong> For database storage and authentication</li>
                          <li><strong>Stripe:</strong> For payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Stripe's Privacy Policy</a>)</li>
                          <li><strong>Viator:</strong> For tour information and booking links (see <a href="https://www.viator.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Viator's Privacy Policy</a>)</li>
                        </ul>
                      </li>
                      <li><strong>Public Information:</strong> Your display name and promotion activity (points spent, tours promoted) are displayed publicly on leaderboards and activity sections</li>
                      <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                      <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h3>
                    <p className="mb-4">
                      Your data is stored securely using Supabase, a cloud database service. We implement appropriate technical and organizational measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Secure authentication and access controls</li>
                      <li>Regular security assessments and updates</li>
                      <li>Limited access to personal data on a need-to-know basis</li>
                    </ul>
                    <p className="mb-6">
                      However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Your Rights and Choices</h3>
                    <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                      <li><strong>Correction:</strong> Update or correct your account information through your profile settings</li>
                      <li><strong>Deletion:</strong> Request deletion of your account by emailing <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a> with "Delete Account Request" in the subject line (see our <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a> for details)</li>
                      <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                      <li><strong>Opt-Out:</strong> You can opt out of certain data collection through your browser settings or cookie preferences</li>
                    </ul>
                    <p className="mb-6">
                      To exercise these rights, please contact us at <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Data Retention</h3>
                    <p className="mb-6">
                      We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or legitimate business purposes. Note that some information (such as anonymized promotion data) may be retained for analytics purposes.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Children's Privacy</h3>
                    <p className="mb-6">
                      TopTours.ai<span className="text-xs align-super">™</span> is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">8. International Data Transfers</h3>
                    <p className="mb-6">
                      Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">9. California Privacy Rights (CCPA)</h3>
                    <p className="mb-4">
                      If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li>Right to know what personal information we collect, use, and disclose</li>
                      <li>Right to delete personal information (subject to certain exceptions)</li>
                      <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                      <li>Right to non-discrimination for exercising your privacy rights</li>
                    </ul>
                    <p className="mb-6">
                      To exercise your California privacy rights, please contact us at <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">10. European Privacy Rights (GDPR)</h3>
                    <p className="mb-4">
                      If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li>Right to access your personal data</li>
                      <li>Right to rectification of inaccurate data</li>
                      <li>Right to erasure ("right to be forgotten")</li>
                      <li>Right to restrict processing</li>
                      <li>Right to data portability</li>
                      <li>Right to object to processing</li>
                      <li>Right to withdraw consent (where processing is based on consent)</li>
                    </ul>
                    <p className="mb-6">
                      To exercise your GDPR rights, please contact us at <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">11. Changes to This Privacy Policy</h3>
                    <p className="mb-6">
                      We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Privacy Policy.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">12. Contact Us</h3>
                    <p className="mb-6">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <p className="text-gray-700 mb-2">
                        <strong>Email:</strong> <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a>
                      </p>
                      <p className="text-gray-700">
                        <strong>Company:</strong> 2xGen LLC
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-6">
                Questions About Your Privacy?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                If you have any questions about our Privacy Policy or want to exercise your privacy rights, 
                we're here to help.
              </p>
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <p className="text-gray-700 mb-4">
                  <strong>Contact us:</strong>
                </p>
                <p className="text-gray-600">
                  Email: <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a><br />
                  We typically respond within 24 hours.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>
    </>
  );
}

