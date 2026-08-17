import React from 'react';
import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; transform: string; filter?: string };
  animationTo?: { opacity: number; transform: string; filter?: string };
  easing?: string | number[];
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit';
  onLetterAnimationComplete?: () => void;
  splitBy?: 'words' | 'characters';
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  animationFrom = { opacity: 0, transform: 'translate3d(0,25px,0)', filter: 'blur(8px)' },
  animationTo = { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0px)' },
  splitBy = 'words',
}) => {
  const elements = splitBy === 'words' ? text.split(' ') : text.split('');

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((item, index) => (
        <motion.span
          key={index}
          initial={animationFrom}
          whileInView={animationTo}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.5,
            delay: (index * delay) / 1000,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="inline-block whitespace-pre"
        >
          {item}
          {splitBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};
