import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText, type CopyResult } from './clipboard';

interface CopyButtonProps {
  text: string;
  /** Element showing the text; selected for manual copy if the clipboard is blocked. */
  targetRef: React.RefObject<HTMLElement | null>;
  label?: string;
  size?: 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, targetRef, label = 'Copy', size = 'md' }) => {
  const [result, setResult] = useState<CopyResult | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    const outcome = await copyText(text, targetRef.current);
    setResult(outcome);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setResult(null), outcome === 'copied' ? 2000 : 4000);
  };

  const text_ =
    result === 'copied' ? 'Copied' : result === 'selected' ? 'Selected: press Ctrl/⌘+C' : result === 'failed' ? 'Copy failed' : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
      } ${result === 'copied' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
    >
      {result === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {text_}
    </button>
  );
};
