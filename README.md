# Portafolio — Alejandro Castro · Ingeniero Multimedia

Sitio estático (HTML + CSS + JS vanilla, sin build). Abre `index.html` con doble clic o con un servidor local (ej. extensión *Live Server* de VS Code).

## Estructura

```
index.html                 → Marcado de todas las secciones + sprite de iconos SVG
css/
  base.css                 → 🎨 Variables de diseño (colores, tipografía, espaciados), reset
  layout.css               → Contenedores, secciones, top bar, footer, fondo
  components.css           → Botones, chips, placeholders, tarjetas, campos
  dock.css                 → Menú flotante inferior
  modal.css                → Modal de detalle de proyecto
  sections.css             → Estilos por sección (hero, reel, servicios…)
  animations.css           → Keyframes y animación "reveal" al scroll
js/
  config.js                → ⚙️ Ajustes (palabras del hero, endpoint del formulario…)
  data/services.js         → 📋 Servicios (tarjetas, filtros, dock, chips del form)
  data/projects.js         → ⭐ Proyectos del portafolio (lo que más vas a editar)
  utils/helpers.js         → Utilidades + render de medios/placeholders + bus de eventos
  modules/*.js             → Un módulo por funcionalidad
  main.js                  → Inicializa todos los módulos
assets/
  img/  video/  docs/      → Tus archivos
```

## Estructura de la página (orden estratégico)

1. **Hero** — propuesta de valor + CTA + métricas
2. **Clientes** — prueba social inmediata *(añadido)*
3. **Showreel** — con capítulos por disciplina
4. **Servicios** — 9 tarjetas; clic = ver proyectos de ese servicio
5. **Trabajos** — filtrables, modal con caso de estudio (reto → solución → resultados)
6. **Proceso** — reduce la incertidumbre *(añadido)*
7. **¿Por qué Alejandro?** — diferenciales, stack, testimonios
8. **FAQ** — resuelve objeciones antes del formulario *(añadido)*
9. **CTA + Formulario** — segmentado por perfil (Marca / Agencia / Empresa / RRHH)

## Cómo reemplazar contenido

### Proyectos
Edita `js/data/projects.js`. Pon tus archivos en `assets/img/projects/<id>/` y rellena `src`:

```js
cover: { type: "image", src: "assets/img/projects/landing-nova/cover.jpg", alt: "…" }
cover: { type: "video", src: "assets/video/spot.mp4", poster: "assets/img/spot.jpg" }
```
Si `src` está vacío se muestra un placeholder automático.

### Showreel
En `index.html`, en `#showreelPlayer`:
- YouTube: `data-video-type="youtube" data-video-src="ID_DEL_VIDEO"`
- Vimeo:   `data-video-type="vimeo"   data-video-src="123456789"`
- MP4:     `data-video-type="mp4"     data-video-src="assets/video/reel.mp4"`

### Imágenes fijas (hero, foto, logos)
Busca en `index.html` los bloques `<div class="media-ph" …>` y reemplázalos por `<img>` o `<video>`.
Los logos: reemplaza `<li class="client-logo">LOGO 01</li>` por `<li class="client-logo"><img src="…" alt="Marca"></li>`.

### Formulario
En `js/config.js` → `contact.endpoint` pon tu URL de [Formspree](https://formspree.io) (u otro servicio). Sin endpoint, funciona en modo demo con opción de enviar por email.

### CV
Coloca tu PDF en `assets/docs/cv-alejandro-castro.pdf`.

## Enlaces útiles
- `index.html?cat=3d` → abre el portafolio filtrado por 3D (ideal para enviar a RRHH)
- `index.html#p-rig-facial` → abre directamente un proyecto
