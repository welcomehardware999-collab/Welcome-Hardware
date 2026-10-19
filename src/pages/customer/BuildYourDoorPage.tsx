import React, { useState, useEffect } from 'react';
import { 
  DoorClosed, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShoppingCart, 
  FileText, 
  Bookmark, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  ExternalLink,
  HelpCircle,
  Layers,
  Wrench,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { 
  Product, 
  DoorType, 
  DoorMaterial, 
  HardwareCategory, 
  DoorUsage, 
  SingleDoorConfig, 
  DoorRecommendationPlan, 
  DoorRecommendationItem,
  SavedDoorSetup 
} from '../../types';
import { fetchProducts, createQuoteRequest } from '../../lib/api';
import { generateDoorHardwarePlan } from '../../lib/doorRecommender';
import { DEFAULT_HARDWARE_TYPES, DEFAULT_DOOR_PROFILES } from '../../lib/doorConfigAdmin';
import { trackDoorAnalytics } from '../../lib/analytics';

interface BuildYourDoorPageProps {
  navigate: (path: string) => void;
}

const DOOR_TYPES: { id: DoorType; label: string; desc: string; icon: string }[] = [
  { id: 'Main Entrance Door', label: 'Main Entrance Door', desc: 'Heavy entry door requiring maximum security & architectural presence', icon: '🚪' },
  { id: 'Wooden Interior Door', label: 'Wooden Interior Door', desc: 'Standard internal wooden passage & hallway door', icon: '🚪' },
  { id: 'Bedroom Door', label: 'Bedroom Door', desc: 'Private room door needing keyed exterior & push-button privacy', icon: '🚪' },
  { id: 'Bathroom/Toilet Door', label: 'Bathroom/Toilet Door', desc: 'High moisture zone requiring rust-free SS & coin-turn emergency slot', icon: '🚿' },
  { id: 'Office Door', label: 'Office Door', desc: 'Commercial/workspace door with heavy traffic & auto-closer', icon: '🏢' },
  { id: 'Sliding Door', label: 'Sliding Door', desc: 'Space-saving sliding partition or balcony door with tracks & rollers', icon: '↔️' },
  { id: 'Glass Door', label: 'Glass Door', desc: 'Frameless toughened glass entrance with patch fittings & floor spring', icon: '🪟' },
  { id: 'Double Door', label: 'Double Door', desc: 'Grand two-leaf entrance requiring coordinated locks & slave flush bolts', icon: '🚪🚪' },
  { id: 'Other', label: 'Other / Specialty Door', desc: 'Custom utility, storeroom, or specialized architectural opening', icon: '⚙️' },
];

const DOOR_MATERIALS: { id: DoorMaterial; label: string; sub: string }[] = [
  { id: 'Solid Wood', label: 'Solid Wood', sub: 'Teak, Sal, Honne, Rosewood (Heavy weight)' },
  { id: 'Plywood/Flush Door', label: 'Plywood / Flush Door', sub: 'BWP/BWR Flush door or decorative veneered panel' },
  { id: 'MDF/HDF', label: 'MDF / HDF Board', sub: 'Engineered high-density composite board' },
  { id: 'WPC', label: 'WPC (Wood Plastic)', sub: '100% Waterproof & termite-proof composite panel' },
  { id: 'Glass', label: 'Glass', sub: '10mm - 12mm Toughened architectural glass' },
  { id: 'Metal', label: 'Metal / Steel', sub: 'Hollow metal, steel frame, or aluminum door' },
  { id: 'Not Sure', label: 'Not Sure / Generic', sub: 'Recommend versatile hardware suited for standard doors' },
];

const USAGE_OPTIONS: { id: DoorUsage; label: string; desc: string }[] = [
  { id: 'Home', label: 'Home / Villa', desc: 'Residential private residence' },
  { id: 'Apartment', label: 'Apartment / Flat', desc: 'Multi-family residential complex' },
  { id: 'Office', label: 'Office / Corporate', desc: 'Professional workplace with regular daily use' },
  { id: 'Shop', label: 'Shop / Retail Showroom', desc: 'Commercial storefront or retail entry' },
  { id: 'Hotel', label: 'Hotel / Hospitality', desc: 'Guest rooms or public hospitality areas' },
  { id: 'Commercial Building', label: 'Commercial Building', desc: 'High-traffic institutional premises' },
  { id: 'Bathroom', label: 'Bathroom / Wet Zone', desc: 'Moisture and steam exposed interior area' },
  { id: 'Outdoor/Entrance', label: 'Outdoor / Exterior Gate', desc: 'Direct weather & sunlight exposure' },
  { id: 'Other', label: 'Other', desc: 'General hardware installation' },
];

const WIDTH_PRESETS = [700, 750, 800, 900, 1000];
const HEIGHT_PRESETS = [1800, 2000, 2100, 2200];
const THICKNESS_PRESETS = [25, 30, 32, 35, 40, 45, 50];

export const BuildYourDoorPage: React.FC<BuildYourDoorPageProps> = ({ navigate }) => {
  const { addToCart, profile } = useStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Multi-door configuration management
  const [doors, setDoors] = useState<SingleDoorConfig[]>([
    {
      id: 'door-1',
      doorLabel: 'Door 1: Main Entrance',
      doorType: 'Main Entrance Door',
      material: 'Solid Wood',
      dimensions: {
        width: 900,
        height: 2100,
        thickness: 40,
        isSkipped: false
      },
      hardwareNeeded: [],
      recommendEverything: true,
      usage: 'Home',
      notes: ''
    }
  ]);
  const [activeDoorIndex, setActiveDoorIndex] = useState(0);

  // Wizard state (1 to 5, and 6 = Results)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Current active door config shortcut
  const activeDoor = doors[activeDoorIndex] || doors[0];

  // Helper tooltip open state for hardware items
  const [expandedHelper, setExpandedHelper] = useState<string | null>(null);

  // Generated Plan State
  const [plans, setPlans] = useState<Record<string, DoorRecommendationPlan>>({});

  // Action status messages
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<string | null>(null);
  const [savedSetups, setSavedSetups] = useState<SavedDoorSetup[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [saveSetupName, setSaveSetupName] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Quote modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Initial load
  useEffect(() => {
    loadProducts();
    loadSavedSetups();
    trackDoorAnalytics('build_your_door_started', { doorType: activeDoor.doorType });
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const prods = await fetchProducts();
      setAllProducts(prods);
    } catch (err) {
      console.error('Failed to load products for door builder:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadSavedSetups = () => {
    try {
      const raw = localStorage.getItem('wh_saved_door_setups');
      if (raw) {
        setSavedSetups(JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Error reading saved setups:', err);
    }
  };

  // Update active door
  const updateActiveDoor = (updates: Partial<SingleDoorConfig>) => {
    setDoors(prev => {
      const next = [...prev];
      next[activeDoorIndex] = { ...next[activeDoorIndex], ...updates };
      return next;
    });
  };

  // Re-generate plan whenever door config changes and we are on results step
  useEffect(() => {
    if (currentStep === 6 && allProducts.length > 0) {
      generatePlansForAllDoors();
    }
  }, [currentStep, doors, allProducts]);

  const generatePlansForAllDoors = () => {
    const newPlans: Record<string, DoorRecommendationPlan> = {};
    doors.forEach(d => {
      newPlans[d.id] = generateDoorHardwarePlan(d, allProducts);
    });
    setPlans(newPlans);
    trackDoorAnalytics('build_your_door_completed', {
      doorType: activeDoor.doorType,
      material: activeDoor.material,
      itemsCount: newPlans[activeDoor.id]?.items.length || 0,
      totalValue: newPlans[activeDoor.id]?.grandTotal || 0
    });
  };

  // Navigation within wizard
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    } else if (currentStep === 5) {
      setCurrentStep(6);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  // Reset Wizard
  const handleReset = () => {
    if (window.confirm('Reset this door setup and start fresh?')) {
      updateActiveDoor({
        doorType: 'Main Entrance Door',
        material: 'Solid Wood',
        dimensions: { width: 900, height: 2100, thickness: 40, isSkipped: false },
        hardwareNeeded: [],
        recommendEverything: true,
        usage: 'Home',
        notes: ''
      });
      setCurrentStep(1);
    }
  };

  // Multi-door handling
  const handleAddDoor = () => {
    const newId = `door-${doors.length + 1}`;
    const newDoor: SingleDoorConfig = {
      id: newId,
      doorLabel: `Door ${doors.length + 1}: Bedroom / Interior`,
      doorType: 'Bedroom Door',
      material: 'Plywood/Flush Door',
      dimensions: { width: 800, height: 2100, thickness: 35, isSkipped: false },
      hardwareNeeded: [],
      recommendEverything: true,
      usage: 'Home',
      notes: ''
    };
    setDoors(prev => [...prev, newDoor]);
    setActiveDoorIndex(doors.length);
    setCurrentStep(1);
  };

  const handleRemoveDoor = (indexToRemove: number) => {
    if (doors.length <= 1) return;
    setDoors(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeDoorIndex >= indexToRemove && activeDoorIndex > 0) {
      setActiveDoorIndex(activeDoorIndex - 1);
    }
  };

  // Hardware item selection handlers in Plan
  const toggleItemSelection = (doorId: string, itemId: string) => {
    setPlans(prev => {
      const currentPlan = prev[doorId];
      if (!currentPlan) return prev;
      const updatedItems = currentPlan.items.map(item => {
        if (item.id === itemId && item.inStock) {
          return { ...item, isSelected: !item.isSelected };
        }
        return item;
      });

      // Recalculate totals
      let sub = 0;
      let gst = 0;
      updatedItems.forEach(it => {
        if (it.isSelected && it.inStock) {
          const itemTotal = it.product.finalPrice * it.selectedQuantity;
          sub += itemTotal;
          gst += (itemTotal * (it.product.gstRate || 18)) / 100;
        }
      });

      return {
        ...prev,
        [doorId]: {
          ...currentPlan,
          items: updatedItems,
          subtotal: Math.round(sub),
          gstTotal: Math.round(gst),
          grandTotal: Math.round(sub + gst)
        }
      };
    });
  };

  const updateItemQty = (doorId: string, itemId: string, delta: number) => {
    setPlans(prev => {
      const currentPlan = prev[doorId];
      if (!currentPlan) return prev;
      const updatedItems = currentPlan.items.map(item => {
        if (item.id === itemId) {
          const max = item.product.availableStock || item.product.stock;
          const nextQty = Math.max(1, Math.min(item.selectedQuantity + delta, max));
          return { ...item, selectedQuantity: nextQty };
        }
        return item;
      });

      let sub = 0;
      let gst = 0;
      updatedItems.forEach(it => {
        if (it.isSelected && it.inStock) {
          const itemTotal = it.product.finalPrice * it.selectedQuantity;
          sub += itemTotal;
          gst += (itemTotal * (it.product.gstRate || 18)) / 100;
        }
      });

      return {
        ...prev,
        [doorId]: {
          ...currentPlan,
          items: updatedItems,
          subtotal: Math.round(sub),
          gstTotal: Math.round(gst),
          grandTotal: Math.round(sub + gst)
        }
      };
    });
  };

  // Add individual product to cart
  const handleAddSingleToCart = (item: DoorRecommendationItem) => {
    if (!item.inStock) return;
    addToCart(item.product, item.selectedQuantity);
    trackDoorAnalytics('recommended_product_added', {
      metadata: { productId: item.product.id, productName: item.product.name, qty: item.selectedQuantity }
    });
    setCartSuccessNotice(`Added ${item.selectedQuantity} × "${item.product.name}" to your cart!`);
    setTimeout(() => setCartSuccessNotice(null), 4000);
  };

  // Add All Selected Items to Cart
  const handleAddAllToCart = () => {
    let addedCount = 0;
    const currentPlan = plans[activeDoor.id];
    if (!currentPlan) return;

    currentPlan.items.forEach(item => {
      if (item.isSelected && item.inStock) {
        addToCart(item.product, item.selectedQuantity);
        addedCount += item.selectedQuantity;
      }
    });

    if (addedCount > 0) {
      trackDoorAnalytics('all_recommended_products_added', {
        doorType: activeDoor.doorType,
        itemsCount: addedCount,
        totalValue: currentPlan.grandTotal
      });
      setCartSuccessNotice(`Successfully added ${addedCount} door hardware items to your cart!`);
      setTimeout(() => setCartSuccessNotice(null), 5000);
    }
  };

  // Save Door Setup
  const handleSaveSetup = () => {
    const currentPlan = plans[activeDoor.id];
    if (!currentPlan) return;

    const setupName = saveSetupName.trim() || `${activeDoor.doorLabel} (${activeDoor.doorType})`;
    const newSetup: SavedDoorSetup = {
      id: `saved-${Date.now()}`,
      name: setupName,
      savedAt: new Date().toISOString(),
      config: activeDoor,
      plan: currentPlan
    };

    const next = [newSetup, ...savedSetups];
    setSavedSetups(next);
    localStorage.setItem('wh_saved_door_setups', JSON.stringify(next));
    setShowSavePrompt(false);
    setSaveSetupName('');
    setSavedSuccessNotice(`Door setup "${setupName}" saved successfully!`);
    setTimeout(() => setSavedSuccessNotice(null), 4000);
  };

  const handleLoadSavedSetup = (saved: SavedDoorSetup) => {
    setDoors([saved.config]);
    setActiveDoorIndex(0);
    setPlans({ [saved.config.id]: saved.plan });
    setCurrentStep(6);
    setShowSavedModal(false);
  };

  const handleDeleteSavedSetup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedSetups.filter(s => s.id !== id);
    setSavedSetups(filtered);
    localStorage.setItem('wh_saved_door_setups', JSON.stringify(filtered));
  };

  // Request a Quote workflow
  const handleOpenQuoteModal = () => {
    const currentPlan = plans[activeDoor.id];
    if (!currentPlan) return;

    const itemsSummary = currentPlan.items
      .filter(it => it.isSelected)
      .map(it => `• ${it.selectedQuantity} × ${it.product.name} (₹${it.product.finalPrice} each) [${it.roleName}]`)
      .join('\n');

    const dimStr = activeDoor.dimensions.isSkipped 
      ? 'Standard Dimensions' 
      : `${activeDoor.dimensions.width || 900}mm (W) × ${activeDoor.dimensions.height || 2100}mm (H) × ${activeDoor.dimensions.thickness || 40}mm (Thick)`;

    const defaultNotes = `[Door Hardware Setup Request]\nDoor: ${activeDoor.doorLabel} (${activeDoor.doorType})\nMaterial: ${activeDoor.material}\nDimensions: ${dimStr}\nUsage: ${activeDoor.usage}\n\nRecommended Products:\n${itemsSummary}\n\nEstimated Product Total: ₹${currentPlan.subtotal} + 18% GST (Grand Total: ₹${currentPlan.grandTotal})`;

    setQuoteNotes(defaultNotes);
    setShowQuoteModal(true);
  };

  const handleSubmitDoorQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    try {
      const currentPlan = plans[activeDoor.id];
      const payload = {
        customerName: profile.name || 'Door Hardware Customer',
        customerPhone: profile.phone || '9845112233',
        customerEmail: profile.email || undefined,
        customerType: profile.customerType || 'Retail Customer',
        projectType: `Door Hardware - ${activeDoor.doorType}`,
        itemsDescription: quoteNotes,
        siteLocation: 'Hospet / Vijayanagar Site'
      };

      const quote = await createQuoteRequest(payload);
      trackDoorAnalytics('door_quote_requested', {
        doorType: activeDoor.doorType,
        totalValue: currentPlan?.grandTotal
      });

      setQuoteSuccessMsg(`Quotation Request #${quote.id} registered! Welcome Hardware staff will prepare project pricing.`);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSuccessMsg(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to submit quote:', err);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const currentPlan = plans[activeDoor.id];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER & STORE BADGE */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700 relative overflow-hidden">
        {/* Background Subtle Wood Grain Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Hardware Assistant</span>
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Welcome Hardware Hospet
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span className="text-amber-400">🚪</span> Build Your Door
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Find the right hardware for your door. Not sure what fittings you need? Answer 5 simple questions and our smart engine will curate the exact locks, hinges, and handles from our Hospet inventory.
            </p>
          </div>

          {/* Quick Actions & Saved Setups Button */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowSavedModal(true)}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shadow-xs"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Saved Setups ({savedSetups.length})</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Wizard</span>
            </button>
          </div>
        </div>

        {/* Multi-Door Tab Strip */}
        <div className="mt-8 pt-6 border-t border-slate-700/80 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {doors.map((door, idx) => (
              <div
                key={door.id}
                onClick={() => {
                  setActiveDoorIndex(idx);
                  if (currentStep !== 6) setCurrentStep(1);
                }}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                  activeDoorIndex === idx
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{door.doorLabel}</span>
                {doors.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDoor(idx);
                    }}
                    className="hover:text-rose-900 p-0.5"
                    title="Remove Door"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={handleAddDoor}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-dashed border-amber-400/40 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Door</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Matched to real Welcome Hardware Hospet inventory</span>
          </div>
        </div>
      </div>

      {/* Cart Feedback Notification Toast */}
      {cartSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{cartSuccessNotice}</span>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="bg-white text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-emerald-50 transition"
          >
            View Cart →
          </button>
        </div>
      )}

      {/* Saved Feedback Toast */}
      {savedSuccessNotice && (
        <div className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-3 shadow-xl animate-fadeIn border border-amber-400/30">
          <Bookmark className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{savedSuccessNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PROGRESS STEPPER (Steps 1 to 5) */}
      {/* ======================================================== */}
      {currentStep <= 5 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600">
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Step {currentStep} of 5
            </span>
            <span className="text-slate-500 font-bold">
              {currentStep === 1 && 'What Type of Door?'}
              {currentStep === 2 && 'Door Material'}
              {currentStep === 3 && 'Door Dimensions'}
              {currentStep === 4 && 'Hardware Needed'}
              {currentStep === 5 && 'Installation Usage'}
            </span>
          </div>

          {/* Stepper Line */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`h-full flex-1 transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-emerald-500'
                    : step === currentStep
                    ? 'bg-amber-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. STEP 1 — WHAT TYPE OF DOOR? */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              What type of door are you fitting?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select the primary opening type. Different door types have distinct security requirements, hinges, and lock mechanisms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOOR_TYPES.map(type => {
              const isSelected = activeDoor.doorType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => updateActiveDoor({ doorType: type.id })}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                      {type.icon}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-xs">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900">
                      {type.label}
                    </h3>
                    <p className="text-xs text-slate-500 leading-snug">
                      {type.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Selected: <strong className="text-slate-900">{activeDoor.doorType}</strong>
            </span>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
            >
              <span>Next: Door Material</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STEP 2 — DOOR MATERIAL */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              What is the door made of?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              The door material dictates the weight and mounting screw requirements. If you aren't certain, choose "Not Sure" and we will recommend versatile fittings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOOR_MATERIALS.map(mat => {
              const isSelected = activeDoor.material === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => updateActiveDoor({ material: mat.id })}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition relative flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900">
                      {mat.label}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {mat.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
            >
              <span>Next: Door Dimensions</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. STEP 3 — DOOR SIZE (DIMENSIONS) */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Door Dimensions (Width • Height • Thickness)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Door thickness determines lock backsets, cylinder lengths, and hinge bearing capacity.
              </p>
            </div>

            <button
              onClick={() => {
                updateActiveDoor({
                  dimensions: {
                    ...activeDoor.dimensions,
                    isSkipped: true,
                    width: 900,
                    height: 2100,
                    thickness: 35
                  }
                });
                nextStep();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition shrink-0"
            >
              <span>I Don't Know Dimensions (Skip)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WIDTH SELECTOR */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Door Width (mm)
                </label>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {activeDoor.dimensions.width || 900} mm
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WIDTH_PRESETS.map(w => (
                  <button
                    key={w}
                    onClick={() => updateActiveDoor({
                      dimensions: { ...activeDoor.dimensions, width: w, isSkipped: false }
                    })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      activeDoor.dimensions.width === w && !activeDoor.dimensions.isSkipped
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {w} mm
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <input
                  type="number"
                  placeholder="Custom width in mm"
                  value={activeDoor.dimensions.width || ''}
                  onChange={(e) => updateActiveDoor({
                    dimensions: { ...activeDoor.dimensions, width: parseInt(e.target.value) || undefined, isSkipped: false }
                  })}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* HEIGHT SELECTOR */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Door Height (mm)
                </label>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {activeDoor.dimensions.height || 2100} mm
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HEIGHT_PRESETS.map(h => (
                  <button
                    key={h}
                    onClick={() => updateActiveDoor({
                      dimensions: { ...activeDoor.dimensions, height: h, isSkipped: false }
                    })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
                      activeDoor.dimensions.height === h && !activeDoor.dimensions.isSkipped
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {h} mm ({h === 2100 ? '7 ft Std' : `${(h/304.8).toFixed(1)} ft`})
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <input
                  type="number"
                  placeholder="Custom height in mm"
                  value={activeDoor.dimensions.height || ''}
                  onChange={(e) => updateActiveDoor({
                    dimensions: { ...activeDoor.dimensions, height: parseInt(e.target.value) || undefined, isSkipped: false }
                  })}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* THICKNESS SELECTOR */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Door Thickness (mm)
                </label>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {activeDoor.dimensions.thickness || 35} mm
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {THICKNESS_PRESETS.map(t => (
                  <button
                    key={t}
                    onClick={() => updateActiveDoor({
                      dimensions: { ...activeDoor.dimensions, thickness: t, isSkipped: false }
                    })}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition ${
                      activeDoor.dimensions.thickness === t && !activeDoor.dimensions.isSkipped
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}mm
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Standard interior doors are 30–35mm. Heavy main teak doors are 40–50mm.
              </p>
            </div>

          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
            >
              <span>Next: Hardware Selection</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. STEP 4 — WHAT HARDWARE DO YOU NEED? */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                What hardware do you need?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Select the individual hardware fittings you want, or tap "Recommend everything I need" to let our algorithm curate the complete set.
              </p>
            </div>

            <button
              onClick={() => {
                updateActiveDoor({
                  recommendEverything: true,
                  hardwareNeeded: ["Complete Hardware Set"]
                });
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${
                activeDoor.recommendEverything
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Recommend Everything I Need</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEFAULT_HARDWARE_TYPES.map(item => {
              const isChecked = activeDoor.recommendEverything || 
                activeDoor.hardwareNeeded.includes(item.id) ||
                activeDoor.hardwareNeeded.includes("Complete Hardware Set");

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (activeDoor.recommendEverything) {
                      // Switch to custom selection
                      updateActiveDoor({
                        recommendEverything: false,
                        hardwareNeeded: [item.id]
                      });
                    } else {
                      const current = activeDoor.hardwareNeeded;
                      const next = current.includes(item.id)
                        ? current.filter(i => i !== item.id)
                        : [...current, item.id];
                      updateActiveDoor({
                        hardwareNeeded: next,
                        recommendEverything: false
                      });
                    }
                  }}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition relative flex flex-col justify-between space-y-2 ${
                    isChecked
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-amber-500 border-amber-600 text-slate-950' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                        {item.label}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedHelper(expandedHelper === item.id ? null : item.id);
                      }}
                      className="text-slate-400 hover:text-amber-600 p-0.5 rounded"
                      title="What is this?"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {item.beginnerHelper}
                  </p>

                  {/* Expanded helper tooltip */}
                  {expandedHelper === item.id && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-900 text-slate-200 text-[10px] space-y-1 animate-fadeIn">
                      <span className="font-bold text-amber-400 block">Pro Tip:</span>
                      <span>Standard installation recommends {item.standardQuantity} unit(s) per door.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
            >
              <span>Next: Usage Context</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. STEP 5 — USAGE */}
      {/* ======================================================== */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Where will this door be used?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Usage frequency and environmental exposure determine whether heavy-duty architectural closers, weatherproofing, or master-keyed locks are appropriate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USAGE_OPTIONS.map(u => {
              const isSelected = activeDoor.usage === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => updateActiveDoor({ usage: u.id })}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition relative flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900">
                      {u.label}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {u.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-8 py-3.5 rounded-xl transition shadow-lg ring-2 ring-amber-400/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Door Hardware Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. STEP 6 — RESULTS SCREEN / YOUR DOOR HARDWARE PLAN */}
      {/* ======================================================== */}
      {currentStep === 6 && currentPlan && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* TOP SUMMARY BAR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  Curated Hardware Specification
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {activeDoor.doorLabel}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                Your Door Hardware Plan
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  🚪 <strong>Type:</strong> {activeDoor.doorType}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  🪵 <strong>Material:</strong> {activeDoor.material}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  📐 <strong>Size:</strong> {activeDoor.dimensions.isSkipped 
                    ? 'Standard Specification' 
                    : `${activeDoor.dimensions.width || 900} × ${activeDoor.dimensions.height || 2100} × ${activeDoor.dimensions.thickness || 40} mm`}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  🏢 <strong>Usage:</strong> {activeDoor.usage}
                </span>
              </div>
            </div>

            {/* Quick Change / Save Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Answers</span>
              </button>
              <button
                onClick={() => setShowSavePrompt(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Setup</span>
              </button>
            </div>
          </div>

          {/* ENGINEERING DISCLAIMER BANNER */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-950 font-medium">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Hardware Engineering Notice:</strong> Recommendations are calculated based on your dimensions and standard Hospet architectural practice. Confirm the final specification with a qualified hardware professional or the product manufacturer before boring locksets into pre-finished doors.
            </div>
          </div>

          {/* PRODUCT RECOMMENDATIONS GROUPED BY TIER */}
          {(['REQUIRED', 'RECOMMENDED', 'OPTIONAL'] as const).map(tier => {
            const tierItems = currentPlan.items.filter(i => i.tier === tier);
            if (tierItems.length === 0) return null;

            return (
              <div key={tier} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    tier === 'REQUIRED' 
                      ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                      : tier === 'RECOMMENDED'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {tier} HARDWARE
                  </span>
                  <p className="text-xs text-slate-500 font-medium">
                    {tier === 'REQUIRED' && 'Essential load-bearing and core locking components.'}
                    {tier === 'RECOMMENDED' && 'Door protection, automatic closing, and security latches.'}
                    {tier === 'OPTIONAL' && 'Convenience, visual identification, and safety chains.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tierItems.map(item => {
                    const isAvailable = item.inStock;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border-2 transition p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                          item.isSelected && isAvailable
                            ? 'border-amber-400 bg-amber-50/10'
                            : !isAvailable
                            ? 'border-slate-200 bg-slate-50 opacity-90'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Role Tag & Availability Header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-md">
                              {item.roleName}
                            </span>

                            {isAvailable ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>In Stock ({item.product.availableStock || item.product.stock} available)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Currently unavailable</span>
                              </span>
                            )}
                          </div>

                          {/* Product Details Row */}
                          <div className="flex gap-4">
                            <img
                              src={item.product.images[0] || '/welcome-hardware-logo.svg'}
                              alt={item.product.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {item.product.brand} • SKU: {item.product.sku}
                              </span>
                              <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                                {item.product.name}
                              </h4>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-base font-black text-slate-950 font-mono">
                                  ₹{item.product.finalPrice}
                                </span>
                                {item.product.discount > 0 && (
                                  <span className="text-xs text-slate-400 line-through font-mono">
                                    ₹{item.product.price}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-bold">
                                  + {item.product.gstRate || 18}% GST
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Why Recommended Explanation */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800 font-bold block mb-0.5 text-[11px] uppercase tracking-wider">
                              Why this is recommended:
                            </strong>
                            {item.reason}
                          </div>

                          {/* Out-of-Stock Alternative Suggestion */}
                          {!isAvailable && item.alternativeProduct && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                              <span className="font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>In-Stock Compatible Alternative Available:</span>
                              </span>
                              <p className="text-[11px]">
                                <strong>{item.alternativeProduct.name}</strong> (₹{item.alternativeProduct.finalPrice}) is ready at our Hampi Road counter.
                              </p>
                              <button
                                onClick={() => addToCart(item.alternativeProduct!, item.recommendedQuantity)}
                                className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950"
                              >
                                Add Alternative Instead →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Controls */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          {/* Quantity Selector & Checkbox */}
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={item.isSelected && isAvailable}
                                disabled={!isAvailable}
                                onChange={() => toggleItemSelection(activeDoor.id, item.id)}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                              />
                              <span>Include</span>
                            </label>

                            {/* Quantity buttons */}
                            {isAvailable && (
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(activeDoor.id, item.id, -1)}
                                  className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                                >
                                  -
                                </button>
                                <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-900">
                                  {item.selectedQuantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(activeDoor.id, item.id, 1)}
                                  className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Individual Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                trackDoorAnalytics('product_recommendation_clicked', {
                                  metadata: { productId: item.product.id }
                                });
                                navigate(`/products/${item.product.id}`);
                              }}
                              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition flex items-center gap-1"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            {isAvailable && (
                              <button
                                type="button"
                                onClick={() => handleAddSingleToCart(item)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                              >
                                <ShoppingCart className="w-3 h-3 text-amber-400" />
                                <span>Add to Cart</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ======================================================== */}
          {/* ESTIMATED TOTAL & CONVERT TO CART / QUOTE */}
          {/* ======================================================== */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Welcome Hardware Order Summary
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Door Hardware Total
                </h3>
                <p className="text-xs text-slate-300">
                  Includes in-stock items selected above for {activeDoor.doorLabel}. Ready for immediate in-store pickup on Hampi Road.
                </p>
              </div>

              {/* Price Breakdown Matrix */}
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1.5 text-xs sm:w-80">
                <div className="flex justify-between text-slate-300">
                  <span>Product Subtotal:</span>
                  <span className="font-mono font-bold text-white">₹{currentPlan.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Applicable GST (18%):</span>
                  <span className="font-mono font-bold text-white">₹{currentPlan.gstTotal}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between text-sm sm:text-base font-black text-amber-400">
                  <span>Estimated Total:</span>
                  <span className="font-mono">₹{currentPlan.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Suite */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleAddAllToCart}
                className="flex-1 min-w-[240px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ADD ALL SELECTED ITEMS TO CART</span>
              </button>

              <button
                onClick={handleOpenQuoteModal}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-6 py-4 rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Request a Quote (Multiple Doors)</span>
              </button>

              <button
                onClick={handleAddDoor}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm px-5 py-4 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Door</span>
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-400 hover:text-white px-3 py-4 font-bold transition"
              >
                Start Again
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 9. SAVE SETUP PROMPT MODAL */}
      {/* ======================================================== */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Save This Door Setup
              </h3>
              <p className="text-xs text-slate-500">
                Save your curated hardware plan so you or your contractor can reload and purchase it anytime.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Setup Name
              </label>
              <input
                type="text"
                placeholder="e.g., Main Entrance Door - Hospet House"
                value={saveSetupName}
                onChange={(e) => setSaveSetupName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSavePrompt(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSetup}
                className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs"
              >
                Save Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. SAVED SETUPS BROWSER DRAWER/MODAL */}
      {/* ======================================================== */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500" />
                  <span>Your Saved Door Setups</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Reopen saved door hardware configurations instantly.
                </p>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-slate-900 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {savedSetups.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <DoorClosed className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                <p className="text-xs text-slate-500 font-medium">
                  You haven't saved any door setups yet. Complete the wizard and tap "Save Setup" to bookmark configurations here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSetups.map(saved => (
                  <div
                    key={saved.id}
                    onClick={() => handleLoadSavedSetup(saved)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 cursor-pointer transition flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-800">
                        {saved.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {saved.config.doorType} • {saved.config.material} • {saved.config.usage} • {saved.plan.items.length} items (₹{saved.plan.grandTotal})
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Saved on {new Date(saved.savedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteSavedSetup(saved.id, e)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete saved setup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                        Open →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. BULK QUOTATION MODAL */}
      {/* ======================================================== */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  B2B Trade & Multi-Door Desk
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">
                  Request Multi-Door Project Quote
                </h3>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-slate-900 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {quoteSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 space-y-2 text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{quoteSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDoorQuote} className="space-y-4">
                <p className="text-xs text-slate-500">
                  We will transmit your selected door hardware package directly into Welcome Hardware's quotation portal. Our wholesale team will call you with discounted project pricing for site lots.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Door & Hardware Specification (Auto-filled)
                  </label>
                  <textarea
                    rows={7}
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {quoteSubmitting ? 'Transmitting...' : 'Submit Quotation Request →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
