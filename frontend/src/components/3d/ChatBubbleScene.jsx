import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function AICore() {
  const meshRef = useRef()
  const wireRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.4
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.25
      wireRef.current.rotation.z = t * 0.1
    }
  })

  return (
    <>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color="#29a064"
          emissive="#1a7a4c"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>
      <mesh ref={wireRef}>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial
          color="#7ad5a0"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </>
  )
}

function ChatBubbles() {
  const groupRef = useRef()

  const bubbles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ],
      scale: 0.15 + Math.random() * 0.3,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      isUser: i % 3 === 0,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const b = bubbles[i]
      if (b) {
        child.position.y = b.pos[1] + Math.sin(t * b.speed + b.phase) * 0.5
        child.position.x = b.pos[0] + Math.cos(t * b.speed * 0.6 + b.phase) * 0.2
        child.rotation.z = Math.sin(t * 0.3 + b.phase) * 0.08
      }
    })
  })

  return (
    <group ref={groupRef}>
      {bubbles.map((b) => (
        <mesh key={b.id} position={b.pos} scale={[b.scale * 1.6, b.scale, b.scale * 0.3]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial
            color={b.isUser ? '#41b878' : '#2d8c55'}
            emissive={b.isUser ? '#29a064' : '#1a5c35'}
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

function NeuralLinks() {
  const ref = useRef()

  const links = useMemo(() => {
    const pts = []
    for (let i = 0; i < 20; i++) {
      const from = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3
      )
      const to = new THREE.Vector3(
        from.x + (Math.random() - 0.5) * 5,
        from.y + (Math.random() - 0.5) * 3,
        from.z + (Math.random() - 0.5) * 2
      )
      pts.push(from, to)
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04
    }
  })

  return (
    <lineSegments ref={ref} geometry={links}>
      <lineBasicMaterial color="#41b878" transparent opacity={0.12} />
    </lineSegments>
  )
}

function PulseParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4],
      speed: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * 0.6 + p.phase) * 0.4,
        p.pos[1] + Math.cos(t * 0.5 + p.phase) * 0.3,
        p.pos[2]
      )
      dummy.scale.setScalar(0.02 + Math.sin(t * 1.2 + p.phase) * 0.008)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 50]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#7ad5a0"
        emissive="#41b878"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  )
}

export default function ChatBubbleScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <pointLight position={[6, 6, 5]} intensity={1.4} color="#41b878" />
        <pointLight position={[-5, -3, 3]} intensity={0.7} color="#f0aa73" />
        <pointLight position={[0, -4, -2]} intensity={0.5} color="#7ad5a0" />

        <AICore />
        <ChatBubbles />
        <NeuralLinks />
        <PulseParticles />
      </Canvas>
    </div>
  )
}
