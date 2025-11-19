"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const returnUrl = searchParams.get('return_url');
  const boostSuccess = searchParams.get('boost_success') === 'true';
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID provided');
      return;
    }

    // Verify the session was successful
    // In a real app, you might want to verify with your backend
    // For now, we'll just show success after a brief delay
    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Payment successful! Your subscription/points have been activated.');
      
      // Trigger confetti for instant boost payments
      if (boostSuccess) {
        triggerConfetti();
      }
      
      // If there's a return URL (for instant boosts), redirect after a short delay
      if (returnUrl) {
        setTimeout(() => {
          // Add boost_success parameter to trigger confetti on the tour page
          const separator = returnUrl.includes('?') ? '&' : '?';
          window.location.href = `${returnUrl}${separator}boost_success=true`;
        }, 1500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, returnUrl, boostSuccess]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              {returnUrl ? 'Redirecting you back...' : message}
            </p>
            <div className="space-y-3">
              {returnUrl ? (
                <Button asChild className="w-full">
                  <Link href={returnUrl}>Return to Tour</Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="w-full">
                    <Link href="/profile?tab=plan">View My Account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/toptours">Explore Top Tours</Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/profile?tab=plan">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
