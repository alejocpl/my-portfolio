import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Award, Globe } from 'lucide-react';
import { CERTIFICATIONS } from '../data/portfolioData';
import { BlurSplitText } from './BlurSplitText';

gsap.registerPlugin(ScrollTrigger);

const APTIS_SKILLS = [
  { label: 'Writing · Nivel C', score: '46 / 50', ratio: 0.92 },
  { label: 'Reading · Nivel B2', score: '42 / 50', ratio: 0.84 },
  { label: 'Speaking · Nivel B2', score: '41 / 50', ratio: 0.82 },
  { label: 'Listening · Nivel B2', score: '38 / 50', ratio: 0.76 },
];

export function CertificationsFocusList() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const featuredCertRef = useRef<HTMLElement | null>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const primaryCert = CERTIFICATIONS[0];
  const secondaryCerts = CERTIFICATIONS.slice(1); // 6 equal-sized certificates (3 rows x 2 cols)

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Principal English B2 Card 3D Unfold + Skill Score Bars Scrub
      if (featuredCertRef.current) {
        gsap.fromTo(
          featuredCertRef.current,
          {
            opacity: 0.14,
            y: 60,
            scale: 0.94,
            rotateX: 8,
            transformPerspective: 1600,
            filter: 'blur(12px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuredCertRef.current,
              start: 'top 90%',
              end: 'top 48%',
              scrub: 0.65,
            },
          }
        );

        const validBars = barRefs.current.filter((b): b is HTMLDivElement => b !== null);
        if (validBars.length) {
          gsap.fromTo(
            validBars,
            { scaleX: 0 },
            {
              scaleX: 1,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: featuredCertRef.current,
                start: 'top 82%',
                end: 'top 40%',
                scrub: 0.65,
              },
            }
          );
        }
      }

      // 6 Equal-Sized Secondary Certificates (3 pairs side-by-side)
      const cards = cardRefs.current.filter((c): c is HTMLLIElement => c !== null);
      for (let i = 0; i < cards.length; i += 2) {
        const pair = cards.slice(i, i + 2);
        pair.forEach((card, colIdx) => {
          gsap.fromTo(
            card,
            {
              opacity: 0.12,
              y: 48,
              x: colIdx === 0 ? -22 : 22,
              scale: 0.95,
              filter: 'blur(9px)',
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: pair[0],
                start: 'top 90%',
                end: 'top 56%',
                scrub: 0.55,
              },
            }
          );
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="certificaciones"
      ref={sectionRef}
      className="relative w-full border-t border-[var(--border)] px-4 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-34"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <BlurSplitText
              text="Formación continua verificada."
              as="h2"
              defocusOnExit={false}
              accentWords={['continua', 'verificada']}
              className="font-editorial text-4xl font-light leading-[1.08] sm:text-5xl lg:text-6xl"
            />
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
              Certificación internacional de inglés, inteligencia artificial aplicada al trabajo creativo y tecnologías inmersivas.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-medium text-[var(--fg)] lg:self-auto">
            <Award className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
            <span>Credenciales oficiales</span>
          </div>
        </div>

        {/* PRINCIPAL HERO CARD: Inglés B2 MCER (Full Width) */}
        <article
          ref={featuredCertRef}
          className="relative mt-12 overflow-hidden rounded-3xl border-2 border-[var(--accent-border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)] sm:p-10 will-change-[transform,filter,opacity]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent)] opacity-15 blur-[80px]"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Details */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-1 text-xs font-semibold tracking-[0.12em] uppercase text-white">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Certificación Principal</span>
                </span>
                <span className="text-xs font-semibold tracking-[0.13em] uppercase text-[var(--accent)]">
                  {primaryCert.issuer}
                </span>
                <span className="text-xs tracking-[0.12em] uppercase text-[var(--fg-subtle)]">
                  · {primaryCert.date}
                </span>
              </div>

              <h3 className="font-editorial mt-4 text-3xl font-normal leading-tight sm:text-4xl lg:text-5xl">
                {primaryCert.title}
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                {primaryCert.detail}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {primaryCert.credentialUrl && (
                  <a
                    href={primaryCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sweep-surface inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-white"
                  >
                    <span>Verificar credencial oficial</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {primaryCert.credentialId && (
                  <span className="font-mono text-xs text-[var(--fg-subtle)]">
                    ID: {primaryCert.credentialId} · Puntaje Global 167 / 200
                  </span>
                )}
              </div>
            </div>

            {/* Right Scroll-Animated CEFR Skill Breakdown */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 lg:col-span-5">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--fg-muted)]">
                Desglose Oficial por Habilidad
              </p>
              <div className="mt-4 space-y-3.5">
                {APTIS_SKILLS.map((sk, idx) => (
                  <div key={sk.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--fg)]">{sk.label}</span>
                      <span className="font-mono text-[var(--accent)]">{sk.score}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        ref={(el) => {
                          barRefs.current[idx] = el;
                        }}
                        className="h-full origin-left rounded-full bg-[var(--accent)]"
                        style={{ width: `${sk.ratio * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* 6 EQUAL-SIZED SECONDARY CERTIFICATES (Exact 3 x 2 Grid) */}
        <ol className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
          {secondaryCerts.map((cert, idx) => (
            <li
              key={cert.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="flex h-full flex-col justify-between rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-7 transition-colors hover:border-[var(--accent-border)] sm:p-8 will-change-[transform,filter,opacity]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-[0.13em] uppercase text-[var(--accent)]">
                    {cert.issuer}
                  </span>
                  <span className="text-xs tracking-[0.12em] uppercase text-[var(--fg-subtle)]">
                    {cert.date}
                  </span>
                </div>

                <h3 className="font-editorial mt-3 text-2xl font-normal leading-snug sm:text-3xl">
                  {cert.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                  {cert.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
