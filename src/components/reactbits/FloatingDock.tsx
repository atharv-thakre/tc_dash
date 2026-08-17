import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { KeyRound, FileCode2, BookOpen, Sparkles, LogIn, Server, Github } from 'lucide-react';
import { ApiConfigModal } from '../common/ApiConfigModal';

interface DockItemProps {
  mouseX: ReturnType<typeof useMotionValue>;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  active?: boolean;
  textColorClass?: string;
  borderColorClass?: string;
  dotColorClass?: string;
  shadowClass?: string;
  hoverBorderClass?: string;
}

const DockIcon: React.FC<DockItemProps> = ({
  mouseX,
  title,
  icon,
  onClick,
  badge,
  active,
  textColorClass = 'text-indigo-300',
  borderColorClass = 'border-indigo-500/40',
  dotColorClass = 'bg-indigo-400',
  shadowClass = 'shadow-indigo-950/40',
  hoverBorderClass = 'hover:border-indigo-500/40 hover:bg-indigo-500/10',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 58, 42]);
  const width = useSpring(widthSync, { mass: 0.08, stiffness: 420, damping: 24 });

  return (
    <div className="relative">
      {/* Fast, crisp floating tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.94, x: '-50%' }}
            animate={{ opacity: 1, y: -4, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 2, scale: 0.94, x: '-50%' }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-950/95 border ${borderColorClass} text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-xl ${shadowClass} backdrop-blur-md z-50 flex items-center gap-1.5`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} animate-pulse`} />
            <span className={textColorClass}>{title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center justify-center rounded-2xl border cursor-pointer select-none transition-colors duration-150 ${
          active
            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
            : `bg-zinc-900/90 border-zinc-800 text-zinc-400 ${hoverBorderClass}`
        }`}
      >
        {badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-zinc-950 shadow-sm" />
        )}

        <div className="w-5 h-5 flex items-center justify-center pointer-events-none">
          {icon}
        </div>
      </motion.div>
    </div>
  );
};

interface FloatingDockProps {
  onNavigate: (path: string) => void;
  onLaunchDemo?: () => void;
  onOpenConfig?: () => void;
  className?: string;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onNavigate,
  onLaunchDemo,
  onOpenConfig,
  className = '',
}) => {
  const mouseX = useMotionValue(Infinity);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleOpenConfig = () => {
    if (onOpenConfig) {
      onOpenConfig();
    } else {
      setIsConfigOpen(true);
    }
  };

  const dockItems: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    badge?: string;
    active?: boolean;
    textColorClass: string;
    borderColorClass: string;
    dotColorClass: string;
    shadowClass: string;
    hoverBorderClass: string;
  }> = [
    {
      title: 'Enter Demo Mode',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      onClick: onLaunchDemo || (() => onNavigate('/dashboard')),
      badge: 'Demo',
      textColorClass: 'text-amber-300',
      borderColorClass: 'border-amber-500/50',
      dotColorClass: 'bg-amber-400',
      shadowClass: 'shadow-amber-950/60',
      hoverBorderClass: 'hover:border-amber-500/60 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300',
    },
    {
      title: 'Explore Overview',
      icon: <KeyRound className="w-4 h-4 text-rose-400" />,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      textColorClass: 'text-rose-300',
      borderColorClass: 'border-rose-500/50',
      dotColorClass: 'bg-rose-400',
      shadowClass: 'shadow-rose-950/60',
      hoverBorderClass: 'hover:border-rose-500/60 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-300',
    },
    {
      title: 'REST API Docs',
      icon: <FileCode2 className="w-4 h-4 text-sky-400" />,
      onClick: () => onNavigate('/docs/api/login-routes'),
      textColorClass: 'text-sky-300',
      borderColorClass: 'border-sky-500/50',
      dotColorClass: 'bg-sky-400',
      shadowClass: 'shadow-sky-950/60',
      hoverBorderClass: 'hover:border-sky-500/60 hover:bg-sky-500/10 text-zinc-300 hover:text-sky-300',
    },
    {
      title: 'Python SDK Docs',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      onClick: () => onNavigate('/docs/lib/setup'),
      textColorClass: 'text-purple-300',
      borderColorClass: 'border-purple-500/50',
      dotColorClass: 'bg-purple-400',
      shadowClass: 'shadow-purple-950/60',
      hoverBorderClass: 'hover:border-purple-500/60 hover:bg-purple-500/10 text-zinc-300 hover:text-purple-300',
    },
    {
      title: 'GitHub: tc_auth (Python)',
      icon: <Github className="w-4 h-4 text-zinc-200" />,
      onClick: () => window.open('https://github.com/atharv-thakre/tc_auth', '_blank'),
      textColorClass: 'text-zinc-200',
      borderColorClass: 'border-zinc-500/50',
      dotColorClass: 'bg-zinc-300',
      shadowClass: 'shadow-zinc-950/60',
      hoverBorderClass: 'hover:border-zinc-500/60 hover:bg-zinc-800/40 text-zinc-300 hover:text-white',
    },
    {
      title: 'Configure Server URL',
      icon: <Server className="w-4 h-4 text-emerald-400" />,
      onClick: handleOpenConfig,
      textColorClass: 'text-emerald-300',
      borderColorClass: 'border-emerald-500/50',
      dotColorClass: 'bg-emerald-400',
      shadowClass: 'shadow-emerald-950/60',
      hoverBorderClass: 'hover:border-emerald-500/60 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-300',
    },
    {
      title: 'Sign In to Console',
      icon: <LogIn className="w-4 h-4 text-indigo-400" />,
      onClick: () => onNavigate('/login'),
      textColorClass: 'text-indigo-300',
      borderColorClass: 'border-indigo-500/50',
      dotColorClass: 'bg-indigo-400',
      shadowClass: 'shadow-indigo-950/60',
      hoverBorderClass: 'hover:border-indigo-500/60 hover:bg-indigo-500/10 text-zinc-300 hover:text-indigo-300',
    },
  ];

  return (
    <>
      <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1rem)] px-2 ${className}`}>
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-xl shadow-2xl shadow-indigo-950/30 overflow-visible max-w-full"
        >
          {dockItems.map((item, i) => (
            <DockIcon
              key={i}
              mouseX={mouseX}
              title={item.title}
              icon={item.icon}
              onClick={item.onClick}
              badge={item.badge}
              active={item.active}
              textColorClass={item.textColorClass}
              borderColorClass={item.borderColorClass}
              dotColorClass={item.dotColorClass}
              shadowClass={item.shadowClass}
              hoverBorderClass={item.hoverBorderClass}
            />
          ))}
        </motion.div>
      </div>

      <ApiConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
};
