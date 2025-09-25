import { useState, useMemo } from 'react';
import { eventsData } from '../utils/eventData';
import useRatingStore from '../stores/ratingStore';
import useTagStore, { ALL_TAGS } from '../stores/tagStore';
import StarRating from '../components/features/StarRating';
import EventGallery from '../components/features/EventGallery';
import type { PropertyEvent } from '../types';

interface PhotoWithMeta {
  photo: {
    id: string;
    url: string;
    thumbnail?: string;
    caption?: string;
  };
  event: PropertyEvent;
  rating?: number;
  tags?: string[];
}

export default function PhotoGallery() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating-high' | 'rating-low' | 'most-tagged'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<PropertyEvent | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  
  const { getPhotoRating } = useRatingStore();
  const { getPhotoTags } = useTagStore();
  
  // Get all photos with metadata
  const allPhotosWithMeta = useMemo(() => {
    const photos: PhotoWithMeta[] = [];
    
    eventsData.forEach(yearData => {
      if (selectedYear !== 0 && yearData.year !== selectedYear) return;
      
      yearData.events.forEach(event => {
        if (selectedProperty !== 'all' && event.propertyId !== selectedProperty) return;
        
        event.photos.forEach(photo => {
          const rating = getPhotoRating(photo.id);
          const tags = getPhotoTags(photo.id);
          
          photos.push({
            photo,
            event,
            rating: rating?.rating,
            tags: tags?.tags || []
          });
        });
      });
    });
    
    return photos;
  }, [selectedYear, selectedProperty, getPhotoRating, getPhotoTags]);
  
  // Filter by tags
  const filteredPhotos = useMemo(() => {
    if (selectedTag === 'all') return allPhotosWithMeta;
    
    return allPhotosWithMeta.filter(p => p.tags?.includes(selectedTag));
  }, [allPhotosWithMeta, selectedTag]);
  
  // Sort photos
  const sortedPhotos = useMemo(() => {
    const sorted = [...filteredPhotos];
    
    switch (sortBy) {
      case 'rating-high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'most-tagged':
        return sorted.sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
      case 'newest':
      default:
        return sorted.reverse(); // Assuming latest photos are at the end
    }
  }, [filteredPhotos, sortBy]);
  
  // Get unique years and properties
  const years = Array.from(new Set(eventsData.map(d => d.year))).sort((a, b) => b - a);
  const properties = [
    { id: 'all', name: 'All Properties' },
    { id: 'archive', name: 'The Archive' },
    { id: 'lucille', name: 'Lucille' },
    { id: 'fred', name: 'The Fred' },
  ];
  
  // Get tag counts for current filter
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPhotosWithMeta.forEach(p => {
      p.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [allPhotosWithMeta]);
  
  const handlePhotoClick = (photo: PhotoWithMeta, index: number) => {
    // Create a temporary event with just the filtered photos
    const tempEvent: PropertyEvent = {
      ...photo.event,
      photos: sortedPhotos.map((p, idx) => ({
        ...p.photo,
        order: idx
      }))
    };
    setSelectedEvent(tempEvent);
    setSelectedPhotoIndex(index);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-charcoal mb-4">Photo Gallery</h1>
        <p className="text-lg text-gray-600">
          Browse all event photos. Filter by property, tags, and sort by ratings.
        </p>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Property Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
            </select>
          </div>
          
          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Filter</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Tags</option>
              {ALL_TAGS.filter(tag => tagCounts[tag] > 0)
                .sort((a, b) => tagCounts[b] - tagCounts[a])
                .map(tag => (
                  <option key={tag} value={tag}>
                    {tag} ({tagCounts[tag]})
                  </option>
                ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="most-tagged">Most Tagged</option>
            </select>
          </div>
          
          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded-lg transition ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {sortedPhotos.length} photos
          {selectedTag !== 'all' && ` tagged with "${selectedTag}"`}
        </div>
      </div>
      
      {/* Photo Grid/List */}
      {sortedPhotos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos found matching your filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedPhotos.map((photoMeta, index) => (
            <div
              key={photoMeta.photo.id}
              onClick={() => handlePhotoClick(photoMeta, index)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={photoMeta.photo.thumbnail || photoMeta.photo.url}
                  alt={photoMeta.photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    {/* Event name */}
                    <div className="text-xs opacity-90 truncate">
                      {photoMeta.event.title}
                    </div>
                    
                    {/* Rating */}
                    {photoMeta.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating rating={photoMeta.rating} readonly size="sm" />
                      </div>
                    )}
                    
                    {/* Tags */}
                    {photoMeta.tags && photoMeta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photoMeta.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-white/20 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPhotos.map((photoMeta, index) => (
            <div
              key={photoMeta.photo.id}
              onClick={() => handlePhotoClick(photoMeta, index)}
              className="bg-white rounded-lg shadow-md p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={photoMeta.photo.thumbnail || photoMeta.photo.url}
                alt={photoMeta.photo.caption || `Photo ${index + 1}`}
                className="w-32 h-32 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{photoMeta.event.title}</h3>
                <p className="text-sm text-gray-600">
                  {photoMeta.event.propertyName} • {new Date(photoMeta.event.date).toLocaleDateString()}
                </p>
                
                {/* Rating */}
                {photoMeta.rating ? (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={photoMeta.rating} readonly size="sm" />
                    <span className="text-sm text-gray-600">{photoMeta.rating} stars</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Not rated yet</p>
                )}
                
                {/* Tags */}
                {photoMeta.tags && photoMeta.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {photoMeta.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Event Gallery Modal */}
      {selectedEvent && (
        <EventGallery
          event={selectedEvent}
          initialPhotoIndex={selectedPhotoIndex}
          onClose={() => {
            setSelectedEvent(null);
            setSelectedPhotoIndex(0);
          }}
        />
      )}
    </div>
  );
}