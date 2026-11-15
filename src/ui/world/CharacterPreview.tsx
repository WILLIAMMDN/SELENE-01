import {
  Component,
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera, type Group } from 'three'
import ExplorerCharacter from '../../world/ExplorerCharacter'
import { createCharacterMotion } from '../../world/characterMotion'
import { characterInfo, type CharacterId } from '../../world/characters'
import type { Outfit } from '../../world/wardrobe'
import { framePreview, visiblePreviewBounds } from './previewFraming'

function PreviewCamera({
  target,
  revision,
}: {
  target: RefObject<Group | null>
  revision: number
}) {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    if (!revision || !target.current) {
      camera.position.set(0, 1, 4.8)
      camera.lookAt(0, 1, 0)
      camera.updateMatrixWorld(true)
      return
    }
    framePreview(camera, visiblePreviewBounds(target.current), size.width / size.height)
  }, [camera, size.width, size.height, revision, target])
  return null
}

class PreviewBoundary extends Component<
  { children: ReactNode; portrait: string; name: string },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <img className="crew-preview-portrait" src={this.props.portrait} alt={this.props.name} />
    ) : (
      this.props.children
    )
  }
}

function PreviewSession({
  character,
  outfit = 'formal',
  helmet = true,
  reduced = false,
}: {
  character: CharacterId
  outfit?: Outfit
  helmet?: boolean
  reduced?: boolean
}) {
  const motion = useRef(createCharacterMotion())
  const stage = useRef<Group>(null)
  const [revision, setRevision] = useState(0)
  const onReady = useCallback(() => setRevision((value) => value + 1), [])
  const info = characterInfo(character)
  const portrait = `${import.meta.env.BASE_URL}${info.portrait}`
  return (
    <div className="crew-preview" role="img" aria-label={`Vista previa de ${info.name}`}>
      {!revision && <span className="crew-preview-loading">Preparando personaje…</span>}
      <PreviewBoundary key={`${character}-${outfit}`} portrait={portrait} name={info.name}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.05, 4.1], fov: 32, near: 0.1, far: 20 }}
          gl={{ alpha: true, antialias: true }}
          fallback={<img className="crew-preview-portrait" src={portrait} alt={info.name} />}
        >
          <ambientLight intensity={1.8} color="#e7eee2" />
          <directionalLight position={[-3, 5, 4]} intensity={2.5} color="#fff0d8" />
          <directionalLight position={[3, 3, -2]} intensity={1.2} color="#a4c5c2" />
          <PreviewCamera target={stage} revision={revision} />
          <group ref={stage}>
            <Suspense fallback={null}>
              <group rotation={[0, 0.15, 0]}>
                <ExplorerCharacter
                  character={character}
                  outfit={outfit}
                  helmet={helmet}
                  motion={motion}
                  reduced={reduced}
                  previewTarget="wardrobe"
                  onReady={onReady}
                />
              </group>
            </Suspense>
            <mesh position={[0, -0.035, 0]}>
              <cylinderGeometry args={[0.62, 0.69, 0.06, 48]} />
              <meshToonMaterial color="#b8c8b9" />
            </mesh>
          </group>
        </Canvas>
      </PreviewBoundary>
    </div>
  )
}

export default function CharacterPreview(props: {
  character: CharacterId
  outfit?: Outfit
  helmet?: boolean
  reduced?: boolean
}) {
  return <PreviewSession key={`${props.character}-${props.outfit}`} {...props} />
}
