import { v4 as uuidv4 } from 'uuid';
import type {
  Property,
  Unit,
  Tenant,
  Lease,
  Payment,
  MaintenanceRequest,
  Vendor,
  MediaAsset,
  Document,
  Note,
  PropertyType,
  UnitType,
  UnitStatus,
  LeaseStatus,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  Layout,
  BuildingFeature,
  CommonSpace,
} from '../types';

// Sample data arrays
const streetNames = ['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Park', 'Lake', 'Hill'];
const streetTypes = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Road', 'Court', 'Lane', 'Way'];
const cities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Oakland', 'Fresno', 'Long Beach'];
const states = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA'];
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companyNames = ['ProFix', 'QuickRepair', 'AllService', 'MasterCraft', 'ExpertMaintenance', 'ReliableWorks'];
const propertyNames = ['Sunset', 'Parkview', 'Riverside', 'Hillside', 'Downtown', 'Lakefront', 'Garden', 'Plaza'];
const propertyDescriptors = ['Apartments', 'Residences', 'Commons', 'Towers', 'Square', 'Court', 'Heights', 'Village'];

const amenities = [
  'Pool', 'Gym', 'Parking', 'Laundry', 'Storage', 'Balcony', 'Patio', 
  'Dishwasher', 'Air Conditioning', 'Heating', 'Cable Ready', 'Internet Ready',
  'Pet Friendly', 'Wheelchair Accessible', 'Security System', 'Gated Community'
];

// Helper functions
const randomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomBool = (probability = 0.5): boolean => Math.random() < probability;
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate real placeholder image URLs
const generateImageUrl = (type: string, seed: string, width = 800, height = 600): string => {
  // Use Picsum.photos for all images - it's reliable and working
  // Add type prefix to seed for variety
  const categorySeeds: Record<string, string> = {
    property: `building-${seed}`,
    unit: `interior-${seed}`,
    maintenance: `tools-${seed}`,
    document: `document-${seed}`,
    floorplan: `blueprint-${seed}`,
    amenity: `amenity-${seed}`,
  };
  
  const finalSeed = categorySeeds[type] || `misc-${seed}`;
  
  // Picsum provides reliable placeholder images
  return `https://picsum.photos/seed/${finalSeed}/${width}/${height}`;
};


// Data generation functions
export const generateProperty = (): Property => {
  const id = uuidv4();
  const name = `${randomElement(propertyNames)} ${randomElement(propertyDescriptors)}`;
  const propertyType = randomElement<PropertyType>(['apartment', 'condo', 'townhouse', 'single-family', 'commercial']);
  const totalUnits = randomInt(4, 50);
  const occupiedUnits = randomInt(0, totalUnits);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  
  // Generate layouts first
  const unitTypes: UnitType[] = ['studio', '1br', '2br', '3br'];
  const layouts = Array.from({ length: randomInt(3, 5) }, () => 
    generateLayout(id, unitTypes)
  );
  
  // Generate units with layout assignments
  const units: Unit[] = [];
  for (let i = 0; i < totalUnits; i++) {
    const unit = generateUnit(id, i + 1);
    // Assign a random layout to each unit
    const matchingLayouts = layouts.filter(l => l.type === unit.type);
    if (matchingLayouts.length > 0) {
      unit.layoutId = randomElement(matchingLayouts).id;
    } else {
      unit.layoutId = layouts[0].id; // Fallback
    }
    units.push(unit);
  }
  
  // Generate building features and common spaces
  const buildingFeatures = Array.from({ length: randomInt(4, 8) }, (_, i) => 
    generateBuildingFeature(i)
  );
  
  const commonSpaces = Array.from({ length: randomInt(3, 6) }, (_, i) => 
    generateCommonSpace(i)
  );
  
  // Calculate monthly revenue from occupied units
  const monthlyRevenue = units
    .filter(u => u.status === 'occupied')
    .reduce((sum, u) => sum + u.rentAmount, 0);
  
  return {
    id,
    name,
    address: {
      street: `${randomInt(100, 9999)} ${randomElement(streetNames)} ${randomElement(streetTypes)}`,
      city: randomElement(cities),
      state: randomElement(states),
      zipCode: randomInt(10000, 99999).toString(),
      country: 'USA',
      coordinates: {
        lat: randomFloat(25, 48),
        lng: randomFloat(-125, -70),
      },
    },
    type: propertyType,
    units,
    layouts,
    amenities: Array.from({ length: randomInt(3, 8) }, () => randomElement(amenities))
      .filter((v, i, a) => a.indexOf(v) === i),
    buildingFeatures,
    commonSpaces,
    images: Array.from({ length: randomInt(5, 10) }, (_, i) => generateMediaAsset('property', id, i)),
    totalUnits,
    occupiedUnits,
    occupancyRate,
    monthlyRevenue,
    managerId: uuidv4(),
    createdAt: randomDate(new Date('2020-01-01'), new Date('2023-01-01')),
    updatedAt: new Date(),
    metadata: {},
  };
};

