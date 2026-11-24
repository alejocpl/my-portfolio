import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SPECIALISMS_DRUM } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export function SpecialismsDrum() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const total = SPECIALISMS_DRUM.length;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 640px)',
          isMobile: '(max-width: 639px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };
          const itemSpacing = isMobile ? 48 : 72;
          const visibleRadius = isMobile ? 3.4 : 4.6;

          const renderDrum = (progress: number) => {
            const activeFloat = progress * (total - 1);

            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${Math.max(0.06, progress)})`;
            }

            itemRefs.current.forEach((item, index) => {
              if (!item) return;

              let diff = index - activeFloat;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const absDiff = Math.abs(diff);
              const y = diff * itemSpacing;
              const xCurve = Math.pow(absDiff, 1.65) * (isMobile ? 7 : 14);
              const scale = Math.max(0.75, 1.06 - absDiff * 0.085);
              const blur = Math.min(8, Math.max(0, (absDiff - 0.35) * 2.1));
              const opacity =
                absDiff > visibleRadius ? 0 : Math.max(0.1, 1 - absDiff * 0.23);
              const isCenter = absDiff < 0.48;

              item.style.transform = `translate3d(${xCurve.toFixed(1)}px, ${y.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`;
              item.style.filter = blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : 'none';
              item.style.opacity = opacity.toFixed(3);
              item.dataset.active = isCenter ? 'true' : 'false';
            });
          };

          renderDrum(0);

          ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: isMobile ? '+=1550' : '+=2200',
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              renderDrum(self.progress);
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="especialidades"
      ref={sectionRef}
      className="relative flex min-h-dvh w-full items-center overflow-hidden border-y border-[var(--border)] px-4 pt-20 pb-12 sm:px-10 sm:py-20 lg:px-16"
    >
      {/* Subtle diagonal accent beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full opacity-25 blur-[110px] sm:h-[520px] sm:w-[520px]"
        style={{ background: 'radial-gradient(circle, #155DF2 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-12">
        {/* Left Pinned Label Column */}
        <div className="lg:col-span-5">
          <h2 className="font-editorial text-3xl font-light leading-[1.08] sm:text-5xl lg:text-6xl">
            Trabajo de forma transversal en
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--fg-muted)] sm:mt-5 sm:text-base">
            Herramientas reales con las que diseño interfaces, creo identidades gráficas, animo en 2D/Motion y produzco activos 3D.
          </p>

          {/* Drum Progress Hairline */}
          <div className="mt-5 flex items-center sm:mt-8">
            <div className="h-[2px] w-36 overflow-hidden rounded-full bg-[var(--border)] sm:w-44">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-left bg-[var(--accent)] transition-transform duration-75"
                style={{ transform: 'scaleX(0.07)' }}
              />
            </div>
          </div>
        </div>

        {/* Right Tilted Flicker Drum Stage */}
        <div className="relative flex h-[280px] items-center justify-start sm:h-[460px] lg:col-span-7 lg:h-[520px] lg:pl-8">
          {/* Center Focal Hairline Indicator */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-2 top-1/2 h-[54px] -translate-y-1/2 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/50 backdrop-blur-[2px] sm:right-6 sm:h-[68px]"
          />

          <div
            className="relative flex h-full w-full items-center pl-4 sm:pl-8 lg:-rotate-[12deg]"
            style={{ transformOrigin: '8% 50%' }}
          >
            {SPECIALISMS_DRUM.map((skill, idx) => (
              <div
                key={skill}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                data-active={idx === 0 ? 'true' : 'false'}
                className="group absolute left-4 flex items-center gap-3 whitespace-nowrap will-change-[transform,filter,opacity] sm:left-8 sm:gap-4"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] opacity-0 transition-opacity duration-200 sm:h-2.5 sm:w-2.5 [[data-active=true]_&]:opacity-100" />
                <span className="font-editorial text-2xl font-light tracking-tight text-[var(--fg-muted)] transition-colors duration-200 sm:text-4xl md:text-5xl lg:text-6xl [[data-active=true]_&]:font-normal [[data-active=true]_&]:text-[var(--fg)]">
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
