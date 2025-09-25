import { v4 as uuidv4 } from 'uuid';
import type {
  Property,
  Unit,
  Layout,
  BuildingFeature,
  CommonSpace,
  PropertyType,
  UnitType,
  UnitStatus,
  MediaAsset,
} from '../types';

// Helper functions
const randomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;

// Generate image URLs
const generateImageUrl = (type: string, seed: string, width = 800, height = 600): string => {
  const categorySeeds: Record<string, string> = {
    property: `building-${seed}`,
    unit: `interior-${seed}`,
    floorplan: `blueprint-${seed}`,
    amenity: `amenity-${seed}`,
    common: `common-${seed}`,
  };
  
  const finalSeed = categorySeeds[type] || `misc-${seed}`;
  return `https://picsum.photos/seed/${finalSeed}/${width}/${height}`;
};

// Generate media assets
const generateMediaAsset = (type: string, propertyId: string, index: number): MediaAsset => {
  const id = `${propertyId}-${type}-${index}`;
  return {
    id,
    propertyId,
    url: generateImageUrl(type, id),
    type: 'image',
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
    description: `${type} image for property`,
    tags: [type],
    uploadedAt: new Date(),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpeg',
    },
  };
};

// Generate layouts
const generateLayout = (propertyId: string, type: UnitType, index: number): Layout => {
  const sqftMap: Record<UnitType, [number, number]> = {
    'studio': [400, 600],
    '1br': [650, 850],
    '2br': [900, 1200],
    '3br': [1300, 1800],
    '4br': [1800, 2400],
    'penthouse': [2000, 4000],
    'commercial': [500, 5000],
  };
  
  const [minSqft, maxSqft] = sqftMap[type];
  const sqft = randomInt(minSqft, maxSqft);
  
  return {
    id: `${propertyId}-layout-${type}-${index}`,
    propertyId,
    name: `${type.toUpperCase()} Layout ${String.fromCharCode(65 + index)}`,
    type,
    squareFeet: sqft,
    bedrooms: type === 'studio' ? 0 : parseInt(type.charAt(0)) || 2,
    bathrooms: type === 'studio' ? 1 : type === '1br' ? 1 : 2,
    floorPlanUrl: generateImageUrl('floorplan', `${propertyId}-${type}-${index}`, 1200, 900),
    description: `Modern ${type} layout with open concept design`,
    virtualTourUrl: `https://my.matterport.com/show/?m=example${index}`,
    features: [],
  };
};

// Generate units with specific pricing for each property
const generateUnit = (propertyId: string, unitNumber: number, propertyName: string): Unit => {
  const id = `${propertyId}-unit-${unitNumber}`;
  const unitType = randomElement<UnitType>(['studio', '1br', '2br', '3br']);
  const status = randomElement<UnitStatus>(['available', 'occupied', 'maintenance', 'reserved']);
  
  // Different pricing based on property
  const rentMap: Record<string, Record<UnitType, [number, number]>> = {
    'The Archive': {
      'studio': [1400, 1800],
      '1br': [1800, 2400],
      '2br': [2600, 3400],
      '3br': [3500, 4500],
      '4br': [4000, 5500],
      'penthouse': [5000, 8000],
      'commercial': [2000, 8000],
    },
    'Lucille': {
      'studio': [1200, 1600],
      '1br': [1600, 2200],
      '2br': [2400, 3200],
      '3br': [3200, 4200],
      '4br': [3800, 5200],
      'penthouse': [4500, 7500],
      'commercial': [2000, 6000],
    },
    'The Fred': {
      'studio': [1500, 1900],
      '1br': [1900, 2500],
      '2br': [2700, 3600],
      '3br': [3600, 4800],
      '4br': [4200, 5800],
      'penthouse': [5500, 8500],
      'commercial': [2500, 8500],
    },
  };
  
  const propertyRentMap = rentMap[propertyName] || rentMap['Lucille'];
  const [minRent, maxRent] = propertyRentMap[unitType];
  const rentAmount = randomInt(minRent, maxRent);
  
  const bedroomMap: Record<UnitType, number> = {
    'studio': 0,
    '1br': 1,
    '2br': 2,
    '3br': 3,
    '4br': 4,
    'penthouse': randomInt(2, 4),
    'commercial': 0,
  };
  
  return {
    id,
    propertyId,
    unitNumber: unitNumber.toString().padStart(3, '0'),
    floor: Math.ceil(unitNumber / 10),
    type: unitType,
    layoutId: '', // Will be assigned later
    bedrooms: bedroomMap[unitType],
    bathrooms: unitType === 'studio' ? 1 : randomElement([1, 2]),
    squareFeet: 0, // Will be set from layout
    rentAmount,
    depositAmount: rentAmount,
    status,
    leases: [],
    maintenanceRequests: [],
    amenities: [],
    images: Array.from({ length: randomInt(3, 6) }, (_, i) => generateMediaAsset('unit', id, i)),
    availableDate: status === 'available' ? new Date() : null,
    lastRenovation: new Date(2022, randomInt(0, 11), randomInt(1, 28)),
    createdAt: new Date(2021, randomInt(0, 11), randomInt(1, 28)),
    updatedAt: new Date(),
    metadata: {},
  };
};

