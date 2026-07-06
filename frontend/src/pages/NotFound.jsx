import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4 text-center text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none"></div>
      
      <div className="z-10 animate-fade-in">
        <h1 className="text-9xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">404</h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl text-slate-200">
          පිටුව හමු නොවීය / Page Not Found
        </h2>
        <p className="mt-4 text-slate-400 max-w-md mx-auto">
          We couldn't find the service page you were searching for. It might have been moved or doesn't exist anymore.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.03] hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]"
          >
            ප්‍රධාන පිටුවට (Home)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
