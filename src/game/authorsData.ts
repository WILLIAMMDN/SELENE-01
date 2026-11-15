export type AuthorMember = {
  id: string
  name: string
  role: string
  specialty: string
  subsystems: string[]
  quote: string
  avatarColor: string
  photoPlaceholderText: string
}

export type ProjectCredits = {
  title: string
  subtitle: string
  tagline: string
  description: string
  year: string
  organization: string
  members: AuthorMember[]
  nasaAcknowledgements: string[]
  technologies: string[]
}

export const SELENE_AUTHORS_DATA: ProjectCredits = {
  title: 'SELENE—01',
  subtitle: 'SIMULADOR DE EXPLORACIÓN LUNAR & DISEÑO AEROESPACIAL',
  tagline: 'Una experiencia educativa interactiva creada con rigor técnico y arte ilustrado.',
  description:
    'SELENE-01 es un entorno de simulación espacial interactivo inspirado en las misiones Artemis de la NASA. Creado por un equipo multidisciplinario de seis integrantes, fusiona modelos físicos de ascenso y vuelo orbital, exploración de superficie, ingeniería de naves modulares y un lenguaje estético cel-shading de cuaderno de notas para acercar la ciencia aeroespacial a todos.',
  year: '2026',
  organization: 'EQUIPO DE DESARROLLO SELENE-01',
  members: [
    {
      id: 'member-1',
      name: 'William Medina',
      role: 'Dirección de Proyecto & Arquitectura Técnica',
      specialty: 'Ingeniería de Sistemas y Motores 3D',
      subsystems: [
        'Arquitectura global del cliente',
        'Motor de locomoción y cinemática',
        'Integración de naves y física de lanzamiento',
      ],
      quote:
        'Diseñar el futuro espacial empieza por hacerlo comprensible y emocionante en la pantalla.',
      avatarColor: '#ba6061',
      photoPlaceholderText: 'FOTO / AVATAR 01',
    },
    {
      id: 'member-2',
      name: 'Integrante 02',
      role: 'Modelado 3D & Dirección de Arte Cel-Shading',
      specialty: 'Escultura Digital y Shaders NPR',
      subsystems: [
        'Módulos arquitectónicos de Artemisa',
        'Plataforma y lanzador LC-01',
        'Paleta visual y entintado de bordes',
      ],
      quote:
        'Cada silueta y textura en papel busca transmitir la calidez de un cuaderno de bocetos de exploración.',
      avatarColor: '#56878b',
      photoPlaceholderText: 'FOTO / AVATAR 02',
    },
    {
      id: 'member-3',
      name: 'Integrante 03',
      role: 'Programación Gráfica & Three.js',
      specialty: 'Renderizado en Tiempo Real y Optimización',
      subsystems: [
        'Cinemática multicámara de despegue',
        'Sistemas de iluminación y cielo dinámico',
        'Gestión de memoria y adaptabilidad 60 FPS',
      ],
      quote:
        'El espacio profundo cobra vida cuando la precisión técnica se sincroniza con el encuadre cinematográfico.',
      avatarColor: '#eedc82',
      photoPlaceholderText: 'FOTO / AVATAR 03',
    },
    {
      id: 'member-4',
      name: 'Integrante 04',
      role: 'Diseño de Misión & Narrativa Científica',
      specialty: 'Datos de NASA y Curaduría Aeroespacial',
      subsystems: [
        'Campaña de investigación con Dra. Vega',
        'Validación de masa y trayectorias lunares',
        'Diálogos interactivos y bitácora de viaje',
      ],
      quote:
        'Cada objetivo del juego refleja preguntas científicas reales que la humanidad se hace sobre el polo sur lunar.',
      avatarColor: '#7ca38b',
      photoPlaceholderText: 'FOTO / AVATAR 04',
    },
    {
      id: 'member-5',
      name: 'Integrante 05',
      role: 'Vehículos & Simulación de Superficie',
      specialty: 'Física de Terreno y Robótica',
      subsystems: [
        'Controlador del Rover Lunar y suspensión',
        'Buggy terrestre de alta velocidad',
        'Autómata TARS y seguimiento inteligente',
      ],
      quote:
        'Conducir sobre el regolito lunar requiere respetar tanto la gravedad como la tracción en el terreno.',
      avatarColor: '#be775d',
      photoPlaceholderText: 'FOTO / AVATAR 05',
    },
    {
      id: 'member-6',
      name: 'Integrante 06',
      role: 'Interfaz de Usuario, Audio & UX Interactiva',
      specialty: 'Diseño de Experiencia y Accesibilidad',
      subsystems: [
        'Tablero de instrumentos del buggy',
        'Cuaderno de bitácora y cartografía',
        'Guía de navegación por chevrons y accesibilidad',
      ],
      quote:
        'La mejor interfaz espacial es la que parece dibujada a mano por la propia tripulación.',
      avatarColor: '#4f888c',
      photoPlaceholderText: 'FOTO / AVATAR 06',
    },
  ],
  nasaAcknowledgements: [
    'Programa Artemis de la NASA · Arquitectura de exploración del polo sur lunar',
    'NASA Glenn Research Center · Simulación y propiedades del regolito lunar',
    'NASA Scientific and Technical Information Program (STI) · Datos orbitales y balance de masas',
    'USGS Astrogeology Science Center · Cartografía topográfica de cráteres polares',
  ],
  technologies: [
    'React 19 & TypeScript',
    'Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)',
    'Estilo de sombreado NPR Anime Cel-shading personalizado',
    'Vite Build Engine & Audio Web API',
  ],
}
