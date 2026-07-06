import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useProviderStore from '../store/useProviderStore';
import useGeolocation from '../hooks/useGeolocation';
import NotificationBell from '../components/NotificationBell';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const DISTRICT_COORDS = {
  Colombo: [79.8612, 6.9271],
  Gampaha: [80.0098, 7.0873],
  Kalutara: [79.9607, 6.5854],
  Kandy: [80.6337, 7.2906],
  Matale: [80.6234, 7.4675],
  'Nuwara Eliya': [80.7895, 6.9497],
  Galle: [80.2170, 6.0535],
  Matara: [80.5488, 5.9549],
  Hambantota: [81.1185, 6.1249],
  Jaffna: [80.0166, 9.6685],
  Kilinochchi: [80.3982, 9.2865],
  Mannar: [79.9074, 8.9810],
  Vavuniya: [80.4982, 8.7542],
  Mullaitivu: [80.8166, 9.2667],
  Trincomalee: [81.2335, 8.5873],
  Batticaloa: [81.6924, 7.7102],
  Ampara: [81.6724, 7.2842],
  Kurunegala: [80.3647, 7.4863],
  Puttalam: [79.8283, 8.0362],
  Anuradhapura: [80.4037, 8.3114],
  Polonnaruwa: [81.0003, 7.9395],
  Badulla: [81.0550, 6.9934],
  Monaragala: [81.3507, 6.8724],
  Ratnapura: [80.4037, 6.6828],
  Kegalle: [80.3424, 7.2513]
};

