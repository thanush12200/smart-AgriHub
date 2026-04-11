import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Globe() {
  const meshRef = useRef()
  const wireRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * 0.12
    if (wireRef.current) wireRef.current.rotation.y = t * 0.12
  })

  return (
    <>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 3]} />
        <meshStandardMaterial
          color="#1a5c35"
          emissive="#0a2c1b"
          emissiveIntensity={0.4}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[2.24, 3]} />
        <meshStandardMaterial
          color="#29a064"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </>
  )
}

function CloudBands() {
  const groupRef = useRef()

  const bands = useMemo(() => [
    { radius: 2.7, y: 0.8, speed: 0.15, opacity: 0.25, scale: [0.12, 0.04, 0.12] },
    { radius: 2.9, y: -0.3, speed: -0.1, opacity: 0.2, scale: [0.1, 0.03, 0.1] },
    { radius: 2.6, y: 1.4, speed: 0.2, opacity: 0.15, scale: [0.08, 0.025, 0.08] },
    { radius: 3.0, y: -1.1, speed: 0.12, opacity: 0.18, scale: [0.11, 0.035, 0.11] },
  ], [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const band = bands[i]
      if (band) child.rotation.y = t * band.speed
    })
  })

  return (
    <group ref={groupRef}>
      {bands.map((band, i) => (
        <mesh key={i} position={[0, band.y, 0]} scale={[band.radius, 0.15, band.radius]}>
          <torusGeometry args={[1, 0.12, 8, 48]} />
          <meshStandardMaterial
            color="#d4edd9"
            emissive="#7ad5a0"
            emissiveIntensity={0.3}
            transparent
            opacity={band.opacity}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}

function RainParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = 60

  const drops = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 6 + 3,
      y: Math.random() * 6 - 1,
      z: (Math.random() - 0.5) * 4,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * 6,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    drops.forEach((d, i) => {
      const y = ((d.y - t * d.speed * 12) % 6 + 6) % 6 - 1
      dummy.position.set(d.x + Math.sin(t * 0.3 + d.phase) * 0.1, y, d.z)
      dummy.scale.set(0.015, 0.06, 0.015)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <cylinderGeometry args={[1, 0.6, 1, 4]} />
      <meshStandardMaterial
        color="#7dd3fc"
        emissive="#38bdf8"
        emissiveIntensity={1.8}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

function AtmosphereGlow() {
  return (
    <mesh>
      <icosahedronGeometry args={[2.5, 3]} />
      <meshBasicMaterial
        color="#29a064"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function SunGlow() {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.5) * 0.03
    }
  })

  return (
    <mesh ref={ref} position={[-4, 3, -3]}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#f0aa73" transparent opacity={0.12} />
    </mesh>
  )
}

export default function WeatherGlobeScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 1, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[-5, 4, 3]} intensity={1.4} color="#f0aa73" />
        <pointLight position={[5, -2, 4]} intensity={0.8} color="#38bdf8" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#7ad5a0" />

        <Globe />
        <CloudBands />
        <RainParticles />
        <AtmosphereGlow />
        <SunGlow />
      </Canvas>
    </div>
  )
}
