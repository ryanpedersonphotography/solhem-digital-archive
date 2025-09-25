import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useData';
import { downloadLayoutAssets } from '../utils/downloadAssets';

export default function LayoutDetail() {
  const { propertyId, layoutId } = useParams<{ propertyId: string; layoutId: string }>();
  const navigate = useNavigate();
  const { property } = usePropertyDetails(propertyId || '');
  const [isDownloading, setIsDownloading] = useState(false);

  const layout = property?.layouts?.find(l => l.id === layoutId);

  const handleDownloadAssets = async () => {
    if (!layout) return;
    
    setIsDownloading(true);
    try {
      await downloadLayoutAssets(layout);
    } catch (error) {
      console.error('Failed to download assets:', error);
      alert('Failed to download assets. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!property || !layout) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Layout Not Found</h2>
            <Link to={`/properties/${propertyId}`} className="text-blue-600 hover:text-blue-800">
              Back to Property
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableUnits = property.units.filter(
    unit => unit.layoutId === layout.id && unit.status === 'available'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/properties/${propertyId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="text-sm text-gray-600">
                  <Link to={`/properties/${propertyId}`} className="hover:text-gray-900">
                    {property.name}
                  </Link>
                </div>
                <h1 className="text-2xl font-bold">{layout.name}</h1>
              </div>
            </div>
            <button
              onClick={handleDownloadAssets}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>{isDownloading ? 'Downloading...' : 'Download Assets'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Floor Plan */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Floor Plan</h2>
              </div>
              <div className="p-4">
                <img
                  src={layout.floorPlan?.url || layout.marketingImages[0]?.url}
                  alt={layout.name}
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            {/* Marketing Images */}
            {layout.marketingImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Unit Photos</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {layout.marketingImages.map(image => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Details */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Layout Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{layout.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{layout.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{layout.squareFeet}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">${layout.baseRent}</div>
                  <div className="text-sm text-gray-600">Starting</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{layout.description}</p>
            </div>

            {/* Features */}
            {layout.features && layout.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <ul className="space-y-2">
                  {layout.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Units */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Available Units ({availableUnits.length})
              </h2>
              {availableUnits.length > 0 ? (
                <div className="space-y-3">
                  {availableUnits.slice(0, 5).map(unit => (
                    <div key={unit.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Unit {unit.unitNumber}</div>
                        <div className="text-sm text-gray-600">Floor {unit.floor}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">${unit.rentAmount}/mo</div>
                        <div className="text-xs text-gray-600">{unit.squareFeet} sq ft</div>
                      </div>
                    </div>
                  ))}
                  {availableUnits.length > 5 && (
                    <div className="text-center text-sm text-gray-600 pt-2">
                      And {availableUnits.length - 5} more units available
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No units currently available for this layout.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}