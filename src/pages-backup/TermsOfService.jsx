import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartPlanning = () => {
    // This will be handled by the parent component
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - TopTours.ai",
    "description": "Terms and conditions for using TopTours.ai's AI-powered travel planning platform. Learn about our service terms, user responsibilities, and booking policies.",
    "url": "https://toptours.ai/terms",
    "mainEntity": {
      "@type": "CreativeWork",
      "name": "TopTours.ai Terms of Service",
      "dateModified": new Date().toISOString().split('T')[0],
      "publisher": {
        "@type": "Organization",
        "name": "TopTours.ai"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Terms of Service - TopTours.ai Legal Terms & Conditions</title>
        <meta name="description" content="Read TopTours.ai's terms of service and legal conditions. Learn about our AI-powered travel platform policies, user responsibilities, and booking terms." />
        <meta name="keywords" content="TopTours.ai terms of service, travel platform terms, booking conditions, user agreement, legal terms" />
        <link rel="canonical" href="https://toptours.ai/terms" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Terms of Service - TopTours.ai Legal Terms & Conditions" />
        <meta property="og:description" content="Read TopTours.ai's terms of service and legal conditions. Learn about our AI-powered travel platform policies, user responsibilities, and booking terms." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/terms" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:site_name" content="TopTours.ai" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service - TopTours.ai Legal Terms & Conditions" />
        <meta name="twitter:description" content="Read TopTours.ai's terms of service and legal conditions for our AI-powered travel platform." />
        <meta name="twitter:image" content="https://toptours.ai/og-image.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen">
        <Navigation onOpenModal={handleStartPlanning} />
        
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
                      By accessing and using TopTours.ai, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Description of Service</h3>
                    <p className="mb-6">
                      TopTours.ai is an AI-powered travel platform that provides tour and activity recommendations, booking services, and travel planning assistance. We aggregate information from various tour operators and provide personalized recommendations based on user preferences.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h3>
                    <p className="mb-6">
                      You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate, current, and complete information when using our services.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Booking and Payments</h3>
                    <p className="mb-6">
                      All bookings are processed through our partner tour operators. We act as an intermediary and are not responsible for the actual delivery of services. Payment processing is handled by our partners, and their terms and conditions apply to all transactions.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Cancellation and Refunds</h3>
                    <p className="mb-6">
                      Cancellation and refund policies are determined by individual tour operators. We recommend reviewing the specific terms for each booking before confirming your reservation.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Intellectual Property</h3>
                    <p className="mb-6">
                      All content on TopTours.ai, including text, graphics, logos, and software, is the property of TopTours.ai or its content suppliers and is protected by copyright laws.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h3>
                    <p className="mb-6">
                      TopTours.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any transactions made through our platform.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">8. Disclaimers</h3>
                    <p className="mb-6">
                      The information provided on TopTours.ai is for general informational purposes only. We do not guarantee the accuracy, completeness, or usefulness of any information on the service.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">9. Modifications to Terms</h3>
                    <p className="mb-6">
                      We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">10. Governing Law</h3>
                    <p className="mb-6">
                      These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TopTours.ai operates, without regard to its conflict of law provisions.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">11. Contact Information</h3>
                    <p className="mb-6">
                      If you have any questions about these Terms of Service, please contact us through our website or at the contact information provided on our platform.
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
                  Email: email@toptours.ai<br />
                  We typically respond within 24 hours.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService; 