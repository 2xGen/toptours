'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import DestinationStickyNav from '@/components/DestinationStickyNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Car,
  ArrowRight,
  ExternalLink,
  MapPin,
  Shield,
  Clock,
  CheckCircle2,
  CreditCard,
  FileCheck,
  Star,
  Award,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const DISCOVER_CARS_URL = 'https://www.discovercars.com/?a_aid=toptours&a_cid=65100b9c';

const CAR_TYPES = [
  { label: 'Economy', kw: 'economy car' },
  { label: 'Compact', kw: 'compact car' },
  { label: 'SUV', kw: 'SUV' },
  { label: 'Convertible', kw: 'convertible' },
  { label: 'Minivan', kw: 'minivan' },
  { label: 'Luxury', kw: 'luxury car' },
];

export default function CarRentalsClient({ destination, destinationFeatures = { hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false } }) {
  const [showSticky, setShowSticky] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!destination) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Destination Not Found</h1>
          <p className="text-gray-600">We couldn&apos;t find that destination.</p>
        </div>
      </div>
    );
  }

  const name = destination.fullName || destination.name || destination.id;
  const defaultOg = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
  const heroImage = destination.imageUrl || defaultOg;
  const highlights = Array.isArray(destination.highlights) ? destination.highlights : [];

  const pageUrl = `https://toptours.ai/destinations/${destination.id}/car-rentals`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai/' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://toptours.ai/destinations' },
      { '@type': 'ListItem', position: 3, name, item: `https://toptours.ai/destinations/${destination.id}` },
      { '@type': 'ListItem', position: 4, name: `Car Rentals in ${name}`, item: pageUrl },
    ],
  };

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    name: `Car Rentals in ${name} | TopTours.ai`,
    description: `Save up to 70% on car rentals in ${name}. Compare deals from 1,000+ companies with Discover Cars—clear prices, no hidden fees, free cancellation.`,
    url: pageUrl,
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    primaryImageOfPage: { '@type': 'ImageObject', url: heroImage },
    mainEntity: {
      '@type': 'Service',
      name: `Car Rentals in ${name}`,
      provider: { '@type': 'Organization', name: 'Discover Cars' },
      areaServed: { '@type': 'Place', name },
    },
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Car types to rent in ${name}`,
    description: `Economy, compact, SUV, convertible, minivan, and luxury car rentals in ${name}. Compare prices with Discover Cars.`,
    numberOfItems: CAR_TYPES.length,
    itemListElement: CAR_TYPES.map(({ kw }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${kw} rental ${name}`,
      url: pageUrl,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <NavigationNext />

      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero – operators style */}
        <section className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white">
              <div>
                <div className="inline-flex items-center gap-3 text-sm text-white/80 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <Car className="w-4 h-4 text-white/70" />
                    Car Rentals
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span>{name}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 md:mb-6">
                  Car Rentals in {name}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl">
                  Save up to 70% on car rentals in {name}. TopTours partners with Discover Cars so you get clear prices, no hidden fees, and free cancellation. Compare deals from 1,000+ companies and find the perfect rental for your trip.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="sunset-gradient text-white gap-2"
                    onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
                  >
                    Compare Car Rental Deals in {name}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-6 py-3 gap-2"
                  >
                    <Link href={`/destinations/${destination.id}`}>
                      Explore {name}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-white/20 opacity-40 blur-3xl -z-10" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-0 w-full h-72">
                  <Image
                    src={heroImage}
                    alt={`Car rentals in ${name} – compare deals`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="hover:text-gray-700">Destinations</Link>
              <span className="text-gray-400">/</span>
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">{name}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Car Rentals</span>
            </nav>
          </div>
        </section>

        {/* Destination Sticky Navigation */}
        <DestinationStickyNav
          destinationId={destination.id}
          destinationName={name}
          hasRestaurants={destinationFeatures.hasRestaurants}
          hasAirportTransfers={destinationFeatures.hasAirportTransfers}
          hasBabyEquipment={destinationFeatures.hasBabyEquipment}
        />

        {/* Value props – Discover Cars */}
        <section className="py-8 sm:py-10 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs sm:text-sm">Save up to 70%</Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">Clear prices, no surprises</Badge>
              <Badge variant="secondary" className="bg-sky-50 text-sky-700 text-xs sm:text-sm">Trusted by 7M travelers</Badge>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs sm:text-sm">24/7 Support</Badge>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm">Free Cancellation</Badge>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Rated Excellent · 252,000+ reviews · 1,000+ brands · Award-winning service
            </p>
          </div>
        </section>

        {/* Cars you might rent – long-tail keywords */}
        <section className="py-12 sm:py-16 bg-sky-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-800 mb-3">
                Cars you might rent in {name}
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl">
                Whether you need an economy car, SUV, convertible, or minivan—compare {name} car rental deals for every vehicle type. Discover Cars shows you all options in one place so you can book the right car at the best price.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {CAR_TYPES.map(({ label, kw }) => (
                  <Badge key={kw} variant="secondary" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm">
                    {kw} rental {name}
                  </Badge>
                ))}
              </div>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 gap-2"
                onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
              >
                Compare all car types in {name}
                <ExternalLink className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Explore by car – must-see highlights */}
        {highlights.length > 0 && (
          <section className="py-12 sm:py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-800 mb-4">
                  Explore {name} by car
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  Rent a car and discover {name}&apos;s top sights at your own pace—from beaches and parks to historic towns and scenic lookouts.
                </p>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      {highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{typeof h === 'string' ? h : h?.name || h?.title || String(h)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* We compare, you save + Why book + CTA */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-800 mb-4">
                  We compare car rental prices, you save
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Discover Cars is a leader in online car rental bookings. They compare deals from 1,000+ companies so you can choose the best option for your trip to {name}. Many sites hide fees—Discover Cars includes mandatory fees, taxes, and extras in the quoted price, so there are no surprises at the rental desk.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  TopTours partners with Discover Cars to help you find the perfect rental. Because they negotiate with car rental companies in bulk, they often secure lower prices for you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Shield, label: 'No Hidden Fees', iconClass: 'text-blue-600' },
                    { icon: Clock, label: '24/7 Multilingual Support', iconClass: 'text-amber-600' },
                    { icon: CheckCircle2, label: 'Free cancellation', iconClass: 'text-emerald-600' },
                    { icon: Star, label: 'Information You Can Trust', iconClass: 'text-sky-600' },
                  ].map(({ icon: Icon, label, iconClass }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Icon className={`w-5 h-5 ${iconClass}`} />
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="sunset-gradient text-white gap-2 w-full sm:w-auto"
                  onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
                >
                  Compare Car Rental Deals in {name}
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Award-winning service
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>· World Travel Tech Awards – World&apos;s Best Car Rental Booking Website 2025</li>
                      <li>· Magellan Awards Gold Winner 2025</li>
                      <li>· FT 1000: Europe&apos;s Fastest Growing Companies – Top 300 (2025)</li>
                    </ul>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">How to find a great deal</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><strong>Book early</strong> — Prices often rise closer to your trip. You can usually change or cancel for free up to 48 hours before pickup.</li>
                      <li><strong>Check reviews</strong> — See what previous renters say. A supplier score of 8 or higher is a good sign.</li>
                      <li><strong>Mind the deposit</strong> — You’ll leave a deposit at pickup. Check rental conditions so you have enough credit.</li>
                      <li><strong>Fuel & mileage</strong> — Know what’s included to avoid extra fees.</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What you need to pick up */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-800 mb-6 text-center">
              What you need to pick up the car
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: FileCheck, title: "Driver's license", text: 'A valid license in the name of the main driver.' },
                { icon: Shield, title: 'Identification', text: 'A passport or other ID, especially when renting abroad.' },
                { icon: CreditCard, title: 'Credit card', text: 'In the main driver’s name, with enough funds for the rental and deposit.' },
                { icon: FileCheck, title: 'Voucher', text: 'A printed or e-voucher from your booking confirmation.' },
              ].map(({ icon: Icon, title, text }) => (
                <Card key={title} className="bg-white border border-gray-200">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                      <p className="text-sm text-gray-600">{text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA + Back to destination */}
        <section className="py-12 sm:py-16 bg-white border-t">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Button
              size="lg"
              className="sunset-gradient text-white gap-2 px-8 py-6 text-base font-semibold"
              onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
            >
              Compare Car Rental Deals in {name}
              <ExternalLink className="w-5 h-5" />
            </Button>
            <div>
              <Link href={`/destinations/${destination.id}`} className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to {name}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA – same style as destinations/[id] */}
      {showSticky && !stickyDismissed && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 transition-opacity duration-300">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setStickyDismissed(true)}
              className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-900 stroke-2" />
            </button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base gap-2"
              onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
            >
              <span>Compare Car Rental Deals in {name}</span>
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      <FooterNext />
    </div>
  );
}
