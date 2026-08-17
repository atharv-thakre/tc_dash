import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'N/A';
  try {
    let date: Date;
    if (typeof dateInput === 'number') {
      date = dateInput < 1e11 ? new Date(dateInput * 1000) : new Date(dateInput);
    } else {
      date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function maskSecret(val?: string | null, showLength = 4): string {
  if (!val) return '••••••••';
  const str = String(val);
  if (str.length <= showLength) return '••••••••';
  return str.slice(0, showLength) + '••••••••';
}

export function truncateText(str?: string | null, maxLength = 30): string {
  if (!str) return '';
  const s = String(str);
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength) + '...';
}
