import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function OpenBook() {
  const leftRef = useRef()
  const rightRef = useRef()
  const spineRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (leftRef.current) {
      leftRef.current.rotation.y = -0.25 + Math.sin(t * 0.3) * 0.02
    }
    if (rightRef.current) {
      rightRef.current.rotation.y = 0.25 + Math.sin(t * 0.3 + 0.5) * 0.02
    }
    if (spineRef.current) {
      spineRef.current.rotation.y = Math.sin(t * 0.15) * 0.05
    }
  })

  return (
    <group position={[0, -0.5, 0]} rotation={[-0.3, 0, 0]}>
      {/* Left page */}
      <mesh ref={leftRef} position={[-1.1, 0, 0]}>
        <boxGeometry args={[2, 0.05, 2.8]} />
        <meshStandardMaterial
          color="#f5f0e8"
          emissive="#d4c9a8"
          emissiveIntensity={0.15}
          roughness={0.9}
        />
      </mesh>
      {/* Right page */}
      <mesh ref={rightRef} position={[1.1, 0, 0]}>
        <boxGeometry args={[2, 0.05, 2.8]} />
        <meshStandardMaterial
          color="#f5f0e8"
          emissive="#d4c9a8"
          emissiveIntensity={0.15}
          roughness={0.9}
        />
      </mesh>
      {/* Spine */}
      <mesh ref={spineRef} position={[0, -0.02, 0]}>
        <boxGeometry args={[0.2, 0.12, 2.8]} />
        <meshStandardMaterial
          color="#2d8c55"
          emissive="#1a5c35"
          emissiveIntensity={0.4}
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

function FloatingPages() {
  const groupRef = useRef()

  const pages = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 6,
        1 + Math.random() * 3,
        (Math.random() - 0.5) * 3,
      ],
      scale: 0.15 + Math.random() * 0.2,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const p = pages[i]
      if (p) {
        child.position.y = p.pos[1] + Math.sin(t * p.speed + p.phase) * 0.5
        child.position.x = p.pos[0] + Math.cos(t * p.speed * 0.7 + p.phase) * 0.2
        child.rotation.y = t * p.rotSpeed
        child.rotation.x = Math.sin(t * 0.3 + p.phase) * 0.15
        child.rotation.z = Math.sin(t * 0.2 + p.phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {pages.map((p) => (
        <mesh key={p.id} position={p.pos} scale={p.scale}>
          <planeGeometry args={[1.4, 1.8]} />
          <meshStandardMaterial
            color="#f5f0e8"
            emissive="#d4c9a8"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function QuillShapes() {
  const groupRef = useRef()

  const quills = useMemo(() => [
    { pos: [4, 1.5, -1], rot: [0, 0, -0.4], scale: 0.5 },
    { pos: [-3.5, 2, -0.5], rot: [0, 0.3, 0.3], scale: 0.35 },
    { pos: [2, 3, 0.5], rot: [0.2, -0.1, -0.2], scale: 0.3 },
  ], [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      child.position.y = quills[i].pos[1] + Math.sin(t * 0.5 + i * 1.2) * 0.3
      child.rotation.z = quills[i].rot[2] + Math.sin(t * 0.3 + i) * 0.05
    })
  })

  return (
    <group ref={groupRef}>
      {quills.map((q, i) => (
        <mesh key={i} position={q.pos} rotation={q.rot} scale={q.scale}>
          <coneGeometry args={[0.08, 1.2, 4]} />
          <meshStandardMaterial
            color="#c8611f"
            emissive="#8b4513"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function InkParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4],
      speed: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * 0.5 + p.phase) * 0.3,
        p.pos[1] + Math.cos(t * 0.4 + p.phase) * 0.25,
        p.pos[2]
      )
      dummy.scale.setScalar(0.016 + Math.sin(t + p.phase) * 0.005)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 40]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#f0aa73"
        emissive="#c8611f"
        emissiveIntensity={1.5}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

export default function JournalBookScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} color="#f5f0e8" />
        <directionalLight position={[4, 8, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-3, 2, 4]} intensity={0.8} color="#f0aa73" />
        <pointLight position={[3, -1, 2]} intensity={0.5} color="#41b878" />

        <OpenBook />
        <FloatingPages />
        <QuillShapes />
        <InkParticles />
      </Canvas>
    </div>
  )
}
