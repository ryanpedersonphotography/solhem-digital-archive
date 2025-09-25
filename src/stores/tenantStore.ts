import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Tenant, Lease, Payment, Document, Note } from '../types';

interface TenantState {
  tenants: Tenant[];
  selectedTenantId: string | null;
  
  // Actions
  setTenants: (tenants: Tenant[]) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  selectTenant: (id: string | null) => void;
  
  // Lease operations
  addLease: (tenantId: string, lease: Lease) => void;
  updateLease: (tenantId: string, leaseId: string, updates: Partial<Lease>) => void;
  
  // Payment operations
  addPayment: (tenantId: string, payment: Payment) => void;
  updatePaymentStatus: (tenantId: string, paymentId: string, status: Payment['status']) => void;
  
  // Document operations
  addDocument: (tenantId: string, document: Document) => void;
  removeDocument: (tenantId: string, documentId: string) => void;
  
  // Note operations
  addNote: (tenantId: string, note: Note) => void;
  
  // Computed getters
  getTenant: (id: string) => Tenant | undefined;
  getSelectedTenant: () => Tenant | undefined;
  getActiveTenants: () => Tenant[];
  getTenantsByProperty: (propertyId: string) => Tenant[];
  getTenantPaymentHistory: (tenantId: string) => Payment[];
  getTenantsWithLatePayments: () => Tenant[];
  
  // Search
  searchTenants: (query: string) => Tenant[];
}

const useTenantStore = create<TenantState>()(
  devtools(
    persist(
      (set, get) => ({
        tenants: [],
        selectedTenantId: null,

        setTenants: (tenants) => set({ tenants }),
        
        addTenant: (tenant) => 
          set((state) => ({ 
            tenants: [...state.tenants, tenant] 
          })),
        
        updateTenant: (id, updates) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
            ),
          })),
        
        deleteTenant: (id) =>
          set((state) => ({
            tenants: state.tenants.filter((t) => t.id !== id),
            selectedTenantId: state.selectedTenantId === id ? null : state.selectedTenantId,
          })),
        
        selectTenant: (id) => set({ selectedTenantId: id }),
        
        addLease: (tenantId, lease) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? { ...t, leases: [...t.leases, lease], updatedAt: new Date() }
                : t
            ),
          })),
        
        updateLease: (tenantId, leaseId, updates) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? {
                    ...t,
                    leases: t.leases.map((l) =>
                      l.id === leaseId ? { ...l, ...updates } : l
                    ),
                    updatedAt: new Date(),
                  }
                : t
            ),
          })),
        
        addPayment: (tenantId, payment) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? { ...t, paymentHistory: [...t.paymentHistory, payment], updatedAt: new Date() }
                : t
            ),
          })),
        
        updatePaymentStatus: (tenantId, paymentId, status) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? {
                    ...t,
                    paymentHistory: t.paymentHistory.map((p) =>
                      p.id === paymentId ? { ...p, status, paidDate: status === 'paid' ? new Date() : p.paidDate } : p
                    ),
                    updatedAt: new Date(),
                  }
                : t
            ),
          })),
        
        addDocument: (tenantId, document) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? { ...t, documents: [...t.documents, document], updatedAt: new Date() }
                : t
            ),
          })),
        
        removeDocument: (tenantId, documentId) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? { ...t, documents: t.documents.filter((d) => d.id !== documentId), updatedAt: new Date() }
                : t
            ),
          })),
        
        addNote: (tenantId, note) =>
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === tenantId
                ? { ...t, notes: [...t.notes, note], updatedAt: new Date() }
                : t
            ),
          })),
        
        getTenant: (id) => get().tenants.find((t) => t.id === id),
        
        getSelectedTenant: () => {
          const state = get();
          return state.selectedTenantId 
            ? state.tenants.find((t) => t.id === state.selectedTenantId)
            : undefined;
        },
        
        getActiveTenants: () =>
          get().tenants.filter((t) =>
            t.leases.some((l) => l.status === 'active')
          ),
        
        getTenantsByProperty: (propertyId) =>
          get().tenants.filter((t) =>
            t.leases.some((l) => l.unitId?.startsWith(propertyId))
          ),
        
        getTenantPaymentHistory: (tenantId) => {
          const tenant = get().tenants.find((t) => t.id === tenantId);
          return tenant?.paymentHistory || [];
        },
        
        getTenantsWithLatePayments: () =>
          get().tenants.filter((t) =>
            t.paymentHistory.some((p) => p.status === 'late')
          ),
        
        searchTenants: (query) => {
          const lowerQuery = query.toLowerCase();
          return get().tenants.filter(
            (t) =>
              t.firstName.toLowerCase().includes(lowerQuery) ||
              t.lastName.toLowerCase().includes(lowerQuery) ||
              t.email.toLowerCase().includes(lowerQuery) ||
              t.phone.includes(query)
          );
        },
      }),
      {
        name: 'tenant-storage',
      }
    )
  )
);

export default useTenantStore;