import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface BlurSplitTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  defocusOnExit?: boolean;
  accentWords?: string[];
}

export function BlurSplitText({
  text,
  as: Tag = 'h2',
  className = '',
  defocusOnExit = true,
  accentWords = [],
}: BlurSplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const words = text.split(' ');

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const wordEls = el.querySelectorAll<HTMLElement>('.headline-word');
      if (!wordEls.length) return;

      gsap.fromTo(
        wordEls,
        {
          opacity: 0.12,
          y: 28,
          filter: 'blur(12px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.035,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 46%',
            scrub: 0.65,
          },
        }
      );

      if (defocusOnExit) {
        gsap.fromTo(
          wordEls,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          },
          {
            opacity: 0.16,
            y: -20,
            filter: 'blur(13px)',
            stagger: 0.025,
            ease: 'power1.in',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: 'bottom 28%',
              end: 'top -10%',
              scrub: 0.65,
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [text, defocusOnExit] }
  );

  const normalizedAccents = accentWords.map((w) => w.toLowerCase());

  return (
    <Tag
      ref={containerRef as never}
      aria-label={text}
      className={className}
    >
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[.,;:!?]/g, '').toLowerCase();
        const isAccent = normalizedAccents.includes(cleanWord);
        return (
          <span key={`${word}-${idx}`} aria-hidden="true">
            <span
              className={`headline-word ${isAccent ? 'text-[var(--accent)]' : ''}`}
            >
              {word}
            </span>
            {idx < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </Tag>
  );
}
