
import {
  useRef,
  useState,
  useMemo,
  useEffect,
  type ComponentRef,
  type RefObject,
} from 'react'

import { Canvas, useFrame } from '@react-three/fiber'

import {
  Environment,
  Lightformer,
  TrackballControls,
} from '@react-three/drei'

import * as THREE from 'three'

import RingModel from './RingModel'
import RingControls from './RingControls'

import useRingStore from '../../store/useRingStore'

import {
  findOption,
  metals,
} from '../../data/ringOptions'

type RingViewerProps = {
  className?: string
}

type RotationControls = ComponentRef<typeof TrackballControls>

// A raised three-quarter product view, shared by initial framing and reset.
const DEFAULT_CAMERA_POSITION: [number, number, number] = [2.8, 4.4, 3.8]
const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0.18, 0]
const DEFAULT_CAMERA_UP: [number, number, number] = [0, 1, 0]
const DEFAULT_CAMERA_FOV = 28

function ViewerRotation({ controlsRef, autoRotate }: {
  controlsRef: RefObject<RotationControls | null>
  autoRotate: boolean
}) {
  const dragging = useRef(false)
  const axis = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  // Run before Drei updates the trackball. Rotating up as well as position
  // preserves the viewing frame after the user has tumbled past a pole.
  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !controls.enabled || !autoRotate || dragging.current) return
    const angle = Math.min(delta, 0.05) * (Math.PI * 2 / 60) * 0.7
    controls.object.position.sub(controls.target).applyAxisAngle(axis, angle).add(controls.target)
    controls.object.up.applyAxisAngle(axis, angle)
  }, -2)

  return (
    <TrackballControls
      ref={controlsRef}
      makeDefault
      noPan
      noZoom
      rotateSpeed={2}
      staticMoving={false}
      dynamicDampingFactor={0.12}
      target={DEFAULT_CAMERA_TARGET}
      onStart={() => { dragging.current = true }}
      onEnd={() => { dragging.current = false }}
    />
  )
}

function StudioBackdrop() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')!
    // Match the existing CSS gradient, but also make it available to Three's
    // transmission buffer. A CSS-only backdrop cannot be refracted by a gem.
    const gradient = context.createRadialGradient(256, 179, 0, 256, 179, 450)
    gradient.addColorStop(0, '#faf8f3')
    gradient.addColorStop(0.65, '#eee9df')
    gradient.addColorStop(1, '#e2dbcf')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 512)
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <primitive attach="background" object={texture} />
}

const RingViewer = ({
  className = '',
}: RingViewerProps) => {
  const controlsRef =
    useRef<RotationControls>(null)

  const [autoRotate, setAutoRotate] = useState(false)
  const [controlsVersion, setControlsVersion] = useState(0)

  const diamond = useRingStore(
    (state) => state.diamond,
  )

  const setting = useRingStore(
    (state) => state.setting,
  )

  const band = useRingStore(
    (state) => state.band,
  )

  const carat = useRingStore(
    (state) => state.carat,
  )

  const metalId = useRingStore(
    (state) => state.metal,
  )

  const metal = findOption(metals, metalId)

  return (
    <div
      className={[
        'relative w-full overflow-hidden',
        'rounded-2xl border border-border',
        'bg-[radial-gradient(ellipse_at_50%_35%,#faf8f3_0%,#eee9df_65%,#e2dbcf_100%)]',
        className,
      ].join(' ')}
    >
      {/* Preview information */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a7060]">
          Live preview
        </p>

        <p className="mt-1 font-display text-xs uppercase tracking-[0.14em] text-[#231f1a]">
          {metal.label}
        </p>
      </div>

      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          up: DEFAULT_CAMERA_UP,
          fov: DEFAULT_CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.75,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <StudioBackdrop />
        {/* Capture once: bright softboxes against dark studio walls give
            polished metal and adjacent facets distinct reflection regions.
            Softboxes stay outside the product view; the cream backdrop is
            rendered separately for physical transmission. */}
        <Environment background={false} frames={1} resolution={256} environmentIntensity={1}>
          <color attach="background" args={['#60656d']} />
          <Lightformer position={[-3, 5, 2]} scale={[3, 4]} intensity={3} />
          <Lightformer position={[4, 2, 1]} scale={[0.8, 5]} intensity={4} />
          <Lightformer position={[-2, 1, -4]} scale={[2, 3]} intensity={2} />
          <Lightformer position={[0, 4, -5]} scale={[0.9, 3]} intensity={4} />
          <Lightformer position={[2, 5, -3]} scale={[0.5, 2]} intensity={3} />
          <Lightformer position={[-1.5, 4, -3]} scale={[1, 4]} color="#07090c" intensity={1} />
          <Lightformer position={[0, -3, 2]} scale={[3, 1]} intensity={1} />
        </Environment>

        <ambientLight intensity={0.06} />

        <directionalLight
          position={[3, 5, 5]}
          intensity={0.65}
          color="#ffffff"
        />

        <directionalLight
          position={[-4, 2, -3]}
          intensity={0.25}
          color="#fff2df"
        />

        <RingModel
          metalColor={metal.hex}
          diamond={diamond}
          setting={setting}
          band={band}
          carat={carat}
        />

        <ViewerRotation key={controlsVersion} controlsRef={controlsRef} autoRotate={autoRotate} />
      </Canvas>

      <RingControls
        autoRotate={autoRotate}
        onToggleAutoRotate={() =>
          setAutoRotate((value) => !value)
        }
        onReset={() => {
          const controls = controlsRef.current
          if (!controls) return
          // Stop the old controls immediately so a pending damping frame
          // cannot move the camera before the fresh controls mount.
          controls.enabled = false
          controls.object.position.set(...DEFAULT_CAMERA_POSITION)
          controls.object.up.set(...DEFAULT_CAMERA_UP)
          controls.target.set(...DEFAULT_CAMERA_TARGET)
          controls.object.lookAt(controls.target)
          // Recreate controls to discard the previous drag's damping momentum.
          setControlsVersion(version => version + 1)
        }}
      />
    </div>
  )
}

export default RingViewer
