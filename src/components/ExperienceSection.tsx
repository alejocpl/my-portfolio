import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Briefcase, GraduationCap, Sparkles, Trophy } from 'lucide-react';
import { EDUCATION, EXPERIENCE } from '../data/portfolioData';
import { BlurSplitText } from './BlurSplitText';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_BRANDS = [
  {
    id: 'aguardiente-antioqueno',
    name: 'Aguardiente Antioqueño',
    src: '/images/logos/aguardiente-antioqueno.svg',
  },
  {
    id: 'atletico-nacional',
    name: 'Club Atlético Nacional',
    src: '/images/logos/atletico-nacional.svg',
  },
  {
    id: 'ron-medellin',
    name: 'Ron Medellín',
    src: '/images/logos/ron-medellin.svg',
  },
];

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const logosRowRef = useRef<HTMLDivElement | null>(null);
  const heroLeftRef = useRef<HTMLElement | null>(null);
  const heroRightRef = useRef<HTMLElement | null>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);

  const flaExp = EXPERIENCE.find((e) => e.id === 'fla')!;
  const nacionalExp = EXPERIENCE.find((e) => e.id === 'atletico-nacional')!;
  const goldExp = EXPERIENCE.find((e) => e.id === '24kgold')!;

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !sectionRef.current) return;

      if (beamRef.current) {
        gsap.fromTo(
          beamRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: beamRef.current,
              start: 'top 90%',
              end: 'top 52%',
              scrub: 0.6,
            },
          }
        );
      }

      if (logosRowRef.current) {
        const logoBoxes = logosRowRef.current.querySelectorAll<HTMLElement>('[data-brand-box]');
        gsap.fromTo(
          logoBoxes,
          { opacity: 0.14, y: 34, scale: 0.94, filter: 'blur(9px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: logosRowRef.current,
              start: 'top 90%',
              end: 'top 56%',
              scrub: 0.55,
            },
          }
        );
      }

      if (heroLeftRef.current) {
        gsap.fromTo(
          heroLeftRef.current,
          {
            opacity: 0.14,
            x: -56,
            y: 44,
            rotateY: 6,
            transformPerspective: 1600,
            filter: 'blur(12px)',
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotateY: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heroLeftRef.current,
              start: 'top 90%',
              end: 'top 46%',
              scrub: 0.65,
            },
          }
        );
      }

      if (heroRightRef.current) {
        gsap.fromTo(
          heroRightRef.current,
          {
            opacity: 0.14,
            x: 56,
            y: 44,
            rotateY: -6,
            transformPerspective: 1600,
            filter: 'blur(12px)',
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotateY: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heroRightRef.current,
              start: 'top 90%',
              end: 'top 46%',
              scrub: 0.65,
            },
          }
        );
      }

      if (bottomRowRef.current) {
        const bottomCards =
          bottomRowRef.current.querySelectorAll<HTMLElement>('[data-balanced-card]');
        gsap.fromTo(
          bottomCards,
          {
            opacity: 0.15,
            y: 52,
            scale: 0.95,
            filter: 'blur(10px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bottomRowRef.current,
              start: 'top 90%',
              end: 'top 52%',
              scrub: 0.6,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="trayectoria"
      ref={sectionRef}
      className="relative w-full overflow-hidden border-t border-[var(--border)] px-4 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36"
    >
      {/* Subtle Ambient Accent Aura behind Featured Milestones */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-44 left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #155DF2 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="max-w-4xl">
          <BlurSplitText
            text="Mi trayectoria y experiencia real en marcas."
            as="h2"
            defocusOnExit={false}
            accentWords={['trayectoria', 'experiencia', 'marcas']}
            className="font-editorial text-4xl font-light leading-[1.08] sm:text-5xl lg:text-6xl"
          />
        </div>

        {/* Scroll-Animated Horizontal Spine */}
        <div className="mt-8 h-[1px] w-full overflow-hidden bg-[var(--border)]">
          <div ref={beamRef} className="h-full w-full origin-left bg-[var(--accent)]" />
        </div>

        {/* 3 Brand Logo Showcase Boxes */}
        <div
          ref={logosRowRef}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {FEATURED_BRANDS.map((brand) => (
            <div
              key={brand.id}
              data-brand-box
              className="group flex flex-col items-center justify-center rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-6 py-8 text-center transition-colors hover:border-[var(--accent-border)] sm:py-9 will-change-[transform,filter,opacity]"
            >
              <div className="flex h-20 w-full items-center justify-center sm:h-24">
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="brand-logo-svg max-h-full max-w-[175px] object-contain opacity-90 group-hover:scale-105 group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>

        {/* TOP SPOTLIGHT ROW: FLA & Club Atlético Nacional (Maximum Visual Protagonism) */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Spotlight 1: FLA */}
          <article
            ref={heroLeftRef}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[var(--accent-border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)] sm:p-10 will-change-[transform,filter,opacity]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-[var(--accent)] opacity-15 blur-[65px]"
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Experiencia Destacada</span>
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1 font-mono text-xs text-[var(--fg-muted)]">
                  {flaExp.period}
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--accent)]">
                {flaExp.role} · {flaExp.location}
              </p>

              <h3 className="font-editorial mt-2 text-3xl font-normal leading-tight sm:text-4xl lg:text-[2.6rem]">
                {flaExp.company}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                {flaExp.summary}
              </p>

              <ul className="mt-5 space-y-2.5">
                {flaExp.achievements.map((ach) => (
                  <li
                    key={ach}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--fg-muted)]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
              {flaExp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--fg)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>

          {/* Spotlight 2: Club Atlético Nacional */}
          <article
            ref={heroRightRef}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[var(--accent-border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)] sm:p-10 will-change-[transform,filter,opacity]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-[var(--accent)] opacity-15 blur-[65px]"
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-white">
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ganador Oficial · +700 Propuestas</span>
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1 font-mono text-xs text-[var(--fg-muted)]">
                  {nacionalExp.period}
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--accent)]">
                {nacionalExp.role}
              </p>

              <h3 className="font-editorial mt-2 text-3xl font-normal leading-tight sm:text-4xl lg:text-[2.6rem]">
                {nacionalExp.company}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                {nacionalExp.summary}
              </p>

              <ul className="mt-5 space-y-2.5">
                {nacionalExp.achievements.map((ach) => (
                  <li
                    key={ach}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--fg-muted)]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
              {nacionalExp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--fg)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>

        {/* BOTTOM BALANCED ROW: 24K GOLD & Formación Universitaria (Exact Same Card Size & Weight) */}
        <div
          ref={bottomRowRef}
          className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2"
        >
          {/* Equal Card 1: 24K GOLD */}
          <article
            data-balanced-card
            className="flex h-full flex-col justify-between rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-7 transition-colors hover:border-[var(--accent-border)] sm:p-8 will-change-[transform,filter,opacity]"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--accent)]">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                  <span>{goldExp.role}</span>
                </div>
                <span className="font-mono text-xs text-[var(--fg-subtle)]">
                  {goldExp.period} · {goldExp.duration}
                </span>
              </div>

              <h3 className="font-editorial mt-3 text-2xl font-normal sm:text-3xl">
                {goldExp.company}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-muted)]">
                Diseño UI/UX y desarrollo front-end de su página web oficial, junto con creación de línea gráfica para embajadores, catálogos, motion graphics y piezas audiovisuales de marca.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              {goldExp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--fg-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>

          {/* Equal Card 2: Formación Universitaria */}
          <article
            data-balanced-card
            className="flex h-full flex-col justify-between rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-7 transition-colors hover:border-[var(--accent-border)] sm:p-8 will-change-[transform,filter,opacity]"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--accent)]">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  <span>Formación Universitaria</span>
                </div>
                <span className="font-mono text-xs text-[var(--fg-subtle)]">
                  {EDUCATION.location}
                </span>
              </div>

              <h3 className="font-editorial mt-3 text-2xl font-normal sm:text-3xl">
                {EDUCATION.institution}
              </h3>

              <p className="mt-2.5 text-sm font-medium leading-relaxed text-[var(--fg)]">
                {EDUCATION.degree}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-muted)]">
                Formación integral combinando ingeniería de software, desarrollo interactivo, diseño de interfaces, producción audiovisual y arte 2D/3D.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              {['Ingeniería Multimedia', 'Software & Interactividad', 'Arte Digital & 3D'].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--fg-muted)]"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
