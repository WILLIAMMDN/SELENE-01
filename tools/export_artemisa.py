import bpy,json,re,sys
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[sys.argv.index('--')+1])
OUT=ROOT/'public/models/artemisa';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE),load_ui=False)
def enable(c):
 c.exclude=False;c.hide_viewport=False
 for x in c.children:enable(x)
enable(bpy.context.view_layer.layer_collection)
for c in bpy.data.collections:c.hide_viewport=False
for o in bpy.data.objects:o.hide_set(False);o.hide_viewport=False
bpy.context.view_layer.update()
modules={'habitat':'Habitat','airlock':'Esclusa','laboratory':'Laboratorio','workshop':'Taller','communications':'Comunicaciones','greenhouse':'Invernadero','energy':'Energia','shelter':'Refugio','life_support':'Soporte_vital','logistics':'Aterrizaje_logistica'}
deps=bpy.context.evaluated_depsgraph_get();records=[]
for key,suffix in modules.items():
 collection=bpy.data.collections['ARTEMISA_'+suffix]
 source=[o for o in collection.all_objects if o.type in {'MESH','FONT','CURVE'} and not any('Referencia' in c.name or 'Presentacion' in c.name for c in o.users_collection)]
 points=[o.matrix_world@Vector(p) for o in source for p in o.bound_box]
 low=Vector(tuple(min(p[i] for p in points) for i in range(3)));high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
 offset=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
 made=[];groups={'Body':[],'Cover':[]};blockers=[];doors=[];floors=[]
 for o in source:
  if 'rampa' in o.name.lower():continue
  mesh=bpy.data.meshes.new_from_object(o.evaluated_get(deps));mesh.transform(Matrix.Translation(-offset)@o.matrix_world)
  item=bpy.data.objects.new(o.name+'_Web',mesh);bpy.context.scene.collection.objects.link(item);made.append(item)
  pts=[v.co for v in mesh.vertices]
  if not pts:continue
  mn=[min(v[i] for v in pts) for i in range(3)];mx=[max(v[i] for v in pts) for i in range(3)]
  box={'x':(mn[0]+mx[0])/2,'z':-(mn[1]+mx[1])/2,'hx':(mx[0]-mn[0])/2,'hz':(mx[1]-mn[1])/2,'top':mx[2],'bottom':mn[2]}
  name=o.name.lower()
  is_door=('puerta' in name and not any(w in name for w in ['armario','marco','panel','bateria'])) or ('porton' in name and not any(w in name for w in ['marco','poste','dintel','montante']))
  if is_door:
   group='Door_'+str(len(doors));groups[group]=[item];doors.append(dict(name=group,**box));continue
  if ('piso' in name or 'suelo' in name) and box['hx']>1 and box['hz']>1:floors.append(box)
  if o.type=='MESH' and mx[2]>.65 and mn[2]<1.7 and (mx[2]-mn[2])>.3 and box['hx']>.04 and box['hz']>.04 and not any(w in name for w in ['techo','piso','rampa','base_baliza','luz','rotulo','texto','indicador','panel_puerta','traje','manga','casco']):blockers.append(box)
  cover=any(w in name for w in ['techo','cubierta','cupula'])
  groups['Cover' if cover else 'Body'].append(item)
 joined=[]
 for category,items in groups.items():
  if not items:continue
  bpy.ops.object.select_all(action='DESELECT')
  for item in items:item.select_set(True)
  bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();obj=bpy.context.object;obj.name=category;joined.append(obj)
 bpy.ops.object.select_all(action='DESELECT')
 for obj in joined:obj.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(OUT/(key+'.glb')),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
 records.append({'id':key,'sourceCollection':collection.name,'width':round(high.x-low.x,3),'depth':round(high.y-low.y,3),'height':round(high.z-low.z,3),'sourceOrigin':list(offset),'objects':len(source),'doors':doors,'blockers':blockers,'floors':floors})
 for obj in joined:bpy.data.objects.remove(obj,do_unlink=True)
(OUT/'modules.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
(ROOT/'src/world/artemisaModules.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('EXPORTED',[(r['id'],len(r['doors']),len(r['blockers'])) for r in records])
