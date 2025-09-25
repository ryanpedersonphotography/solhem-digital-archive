import { useState, useEffect } from 'react';
import type { PropertyEvent } from '../../types';

interface EventGalleryProps {
  event: PropertyEvent;
  onClose: () => void;
}

export default function EventGallery({ event, onClose }: EventGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
        {/* Main Image */}
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
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition"
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