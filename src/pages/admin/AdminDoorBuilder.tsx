import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BarChart3, 
  Sliders, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  Save, 
  RotateCcw, 
  ExternalLink,
  Info,
  Clock,
  Check,
  DoorClosed
} from 'lucide-react';
import { 
  getAdminDoorRules, 
  saveAdminDoorRules, 
  resetAdminDoorRules, 
  DEFAULT_HARDWARE_TYPES,
  DoorTypeProfile
} from '../../lib/doorConfigAdmin';
import { 
  getDoorAnalyticsSummary, 
  clearDoorAnalyticsEvents 
} from '../../lib/analytics';
import { DoorType, RecommendationTier, HardwareCategory } from '../../types';

export const AdminDoorBuilder: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'rules' | 'hardware'>('analytics');
  const [analytics, setAnalytics] = useState(getDoorAnalyticsSummary());
  const [rules, setRules] = useState<Record<DoorType, DoorTypeProfile>>(getAdminDoorRules());
  const [selectedDoorType, setSelectedDoorType] = useState<DoorType>('Main Entrance Door');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setAnalytics(getDoorAnalyticsSummary());
  }, []);

  const handleSaveRules = () => {
    saveAdminDoorRules(rules);
    setStatusMessage('Door configuration rules saved successfully!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all door hardware recommendation rules to factory defaults?')) {
      const def = resetAdminDoorRules();
      setRules(def);
      setStatusMessage('Rules reset to Welcome Hardware factory defaults.');
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleClearAnalytics = () => {
    if (window.confirm('Clear recorded analytics events?')) {
      clearDoorAnalyticsEvents();
      setAnalytics(getDoorAnalyticsSummary());
      setStatusMessage('Analytics history cleared.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const currentProfile = rules[selectedDoorType] || rules['Main Entrance Door'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Engine Management
            </span>
            <span className="text-xs text-slate-500 font-bold">Welcome Hardware Hospet</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Build Your Door • Rules & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure smart recommendation algorithms, component tiers, and track customer conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/build-your-door')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <span>Launch Customer View</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Analytics & Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'rules'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Recommendation Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'hardware'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span>Hardware Definitions</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & FUNNEL */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Wizard Starts
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {analytics.totalStarts}
              </p>
              <span className="text-[10px] text-slate-500">Customer initiated</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Completions
              </span>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                {analytics.totalCompletions}
              </p>
              <span className="text-[10px] text-slate-500">Generated plan</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Conversion Rate
              </span>
              <p className="text-2xl font-black text-amber-600 font-mono">
                {analytics.conversionRate}%
              </p>
              <span className="text-[10px] text-slate-500">Completion ratio</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cart Additions
              </span>
              <p className="text-2xl font-black text-blue-600 font-mono">
                {analytics.productsAdded}
              </p>
              <span className="text-[10px] text-slate-500">Items converted</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quotes Requested
              </span>
              <p className="text-2xl font-black text-purple-600 font-mono">
                {analytics.quotesRequested}
              </p>
              <span className="text-[10px] text-slate-500">B2B / Multi-door</span>
            </div>
          </div>

          {/* Recent Event Stream */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                  Real-Time Event Feed
                </h3>
                <p className="text-xs text-slate-500">
                  Live interaction logs captured from the customer door selection assistant
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnalytics(getDoorAnalyticsSummary())}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs"
                  title="Refresh events"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearAnalytics}
                  className="text-xs text-slate-400 hover:text-rose-600 font-bold px-2 py-1"
                >
                  Clear Log
                </button>
              </div>
            </div>

            {analytics.recentEvents.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No events recorded yet. Try running through the customer wizard at /build-your-door!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {analytics.recentEvents.map(evt => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 font-mono">
                        {evt.event.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        {evt.doorType && <span>Door: {evt.doorType}</span>}
                        {evt.material && <span>• {evt.material}</span>}
                        {evt.totalValue && <span>• ₹{evt.totalValue}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECOMMENDATION RULES CONFIGURATION */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Door Profile & Recommendation Rules
              </h3>
              <p className="text-xs text-slate-500">
                Customize default hardware packages and tier requirements for each door category.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Reset Defaults
              </button>
              <button
                onClick={handleSaveRules}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save All Rules</span>
              </button>
            </div>
          </div>

          {/* Door Selector Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-100 pb-4">
            {(Object.keys(rules) as DoorType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedDoorType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDoorType === type
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Active Profile Editor */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Profile Title
                </label>
                <input
                  type="text"
                  value={currentProfile.title}
                  onChange={(e) => {
                    setRules(prev => ({
                      ...prev,
                      [selectedDoorType]: { ...currentProfile, title: e.target.value }
                    }));
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Recommended Hinge Count
                </label>
                <input
                  type="number"
                  value={currentProfile.recommendedHingeCount}
                  onChange={(e) => {
                    setRules(prev => ({
                      ...prev,
                      [selectedDoorType]: { ...currentProfile, recommendedHingeCount: parseInt(e.target.value) || 0 }
                    }));
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Description / Application
              </label>
              <textarea
                rows={2}
                value={currentProfile.description}
                onChange={(e) => {
                  setRules(prev => ({
                    ...prev,
                    [selectedDoorType]: { ...currentProfile, description: e.target.value }
                  }));
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            {/* Hardware Tier Mappings */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Default Hardware Classification for this Door Type
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEFAULT_HARDWARE_TYPES.map(hw => {
                  const currentTier = currentProfile.defaultTierMappings[hw.id] || 'OPTIONAL';
                  const isIncluded = currentProfile.defaultHardware.includes(hw.id);

                  return (
                    <div
                      key={hw.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {hw.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...currentProfile.defaultHardware, hw.id]
                              : currentProfile.defaultHardware.filter(h => h !== hw.id);
                            setRules(prev => ({
                              ...prev,
                              [selectedDoorType]: { ...currentProfile, defaultHardware: next }
                            }));
                          }}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                        />
                      </div>

                      {/* Tier Selector */}
                      <div className="flex items-center gap-1">
                        {(['REQUIRED', 'RECOMMENDED', 'OPTIONAL'] as const).map(tier => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => {
                              setRules(prev => ({
                                ...prev,
                                [selectedDoorType]: {
                                  ...currentProfile,
                                  defaultTierMappings: {
                                    ...currentProfile.defaultTierMappings,
                                    [hw.id]: tier
                                  }
                                }
                              }));
                            }}
                            className={`flex-1 py-1 text-[9px] font-bold rounded transition ${
                              currentTier === tier
                                ? tier === 'REQUIRED'
                                  ? 'bg-rose-600 text-white'
                                  : tier === 'RECOMMENDED'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-slate-700 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveRules}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Changes to Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HARDWARE DEFINITIONS */}
      {activeTab === 'hardware' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Hardware Types & Customer Educational Helper Copy
            </h3>
            <p className="text-xs text-slate-500">
              Plain-language descriptions explaining "What is this?" to everyday customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_HARDWARE_TYPES.map(hw => (
              <div key={hw.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    {hw.label}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                    Group: {hw.categoryGroup}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {hw.beginnerHelper}
                </p>
                <span className="text-[10px] text-amber-800 font-bold block pt-1">
                  Default Std Quantity: {hw.standardQuantity} unit(s)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
