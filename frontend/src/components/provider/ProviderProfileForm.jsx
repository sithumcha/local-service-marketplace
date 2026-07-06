import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const ProviderProfileForm = ({ initialData, onSuccess }) => {
  const [bio, setBio] = useState(initialData?.bio || '');
  const [experienceYears, setExperienceYears] = useState(initialData?.experienceYears || 0);
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || 1000);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.serviceCategories?.map(c => c._id || c) || []
  );
  const [district, setDistrict] = useState(initialData?.district || 'Colombo');
  const [city, setCity] = useState(initialData?.city || '');
  const [longitude, setLongitude] = useState(initialData?.userId?.location?.coordinates?.[0] || 79.8612);
  const [latitude, setLatitude] = useState(initialData?.userId?.location?.coordinates?.[1] || 6.9271);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGPSAutofill = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLongitude(position.coords.longitude);
          setLatitude(position.coords.latitude);
          setLocLoading(false);
        },
        (err) => {
          alert('Failed to resolve GPS coordinates: ' + err.message);
          setLocLoading(false);
        }
      );
    } else {
      alert('Browser geolocation is not supported');
      setLocLoading(false);
    }
  };


  
  // Availability setup
  const [availability, setAvailability] = useState(
    initialData?.availability || 
    DEFAULT_DAYS.map(day => ({ day, startTime: '08:00', endTime: '17:00', active: activeDay(day) }))
  );

  function activeDay(day) {
    if (initialData?.availability) {
      return initialData.availability.some(item => item.day === day);
    }
    return false;
  }

  useEffect(() => {
    api.get('/services')
      .then(res => {
        if (res.data && res.data.success) {
          setCategories(res.data.services || []);
        }
      })
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleTimeChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleActiveToggle = (index) => {
    const updated = [...availability];
    updated[index].active = !updated[index].active;
    setAvailability(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Format active availability
    const activeAvailability = availability
      .filter(item => item.active)
      .map(({ day, startTime, endTime }) => ({ day, startTime, endTime }));

    if (activeAvailability.length === 0) {
      setError('Please select at least one day of availability');
      setLoading(false);
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one service category that you offer');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        bio,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        availability: activeAvailability,
        serviceCategories: selectedCategories,
        coordinates: [Number(longitude), Number(latitude)],
        district,
        city,
      };



      const res = await api.post('/providers/profile', payload);
      if (res.data.success) {
        onSuccess(res.data.profile);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save provider profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white">Setup Your Provider Profile</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tell clients about your expertise, experience, and hourly pricing in LKR.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Bio */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Professional Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          required
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
          placeholder="E.g. Experienced electrician with over 5 years of experience in domestic and commercial wiring in Colombo..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Experience Years */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Hourly Rate (LKR / hr)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition"
            placeholder="E.g. 1500"
          />
        </div>
      </div>

      {/* Service Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Service Categories Offered
        </label>
        <p className="text-slate-500 text-xs mb-3">Select the categories of services you provide.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat._id);
            return (
              <label
                key={cat._id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  isChecked
                    ? 'bg-amber-500/10 border-amber-500/30 text-white'
                    : 'bg-slate-950/50 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      setSelectedCategories(selectedCategories.filter(id => id !== cat._id));
                    } else {
                      setSelectedCategories([...selectedCategories, cat._id]);
                    }
                  }}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <div className="text-left">
                  <span className="font-bold text-sm block">{cat.name} {cat.icon}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{cat.category}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Service Area Location */}
      <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Service Coverage Location</h3>
          <p className="text-slate-500 text-xs mt-0.5">Specify your active district and nearest city for proximity searches.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">District</label>
            <select
              value={district}
              onChange={(e) => {
                const selectedDist = e.target.value;
                setDistrict(selectedDist);
                // Look up default coordinates to match district center
                const coords = DISTRICT_COORDS[selectedDist];
                if (coords) {
                  setLongitude(coords[0]);
                  setLatitude(coords[1]);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {Object.keys(DISTRICT_COORDS).map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nearest City / Town</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="E.g. Maharagama, Pannipitiya, Peradeniya"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-600"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-900">
          <button
            type="button"
            onClick={handleGPSAutofill}
            disabled={locLoading}
            className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {locLoading ? 'Detecting GPS...' : '📍 Fine-tune coordinates using Browser GPS'}
          </button>
          
          <div className="text-[10px] text-slate-500 text-right font-mono">
            Active GPS: [{longitude.toFixed(4)}, {latitude.toFixed(4)}]
          </div>
        </div>
      </div>



      {/* Availability */}

      <div>


        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Weekly Working Hours & Days
        </label>
        <p className="text-slate-500 text-xs mb-3">Select the days you are available to take bookings.</p>
        
        <div className="space-y-3">
          {availability.map((item, idx) => (
            <div key={item.day} className="flex flex-wrap items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-900">
              <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => handleActiveToggle(idx)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className={`text-sm ${item.active ? 'text-white font-semibold' : 'text-slate-500'}`}>{item.day}</span>
              </label>

              {item.active && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? 'Saving Profile...' : 'Save Profile & Go to Dashboard'}
      </button>
    </form>
  );
};

export default ProviderProfileForm;
