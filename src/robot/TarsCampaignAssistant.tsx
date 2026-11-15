import { useState, type FormEvent } from 'react'
import { NASA_FACTS, findFact, type NasaFact } from './nasaKnowledge'
import { mediaSearchUrl, searchNasaMedia, type NasaMedia } from './nasaMedia'
export default function TarsCampaignAssistant({hint}:{hint:string}) {
  const [open,setOpen]=useState(false)
  const [question,setQuestion]=useState('')
  const [fact,setFact]=useState<NasaFact|null>(NASA_FACTS[1])
  const [unknown,setUnknown]=useState(false)
  const [mediaQuery,setMediaQuery]=useState('Moon south pole')
  const [results,setResults]=useState<NasaMedia[]>([])
  const [mediaState,setMediaState]=useState('')
  const [loading,setLoading]=useState(false)
  const ask=(text:string)=>{
    setQuestion(text)
    const match=findFact(text)
    setFact(match)
    setUnknown(!match)
    setOpen(true)
  }
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(question.trim())ask(question)
  }
  const search=async()=>{
    if(mediaQuery.trim().length<3)return
    setLoading(true);setResults([]);setMediaState('Buscando en NASA Images…')
    try {
      const found=await searchNasaMedia(mediaQuery)
      setResults(found)
      setMediaState(found.length?'Resultados de NASA Images:':'No se encontraron imágenes para esa búsqueda.')
    } catch {
      setMediaState('Consulta no disponible. Usa el enlace oficial de búsqueda.')
    } finally {setLoading(false)}
  }
  return <aside className="orbi">
    <button type="button" className="orbi-button" aria-expanded={open} aria-controls="orbi-panel" onClick={()=>setOpen(!open)}>
      <span className="robot-face" aria-hidden="true">◉</span><span><strong>TARS</strong><small>Tu compañero científico</small></span><span>{open?'−':'+'}</span>
    </button>
    {open && <div className="orbi-panel" id="orbi-panel">
      <p className="orbi-context"><strong>Consejo:</strong> {hint}</p>
      <p className="small-note">TARS usa fichas documentales verificadas, no genera respuestas libres. Las estadísticas del juego son ficticias.</p>
      <form onSubmit={submit}>
        <label htmlFor="orbi-question">Pregunta sobre ciencia espacial</label>
        <div className="input-line"><input id="orbi-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={240} placeholder="¿Hay hielo en la Luna?"/><button type="submit">Preguntar</button></div>
      </form>
      <div className="quick-questions">{NASA_FACTS.slice(0,4).map(item=><button type="button" key={item.id} onClick={()=>ask(item.question)}>{item.question}</button>)}</div>
      <div className="orbi-answer" role="status" aria-live="polite">
        {unknown?<><strong>Aún no sé responder eso.</strong><p>No tengo una ficha validada para esa pregunta. Prefiero no inventar información.</p><a href="https://science.nasa.gov/" target="_blank" rel="noopener noreferrer">Investigar en NASA Science ↗</a></>:fact&&<><strong>{fact.question}</strong><p>{fact.answer}</p><a href={fact.url} target="_blank" rel="noopener noreferrer">Fuente: {fact.source} ↗</a><small>Biblioteca seleccionada; no es información en tiempo real.</small></>}
      </div>
      <div className="media-search">
        <strong>Explorar imágenes reales de NASA</strong>
        <div className="input-line"><input aria-label="Término para NASA Images" value={mediaQuery} onChange={e=>setMediaQuery(e.target.value)} maxLength={80}/><button type="button" onClick={search} disabled={loading}>Buscar</button></div>
        {mediaState&&<p role="status">{mediaState}</p>}
        {results.length>0&&<ul>{results.map(item=><li key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></li>)}</ul>}
        <a href={mediaSearchUrl(mediaQuery)} target="_blank" rel="noopener noreferrer">Abrir catálogo NASA Images ↗</a>
      </div>
    </div>}
  </aside>
}
