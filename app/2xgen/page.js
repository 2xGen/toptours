"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Code2, Sparkles, Rocket, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function TwoXGenPage() {
  // Schema.org structured data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "2xGen",
    "url": "https://2xgen.com",
    "description": "2xGen is a digital venture studio. We build, validate, and scale SaaS products and web platforms that deliver growth and long-term value.",
    "sameAs": [
      "https://toptours.ai",
      "https://arubabuddies.com",
      "https://factuurbaas.nl",
      "https://mygoprofile.com"
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "2xGen - Next-Gen Digital Platform Builders",
    "description": "TopTours.ai is proudly built by 2xGen, creators of innovative digital platforms including ArubaBuddies, FactuurBaas, and MyGoProfile.",
    "url": "https://toptours.ai/2xgen",
    "about": {
      "@type": "Organization",
      "name": "2xGen"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://toptours.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "2xGen",
        "item": "https://toptours.ai/2xgen"
      }
    ]
  };

  const softwareApplicationSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TopTours.ai",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "Web Browser",
      "description": "AI-powered travel planning platform helping thousands discover amazing tours and activities worldwide.",
      "url": "https://toptours.ai",
      "creator": {
        "@type": "Organization",
        "name": "2xGen"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ArubaBuddies",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "Web Browser",
      "description": "Smart trip planning platform for personalized Aruba vacations with curated local recommendations.",
      "url": "https://arubabuddies.com",
      "creator": {
        "@type": "Organization",
        "name": "2xGen"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FactuurBaas",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "description": "Fast and easy invoicing tool for freelancers and small businesses with no-login-needed experience.",
      "url": "https://factuurbaas.nl",
      "creator": {
        "@type": "Organization",
        "name": "2xGen"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "MyGoProfile",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "description": "Automated Google Business Profile management with AI-powered review responses and local SEO optimization.",
      "url": "https://mygoprofile.com",
      "creator": {
        "@type": "Organization",
        "name": "2xGen"
      },
      "offers": {
        "@type": "Offer",
        "price": "29",
        "priceCurrency": "USD"
      }
    }
  ];

  const projects = [
    {
      name: 'ArubaBuddies',
      url: 'https://arubabuddies.com',
      description: 'ArubaBuddies is a smart trip planning platform that helps travelers effortlessly design personalized Aruba vacations with curated local recommendations and an interactive itinerary builder. It connects users to handpicked tours, restaurants, and hidden gems, making every Aruba trip unforgettable and easy to share.',
      image: 'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/sign/foto/Screenshot%202025-06-16%20151003.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YjkxZGZkZC1hYTQ1LTQ3NTUtODZiMy1iZDBhY2QyMjlkMjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3RvL1NjcmVlbnNob3QgMjAyNS0wNi0xNiAxNTEwMDMucG5nIiwiaWF0IjoxNzUwMDkzOTQxLCJleHAiOjE5MDc3NzM5NDF9.uK6Hg29YlEqmJe1AFSJW_4Zhr3P3TdWLY_M1zMXg9ZI',
      color: 'from-blue-500 to-cyan-500',
      ctaText: 'Plan Your Perfect Aruba Vacation',
    },
    {
      name: 'FactuurBaas',
      url: 'https://factuurbaas.nl',
      description: 'FactuurBaas is a fast and easy invoicing tool designed for freelancers and small businesses to create professional invoices in minutes without registration. It offers a no-login-needed experience with clean layouts and instant PDF downloads.',
      image: 'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/sign/foto/Screenshot%202025-06-16%20150605.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YjkxZGZkZC1hYTQ1LTQ3NTUtODZiMy1iZDBhY2QyMjlkMjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3RvL1NjcmVlbnNob3QgMjAyNS0wNi0xNiAxNTA2MDUucG5nIiwiaWF0IjoxNzUwMDk0MzAzLCJleHAiOjE5MDc3NzQzMDN9.T6m86b-T281nZePGSM2IH-AeYjYSq5oQIhTrKNEmvvg',
      color: 'from-green-500 to-emerald-500',
      ctaText: 'Create Professional Invoices in Minutes',
    },
    {
      name: 'MyGoProfile',
      url: 'https://mygoprofile.com',
      description: 'MyGoProfile takes the hassle out of managing Google Business Profiles by automating review responses, providing actionable optimization insights, and centralizing multi-location management in one intuitive dashboard. With AI working 24/7, businesses save hours each week while gaining up to 40% more local search traffic. It\'s local marketing simplified — built to turn profiles into powerful customer-generating tools.',
      image: 'https://soaacpusdhyxwucjhhpy.supabase.co/storage/v1/object/public/MGP/Screenshot%202025-09-27%20212746.png',
      color: 'from-purple-500 to-pink-500',
      ctaText: 'Dominate Local Search with MyGoProfile',
    },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {softwareApplicationSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <NavigationNext />
      
      <div className="min-h-screen" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
              href="/"
              className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Code2 className="w-12 h-12 text-white" />
                <h1 className="font-poppins font-bold text-5xl md:text-6xl text-white">2xGen</h1>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
                We Build the Future, Together
              </h2>
              
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                2xGen is a digital venture studio. We build, validate, and scale SaaS products and web platforms that deliver growth and long-term value.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What We Do Section */}
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
                What We Do
              </h2>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Code2,
                  title: 'Build from the Ground Up',
                  description: 'We design, build, and scale ventures from the ground up—creating digital products and SaaS brands that make a real impact.'
                },
                {
                  icon: Users,
                  title: 'Partnerships & Opportunities',
                  description: 'We explore partnerships and opportunities with others who share our vision, building a network of innovators and builders.'
                },
                {
                  icon: Rocket,
                  title: 'Builders, Operators, Innovators',
                  description: 'At our core, we are builders, operators, and innovators, driven by technology and focused on sustainable growth.'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-0 shadow-lg h-full hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 sunset-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-4">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                <p className="text-gray-700 text-lg leading-relaxed">
                  <strong>TopTours.ai</strong> is proudly built by{' '}
                  <a 
                    href="https://2xgen.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-2 underline-offset-4 transition-colors"
                  >
                    2xGen digital venture studio
                  </a>
                  , where we specialize in creating AI-powered platforms that solve real-world problems. 
                  Below you'll find other innovative platforms we've built, each designed to make life easier, 
                  businesses smarter, and experiences more memorable.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Projects Showcase */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Our Portfolio
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore the platforms we've built to make life easier, businesses smarter, and travel more exciting.
              </p>
            </motion.div>

            <div className="space-y-16">
              {projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:flex md:flex-row-reverse' : ''}`}>
                    {/* Image - Equal Height for All */}
                    <div className="relative h-96 md:h-auto overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={`${project.name} platform screenshot`}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r ${project.color} text-white font-semibold text-sm shadow-lg`}>
                        ✨ Live Platform
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                      <h3 className="text-3xl font-poppins font-bold text-gray-900 mb-4">
                        {project.name}
                      </h3>
                      
                      <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r ${project.color} text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 group self-start`}
                      >
                        {project.ctaText}
                        <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 cta-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
                Ready to Explore Amazing Tours?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Discover your next adventure with TopTours.ai's AI-powered travel planning
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
              >
                Start Planning Your Trip
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>
    </>
  );
}

