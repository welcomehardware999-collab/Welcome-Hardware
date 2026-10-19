import React from 'react';
import { DoorClosed, Sparkles, ArrowRight, ShieldCheck, CheckCircle, Sliders, Layers } from 'lucide-react';

interface BuildYourDoorBannerProps {
  onStart: () => void;
}

export const BuildYourDoorBanner: React.FC<BuildYourDoorBannerProps> = ({ onStart }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/80 relative overflow-hidden my-8">
      {/* Visual background accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left text column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Selection Assistant</span>
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Welcome Hardware Hospet
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400">🚪</span> BUILD YOUR DOOR
            </h2>
            <p className="text-base sm:text-lg text-amber-200/90 font-bold">
              Find the Right Door Hardware in 5 Simple Steps
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
            Not sure what fittings you need? Tell us your door type, material, and dimensions. Our smart hardware assistant instantly matches compatible Godrej/Europa locks, SS hinges, handles, and closers from our Hospet inventory.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Smart compatibility</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Accurate hinge counts</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>1-Click Add to Cart</span>
            </div>
          </div>
        </div>

        {/* Right CTA column */}
        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center space-y-3">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-2xl transition shadow-xl ring-4 ring-amber-400/30 flex items-center justify-center gap-3 group"
          >
            <span>START DOOR BUILDER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-[11px] text-slate-400 font-medium">
            Takes under 60 seconds • No account needed
          </span>
        </div>
      </div>
    </div>
  );
};
