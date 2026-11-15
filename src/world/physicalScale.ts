/** All scene coordinates are metres. NASA references are separate from fictional design choices. */
export const NASA_DIMENSIONS = {
  orion: {
    diameter: 5,
    crewModuleHeight: 3.35,
    habitableVolume: 9.34,
    source: 'https://www.nasa.gov/wp-content/uploads/2026/01/orion-by-the-numbers-2026b.pdf',
  },
  sls: {
    height: 322 * 0.3048,
    coreHeight: 64.6,
    coreDiameter: 8.4,
    boosterHeight: 53.9,
    boosterDiameter: 3.7,
    source: 'https://www.nasa.gov/reference/space-launch-system/',
    coreSource: 'https://www.nasa.gov/reference/sls-space-launch-system-core-stage/',
    boosterSource: 'https://www.nasa.gov/reference/sls-space-launch-system-solid-rocket-booster/',
  },
  perseverance: {
    length: 3,
    width: 2.7,
    height: 2.2,
    source: 'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/',
  },
  crew: {
    minStature: 58 * 0.0254,
    maxStature: 77 * 0.0254,
    source: 'https://www.nasa.gov/reference/crew-systems/',
  },
} as const
// Adult stature chosen within Orion's documented accommodation range, not a prescribed astronaut size.
export const HUMAN_SCALE = {
  stature: 1.8,
  suitedHeight: 1.95,
  tarsHeight: 1.85,
  doorHeight: 2.2,
  doorWidth: 1.1,
  benchSeatHeight: 0.5,
} as const
export const ODYSSEY_SCALE = NASA_DIMENSIONS.orion.diameter / 3
export const ODYSSEY_SIZE = {
  diameter: 3 * ODYSSEY_SCALE,
  compactHeight: 8.627 * ODYSSEY_SCALE,
  habitatHeight: 11.127 * ODYSSEY_SCALE,
  deployedWidth: 8.161 * ODYSSEY_SCALE,
  padRadius: 10.3,
  padCollisionRadius: 11,
} as const
export const MOTION_SCALE = {
  walk: 1.4,
  run: 3.2,
  cameraTarget: 1.35,
  cameraHeight: 1.65,
  zoom: 7.5,
} as const
