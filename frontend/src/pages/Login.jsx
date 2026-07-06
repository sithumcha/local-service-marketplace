import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            QuickServe.lk
          </Link>
          <h2 className="text-xl font-bold text-white mt-4">Welcome Back</h2>
          <p className="text-sm text-slate-450 mt-1">Please enter your credentials to access your account.</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-slate-455 border-t border-slate-800/85 pt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 font-bold hover:text-amber-350 transition">
            Register as Customer / Provider
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
