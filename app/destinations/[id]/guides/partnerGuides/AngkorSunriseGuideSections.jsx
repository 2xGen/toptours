'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Star, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTourUrl, withViatorAffiliateParams, VIATOR_AFFILIATE_LINK_REL } from '@/utils/tourHelpers';

const TABLE_VARIANTS = {
  season: {
    panel: 'from-sky-500/10 to-blue-50 border-sky-200/60',
    head: 'bg-sky-100/90 text-sky-950',
    rowEven: 'bg-white/70',
    rowOdd: 'bg-sky-50/40',
  },
  photo: {
    panel: 'from-slate-500/8 to-slate-50 border-slate-200/70',
    head: 'bg-slate-100/90 text-slate-900',
    rowEven: 'bg-white/80',
    rowOdd: 'bg-slate-50/50',
  },
  comparison: {
    panel: 'from-sky-500/10 to-blue-50 border-sky-200/60',
    head: 'bg-sky-100/90 text-sky-950',
    rowEven: 'bg-white/70',
    rowOdd: 'bg-sky-50/40',
  },
  tips: {
    panel: 'from-slate-500/8 to-slate-50 border-slate-200/70',
    head: 'bg-slate-100/90 text-slate-900',
    rowEven: 'bg-white/80',
    rowOdd: 'bg-slate-50/50',
  },
  reality: {
    panel: 'from-amber-500/10 to-orange-50 border-amber-200/60',
    head: 'bg-amber-100/90 text-amber-950',
    rowEven: 'bg-white/70',
    rowOdd: 'bg-amber-50/40',
  },
};

function SectionHeading({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-6">{children}</h2>
  );
}

