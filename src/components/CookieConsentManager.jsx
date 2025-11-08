'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { ExternalLink } from 'lucide-react';

const CONSENT_STORAGE_KEY = 'toptours-cookie-consent';
const METRICOOL_SCRIPT_ID = 'metricool-tracker';
const GA_SCRIPT_ID = 'ga-tracker';
const GA_INLINE_SCRIPT_ID = 'ga-inline-config';
const METRICOOL_HASH = '98c473ff6ec2603cc1ad9860d5a86670';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const removeElementById = (id) => {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
};

const loadMetricool = () => {
  if (document.getElementById(METRICOOL_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = METRICOOL_SCRIPT_ID;
  script.src = 'https://tracker.metricool.com/resources/be.js';
  script.async = true;
  script.onload = () => {
    if (window.beTracker?.t) {
      window.beTracker.t({ hash: METRICOOL_HASH });
    }
  };
  document.head.appendChild(script);
};

const loadGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return;
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.id = GA_INLINE_SCRIPT_ID;
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(inlineScript);
};

const disableGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  removeElementById(GA_SCRIPT_ID);
  removeElementById(GA_INLINE_SCRIPT_ID);
};

const disableMetricool = () => {
  removeElementById(METRICOOL_SCRIPT_ID);
  if (window.beTracker) {
    try {
      window.beTracker = undefined;
    } catch (error) {
      // ignore
    }
  }
};

const CookieConsentManager = () => {
  const [consentStatus, setConsentStatus] = useState(null); // null | 'accepted' | 'rejected'
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(CONSENT_STORAGE_KEY) : null;
    if (stored === 'accepted' || stored === 'rejected') {
      setConsentStatus(stored);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (consentStatus === 'accepted') {
      loadMetricool();
      loadGoogleAnalytics();
    } else if (consentStatus === 'rejected') {
      disableMetricool();
      disableGoogleAnalytics();
    }
  }, [consentStatus]);

  useEffect(() => {
    window.showCookieConsent = () => setShowBanner(true);
    return () => {
      delete window.showCookieConsent;
    };
  }, []);

  const handleAccept = useCallback(() => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setConsentStatus('accepted');
    setShowBanner(false);
  }, []);

  const handleReject = useCallback(() => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected');
    setConsentStatus('rejected');
    setShowBanner(false);
  }, []);

  return (
    <>
      {consentStatus === 'accepted' && <Analytics />}

      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-50">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="md:flex-1">
              <p className="text-sm text-gray-700">
                We use limited cookies to improve your experience. These load only after your choice.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                By selecting <strong>Accept Cookies</strong> or <strong>Reject Cookies</strong>, you confirm you’ve read our{' '}
                <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-700 underline">
                  Cookie Policy
                </Link>
                ,{' '}
                <Link href="/disclosure" className="text-blue-600 hover:text-blue-700 underline">
                  Affiliate Disclosure
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <button
                type="button"
                onClick={handleReject}
                className="w-full md:w-auto px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Reject Cookies
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full md:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentManager;

