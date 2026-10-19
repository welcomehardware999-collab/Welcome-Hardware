import { 
  Product, 
  SingleDoorConfig, 
  DoorRecommendationItem, 
  DoorRecommendationPlan, 
  HardwareCategory, 
  RecommendationTier 
} from '../types';
import { getAdminDoorRules, DEFAULT_HARDWARE_TYPES } from './doorConfigAdmin';

export function generateDoorHardwarePlan(
  config: SingleDoorConfig,
  allProducts: Product[]
): DoorRecommendationPlan {
  const rules = getAdminDoorRules();
  const profile = rules[config.doorType] || rules['Main Entrance Door'];

  // Determine what hardware categories we need to examine
  let categoriesToEvaluate: HardwareCategory[] = [];

  if (
    config.recommendEverything ||
    config.hardwareNeeded.includes("I'm Not Sure") ||
    config.hardwareNeeded.includes("Complete Hardware Set") ||
    config.hardwareNeeded.length === 0
  ) {
    // Curate comprehensive set based on door profile
    categoriesToEvaluate = [...profile.defaultHardware];
  } else {
    categoriesToEvaluate = [...config.hardwareNeeded];
  }

  // Always ensure essential category for door type is evaluated if user didn't explicitly untick
  if (config.doorType === 'Sliding Door' && !categoriesToEvaluate.includes('Sliding Door Hardware')) {
    categoriesToEvaluate.unshift('Sliding Door Hardware');
  }
  if (config.doorType === 'Glass Door' && !categoriesToEvaluate.includes('Glass Door Hardware')) {
    categoriesToEvaluate.unshift('Glass Door Hardware');
  }
  if (config.doorType === 'Double Door' && !categoriesToEvaluate.includes('Flush Bolt')) {
    categoriesToEvaluate.push('Flush Bolt');
  }

  const items: DoorRecommendationItem[] = [];

  // Filter products by active status
  const catalog = allProducts.filter(p => p.active !== false);

  categoriesToEvaluate.forEach((cat) => {
    // Determine tier
    const tier: RecommendationTier = profile.defaultTierMappings[cat] || 
      (DEFAULT_HARDWARE_TYPES.find(h => h.id === cat)?.defaultTier || 'RECOMMENDED');

    // Calculate recommended quantity
    let qty = 1;
    if (cat === 'Hinges') {
      const isSolidWood = config.material === 'Solid Wood';
      const isHeavy = (config.dimensions.thickness && config.dimensions.thickness >= 45) ||
                      (config.dimensions.height && config.dimensions.height >= 2200);
      
      if (config.doorType === 'Double Door') {
        qty = isSolidWood || isHeavy ? 8 : 6;
      } else {
        qty = isSolidWood || isHeavy ? 4 : 3;
      }
    } else if (cat === 'Flush Bolt') {
      qty = 2; // Top and Bottom bolts for inactive leaf
    }

    // Match best product from catalog
    const match = findBestProductForCategory(cat, config, catalog);

    if (match) {
      const inStock = (match.availableStock ?? match.stock) > 0;
      let altProduct: Product | undefined = undefined;

      if (!inStock) {
        // Find in-stock substitute
        altProduct = findInStockAlternative(cat, match.id, config, catalog);
      }

      // Reason crafting
      const reason = generateRecommendationReason(cat, config, inStock, qty);

      items.push({
        id: `rec-${cat.toLowerCase().replace(/\s+/g, '-')}-${match.id}`,
        hardwareCategory: cat,
        roleName: getRoleName(cat, config),
        tier,
        recommendedQuantity: qty,
        reason,
        product: match,
        inStock,
        alternativeProduct: altProduct,
        selectedQuantity: qty,
        isSelected: inStock // automatically select in-stock items
      });
    }
  });

  // Calculate totals
  let subtotal = 0;
  let gstTotal = 0;

  items.forEach(item => {
    if (item.isSelected && item.inStock) {
      const itemSub = item.product.finalPrice * item.selectedQuantity;
      const gst = (itemSub * (item.product.gstRate || 18)) / 100;
      subtotal += itemSub;
      gstTotal += gst;
    }
  });

  const grandTotal = Math.round(subtotal + gstTotal);
  const allInStock = items.every(i => !i.isSelected || i.inStock);

  return {
    doorConfig: config,
    items,
    subtotal: Math.round(subtotal),
    gstTotal: Math.round(gstTotal),
    grandTotal,
    allInStock
  };
}

