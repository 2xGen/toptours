import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, HeartPulse, Plane, CheckCircle2, ArrowRight } from 'lucide-react';

const SAFETYWING_ALL =
  'https://safetywing.com/?referenceID=26500684&utm_source=26500684&utm_medium=Ambassador';
const SAFETYWING_NOMAD =
  'https://safetywing.com/nomad-insurance/?referenceID=26500684&utm_source=26500684&utm_medium=Ambassador';
const SAFETYWING_COMPLETE =
  'https://explore.safetywing.com/Nomad-insurance-complete/?referenceID=26500684&utm_source=26500684&utm_medium=Ambassador';

export const metadata = {
  title: 'Travel Insurance for Your Next Trip - Trusted Coverage | TopTours.ai™',
  description:
    'Find the best travel insurance for Caribbean getaways, Asia adventures, and worldwide trips. Compare coverage and protect your journey from unexpected costs.',
  alternates: {
    canonical: 'https://toptours.ai/travel-insurance',
  },
};

export default function TravelInsurancePage() {
  return (
    <>
      <NavigationNext />
      <div className="min-h-screen bg-gray-50">
        <section className="pt-24 pb-14 ocean-gradient">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-5">
              Travel Insurance: What Every Traveler Needs to Know Before They Go
            </h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Protect your trip from medical emergencies, cancellations, delays, and unexpected costs.
              Built for independent travelers, island hoppers, and remote workers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={SAFETYWING_NOMAD} target="_blank" rel="sponsored nofollow noopener noreferrer">
                <Button className="sunset-gradient text-white font-semibold">
                  Get SafetyWing Nomad Insurance
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href={SAFETYWING_COMPLETE} target="_blank" rel="sponsored nofollow noopener noreferrer">
                <Button variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20">
                  Compare Complete Plan
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link> / <span className="text-gray-900">Travel Insurance</span>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Travel Insurance Matters More Than You Think</h2>
                <p className="text-gray-700 mb-4">
                  Most travelers assume credit cards or home insurance fully cover international trips. In practice,
                  coverage is often limited, especially for evacuation, cancellations, and interruptions.
                </p>
                <p className="text-gray-700 mb-4">
                  A missed flight in Nassau, a snorkeling injury in Aruba, or sudden illness in Bangkok can quickly
                  become a high-cost problem when you are uninsured. A single evacuation can cost tens of thousands
                  of dollars depending on route and care level.
                </p>
                <p className="text-gray-700 mb-4">
                  The goal is not to insure everything. It is to protect yourself against high-impact scenarios that
                  can derail both your trip and budget.
                </p>
                <ul className="space-y-2 text-gray-700">
                  {[
                    'Emergency medical treatment abroad',
                    'Medical evacuation and repatriation',
                    'Trip cancellation and interruption',
                    'Lost, stolen, or delayed luggage',
                    'Travel delays and missed connections',
                    '24/7 emergency assistance',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-1 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SafetyWing for Independent Travelers and Digital Nomads</h2>
                <p className="text-gray-700 mb-4">
                  For independent travelers and multi-country trips, SafetyWing is a practical choice because it works
                  as flexible ongoing coverage instead of strict per-trip packaging.
                </p>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="text-left p-3 font-semibold">Plan</th>
                        <th className="text-left p-3 font-semibold">Best for</th>
                        <th className="text-left p-3 font-semibold">Highlights</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Nomad Insurance Essential</td>
                        <td className="p-3">Budget-conscious travelers</td>
                        <td className="p-3">Emergency medical, evacuation, travel disruption</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Nomad Insurance Complete</td>
                        <td className="p-3">Long-term travelers, remote workers</td>
                        <td className="p-3">Broader health + travel protection, expanded care</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={SAFETYWING_NOMAD} target="_blank" rel="sponsored nofollow noopener noreferrer">
                    <Button>Get Nomad Insurance</Button>
                  </a>
                  <a href={SAFETYWING_COMPLETE} target="_blank" rel="sponsored nofollow noopener noreferrer">
                    <Button variant="outline">Compare Complete Plan</Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">Nomad Insurance Essential</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Core medical + travel protection for independent travelers who want strong coverage at an affordable price.
                  </p>
                  <a href={SAFETYWING_NOMAD} target="_blank" rel="sponsored nofollow noopener noreferrer">
                    <Button className="w-full">Get Essential Coverage</Button>
                  </a>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                    <h3 className="text-xl font-semibold">Nomad Insurance Complete</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Full health and travel protection with expanded benefits for long-term travelers and digital nomads.
                  </p>
                  <a href={SAFETYWING_COMPLETE} target="_blank" rel="sponsored nofollow noopener noreferrer">
                    <Button variant="outline" className="w-full">Compare Complete Plan</Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Coverage by Destination</h2>
                <div className="space-y-4 text-gray-700">
                  <p><strong>Aruba:</strong> Safe and easy to navigate, but major medical incidents can require transfer. Evacuation coverage matters.</p>
                  <p><strong>Curacao:</strong> Good local care for most cases, but serious issues can still mean off-island treatment.</p>
                  <p><strong>Punta Cana:</strong> Tourist hospitals are solid, but private treatment costs for uninsured visitors can still be significant.</p>
                  <p><strong>Thailand and Bali:</strong> Excellent private hospitals, but common accidents (especially road/water activities) can be expensive without insurance.</p>
                  <p><strong>Amsterdam and Prague:</strong> Great care access, but non-EU travelers still need robust protection for emergencies and disruptions.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/destinations/aruba"><Button variant="outline">Explore Aruba Tours</Button></Link>
                  <Link href="/destinations/curacao"><Button variant="outline">Explore Curacao Tours</Button></Link>
                  <Link href="/destinations/punta-cana"><Button variant="outline">Explore Punta Cana Tours</Button></Link>
                  <Link href="/destinations/amsterdam"><Button variant="outline">Explore Amsterdam Tours</Button></Link>
                  <Link href="/destinations/prague"><Button variant="outline">Explore Prague Tours</Button></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">When Should You Buy Travel Insurance?</h2>
                <p className="text-gray-700 mb-3">
                  Buy as early as possible after booking. Most plans only cover cancellation events that happen
                  after your policy starts.
                </p>
                <p className="text-gray-700">
                  If you travel continuously, subscription-style insurance can be simpler than repeatedly buying
                  per-trip policies. It also helps when plans change mid-journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-7">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Can I buy travel insurance after leaving home?</h3>
                    <p className="text-gray-700">Yes. SafetyWing allows signup while already abroad.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Does it cover adventure activities?</h3>
                    <p className="text-gray-700">Many common activities are covered, but always check policy details and exclusions.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">How much does travel insurance cost?</h3>
                    <p className="text-gray-700">Cost depends on age, plan, and add-ons. SafetyWing is often among the more affordable global options.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Are pre-existing conditions covered?</h3>
                    <p className="text-gray-700">Generally not by default. Review policy wording carefully before purchase.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Does coverage include trip delays and baggage issues?</h3>
                    <p className="text-gray-700">Yes, most plans include these benefits with specific limits.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Is travel insurance required for some countries?</h3>
                    <p className="text-gray-700">Yes in some cases. Entry requirements vary and change frequently, so check before departure.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="adventure-gradient border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Plane className="w-8 h-8 mx-auto text-white mb-3" />
                <h2 className="text-3xl font-bold text-white mb-3">Ready to protect your next trip?</h2>
                <p className="text-white/90 mb-5">
                  SafetyWing covers emergencies, delays, and unexpected travel costs in 175+ countries.
                </p>
                <a href={SAFETYWING_ALL} target="_blank" rel="sponsored nofollow noopener noreferrer">
                  <Button className="bg-white text-blue-700 hover:bg-white/90 font-semibold">
                    Start Coverage
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sticky affiliate CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-6 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:shadow-none sm:backdrop-blur-none">
          <div className="mx-auto max-w-5xl sm:max-w-none">
            <a
              href={SAFETYWING_NOMAD}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="block w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto sunset-gradient text-white font-semibold rounded-xl px-5 py-6 sm:rounded-full sm:px-6"
              >
                Get covered with SafetyWing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <FooterNext />
    </>
  );
}

