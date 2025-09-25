import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Payment, FinancialSummary, PaymentStatus } from '../types';

interface FinancialState {
  payments: Payment[];
  summaries: FinancialSummary[];
  
  // Payment Actions
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  recordPayment: (paymentId: string, method: Payment['method'], transactionId?: string) => void;
  applyLateFee: (paymentId: string, fee: number) => void;
  refundPayment: (paymentId: string, reason: string) => void;
  
  // Summary Actions
  setSummaries: (summaries: FinancialSummary[]) => void;
  generateMonthlySummary: (year: number, month: number) => FinancialSummary;
  generateYearlySummary: (year: number) => FinancialSummary;
  
  // Computed getters
  getPayment: (id: string) => Payment | undefined;
  getPaymentsByLease: (leaseId: string) => Payment[];
  getPaymentsByTenant: (tenantId: string) => Payment[];
  getPaymentsByStatus: (status: PaymentStatus) => Payment[];
  getLatePayments: () => Payment[];
  getUpcomingPayments: (days?: number) => Payment[];
  getOverduePayments: () => Payment[];
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => Payment[];
  getTotalRevenue: (startDate?: Date, endDate?: Date) => number;
  getTotalOutstanding: () => number;
  getRevenueByProperty: (propertyId: string, startDate?: Date, endDate?: Date) => number;
  getFinancialMetrics: () => {
    totalRevenue: number;
    totalOutstanding: number;
    totalLate: number;
    collectionRate: number;
    avgPaymentDelay: number;
    monthlyRecurring: number;
  };
}

