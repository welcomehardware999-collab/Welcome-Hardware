import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Phone, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit, 
  Check, 
  X,
  IndianRupee
} from 'lucide-react';
import { fetchQuotes, updateQuoteStatus } from '../../lib/api';
import { QuoteRequest } from '../../types';
import { useAdmin } from '../../context/AdminContext';

export const AdminQuotes: React.FC = () => {
  const { currentRole } = useAdmin();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quotedAmount, setQuotedAmount] = useState<number | ''>('');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotes();
      setQuotes(data);
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (quoteId: string, status: QuoteRequest['status']) => {
    try {
      const updated = await updateQuoteStatus(
        quoteId, 
        status, 
        quoteNotes || undefined, 
        typeof quotedAmount === 'number' ? quotedAmount : undefined
      );
      setQuotes(quotes.map(q => q.id === quoteId ? updated : q));
      setSelectedQuote(null);
      setQuoteNotes('');
      setQuotedAmount('');
    } catch (err) {
      console.error('Failed to update quote:', err);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.customerName.toLowerCase().includes(s) ||
      q.customerPhone.includes(s) ||
      q.projectType.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Contractor Project Quotations Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review bills of materials submitted by Hospet builders, carpenters & contractors
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search Contractor Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Quotes Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
          Loading contractor quotes...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No contractor quote requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuotes.map(quote => (
            <div key={quote.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      QUOTE #{quote.id} • {new Date(quote.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      {quote.customerName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-800">{quote.customerPhone}</span>
                      <span>•</span>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold uppercase text-[10px]">
                        {quote.customerType}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    quote.status === 'Quoted'
                      ? 'bg-blue-100 text-blue-800'
                      : quote.status === 'Closed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {quote.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p className="text-slate-700"><strong>Project:</strong> {quote.projectType}</p>
                  {quote.siteLocation && (
                    <p className="text-slate-700"><strong>Site:</strong> {quote.siteLocation}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Requested Materials & Quantities:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line max-h-36 overflow-y-auto">
                    {quote.itemsDescription}
                  </div>
                </div>

                {quote.quotedAmount && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <span className="block font-bold">Estimated Quote Rate:</span>
                    <span className="text-lg font-black font-mono">₹{quote.quotedAmount.toLocaleString('en-IN')}</span>
                    {quote.notes && <p className="text-[11px] text-emerald-700 mt-1">{quote.notes}</p>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${quote.customerPhone}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call Contractor</span>
                </a>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setQuotedAmount(quote.quotedAmount || '');
                      setQuoteNotes(quote.notes || '');
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition"
                  >
                    Respond / Quote Price
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Response Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                Respond to Quote #{selectedQuote.id}
              </h3>
              <button onClick={() => setSelectedQuote(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contractor:</label>
                <p className="font-bold text-slate-900">{selectedQuote.customerName} ({selectedQuote.customerPhone})</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quoted Net Amount (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 145000"
                  value={quotedAmount}
                  onChange={(e) => setQuotedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes / Terms:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 50% advance on order, includes door delivery to Hampi site."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'Contacted')}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'Quoted')}
                  className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg"
                >
                  Save Quoted Rate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
