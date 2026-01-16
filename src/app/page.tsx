'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-x-hidden">
      {/* Animated background elements - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Expense Splitter</h1>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base"
              >
                How It Works
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white"
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
            <button
              onClick={() => router.push('/auth')}
              className="hidden md:block px-4 lg:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50 text-sm lg:text-base"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-fadeIn">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2 text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2 text-left"
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2 text-left"
                >
                  How It Works
                </button>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 mt-2"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Split Expenses Easily
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                and Smartly
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Expense Splitter helps you split bills with friends, track group expenses, and settle up with ease. 
              All your shared expenses in one beautiful dashboard.
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl sm:shadow-2xl shadow-purple-500/50"
            >
              Try it Free
            </button>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative max-w-6xl mx-auto animate-slideUp px-2 sm:px-4">
            <div className="relative transform sm:-rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30"></div>
              
              {/* Main dashboard card */}
              <div className="relative bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 pb-3 sm:pb-4 border-b border-gray-700">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white">Group Expenses</h3>
                      <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Trip to Paris</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex space-x-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-lg"></div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                  <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                    <p className="text-purple-300 text-xs sm:text-sm mb-1 sm:mb-2">Total Balance</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">$1,245.00</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                    <p className="text-blue-300 text-xs sm:text-sm mb-1 sm:mb-2">You Owe</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">$325.00</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border border-indigo-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                    <p className="text-indigo-300 text-xs sm:text-sm mb-1 sm:mb-2">You're Owed</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">$0.00</p>
                  </div>
                </div>

                {/* Chart and Recent Expenses - Stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Expense Chart */}
                  <div className="bg-gray-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700">
                    <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Expense Overview</h4>
                    <div className="flex items-end justify-between h-28 sm:h-32 lg:h-40 space-x-1 sm:space-x-2">
                      {[65, 80, 55, 90, 75, 85, 70, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Expenses */}
                  <div className="bg-gray-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700">
                    <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Recent Expenses</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {['Dinner', 'Hotel', 'Transport'].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-700 rounded mb-1 sm:mb-2"></div>
                            <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-800 rounded"></div>
                          </div>
                          <div className="h-4 sm:h-5 w-12 sm:w-16 bg-purple-500/30 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Powerful Features to Elevate
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Your Expense Management
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              All the tools you need to split expenses — smart, simple, and seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Group Management</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Create groups for trips, households, or events. Invite members and manage expenses together effortlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Smart Expense Tracking</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Add expenses instantly with automatic equal splits. Track every transaction with detailed history and analytics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Balance Calculator</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Real-time balance tracking shows who owes what. Settle up with confidence and keep friendships intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-12 sm:py-16 lg:py-24 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Comprehensive Expense Overview
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              View your total balance, group expenses, and individual contributions at a glance to stay on top of shared finances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Smart Expense Splitting</h3>
                <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Automatically calculate who owes what with equal splits or custom amounts. No more manual calculations or awkward conversations.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {['Equal splits', 'Custom amounts', 'Percentage-based splits', 'Automatic calculations'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Real-Time Balance Tracking</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                  See exactly who owes what in real-time. Track all your group expenses and individual balances in one place.
                </p>
              </div>
            </div>

            {/* Visual Dashboard Mockup */}
            <div className="relative order-1 lg:order-2">
              <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Group Balance</h4>
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <p className="text-purple-300 text-xs sm:text-sm mb-1 sm:mb-2">Total Expenses</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">$2,450.00</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Your Status</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center bg-gray-900/50 rounded-lg p-3 sm:p-4">
                        <span className="text-gray-300 text-sm sm:text-base">You Owe</span>
                        <span className="text-red-400 font-semibold text-sm sm:text-base">$325.00</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900/50 rounded-lg p-3 sm:p-4">
                        <span className="text-gray-300 text-sm sm:text-base">You're Owed</span>
                        <span className="text-green-400 font-semibold text-sm sm:text-base">$0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              A Smarter Way to
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Split Expenses
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Join thousands of users who split expenses fairly and efficiently. Start managing your shared finances today.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-20"></div>
            <div className="relative bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8 lg:mb-10">
                {[
                  { step: '1', title: 'Create a Group', desc: 'Start by creating a group for your trip, household, or event.' },
                  { step: '2', title: 'Add Expenses', desc: 'Add expenses and let us automatically calculate who owes what.' },
                  { step: '3', title: 'Settle Up', desc: 'Track balances and settle up with friends effortlessly.' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={() => router.push('/auth')}
                  className="px-8 sm:px-10 lg:px-12 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/50 w-full sm:w-auto"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Expense Splitter</span>
            </div>
            <p className="text-gray-400 text-center sm:text-right text-sm sm:text-base">
              © 2026 Expense Splitter. Made with ❤️ for fair splits.
            </p>
          </div>
        </div>
      </footer>

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
