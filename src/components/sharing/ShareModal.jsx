"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Facebook, MessageCircle, Link as LinkIcon, Copy, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ShareModal({ 
  isOpen, 
  onClose, 
  title,
  url
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out ${title} on TopTours.ai: ${url}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAndOpenFacebook = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Share {title}
                </h3>
                <p className="text-sm text-gray-600">
                  Share this with your friends and family
                </p>
              </div>

              {/* Share Options */}
              <div className="space-y-3 mb-6">
                <Button
                  asChild
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold h-12"
                >
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Share on Twitter
                  </a>
                </Button>

                <Button
                  onClick={handleCopyAndOpenFacebook}
                  className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold h-12"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  {copied ? 'Copied! Opening Facebook...' : 'Copy & Open Facebook'}
                </Button>

                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold h-12"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Share on WhatsApp
                  </a>
                </Button>

                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-gray-400 font-semibold h-12"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>

                {/* View Plan Button - only for plans */}
                {(title.includes('plan') || url.includes('/plans/')) && (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12"
                  >
                    <Link href={url ? url.replace(typeof window !== 'undefined' ? window.location.origin : '', '') : '#'} onClick={onClose}>
                      <Eye className="w-5 h-5 mr-2" />
                      View Your Plan
                    </Link>
                  </Button>
                )}
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500">
                {title.includes('plan') || url.includes('/plans/') 
                  ? 'When you share, your plan details will appear automatically on social media.'
                  : `When you share, the tour image and details will appear automatically on social media.`
                }
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

