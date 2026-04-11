import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function DeliveryPath() {
  const lineRef = useRef()

  const { geometry, curveRef } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, -1, 0),
      new THREE.Vector3(-4, 1, -1),
      new THREE.Vector3(-1, -0.5, 0.5),
      new THREE.Vector3(2, 1.5, -0.5),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(7, 1, -0.5),
    ])
    const points = curve.getPoints(100)
    return {
      geometry: new THREE.BufferGeometry().setFromPoints(points),
      curveRef: curve,
    }
  }, [])

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  return (
    <>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color="#29a064" transparent opacity={0.22} linewidth={1} />
      </line>
    </>
  )
}

function SlidingBoxes() {
  const groupRef = useRef()

  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, -1, 0),
    new THREE.Vector3(-4, 1, -1),
    new THREE.Vector3(-1, -0.5, 0.5),
    new THREE.Vector3(2, 1.5, -0.5),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(7, 1, -0.5),
  ]), [])

  const boxes = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      offset: i * 0.2,
      speed: 0.06 + Math.random() * 0.03,
      scale: 0.15 + Math.random() * 0.1,
      color: ['#2d8c55', '#c8611f', '#41b878', '#f0aa73', '#29a064'][i],
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const box = boxes[i]
      if (box) {
        const progress = ((t * box.speed + box.offset) % 1 + 1) % 1
        const pos = curve.getPoint(progress)
        child.position.copy(pos)
        child.position.y += 0.15
        child.rotation.y = t * 0.3 + i
        child.rotation.x = Math.sin(t * 0.5 + i) * 0.15
      }
    })
  })

  return (
    <group ref={groupRef}>
      {boxes.map((box) => (
        <group key={box.id}>
          <mesh scale={box.scale}>
            <boxGeometry args={[1, 0.7, 0.8]} />
            <meshStandardMaterial
              color={box.color}
              emissive={box.color}
              emissiveIntensity={0.3}
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CheckpointNodes() {
  const groupRef = useRef()

  const nodes = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, -1, 0),
      new THREE.Vector3(-4, 1, -1),
      new THREE.Vector3(-1, -0.5, 0.5),
      new THREE.Vector3(2, 1.5, -0.5),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(7, 1, -0.5),
    ])
    return [0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => ({
      id: i,
      pos: curve.getPoint(t),
      phase: i * 1.1,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const n = nodes[i]
      if (n) {
        child.scale.setScalar(0.1 + Math.sin(t * 1.5 + n.phase) * 0.03)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n) => (
        <mesh key={n.id} position={n.pos}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#41b878"
            emissive="#29a064"
            emissiveIntensity={1.4}
            roughness={0.15}
            metalness={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

function TrackParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4],
      speed: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * 0.5 + p.phase) * 0.2,
        p.pos[1] + Math.cos(t * 0.4 + p.phase) * 0.2,
        p.pos[2]
      )
      dummy.scale.setScalar(0.015 + Math.sin(t + p.phase) * 0.005)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 40]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#7ad5a0"
        emissive="#41b878"
        emissiveIntensity={1.6}
        transparent
        opacity={0.45}
      />
    </instancedMesh>
  )
}

export default function OrderTrackScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 1, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[5, 6, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-4, 2, 3]} intensity={0.7} color="#41b878" />
        <pointLight position={[4, -2, 2]} intensity={0.5} color="#f0aa73" />

        <DeliveryPath />
        <SlidingBoxes />
        <CheckpointNodes />
        <TrackParticles />
      </Canvas>
    </div>
  )
}
