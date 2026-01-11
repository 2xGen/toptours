"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Target,
  Award,
  Clock,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';

export default function AffiliatesPageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    partnerProgram: 'both',
    promotionPlan: '',
    websiteUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      // Success - show success message
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting affiliate application:', error);
      alert(`Error: ${error.message || 'Failed to submit application. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Commission calculations per referral:
  // Premium Annual: $239.88 upfront, 30% = $71.96 (one-time, covers 12 months)
  // Premium Monthly: $24.99/month, 30% = $7.50/month, capped at 12 months = $90.00 total
  // Promoted: $24.99/month, 20% = $5.00/month, uncapped = $60.00/year (ongoing)

  // Revenue examples assume a mix: 40% Premium Annual, 40% Premium Monthly, 20% Promoted
  const premiumAnnualCommission = 71.96; // $239.88 * 0.30
  const premiumMonthlyCommission = 90.00; // $7.50 * 12 months
  const promotedCommission = 60.00; // $5.00 * 12 months (annual estimate)

  const calculateRevenue = (referrals) => {
    const annualCount = Math.round(referrals * 0.4);
    const monthlyCount = Math.round(referrals * 0.4);
    const promotedCount = referrals - annualCount - monthlyCount;
    
    const annualRevenue = annualCount * premiumAnnualCommission;
    const monthlyRevenue = monthlyCount * premiumMonthlyCommission;
    const promotedRevenue = promotedCount * promotedCommission;
    const total = annualRevenue + monthlyRevenue + promotedRevenue;
    
    return { annualCount, monthlyCount, promotedCount, annualRevenue, monthlyRevenue, promotedRevenue, total };
  };

  const revenueExamples = [
    { referrals: 5, ...calculateRevenue(5) },
    { referrals: 10, ...calculateRevenue(10) },
    { referrals: 25, ...calculateRevenue(25) },
    { referrals: 50, ...calculateRevenue(50) },
    { referrals: 100, ...calculateRevenue(100) },
  ];

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen overflow-x-hidden" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <DollarSign className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Earn Recurring Commissions</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                Tour Affiliate Program & Restaurant Affiliate Program
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Earn up to <span className="font-bold text-white">30% recurring commission</span> by referring tour operators and restaurants to TopTours.ai. Join our affiliate program and start earning passive income today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-transform px-8 py-6 text-lg shadow-xl"
                  size="lg"
                >
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
                  size="lg"
                >
                  <Link href="#how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Affiliate Program</span>
            </nav>
          </div>
        </section>

        {/* Commission Structure */}
        <section id="commission-structure" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Generous Commission Structure
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Earn recurring commissions on every partner you refer. The more partners you refer, the more you earn.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Premium Commission */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-gray-800">
                    Premium Restaurants & Tours
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">30%</div>
                  <div className="text-gray-600">Recurring Commission</div>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Capped at 12 months per referral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Earn on both annual and monthly plans</span>
                  </div>
                </div>
              </motion.div>

              {/* Promoted Commission */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-gray-800">
                    Promoted Listings
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-purple-600 mb-2">20%</div>
                  <div className="text-gray-600">Recurring Commission</div>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span>Uncapped - earn forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span>Ongoing monthly revenue</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Payout Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-semibold text-gray-800">$50 Minimum Payout Threshold</span>
              </div>
              <p className="text-gray-600">
                Get paid via PayPal once you reach $50 in commissions. Payments processed monthly.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Partner Bonus Section */}
        <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 border-y border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-green-300"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">BONUS FOR YOUR REFERRALS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                  Offer Partners 1st Month FREE
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  When partners use your unique affiliate coupon code, they get their <span className="font-bold text-green-600">first month completely FREE</span>. This powerful incentive makes it easier to convert leads and build your commission stream.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-poppins font-semibold text-gray-800">
                      Easy Conversion
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    The 1st month free offer significantly increases your conversion rate, making it easier to convince partners to sign up.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-poppins font-semibold text-gray-800">
                      Commission After Trial
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    You earn commissions once the free trial ends and partners convert to paid subscribers. No risk for partners, steady income for you.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-8 text-center bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-gray-800">How it works:</span> Partners sign up using your unique coupon code → They get 1st month FREE → After trial converts to paid → You start earning recurring commissions
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Info */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                TopTours Pricing Plans
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Partners choose from flexible pricing options. You earn commission on whichever plan they select.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Annual Plan */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg"
              >
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    BEST VALUE
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Annual (12 months)</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">$19.99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="text-lg text-gray-700 mb-2">
                    <span className="font-semibold">$239.88</span> paid upfront
                  </div>
                  <div className="text-sm text-green-600 font-semibold">
                    Save $60/year
                  </div>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>12 months of service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Your commission: $71.96 (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>One-time payment</span>
                  </div>
                </div>
              </motion.div>

              {/* Monthly Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg"
              >
                <div className="text-center mb-6">
                  <div className="inline-block bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    MONTHLY BILLING
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Monthly</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">$24.99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="text-lg text-gray-700 mb-2">
                    Billed monthly
                  </div>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <span>Flexible monthly payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <span>Your commission: $90 total ($7.50/month × 12)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Revenue Calculator Table */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                How Much Can You Earn?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                See your potential earnings based on the number of referrals. Commissions are recurring for 12 months (Premium) or uncapped (Promoted).
              </p>
              <p className="text-sm text-gray-500">
                *Calculations assume a mix of annual and monthly plans. Actual earnings may vary.
              </p>
            </motion.div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Referrals</th>
                    <th className="px-6 py-4 text-right font-semibold">Premium Annual<br/><span className="text-xs font-normal opacity-90">($71.96 each)</span></th>
                    <th className="px-6 py-4 text-right font-semibold">Premium Monthly<br/><span className="text-xs font-normal opacity-90">($90.00 each)*</span></th>
                    <th className="px-6 py-4 text-right font-semibold">Promoted<br/><span className="text-xs font-normal opacity-90">($60/year each)</span></th>
                    <th className="px-6 py-4 text-right font-semibold bg-blue-700">Total Annual<br/>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueExamples.map((example, index) => (
                    <motion.tr
                      key={example.referrals}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">{example.referrals}</td>
                      <td className="px-6 py-4 text-right text-gray-700">${example.annualRevenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-700">${example.monthlyRevenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-700">${example.promotedRevenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 bg-blue-50">${example.total.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              <p>*Calculations assume a mix of Premium Annual (40%), Premium Monthly (40%), and Promoted (20%). Premium Monthly commissions capped at 12 months ($7.50/month). Promoted commissions are uncapped and shown as annual estimate.</p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Why Join Our Affiliate Program?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Earn passive income by referring quality tour operators and restaurants to TopTours.ai. Start building your recurring commission stream today.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: DollarSign,
                  title: 'Recurring Commissions',
                  description: 'Earn 30% on Premium plans for 12 months or 20% on Promoted plans forever. Build a steady stream of passive income.',
                },
                {
                  icon: Users,
                  title: 'Large Market',
                  description: 'Access to thousands of tour operators and restaurants worldwide looking for better visibility and bookings.',
                },
                {
                  icon: Zap,
                  title: 'Quick Payouts',
                  description: '$50 minimum payout threshold. Get paid monthly via PayPal once you reach the threshold.',
                },
                {
                  icon: Target,
                  title: 'Unique Coupon Codes',
                  description: 'Get your own affiliate coupon codes to track referrals easily in Stripe. Simple, transparent tracking.',
                },
                {
                  icon: Award,
                  title: 'High Commission Rates',
                  description: '30% commission on Premium plans is one of the highest in the travel industry. More referrals = more earnings.',
                },
                {
                  icon: Clock,
                  title: 'Passive Income',
                  description: 'Set it and forget it. Once a partner signs up, you earn recurring commissions automatically for months to come.',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply-form" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
                Apply to Become an Affiliate
              </h2>
              <p className="text-xl text-gray-600">
                Fill out the form below and we'll review your application within 24 hours. Once approved, you'll receive your unique affiliate coupon codes.
              </p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your interest in becoming a TopTours.ai affiliate partner. We've received your application and will review it within 24 hours.
                </p>
                <p className="text-gray-600">
                  We'll send you an email once your application has been reviewed with next steps.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="bg-gray-50 rounded-2xl p-8 shadow-lg"
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="partnerProgram" className="block text-sm font-semibold text-gray-700 mb-2">
                      Which Partner Program? <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="partnerProgram"
                      name="partnerProgram"
                      required
                      value={formData.partnerProgram}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="both">Both (Tour Operators & Restaurants)</option>
                      <option value="tour_operators">Tour Operators Only</option>
                      <option value="restaurants">Restaurants Only</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="promotionPlan" className="block text-sm font-semibold text-gray-700 mb-2">
                      How do you plan to promote TopTours.ai? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="promotionPlan"
                      name="promotionPlan"
                      required
                      value={formData.promotionPlan}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      placeholder="Tell us about your marketing strategy, audience, website, social media presence, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                      Website/Business URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sunset-gradient text-white font-semibold py-6 text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </motion.form>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 cta-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Join our affiliate program today and start earning recurring commissions by referring tour operators and restaurants to TopTours.ai.
              </p>
              <Button 
                onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-transform px-8 py-6 text-lg shadow-xl"
                size="lg"
              >
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        <FooterNext />
      </div>

      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
