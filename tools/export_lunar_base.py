"""Export lunar destination, height field and shared navigation data from the supplied .blend.
Uses only source scene geometry; originals remain untouched.
"""
import bpy, json, sys, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
source=Path(sys.argv[sys.argv.index('--')+1]).resolve()
out=ROOT/'public/models/lunar';out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False)
def enable(layer):
 layer.exclude=False
 for c in layer.children:enable(c)
enable(bpy.context.view_layer.layer_collection)
for c in bpy.data.collections:c.hide_viewport=False;c.hide_render=False
bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
roots=[bpy.data.objects[n] for n in ['BASE_LUNAR_ROOT','LUNA_SECTOR_01_ROOT','LUNA_HORIZONTE_ROOT']]
objects=set(roots)
for r in roots:objects.update(r.children_recursive)
# Preserve collection instances and their multi-slot panel actions as actual hierarchies.
instances=[o for o in objects if o.instance_collection]
colliders=[]
def bounds(points):
 return {'min':[min(p[i] for p in points) for i in range(3)],'max':[max(p[i] for p in points) for i in range(3)]}
def box(points):
 b=bounds(points);lo=b['min'];hi=b['max'];return {'x':round((lo[0]+hi[0])/2,4),'z':round(-(lo[1]+hi[1])/2,4),'hx':round((hi[0]-lo[0])/2,4),'hz':round((hi[1]-lo[1])/2,4)}
for inst in instances:
 bpy.ops.object.select_all(action='DESELECT');inst.hide_set(False);inst.select_set(True);bpy.context.view_layer.objects.active=inst
 before=set(bpy.data.objects)
 bpy.ops.object.duplicates_make_real(use_base_parent=True,use_hierarchy=True)
 created=set(bpy.data.objects)-before
 for obj in created:
  original=bpy.data.objects.get(obj.name.rsplit('.',1)[0])
  if original and original.animation_data and original.animation_data.action:
   obj.animation_data_create()
   obj.animation_data.action=original.animation_data.action
   obj.animation_data.action_slot=original.animation_data.action_slot
 objects.update(created)
 pts=[o.matrix_world@Vector(p) for o in created if o.type=='MESH' for p in o.bound_box]
 if pts:colliders.append(box(pts))
# Terrain heights in Three coordinates, row-major z then x, 3 m spacing.
terrain=bpy.data.objects['LUNA_TERRENO_MALLA']
pts=[terrain.matrix_world@v.co for v in terrain.data.vertices]
xs=sorted({round(p.x,4) for p in pts});zs=sorted({round(-p.y,4) for p in pts})
grid={(round(p.x,4),round(-p.y,4)):round(p.z,5) for p in pts}
heights=[grid[(x,z)] for z in zs for x in xs]
rocks=[o for o in objects if o.type=='MESH' and 'ROCA' in o.name.upper()]
for o in rocks:
 pts=[o.matrix_world@Vector(p) for p in o.bound_box]
 if max(p.z for p in pts)-min(p.z for p in pts)>.3:colliders.append(box(pts))
landmarks={}
for o in objects:
 if o.type=='EMPTY' and (o.name.startswith('LUNA_ZONA_') or o.name=='LUNA_PUNTO_ATERRIZAJE'):
  p=o.matrix_world.translation;landmarks[o.name]=[round(p.x,4),round(-p.y,4)]
# Merge static rocks for fewer draw calls, keeping collisions from their original footprints.
if rocks:
 bpy.ops.object.select_all(action='DESELECT')
 for o in rocks:o.hide_set(False);o.hide_viewport=False;o.select_set(True)
 bpy.context.view_layer.objects.active=rocks[0]
 bpy.ops.object.join()
 merged=bpy.context.object;merged.name='LUNA_ROCAS_COMBINADAS'
 objects={o for o in bpy.data.objects if o in objects or o==merged}
# Remove collection-instancing on realized roots to avoid rendering every module twice.
for inst in instances:inst.instance_type='NONE';inst.instance_collection=None
bpy.ops.object.select_all(action='DESELECT')
for o in objects:
 if o.type in {'MESH','EMPTY','ARMATURE','CURVE','FONT'}:
  o.hide_set(False);o.hide_viewport=False;o.hide_render=False;o.select_set(True)
bpy.context.view_layer.objects.active=roots[0]
bpy.ops.export_scene.gltf(filepath=str(out/'lunar_base.glb'),export_format='GLB',use_selection=True,use_active_scene=True,
 export_animations=True,export_animation_mode='ACTIONS',export_frame_range=False,export_force_sampling=True,export_extras=True)
meta={'source':source.name,'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'units':'m','landmarks':landmarks,'colliders':colliders,
 'terrain':{'minX':xs[0],'minZ':zs[0],'step':xs[1]-xs[0],'columns':len(xs),'rows':len(zs),'heights':heights}}
(ROOT/'src/world/lunar').mkdir(parents=True,exist_ok=True)
(ROOT/'src/world/lunar/lunarLayout.json').write_text(json.dumps(meta,separators=(',',':')),encoding='utf8')
(out/'manifest.json').write_text(json.dumps({k:v for k,v in meta.items() if k not in ['terrain','colliders']},indent=2),encoding='utf8')
print('LUNAR_EXPORT_COMPLETE',len(objects),len(colliders),landmarks)
