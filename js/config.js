/* =================================================================
   CONFIG.JS
   Configuración global del sitio. Edita aquí sin tocar la lógica.
   Todo cuelga del namespace window.AC para evitar variables globales
   sueltas y permitir abrir el sitio sin servidor (file://).
   ================================================================= */
window.AC = window.AC || {};

AC.config = {
  hero: {
    /* Palabras que rotan en el título del hero */
    rotatingWords: [
      "se vea increíble",
      "cobre vida",
      "se mueva",
      "salte al 3D",
      "trabaje sola con IA",
    ],
    rotateEvery: 2600, // ms
  },

  dock: {
    /* Mostrar el dock sólo después de hacer scroll X px (0 = siempre visible) */
    showAfter: 0,
  },

  portfolio: {
    /* Cantidad de proyectos visibles al inicio en la vista "Todos" (0 = todos) */
    initialLimit: 0,
  },

  contact: {
    /*
      Endpoint para enviar el formulario. Opciones gratuitas sin backend:
        - Formspree:  "https://formspree.io/f/TU_ID"
        - Getform / Basin / FormSubmit, etc.
      Si se deja vacío, el formulario simula el envío (modo demo) y
      además ofrece abrir el cliente de correo con los datos (mailto).
    */
    endpoint: "",
    fallbackEmail: "alejocastrop03@gmail.com",
  },
};
