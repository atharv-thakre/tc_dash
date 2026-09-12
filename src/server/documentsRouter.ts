import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const documentsRouter = Router();

const DOCUMENTS_ROOT = path.resolve(process.cwd(), 'documents');

export interface DocumentNode {
  name: string;
  path: string; // relative to documents root, e.g. "sdk/connect/connect.py"
  type: 'file' | 'directory';
  extension?: string;
  language?: string;
  size?: number;
  sizeFormatted?: string;
  lines?: number;
  modifiedAt?: string;
  children?: DocumentNode[];
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function detectLanguage(extension: string, filename: string): string {
  const ext = extension.toLowerCase();
  const lowerName = filename.toLowerCase();

  if (ext === '.md' || ext === '.markdown') return 'markdown';
  if (ext === '.py') return 'python';
  if (ext === '.ts') return 'typescript';
  if (ext === '.tsx') return 'typescript-react';
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'javascript';
  if (ext === '.jsx') return 'javascript-react';
  if (ext === '.json') return 'json';
  if (ext === '.txt' || ext === '') return 'text';
  if (ext === '.sh' || ext === '.bash') return 'shell';
  if (ext === '.yml' || ext === '.yaml') return 'yaml';
  if (ext === '.html' || ext === '.htm') return 'html';
  if (ext === '.css') return 'css';
  if (ext === '.sql') return 'sql';
  if (lowerName === 'dockerfile') return 'dockerfile';
  return 'text';
}

function readDirRecursive(dirPath: string, relativePath = ''): DocumentNode[] {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: DocumentNode[] = [];

  for (const entry of entries) {
    // Skip hidden files or system files
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);
    const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = readDirRecursive(fullPath, itemRelativePath);
      nodes.push({
        name: entry.name,
        path: itemRelativePath,
        type: 'directory',
        children,
      });
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      const ext = path.extname(entry.name);
      nodes.push({
        name: entry.name,
        path: itemRelativePath,
        type: 'file',
        extension: ext,
        language: detectLanguage(ext, entry.name),
        size: stat.size,
        sizeFormatted: formatBytes(stat.size),
        modifiedAt: stat.mtime.toISOString(),
      });
    }
  }

  // Sort: directories first (alphabetical), then files (alphabetical)
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function collectFlatFiles(nodes: DocumentNode[]): DocumentNode[] {
  let files: DocumentNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      files = files.concat(collectFlatFiles(node.children));
    }
  }
  return files;
}

// GET /api/documents/tree
documentsRouter.get('/tree', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(DOCUMENTS_ROOT)) {
      return res.json({
        tree: [],
        stats: { totalFiles: 0, totalDirectories: 0, totalBytes: 0, languages: {} },
      });
    }

    const tree = readDirRecursive(DOCUMENTS_ROOT);
    const flatFiles = collectFlatFiles(tree);

    let totalBytes = 0;
    const languages: Record<string, number> = {};

    flatFiles.forEach((file) => {
      totalBytes += file.size || 0;
      const lang = file.language || 'other';
      languages[lang] = (languages[lang] || 0) + 1;
    });

    const countDirs = (items: DocumentNode[]): number => {
      let count = 0;
      for (const item of items) {
        if (item.type === 'directory') {
          count += 1 + countDirs(item.children || []);
        }
      }
      return count;
    };

    res.json({
      tree,
      stats: {
        totalFiles: flatFiles.length,
        totalDirectories: countDirs(tree),
        totalBytes,
        totalBytesFormatted: formatBytes(totalBytes),
        languages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read documents tree', message: err?.message });
  }
});

// GET /api/documents/file?path=sdk/connect/connect.py
documentsRouter.get('/file', (req: Request, res: Response) => {
  try {
    const rawPath = req.query.path as string;
    if (!rawPath) {
      return res.status(400).json({ error: 'Missing path query parameter' });
    }

    // Prevent directory traversal attacks
    const safePath = path.normalize(rawPath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.resolve(DOCUMENTS_ROOT, safePath);

    if (!absolutePath.startsWith(DOCUMENTS_ROOT)) {
      return res.status(403).json({ error: 'Forbidden path outside documents root' });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Document file not found', path: safePath });
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: 'Specified path is a directory, not a file' });
    }

    const filename = path.basename(absolutePath);
    const ext = path.extname(absolutePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const lines = content.split('\n').length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const language = detectLanguage(ext, filename);

    res.json({
      name: filename,
      path: safePath.replace(/\\/g, '/'),
      extension: ext,
      language,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      lines,
      words,
      modifiedAt: stat.mtime.toISOString(),
      content,
      staticUrl: `/documents/${safePath.replace(/\\/g, '/')}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read document content', message: err?.message });
  }
});

// GET /api/documents/search?q=keyword
documentsRouter.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    if (!query || query.length < 2) {
      return res.json({ query, results: [] });
    }

    const tree = readDirRecursive(DOCUMENTS_ROOT);
    const flatFiles = collectFlatFiles(tree);
    const results: Array<{
      path: string;
      name: string;
      extension: string;
      language: string;
      matchesCount: number;
      snippets: Array<{ line: number; text: string }>;
    }> = [];

    for (const file of flatFiles) {
      const fullPath = path.resolve(DOCUMENTS_ROOT, file.path);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const snippets: Array<{ line: number; text: string }> = [];
        let matchesCount = 0;

        // Check file name match
        const nameMatches = file.name.toLowerCase().includes(query);
        if (nameMatches) {
          matchesCount += 5;
        }

        // Check line matches
        lines.forEach((lineText, idx) => {
          if (lineText.toLowerCase().includes(query)) {
            matchesCount++;
            if (snippets.length < 4) {
              snippets.push({
                line: idx + 1,
                text: lineText.trim().substring(0, 150),
              });
            }
          }
        });

        if (matchesCount > 0) {
          results.push({
            path: file.path,
            name: file.name,
            extension: file.extension || '',
            language: file.language || 'text',
            matchesCount,
            snippets,
          });
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Sort by relevance (match count)
    results.sort((a, b) => b.matchesCount - a.matchesCount);

    res.json({
      query,
      results: results.slice(0, 30),
      totalMatches: results.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Search failed', message: err?.message });
  }
});
