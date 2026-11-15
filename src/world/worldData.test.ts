import { describe, expect, it } from 'vitest'
import { canWalk, COLLIDERS, groundHeight, nearestSector, SECTORS, START, WORLD_BOUND } from './worldData'
import { marsCanWalk, marsHeight, MARS_SECTORS, WORLDS } from './worldConfig'

describe('campus navigation contract',()=>{
  it('places all travel destinations and the arrival outside solid structures',()=>{
    expect(canWalk(...START)).toBe(true)
    for(const sector of SECTORS){expect(canWalk(...sector.entry),sector.id).toBe(true);expect(nearestSector(...sector.entry).sector.id).toBe(sector.id)}
  })
  it('blocks solid objects and traversal beyond the advertised map boundary',()=>{
    for(const c of COLLIDERS)expect(canWalk(c.x,c.z)).toBe(false)
    for(const [x,z] of [[WORLD_BOUND,0],[-WORLD_BOUND,0],[0,WORLD_BOUND],[0,-WORLD_BOUND]])expect(canWalk(x,z)).toBe(false)
    expect(canWalk(119,119)).toBe(true)
  })
  it('keeps entrances level and terrain finite throughout the playable area',()=>{
    for(const s of SECTORS)expect(groundHeight(...s.entry)).toBe(0)
    for(let x=-120;x<=120;x+=20)for(let z=-120;z<=120;z+=20)expect(Number.isFinite(groundHeight(x,z))).toBe(true)
  })
})
describe('Mars world navigation and separation',()=>{
 it('keeps every destination reachable and within the advertised 320 m sector',()=>{
  expect(WORLDS.mars.size).toBe(320)
  for(const s of MARS_SECTORS){expect(marsCanWalk(...s.entry),s.id).toBe(true);expect(Number.isFinite(marsHeight(...s.entry))).toBe(true)}
  expect(marsCanWalk(160,0)).toBe(false);expect(marsCanWalk(0,-160)).toBe(false)
  // Laboratory back wall stays solid; the doorway leads into its accessible interior.
  expect(marsCanWalk(-17,-5.52)).toBe(false)
  for(let z=5;z>=-2.2;z-=.2)expect(marsCanWalk(-17,z)).toBe(true)
 })
 it('uses different terrain and destinations without mutating the Earth campus',()=>{
  expect(WORLDS.earth.sectors[0].name).toBe('Centro de investigación')
  expect(WORLDS.mars.sectors[0].name).toBe('Laboratorio Ares')
  expect(marsHeight(-53,-38)).toBeGreaterThan(marsHeight(0,37))
  expect(WORLDS.earth.height(0,37)).toBe(0)
 })
 it('keeps traversal slopes moderate across the Mars terrain',()=>{
  for(let x=-150;x<=150;x+=5)for(let z=-150;z<=150;z+=5){
   const dx=marsHeight(x+1,z)-marsHeight(x,z),dz=marsHeight(x,z+1)-marsHeight(x,z)
   expect(Math.hypot(dx,dz)).toBeLessThan(.7)
  }
 })
})
