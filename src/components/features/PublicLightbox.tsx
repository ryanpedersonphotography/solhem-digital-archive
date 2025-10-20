import { useState, useEffect } from 'react';
import type { PropertyEvent } from '../../types';
import useFlagStore from '../../stores/flagStore';

interface PublicLightboxProps {
  event: PropertyEvent;
  onClose: () => void;
  initialPhotoIndex?: number;
}

export default function PublicLightbox({ event, onClose, initialPhotoIndex = 0 }: PublicLightboxProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagEmail, setFlagEmail] = useState('');
  const [flagName, setFlagName] = useState('');
  const [flagApartment, setFlagApartment] = useState('');
  const [flagSubmitStatus, setFlagSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const { flagPhoto, isPhotoFlagged, markAsSubmitted } = useFlagStore();
  
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

  // Handle scroll lock and keyboard navigation
  useEffect(() => {
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
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
    
    // Cleanup: restore original scroll behavior
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen]);
  
  const currentPhoto = event.photos[currentPhotoIndex];
  const isCurrentPhotoFlagged = currentPhoto ? isPhotoFlagged(currentPhoto.id) : false;
  
  // Reset flag form when changing photos
  useEffect(() => {
    if (currentPhoto) {
      setShowFlagForm(false);
      setFlagReason('');
      setFlagApartment('');
      setFlagSubmitStatus('idle');
    }
  }, [currentPhotoIndex, currentPhoto]);
  
  const handleDownload = async () => {
    if (!currentPhoto) return;
    
    try {
      const response = await fetch(currentPhoto.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.id}-photo-${currentPhotoIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'email' | 'copy') => {
    const shareUrl = window.location.href;
    const shareText = `Check out this photo from ${event.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    
    setShowShareMenu(false);
  };
  
  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhoto || !flagReason.trim() || !flagName.trim() || !flagEmail.trim() || !flagApartment.trim()) return;
    
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
    formData.append('email', flagEmail);
    formData.append('name', flagName);
    formData.append('apartment', flagApartment);
    formData.append('timestamp', new Date().toISOString());
    
    try {
      const response = await fetch('/', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        markAsSubmitted(currentPhoto.id);
        setFlagSubmitStatus('success');
        
        // Reset form after success
        setTimeout(() => {
          setShowFlagForm(false);
          setFlagReason('');
          setFlagEmail('');
          setFlagName('');
          setFlagApartment('');
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
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
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
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {currentPhotoIndex + 1} / {event.photos.length}
            </span>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Download photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                title="Share"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-4.42 4.42 1.5 1.5 0 003.162-1.128c.063-.332.096-.674.096-1.026s-.033-.694-.096-1.026a1.5 1.5 0 00-3.162-1.128m-1.294-4.026a3 3 0 104.42-4.42 1.5 1.5 0 00-3.162 1.128c-.063.332-.096.674-.096 1.026s.033.694.096 1.026a1.5 1.5 0 003.162 1.128" />
                </svg>
              </button>
              
              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Share via Email
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
            
            {/* Flag/Report Button */}
            <div className="relative">
              <button
                onClick={() => setShowFlagForm(!showFlagForm)}
                className={`p-2 rounded-lg transition ${
                  isCurrentPhotoFlagged 
                    ? 'bg-orange-600 bg-opacity-50 hover:bg-opacity-70' 
                    : 'hover:bg-white hover:bg-opacity-20'
                }`}
                title={isCurrentPhotoFlagged ? "Photo already flagged" : "Report photo"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </button>
            </div>
            
            {/* Fullscreen Button */}
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
            
            {/* Close Button */}
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
        <div className="h-full flex items-center justify-center p-4">
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
        
        {/* Navigation Arrows */}
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
                      ? 'ring-2 ring-white' 
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
      
      {/* Flag Form Modal */}
      {showFlagForm && (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request To Remove Photo</h3>
            
            {isCurrentPhotoFlagged ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  <span className="text-lg">Photo has been flagged</span>
                </div>
                <p className="text-sm opacity-75 mb-4">This photo has already been reported for review.</p>
                <button
                  onClick={() => setShowFlagForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={flagName}
                    onChange={(e) => setFlagName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={flagSubmitStatus === 'submitting'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apartment number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={flagApartment}
                    onChange={(e) => setFlagApartment(e.target.value)}
                    placeholder="Enter your apartment number"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={flagSubmitStatus === 'submitting'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={flagEmail}
                    onChange={(e) => setFlagEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={flagSubmitStatus === 'submitting'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for removal request <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Please explain why this photo should be removed..."
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                    required
                    disabled={flagSubmitStatus === 'submitting'}
                  />
                </div>
                
                <div className="text-xs text-gray-400">
                  Your report will be reviewed by the gallery administrator.
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={flagSubmitStatus === 'submitting' || !flagReason.trim() || !flagName.trim() || !flagEmail.trim() || !flagApartment.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                      flagSubmitStatus === 'submitting'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : flagSubmitStatus === 'success'
                        ? 'bg-green-600'
                        : flagSubmitStatus === 'error'
                        ? 'bg-red-600'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {flagSubmitStatus === 'submitting' 
                      ? 'Submitting...' 
                      : flagSubmitStatus === 'success'
                      ? 'Submitted!'
                      : flagSubmitStatus === 'error'
                      ? 'Failed - Try Again'
                      : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFlagForm(false);
                      setFlagReason('');
                      setFlagEmail('');
                      setFlagName('');
                      setFlagApartment('');
                      setFlagSubmitStatus('idle');
                    }}
                    disabled={flagSubmitStatus === 'submitting'}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
                
                {flagSubmitStatus === 'success' && (
                  <div className="text-green-400 text-sm text-center">
                    Thank you! Your report has been submitted successfully.
                  </div>
                )}
                
                {flagSubmitStatus === 'error' && (
                  <div className="text-red-400 text-sm text-center">
                    Failed to submit report. Please try again.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}