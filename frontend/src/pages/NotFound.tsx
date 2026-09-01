import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display font-black text-4xl text-white">404 Sector Unknown</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested coordinate does not exist in the Trade of Titans operational database.
        </p>
      </div>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-titan-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-glow-cyan"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Command Console</span>
      </Link>
    </div>
  );
};
