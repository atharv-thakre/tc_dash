import React from 'react';

interface CodeHighlighterProps {
  code: string;
  language: string;
  fontSize?: number;
  highlightLines?: number[];
  searchQuery?: string;
  showLineNumbers?: boolean;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  highlightLines = [],
  searchQuery = '',
  showLineNumbers = true,
}) => {
  const lines = code.split('\n');

  // Tokenizer helper for a single line of text
  const renderHighlightedLine = (line: string, lang: string) => {
    if (!line) return <span>&nbsp;</span>;

    if (lang === 'python') {
      return highlightPython(line);
    } else if (lang === 'json') {
      return highlightJson(line);
    } else if (lang === 'typescript' || lang === 'javascript' || lang === 'typescript-react' || lang === 'javascript-react') {
      return highlightTsJs(line);
    } else if (lang === 'shell' || lang === 'bash') {
      return highlightBash(line);
    }

    // Default plain text / text format
    return highlightPlainText(line, searchQuery);
  };

  return (
    <div className="font-mono text-[12.5px] sm:text-[13px] leading-relaxed select-text">
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isHighlighted = highlightLines.includes(lineNum);
        const matchesSearch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={idx}
            id={`L${lineNum}`}
            className={`flex hover:bg-slate-500/10 transition-colors py-0.5 ${
              isHighlighted
                ? 'bg-amber-500/15 border-l-2 border-amber-500 pl-[10px]'
                : matchesSearch
                ? 'bg-indigo-500/10 border-l-2 border-indigo-500 pl-[10px]'
                : showLineNumbers ? 'pl-2' : 'px-3'
            }`}
          >
            {showLineNumbers && (
              <span
                className="inline-block w-9 sm:w-11 shrink-0 text-right pr-3 sm:pr-4 select-none text-slate-400 dark:text-zinc-600 font-mono text-[11px] opacity-70"
              >
                {lineNum}
              </span>
            )}
            <span className="flex-1 whitespace-pre overflow-x-auto pr-3 text-slate-800 dark:text-zinc-200">
              {renderHighlightedLine(line, language)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Python Syntax Tokenizer
function highlightPython(line: string): React.ReactNode {
  // Regex for Python tokens: comments, docstrings/strings, decorators, keywords, builtins, numbers, operators
  const tokenRegex = /(#.*$)|(f?r?"""[\s\S]*?"""|f?r?'''[\s\S]*?'''|f?r?"(?:\\.|[^"\\])*"|f?r?'(?:\\.|[^'\\])*')|(@\w+(?:\.\w+)*)|(\b(?:def|class|import|from|as|return|yield|async|await|if|elif|else|while|for|in|try|except|finally|with|raise|pass|break|continue|lambda|global|nonlocal|assert|is|not|and|or)\b)|(\b(?:True|False|None)\b)|(\b(?:self|cls|print|len|range|dict|list|set|tuple|str|int|float|bool|super|type|id|open|map|filter|zip|enumerate|isinstance|issubclass|hasattr|getattr|setattr|Exception|ValueError|KeyError|TypeError|Auth|FastAPI|APIRouter|Depends|HTTPException|Header|Query|Body)\b)|(\b\d+(?:\.\d+)?\b)|([{}()[\],:;])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.substring(lastIndex, match.index));
    }

    const [full, comment, string, decorator, keyword, booleanNull, builtin, number, punct] = match;

    if (comment) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500 italic">
          {comment}
        </span>
      );
    } else if (string) {
      elements.push(
        <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
          {string}
        </span>
      );
    } else if (decorator) {
      elements.push(
        <span key={match.index} className="text-amber-600 dark:text-amber-400 font-semibold">
          {decorator}
        </span>
      );
    } else if (keyword) {
      elements.push(
        <span key={match.index} className="text-purple-600 dark:text-purple-400 font-bold">
          {keyword}
        </span>
      );
    } else if (booleanNull) {
      elements.push(
        <span key={match.index} className="text-rose-600 dark:text-rose-400 font-semibold">
          {booleanNull}
        </span>
      );
    } else if (builtin) {
      elements.push(
        <span key={match.index} className="text-cyan-600 dark:text-cyan-400 font-medium">
          {builtin}
        </span>
      );
    } else if (number) {
      elements.push(
        <span key={match.index} className="text-amber-500 dark:text-amber-300">
          {number}
        </span>
      );
    } else if (punct) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500">
          {punct}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.substring(lastIndex));
  }

  return elements;
}

