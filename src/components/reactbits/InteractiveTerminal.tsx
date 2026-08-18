import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw, Copy, Check, Sparkles, CornerDownLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CommandOutput {
  command: string;
  response: string | React.ReactNode;
  status: 'success' | 'info' | 'error';
  timestamp: string;
}

export const InteractiveTerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const [copied, setCopied] = useState(false);

  const initialHistory: CommandOutput[] = [
    {
      command: 'pip install tc_auth',
      response: 'Successfully installed tc_auth-1.5.1 fastapi-0.110 pydantic-2.6 sqlalchemy-2.0 PyJWT-2.8 bcrypt-4.1',
      status: 'success',
      timestamp: '00:00:01',
    },
    {
      command: 'tc-auth init --engine "sqlite:///auth.db" --secret "tc_sec_7894a"',
      response: (
        <div className="space-y-1">
          <div className="text-emerald-400">✓ Database engine connected: sqlite:///auth.db</div>
          <div className="text-emerald-400">✓ Initialized schemas: accounts, sessions, otp_verifications, oauth_links</div>
          <div className="text-indigo-300">✓ Superadmin provisioned: admin@tcauth.dev</div>
          <div className="text-zinc-400">Auth instance ready. Listening for token verification requests.</div>
        </div>
      ),
      status: 'success',
      timestamp: '00:00:02',
    },
  ];

  const [history, setHistory] = useState<CommandOutput[]>(initialHistory);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickCommands = [
    { cmd: 'tc-auth otp send --to dev@example.com', label: 'Send OTP' },
    { cmd: 'tc-auth session list --active', label: 'List Sessions' },
    { cmd: 'tc-auth token inspect --jwt eyJhbGciOiJIUzI1NiJ9...', label: 'Inspect JWT' },
    { cmd: 'tc-auth health', label: 'Health Probe' },
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const time = new Date().toTimeString().split(' ')[0];

    if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (lower === 'help') {
      setHistory((prev) => [
        ...prev,
        {
          command: trimmed,
          response: (
            <div className="space-y-1.5 text-zinc-300">
              <div className="text-indigo-400 font-bold">tc_auth CLI Commands:</div>
              <div>• <span className="text-emerald-400 font-semibold">pip install tc_auth</span> : Install Python SDK</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth init</span> : Initialize database schemas & admin credentials</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth otp send --to &lt;email&gt;</span> : Dispatch passwordless 6-digit email OTP</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth session list</span> : Query real-time active database sessions</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth session revoke --id &lt;sid&gt;</span> : Instantly revoke compromised session</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth token inspect</span> : Validate & decode JWT payload signature</div>
              <div>• <span className="text-emerald-400 font-semibold">tc-auth health</span> : Run internal heartbeat diagnostics</div>
              <div>• <span className="text-emerald-400 font-semibold">clear</span> : Clear terminal output buffer</div>
            </div>
          ),
          status: 'info',
          timestamp: time,
        },
      ]);
      setInput('');
      return;
    }

    let response: React.ReactNode = '';
    let status: 'success' | 'info' | 'error' = 'success';

    if (lower.startsWith('tc-auth otp send')) {
      const code = Math.floor(100000 + Math.random() * 900000);
      response = (
        <div className="space-y-1">
          <div className="text-emerald-400">✓ Cryptographic OTP Generated: <span className="font-bold text-amber-300">[{code}]</span></div>
          <div className="text-zinc-300">SMTP status: Dispatched to destination address (TTL: 600s)</div>
          <div className="text-zinc-500 text-[11px]">Hash stored in `otp_verifications` table. Brute force attempts allowed: 5</div>
        </div>
      );
    } else if (lower.startsWith('tc-auth session list')) {
      response = (
        <div className="space-y-1">
          <div className="text-indigo-300 font-semibold">Active Stateful Sessions (Database Table: `sessions`):</div>
          <div className="grid grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono border-b border-zinc-800 pb-1">
            <span>SID</span>
            <span>ACCOUNT</span>
            <span>IP ADDRESS</span>
            <span>STATUS</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px] font-mono text-zinc-200">
            <span className="text-indigo-400">#42</span>
            <span>superadmin@tcauth.dev</span>
            <span>192.168.1.104</span>
            <span className="text-emerald-400">● ACTIVE</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px] font-mono text-zinc-200">
            <span className="text-indigo-400">#43</span>
            <span>developer@acme.corp</span>
            <span>10.0.0.15</span>
            <span className="text-emerald-400">● ACTIVE</span>
          </div>
        </div>
      );
    } else if (lower.startsWith('tc-auth token') || lower.startsWith('tc-auth inspect')) {
      response = (
        <div className="space-y-1 text-zinc-300">
          <div className="text-emerald-400 font-semibold">✓ JWT Signature Verified (HMAC-SHA256)</div>
          <div className="bg-zinc-950 p-2 rounded text-[11px] font-mono text-indigo-300">
            {JSON.stringify({ aid: 1, sid: 42, role: 'superadmin', exp: 1787404800, iss: 'tc_auth_v1.5.1' }, null, 2)}
          </div>
        </div>
      );
    } else if (lower.startsWith('tc-auth health')) {
      response = (
        <div className="text-emerald-400 space-y-0.5">
          <div>✓ Database connection: ONLINE (0.8ms)</div>
          <div>✓ Redis/Memory cache: READY</div>
          <div>✓ SMTP mailer relay: CONNECTED</div>
          <div>✓ OAuth provider routes: MOUNTED</div>
        </div>
      );
    } else if (lower.startsWith('tc-auth init')) {
      response = (
        <div className="text-emerald-400">
          ✓ tc_auth database schemas initialized successfully.
        </div>
      );
    } else if (lower.startsWith('pip install')) {
      response = <div className="text-emerald-400">Requirement already satisfied: tc_auth==1.5.1 in /usr/local/lib/python3.11</div>;
    } else {
      response = (
        <div className="text-rose-400">
          Command not recognized: "{trimmed}". Type <span className="underline font-bold">help</span> to view all available commands.
        </div>
      );
      status = 'error';
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        response,
        status,
        timestamp: time,
      },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  const runQuickCommand = (cmd: string) => {
    setInput('');
    setIsTypingAnimation(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < cmd.length) {
        setInput(cmd.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTypingAnimation(false);
        setTimeout(() => {
          executeCommand(cmd);
        }, 150);
      }
    }, 20);
  };

  const handleCopyHistory = () => {
    const text = history.map((h) => `$ ${h.command}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Terminal session copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
          <div className="ml-2 flex items-center gap-1.5 text-zinc-400 font-bold">
            <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">tc_auth interactive developer terminal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Clear terminal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyHistory}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copy history"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Interactive Command Chips */}
      <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Run Quick Demos:
        </span>
        {quickCommands.map((q, idx) => (
          <button
            key={idx}
            onClick={() => runQuickCommand(q.cmd)}
            disabled={isTypingAnimation}
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] bg-zinc-800/80 hover:bg-indigo-950/80 hover:border-indigo-700/60 border border-zinc-700/60 text-zinc-300 hover:text-indigo-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-2.5 h-2.5 text-indigo-400" />
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal History Screen */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-4 sm:p-5 max-h-[380px] overflow-y-auto space-y-4 cursor-text"
      >
        <div className="text-zinc-500 text-[11px] leading-relaxed">
          Welcome to tc_auth v1.5.1 interactive shell. Type commands below or click quick actions.
          Type <span className="text-indigo-400 font-bold">help</span> to view documentation.
        </div>

        {history.map((item, index) => (
          <div key={index} className="space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-indigo-400 font-bold">tc-user@server:~$</span>
              <span className="text-white font-bold">{item.command}</span>
              <span className="ml-auto text-[10px] text-zinc-600">{item.timestamp}</span>
            </div>
            <div className="pl-4 text-xs leading-relaxed text-zinc-300 border-l border-zinc-800">
              {item.response}
            </div>
          </div>
        ))}

        {/* Active Input Line */}
        <div className="flex items-center gap-2 text-zinc-300 pt-1">
          <span className="text-emerald-400 font-bold">tc-user@server:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTypingAnimation}
            placeholder="Type 'help', 'tc-auth health' or any command..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-zinc-600 caret-indigo-400"
          />
          <button
            onClick={() => executeCommand(input)}
            className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
