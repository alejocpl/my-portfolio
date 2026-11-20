/* =================================================================
   MAIN.JS
   Punto de entrada. Inicializa los módulos en orden.
   Para agregar un módulo nuevo:
     1. Crea js/modules/miModulo.js con AC.miModulo = { init() {...} }
     2. Agrega su <script> en index.html antes de main.js
     3. Añádelo a la lista MODULES de abajo
   ================================================================= */
(function () {
  document.documentElement.classList.remove("no-js");

  const MODULES = [
    "theme",           // aplica el tema guardado antes del render
    "loader",          // pantalla de carga inicial
    "cursor",          // smooth cursor follower
    "reveal",          // primero: los módulos que inyectan HTML llaman a AC.reveal.observe()
    "servicesSection",
    "portfolio",
    "hero",
    "heroCharacter",   // criatura 3D interactiva en .hero__visual
    "projectModal",
    "dock",
    "contactForm",
  ];

  function boot() {
    MODULES.forEach((name) => {
      try {
        AC[name]?.init();
      } catch (err) {
        // Un módulo con error no rompe al resto
        console.error(`[AC] Error iniciando "${name}":`, err);
      }
    });

    // Año dinámico en el footer
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
