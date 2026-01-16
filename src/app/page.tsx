'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Box, Lock, Search, Settings, Sparkles, Circle } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

import { createCheckoutSession } from '@/actions/checkout';

// Animated Section Component
function AnimatedSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handlePurchase = async (plan: 'pro' | 'business') => {
    const result = await createCheckoutSession(plan, billingCycle);
    if (result && 'error' in result) {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-white overflow-x-hidden">
      {/* Header Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo */}
            <button
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-1"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
            >
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Expense Splitter</h1>
            </button>

            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
              >
                Pricing
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Get Started Button - Desktop */}
            <ShimmerButton
              onClick={() => router.push('/auth')}
              className="hidden md:flex text-sm lg:text-base"
              background="#000000"
              borderRadius="12px"
            >
              Get Started
            </ShimmerButton>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 text-left"
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 text-left"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 text-left"
                >
                  Pricing
                </button>
                <ShimmerButton
                  onClick={() => router.push('/auth')}
                  className="w-full mt-2"
                  background="#000000"
                  borderRadius="12px"
                >
                  Get Started
                </ShimmerButton>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section with Geometric Background */}
      <section id="home" className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-white">
        {/* Soft gradient overlay for light mode - enhanced contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-300/[0.5] via-transparent to-indigo-300/[0.5] blur-3xl" />

        {/* Animated geometric shapes - increased 3D contrast by +30% */}
        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-purple-500/[0.55]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%] drop-shadow-xl"
          />

          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-pink-500/[0.55]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%] drop-shadow-xl"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            gradient="from-indigo-500/[0.55]"
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%] drop-shadow-xl"
          />

          <ElegantShape
            delay={0.6}
            width={200}
            height={60}
            rotate={20}
            gradient="from-blue-500/[0.55]"
            className="right-[15%] md:right-[20%] top-[10%] md:top-[15%] drop-shadow-lg"
          />

          <ElegantShape
            delay={0.7}
            width={150}
            height={40}
            rotate={-25}
            gradient="from-violet-500/[0.55]"
            className="left-[20%] md:left-[25%] top-[5%] md:top-[10%] drop-shadow-lg"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/60 border border-purple-200 mb-8 md:mb-10"
            >
              <Circle className="h-2 w-2 fill-purple-500" />
              <span className="text-sm text-purple-700 tracking-wide font-medium">
                Expense Splitter
              </span>
            </motion.div>

            {/* Hero Title */}
            <motion.div
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 tracking-tight leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-700">
                  Split Expenses Easily
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600">
                  and Smartly
                </span>
              </h1>
            </motion.div>

            {/* Hero Description */}
            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
                Expense Splitter helps you split bills with friends, track group expenses, and settle up with ease.
                All your shared expenses in one beautiful dashboard.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center"
            >
              <ShimmerButton
                onClick={() => router.push('/auth')}
                className="text-base sm:text-lg px-8 sm:px-10 lg:px-12 py-4"
                background="#000000"
                borderRadius="16px"
                shimmerColor="#ffffff"
              >
                Try it Free
              </ShimmerButton>
            </motion.div>
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none" />
      </section>

      {/* Glowing Effect Feature Grid Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {" "}Split Fairly
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Powerful features designed to make expense sharing effortless and transparent.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
              <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Box className="h-4 w-4 text-gray-700" />}
                title="Create Groups Easily"
                description="Set up expense groups for trips, roommates, or any shared activities in seconds."
              />
              <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<Settings className="h-4 w-4 text-gray-700" />}
                title="Smart Splitting Options"
                description="Split equally, by percentage, or custom amounts. You decide how expenses are divided."
              />
              <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Lock className="h-4 w-4 text-gray-700" />}
                title="Track Every Transaction"
                description="Keep a detailed record of all expenses with receipts, notes, and timestamps."
              />
              <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<Sparkles className="h-4 w-4 text-gray-700" />}
                title="Real-Time Balance Updates"
                description="See who owes what instantly. Balances update automatically as expenses are added."
              />
              <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                icon={<Search className="h-4 w-4 text-gray-700" />}
                title="Settlement Made Simple"
                description="Mark payments as settled with one click. No more awkward money conversations."
              />
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Features to Elevate
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {" "}Your Expense Management
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              All the tools you need to split expenses — smart, simple, and seamless.
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={staggerItem} className="group bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Group Management</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Create groups for trips, households, or events. Invite members and manage expenses together effortlessly.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={staggerItem} className="group bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Smart Expense Tracking</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Add expenses instantly with automatic equal splits. Track every transaction with detailed history and analytics.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={staggerItem} className="group bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Balance Calculator</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Real-time balance tracking shows who owes what. Settle up with confidence and keep friendships intact.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-12 sm:py-16 lg:py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comprehensive Expense Overview
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              View your total balance, group expenses, and individual contributions at a glance to stay on top of shared finances.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            {/* Text Content */}
            <AnimatedSection delay={0.1} className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Smart Expense Splitting</h3>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Automatically calculate who owes what with equal splits or custom amounts. No more manual calculations or awkward conversations.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {['Equal splits', 'Custom amounts', 'Percentage-based splits', 'Automatic calculations'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Real-Time Balance Tracking</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  See exactly who owes what in real-time. Track all your group expenses and individual balances in one place.
                </p>
              </div>
            </AnimatedSection>

            {/* Visual Dashboard Mockup */}
            <AnimatedSection delay={0.3} className="relative order-1 lg:order-2">
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Group Balance</h4>
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <p className="text-purple-700 text-xs sm:text-sm mb-1 sm:mb-2">Total Expenses</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">$2,450.00</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Your Status</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3 sm:p-4">
                        <span className="text-gray-700 text-sm sm:text-base">You Owe</span>
                        <span className="text-red-500 font-semibold text-sm sm:text-base">$325.00</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3 sm:p-4">
                        <span className="text-gray-700 text-sm sm:text-base">You're Owed</span>
                        <span className="text-green-500 font-semibold text-sm sm:text-base">$0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              A Smarter Way to
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {" "}Split Expenses
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Join thousands of users who split expenses fairly and efficiently. Start managing your shared finances today.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8 lg:mb-10"
              >
                {[
                  { step: '1', title: 'Create a Group', desc: 'Start by creating a group for your trip, household, or event.' },
                  { step: '2', title: 'Add Expenses', desc: 'Add expenses and let us automatically calculate who owes what.' },
                  { step: '3', title: 'Settle Up', desc: 'Track balances and settle up with friends effortlessly.' }
                ].map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
              <div className="text-center">
                <ShimmerButton
                  onClick={() => router.push('/auth')}
                  className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 lg:px-12 py-4"
                  background="#000000"
                  borderRadius="16px"
                  shimmerColor="#ffffff"
                >
                  Get Started Free
                </ShimmerButton>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 sm:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px] animate-pulse animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex flex-col items-center justify-center mb-16 sm:mb-24 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              No hidden fees. No credit card required. Cancel anytime.
            </p>

            {/* Modern Toggle */}
            <div className="p-1.5 bg-gray-100 border border-gray-200 rounded-full inline-flex items-center relative backdrop-blur-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Yearly
              </button>
              <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-lg border border-gray-200 transition-all duration-300 ease-out ${billingCycle === 'monthly' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
              />
            </div>
            {billingCycle === 'annually' && (
              <span className="mt-4 text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                ✨ Save 20% on yearly plans
              </span>
            )}
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center"
          >
            {/* Starter */}
            <motion.div variants={staggerItem} className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-purple-300 transition-all duration-300 flex flex-col h-full shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 text-sm">Essential features for individuals.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
              <ShimmerButton
                onClick={() => router.push('/auth')}
                className="w-full mb-8"
                background="#000000"
                shimmerColor="#ffffff"
                borderRadius="12px"
              >
                <span className="text-white font-medium">Get Started</span>
              </ShimmerButton>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Features</p>
                {['Unlimited Groups', 'Basic Expense Splitting', '30-Day History', 'Email Support'].map(feature => (
                  <div key={feature} className="flex items-center text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mr-3 text-purple-600 flex-shrink-0 group-hover:border-purple-300 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro (Highlighted) */}
            <motion.div variants={staggerItem} className="relative bg-white border-2 border-purple-500 rounded-3xl p-8 transform md:scale-105 z-10 shadow-2xl shadow-purple-200/50 flex flex-col h-full">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                Most Popular
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 text-sm">Advanced tools for power users.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">{billingCycle === 'monthly' ? '$9' : '$7'}</span>
                <span className="text-2xl font-bold text-gray-900">.99</span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
              <ShimmerButton
                onClick={() => handlePurchase('pro')}
                className="w-full mb-8"
                background="#000000"
                borderRadius="12px"
              >
                Get Started
              </ShimmerButton>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Everything in Starter, plus</p>
                {['Receipt Scanning (OCR)', 'Unlimited History', 'Export to PDF/CSV', 'Priority Support', 'Custom Categories'].map(feature => (
                  <div key={feature} className="flex items-center text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center mr-3 text-purple-600 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Business */}
            <motion.div variants={staggerItem} className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-purple-300 transition-all duration-300 flex flex-col h-full shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-500 text-sm">For teams and organizations.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">{billingCycle === 'monthly' ? '$19' : '$15'}</span>
                <span className="text-2xl font-bold text-gray-900">.99</span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
              <ShimmerButton
                onClick={() => handlePurchase('business')}
                className="w-full mb-8"
                background="#000000"
                shimmerColor="#ffffff"
                borderRadius="12px"
              >
                <span className="text-white font-medium">Get Started</span>
              </ShimmerButton>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Everything in Pro, plus</p>
                {['Team Management', 'API Access', 'SSO Authentication', 'Dedicated Success Manager', 'Audit Logs'].map(feature => (
                  <div key={feature} className="flex items-center text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mr-3 text-purple-600 flex-shrink-0 group-hover:border-purple-300 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-t border-gray-200 bg-white/80 backdrop-blur-xl py-8 sm:py-10 lg:py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Expense Splitter</span>
            </div>
            <p className="text-gray-600 text-center sm:text-right text-sm sm:text-base">
              © 2026 Expense Splitter. Made with ❤️ for fair splits.
            </p>
          </div>
        </div>
      </motion.footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 1s ease-out 0.3s backwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

// GridItem Component with Glowing Effect
interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 p-2 md:rounded-[1.5rem] md:p-3 bg-white/50 backdrop-blur-sm">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-gray-200 bg-white p-6 shadow-sm md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-gray-200 bg-gray-50 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-gray-900">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-gray-600">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
