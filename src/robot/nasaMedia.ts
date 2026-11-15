export type NasaMedia = { id: string; title: string; url: string }
export const mediaSearchUrl = (q: string) =>
  'https://images.nasa.gov/search?q=' + encodeURIComponent(q)
export async function searchNasaMedia(query: string): Promise<NasaMedia[]> {
  const q = query.trim().slice(0, 80)
  if (q.length < 3) return []
  const response = await fetch(
    'https://images-api.nasa.gov/search?q=' +
      encodeURIComponent(q) +
      '&media_type=image&page_size=5',
  )
  if (!response.ok) throw new Error('No se pudo consultar NASA Images')
  const json: unknown = await response.json()
  const root = json as {
    collection?: { items?: Array<{ data?: Array<{ nasa_id?: string; title?: string }> }> }
  }
  return (root.collection?.items ?? []).flatMap((item) => {
    const first = item.data?.[0]
    return first?.nasa_id && first.title
      ? [
          {
            id: first.nasa_id,
            title: first.title,
            url: 'https://images.nasa.gov/details/' + encodeURIComponent(first.nasa_id),
          },
        ]
      : []
  })
}