function getRoleName(cat: HardwareCategory, config: SingleDoorConfig): string {
  switch (cat) {
    case 'Door Handle':
      return config.doorType === 'Main Entrance Door' ? 'Main Architectural Pull Handle' : 'Designer Lever Handle Set';
    case 'Mortise Lock':
      return config.doorType === 'Main Entrance Door' ? 'High-Security Main Mortise Lock' : 'Interior Mortise Latch & Lock';
    case 'Cylindrical Lock':
      return config.doorType === 'Bathroom/Toilet Door' ? 'Bathroom Moisture-Proof Privacy Lock' : 'Bedroom Keyed Knob Lock';
    case 'Hinges':
      return (config.material === 'Solid Wood' || (config.dimensions.thickness && config.dimensions.thickness >= 40)) 
        ? 'Heavy Load-Bearing Ball Bearing Hinges' 
        : 'SS 304 Silent Ball Bearing Hinges';
    case 'Door Closer':
      return 'Overhead Hydraulic Auto-Closer';
    case 'Door Stopper':
      return 'Magnetic Wall/Floor Door Stopper';
    case 'Tower Bolt':
      return 'Heavy Mechanical Tower Bolt';
    case 'Aldrop':
      return 'Solid Brass Traditional Aldrop';
    case 'Door Viewer':
      return '200° Panoramic Optical Peephole';
    case 'Door Chain':
      return 'Hardened Steel Safety Guard Chain';
    case 'Sliding Door Hardware':
      return 'Heavy Duty Top-Hung Sliding Track & Rollers';
    case 'Glass Door Hardware':
      return 'Toughened Glass Patch Fittings & Pivot';
    case 'Flush Bolt':
      return 'Concealed Edge Flush Bolts (Top & Bottom)';
    default:
      return cat;
  }
}

function generateRecommendationReason(
  cat: HardwareCategory, 
  config: SingleDoorConfig, 
  inStock: boolean,
  qty: number
): string {
  const thicknessStr = config.dimensions.thickness ? `${config.dimensions.thickness}mm` : 'standard';
  
  switch (cat) {
    case 'Hinges':
      if (config.doorType === 'Double Door') {
        return `Double doors require ${qty} heavy-duty hinges (${qty / 2} per leaf) to eliminate leaf sagging and ensure perfect center alignment.`;
      }
      if (config.material === 'Solid Wood' || (config.dimensions.thickness && config.dimensions.thickness >= 45)) {
        return `Because your door is ${config.material} with ${thicknessStr} thickness, ${qty} heavy-duty ball-bearing hinges are recommended for weight distribution.`;
      }
      return `Standard ${qty} ball-bearing SS 304 hinges provide quiet, frictionless swing and prevent door frame distortion over time.`;

    case 'Mortise Lock':
      if (config.doorType === 'Main Entrance Door') {
        return 'Multi-throw computerized dimple key mortise deadbolt provides Grade-1 perimeter resistance against forced entry.';
      }
      return 'Solid brass internal cylinder lock ensures smooth latching and privacy for residential passage.';

    case 'Cylindrical Lock':
      if (config.doorType === 'Bathroom/Toilet Door') {
        return 'Features an external emergency coin slot for accidental lockouts and corrosion-proof internal springs for wet environments.';
      }
      return 'Simple push-button locking inside with exterior key access, engineered for hassle-free bedroom use.';

    case 'Door Handle':
      if (config.doorType === 'Main Entrance Door') {
        return 'Heavy architectural forged brass/stainless pull handles provide commanding entry aesthetics and comfortable ergonomics.';
      }
      return 'Durable lever handles with spring-assisted return mechanism to keep the handle straight for decades.';

    case 'Door Closer':
      return `Recommended for ${config.usage} environments to prevent door slamming from wind drafts and maintain air conditioning efficiency.`;

    case 'Door Stopper':
      return 'Prevents the handle from damaging adjacent plaster, paint, or tiles when swung open briskly.';

    case 'Aldrop':
      return 'Heavy solid brass traditional aldrop offers secondary padlock security when travelling away from home.';

    case 'Door Viewer':
      return '200-degree crystal glass optics allow full head-to-toe identification of visitors before opening.';

    case 'Door Chain':
      return 'Allows inspecting courier packages or conversing through a safe 2-inch gap without fully unlocking.';

    case 'Sliding Door Hardware':
      return 'Engineered nylon ball-bearing rollers with anti-jump stops ensure whisper-quiet sliding for wood panels up to 80kg.';

    case 'Glass Door Hardware':
      return 'Precision CNC clamped patch fittings distribute load safely across 10-12mm toughened glass without drilling extra stress holes.';

    case 'Flush Bolt':
      return 'Mounted into the edge of the secondary leaf to keep it anchored at top and bottom while the active door opens.';

    default:
      return 'Matched to your door material and usage specification for optimal longevity.';
  }
}

