/* =================================================================
   UTILS / HELPERS.JS
   Funciones utilitarias compartidas por todos los módulos.
   ================================================================= */
window.AC = window.AC || {};

AC.utils = (function () {
  /** Selectores cortos */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /** Escapa texto para insertarlo de forma segura en HTML */
  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Devuelve el markup de un icono del sprite */
  const icon = (name, cls = "") => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  /** Busca un servicio por id */
  const getService = (id) => AC.services.find((s) => s.id === id);

  /** ¿El proyecto pertenece a la categoría? (incluye extraCategories) */
  const projectInCategory = (project, cat) =>
    cat === "all" || project.category === cat || (project.extraCategories || []).includes(cat);

  /** Cuenta proyectos por categoría */
  const countByCategory = (cat) => AC.projects.filter((p) => projectInCategory(p, cat)).length;

  /**
   * Renderiza un medio (imagen / video) o un placeholder si no hay src.
   * @param {Object} media  { type, src, poster, alt }
   * @param {Object} opts   { hue, label, ratio, controls, autoplay }
   * @returns {string} HTML
   */
  const renderMedia = (media = {}, opts = {}) => {
    const { type = "image", src = "", poster = "", alt = "" } = media;
    const { hue = 260, label, ratio = "", controls = false, autoplay = true } = opts;

    // --- Placeholder ---
    if (!src) {
      const phLabel = label || (type === "video" ? "Reemplazar · Video" : "Reemplazar · Imagen");
      const phIcon = type === "video" ? "video" : "image";
      return `<div class="media-ph ${ratio}" style="--ph-hue:${hue}" data-label="${escapeHTML(phLabel)}" role="img" aria-label="${escapeHTML(alt)}">${icon(phIcon)}</div>`;
    }

    // --- Video ---
    if (type === "video") {
      const attrs = controls ? "controls playsinline" : `${autoplay ? "autoplay" : ""} muted loop playsinline`;
      return `<video class="media" src="${escapeHTML(src)}" ${poster ? `poster="${escapeHTML(poster)}"` : ""} ${attrs} preload="metadata" aria-label="${escapeHTML(alt)}"></video>`;
    }

    // --- Imagen ---
    const isSvg = /\.svg(\?|$)/i.test(src);
    const fitClass = media.fit === "contain" || (media.fit !== "cover" && isSvg) ? "media--contain" : "";
    return `<img class="media ${fitClass}" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async" />`;
  };

  /** Mini bus de eventos para comunicar módulos sin acoplarlos */
  const bus = (() => {
    const handlers = {};
    return {
      on: (evt, fn) => ((handlers[evt] = handlers[evt] || []).push(fn)),
      emit: (evt, data) => (handlers[evt] || []).forEach((fn) => fn(data)),
    };
  })();

  /** Scroll suave a un elemento por id */
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return { $, $$, escapeHTML, icon, getService, projectInCategory, countByCategory, renderMedia, bus, scrollToId, prefersReducedMotion };
})();
