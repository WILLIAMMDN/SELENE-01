import { Vector3, type Object3D } from 'three'

/** A seat anchor represents the pelvis, while standing actors keep their authored floor offset. */
export function alignSeatedPose(
  root: Object3D,
  hips: Object3D | undefined,
  origin: Vector3,
  seated: boolean,
  offset: Vector3,
) {
  root.position.copy(origin)
  if (!seated || !hips) return
  root.updateMatrixWorld(true)
  hips.getWorldPosition(offset)
  root.worldToLocal(offset)
  root.position.copy(offset).multiplyScalar(-root.scale.x)
  root.updateMatrixWorld(true)
}
