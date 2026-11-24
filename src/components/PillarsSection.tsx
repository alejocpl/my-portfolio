import { lazy, Suspense, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Box, Code2, Film, Layers, Palette } from 'lucide-react';
import { PILLARS } from '../data/portfolioData';

const PhilosophyGlassCanvas = lazy(() =>
  import('./PhilosophyGlassCanvas').then((m) => ({ default: m.PhilosophyGlassCanvas }))
);

gsap.registerPlugin(ScrollTrigger);

interface PillarsSectionProps {
  theme: 'dark' | 'light';
}

const PILLAR_ICONS = [Code2, Layers, Palette, Film, Box];

export function PillarsSection({ theme }: PillarsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const progressRef = useRef<number>(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const cards = cardRefs.current.filter((c): c is HTMLElement => c !== null);
      if (cards.length < 2) return;

      const mm = gsap.matchMedia();

      // Tablet & Desktop (>=640px): Pinned 5-card sequential stack
      mm.add('(min-width: 640px)', () => {
        gsap.set(cards[0], {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        });

        gsap.set(cards.slice(1), {
          y: 390,
          scale: 1.45,
          opacity: 0,
          filter: 'blur(18px)',
        });

        const updateActiveDot = (prog: number) => {
          const activeIdx = Math.min(
            cards.length - 1,
            Math.round(prog * (cards.length - 1))
          );
          dotsRef.current.forEach((dot, idx) => {
            if (!dot) return;
            dot.style.width = idx === activeIdx ? '28px' : '8px';
            dot.style.opacity = idx === activeIdx ? '1' : '0.32';
          });
        };

        updateActiveDot(0);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=3400',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              updateActiveDot(self.progress);
            },
          },
        });

        for (let step = 1; step < cards.length; step++) {
          const atTime = (step - 1) * 1.15 + 0.15;

          for (let prev = 0; prev < step; prev++) {
            const depth = step - prev;
            tl.to(
              cards[prev],
              {
                y: -depth * 22,
                scale: Math.max(0.84, 1 - depth * 0.045),
                opacity: Math.max(0.16, 0.72 - (depth - 1) * 0.22),
                filter: `blur(${Math.min(6, depth * 1.8)}px)`,
                duration: 1,
                ease: 'power2.inOut',
              },
              atTime
            );
          }

          tl.to(
            cards[step],
            {
              y: 0,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1,
              ease: 'power2.out',
            },
            atTime
          );
        }
      });

      // Mobile (<640px): Clean vertical card flow with smooth scroll-scrubbed entrances & 3D glass rotation
      mm.add('(max-width: 639px)', () => {
        gsap.set(cards, { clearProps: 'all' });

        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.16, y: 36, scale: 0.96, filter: 'blur(6px)' },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 60%',
                scrub: 0.5,
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="pilares"
      ref={sectionRef}
      className="relative flex min-h-dvh w-full flex-col justify-center overflow-hidden px-4 py-20 sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      {/* 3D Three.js Glass Prism Scene */}
      <Suspense fallback={null}>
        <PhilosophyGlassCanvas theme={theme} progressRef={progressRef} />
      </Suspense>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* Left Narrative */}
        <div className="lg:col-span-5">
          <h2 className="font-editorial text-3xl font-light leading-[1.08] sm:text-4xl lg:text-6xl">
            Arte tridimensional, diseño gráfico, movimiento, interfaz e ingeniería frontend.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--fg-muted)] sm:mt-5 sm:text-base">
            Cinco áreas de dominio complementarias que me permiten crear identidades visuales, animar en 2D y motion graphics, modelar en 3D y construir productos digitales completos.
          </p>

          {/* Subtle Non-Numbered Pill Indicators for the 5 Stacked Cards */}
          <div className="mt-6 hidden items-center gap-2 sm:flex" aria-hidden="true">
            {PILLARS.map((p, idx) => (
              <span
                key={p.id}
                ref={(el) => {
                  dotsRef.current[idx] = el;
                }}
                className="h-2 rounded-full bg-[var(--accent)] transition-all duration-200"
                style={{ width: idx === 0 ? '28px' : '8px', opacity: idx === 0 ? 1 : 0.32 }}
              />
            ))}
          </div>
        </div>

        {/* Right Stacked 5-Card Stage */}
        <div className="relative flex w-full items-center justify-center sm:min-h-[370px] lg:col-span-7 lg:min-h-[420px]">
          <div className="relative w-full max-w-xl max-sm:space-y-4 sm:h-[365px] lg:h-[395px]">
            {PILLARS.map((pillar, idx) => {
              const Icon = PILLAR_ICONS[idx] ?? Code2;
              return (
                <article
                  key={pillar.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  style={{ zIndex: idx + 1 }}
                  className="
                    max-sm:relative
                    sm:absolute sm:inset-0
                    flex flex-col justify-between rounded-3xl border border-[var(--border-strong)]
                    bg-[var(--bg-glass)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-8 lg:p-9
                    will-change-[transform,filter,opacity]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="my-auto py-3 sm:py-4">
                    <h3 className="font-editorial text-2xl font-normal sm:text-3xl lg:text-4xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--accent)] sm:text-xs">
                      {pillar.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)] sm:mt-4 sm:text-base">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-3.5 sm:gap-2 sm:pt-4">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg-muted)] sm:px-3 sm:text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
