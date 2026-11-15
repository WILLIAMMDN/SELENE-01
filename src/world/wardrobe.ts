import { useSyncExternalStore } from 'react'
import { createPersistedStore } from '../shared/persistence/createPersistedStore'
import { isRecord } from '../shared/persistence/validation'
import { isCharacterId, type CharacterId } from './characters'

export const OUTFITS = [
  ['classic', 'Atuendo clásico', 'La exploradora original del campus.'],
  ['original', 'Ropa de campus', 'Ropa cotidiana, calzado y accesorios personales.'],
  ['formal', 'Uniforme de tripulación', 'Chaqueta, corbata y zapatos antes del despegue.'],
  ['eva', 'Traje espacial EVA', 'Guantes, botas, mochila y casco desmontable.'],
] as const
export type Outfit = (typeof OUTFITS)[number][0]
export type Wardrobe = {
  character: CharacterId
  earth: Outfit
  mars: 'classic' | 'eva'
  moon: 'classic' | 'eva'
  helmet: boolean
}
export function decodeWardrobe(value: unknown): Wardrobe | undefined {
  if (!isRecord(value)) return undefined
  if (!OUTFITS.some(([id]) => id === value.earth)) return undefined
  if (value.mars !== 'classic' && value.mars !== 'eva') return undefined
  if (typeof value.helmet !== 'boolean') return undefined
  const character = isCharacterId(value.character) ? value.character : 'explorer'
  return {
    character,
    earth:
      character !== 'explorer' && value.earth === 'classic' ? 'formal' : (value.earth as Outfit),
    mars: character !== 'explorer' ? 'eva' : value.mars,
    moon: character !== 'explorer' ? 'eva' : value.moon === 'classic' ? 'classic' : 'eva',
    helmet: value.helmet,
  }
}
export const wardrobeStore = createPersistedStore<Wardrobe>({
  key: 'selene-wardrobe-v1',
  initial: () => ({
    character: 'explorer',
    earth: 'formal',
    mars: 'eva',
    moon: 'eva',
    helmet: true,
  }),
  decode: decodeWardrobe,
})
export function useWardrobe() {
  return useSyncExternalStore(wardrobeStore.subscribe, wardrobeStore.getSnapshot)
}
export function chooseCharacter(wardrobe: Wardrobe, character: CharacterId): Wardrobe {
  return {
    ...wardrobe,
    character,
    earth: wardrobe.earth === 'classic' ? 'formal' : wardrobe.earth,
    mars: 'eva',
    moon: 'eva',
  }
}
export function equipForLaunch(wardrobe: Wardrobe, destination: 'moon' | 'mars'): Wardrobe {
  return { ...wardrobe, [destination]: 'eva', helmet: true }
}
export function availableOutfits(character: CharacterId, world: 'earth' | 'mars' | 'moon') {
  return OUTFITS.filter(
    ([id]) => (world === 'earth' || id === 'eva') && (character === 'explorer' || id !== 'classic'),
  )
}
export function wardrobeVisible(group: string, outfit: Outfit, helmet: boolean) {
  if (group === 'helmet') return outfit === 'eva' && helmet
  if (group === 'hair-eva') return outfit === 'eva'
  if (group === 'hair-civil') return outfit !== 'eva'
  if (['formal', 'eva', 'original'].includes(group)) return group === outfit
  return true
}
export const AVATAR_GESTURES = [
  ['Saludar', 'Saludar'],
  ['MirarAlrededor', 'Mirar alrededor'],
  ['PickUp', 'Recoger'],
  ['Punch', 'Movimiento de brazos'],
  ['ReceiveHit', 'Reacción'],
] as const
