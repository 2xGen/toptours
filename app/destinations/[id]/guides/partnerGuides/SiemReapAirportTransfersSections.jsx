'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ExternalLink, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTourUrl, withViatorAffiliateParams } from '@/utils/tourHelpers';

function SectionHeading({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-3">{children}</h2>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-50/60 shadow-sm mb-8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-100/90 text-slate-900 border-b border-slate-200/80">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white/80' : 'bg-slate-50/50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-800 align-top border-t border-slate-200/60">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransferPickCard({ tour, badgeLabel, featured = false, grid = false }) {
  const url = getTourUrl(tour.productId, tour.title);
  const bookUrl = withViatorAffiliateParams(tour.viatorBookingUrl || '');
  const duration = tour.durationLabel || (tour.durationHours ? `${tour.durationHours}h` : null);

  if (grid) {
    return (
      <Card className="overflow-hidden border border-gray-200/90 shadow-lg bg-white h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-slate-100">
          {tour.imageUrl ? (
            <Image
              src={tour.imageUrl}
              alt={tour.title || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
          )}
        </div>
        <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {badgeLabel && (
              <Badge className="bg-gray-900 text-white border-0 font-bold text-[10px] px-2 py-0.5">
                {badgeLabel}
              </Badge>
            )}
            {tour.tagLabel && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 line-clamp-1">
                {tour.tagLabel}
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-2 mb-2">
            {tour.title}
          </h3>

          {tour.bestFor && (
            <p className="text-sm text-gray-600 leading-snug line-clamp-3 mb-3 flex-1">{tour.bestFor}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-4">
            {tour.rating != null && (
              <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" aria-hidden />
                {Number(tour.rating).toFixed(1)}
                {tour.reviewCount != null && (
                  <span className="text-gray-500 font-normal text-xs">
                    ({Number(tour.reviewCount).toLocaleString('en-US')})
                  </span>
                )}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1 text-xs">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {duration}
              </span>
            )}
            {tour.priceFrom != null && (
              <span className="font-semibold text-emerald-800 text-sm">
                From ${Math.round(Number(tour.priceFrom))}
                {tour.priceNote ? (
                  <span className="font-normal text-gray-500 text-xs"> · {tour.priceNote}</span>
                ) : null}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <Button asChild variant="outline" size="sm" className="w-full border-gray-300 font-semibold">
              <Link href={url}>
                View tour
                <ArrowRight className="ml-2 w-3.5 h-3.5" />
              </Link>
            </Button>
            {bookUrl ? (
              <Button asChild size="sm" className="w-full sunset-gradient text-white font-semibold">
                <a href={bookUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">
                  Check availability
                  <ExternalLink className="ml-2 w-3.5 h-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden border shadow-lg bg-white ${
        featured ? 'border-amber-300/80 ring-1 ring-amber-200/50 max-w-2xl mx-auto' : 'border-gray-200/90'
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        {featured && (
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <Crown className="w-4 h-4 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">Top pick</span>
          </div>
        )}

        {featured && tour.imageUrl && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-5 ring-1 ring-black/5">
            <Image
              src={tour.imageUrl}
              alt={tour.title || ''}
              fill
              className="object-cover"
              sizes="672px"
              unoptimized
            />
          </div>
        )}

        <div className={`${featured ? '' : 'flex gap-4 sm:gap-5 mb-5'}`}>
          {!featured && (
            <div className="relative shrink-0 w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] rounded-xl overflow-hidden bg-slate-100 shadow-sm ring-1 ring-black/5">
              {tour.imageUrl ? (
                <Image src={tour.imageUrl} alt="" fill className="object-cover" sizes="112px" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {tour.tagLabel && (
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-500 block mb-1.5">
                {tour.tagLabel}
              </span>
            )}
            <h3
              className={`font-bold text-gray-900 mb-1.5 leading-snug ${
                featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl line-clamp-3'
              }`}
            >
              {tour.title}
            </h3>
            {tour.bestFor && (
              <p className="text-primary font-medium text-sm leading-snug mb-2">{tour.bestFor}</p>
            )}
            {tour.summary && featured && (
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{tour.summary}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
              {tour.rating != null && (
                <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" aria-hidden />
                  {Number(tour.rating).toFixed(1)}
                  {tour.reviewCount != null && (
                    <span className="text-gray-500 font-normal text-xs">
                      ({Number(tour.reviewCount).toLocaleString('en-US')}+)
                    </span>
                  )}
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {duration}
                </span>
              )}
              {tour.priceFrom != null && (
                <span className="font-semibold text-emerald-800 text-xs sm:text-sm">
                  From ${Math.round(Number(tour.priceFrom))}
                  {tour.priceNote ? (
                    <span className="font-normal text-gray-500 text-xs"> · {tour.priceNote}</span>
                  ) : null}
                </span>
              )}
            </div>
          </div>
        </div>

        {featured && tour.details?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden mb-5">
            <div className="divide-y divide-slate-200/80">
              {tour.details.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(110px,32%)_1fr] gap-1 sm:gap-4 px-4 py-2.5"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </span>
                  <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {featured && tour.whoFor && (
          <p className="text-sm text-slate-600 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-5">
            <span className="font-semibold text-gray-900">Who this is for: </span>
            {tour.whoFor}
          </p>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button asChild variant="outline" className="w-full sm:w-auto border-gray-300 font-semibold">
            <Link href={url}>
              View tour &amp; book
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          {bookUrl ? (
            <Button asChild className="w-full sm:w-auto sunset-gradient text-white font-semibold">
              <a href={bookUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">
                Check availability
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SiemReapAirportTransfersSections({
  topPick,
  transferSections = [],
  relatedGuideLinks = [],
  introParagraphs = null,
  comparisonSection = null,
  tipsSection = null,
  topPickHeading = 'Top pick: Siem Reap airport transfer',
}) {
  const defaultIntro = [
    <>
      Siem Reap Angkor International Airport (SAI) opened in 2023 and sits about{' '}
      <strong>53 km from downtown Siem Reap</strong> — expect roughly 45–75 minutes by car
      depending on traffic. Pre-booking a transfer beats haggling after a long flight.
    </>,
    <>
      Below are our hand-picked transfers: one top recommendation, three best all-round options,
      three private picks, and three budget bus/shared choices — all with live pricing on
      TopTours.
    </>,
  ];

  const defaultComparison = {
    title: 'Private vs shared vs bus — quick comparison',
    headers: ['Option type', 'Typical price', 'Best for', 'Trade-off'],
    rows: [
      ['Private taxi', '$22–$50', 'Families, late arrivals, lots of luggage', 'Highest cost, fastest door-to-door'],
      ['Private/shared hybrid', 'From $10', 'Flexible budget travelers', 'Shared may wait for other passengers'],
      ['Shuttle bus', '$8–$19', 'Solo backpackers', 'Fixed schedules, longer if multiple hotel stops'],
    ],
  };

  const defaultTips = {
    title: 'SAI airport transfer tips',
    headers: ['Tip', 'Why'],
    rows: [
      ['Book before you land', 'Peak season (Nov–Feb) fills private cars and shuttles'],
      ['Confirm GATE 1 pickup', 'SAI has one arrivals exit — meet drivers there'],
      ['Save hotel name in Khmer', 'Helps shared shuttles drop you at the right place'],
      ['Allow 75+ minutes', '53 km distance — traffic and multi-hotel shuttles add time'],
      ['Keep cash for tips', 'USD is widely accepted; small bills for drivers'],
    ],
  };

  const introBlocks = introParagraphs ?? defaultIntro;
  const comparison = comparisonSection ?? defaultComparison;
  const tips = tipsSection ?? defaultTips;

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-3xl"
        >
          {introBlocks.map((block, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">
              {typeof block === 'string' ? block : block}
            </p>
          ))}
        </motion.div>

        {topPick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <SectionHeading>{topPickHeading}</SectionHeading>
            <TransferPickCard tour={topPick} featured />
          </motion.div>
        )}

        {transferSections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <SectionHeading>{section.title}</SectionHeading>
            {section.description && (
              <p className="text-gray-600 mb-6 -mt-2 max-w-3xl">{section.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {section.tours.map((tour, index) => (
                <TransferPickCard
                  key={`${section.id}-${tour.productId}-${index}`}
                  tour={tour}
                  badgeLabel={`Pick ${index + 1}`}
                  grid
                />
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-5xl"
        >
          <SectionHeading>{comparison.title}</SectionHeading>
          <DataTable
            headers={comparison.headers}
            rows={comparison.rows}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-5xl"
        >
          <SectionHeading>{tips.title}</SectionHeading>
          <DataTable
            headers={tips.headers}
            rows={tips.rows}
          />
        </motion.div>

        {relatedGuideLinks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl"
          >
            <SectionHeading>Plan the rest of your Siem Reap trip</SectionHeading>
            <ul className="space-y-2">
              {relatedGuideLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
