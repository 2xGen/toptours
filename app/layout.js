import './globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import CookieConsentManager from '@/components/CookieConsentManager'
import { Toaster } from '@/components/ui/toaster'
import PageViewTracker from '@/components/PageViewTracker'
import MobileConsoleViewer from '@/components/MobileConsoleViewer'
import StreakWelcomePopup from '@/components/StreakWelcomePopup'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'AI-Powered Tour Recommendations | Find the Best Tours & Activities',
    template: '%s | TopTours.ai™'
  },
  // Force rebuild v6 - Deploy with all SEO improvements Oct 9 2025

  description: 'Discover the best tours and activities with smart AI recommendations tailored to your travel style. Explore destinations, compare top-rated operators, and book directly through trusted partners like Viator.',
  keywords: 'tours, activities, travel planning, AI travel, tour booking, travel experiences, city tours, adventure tours, community-driven tours, personalized tour recommendations, tour match score, tour leaderboard',
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
    title: 'AI-Powered Tour Recommendations | Find the Best Tours & Activities',
    description: 'Discover the best tours and activities with smart AI recommendations tailored to your travel style. Explore destinations, compare top-rated operators, and book directly through trusted partners like Viator.',
    url: 'https://toptours.ai',
    siteName: 'TopTours.ai™',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopTours%20AI%20Home%20Page.png',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai™ - Community-Driven, AI-Powered Tour Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Tour Recommendations | Find the Best Tours & Activities',
    description: 'Discover the best tours and activities with smart AI recommendations tailored to your travel style. Explore destinations, compare top-rated operators, and book directly through trusted partners like Viator.',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Global error handler - catches errors before React
                window.addEventListener('error', function(e) {
                  console.error('Global Error:', e.error || e.message, e.filename, e.lineno);
                  if (window.__errorLog) {
                    window.__errorLog.push({
                      type: 'error',
                      message: e.error ? e.error.toString() : e.message,
                      stack: e.error ? e.error.stack : null,
                      filename: e.filename,
                      lineno: e.lineno,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
                
                window.addEventListener('unhandledrejection', function(e) {
                  console.error('Unhandled Promise Rejection:', e.reason);
                  if (window.__errorLog) {
                    window.__errorLog.push({
                      type: 'unhandledrejection',
                      message: e.reason ? e.reason.toString() : 'Unknown',
                      stack: e.reason && e.reason.stack ? e.reason.stack : null,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
                
                // Initialize error log
                window.__errorLog = window.__errorLog || [];
              })();
            `
          }}
        />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
        <CookieConsentManager />
        <Toaster />
        <MobileConsoleViewer />
        <StreakWelcomePopup />
      </body>
    </html>
  )
}
