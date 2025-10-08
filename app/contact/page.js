"use client";
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail } from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function ContactPage() {
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
                Contact Us
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Get in touch with us through your preferred platform
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-12">
                Connect With Us
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Facebook */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <a 
                    href="https://www.facebook.com/profile.php?id=61573639234569" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="text-center">
                      <div className="bg-blue-600 text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Facebook className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Facebook</h3>
                      <p className="text-gray-600 text-sm">Follow us for updates</p>
                    </div>
                  </a>
                </motion.div>

                {/* Instagram */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <a 
                    href="https://www.instagram.com/toptours.ai/?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Instagram className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Instagram</h3>
                      <p className="text-gray-600 text-sm">See our latest posts</p>
                    </div>
                  </a>
                </motion.div>

                {/* TikTok */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <a 
                    href="https://www.tiktok.com/@toptours.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="text-center">
                      <div className="bg-black text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">TikTok</h3>
                      <p className="text-gray-600 text-sm">Watch our videos</p>
                    </div>
                  </a>
                </motion.div>

                {/* Email */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <a 
                    href="mailto:email@toptours.ai" 
                    className="block"
                  >
                    <div className="text-center">
                      <div className="bg-gray-600 text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                      <p className="text-gray-600 text-sm">email@toptours.ai</p>
                    </div>
                  </a>
                </motion.div>
              </div>

              <div className="mt-12 bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  We'd Love to Hear From You
                </h3>
                <p className="text-gray-600">
                  Whether you have questions about our services, want to share your travel experiences, 
                  or just want to say hello, we're here to help! Choose your preferred way to connect above.
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
