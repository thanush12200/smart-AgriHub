import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function HexShield() {
  const meshRef = useRef()
  const wireRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.15
      meshRef.current.rotation.z = t * 0.05
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = Math.sin(t * 0.2) * 0.15
      wireRef.current.rotation.z = t * 0.05
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.05 + Math.sin(t * 0.8) * 0.02
    }
  })

  return (
    <>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 6]} />
        <meshStandardMaterial
          color="#29a064"
          emissive="#1a7a4c"
          emissiveIntensity={0.8}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
      <mesh ref={wireRef}>
        <cylinderGeometry args={[1.3, 1.3, 0.22, 6]} />
        <meshStandardMaterial
          color="#7ad5a0"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 6]} />
        <meshBasicMaterial
          color="#41b878"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

function OrbitingDocuments() {
  const groupRef = useRef()

  const docs = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      radius: 2.8 + Math.random() * 1.2,
      speed: 0.15 + Math.random() * 0.2,
      yOff: (Math.random() - 0.5) * 1.5,
      phase: (i / 8) * Math.PI * 2,
      scale: 0.12 + Math.random() * 0.12,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const doc = docs[i]
      if (doc) {
        const angle = t * doc.speed + doc.phase
        child.position.x = Math.cos(angle) * doc.radius
        child.position.z = Math.sin(angle) * doc.radius * 0.4
        child.position.y = doc.yOff + Math.sin(t * 0.4 + doc.phase) * 0.2
        child.rotation.y = angle + Math.PI / 2
        child.rotation.x = Math.sin(t * 0.3 + doc.phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {docs.map((doc) => (
        <mesh key={doc.id} scale={doc.scale}>
          <boxGeometry args={[1.4, 1.8, 0.05]} />
          <meshStandardMaterial
            color="#f0f8e8"
            emissive="#d4edd9"
            emissiveIntensity={0.3}
            roughness={0.6}
            metalness={0.1}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
    </group>
  )
}

function ShieldParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4],
      speed: (Math.random() - 0.5) * 0.01,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * 0.4 + p.phase) * 0.3,
        p.pos[1] + Math.cos(t * 0.35 + p.phase) * 0.25,
        p.pos[2]
      )
      dummy.scale.setScalar(0.018 + Math.sin(t * 0.8 + p.phase) * 0.006)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 50]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#29a064"
        emissiveIntensity={1.8}
        transparent
        opacity={0.55}
      />
    </instancedMesh>
  )
}

function OrbitRings() {
  const points1 = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2 * 0.3, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  const points2 = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * 3.8, Math.sin(a) * 3.8 * 0.3, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  return (
    <>
      <line geometry={points1}>
        <lineBasicMaterial color="#29a064" transparent opacity={0.15} />
      </line>
      <line geometry={points2}>
        <lineBasicMaterial color="#41b878" transparent opacity={0.1} />
      </line>
    </>
  )
}

export default function GovShieldScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[4, 6, 5]} intensity={1.4} color="#f0f8e8" />
        <pointLight position={[-4, 2, 3]} intensity={0.8} color="#41b878" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#f0aa73" />

        <HexShield />
        <OrbitingDocuments />
        <OrbitRings />
        <ShieldParticles />
      </Canvas>
    </div>
  )
}
