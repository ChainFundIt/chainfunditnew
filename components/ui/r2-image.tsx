import React from 'react';
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

export function R2Image({ src, alt, ...props }: R2ImageProps) {
  // Validate src - return null if invalid
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return null;
  }

  // Try to validate URL format for non-relative paths
  if (!src.startsWith('/') && !src.startsWith('http://') && !src.startsWith('https://')) {
    // If it's not a relative path or absolute URL, it's invalid
    return null;
  }

  // Check if the image is from R2 (Cloudflare R2) or local uploads
  const isR2Image = src.includes('r2.dev') || src.includes('pub-');
  const isLocalImage = src.startsWith('/uploads/');
  
  if (isR2Image || isLocalImage) {
    // For R2 images and local uploads, use unoptimized to avoid 401 errors
    return (
      <Image
        src={src}
        alt={alt}
        unoptimized
        {...props}
      />
    );
  }
  
  // For other images, use normal optimization
  return (
    <Image
      src={src}
      alt={alt}
      {...props}
    />
  );
}
