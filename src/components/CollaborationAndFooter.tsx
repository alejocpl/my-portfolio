import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { BlurSplitText } from './BlurSplitText';

gsap.registerPlugin(ScrollTrigger);

function LinkedinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
    </svg>
  );
}

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2A10 10 0 0 0 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function SlidingArrow() {
  return (
    <span className="arrow-slide" aria-hidden="true">
      <ArrowUpRight className="h-5 w-5" />
      <ArrowUpRight className="h-5 w-5" />
    </span>
  );
}

export function CollaborationAndFooter() {
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pathCardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const ctaBannerRef = useRef<HTMLAnchorElement | null>(null);
  const channelsGridRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !wrapperRef.current) return;

      // 3D opposing scroll entrance for the 2 Collaboration Cards
      pathCardsRef.current.forEach((card, idx) => {
        if (!card) return;
        gsap.fromTo(
          card,
          {
            opacity: 0.14,
            y: 68,
            x: idx === 0 ? -36 : 36,
            rotateX: 10,
            transformPerspective: 1600,
            filter: 'blur(11px)',
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 50%',
              scrub: 0.65,
            },
          }
        );
      });

      // Triggered scale-in on Footer Hero CTA (always completes to 100% sharp at page bottom)
      if (ctaBannerRef.current) {
        gsap.fromTo(
          ctaBannerRef.current,
          {
            opacity: 0,
            y: 40,
            scale: 0.96,
            filter: 'blur(8px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            clearProps: 'filter',
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaBannerRef.current,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Triggered staggered rise on Contact Channel Cards (fixes GitHub card staying blurred at max scroll)
      if (channelsGridRef.current) {
        const items = Array.from(channelsGridRef.current.children);
        gsap.fromTo(
          items,
          {
            opacity: 0,
            y: 26,
            filter: 'blur(6px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'filter',
            duration: 0.65,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: channelsGridRef.current,
              start: 'top 96%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    },
    { scope: wrapperRef }
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL_INFO.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${PERSONAL_INFO.email}`;
    }
  };

  return (
    <div ref={wrapperRef}>
      {/* Two Reasons / Paths (Recruiters vs Freelance Clients) */}
      <section
        id="colaboracion"
        className="relative w-full overflow-hidden border-t border-[var(--border)] px-4 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[440px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #155DF2 0%, transparent 72%)' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <BlurSplitText
              text="Probablemente estés aquí por una de estas dos razones."
              as="h2"
              defocusOnExit={false}
              accentWords={['dos', 'razones']}
              className="font-editorial text-4xl font-light leading-[1.08] sm:text-5xl lg:text-6xl"
            />
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Path 1: Recruiters / Job Offers */}
            <a
              ref={(el) => {
                pathCardsRef.current[0] = el;
              }}
              href={`mailto:${PERSONAL_INFO.email}?subject=Oportunidad%20Laboral%20%E2%80%94%20Alejandro%20Palacio`}
              className="sweep-surface group flex min-h-[340px] cursor-pointer flex-col justify-between rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-8 sm:p-11 will-change-[transform,filter,opacity]"
            >
              <div className="flex items-center justify-between">
                <span className="sweep-muted text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">
                  RECLUTADORES &amp; EQUIPOS
                </span>
                <SlidingArrow />
              </div>

              <div className="my-8">
                <h3 className="font-editorial text-4xl font-normal leading-tight sm:text-5xl">
                  Sumar talento híbrido a tu equipo
                </h3>
                <p className="sweep-muted mt-4 max-w-lg text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                  Disponible para posiciones Full-Time o contratos tanto de forma presencial en Medellín como en modalidad remota como Front-End Developer, UI/UX Designer, Diseñador Gráfico, Motion Designer o Ingeniero Multimedia.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Presencial Medellín & Remoto',
                  'Perfil 360° Creativo + Técnico',
                  'Inglés B2 MCER (British Council)',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="sweep-chip rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-medium text-[var(--fg-muted)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </a>

            {/* Path 2: Freelance Projects */}
            <a
              ref={(el) => {
                pathCardsRef.current[1] = el;
              }}
              href={PERSONAL_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sweep-surface group flex min-h-[340px] cursor-pointer flex-col justify-between rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-8 sm:p-11 will-change-[transform,filter,opacity]"
            >
              <div className="flex items-center justify-between">
                <span className="sweep-muted text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">
                  PROYECTOS FREELANCE
                </span>
                <SlidingArrow />
              </div>

              <div className="my-8">
                <h3 className="font-editorial text-4xl font-normal leading-tight sm:text-5xl">
                  Construir tu próximo proyecto digital
                </h3>
                <p className="sweep-muted mt-4 max-w-lg text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                  Desarrollo de sitios web interactivos, diseño UI/UX en Figma, branding e ilustración, animación 2D / motion graphics o modelado y renders 3D de producto para marcas que buscan destacar.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Web & UI/UX', 'Diseño Gráfico & Motion', 'Modelado & Render 3D'].map((chip) => (
                  <span
                    key={chip}
                    className="sweep-chip rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-medium text-[var(--fg-muted)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Editorial Footer & Direct Contact */}
      <footer
        id="contacto"
        className="relative w-full border-t border-[var(--border)] bg-[var(--bg-elevated)]/55 px-4 pt-20 pb-12 sm:px-10 sm:pt-24 sm:pb-14 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          {/* Giant Liminal-style Bordered Sweep CTA */}
          <a
            ref={ctaBannerRef}
            href={PERSONAL_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sweep-surface group flex w-full cursor-pointer flex-col items-start justify-between gap-6 rounded-3xl border border-[var(--border-strong)] bg-[var(--bg)] p-8 sm:flex-row sm:items-center sm:p-12 will-change-[transform,filter,opacity]"
          >
            <div>
              <span className="sweep-muted text-xs font-medium tracking-[0.18em] uppercase text-[var(--fg-subtle)]">
                Respuesta rápida por WhatsApp o Correo
              </span>
              <h2 className="font-editorial mt-2 text-4xl font-light sm:text-6xl lg:text-7xl">
                Hablemos hoy mismo.
              </h2>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] transition-colors group-hover:border-white/50">
              <SlidingArrow />
            </div>
          </a>

          {/* Direct Channels Bar */}
          <div
            ref={channelsGridRef}
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {/* Email Copy Card */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] p-4 text-left transition-colors hover:border-[var(--accent)] sm:col-span-2 will-change-[transform,filter,opacity]"
            >
              <div className="min-w-0 pr-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent)]">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Correo Electrónico</span>
                </span>
                <p className="mt-1 truncate text-sm font-medium text-[var(--fg)]">
                  {PERSONAL_INFO.email}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </span>
            </button>

            {/* WhatsApp */}
            <a
              href={PERSONAL_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer flex-col justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] p-4 transition-colors hover:border-[var(--accent)] will-change-[transform,filter,opacity]"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent)]">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </span>
              <span className="mt-1 text-sm font-medium">{PERSONAL_INFO.phoneDisplay}</span>
            </a>

            {/* LinkedIn */}
            <a
              href={PERSONAL_INFO.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer flex-col justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] p-4 transition-colors hover:border-[var(--accent)] will-change-[transform,filter,opacity]"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent)]">
                <LinkedinIcon className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </span>
              <span className="mt-1 text-sm font-medium">/in/alejopalacio</span>
            </a>

            {/* GitHub */}
            <a
              href={PERSONAL_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer flex-col justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg)] p-4 transition-colors hover:border-[var(--accent)] will-change-[transform,filter,opacity]"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent)]">
                <GithubIcon className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </span>
              <span className="mt-1 text-sm font-medium">@alejocpl</span>
            </a>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-2 border-t border-[var(--border)] pt-6 text-xs text-[var(--fg-subtle)] sm:flex-row">
            <p>© 2026 {PERSONAL_INFO.fullName} · {PERSONAL_INFO.role}</p>
            <p>{PERSONAL_INFO.location} · Presencial &amp; Remoto</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
