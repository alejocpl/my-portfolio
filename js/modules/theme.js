/* =================================================================
   MODULES / THEME.JS
   Alterna entre Modo Oscuro (Night Mode: #151821) y Modo Claro
   (Light Mode: #FFFFFF) manteniendo #155DF2 como acento.
   Persiste la preferencia en localStorage ("ac-theme").
   ================================================================= */
window.AC = window.AC || {};

AC.theme = (function () {
  const { $ } = AC.utils;
  const STORAGE_KEY = "ac-theme";

  function getCurrent() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function apply(theme) {
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");

    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? "#ffffff" : "#151821");

    const btn = $("#themeToggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "light" ? "Activar modo oscuro" : "Activar modo claro");
      btn.setAttribute("title", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }

  function toggle() {
    apply(getCurrent() === "light" ? "dark" : "light");
  }

  function init() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    apply(saved === "light" ? "light" : "dark");

    const btn = $("#themeToggle");
    if (btn) btn.addEventListener("click", toggle);
  }

  return { init, toggle, apply, getCurrent };
})();
