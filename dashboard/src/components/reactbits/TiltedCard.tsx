'use client';

import React, { useRef, useState } from 'react';
import type { SpringOptions } from 'motion/react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

export interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties['height'];
  containerWidth?: React.CSSProperties['width'];
  imageHeight?: React.CSSProperties['height'];
  imageWidth?: React.CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  captionBackground?: string;
  captionColor?: string;
}

// === Constants

const SPRING_VALUES: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

// === Component

export const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText = '',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = false,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  captionBackground = '#0f0f0f',
  captionColor = '#e8e8e8',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const reduced: boolean = usePrefersReducedMotion();

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);
  const rotateX = useSpring(useMotionValue<number>(0), SPRING_VALUES);
  const rotateY = useSpring(useMotionValue<number>(0), SPRING_VALUES);
  const scale = useSpring(1, SPRING_VALUES);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

  const [lastY, setLastY] = useState<number>(0);

  const handleMouse = (event: React.MouseEvent<HTMLElement>): void => {
    if (reduced || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);

    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);

    rotateFigcaption.set(-(offsetY - lastY) * 0.6);
    setLastY(offsetY);
  };

  const handleMouseEnter = (): void => {
    if (reduced) return;
    scale.set(scaleOnHover);
    opacity.set(1);
  };

  const handleMouseLeave = (): void => {
    if (reduced) return;
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  };

  const decorative = altText.length === 0;

  return (
    <figure
      ref={ref}
      className="relative flex h-full w-full flex-col items-center justify-center [perspective:800px]"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <p className="absolute top-4 block text-center text-sm sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </p>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={altText}
          aria-hidden={decorative || undefined}
          className="absolute left-0 top-0 rounded-[15px] object-cover will-change-transform [transform:translateZ(0)]"
          style={{ width: imageWidth, height: imageHeight }}
        />

        {displayOverlayContent && overlayContent && (
          <div className="absolute left-0 top-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </div>
        )}
      </motion.div>

      {showTooltip && captionText && (
        <motion.figcaption
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-[3] hidden rounded-[4px] px-[10px] py-[4px] text-[10px] opacity-0 sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
            background: captionBackground,
            color: captionColor,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
};

export default TiltedCard;