// JSON Syntax Tokenizer
function highlightJson(line: string): React.ReactNode {
  const tokenRegex = /("(?:\\.|[^"\\])*"(?:\s*:)?)|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?\b)|([{}[\],:])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.substring(lastIndex, match.index));
    }

    const [full, stringOrKey, booleanNull, number, punct] = match;

    if (stringOrKey) {
      if (stringOrKey.endsWith(':')) {
        // Object Key
        elements.push(
          <span key={match.index} className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {stringOrKey}
          </span>
        );
      } else {
        // String Value
        elements.push(
          <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
            {stringOrKey}
          </span>
        );
      }
    } else if (booleanNull) {
      elements.push(
        <span key={match.index} className="text-rose-600 dark:text-rose-400 font-semibold">
          {booleanNull}
        </span>
      );
    } else if (number) {
      elements.push(
        <span key={match.index} className="text-amber-500 dark:text-amber-300">
          {number}
        </span>
      );
    } else if (punct) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500">
          {punct}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.substring(lastIndex));
  }

  return elements;
}

// TS / JS Syntax Tokenizer
function highlightTsJs(line: string): React.ReactNode {
  const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:import|export|from|as|default|const|let|var|function|return|if|else|switch|case|break|continue|for|while|do|try|catch|finally|throw|new|class|extends|implements|interface|type|enum|typeof|instanceof|void|async|await|yield)\b)|(\b(?:true|false|null|undefined|NaN|Infinity)\b)|(\b(?:console|window|document|Math|JSON|Promise|Array|Object|String|Number|Boolean|Date|RegExp|Set|Map|Error|process)\b)|(\b\d+(?:\.\d+)?\b)|([{}()[\],.;:?&|=!<>+\-*/%^~])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.substring(lastIndex, match.index));
    }

    const [full, comment, string, keyword, booleanNull, builtin, number, punct] = match;

    if (comment) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500 italic">
          {comment}
        </span>
      );
    } else if (string) {
      elements.push(
        <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
          {string}
        </span>
      );
    } else if (keyword) {
      elements.push(
        <span key={match.index} className="text-purple-600 dark:text-purple-400 font-bold">
          {keyword}
        </span>
      );
    } else if (booleanNull) {
      elements.push(
        <span key={match.index} className="text-rose-600 dark:text-rose-400 font-semibold">
          {booleanNull}
        </span>
      );
    } else if (builtin) {
      elements.push(
        <span key={match.index} className="text-cyan-600 dark:text-cyan-400 font-medium">
          {builtin}
        </span>
      );
    } else if (number) {
      elements.push(
        <span key={match.index} className="text-amber-500 dark:text-amber-300">
          {number}
        </span>
      );
    } else if (punct) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500">
          {punct}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.substring(lastIndex));
  }

  return elements;
}

// Shell / Bash Tokenizer
function highlightBash(line: string): React.ReactNode {
  const tokenRegex = /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\$[a-zA-Z_0-9{}]*)|(\b(?:echo|cd|ls|mkdir|cp|mv|rm|curl|wget|grep|cat|sed|awk|export|source|alias|chmod|chown|sudo|git|npm|node|python|uvicorn|docker)\b)|(\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|return|exit)\b)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.substring(lastIndex, match.index));
    }

    const [full, comment, string, variable, command, keyword] = match;

    if (comment) {
      elements.push(
        <span key={match.index} className="text-slate-400 dark:text-zinc-500 italic">
          {comment}
        </span>
      );
    } else if (string) {
      elements.push(
        <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
          {string}
        </span>
      );
    } else if (variable) {
      elements.push(
        <span key={match.index} className="text-amber-600 dark:text-amber-400 font-semibold">
          {variable}
        </span>
      );
    } else if (command) {
      elements.push(
        <span key={match.index} className="text-cyan-600 dark:text-cyan-400 font-bold">
          {command}
        </span>
      );
    } else if (keyword) {
      elements.push(
        <span key={match.index} className="text-purple-600 dark:text-purple-400 font-bold">
          {keyword}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.substring(lastIndex));
  }

  return elements;
}

// Plain Text with Search Term Highlight
function highlightPlainText(line: string, query: string): React.ReactNode {
  if (!query) return line;

  const parts: React.ReactNode[] = [];
  const lowerLine = line.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let startIndex = 0;

  while (true) {
    const matchIndex = lowerLine.indexOf(lowerQuery, startIndex);
    if (matchIndex === -1) {
      parts.push(line.substring(startIndex));
      break;
    }

    if (matchIndex > startIndex) {
      parts.push(line.substring(startIndex, matchIndex));
    }

    parts.push(
      <mark
        key={matchIndex}
        className="bg-yellow-300 dark:bg-yellow-500/40 text-black dark:text-white rounded-xs px-0.5"
      >
        {line.substring(matchIndex, matchIndex + query.length)}
      </mark>
    );

    startIndex = matchIndex + query.length;
  }

  return parts;
}
