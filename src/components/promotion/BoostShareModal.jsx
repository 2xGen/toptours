"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Facebook, MessageCircle, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BoostShareModal({ 
  isOpen, 
  onClose, 
  itemName, 
  itemUrl, 
  points,
  itemType = 'tour' // 'tour', 'restaurant', or 'plan'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `I just boosted ${itemName} with ${points} points! 🚀\n\n${itemUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(itemUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  // Facebook doesn't allow pre-filled text, but the OpenGraph tags will show the tour/restaurant info
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  // WhatsApp allows pre-filled text
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Boost Successful!
                </h3>
                <p className="text-lg text-gray-700">
                  I just boosted <strong>{itemName}</strong> with <strong>{points} points</strong>! 🚀
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
                  onClick={async () => {
                    await handleCopyMessage();
                    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
                  }}
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
                  onClick={handleCopyMessage}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-gray-400 font-semibold h-12"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      Message Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Copy Message
                    </>
                  )}
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500">
                When you share, the {itemType === 'plan' ? 'plan' : itemType} image and details will appear automatically on social media. Facebook will show the {itemType === 'plan' ? 'plan' : itemType} preview when you paste the link.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

