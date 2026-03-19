import React, { useState, useRef, useEffect } from 'react';

// Simple utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Aspect ratio (e.g. 2/3 for posters) to avoid layout shift when width/height not set */
  aspectRatio?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio,
  priority = false,
  placeholder = '/images/placeholder.jpg',
  onLoad,
  onError,
}) => {
  const hasDimensions = typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0;
  const containerStyle: React.CSSProperties = {};
  if (typeof width === 'number' && width > 0) containerStyle.width = width;
  if (typeof height === 'number' && height > 0) containerStyle.height = height;
  if (typeof aspectRatio === 'number' && aspectRatio > 0 && !hasDimensions) {
    containerStyle.aspectRatio = String(aspectRatio);
  }
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading — observe container (img not in DOM until isInView)
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc) return '';
    
    // For demonstration - in production, you'd have actual different sized images
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = () => {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-800',
        className
      )}
      style={Object.keys(containerStyle).length > 0 ? containerStyle : undefined}
    >
      {/* Low-quality placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ 
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          fetchPriority={priority ? 'high' : undefined}
          src={hasError ? placeholder : src}
          srcSet={hasError ? '' : generateSrcSet(src)}
          sizes={generateSizes()}
          alt={alt}
          {...(hasDimensions ? { width, height } : {})}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full object-cover'
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// Memoized version for static images
export const MemoizedOptimizedImage = React.memo(OptimizedImage);
