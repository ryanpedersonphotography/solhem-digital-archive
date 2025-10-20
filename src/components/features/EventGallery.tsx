import { useState, useEffect } from 'react';
import type { PropertyEvent } from '../../types';
import useRatingStore from '../../stores/ratingStore';
import useTagStore from '../../stores/tagStore';
import useHiddenStore from '../../stores/hiddenStore';
import usePublicStore from '../../stores/publicStore';
import useFlagStore from '../../stores/flagStore';
import StarRating from './StarRating';
import TagSelector from './TagSelector';

interface EventGalleryProps {
  event: PropertyEvent;
  onClose: () => void;
  initialPhotoIndex?: number;
  isAdminMode?: boolean;
}

export default function EventGallery({ event, onClose, initialPhotoIndex = 0, isAdminMode = true }: EventGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentRatingValue, setCurrentRatingValue] = useState<number>(0);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagEmail, setFlagEmail] = useState('');
  const [flagName, setFlagName] = useState('');
  const [flagSubmitStatus, setFlagSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const { ratePhoto, getPhotoRating } = useRatingStore();
  const { tagPhoto, getPhotoTags } = useTagStore();
  const { isPhotoHidden, togglePhotoHidden } = useHiddenStore();
  const { isPhotoPublic, togglePhotoPublic } = usePublicStore();
  const { flagPhoto, isPhotoFlagged, markAsSubmitted } = useFlagStore();
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        prevPhoto();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPhotoIndex, isFullscreen]);
  
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === event.photos.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? event.photos.length - 1 : prev - 1
    );
  };
  
  const currentPhoto = event.photos[currentPhotoIndex];
  const currentRating = currentPhoto ? getPhotoRating(currentPhoto.id) : null;
  const currentPhotoTags = currentPhoto ? getPhotoTags(currentPhoto.id) : null;
  const [isCurrentPhotoHidden, setIsCurrentPhotoHidden] = useState(false);
  const [isCurrentPhotoPublic, setIsCurrentPhotoPublic] = useState(false);
  const [isCurrentPhotoFlagged, setIsCurrentPhotoFlagged] = useState(false);
  
  // Update hidden status when photo changes
  useEffect(() => {
    if (currentPhoto) {
      setIsCurrentPhotoHidden(isPhotoHidden(currentPhoto.id));
      setIsCurrentPhotoPublic(isPhotoPublic(currentPhoto.id));
      setIsCurrentPhotoFlagged(isPhotoFlagged(currentPhoto.id));
      
      // Reset flag form when changing photos
      setShowFlagForm(false);
      setFlagReason('');
      setFlagSubmitStatus('idle');
    }
  }, [currentPhotoIndex, currentPhoto, isPhotoHidden, isPhotoPublic, isPhotoFlagged]);
  
  // Update selected tags when photo changes
  useEffect(() => {
    if (currentPhotoTags) {
      setSelectedTags(currentPhotoTags.tags);
    } else {
      setSelectedTags([]);
    }
  }, [currentPhotoIndex, currentPhotoTags]);
  
  // Update rating value when photo changes
  useEffect(() => {
    if (currentRating) {
      setCurrentRatingValue(currentRating.rating);
    } else {
      setCurrentRatingValue(0);
    }
  }, [currentPhotoIndex, currentRating]);
  
  const handleRate = (rating: number) => {
    if (currentPhoto) {
      ratePhoto(currentPhoto.id, event.id, rating);
      setCurrentRatingValue(rating);
      // Auto-advance to next photo after rating
      setTimeout(() => {
        nextPhoto();
      }, 300); // Small delay for visual feedback
    }
  };
  
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    if (currentPhoto) {
      tagPhoto(currentPhoto.id, event.id, tags);
    }
  };
  
  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhoto || !flagReason.trim()) return;
    
    setFlagSubmitStatus('submitting');
    
    // Store flag locally
    flagPhoto(currentPhoto.id, event.id, flagReason, flagEmail, flagName);
    
    // Submit to Netlify Forms
    const formData = new FormData();
    formData.append('form-name', 'photo-flag-report');
    formData.append('photoId', currentPhoto.id);
    formData.append('eventId', event.id);
    formData.append('eventTitle', event.title);
    formData.append('photoUrl', currentPhoto.url);
    formData.append('reason', flagReason);
    formData.append('email', flagEmail || 'Not provided');
    formData.append('name', flagName || 'Anonymous');
    formData.append('timestamp', new Date().toISOString());
    
    try {
      const response = await fetch('/', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        markAsSubmitted(currentPhoto.id);
        setFlagSubmitStatus('success');
        setIsCurrentPhotoFlagged(true);
        
        // Reset form after success
        setTimeout(() => {
          setShowFlagForm(false);
          setFlagReason('');
          setFlagEmail('');
          setFlagName('');
          setFlagSubmitStatus('idle');
        }, 2000);
      } else {
        setFlagSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting flag report:', error);
      setFlagSubmitStatus('error');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <p className="text-sm opacity-75">
              {event.propertyName} • {new Date(event.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Star Rating in Center */}
          <div className="flex items-center">
            <StarRating
              rating={currentRatingValue}
              onRate={handleRate}
              size="md"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {currentPhotoIndex + 1} / {event.photos.length}
            </span>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Toggle fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Close gallery"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Gallery Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full flex">
          {/* Main Image - Resizes when panel is open */}
          <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-300 ${
            showRatingPanel && !isFullscreen ? 'mr-80' : ''
          }`}>
            {currentPhoto && (
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || `Photo ${currentPhotoIndex + 1}`}
                className={`max-w-full max-h-full object-contain ${
                  isFullscreen ? 'w-full h-full' : ''
                }`}
              />
            )}
          </div>
          
          {/* Rating and Tagging Panel - Right Side */}
          {!isFullscreen && currentPhoto && (
            <div className={`absolute right-0 top-0 bottom-0 w-80 bg-black bg-opacity-75 transform transition-transform duration-300 ease-in-out ${
              showRatingPanel ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Toggle Button - Attached to panel */}
              <button
                onClick={() => setShowRatingPanel(!showRatingPanel)}
                className="absolute -left-12 top-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white p-3 rounded-l-lg hover:bg-opacity-90 transition-all duration-300"
                aria-label={showRatingPanel ? 'Close rating panel' : 'Open rating panel'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showRatingPanel ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  )}
                </svg>
              </button>
              
              <div className="p-6 flex flex-col justify-start pt-12 overflow-y-auto h-full">
                {/* Public Gallery Section */}
                <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg mb-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-lg font-semibold">Public Gallery</div>
                    <button
                      onClick={() => {
                        if (currentPhoto) {
                          togglePhotoPublic(currentPhoto.id, event.id);
                          setIsCurrentPhotoPublic(!isCurrentPhotoPublic);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isCurrentPhotoPublic 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isCurrentPhotoPublic ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span>{isCurrentPhotoPublic ? 'In Public Gallery' : 'Add to Public'}</span>
                    </button>
                    <div className="text-xs opacity-60 text-center">
                      {isCurrentPhotoPublic 
                        ? 'This photo is visible in the public gallery' 
                        : 'Photo is not in the public gallery'}
                    </div>
                  </div>
                </div>
                
                {/* Hide/Show Section - Admin Only */}
                {isAdminMode && (
                  <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg mb-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-lg font-semibold">Photo Visibility</div>
                    <button
                      onClick={() => {
                        if (currentPhoto) {
                          togglePhotoHidden(currentPhoto.id, event.id);
                          setIsCurrentPhotoHidden(!isCurrentPhotoHidden);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isCurrentPhotoHidden 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isCurrentPhotoHidden ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                      <span>{isCurrentPhotoHidden ? 'Unhide Photo' : 'Hide Photo'}</span>
                    </button>
                    <div className="text-xs opacity-60 text-center">
                      {isCurrentPhotoHidden 
                        ? 'This photo is hidden from the gallery' 
                        : 'Photo is visible in the gallery'}
                    </div>
                  </div>
                  </div>
                )}
                
                {/* Rating Section */}
                <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg mb-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-lg font-semibold">Rate this photo</div>
                    <StarRating
                      rating={currentRatingValue}
                      onRate={handleRate}
                      size="lg"
                    />
                    {currentRatingValue > 0 ? (
                      <div className="text-sm opacity-90 text-center">
                        You rated this {currentRatingValue} star{currentRatingValue !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div className="text-sm opacity-60 text-center">
                        Click to rate
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tagging Section */}
                <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg mb-4">
                  <div className="mb-4">
                    <div className="text-lg font-semibold mb-1">Tag this photo</div>
                    <div className="text-xs opacity-60">Select categories that describe this photo</div>
                  </div>
                  <TagSelector
                    selectedTags={selectedTags}
                    onTagsChange={handleTagsChange}
                    size="sm"
                  />
                </div>
                
                {/* Flag/Report Section */}
                <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-lg font-semibold">Report Photo</div>
                    
                    {isCurrentPhotoFlagged && !showFlagForm ? (
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          <span>Photo has been flagged</span>
                        </div>
                        <div className="text-xs opacity-60">This photo has been reported for review</div>
                      </div>
                    ) : (
                      <>
                        {!showFlagForm ? (
                          <button
                            onClick={() => setShowFlagForm(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            <span>Flag for Removal</span>
                          </button>
                        ) : (
                          <form onSubmit={handleFlagSubmit} className="w-full space-y-3">
                            <textarea
                              value={flagReason}
                              onChange={(e) => setFlagReason(e.target.value)}
                              placeholder="Reason for removal request (required)"
                              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              rows={3}
                              required
                              disabled={flagSubmitStatus === 'submitting'}
                            />
                            
                            <input
                              type="text"
                              value={flagName}
                              onChange={(e) => setFlagName(e.target.value)}
                              placeholder="Your name (optional)"
                              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              disabled={flagSubmitStatus === 'submitting'}
                            />
                            
                            <input
                              type="email"
                              value={flagEmail}
                              onChange={(e) => setFlagEmail(e.target.value)}
                              placeholder="Your email (optional)"
                              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              disabled={flagSubmitStatus === 'submitting'}
                            />
                            
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={flagSubmitStatus === 'submitting' || !flagReason.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                                  flagSubmitStatus === 'submitting'
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : flagSubmitStatus === 'success'
                                    ? 'bg-green-600'
                                    : flagSubmitStatus === 'error'
                                    ? 'bg-red-600'
                                    : 'bg-orange-600 hover:bg-orange-700'
                                } text-white`}
                              >
                                {flagSubmitStatus === 'submitting' 
                                  ? 'Submitting...' 
                                  : flagSubmitStatus === 'success'
                                  ? 'Submitted!'
                                  : flagSubmitStatus === 'error'
                                  ? 'Failed - Try Again'
                                  : 'Submit Report'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowFlagForm(false);
                                  setFlagReason('');
                                  setFlagEmail('');
                                  setFlagName('');
                                  setFlagSubmitStatus('idle');
                                }}
                                disabled={flagSubmitStatus === 'submitting'}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                            
                            {flagSubmitStatus === 'success' && (
                              <div className="text-xs text-green-400 text-center">
                                Report submitted successfully!
                              </div>
                            )}
                            
                            {flagSubmitStatus === 'error' && (
                              <div className="text-xs text-red-400 text-center">
                                Failed to submit report. Please try again.
                              </div>
                            )}
                          </form>
                        )}
                      </>
                    )}
                    
                    {!showFlagForm && !isCurrentPhotoFlagged && (
                      <div className="text-xs opacity-60 text-center">
                        Request removal of inappropriate content
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Arrows - Positioned at top to avoid interference */}
        {event.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition z-10"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition z-10"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      {!isFullscreen && event.photos.length > 1 && (
        <div className="bg-black bg-opacity-75 p-4">
          <div className="container mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {event.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`flex-shrink-0 ${
                    index === currentPhotoIndex 
                      ? 'ring-2 ring-primary-500' 
                      : 'opacity-60 hover:opacity-100'
                  } transition`}
                >
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}