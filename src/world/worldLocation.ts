import type { WorldId } from './worldConfig'

export function worldLocation(href: string, world: WorldId) {
  const url = new URL(href)
  url.searchParams.set('world', world)
  url.searchParams.delete('campaign')
  url.searchParams.delete('stage')
  url.searchParams.delete('launch')
  url.searchParams.delete('cinematic')
  if (url.searchParams.get('mode') === 'campaign') url.searchParams.delete('mode')
  return url
}
