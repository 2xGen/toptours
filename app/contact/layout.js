export const metadata = {
  title: 'Contact Us - Get in Touch | TopTours.ai',
  description: 'Have questions about AI-powered travel planning? Connect with TopTours.ai on Facebook, Instagram, and TikTok. We\'d love to hear from you and help plan your next adventure.',
  keywords: 'contact TopTours.ai, customer support, travel help, contact us, social media, Facebook, Instagram, TikTok',
  openGraph: {
    title: 'Contact Us - Get in Touch | TopTours.ai',
    description: 'Connect with TopTours.ai on social media. We\'d love to hear from you and help plan your next adventure.',
    url: 'https://toptours.ai/contact',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png',
        width: 1200,
        height: 630,
        alt: 'Contact TopTours.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Get in Touch | TopTours.ai',
    description: 'Connect with TopTours.ai on social media. We\'d love to hear from you!',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png'],
  },
  alternates: {
    canonical: 'https://toptours.ai/contact',
  },
};

export default function ContactLayout({ children }) {
  return (
    <>
      {/* Structured Data - ContactPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact TopTours.ai",
            "description": "Get in touch with TopTours.ai through social media",
            "url": "https://toptours.ai/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "url": "https://toptours.ai",
              "logo": "https://toptours.ai/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": "English"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61573639234569",
                "https://www.instagram.com/toptours.ai/?hl=en",
                "https://www.tiktok.com/@toptours.ai"
              ]
            }
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TopTours.ai",
            "url": "https://toptours.ai",
            "logo": "https://toptours.ai/logo.png",
            "description": "AI-powered travel planning and tour recommendations",
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61573639234569",
              "https://www.instagram.com/toptours.ai/?hl=en",
              "https://www.tiktok.com/@toptours.ai"
            ]
          })
        }}
      />

      {children}
    </>
  );
}

