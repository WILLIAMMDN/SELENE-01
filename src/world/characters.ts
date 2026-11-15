export const CHARACTERS = [
  {
    id: 'explorer',
    name: 'Exploradora',
    detail: 'Una mirada curiosa hacia el siguiente horizonte.',
    portrait: 'images/crew/explorer.webp',
    model: 'models/characters/wardrobe/explorer_wardrobe.glb?v=wardrobe-2',
    skin: '#dcae8e',
    accent: '#648f82',
  },
  {
    id: 'pilot',
    name: 'Piloto',
    detail: 'Rizos cortos y la vista puesta en el despegue.',
    portrait: 'images/crew/pilot.webp',
    model: 'models/characters/pilot/pilot.glb',
    skin: '#95603e',
    accent: '#657b96',
  },
  {
    id: 'geologist',
    name: 'Geólogo',
    detail: 'Cabello cobrizo, pecas y curiosidad por descubrir.',
    portrait: 'images/crew/geologist.webp',
    model: 'models/characters/geologist/geologist.glb',
    skin: '#cb956e',
    accent: '#b77955',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    detail: 'Ojos jade y una pequeña luna entre sus ondas.',
    portrait: 'images/crew/aurora.webp',
    model: 'models/characters/aurora/aurora.glb',
    skin: '#d2a080',
    accent: '#8c7499',
  },
] as const

export type CharacterId = (typeof CHARACTERS)[number]['id']
export const characterInfo = (id: CharacterId) => CHARACTERS.find((c) => c.id === id)!
export const isCharacterId = (id: unknown): id is CharacterId => CHARACTERS.some((c) => c.id === id)
