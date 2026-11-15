"""Export the supplied ODYSSEY source versions, retaining native transforms and actions.
blender --background --factory-startup --disable-autoexec --python tools/export_odyssey_sources.py -- downloads_directory
"""
import bpy, sys, json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=Path(sys.argv[sys.argv.index('--')+1]).resolve()
items=[('ODYSSEY_LANDER_L01_v01.blend','LANDER_L01_ROOT','lander/lander_l01_v01.glb'),
 ('Nave_ODYSSEY_Lanzador_Animado_v01.blend','LANZADOR_ROOT','launch/lanzador_odyssey_v01.glb'),
 ('Nave_ODYSSEY_Lanzador_Animado_v01.blend','PLATAFORMA_ROOT','launch/plataforma_odyssey_v01.glb'),
 ('Nave_ODYSSEY_Final_Modelado_v01.blend','ODYSSEY_ROOT','odyssey/nave_modelada_v01.glb')]
records=[]
for filename,rootname,target in items:
 path=source/filename
 bpy.ops.wm.open_mainfile(filepath=str(path),load_ui=False)
 def enable(layer):
  layer.exclude=False
  for c in layer.children:enable(c)
 enable(bpy.context.view_layer.layer_collection)
 for c in bpy.data.collections:c.hide_viewport=False;c.hide_render=False
 root=bpy.data.objects[rootname]
 # Runtime already attaches the player's modular spacecraft to this socket.
 if rootname=='LANZADOR_ROOT':
  socket=bpy.data.objects.get('CARGA_ODYSSEY')
  if socket:
   for o in list(socket.children_recursive):bpy.data.objects.remove(o,do_unlink=True)
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 objects=set([root,*root.children_recursive])
 for inst in list(objects):
  if not inst.instance_collection:continue
  bpy.ops.object.select_all(action='DESELECT');inst.hide_set(False);inst.hide_viewport=False;inst.select_set(True);bpy.context.view_layer.objects.active=inst
  before=set(bpy.data.objects)
  bpy.ops.object.duplicates_make_real(use_base_parent=True,use_hierarchy=True)
  objects.update(set(bpy.data.objects)-before)
  inst.instance_type='NONE';inst.instance_collection=None
 bpy.ops.object.select_all(action='DESELECT')
 for obj in objects:
  obj.hide_set(False);obj.hide_viewport=False;obj.hide_render=False;obj.select_set(True)
 bpy.context.view_layer.objects.active=root
 out=ROOT/'public/models'/target
 bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=True,export_animation_mode='ACTIONS',export_frame_range=False,export_force_sampling=True,export_extras=True)
 records.append({'source':filename,'sourceSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'file':target,'root':rootname,'bytes':out.stat().st_size})
 print('SOURCE_EXPORTED',target)
(ROOT/'public/models/odyssey/source-versions.json').write_text(json.dumps(records,indent=2),encoding='utf8')
