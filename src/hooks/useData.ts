import { useEffect, useState } from 'react';
import dataService from '../services/dataService';
import usePropertyStore from '../stores/propertyStore';
import useTenantStore from '../stores/tenantStore';
import useMaintenanceStore from '../stores/maintenanceStore';
import useFinancialStore from '../stores/financialStore';

// Hook to initialize data on app load
export const useInitializeData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await dataService.initializeWithMockData();
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize data');
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return { isLoading, error };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const properties = usePropertyStore(state => state.properties);
  const tenants = useTenantStore(state => state.tenants);
  const requests = useMaintenanceStore(state => state.requests);
  const payments = useFinancialStore(state => state.payments);

  useEffect(() => {
    const fetchStats = async () => {
      const dashboardStats = await dataService.getDashboardStats();
      setStats(dashboardStats);
      setIsLoading(false);
    };

    fetchStats();
  }, [properties, tenants, requests, payments]);

  return { stats, isLoading };
};

// Hook for property data with auto-refresh
export const useProperties = () => {
  const properties = usePropertyStore(state => state.properties);
  const selectedPropertyId = usePropertyStore(state => state.selectedPropertyId);
  const selectProperty = usePropertyStore(state => state.selectProperty);
  const searchProperties = usePropertyStore(state => state.searchProperties);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;

  return {
    properties,
    selectedPropertyId,
    selectedProperty,
    selectProperty,
    searchProperties,
  };
};

// Hook for tenant data
export const useTenants = () => {
  const tenants = useTenantStore(state => state.tenants);
  const selectedTenantId = useTenantStore(state => state.selectedTenantId);
  const activeTenants = tenants.filter(t => t.leases.some(l => l.status === 'active'));
  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || null;
  const selectTenant = useTenantStore(state => state.selectTenant);
  const searchTenants = useTenantStore(state => state.searchTenants);

  return {
    tenants,
    activeTenants,
    selectedTenantId,
    selectedTenant,
    selectTenant,
    searchTenants,
  };
};

// Hook for maintenance data
export const useMaintenance = () => {
  const requests = useMaintenanceStore(state => state.requests);
  const vendors = useMaintenanceStore(state => state.vendors);
  const emergencyRequests = requests.filter(r => r.priority === 'emergency' && r.status !== 'completed');
  const overdueRequests = requests.filter(r => 
    r.status === 'open' && 
    r.scheduledDate && 
    new Date(r.scheduledDate) < new Date()
  );
  const maintenanceStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'open').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    emergency: emergencyRequests.length,
    overdue: overdueRequests.length
  };

  return {
    requests,
    vendors,
    emergencyRequests,
    overdueRequests,
    maintenanceStats,
  };
};

// Hook for financial data
export const useFinancials = () => {
  const payments = useFinancialStore(state => state.payments);
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const latePayments = payments.filter(p => 
    p.status === 'pending' && 
    new Date(p.dueDate) < now &&
    new Date(p.dueDate) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  );
  
  const upcomingPayments = payments.filter(p => 
    p.status === 'pending' && 
    new Date(p.dueDate) >= now &&
    new Date(p.dueDate) <= sevenDaysFromNow
  );
  
  const overduePayments = payments.filter(p => 
    p.status === 'pending' && 
    new Date(p.dueDate) < now
  );
  
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOutstanding = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const financialMetrics = {
    totalRevenue,
    totalOutstanding,
    collectionRate: totalRevenue > 0 ? 
      (totalRevenue / (totalRevenue + totalOutstanding)) * 100 : 0,
    averageRentAmount: payments.length > 0 ?
      payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
  };

  return {
    payments,
    latePayments,
    upcomingPayments,
    overduePayments,
    financialMetrics,
    totalRevenue,
    totalOutstanding,
  };
};

// Hook for property-specific data
export const usePropertyDetails = (propertyId: string) => {
  const properties = usePropertyStore(state => state.properties);
  const allTenants = useTenantStore(state => state.tenants);
  const allRequests = useMaintenanceStore(state => state.requests);
  const allPayments = useFinancialStore(state => state.payments);
  
  const property = properties.find(p => p.id === propertyId);
  
  // Get tenants that have leases in units of this property
  const tenants = allTenants.filter(t => {
    if (!property) return false;
    const unitIds = property.units.map(u => u.id);
    return t.leases.some(l => unitIds.includes(l.unitId) && l.status === 'active');
  });
  
  // Get maintenance requests for units in this property
  const maintenanceRequests = allRequests.filter(r => {
    if (!property) return false;
    const unitIds = property.units.map(u => u.id);
    return r.unitId && unitIds.includes(r.unitId);
  });
  
  // Calculate revenue from tenants in this property
  const tenantIds = tenants.map(t => t.id);
  const revenue = allPayments
    .filter(p => tenantIds.includes(p.tenantId) && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const stats = property ? {
    totalUnits: property.totalUnits,
    occupiedUnits: property.occupiedUnits,
    occupancyRate: property.occupancyRate,
    monthlyRevenue: property.monthlyRevenue
  } : null;

  return {
    property,
    stats,
    tenants,
    maintenanceRequests,
    revenue,
  };
};

// Hook for unit-specific data
export const useUnitDetails = (propertyId: string, unitId: string) => {
  const properties = usePropertyStore(state => state.properties);
  const allRequests = useMaintenanceStore(state => state.requests);
  
  const property = properties.find(p => p.id === propertyId);
  const unit = property?.units.find(u => u.id === unitId);
  const maintenanceRequests = allRequests.filter(r => r.unitId === unitId);

  return {
    unit,
    maintenanceRequests,
  };
};

// Hook for tenant-specific data
export const useTenantDetails = (tenantId: string) => {
  const tenants = useTenantStore(state => state.tenants);
  const allPayments = useFinancialStore(state => state.payments);
  
  const tenant = tenants.find(t => t.id === tenantId);
  const payments = allPayments.filter(p => p.tenantId === tenantId);
  const paymentHistory = tenant?.paymentHistory || [];

  return {
    tenant,
    paymentHistory,
    payments,
  };
};