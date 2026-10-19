import React from 'react';
import { 
  Building2, 
  Layers, 
  Calculator, 
  Percent, 
  PackageCheck, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  FileText 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ContractorPageProps {
  navigate: (path: string) => void;
}

export const ContractorPage: React.FC<ContractorPageProps> = ({ navigate }) => {
  const { storeSettings } = useStore();

  const kits = [
    {
      id: 'kit-2bhk',
      title: 'Standard 2BHK Interior Plywood & Fitting Package',
      description: 'Everything needed for wardrobes, TV unit, kitchen carcass, and internal doors.',
      estimatedBudget: '₹1,45,000 - ₹1,85,000',
      items: [
        '35 Sheets 18mm Century Sainik 710 Plywood',
        '18 Sheets 12mm Greenply BWP',
        '8 Sheets 6mm Backing Plywood',
        '50 Kg Fevicol Marine Adhesive',
        '24 Pairs Hettich Soft Close Concealed Hinges',
        '8 Sets Ebco Soft Close Telescopic Drawer Channels'
      ],
      tag: 'Most Popular'
    },
    {
      id: 'kit-kitchen',
      title: 'Modular Kitchen Heavy Hardware Pack',
      description: 'Commercial grade kitchen fittings, SS baskets, and soft-close channels.',
      estimatedBudget: '₹38,000 - ₹55,000',
      items: [
        '12 Sets Soft-Close Tandem Drawer Boxes',
        '18 Pairs Hettich 110° Soft-Close Hinges',
        '1 Set Ebco Magic Corner / Carousel Unit',
        '2 Sets Hydraulic Gas Springs for Overhead Cabinets',
        'SS 304 Cutlery and Thali Wire Baskets'
      ],
      tag: 'High Demand'
    },
    {
      id: 'kit-doors',
      title: 'Complete Villa / Flat Door Ironmongery Kit (8 Doors)',
      description: 'Architectural handles, Europa locks, and bearing hinges for 1 main + 5 bedrooms + 2 toilets.',
      estimatedBudget: '₹22,500 - ₹32,000',
      items: [
        '1 Europa Diamond Disc Main Door Mortise Set (Brass)',
        '5 Europa / Godrej Bedroom Mortise Handle Locks',
        '2 SS 304 Privacy Bathroom Cylindrical Locks',
        '24 Pairs SS 304 5"x3"x3mm Ball Bearing Hinges',
        '8 Heavy Duty Magnetic Door Stoppers'
      ],
      tag: 'Turnkey Door Kit'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-8 sm:p-12 overflow-hidden border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-3 py-1 rounded-full">
            Welcome Hardware Trade Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Contractor, Builder & Carpenter Zone
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome Hardware has partnered with local Hospet and Vijayanagar contractors for over two decades. Access volume wholesale discounts, priority staged pickup, and guaranteed brand authenticity.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate('/quotes')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition"
            >
              Submit Site Material List
            </button>
            <button
              onClick={() => navigate('/calculators')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-5 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Use Plywood & CFT Calculators</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tiered Discount Slabs */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Transparent Volume Wholesale Slabs
          </h2>
          <p className="text-xs text-slate-500">
            Discounts applied automatically on in-store pickup orders or custom quotations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Tier 1</span>
              <span className="text-2xl font-black font-mono text-amber-600">5% OFF</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Site Starter Slab</h3>
            <p className="text-xs text-slate-500">Orders above ₹25,000 or 10+ plywood sheets.</p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free strapping & bundling</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Express 2-hour staging</li>
            </ul>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-6 border-2 border-amber-500 shadow-md space-y-3 relative">
            <span className="absolute -top-3 right-4 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Popular for 2BHK/3BHK
            </span>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Tier 2</span>
              <span className="text-2xl font-black font-mono text-amber-700">10% OFF</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Professional Contractor</h3>
            <p className="text-xs text-slate-500">Orders above ₹1,00,000 or 30+ plywood sheets.</p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2 border-t border-amber-200">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Net wholesale contractor billing</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Direct vehicle bay loading assistance</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Dedicated trade counter representative</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Tier 3</span>
              <span className="text-2xl font-black font-mono text-slate-900">Custom Net</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Commercial / Multi-Unit</h3>
            <p className="text-xs text-slate-500">Full truckloads (80+ sheets) or entire residential complexes.</p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Factory-direct shipment options</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Flexible phased supply staging</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pre-Engineered Turnkey Kits */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Turnkey Project Material Packages
          </h2>
          <p className="text-xs text-slate-500">
            Commonly specified bills of materials for carpenters and interior contractors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kits.map(kit => (
            <div key={kit.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {kit.tag}
                </span>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {kit.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {kit.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Includes:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {kit.items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Est. Material Cost:</span>
                  <span className="text-base font-black font-mono text-slate-900">{kit.estimatedBudget}</span>
                </div>
                <button
                  onClick={() => navigate(`/quotes?notes=Interested in quotation for: ${kit.title}`)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request Package Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Immediate Helpline CTA */}
      <div className="rounded-2xl bg-amber-500 text-slate-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Urgent Timber or Plywood Requirements on Site?
          </h3>
          <p className="text-xs sm:text-sm text-slate-900">
            Call Welcome Hardware direct at <strong className="text-slate-950 font-black">{storeSettings.phone}</strong> for instant stock checks and reservation.
          </p>
        </div>

        <a
          href={`tel:${storeSettings.phone}`}
          className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xl transition flex items-center gap-2 shrink-0"
        >
          <Phone className="w-4 h-4 fill-white" />
          <span>Call 9986544516 Now</span>
        </a>
      </div>

    </div>
  );
};
