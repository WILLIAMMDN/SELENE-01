import bpy, math, random, json, sys
import numpy as np
from mathutils import Vector, Matrix
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[sys.argv.index('--')+1])
OUT=ROOT/'public/models/trees'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE),load_ui=False)
source=[o for o in bpy.context.scene.objects if o.type=='MESH']
trunk=next(o for o in source if len(o.data.vertices)<1000)
trunk_data=trunk.data.copy(); trunk_data.transform(trunk.matrix_world)
clouds=[]
for obj in source:
 if obj==trunk:continue
 m=obj.data; adj=[[] for _ in m.vertices]
 for e in m.edges:
  a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 seen=set();components=[]
 for i in range(len(adj)):
  if i in seen:continue
  seen.add(i);stack=[i];group=[]
  while stack:
   a=stack.pop();group.append(a)
   for b in adj[a]:
    if b not in seen:seen.add(b);stack.append(b)
  components.append(group)
 rng=random.Random(81+len(clouds)); leaves=[]
 for ids in rng.sample(components,min(400,len(components))):
  points=np.array([obj.matrix_world @ m.vertices[i].co for i in ids])
  center=points.mean(axis=0);_,axes=np.linalg.eigh(np.cov((points-center).T))
  span=np.ptp((points-center)@axes,axis=0)*.82
  u=axes[:,2]*span[2];v=axes[:,1]*span[1]
  leaves.append((center,u,v))
 clouds.append(leaves)
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)

def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=1
 return m
bark=material('Bark_Matte',(.12,.18,.145));leaf=material('Leaves_Toon',(.17,.39,.24))
leaf.use_backface_culling=False
vertex=leaf.node_tree.nodes.new('ShaderNodeVertexColor');vertex.layer_name='Color'
leaf.node_tree.links.new(vertex.outputs['Color'],leaf.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
palette=[(.15,.34,.20,1),(.20,.43,.28,1),(.27,.46,.29,1),(.11,.29,.19,1)]
specs=[('anime_tree_grove',(1,1,1)),('anime_tree_slender',(.72,.8,1.16)),('anime_tree_shelter',(1.15,1.08,.82))]
report=[]
for variant,(name,stretch) in enumerate(specs):
 bpy.context.scene.frame_set(1)
 for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
 root=bpy.data.objects.new('Tree_Root',None);bpy.context.collection.objects.link(root)
 mesh=trunk_data.copy();mesh.transform(Matrix.Diagonal((*stretch,1)))
 t=bpy.data.objects.new('Trunk',mesh);bpy.context.collection.objects.link(t);t.parent=root;mesh.materials.clear();mesh.materials.append(bark)
 rng=random.Random(100+variant)
 for band in range(3):
  verts=[];faces=[];colors=[]
  for ci,cloud in enumerate(clouds):
   if ci%3!=band:continue
   for center,u,v in cloud:
    # Simplify the authored leaf positions into six-point leaf blades.
    angle=(variant-1)*.17
    rot=Matrix.Rotation(angle,3,'Z'); c=Vector(center);c=rot@c
    uv=[u, .45*u+.8*v, -.45*u+.65*v, -u, -.45*u-.65*v, .45*u-.8*v]
    start=len(verts);tone=palette[rng.randrange(len(palette))]
    for d in uv:
     pos=c+rot@Vector(d);verts.append(tuple(pos[i]*stretch[i] for i in range(3)));colors.append(tone)
    faces.extend([(start,start+i,start+i+1) for i in range(1,5)])
  mesh=bpy.data.meshes.new('LeafBlades');mesh.from_pydata(verts,[],faces);mesh.materials.append(leaf)
  color=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
  for i,c in enumerate(colors):color.data[i].color=c
  obj=bpy.data.objects.new('Foliage_'+str(band),mesh);bpy.context.collection.objects.link(obj);obj.parent=root
  # Animated local pivot above the trunk; roots never leave the ground.
  pivot=Vector((0,0,2.9*stretch[2]));mesh.transform(Matrix.Translation(-pivot));obj.location=pivot
  for frame in range(1,122,15):
   phase=(frame-1)/120*math.tau
   obj.rotation_euler=(math.sin(phase+band*1.6)*.012,math.sin(phase+band*.9)*.018,math.sin(phase)*.006)
   obj.keyframe_insert(data_path='rotation_euler',frame=frame)
  obj.animation_data.action.name='Breeze_'+str(band)
 # Solid, lobed masses keep the crown legible, with leaf cards at its perimeter.
 for ci,cloud in enumerate(clouds):
  centers=np.array([c for c,u,v in cloud]);center=centers.mean(axis=0)
  radii=np.maximum(np.ptp(centers,axis=0)*.43,.15)
  rot=Matrix.Rotation((variant-1)*.17,3,'Z');center=rot@Vector(center)
  parent=bpy.data.objects.get('Foliage_'+str(ci%3));verts=[];faces=[];cols=[]
  rings=12;segments=24
  for ring in range(rings+1):
   theta=math.pi*ring/rings
   for seg in range(segments):
    phi=math.tau*seg/segments
    n=Vector((math.sin(theta)*math.cos(phi),math.sin(theta)*math.sin(phi),math.cos(theta)))
    lobes=1+.065*math.sin(phi*7+ci)*math.sin(theta*5)+.035*math.cos(phi*11-theta*8)
    v=center+rot@Vector(tuple(n[i]*radii[i]*lobes for i in range(3)))
    v=Vector(tuple(v[i]*stretch[i] for i in range(3)))-parent.location
    verts.append(tuple(v));tone=palette[1 if n.z>.25 else 0];cols.append(tone)
  for ring in range(rings):
   for seg in range(segments):
    a=ring*segments+seg;b=ring*segments+(seg+1)%segments
    faces.append((a,b,b+segments,a+segments))
  mesh=bpy.data.meshes.new('CrownMass');mesh.from_pydata(verts,[],faces);mesh.materials.append(leaf)
  attr=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
  for i,c in enumerate(cols):attr.data[i].color=c
  for poly in mesh.polygons:poly.use_smooth=True
  obj=bpy.data.objects.new('Canopy_'+str(ci),mesh);bpy.context.collection.objects.link(obj);obj.parent=parent
 # Branches connect the original trunk to the elevated leaf clusters.
 for ci,cloud in enumerate(clouds):
  end=Vector(np.mean([c for c,u,v in cloud],axis=0));end=Vector(tuple(end[i]*stretch[i] for i in range(3)))
  start=Vector((0,0,2.8*stretch[2]));direction=end-start
  bpy.ops.mesh.primitive_cone_add(vertices=7,radius1=.08,radius2=.018,depth=direction.length,location=(start+end)*.5)
  branch=bpy.context.object;branch.rotation_euler=direction.to_track_quat('Z','Y').to_euler();branch.data.materials.append(bark)
 # Merge static wood, retaining four draw groups per tree.
 bpy.ops.object.select_all(action='DESELECT');t.select_set(True);bpy.context.view_layer.objects.active=t
 for o in bpy.context.scene.objects:
  if o.type=='MESH' and o!=t and not o.name.startswith(('Foliage','Canopy')):o.select_set(True)
 bpy.ops.object.join()
 bpy.context.scene.render.fps=30;bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=121;bpy.context.scene.frame_set(1)
 bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_frame_range=True,export_force_sampling=True,export_extras=True)
 report.append({'file':name+'.glb','variant':stretch,'leaves':sum(len(x) for x in clouds),'animation':'Breeze, 4 seconds, 3 foliage groups'})
(OUT/'variants.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('EXPORTED_TREE_VARIANTS',report)
