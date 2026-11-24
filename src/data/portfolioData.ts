export interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
}

export interface ExperienceItem {
  id: string;
  featuredMilestone?: boolean;
  badge?: string;
  company: string;
  role: string;
  period: string;
  duration?: string;
  location: string;
  summary: string;
  achievements: string[];
  tags: string[];
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  detail: string;
  credentialId?: string;
  credentialUrl?: string;
}

export const PERSONAL_INFO = {
  heroWordmark: 'Alejo',
  fullName: 'Alejandro Castro Palacio',
  shortName: 'Alejandro Palacio',
  role: 'Ingeniero Multimedia',
  headlineRoles:
    'Front-End Developer · UI/UX · Diseño Gráfico · Animación 2D / Motion & 3D',
  location: 'Medellín, Antioquia, Colombia',
  workMode: 'Presencial en Medellín & Remoto',
  availability: 'Disponible para ofertas de empleo (Presencial / Remoto) y proyectos freelance',
  email: 'alejocastrop03@gmail.com',
  phoneDisplay: '+57 316 333 7509',
  whatsappUrl:
    'https://wa.me/573163337509?text=Hola%20Alejo%2C%20vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20conversar%20contigo.',
  linkedinUrl: 'https://www.linkedin.com/in/alejopalacio/',
  githubUrl: 'https://github.com/alejocpl',
  cvUrl: '/cv-alejandro-palacio.pdf',
  editorialHeadline:
    'Soy Ingeniero Multimedia especializado en Desarrollo Frontend, Diseño UI/UX, Diseño Gráfico, Animación y 3D.',
  editorialBody:
    'Uno el diseño visual con la ingeniería de software para construir interfaces, identidades de marca, piezas en movimiento y experiencias interactivas donde la estética y el rendimiento funcionan como una sola pieza.',
  contextHeadline:
    'Entender el arte, el movimiento y el código en un mismo flujo elimina la fricción entre la idea y el resultado final.',
  contextBody:
    'Formado en Ingeniería Multimedia en la Universidad de San Buenaventura en Medellín, integro programación web moderna, sistemas de interfaz en Figma, diseño gráfico e ilustración en Illustrator y Photoshop, motion graphics en After Effects y producción 3D con Autodesk Maya y Substance 3D.',
};

export const SPECIALISMS_DRUM: string[] = [
  'Desarrollo Front-End',
  'React & TypeScript',
  'Diseño UI/UX',
  'Figma',
  'Diseño Gráfico',
  'Ilustración',
  'Illustrator',
  'Photoshop',
  'Animación 2D',
  'Motion Graphics',
  'After Effects',
  'Premiere Pro',
  'Modelado 3D',
  'Rigging 2D & 3D',
  'Autodesk Maya',
  'Substance 3D',
  'Python & C#',
];

export const PILLARS: PillarItem[] = [
  {
    id: 'frontend',
    title: 'Desarrollo Front End',
    subtitle: 'Sitios interactivos, aplicaciones rápidas y código limpio',
    description:
      'Construcción de sitios web corporativos, landing pages animadas y aplicaciones multiplataforma con arquitectura modular, diseño responsivo y foco en conversión y rendimiento.',
    tags: ['React', 'TypeScript', 'JavaScript', 'HTML5 & CSS3', 'Animación Web', 'Electron'],
  },
  {
    id: 'ui-ux',
    title: 'Diseño UI/UX',
    subtitle: 'Interfaces claras basadas en prototipos y sistemas visuales',
    description:
      'Diseño de experiencias digitales intuitivas desde wireframes y arquitectura de información hasta prototipos interactivos y sistemas de diseño escalables en Figma.',
    tags: ['Figma', 'Wireframes', 'Prototipos', 'Design Systems', 'Apps & Web'],
  },
  {
    id: 'grafico-ilustracion',
    title: 'Diseño Gráfico & Ilustración',
    subtitle: 'Identidades visuales, campañas, packaging y arte vectorial',
    description:
      'Creación de marcas reconocibles, logotipos, piezas publicitarias, materiales POP, diseño editorial e ilustraciones con estilo propio para medios digitales e impresos.',
    tags: ['Illustrator', 'Photoshop', 'Branding', 'Ilustración', 'Packaging', 'Social Media'],
  },
  {
    id: 'animacion-motion',
    title: 'Animación 2D & Motion Graphics',
    subtitle: 'Historias y piezas en movimiento que capturan la atención',
    description:
      'Producción de spots publicitarios, animación de logotipos, explainers 2D, animación de personajes, edición audiovisual y UI motion para marcas y productos digitales.',
    tags: ['After Effects', 'Premiere Pro', 'Character Animator', 'Animación 2D', 'Logo Animation', 'Reels & Spots'],
  },
  {
    id: 'modelado-3d',
    title: 'Modelado & Rigging 3D',
    subtitle: 'Productos, personajes, texturizado PBR y controles de animación',
    description:
      'Modelado 3D de producto y personajes con topología limpia, texturizado hiperrealista, rigs articulados 2D/3D con controles intuitivos y renders publicitarios de alto impacto.',
    tags: ['Autodesk Maya', 'Substance 3D', 'Rigging 2D & 3D', 'Render de Producto', 'Unity VR/AR'],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'fla',
    company: 'Fábrica de Licores y Alcoholes de Antioquia (FLA)',
    role: 'Ingeniero de Diseño',
    period: 'Enero 2026 — Junio 2026',
    duration: '6 meses',
    location: 'Medellín, Antioquia, Colombia',
    summary:
      'Desarrollo integral de proyectos de diseño y comunicación visual multimarca, integrando UI/UX, branding, ilustración, animación 2D y modelado/renderizado 3D para medios digitales y físicos.',
    achievements: [
      'Creación y modelado Full Body para la colaboración oficial entre Aguardiente Antioqueño y Atlético Nacional, además del desarrollo visual de la edición mundialista 2026.',
      'Diseño de identidad visual, etiqueta, contraetiqueta y renders 3D hiperrealistas para Licor de Ron Bufón del Zacatín.',
      'Producción de animaciones de campaña (Maestros del Sabor Parrillero), ilustraciones para Ron Medellín, empaques, stickers y materiales POP.',
    ],
    tags: ['Modelado & Render 3D', 'Diseño Gráfico', 'Animación 2D', 'UI/UX & Branding'],
  },
  {
    id: '24kgold',
    company: '24K GOLD',
    role: 'Ingeniero de Diseño & Front-End',
    period: 'Febrero 2023 — Enero 2026',
    duration: '3 años',
    location: 'Medellín, Antioquia, Colombia',
    summary:
      'Trabajo transversal en todas las etapas creativas y técnicas de la marca: desde la identidad visual y piezas físicas hasta su ecosistema web y audiovisual.',
    achievements: [
      'Diseño UI/UX y desarrollo front-end con animaciones al scroll para el lanzamiento de su página web oficial.',
      'Creación de indumentaria y gorras para embajadores, catálogos promocionales, motion graphics y contenido audiovisual para puntos de venta y redes.',
    ],
    tags: ['Front-End Web', 'Diseño UI/UX', 'Branding', 'Motion Graphics'],
  },
  {
    id: 'atletico-nacional',
    featuredMilestone: true,
    badge: 'Proyecto Destacado · Ganador Oficial (+700 propuestas)',
    company: 'Club Atlético Nacional',
    role: 'Proyecto «Del Hincha Para El Hincha» — Ilustración & Diseño Oficial',
    period: '2023',
    location: 'Medellín, Antioquia, Colombia',
    summary:
      'Seleccionado como uno de los 11 ganadores oficiales entre más de 700 propuestas en la convocatoria del Club Atlético Nacional para el diseño de indumentaria oficial.',
    achievements: [
      'Conceptualización e ilustración vectorial en Illustrator de una serie de propuestas gráficas inspiradas en la identidad verdolaga.',
      'Diseños ganadores producidos oficialmente y comercializados al público en la Tienda Verde de Atlético Nacional.',
    ],
    tags: ['Illustrator', 'Ilustración', 'Diseño Textil & Branding', 'Producto Oficial'],
  },
];

