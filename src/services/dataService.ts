import usePropertyStore from '../stores/propertyStore';
import useTenantStore from '../stores/tenantStore';
import useMaintenanceStore from '../stores/maintenanceStore';
import useFinancialStore from '../stores/financialStore';
import { generateFullDataset } from '../utils/dataGenerator';
import type { Property, Tenant, MaintenanceRequest, Payment } from '../types';

// API service layer that can be easily swapped with real API calls
class DataService {
  private initialized = false;

  // Initialize stores with generated data
  async initializeWithMockData(): Promise<void> {
    if (this.initialized) return;
    
    const dataset = generateFullDataset();
    
    // Load data into stores
    usePropertyStore.getState().setProperties(dataset.properties);
    useTenantStore.getState().setTenants(dataset.tenants);
    useMaintenanceStore.getState().setRequests(dataset.maintenanceRequests);
    useMaintenanceStore.getState().setVendors(dataset.vendors);
    useFinancialStore.getState().setPayments(dataset.payments);
    
    // Update tenants with their leases
    dataset.leases.forEach(lease => {
      useTenantStore.getState().addLease(lease.tenantId, lease);
    });
    
    // Update units with their tenants
    dataset.properties.forEach(property => {
      property.units.forEach(unit => {
        if (unit.status === 'occupied') {
          const lease = dataset.leases.find(l => l.unitId === unit.id && l.status === 'active');
          if (lease) {
            const tenant = dataset.tenants.find(t => t.id === lease.tenantId);
            if (tenant) {
              unit.tenant = tenant;
              tenant.currentUnitId = unit.id;
            }
          }
        }
      });
    });
    
    this.initialized = true;
    console.log('✅ Data service initialized with mock data');
  }

  // Property API methods
  async getProperties(): Promise<Property[]> {
    await this.ensureInitialized();
    return usePropertyStore.getState().properties;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    await this.ensureInitialized();
    return usePropertyStore.getState().getProperty(id);
  }

  async createProperty(property: Property): Promise<Property> {
    await this.ensureInitialized();
    usePropertyStore.getState().addProperty(property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    await this.ensureInitialized();
    usePropertyStore.getState().updateProperty(id, updates);
    return usePropertyStore.getState().getProperty(id);
  }

  async deleteProperty(id: string): Promise<boolean> {
    await this.ensureInitialized();
    usePropertyStore.getState().deleteProperty(id);
    return true;
  }

  // Tenant API methods
  async getTenants(): Promise<Tenant[]> {
    await this.ensureInitialized();
    return useTenantStore.getState().tenants;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    await this.ensureInitialized();
    return useTenantStore.getState().getTenant(id);
  }

  async createTenant(tenant: Tenant): Promise<Tenant> {
    await this.ensureInitialized();
    useTenantStore.getState().addTenant(tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    await this.ensureInitialized();
    useTenantStore.getState().updateTenant(id, updates);
    return useTenantStore.getState().getTenant(id);
  }

  async deleteTenant(id: string): Promise<boolean> {
    await this.ensureInitialized();
    useTenantStore.getState().deleteTenant(id);
    return true;
  }

  // Maintenance API methods
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    await this.ensureInitialized();
    return useMaintenanceStore.getState().requests;
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    await this.ensureInitialized();
    return useMaintenanceStore.getState().getRequest(id);
  }

  async createMaintenanceRequest(request: MaintenanceRequest): Promise<MaintenanceRequest> {
    await this.ensureInitialized();
    useMaintenanceStore.getState().addRequest(request);
    return request;
  }

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    await this.ensureInitialized();
    useMaintenanceStore.getState().updateRequest(id, updates);
    return useMaintenanceStore.getState().getRequest(id);
  }

  async deleteMaintenanceRequest(id: string): Promise<boolean> {
    await this.ensureInitialized();
    useMaintenanceStore.getState().deleteRequest(id);
    return true;
  }

  // Financial API methods
  async getPayments(): Promise<Payment[]> {
    await this.ensureInitialized();
    return useFinancialStore.getState().payments;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    await this.ensureInitialized();
    return useFinancialStore.getState().getPayment(id);
  }

  async recordPayment(paymentId: string, method: Payment['method'], transactionId?: string): Promise<Payment | undefined> {
    await this.ensureInitialized();
    useFinancialStore.getState().recordPayment(paymentId, method, transactionId);
    return useFinancialStore.getState().getPayment(paymentId);
  }

  async getFinancialMetrics() {
    await this.ensureInitialized();
    return useFinancialStore.getState().getFinancialMetrics();
  }

  async getPropertyStats(propertyId: string) {
    await this.ensureInitialized();
    return usePropertyStore.getState().getPropertyStats(propertyId);
  }

  // Analytics methods
  async getDashboardStats() {
    await this.ensureInitialized();
    const properties = usePropertyStore.getState().properties;
    const tenants = useTenantStore.getState().getActiveTenants();
    const maintenanceStats = useMaintenanceStore.getState().getMaintenanceStats();
    const financialMetrics = useFinancialStore.getState().getFinancialMetrics();
    
    const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
    const availableUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    return {
      properties: properties.length,
      totalUnits,
      occupiedUnits,
      availableUnits,
      occupancyRate,
      activeTenants: tenants.length,
      monthlyRevenue: financialMetrics.monthlyRecurring,
      outstandingRent: financialMetrics.totalOutstanding,
      maintenanceRequests: maintenanceStats.open,
      emergencyRequests: maintenanceStats.emergency,
      avgMaintenanceTime: maintenanceStats.avgCompletionTime,
      collectionRate: financialMetrics.collectionRate,
    };
  }

  // Search methods
  async searchProperties(query: string) {
    await this.ensureInitialized();
    return usePropertyStore.getState().searchProperties(query);
  }

  async searchTenants(query: string) {
    await this.ensureInitialized();
    return useTenantStore.getState().searchTenants(query);
  }

  // Helper method to ensure data is initialized
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeWithMockData();
    }
  }

  // Reset all data (useful for testing)
  async resetAllData(): Promise<void> {
    usePropertyStore.getState().setProperties([]);
    useTenantStore.getState().setTenants([]);
    useMaintenanceStore.getState().setRequests([]);
    useMaintenanceStore.getState().setVendors([]);
    useFinancialStore.getState().setPayments([]);
    this.initialized = false;
  }

  // Generate additional test data
  async generateMoreData(): Promise<void> {
    const dataset = generateFullDataset();
    
    // Add to existing data
    const currentProperties = usePropertyStore.getState().properties;
    const currentTenants = useTenantStore.getState().tenants;
    const currentRequests = useMaintenanceStore.getState().requests;
    const currentVendors = useMaintenanceStore.getState().vendors;
    const currentPayments = useFinancialStore.getState().payments;
    
    usePropertyStore.getState().setProperties([...currentProperties, ...dataset.properties]);
    useTenantStore.getState().setTenants([...currentTenants, ...dataset.tenants]);
    useMaintenanceStore.getState().setRequests([...currentRequests, ...dataset.maintenanceRequests]);
    useMaintenanceStore.getState().setVendors([...currentVendors, ...dataset.vendors]);
    useFinancialStore.getState().setPayments([...currentPayments, ...dataset.payments]);
    
    console.log('✅ Additional test data generated');
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export for use in components
export default dataService;