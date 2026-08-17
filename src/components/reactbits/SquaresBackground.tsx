import React, { useRef, useEffect, useState } from 'react';

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export const SquaresBackground: React.FC<SquaresProps> = ({
  direction = 'right',
  speed = 0.5,
  borderColor = '#27272a',
  squareSize = 40,
  hoverFillColor = 'rgba(99, 102, 241, 0.12)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const [hoveredSquare, setHoveredSquare] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          if (
            hoveredSquare &&
            Math.floor((squareX + squareSize / 2) / squareSize) === hoveredSquare.x &&
            Math.floor((squareY + squareSize / 2) / squareSize) === hoveredSquare.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x -= effectiveSpeed;
          break;
        case 'left':
          gridOffset.current.x += effectiveSpeed;
          break;
        case 'up':
          gridOffset.current.y += effectiveSpeed;
          break;
        case 'down':
          gridOffset.current.y -= effectiveSpeed;
          break;
        case 'diagonal':
          gridOffset.current.x -= effectiveSpeed;
          gridOffset.current.y -= effectiveSpeed;
          break;
        default:
          break;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, hoverFillColor, hoveredSquare, squareSize]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const hoveredSquareX = Math.floor((mouseX + (gridOffset.current.x % squareSize)) / squareSize);
    const hoveredSquareY = Math.floor((mouseY + (gridOffset.current.y % squareSize)) / squareSize);

    setHoveredSquare({ x: hoveredSquareX, y: hoveredSquareY });
  };

  const handleMouseLeave = () => {
    setHoveredSquare(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 h-full w-full pointer-events-auto ${className}`}
    />
  );
};
