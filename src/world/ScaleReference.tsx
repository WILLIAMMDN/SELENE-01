import { HUMAN_SCALE, NASA_DIMENSIONS as NASA, ODYSSEY_SIZE } from './physicalScale'

export default function ScaleReference() {
  return (
    <section className="scale-reference">
      <h3>Una escala común: 1 unidad = 1 metro</h3>
      <p>
        Las referencias NASA ayudan a dimensionar el entorno. ODYSSEY, TARS y la arquitectura
        conservan su identidad de ficción.
      </p>
      <div className="scale-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Elemento</th>
              <th>Dimensiones</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Exploradora Quaternius · Tierra</td>
              <td>{HUMAN_SCALE.stature.toFixed(2)} m de alto</td>
              <td>Personaje Quaternius · CC0</td>
            </tr>
            <tr>
              <td>Tripulante con casco · Marte</td>
              <td>{HUMAN_SCALE.suitedHeight.toFixed(2)} m de alto</td>
              <td>Diseño: adulto de 1,80 m</td>
            </tr>
            <tr>
              <td>TARS</td>
              <td>{HUMAN_SCALE.tarsHeight.toFixed(2)} m de alto</td>
              <td>Diseño propio</td>
            </tr>
            <tr>
              <td>Cabina Orion</td>
              <td>Ø 5 m · alto 3,35 m</td>
              <td>
                <a href={NASA.orion.source} target="_blank" rel="noreferrer">
                  NASA ↗
                </a>
              </td>
            </tr>
            <tr>
              <td>ODYSSEY con hábitat</td>
              <td>Fuselaje Ø 5 m · alto {ODYSSEY_SIZE.habitatHeight.toFixed(2)} m</td>
              <td>Diseño propio; diámetro inspirado en Orion</td>
            </tr>
            <tr>
              <td>Lanzador ODYSSEY</td>
              <td>90,41 m de alto · 17,57 m de ancho</td>
              <td>Archivo del usuario; vehículo ficticio; escala uniforme × 5/3</td>
            </tr>
            <tr>
              <td>SLS Block 1 · referencia externa</td>
              <td>≈ 98,15 m de alto (322 ft) · núcleo Ø 8,4 m</td>
              <td>
                <a href={NASA.sls.source} target="_blank" rel="noreferrer">
                  NASA ↗
                </a>
              </td>
            </tr>
            <tr>
              <td>ROBER · Tierra y Marte</td>
              <td>3 m de largo · escala uniforme</td>
              <td>
                <a href={NASA.perseverance.source} target="_blank" rel="noreferrer">
                  Longitud de referencia: Perseverance ↗
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        ODYSSEY mantiene las proporciones de tus módulos con una ampliación uniforme. Su cabina mide
        4 m de alto: no es una réplica de Orion. Las puertas tienen 2,20 m de paso y los bancos 0,50
        m de altura de asiento; son decisiones de diseño.
      </p>
      <p className="honest-note">
        El campus es una exposición compacta, no un complejo operativo de lanzamiento. El terreno y
        los edificios son ficticios; las masas, presupuestos y capacidades del simulador siguen
        siendo valores educativos.
      </p>
    </section>
  )
}
