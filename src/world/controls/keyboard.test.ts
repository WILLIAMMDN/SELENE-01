import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bindCharacterKeyboard } from './keyboard'
import type { CharacterControls } from '../characterMotion'

class ElementTarget extends EventTarget {
  constructor(private selector = '') { super() }
  closest(selector: string) { return this.selector && selector.includes(this.selector) ? this : null }
}
function key(target: EventTarget, code: string, type = 'keydown', repeat = false) {
  const event = new Event(type, { cancelable: true })
  Object.assign(event, { code, repeat })
  target.dispatchEvent(event)
  return event
}
beforeEach(() => vi.stubGlobal('HTMLElement', ElementTarget))
afterEach(() => vi.unstubAllGlobals())
describe('shared character keyboard', () => {
  it('handles movement, one-shot actions and releases them when focus is lost', () => {
    const target = new EventTarget(), visibilityTarget = new EventTarget()
    const controls: CharacterControls = { keys: new Set(), actions: [] }
    const release = bindCharacterKeyboard({ controls, enabled: () => true, target, visibilityTarget })
    expect(key(target, 'KeyW').defaultPrevented).toBe(true)
    expect(controls.keys.has('KeyW')).toBe(true)
    key(target, 'KeyW', 'keyup')
    expect(controls.keys.size).toBe(0)
    key(target, 'KeyE'); key(target, 'KeyE', 'keydown', true)
    expect(controls.actions).toEqual(['interact'])
    target.dispatchEvent(new Event('blur'))
    expect(controls.actions).toEqual([])
    key(target, 'KeyW')
    visibilityTarget.dispatchEvent(new Event('visibilitychange'))
    expect(controls.keys.size).toBe(0)
    release()
    key(target, 'KeyW')
    expect(controls.keys.size).toBe(0)
  })
  it('respects pause/remote control and does not consume text input or button space', () => {
    for (const selector of ['input', 'button']) {
      const target = new ElementTarget(selector), controls: CharacterControls = { keys: new Set(), actions: [] }
      const release = bindCharacterKeyboard({ controls, enabled: () => true, target, visibilityTarget: target })
      expect(key(target, selector === 'input' ? 'KeyW' : 'Space').defaultPrevented).toBe(false)
      expect(controls.keys.size).toBe(0)
      expect(controls.actions).toEqual([])
      release()
    }
    const target = new EventTarget(), controls: CharacterControls = { keys: new Set(), actions: [] }
    const release = bindCharacterKeyboard({ controls, enabled: () => false, target, visibilityTarget: target })
    key(target, 'KeyW'); key(target, 'Space')
    expect(controls.keys.size).toBe(0)
    expect(controls.actions).toEqual([])
    release()
  })
})
