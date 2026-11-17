/* =================================================================
   MODULES / PROJECTMODAL.JS
   Modal de detalle de proyecto usando <dialog> nativo
   (accesible: foco atrapado, cierre con Esc).
     - Navegación anterior / siguiente dentro del filtro activo
     - Deep link: index.html#p-<id> abre el proyecto directamente
     - Botón "Quiero algo así" → precarga el formulario de contacto
   Escucha: bus "project:open" { id, list }
   Emite:   bus "contact:prefill" { service }
   ================================================================= */
window.AC = window.AC || {};

AC.projectModal = (function () {
  const { $, escapeHTML, icon, getService, renderMedia, bus, scrollToId } = AC.utils;

  let dialog, body;
  let list = [];   // ids navegables
  let index = 0;

  /* ---------- Template ---------- */
  function template(p) {
    const s = getService(p.category) || {};
    const cats = [p.category, ...(p.extraCategories || [])]
      .map((id) => getService(id)?.short).filter(Boolean).join(" · ");

    const results = (p.results || []).map((r) =>
      `<div class="pm__result"><strong class="gradient-text">${escapeHTML(r.value)}</strong><span>${escapeHTML(r.label)}</span></div>`).join("");

    const gallery = (p.gallery || []).map((g, i) =>
      `<div class="${g.wide ? "is-wide" : ""}">${renderMedia(g, { hue: s.hue + i * 25, controls: true, label: `Galería ${i + 1} · ${g.type === "video" ? "Video" : "Imagen"}` })}</div>`).join("");

    return `
      <div class="pm__hero">${renderMedia(p.cover, { hue: s.hue, controls: p.cover?.type === "video", label: "Imagen / video principal" })}</div>
      <div class="pm__content">
        <header class="pm__header">
          <span class="pm__cat">${escapeHTML(cats)}</span>
          <h2 class="pm__title" id="pmTitle">${escapeHTML(p.title)}</h2>
          <p class="pm__summary">${escapeHTML(p.summary)}</p>
        </header>

        <dl class="pm__facts">
          <div><dt>Cliente</dt><dd>${escapeHTML(p.client)}</dd></div>
          <div><dt>Año</dt><dd>${p.year}</dd></div>
          <div><dt>Rol</dt><dd>${escapeHTML(p.role || "—")}</dd></div>
          <div><dt>Duración</dt><dd>${escapeHTML(p.duration || "—")}</dd></div>
        </dl>

        <div class="pm__cols">
          <div class="pm__block"><h3>El reto</h3><p>${escapeHTML(p.challenge || "")}</p></div>
          <div class="pm__block"><h3>La solución</h3><p>${escapeHTML(p.solution || "")}</p></div>
          <div class="pm__block"><h3>Herramientas</h3><ul class="pm__tools">${(p.tools || []).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul></div>
        </div>

        ${results ? `<div class="pm__results">${results}</div>` : ""}
        ${gallery ? `<div class="pm__gallery">${gallery}</div>` : ""}

        <footer class="pm__footer">
          <div class="pm__nav">
            <button type="button" class="btn btn--ghost btn--sm" data-nav="-1" ${list.length < 2 ? "disabled" : ""}>← Anterior</button>
            <button type="button" class="btn btn--ghost btn--sm" data-nav="1" ${list.length < 2 ? "disabled" : ""}>Siguiente →</button>
          </div>
          <div class="pm__nav">
            ${p.link ? `<a class="btn btn--ghost btn--sm" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">Ver en vivo ${icon("arrow-up-right")}</a>` : ""}
            <button type="button" class="btn btn--primary btn--sm" data-contact="${p.category}">Quiero algo así ${icon("arrow")}</button>
          </div>
        </footer>
      </div>`;
  }

  /* ---------- Acciones ---------- */
  function render() {
    const project = AC.projects.find((p) => p.id === list[index]);
    if (!project) return;
    body.innerHTML = template(project);
    dialog.querySelector(".project-modal__inner").scrollTop = 0;
    history.replaceState(null, "", `${location.pathname}${location.search}#p-${project.id}`);
  }

  function open({ id, list: ids }) {
    list = ids?.length ? ids : AC.projects.map((p) => p.id);
    index = Math.max(0, list.indexOf(id));
    render();
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = "hidden";
  }

  function close() {
    document.documentElement.style.overflow = ""; // liberar scroll de inmediato
    if (dialog.open) dialog.close();
  }

  function onClosed() {
    document.documentElement.style.overflow = "";
    body.querySelectorAll("video").forEach((v) => v.pause());
    history.replaceState(null, "", `${location.pathname}${location.search}#trabajos`);
  }

  function navigate(step) {
    index = (index + step + list.length) % list.length;
    render();
  }

  function init() {
    dialog = $("#projectModal");
    body = $("#projectModalBody");
    if (!dialog) return;

    bus.on("project:open", open);

    dialog.addEventListener("close", onClosed);

    dialog.addEventListener("click", (e) => {
      // Clic en el backdrop (fuera del contenido)
      if (e.target === dialog) return close();
      if (e.target.closest("[data-close]")) return close();

      const nav = e.target.closest("[data-nav]");
      if (nav) return navigate(parseInt(nav.dataset.nav, 10));

      const cta = e.target.closest("[data-contact]");
      if (cta) {
        close();
        bus.emit("contact:prefill", { service: cta.dataset.contact });
        scrollToId("contacto");
      }
    });

    // Flechas del teclado para navegar
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    });

    // Deep link: #p-<id>
    const match = location.hash.match(/^#p-(.+)$/);
    if (match && AC.projects.some((p) => p.id === match[1])) {
      open({ id: match[1], list: AC.projects.map((p) => p.id) });
    }
  }

  return { init, open, close };
})();
