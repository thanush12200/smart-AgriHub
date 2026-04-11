import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingCrates() {
  const groupRef = useRef()

  const crates = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ],
      scale: 0.2 + Math.random() * 0.35,
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      color: ['#2d8c55', '#c8611f', '#1a5c35', '#f0aa73', '#41b878'][i % 5],
      emissive: ['#1a5c35', '#8b4513', '#0a2c1b', '#c8611f', '#29a064'][i % 5],
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const c = crates[i]
      if (c) {
        child.position.y = c.pos[1] + Math.sin(t * c.speed + c.phase) * 0.4
        child.position.x = c.pos[0] + Math.cos(t * c.speed * 0.5 + c.phase) * 0.15
        child.rotation.y = t * c.rotSpeed
        child.rotation.x = Math.sin(t * 0.2 + c.phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {crates.map((c) => (
        <group key={c.id} position={c.pos}>
          <mesh scale={c.scale}>
            <boxGeometry args={[1, 0.7, 1]} />
            <meshStandardMaterial
              color={c.color}
              emissive={c.emissive}
              emissiveIntensity={0.3}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Crate edge lines */}
          <lineSegments scale={c.scale}>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 0.7, 1)]} />
            <lineBasicMaterial color="#7ad5a0" transparent opacity={0.25} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function SupplyChainLines() {
  const ref = useRef()

  const geometry = useMemo(() => {
    const pts = []
    const nodes = Array.from({ length: 8 }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      )
    )
    for (let i = 0; i < nodes.length - 1; i++) {
      pts.push(nodes[i], nodes[i + 1])
    }
    // Create a few cross-connections
    for (let i = 0; i < 4; i++) {
      const a = Math.floor(Math.random() * nodes.length)
      const b = Math.floor(Math.random() * nodes.length)
      if (a !== b) pts.push(nodes[a], nodes[b])
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.4) * 0.03
    }
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#41b878" transparent opacity={0.12} />
    </lineSegments>
  )
}

function PriceTags() {
  const groupRef = useRef()

  const tags = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 3 - 1,
      ],
      scale: 0.06 + Math.random() * 0.1,
      speed: 0.4 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const tag = tags[i]
      if (tag) {
        child.position.y = tag.pos[1] + Math.sin(t * tag.speed + tag.phase) * 0.3
        child.rotation.z = Math.sin(t * 0.5 + tag.phase) * 0.15
      }
    })
  })

  return (
    <group ref={groupRef}>
      {tags.map((tag) => (
        <mesh key={tag.id} position={tag.pos} scale={tag.scale}>
          <planeGeometry args={[2, 1.2]} />
          <meshStandardMaterial
            color="#f0aa73"
            emissive="#c8611f"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function MarketParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4],
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
      dummy.scale.setScalar(0.02 + Math.sin(t + p.phase) * 0.006)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 40]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#29a064"
        emissiveIntensity={2}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

export default function MarketCrateScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} color="#d4edd9" />
        <directionalLight position={[6, 8, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-5, 3, 3]} intensity={0.8} color="#f0aa73" />
        <pointLight position={[4, -3, 2]} intensity={0.6} color="#41b878" />

        <FloatingCrates />
        <SupplyChainLines />
        <PriceTags />
        <MarketParticles />
      </Canvas>
    </div>
  )
}
