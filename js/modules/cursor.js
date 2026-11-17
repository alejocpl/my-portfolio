/* =================================================================
   MODULES / CURSOR.JS
   Smooth cursor follower (punto directo + anillo con interpolación
   suave LERP a 60fps). Reacciona a enlaces, botones y tarjetas.
   Se desactiva automáticamente en pantallas táctiles.
   ================================================================= */
window.AC = window.AC || {};

AC.cursor = (function () {
  const { $, prefersReducedMotion } = AC.utils;

  const INTERACTIVE_SEL = "a, button, summary, label, input, textarea, select, [data-project], [data-service]";

  function init() {
    if (
      prefersReducedMotion() ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches
    ) {
      return;
    }

    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let visible = false;
    let rafId = null;

    const render = () => {
      // Interpolación lineal (LERP) para el efecto suave del anillo
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;

      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!visible) {
          visible = true;
          ringX = mouseX;
          ringY = mouseY;
          dot.classList.add("is-visible");
          ring.classList.add("is-visible");
        }

        if (!rafId) rafId = requestAnimationFrame(render);
      },
      { passive: true }
    );

    document.addEventListener("pointerover", (e) => {
      const isInteractive = !!e.target.closest(INTERACTIVE_SEL);
      dot.classList.toggle("is-hover", isInteractive);
      ring.classList.toggle("is-hover", isInteractive);
    });

    window.addEventListener("pointerdown", () => ring.classList.add("is-down"));
    window.addEventListener("pointerup", () => ring.classList.remove("is-down"));

    document.addEventListener("mouseleave", () => {
      visible = false;
      dot.classList.remove("is-visible");
      ring.classList.remove("is-visible");
    });
  }

  return { init };
})();
