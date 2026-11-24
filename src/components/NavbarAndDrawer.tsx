import { useEffect } from 'react';
import { Download, Menu, Moon, Sun, X } from 'lucide-react';
import { NAV_SECTIONS, PERSONAL_INFO } from '../data/portfolioData';

interface NavbarAndDrawerProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  drawerOpen: boolean;
  onSetDrawerOpen: (open: boolean) => void;
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function NavbarAndDrawer({
  theme,
  onToggleTheme,
  drawerOpen,
  onSetDrawerOpen,
  activeSection,
  onNavigate,
}: NavbarAndDrawerProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        onSetDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, onSetDrawerOpen]);

  return (
    <>
      {/* Minimal Floating Controls — 320px-safe, >=44px touch targets */}
      <div className="pointer-events-none fixed inset-x-0 top-3.5 z-50 flex items-center justify-between gap-1.5 px-3 sm:top-6 sm:gap-2 sm:px-8 lg:px-12">
        {/* Top-Left Floating Índice Button */}
        <button
          type="button"
          onClick={() => onSetDrawerOpen(!drawerOpen)}
          aria-expanded={drawerOpen}
          aria-controls="section-drawer"
          aria-label={drawerOpen ? 'Cerrar índice de secciones' : 'Abrir índice de secciones'}
          className="pointer-events-auto group inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-glass)] px-3 text-[11px] font-semibold tracking-[0.14em] uppercase shadow-sm backdrop-blur-xl transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:min-h-[42px] sm:px-4 sm:text-xs"
        >
          <Menu
            className="h-4 w-4 text-[var(--fg-muted)] transition-colors group-hover:text-[var(--accent)]"
            aria-hidden="true"
          />
          <span className="hidden min-[360px]:inline">Índice</span>
        </button>

        {/* Top-Right Floating Buttons: Claro/Oscuro, CV, Contacto */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
            }
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-glass)] px-2.5 text-[11px] font-medium tracking-[0.12em] uppercase shadow-sm backdrop-blur-xl transition-colors hover:border-[var(--accent)] sm:min-h-[42px] sm:px-3.5 sm:text-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                <span className="hidden sm:inline">Oscuro</span>
              </>
            )}
          </button>

          <a
            href={PERSONAL_INFO.cvUrl}
            download="CV-Alejandro-Castro-Palacio.pdf"
            aria-label="Descargar CV en PDF"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-glass)] px-2.5 text-[11px] font-medium tracking-[0.12em] uppercase shadow-sm backdrop-blur-xl transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:min-h-[42px] sm:px-4 sm:text-xs"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>CV</span>
          </a>

          <button
            type="button"
            onClick={() => onNavigate('contacto')}
            className="sweep-surface inline-flex min-h-[44px] cursor-pointer items-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-white shadow-sm sm:min-h-[42px] sm:px-5 sm:text-xs"
          >
            <span>Contacto</span>
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Left Drawer */}
      <div
        aria-hidden={!drawerOpen}
        onClick={() => onSetDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-500 ${
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Left Section Navigation Drawer */}
      <aside
        id="section-drawer"
        aria-label="Índice de secciones"
        aria-hidden={!drawerOpen}
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-80 max-w-[86vw] flex-col justify-between border-r border-[var(--border-strong)] bg-[var(--bg)] p-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-9 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 sm:pb-5">
          <div>
            <p className="font-editorial text-2xl font-normal">Alejandro.</p>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[var(--fg-subtle)]">
              Índice
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSetDrawerOpen(false)}
            aria-label="Cerrar menú lateral"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="my-auto overflow-y-auto py-4 sm:py-6">
          <ul className="space-y-1">
            {NAV_SECTIONS.map((sec) => {
              const active = activeSection === sec.id;
              return (
                <li key={sec.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSetDrawerOpen(false);
                      onNavigate(sec.id);
                    }}
                    className={`group flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-2 text-left transition-colors ${
                      active
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <span className="font-editorial text-xl font-normal sm:text-2xl">
                      {sec.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--border)] pt-4 text-xs text-[var(--fg-subtle)] sm:pt-5">
          <p className="font-medium text-[var(--fg)]">{PERSONAL_INFO.fullName}</p>
          <p className="mt-0.5">{PERSONAL_INFO.location}</p>
          <a
            href={PERSONAL_INFO.cvUrl}
            download="CV-Alejandro-Castro-Palacio.pdf"
            className="mt-3 inline-flex min-h-[36px] cursor-pointer items-center gap-2 font-semibold tracking-[0.13em] uppercase text-[var(--accent)] hover:underline"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Descargar CV en PDF</span>
          </a>
        </div>
      </aside>
    </>
  );
}