const useFinancialStore = create<FinancialState>()(
  devtools(
    persist(
      (set, get) => ({
        payments: [],
        summaries: [],

        setPayments: (payments) => set({ payments }),
        
        addPayment: (payment) => 
          set((state) => ({ 
            payments: [...state.payments, payment] 
          })),
        
        updatePayment: (id, updates) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),
        
        deletePayment: (id) =>
          set((state) => ({
            payments: state.payments.filter((p) => p.id !== id),
          })),
        
        recordPayment: (paymentId, method, transactionId) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    status: 'paid' as PaymentStatus,
                    paidDate: new Date(),
                    method,
                    transactionId,
                  }
                : p
            ),
          })),
        
        applyLateFee: (paymentId, fee) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    lateFee: fee,
                    amount: p.amount + fee,
                    status: 'late' as PaymentStatus,
                  }
                : p
            ),
          })),
        
        refundPayment: (paymentId, reason) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    status: 'refunded' as PaymentStatus,
                    notes: `Refunded: ${reason}`,
                  }
                : p
            ),
          })),
        
        setSummaries: (summaries) => set({ summaries }),
        
        generateMonthlySummary: (year, month) => {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);
          const payments = get().getPaymentsByDateRange(startDate, endDate);
          
          const paidPayments = payments.filter((p) => p.status === 'paid');
          const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
          const outstandingPayments = payments.filter((p) => 
            p.status === 'pending' || p.status === 'late' || p.status === 'partial'
          );
          const outstandingRent = outstandingPayments.reduce((sum, p) => sum + p.amount, 0);
          
          const summary: FinancialSummary = {
            totalRevenue,
            totalExpenses: 0, // Would be calculated from expense records
            netIncome: totalRevenue,
            outstandingRent,
            occupancyRate: 0, // Would be calculated from property data
            averageRent: payments.length > 0 ? totalRevenue / payments.length : 0,
            periodStart: startDate,
            periodEnd: endDate,
          };
          
          set((state) => ({
            summaries: [...state.summaries.filter((s) => 
              !(s.periodStart.getTime() === startDate.getTime() && 
                s.periodEnd.getTime() === endDate.getTime())
            ), summary],
          }));
          
          return summary;
        },
        
        generateYearlySummary: (year) => {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31);
          const payments = get().getPaymentsByDateRange(startDate, endDate);
          
          const paidPayments = payments.filter((p) => p.status === 'paid');
          const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
          const outstandingPayments = payments.filter((p) => 
            p.status === 'pending' || p.status === 'late' || p.status === 'partial'
          );
          const outstandingRent = outstandingPayments.reduce((sum, p) => sum + p.amount, 0);
          
          const summary: FinancialSummary = {
            totalRevenue,
            totalExpenses: 0,
            netIncome: totalRevenue,
            outstandingRent,
            occupancyRate: 0,
            averageRent: payments.length > 0 ? totalRevenue / payments.length : 0,
            periodStart: startDate,
            periodEnd: endDate,
          };
          
          set((state) => ({
            summaries: [...state.summaries.filter((s) => 
              !(s.periodStart.getTime() === startDate.getTime() && 
                s.periodEnd.getTime() === endDate.getTime())
            ), summary],
          }));
          
          return summary;
        },
        
        getPayment: (id) => get().payments.find((p) => p.id === id),
        
        getPaymentsByLease: (leaseId) =>
          get().payments.filter((p) => p.leaseId === leaseId),
        
        getPaymentsByTenant: (tenantId) =>
          get().payments.filter((p) => p.tenantId === tenantId),
        
        getPaymentsByStatus: (status) =>
          get().payments.filter((p) => p.status === status),
        
        getLatePayments: () =>
          get().payments.filter((p) => p.status === 'late'),
        
        getUpcomingPayments: (days = 7) => {
          const now = new Date();
          const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          return get().payments.filter(
            (p) =>
              p.status === 'pending' &&
              p.dueDate >= now &&
              p.dueDate <= future
          );
        },
        
        getOverduePayments: () => {
          const now = new Date();
          return get().payments.filter(
            (p) =>
              (p.status === 'pending' || p.status === 'late') &&
              p.dueDate < now
          );
        },
        
        getPaymentsByDateRange: (startDate, endDate) =>
          get().payments.filter(
            (p) =>
              (p.paidDate && p.paidDate >= startDate && p.paidDate <= endDate) ||
              (p.dueDate >= startDate && p.dueDate <= endDate)
          ),
        
        getTotalRevenue: (startDate, endDate) => {
          let payments = get().payments.filter((p) => p.status === 'paid');
          if (startDate && endDate) {
            payments = payments.filter(
              (p) => p.paidDate && p.paidDate >= startDate && p.paidDate <= endDate
            );
          }
          return payments.reduce((sum, p) => sum + p.amount, 0);
        },
        
        getTotalOutstanding: () =>
          get().payments
            .filter((p) => p.status === 'pending' || p.status === 'late' || p.status === 'partial')
            .reduce((sum, p) => sum + p.amount, 0),
        
        getRevenueByProperty: (propertyId, startDate, endDate) => {
          let payments = get().payments.filter(
            (p) => p.status === 'paid' && p.leaseId?.startsWith(propertyId)
          );
          if (startDate && endDate) {
            payments = payments.filter(
              (p) => p.paidDate && p.paidDate >= startDate && p.paidDate <= endDate
            );
          }
          return payments.reduce((sum, p) => sum + p.amount, 0);
        },
        
        getFinancialMetrics: () => {
          const payments = get().payments;
          const paidPayments = payments.filter((p) => p.status === 'paid');
          const latePayments = payments.filter((p) => p.status === 'late');
          const pendingPayments = payments.filter((p) => p.status === 'pending');
          
          const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
          const totalOutstanding = [...pendingPayments, ...latePayments]
            .reduce((sum, p) => sum + p.amount, 0);
          const totalLate = latePayments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
          
          const collectionRate = payments.length > 0
            ? (paidPayments.length / payments.length) * 100
            : 0;
          
          const avgPaymentDelay = paidPayments.length > 0
            ? paidPayments.reduce((sum, p) => {
                if (p.paidDate && p.dueDate) {
                  const delay = (new Date(p.paidDate).getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24);
                  return sum + Math.max(0, delay);
                }
                return sum;
              }, 0) / paidPayments.length
            : 0;
          
          const currentMonth = new Date().getMonth();
          const monthlyPayments = payments.filter((p) => 
            p.dueDate.getMonth() === currentMonth && p.status !== 'failed'
          );
          const monthlyRecurring = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
          
          return {
            totalRevenue,
            totalOutstanding,
            totalLate,
            collectionRate,
            avgPaymentDelay,
            monthlyRecurring,
          };
        },
      }),
      {
        name: 'financial-storage',
      }
    )
  )
);

export default useFinancialStore;