import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function AvatarSphere() {
  const meshRef = useRef()
  const wireRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.15
      wireRef.current.rotation.x = Math.sin(t * 0.1) * 0.1
    }
  })

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#29a064"
          emissive="#1a7a4c"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.15, 2]} />
        <meshStandardMaterial
          color="#7ad5a0"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* Face plane hint */}
      <mesh position={[0, 0.15, 0.95]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial
          color="#41b878"
          emissive="#29a064"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  )
}

function GearRings() {
  const groupRef = useRef()

  const rings = useMemo(() => [
    { radius: 2.2, speed: 0.2, tilt: [0.3, 0, 0], color: '#41b878' },
    { radius: 2.8, speed: -0.15, tilt: [0, 0.4, 0.2], color: '#f0aa73' },
    { radius: 3.4, speed: 0.1, tilt: [-0.2, 0, 0.3], color: '#7ad5a0' },
  ], [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = t * rings[i].speed
    })
  })

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.tilt}>
          <torusGeometry args={[ring.radius, 0.04, 8, 48]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function SettingNodes() {
  const groupRef = useRef()

  const nodes = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i / 6) * Math.PI * 2,
      radius: 2.5 + (i % 2) * 0.8,
      speed: 0.2 + Math.random() * 0.15,
      size: 0.08 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const n = nodes[i]
      if (n) {
        const a = t * n.speed + n.angle
        child.position.x = Math.cos(a) * n.radius
        child.position.y = Math.sin(a) * n.radius * 0.6
        child.position.z = Math.sin(a * 0.5) * 0.5
        child.rotation.y = t * 0.5
      }
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n) => (
        <mesh key={n.id} scale={n.size}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#f0aa73"
            emissive="#c8611f"
            emissiveIntensity={1}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 45 }, () => ({
      pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4],
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
      dummy.scale.setScalar(0.017 + Math.sin(t * 0.8 + p.phase) * 0.005)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 45]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#29a064"
        emissiveIntensity={1.8}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

export default function ProfileAvatarScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[4, 6, 5]} intensity={1.3} color="#f0f8e8" />
        <pointLight position={[-4, 2, 3]} intensity={0.7} color="#41b878" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#f0aa73" />

        <AvatarSphere />
        <GearRings />
        <SettingNodes />
        <DataParticles />
      </Canvas>
    </div>
  )
}
