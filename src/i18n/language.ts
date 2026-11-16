import english from './en.json'

export type Language = 'en' | 'es'
const key = 'selene-language'
const translations = english as Record<string, string>
const lowercaseTranslations = new Map(
  Object.entries(translations).map(([source, translated]) => [
    source.toLocaleLowerCase('es'),
    translated,
  ]),
)
const listeners = new Set<() => void>()
const originalText = new WeakMap<Text, { source: string; translated: string }>()
const originalAttributes = new WeakMap<
  Element,
  Map<string, { source: string; translated: string }>
>()
const translatableAttributes = ['aria-label', 'title', 'placeholder', 'alt'] as const
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()

function initialLanguage(): Language {
  try {
    return localStorage.getItem(key) === 'es' ? 'es' : 'en'
  } catch {
    return 'en'
  }
}

let language: Language = initialLanguage()
let observer: MutationObserver | undefined

export function getLanguage() {
  return language
}

export function subscribeLanguage(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function translate(value: string, selectedLanguage = language) {
  if (selectedLanguage === 'es') return value
  const normalized = normalize(value)
  let translated =
    translations[normalized] ?? lowercaseTranslations.get(normalized.toLocaleLowerCase('es'))
  if (!translated) {
    const question = normalized.match(/^Tu pregunta: (.+)$/)
    const missingModule = normalized.match(/^Falta ensamblar: (.+)\.$/)
    const preview = normalized.match(/^Vista previa de (.+)$/)
    const mission = normalized.match(/^MISIÓN (\d+) \/ 05$/)
    const distance = normalized.match(/^(.+?) · (\d+) m$/)
    const dayMargin = normalized.match(
      /^Masa, potencia, enlace y presupuesto compatibles para (\d+) días\.$/,
    )
    const recovered = normalized.match(
      /^Recuperaste ([\d.]+) GB; ([\d.]+) GB quedaron a bordo\. Compara cuánto observaste con cuánto pudiste enviar\.$/,
    )
    const campaign = normalized.match(
      /^Campaña de (\d+) días, representada por tres decisiones clave\. La duración y los recursos son parámetros educativos, no una predicción orbital\.$/,
    )
    const additionalRequirements = normalized.match(/^· (\d+) requisitos más por resolver$/)
    const fieldProgress = normalized.match(/^Registros de campo: (\d+) de (\d+)\.(.*)$/)
    const sampling = normalized.match(/^Muestra (\d+) registrada con (.+)\.$/)
    const survey = normalized.match(/^Prospección (\d+) de 06$/)
    const fieldStation = normalized.match(/^Ve a la estación (\d+) y registra (.+)\.$/)
    const page = normalized.match(/^Página (\d+) de (\d+)$/)
    const goTo = normalized.match(/^Ir a (.+)$/)
    const map = normalized.match(
      /^Mapa de (.+), (\d+) por (\d+) metros\. Cinco destinos conectados\.$/,
    )
    const operation = normalized.match(
      /^Batería (\d+)% \(([+-]?\d+)\) · memoria ([\d.]+)\/36 GB · enviados \+([\d.]+) GB\.$/,
    )
    const currentSurvey = normalized.match(
      /^Estado actual de prospección: (\d+) de 6 recursos caracterizados\. (.+)$/,
    )
    const simulatedReading = normalized.match(/^Lectura simulada registrada con (.+)\.$/)
    const selectedBrief = normalized.match(/^El encargo elegido es (.+)\. (.+)$/)
    const missionBrief = normalized.match(/^Encargo: (.+)\. (.+)$/)
    const instrumentBrief = normalized.match(
      /^Para (.+), instala el instrumento solicitado y elige una órbita con cobertura polar\. Cada pieza aumenta o limita masa, potencia, datos y costo\.$/,
    )
    const returnedData = normalized.match(
      /^ODYSSEY devolvió ([\d.]+) GB agregados\. El juego no identifica qué instrumento produjo cada dato ni permite concluir que la pregunta científica esté resuelta\. (.+)$/,
    )
    const tachometer = normalized.match(/^Tacómetro (\d+) RPM, Velocímetro ([\d.]+) km\/h$/)
    const namedAction = normalized.match(/^(.+) \((.+)\)$/)
    const wildlife = normalized.match(
      /^(.+)\. Podemos observar sus movimientos desde el sendero\. Esta costa forma parte del campus ficticio de Artemisa\.$/,
    )
    if (question) translated = `Your question: ${translate(question[1], selectedLanguage)}`
    else if (missingModule)
      translated = `Still to assemble: ${translate(missingModule[1], selectedLanguage)}.`
    else if (preview) translated = `Preview of ${translate(preview[1], selectedLanguage)}`
    else if (mission) translated = `MISSION ${mission[1]} / 05`
    else if (distance && translations[distance[1]])
      translated = `${translations[distance[1]]} · ${distance[2]} m`
    else if (dayMargin)
      translated = `Mass, power, communications, and budget meet the limits for ${dayMargin[1]} days.`
    else if (recovered)
      translated = `You returned ${recovered[1]} GB; ${recovered[2]} GB remained on board. Compare the data collected with the data you could transmit.`
    else if (campaign)
      translated = `${campaign[1]}-day campaign, represented by three key decisions. Duration and resources are educational parameters, not an orbital prediction.`
    else if (additionalRequirements)
      translated = `· ${additionalRequirements[1]} more requirements to resolve`
    else if (fieldProgress)
      translated = `Field records: ${fieldProgress[1]} of ${fieldProgress[2]}.${fieldProgress[3] ? ` ${translate(fieldProgress[3], selectedLanguage)}` : ''}`
    else if (sampling)
      translated = `Sample ${sampling[1]} logged with ${translate(sampling[2], selectedLanguage)}.`
    else if (survey) translated = `Survey ${survey[1]} of 06`
    else if (fieldStation)
      translated = `Go to station ${fieldStation[1]} and log ${translate(fieldStation[2], selectedLanguage)}.`
    else if (page) translated = `Page ${page[1]} of ${page[2]}`
    else if (goTo) translated = `Go to ${translate(goTo[1], selectedLanguage)}`
    else if (map)
      translated = `Map of ${translate(map[1], selectedLanguage)}, ${map[2]} by ${map[3]} meters. Five connected destinations.`
    else if (operation)
      translated = `Battery ${operation[1]}% (${operation[2]}) · storage ${operation[3]}/36 GB · transmitted +${operation[4]} GB.`
    else if (currentSurvey)
      translated = `Survey progress: ${currentSurvey[1]} of 6 resources characterized. ${translate(currentSurvey[2], selectedLanguage)}`
    else if (simulatedReading)
      translated = `Simulated reading logged with ${translate(simulatedReading[1], selectedLanguage)}.`
    else if (selectedBrief)
      translated = `The selected brief is ${translate(selectedBrief[1], selectedLanguage)}. ${translate(selectedBrief[2], selectedLanguage)}`
    else if (missionBrief)
      translated = `Mission brief: ${translate(missionBrief[1], selectedLanguage)}. ${translate(missionBrief[2], selectedLanguage)}`
    else if (instrumentBrief)
      translated = `For ${translate(instrumentBrief[1], selectedLanguage)}, install the required instrument and choose an orbit that covers the polar region. Every component affects mass, power, data, and cost.`
    else if (returnedData)
      translated = `ODYSSEY returned ${returnedData[1]} GB of aggregate data. The game does not identify which instrument produced each measurement, so the scientific question cannot be considered resolved. ${translate(returnedData[2], selectedLanguage)}`
    else if (tachometer)
      translated = `Tachometer ${tachometer[1]} RPM, speedometer ${tachometer[2]} km/h`
    else if (wildlife)
      translated = `${translate(wildlife[1], selectedLanguage)}. We can observe its movements from the trail. This coast is part of the fictional Artemisa campus.`
    else if (namedAction && translations[namedAction[1]] && translations[namedAction[2]])
      translated = `${translations[namedAction[1]]} (${translations[namedAction[2]]})`
  }
  if (!translated || translated === normalized) return value
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  return leading + translated + trailing
}

function translateText(node: Text) {
  const current = node.nodeValue ?? ''
  const previous = originalText.get(node)
  const source = previous && current === previous.translated ? previous.source : current
  const translated = translate(source)
  originalText.set(node, { source, translated })
  if (current !== translated) node.nodeValue = translated
}

function translateAttributes(element: Element) {
  let saved = originalAttributes.get(element)
  if (!saved) {
    saved = new Map()
    originalAttributes.set(element, saved)
  }
  for (const attribute of translatableAttributes) {
    const current = element.getAttribute(attribute)
    if (current === null) continue
    const previous = saved.get(attribute)
    const source = previous && current === previous.translated ? previous.source : current
    const translated = translate(source)
    saved.set(attribute, { source, translated })
    if (current !== translated) element.setAttribute(attribute, translated)
  }
}

function translateTree(root: Node) {
  if (root instanceof Element && root.closest('[data-no-translate]')) return
  if (root instanceof Text) {
    if (root.parentElement?.closest('[data-no-translate], script, style')) return
    translateText(root)
    return
  }
  if (root instanceof Element) translateAttributes(root)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node instanceof Element && node.closest('[data-no-translate]')) continue
    if (node instanceof Text && node.parentElement?.closest('[data-no-translate], script, style'))
      continue
    if (node instanceof Text) translateText(node)
    else if (node instanceof Element) translateAttributes(node)
  }
}

function updateDocumentMetadata() {
  document.documentElement.lang = language
  document.title =
    language === 'en' ? 'SELENE—01 · A World to Discover' : 'SELENE—01 · Un mundo por descubrir'
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      language === 'en'
        ? 'Explore the Artemisa campus: an illustrated 3D world for imagining, building, and designing a space mission. SELENE-01.'
        : 'Explora el campus Artemisa: un mundo ilustrado en 3D para imaginar, construir y diseñar tu misión espacial. SELENE-01.',
    )
}

export function setLanguage(next: Language) {
  language = next
  try {
    localStorage.setItem(key, next)
  } catch {
    // The selection still applies for this session when storage is unavailable.
  }
  updateDocumentMetadata()
  const root = document.getElementById('root')
  if (root) translateTree(root)
  listeners.forEach((listener) => listener())
}

export function startLanguageObserver() {
  if (observer) return
  updateDocumentMetadata()
  const root = document.getElementById('root')
  if (!root) return
  translateTree(root)
  observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'characterData') translateTree(change.target)
      else if (change.type === 'attributes') translateTree(change.target)
      else change.addedNodes.forEach(translateTree)
    }
  })
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...translatableAttributes],
  })
}
