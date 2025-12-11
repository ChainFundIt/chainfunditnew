import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface R2ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  priority?: boolean;
}

// Simple placeholder component that uses local fallback image
const ImagePlaceholder = ({ alt, className, style, width, height, fill }: Omit<R2ImageProps, 'src'>) => {
  // Use card-img1.png as the default fallback image
  const fallbackSrc = '/images/card-img1.png';
  
  if (fill) {
    return (
      <div className={`absolute inset-0 ${className || ''}`} style={style}>
        <Image
          src={fallbackSrc}
          alt={alt || 'Image placeholder'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <Image
      src={fallbackSrc}
      alt={alt || 'Image placeholder'}
      width={width || 400}
      height={height || 200}
      className={className}
      style={style}
      unoptimized
    />
  );
};

export function R2Image({ src, alt, ...props }: R2ImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Validate src - return null if invalid so parent can show custom fallback
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return null;
  }

  // Allow clearbit.com URLs to be displayed (they may work in some cases)
  // The component using R2Image should handle showing placeholder if needed

  // Fix "undefined/" prefix in URLs (common issue from broken uploads)
  // This is a client-side workaround - the proper fix should be done server-side via API
  let fixedSrc = src;
  if (src.includes('undefined/')) {
    // Use the R2 domain from next.config.js as fallback
    const r2BaseUrl = 'https://pub-bc49c704eeac4df0a625097110e79d09.r2.dev';
    const fileName = src.replace(/^undefined\//, '').replace(/^\//, ''); // Remove undefined/ and any leading slash
    fixedSrc = `${r2BaseUrl}/${fileName}`;
    console.warn(`R2Image: Fixed undefined/ URL: ${src} → ${fixedSrc}`);
  }

  // Try to validate URL format for non-relative paths
  if (!fixedSrc.startsWith('/') && !fixedSrc.startsWith('http://') && !fixedSrc.startsWith('https://')) {
    // If it's not a relative path or absolute URL, it's invalid - return null
    return null;
  }

  // If there was an error, return null so parent can show custom fallback
  if (hasError) {
    return null;
  }

  // Check if the image is from R2 (Cloudflare R2) or local uploads
  const isR2Image = fixedSrc.includes('r2.dev') || fixedSrc.includes('pub-');
  const isLocalImage = fixedSrc.startsWith('/uploads/');
  
  if (isR2Image || isLocalImage) {
    // For R2 images and local uploads, use unoptimized to avoid 401 errors
    return (
      <Image
        src={fixedSrc}
        alt={alt}
        unoptimized
        onError={(e) => {
          console.error(`R2Image: Failed to load image: ${fixedSrc} (original: ${src})`);
          setHasError(true);
        }}
        onLoad={() => {
          setHasError(false);
        }}
        {...props}
      />
    );
  }
  
  // For other images, use normal optimization
  return (
    <Image
      src={fixedSrc}
      alt={alt}
      onError={(e) => {
        console.error(`R2Image: Failed to load image: ${fixedSrc} (original: ${src})`);
        setHasError(true);
      }}
      onLoad={() => {
        setHasError(false);
      }}
      {...props}
    />
  );
}
