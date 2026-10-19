import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  Wrench, 
  Truck, 
  QrCode, 
  Package, 
  Star,
  Layers,
  ChevronRight,
  TreePine,
  DoorClosed,
  Building2,
  Droplet
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/common/ProductCard';
import { fetchProducts } from '../../lib/api';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { BuildYourDoorBanner } from '../../components/customer/BuildYourDoorBanner';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { storeSettings } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products on Home:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const plywoodProducts = products.filter(p => p.category === 'Plywood').slice(0, 4);
  const woodProducts = products.filter(p => p.category === 'Wood').slice(0, 4);
  const doorFittingProducts = products.filter(p => p.category === 'Door Fittings').slice(0, 4);
  const furnitureProducts = products.filter(p => p.category === 'Furniture Fittings').slice(0, 4);

  const displayedProducts = activeCategoryTab === 'All' 
    ? featuredProducts 
    : products.filter(p => p.category === activeCategoryTab).slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-slate-800 shadow-2xl">
        {/* Background Subtle Gradient & Grid */}
        <div className="absolute inset-0 bg-radial-at-tr from-amber-600/20 via-slate-900/60 to-slate-950 pointer-events-none" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Prominent Welcome Hardware Official Logo Badge */}
            <div className="flex items-center gap-3.5 bg-slate-950/80 p-3 pr-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xs w-fit">
              <img
                src="/welcome-hardware-logo.svg"
                alt="Welcome Hardware"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full shadow-md bg-white p-0.5 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">Welcome Hardware</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">Hospet</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                  Official Store • Timber & Hardware
                </p>
              </div>
            </div>

            {/* Store Pickup Core Tagline */}
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ORDER ONLINE • PICK UP AT OUR STORE</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Quality Hardware & Plywood <br />
                <span className="text-amber-500">Ready For Pickup in Hospet</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Welcome Hardware supplies genuine CenturyPly, CP Teak, Sal Wood, Europa locks, and architectural fittings. Check real in-store stock, order online, and collect seamlessly from our counter.
              </p>
            </div>

            {/* Prominent Store Location & Direct Phone Call */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-2.5 backdrop-blur-xs max-w-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{storeSettings.openingHours}</span>
                </div>
                <a
                  href={`tel:${storeSettings.phone}`}
                  id="hero-call-store-btn"
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded transition"
                >
                  <Phone className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Call: {storeSettings.phone}</span>
                </a>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/shop')}
                id="hero-browse-shop-btn"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-amber-900/30 transition active:scale-95"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/quotes')}
                id="hero-request-quote-btn"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl text-sm border border-slate-700 transition active:scale-95"
              >
                <span>Request Bulk Quote</span>
              </button>

              <button
                onClick={() => navigate('/calculators')}
                id="hero-calculators-btn"
                className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700 text-amber-400 font-semibold px-4 py-3 rounded-xl text-sm border border-amber-500/30 transition"
              >
                <Calculator className="w-4 h-4" />
                <span>Plywood & CFT Calc</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Store Pickup Flow Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase">In-Store Pickup Flow</h3>
                    <p className="text-[11px] text-slate-400">Zero wait times at counter</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                  4 STEPS
                </span>
              </div>

              {/* Step list */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-white">Reserve Items Online</strong>
                    <p className="text-slate-400 text-[11px]">Stock is instantly reserved from physical warehouse shelves.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-white">Receive 4-Digit PIN & QR Code</strong>
                    <p className="text-slate-400 text-[11px]">Safe digital pickup pass generated automatically.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <div>
                    <strong className="text-white">Store Packing & Notification</strong>
                    <p className="text-slate-400 text-[11px]">Our Hospet staff gathers and bundles your materials.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <div>
                    <strong className="text-white">Show PIN at Counter & Collect</strong>
                    <p className="text-slate-400 text-[11px]">Drive in to Hampi Road store, verify PIN, load, and go!</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg border border-slate-700 text-center transition"
                >
                  Already ordered? View Pickup PIN
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Hardware & Timber Categories
            </h2>
            <p className="text-xs text-slate-500">Explore physical stock available at our Hospet facility</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(cat => {
            const getIcon = () => {
              switch (cat.id) {
                case 'plywood': return <Layers className="w-6 h-6" />;
                case 'wood-boards': return <TreePine className="w-6 h-6" />;
                case 'door-fittings': return <DoorClosed className="w-6 h-6" />;
                case 'furniture-fittings': return <Wrench className="w-6 h-6" />;
                case 'architectural-hardware': return <Building2 className="w-6 h-6" />;
                case 'adhesives-consumables': return <Droplet className="w-6 h-6" />;
                default: return <Package className="w-6 h-6" />;
              }
            };

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-700 group-hover:text-white flex items-center justify-center transition mb-2">
                  {getIcon()}
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2.5 INTERACTIVE DOOR HARDWARE SELECTION ASSISTANT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BuildYourDoorBanner onStart={() => navigate('/build-your-door')} />
      </section>

      {/* 3. FEATURED PRODUCTS WITH FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              In-Stock Products for Counter Pickup
            </h2>
            <p className="text-xs text-slate-500">Reserve genuine building materials with instant price transparency</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {['All', 'Plywood', 'Wood', 'Door Fittings', 'Furniture Fittings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeCategoryTab === tab
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition"
          >
            <span>View All {products.length} Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. TRADE TOOLS: PLYWOOD & CFT CALCULATORS + DOOR RECOMMENDER */}
      <section className="bg-amber-50/70 border-y border-amber-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider bg-amber-100 px-3 py-1 rounded-full">
              Contractor & Carpenter Trade Tools
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2">
              Calculate Material Quantities Instantly
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Estimate exact sheet counts, cubic feet for timber, or generate custom door fitting bundles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool 1: Plywood Calculator */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Plywood Sheet Calculator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter dimensions in feet & inches. Calculates total square feet, required 8x4 ft sheets (including wastage margin), and estimates cost.
                </p>
              </div>
              <button
                onClick={() => navigate('/calculators')}
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 p-2.5 rounded-lg"
              >
                <span>Open Plywood Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tool 2: Timber CFT Calculator */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Wood / CFT Calculator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Calculate timber Cubic Feet (CFT = L × W × T / 144) for CP Teak, Sal wood, or Honne frames with direct price calculations.
                </p>
              </div>
              <button
                onClick={() => navigate('/calculators')}
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 p-2.5 rounded-lg"
              >
                <span>Open CFT Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tool 3: Door Fitting Recommender */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Door Fitting Recommender</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select door type (Main Door, Bedroom, Bathroom) and finish. Get recommended lock, hinges, closer, and handle bundles with one-click ordering.
                </p>
              </div>
              <button
                onClick={() => navigate('/door-fitting')}
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 p-2.5 rounded-lg"
              >
                <span>Recommend Fitting Bundle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PLYWOOD & TIMBER SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Direct Mill Supply
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Plywood, Teak & Boards
            </h2>
            <p className="text-xs text-slate-500">IS:710 Marine Grade BWP, Commercial MR, Gurjan & Kiln-Dried Timber</p>
          </div>
          <button
            onClick={() => navigate('/shop?category=Plywood')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Plywood</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {plywoodProducts.map(product => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 6. DOOR FITTINGS & LOCKS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                High Security & Aesthetics
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Locks & Architectural Hardware
            </h2>
            <p className="text-xs text-slate-500">Europa, Godrej, Yale, Dorma, Antique Brass Aldrops & SS 304 Hinges</p>
          </div>
          <button
            onClick={() => navigate('/shop?category=Door+Fittings')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Locks</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {doorFittingProducts.map(product => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 7. CONTRACTOR & BULK QUOTE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-8 sm:p-10 border border-slate-700 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              For Builders, Contractors, Carpenters & Architects
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Need Bulk Rates for Projects in Vijayanagar?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We supply full project lots of plywood crates, timber batches, and hardware fittings with commercial contractor discounts and formal GST quotations.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> B2B GST Invoices</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Bulk Crate Pricing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Staged Loading Bay</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => navigate('/quotes')}
              id="bulk-quote-cta-btn"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
            >
              Request Bulk Quote
            </button>
            <button
              onClick={() => navigate('/contractor')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl text-xs border border-slate-600 transition"
            >
              Contractor Zone
            </button>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Trusted by Craftsmen in Hospet
          </h2>
          <p className="text-xs text-slate-500">Real feedback from local carpenters, contractors, and home builders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic">
              "Ordering online and picking up with the 4-digit PIN saves 45 minutes of counter waiting. When I reach the Hampi Road shop with my vehicle, my CenturyPly sheets are already bundled."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">Ramesh Sharma</p>
                <p className="text-[10px] text-slate-400">Sharma Woodworks, Hospet</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
                Contractor
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic">
              "Best rates for genuine Europa locks and Godrej fittings in the Vijayanagar district. The Door Fitting Recommender tool accurately advised the exact hinge weight capacities."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">Anand Kulkarni</p>
                <p className="text-[10px] text-slate-400">Master Carpenter, Hospet</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
                Carpenter
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic">
              "We sourced 40 sheets of BWP plywood for a resort project near Hampi. The staff generated a clear GST invoice and loaded the Tata Ace smoothly."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">Vijay Builders</p>
                <p className="text-[10px] text-slate-400">Hampi Heritage Villa Project</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
                Builder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PHYSICAL STORE LOCATION & DIRECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                Physical Counter
              </span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Visit Welcome Hardware in Hospet
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conveniently located on main Hampi Road with spacious loading bays for autos, trucks, and personal pickups.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Store Address:</strong>
                    <span className="text-slate-700 font-medium">{storeSettings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Phone Helpline:</strong>
                    <a href={`tel:${storeSettings.phone}`} className="text-amber-700 hover:text-amber-800 font-bold">
                      {storeSettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">Business Timings:</strong>
                    <span className="text-slate-700">{storeSettings.openingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href={`tel:${storeSettings.phone}`}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span>Call Store ({storeSettings.phone})</span>
                </a>
                <button
                  onClick={() => navigate('/store-info')}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-lg text-xs transition"
                >
                  <span>View Interactive Directions</span>
                </button>
              </div>
            </div>

            {/* Map & Store Visual Representation */}
            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-300 relative aspect-16/10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md mb-3 border border-slate-200 p-1">
                <img
                  src="/welcome-hardware-logo.svg"
                  alt="Welcome Hardware"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <h4 className="font-black text-sm text-slate-900 uppercase">Welcome Hardware Counter</h4>
              <p className="text-xs text-slate-600 max-w-xs mt-1">Hampi Road, Near Main Junction, Hospet-Vijayanagar</p>
              <span className="mt-3 text-[10px] font-bold bg-white text-slate-800 px-3 py-1 rounded-full shadow-xs border border-slate-200">
                Direct Counter Vehicle Loading Available
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
