import { useMemo } from 'react'
import * as T from 'three'
import { groundHeight } from './worldData'
import { toon } from './ArtKit'
import { CAMPUS_ROADS } from './campusLayout'

/** Coverage channels, not a painted low-resolution road image. Thresholds stay sharp at walking distance. */
let roadAtlas:T.CanvasTexture|undefined
export function roadTexture(_span=256,_mars=false){
 if(roadAtlas)return roadAtlas
 const canvas=document.createElement('canvas');canvas.width=canvas.height=4096
 const ctx=canvas.getContext('2d')!,unit=4096/256
 const routes=CAMPUS_ROADS.map(road=>({road,curve:new T.CatmullRomCurve3(road.points.map(([x,z])=>new T.Vector3(x,0,z)))}))
 ctx.fillStyle='#000';ctx.fillRect(0,0,4096,4096);ctx.lineJoin='round';ctx.lineCap='round'
 const trace=(curve:T.CatmullRomCurve3)=>{ctx.beginPath();for(let i=0;i<=240;i++){const p=curve.getPoint(i/240);const x=(p.x+128)*unit,z=(128-p.z)*unit;if(i===0)ctx.moveTo(x,z);else ctx.lineTo(x,z)}}
 for(const {road,curve} of routes){trace(curve);ctx.strokeStyle='#0000ff';ctx.lineWidth=(road.width+1.2)*unit;ctx.stroke()}
 for(const {road,curve} of routes){trace(curve);ctx.strokeStyle=road.main?'#ff00ff':'#00ffff';ctx.lineWidth=road.width*unit;ctx.stroke()}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.NoColorSpace;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.anisotropy=8;roadAtlas=map;return map
}
export const ROAD_GLSL=`
 uniform sampler2D roadMap;
 vec3 drawRoad(vec2 p,vec3 base,vec3 asphalt,vec3 dirt){
  vec3 masks=texture2D(roadMap,(p+128.)/256.).rgb;
  vec3 aa=max(fwidth(masks)*.65,vec3(.012));
  vec3 coverage=smoothstep(vec3(.5)-aa,vec3(.5)+aa,masks);
  float line=1.-smoothstep(.025,.025+fwidth(masks.b),abs(masks.b-.5));
  vec3 result=mix(base,vec3(.12,.22,.19),coverage.b);
  result=mix(result,vec3(.65,.67,.46),coverage.b*(1.-line));
  result=mix(result,dirt,coverage.g);
  result=mix(result,asphalt,coverage.r);
  // Sparse vector-like cracks, evaluated in world metres rather than stretched pixels.
  vec2 cell=floor(p/2.7),local=fract(p/2.7);
  float hash=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
  float crack=abs(local.y-(.32+.12*sin(local.x*5.+hash*6.)));
  float stroke=(1.-smoothstep(.004,.004+fwidth(crack),crack))*step(.84,hash)*step(.2,local.x)*step(local.x,.74);
  return mix(result,result*.67,stroke*max(coverage.r,coverage.g));
 }
`;
export function IllustratedGround(){
 const geometry=useMemo(()=>{const g=new T.PlaneGeometry(370,370,180,180);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,groundHeight(p.getX(i),p.getZ(i)));g.computeVertexNormals();return g},[])
 const material=useMemo(()=>{
  const roads=roadTexture()
  const m=new T.MeshToonMaterial({color:'#ffffff',gradientMap:toon('#4b986a').gradientMap})
  m.onBeforeCompile=shader=>{
   shader.uniforms.roadMap={value:roads}
   shader.uniforms.grass={value:new T.Color('#55a475')};shader.uniforms.soil={value:new T.Color('#d8d6b5')};shader.uniforms.ink={value:new T.Color('#68785e')}
   shader.vertexShader='varying vec3 terrainPosition; varying float terrainSlope;\n'+shader.vertexShader
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainPosition=(modelMatrix*vec4(position,1.)).xyz; terrainSlope=1.-abs(normal.y);')
   shader.fragmentShader=`${ROAD_GLSL}
    varying vec3 terrainPosition; varying float terrainSlope; uniform vec3 grass;uniform vec3 soil;uniform vec3 ink;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
    float patches(vec2 p){return n(p)*.65+n(p*2.9)*.25+n(p*8.1)*.1;}
   `+shader.fragmentShader
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 p=terrainPosition.xz;
    float mask=patches(p*.16)+terrainSlope*.9;
    float shore=length((p-vec2(-97.,10.))/vec2(18.,40.));
    float bare=max(smoothstep(.62-fwidth(mask),.62+fwidth(mask),mask),1.-smoothstep(1.04,1.18,shore));
    vec3 grassTone=grass*mix(.91,1.,step(.42,n(p*.055)));
    diffuseColor.rgb=mix(grassTone,soil,bare);
    float edge=(1.-smoothstep(.006,.006+fwidth(mask),abs(mask-.62)))*.58;
    diffuseColor.rgb=mix(diffuseColor.rgb,ink,edge);
    diffuseColor.rgb=drawRoad(p,diffuseColor.rgb,vec3(.21,.35,.34),vec3(.48,.47,.32));
   `)
  }
  return m
 },[])
 return <mesh geometry={geometry} material={material} receiveShadow/>
}
export function CampusRoads(){return null}
