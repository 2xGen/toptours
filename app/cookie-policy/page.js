"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart2, ExternalLink } from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

const CookiePolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NavigationNext />

      <div className="min-h-screen" suppressHydrationWarning>
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                Cookie Policy
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                We use a minimal set of cookies to keep TopTours.ai running smoothly and to understand how visitors use
                our site. This policy explains what we collect and how you stay in control.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  1. What Are Cookies?
                </h2>
                <p className="mb-6">
                  Cookies are small text files placed on your device when you browse a website. They help us remember your
                  preferences, understand how the site is used, and improve performance. Some cookies are essential, while
                  others are optional analytics tools that we only activate with your consent.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  2. Cookies We Use
                </h2>
                <ul className="list-disc pl-6 mb-6 space-y-3">
                  <li>
                    <strong>Essential Cookies:</strong> Required to deliver core functionality (e.g., your cookie preference
                    choice). These do not track personal information and cannot be disabled.
                  </li>
                  <li>
                    <strong>Metricool (Analytics):</strong> Helps us understand anonymized traffic patterns and engagement so
                    we can improve TopTours.ai. Implemented only after you accept cookies.
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> Provides insight into page performance, popular destinations, and
                    general usage trends. IP anonymization is enabled and data collection begins only after consent.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  3. When Cookies Are Set
                </h2>
                <p className="mb-6">
                  We load Metricool and Google Analytics only after you click “Accept” on the cookie banner. If you choose
                  “Reject,” we record your preference and do not load any optional tracking pixels or scripts.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  4. Managing Your Preferences
                </h2>
                <p className="mb-6">
                  You can update your cookie settings at any time by selecting “Cookie Preferences” in our footer. You can
                  also clear cookies from your browser to reset your choices. Rejecting cookies may limit the accuracy of our
                  analytics but will not affect your ability to browse TopTours.ai.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  5. Affiliate Disclosure
                </h2>
                <p className="mb-6">
                  Some external links on TopTours.ai are affiliate links. These are visually marked with an{' '}
                  <ExternalLink className="inline w-4 h-4 text-blue-500 align-text-bottom" /> icon. Accepting cookies also
                  confirms that you have read and acknowledge our{' '}
                  <a href="/disclosure" className="text-blue-600 hover:text-blue-700 underline">
                    Affiliate Disclosure
                  </a>
                  .
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  6. Contact Us
                </h2>
                <p>
                  Have questions about this policy or your privacy? Contact us at{' '}
                  <a href="mailto:mail@toptours.ai" className="text-blue-600 hover:text-blue-700 underline">
                    mail@toptours.ai
                  </a>
                  . We respond to most inquiries within 24 hours.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  We minimize data collection and never sell your information. Optional analytics are anonymized and
                  aggregated.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <BarChart2 className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Control</h3>
                <p className="text-gray-600">
                  Change your mind any time—open “Cookie Preferences” in the footer or clear cookies in your browser to reset
                  your selection.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>
    </>
  );
};

export default CookiePolicyPage;

