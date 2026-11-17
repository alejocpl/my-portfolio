/* =================================================================
   MODULES / LOADER.JS
   Pantalla de carga inicial con porcentaje y barra de progreso.
   Se desvanece automáticamente cuando la página está lista.
   ================================================================= */
window.AC = window.AC || {};

AC.loader = (function () {
  const { $, prefersReducedMotion } = AC.utils;

  function init() {
    const loader = $("#pageLoader");
    if (!loader) return;

    if (prefersReducedMotion()) {
      loader.classList.add("is-done");
      return;
    }

    const fill = $("#loaderFill", loader);
    const pct = $("#loaderPct", loader);
    let progress = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      progress = 100;
      if (fill) fill.style.width = "100%";
      if (pct) pct.textContent = "100%";
      setTimeout(() => {
        loader.classList.add("is-done");
      }, 220);
    };

    const timer = setInterval(() => {
      if (finished) return clearInterval(timer);
      progress = Math.min(progress + Math.floor(Math.random() * 18) + 8, 92);
      if (fill) fill.style.width = `${progress}%`;
      if (pct) pct.textContent = `${progress}%`;
    }, 90);

    if (document.readyState === "complete") {
      setTimeout(() => {
        clearInterval(timer);
        finish();
      }, 450);
    } else {
      window.addEventListener(
        "load",
        () => {
          clearInterval(timer);
          finish();
        },
        { once: true }
      );
      // Fallback de seguridad por si algún recurso externo tarda demasiado
      setTimeout(() => {
        clearInterval(timer);
        finish();
      }, 2200);
    }
  }

  return { init };
})();
