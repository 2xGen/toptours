'use client';

import React from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowRight,
  Star,
  UtensilsCrossed,
  MapPin,
  Car,
  Hotel,
  ExternalLink,
  X,
} from 'lucide-react';

export default function RestaurantsListClient({ destination, restaurants }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showStickyButton, setShowStickyButton] = React.useState(true);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const zanzibarRestaurant = restaurants.find((restaurant) => restaurant.slug === 'zanzibar-beach-restaurant-curacao');
  const heroTourText = `Pair dinner at ${zanzibarRestaurant?.shortName || zanzibarRestaurant?.name || destination.fullName} with these top-rated experiences in ${destination.fullName}.`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toptours.ai/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://toptours.ai/destinations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.name,
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `Best Restaurants in ${destination.fullName}`,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      },
    ],
  };

  const formatCategorySlug = (categoryName) =>
    categoryName
      .toLowerCase()
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');

  const curatedTourCategories = (Array.isArray(destination.tourCategories) ? destination.tourCategories : [])
    .map((category) => (typeof category === 'string' ? { name: category } : category))
    .filter((category) => category?.name)
    .slice(0, 6);

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />

      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero */}
        <section
          className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16"
          style={{ background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white">
              <div>
                <div className="inline-flex items-center gap-3 text-sm text-white/80 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-white/70" />
                    Dining Guide
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span>{destination.fullName}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                  Best Restaurants in {destination.fullName}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl">
                  From waterfront seafood shacks to family-run cafés, these six spots capture the flavors and vibes of {destination.fullName}. Reserve a table, soak up the scenery, and plan the rest of your trip with our curated guides.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 gap-2">
                    <Link href={`/destinations/${destination.id}`}>
                      Explore {destination.fullName}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild className="sunset-gradient text-white gap-2">
                    <Link href={`/results?searchTerm=${encodeURIComponent(destination.fullName + ' tours')}`}>
                      View Top Tours
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-white/20 opacity-40 blur-3xl -z-10" />
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <img
                    src={destination.imageUrl}
                    alt={destination.fullName}
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="hover:text-gray-700">Destinations</Link>
              <span className="text-gray-400">/</span>
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">{destination.name}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Best Restaurants</span>
            </nav>
          </div>
        </section>

        {/* Restaurant sections */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {restaurants.map((restaurant, index) => {
              const imageFirst = index % 2 === 0;
              return (
                <Card
                  key={restaurant.id}
                  className="border border-blue-100 shadow-xl overflow-hidden"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 ${imageFirst ? '' : 'lg:grid-flow-col-dense'}`}>
                    <div className={`relative h-64 lg:h-full ${imageFirst ? '' : 'lg:order-2'}`}>
                      <img
                        src={restaurant.heroImage || destination.imageUrl}
                        alt={restaurant.imageAlt || restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {restaurant.ratings?.googleRating && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-gray-900 px-3 py-1 rounded-full shadow-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            {restaurant.ratings.googleRating.toFixed(1)}
                          </span>
                        )}
                        {restaurant.pricing?.priceRange && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/80 text-gray-900 px-3 py-1 rounded-full shadow-sm">
                            {restaurant.pricing.priceRange}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 lg:p-10 flex flex-col gap-4">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                        {restaurant.cuisines ? `${restaurant.cuisines.join(' · ')} restaurant in ${destination.fullName}` : `Restaurant in ${destination.fullName}`}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                        {restaurant.name}
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {restaurant.tagline || restaurant.summary}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {restaurant.ratings?.reviewCount && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4" />
                            {restaurant.ratings.googleRating?.toFixed(1)} · {restaurant.ratings.reviewCount.toLocaleString('en-US')} reviews
                          </span>
                        )}
                        {restaurant.pricing?.priceRange && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {restaurant.pricing.priceRange}
                          </span>
                        )}
                        {restaurant.cuisines && (
                          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                            {restaurant.cuisines.join(' · ')}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-4">
                        <Button asChild className="sunset-gradient text-white font-semibold gap-2">
                          <Link href={`/destinations/${destination.id}/restaurants/${restaurant.slug}`}>
                            View Restaurant
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Plan your trip */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
                Plan Your {destination.fullName} Trip
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Pair these restaurants with transportation tips and hotel deals to build a complete Curaçao itinerary.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Car className="w-8 h-8 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{destination.gettingAround}</p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {destination.fullName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Car Rental Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Hotel className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Find the perfect accommodation for your {destination.fullName} adventure. From luxury resorts to cozy guesthouses near the best dining spots, we’ve got you covered.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {destination.fullName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers on Expedia USA.</p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Hotel Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related guides replaced with tours */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-6">
              Popular Tours in {destination.fullName}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              {heroTourText}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {curatedTourCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/destinations/${destination.id}/guides/${formatCategorySlug(category.name)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {category.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA block */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-2xl p-10 md:p-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Top Tours in {destination.fullName}?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Pair these dining spots with unforgettable experiences. Browse curated tours, skip-the-line attractions, and sunset cruises tailored to {destination.fullName}.
              </p>
              <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 gap-2 px-8 py-3 text-lg font-semibold">
                <Link href={`/results?searchTerm=${encodeURIComponent(destination.fullName + ' tours')}`}>
                  Discover {destination.fullName} Tours
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <FooterNext />

      <SmartTourFinder isOpen={isModalOpen} onClose={handleCloseModal} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {showStickyButton && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 transition-opacity duration-300">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowStickyButton(false)}
              className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-900 stroke-2" />
            </button>
            <Link href={`/destinations/${destination.id}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
              >
                <span className="hidden sm:inline">Explore {destination.name} Tours</span>
                <span className="sm:hidden">View Tours</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
