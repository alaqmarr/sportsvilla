import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Users, Wallet, ClipboardList, Medal, ChevronRight, Smartphone, Zap } from 'lucide-react';

export default async function LandingPage() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-emerald-500" />,
      title: 'Book Courts Instantly',
      description: 'Reserve your favourite turf in seconds with real-time availability.',
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: 'Community Games',
      description: 'Find open matches, meet new players, and join the squad.',
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      title: 'Instant Check-ins',
      description: 'Skip the reception line. Scan your QR and walk straight to the court.',
    },
    {
      icon: <Wallet className="h-6 w-6 text-purple-500" />,
      title: 'Wallet Rewards',
      description: 'Earn cashback and points on every booking with our smart wallet.',
    },
    {
      icon: <ClipboardList className="h-6 w-6 text-pink-500" />,
      title: 'Memberships',
      description: 'Manage monthly passes and track your attendance seamlessly.',
    },
    {
      icon: <Medal className="h-6 w-6 text-yellow-500" />,
      title: 'Leaderboards',
      description: 'Compete with local players and climb the Sportsvilla rankings.',
    },
  ];

  const dbSports = await prisma.sport.findMany({
    select: { name: true, iconPath: true }
  });

  const sports = dbSports.length > 0 
    ? dbSports.map(s => ({ name: s.name, emoji: s.iconPath || '🏅' }))
    : [
        { name: 'Badminton', emoji: '🏸' },
        { name: 'Cricket', emoji: '🏏' },
        { name: 'Football', emoji: '⚽' },
        { name: 'Tennis', emoji: '🎾' },
        { name: 'Basketball', emoji: '🏀' },
        { name: 'Swimming', emoji: '🏊‍♂️' },
        { name: 'Volleyball', emoji: '🏐' },
        { name: 'Table Tennis', emoji: '🏓' },
        { name: 'Gym', emoji: '🏋️‍♂️' },
      ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-medium text-sm mb-8 border border-emerald-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            Now live in 50+ locations
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Stop waiting. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">
              Start playing.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover the best premium sports facilities near you. Book turfs, join open games, meet new players, and earn rewards every time you hit the court.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Link
              href="/play/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 w-full sm:w-auto"
            >
              Book a Court
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="https://play.google.com/store"
              target="_blank"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-slate-900 font-semibold text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <Smartphone className="mr-2 h-5 w-5 text-slate-500" />
              Download App
            </Link>
          </div>
        </div>

        {/* Floating Mockup/Dashboard Preview snippet could go here */}
      </section>

      {/* Interactive Sports Marquee */}
      <section className="py-8 bg-white border-y border-slate-200 overflow-hidden relative">
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
        
        <div className="flex animate-marquee whitespace-nowrap gap-8 px-4 items-center">
          {/* Double the array for seamless infinite scroll effect */}
          {[...sports, ...sports].map((sport, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
              <span className="text-2xl">{sport.emoji}</span>
              <span className="font-semibold text-slate-700">{sport.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-slate-900">Built for players, by players</h2>
          <p className="text-lg text-slate-600">Everything you need to manage your active lifestyle in one single platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">Ready to hit the court?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of players already using Sportsvilla to book turfs and find games.
            </p>
            <Link
              href="/play/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4 w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold font-heading">
              S
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">Sportsvilla</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-emerald-600 transition-colors">About</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Locations</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Sportsvilla. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
