'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, MapPin } from 'lucide-react';
import { ARUSHA_KILICLIMB_GUIDE_SLUG, getArushaKiliclimbListingMeta } from './arushaKiliclimbTanzania';

/**
 * Compact CTA strip for Arusha destination + guides index — links to the Kiliclimb partner guide.
 */
export default function ArushaKiliclimbFeaturedStrip({ destinationId }) {
  if (destinationId !== 'arusha') return null;

  const meta = getArushaKiliclimbListingMeta();
  const href = `/destinations/arusha/guides/${ARUSHA_KILICLIMB_GUIDE_SLUG}`;

  return (
    <section className="bg-gradient-to-b from-amber-50/40 to-white border-b border-amber-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Link
            href={href}
            className="group block rounded-3xl border border-gray-200/90 bg-gradient-to-br from-white via-[#f9fafb] to-[#f3f6fb] p-5 sm:p-7 shadow-[0_18px_42px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8">
              <div className="relative w-full lg:w-[min(100%,280px)] shrink-0 rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] lg:aspect-auto lg:min-h-[200px] shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
                <Image
                  src={meta.hero_image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 280px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 text-amber-950 text-xs font-bold uppercase tracking-wide px-2.5 py-1">
                    <Crown className="w-3.5 h-3.5" aria-hidden />
                    Featured guide
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                    <MapPin className="w-3.5 h-3.5" aria-hidden />
                    Tanzania safaris
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {meta.title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
                  {meta.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read the guide
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
