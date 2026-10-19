import React from 'react';
import { Layers, ArrowRight, TreePine, DoorClosed, Wrench, Building2, Droplet, Hammer } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'plywood': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
  'wood-boards': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  'door-fittings': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
  'furniture-fittings': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=600&q=80',
  'architectural-hardware': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'adhesives-consumables': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
};

const CATEGORY_ICONS: Record<string, any> = {
  'plywood': Layers,
  'wood-boards': TreePine,
  'door-fittings': DoorClosed,
  'furniture-fittings': Wrench,
  'architectural-hardware': Building2,
  'adhesives-consumables': Droplet,
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          Store Departments
        </span>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          Hardware & Building Material Categories
        </h1>
        <p className="text-xs text-slate-500">
          Browse by category to view in-stock physical inventory at Welcome Hardware, Hospet
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat.id] || Layers;
          const imgUrl = CATEGORY_IMAGES[cat.id] || 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80';

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-500 overflow-hidden shadow-xs hover:shadow-xl transition cursor-pointer flex flex-col"
            >
              <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
                <img
                  src={cat.image || imgUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                      Physical In-Store Stock
                    </span>
                    <h3 className="text-xl font-black tracking-tight drop-shadow-xs">
                      {cat.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/90 text-slate-950 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cat.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                  <span>Browse {cat.name} Catalogue</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
