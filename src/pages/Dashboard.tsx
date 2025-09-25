import { useDashboardStats, useProperties, useMaintenance, useFinancials } from '../hooks/useData';
import DashboardStats from '../components/features/DashboardStats';
import PropertyCard from '../components/features/PropertyCard';

export default function Dashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { properties } = useProperties();
  const { emergencyRequests } = useMaintenance();
  const { upcomingPayments, latePayments } = useFinancials();

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const dashboardStats = [
    { 
      label: 'Total Properties', 
      value: stats.properties, 
      change: 0, 
      icon: '🏢' 
    },
    { 
      label: 'Total Units', 
      value: stats.totalUnits, 
      change: Math.round((stats.occupiedUnits / stats.totalUnits) * 100) - 85, 
      icon: '🏠' 
    },
    { 
      label: 'Occupancy Rate', 
      value: `${Math.round(stats.occupancyRate)}%`, 
      change: stats.occupancyRate > 90 ? 2 : -1, 
      icon: '📊' 
    },
    { 
      label: 'Monthly Revenue', 
      value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`, 
      change: stats.collectionRate > 95 ? 15 : 5, 
      icon: '💰' 
    }
  ];

  const recentProperties = properties.slice(0, 3);

  const recentActivity = [
    ...(latePayments.slice(0, 2).map(payment => ({
      type: 'warning',
      message: `Late payment - $${payment.amount.toLocaleString()} due ${new Date(payment.dueDate).toLocaleDateString()}`
    }))),
    ...(emergencyRequests.slice(0, 1).map(request => ({
      type: 'danger',
      message: `Emergency maintenance - ${request.title}`
    }))),
    ...(upcomingPayments.slice(0, 2).map(payment => ({
      type: 'info',
      message: `Upcoming payment - $${payment.amount.toLocaleString()} due ${new Date(payment.dueDate).toLocaleDateString()}`
    })))
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your properties.</p>
        </div>

        <DashboardStats stats={dashboardStats} />

        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Add Property
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <PropertyCard 
                key={property.id}
                id={property.id}
                name={property.name}
                address={`${property.address.street}, ${property.address.city}, ${property.address.state}`}
                units={property.totalUnits}
                occupancy={Math.round(property.occupancyRate)}
                image={property.images[0]?.thumbnailUrl}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'danger' ? 'bg-red-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="text-gray-600">{activity.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Tenants</span>
                <span className="text-sm font-semibold">{stats.activeTenants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Units</span>
                <span className="text-sm font-semibold">{stats.availableUnits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Open Maintenance</span>
                <span className="text-sm font-semibold">{stats.maintenanceRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outstanding Rent</span>
                <span className="text-sm font-semibold">${(stats.outstandingRent / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <span className="text-sm font-semibold">{Math.round(stats.collectionRate)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}