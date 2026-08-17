import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: { type: string; damping: number; stiffness: number; mass: number };
  inactiveTransition?: { type: string; damping: number; stiffness: number; mass: number };
  className?: string;
  onClick?: () => void;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 40,
  disabled = false,
  magnetStrength = 0.35,
  activeTransition = { type: 'spring', damping: 15, stiffness: 200, mass: 0.1 },
  inactiveTransition = { type: 'spring', damping: 12, stiffness: 150, mass: 0.2 },
  className = '',
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, activeTransition);
  const springY = useSpring(y, activeTransition);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;

    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * magnetStrength);
    y.set(distanceY * magnetStrength);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        x: springX,
        y: springY,
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
