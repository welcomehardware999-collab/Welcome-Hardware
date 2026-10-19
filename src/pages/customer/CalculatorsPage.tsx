import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  ArrowRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShoppingCart, 
  FileText 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CalculatorsPageProps {
  navigate: (path: string) => void;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({ navigate }) => {
  const { addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<'plywood' | 'cft'>('plywood');

  // --- Plywood Calculator State ---
  const [pieces, setPieces] = useState([
    { lengthFt: 6, lengthIn: 0, widthFt: 3, widthIn: 0, qty: 2, label: 'Wardrobe Shutter' }
  ]);
  const [wastagePercent, setWastagePercent] = useState<number>(10);
  const [selectedThickness, setSelectedThickness] = useState('18mm');
  const [selectedBrandRate, setSelectedBrandRate] = useState<number>(99); // ₹99/sqft for 18mm BWP

  // --- Timber CFT Calculator State ---
  const [cftItems, setCftItems] = useState([
    { lengthFt: 7, widthIn: 4, thickIn: 3, qty: 4, label: 'Door Frame (Jambs)' },
    { lengthFt: 3.5, widthIn: 4, thickIn: 3, qty: 2, label: 'Door Frame (Head)' }
  ]);
  const [woodRatePerCft, setWoodRatePerCft] = useState<number>(3800); // CP Teak ₹3800/cft

  // Plywood Calculations
  const calculateTotalSqFt = () => {
    let totalSqIn = 0;
    for (const p of pieces) {
      const lengthInTotal = (Number(p.lengthFt) * 12) + Number(p.lengthIn);
      const widthInTotal = (Number(p.widthFt) * 12) + Number(p.widthIn);
      totalSqIn += (lengthInTotal * widthInTotal) * Number(p.qty);
    }
    const rawSqFt = totalSqIn / 144;
    const withWastage = rawSqFt * (1 + wastagePercent / 100);
    const standardSheetSqFt = 32; // 8ft x 4ft = 32 sqft
    const sheetsNeeded = Math.ceil(withWastage / standardSheetSqFt);
    const estimatedCost = Math.round(sheetsNeeded * standardSheetSqFt * selectedBrandRate);

    return {
      rawSqFt: Math.round(rawSqFt * 10) / 10,
      withWastage: Math.round(withWastage * 10) / 10,
      sheetsNeeded: Math.max(1, sheetsNeeded),
      estimatedCost
    };
  };

  const plyResult = calculateTotalSqFt();

  const addPiece = () => {
    setPieces([...pieces, { lengthFt: 4, lengthIn: 0, widthFt: 2, widthIn: 0, qty: 1, label: `Cabinet Part ${pieces.length + 1}` }]);
  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  // CFT Calculations
  // CFT = (Length in ft * Width in inches * Thickness in inches) / 144 * Qty
  const calculateTotalCft = () => {
    let totalCft = 0;
    for (const item of cftItems) {
      const cftSingle = (Number(item.lengthFt) * Number(item.widthIn) * Number(item.thickIn)) / 144;
      totalCft += cftSingle * Number(item.qty);
    }
    const roundedCft = Math.round(totalCft * 100) / 100;
    const totalWoodCost = Math.round(roundedCft * woodRatePerCft);

    return {
      totalCft: roundedCft,
      totalWoodCost
    };
  };

  const cftResult = calculateTotalCft();

  const addCftItem = () => {
    setCftItems([...cftItems, { lengthFt: 6, widthIn: 3, thickIn: 2, qty: 1, label: `Frame Rafter ${cftItems.length + 1}` }]);
  };

  const removeCftItem = (index: number) => {
    setCftItems(cftItems.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          Hardware Store Smart Utilities
        </span>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          Contractor & Carpenter Calculators
        </h1>
        <p className="text-xs text-slate-500">
          Accurate estimation for Plywood 8x4ft sheets and Timber Cubic Feet (CFT)
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab('plywood')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'plywood'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Plywood Sheet Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('cft')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'cft'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Wood / CFT Calculator</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: PLYWOOD CALCULATOR --- */}
      {activeTab === 'plywood' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs Section (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Enter Panel Dimensions
                </h3>
                <p className="text-xs text-slate-400">Add wardrobes, shutters, cabinets or drawer dimensions</p>
              </div>
              <button
                onClick={addPiece}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Panel</span>
              </button>
            </div>

            {/* List of Pieces */}
            <div className="space-y-3">
              {pieces.map((piece, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={piece.label}
                      onChange={(e) => {
                        const updated = [...pieces];
                        updated[index].label = e.target.value;
                        setPieces(updated);
                      }}
                      className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-amber-600 text-xs"
                      placeholder="e.g. Wardrobe Shutter"
                    />
                    {pieces.length > 1 && (
                      <button
                        onClick={() => removePiece(index)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Length (Ft)</label>
                      <input
                        type="number"
                        min="0"
                        value={piece.lengthFt}
                        onChange={(e) => {
                          const updated = [...pieces];
                          updated[index].lengthFt = Number(e.target.value);
                          setPieces(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Length (In)</label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={piece.lengthIn}
                        onChange={(e) => {
                          const updated = [...pieces];
                          updated[index].lengthIn = Number(e.target.value);
                          setPieces(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Width (Ft)</label>
                      <input
                        type="number"
                        min="0"
                        value={piece.widthFt}
                        onChange={(e) => {
                          const updated = [...pieces];
                          updated[index].widthFt = Number(e.target.value);
                          setPieces(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Width (In)</label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={piece.widthIn}
                        onChange={(e) => {
                          const updated = [...pieces];
                          updated[index].widthIn = Number(e.target.value);
                          setPieces(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={piece.qty}
                        onChange={(e) => {
                          const updated = [...pieces];
                          updated[index].qty = Math.max(1, Number(e.target.value));
                          setPieces(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Thickness & Wastage Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thickness Grade:</label>
                <select
                  value={selectedThickness}
                  onChange={(e) => setSelectedThickness(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="18mm">18mm (Wardrobe Carcass / Beds)</option>
                  <option value="12mm">12mm (Panels & Shelves)</option>
                  <option value="6mm">6mm (Backing Sheets)</option>
                  <option value="19mm">19mm Blockboard (Doors)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Carpenter Cutting Wastage:</label>
                <select
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value={5}>5% (Simple rectangular cuts)</option>
                  <option value={10}>10% (Standard modular woodwork)</option>
                  <option value={15}>15% (Complex curved patterns)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Results Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-base font-black uppercase tracking-tight text-white border-b border-slate-800 pb-3">
              Plywood Sheet Calculation Output
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Calculated Area:</span>
                  <span className="text-2xl font-black font-mono text-white">
                    {plyResult.rawSqFt} <span className="text-sm font-normal text-slate-400">Sq.Ft</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">With {wastagePercent}% Wastage:</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {plyResult.withWastage} <span className="text-sm font-normal text-amber-300">Sq.Ft</span>
                  </span>
                </div>
              </div>

              {/* Recommended Sheets */}
              <div className="p-5 rounded-xl bg-amber-500/15 border border-amber-500/50 text-center space-y-1">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Recommended Standard 8×4 Ft Sheets
                </span>
                <div className="text-5xl font-black font-mono text-amber-400">
                  {plyResult.sheetsNeeded}
                </div>
                <p className="text-[11px] text-slate-300">
                  Each 8x4 ft sheet covers 32 Sq.Ft
                </p>
              </div>

              {/* Estimated Cost */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Standard Rate (Century Sainik 710):</span>
                  <span className="font-mono text-white">₹{selectedBrandRate}/sqft</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total Plywood Area (Sheets × 32):</span>
                  <span className="font-mono text-white">{plyResult.sheetsNeeded * 32} Sq.Ft</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-white">
                  <span className="font-bold">Estimated Cost:</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    ₹{plyResult.estimatedCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/shop?category=Plywood')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Browse In-Stock 8×4 Sheets in Shop</span>
                </button>

                <button
                  onClick={() => navigate(`/quotes?notes=Need ${plyResult.sheetsNeeded} sheets of ${selectedThickness} plywood based on calculator.`)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Request Bulk Contractor Quote for {plyResult.sheetsNeeded} Sheets
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: TIMBER CFT CALCULATOR --- */}
      {activeTab === 'cft' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs Section (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Timber Scantling Dimensions
                </h3>
                <p className="text-xs text-slate-400">CFT = (Length in feet × Width in inches × Thickness in inches) ÷ 144</p>
              </div>
              <button
                onClick={addCftItem}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Timber Section</span>
              </button>
            </div>

            {/* List of CFT Items */}
            <div className="space-y-3">
              {cftItems.map((item, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...cftItems];
                        updated[index].label = e.target.value;
                        setCftItems(updated);
                      }}
                      className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-amber-600 text-xs"
                      placeholder="e.g. Frame Jamb"
                    />
                    {cftItems.length > 1 && (
                      <button
                        onClick={() => removeCftItem(index)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Length (Feet)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={item.lengthFt}
                        onChange={(e) => {
                          const updated = [...cftItems];
                          updated[index].lengthFt = Number(e.target.value);
                          setCftItems(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Width (Inches)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.25"
                        value={item.widthIn}
                        onChange={(e) => {
                          const updated = [...cftItems];
                          updated[index].widthIn = Number(e.target.value);
                          setCftItems(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Thick (Inches)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.25"
                        value={item.thickIn}
                        onChange={(e) => {
                          const updated = [...cftItems];
                          updated[index].thickIn = Number(e.target.value);
                          setCftItems(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Pcs / Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...cftItems];
                          updated[index].qty = Math.max(1, Number(e.target.value));
                          setCftItems(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timber species selector */}
            <div className="pt-4 border-t border-slate-100 text-xs">
              <label className="block font-bold text-slate-700 mb-1">Wood Species & Market Rate:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { name: 'CP Teak Wood', rate: 4800 },
                  { name: 'Sal Wood (Hardwood)', rate: 1850 },
                  { name: 'Honne Wood', rate: 2900 }
                ].map(spec => (
                  <button
                    key={spec.name}
                    type="button"
                    onClick={() => setWoodRatePerCft(spec.rate)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition ${
                      woodRatePerCft === spec.rate
                        ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">{spec.name}</p>
                    <p className="text-[10px] text-slate-500">₹{spec.rate} / CFT</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-base font-black uppercase tracking-tight text-white border-b border-slate-800 pb-3">
              Timber CFT Volume & Price
            </h3>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-amber-500/15 border border-amber-500/50 text-center space-y-1">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Total Volume (Cubic Feet)
                </span>
                <div className="text-5xl font-black font-mono text-amber-400">
                  {cftResult.totalCft} <span className="text-xl">CFT</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Standard Indian timber measurement unit
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Selected Rate:</span>
                  <span className="font-mono text-white">₹{woodRatePerCft.toLocaleString('en-IN')} / CFT</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Sections Count:</span>
                  <span className="font-mono text-white">{cftItems.reduce((s, i) => s + i.qty, 0)} Pieces</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-white">
                  <span className="font-bold">Total Timber Cost:</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    ₹{cftResult.totalWoodCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/shop?category=Wood')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Browse Timber Lots in Shop</span>
                </button>

                <button
                  onClick={() => navigate(`/quotes?notes=Requesting timber quote for ${cftResult.totalCft} CFT timber sections.`)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Request Timber Lot Quotation
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
