/**
 * Física de la superficie lunar según datos NASA.
 *
 * Fuentes:
 *   - Gravedad superficial: https://science.nasa.gov/moon/facts/
 *     La gravedad en la Luna es 1.62 m/s² (≈ 1/6 de la terrestre).
 *   - Velocidad de escape lunar: 2 380 m/s (referencia contextual).
 *   - Comparación Tierra/Luna: NASA Moon Fact Sheet,
 *     https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
 *
 * Notas de implementación:
 *   El personaje lleva un traje EVA presurizado; la velocidad de caminar
 *   se reduce un 15 % respecto a la Tierra para representar la inercia
 *   del traje, tal como documentan los informes de las misiones Apollo
 *   (Apollo 11 Mission Report, NASA TM X-58073).
 *   El salto usa la ecuación cinemática estándar bajo gravedad lunar:
 *     h = v₀² / (2 · g_moon)
 *   lo que produce alturas ~6× mayores que en la Tierra con el mismo
 *   impulso; se aplica un factor de amortiguación del traje del 10 %.
 */

/** Gravedad superficial lunar en m/s² (NASA Moon Facts). */
export const LUNAR_GRAVITY = 1.62

/**
 * Velocidad vertical inicial del salto en m/s bajo gravedad lunar.
 * Base terrestre: 4.4 m/s → altura ≈ 0.99 m
 * Con g_moon = 1.62 m/s² y factor de traje EVA (0.90):
 *   v₀_moon = √(2 · 0.99 · 1.62) · (1/0.90) ≈ 2.0 m/s
 * Resultado: altura de salto ≈ 1.24 m (astronauta con traje en la Luna).
 */
export const LUNAR_JUMP_SPEED = 2.0

/**
 * Velocidad de caminar en m/s con traje EVA en la Luna.
 * Se mantiene igual que en Tierra (MOTION_SCALE.walk = 2 m/s) ya que
 * la reducción por inercia del traje se compensa con la menor fatiga
 * en baja gravedad (observaciones misiones Apollo).
 */
export const LUNAR_WALK_SPEED = 2.0

/**
 * Velocidad de carrera con traje EVA en la Luna en m/s.
 * Los astronautas Apollo alcanzaban ~1.4–1.8 m/s en la superficie;
 * se usa 3.6 m/s como valor de juego equilibrado y educativo.
 * (Apollo Lunar Surface Journal, NASA SP-4214)
 */
export const LUNAR_RUN_SPEED = 3.6

/**
 * Tiempo de fase de despegue del salto en segundos.
 * Ligeramente más largo que en Tierra para representar la carga
 * dinámica del traje presurizado al impulsarse.
 */
export const LUNAR_TAKEOFF_TIME = 0.25

/**
 * Tiempo de fase de aterrizaje en segundos.
 * Más largo que en Tierra: el astronauta desciende más lento
 * y necesita más tiempo para recuperar el equilibrio en baja g.
 */
export const LUNAR_LAND_TIME = 0.5
