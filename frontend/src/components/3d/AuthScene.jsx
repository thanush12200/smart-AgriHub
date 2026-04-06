import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 120 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 8 - 4,
      ],
      speed: 0.008 + Math.random() * 0.012,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      scale: 0.04 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.003,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.drift * 50 + p.phase) * 0.8,
        (((p.position[1] + t * p.speed * 6) % 20) + 20) % 20 - 10,
        p.position[2]
      )
      dummy.rotation.z = t * p.rotSpeed + p.phase
      dummy.scale.setScalar(p.scale * (0.85 + Math.sin(t * 0.8 + p.phase) * 0.15))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <planeGeometry args={[1, 1.6]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#1a7a4c"
        emissiveIntensity={0.6}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

function GlowOrbs({ count = 14 }) {
  const groupRef = useRef()

  const orbs = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: [
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 5 - 2,
      ],
      scale: 0.05 + Math.random() * 0.18,
      speed: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '#f0aa73' : '#41b878',
    }))
  , [count])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i]
      if (orb) {
        child.position.y = orb.pos[1] + Math.sin(t * orb.speed + orb.phase) * 0.6
        child.position.x = orb.pos[0] + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.3
      }
    })
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos} scale={orb.scale}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={1.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

function GridLines() {
  const lineRef = useRef()

  const geometry = useMemo(() => {
    const points = []
    for (let x = -10; x <= 10; x += 1.2) {
      points.push(new THREE.Vector3(x, -10, 0))
      points.push(new THREE.Vector3(x, 10, 0))
    }
    for (let y = -10; y <= 10; y += 1.2) {
      points.push(new THREE.Vector3(-10, y, 0))
      points.push(new THREE.Vector3(10, y, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.4) * 0.02
    }
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry} position={[0, 0, -6]}>
      <lineBasicMaterial color="#29a064" transparent opacity={0.07} />
    </lineSegments>
  )
}

export default function AuthScene({ className = '' }) {
  return (
    <div
      className={`w-full h-full ${className}`}
      style={{
        background: 'linear-gradient(160deg, #040d08 0%, #071510 50%, #0a1e14 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.3} color="#d4edd9" />
        <pointLight position={[5, 8, 5]} intensity={1.2} color="#41b878" />
        <pointLight position={[-5, -4, 3]} intensity={0.6} color="#f0aa73" />
        <GridLines />
        <Particles count={100} />
        <GlowOrbs count={12} />
      </Canvas>
    </div>
  )
}
