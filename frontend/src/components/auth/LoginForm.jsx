import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirect path is set in router state, go there, otherwise go to home / role dashboard
  const from = location.state?.from?.pathname || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const data = await login({ email, password });
      
      // Determine default route by role if "from" is not set
      if (from) {
        navigate(from, { replace: true });
      } else {
        const role = data.user.role;
        if (role === 'admin') navigate('/dashboard/admin', { replace: true });
        else if (role === 'provider') navigate('/dashboard/provider', { replace: true });
        else navigate('/dashboard/customer', { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

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
          placeholder="name@example.com"
        />
      </div>

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
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
