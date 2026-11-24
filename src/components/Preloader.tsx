import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const FULL_NAME = 'Alejandro Castro Palacio';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Start at 0% with 'A' (index 0) already visible
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (prefersReduced) {
      setPercent(100);
      const t = window.setTimeout(() => {
        document.body.style.overflow = prevOverflow;
        onComplete();
      }, 280);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = prevOverflow;
      };
    }

    const state = { value: 0 };
    let cancelled = false;
    let exitTl: gsap.core.Timeline | null = null;

    const progressTween = gsap.to(state, {
      value: 100,
      duration: 1.95,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (cancelled) return;
        const p = Math.round(state.value);
        setPercent(p);
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${Math.max(0.02, state.value / 100)})`;
        }
      },
      onComplete: () => {
        if (cancelled) return;
        setPercent(100);
        if (barRef.current) {
          barRef.current.style.transform = 'scaleX(1)';
        }

        const runExit = () => {
          if (cancelled) return;
          exitTl = gsap.timeline({
            delay: 0.28,
            onComplete: () => {
              document.body.style.overflow = prevOverflow;
              onComplete();
            },
          });

          if (contentRef.current) {
            exitTl.to(
              contentRef.current,
              {
                y: -26,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 0.45,
                ease: 'power2.in',
              },
              0
            );
          }

          if (overlayRef.current) {
            exitTl.to(
              overlayRef.current,
              {
                yPercent: -100,
                duration: 0.78,
                ease: 'power4.inOut',
              },
              0.18
            );
          }
        };

        // Ensure custom editorial font is ready before revealing the hero
        if (document.fonts && document.fonts.ready) {
          Promise.race([
            document.fonts.ready,
            new Promise((resolve) => window.setTimeout(resolve, 450)),
          ]).then(runExit);
        } else {
          runExit();
        }
      },
    });

    return () => {
      cancelled = true;
      progressTween.kill();
      if (exitTl) exitTl.kill();
      document.body.style.overflow = prevOverflow;
    };
  }, [onComplete]);

  // 0% -> 1 char ('A'), 100% -> all 24 chars ('Alejandro Castro Palacio')
  const visibleChars =
    percent >= 100
      ? FULL_NAME.length
      : Math.min(
          FULL_NAME.length,
          1 + Math.floor((percent / 100) * (FULL_NAME.length - 1))
        );

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-label={`Cargando portafolio de Alejandro Castro Palacio: ${percent}%`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-[var(--fg)]"
    >
      {/* Subtle Ambient #155DF2 Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px] sm:h-[520px] sm:w-[520px]"
        style={{
          background:
            'radial-gradient(circle, rgba(21,93,242,0.5) 0%, rgba(21,93,242,0.08) 52%, transparent 75%)',
        }}
      />

      {/* Centered Editorial Name-Reveal Block */}
      <div
        ref={contentRef}
        className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
      >
        {/* Character-by-character optical typing reveal (centered without horizontal jitter) */}
        <p className="font-editorial relative flex flex-wrap items-baseline justify-center text-3xl font-light tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-7xl">
          {FULL_NAME.split('').map((char, idx) => {
            const isRevealed = idx < visibleChars;
            const isLatest = idx === visibleChars - 1 && percent < 100;

            return (
              <span
                key={`${char}-${idx}`}
                className="relative inline-block transition-all duration-200 ease-out"
                style={{
                  opacity: isRevealed ? 1 : 0.08,
                  filter: isRevealed ? 'blur(0px)' : 'blur(4px)',
                  transform: isRevealed ? 'translateY(0px)' : 'translateY(6px)',
                  whiteSpace: char === ' ' ? 'pre' : undefined,
                }}
              >
                {char}
                {isLatest && (
                  <span
                    aria-hidden="true"
                    className="ml-0.5 inline-block h-[0.78em] w-[2px] translate-y-[0.06em] bg-[var(--accent)] align-baseline"
                  />
                )}
              </span>
            );
          })}
          <span
            className="inline-block text-[var(--accent)] transition-all duration-300"
            style={{
              opacity: percent >= 100 ? 1 : 0,
              transform: percent >= 100 ? 'scale(1)' : 'scale(0.5)',
            }}
          >
            .
          </span>
        </p>

        {/* Sleek Synchronized Hairline Progress Bar */}
        <div className="mt-8 w-full max-w-md sm:mt-10">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-[var(--accent)]"
              style={{ transform: 'scaleX(0.02)' }}
            />
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--fg-subtle)]">
            <span>Ingeniero Multimedia</span>
            <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[var(--accent)] tabular-nums">
              {String(percent).padStart(2, '0')}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
