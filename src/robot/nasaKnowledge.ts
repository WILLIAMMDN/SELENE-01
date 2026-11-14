/** Contenidos NASA seleccionados y enlazados, no un modelo generativo. */
export type NasaFact = {id:string;question:string;answer:string;keywords:string[];url:string;source:string}
export const NASA_FACTS:readonly NasaFact[]=[
  {id:'moon-distance',question:'¿A qué distancia está la Luna?',answer:'La distancia media entre la Tierra y la Luna es aproximadamente 384 400 km. No es fija: cambia durante la órbita.',keywords:['distancia','lejos','kilometros'],url:'https://science.nasa.gov/moon/facts/',source:'NASA Science · Moon Facts'},
  {id:'lunar-ice',question:'¿Hay hielo en el polo sur lunar?',answer:'Se han detectado depósitos de hielo de agua en regiones permanentemente sombreadas próximas a los polos. Son objetivos relevantes para la exploración.',keywords:['hielo','polo','agua luna','crater'],url:'https://science.nasa.gov/moon/moon-water-and-ices/',source:'NASA Science · Moon Water and Ices'},
  {id:'rotation',question:'¿Por qué siempre vemos la misma cara de la Luna?',answer:'La Luna gira sobre sí misma casi al mismo ritmo que orbita la Tierra, aproximadamente cada 27 días. Este fenómeno se llama rotación síncrona.',keywords:['rotacion','misma cara','gira','orbita luna'],url:'https://science.nasa.gov/moon/facts/',source:'NASA Science · Moon Facts'},
  {id:'life-support',question:'¿Cómo recuperan agua los astronautas?',answer:'Los sistemas ECLSS de la Estación Espacial Internacional recuperan agua de diversas fuentes, incluidas aguas residuales y condensación, para tratarla y reutilizarla.',keywords:['reciclar','recuperar agua','soporte vital','eclss','astronautas'],url:'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',source:'NASA · ECLSS'},
  {id:'artemis',question:'¿Qué es Artemis?',answer:'Artemis es el programa de exploración lunar de NASA orientado a desarrollar capacidades para misiones humanas en la Luna y futuras exploraciones más lejanas.',keywords:['artemis','programa lunar','mision humana'],url:'https://www.nasa.gov/artemis/',source:'NASA · Artemis'},
]
export function normalizeQuestion(input:string):string {
  return input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()
}
export function findFact(input:string):NasaFact|null {
  const q=normalizeQuestion(input)
  if(!q || q.length>240)return null
  const ranked=NASA_FACTS.map(fact=>({fact,score:fact.keywords.reduce((score,k)=>score+(q.includes(normalizeQuestion(k))?1:0),0)})).sort((a,b)=>b.score-a.score)
  return ranked[0]?.score ? ranked[0].fact : null
}
