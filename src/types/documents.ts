export interface DocumentNode {
  name: string;
  path: string; // Relative to documents root, e.g. "sdk/connect/connect.py"
  type: 'file' | 'directory';
  extension?: string;
  language?: string;
  size?: number;
  sizeFormatted?: string;
  lines?: number;
  modifiedAt?: string;
  children?: DocumentNode[];
}

export interface DocumentContent {
  name: string;
  path: string;
  extension: string;
  language: string;
  size: number;
  sizeFormatted: string;
  lines: number;
  words: number;
  modifiedAt: string;
  content: string;
  staticUrl: string;
}

export interface TreeStats {
  totalFiles: number;
  totalDirectories: number;
  totalBytes: number;
  totalBytesFormatted: string;
  languages: Record<string, number>;
}

export interface DocumentSearchMatch {
  path: string;
  name: string;
  extension: string;
  language: string;
  matchesCount: number;
  snippets: Array<{ line: number; text: string }>;
}
