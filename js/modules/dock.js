/* =================================================================
   MODULES / DOCK.JS
   Menú flotante inferior.
     - Scrollspy: marca el item de la sección visible
     - Se oculta al inicio y aparece al hacer scroll (config.dock.showAfter)
     - Submenú de categorías (botón ▲ junto a "Trabajos")
   Para agregar un item: añade un <li><a data-dock="id-seccion"> en
   index.html. Secciones sin item propio se asocian en SECTION_MAP.
   ================================================================= */
window.AC = window.AC || {};

AC.dock = (function () {
  const { $, $$, escapeHTML, icon, countByCategory, bus } = AC.utils;

  /* Secciones sin item en el dock → item que se resalta */
  const SECTION_MAP = {
    proceso: "trabajos",
    faq: "por-que",
  };

  let dock, items, sections, panel, toggle;

  /* ---------- Scrollspy ---------- */
  function updateActive() {
    const probe = window.innerHeight * 0.4;
    let currentId = "hero";

    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= probe) currentId = sec.id;
    });

    // Al llegar al final de la página, activar el último item (contacto)
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) currentId = "contacto";

    const target = SECTION_MAP[currentId] || currentId;
    items.forEach((a) => {
      const active = a.dataset.dock === target;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Mostrar / ocultar ---------- */
  function updateVisibility() {
    const threshold = AC.config.dock.showAfter;
    dock.classList.toggle("is-hidden", threshold > 0 && window.scrollY < threshold);
  }

  /* ---------- Submenú ---------- */
  function renderPanel() {
    $("#dockPanelList").innerHTML = AC.services
      .map((s) => `<li><button type="button" class="dock__panel-btn" style="--hue:${s.hue}" data-cat="${s.id}">
                     ${icon(s.icon)} ${escapeHTML(s.short)} <small>${countByCategory(s.id)}</small>
                   </button></li>`)
      .join("");
  }

  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button")?.focus({ preventScroll: true });
  }

  function init() {
    dock = $("#dock");
    if (!dock) return;
    items = $$(".dock__item", dock);
    sections = $$("main section[id]");
    panel = $("#dockPanel");
    toggle = $("#dockToggle");

    renderPanel();

    // Scroll (throttle con requestAnimationFrame)
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        updateVisibility();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // Clic en "Trabajos" → resetear filtro a "Todos"
    $('[data-dock="trabajos"]', dock).addEventListener("click", () => {
      if (AC.portfolio.getCurrent() !== "all") AC.portfolio.filter("all");
    });

    // Submenú
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setPanel(panel.hidden);
    });

    panel.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      bus.emit("filter:request", { category: btn.dataset.cat, scroll: true });
      setPanel(false);
    });

    // Cerrar con clic fuera o Esc
    document.addEventListener("click", (e) => {
      if (!panel.hidden && !dock.contains(e.target)) setPanel(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) {
        setPanel(false);
        toggle.focus();
      }
    });
  }

  return { init };
})();
