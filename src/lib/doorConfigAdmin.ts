import { DoorType, DoorMaterial, HardwareCategory, RecommendationTier } from '../types';

export interface DoorTypeProfile {
  id: DoorType;
  title: string;
  defaultHardware: HardwareCategory[];
  recommendedHingeCount: number;
  description: string;
  defaultTierMappings: Record<string, RecommendationTier>;
}

export interface HardwareTypeDefinition {
  id: HardwareCategory;
  label: string;
  beginnerHelper: string; // "What is this?" plain-language description
  categoryGroup: 'Locking' | 'Hinges' | 'Handles' | 'Control & Closer' | 'Accessories' | 'Specialty';
  defaultTier: RecommendationTier;
  standardQuantity: number;
}

export const DEFAULT_HARDWARE_TYPES: HardwareTypeDefinition[] = [
  {
    id: 'Door Handle',
    label: 'Door Handle / Pull Handle',
    beginnerHelper: 'Lever or pull handle used to grip and unlatch the door comfortably.',
    categoryGroup: 'Handles',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  },
  {
    id: 'Hinges',
    label: 'Door Hinges',
    beginnerHelper: 'Weight-bearing pivot hardware holding the door leaf to the frame (standard doors take 3; heavier/higher doors take 4).',
    categoryGroup: 'Hinges',
    defaultTier: 'REQUIRED',
    standardQuantity: 3
  },
  {
    id: 'Mortise Lock',
    label: 'Mortise Lock',
    beginnerHelper: 'A heavy-duty lock mechanism mortised (recessed) securely inside the door edge, operated by handles and keys.',
    categoryGroup: 'Locking',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  },
  {
    id: 'Cylindrical Lock',
    label: 'Cylindrical Knob / Lever Lock',
    beginnerHelper: 'Round or lever lock installed through a circular bore in the door, ideal for bedrooms, offices, or bathrooms.',
    categoryGroup: 'Locking',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  },
  {
    id: 'Door Closer',
    label: 'Door Closer',
    beginnerHelper: 'Hydraulic overhead arm that automatically pulls the door shut smoothly and silently after someone passes.',
    categoryGroup: 'Control & Closer',
    defaultTier: 'RECOMMENDED',
    standardQuantity: 1
  },
  {
    id: 'Door Stopper',
    label: 'Door Stopper',
    beginnerHelper: 'Prevents the door handle from slamming into the wall or cracking tile/plaster when opened briskly.',
    categoryGroup: 'Accessories',
    defaultTier: 'RECOMMENDED',
    standardQuantity: 1
  },
  {
    id: 'Tower Bolt',
    label: 'Tower Bolt',
    beginnerHelper: 'Internal sliding rod providing quick mechanical latching from the inside for privacy and additional security.',
    categoryGroup: 'Accessories',
    defaultTier: 'RECOMMENDED',
    standardQuantity: 1
  },
  {
    id: 'Aldrop',
    label: 'Aldrop / Traditional Latch',
    beginnerHelper: 'Heavy forged sliding bolt mounted horizontally across the door face, compatible with traditional padlocks.',
    categoryGroup: 'Accessories',
    defaultTier: 'RECOMMENDED',
    standardQuantity: 1
  },
  {
    id: 'Door Viewer',
    label: 'Door Viewer (Peephole)',
    beginnerHelper: 'Wide-angle optical lens in the door allowing you to see who is outside without unlocking.',
    categoryGroup: 'Accessories',
    defaultTier: 'OPTIONAL',
    standardQuantity: 1
  },
  {
    id: 'Door Chain',
    label: 'Safety Door Chain',
    beginnerHelper: 'Steel chain allowing the door to be cracked open 2 to 3 inches safely to inspect or talk to a visitor.',
    categoryGroup: 'Accessories',
    defaultTier: 'OPTIONAL',
    standardQuantity: 1
  },
  {
    id: 'Sliding Door Hardware',
    label: 'Sliding Door Channel & Rollers',
    beginnerHelper: 'Top-hung heavy aluminum track and ball-bearing nylon rollers to glide a sliding door effortlessly.',
    categoryGroup: 'Specialty',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  },
  {
    id: 'Glass Door Hardware',
    label: 'Glass Door Patch Fittings & Floor Spring',
    beginnerHelper: 'Specialized stainless steel clamping brackets and floor spring pivot designed specifically for frameless toughened glass.',
    categoryGroup: 'Specialty',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  },
  {
    id: 'Flush Bolt',
    label: 'Double Door Flush Bolt',
    beginnerHelper: 'Concealed vertical bolts installed into the edge of the secondary leaf of double doors to lock it firmly.',
    categoryGroup: 'Specialty',
    defaultTier: 'REQUIRED',
    standardQuantity: 2
  },
  {
    id: 'Complete Hardware Set',
    label: 'Complete Hardware Set',
    beginnerHelper: 'Recommended all-in-one curated package containing all locks, handles, hinges, and accessories.',
    categoryGroup: 'Specialty',
    defaultTier: 'REQUIRED',
    standardQuantity: 1
  }
];

