import './globals.css'
import { Inter } from 'next/font/google'
import CookieConsentManager from '@/components/CookieConsentManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
    template: '%s | TopTours.ai'
  },
  // Force rebuild v6 - Deploy with all SEO improvements Oct 9 2025

  description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations. From city tours to adventure activities, find your perfect trip with TopTours.ai.',
  keywords: 'tours, activities, travel planning, AI travel, tour booking, travel experiences, city tours, adventure tours',
  authors: [{ name: 'TopTours.ai' }],
  creator: 'TopTours.ai',
  publisher: 'TopTours.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://toptours.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
    description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations.',
    url: 'https://toptours.ai',
    siteName: 'TopTours.ai',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopTours%20AI%20Home%20Page.png',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai - AI-Powered Travel Planning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
    description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations.',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopTours%20AI%20Home%20Page.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
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
              "description": "AI-powered travel planning and tour booking platform",
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61573639234569",
                "https://www.instagram.com/toptours.ai/?hl=en",
                "https://www.tiktok.com/@toptours.ai",
                "https://www.youtube.com/@toptoursai"
              ]
            })
          }}
        />
      </head>
      <body 
        className={`${inter.className} min-h-screen`} 
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundAttachment: 'fixed' }}
        suppressHydrationWarning
      >
        {children}
        <CookieConsentManager />
      </body>
    </html>
  )
}
