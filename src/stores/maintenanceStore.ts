import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MaintenanceRequest, Vendor, Note, MaintenanceStatus, MaintenancePriority } from '../types';

interface MaintenanceState {
  requests: MaintenanceRequest[];
  vendors: Vendor[];
  selectedRequestId: string | null;
  
  // Request Actions
  setRequests: (requests: MaintenanceRequest[]) => void;
  addRequest: (request: MaintenanceRequest) => void;
  updateRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
  deleteRequest: (id: string) => void;
  selectRequest: (id: string | null) => void;
  
  // Vendor Actions
  setVendors: (vendors: Vendor[]) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  
  // Request Operations
  assignVendor: (requestId: string, vendorId: string) => void;
  updateRequestStatus: (requestId: string, status: MaintenanceStatus) => void;
  scheduleRequest: (requestId: string, date: Date) => void;
  completeRequest: (requestId: string, cost: number, notes?: string) => void;
  addRequestNote: (requestId: string, note: Note) => void;
  
  // Computed getters
  getRequest: (id: string) => MaintenanceRequest | undefined;
  getSelectedRequest: () => MaintenanceRequest | undefined;
  getRequestsByUnit: (unitId: string) => MaintenanceRequest[];
  getRequestsByProperty: (propertyId: string) => MaintenanceRequest[];
  getRequestsByStatus: (status: MaintenanceStatus) => MaintenanceRequest[];
  getRequestsByPriority: (priority: MaintenancePriority) => MaintenanceRequest[];
  getEmergencyRequests: () => MaintenanceRequest[];
  getOverdueRequests: () => MaintenanceRequest[];
  getVendor: (id: string) => Vendor | undefined;
  getVendorsBySpecialty: (category: string) => Vendor[];
  getMaintenanceStats: () => {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    emergency: number;
    avgCompletionTime: number;
    totalCost: number;
  };
}

const useMaintenanceStore = create<MaintenanceState>()(
  devtools(
    persist(
      (set, get) => ({
        requests: [],
        vendors: [],
        selectedRequestId: null,

        setRequests: (requests) => set({ requests }),
        
        addRequest: (request) => 
          set((state) => ({ 
            requests: [...state.requests, request] 
          })),
        
        updateRequest: (id, updates) =>
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
            ),
          })),
        
        deleteRequest: (id) =>
          set((state) => ({
            requests: state.requests.filter((r) => r.id !== id),
            selectedRequestId: state.selectedRequestId === id ? null : state.selectedRequestId,
          })),
        
        selectRequest: (id) => set({ selectedRequestId: id }),
        
        setVendors: (vendors) => set({ vendors }),
        
        addVendor: (vendor) =>
          set((state) => ({
            vendors: [...state.vendors, vendor],
          })),
        
        updateVendor: (id, updates) =>
          set((state) => ({
            vendors: state.vendors.map((v) =>
              v.id === id ? { ...v, ...updates } : v
            ),
          })),
        
        deleteVendor: (id) =>
          set((state) => ({
            vendors: state.vendors.filter((v) => v.id !== id),
          })),
        
        assignVendor: (requestId, vendorId) =>
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    assignedTo: vendorId,
                    vendor: state.vendors.find((v) => v.id === vendorId),
                    status: 'assigned' as MaintenanceStatus,
                    updatedAt: new Date(),
                  }
                : r
            ),
          })),
        
        updateRequestStatus: (requestId, status) =>
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === requestId
                ? { ...r, status, updatedAt: new Date() }
                : r
            ),
          })),
        
        scheduleRequest: (requestId, date) =>
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === requestId
                ? { ...r, scheduledDate: date, status: 'assigned' as MaintenanceStatus, updatedAt: new Date() }
                : r
            ),
          })),
        
        completeRequest: (requestId, cost, notes) =>
          set((state) => ({
            requests: state.requests.map((r) => {
              if (r.id === requestId) {
                const updatedRequest = {
                  ...r,
                  status: 'completed' as MaintenanceStatus,
                  completedDate: new Date(),
                  cost,
                  updatedAt: new Date(),
                };
                if (notes) {
                  updatedRequest.notes = [
                    ...r.notes,
                    {
                      id: `note-${Date.now()}`,
                      content: notes,
                      authorId: 'system',
                      createdAt: new Date(),
                      isPrivate: false,
                    },
                  ];
                }
                return updatedRequest;
              }
              return r;
            }),
          })),
        
        addRequestNote: (requestId, note) =>
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === requestId
                ? { ...r, notes: [...r.notes, note], updatedAt: new Date() }
                : r
            ),
          })),
        
        getRequest: (id) => get().requests.find((r) => r.id === id),
        
        getSelectedRequest: () => {
          const state = get();
          return state.selectedRequestId
            ? state.requests.find((r) => r.id === state.selectedRequestId)
            : undefined;
        },
        
        getRequestsByUnit: (unitId) =>
          get().requests.filter((r) => r.unitId === unitId),
        
        getRequestsByProperty: (propertyId) =>
          get().requests.filter((r) => r.unitId?.startsWith(propertyId)),
        
        getRequestsByStatus: (status) =>
          get().requests.filter((r) => r.status === status),
        
        getRequestsByPriority: (priority) =>
          get().requests.filter((r) => r.priority === priority),
        
        getEmergencyRequests: () =>
          get().requests.filter((r) => r.priority === 'emergency' && r.status !== 'completed'),
        
        getOverdueRequests: () => {
          const now = new Date();
          const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          return get().requests.filter(
            (r) =>
              r.status !== 'completed' &&
              r.createdAt < threeDaysAgo &&
              r.priority !== 'low'
          );
        },
        
        getVendor: (id) => get().vendors.find((v) => v.id === id),
        
        getVendorsBySpecialty: (category) =>
          get().vendors.filter((v) => v.specialties.includes(category as any)),
        
        getMaintenanceStats: () => {
          const requests = get().requests;
          const completed = requests.filter((r) => r.status === 'completed');
          
          const avgCompletionTime = completed.length > 0
            ? completed.reduce((sum, r) => {
                if (r.completedDate && r.createdAt) {
                  const diff = new Date(r.completedDate).getTime() - new Date(r.createdAt).getTime();
                  return sum + diff / (1000 * 60 * 60 * 24); // Convert to days
                }
                return sum;
              }, 0) / completed.length
            : 0;
          
          return {
            total: requests.length,
            open: requests.filter((r) => r.status === 'open').length,
            inProgress: requests.filter((r) => r.status === 'in_progress').length,
            completed: completed.length,
            emergency: requests.filter((r) => r.priority === 'emergency').length,
            avgCompletionTime,
            totalCost: completed.reduce((sum, r) => sum + (r.cost || 0), 0),
          };
        },
      }),
      {
        name: 'maintenance-storage',
      }
    )
  )
);

export default useMaintenanceStore;