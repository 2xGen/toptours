'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTourUrl, withViatorAffiliateParams, VIATOR_AFFILIATE_LINK_REL } from '@/utils/tourHelpers';

function SectionHeading({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-3">{children}</h2>
  );
}

function DataTable({ headers, rows, highlightLastRow = false }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm mb-6">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-100/90 text-slate-900 border-b border-slate-200/80">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold align-top">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isLast = highlightLastRow && i === rows.length - 1;
            return (
              <tr
                key={i}
                className={
                  isLast
                    ? 'bg-emerald-50/80 font-semibold'
                    : i % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50/60'
                }
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 text-gray-800 align-top border-t border-slate-200/60 leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NoteList({ items = [] }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2 mb-6 text-gray-700 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-amber-600 shrink-0 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TourMiniCard({ tour }) {
  const url = getTourUrl(tour.productId, tour.title);
  const bookUrl = withViatorAffiliateParams(tour.viatorBookingUrl || '');

  return (
    <Card className="overflow-hidden border border-gray-200/90 shadow-md bg-white h-full flex flex-col">
      <div className="relative aspect-[4/3] bg-slate-100">
        {tour.imageUrl ? (
          <Image
            src={tour.imageUrl}
            alt={tour.title || ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        {tour.tagLabel && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mb-1 block">
            {tour.tagLabel}
          </span>
        )}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
          {tour.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-3">
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
          {tour.durationLabel && (
            <span className="inline-flex items-center gap-1 text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {tour.durationLabel}
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
              <a href={bookUrl} target="_blank" rel={VIATOR_AFFILIATE_LINK_REL}>
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

function FeaturedTourBlock({ section }) {
  if (!section?.tours?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <SectionHeading>{section.title}</SectionHeading>
      {section.description && (
        <p className="text-gray-600 mb-4 max-w-3xl -mt-1">{section.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
        {section.tours.map((tour) => (
          <TourMiniCard key={tour.productId} tour={tour} />
        ))}
      </div>
      {section.guideHref && (
        <Link
          href={section.guideHref}
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 text-sm"
        >
          {section.guideLabel || 'View full guide'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}

export default function SiemReapAdditionalFeesSections({ pageData = {}, relatedGuideLinks = [] }) {
  const d = pageData;

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-gray-700 leading-relaxed mb-4">{d.subtitle}</p>
          <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-4 py-3 flex gap-3 text-sm text-amber-950">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" aria-hidden />
            <p>
              <strong>This is a budget guide, not a tour listing.</strong> Use the tables below to
              plan real costs before you book. Tour prices are separate from the Angkor Pass and
              tips.
            </p>
          </div>
        </motion.div>

        {d.quickAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.quickAnswer.title}</SectionHeading>
            <p className="text-gray-700 mb-4 leading-relaxed">{d.quickAnswer.intro}</p>
            <DataTable headers={d.quickAnswer.headers} rows={d.quickAnswer.rows} />
            {d.quickAnswer.footnote && (
              <p className="text-gray-800 font-medium text-sm bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
                {d.quickAnswer.footnote}
              </p>
            )}
          </motion.div>
        )}

        {d.angkorPass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.angkorPass.title}</SectionHeading>
            <p className="text-gray-700 mb-4 leading-relaxed">{d.angkorPass.intro}</p>
            <DataTable headers={d.angkorPass.headers} rows={d.angkorPass.rows} />
            <NoteList items={d.angkorPass.notes} />
          </motion.div>
        )}

        {d.tipping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.tipping.title}</SectionHeading>
            <p className="text-gray-700 mb-4 leading-relaxed">{d.tipping.intro}</p>
            <DataTable headers={d.tipping.headers} rows={d.tipping.rows} />
            <NoteList items={d.tipping.notes} />
          </motion.div>
        )}

        {d.otherCosts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.otherCosts.title}</SectionHeading>
            <DataTable headers={d.otherCosts.headers} rows={d.otherCosts.rows} />
          </motion.div>
        )}

        {d.entryCosts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.entryCosts.title}</SectionHeading>
            <p className="text-gray-700 mb-4 leading-relaxed">{d.entryCosts.intro}</p>
            <DataTable headers={d.entryCosts.headers} rows={d.entryCosts.rows} />
          </motion.div>
        )}

        {d.avoidSurprises && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.avoidSurprises.title}</SectionHeading>
            <DataTable headers={d.avoidSurprises.headers} rows={d.avoidSurprises.rows} />
          </motion.div>
        )}

        {d.dayExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeading>{d.dayExample.title}</SectionHeading>
            <DataTable
              headers={d.dayExample.headers}
              rows={d.dayExample.rows}
              highlightLastRow
            />
            {d.dayExample.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="text-gray-700 leading-relaxed mb-3">
                {p}
              </p>
            ))}
          </motion.div>
        )}

        {d.featuredTourSections?.airportTransfers && (
          <FeaturedTourBlock section={d.featuredTourSections.airportTransfers} />
        )}

        {d.featuredTourSections?.angkorTours && (
          <FeaturedTourBlock section={d.featuredTourSections.angkorTours} />
        )}

        {relatedGuideLinks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
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
