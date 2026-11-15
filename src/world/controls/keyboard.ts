import { CHARACTER_KEYS, MOVEMENT_KEYS, type CharacterControls } from '../characterMotion'

/** Both campus views share key ownership, UI exclusions and release/blur cleanup.
 * Each scene still supplies its existing rules for pause, interiors and Mars.
 */
export function bindCharacterKeyboard({
  controls, enabled, onAction, target = window, visibilityTarget = document,
}: {
  controls: CharacterControls;
  enabled: () => boolean;
  onAction?: (event: KeyboardEvent) => void;
  target?: EventTarget;
  visibilityTarget?: EventTarget;
}) {
  const clear = () => { controls.keys.clear(); controls.actions.length = 0 }
  const down = (event: Event) => {
    const e = event as KeyboardEvent
    if (!enabled()) return
    if (e.target instanceof HTMLElement && e.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return
    if (e.code === 'Space' && e.target instanceof HTMLElement && e.target.closest('button,summary')) return
    if (MOVEMENT_KEYS.includes(e.code)) { controls.keys.add(e.code); e.preventDefault() }
    if (onAction) onAction(e)
    else if (CHARACTER_KEYS[e.code]) {
      e.preventDefault()
      if (!e.repeat) controls.actions.push(CHARACTER_KEYS[e.code])
    }
  }
  const up = (event: Event) => { controls.keys.delete((event as KeyboardEvent).code) }
  target.addEventListener('keydown', down)
  target.addEventListener('keyup', up)
  target.addEventListener('blur', clear)
  visibilityTarget.addEventListener('visibilitychange', clear)
  return () => {
    target.removeEventListener('keydown', down)
    target.removeEventListener('keyup', up)
    target.removeEventListener('blur', clear)
    visibilityTarget.removeEventListener('visibilitychange', clear)
    clear()
  }
}
