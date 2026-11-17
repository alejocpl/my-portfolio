/* =================================================================
   MODULES / HERO.JS
   - Rotación de palabras en el título (config.hero.rotatingWords)
   - Contadores animados de métricas ([data-count])
   ================================================================= */
window.AC = window.AC || {};

AC.hero = (function () {
  const { $, $$, prefersReducedMotion } = AC.utils;

  /* ---------- Palabras rotativas ---------- */
  function initRotator() {
    const el = $("[data-rotator]");
    const words = AC.config.hero.rotatingWords;
    if (!el || !words?.length || prefersReducedMotion()) return;

    let i = 0;
    setInterval(() => {
      el.classList.remove("is-in");
      el.classList.add("is-out");
      el.addEventListener(
        "animationend",
        () => {
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.classList.remove("is-out");
          el.classList.add("is-in");
        },
        { once: true }
      );
    }, AC.config.hero.rotateEvery);
  }

  /* ---------- Contadores ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReducedMotion()) return (el.textContent = target);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = $$("[data-count]");
    if (!("IntersectionObserver" in window)) return counters.forEach(animateCount);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  }

  function init() {
    initRotator();
    initCounters();
  }

  return { init };
})();
