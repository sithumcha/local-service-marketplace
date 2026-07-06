import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useProviderStore from '../store/useProviderStore';
import NotificationBell from '../components/NotificationBell';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const ProvidersDirectory = () => {
  const { providers, categories, fetchProviders, fetchCategories, loading } = useProviderStore();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch all providers without geolocation filters (fetch all approved)
    fetchProviders({
      category: selectedCategory
    });
  }, [selectedCategory]);

  // Frontend filter for district
  const filteredProviders = providers.filter(p => {
    if (!selectedDistrict) return true;
    return p.district?.toLowerCase() === selectedDistrict.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
              QuickServe.lk
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold hover:text-amber-400 transition">
              Home
            </Link>
            <Link to="/search" className="text-sm font-semibold hover:text-amber-400 transition">
              Proximity Radar
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Title */}
        <div className="text-center md:text-left space-y-2 mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white">All Service Providers</h1>
          <p className="text-slate-455 text-xs sm:text-sm">Browse our directory of verified local technicians and academic tutors in Sri Lanka.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center flex-grow">
            {/* Category selector */}
            <div className="w-full sm:w-1/2 md:w-64">
              <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name} {cat.icon}</option>
                ))}
              </select>
            </div>

            {/* District selector */}
            <div className="w-full sm:w-1/2 md:w-64">
              <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-xs font-mono self-end md:self-center">
            Found {filteredProviders.length} active profiles
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...filteredProviders]
              .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
              .map((provider) => (
              <div
                key={provider._id}
                className={`bg-slate-900 p-5 rounded-2xl transition flex flex-col justify-between shadow-md border ${
                  provider.isFeatured
                    ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                    : 'border-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      {provider.userId?.isVerified && (
                        <span className="bg-sky-500/10 text-sky-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20">
                          ✔️ Verified ID
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
                    <h4 className="font-bold text-white text-base leading-tight">{provider.userId?.name}</h4>
                    <p className="text-xs text-slate-450 mt-1">{provider.serviceCategories?.[0]?.name || 'General Help'}</p>
                  </div>

                  <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">
                    {provider.bio || 'No description provided.'}
                  </p>

                  <div className="text-slate-500 text-xs space-y-1 font-semibold pt-1 border-t border-slate-950">
                    <p>📍 Location: {provider.city ? `${provider.city}, ` : ''}{provider.district}</p>
                    <p>💼 Experience: {provider.experienceYears} Years</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-950 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Rate</span>
                    <span className="font-black text-white text-sm">LKR {provider.hourlyRate}/hr</span>
                  </div>
                  <Link
                    to={`/providers/${provider.userId?._id || provider.userId}`}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:scale-[1.02] font-black text-xs rounded-xl shadow transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
            <span className="text-4xl">🔍</span>
            <h3 className="font-bold text-white mt-4 text-base">No providers found</h3>
            <p className="text-slate-500 text-xs mt-1">Try resetting the filters or selecting a different district.</p>
            <button
              onClick={() => {
                setSelectedDistrict('');
                setSelectedCategory('');
              }}
              className="mt-4 px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-bold text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>© 2026 QuickServe.lk. Sri Lanka's Verified Service Registry.</p>
      </footer>
    </div>
  );
};

export default ProvidersDirectory;
