import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Layers, 
  Briefcase 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { createQuoteRequest, fetchQuotes } from '../../lib/api';
import { QuoteRequest } from '../../types';

interface QuotesPageProps {
  navigate: (path: string) => void;
  initialNotes?: string;
}

export const QuotesPage: React.FC<QuotesPageProps> = ({ navigate, initialNotes }) => {
  const { profile, storeSettings } = useStore();
  const [customerName, setCustomerName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [projectType, setProjectType] = useState('Residential 2BHK/3BHK');
  const [materialsNeeded, setMaterialsNeeded] = useState(initialNotes || '');
  const [siteLocation, setSiteLocation] = useState('Hospet / Vijayanagar Region');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    loadUserQuotes();
  }, [phone]);

  const loadUserQuotes = async () => {
    if (!phone) return;
    setLoadingQuotes(true);
    try {
      const data: any[] = await fetchQuotes();
      const filtered = data.filter((q: any) => (q.customerPhone === phone || q.customer?.phone === phone));
      setQuotes(filtered);
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !materialsNeeded) return;

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        customerType: profile.customerType || 'Contractor',
        projectType,
        itemsDescription: materialsNeeded.trim(),
        siteLocation: siteLocation.trim()
      };

      const newQuote = await createQuoteRequest(payload);
      setSuccessMessage(`Quotation Request #${newQuote.id} registered successfully!`);
      setQuotes([newQuote, ...quotes]);
      setMaterialsNeeded('');
    } catch (err: any) {
      console.error('Quote submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          B2B Trade & Contractor Desk
        </span>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          Contractor Bulk Quotation Portal
        </h1>
        <p className="text-xs text-slate-500">
          Get project pricing for full truckload plywood, solid timber lots, and institutional hardware for Hospet and Vijayanagar sites.
        </p>
      </div>

      {successMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage} Our Hospet wholesale manager will call you shortly with net project rates.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Quote Request Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Submit Project Material List
            </h3>
            <span className="text-[11px] font-semibold text-amber-700">
              Direct counter wholesale pricing
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contractor / Firm Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Builders & Interiors"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Number (10 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9845012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. anand@contractor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Residential 2BHK/3BHK">Residential Apartment / House</option>
                  <option value="Commercial Office">Commercial Office / Showroom</option>
                  <option value="Independent Villa">Independent Villa / Bungalow</option>
                  <option value="Hotel / Resort">Hotel / Resort / Hospitality</option>
                  <option value="School / College">Institution / School</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Project Site Location in Hospet / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Near College Road, Hospet or TB Dam Road"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                List Required Materials & Estimated Quantities <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. 
- 60 sheets 18mm Century Sainik 710 Plywood
- 25 sheets 12mm Greenply BWP
- 12 sets Europa mortise locks (SS 304)
- 40 pairs 5x3x3mm SS ball bearing hinges
- 50kg Fevicol Marine"
                value={materialsNeeded}
                onChange={(e) => setMaterialsNeeded(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="submit-quote-btn"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Quote Request...' : 'Send Request to Welcome Hardware Commercial Desk'}</span>
            </button>
          </form>

        </div>

        {/* Benefits & History Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Perks card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-black uppercase tracking-tight text-white border-b border-slate-800 pb-3">
              Why Welcome Hardware for Contractors?
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">100% Genuine Branded Plywood</h4>
                  <p className="text-slate-400 text-[11px]">Direct dealer for CenturyPly, Greenply, and Kitply with warranty certificates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Institutional Tier Discounts</h4>
                  <p className="text-slate-400 text-[11px]">Slab-based tiered pricing for full truckloads or multi-unit apartment complexes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Priority Counter Handover</h4>
                  <p className="text-slate-400 text-[11px]">Staged and bundled ahead of time so your transport auto doesn't wait at Hampi Road.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Direct Contractor Line:</span>
              <a href={`tel:${storeSettings.phone}`} className="font-bold text-amber-400 hover:underline">
                {storeSettings.phone}
              </a>
            </div>
          </div>

          {/* Past Quotes for this phone */}
          {quotes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-2">
                Your Submitted Project Quotes ({quotes.length})
              </h3>
              <div className="space-y-2 text-xs">
                {quotes.map(q => (
                  <div key={q.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{q.projectType}</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                        {q.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{q.itemsDescription}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Submitted on {new Date(q.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