export const DEFAULT_DOOR_PROFILES: Record<DoorType, DoorTypeProfile> = {
  'Main Entrance Door': {
    id: 'Main Entrance Door',
    title: 'Main Entrance Door',
    defaultHardware: ['Door Handle', 'Mortise Lock', 'Hinges', 'Door Stopper', 'Door Viewer', 'Door Chain', 'Aldrop'],
    recommendedHingeCount: 3,
    description: 'High-security exterior entryway requiring maximum durability, multi-point or heavy mortise locking, and visitor inspection fittings.',
    defaultTierMappings: {
      'Mortise Lock': 'REQUIRED',
      'Hinges': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED',
      'Door Closer': 'RECOMMENDED',
      'Aldrop': 'RECOMMENDED',
      'Door Viewer': 'OPTIONAL',
      'Door Chain': 'OPTIONAL',
      'Tower Bolt': 'OPTIONAL'
    }
  },
  'Wooden Interior Door': {
    id: 'Wooden Interior Door',
    title: 'Wooden Interior Door',
    defaultHardware: ['Door Handle', 'Mortise Lock', 'Hinges', 'Door Stopper', 'Tower Bolt'],
    recommendedHingeCount: 3,
    description: 'Standard wooden or flush interior passage door balancing smooth latching, aesthetic handles, and clean swing.',
    defaultTierMappings: {
      'Hinges': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Mortise Lock': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED',
      'Tower Bolt': 'RECOMMENDED',
      'Door Closer': 'OPTIONAL'
    }
  },
  'Bedroom Door': {
    id: 'Bedroom Door',
    title: 'Bedroom Door',
    defaultHardware: ['Cylindrical Lock', 'Hinges', 'Door Stopper', 'Tower Bolt'],
    recommendedHingeCount: 3,
    description: 'Private bedroom door needing reliable key locking from outside, thumb-turn privacy inside, and silent operation.',
    defaultTierMappings: {
      'Cylindrical Lock': 'REQUIRED',
      'Hinges': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED',
      'Tower Bolt': 'RECOMMENDED',
      'Door Handle': 'OPTIONAL',
      'Door Closer': 'OPTIONAL'
    }
  },
  'Bathroom/Toilet Door': {
    id: 'Bathroom/Toilet Door',
    title: 'Bathroom / Toilet Door',
    defaultHardware: ['Cylindrical Lock', 'Hinges', 'Door Stopper', 'Tower Bolt'],
    recommendedHingeCount: 3,
    description: 'High-humidity environment requiring corrosion-proof SS 304 fittings, emergency coin-release privacy lock, and rust-free hinges.',
    defaultTierMappings: {
      'Cylindrical Lock': 'REQUIRED',
      'Hinges': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED',
      'Tower Bolt': 'RECOMMENDED',
      'Door Closer': 'OPTIONAL'
    }
  },
  'Office Door': {
    id: 'Office Door',
    title: 'Office Door',
    defaultHardware: ['Mortise Lock', 'Door Handle', 'Hinges', 'Door Closer', 'Door Stopper'],
    recommendedHingeCount: 3,
    description: 'Commercial/corporate room with frequent ingress, needing heavy duty overhead hydraulic closer and master-keyable locking.',
    defaultTierMappings: {
      'Mortise Lock': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Hinges': 'REQUIRED',
      'Door Closer': 'RECOMMENDED',
      'Door Stopper': 'RECOMMENDED',
      'Tower Bolt': 'OPTIONAL'
    }
  },
  'Sliding Door': {
    id: 'Sliding Door',
    title: 'Sliding Door',
    defaultHardware: ['Sliding Door Hardware', 'Door Handle', 'Door Stopper'],
    recommendedHingeCount: 0,
    description: 'Space-saving sliding partition or balcony door requiring top track, ball-bearing rollers, floor guide, and flush recess handles.',
    defaultTierMappings: {
      'Sliding Door Hardware': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED'
    }
  },
  'Glass Door': {
    id: 'Glass Door',
    title: 'Glass Door (Frameless)',
    defaultHardware: ['Glass Door Hardware', 'Door Handle'],
    recommendedHingeCount: 0,
    description: 'Toughened glass shopfront or boardroom entrance requiring specialized patch fittings, bottom floor spring, and clamp pull handles.',
    defaultTierMappings: {
      'Glass Door Hardware': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED'
    }
  },
  'Double Door': {
    id: 'Double Door',
    title: 'Double Door (Two Leaves)',
    defaultHardware: ['Door Handle', 'Mortise Lock', 'Hinges', 'Flush Bolt', 'Door Stopper', 'Tower Bolt'],
    recommendedHingeCount: 6, // 3 per leaf
    description: 'Grand pair of doors requiring flush edge shoot bolts on the slave leaf and coordinating handles/locks on the master leaf.',
    defaultTierMappings: {
      'Mortise Lock': 'REQUIRED',
      'Flush Bolt': 'REQUIRED',
      'Hinges': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Door Stopper': 'RECOMMENDED',
      'Aldrop': 'RECOMMENDED',
      'Tower Bolt': 'OPTIONAL'
    }
  },
  'Other': {
    id: 'Other',
    title: 'Custom / Utility Door',
    defaultHardware: ['Door Handle', 'Hinges', 'Mortise Lock', 'Door Stopper'],
    recommendedHingeCount: 3,
    description: 'Versatile configuration for specialty architectural setups, storerooms, or service doors.',
    defaultTierMappings: {
      'Hinges': 'REQUIRED',
      'Door Handle': 'REQUIRED',
      'Mortise Lock': 'RECOMMENDED',
      'Door Stopper': 'RECOMMENDED'
    }
  }
};

const RULES_STORAGE_KEY = 'wh_door_admin_rules';

export function getAdminDoorRules(): Record<DoorType, DoorTypeProfile> {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading admin door rules:', err);
  }
  return DEFAULT_DOOR_PROFILES;
}

export function saveAdminDoorRules(rules: Record<DoorType, DoorTypeProfile>): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.warn('Error saving admin door rules:', err);
  }
}

export function resetAdminDoorRules(): Record<DoorType, DoorTypeProfile> {
  try {
    localStorage.removeItem(RULES_STORAGE_KEY);
  } catch (err) {
    console.warn('Error resetting admin door rules:', err);
  }
  return DEFAULT_DOOR_PROFILES;
}
