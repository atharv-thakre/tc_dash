import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface TrueFocusProps {
  sentence?: string;
  words?: string[];
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  onWordClick?: (word: string, index: number) => void;
  activeIndex?: number;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'Modular Pythonic Stateful Authentication',
  words,
  manualMode = false,
  blurAmount = 4,
  borderColor = '#6366f1',
  glowColor = 'rgba(99, 102, 241, 0.4)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1.5,
  className = '',
  onWordClick,
  activeIndex: controlledIndex,
}) => {
  const wordList = words || sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });

  const activeIdx = controlledIndex !== undefined ? controlledIndex : currentIndex;

  useEffect(() => {
    if (manualMode) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % wordList.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, wordList.length]);

  useEffect(() => {
    if (!wordRefs.current[activeIdx] || !containerRef.current) return;
    const target = wordRefs.current[activeIdx]!;
    const container = containerRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    setFocusRect({
      x: targetRect.left - container.left - 6,
      y: targetRect.top - container.top - 4,
      width: targetRect.width + 12,
      height: targetRect.height + 8,
    });
  }, [activeIdx, wordList]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-wrap items-center gap-3 p-2 ${className}`}
    >
      {wordList.map((word, index) => {
        const isActive = index === activeIdx;
        return (
          <span
            key={index}
            ref={(el) => (wordRefs.current[index] = el)}
            onClick={() => {
              if (manualMode || onWordClick) {
                setCurrentIndex(index);
                onWordClick?.(word, index);
              }
            }}
            onMouseEnter={() => {
              if (manualMode) {
                setCurrentIndex(index);
              }
            }}
            className={`relative z-10 px-2 py-1 text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer select-none ${
              isActive
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {word}
          </span>
        );
      })}

      {/* Animated Focus Box with corner brackets */}
      <motion.div
        className="pointer-events-none absolute z-0 rounded-lg border-2"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: focusRect.width > 0 ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 28,
        }}
        style={{
          borderColor,
          boxShadow: `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}`,
        }}
      >
        {/* Corner Accents */}
        <span
          className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
          style={{ borderColor }}
        />
      </motion.div>
    </div>
  );
};
