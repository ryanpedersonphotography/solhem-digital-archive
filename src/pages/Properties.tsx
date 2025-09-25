import { useState, useMemo } from 'react';
import { useProperties } from '../hooks/useData';
import PropertyCard from '../components/features/PropertyCard';

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOccupancy, setFilterOccupancy] = useState('all');
  const { properties } = useProperties();

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOccupancy = filterOccupancy === 'all' ||
        (filterOccupancy === 'high' && property.occupancyRate >= 90) ||
        (filterOccupancy === 'medium' && property.occupancyRate >= 70 && property.occupancyRate < 90) ||
        (filterOccupancy === 'low' && property.occupancyRate < 70);
      
      return matchesSearch && matchesOccupancy;
    });
  }, [properties, searchTerm, filterOccupancy]);

  const stats = useMemo(() => {
    const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
    const totalRevenue = properties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const avgOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    return { totalUnits, occupiedUnits, totalRevenue, avgOccupancy };
  }, [properties]);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
          <p className="text-gray-600">Manage and view all your properties</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Properties</p>
            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Units</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Avg Occupancy</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgOccupancy)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterOccupancy}
              onChange={(e) => setFilterOccupancy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Occupancy</option>
              <option value="high">High (≥90%)</option>
              <option value="medium">Medium (70-89%)</option>
              <option value="low">Low (&lt;70%)</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Add Property
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
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
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500">No properties found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}