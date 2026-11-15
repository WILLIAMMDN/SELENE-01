import { Box3, Mesh, PerspectiveCamera, SkinnedMesh, Vector3, type Object3D } from 'three'

/** Measure the visible outfit in its current skeletal and morph pose. */
export function visiblePreviewBounds(root: Object3D) {
  const bounds = new Box3()
  const point = new Vector3()
  root.updateWorldMatrix(true, true)
  root.traverseVisible((object) => {
    if (!(object instanceof Mesh)) return
    if (object instanceof SkinnedMesh) object.skeleton.update()
    const position = object.geometry.getAttribute('position')
    if (!position) return
    for (let index = 0; index < position.count; index++) {
      object.getVertexPosition(index, point)
      bounds.expandByPoint(point.applyMatrix4(object.matrixWorld))
    }
  })
  return bounds
}

/** Fit every box corner with a margin, preserving the whole head and footwear. */
export function framePreview(camera: PerspectiveCamera, bounds: Box3, aspect: number) {
  if (bounds.isEmpty() || !Number.isFinite(aspect) || aspect <= 0) return
  const center = bounds.getCenter(new Vector3())
  const direction = new Vector3(0, 0.08, 1).normalize()
  const right = new Vector3(1, 0, 0)
  const up = direction.clone().cross(right).normalize()
  const vertical = Math.tan((camera.fov * Math.PI) / 360)
  const horizontal = vertical * aspect
  let distance = 0
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(center)
        distance = Math.max(
          distance,
          corner.dot(direction) + (1.16 * Math.abs(corner.dot(right))) / horizontal,
          corner.dot(direction) + (1.16 * Math.abs(corner.dot(up))) / vertical,
        )
      }
    }
  }
  camera.aspect = aspect
  camera.position.copy(center).addScaledVector(direction, distance)
  camera.lookAt(center)
  camera.near = 0.05
  camera.far = Math.max(20, distance + bounds.getSize(new Vector3()).length() * 3)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld(true)
}
