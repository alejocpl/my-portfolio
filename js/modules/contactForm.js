/* =================================================================
   MODULES / CONTACTFORM.JS
   Formulario de contacto:
     - Genera chips de servicios desde AC.services
     - Adapta textos según el perfil (Marca / Agencia / Empresa / RRHH)
     - Validación en cliente con mensajes en español
     - Envío vía fetch a config.contact.endpoint (Formspree, etc.)
       o modo demo + mailto si no hay endpoint.
   Escucha: bus "contact:prefill" { service }
   ================================================================= */
window.AC = window.AC || {};

AC.contactForm = (function () {
  const { $, $$, escapeHTML, bus } = AC.utils;

  /* Textos adaptados por perfil de usuario */
  const PROFILE_COPY = {
    default: { message: "Cuéntame sobre el proyecto, objetivos y plazos…", budget: "Presupuesto estimado" },
    RRHH: { message: "Cuéntame sobre la vacante, el equipo y la modalidad (remoto / híbrido / presencial)…", budget: "Rango salarial / tipo de contrato" },
  };

  const MESSAGES = {
    valueMissing: "Este campo es obligatorio.",
    typeMismatch: "Ingresa un email válido.",
    tooShort: (min) => `Debe tener al menos ${min} caracteres.`,
  };

  let form, status, submitBtn;

  /* ---------- Chips de servicios ---------- */
  function renderChips() {
    $("#serviceChips").innerHTML = AC.services
      .map((s) => `<label class="chip"><input type="checkbox" name="servicios" value="${escapeHTML(s.title)}" data-id="${s.id}" />${escapeHTML(s.short)}</label>`)
      .join("");
  }

  /* ---------- Perfil ---------- */
  function applyProfile(value) {
    const copy = PROFILE_COPY[value] || PROFILE_COPY.default;
    $("#f-message").placeholder = copy.message;
    $("[data-label-budget]").textContent = copy.budget;
  }

  /* ---------- Validación ---------- */
  function validateField(input) {
    const field = input.closest(".field");
    const errorEl = field?.querySelector(".field__error");
    let msg = "";
    const v = input.validity;
    if (v.valueMissing) msg = MESSAGES.valueMissing;
    else if (v.typeMismatch) msg = MESSAGES.typeMismatch;
    else if (v.tooShort) msg = MESSAGES.tooShort(input.minLength);

    field?.classList.toggle("is-invalid", !!msg);
    input.setAttribute("aria-invalid", String(!!msg));
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  }

  function validateAll() {
    const inputs = $$("[required]", form);
    const results = inputs.map(validateField);
    const firstInvalid = inputs[results.indexOf(false)];
    firstInvalid?.focus();
    return !firstInvalid;
  }

  /* ---------- Estado UI ---------- */
  function setStatus(msg, type = "") {
    status.className = `contact-form__status ${type ? `is-${type}` : ""}`;
    status.innerHTML = msg;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.querySelector(".btn__text").textContent = loading ? "Enviando…" : "Enviar mensaje";
  }

  /* ---------- Envío ---------- */
  function buildMailto(data) {
    const subject = `Contacto web (${data.get("perfil")}) — ${data.get("nombre")}`;
    const bodyText = [
      `Nombre: ${data.get("nombre")}`,
      `Email: ${data.get("email")}`,
      `Empresa: ${data.get("empresa") || "-"}`,
      `Perfil: ${data.get("perfil")}`,
      `Servicios: ${data.getAll("servicios").join(", ") || "-"}`,
      `Presupuesto: ${data.get("presupuesto") || "-"}`,
      "",
      data.get("mensaje"),
    ].join("\n");
    return `mailto:${AC.config.contact.fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    if (!validateAll()) return setStatus("Revisa los campos marcados.", "error");

    const data = new FormData(form);
    if (data.get("_gotcha")) return; // bot detectado

    const { endpoint } = AC.config.contact;
    setLoading(true);

    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus("¡Gracias! Recibí tu mensaje y te responderé en menos de 24 h.", "success");
      } else {
        // Modo demo: sin endpoint configurado
        await new Promise((r) => setTimeout(r, 800));
        setStatus(`¡Listo! (modo demo) <a href="${buildMailto(data)}" style="text-decoration:underline">Enviar también por email →</a>`, "success");
        console.info("[contactForm] Configura AC.config.contact.endpoint para recibir mensajes reales.", Object.fromEntries(data));
      }
      form.reset();
      applyProfile("default");
    } catch (err) {
      console.error(err);
      setStatus(`No se pudo enviar. <a href="${buildMailto(data)}" style="text-decoration:underline">Escríbeme por email</a>.`, "error");
    } finally {
      setLoading(false);
    }
  }

  function init() {
    form = $("#contactForm");
    if (!form) return;
    status = $("#formStatus");
    submitBtn = form.querySelector('[type="submit"]');

    renderChips();

    form.addEventListener("submit", onSubmit);

    // Validar al salir del campo y re-validar mientras escribe si ya tenía error
    form.addEventListener("focusout", (e) => { if (e.target.matches("[required]")) validateField(e.target); });
    form.addEventListener("input", (e) => {
      if (e.target.closest(".field.is-invalid")) validateField(e.target);
    });

    form.addEventListener("change", (e) => {
      if (e.target.name === "perfil") applyProfile(e.target.value);
    });

    // Precarga desde un proyecto ("Quiero algo así")
    bus.on("contact:prefill", ({ service }) => {
      const cb = $(`#serviceChips input[data-id="${service}"]`);
      if (cb) cb.checked = true;
      setTimeout(() => $("#f-name").focus({ preventScroll: true }), 600);
    });
  }

  return { init };
})();
