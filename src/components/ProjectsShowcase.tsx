import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, ChevronLeft, ChevronRight, Eye, Film, Image as ImageIcon } from 'lucide-react';
import {
  PROJECT_FILTERS,
  PROJECTS_CATALOG,
  type ProjectCatalogItem,
} from '../data/projects.js';
import { InteractiveProjectGallery } from './InteractiveProjectGallery';

function deriveFlankLines(
  explicit: [string, string] | undefined,
  fallbackText: string
): [string, string] {
  if (explicit && explicit[0] && explicit[1]) return explicit;
  const words = fallbackText.trim().toUpperCase().split(/\s+/);
  if (words.length <= 1) return [words[0] ?? '', 'PROYECTO'];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function StageCardMedia({
  project,
  hoverPreviewSrc,
}: {
  project: ProjectCatalogItem;
  hoverPreviewSrc: string | null;
}) {
  const [failed, setFailed] = useState(false);

  const activeSrc = hoverPreviewSrc ?? project.coverSrc;
  const activeType = hoverPreviewSrc ? 'image' : project.coverType;
  const fit = project.coverFit ?? 'cover';

  useEffect(() => {
    setFailed(false);
  }, [activeSrc]);

  if (failed || !activeSrc) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0f131d] p-6 text-center text-xs text-white/65">
        {activeType === 'video' ? (
          <Film className="h-7 w-7 text-[#155DF2]" aria-hidden="true" />
        ) : (
          <ImageIcon className="h-7 w-7 text-[#155DF2]" aria-hidden="true" />
        )}
        <span className="font-medium text-white">{project.title}</span>
      </div>
    );
  }

  const fitClass =
    fit === 'contain'
      ? 'object-contain p-4 sm:p-6 bg-[#0e121b]'
      : 'object-cover bg-[#0e121b]';

  if (activeType === 'video') {
    return (
      <video
        key={activeSrc}
        src={activeSrc}
        poster={project.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className={`h-full w-full transition-opacity duration-300 ${fitClass}`}
      />
    );
  }

  return (
    <img
      key={activeSrc}
      src={activeSrc}
      alt={project.title}
      draggable={false}
      onError={() => setFailed(true)}
      className={`h-full w-full transition-opacity duration-300 ${fitClass}`}
    />
  );
}

