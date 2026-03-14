'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, ChevronDown, HelpCircle } from 'lucide-react';
import { getTourUrl } from '@/utils/tourHelpers';

/** Renders text with *asterisk* segments as <strong> (inline). */
function renderTextWithBold(text) {
  if (!text || typeof text !== 'string') return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <strong key={i} className="font-semibold text-gray-800">{part.slice(1, -1)}</strong>
    ) : (
      part
    )
  );
}

export default function ExploreSubcategoryClient({
  destinationSlug,
  destinationName,
  categorySlug,
  categoryTitle,
  categoryHref,
  subTitle,
  subDescription,
  tours = [],
  about,
  faqs = [],
  summaryParagraph,
  whyBook,
  whatToExpect = [],
  otherSubcategories = [],
}) {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span aria-hidden>/</span>
            <Link href={`/explore/${destinationSlug}`} className="hover:text-primary transition-colors">{destinationName}</Link>
            <span aria-hidden>/</span>
            <Link href={categoryHref} className="hover:text-primary transition-colors">{categoryTitle}</Link>
            <span aria-hidden>/</span>
            <span className="text-gray-900 font-medium">{subTitle}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/5 to-white overflow-hidden border-b border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-primary font-medium text-sm uppercase tracking-widest">{categoryTitle}</p>
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight mt-2">
              {subTitle}
            </h1>
            {subDescription && (
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {renderTextWithBold(subDescription)}
              </p>
            )}
            <div className="mt-6">
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Back to {categoryTitle}
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our picks – 2 or 3 tour cards */}
      {tours.length > 0 && (
        <section className="py-14 lg:py-20 bg-gradient-to-b from-primary/5 via-white to-primary/[0.03]" aria-labelledby="picks-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Our picks</p>
            <h2 id="picks-heading" className="font-poppins font-bold text-2xl text-gray-900 mt-1 mb-8">
              Best {subTitle.toLowerCase().replace(/^best\s+/i, '')} — view &amp; book
            </h2>
            <div className={`grid gap-6 ${tours.length === 1 ? 'max-w-xl' : 'sm:grid-cols-2'} ${tours.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
              {tours.map((tour) => {
                const href = tour.tourSlug
                  ? `/explore/${destinationSlug}/${categorySlug}/${tour.tourSlug}`
                  : getTourUrl(tour.productId, tour.title);
                const imageUrl = tour.imageUrl || null;
                const priceDisplay = tour.fromPrice || 'From price on request';
                const hasRating = typeof tour.rating === 'number' && tour.rating > 0 && typeof tour.reviewCount === 'number' && tour.reviewCount > 0;
                return (
                  <Link
                    key={tour.productId}
                    href={href}
                    className="group flex flex-col bg-white rounded-2xl border-2 border-gray-100 overflow-hidden text-left transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 shadow-md"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-primary/5">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt=""
                          width={400}
                          height={250}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary/40">
                          <MapPin className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col p-5 border-t border-gray-100">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {tour.title}
                      </h3>
                      {hasRating && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20" aria-hidden>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {Number(tour.rating).toFixed(1)}
                          </span>
                          <span>({tour.reviewCount.toLocaleString('en-US')})</span>
                        </div>
                      )}
                      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-gray-500 text-sm">{priceDisplay}</p>
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary shadow-sm hover:opacity-90 transition-opacity">
                          View &amp; Book
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Summary paragraph (SEO) */}
      {summaryParagraph && (
        <section className="py-8 lg:py-10 bg-white border-b border-gray-100" aria-hidden>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <p className="text-gray-600 leading-relaxed">{renderTextWithBold(summaryParagraph)}</p>
          </div>
        </section>
      )}

      {/* Why book */}
      {whyBook && (
        <section className="py-14 lg:py-20 bg-primary/5 border-y border-primary/10" aria-labelledby="why-book-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 id="why-book-heading" className="font-poppins font-bold text-2xl text-gray-900 mb-6">
              Why book {subTitle.toLowerCase().replace(/^best\s+/i, '').replace(/^central park\s+/i, '')} in {destinationName}?
            </h2>
            <p className="text-gray-600 leading-relaxed">{renderTextWithBold(whyBook)}</p>
          </div>
        </section>
      )}

      {/* What to expect */}
      {whatToExpect.length > 0 && (
        <section className="py-14 lg:py-20 bg-white" aria-labelledby="what-to-expect-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 id="what-to-expect-heading" className="font-poppins font-bold text-2xl text-gray-900 mb-8">
              What to expect
            </h2>
            <ol className="space-y-4 list-none pl-0">
              {whatToExpect.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white font-semibold flex items-center justify-center text-sm">{i + 1}</span>
                  <span className="text-gray-600 leading-relaxed pt-0.5">{renderTextWithBold(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* About */}
      {about && (
        <section className="py-14 lg:py-20 bg-white" aria-labelledby="about-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-8 lg:p-10">
              <h2 id="about-heading" className="font-poppins font-bold text-xl text-gray-900 mb-4">
                About {subTitle.replace(/^Best\s+/i, '')}
              </h2>
              <p className="text-gray-600 leading-relaxed">{renderTextWithBold(about)}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-14 lg:py-20 bg-primary/5 border-y border-primary/10" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 id="faq-heading" className="font-poppins font-bold text-2xl text-gray-900 mb-8 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-primary" />
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border-2 border-primary/10 bg-white overflow-hidden hover:border-primary/30 transition-colors shadow-sm"
                >
                  <summary className="px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4 select-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-xl">
                    <span className="pr-2">{faq.question}</span>
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                      <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                    {renderTextWithBold(faq.answer)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More ways to explore */}
      {otherSubcategories.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50/80 border-y border-gray-200" aria-labelledby="more-ways-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 id="more-ways-heading" className="font-poppins font-bold text-xl text-gray-900 mb-6">
              More ways to explore
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Compare other {categoryTitle.toLowerCase()} options:
            </p>
            <ul className="flex flex-wrap gap-3">
              {otherSubcategories.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/explore/${destinationSlug}/${categorySlug}/${other.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    {other.title}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View all {categoryTitle}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Back to category + all tours */}
      <section className="py-10 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl flex flex-wrap gap-4">
          <Link
            href={categoryHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Back to {categoryTitle}
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
          <Link
            href={`/explore/${destinationSlug}/tours`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
          >
            View all tours in {destinationName}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