export const EDUCATION = {
  institution: 'Universidad de San Buenaventura',
  degree: 'Ingeniería Multimedia (Bachelor of Multimedia Engineering)',
  location: 'Medellín, Colombia',
  period: 'Formación Profesional Universitaria',
};

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'aptis-b2',
    title: 'Aptis General — Certificación Internacional de Inglés B2 MCER',
    issuer: 'British Council · Universidad EAFIT',
    date: 'Octubre 2026',
    detail:
      'Puntaje global 167/200 — Writing Nivel C (46/50), Reading B2 (42/50), Speaking B2 (41/50), Listening B2 (38/50).',
    credentialId: 'Aptis~1133371',
    credentialUrl:
      'https://credentials.britishcouncil.org/09136270-d831-4938-82fc-667bb41981c7?key=72f53d04b426fd87ab13c9e0b010f00c47fda18e243f4a39a6940363500cec5e',
  },
  {
    id: 'anthropic-agent-skills',
    title: 'Introduction to Agent Skills',
    issuer: 'Anthropic',
    date: 'Certificado Oficial',
    detail:
      'Diseño y estructuración de capacidades modulares y flujos de trabajo especializados con agentes de IA.',
  },
  {
    id: 'anthropic-ai-fluency',
    title: 'AI Fluency for Creative Work',
    issuer: 'Anthropic · University College Cork · Ringling College of Art + Design',
    date: 'Certificado Oficial',
    detail:
      'Integración estratégica de herramientas generativas en procesos de dirección creativa, diseño y producción digital.',
  },
  {
    id: 'anthropic-claude-101',
    title: 'Claude 101',
    issuer: 'Anthropic',
    date: 'Certificado Oficial',
    detail:
      'Fundamentos de ingeniería de prompts, razonamiento estructurado y asistencia técnica avanzada.',
  },
  {
    id: 'xr-conferencia',
    title: 'III Conferencia Internacional sobre Tecnologías Inmersivas (VR, AR, MR & IA)',
    issuer: 'XR Academia · Universidad EAFIT',
    date: 'Noviembre 2023 · 24h',
    detail:
      'Participación activa en tecnologías inmersivas aplicadas a experiencias interactivas, educación y ciencia abierta.',
  },
  {
    id: 'xr-conceptos',
    title: 'Aplicaciones en Conceptos Básicos de Realidad Inmersiva',
    issuer: 'XR Academia · Universidad EAFIT',
    date: 'Noviembre 2023',
    detail:
      'Fundamentos prácticos de entornos virtuales tridimensionales, realidad aumentada y realidad mixta.',
  },
  {
    id: 'xr-videomapping',
    title: 'Aplicaciones Básicas en Video Mapping',
    issuer: 'XR Academia · Universidad EAFIT',
    date: 'Noviembre 2023',
    detail:
      'Proyección espacial, intervención lumínica y narrativa audiovisual sobre superficies físicas.',
  },
];

export const NAV_SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'especialidades', label: 'Especialidades' },
  { id: 'enfoque', label: 'Enfoque' },
  { id: 'pilares', label: 'Áreas de Dominio' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'certificaciones', label: 'Certificaciones' },
  { id: 'colaboracion', label: 'Colaboración' },
  { id: 'contacto', label: 'Contacto' },
];
