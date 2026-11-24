import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Globe, Layers, MapPin } from 'lucide-react';
import { NAV_SECTIONS, PERSONAL_INFO } from './data/portfolioData';
import { NavbarAndDrawer } from './components/NavbarAndDrawer';
import { HeroIntro } from './components/HeroIntro';
import { BlurSplitText } from './components/BlurSplitText';
import { SpecialismsDrum } from './components/SpecialismsDrum';
import { PillarsSection } from './components/PillarsSection';
import { ProjectsShowcase } from './components/ProjectsShowcase';
import { ExperienceSection } from './components/ExperienceSection';
import { CertificationsFocusList } from './components/CertificationsFocusList';
import { CollaborationAndFooter } from './components/CollaborationAndFooter';
import { Preloader } from './components/Preloader';

gsap.registerPlugin(ScrollTrigger);

function getSectionAnchorTop(id: string): number {
  if (id === 'inicio') return 0;
  const el = document.getElementById(id);
  if (!el) return 0;
  const pinSpacer = el.closest('.pin-spacer') as HTMLElement | null;
  const anchor = pinSpacer ?? el;
  return Math.max(0, anchor.getBoundingClientRect().top + window.scrollY);
}

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('alejo-theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const lenisRef = useRef<Lenis | null>(null);
  const portraitCardRef = useRef<HTMLDivElement | null>(null);

  // Sync theme to <html data-theme="..."> and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('alejo-theme', theme);
  }, [theme]);

  // Soft optical blur + rise scroll animation for the Profile Portrait Card (matching BlurSplitText)
  useEffect(() => {
    const card = portraitCardRef.current;
    if (!card) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        {
          opacity: 0.12,
          y: 42,
          scale: 0.94,
          filter: 'blur(14px)',
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 46%',
            scrub: 0.65,
          },
        }
      );

      gsap.fromTo(
        card,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        },
        {
          opacity: 0.18,
          y: -22,
          filter: 'blur(12px)',
          ease: 'power1.in',
          immediateRender: false,
          scrollTrigger: {
            trigger: card,
            start: 'bottom 28%',
            end: 'top -10%',
            scrub: 0.65,
          },
        }
      );
    }, portraitCardRef);

    return () => ctx.revert();
  }, []);

  // Deterministic active section detector across both normal & GSAP-pinned sections
  const updateActiveSection = useCallback(() => {
    const probeY = window.scrollY + window.innerHeight * 0.38;
    let current = NAV_SECTIONS[0].id;

    for (const sec of NAV_SECTIONS) {
      const top = getSectionAnchorTop(sec.id);
      if (probeY >= top) {
        current = sec.id;
      }
    }
    setActiveSection(current);
  }, []);

  // Initialize Lenis smooth scroll + GSAP ScrollTrigger synchronization
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.addEventListener('scroll', updateActiveSection, { passive: true });
      return () => window.removeEventListener('scroll', updateActiveSection);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', () => {
      ScrollTrigger.update();
      updateActiveSection();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [updateActiveSection]);

  // Pause smooth scrolling while preloader or drawer is open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (drawerOpen || loading) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [drawerOpen, loading]);

  const handlePreloaderComplete = useCallback(() => {
    setLoading(false);
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setDrawerOpen(false);

    // Resume Lenis immediately before scrolling so drawer-stop state never blocks navigation
    if (lenisRef.current) {
      lenisRef.current.start();
    }

    window.requestAnimationFrame(() => {
      const destinationY = getSectionAnchorTop(id);
      setActiveSection(id);

      if (lenisRef.current) {
        lenisRef.current.scrollTo(destinationY, {
          duration: 1.15,
          force: true,
        });
      } else {
        window.scrollTo({ top: destinationY, behavior: 'smooth' });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] selection:bg-[#155DF2] selection:text-white">
      {/* Keyboard Skip Link (WCAG 2.2) */}
      <a href="#perfil" className="skip-link">
        Saltar al contenido
      </a>

      {/* Editorial Preloader (0% 'A' -> 100% 'Alejandro Castro Palacio.') */}
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Tactile Editorial Film Grain */}
      <div className="film-grain" aria-hidden="true" />

      {/* Floating Controls + Left Section Drawer */}
      <NavbarAndDrawer
        theme={theme}
        onToggleTheme={handleToggleTheme}
        drawerOpen={drawerOpen}
        onSetDrawerOpen={setDrawerOpen}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Scroll Stage */}
      <main className={`smooth-stage ${drawerOpen ? 'drawer-open' : ''}`}>
        {/* Pinned 3D Hero Wordmark ("Alejo.") */}
        <HeroIntro />

        {/* Editorial Statement + Animated Presentation Portrait Card */}
        <section
          id="perfil"
          className="relative mx-auto flex min-h-[78dvh] max-w-7xl items-center px-4 py-20 sm:min-h-[84dvh] sm:px-10 sm:py-28 lg:px-16 lg:py-36"
        >
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <BlurSplitText
                text={PERSONAL_INFO.editorialHeadline}
                as="h1"
                accentWords={[
                  'Ingeniero',
                  'Multimedia',
                  'Frontend',
                  'UI/UX',
                  'Gráfico',
                  'Animación',
                  '3D',
                ]}
                className="font-editorial text-3xl font-light leading-[1.12] sm:text-5xl md:text-6xl lg:text-[4.1rem]"
              />

              <BlurSplitText
                text={PERSONAL_INFO.editorialBody}
                as="p"
                className="mt-7 max-w-2xl text-base font-light leading-relaxed text-[var(--fg-muted)] sm:mt-9 sm:text-xl"
              />
            </div>

            {/* Presentation Portrait Card with matching soft optical scroll reveal */}
            <div className="flex justify-center lg:col-span-4 lg:justify-end">
              <div
                ref={portraitCardRef}
                className="group relative w-full max-w-[300px] sm:max-w-[320px] will-change-[transform,filter,opacity]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-45"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 35%, rgba(21,93,242,0.55) 0%, transparent 72%)',
                  }}
                />
                <figure className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                  <div className="aspect-4/5 w-full overflow-hidden bg-gradient-to-b from-[#eef3fc] to-[#dde6f7]">
                    <img
                      src="/images/alejandro-portrait.jpg"
                      alt="Alejandro Castro Palacio — Ingeniero Multimedia"
                      width={640}
                      height={800}
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5">
                    <div>
                      <p className="font-editorial text-lg font-medium leading-tight text-[var(--fg)]">
                        Alejandro Palacio
                      </p>
                      <p className="text-[11px] tracking-[0.12em] uppercase text-[var(--fg-subtle)]">
                        Medellín · Colombia
                      </p>
                    </div>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Pinned Rotating Specialisms Drum */}
        <SpecialismsDrum />

        {/* Context / Hybrid Multimedia Engineering Value Proposition */}
        <section
          id="enfoque"
          className="relative mx-auto flex min-h-[78dvh] max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[85dvh] sm:px-10 sm:py-28 lg:px-16 lg:py-36"
        >
          <BlurSplitText
            text={PERSONAL_INFO.contextHeadline}
            as="h2"
            accentWords={['arte', 'movimiento', 'código', 'resultado']}
            className="font-editorial max-w-5xl text-3xl font-light leading-[1.12] sm:text-5xl md:text-6xl lg:text-[4.15rem]"
          />

          <BlurSplitText
            text={PERSONAL_INFO.contextBody}
            as="p"
            className="mt-6 max-w-3xl text-base leading-relaxed text-[var(--fg-muted)] sm:mt-9 sm:text-xl"
          />

          {/* Updated 3 Key Real Highlights Strip */}
          <div className="mt-14 grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-10 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <Layers className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              <p className="font-editorial mt-3 text-3xl font-normal">Perfil 360°</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)] sm:text-sm">
                Desarrollo Web Front-End, Diseño UI/UX, Diseño Gráfico, Ilustración, Animación 2D, Motion Graphics y Modelado/Rigging 3D en un solo perfil coherente.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <Globe className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              <p className="font-editorial mt-3 text-3xl font-normal">Inglés B2 MCER</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)] sm:text-sm">
                Certificado oficial British Council (Aptis General 167/200 · Writing C), listo para integrarme con equipos locales e internacionales.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <MapPin className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              <p className="font-editorial mt-3 text-3xl font-normal">
                Medellín · Presencial &amp; Remoto
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)] sm:text-sm">
                Disponible tanto para posiciones presenciales o híbridas en Medellín como para trabajo 100% remoto con empresas y clientes de cualquier país.
              </p>
            </div>
          </div>
        </section>

        {/* Pinned Three.js 3D Glass Panels + 5 Stacked Pillar Cards */}
        <PillarsSection theme={theme} />

        {/* Visual Media Projects Showcase (connected to src/data/projects.js) */}
        <ProjectsShowcase />

        {/* Professional Experience, Atlético Nacional & University Education */}
        <ExperienceSection />

        {/* 2-Column Side-by-Side Official LinkedIn Certifications */}
        <CertificationsFocusList />

        {/* Two Collaboration Paths + Direct Contact Footer */}
        <CollaborationAndFooter />
      </main>
    </div>
  );
}

export default App;