export const generateUnit = (propertyId: string, unitNumber: number): Unit => {
  const id = `${propertyId}-unit-${unitNumber}`;
  const unitType = randomElement<UnitType>(['studio', '1br', '2br', '3br', '4br']);
  const status = randomElement<UnitStatus>(['available', 'occupied', 'maintenance', 'reserved']);
  
  const bedroomMap: Record<UnitType, number> = {
    'studio': 0,
    '1br': 1,
    '2br': 2,
    '3br': 3,
    '4br': 4,
    'penthouse': randomInt(2, 4),
    'commercial': 0,
  };
  
  const rentMap: Record<UnitType, [number, number]> = {
    'studio': [800, 1200],
    '1br': [1200, 1800],
    '2br': [1800, 2800],
    '3br': [2500, 3800],
    '4br': [3500, 5000],
    'penthouse': [5000, 10000],
    'commercial': [2000, 8000],
  };
  
  const sqftMap: Record<UnitType, [number, number]> = {
    'studio': [400, 600],
    '1br': [600, 900],
    '2br': [900, 1400],
    '3br': [1200, 1800],
    '4br': [1600, 2400],
    'penthouse': [2000, 4000],
    'commercial': [500, 5000],
  };
  
  const [minRent, maxRent] = rentMap[unitType];
  const [minSqft, maxSqft] = sqftMap[unitType];
  const rentAmount = randomInt(minRent, maxRent);
  
  return {
    id,
    propertyId,
    unitNumber: unitNumber.toString().padStart(3, '0'),
    floor: Math.ceil(unitNumber / 10),
    type: unitType,
    layoutId: '', // Will be assigned by generateProperty
    bedrooms: bedroomMap[unitType],
    bathrooms: unitType === 'studio' ? 1 : randomElement([1, 2]),
    squareFeet: randomInt(minSqft, maxSqft),
    rentAmount,
    depositAmount: rentAmount * randomFloat(1, 2),
    status,
    leases: [],
    maintenanceRequests: [],
    images: Array.from({ length: randomInt(3, 6) }, (_, i) => generateMediaAsset('unit', id, i)),
    amenities: Array.from({ length: randomInt(2, 5) }, () => randomElement(amenities))
      .filter((v, i, a) => a.indexOf(v) === i),
    availableDate: status === 'available' ? randomDate(new Date(), new Date('2024-12-31')) : undefined,
    lastRenovation: randomBool(0.3) ? randomDate(new Date('2018-01-01'), new Date()) : undefined,
    metadata: {},
  };
};

export const generateTenant = (): Tenant => {
  const id = uuidv4();
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  
  return {
    id,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
    dateOfBirth: randomDate(new Date('1960-01-01'), new Date('2000-12-31')),
    leases: [],
    emergencyContact: {
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      relationship: randomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
      phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: randomBool() ? `emergency${randomInt(100, 999)}@email.com` : undefined,
    },
    documents: Array.from({ length: randomInt(2, 5) }, () => generateDocument()),
    paymentHistory: [],
    creditScore: randomInt(550, 850),
    backgroundCheckStatus: randomElement(['pending', 'approved', 'rejected']),
    notes: Array.from({ length: randomInt(0, 3) }, () => generateNote()),
    createdAt: randomDate(new Date('2020-01-01'), new Date()),
    updatedAt: new Date(),
  };
};

