import { useState, useMemo } from 'react';
import { useProperties } from '../hooks/useData';
import type { MediaAsset } from '../types';

interface ExtendedMediaAsset extends MediaAsset {
  category?: string;
  propertyName?: string;
  unitNumber?: string;
}

export default function MediaLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'property' | 'unit' | 'maintenance'>('all');
  const [selectedImage, setSelectedImage] = useState<ExtendedMediaAsset | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { properties } = useProperties();

  // Collect all media assets from properties and units
  const allMedia = useMemo(() => {
    const media: ExtendedMediaAsset[] = [];
    
    properties.forEach(property => {
      // Add property images
      property.images.forEach(img => {
        media.push({ ...img, category: 'property', propertyName: property.name });
      });
      
      // Add unit images
      property.units.forEach(unit => {
        unit.images.forEach(img => {
          media.push({ 
            ...img, 
            category: 'unit', 
            propertyName: property.name,
            unitNumber: unit.unitNumber 
          });
        });
      });
    });
    
    return media;
  }, [properties]);

  const filteredMedia = useMemo(() => {
    if (selectedCategory === 'all') return allMedia;
    return allMedia.filter(media => media.category === selectedCategory);
  }, [allMedia, selectedCategory]);

  const stats = useMemo(() => {
    const propertyImages = allMedia.filter(m => m.category === 'property').length;
    const unitImages = allMedia.filter(m => m.category === 'unit').length;
    const totalSize = allMedia.reduce((sum, m) => sum + (m.size || 0), 0);
    
    return {
      total: allMedia.length,
      propertyImages,
      unitImages,
      totalSize: (totalSize / (1024 * 1024)).toFixed(2) // Convert to MB
    };
  }, [allMedia]);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
          <p className="text-gray-600">Manage all property and unit images</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Images</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Property Images</p>
            <p className="text-2xl font-bold text-gray-900">{stats.propertyImages}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Unit Images</p>
            <p className="text-2xl font-bold text-gray-900">{stats.unitImages}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Storage</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSize} MB</p>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Media ({allMedia.length})
              </button>
              <button
                onClick={() => setSelectedCategory('property')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'property' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Properties ({stats.propertyImages})
              </button>
              <button
                onClick={() => setSelectedCategory('unit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'unit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Units ({stats.unitImages})
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Upload Media
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((media) => (
              <div
                key={media.id}
                onClick={() => setSelectedImage(media)}
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square">
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-sm font-medium truncate">{media.propertyName}</p>
                    {media.unitNumber && (
                      <p className="text-xs opacity-90">Unit {media.unitNumber}</p>
                    )}
                    <p className="text-xs opacity-75">{media.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedia.map(media => (
                  <tr key={media.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedImage(media)}>
                    <td className="px-6 py-4">
                      <img 
                        src={media.thumbnailUrl || media.url} 
                        alt={media.title}
                        className="w-12 h-12 object-cover rounded"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{media.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {media.propertyName}
                      {media.unitNumber && ` - Unit ${media.unitNumber}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{media.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((media.size || 0) / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(media.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredMedia.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No media found in this category</p>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full object-contain max-h-[80vh]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <h3 className="text-lg font-semibold">{selectedImage.propertyName}</h3>
                {selectedImage.unitNumber && (
                  <p className="text-sm opacity-90">Unit {selectedImage.unitNumber}</p>
                )}
                <p className="text-sm opacity-75">{selectedImage.title}</p>
                {selectedImage.dimensions && (
                  <p className="text-xs opacity-60 mt-1">
                    {selectedImage.dimensions.width} × {selectedImage.dimensions.height}px
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}