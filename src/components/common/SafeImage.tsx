import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackBg?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  fallbackText,
  fallbackBg = 'bg-brand-50 text-brand-700',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // If there's an error or no source, render a clean fallback badge
  if (hasError || !src) {
    const initials = fallbackText
      ? fallbackText
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : alt.substring(0, 2).toUpperCase() || 'BZ';

    return (
      <div
        className={`flex items-center justify-center font-bold select-none ${fallbackBg} ${className}`}
        title={alt}
        role="img"
        aria-label={alt}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};
