import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Skeleton, Fade, Zoom } from '@mui/material';
import { usePerformance } from '../hooks/usePerformance';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  fallback?: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  blur?: boolean;
  skeleton?: boolean;
  fadeIn?: boolean;
  zoom?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder,
  fallback,
  quality = 80,
  format = 'webp',
  blur = true,
  skeleton = true,
  fadeIn = true,
  zoom = false,
  onLoad,
  onError,
  className,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { optimizeImage, measureAsync } = usePerformance();

  // Optimize image URL
  const optimizedSrc = useCallback(() => {
    if (!src) return '';
    
    return optimizeImage(src, {
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      quality,
      format,
    });
  }, [src, width, height, quality, format, optimizeImage]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const loadImage = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const optimizedUrl = optimizedSrc();
        
        await measureAsync(async () => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
              setImageSrc(optimizedUrl);
              setIsLoaded(true);
              setIsLoading(false);
              onLoad?.();
              resolve();
            };
            
            img.onerror = () => {
              setIsError(true);
              setIsLoading(false);
              setImageSrc(fallback || placeholder || '');
              onError?.();
              reject(new Error('Image load failed'));
            };
            
            img.src = optimizedUrl;
          });
        }, 'LazyImage.load');
      } catch (error) {
        console.error('Image loading error:', error);
        setIsError(true);
        setIsLoading(false);
        setImageSrc(fallback || placeholder || '');
        onError?.();
      }
    };

    loadImage();
  }, [isInView, src, optimizedSrc, fallback, placeholder, onLoad, onError, measureAsync]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    filter: blur && !isLoaded ? 'blur(5px)' : 'none',
    ...style,
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || '100%',
    height: height || 'auto',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    ...style,
  };

  if (skeleton && isLoading) {
    return (
      <Box sx={containerStyle} className={className}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={height || 200}
          animation="wave"
        />
      </Box>
    );
  }

  const ImageComponent = (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      style={imageStyle}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );

  if (fadeIn && isLoaded) {
    return (
      <Box sx={containerStyle}>
        <Fade in={isLoaded} timeout={300}>
          {ImageComponent}
        </Fade>
      </Box>
    );
  }

  if (zoom && isLoaded) {
    return (
      <Box sx={containerStyle}>
        <Zoom in={isLoaded} timeout={300}>
          {ImageComponent}
        </Zoom>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      {ImageComponent}
    </Box>
  );
};

export default LazyImage;







