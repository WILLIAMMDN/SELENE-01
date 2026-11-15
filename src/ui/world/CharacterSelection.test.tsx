import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import CharacterGate from './CharacterSelection'
import { wardrobeStore } from '../../world/wardrobe'

vi.mock('./CharacterPreview', () => ({
  default: ({ character, outfit }: { character: string; outfit: string }) => (
    <div data-preview-character={character} data-preview-outfit={outfit} />
  ),
}))
beforeEach(() => {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }), location: { search: '' } })
  wardrobeStore.set({ character: 'aurora', earth: 'eva', mars: 'eva', moon: 'eva', helmet: false })
})
afterEach(() => vi.unstubAllGlobals())

describe('game entry', () => {
  it('requires a character choice on a fresh page even with an existing saved wardrobe', () => {
    let worldMounted = false
    function World() {
      worldMounted = true
      return <div>World keyboard and camera</div>
    }
    const html = renderToStaticMarkup(
      <CharacterGate>
        <World />
      </CharacterGate>,
    )
    expect(worldMounted).toBe(false)
    expect(html).toContain('Seleccionar personaje')
    for (const name of ['Exploradora', 'Piloto', 'Geólogo', 'Aurora']) expect(html).toContain(name)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toContain('data-preview-character="aurora"')
    expect(html).toContain('data-preview-outfit="eva"')
  })
  it('previews the actual EVA clothing for a direct Moon entry', () => {
    window.location.search = '?world=moon'
    wardrobeStore.set({ ...wardrobeStore.getSnapshot(), earth: 'formal' })
    const html = renderToStaticMarkup(
      <CharacterGate>
        <div>World</div>
      </CharacterGate>,
    )
    expect(html).toContain('data-preview-outfit="eva"')
    expect(html).toContain('Explorar con Aurora')
  })
})