export function ProjectsShowcase() {
  const cardTiltRef = useRef<HTMLButtonElement | null>(null);
  const cardInnerRef = useRef<HTMLDivElement | null>(null);
  const cursorPillRef = useRef<HTMLDivElement | null>(null);

  // Masked typography line refs (Desktop/Tablet + Mobile)
  const leftLine1Ref = useRef<HTMLSpanElement | null>(null);
  const leftLine2Ref = useRef<HTMLSpanElement | null>(null);
  const rightLine1Ref = useRef<HTMLSpanElement | null>(null);
  const rightLine2Ref = useRef<HTMLSpanElement | null>(null);
  const mobileTitleRef = useRef<HTMLDivElement | null>(null);
  const mobileMetaRef = useRef<HTMLDivElement | null>(null);

  const touchStartXRef = useRef<number | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [displayedIndex, setDisplayedIndex] = useState<number>(0);
  const [isHoveringCard, setIsHoveringCard] = useState<boolean>(false);
  const [hoverSlideTick, setHoverSlideTick] = useState<number>(0);
  const [modalProject, setModalProject] = useState<ProjectCatalogItem | null>(null);

  // Visible projects per filter ("todos" = strictly the 4 flagship works, 1 per discipline)
  const visibleProjects = useMemo(() => {
    if (activeFilter === 'todos') {
      return PROJECTS_CATALOG.filter((p) => p.highlightInAll);
    }
    return PROJECTS_CATALOG.filter((p) => p.filterGroup === activeFilter);
  }, [activeFilter]);

  const safeDisplayedIndex = Math.min(
    Math.max(0, displayedIndex),
    Math.max(0, visibleProjects.length - 1)
  );
  const currentProject = visibleProjects[safeDisplayedIndex] ?? PROJECTS_CATALOG[0];

  // Switch filter cleanly WITHOUT any ScrollTrigger pinning or scroll jumps
  const handleSelectFilter = useCallback((filterId: string) => {
    setActiveFilter(filterId);
    setTargetIndex(0);
    setDisplayedIndex(0);
    setHoverSlideTick(0);
  }, []);

  // Subtle internal card preview reel ONLY while hovering on multi-image projects
  const hoverImagePool = useMemo(() => {
    if (!currentProject?.gallery) return [];
    return currentProject.gallery
      .filter((item) => item.type === 'image')
      .map((item) => item.src);
  }, [currentProject]);

  useEffect(() => {
    if (!isHoveringCard || hoverImagePool.length <= 1) {
      setHoverSlideTick(0);
      return;
    }
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setHoverSlideTick((prev) => (prev + 1) % hoverImagePool.length);
    }, 1350);
    return () => window.clearInterval(timer);
  }, [isHoveringCard, hoverImagePool.length]);

  const hoverPreviewSrc =
    isHoveringCard && hoverImagePool.length > 1 && hoverSlideTick > 0
      ? hoverImagePool[hoverSlideTick % hoverImagePool.length]
      : null;

  // =========================================================================
  // RADIANCE 3-PHASE LINE-MASK TRANSITION (No scroll pinning -> zero scroll bugs)
  // =========================================================================
  const isInitialMountRef = useRef(true);
  const displayedIndexRef = useRef(displayedIndex);
  displayedIndexRef.current = displayedIndex;

  useEffect(() => {
    if (targetIndex === displayedIndexRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayedIndex(targetIndex);
      return;
    }

    const lineEls = [
      leftLine1Ref.current,
      leftLine2Ref.current,
      rightLine1Ref.current,
      rightLine2Ref.current,
    ].filter((el): el is HTMLSpanElement => el !== null);

    const mobileEls = [mobileTitleRef.current, mobileMetaRef.current].filter(
      (el): el is HTMLDivElement => el !== null
    );

    const cardEl = cardInnerRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayedIndex(targetIndex);
      },
    });

    if (lineEls.length) {
      tl.to(
        lineEls,
        {
          yPercent: -115,
          duration: 0.18,
          stagger: 0.015,
          ease: 'power2.in',
          overwrite: true,
        },
        0
      );
    }
    if (mobileEls.length) {
      tl.to(
        mobileEls,
        {
          opacity: 0,
          y: -12,
          duration: 0.16,
          ease: 'power2.in',
          overwrite: true,
        },
        0
      );
    }
    if (cardEl) {
      tl.to(
        cardEl,
        {
          scale: 0.93,
          opacity: 0.35,
          filter: 'blur(6px)',
          duration: 0.18,
          ease: 'power2.in',
          overwrite: true,
        },
        0
      );
    }

    return () => {
      tl.kill();
    };
  }, [targetIndex]);

  useLayoutEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lineEls = [
      leftLine1Ref.current,
      leftLine2Ref.current,
      rightLine1Ref.current,
      rightLine2Ref.current,
    ].filter((el): el is HTMLSpanElement => el !== null);

    const mobileEls = [mobileTitleRef.current, mobileMetaRef.current].filter(
      (el): el is HTMLDivElement => el !== null
    );

    const cardEl = cardInnerRef.current;
    const tl = gsap.timeline();

    if (lineEls.length) {
      tl.fromTo(
        lineEls,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.38,
          stagger: 0.04,
          ease: 'power3.out',
          overwrite: true,
        },
        0
      );
    }
    if (mobileEls.length) {
      tl.fromTo(
        mobileEls,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.32,
          stagger: 0.04,
          ease: 'power3.out',
          overwrite: true,
        },
        0
      );
    }
    if (cardEl) {
      tl.fromTo(
        cardEl,
        { scale: 0.93, opacity: 0.35, filter: 'blur(6px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          clearProps: 'filter',
          duration: 0.38,
          ease: 'power3.out',
          overwrite: true,
        },
        0
      );
    }

    return () => {
      tl.kill();
    };
  }, [displayedIndex, activeFilter]);

  const jumpToProjectIndex = useCallback(
    (idx: number) => {
      const total = visibleProjects.length;
      if (total <= 1) return;
      const clamped = ((idx % total) + total) % total;
      setTargetIndex(clamped);
    },
    [visibleProjects.length]
  );

  // 3D Pointer Tilt + Floating "VER" Cursor Pill
  const handleCardPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const btn = cardTiltRef.current;
    if (!btn || window.innerWidth < 768) return;

    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const nx = relX / rect.width - 0.5;
    const ny = relY / rect.height - 0.5;

    btn.style.transform = `perspective(1200px) rotateY(${(nx * 11).toFixed(2)}deg) rotateX(${(-ny * 11).toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

    if (cursorPillRef.current) {
      cursorPillRef.current.style.transform = `translate3d(${relX + 14}px, ${relY + 14}px, 0)`;
    }
  };

  const handleCardPointerLeave = () => {
    setIsHoveringCard(false);
    if (cardTiltRef.current) {
      cardTiltRef.current.style.transform =
        'perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    }
  };

  const [left1, left2] = deriveFlankLines(
    currentProject.flankLeft,
    currentProject.category
  );
  const [right1, right2] = deriveFlankLines(
    currentProject.flankRight,
    currentProject.title
  );
  const yearSup = currentProject.yearShort ?? currentProject.year;
  const frameAccent = currentProject.accentColor ?? '#155DF2';

  return (
    <section
      id="proyectos"
      onTouchStart={(e) => {
        touchStartXRef.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartXRef.current === null) return;
        const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
        const diff = touchStartXRef.current - endX;
        touchStartXRef.current = null;
        if (Math.abs(diff) > 44) {
          jumpToProjectIndex(targetIndex + (diff > 0 ? 1 : -1));
        }
      }}
      className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden border-t border-[var(--border)] px-4 pt-22 pb-10 sm:px-8 sm:pt-24 sm:pb-12 lg:px-14"
    >
      {/* Dynamic Ambient Project Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px] transition-colors duration-700 sm:h-[480px] sm:w-[480px]"
        style={{
          background: `radial-gradient(circle, ${frameAccent} 0%, transparent 72%)`,
        }}
      />

      {/* Top Stage Header: Title + Category Filter Tabs */}
      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-editorial text-2xl font-light leading-tight sm:text-3xl lg:text-4xl">
            Productos y experiencias desde el{' '}
            <span className="text-[var(--accent)]">concepto</span> hasta el{' '}
            <span className="text-[var(--accent)]">resultado</span>.
          </h2>
        </div>

        {/* Category Filter Tabs (Zero scroll jump on click) */}
        <div
          role="tablist"
          aria-label="Filtrar proyectos por disciplina"
          className="-mx-4 flex max-w-[100vw] items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {PROJECT_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            const count =
              filter.id === 'todos'
                ? PROJECTS_CATALOG.filter((p) => p.highlightInAll).length
                : PROJECTS_CATALOG.filter((p) => p.filterGroup === filter.id).length;

            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectFilter(filter.id)}
                className={`inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.11em] uppercase transition-all sm:min-h-[38px] ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                    : 'border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg)] text-[var(--fg-subtle)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          CENTER RADIANCE MONOLITHIC SPOTLIGHT STAGE
         =================================================================== */}
      <div className="relative z-10 mx-auto my-auto flex w-full max-w-7xl flex-col items-center justify-center py-6 md:grid md:grid-cols-12 md:items-center md:gap-4 lg:gap-8">
        {/* MOBILE TOP TITLE + SUPERSCRIPT YEAR (<768px) */}
        <div ref={mobileTitleRef} className="mb-4 text-center md:hidden">
          <div className="inline-flex items-start justify-center gap-1.5">
            <h3 className="text-2xl font-extrabold tracking-[-0.03em] uppercase leading-[0.95]">
              {right1}
              <span className="block">{right2}</span>
            </h3>
            <sup className="mt-1 font-mono text-[11px] font-bold text-[var(--accent)]">
              {yearSup}
            </sup>
          </div>
          <p className="mt-1.5 text-xs font-medium text-[var(--fg-muted)]">
            {currentProject.client}
          </p>
        </div>

        {/* DESKTOP / TABLET LEFT FLANK */}
        <div className="hidden select-none md:col-span-4 md:flex md:flex-col md:items-end md:pr-2 lg:pr-6">
          <div className="text-right font-sans-ui text-[clamp(1.35rem,2.5vw,2.75rem)] font-bold tracking-[-0.035em] uppercase leading-[0.95] text-[var(--fg)]">
            <span className="block overflow-hidden py-0.5">
              <span ref={leftLine1Ref} className="block will-change-transform">
                {left1}
              </span>
            </span>
            <span className="block overflow-hidden py-0.5 text-[var(--fg-muted)]">
              <span ref={leftLine2Ref} className="block will-change-transform">
                {left2}
              </span>
            </span>
          </div>
          <p className="mt-3 text-right text-xs font-medium tracking-[0.14em] uppercase text-[var(--fg-subtle)]">
            {currentProject.client}
          </p>
        </div>

        {/* CENTER MONOLITHIC 3:4 PORTRAIT ARTIFACT CARD */}
        <div className="flex w-full items-center justify-center md:col-span-4">
          <div ref={cardInnerRef} className="will-change-[transform,filter,opacity]">
            <button
              ref={cardTiltRef}
              type="button"
              onClick={() => setModalProject(currentProject)}
              onPointerEnter={() => setIsHoveringCard(true)}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              aria-label={`Abrir galería interactiva de ${currentProject.title}`}
              style={{
                borderColor: frameAccent,
                boxShadow: `0 28px 75px -18px rgba(0, 0, 0, 0.55), 0 0 0 1px ${frameAccent}40`,
              }}
              className="group relative aspect-3/4 w-[72vw] max-w-[295px] cursor-pointer overflow-hidden rounded-[22px] border-[3px] bg-[#0e121b] text-left transition-[transform,border-color,box-shadow] duration-200 ease-out sm:w-[300px] md:w-[28vw] md:max-w-[330px] lg:w-[24vw] lg:max-w-[360px]"
            >
              <StageCardMedia
                project={currentProject}
                hoverPreviewSrc={hoverPreviewSrc}
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

              <div className="pointer-events-none absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.14em] uppercase text-white/85">
                <span className="truncate rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-md">
                  {currentProject.gallery && currentProject.gallery.length > 1
                    ? `${currentProject.gallery.length} recursos`
                    : currentProject.gallery?.[0]?.type === 'video' ||
                        currentProject.coverType === 'video'
                      ? 'Video'
                      : 'Proyecto'}
                </span>

                {currentProject.externalUrl && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-[#5b91ff] backdrop-blur-md">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-4 bottom-4">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-white/90">
                  {currentProject.subtitle}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#155DF2] px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-white shadow-md md:hidden">
                  <Eye className="h-3 w-3" />
                  <span>Ver galería</span>
                </div>
              </div>

              {/* Desktop Cursor-Follower "VER" Pill */}
              <div
                ref={cursorPillRef}
                aria-hidden="true"
                className={`pointer-events-none absolute top-0 left-0 z-30 hidden items-center gap-1.5 rounded-full bg-[#151821]/95 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-white ring-1 ring-white/25 backdrop-blur-md transition-opacity duration-150 md:inline-flex ${
                  isHoveringCard ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span>VER</span>
              </div>
            </button>
          </div>
        </div>

        {/* DESKTOP / TABLET RIGHT FLANK */}
        <div className="hidden select-none md:col-span-4 md:flex md:flex-col md:items-start md:pl-2 lg:pl-6">
          <div className="text-left font-sans-ui text-[clamp(1.35rem,2.5vw,2.75rem)] font-bold tracking-[-0.035em] uppercase leading-[0.95] text-[var(--fg)]">
            <div className="flex items-start gap-1.5">
              <span className="block overflow-hidden py-0.5">
                <span ref={rightLine1Ref} className="block will-change-transform">
                  {right1}
                </span>
              </span>
              <sup className="mt-1 font-mono text-xs font-bold tracking-normal text-[var(--accent)]">
                {yearSup}
              </sup>
            </div>
            <span className="block overflow-hidden py-0.5 text-[var(--accent)]">
              <span ref={rightLine2Ref} className="block will-change-transform">
                {right2}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModalProject(currentProject)}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-[0.15em] uppercase text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
          >
            <span>Abrir galería</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* MOBILE BOTTOM DISCIPLINE TAGS (<768px) */}
        <div ref={mobileMetaRef} className="mt-4 text-center md:hidden">
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-[var(--accent)]">
            {left1} · {left2}
          </p>
        </div>
      </div>

      {/* ===================================================================
          BOTTOM INTERACTIVE CONTROLS: All Projects Selector + 2 Prev/Next Buttons
         =================================================================== */}
      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Direct Selector of ALL Projects in the Active Category */}
        <div
          role="group"
          aria-label="Proyectos en esta categoría"
          className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {visibleProjects.map((proj, idx) => {
            const isCurrent = idx === targetIndex;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => jumpToProjectIndex(idx)}
                aria-current={isCurrent ? 'true' : undefined}
                className={`inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isCurrent
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]'
                    : 'border-[var(--border)] bg-transparent text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isCurrent ? 'bg-[var(--accent)]' : 'bg-[var(--fg-subtle)]'
                  }`}
                />
                <span className="max-w-[180px] truncate">{proj.title}</span>
              </button>
            );
          })}
        </div>

        {/* 2 Dedicated Interactive Buttons: Anterior & Siguiente */}
        <div className="flex shrink-0 items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => jumpToProjectIndex(targetIndex - 1)}
            aria-label="Proyecto anterior"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            type="button"
            onClick={() => jumpToProjectIndex(targetIndex + 1)}
            aria-label="Proyecto siguiente"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-opacity hover:opacity-90"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Unified Interactive Gallery Modal */}
      {modalProject && (
        <InteractiveProjectGallery
          project={modalProject}
          onClose={() => setModalProject(null)}
        />
      )}
    </section>
  );
}
