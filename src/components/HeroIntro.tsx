import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function HeroIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wordStageRef = useRef<HTMLDivElement | null>(null);
  const svgMaskRectRef = useRef<SVGRectElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const wordStage = wordStageRef.current;
      const maskRect = svgMaskRectRef.current;
      const glow = glowRef.current;

      if (!section || !wordStage) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReduced && maskRect) {
        gsap.fromTo(
          maskRect,
          { attr: { width: 0 } },
          {
            attr: { width: 1500 },
            duration: 1.45,
            ease: 'power3.inOut',
            delay: 0.15,
          }
        );
      }

      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 640px)',
          isMobile: '(max-width: 639px)',
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          gsap.set(wordStage, {
            transformPerspective: isMobile ? 1200 : 2000,
            xPercent: isMobile ? -3 : -7.5,
            rotateY: isMobile ? -28 : -46,
            rotateX: isMobile ? 3 : 5,
            scale: isMobile ? 1.04 : 1.16,
            filter: 'blur(0px)',
            opacity: 1,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: isMobile ? '+=780' : '+=1150',
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
            },
          });

          tl.to(
            wordStage,
            {
              xPercent: 0,
              rotateY: 0,
              rotateX: 0,
              scale: 0.98,
              filter: 'blur(0px)',
              ease: 'power2.inOut',
              duration: 0.48,
            },
            0
          ).to(
            wordStage,
            {
              scale: isMobile ? 0.68 : 0.56,
              yPercent: -8,
              filter: isMobile ? 'blur(32px)' : 'blur(48px)',
              opacity: 0.08,
              ease: 'power2.in',
              duration: 0.52,
            },
            0.48
          );

          if (glow) {
            tl.to(
              glow,
              {
                scale: 1.4,
                opacity: 0.12,
                duration: 1,
              },
              0
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 sm:px-10 lg:px-16"
    >
      {/* Ambient Radial Accent Aura */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[100px] sm:h-[620px] sm:w-[620px] sm:blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(21,93,242,0.52) 0%, rgba(21,93,242,0.12) 48%, transparent 75%)',
        }}
      />

      {/* Center Pure 3D Wordmark Stage */}
      <div className="relative z-10 flex w-full items-center justify-center py-8 [perspective:2000px]">
        <div
          ref={wordStageRef}
          className="w-full max-w-6xl select-none will-change-transform [transform-style:preserve-3d]"
        >
          <svg
            viewBox="0 0 1420 340"
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label="Alejandro — Alejandro Castro Palacio, Ingeniero Multimedia"
          >
            <defs>
              <mask id="alejo-intro-mask">
                <rect
                  ref={svgMaskRectRef}
                  x="0"
                  y="0"
                  width="1500"
                  height="380"
                  fill="#ffffff"
                />
              </mask>
              <linearGradient id="alejo-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--fg)" />
                <stop offset="72%" stopColor="var(--fg)" />
                <stop offset="100%" stopColor="#155DF2" />
              </linearGradient>
            </defs>

            <g mask="url(#alejo-intro-mask)">
              <text
                x="50%"
                y="246"
                textAnchor="middle"
                fill="url(#alejo-accent-grad)"
                className="font-editorial"
                style={{
                  fontSize: '258px',
                  fontWeight: 300,
                  letterSpacing: '-0.038em',
                }}
              >
                Alejandro
                <tspan fill="#155DF2">.</tspan>
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
