/* =================================================================
   MODULES / SHOWREEL.JS
   Reproductor del showreel. Lee la fuente desde los atributos del
   contenedor #showreelPlayer:
     data-video-type = "mp4" | "youtube" | "vimeo"
     data-video-src  = ruta .mp4 o ID del video
   El video sólo se carga al hacer clic (mejor rendimiento).
   ================================================================= */
window.AC = window.AC || {};

AC.showreel = (function () {
  const { $ } = AC.utils;

  function buildPlayer(type, src) {
    switch (type) {
      case "youtube":
        return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(src)}?autoplay=1&rel=0&modestbranding=1" title="Showreel" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      case "vimeo":
        return `<iframe src="https://player.vimeo.com/video/${encodeURIComponent(src)}?autoplay=1&title=0&byline=0" title="Showreel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      default:
        return `<video src="${AC.utils.escapeHTML(src)}" controls autoplay playsinline></video>`;
    }
  }

  function init() {
    const player = $("#showreelPlayer");
    if (!player) return;
    const btn = $(".showreel__play", player);

    btn.addEventListener("click", () => {
      const { videoType, videoSrc } = player.dataset;

      // Sin video configurado → aviso amigable (modo placeholder)
      if (!videoSrc) {
        btn.querySelector(".showreel__play-label").textContent = "Agrega tu reel en data-video-src";
        return;
      }

      player.querySelector(".media-ph")?.remove();
      player.insertAdjacentHTML("afterbegin", buildPlayer(videoType, videoSrc));
      player.classList.add("is-playing");
    });
  }

  return { init };
})();
