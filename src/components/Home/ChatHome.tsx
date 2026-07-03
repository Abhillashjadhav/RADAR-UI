import { useNavigate } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';

const SUGGESTIONS = [
  'Show my top risks this week',
  'Which suppliers are single-sourced?',
  'Summarize the VTECH geopolitical break',
  'What changed in cost exposure?',
  'Run a supplier risk assessment',
];

/** Production homepage — the New Chat landing surface. */
export default function ChatHome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-58px)] overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Wave background */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: 260 }}
        aria-hidden="true"
      >
        <path fill="#FEF3C7" fillOpacity="0.55"
          d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,229.3C840,245,960,235,1080,208C1200,181,1320,139,1380,117.3L1440,96L1440,320L0,320Z" />
        <path fill="#F3F4F6" fillOpacity="0.8"
          d="M0,288L80,272C160,256,320,224,480,224C640,224,800,256,960,266.7C1120,277,1280,267,1360,261.3L1440,256L1440,320L0,320Z" />
      </svg>

      <div className="relative w-full max-w-2xl flex flex-col items-center text-center">
        {/* Sparkle icon */}
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-500 mb-5">
          <Sparkles size={26} />
        </span>

        {/* Two-tone greeting */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-1.5">
          <span className="text-gray-900">Hi User, </span>
          <span className="text-amber-500">Ready to optimize?</span>
        </h1>
        <p className="text-sm text-gray-500 mb-7">Ask a question to optimize your supply chain operations instantly.</p>

        {/* Input with Pro chip + gold send */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_rgba(16,24,40,0.06)] px-4 py-3 flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold flex-shrink-0">Pro</span>
          <input
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            placeholder="Ask anything about your suppliers, risks, or network…"
          />
          <button
            className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-900 flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Send"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Caution line */}
        <p className="text-[11px] text-gray-400 mb-7">
          AI can make mistakes. Verify critical supply chain data.
        </p>

        {/* Five suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => navigate(s.includes('risk assessment') ? '/supplier-risk' : '/risk-monitor')}
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:border-amber-300 hover:text-gray-900 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
