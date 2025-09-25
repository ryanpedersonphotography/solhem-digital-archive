import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  thumbnailSrc,
  onLoad,
  onError 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (inView && !imageSrc) {
      // Start loading the image
      setImageSrc(thumbnailSrc || src);
      
      // Preload the full image if we're using a thumbnail
      if (thumbnailSrc && thumbnailSrc !== src) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImageSrc(src);
          setImageLoaded(true);
          onLoad?.();
        };
        img.onerror = () => {
          setImageError(true);
          onError?.();
        };
      }
    }
  }, [inView, src, thumbnailSrc, imageSrc, onLoad, onError]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (!thumbnailSrc || imageSrc === src) {
      onLoad?.();
    }
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      
      {/* Error placeholder */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Actual image */}
      {imageSrc && !imageError && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}