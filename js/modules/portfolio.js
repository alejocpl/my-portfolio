/* =================================================================
   MODULES / PORTFOLIO.JS
   Sección "Selección de trabajos":
     - Genera los filtros (Todos + cada servicio con su contador)
     - Renderiza las tarjetas desde AC.projects
     - Filtra con animación
     - Sincroniza el filtro con la URL (?cat=web) → enlaces compartibles,
       útil para enviar a RRHH sólo una disciplina.
   Escucha:  bus "filter:request" { category, scroll }
   Emite:    bus "project:open"   { id, list }
   ================================================================= */
window.AC = window.AC || {};

AC.portfolio = (function () {
  const { $, $$, escapeHTML, icon, getService, projectInCategory, countByCategory, renderMedia, bus, scrollToId } = AC.utils;

  let current = "all";
  let els = {};

  /* ---------- Templates ---------- */
  function filterTemplate(id, label, count) {
    return `<button type="button" class="chip" role="tab" data-filter="${id}" aria-selected="${id === current}">
              ${escapeHTML(label)} <span class="chip__count">${count}</span>
            </button>`;
  }

  function cardTemplate(p) {
    const service = getService(p.category) || {};
    return `
      <a href="#p-${p.id}" class="project-card ${p.featured ? "project-card--featured" : ""}" data-project="${p.id}">
        <div class="project-card__media">
          ${renderMedia(p.cover, { hue: service.hue, label: `Portada · ${p.cover?.type === "video" ? "Video" : "Imagen"}` })}
          <span class="project-card__badge">${icon(service.icon || "grid")} ${escapeHTML(service.short || "")}</span>
          <span class="project-card__overlay"><span class="project-card__cta">${icon("arrow-up-right")}</span></span>
        </div>
        <div class="project-card__info">
          <h3 class="project-card__title">${escapeHTML(p.title)}</h3>
          <span class="project-card__meta">${p.year}</span>
        </div>
        <p class="project-card__client">${escapeHTML(p.client)}</p>
      </a>`;
  }

  /* ---------- Render ---------- */
  function renderFilters() {
    const html = [filterTemplate("all", "Todos", AC.projects.length)]
      .concat(AC.services.map((s) => filterTemplate(s.id, s.short, countByCategory(s.id))))
      .join("");
    els.filters.innerHTML = html;
  }

  function getVisible() {
    return AC.projects.filter((p) => projectInCategory(p, current));
  }

  function renderGrid(animate = false) {
    const list = getVisible();
    els.grid.innerHTML = list.map(cardTemplate).join("");
    els.empty.hidden = list.length > 0;

    if (animate) {
      $$(".project-card", els.grid).forEach((card, i) => {
        card.style.animationDelay = `${i * 40}ms`;
        card.classList.add("is-showing");
      });
    }
  }

  /* ---------- API pública ---------- */
  function filter(category = "all", { scroll = false } = {}) {
    if (category !== "all" && !getService(category)) category = "all";
    current = category;

    $$(".chip", els.filters).forEach((chip) => chip.setAttribute("aria-selected", chip.dataset.filter === category));
    // Asegura que el chip activo sea visible en el carrusel de filtros (mobile), sin mover la página
    const activeChip = $(`.chip[data-filter="${category}"]`, els.filters);
    if (activeChip) {
      els.filters.scrollTo({ left: activeChip.offsetLeft - els.filters.clientWidth / 2 + activeChip.offsetWidth / 2, behavior: "smooth" });
    }

    renderGrid(true);
    updateURL();
    if (scroll) scrollToId("trabajos");
  }

  function updateURL() {
    const url = new URL(window.location.href);
    if (current === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", current);
    history.replaceState(null, "", url);
  }

  function init() {
    els = { filters: $("#workFilters"), grid: $("#workGrid"), empty: $("#workEmpty") };
    if (!els.grid) return;

    // Filtro inicial desde la URL (?cat=3d)
    const urlCat = new URLSearchParams(window.location.search).get("cat");
    if (urlCat && getService(urlCat)) current = urlCat;

    renderFilters();
    renderGrid();

    els.filters.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-filter]");
      if (chip) filter(chip.dataset.filter);
    });

    els.grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-project]");
      if (!card) return;
      e.preventDefault();
      bus.emit("project:open", { id: card.dataset.project, list: getVisible().map((p) => p.id) });
    });

    bus.on("filter:request", ({ category, scroll }) => filter(category, { scroll }));
  }

  return { init, filter, getCurrent: () => current };
})();
