import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Link2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_FEEDBACK_MS = 2000;

type Props = {
  url: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  feedbackMs?: number;
};

export function ShareSessionButton({
  url,
  variant = 'ghost',
  size = 'sm',
  className,
  feedbackMs = DEFAULT_FEEDBACK_MS,
}: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('failed to copy session url', err);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), feedbackMs);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-label="Share session"
      className={cn('min-w-24 justify-center', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-cyan" strokeWidth={1.5} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4 text-space-6" strokeWidth={1.5} />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}
