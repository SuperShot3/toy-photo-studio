import React from 'react';
import { Camera, Sparkles, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                Toy Photo Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200/60">
                MVP v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Turn ordinary phone snapshots into studio product images
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">1:1 Subject Geometry Preserved</span>
            <span className="sm:hidden">Preserved</span>
          </div>
        </div>
      </div>
    </header>
  );
};

