"""Export the user's wardrobe without modifying its .blend. Blender 5.3.
blender --background --factory-startup --disable-autoexec --python tools/export_wardrobe.py -- source.blend
"""
import bpy, json, sys, hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
pilot = 'Piloto' in source.name
out = ROOT / ('public/models/characters/pilot' if pilot else 'public/models/characters/wardrobe')
out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False)
rig = bpy.data.objects['CharacterArmature']
bpy.context.window.scene = max((s for s in bpy.data.scenes if rig.name in s.objects), key=lambda s: len(s.objects))
objects = [rig, *rig.children_recursive]
for obj in objects:
    if obj.animation_data:
        for driver in list(obj.animation_data.drivers):
            if driver.data_path in ['hide_render', 'hide_viewport']:
                obj.driver_remove(driver.data_path)
    obj.hide_render = False
    obj.hide_viewport = False
    obj.hide_set(False)
    name = obj.name
    group = ('formal' if name.startswith('Formal |') else
             'eva' if name.startswith('EVA |') else
             'helmet' if name.startswith('CASCO |') else
             'original' if name.startswith('Original |') else
             'hair-civil' if name == 'Cabello | civil' else
             'hair-eva' if name.startswith('Cabello | recogido') else 'body')
    obj['wardrobe'] = group
# The source brooch has an Armature modifier but no assigned weights.
brooch = bpy.data.objects.get('Broche_Jade')
if brooch:
    head = brooch.vertex_groups.get('Head') or brooch.vertex_groups.new(name='Head')
    head.add(list(range(len(brooch.data.vertices))), 1.0, 'REPLACE')
# glTF has no Blender visibility drivers. Clothing is tagged and switched in the game.
# Closed eyelids are separate source meshes; keep their original resting scale.
for t in rig.animation_data.nla_tracks:
    t.mute = True
rig.animation_data.action = bpy.data.actions['Idle']
if rig.animation_data.action.slots:
    rig.animation_data.action_slot = rig.animation_data.action.slots[0]
bpy.context.scene.frame_set(0)
bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
for obj in objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=str(out / ('pilot.glb' if pilot else 'explorer_wardrobe.glb')), export_format='GLB',
    use_selection=True, use_active_scene=True, export_animations=True, export_animation_mode='ACTIONS',
    export_frame_range=False, export_force_sampling=True, export_bake_animation=True,
    export_extras=True, export_cameras=False, export_lights=False)
manifest = {'source': source.name, 'sourceSHA256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'clips': [a.name for a in bpy.data.actions],
    'groups': {g: [o.name for o in objects if o.get('wardrobe') == g] for g in sorted({o['wardrobe'] for o in objects})}}
(out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print('WARDROBE_EXPORT_COMPLETE')
