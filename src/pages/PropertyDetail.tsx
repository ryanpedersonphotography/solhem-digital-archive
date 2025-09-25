import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useData';
import { downloadLayoutAssets } from '../utils/downloadAssets';
import type { Layout } from '../types';

export default function PropertyDetail() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { property } = usePropertyDetails(propertyId || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'layouts' | 'amenities' | 'gallery'>('overview');
  const [expandedLayout, setExpandedLayout] = useState<string | null>(null);
  const [downloadingLayout, setDownloadingLayout] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadAssets = async (layout: Layout) => {
    setDownloadingLayout(layout.id);
    try {
      await downloadLayoutAssets(layout);
    } catch (error) {
      console.error('Failed to download assets:', error);
      alert('Failed to download assets. Please try again.');
    } finally {
      setDownloadingLayout(null);
    }
  };

  if (!property) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
            <Link to="/properties" className="text-blue-600 hover:text-blue-800">
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'layouts', label: 'Floor Plans', count: property.layouts?.length || 0 },
    { id: 'amenities', label: 'Amenities', count: property.commonSpaces?.length || 0 },
    { id: 'gallery', label: 'Gallery', count: property.images.length },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/properties" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <p className="text-gray-600">
            {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={property.images[0]?.url} 
            alt={property.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Total Units:</dt>
                      <dd className="font-medium">{property.totalUnits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Available Units:</dt>
                      <dd className="font-medium">{property.totalUnits - property.occupiedUnits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Occupancy Rate:</dt>
                      <dd className="font-medium">{Math.round(property.occupancyRate)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Property Type:</dt>
                      <dd className="font-medium capitalize">{property.type}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Building Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.buildingFeatures?.slice(0, 6).map(feature => (
                      <div key={feature.id} className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Unit Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(amenity => (
                    <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layouts Tab */}
          {activeTab === 'layouts' && (
            <div className="space-y-3">
              {property.layouts?.map(layout => {
                const isExpanded = expandedLayout === layout.id;
                const availableUnits = property.units.filter(
                  unit => unit.layoutId === layout.id && unit.status === 'available'
                );
                
                return (
                  <div
                    key={layout.id}
                    className="bg-white border rounded-lg overflow-hidden transition-all duration-300"
                  >
                    {/* Accordion Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedLayout(isExpanded ? null : layout.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{layout.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{layout.bedrooms} bed • {layout.bathrooms} bath</span>
                              <span>{layout.squareFeet} sq ft</span>
                              <span className="font-semibold text-gray-900">From ${layout.baseRent}/mo</span>
                              {layout.availableUnits > 0 && (
                                <span className="text-green-600 font-medium">
                                  {layout.availableUnits} available
                                </span>
                              )}
                              {layout.unitAvailability?.some(u => u.isImmediatelyAvailable) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Move-in Ready
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/property/${propertyId}/layout/${layout.id}`);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="border-t">
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Floor Plan Image */}
                            <div className="lg:col-span-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Floor Plan</h4>
                              <img
                                src={layout.floorPlan?.url || layout.marketingImages[0]?.url}
                                alt={layout.name}
                                className="w-full rounded-lg shadow-sm"
                              />
                              
                              {/* Photo Gallery */}
                              {layout.marketingImages.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Photo Gallery</h4>
                                  <div className="grid grid-cols-4 gap-2">
                                    {layout.marketingImages.map((image, idx) => (
                                      <img
                                        key={image.id}
                                        src={image.url}
                                        alt={`Unit ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Details Sidebar */}
                            <div className="space-y-4">
                              {/* Features */}
                              {layout.features.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {layout.features.map(feature => (
                                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Available Units */}
                              {availableUnits.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Available Units ({availableUnits.length})
                                  </h4>
                                  <div className={`space-y-2 ${availableUnits.length > 5 ? 'max-h-48 overflow-y-auto' : ''}`}>
                                    {availableUnits.slice(0, 8).map(unit => (
                                      <div key={unit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                        <div>
                                          <span className="font-medium">Unit {unit.unitNumber}</span>
                                          <span className="text-gray-500 ml-2">Floor {unit.floor}</span>
                                        </div>
                                        <span className="font-semibold text-blue-600">${unit.rentAmount}</span>
                                      </div>
                                    ))}
                                    {availableUnits.length > 8 && (
                                      <p className="text-xs text-gray-500 text-center pt-2">
                                        +{availableUnits.length - 8} more units
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="space-y-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadAssets(layout);
                                  }}
                                  disabled={downloadingLayout === layout.id}
                                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                                    downloadingLayout === layout.id
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  {downloadingLayout === layout.id ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Downloading...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                      </svg>
                                      Download Assets
                                    </>
                                  )}
                                </button>
                                {layout.virtual3DTour && (
                                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                    View 3D Tour
                                  </button>
                                )}
                                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                  Schedule Tour
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {property.layouts?.length === 0 && (
                <p className="text-center text-gray-500 py-8">No floor plans available</p>
              )}
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="space-y-8">
              {/* Common Spaces */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Common Spaces</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {property.commonSpaces?.map(space => (
                    <div key={space.id} className="border rounded-lg overflow-hidden">
                      {space.images[0] && (
                        <img 
                          src={space.images[0].url}
                          alt={space.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{space.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{space.description}</p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600">Hours: </span>
                            <span className="font-medium">{space.hoursOfOperation}</span>
                          </div>
                          {space.requiresReservation && (
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Reservation Required
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {space.features.map(feature => (
                            <span key={feature} className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Building Features */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Building Features</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {property.buildingFeatures?.map(feature => (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        feature.category === 'security' ? 'bg-red-100 text-red-800' :
                        feature.category === 'technology' ? 'bg-blue-100 text-blue-800' :
                        feature.category === 'sustainability' ? 'bg-green-100 text-green-800' :
                        feature.category === 'convenience' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {feature.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {property.images.map(image => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}