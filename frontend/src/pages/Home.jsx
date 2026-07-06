import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';



const Home = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    // Fetch categories
    api.get('/services')
      .then((res) => {
        if (res.data && res.data.success) {
          setCategories(res.data.services || []);
        }
      })
      .catch((err) => console.error(err));

    // Fetch providers
    api.get('/providers')
      .then((res) => {
        if (res.data && res.data.success) {
          setProviders(res.data.profiles.slice(0, 3) || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Mock fallback providers for visual excellence if none registered
  const fallbackProviders = [
    {
      _id: 'm1',
      userId: { name: 'Sunil Perera', profileImage: '' },
      serviceCategories: [{ name: 'Plumbing Service' }],
      hourlyRate: 1200,
      experienceYears: 8,
      ratingAvg: 4.9,
      totalReviews: 24,
      district: 'Colombo',
      city: 'Maharagama'
    },
    {
      _id: 'm2',
      userId: { name: 'Kasun Jayawardena', profileImage: '' },
      serviceCategories: [{ name: 'Electrical Work' }],
      hourlyRate: 1500,
      experienceYears: 6,
      ratingAvg: 4.8,
      totalReviews: 19,
      district: 'Gampaha',
      city: 'Kadawatha'
    },
    {
      _id: 'm3',
      userId: { name: 'Nimali Silva', profileImage: '' },
      serviceCategories: [{ name: 'Academic Tutoring' }],
      hourlyRate: 1000,
      experienceYears: 4,
      ratingAvg: 5.0,
      totalReviews: 12,
      district: 'Kandy',
      city: 'Peradeniya'
    }
  ];

  const activeProviders = providers.length > 0 ? providers : fallbackProviders;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
              QuickServe.lk
            </span>
          </Link>

          {/* Central Directory Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/providers" className="text-xs font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider transition">
              All Providers
            </Link>
            <Link to="/search" className="text-xs font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider transition">
              Proximity Radar
            </Link>
            <a href="#about" className="text-xs font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider transition">
              About
            </a>
            <a href="#contact" className="text-xs font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider transition">
              Contact
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  to={
                    user?.role === 'admin'
                      ? '/dashboard/admin'
                      : user?.role === 'provider'
                      ? '/dashboard/provider'
                      : '/dashboard/customer'
                  }
                  className="text-sm font-semibold text-slate-355 hover:text-amber-400 transition"
                >
                  Dashboard ({user?.name?.split(' ')[0]})
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-355 hover:text-amber-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl transition hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/10"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>


      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative py-20 lg:py-28 w-full text-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            
            {/* Sri Lanka Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold uppercase tracking-wider mx-auto">
              🇱🇰 Sri Lanka's Verified Local Service Marketplace
            </div>
            
            {/* Title headings */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Find Trusted Professionals<br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Right Near You
                </span>
              </h1>
              
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Book local Plumbers, Electricians, Tutors, Cleaners, and AC Repair technicians with escrow payments and verified reviews. Built for Sri Lankan homes.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                to="/search"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] hover:shadow-amber-500/30 transition duration-200"
              >
                Find Near Me (Radar Map)
              </Link>
              <Link
                to="/providers"
                className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-850 hover:border-slate-700 transition duration-200"
              >
                Browse All Providers
              </Link>
              <Link
                to="/register?role=provider"
                className="px-8 py-4 bg-slate-950 border border-slate-900/60 text-slate-455 font-medium rounded-xl hover:bg-slate-900 hover:text-slate-300 hover:border-slate-800 transition duration-200"
              >
                Join as Provider
              </Link>
            </div>


            {/* Category grid */}
            <div className="pt-8 max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Browse Services by Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/search?category=${cat._id}`}
                    className="p-5 bg-slate-900/50 border border-slate-850 hover:border-amber-500/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group cursor-pointer transition-all duration-350 hover:scale-[1.03] shadow-md hover:shadow-amber-500/5"
                  >
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{cat.icon || '🛠'}</span>
                    <span className="font-bold text-xs text-white block mt-1">{cat.name}</span>
                  </Link>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-full py-6 text-slate-500 text-xs">
                    Loading Categories...
                  </div>
                )}
              </div>
                       {/* Top Providers Grid */}
            <div className="pt-20 max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-white">Top Rated Service Providers</h2>
                <p className="text-slate-455 text-xs mt-1">Verified professionals with completed escrow checkouts</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                {activeProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className={`bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border transition flex flex-col justify-between hover:scale-[1.02] shadow-xl ${
                      provider.isFeatured
                        ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                        : 'border-slate-850 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {provider.userId?.isVerified && (
                            <span className="bg-sky-500/10 text-sky-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20">
                              ✔️ Verified
                            </span>
                          )}
                          {provider.isFeatured && (
                            <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/20 animate-pulse">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-amber-500">★ {provider.ratingAvg?.toFixed(1) || '0.0'}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base">{provider.userId?.name}</h4>
                        <p className="text-xs text-slate-455 mt-0.5">{provider.serviceCategories?.[0]?.name || 'General Help'}</p>
                      </div>

                      <div className="text-slate-500 text-xs space-y-1 font-semibold">
                        <p>📍 District: {provider.district || 'Colombo'} • {provider.city || 'Colombo 03'}</p>
                        <p>💼 Experience: {provider.experienceYears} Years</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-950 mt-4 pt-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Rate</span>
                        <span className="font-black text-white text-sm">LKR {provider.hourlyRate}/hr</span>
                      </div>
                      <Link
                        to={`/providers/${provider.userId?._id || provider._id}`}
                        className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 transition"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div></div>
            </div>

            {/* How It Works column sequence */}
            <div className="pt-20 max-w-5xl mx-auto space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white">How QuickServe.lk Works</h2>
                <p className="text-slate-450 text-xs mt-1">විශ්වාසයෙන් සේවාවන් වෙන්කරවා ගැනීමේ සරල පියවර 3</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl relative space-y-3">
                  <div className="text-3xl text-amber-500 font-bold font-mono">01</div>
                  <h3 className="text-base font-bold text-white">Select District & Search</h3>
                  <p className="text-slate-450 text-xs leading-relaxed">
                    Choose your district, find approved service pros near you, check ratings, bio, and hourly rates in LKR.
                  </p>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl relative space-y-3">
                  <div className="text-3xl text-amber-500 font-bold font-mono">02</div>
                  <h3 className="text-base font-bold text-white">Secure Escrow Hold</h3>
                  <p className="text-slate-450 text-xs leading-relaxed">
                    Accept request and place payment hold. Funds are locked securely in escrow, protecting both provider and customer.
                  </p>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl relative space-y-3">
                  <div className="text-3xl text-amber-500 font-bold font-mono">03</div>
                  <h3 className="text-base font-bold text-white">Release on Completion</h3>
                  <p className="text-slate-450 text-xs leading-relaxed">
                    Provider completes work, customer clicks 'Confirm', and funds are released. Leave stars and write review feedback!
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="pt-20 max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-white">What Our Customers Say</h2>
                <p className="text-slate-450 text-xs mt-1">Reviews from verified users across Sri Lanka</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3.5">
                  <div className="text-amber-500 text-xs font-bold">★★★★★</div>
                  <p className="text-slate-350 text-xs leading-relaxed">
                    "Excellent service! Found a plumber within 10 minutes in Kandy. The escrow payment made me feel super safe."
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">— Prasanna, Kandy</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3.5">
                  <div className="text-amber-500 text-xs font-bold">★★★★★</div>
                  <p className="text-slate-350 text-xs leading-relaxed">
                    "Being able to find an electrician near Kadawatha without asking around neighbors is a lifesaver. Strongly recommend!"
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">— Dilini, Gampaha</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3.5">
                  <div className="text-amber-500 text-xs font-bold">★★★★★</div>
                  <p className="text-slate-350 text-xs leading-relaxed">
                    "The real-time chat helped me coordinate with my tutor and fix the dates immediately. Escrow hold is brilliant!"
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">— Shanaka, Colombo</p>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="pt-20 max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {[
                  {
                    q: 'How does the Escrow payment protect me?',
                    a: 'When you book a service, your payment is authorized and held by Stripe/PayHere. The provider does not get paid until you confirm that the service has been completed successfully on your dashboard.'
                  },
                  {
                    q: 'How do I join as a service provider?',
                    a: 'Simply click "Join as a Service Provider" and register. Complete your profile details (experience, rate, district and nearest city) and wait for admin verification approval to go live.'
                  },
                  {
                    q: 'How is proximity distance calculated?',
                    a: 'We use MongoDB 2dsphere indexing. When you search, the application calculates the actual geodetic distance between the customer browser GPS and the provider location preset coordinates.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left font-bold text-white flex justify-between items-center text-sm focus:outline-none hover:bg-slate-850/30"
                    >
                      <span>{item.q}</span>
                      <span className="text-amber-500 text-lg transition-transform duration-200">
                        {faqOpen[idx] ? '−' : '+'}
                      </span>
                    </button>
                    {faqOpen[idx] && (
                      <div className="p-5 pt-0 border-t border-slate-950 text-slate-450 text-xs leading-relaxed text-left">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* About & Contact Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-20 max-w-4xl mx-auto text-left">
              {/* About Section */}
              <div id="about" className="space-y-4 bg-slate-900/50 border border-slate-850 p-6 rounded-3xl scroll-mt-20">
                <h3 className="text-xl font-bold text-white">About QuickServe.lk</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  QuickServe.lk is Sri Lanka's leading decentralized local service marketplace ecosystem. We bridge the gap between skilled local providers (plumbers, electricians, tutors, builders) and customers needing immediate assistance.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our core mission is to empower local professionals while offering customers peace of mind through secure Stripe Escrow checkouts and geodetic proximity radar matching.
                </p>
              </div>

              {/* Contact Section */}
              <div id="contact" className="space-y-4 bg-slate-900/50 border border-slate-850 p-6 rounded-3xl scroll-mt-20">
                <h3 className="text-xl font-bold text-white">Contact Our Team</h3>
                <p className="text-xs text-slate-450 leading-relaxed font-mono">
                  📍 Office: 254 Galle Road, Colombo 03, Sri Lanka<br />
                  📞 Support Hotlines: +94 11 234 5678 / +94 77 123 4567<br />
                  ✉ Email Helpline: support@quickserve.lk
                </p>
                <div className="pt-2 flex gap-4">
                  <a href="mailto:support@quickserve.lk" className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-amber-500 font-bold text-xs rounded-xl transition text-center flex-grow">
                    Send Email Inquiry
                  </a>
                </div>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-10 border-t border-slate-900 text-slate-400 text-sm">
              <div>
                <p className="text-2xl font-black text-white">100% Secure</p>
                <p className="text-xs text-slate-500 mt-1">Escrow payment hold</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">Verified Pros</p>
                <p className="text-xs text-slate-500 mt-1">District & certificate checks</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl font-black text-white">Sri Lankan Support</p>
                <p className="text-xs text-slate-500 mt-1">Dedicated customer help</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 QuickServe.lk. Sri Lanka's Local Service Marketplace. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-amber-400">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
