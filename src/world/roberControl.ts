import type { Group } from 'three'
// One visible world at a time. The active remote target is released on close/unmount.
export const roberRemote: { current: Group | null } = { current: null }
