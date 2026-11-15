"""Derive a wheel-rigged buggy from the user's merged environment asset.
Run with Blender --background --factory-startup --disable-autoexec --python.
Original environment GLB remains untouched; no authored animation is discarded.
"""
import bpy
from pathlib import Path
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/environment/elementos_entorno.glb'))
source = bpy.data.objects['Vehiculo_Buggy_Colonia']
source.parent = None
source.matrix_world = Matrix.Identity(4)
bpy.ops.object.select_all(action='DESELECT')
source.select_set(True)
bpy.context.view_layer.objects.active = source
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')
parts = list(bpy.context.selected_objects)
groups = {'Chassis': []}
pivots = {}
for x in [-0.86, 0.86]:
 for y in [-0.98, 0.98]:
  name = 'Wheel_' + ('L' if x < 0 else 'R') + ('F' if y < 0 else 'B')
  pivots[name] = Vector((x,y,0.38)); groups[name] = []
for obj in parts:
 points = [v.co for v in obj.data.vertices]
 lo = Vector(tuple(min(v[i] for v in points) for i in range(3)))
 hi = Vector(tuple(max(v[i] for v in points) for i in range(3)))
 centre = (lo+hi)*0.5
 group = 'Chassis'
 for name, pivot in pivots.items():
  if abs(centre.x-pivot.x)<0.025 and abs(centre.y-pivot.y)<0.42 and hi.z<0.81:
   group=name;break
 groups[group].append(obj)
root=bpy.data.objects.new('Buggy',None);bpy.context.scene.collection.objects.link(root)
exported=[root]
for name, objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for obj in objects:obj.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.object.join()
 obj=bpy.context.object;obj.name=name
 pivot=pivots.get(name,Vector((0,0,0)))
 obj.data.transform(Matrix.Translation(-pivot))
 obj.location=pivot
 if name!='Chassis':
  steering=bpy.data.objects.new('Steer_'+name,None)
  bpy.context.scene.collection.objects.link(steering)
  steering.parent=root;steering.location=pivot
  obj.parent=steering;obj.location=(0,0,0)
  exported.append(steering)
 else:obj.parent=root
 exported.append(obj)
bpy.ops.object.select_all(action='DESELECT')
for obj in exported:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/environment/buggy_drivable.glb'),export_format='GLB',use_selection=True,export_animations=False)
print('EXPORTED wheel groups:',{name:len(parts) for name,parts in groups.items()})
