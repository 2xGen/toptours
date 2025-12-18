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
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 675,
        alt: 'Discover Top Tours and Restaurants with TopTours.ai™',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Tour Recommendations | Find the Best Tours & Activities',
    description: 'Discover the best tours and activities with smart AI recommendations tailored to your travel style. Explore destinations, compare top-rated operators, and book directly through trusted partners like Viator.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
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
        
        {/* PWA Meta Tags for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TopTours.ai" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            `
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
                var chunkReloadAttempted = false;
                
                function handleChunkError() {
                  if (chunkReloadAttempted) return;
                  chunkReloadAttempted = true;
                  setTimeout(function() {
                    window.location.reload(true);
                  }, 500);
                }
                
                // Handle script load errors (404s for chunks)
                window.addEventListener('error', function(e) {
                  // Check for script tag errors (chunk loading failures)
                  if (e.target && e.target.tagName === 'SCRIPT' && e.target.src) {
                    var src = e.target.src || '';
                    if (src.includes('_next/static/chunks') || src.includes('_next/static/')) {
                      e.preventDefault();
                      handleChunkError();
                      return false;
                    }
                  }
                  
                  // Check error message
                  var error = e.error || e.message || '';
                  var errorString = String(error);
                  if (errorString.includes('ChunkLoadError') || 
                      errorString.includes('Loading chunk') ||
                      errorString.includes('Failed to load resource')) {
                    e.preventDefault();
                    handleChunkError();
                    return false;
                  }
                  
                  // Log other errors
                  if (window.__errorLog) {
                    window.__errorLog.push({
                      type: 'error',
                      message: e.error ? String(e.error) : String(e.message),
                      stack: e.error && e.error.stack ? e.error.stack : null,
                      filename: e.filename,
                      lineno: e.lineno,
                      timestamp: new Date().toISOString()
                    });
                  }
                }, true); // Use capture phase to catch earlier
                
                // Handle promise rejections
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason || '';
                  var reasonString = String(reason);
                  if (reasonString.includes('ChunkLoadError') || 
                      reasonString.includes('Loading chunk') ||
                      (reason && reason.message && String(reason.message).includes('ChunkLoadError'))) {
                    e.preventDefault();
                    handleChunkError();
                    return false;
                  }
                  
                  // Log other rejections
                  if (window.__errorLog) {
                    window.__errorLog.push({
                      type: 'unhandledrejection',
                      message: reason ? String(reason) : 'Unknown',
                      stack: reason && reason.stack ? reason.stack : null,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
                
                // Monitor for failed resource loads
                if ('PerformanceObserver' in window) {
                  try {
                    var observer = new PerformanceObserver(function(list) {
                      var entries = list.getEntries();
                      for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        if (entry.initiatorType === 'script' && 
                            entry.name && 
                            entry.name.includes('_next/static/chunks') &&
                            (entry.responseStatus === 404 || entry.responseStatus === 0)) {
                          handleChunkError();
                          break;
                        }
                      }
                    });
                    observer.observe({entryTypes: ['resource']});
                  } catch(e) {}
                }
                
                // Clear reload flag after successful load
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    chunkReloadAttempted = false;
                  }, 5000);
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
