// Core domain types for the apartment management system

export interface Property {
  id: string;
  name: string;
  address: Address;
  type: PropertyType;
  units: Unit[];
  layouts: Layout[];
  amenities: string[];
  buildingFeatures: BuildingFeature[];
  commonSpaces: CommonSpace[];
  images: MediaAsset[];
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type PropertyType = 'apartment' | 'condo' | 'townhouse' | 'single-family' | 'commercial';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  type: UnitType;
  layoutId: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  depositAmount: number;
  status: UnitStatus;
  tenant?: Tenant;
  leases: Lease[];
  maintenanceRequests: MaintenanceRequest[];
  images: MediaAsset[];
  amenities: string[];
  availableDate?: Date;
  lastRenovation?: Date;
  metadata: Record<string, any>;
}

export type UnitType = 'studio' | '1br' | '2br' | '3br' | '4br' | 'penthouse' | 'commercial';
export type UnitStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'renovation';

export interface Layout {
  id: string;
  propertyId: string;
  name: string;
  type: UnitType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  description: string;
  features: string[];
  marketingImages: MediaAsset[];
  floorPlan?: MediaAsset;
  virtual3DTour?: string;
  baseRent: number;
  availableUnits: number;
  totalUnits: number;
  unitAvailability?: UnitAvailability[];
}

export interface UnitAvailability {
  unitNumber: string;
  floor: number;
  availableDate: Date;
  isImmediatelyAvailable: boolean;
  rentAmount: number;
  depositAmount: number;
  specialOffer?: string;
}

export interface BuildingFeature {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'accessibility' | 'technology' | 'sustainability' | 'convenience';
  icon?: string;
  images: MediaAsset[];
}

export interface CommonSpace {
  id: string;
  name: string;
  type: 'lobby' | 'gym' | 'pool' | 'lounge' | 'rooftop' | 'courtyard' | 'business_center' | 'game_room' | 'theater' | 'other';
  description: string;
  features: string[];
  images: MediaAsset[];
  hoursOfOperation?: string;
  requiresReservation: boolean;
  capacity?: number;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  ssn?: string; // Encrypted
  currentUnitId?: string;
  leases: Lease[];
  emergencyContact: EmergencyContact;
  documents: Document[];
  paymentHistory: Payment[];
  creditScore?: number;
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected';
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  depositAmount: number;
  status: LeaseStatus;
  terms: string;
  documents: Document[];
  payments: Payment[];
  violations: Violation[];
  renewalOptions?: LeaseRenewal;
  createdAt: Date;
  updatedAt: Date;
}

export type LeaseStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';

export interface LeaseRenewal {
  eligible: boolean;
  proposedRent: number;
  proposedStartDate: Date;
  proposedEndDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Payment {
  id: string;
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
  lateFee?: number;
  notes?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'late' | 'partial' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'check' | 'ach' | 'credit_card' | 'debit_card' | 'online';

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  tenantId?: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  images: MediaAsset[];
  assignedTo?: string;
  vendor?: Vendor;
  scheduledDate?: Date;
  completedDate?: Date;
  cost?: number;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'cosmetic' | 'pest' | 'other';
export type MaintenancePriority = 'emergency' | 'high' | 'medium' | 'low';
export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specialties: MaintenanceCategory[];
  rating: number;
  insuranceExpiry: Date;
  licenseNumber?: string;
  hourlyRate?: number;
  emergencyAvailable: boolean;
}

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  title: string;
  description?: string;
  tags: string[];
  propertyId?: string;
  unitId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  googleDriveId?: string; // For Google Drive integration
  metadata: Record<string, any>;
}

export type MediaType = 'image' | 'video' | 'document' | 'floor_plan' | '3d_tour';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
  verified: boolean;
  metadata: Record<string, any>;
}

export type DocumentType = 'lease' | 'id' | 'proof_of_income' | 'reference' | 'insurance' | 'other';

export interface Note {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  isPrivate: boolean;
}

export interface Violation {
  id: string;
  leaseId: string;
  type: ViolationType;
  description: string;
  dateOccurred: Date;
  resolved: boolean;
  resolvedDate?: Date;
  fineAmount?: number;
}

export type ViolationType = 'noise' | 'damage' | 'late_payment' | 'unauthorized_occupant' | 'pet_violation' | 'other';

// Financial Types
export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  outstandingRent: number;
  occupancyRate: number;
  averageRent: number;
  periodStart: Date;
  periodEnd: Date;
}

// User Management
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  properties: string[]; // Property IDs this user can access
  permissions: Permission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'maintenance' | 'tenant' | 'viewer';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Analytics Types
export interface PropertyAnalytics {
  propertyId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  occupancyTrend: DataPoint[];
  revenueTrend: DataPoint[];
  maintenanceCosts: DataPoint[];
  averageRentByUnitType: Record<UnitType, number>;
  tenantTurnoverRate: number;
  averageDaysToFill: number;
}

export interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}