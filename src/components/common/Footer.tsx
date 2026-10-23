import React from 'react';
import { MapPin, Phone, Clock, Mail, Download, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PWAInstallButton } from './PWAInstallButton';
import { getAssetUrl, LOGO_URL } from '../../lib/assets';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Pickup Guarantee Banner */}
      <div className="bg-amber-600 text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide uppercase">Direct Physical Store In-Stock Guarantee</h4>
              <p className="text-xs text-amber-100">Every item in our catalogue is stocked and staged at our physical store on Hampi Road.</p>
            </div>
          </div>
          <a
            href={`tel:${storeSettings.phone}`}
            id="footer-call-store-action"
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs tracking-wider transition flex items-center gap-2 shrink-0 border border-amber-500/40"
          >
            <Phone className="w-4 h-4 fill-amber-400" />
            <span>CALL STORE: {storeSettings.phone}</span>
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Store Brand & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={getAssetUrl(storeSettings.logoUrl) || LOGO_URL} 
                alt="Welcome Hardware" 
                className="w-12 h-12 object-contain shrink-0 rounded-full shadow-md bg-white p-0.5 border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-base font-black tracking-tight text-white uppercase">Welcome Hardware</h3>
                <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">Hospet-Vijayanagar</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Leading hardware, plywood, wood, and architectural fittings supplier serving contractors, carpenters, builders, and homeowners across the Hospet & Vijayanagar region.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-200 font-semibold">{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${storeSettings.phone}`} className="text-slate-200 hover:text-amber-400 font-bold">
                  {storeSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-300">{storeSettings.openingHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-300">{storeSettings.email}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Hardware Catalogue
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => navigate('/shop?category=Plywood')} className="hover:text-amber-400 transition">
                  Plywood (BWP, MR, Marine Grade)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Wood')} className="hover:text-amber-400 transition">
                  Wood & Boards (Teak, Sal, HDHWR)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Door+Fittings')} className="hover:text-amber-400 transition">
                  Door Fittings (Locks, Aldrops, Hinges)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Furniture+Fittings')} className="hover:text-amber-400 transition">
                  Furniture Fittings (Telescopic, Blum, Ebco)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Architectural+Hardware')} className="hover:text-amber-400 transition">
                  Architectural Hardware (Glass Patch, Pulls)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Adhesives')} className="hover:text-amber-400 transition">
                  Adhesives & Chemicals (Fevicol SH, Silicone)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?category=Tools')} className="hover:text-amber-400 transition">
                  Power Tool Blades & Screws
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Smart Tools & Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Tools & Trades
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => navigate('/calculators')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  <span>Plywood Sheet Calculator</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/calculators')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  <span>Timber CFT (Cubic Feet) Calculator</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/door-fitting')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Door Fitting Bundle Recommender</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contractor')} className="hover:text-amber-400 transition">
                  Contractor & Carpenter Zone
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/quotes')} className="hover:text-amber-400 transition">
                  Request Bulk Quotation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/orders')} className="hover:text-amber-400 transition">
                  Track Order & Pickup PIN
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Pickup & App Install */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
              Store Pickup
            </h4>
            <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-amber-400">How Store Pickup Works:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>Order & reserve stock online</li>
                <li>Receive your 4-digit PIN & QR code</li>
                <li>Visit our Hampi Road counter</li>
                <li>Show PIN / QR & collect items</li>
              </ol>
            </div>

            <div className="pt-2">
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-400">Welcome Hardware</strong>. All rights reserved. Hampi Road, Hospet-Vijayanagar.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>GSTIN: 29AAEFH9986F1ZM</span>
            <span>•</span>
            <span>Direct Counter Pickup</span>
            <span>•</span>
            <button onClick={() => navigate('/store-info')} className="hover:text-amber-400">
              Store Location
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
