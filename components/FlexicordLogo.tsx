import Image from 'next/image';
import React from 'react';

interface FlexicordLogoProps {
  className?: string;
  size?: number;
}

export default function FlexicordLogo({ className = '', size = 32 }: FlexicordLogoProps) {
  return (
    <Image
      src="/flexicord_logo-removebg-preview.png"
      alt="Flexicord logo"
      width={size}
      height={size}
      className={`transition-all duration-300 ${className}`}
      priority
    />
  );
}
