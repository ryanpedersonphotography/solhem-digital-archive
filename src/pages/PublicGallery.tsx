import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventsData } from '../utils/eventData';
import usePublicStore from '../stores/publicStore';
import PublicLightbox from '../components/features/PublicLightbox';
import LazyImage from '../components/ui/LazyImage';

const GALLERY_PASSWORD = 'solhem2025';

export default function PublicGallery() {
  const { eventSlug } = useParams(); // e.g., "fred-2025"
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const { getPublicPhotos, getPublicPhotoCount } = usePublicStore();
  
  // Check if already authenticated from session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(`gallery-auth-${eventSlug}`);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, [eventSlug]);
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === GALLERY_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
      // Store in session so they don't need to re-enter for this session
      sessionStorage.setItem(`gallery-auth-${eventSlug}`, 'true');
    } else {
      setPasswordError(true);
      setPassword('');
    }
  };
  
  // Find the event based on the slug
  const event = useMemo(() => {
    for (const yearData of eventsData) {
      const foundEvent = yearData.events.find(e => e.id === eventSlug);
      if (foundEvent) return foundEvent;
    }
    return null;
  }, [eventSlug]);
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery Not Found</h1>
          <p className="text-gray-600 mb-8">The gallery you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  // Get only public photos for this event
  const publicPhotoIds = getPublicPhotos(event.id).map(p => p.photoId);
  const publicPhotos = event.photos.filter(photo => publicPhotoIds.includes(photo.id));
  
  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowLightbox(true);
  };
  
  const publicPhotoCount = getPublicPhotoCount(event.id);
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'email' | 'copy') => {
    const shareUrl = window.location.href;
    const shareText = `Check out photos from ${event.title}`;
    
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
        alert('Gallery link copied to clipboard!');
        break;
    }
    
    setShowShareMenu(false);
  };
  
  if (publicPhotoCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery Coming Soon</h1>
          <p className="text-gray-600 mb-8">This gallery is being prepared. Please check back later.</p>
        </div>
      </div>
    );
  }
  
  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-gray-600">
              {new Date(event.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter password to view gallery
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter gallery password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              View Gallery
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This gallery contains {publicPhotos.length} photos
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header without navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} • {publicPhotos.length} Photos
              </p>
            </div>
            
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-4.42 4.42 1.5 1.5 0 003.162-1.128c.063-.332.096-.674.096-1.026s-.033-.694-.096-1.026a1.5 1.5 0 00-3.162-1.128m-1.294-4.026a3 3 0 104.42-4.42 1.5 1.5 0 00-3.162 1.128c-.063.332-.096.674-.096 1.026s.033.694.096 1.026a1.5 1.5 0 003.162 1.128" />
                </svg>
                <span>Share Gallery</span>
              </button>
              
              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Photo Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {publicPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => handlePhotoClick(index)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <LazyImage
                  src={photo.url}
                  thumbnailSrc={photo.thumbnail}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Public Lightbox */}
      {showLightbox && (
        <PublicLightbox
          event={{ ...event, photos: publicPhotos }}
          initialPhotoIndex={selectedPhotoIndex}
          onClose={() => {
            setShowLightbox(false);
            setSelectedPhotoIndex(0);
          }}
        />
      )}
      
      {/* Footer */}
      <footer className="mt-12 py-6 bg-gray-100">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} {event.propertyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}