export const generateLease = (unitId: string, tenantId: string): Lease => {
  const id = uuidv4();
  const startDate = randomDate(new Date('2023-01-01'), new Date());
  const duration = randomElement([6, 12, 24]); // months
  const endDate = new Date(startDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
  const monthlyRent = randomInt(1000, 5000);
  
  return {
    id,
    unitId,
    tenantId,
    startDate,
    endDate,
    monthlyRent,
    depositAmount: monthlyRent * randomFloat(1, 2),
    status: randomElement<LeaseStatus>(['active', 'expired', 'terminated', 'renewed']),
    terms: 'Standard lease agreement terms and conditions apply.',
    documents: Array.from({ length: randomInt(1, 3) }, () => generateDocument()),
    payments: [],
    violations: [],
    renewalOptions: randomBool(0.7) ? {
      eligible: true,
      proposedRent: monthlyRent * randomFloat(1.02, 1.08),
      proposedStartDate: endDate,
      proposedEndDate: new Date(endDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      status: randomElement(['pending', 'accepted', 'rejected']),
    } : undefined,
    createdAt: startDate,
    updatedAt: new Date(),
  };
};

export const generatePayment = (leaseId: string, tenantId: string, dueDate: Date): Payment => {
  const id = uuidv4();
  const amount = randomInt(1000, 5000);
  const isPaid = randomBool(0.85);
  const isLate = !isPaid && dueDate < new Date();
  
  return {
    id,
    leaseId,
    tenantId,
    amount,
    dueDate,
    paidDate: isPaid ? randomDate(dueDate, new Date()) : undefined,
    status: isPaid ? 'paid' : isLate ? 'late' : 'pending',
    method: isPaid ? randomElement(['ach', 'credit_card', 'check', 'online']) : undefined,
    transactionId: isPaid ? `TXN-${randomInt(100000, 999999)}` : undefined,
    lateFee: isLate ? randomInt(25, 100) : undefined,
    notes: randomBool(0.1) ? 'Payment note' : undefined,
  };
};

export const generateMaintenanceRequest = (unitId: string, tenantId?: string): MaintenanceRequest => {
  const id = uuidv4();
  const category = randomElement<MaintenanceCategory>(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'cosmetic', 'pest', 'other']);
  const priority = randomElement<MaintenancePriority>(['emergency', 'high', 'medium', 'low']);
  const status = randomElement<MaintenanceStatus>(['open', 'assigned', 'in_progress', 'completed', 'cancelled']);
  
  const titles: Record<MaintenanceCategory, string[]> = {
    plumbing: ['Leaking faucet', 'Clogged drain', 'Running toilet', 'Low water pressure'],
    electrical: ['Power outlet not working', 'Light fixture issue', 'Circuit breaker tripping'],
    hvac: ['AC not cooling', 'Heater not working', 'Thermostat malfunction'],
    appliance: ['Refrigerator not cooling', 'Dishwasher leaking', 'Oven not heating'],
    structural: ['Crack in wall', 'Door not closing properly', 'Window seal broken'],
    cosmetic: ['Paint peeling', 'Carpet stain', 'Tile cracked'],
    pest: ['Ant infestation', 'Mice problem', 'Cockroaches spotted'],
    other: ['General maintenance needed', 'Inspection required'],
  };
  
  return {
    id,
    unitId,
    tenantId,
    category,
    priority,
    status,
    title: randomElement(titles[category]),
    description: 'Detailed description of the maintenance issue.',
    images: Array.from({ length: randomInt(0, 3) }, (_, i) => generateMediaAsset('maintenance', id, i)),
    assignedTo: status !== 'open' ? uuidv4() : undefined,
    scheduledDate: status === 'assigned' ? randomDate(new Date(), new Date('2024-12-31')) : undefined,
    completedDate: status === 'completed' ? randomDate(new Date('2023-01-01'), new Date()) : undefined,
    cost: status === 'completed' ? randomInt(50, 1000) : undefined,
    notes: Array.from({ length: randomInt(0, 2) }, () => generateNote()),
    createdAt: randomDate(new Date('2023-01-01'), new Date()),
    updatedAt: new Date(),
  };
};

export const generateVendor = (): Vendor => {
  const id = uuidv4();
  const specialties = Array.from(
    { length: randomInt(1, 3) }, 
    () => randomElement<MaintenanceCategory>(['plumbing', 'electrical', 'hvac', 'appliance', 'structural'])
  ).filter((v, i, a) => a.indexOf(v) === i);
  
  return {
    id,
    companyName: `${randomElement(companyNames)} ${randomElement(['LLC', 'Inc', 'Services', 'Solutions'])}`,
    contactName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
    email: `contact@${randomElement(companyNames).toLowerCase()}.com`,
    phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
    specialties: specialties as MaintenanceCategory[],
    rating: randomFloat(3.5, 5),
    insuranceExpiry: randomDate(new Date(), new Date('2025-12-31')),
    licenseNumber: `LIC-${randomInt(100000, 999999)}`,
    hourlyRate: randomInt(50, 200),
    emergencyAvailable: randomBool(0.6),
  };
};

export const generateMediaAsset = (type: string, entityId: string, index: number): MediaAsset => {
  const id = uuidv4();
  const seed = `${entityId}-${index}-${id}`;
  const width = randomInt(1200, 1920);
  const height = randomInt(800, 1080);
  
  return {
    id,
    url: generateImageUrl(type, seed, width, height),
    thumbnailUrl: generateImageUrl(type, seed, 400, 300),
    type: 'image',
    title: `${type}_${index + 1}.jpg`,
    description: `${type} image ${index + 1}`,
    tags: [type],
    propertyId: type === 'property' ? entityId : undefined,
    unitId: type === 'unit' ? entityId : undefined,
    uploadedBy: uuidv4(),
    uploadedAt: randomDate(new Date('2023-01-01'), new Date()),
    size: randomInt(100000, 5000000),
    dimensions: {
      width,
      height,
    },
    googleDriveId: id,
    metadata: {},
  };
};

export const generateLayout = (propertyId: string, unitTypes: UnitType[]): Layout => {
  const id = uuidv4();
  const type = randomElement(unitTypes);
  
  const layoutNames: Record<UnitType, string[]> = {
    'studio': ['Cozy Studio', 'Modern Studio', 'Open Studio', 'Efficient Studio'],
    '1br': ['Urban One', 'Classic One Bedroom', 'Premium One', 'Deluxe Single'],
    '2br': ['Spacious Two', 'Family Two Bedroom', 'Executive Two', 'Corner Two'],
    '3br': ['Grand Three', 'Luxury Three Bedroom', 'Penthouse Three', 'Premium Three'],
    '4br': ['Estate Four', 'Presidential Four', 'Grand Four Bedroom', 'Luxury Estate'],
    'penthouse': ['Sky Penthouse', 'Luxury Penthouse', 'Grand Penthouse', 'Premium Sky Suite'],
    'commercial': ['Commercial Space', 'Retail Space', 'Office Suite', 'Business Center'],
  };
  
  const bedroomMap: Record<UnitType, number> = {
    'studio': 0,
    '1br': 1,
    '2br': 2,
    '3br': 3,
    '4br': 4,
    'penthouse': randomInt(2, 4),
    'commercial': 0,
  };
  
  const features = [
    'Walk-in Closets', 'Granite Countertops', 'Stainless Steel Appliances', 
    'Hardwood Floors', 'Private Balcony', 'In-Unit Washer/Dryer',
    'Floor-to-Ceiling Windows', 'Smart Home Features', 'Custom Lighting',
    'Designer Fixtures', 'Spa Bathroom', 'Kitchen Island'
  ];
  
  const baseRent = randomInt(800, 5000);
  const availableUnitsCount = randomInt(0, 10);
  const totalUnits = randomInt(5, 20);
  
  // Generate unit availability details
  const unitAvailability = availableUnitsCount > 0 ? Array.from({ length: availableUnitsCount }, () => {
    const floor = randomInt(1, 15);
    const unitLetter = String.fromCharCode(65 + randomInt(0, 6)); // A-F
    const unitNumber = `${floor}${randomInt(0, 9)}${unitLetter}`;
    const today = new Date();
    const daysFromNow = randomInt(-7, 60); // Some immediately available, some up to 60 days out
    const availableDate = new Date(today);
    availableDate.setDate(today.getDate() + daysFromNow);
    
    const specialOffers = [
      '1 Month Free Rent',
      '$500 Off First Month',
      'No Security Deposit',
      'Free Parking for 6 Months',
      'Reduced Application Fee',
      ''
    ];
    
    return {
      unitNumber,
      floor,
      availableDate,
      isImmediatelyAvailable: daysFromNow <= 0,
      rentAmount: baseRent + randomInt(-200, 300), // Some variation in rent
      depositAmount: baseRent,
      specialOffer: randomElement(specialOffers) || undefined,
    };
  }) : [];
  
  return {
    id,
    propertyId,
    name: randomElement(layoutNames[type]),
    type,
    bedrooms: bedroomMap[type],
    bathrooms: type === 'studio' ? 1 : Math.min(bedroomMap[type], 2),
    squareFeet: randomInt(
      type === 'studio' ? 400 : 600 * bedroomMap[type], 
      type === 'studio' ? 700 : 900 * bedroomMap[type]
    ),
    description: `Beautiful ${type} layout featuring modern amenities and thoughtful design.`,
    features: Array.from({ length: randomInt(4, 8) }, () => randomElement(features))
      .filter((v, i, a) => a.indexOf(v) === i),
    marketingImages: Array.from({ length: randomInt(3, 6) }, (_, i) => 
      generateMediaAsset('layout', id, i)
    ),
    floorPlan: generateMediaAsset('floorplan', id, 0),
    virtual3DTour: randomBool(0.7) ? `https://my.matterport.com/show/?m=${id}` : undefined,
    baseRent,
    availableUnits: availableUnitsCount,
    totalUnits,
    unitAvailability: unitAvailability.length > 0 ? unitAvailability : undefined,
  };
};

export const generateBuildingFeature = (index: number): BuildingFeature => {
  const id = uuidv4();
  
  const features = [
    { name: '24/7 Security', description: 'Round-the-clock security personnel and surveillance', category: 'security' as const },
    { name: 'Keyless Entry', description: 'Smart lock system with app control', category: 'technology' as const },
    { name: 'EV Charging', description: 'Electric vehicle charging stations', category: 'sustainability' as const },
    { name: 'Package Concierge', description: 'Secure package receiving and storage', category: 'convenience' as const },
    { name: 'Elevator Access', description: 'Modern elevators with card access', category: 'accessibility' as const },
    { name: 'Solar Panels', description: 'Renewable energy generation', category: 'sustainability' as const },
    { name: 'Fiber Internet', description: 'High-speed fiber optic internet', category: 'technology' as const },
    { name: 'Pet Spa', description: 'Professional pet grooming station', category: 'convenience' as const },
  ];
  
  const feature = features[index % features.length];
  
  return {
    id,
    name: feature.name,
    description: feature.description,
    category: feature.category,
    icon: undefined,
    images: Array.from({ length: randomInt(1, 3) }, (_, i) => 
      generateMediaAsset('amenity', id, i)
    ),
  };
};

export const generateCommonSpace = (index: number): CommonSpace => {
  const id = uuidv4();
  
  const spaces: Array<{type: CommonSpace['type'], name: string, features: string[]}> = [
    { type: 'gym', name: 'Fitness Center', features: ['Cardio Equipment', 'Free Weights', 'Yoga Studio', 'Personal Training'] },
    { type: 'pool', name: 'Resort-Style Pool', features: ['Heated Pool', 'Hot Tub', 'Cabanas', 'BBQ Grills'] },
    { type: 'lounge', name: 'Resident Lounge', features: ['WiFi', 'Coffee Bar', 'TVs', 'Comfortable Seating'] },
    { type: 'rooftop', name: 'Rooftop Terrace', features: ['City Views', 'Fire Pits', 'Outdoor Kitchen', 'Seating Areas'] },
    { type: 'business_center', name: 'Business Center', features: ['Private Offices', 'Conference Room', 'Printing', 'High-Speed Internet'] },
    { type: 'game_room', name: 'Game Room', features: ['Billiards', 'Arcade Games', 'Board Games', 'Large TV'] },
    { type: 'courtyard', name: 'Landscaped Courtyard', features: ['Gardens', 'Walking Paths', 'Seating', 'Water Features'] },
    { type: 'theater', name: 'Media Room', features: ['Projector', 'Surround Sound', 'Stadium Seating', 'Streaming Services'] },
  ];
  
  const space = spaces[index % spaces.length];
  
  return {
    id,
    name: space.name,
    type: space.type,
    description: `Enjoy our ${space.name} with premium amenities and modern design.`,
    features: space.features,
    images: Array.from({ length: randomInt(2, 4) }, (_, i) => 
      generateMediaAsset('amenity', id, i)
    ),
    hoursOfOperation: space.type === 'gym' || space.type === 'business_center' 
      ? '24/7' 
      : '7:00 AM - 10:00 PM',
    requiresReservation: ['business_center', 'theater', 'rooftop'].includes(space.type),
    capacity: randomInt(10, 50),
  };
};

export const generateDocument = (): Document => {
  const id = uuidv4();
  const types = ['lease', 'id', 'proof_of_income', 'reference', 'insurance', 'other'];
  const type = randomElement(types) as Document['type'];
  
  return {
    id,
    type,
    title: `${type.replace('_', ' ')} document`,
    url: generateImageUrl('document', id, 800, 1100),
    uploadedAt: randomDate(new Date('2023-01-01'), new Date()),
    expiresAt: randomBool(0.5) ? randomDate(new Date(), new Date('2025-12-31')) : undefined,
    verified: randomBool(0.8),
    metadata: {},
  };
};

export const generateNote = (): Note => {
  return {
    id: uuidv4(),
    content: 'Note content here',
    authorId: uuidv4(),
    createdAt: randomDate(new Date('2023-01-01'), new Date()),
    isPrivate: randomBool(0.3),
  };
};

// Import Solhem properties
import { generateSolhemProperties } from './solhemData';

// Bulk generation functions
export const generateFullDataset = () => {
  const properties = generateSolhemProperties();
  const tenants = Array.from({ length: 50 }, () => generateTenant());
  const vendors = Array.from({ length: 10 }, () => generateVendor());
  const leases: Lease[] = [];
  const payments: Payment[] = [];
  const maintenanceRequests: MaintenanceRequest[] = [];
  
  // Assign tenants to units and create leases
  properties.forEach(property => {
    const occupiedUnits = property.units.filter(u => u.status === 'occupied');
    occupiedUnits.forEach((unit, index) => {
      if (index < tenants.length) {
        const tenant = tenants[index];
        const lease = generateLease(unit.id, tenant.id);
        leases.push(lease);
        
        // Generate payment history
        const monthsCount = 12;
        for (let month = 0; month < monthsCount; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() - month);
          payments.push(generatePayment(lease.id, tenant.id, dueDate));
        }
        
        // Generate maintenance requests
        if (randomBool(0.4)) {
          maintenanceRequests.push(generateMaintenanceRequest(unit.id, tenant.id));
        }
      }
    });
    
    // Generate some maintenance requests for empty units
    property.units
      .filter(u => u.status === 'maintenance')
      .forEach(unit => {
        maintenanceRequests.push(generateMaintenanceRequest(unit.id));
      });
  });
  
  return {
    properties,
    tenants,
    vendors,
    leases,
    payments,
    maintenanceRequests,
  };
};