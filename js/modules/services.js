/* =================================================================
   MODULES / SERVICES.JS
   Renderiza las tarjetas de servicios desde AC.services.
   Al hacer clic en una tarjeta → filtra el portafolio por ese
   servicio y hace scroll a #trabajos (vía bus "filter:request").
   ================================================================= */
window.AC = window.AC || {};

AC.servicesSection = (function () {
  const { $, escapeHTML, icon, countByCategory, bus } = AC.utils;

  function cardTemplate(service, index) {
    const count = countByCategory(service.id);
    return `
      <a href="#trabajos" class="service-card reveal" style="--hue:${service.hue}" data-service="${service.id}">
        <span class="service-card__num">${String(index + 1).padStart(2, "0")}</span>
        <span class="service-card__icon">${icon(service.icon)}</span>
        <h3>${escapeHTML(service.title)}</h3>
        <p>${escapeHTML(service.desc)}</p>
        <ul class="service-card__tags">${service.tags.map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>
        <span class="service-card__link">Ver ${count} proyecto${count === 1 ? "" : "s"} ${icon("arrow")}</span>
      </a>`;
  }

  function init() {
    const grid = $("#servicesGrid");
    if (!grid) return;

    grid.innerHTML = AC.services.map(cardTemplate).join("");
    AC.reveal.observe(Array.from(grid.children));

    // Clic → filtrar trabajos
    grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-service]");
      if (!card) return;
      e.preventDefault();
      bus.emit("filter:request", { category: card.dataset.service, scroll: true });
    });

    // Brillo que sigue al cursor
    grid.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".service-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  return { init };
})();
