import React, { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'hover' | 'view' | 'both';
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?/~';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  characters = DEFAULT_CHARS,
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-indigo-400 opacity-80',
  animateOn = 'hover',
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    let iteration = 0;
    const textLength = text.length;
    const currentRevealed = new Set<number>();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      iteration++;

      if (sequential) {
        const nextIndex = Math.min(Math.floor((iteration / maxIterations) * textLength), textLength);
        for (let i = 0; i < nextIndex; i++) {
          currentRevealed.add(i);
        }
        setRevealedIndices(new Set(currentRevealed));
      }

      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (currentRevealed.has(index) || (!sequential && iteration >= maxIterations)) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      if (iteration >= maxIterations || currentRevealed.size >= textLength) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view' || animateOn === 'both') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            startScramble();
          }
        },
        { threshold: 0.2 }
      );
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      return () => observer.disconnect();
    }
  }, [text, animateOn]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (animateOn === 'hover' || animateOn === 'both') {
      startScramble();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex font-mono select-none cursor-default ${parentClassName}`}
    >
      {displayText.split('').map((char, i) => {
        const isOriginal = char === text[i];
        return (
          <span
            key={i}
            className={`${className} ${!isOriginal ? encryptedClassName : ''}`}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};
