import React from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation, 
  Building2, 
  Mail 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoreInfoPageProps {
  navigate: (path: string) => void;
}

export const StoreInfoPage: React.FC<StoreInfoPageProps> = ({ navigate }) => {
  const { storeSettings } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>Physical Store Location</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
          Welcome Hardware HOSAPETE
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your premier destination for branded plywood and hardware, architectural ironmongery, and fittings in Vijayanagar district.
        </p>
      </div>

      {/* Grid: Store Contact Cards & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Address Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
            Store Address
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            {storeSettings.address}
          </p>
          <p className="text-[11px] text-slate-400">
            Near Theosophical Women's College, Hampi Road, HOSAPETE with wide vehicular access.
          </p>
          <a
            href="https://maps.google.com/?q=Welcome+Hardware+Near+Theosophical+Womens+College+Hampi+Road+HOSAPETE"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Operating Hours Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
            Store Hours
          </h3>
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Monday - Saturday:</span>
              <span className="font-bold text-slate-900">9:00 AM - 9:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Sunday:</span>
              <span className="font-bold text-amber-700">9:00 AM - 2:00 PM</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Online pickup orders placed during off-hours are prepared first thing next morning.
          </p>
        </div>

        {/* Helpline & Direct Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
            Counter Helpline
          </h3>
          <p className="text-xl font-mono font-black text-slate-950">
            {storeSettings.phone}
          </p>
          <p className="text-[11px] text-slate-500">
            Direct line to counter manager for timber sizes, plywood availability, or bulk quotes.
          </p>
          <a
            href={`tel:${storeSettings.phone}`}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition mt-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Store Directly</span>
          </a>
        </div>

      </div>

      {/* 5-Step In-Store Pickup Protocol */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8">
        <div className="max-w-xl space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
            Fast Counter Collection
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            How In-Store Pickup Works at Welcome Hardware
          </h2>
          <p className="text-xs text-slate-400">
            Engineered to save carpenters and contractors valuable time on site.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs">1</span>
            <h4 className="font-bold text-slate-100 text-sm">Order & Reserve Online</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Select exact plywood sheets, wood sections, or locks. Physical stock is immediately deducted from availability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs">2</span>
            <h4 className="font-bold text-slate-100 text-sm">Receive 4-Digit PIN & QR</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An instant pickup pass with a secure 4-digit PIN is generated and tied to your order.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs">3</span>
            <h4 className="font-bold text-slate-100 text-sm">Staff Stages Materials</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Our warehouse team straps plywood bundles and prepares hardware kits at the dispatch staging dock.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs">4</span>
            <h4 className="font-bold text-slate-100 text-sm">Arrive with Vehicle</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Drive your auto, pickup van, or bike directly into our Hampi Road bay. Provide your PIN for instant loading!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
