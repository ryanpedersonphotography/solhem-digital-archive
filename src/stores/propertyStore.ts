import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Property, Unit, UnitStatus } from '../types';

interface PropertyState {
  properties: Property[];
  selectedPropertyId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  selectProperty: (id: string | null) => void;
  
  // Unit operations
  addUnit: (propertyId: string, unit: Unit) => void;
  updateUnit: (propertyId: string, unitId: string, updates: Partial<Unit>) => void;
  deleteUnit: (propertyId: string, unitId: string) => void;
  updateUnitStatus: (propertyId: string, unitId: string, status: UnitStatus) => void;
  
  // Computed getters
  getProperty: (id: string) => Property | undefined;
  getSelectedProperty: () => Property | undefined;
  getUnit: (propertyId: string, unitId: string) => Unit | undefined;
  getPropertyStats: (propertyId: string) => {
    totalUnits: number;
    occupiedUnits: number;
    availableUnits: number;
    occupancyRate: number;
    monthlyRevenue: number;
  } | null;
  
  // Search and filter
  searchProperties: (query: string) => Property[];
  getPropertiesByOccupancy: (minRate: number) => Property[];
}

const usePropertyStore = create<PropertyState>()(
  devtools(
    persist(
      (set, get) => ({
        properties: [],
        selectedPropertyId: null,
        loading: false,
        error: null,

        setProperties: (properties) => set({ properties }),
        
        addProperty: (property) => 
          set((state) => ({ 
            properties: [...state.properties, property] 
          })),
        
        updateProperty: (id, updates) =>
          set((state) => ({
            properties: state.properties.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
            ),
          })),
        
        deleteProperty: (id) =>
          set((state) => ({
            properties: state.properties.filter((p) => p.id !== id),
            selectedPropertyId: state.selectedPropertyId === id ? null : state.selectedPropertyId,
          })),
        
        selectProperty: (id) => set({ selectedPropertyId: id }),
        
        addUnit: (propertyId, unit) =>
          set((state) => ({
            properties: state.properties.map((p) => {
              if (p.id === propertyId) {
                const updatedProperty = {
                  ...p,
                  units: [...p.units, unit],
                  totalUnits: p.totalUnits + 1,
                  updatedAt: new Date(),
                };
                // Recalculate occupancy
                const occupiedUnits = updatedProperty.units.filter(u => u.status === 'occupied').length;
                updatedProperty.occupiedUnits = occupiedUnits;
                updatedProperty.occupancyRate = (occupiedUnits / updatedProperty.totalUnits) * 100;
                return updatedProperty;
              }
              return p;
            }),
          })),
        
        updateUnit: (propertyId, unitId, updates) =>
          set((state) => ({
            properties: state.properties.map((p) => {
              if (p.id === propertyId) {
                const updatedUnits = p.units.map((u) =>
                  u.id === unitId ? { ...u, ...updates } : u
                );
                const occupiedUnits = updatedUnits.filter(u => u.status === 'occupied').length;
                return {
                  ...p,
                  units: updatedUnits,
                  occupiedUnits,
                  occupancyRate: (occupiedUnits / p.totalUnits) * 100,
                  updatedAt: new Date(),
                };
              }
              return p;
            }),
          })),
        
        deleteUnit: (propertyId, unitId) =>
          set((state) => ({
            properties: state.properties.map((p) => {
              if (p.id === propertyId) {
                const updatedUnits = p.units.filter((u) => u.id !== unitId);
                const occupiedUnits = updatedUnits.filter(u => u.status === 'occupied').length;
                return {
                  ...p,
                  units: updatedUnits,
                  totalUnits: updatedUnits.length,
                  occupiedUnits,
                  occupancyRate: updatedUnits.length > 0 ? (occupiedUnits / updatedUnits.length) * 100 : 0,
                  updatedAt: new Date(),
                };
              }
              return p;
            }),
          })),
        
        updateUnitStatus: (propertyId, unitId, status) =>
          set((state) => ({
            properties: state.properties.map((p) => {
              if (p.id === propertyId) {
                const updatedUnits = p.units.map((u) =>
                  u.id === unitId ? { ...u, status } : u
                );
                const occupiedUnits = updatedUnits.filter(u => u.status === 'occupied').length;
                return {
                  ...p,
                  units: updatedUnits,
                  occupiedUnits,
                  occupancyRate: (occupiedUnits / p.totalUnits) * 100,
                  monthlyRevenue: updatedUnits
                    .filter(u => u.status === 'occupied')
                    .reduce((sum, u) => sum + u.rentAmount, 0),
                  updatedAt: new Date(),
                };
              }
              return p;
            }),
          })),
        
        getProperty: (id) => get().properties.find((p) => p.id === id),
        
        getSelectedProperty: () => {
          const state = get();
          return state.selectedPropertyId 
            ? state.properties.find((p) => p.id === state.selectedPropertyId)
            : undefined;
        },
        
        getUnit: (propertyId, unitId) => {
          const property = get().properties.find((p) => p.id === propertyId);
          return property?.units.find((u) => u.id === unitId);
        },
        
        getPropertyStats: (propertyId) => {
          const property = get().properties.find((p) => p.id === propertyId);
          if (!property) return null;
          
          const availableUnits = property.units.filter(u => u.status === 'available').length;
          
          return {
            totalUnits: property.totalUnits,
            occupiedUnits: property.occupiedUnits,
            availableUnits,
            occupancyRate: property.occupancyRate,
            monthlyRevenue: property.monthlyRevenue,
          };
        },
        
        searchProperties: (query) => {
          const lowerQuery = query.toLowerCase();
          return get().properties.filter(
            (p) =>
              p.name.toLowerCase().includes(lowerQuery) ||
              p.address.street.toLowerCase().includes(lowerQuery) ||
              p.address.city.toLowerCase().includes(lowerQuery)
          );
        },
        
        getPropertiesByOccupancy: (minRate) =>
          get().properties.filter((p) => p.occupancyRate >= minRate),
      }),
      {
        name: 'property-storage',
      }
    )
  )
);

export default usePropertyStore;