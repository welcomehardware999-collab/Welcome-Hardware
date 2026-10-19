import React, { useState } from 'react';
import { User, Phone, Mail, Building2, FileText, CheckCircle2, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerType } from '../../types';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { profile, updateProfile } = useStore();

  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [customerType, setCustomerType] = useState<CustomerType>(profile.customerType || 'Contractor');
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [gstNumber, setGstNumber] = useState(profile.gstNumber || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      email,
      customerType,
      businessName,
      gstNumber
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Customer & Trade Profile
        </h1>
        <p className="text-xs text-slate-500">
          Save your contact and contractor details for fast 1-click in-store pickup orders and GST invoicing
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile saved successfully! Details will auto-fill during checkout.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Anand Kumar"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Mobile (10 digits)</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. 9845012345"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. anand@example.com"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Trade Designation</label>
            <select
              value={customerType}
              onChange={(e: any) => setCustomerType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Contractor">Civil / Interior Contractor</option>
              <option value="Carpenter">Carpenter / Craftsman</option>
              <option value="Builder">Builder / Real Estate Developer</option>
              <option value="Architect">Architect / Interior Designer</option>
              <option value="Retail Customer">Retail Homeowner</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Firm / Studio Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Vijayanagar Wood Arts"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
              placeholder="e.g. 29AAAAA0000A1Z5"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            View My Pickup Orders →
          </button>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

    </div>
  );
};