function findBestProductForCategory(
  category: HardwareCategory,
  config: SingleDoorConfig,
  catalog: Product[]
): Product | undefined {
  // 1. Specific subcategory mappings
  let subCatTarget = '';
  let nameKeywords: string[] = [];

  switch (category) {
    case 'Door Handle':
      if (config.doorType === 'Main Entrance Door' || config.doorType === 'Glass Door') {
        subCatTarget = 'Pull Handles';
        nameKeywords = ['pull handle', 'h-type', 'solid'];
      } else {
        subCatTarget = 'Door Handles';
        nameKeywords = ['handle', 'lever'];
      }
      break;
    case 'Mortise Lock':
      subCatTarget = 'Mortise Locks';
      nameKeywords = ['mortise', 'lock', 'europa', 'godrej'];
      break;
    case 'Cylindrical Lock':
      subCatTarget = 'Cylindrical Locks';
      if (config.doorType === 'Bathroom/Toilet Door') {
        nameKeywords = ['privacy', 'bathroom', 'yale'];
      } else {
        nameKeywords = ['cylindrical', 'knob', 'godrej'];
      }
      break;
    case 'Hinges':
      subCatTarget = 'Hinges';
      if (config.material === 'Solid Wood' || (config.dimensions.thickness && config.dimensions.thickness >= 40)) {
        nameKeywords = ['heavy', '5"', '3mm', 'bearing'];
      } else {
        nameKeywords = ['4"', 'butt', 'bearing'];
      }
      break;
    case 'Door Closer':
      subCatTarget = 'Door Closers';
      nameKeywords = ['closer', 'hydraulic', 'dorma'];
      break;
    case 'Door Stopper':
      subCatTarget = 'Door Stoppers';
      nameKeywords = ['stopper', 'magnetic', 'ozone'];
      break;
    case 'Tower Bolt':
      subCatTarget = 'Tower Bolts';
      nameKeywords = ['tower bolt', 'brass'];
      break;
    case 'Aldrop':
      subCatTarget = 'Aldrops';
      nameKeywords = ['aldrop', 'brass', 'traditional'];
      break;
    case 'Door Viewer':
      subCatTarget = 'Door Viewers';
      nameKeywords = ['viewer', 'peephole', '200'];
      break;
    case 'Door Chain':
      subCatTarget = 'Door Chains';
      nameKeywords = ['chain', 'safety', 'europa'];
      break;
    case 'Sliding Door Hardware':
      subCatTarget = 'Sliding Door Hardware';
      nameKeywords = ['sliding', 'slido', 'hafele'];
      break;
    case 'Glass Door Hardware':
      subCatTarget = 'Glass Door Hardware';
      nameKeywords = ['glass', 'patch', 'ozone', 'floor spring'];
      break;
    case 'Flush Bolt':
      subCatTarget = 'Flush Bolts';
      nameKeywords = ['flush bolt', 'double door'];
      break;
    default:
      nameKeywords = [category.toLowerCase()];
  }

  // Try matching by hardwareType metadata first
  const metadataMatch = catalog.find(p => p.hardwareType === category);
  if (metadataMatch) {
    // If it's cylindrical lock, differentiate bathroom vs bedroom
    if (category === 'Cylindrical Lock') {
      if (config.doorType === 'Bathroom/Toilet Door' && pMatches(metadataMatch, ['privacy', 'bathroom'])) {
        return metadataMatch;
      }
      if (config.doorType !== 'Bathroom/Toilet Door' && pMatches(metadataMatch, ['keyed', 'bedroom', 'godrej'])) {
        return metadataMatch;
      }
    } else {
      return metadataMatch;
    }
  }

  // Filter by subCategory
  const subCatMatches = catalog.filter(p => 
    p.category === 'Door Fittings' || p.category === 'Architectural Hardware'
  ).filter(p => p.subCategory.toLowerCase().includes(subCatTarget.toLowerCase()) || subCatTarget.toLowerCase().includes(p.subCategory.toLowerCase()));

  if (subCatMatches.length > 0) {
    // Rank by keyword matches
    const scored = subCatMatches.map(p => {
      let score = 0;
      const fullText = `${p.name} ${p.description} ${p.material || ''} ${p.subCategory}`.toLowerCase();
      nameKeywords.forEach(kw => {
        if (fullText.includes(kw.toLowerCase())) score += 2;
      });
      // Prefer in-stock items
      if ((p.availableStock ?? p.stock) > 0) score += 5;
      return { p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].p;
  }

  // Fallback: search by keywords across all Door Fittings & Architectural Hardware
  const broadMatches = catalog.filter(p => 
    p.category === 'Door Fittings' || p.category === 'Architectural Hardware'
  ).filter(p => {
    const fullText = `${p.name} ${p.description} ${p.subCategory}`.toLowerCase();
    return nameKeywords.some(kw => fullText.includes(kw.toLowerCase()));
  });

  return broadMatches[0] || catalog.find(p => p.category === 'Door Fittings');
}

function findInStockAlternative(
  category: HardwareCategory,
  currentId: string,
  config: SingleDoorConfig,
  catalog: Product[]
): Product | undefined {
  return catalog.find(p => 
    p.id !== currentId &&
    (p.category === 'Door Fittings' || p.category === 'Architectural Hardware') &&
    (p.availableStock ?? p.stock) > 0 &&
    (p.hardwareType === category || 
     p.subCategory.toLowerCase().includes(category.toLowerCase()) || 
     p.name.toLowerCase().includes(category.toLowerCase()))
  );
}

function pMatches(p: Product, keywords: string[]): boolean {
  const str = `${p.name} ${p.description}`.toLowerCase();
  return keywords.some(k => str.includes(k.toLowerCase()));
}
