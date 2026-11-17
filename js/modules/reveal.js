/* =================================================================
   MODULES / REVEAL.JS
   Anima la aparición de elementos con clase .reveal al entrar en
   pantalla (IntersectionObserver). Aplica un pequeño escalonado
   entre hermanos para un efecto más fluido.
   API: AC.reveal.observe(elementos) → para contenido inyectado luego.
   ================================================================= */
window.AC = window.AC || {};

AC.reveal = (function () {
  let observer;

  function init() {
    if (!("IntersectionObserver" in window) || AC.utils.prefersReducedMotion()) {
      AC.utils.$$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observe(AC.utils.$$(".reveal"));
  }

  /** Observa nuevos elementos y aplica delay escalonado por grupo */
  function observe(elements) {
    elements.forEach((el) => {
      const siblings = Array.from(el.parentElement?.children || []).filter((c) => c.classList.contains("reveal"));
      const index = siblings.indexOf(el);
      el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 0.08}s`);
      if (observer) observer.observe(el);
      else el.classList.add("is-visible");
    });
  }

  return { init, observe };
})();
