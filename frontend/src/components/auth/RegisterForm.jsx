import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const RegisterForm = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(initialRole === 'provider' ? 'provider' : 'customer');
  const [coordinates, setCoordinates] = useState([79.8612, 6.9271]); // Colombo default
  
  const { register, error, clearError, loading } = useAuthStore();
  const navigate = useNavigate();

  // Try to acquire browser geolocation upon mounting
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
        },
        (err) => {
          console.log('Using default coordinates (Colombo):', err.message);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const data = await register({
        name,
        email,
        password,
        phone,
        role,
        coordinates,
      });

      // Redirect to correct dashboard on success
      if (role === 'provider') {
        navigate('/dashboard/provider', { replace: true });
      } else {
        navigate('/dashboard/customer', { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Role Selector Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          I want to register as a:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 rounded-xl border text-sm font-bold transition ${
              role === 'customer'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-3 rounded-xl border text-sm font-bold transition ${
              role === 'provider'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Service Provider
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 transition"
          placeholder="E.g. Amal Perera"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 transition"
          placeholder="amal@gmail.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 transition"
          placeholder="E.g. +94771234567"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 transition"
          placeholder="At least 6 characters"
          minLength={6}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
