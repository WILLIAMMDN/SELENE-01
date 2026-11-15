import { useSyncExternalStore } from 'react'
import { createPersistedStore } from '../shared/persistence/createPersistedStore'
import { isRecord } from '../shared/persistence/validation'

export const OUTFITS = [
  ['classic', 'Exploradora clásica', 'La exploradora original del campus.'],
  ['original', 'Exploradora · edición nueva', 'Ropa original con el rostro y accesorios nuevos.'],
  ['formal', 'Uniforme de tripulación', 'Chaqueta, corbata y zapatos antes del despegue.'],
  ['eva', 'Traje espacial EVA', 'Guantes, botas, mochila y casco desmontable.'],
] as const
export type Outfit = (typeof OUTFITS)[number][0]
export type Wardrobe = {
  character: 'explorer' | 'pilot'
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
  return {
    character: value.character === 'pilot' ? 'pilot' : 'explorer',
    earth: value.earth as Outfit,
    mars: value.mars,
    moon: value.moon === 'classic' ? 'classic' : 'eva',
    helmet: value.helmet,
  }
}
export const wardrobeStore = createPersistedStore<Wardrobe>({
  key: 'selene-wardrobe-v1',
  initial: () => ({
    character: 'explorer',
    earth: 'classic',
    mars: 'classic',
    moon: 'eva',
    helmet: true,
  }),
  decode: decodeWardrobe,
})
export function useWardrobe() {
  return useSyncExternalStore(wardrobeStore.subscribe, wardrobeStore.getSnapshot)
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
