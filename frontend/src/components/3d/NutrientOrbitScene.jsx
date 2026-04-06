import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUTRIENTS = [
  { label: 'N', color: '#41b878', emissive: '#1a7a4c', radius: 2.2, speed: 0.7, size: 0.28 },
  { label: 'P', color: '#f0aa73', emissive: '#c8611f', radius: 3.2, speed: -0.45, size: 0.22 },
  { label: 'K', color: '#7ad5a0', emissive: '#29a064', radius: 4.1, speed: 0.35, size: 0.18 },
]

function OrbitRing({ radius, color }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.3, 0))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() =>
    new THREE.BufferGeometry().setFromPoints(points)
  , [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </line>
  )
}

function NutrientBall({ nutrient, index }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime() * nutrient.speed + (index * Math.PI * 2) / 3
    meshRef.current.position.x = Math.cos(t) * nutrient.radius
    meshRef.current.position.y = Math.sin(t) * nutrient.radius * 0.3
    meshRef.current.rotation.y = t * 2
  })

  return (
    <mesh ref={meshRef} scale={nutrient.size}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={nutrient.color}
        emissive={nutrient.emissive}
        emissiveIntensity={1.4}
        roughness={0.15}
        metalness={0.7}
      />
    </mesh>
  )
}

function CoreSphere() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.55, 2]} />
      <meshStandardMaterial
        color="#29a064"
        emissive="#1a7a4c"
        emissiveIntensity={0.9}
        roughness={0.2}
        metalness={0.6}
        wireframe={false}
      />
    </mesh>
  )
}

function CoreWireframe() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = -clock.getElapsedTime() * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.58, 2]} />
      <meshStandardMaterial
        color="#7ad5a0"
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  )
}

function ParticleField() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 60 }, () => ({
      pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4],
      speed: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(clock.getElapsedTime() * 0.5 + p.phase) * 0.3,
        p.pos[1] + Math.cos(clock.getElapsedTime() * 0.4 + p.phase) * 0.3,
        p.pos[2]
      )
      dummy.scale.setScalar(0.018 + Math.sin(clock.getElapsedTime() + p.phase) * 0.006)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 60]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#29a064"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  )
}

export default function NutrientOrbitScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 3, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <pointLight position={[5, 5, 5]} intensity={1.6} color="#41b878" />
        <pointLight position={[-5, -3, 2]} intensity={0.8} color="#f0aa73" />
        <pointLight position={[0, -5, -3]} intensity={0.5} color="#7ad5a0" />

        <CoreSphere />
        <CoreWireframe />

        {NUTRIENTS.map((n, i) => (
          <group key={n.label}>
            <OrbitRing radius={n.radius} color={n.color} />
            <NutrientBall nutrient={n} index={i} />
          </group>
        ))}

        <ParticleField />
      </Canvas>
    </div>
  )
}
