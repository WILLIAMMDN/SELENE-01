export type AuthorMember = {
  id: string
  name: string
  shortName: string
  role: string
  photo: string
  avatarColor: string
}

export type ProjectCredits = {
  title: string
  subtitle: string
  tagline: string
  description: string
  year: string
  members: AuthorMember[]
  scienceSources: { label: string; url: string }[]
}

// Names, roles, and portrait placement follow slide 7 of the team's supplied pitch.
export const SELENE_AUTHORS_DATA: ProjectCredits = {
  title: 'SELENE—01',
  subtitle: 'EQUIPO CREADOR · 6 INTEGRANTES',
  tagline: 'Diseño de misiones espaciales, exploración 3D y aprendizaje interactivo.',
  description:
    'Un equipo de seis integrantes de Ingeniería de Sistemas desarrolla SELENE-01 como prototipo educativo de diseño de misiones. Las responsabilidades que se muestran aquí corresponden a la presentación del equipo.',
  year: '2026',
  members: [
    {
      id: 'member-1',
      name: 'Max William Medina Castro',
      shortName: 'Max Medina',
      role: 'Dirección del proyecto e integración del mundo',
      photo: 'images/team/max-william-medina-castro.jpg',
      avatarColor: '#ba6061',
    },
    {
      id: 'member-2',
      name: 'Hiyo Juarez Neill Angelo',
      shortName: 'Hiyo Juarez',
      role: 'Entorno 3D y diseño de niveles',
      photo: 'images/team/hiyo-juarez-neill-angelo.jpeg',
      avatarColor: '#56878b',
    },
    {
      id: 'member-3',
      name: 'David Joel Cornejo Palomino',
      shortName: 'David Cornejo',
      role: 'Sistemas de juego y flujo de misión',
      photo: 'images/team/david-joel-cornejo-palomino.jpeg',
      avatarColor: '#c7a958',
    },
    {
      id: 'member-4',
      name: 'Lorenz Henry Arce Muje',
      shortName: 'Lorenz Arce',
      role: 'Simulación científica y validación',
      photo: 'images/team/lorenz-henry-arce-muje.jpeg',
      avatarColor: '#7ca38b',
    },
    {
      id: 'member-5',
      name: 'Curo Medina Luis Miguel',
      shortName: 'Curo Medina',
      role: 'Interfaz, narrativa y TARS',
      photo: 'images/team/curo-medina-luis-miguel.jpeg',
      avatarColor: '#be775d',
    },
    {
      id: 'member-6',
      name: 'Damiano Cana Pablo Rodrigo',
      shortName: 'Damiano Cana',
      role: 'Pruebas, calidad y documentación',
      photo: 'images/team/damiano-cana-pablo-rodrigo.jpeg',
      avatarColor: '#4f888c',
    },
  ],
  scienceSources: [
    {
      label: 'Lunar Reconnaissance Orbiter · NASA',
      url: 'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/',
    },
    {
      label: 'Agua y hielo lunar · NASA',
      url: 'https://science.nasa.gov/moon/moon-water-and-ices/',
    },
    {
      label: 'Mini-RF · NASA',
      url: 'https://science.nasa.gov/mission/lro/mini-rf/',
    },
  ],
}
