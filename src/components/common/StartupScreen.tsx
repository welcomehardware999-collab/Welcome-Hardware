import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

interface StartupScreenProps {
  onComplete: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onComplete, 350);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          id="startup-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-slate-900 select-none py-10 px-6 overflow-y-auto"
        >
          {/* Top subtle spacing */}
          <div className="w-full max-w-md flex justify-center pt-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Welcome Hardware • Store Pickup Counter
            </span>
          </div>

          {/* Center: Exact Existing WELCOME HARDWARE Logo & Brand Identity */}
          <motion.div 
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center text-center max-w-lg w-full space-y-6 my-auto"
          >
            {/* Exact Existing Official Logo Asset */}
            <div className="relative p-3 bg-white rounded-full shadow-2xl border border-slate-200/90">
              <img
                src="/welcome-hardware-logo.svg"
                alt="Welcome Hardware"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-full bg-white"
              />
            </div>

            {/* Business Title & Location */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-950">
                Welcome Hardware
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-amber-700 tracking-wide uppercase">
                Plywood and Hardware & Architectural Fittings
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 max-w-sm mx-auto pt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Near Theosophical Women's College, Hampi Road, HOSAPETE</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-0.5">
                <Phone className="w-3 h-3 text-amber-600 shrink-0" />
                <span>9986544516 • 9986125297</span>
              </div>
            </div>

            {/* Prominent Mandatory CONTINUE Button */}
            <div className="pt-4 w-full max-w-xs sm:max-w-sm">
              <button
                type="button"
                id="startup-continue-btn"
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-black text-sm sm:text-base uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-900/20 transition cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>

          {/* Bottom Footer Details */}
          <div className="text-center pt-4">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Direct In-Store Pickup • Hosapete
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