function DataTable({ headers, rows, variant = 'season' }) {
  const v = TABLE_VARIANTS[variant] || TABLE_VARIANTS.season;
  return (
    <div
      className={`overflow-x-auto rounded-2xl border bg-gradient-to-br shadow-sm mb-8 ${v.panel}`}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className={`border-b border-white/60 ${v.head}`}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? v.rowEven : v.rowOdd}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-800 align-top border-t border-white/50">
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

function TourPickCard({ rank, tour, bestFor, details, quotes, whoFor }) {
  const url = getTourUrl(tour.productId, tour.title);
  const bookUrl = withViatorAffiliateParams(tour.viatorBookingUrl || '');

  return (
    <Card className="mb-10 overflow-hidden border border-gray-200/90 shadow-lg bg-white">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4 sm:gap-5 mb-5">
          <div className="relative w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-sm ring-1 ring-black/5">
            {tour.imageUrl ? (
              <Image
                src={tour.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge className="bg-gray-900 text-white border-0 font-bold text-[10px] sm:text-xs px-2 py-0.5">
                Pick #{rank}
              </Badge>
              {tour.tagLabel && (
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-500 truncate max-w-full">
                  {tour.tagLabel}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 leading-snug line-clamp-3">
              {tour.title}
            </h3>
            <p className="text-primary font-medium text-sm leading-snug mb-2">{bestFor}</p>
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
              {tour.durationHours != null && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {tour.durationHours}h
                </span>
              )}
              {tour.priceFrom != null && (
                <span className="font-semibold text-emerald-800 text-xs sm:text-sm">
                  From ${Math.round(Number(tour.priceFrom))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden mb-5">
          <div className="divide-y divide-slate-200/80">
            {details.map(([label, value]) => (
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

        {quotes?.length > 0 && (
          <div className="space-y-3 mb-5">
            {quotes.map((q, i) => (
              <blockquote
                key={i}
                className="border-l-4 border-amber-400 bg-amber-50/60 pl-4 pr-3 py-2 text-gray-700 italic text-sm leading-relaxed rounded-r-lg"
              >
                {q}
              </blockquote>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-600 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-5">
          <span className="font-semibold text-gray-900">Who this is for: </span>
          {whoFor}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button asChild variant="outline" className="w-full sm:w-auto border-gray-300 font-semibold">
            <Link href={url}>
              View tour &amp; book
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          {bookUrl ? (
            <Button asChild className="w-full sm:w-auto sunset-gradient text-white font-semibold">
              <a
                href={bookUrl}
                target="_blank"
                rel={VIATOR_AFFILIATE_LINK_REL}
              >
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

export default function AngkorSunriseGuideSections({ showcaseTours = [], relatedGuideLinks = [] }) {
  const [tour1, tour2, tour3] = showcaseTours;

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Worth it */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Is Angkor Wat Sunrise Worth It?</SectionHeading>
          <p className="text-gray-700 leading-relaxed mb-4">
            The short answer: <strong>yes</strong>, but only if you go in with realistic expectations.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Angkor Wat at sunrise is one of Southeast Asia&apos;s defining travel moments — five lotus
            towers emerging from darkness as the sky shifts from black to deep purple to orange to
            gold. The reflection in the lotus pond doubles the spectacle.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>The reality check:</strong> You will not be alone. On any given morning between
            November and March, 2,000–3,000 people gather around the two lotus ponds.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>What makes it worth it:</strong> The sunrise itself is spectacular. And for most
            visitors, the post-sunrise temple exploration is the real payoff — you are already inside
            the complex before 7 AM, beating the main crowds to the inner sanctum.
          </p>
        </motion.div>

        {/* Best time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Best Time to Visit Angkor Wat for Sunrise</SectionHeading>
          <DataTable
            variant="season"
            headers={['Season', 'Sunrise Time', 'Crowd Level', 'Weather', 'Verdict']}
            rows={[
              [
                <strong key="n">November–February</strong>,
                '5:45–6:15 AM',
                'High (peak season)',
                'Cool, dry',
                'Best sky colors, most crowded',
              ],
              [
                <strong key="m">March–May</strong>,
                '5:30–6:00 AM',
                'Medium',
                'Hot, dry',
                'Still good, fewer crowds',
              ],
              [
                <strong key="r">June–October</strong>,
                '5:15–5:45 AM',
                'Low',
                'Rainy, humid',
                'Clear mornings are rare — but you might have the place almost to yourself',
              ],
            ]}
          />
          <p className="text-gray-700 text-sm leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-4">
            <strong>Pro tip:</strong> The best sunrise colors happen when there is some cloud cover,
            not clear skies. Partly cloudy mornings produce the deep purples and pinks that make the
            photo iconic.
          </p>
        </motion.div>

        {/* Viewing spots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Where to Stand for the Best Sunrise Photos</SectionHeading>
          <div className="space-y-6">
            {[
              {
                title: '1. The Lotus Ponds (Most Popular)',
                body: 'The classic shot — Angkor Wat\'s towers reflect in the water as the sun rises directly behind the temple. Arrive by 5:00 AM for a front-row spot.',
                pros: 'The iconic reflection shot.',
                cons: 'Peak crowd density. Tripods everywhere.',
              },
              {
                title: '2. The Library Building (Right Side)',
                body: 'A raised stone platform north of the lotus ponds. Higher angle with the temple framed through the library windows. Less crowded than the ponds.',
                pros: 'Less crowded, unique framing.',
                cons: 'No reflection shot.',
              },
              {
                title: '3. The Roadside (Near the Entrance)',
                body: 'Further back from the ponds, looking over the crowd. The towers are slightly smaller but you capture the entire scene with context.',
                pros: 'Spacious, easier to set up.',
                cons: 'Crowd in the foreground.',
              },
            ].map((spot) => (
              <div key={spot.title} className="rounded-xl border border-gray-200 p-5 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 mb-2">{spot.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{spot.body}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-start gap-1.5 text-emerald-800">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    {spot.pros}
                  </span>
                  <span className="flex items-start gap-1.5 text-amber-800">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    {spot.cons}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Photography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Photography Tips for Angkor Wat Sunrise</SectionHeading>
          <DataTable
            variant="photo"
            headers={['Tip', 'Why It Matters']}
            rows={[
              ['Arrive by 5:00 AM', 'Best colors happen 5:30–6:15. Arriving later means standing behind 20 people.'],
              ['Bring a headlamp', 'The path from the entrance to the ponds is unlit.'],
              ['Shoot in RAW', 'Extreme dynamic range — JPG will clip highlights and shadows.'],
              ['Use a tripod', 'First 30 minutes have almost no light. Handheld shots will blur.'],
              ['Include the reflection', 'Frame both towers and their reflection — the water is the magic.'],
              ['Stay 15 minutes after sunrise', 'Light 10–15 minutes later is often better; crowds leave immediately.'],
              ['Check the library lintels', 'Inside Angkor Wat, early light filters through library windows beautifully.'],
            ]}
          />
        </motion.div>

        {/* Pass prices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>2026 Angkor Pass Update</SectionHeading>
          <p className="text-gray-700 mb-4">
            <strong>Angkor Pass price:</strong> $37 for 1-day, $62 for 3-day, $72 for 7-day (as of
            January 2026).
          </p>
          <p className="text-gray-700 mb-4">
            The Angkor Pass must be purchased in advance — you cannot buy it at the temple entrance.
            The official Angkor Ticket Office (Angkor Enterprise) opens from 5:00 AM–5:30 PM. You
            can also purchase online in advance.
          </p>
          <p className="text-gray-700 text-sm bg-blue-50 border border-blue-200 rounded-lg p-4">
            <strong>Pro tip:</strong> Have your ticket ready when the guide picks you up. Many tours
            stop at the ticket office, but lines can be long at 5 AM.
          </p>
        </motion.div>

        {/* Tour picks */}
        {tour1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <SectionHeading>Our 3 Top Picks for Angkor Wat Sunrise Tours</SectionHeading>
            <p className="text-gray-700 mb-8">
              Based on 8,000+ verified reviews across these operators, each tour suits a different
              traveler — private, budget small group, or small group with breakfast.
            </p>

            <TourPickCard
              rank={1}
              tour={tour1}
              bestFor="Best for: Travelers who want a private guide and full-day temple exploration"
              details={[
                ['Operator', tour1.operatorName],
                ['Duration', '8 hours'],
                ['Rating', '5.0 from 3,350+ reviews'],
                ['Price from', '$60 per person'],
                ['Group size', 'Private (just your party)'],
                ['Includes', 'A/C vehicle, English guide, cold towels, cold water'],
                ['Covers', 'Angkor Wat sunrise, Bayon, Ta Prohm, Banteay Kdei'],
              ]}
              quotes={[
                '"Tour was awesome! We saw 4 beautiful temples and heard a great explanation with detailed history. AJ was a great guide, really passionate and knowledgeable." — Mike_G',
                '"Rey was very knowledgeable. Ny supplied us with cold water and lemon scented clothes to cool down from the heat. A memorable day!" — Howard_M',
              ]}
              whoFor="Couples, small groups, or families who want undivided attention and a full day without a packed itinerary."
            />

            {tour2 && (
              <TourPickCard
                rank={2}
                tour={tour2}
                bestFor="Best for: Budget travelers who want a guided tour without the private price tag"
                details={[
                  ['Operator', tour2.operatorName],
                  ['Duration', '8 hours'],
                  ['Rating', '5.0 from 4,226+ reviews'],
                  ['Price from', '$14 per person'],
                  ['Group size', 'Small group'],
                  ['Includes', 'English guide, hotel pickup/drop-off'],
                  ['Covers', 'Angkor Wat sunrise, Ta Prohm, Ta Keo, Angkor Thom (Bayon)'],
                ]}
                quotes={[
                  '"We booked for 4:30 AM start but it was a 4 AM pick up. Make sure you have a phone/light for the steps. Sok was our guide and he is very passionate about Cambodia\'s history."',
                  '"The driver had a cool bus at every stop including fresh cold water. We recommend the tour."',
                ]}
                whoFor="Solo travelers, couples on a budget, or anyone who wants a quality guided tour without paying private prices."
              />
            )}

            {tour3 && (
              <TourPickCard
                rank={3}
                tour={tour3}
                bestFor="Best for: Travelers who want a slower pace with breakfast and a village stop"
                details={[
                  ['Operator', tour3.operatorName],
                  ['Duration', '9 hours'],
                  ['Rating', '5.0 from 480+ reviews'],
                  ['Price from', '$23 per person'],
                  ['Group size', 'Small group'],
                  ['Includes', 'English guide, hotel pickup/drop-off, breakfast'],
                  ['Covers', 'Angkor Wat sunrise, Ta Prohm, Bayon, Baphuon, Terrace of Elephants, Terrace of Leper King, Angkor Thom South Gate'],
                ]}
                quotes={[
                  '"Everything was handled very professionally — hotel pickup, breakfast, and tours of the various temples. The guide had in-depth knowledge. The breakfast was excellent." — Margaret_D',
                  '"We especially appreciated the cold water bottles and towels after each stop. If traveling with children, split temple tours into 2 days." — Margaret_D',
                ]}
                whoFor="Travelers who want a slower-paced day with breakfast and a village experience. Good for families (with the advice to split the day)."
              />
            )}
          </motion.div>
        )}

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Sunrise Tour Comparison</SectionHeading>
          <DataTable
            variant="comparison"
            headers={['Feature', 'Private Tour', 'Small Group', 'Small Group + Breakfast']}
            rows={[
              ['Price from', '$60', '$14', '$23'],
              ['Group size', 'Private', 'Small group', 'Small group'],
              ['Duration', '8 hours', '8 hours', '9 hours'],
              ['Reviews', '5.0 (3,350+)', '5.0 (4,226+)', '5.0 (480+)'],
              ['Breakfast', 'No', 'No', 'Yes'],
              ['Cold water/towels', 'Yes', 'Yes', 'Yes'],
              ['A/C vehicle', 'Yes', 'Yes', 'Yes'],
              ['Sites visited', '4 temples', '4 temples', '8 sites'],
              ['Best for', 'Private experience', 'Best value', 'Village stop + breakfast'],
            ]}
          />
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>Essential Angkor Wat Sunrise Tips</SectionHeading>
          <h3 className="font-bold text-gray-900 mb-3">Before you go</h3>
          <DataTable
            variant="tips"
            headers={['Tip', 'Why']}
            rows={[
              ['Book at least 2 weeks ahead', 'High season (Nov–Feb) sunrise tours sell out'],
              ['Confirm your pickup time', 'Most tours say 4:30 AM but pick up as early as 4 AM'],
              ['Bring cash for the Angkor Pass', '$37 for 1-day, $62 for 3-day — cash is faster'],
              ['Charge phone and camera', "You'll take 200+ photos before noon"],
              ['Pack layers', 'Pre-dawn can be cool (Dec–Jan), but midday is hot'],
              ['Bring insect repellent', 'Mosquitoes are active before sunrise near water'],
              ['Wear sturdy shoes', 'Steep steps, uneven stone, and some scrambling'],
            ]}
          />
          <h3 className="font-bold text-gray-900 mb-3 mt-8">On the day</h3>
          <DataTable
            variant="tips"
            headers={['Tip', 'Why']}
            rows={[
              ["Don't eat breakfast before", 'Many tours include breakfast or stop at a restaurant'],
              ['Bring a headlamp or flashlight', 'The walk to the lotus ponds is completely dark at 5 AM'],
              ['Use your phone light on steps', 'Staircases inside Angkor Wat are steep and uneven'],
              ['Be prepared for crowds', 'Front row fills by 5:15 AM — arrive early or accept second row'],
              ['Stay after the sunrise rush', 'Next 15–20 minutes have better light and fewer people'],
              ['Hydrate constantly', 'Long tour — heat is intense by 10 AM'],
              ['Listen to your guide', 'They know the best photo spots and quietest routes'],
            ]}
          />
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>What to Expect on the Day</SectionHeading>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 sm:p-6 shadow-sm space-y-3">
            {[
              {
                time: '4:00–4:30 AM',
                title: 'Hotel pickup',
                text: 'Guide and driver arrive. If you need an Angkor Pass, you may stop at the ticket office (lines add 15–20 minutes).',
              },
              {
                time: '5:00–5:15 AM',
                title: 'Arrival at Angkor Wat',
                text: '10-minute walk to the lotus ponds in the dark. Find your position and wait.',
              },
              {
                time: '5:30–6:15 AM',
                title: 'Sunrise',
                text: 'Sky shifts through purple, orange, and gold. The reflection builds — this is the moment.',
              },
              {
                time: '6:15–7:30 AM',
                title: 'Explore Angkor Wat',
                text: 'Most people leave for breakfast. Your group explores inner galleries and bas-reliefs before midday crowds.',
              },
              {
                time: '7:30 AM – 4:00 PM',
                title: 'Temple circuit',
                text: 'Ta Prohm, Bayon, Baphuon, Terrace of Elephants, Ta Keo — route depends on your tour.',
              },
              {
                time: 'Midday',
                title: 'Lunch break',
                text: 'Most tours stop at a local restaurant (usually not included). Standard rice and noodle dishes.',
              },
              {
                time: '2–4 PM',
                title: 'Return to hotel',
                text: 'Tour wraps up. Hundreds of photos and serious temple fatigue.',
              },
            ].map((step) => (
              <div key={step.time} className="flex gap-4 border-l-2 border-slate-300 pl-4 bg-white rounded-r-lg py-3 pr-3 shadow-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{step.time}</p>
                  <h4 className="font-bold text-gray-900">{step.title}</h4>
                  <p className="text-gray-700 text-sm mt-1">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reality check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <SectionHeading>What Tour Operators Don&apos;t Always Tell You</SectionHeading>
          <DataTable
            variant="reality"
            headers={['Reality', 'The truth']}
            rows={[
              ['The crowds are real', "You won't be alone. Best photo spots are a sea of tripods."],
              ['Sunrise is not guaranteed', 'Overcast = glow but no dramatic sky. Check the forecast the night before.'],
              ['Temples are exhausting', '8+ hours climbing stairs in heat and humidity is physically demanding.'],
              ['"Skip the crowds" is relative', 'You beat main crowds by a few hours — temples still have plenty of people.'],
              ['Angkor Pass is not included', 'Factor $37–$72 into your budget separately from tour price.'],
            ]}
          />
        </motion.div>

        {/* Book CTA */}
        {showcaseTours.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to book your Angkor Wat sunrise tour?</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Angkor Wat is a once-in-a-lifetime experience — and it starts before sunrise. Choose
              your tour style and book with confidence.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              {showcaseTours.map((t) => (
                <Button
                  key={t.productId}
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-white font-semibold"
                >
                  <Link href={getTourUrl(t.productId, t.title)}>
                    From ${t.priceFrom} · {t.reviewCount?.toLocaleString()}+ reviews
                  </Link>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related guides */}
        {relatedGuideLinks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeading>More Siem Reap Guides</SectionHeading>
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
            <p className="text-xs text-gray-500 mt-6">
              Updated June 2026 based on traveler reviews and tour operator data. Prices and
              availability may change — check tour pages for current information.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
