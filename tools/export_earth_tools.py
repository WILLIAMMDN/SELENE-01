"""Bake only the supplied tool hierarchy; never execute the embedded generator."""
import bpy,sys,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=Path(sys.argv[sys.argv.index('--')+1]).resolve()
out=ROOT/'public/models/tools';out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False)
root=bpy.data.objects['KIT_HERRAMIENTAS']
bpy.context.scene.frame_set(0)
# Preserve the full source clock at 24 FPS so UI segments use the original markers.
bpy.context.scene.frame_start=0
bpy.ops.object.select_all(action='DESELECT')
for o in [root,*root.children_recursive]:
 if o.type!='LIGHT':o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=str(out/'earth_tools.glb'),export_format='GLB',use_selection=True,use_active_scene=True,
 export_animations=True,export_animation_mode='SCENE',export_frame_range=True,export_force_sampling=True,
 export_anim_scene_split_object=False,export_extras=True,export_lights=False)
# Bake material emission curves separately: portable glTF core has no material animation.
samples={name:[] for name in ['Lente','Pantalla']}
for frame in range(1671):
 bpy.context.scene.frame_set(frame)
 for name in samples:
  m=bpy.data.materials[name]
  node=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
  samples[name].append(round(node.inputs['Emission Strength'].default_value,3))
meta={'source':source.name,'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'fps':24,
 'markers':{m.name:m.frame for m in bpy.context.scene.timeline_markers},'emission':samples}
(ROOT/'src/world/tools').mkdir(parents=True,exist_ok=True)
(ROOT/'src/world/tools/toolTimeline.json').write_text(json.dumps(meta,separators=(',',':')),encoding='utf8')
print('TOOLS_EXPORTED',out/'earth_tools.glb')
