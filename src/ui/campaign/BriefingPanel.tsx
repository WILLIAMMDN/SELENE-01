import type { MissionController } from '../../game/hooks/useMissionController'
export default function BriefingPanel({controller}:{controller:MissionController}){
 const {go}=controller
 return <>

          <span className="eyebrow">CAPÍTULO 01 · LA CONVOCATORIA</span><h1>Una misión.<br/><em>Mil decisiones.</em></h1>
          <p>La Dra. Vega te invita al programa SELENE-01: estudiar el entorno del polo sur lunar. Tu primer encargo es ensamblar la nave modular ODYSSEY y preparar una misión orbital capaz de recolectar y devolver información científica.</p>
          <blockquote>«No gana quien carga más instrumentos, sino quien construye un sistema que puede cumplir su objetivo». — Dra. Vega, personaje ficticio</blockquote>
          <h2>Tu desafío</h2>
          <div className="story-steps"><p>① Ensambla ODYSSEY y define sus instrumentos.</p><p>② Equilibra masa, energía, datos y presupuesto.</p><p>③ Elige órbita y lanzador.</p><p>④ Simula el vuelo, responde a imprevistos y mejora.</p></div>
          <a className="source-link" href="https://science.nasa.gov/moon/moon-water-and-ices/" rel="noopener noreferrer" target="_blank">¿Por qué explorar el polo lunar? · Fuente NASA ↗</a>
          <button className="action-primary" onClick={()=>go('design')}>Ir al laboratorio de ingeniería →</button>
        
 </>
}
