/* =================================================================
   DATA / SERVICES.JS
   Catálogo de servicios. Se usa para:
     - Tarjetas de la sección Servicios
     - Filtros de la sección Trabajos
     - Submenú de categorías del dock
     - Chips del formulario de contacto
   Campos:
     id    → clave única (los proyectos la referencian en "category")
     title → nombre visible
     short → nombre corto para chips/filtros
     icon  → id de símbolo SVG en el sprite de index.html (sin "i-")
     hue   → tono de color (0-360) para acentos de la tarjeta
     desc  → descripción orientada a beneficio
     tags  → entregables típicos
   Para agregar un servicio: añade un objeto y listo.
   ================================================================= */
window.AC = window.AC || {};

AC.services = [
  {
    id: "web",
    title: "Desarrollo Web Front-end",
    short: "Front-end",
    icon: "code",
    hue: 190,
    desc: "Sitios y landing pages rápidos, accesibles y animados que convierten visitas en clientes.",
    tags: ["Landing pages", "Sitios corporativos", "Animación web", "Responsive"],
  },
  {
    id: "uiux",
    title: "Diseño UI/UX",
    short: "UI/UX",
    icon: "layout",
    hue: 260,
    desc: "Interfaces claras y atractivas basadas en investigación, prototipos y pruebas con usuarios.",
    tags: ["Wireframes", "Prototipos Figma", "Design systems", "Apps"],
  },
  {
    id: "illustration",
    title: "Ilustración",
    short: "Ilustración",
    icon: "pen",
    hue: 330,
    desc: "Ilustraciones con estilo propio para campañas, editorial, packaging y redes sociales.",
    tags: ["Editorial", "Personajes", "Packaging", "Key visuals"],
  },
  {
    id: "anim2d",
    title: "Animación 2D",
    short: "Animación 2D",
    icon: "film",
    hue: 20,
    desc: "Historias animadas que explican, emocionan y hacen memorable tu mensaje.",
    tags: ["Explainers", "Frame by frame", "Cut-out", "Personajes"],
  },
  {
    id: "3d",
    title: "Modelado 3D",
    short: "Modelado 3D",
    icon: "cube",
    hue: 160,
    desc: "Personajes, productos y escenarios 3D listos para render, animación o tiempo real.",
    tags: ["Personajes", "Producto", "Escenarios", "Texturizado"],
  },
  {
    id: "rigging",
    title: "Rigging",
    short: "Rigging",
    icon: "bone",
    hue: 45,
    desc: "Rigs robustos y fáciles de animar para personajes 2D y 3D, con controles intuitivos.",
    tags: ["Rigs 3D", "Rigs 2D", "Facial", "Controles custom"],
  },
  {
    id: "graphic",
    title: "Diseño Gráfico",
    short: "Diseño Gráfico",
    icon: "palette",
    hue: 300,
    desc: "Identidades visuales y piezas gráficas coherentes que hacen reconocible a tu marca.",
    tags: ["Branding", "Logotipos", "Social media", "Print"],
  },
  {
    id: "motion",
    title: "Motion Graphics",
    short: "Motion",
    icon: "sparkles",
    hue: 220,
    desc: "Piezas en movimiento para redes, publicidad y producto que capturan la atención en segundos.",
    tags: ["Spots", "Logo animation", "Reels", "UI motion"],
  },
  {
    id: "ai",
    title: "Automatizaciones con IA",
    short: "IA",
    icon: "bot",
    hue: 140,
    desc: "Flujos con IA que ahorran horas: generación de contenido, chatbots e integraciones.",
    tags: ["Chatbots", "n8n / Make", "Pipelines creativos", "APIs de IA"],
  },
];
