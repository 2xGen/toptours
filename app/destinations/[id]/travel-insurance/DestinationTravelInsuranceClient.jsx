'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  Shield,
  CheckCircle2,
  MapPin,
  Phone,
} from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import DestinationStickyNav from '@/components/DestinationStickyNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SAFETYWING_NOMAD_INSURANCE_URL,
  SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL,
} from '@/lib/safetyWingAffiliate';

function SectionHeading({ children, className = '' }) {
  return (
    <h2 className={`text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-4 ${className}`}>
      {children}
    </h2>
  );
}

function DataTable({ headers, rows, variant = 'default' }) {
  const headClass =
    variant === 'emergency'
      ? 'bg-rose-50/90 text-rose-950 border-rose-200/80'
      : 'bg-slate-100/90 text-slate-900 border-slate-200/80';
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm mb-6">
      <table className="min-w-full text-sm">
        <thead>
          <tr className={`border-b ${headClass}`}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold align-top">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-gray-800 align-top border-t border-slate-200/60 leading-relaxed"
                >
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

function AffiliateButton({ href, children, variant = 'primary', className = '' }) {
  const base =
    variant === 'hero-outline'
      ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
      : variant === 'outline'
        ? 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
        : 'sunset-gradient text-white';
  return (
    <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer">
      <Button className={`font-semibold ${base} ${className}`}>
        {children}
        <ExternalLink className="ml-2 w-4 h-4" />
      </Button>
    </a>
  );
}

function PlanCard({ plan, accent = 'blue' }) {
  const border = accent === 'blue' ? 'border-blue-200' : 'border-indigo-200';
  const badge = accent === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800';
  return (
    <Card className={`border shadow-lg h-full ${border}`}>
      <CardContent className="p-6 flex flex-col h-full">
        <Badge className={`${badge} border-0 mb-3 w-fit font-semibold`}>{plan.name}</Badge>
        <p className="text-lg font-bold text-gray-900 mb-1">{plan.priceLabel}</p>
        <p className="text-sm text-gray-600 mb-4">{plan.summary}</p>
        <DataTable headers={plan.coverageHeaders} rows={plan.coverage} />
        <p className="text-xs text-gray-500 mb-3">{plan.exclusion}</p>
        {plan.note ? (
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 leading-relaxed">
            {plan.note}
          </p>
        ) : null}
        <div className="mt-auto">
          <AffiliateButton href={plan.url} className="w-full sm:w-auto">
            {plan.cta}
          </AffiliateButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DestinationTravelInsuranceClient({
  destination,
  pageData,
  destinationFeatures = {},
}) {
  const d = pageData;
  const destName = d.destinationName || destination?.fullName || destination?.name || 'Destination';

  return (
    <>
      <NavigationNext />
      <div className="min-h-screen pt-16 overflow-x-hidden">
        {/* Hero — gradient extends under main nav (same pattern as guides / category pages) */}
        <section className="relative pt-4 pb-12 sm:pt-6 sm:pb-16 md:pt-8 md:pb-20 overflow-hidden ocean-gradient">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)] pointer-events-none"
            aria-hidden="true"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 text-blue-200 mb-3 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{destName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white leading-tight mb-4">
                  {d.title}
                </h1>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-4">{d.subtitle}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {d.heroBadges?.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1 text-xs sm:text-sm text-white font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <AffiliateButton href={SAFETYWING_NOMAD_INSURANCE_URL}>
                    See Essential pricing
                  </AffiliateButton>
                  <AffiliateButton href={SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL} variant="hero-outline">
                    Compare Complete plan
                  </AffiliateButton>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20"
              >
                <Image
                  src={d.heroImage}
                  alt={`Travel insurance for ${destName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-800 transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/destinations" className="hover:text-gray-800 transition-colors">
                Destinations
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href={`/destinations/${destination.id}`}
                className="hover:text-gray-800 transition-colors"
              >
                {destName}
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Travel Insurance</span>
            </nav>
          </div>
        </section>

        <DestinationStickyNav
          destinationId={destination.id}
          destinationName={destName}
          activeKey="travel-insurance"
          hasRestaurants={destinationFeatures.hasRestaurants}
          hasAirportTransfers={destinationFeatures.hasAirportTransfers}
          hasBabyEquipment={destinationFeatures.hasBabyEquipment}
        />

        <section className="py-10 sm:py-14 bg-gray-50 overflow-hidden pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Quick Answer */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-700" />
                <h2 className="text-xl font-bold text-gray-900">{d.quickAnswer.headline}</h2>
              </div>
              <ul className="space-y-2 mb-5">
                {d.quickAnswer.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-gray-800 text-sm sm:text-base">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-600 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-700 mb-3">{d.quickAnswer.planningNote}</p>
              <div className="flex flex-wrap gap-3">
                {d.quickAnswer.planningLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Why it matters */}
          <section>
            <SectionHeading>{d.whyItMatters.title}</SectionHeading>
            {d.whyItMatters.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-gray-700 leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </section>

          {/* Need insurance table */}
          <section>
            <SectionHeading>{d.needInsuranceTable.title}</SectionHeading>
            <p className="text-gray-700 mb-4">{d.needInsuranceTable.intro}</p>
            <DataTable
              headers={d.needInsuranceTable.headers}
              rows={d.needInsuranceTable.rows}
            />
            <p className="text-sm text-gray-600 mb-4">
              Quick quote in under a minute. Coverage for medical emergencies, delays, and activities.
            </p>
            <div className="flex flex-wrap gap-3">
              <AffiliateButton href={SAFETYWING_NOMAD_INSURANCE_URL}>See current Essential pricing</AffiliateButton>
              <AffiliateButton href={SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL} variant="outline">
                See Complete plan details
              </AffiliateButton>
            </div>
          </section>

          {/* Healthcare */}
          <section>
            <SectionHeading>{d.healthcare.title}</SectionHeading>
            <p className="text-gray-700 mb-4">{d.healthcare.intro}</p>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Key hospitals and clinics in Siem Reap:
            </p>
            <DataTable headers={d.healthcare.hospitalHeaders} rows={d.healthcare.hospitals} />
            <p className="text-sm font-semibold text-gray-900 mb-2">Important notes:</p>
            <ul className="space-y-2 mb-2">
              {d.healthcare.notes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-gray-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </section>

          {/* Emergency numbers */}
          <section>
            <SectionHeading className="flex items-center gap-2">
              <Phone className="w-6 h-6 text-rose-600" />
              {d.emergencyNumbers.title}
            </SectionHeading>
            <DataTable
              headers={d.emergencyNumbers.headers}
              rows={d.emergencyNumbers.rows}
              variant="emergency"
            />
          </section>

          {/* Plans */}
          <section>
            <SectionHeading>SafetyWing Nomad Insurance: Essential vs Complete</SectionHeading>
            <p className="text-gray-700 mb-6">{d.plansIntro}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlanCard plan={d.essentialPlan} accent="blue" />
              <PlanCard plan={d.completePlan} accent="indigo" />
            </div>
          </section>

          {/* Coverage needs */}
          <section>
            <SectionHeading>{d.coverageNeeds.title}</SectionHeading>
            <DataTable headers={d.coverageNeeds.headers} rows={d.coverageNeeds.rows} />
          </section>

          {/* Scenarios */}
          <section>
            <SectionHeading>{d.scenarios.title}</SectionHeading>
            <DataTable headers={d.scenarios.headers} rows={d.scenarios.rows} />
          </section>

          {/* Pricing */}
          <section>
            <SectionHeading>{d.pricing.title}</SectionHeading>
            <p className="text-gray-700 mb-4">{d.pricing.intro}</p>
            <DataTable headers={d.pricing.headers} rows={d.pricing.rows} />
            <p className="text-gray-700 mb-4">{d.pricing.footnote}</p>
            <AffiliateButton href={d.pricing.ctaUrl}>{d.pricing.cta}</AffiliateButton>
          </section>

          {/* FAQs */}
          <section>
            <SectionHeading>Frequently Asked Questions</SectionHeading>
            <div className="space-y-4">
              {d.faqs.map((faq) => (
                <Card key={faq.question} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-5 sm:p-6">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-blue-600 shrink-0">Q:</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed ml-6">
                      <span className="font-semibold text-emerald-700">A: </span>
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Worth it */}
          <Card className="border-0 shadow-lg bg-gray-900 text-white">
            <CardContent className="p-8 text-center">
              <SectionHeading className="text-white mb-4">{d.worthIt.title}</SectionHeading>
              {d.worthIt.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-white/90 mb-3 max-w-3xl mx-auto">
                  {p}
                </p>
              ))}
              <div className="mt-6 mb-4">
                <AffiliateButton href={d.worthIt.ctaUrl} className="bg-white text-gray-900 hover:bg-gray-100">
                  {d.worthIt.cta}
                </AffiliateButton>
              </div>
              <p className="text-xs text-white/60">{d.worthIt.disclosure}</p>
            </CardContent>
          </Card>

          {/* Related guides */}
          <section>
            <SectionHeading>{d.relatedGuides.title}</SectionHeading>
            <p className="text-gray-600 mb-6">{d.relatedGuides.intro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {d.relatedGuides.groups.map((group) => (
                <div key={group.label}>
                  <h3 className="font-bold text-gray-900 mb-3">{group.label}</h3>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                        >
                          {link.label}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href={`/destinations/${destination.id}/guides`}>
                <Button variant="outline" className="font-semibold">
                  View all {destName} guides
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Final CTA */}
          <Card className="adventure-gradient border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Explore {destName}?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Discover the best tours and activities in {destName} with AI-powered recommendations
                tailored just for you.
              </p>
              <Link href={`/destinations/${destination.id}/tours`}>
                <Button className="bg-white text-blue-700 hover:bg-white/90 font-semibold text-lg px-8 py-6">
                  View All Tours &amp; Activities in {destName}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </section>

        {/* Sticky affiliate CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <a
            href={SAFETYWING_NOMAD_INSURANCE_URL}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="block w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto sunset-gradient text-white font-semibold rounded-xl px-5 py-6 sm:rounded-full"
            >
              Get covered with SafetyWing
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
      <FooterNext />
    </>
  );
}
