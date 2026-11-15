import bpy,json,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/models/animals';OUT.mkdir(parents=True,exist_ok=True)
records=[]
for species in ['Crab','Dolphin','Egret','Gator','Manatee','Pelican','Spoonbill','Turtle']:
 bpy.ops.wm.open_mainfile(filepath=sys.argv[sys.argv.index('--')+1],load_ui=False)
 for o in bpy.data.objects:o.animation_data_clear()
 actions=[a for a in bpy.data.actions if a.name.startswith(species+'_')]
 for a in list(bpy.data.actions):
  if a not in actions:bpy.data.actions.remove(a)
 root=bpy.data.objects[species+'_ROOT'];rig=bpy.data.objects[species+'_Rig']
 root.location=(0,0,0);root.rotation_euler=(0,0,0)
 for pb in rig.pose.bones:pb.matrix_basis.identity()
 rig.animation_data_create();rig.animation_data.action=next(a for a in actions if a.name.endswith('_idle'))
 if rig.animation_data.action.slots:rig.animation_data.action_slot=rig.animation_data.action.slots[0]
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 bpy.ops.object.select_all(action='DESELECT')
 for obj in [root,*root.children_recursive]:obj.hide_set(False);obj.select_set(True)
 bpy.context.view_layer.objects.active=rig
 bpy.ops.export_scene.gltf(filepath=str(OUT/(species.lower()+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_frame_range=False,export_force_sampling=True,export_extras=True)
 points=[obj.matrix_world@Vector(p) for obj in root.children_recursive if obj.type=='MESH' for p in obj.bound_box]
 records.append({'id':species.lower(),'clips':[a.name for a in actions],'boundsXYZ':[[min(p[i] for p in points) for i in range(3)],[max(p[i] for p in points) for i in range(3)]]})
(OUT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('EXPORTED_ANIMALS',json.dumps(records))
