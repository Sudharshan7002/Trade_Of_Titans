import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display font-black text-4xl text-slate-950 dark:text-white">404 Sector Unknown</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The requested coordinate does not exist in the Trade of Titans operational database.
        </p>
      </div>
      <Link
        to="/"
        className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Command Console</span>
      </Link>
    </div>
  );
};
