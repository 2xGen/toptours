"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function TermsOfServicePage() {
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
                Terms of Service
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Terms Content */}
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
                    Terms and Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none text-gray-600">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h3>
                    <p className="mb-6">
                      By accessing and using TopTours.ai<span className="text-xs align-super">™</span>, you accept and agree to these Terms of Service. You also acknowledge that you have read our{' '}
                      <a href="/cookie-policy" className="text-blue-600 hover:text-blue-700 underline">Cookie Policy</a> and{' '}
                      <a href="/disclosure" className="text-blue-600 hover:text-blue-700 underline">Affiliate Disclosure</a>. The Cookie Policy explains how we use cookies; you may reject non-essential cookies at any time and continue browsing the site.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Description of Service</h3>
                    <p className="mb-6">
                      TopTours.ai<span className="text-xs align-super">™</span> is an AI-powered travel platform that provides tour and activity recommendations, booking services, and travel planning assistance. We aggregate information from various tour operators and provide personalized recommendations based on user preferences.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Account Creation and User Names</h3>
                    <p className="mb-6">
                      When creating an account on TopTours.ai<span className="text-xs align-super">™</span>, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                    </p>
                    <p className="mb-6">
                      <strong>Display Names:</strong> Users are not permitted to create offensive, inappropriate, or misleading display names. We reserve the right, at our sole discretion, to change any display name we deem offensive or inappropriate, or to delete accounts that violate this policy. Display names must be unique and cannot impersonate other users or entities.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">4. User Responsibilities</h3>
                    <p className="mb-6">
                      You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to use our services in compliance with all applicable laws and regulations.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Promotion Points, Subscriptions, and Premium Services</h3>
                    <p className="mb-6">
                      <strong>Points and Subscriptions:</strong> TopTours.ai<span className="text-xs align-super">™</span> offers promotion points and subscription plans that allow users to boost tours on our platform. All points and subscriptions are sold "as is" and are:
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Non-refundable:</strong> All purchases of points and subscriptions are final. We do not offer refunds for any reason, including but not limited to unused points, subscription cancellations, or account termination.</li>
                      <li><strong>Non-transferable:</strong> Points and subscriptions are tied to your account and cannot be transferred, sold, or assigned to another user or account.</li>
                      <li><strong>No Guarantee of Results:</strong> While promoting tours on TopTours.ai<span className="text-xs align-super">™</span> increases visibility to our visitors, we do not guarantee that promotions will result in increased bookings on Viator or any partner booking platform. A promotion on TopTours.ai<span className="text-xs align-super">™</span> does not constitute a promotion on Viator or any other third-party platform.</li>
                    </ul>
                    <p className="mb-6">
                      <strong>Promotion Benefits:</strong> By promoting tours on TopTours.ai<span className="text-xs align-super">™</span>, you understand that we increase the visibility of promoted tours to our visitors, which may increase the chances of visitors clicking through to our partner booking sites (such as Viator) to make bookings. However, we cannot and do not guarantee any specific number of bookings, clicks, or revenue as a result of promotion.
                    </p>
                    <p className="mb-6">
                      <strong>Restaurant Premium Subscriptions:</strong> TopTours.ai<span className="text-xs align-super">™</span> offers premium subscription plans for restaurant owners and managers to enhance their restaurant's visibility on our platform. Restaurant Premium subscriptions include features such as featured badges, call-to-action buttons, and enhanced placement. These subscriptions are:
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li><strong>Non-refundable:</strong> All Restaurant Premium subscription purchases are final. We do not offer refunds for any reason, including subscription cancellations, unused subscription periods, or account termination.</li>
                      <li><strong>Non-transferable:</strong> Restaurant Premium subscriptions are tied to a specific restaurant and user account, and cannot be transferred to another restaurant, user, or account.</li>
                      <li><strong>No Guarantee of Results:</strong> While Restaurant Premium enhances visibility and provides call-to-action features on TopTours.ai<span className="text-xs align-super">™</span>, we do not guarantee that premium status will result in increased reservations, website visits, or revenue. Premium features on TopTours.ai<span className="text-xs align-super">™</span> do not constitute endorsement or promotion on any third-party platform.</li>
                      <li><strong>Restaurant Verification:</strong> By subscribing to Restaurant Premium, you represent that you are the owner, manager, or authorized representative of the restaurant. TopTours.ai<span className="text-xs align-super">™</span> reserves the right to request verification and to terminate subscriptions for restaurants that cannot be verified or that violate our terms.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Booking and Payments</h3>
                    <p className="mb-6">
                      TopTours.ai<span className="text-xs align-super">™</span> acts solely as an intermediary between users and partner tour operators. We are not the merchant of record and are not responsible for the execution or fulfillment of services purchased through our partners. Payment processing is handled by these partners, and their terms and conditions apply to all transactions.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Cancellation and Refunds</h3>
                    <p className="mb-6">
                      Cancellation and refund policies are determined by individual tour operators. We recommend reviewing the specific terms for each booking before confirming your reservation. <strong>Note:</strong> This section does not apply to promotion points, subscriptions, or Restaurant Premium subscriptions purchased on TopTours.ai<span className="text-xs align-super">™</span>, which are non-refundable as stated in Section 5.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">8. Account Deletion</h3>
                    <p className="mb-6">
                      If you wish to delete your account, please send an email to <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a> with the subject line "Delete Account Request". In your email, please include:
                    </p>
                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
                      <li>Your account email address</li>
                      <li>Your username/display name</li>
                    </ul>
                    <p className="mb-6">
                      Upon receipt of a valid deletion request, we will process the deletion of your account and associated data in accordance with our privacy policy. Please note that account deletion is permanent and cannot be undone. Any unused points, active subscriptions, or Restaurant Premium subscriptions will be forfeited upon account deletion, as stated in Section 5.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">9. Intellectual Property</h3>
                    <p className="mb-6">
                      All content on TopTours.ai<span className="text-xs align-super">™</span>, including text, graphics, logos, and software, is the property of TopTours.ai<span className="text-xs align-super">™</span> or its content suppliers and is protected by copyright laws.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">10. Limitation of Liability</h3>
                    <p className="mb-6">
                      TopTours.ai<span className="text-xs align-super">™</span> shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any transactions made through our platform. This includes, but is not limited to, any losses related to promotion points, subscriptions, Restaurant Premium subscriptions, or the failure of promotions or premium features to result in bookings, reservations, or revenue.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">11. Disclaimers</h3>
                    <p className="mb-6">
                      The information provided on TopTours.ai<span className="text-xs align-super">™</span> is for general informational purposes only. We do not guarantee the accuracy, completeness, or usefulness of any information on the service. We do not guarantee that promoting tours on our platform will result in increased bookings, clicks, or revenue on any third-party booking platform, including but not limited to Viator.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">12. Modifications to Terms</h3>
                    <p className="mb-6">
                      We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">13. Trademarks</h3>
                    <p className="mb-6">
                      TopTours.ai<span className="text-xs align-super ml-1">™</span>, including its name, branding, logos, and all associated marks, is a trademark of 2xGen LLC. All rights are reserved. You may not use, reproduce, imitate, or distribute any trademarked material without prior written authorization from 2xGen LLC. Unauthorized use may violate applicable trademark, copyright, and unfair-competition laws.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">14. Governing Law</h3>
                    <p className="mb-6">
                      These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TopTours.ai<span className="text-xs align-super">™</span> operates, without regard to its conflict of law provisions.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">15. Contact Information</h3>
                    <p className="mb-6">
                      If you have any questions about these Terms of Service, please contact us at <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">mail@toptours.ai</a> or through our website.
                    </p>
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
                Questions About Our Terms?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                If you have any questions about our Terms of Service or need clarification on any section, 
                we're here to help.
              </p>
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <p className="text-gray-700 mb-4">
                  <strong>Contact us:</strong>
                </p>
                <p className="text-gray-600">
                  Email: mail@toptours.ai<br />
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