// Solhem Properties Data
export const generateSolhemProperties = (): Property[] => {
  const properties: Property[] = [];
  
  // The Archive North Loop
  const archiveId = uuidv4();
  const archiveFeatures: BuildingFeature[] = [
    { id: '1', name: 'Art Gallery Hallways', description: 'Featuring 100+ commercial artworks', icon: '🎨' },
    { id: '2', name: 'Rooftop Deck', description: 'Fire-pits, grills, and movie screen', icon: '🏙️' },
    { id: '3', name: 'Finnish Cedar Sauna', description: 'Authentic Finnish relaxation experience', icon: '🧖' },
    { id: '4', name: 'Golf Simulator', description: 'State-of-the-art virtual golf experience', icon: '⛳' },
    { id: '5', name: 'Spin Room', description: 'Private cycling studio', icon: '🚴' },
    { id: '6', name: 'Underground Parking', description: '3 levels of temperature-controlled parking', icon: '🚗' },
    { id: '7', name: 'Pet Wash Station', description: 'On-site pet grooming facility', icon: '🐕' },
    { id: '8', name: 'Bike Storage', description: '300+ secure bike racks', icon: '🚲' },
  ];
  
  const archiveCommonSpaces: CommonSpace[] = [
    { id: '1', name: 'Sunlit Library Lounge', type: 'lounge', capacity: 30, description: 'Quiet study and reading area' },
    { id: '2', name: 'Fitness Center', type: 'fitness', capacity: 50, description: 'State-of-the-art equipment' },
    { id: '3', name: 'Yoga & Barre Studio', type: 'fitness', capacity: 20, description: 'Dedicated yoga and barre space' },
    { id: '4', name: "Community Chef's Kitchen", type: 'kitchen', capacity: 15, description: 'Professional-grade cooking space' },
    { id: '5', name: 'Resident Boardroom', type: 'meeting', capacity: 12, description: 'Professional meeting space' },
    { id: '6', name: 'Rooftop Dog Run', type: 'outdoor', capacity: 20, description: 'Dedicated pet exercise area' },
  ];
  
  // Generate layouts for Archive
  const archiveLayouts = [
    generateLayout(archiveId, 'studio', 0),
    generateLayout(archiveId, '1br', 0),
    generateLayout(archiveId, '1br', 1),
    generateLayout(archiveId, '2br', 0),
    generateLayout(archiveId, '2br', 1),
  ];
  
  // Generate units for Archive
  const archiveUnits: Unit[] = [];
  for (let i = 1; i <= 200; i++) {
    const unit = generateUnit(archiveId, i, 'The Archive');
    // Assign a matching layout
    const matchingLayouts = archiveLayouts.filter(l => l.type === unit.type);
    if (matchingLayouts.length > 0) {
      const layout = randomElement(matchingLayouts);
      unit.layoutId = layout.id;
      unit.squareFeet = layout.squareFeet;
    }
    archiveUnits.push(unit);
  }
  
  const occupiedArchiveUnits = archiveUnits.filter(u => u.status === 'occupied').length;
  
  properties.push({
    id: archiveId,
    name: 'The Archive North Loop',
    address: {
      street: '110 N 1st Street',
      city: 'Minneapolis',
      state: 'MN',
      zipCode: '55401',
      country: 'USA',
      coordinates: {
        lat: 44.9847,
        lng: -93.2736,
      },
    },
    type: 'apartment' as PropertyType,
    units: archiveUnits,
    layouts: archiveLayouts,
    amenities: [
      'Pool', 'Gym', 'Parking', 'Laundry', 'Storage', 'Balcony',
      'Air Conditioning', 'Internet Ready', 'Pet Friendly',
      'Wheelchair Accessible', 'Security System',
    ],
    buildingFeatures: archiveFeatures,
    commonSpaces: archiveCommonSpaces,
    images: Array.from({ length: 8 }, (_, i) => generateMediaAsset('property', archiveId, i)),
    totalUnits: 200,
    occupiedUnits: occupiedArchiveUnits,
    occupancyRate: (occupiedArchiveUnits / 200) * 100,
    monthlyRevenue: archiveUnits
      .filter(u => u.status === 'occupied')
      .reduce((sum, u) => sum + u.rentAmount, 0),
    managerId: uuidv4(),
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date(),
    metadata: {
      floors: 8,
      yearBuilt: 2021,
      commercialSpace: '3,000 sq ft',
      website: 'https://archivempls.com',
      phone: '612.643.5232',
    },
  });
  
  // Lucille Apartments
  const lucilleId = uuidv4();
  const lucilleFeatures: BuildingFeature[] = [
    { id: '1', name: 'Two-Story Fireside Lounge', description: 'Spacious gathering area with fireplace', icon: '🔥' },
    { id: '2', name: 'Rooftop Cinema', description: 'Outdoor movie screening area', icon: '🎬' },
    { id: '3', name: 'Year-Round Finnish Sauna', description: 'Traditional sauna experience', icon: '🧖' },
    { id: '4', name: 'Home Movie Theatre', description: 'Private screening room', icon: '🎭' },
    { id: '5', name: 'Work-From-Home Areas', description: 'Dedicated remote work spaces', icon: '💼' },
    { id: '6', name: 'Pet-Friendly Amenities', description: 'Full pet support services', icon: '🐾' },
  ];
  
  const lucilleCommonSpaces: CommonSpace[] = [
    { id: '1', name: 'Fireside Lounge', type: 'lounge', capacity: 40, description: 'Two-story gathering space' },
    { id: '2', name: 'Gym & Yoga Studio', type: 'fitness', capacity: 30, description: 'Full fitness facilities' },
    { id: '3', name: 'Rooftop Deck', type: 'outdoor', capacity: 60, description: 'Entertainment and relaxation area' },
    { id: '4', name: 'Co-Working Space', type: 'meeting', capacity: 25, description: 'Modern work environment' },
    { id: '5', name: 'Cinema Room', type: 'entertainment', capacity: 20, description: 'Private movie theatre' },
  ];
  
  // Generate layouts for Lucille
  const lucilleLayouts = [
    generateLayout(lucilleId, 'studio', 0),
    generateLayout(lucilleId, '1br', 0),
    generateLayout(lucilleId, '1br', 1),
    generateLayout(lucilleId, '2br', 0),
    generateLayout(lucilleId, '2br', 1),
    generateLayout(lucilleId, '3br', 0),
  ];
  
  // Generate units for Lucille (estimated 150 units based on typical size)
  const lucilleUnits: Unit[] = [];
  for (let i = 1; i <= 150; i++) {
    const unit = generateUnit(lucilleId, i, 'Lucille');
    const matchingLayouts = lucilleLayouts.filter(l => l.type === unit.type);
    if (matchingLayouts.length > 0) {
      const layout = randomElement(matchingLayouts);
      unit.layoutId = layout.id;
      unit.squareFeet = layout.squareFeet;
    }
    lucilleUnits.push(unit);
  }
  
  const occupiedLucilleUnits = lucilleUnits.filter(u => u.status === 'occupied').length;
  
  properties.push({
    id: lucilleId,
    name: 'Lucille Apartments',
    address: {
      street: '1025 Main Street NE',
      city: 'Minneapolis',
      state: 'MN',
      zipCode: '55413',
      country: 'USA',
      coordinates: {
        lat: 45.0022,
        lng: -93.2568,
      },
    },
    type: 'apartment' as PropertyType,
    units: lucilleUnits,
    layouts: lucilleLayouts,
    amenities: [
      'Gym', 'Parking', 'Laundry', 'Storage', 'Balcony',
      'Air Conditioning', 'Internet Ready', 'Pet Friendly',
      'Security System',
    ],
    buildingFeatures: lucilleFeatures,
    commonSpaces: lucilleCommonSpaces,
    images: Array.from({ length: 8 }, (_, i) => generateMediaAsset('property', lucilleId, i)),
    totalUnits: 150,
    occupiedUnits: occupiedLucilleUnits,
    occupancyRate: (occupiedLucilleUnits / 150) * 100,
    monthlyRevenue: lucilleUnits
      .filter(u => u.status === 'occupied')
      .reduce((sum, u) => sum + u.rentAmount, 0),
    managerId: uuidv4(),
    createdAt: new Date('2020-06-01'),
    updatedAt: new Date(),
    metadata: {
      yearBuilt: 2020,
      neighborhood: 'Northeast Minneapolis Arts District',
      website: 'https://lucillempls.com',
      phone: '612.643.5141',
      promotion: 'Up to TWO MONTHS FREE',
    },
  });
  
  // The Fred Edina
  const fredId = uuidv4();
  const fredFeatures: BuildingFeature[] = [
    { id: '1', name: '25-Yard Lap Pool', description: 'Resort-style swimming pool', icon: '🏊' },
    { id: '2', name: 'Hot Tub', description: 'Year-round relaxation', icon: '♨️' },
    { id: '3', name: 'Finnish Sauna', description: 'Authentic sauna experience', icon: '🧖' },
    { id: '4', name: 'Virtual Reality Golf Simulator', description: 'State-of-the-art golf experience', icon: '⛳' },
    { id: '5', name: 'Indoor Sport Court', description: 'Multi-purpose athletic facility', icon: '🏀' },
    { id: '6', name: 'EV Charging Stations', description: 'Electric vehicle support', icon: '🔌' },
    { id: '7', name: 'Dog Run', description: 'Dedicated pet exercise area', icon: '🐕' },
    { id: '8', name: 'Stormwater Recycling', description: 'Sustainable water management', icon: '♻️' },
  ];
  
  const fredCommonSpaces: CommonSpace[] = [
    { id: '1', name: 'Resort Pool Area', type: 'outdoor', capacity: 100, description: '25-yard lap pool and hot tub' },
    { id: '2', name: '24/7 Fitness Center', type: 'fitness', capacity: 60, description: 'Comprehensive workout facility' },
    { id: '3', name: 'Sport Court', type: 'fitness', capacity: 30, description: 'Indoor basketball and sports' },
    { id: '4', name: 'Pub & Clubhouse', type: 'lounge', capacity: 80, description: 'Social gathering space with bar' },
    { id: '5', name: 'Rooftop Patios', type: 'outdoor', capacity: 50, description: 'Multiple rooftop spaces with fire pits' },
    { id: '6', name: 'Private Work Spaces', type: 'meeting', capacity: 40, description: 'Professional work environment' },
  ];
  
  // Generate layouts for Fred
  const fredLayouts = [
    generateLayout(fredId, '1br', 0),
    generateLayout(fredId, '1br', 1),
    generateLayout(fredId, '2br', 0),
    generateLayout(fredId, '2br', 1),
    generateLayout(fredId, '2br', 2),
    generateLayout(fredId, '3br', 0),
  ];
  
  // Generate units for Fred (400+ units)
  const fredUnits: Unit[] = [];
  for (let i = 1; i <= 420; i++) {
    const unit = generateUnit(fredId, i, 'The Fred');
    const matchingLayouts = fredLayouts.filter(l => l.type === unit.type);
    if (matchingLayouts.length > 0) {
      const layout = randomElement(matchingLayouts);
      unit.layoutId = layout.id;
      unit.squareFeet = layout.squareFeet;
    }
    fredUnits.push(unit);
  }
  
  const occupiedFredUnits = fredUnits.filter(u => u.status === 'occupied').length;
  
  properties.push({
    id: fredId,
    name: 'The Fred Edina',
    address: {
      street: '4660 W 77th Street',
      city: 'Edina',
      state: 'MN',
      zipCode: '55435',
      country: 'USA',
      coordinates: {
        lat: 44.8697,
        lng: -93.3481,
      },
    },
    type: 'apartment' as PropertyType,
    units: fredUnits,
    layouts: fredLayouts,
    amenities: [
      'Pool', 'Gym', 'Parking', 'Laundry', 'Storage', 'Balcony', 'Patio',
      'Air Conditioning', 'Internet Ready', 'Pet Friendly',
      'Wheelchair Accessible', 'Security System',
    ],
    buildingFeatures: fredFeatures,
    commonSpaces: fredCommonSpaces,
    images: Array.from({ length: 10 }, (_, i) => generateMediaAsset('property', fredId, i)),
    totalUnits: 420,
    occupiedUnits: occupiedFredUnits,
    occupancyRate: (occupiedFredUnits / 420) * 100,
    monthlyRevenue: fredUnits
      .filter(u => u.status === 'occupied')
      .reduce((sum, u) => sum + u.rentAmount, 0),
    managerId: uuidv4(),
    createdAt: new Date('2022-03-01'),
    updatedAt: new Date(),
    metadata: {
      floors: 8,
      yearBuilt: 2022,
      parkAdjacent: '43-acre Fred Richards Park',
      website: 'https://frededina.com',
      phone: '612.643.5665',
      sustainability: 'LEED Certified',
    },
  });
  
  return properties;
};