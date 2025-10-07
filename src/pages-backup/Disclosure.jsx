import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, DollarSign, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Disclosure = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const disclosurePoints = [
    {
      icon: DollarSign,
      title: 'Affiliate Commissions',
      description: 'We earn a commission when you book tours through our affiliate links. This comes at no extra cost to you and helps us maintain our free service.'
    },
    {
      icon: Shield,
      title: 'Transparent Pricing',
      description: 'The prices you see are the same as booking directly with tour operators. We never mark up prices or add hidden fees.'
    },
    {
      icon: Users,
      title: 'Unbiased Recommendations',
      description: 'Our AI recommendations are based on your preferences and tour quality, not commission rates. We prioritize your experience above all.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Partners',
      description: 'We only partner with reputable tour operators who meet our standards for safety, quality, and customer service.'
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Affiliate Disclosure - TopTours.ai",
    "description": "Transparency disclosure for TopTours.ai's affiliate partnerships. Learn how we earn commissions from tour bookings and maintain trust with our users.",
    "url": "https://toptours.ai/disclosure",
    "mainEntity": {
      "@type": "CreativeWork",
      "name": "TopTours.ai Affiliate Disclosure",
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
        <title>Affiliate Disclosure - TopTours.ai Transparency Policy</title>
        <meta name="description" content="Learn about TopTours.ai's affiliate disclosure and transparency policy. We earn commissions from tour bookings at no extra cost to you while maintaining trust and transparency." />
        <meta name="keywords" content="TopTours.ai affiliate disclosure, transparency policy, commission disclosure, travel affiliate, booking transparency" />
        <link rel="canonical" href="https://toptours.ai/disclosure" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Affiliate Disclosure - TopTours.ai Transparency Policy" />
        <meta property="og:description" content="Learn about TopTours.ai's affiliate disclosure and transparency policy. We earn commissions from tour bookings at no extra cost to you while maintaining trust and transparency." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai/disclosure" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:site_name" content="TopTours.ai" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Affiliate Disclosure - TopTours.ai Transparency Policy" />
        <meta name="twitter:description" content="Learn about TopTours.ai's affiliate disclosure and transparency policy for tour bookings." />
        <meta name="twitter:image" content="https://toptours.ai/og-image.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen">
        <Navigation />
        
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
                Affiliate Disclosure
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Transparency is important to us. Here's how TopTours.ai works and how we're compensated.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Disclosure */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl mb-12">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-poppins text-gray-800">
                    How We Operate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="text-lg leading-relaxed mb-6">
                      TopTours.ai is a travel recommendation platform that helps you discover and book amazing tours and activities worldwide. 
                      We want to be completely transparent about how our business works and how we're compensated.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Affiliate Partnerships</h3>
                    <p className="mb-6">
                      We partner with reputable tour operators and booking platforms like Viator, GetYourGuide, and other trusted providers. 
                      When you click on our recommendations and make a booking, we may earn a commission from these partners. This is a 
                      standard practice in the travel industry and helps us keep our service free for users.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">No Extra Cost to You</h3>
                    <p className="mb-6">
                      Important: You never pay more when booking through our links. The prices you see are identical to what you would 
                      pay if you booked directly with the tour operator. Our commission comes from the tour operator's marketing budget, 
                      not from additional charges to you.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Commitment to Quality</h3>
                    <p className="mb-6">
                      Our AI-powered recommendations are based on factors like tour quality, customer reviews, safety standards, and how 
                      well they match your preferences – not on commission rates. We believe that recommending the best experiences for 
                      you ultimately benefits everyone: you get amazing trips, tour operators get satisfied customers, and we build trust 
                      that keeps you coming back.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Compliance</h3>
                    <p>
                      This disclosure is in accordance with the Federal Trade Commission's guidelines on endorsements and testimonials. 
                      We are committed to honest and transparent business practices in all our operations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Key Points */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Key Points
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Here are the most important things to know about our affiliate relationships.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {disclosurePoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-0 shadow-lg h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start">
                        <div className="w-12 h-12 sunset-gradient rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <point.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-3">
                            {point.title}
                          </h3>
                          <p className="text-gray-600">
                            {point.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-6">
                Questions About Our Practices?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We believe in complete transparency. If you have any questions about our affiliate relationships, 
                how we select partners, or our recommendation process, we're here to help.
              </p>
              <div className="bg-gray-50 rounded-lg p-8">
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

export default Disclosure;
