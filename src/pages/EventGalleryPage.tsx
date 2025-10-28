import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { eventsData } from '../utils/eventData';
import useRatingStore from '../stores/ratingStore';
import useTagStore, { ALL_TAGS } from '../stores/tagStore';
import useHiddenStore from '../stores/serverHiddenStore';
import usePublicStore from '../stores/publicStore';
import StarRating from '../components/features/StarRating';
import EventGallery from '../components/features/EventGallery';
import LazyImage from '../components/ui/LazyImage';
import type { EventPhoto } from '../types';

interface PhotoWithMeta {
  photo: EventPhoto;
  rating?: number;
  tags?: string[];
  isHidden?: boolean;
}

export default function EventGalleryPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if in admin mode
  const isAdminMode = searchParams.has('admin');
  
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'rating-high' | 'rating-low' | 'most-tagged'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [ratingOperator, setRatingOperator] = useState<'any' | 'equal' | 'greater' | 'less' | 'greater-equal' | 'less-equal'>('any');
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [showHidden, setShowHidden] = useState<'exclude' | 'include' | 'only'>('exclude');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  
  // Bulk edit state
  const [bulkEditRating, setBulkEditRating] = useState<number | null>(null);
  const [bulkEditTags, setBulkEditTags] = useState<{ add: string[], remove: string[] }>({ add: [], remove: [] });
  const [bulkEditVisibility, setBulkEditVisibility] = useState<'no-change' | 'show' | 'hide'>('no-change');
  const [bulkEditPublic, setBulkEditPublic] = useState<'no-change' | 'add' | 'remove'>('no-change');
  
  const { getPhotoRating, ratings, ratePhoto } = useRatingStore();
  const { getPhotoTags, photoTags, tagPhoto } = useTagStore();
  const { isPhotoHidden, togglePhotoHidden, hiddenPhotos } = useHiddenStore();
  const { getPublicPhotoCount, togglePhotoPublic, isPhotoPublic } = usePublicStore();
  
  // Find the event
  const event = useMemo(() => {
    for (const yearData of eventsData) {
      const foundEvent = yearData.events.find(e => e.id === eventId);
      if (foundEvent) return foundEvent;
    }
    return null;
  }, [eventId]);
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Event not found</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  // Get all photos with metadata
  const photosWithMeta = useMemo(() => {
    let photos = event.photos.map(photo => {
      const rating = getPhotoRating(photo.id);
      const tags = getPhotoTags(photo.id);
      const isHidden = isPhotoHidden(photo.id);
      
      return {
        photo,
        rating: rating?.rating,
        tags: tags?.tags || [],
        isHidden
      } as PhotoWithMeta;
    });
    
    // In public mode, completely filter out hidden photos
    if (!isAdminMode) {
      photos = photos.filter(p => !p.isHidden);
    }
    
    return photos;
  }, [event?.photos, getPhotoRating, getPhotoTags, ratings, photoTags, isPhotoHidden, hiddenPhotos, isAdminMode]);
  
  // Filter by tags, ratings, and hidden status
  const filteredPhotos = useMemo(() => {
    let filtered = photosWithMeta;
    
    // Apply hidden filter (only in admin mode)
    if (isAdminMode) {
      if (showHidden === 'exclude') {
        filtered = filtered.filter(p => !p.isHidden);
      } else if (showHidden === 'only') {
        filtered = filtered.filter(p => p.isHidden);
      }
      // 'include' shows all photos regardless of hidden status
    }
    
    // Apply tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(p => p.tags?.includes(selectedTag));
    }
    
    // Apply rating filter
    if (ratingOperator !== 'any') {
      switch (ratingOperator) {
        case 'equal':
          filtered = filtered.filter(p => p.rating && Math.floor(p.rating) === ratingValue);
          break;
        case 'greater':
          filtered = filtered.filter(p => p.rating && p.rating > ratingValue);
          break;
        case 'less':
          filtered = filtered.filter(p => p.rating && p.rating < ratingValue);
          break;
        case 'greater-equal':
          filtered = filtered.filter(p => p.rating && p.rating >= ratingValue);
          break;
        case 'less-equal':
          filtered = filtered.filter(p => p.rating && p.rating <= ratingValue);
          break;
      }
    }
    
    return filtered;
  }, [photosWithMeta, selectedTag, ratingOperator, ratingValue, showHidden]);
  
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
      case 'default':
      default:
        return sorted;
    }
  }, [filteredPhotos, sortBy]);
  
  // Get tag counts for current event
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    photosWithMeta.forEach(p => {
      p.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [photosWithMeta]);
  
  // Get event statistics - use visible photos only (respects hidden photos in public mode)
  const tagStats = useMemo(() => {
    const visiblePhotoIds = photosWithMeta.map(p => p.photo.id);
    const visibleEventTags = Object.values(photoTags).filter(
      (tag) => tag.eventId === event.id && visiblePhotoIds.includes(tag.photoId)
    );
    
    const tagCounts: Record<string, number> = {};
    
    visibleEventTags.forEach((photoTag) => {
      photoTag.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTaggedPhotos: visibleEventTags.length,
      tagCounts,
      popularTags,
    };
  }, [photosWithMeta, photoTags, event.id]);
  
  const handlePhotoClick = (index: number, photo: EventPhoto) => {
    if (isMultiSelectMode) {
      togglePhotoSelection(photo.id);
    } else {
      setSelectedPhotoIndex(index);
      setShowLightbox(true);
    }
  };
  
  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };
  
  const selectAllVisible = () => {
    const allIds = new Set(sortedPhotos.map(p => p.photo.id));
    setSelectedPhotos(allIds);
  };
  
  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };
  
  const toggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedPhotos(new Set());
    }
  };
  
  // Apply all bulk edits at once
  const applyBulkEdits = () => {
    selectedPhotos.forEach(photoId => {
      // Apply rating if set
      if (bulkEditRating !== null) {
        ratePhoto(photoId, event.id, bulkEditRating);
      }
      
      // Apply tags
      if (bulkEditTags.add.length > 0 || bulkEditTags.remove.length > 0) {
        const existingTags = getPhotoTags(photoId)?.tags || [];
        
        // Start with existing tags
        let newTags = new Set(existingTags);
        
        // Remove tags
        bulkEditTags.remove.forEach(tag => newTags.delete(tag));
        
        // Add new tags
        bulkEditTags.add.forEach(tag => newTags.add(tag));
        
        // Convert back to array and update
        tagPhoto(photoId, event.id, Array.from(newTags));
      }
      
      // Apply visibility
      if (bulkEditVisibility !== 'no-change') {
        const shouldHide = bulkEditVisibility === 'hide';
        const isCurrentlyHidden = isPhotoHidden(photoId);
        if (isCurrentlyHidden !== shouldHide) {
          togglePhotoHidden(photoId, event.id);
        }
      }
      
      // Apply public status
      if (bulkEditPublic !== 'no-change') {
        const shouldBePublic = bulkEditPublic === 'add';
        const isCurrentlyPublic = isPhotoPublic(photoId);
        if (isCurrentlyPublic !== shouldBePublic) {
          togglePhotoPublic(photoId, event.id);
        }
      }
    });
    
    // Reset everything
    setShowBulkEditModal(false);
    clearSelection();
    resetBulkEditForm();
    setIsMultiSelectMode(false); // Exit multi-select mode after applying changes
  };
  
  const resetBulkEditForm = () => {
    setBulkEditRating(null);
    setBulkEditTags({ add: [], remove: [] });
    setBulkEditVisibility('no-change');
    setBulkEditPublic('no-change');
  };
  
  const openBulkEditModal = () => {
    if (selectedPhotos.size > 0) {
      setShowBulkEditModal(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/events')}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </button>
          
          {/* Public Gallery Link */}
          {getPublicPhotoCount(event.id) > 0 && (
            <a
              href={`/public/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Public Gallery ({getPublicPhotoCount(event.id)} photos)
            </a>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-brand-charcoal mb-2">{event.title}</h1>
        <p className="text-lg text-gray-600">
          {event.propertyName} • {new Date(event.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })} • {event.photos.length} Photos
        </p>
        {event.description && (
          <p className="mt-2 text-gray-700">{event.description}</p>
        )}
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
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
          
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rating</label>
            <div className="flex gap-2">
              <select
                value={ratingOperator}
                onChange={(e) => setRatingOperator(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="any">Any Rating</option>
                <option value="equal">Equal to</option>
                <option value="greater">Greater than</option>
                <option value="greater-equal">Greater or equal</option>
                <option value="less">Less than</option>
                <option value="less-equal">Less or equal</option>
              </select>
              <select
                value={ratingValue}
                onChange={(e) => setRatingValue(Number(e.target.value))}
                disabled={ratingOperator === 'any'}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </div>
          </div>
          
          {/* Hidden Photos Filter - Admin Only */}
          {isAdminMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hidden Photos</label>
              <select
                value={showHidden}
                onChange={(e) => setShowHidden(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="exclude">Exclude Hidden</option>
                <option value="include">Include Hidden</option>
                <option value="only">Only Hidden</option>
              </select>
            </div>
          )}
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="default">Default Order</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="most-tagged">Most Tagged</option>
            </select>
          </div>
          
          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded-lg transition ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List
              </button>
            </div>
          </div>
          
          {/* Multi-Select Toggle */}
          <div className="lg:col-span-2 flex items-end">
            <button
              onClick={toggleMultiSelect}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                isMultiSelectMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isMultiSelectMode ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Multi-Select Active ({selectedPhotos.size} selected)
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Enable Multi-Select
                </span>
              )}
            </button>
          </div>
          
          {/* Reset Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <button
              onClick={() => {
                setSelectedTag('all');
                setRatingOperator('any');
                setRatingValue(5);
                setShowHidden('exclude');
                setSortBy('default');
                setViewMode('grid');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Results Summary and Download Button */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedPhotos.length} photos
            {selectedTag !== 'all' && ` tagged with "${selectedTag}"`}
            {ratingOperator !== 'any' && (
              ` (rating ${
                ratingOperator === 'equal' ? '=' :
                ratingOperator === 'greater' ? '>' :
                ratingOperator === 'greater-equal' ? '≥' :
                ratingOperator === 'less' ? '<' :
                ratingOperator === 'less-equal' ? '≤' : ''
              } ${ratingValue})`
            )}
          </div>
          
          {/* Download All Photos Button */}
          {sortedPhotos.length > 0 && (
            <button
              onClick={() => {
                // Use the same download logic from EventGallery component
                const handleDownloadAll = async () => {
                  const photosToDownload = sortedPhotos.map(p => p.photo);
                  
                  if (photosToDownload.length === 0) {
                    alert('No photos to download');
                    return;
                  }

                  try {
                    const JSZip = (await import('jszip')).default;
                    const zip = new JSZip();
                    
                    for (let i = 0; i < photosToDownload.length; i++) {
                      const photo = photosToDownload[i];
                      
                      try {
                        const response = await fetch(photo.url);
                        if (!response.ok) continue;
                        
                        const blob = await response.blob();
                        const urlParts = photo.url.split('/');
                        const filename = urlParts[urlParts.length - 1] || `photo-${i + 1}.jpg`;
                        zip.file(filename, blob);
                      } catch (error) {
                        console.warn(`Error downloading ${photo.url}:`, error);
                      }
                    }

                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    const url = URL.createObjectURL(zipBlob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_photos.zip`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error creating zip file:', error);
                    alert('Error downloading photos. Please try again.');
                  }
                };
                handleDownloadAll();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download All Photos Below ({sortedPhotos.length})</span>
            </button>
          )}
        </div>
        
        {/* Tag Statistics */}
        {tagStats && tagStats.popularTags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Popular tags for this event:</div>
            <div className="flex flex-wrap gap-2">
              {tagStats.popularTags.slice(0, 10).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedTag === tag
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Actions Toolbar */}
      {isMultiSelectMode && selectedPhotos.size > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-700">
                {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllVisible}
                className="text-purple-600 hover:text-purple-700 text-sm underline"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-purple-600 hover:text-purple-700 text-sm underline"
              >
                Clear
              </button>
            </div>
            
            <button
              onClick={openBulkEditModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Edit Selected Photos
            </button>
          </div>
        </div>
      )}
      
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
              className="group relative"
            >
              {/* Multi-select Checkbox */}
              {isMultiSelectMode && (
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedPhotos.has(photoMeta.photo.id)}
                    onChange={() => togglePhotoSelection(photoMeta.photo.id)}
                    className="w-5 h-5 rounded border-2 border-white shadow-md cursor-pointer"
                  />
                </div>
              )}
              
              {/* Hide/Unhide Button - Admin Only */}
              {isAdminMode && !isMultiSelectMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhotoHidden(photoMeta.photo.id, event.id);
                  }}
                  className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
                    photoMeta.isHidden 
                      ? 'bg-red-600 hover:bg-red-700 text-white opacity-100' 
                      : 'bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100'
                  }`}
                  title={photoMeta.isHidden ? 'Unhide photo' : 'Hide photo'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {photoMeta.isHidden ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              )}
              
              <div 
                onClick={() => handlePhotoClick(index, photoMeta.photo)}
                className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer ${
                  photoMeta.isHidden ? 'opacity-50' : ''
                } ${
                  isMultiSelectMode && selectedPhotos.has(photoMeta.photo.id) 
                    ? 'ring-4 ring-purple-500' 
                    : ''
                }`}
              >
                <LazyImage
                  src={photoMeta.photo.url}
                  thumbnailSrc={photoMeta.photo.thumbnail}
                  alt={photoMeta.photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-110"
                />
                
                {/* Hidden Indicator */}
                {photoMeta.isHidden && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Hidden
                  </div>
                )}
                
                {/* Overlay with info - improved animation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    {/* Rating */}
                    {photoMeta.rating && (
                      <div className="flex items-center gap-1 mb-1">
                        <StarRating rating={photoMeta.rating} readonly size="sm" />
                      </div>
                    )}
                    
                    {/* Tags */}
                    {photoMeta.tags && photoMeta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
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
              className={`bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow ${
                photoMeta.isHidden ? 'opacity-50' : ''
              } ${
                isMultiSelectMode && selectedPhotos.has(photoMeta.photo.id)
                  ? 'ring-4 ring-purple-500'
                  : ''
              }`}
            >
              {/* Multi-select Checkbox for List View */}
              {isMultiSelectMode && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.has(photoMeta.photo.id)}
                    onChange={() => togglePhotoSelection(photoMeta.photo.id)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                </div>
              )}
              
              <div 
                onClick={() => handlePhotoClick(index, photoMeta.photo)}
                className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 cursor-pointer relative"
              >
                <LazyImage
                  src={photoMeta.photo.url}
                  thumbnailSrc={photoMeta.photo.thumbnail}
                  alt={photoMeta.photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {photoMeta.isHidden && (
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Hidden
                  </div>
                )}
              </div>
              
              <div className="flex-1 cursor-pointer" onClick={() => handlePhotoClick(index, photoMeta.photo)}>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {photoMeta.photo.caption || `Photo ${photoMeta.photo.order + 1}`}
                  <span className="text-xs text-gray-500 font-normal">
                    (#{photoMeta.photo.order + 1})
                  </span>
                </h3>
                
                {/* Rating */}
                {photoMeta.rating ? (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={photoMeta.rating} readonly size="sm" />
                    <span className="text-sm text-gray-600">{photoMeta.rating.toFixed(1)} stars</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Not rated yet</p>
                )}
                
                {/* Tags */}
                {photoMeta.tags && photoMeta.tags.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-gray-400 mt-1">No tags</p>
                )}
              </div>
              
              {/* Hide/Unhide Button - Admin Only */}
              {isAdminMode && !isMultiSelectMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhotoHidden(photoMeta.photo.id, event.id);
                  }}
                  className={`self-start p-2 rounded-full transition-all duration-200 ${
                    photoMeta.isHidden 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={photoMeta.isHidden ? 'Unhide photo' : 'Hide photo'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {photoMeta.isHidden ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Event Gallery Modal (Lightbox) */}
      {showLightbox && (
        <EventGallery
          event={{
            ...event,
            photos: sortedPhotos.map(p => p.photo)
          }}
          filteredPhotos={sortedPhotos}
          initialPhotoIndex={selectedPhotoIndex}
          isAdminMode={isAdminMode}
          onClose={() => {
            setShowLightbox(false);
            setSelectedPhotoIndex(0);
          }}
        />
      )}
      
      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Edit {selectedPhotos.size} Selected Photo{selectedPhotos.size !== 1 ? 's' : ''}
            </h2>
            
            <div className="space-y-6">
              {/* Rating Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Star Rating</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={bulkEditRating === null ? 'no-change' : bulkEditRating}
                    onChange={(e) => setBulkEditRating(e.target.value === 'no-change' ? null : Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="no-change">Don't change</option>
                    <option value="1">⭐ 1 star</option>
                    <option value="2">⭐⭐ 2 stars</option>
                    <option value="3">⭐⭐⭐ 3 stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 stars</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                  </select>
                </div>
              </div>
              
              {/* Tags Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select tags to add:</label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            const add = bulkEditTags.add.includes(tag)
                              ? bulkEditTags.add.filter(t => t !== tag)
                              : [...bulkEditTags.add, tag];
                            setBulkEditTags({ ...bulkEditTags, add });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition ${
                            bulkEditTags.add.includes(tag)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visibility Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Visibility</h3>
                <select
                  value={bulkEditVisibility}
                  onChange={(e) => setBulkEditVisibility(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full max-w-xs"
                >
                  <option value="no-change">Don't change</option>
                  <option value="show">Show photos (unhide)</option>
                  <option value="hide">Hide photos</option>
                </select>
              </div>
              
              {/* Public Gallery Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Public Gallery</h3>
                <select
                  value={bulkEditPublic}
                  onChange={(e) => setBulkEditPublic(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full max-w-xs"
                >
                  <option value="no-change">Don't change</option>
                  <option value="add">Add to public gallery</option>
                  <option value="remove">Remove from public gallery</option>
                </select>
              </div>
              
              {/* Summary of Changes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Changes to apply:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {bulkEditRating !== null && (
                    <li>• Set rating to {bulkEditRating} star{bulkEditRating !== 1 ? 's' : ''}</li>
                  )}
                  {bulkEditTags.add.length > 0 && (
                    <li>• Add tags: {bulkEditTags.add.join(', ')}</li>
                  )}
                  {bulkEditVisibility !== 'no-change' && (
                    <li>• {bulkEditVisibility === 'show' ? 'Show' : 'Hide'} photos</li>
                  )}
                  {bulkEditPublic !== 'no-change' && (
                    <li>• {bulkEditPublic === 'add' ? 'Add to' : 'Remove from'} public gallery</li>
                  )}
                </ul>
                {bulkEditRating === null && bulkEditTags.add.length === 0 && bulkEditTags.remove.length === 0 && 
                 bulkEditVisibility === 'no-change' && bulkEditPublic === 'no-change' && (
                  <p className="text-sm text-gray-500">No changes selected</p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  resetBulkEditForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={applyBulkEdits}
                disabled={bulkEditRating === null && bulkEditTags.add.length === 0 && bulkEditTags.remove.length === 0 && 
                         bulkEditVisibility === 'no-change' && bulkEditPublic === 'no-change'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}