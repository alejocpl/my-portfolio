import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  Film,
  Grid2x2,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ProjectCatalogItem, ProjectGalleryMedia } from '../data/projects.js';

interface InteractiveProjectGalleryProps {
  project: ProjectCatalogItem;
  onClose: () => void;
}

export function InteractiveProjectGallery({
  project,
  onClose,
}: InteractiveProjectGalleryProps) {
  const slides: ProjectGalleryMedia[] = useMemo(() => {
    if (project.gallery && project.gallery.length > 0) {
      return project.gallery;
    }
    return [
      {
        type: project.coverType,
        src: project.coverSrc,
        caption: project.subtitle,
        fit: project.coverFit,
      },
    ];
  }, [project]);

  const hasMultipleSlides = slides.length > 1;

  // Open multi-item galleries in 'canvas' (Lienzo), single-item (like MyWallet video) directly in 'inspect'
  const [viewMode, setViewMode] = useState<'canvas' | 'inspect'>(() =>
    slides.length > 1 ? 'canvas' : 'inspect'
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isScrollableCanvas, setIsScrollableCanvas] = useState<boolean>(false);
  const [mobileInfoExpanded, setMobileInfoExpanded] = useState<boolean>(false);

  // Interactive Zoom & Pan state in Inspect Mode
  const [zoomed, setZoomed] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panDragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  // Reset state cleanly when project changes
  useEffect(() => {
    setActiveIndex(0);
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setViewMode(slides.length > 1 ? 'canvas' : 'inspect');
  }, [project, slides.length]);

  useEffect(() => {
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
  }, [activeIndex, viewMode]);

  // Lock page scroll while gallery is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // =========================================================================
  // SPATIAL CANVAS PHYSICS (Auto-centers 1-2 items; enables inertia drag when overflowing)
  // =========================================================================
  const railViewportRef = useRef<HTMLDivElement | null>(null);
  const railTrackRef = useRef<HTMLDivElement | null>(null);
  const physicsRef = useRef({
    targetX: 0,
    currentX: 0,
    maxScroll: 0,
    isPointerDown: false,
    pointerStartX: 0,
    dragOriginX: 0,
    movedDistance: 0,
  });

  useEffect(() => {
    if (viewMode !== 'canvas') return;

    const measureBounds = () => {
      const vp = railViewportRef.current;
      const track = railTrackRef.current;
      if (!vp || !track) return;

      const overflow = track.scrollWidth - vp.clientWidth;
      if (overflow <= 16) {
        physicsRef.current.maxScroll = 0;
        physicsRef.current.targetX = 0;
        physicsRef.current.currentX = 0;
        setIsScrollableCanvas(false);
        track.style.transform = 'translate3d(0px, 0, 0)';
      } else {
        const max = overflow + 48;
        physicsRef.current.maxScroll = max;
        physicsRef.current.targetX = Math.min(max, Math.max(0, physicsRef.current.targetX));
        setIsScrollableCanvas(true);
      }
    };

    physicsRef.current.targetX = 0;
    physicsRef.current.currentX = 0;
    measureBounds();
    const resizeTimer = window.setTimeout(measureBounds, 120);
    window.addEventListener('resize', measureBounds);

    let rafId = 0;
    const tick = () => {
      rafId = window.requestAnimationFrame(tick);
      const st = physicsRef.current;
      if (st.maxScroll <= 0) return;

      const velocity = (st.targetX - st.currentX) * 0.11;
      st.currentX += velocity;

      if (railTrackRef.current) {
        const skew = Math.max(-3.5, Math.min(3.5, -velocity * 0.12));
        railTrackRef.current.style.transform = `translate3d(${-st.currentX.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      }
    };
    tick();

    return () => {
      window.clearTimeout(resizeTimer);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measureBounds);
    };
  }, [viewMode, project.id, slides.length]);

  const clampTarget = useCallback((val: number) => {
    return Math.min(physicsRef.current.maxScroll, Math.max(0, val));
  }, []);

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent) => {
      if (viewMode === 'canvas' && physicsRef.current.maxScroll > 0) {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        physicsRef.current.targetX = clampTarget(physicsRef.current.targetX + delta * 1.15);
      }
    },
    [viewMode, clampTarget]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) {
          setZoomed(false);
          setPanOffset({ x: 0, y: 0 });
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        if (viewMode === 'canvas' && physicsRef.current.maxScroll > 0) {
          physicsRef.current.targetX = clampTarget(physicsRef.current.targetX + 380);
        } else if (hasMultipleSlides) {
          setActiveIndex((prev) => (prev + 1) % slides.length);
        }
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'canvas' && physicsRef.current.maxScroll > 0) {
          physicsRef.current.targetX = clampTarget(physicsRef.current.targetX - 380);
        } else if (hasMultipleSlides) {
          setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, slides.length, hasMultipleSlides, viewMode, zoomed, clampTarget]);

  const currentSlide = slides[activeIndex] ?? slides[0];

  const handleToggleMode = () => {
    setViewMode((prev) => (prev === 'canvas' ? 'inspect' : 'canvas'));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería interactiva — ${project.title}`}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#10131c] text-white select-none"
    >
      {/* Single Unified Background Glow (No horizon split, no divided screen) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(21,93,242,0.16) 0%, rgba(16,19,28,0.96) 58%, #0d1018 100%)',
        }}
      />

      {/* =====================================================================
          CLEAN MINIMAL TOP HEADER (Title + Single Mode Toggle + Zoom + Close)
         ===================================================================== */}
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-5">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium tracking-[0.16em] uppercase text-white/50 sm:text-[11px]">
            {project.client} · {project.year}
          </p>
          <h2 className="font-editorial truncate text-xl font-normal text-white sm:text-3xl">
            {project.title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* SINGLE Toggle Button showing current mode ("Lienzo" or "Inspección") */}
          {hasMultipleSlides && (
            <button
              type="button"
              onClick={handleToggleMode}
              title={
                viewMode === 'canvas'
                  ? 'Cambiar a modo Inspección'
                  : 'Cambiar a modo Lienzo'
              }
              className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#155DF2]/70 bg-[#155DF2]/20 px-4 text-[11px] font-semibold tracking-[0.14em] uppercase text-white transition-colors hover:bg-[#155DF2]"
            >
              {viewMode === 'canvas' ? (
                <>
                  <Grid2x2 className="h-3.5 w-3.5 text-[#7aa8ff]" aria-hidden="true" />
                  <span>Lienzo</span>
                </>
              ) : (
                <>
                  <Expand className="h-3.5 w-3.5 text-[#7aa8ff]" aria-hidden="true" />
                  <span>Inspección</span>
                </>
              )}
            </button>
          )}

          {viewMode === 'inspect' && currentSlide.type === 'image' && (
            <button
              type="button"
              onClick={() => {
                setZoomed((z) => !z);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="hidden min-h-[42px] cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 text-[11px] font-semibold tracking-[0.13em] uppercase text-white/85 transition-colors hover:border-[#155DF2] sm:inline-flex"
            >
              {zoomed ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5 text-[#5b91ff]" />
                  <span>1x</span>
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5 text-[#5b91ff]" />
                  <span>Zoom</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar galería"
            className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-white transition-colors hover:border-[#155DF2] hover:bg-[#155DF2]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          MODE 1: LIENZO (Auto-centered when <= viewport; draggable when many items)
          Numerals lifted high above top-left corner so every digit is clearly readable
         ===================================================================== */}
      {viewMode === 'canvas' ? (
        <div
          ref={railViewportRef}
          onWheel={handleCanvasWheel}
          onPointerDown={(e) => {
            if (!isScrollableCanvas) return;
            physicsRef.current.isPointerDown = true;
            physicsRef.current.pointerStartX = e.clientX;
            physicsRef.current.dragOriginX = physicsRef.current.targetX;
            physicsRef.current.movedDistance = 0;
          }}
          onPointerMove={(e) => {
            if (!isScrollableCanvas || !physicsRef.current.isPointerDown) return;
            const dx = e.clientX - physicsRef.current.pointerStartX;
            physicsRef.current.movedDistance = Math.abs(dx);
            physicsRef.current.targetX = clampTarget(
              physicsRef.current.dragOriginX - dx * 1.25
            );
          }}
          onPointerUp={() => {
            physicsRef.current.isPointerDown = false;
          }}
          onPointerCancel={() => {
            physicsRef.current.isPointerDown = false;
          }}
          className={`relative z-10 flex flex-1 items-center overflow-hidden ${
            isScrollableCanvas
              ? 'cursor-grab justify-start active:cursor-grabbing'
              : 'justify-center'
          }`}
        >
          <div
            ref={railTrackRef}
            className={`flex items-center gap-8 px-8 pt-14 pb-8 will-change-transform sm:gap-12 sm:px-14 ${
              isScrollableCanvas ? '' : 'mx-auto justify-center'
            }`}
          >
            {slides.map((slide, idx) => {
              const staggerClass =
                slides.length <= 2
                  ? ''
                  : idx % 3 === 0
                    ? '-translate-y-4'
                    : idx % 3 === 1
                      ? 'translate-y-4'
                      : '-translate-y-1';

              return (
                <div
                  key={`${slide.src}-${idx}`}
                  className={`group relative shrink-0 transition-transform duration-500 ${staggerClass}`}
                >
                  {/* 100% Readable Editorial Serif Numeral Sitting Cleanly Above Top-Left */}
                  <span
                    aria-hidden="true"
                    className="font-editorial pointer-events-none mb-1.5 block pl-1 text-4xl font-light leading-none text-white/90 transition-colors duration-300 group-hover:text-[#5b91ff] sm:mb-2 sm:text-5xl"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Floating Artifact Frame */}
                  <button
                    type="button"
                    onClick={() => {
                      if (physicsRef.current.movedDistance > 8) return;
                      setActiveIndex(idx);
                      setViewMode('inspect');
                    }}
                    className="relative z-10 flex h-[280px] w-[280px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#141824] shadow-[0_26px_70px_rgba(0,0,0,0.55)] transition-all duration-500 group-hover:scale-[1.03] group-hover:border-[#155DF2] sm:h-[340px] sm:w-[370px]"
                  >
                    <div className="relative flex-1 w-full overflow-hidden bg-[#10131c]">
                      {slide.type === 'video' ? (
                        <video
                          src={slide.src}
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          className="pointer-events-none h-full w-full object-contain p-3"
                        />
                      ) : (
                        <img
                          src={slide.src}
                          alt={slide.caption ?? `${project.title} ${idx + 1}`}
                          draggable={false}
                          className="pointer-events-none h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}

                      {/* Center '+' Reticle on Hover */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                        <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-white/60 bg-[#155DF2]/90 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <Plus className="h-5 w-5 stroke-[1.75]" />
                        </span>
                      </div>

                      {slide.type === 'video' && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-white backdrop-blur-md">
                          <Film className="h-3 w-3 text-[#5b91ff]" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full border-t border-white/10 bg-[#151821] px-4 py-2.5 text-left">
                      <p className="truncate text-xs text-white/80">
                        {slide.caption ?? `${project.title} — Recurso ${idx + 1}`}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ===================================================================
           MODE 2: INSPECCIÓN (Single Unified Centered Stage — NO Split Screen)
           =================================================================== */
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-2 sm:px-14">
          <div
            onDoubleClick={() => {
              if (currentSlide.type !== 'image') return;
              setZoomed((z) => !z);
              setPanOffset({ x: 0, y: 0 });
            }}
            onPointerDown={(e) => {
              if (!zoomed) return;
              panDragRef.current = {
                dragging: true,
                startX: e.clientX,
                startY: e.clientY,
                originX: panOffset.x,
                originY: panOffset.y,
              };
            }}
            onPointerMove={(e) => {
              if (!zoomed || !panDragRef.current.dragging) return;
              setPanOffset({
                x: panDragRef.current.originX + (e.clientX - panDragRef.current.startX),
                y: panDragRef.current.originY + (e.clientY - panDragRef.current.startY),
              });
            }}
            onPointerUp={() => {
              panDragRef.current.dragging = false;
            }}
            className={`relative flex h-full w-full max-w-5xl items-center justify-center overflow-hidden ${
              zoomed
                ? 'cursor-grab active:cursor-grabbing'
                : currentSlide.type === 'image'
                  ? 'cursor-zoom-in'
                  : ''
            }`}
          >
            {currentSlide.type === 'video' ? (
              <video
                key={currentSlide.src}
                src={currentSlide.src}
                controls
                autoPlay
                playsInline
                className="max-h-[60vh] w-full rounded-2xl object-contain"
              />
            ) : (
              <img
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.caption ?? project.title}
                draggable={false}
                style={{
                  transform: zoomed
                    ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(2.35)`
                    : 'translate3d(0, 0, 0) scale(1)',
                }}
                className="max-h-[60vh] w-full object-contain transition-transform duration-300 ease-out"
              />
            )}
          </div>

          {/* Left / Right Floating Steppers when project has multiple slides */}
          {hasMultipleSlides && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
                }
                aria-label="Recurso anterior"
                className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition-colors hover:border-[#155DF2] hover:bg-[#155DF2] sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
                aria-label="Siguiente recurso"
                className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition-colors hover:border-[#155DF2] hover:bg-[#155DF2] sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          CLEAN EDITORIAL BOTTOM DOCK (Project Info & Description Integrated Below)
         ===================================================================== */}
      <footer className="relative z-30 border-t border-white/10 bg-[#0d1018]/85 px-4 py-3.5 backdrop-blur-xl sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          {/* Top Row of Bottom Dock: Role + Thumbnails (in Inspect mode) + Mobile Expand */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6699ff]">
                {project.role}
              </span>
              {viewMode === 'inspect' && hasMultipleSlides && (
                <span className="font-mono text-[11px] text-white/45">
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(slides.length).padStart(2, '0')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#155DF2] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white transition-opacity hover:opacity-90"
                >
                  <span>{project.externalLabel ?? 'Ver enlace'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setMobileInfoExpanded((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium tracking-[0.12em] uppercase text-white/65 sm:hidden"
              >
                <span>Detalles</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    mobileInfoExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Clean Description + Stack (Always visible on sm+, expandable on mobile) */}
          <div
            className={`flex-col justify-between gap-3 sm:flex sm:flex-row sm:items-end ${
              mobileInfoExpanded ? 'flex' : 'hidden'
            }`}
          >
            <p className="max-w-3xl text-xs leading-relaxed text-white/75 sm:text-sm">
              {viewMode === 'inspect' && currentSlide.caption
                ? `${currentSlide.caption} — ${project.description}`
                : project.description}
            </p>

            <div className="flex shrink-0 flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/70"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Compact Thumbnail Strip in Inspect Mode when multiple slides */}
          {viewMode === 'inspect' && hasMultipleSlides && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pt-1">
              {slides.map((s, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={`${s.src}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Ver recurso ${idx + 1}`}
                    className={`relative h-10 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all ${
                      active
                        ? 'scale-105 border-[#155DF2] ring-2 ring-[#155DF2]/40'
                        : 'border-white/15 opacity-50 hover:opacity-95'
                    }`}
                  >
                    {s.type === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center bg-[#181f30]">
                        <Film className="h-3.5 w-3.5 text-[#5b91ff]" />
                      </div>
                    ) : (
                      <img
                        src={s.src}
                        alt={`Miniatura ${idx + 1}`}
                        className="h-full w-full bg-[#0e1118] object-contain p-0.5"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