const Search = () => {
  const { coords, loading: loadingGeo } = useGeolocation();
  const { providers, categories, fetchProviders, fetchCategories, loading } = useProviderStore();

  const [radius, setRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchDistrict, setSearchDistrict] = useState(''); // Default to 'All Districts' (empty string)

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([6.9271, 79.8612], 9);

      // OpenStreetMap standard bright tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    }


    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync parameters and fetch providers
  useEffect(() => {
    const queryParams = {
      radius,
      category: selectedCategory,
    };

    if (searchDistrict === 'gps') {
      if (coords) {
        queryParams.lng = coords[0];
        queryParams.lat = coords[1];
      } else {
        // Fallback if browser GPS is loading/blocked
        queryParams.lng = 79.8612;
        queryParams.lat = 6.9271;
      }
    } else if (searchDistrict && DISTRICT_COORDS[searchDistrict]) {
      queryParams.lng = DISTRICT_COORDS[searchDistrict][0];
      queryParams.lat = DISTRICT_COORDS[searchDistrict][1];
    }

    fetchProviders(queryParams);
  }, [coords, radius, selectedCategory, searchDistrict]);

  // Render Map Markers & Zoom Center reactively
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Focus center coordinates
    let focusLatLng = [6.9271, 79.8612]; // Colombo Default
    if (searchDistrict && DISTRICT_COORDS[searchDistrict]) {
      focusLatLng = [DISTRICT_COORDS[searchDistrict][1], DISTRICT_COORDS[searchDistrict][0]];
    } else if (coords) {
      focusLatLng = [coords[1], coords[0]];
    }

    mapRef.current.setView(focusLatLng, searchDistrict ? 11 : 8);

    // Plot Blue Search Center point if specific area is chosen
    if (searchDistrict === 'gps' && coords) {
      const searchCenterIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
          <div class="absolute h-8 w-8 rounded-full bg-blue-500/25 animate-pulse"></div>
          <div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
        </div>`,
        className: 'search-center-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const centerMarker = L.marker([coords[1], coords[0]], { icon: searchCenterIcon })
        .addTo(mapRef.current)
        .bindPopup('<div style="color: #020617; font-weight: bold; font-size:11px; font-family:sans-serif;">Your GPS Location</div>');
      markersRef.current.push(centerMarker);
    } else if (searchDistrict && DISTRICT_COORDS[searchDistrict]) {
      const searchCenterIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
          <div class="absolute h-8 w-8 rounded-full bg-blue-500/25 animate-pulse"></div>
          <div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
        </div>`,
        className: 'search-center-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const centerMarker = L.marker([DISTRICT_COORDS[searchDistrict][1], DISTRICT_COORDS[searchDistrict][0]], { icon: searchCenterIcon })
        .addTo(mapRef.current)
        .bindPopup(`<div style="color: #020617; font-weight: bold; font-size:11px; font-family:sans-serif;">Center of ${searchDistrict}</div>`);
      markersRef.current.push(centerMarker);
    }

    // Plot Provider Marker Pins
    providers.forEach(p => {
      if (p.userId?.location?.coordinates) {
        const [lng, lat] = p.userId.location.coordinates;

        // Custom animated amber marker icon
        const customIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute h-8 w-8 rounded-full bg-amber-500/35 animate-ping"></div>
            <div class="h-4 w-4 rounded-full bg-amber-500 border-2 border-slate-950 shadow-md"></div>
          </div>`,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="bg-slate-950 text-white p-3 rounded-xl text-xs font-sans min-w-[160px] border border-slate-800 shadow-2xl">
              <strong class="text-sm block font-black text-amber-400">${p.userId.name}</strong>
              <span class="text-slate-400 block mt-0.5">${p.serviceCategories?.[0]?.name || 'Service Provider'}</span>
              <strong class="text-white block mt-1.5">LKR ${p.hourlyRate}/hr</strong>
              <a href="/providers/${p.userId?._id}" class="mt-2 block text-center py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition text-[10px]">
                View Profile & Book
              </a>
            </div>
          `, {
            className: 'custom-leaflet-popup',
            closeButton: false
          });

        markersRef.current.push(marker);
      }
    });
  }, [providers, searchDistrict, coords]);

  const handleSearchReset = () => {
    setRadius(25);
    setSelectedCategory('');
    setSearchDistrict('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            QuickServe.lk
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold hover:text-amber-400 transition">
              Home
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Filters and List panel (Col span 7) */}
        <section className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-black text-white">Find Service Providers</h1>
            <p className="text-slate-400 text-sm mt-1">Showing verified plumbers, electricians, tutors, and handypersons near you.</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="">All Services</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Search District</label>
              <select
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="">All Districts (Sri Lanka)</option>
                <option value="gps">My Proximity (GPS)</option>
                {Object.keys(DISTRICT_COORDS).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Search Radius ({radius} km)</label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <button
              onClick={handleSearchReset}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer self-stretch sm:self-auto"
            >
              Reset Filters
            </button>
          </div>

          {/* Loading States */}
          {(loading || loadingGeo) ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {providers.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-slate-500">
                  No service providers found within {radius}km of your location. Try expanding the search radius!
                </div>
              ) : (
                providers.map((provider) => (
                  <div
                    key={provider._id}
                    className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl hover:border-slate-700/80 transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 text-amber-400 text-xl font-bold uppercase overflow-hidden">
                        {provider.userId?.profileImage ? (
                          <img src={provider.userId.profileImage} alt="" className="object-cover w-full h-full" />
                        ) : (
                          provider.userId?.name?.charAt(0) || 'P'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{provider.userId?.name}</h3>
                          {provider.isApproved && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-450 mt-0.5">
                          {provider.serviceCategories?.map((c) => c.name).join(', ') || 'General Handyperson'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📍 {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} km away` : (provider.city ? `${provider.city}, ${provider.district}` : `${provider.district || 'Colombo'}`)} • {provider.experienceYears} yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-3 sm:gap-1.5 w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-4 sm:pt-0 justify-between">
                      <div>
                        <span className="text-slate-400 text-xs sm:block text-right">Hourly Rate</span>
                        <span className="text-white font-black text-xl">LKR {provider.hourlyRate}</span>
                        <span className="text-slate-500 text-xs">/hr</span>
                      </div>
                      
                      <Link
                        to={`/providers/${provider.userId?._id || provider.userId}`}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-550 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/10"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Real Interactive Leaflet Map Column */}
        <section className="lg:col-span-5 h-[350px] lg:h-[calc(100vh-160px)] sticky top-24 rounded-3xl bg-slate-900 border border-slate-850 overflow-hidden relative shadow-2xl z-10">
          <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#090d16' }}></div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-8">
        <p>© 2026 QuickServe.lk. Realtime proximity mapping interface.</p>
      </footer>
    </div>
  );
};

export default Search;
