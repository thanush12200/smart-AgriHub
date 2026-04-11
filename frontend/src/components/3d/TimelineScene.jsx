import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function HelixSpiral() {
  const lineRef = useRef()

  const geometry = useMemo(() => {
    const pts = []
    const turns = 3
    const segments = 200
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * turns * Math.PI * 2
      const x = Math.cos(t) * 2.5
      const y = (i / segments) * 8 - 4
      const z = Math.sin(t) * 2.5
      pts.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = clock.getElapsedTime() * 0.08
    }
  })

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#29a064" transparent opacity={0.25} />
    </line>
  )
}

function TimelineNodes() {
  const groupRef = useRef()

  const nodes = useMemo(() => {
    const items = []
    const turns = 3
    const count = 12
    for (let i = 0; i < count; i++) {
      const t = (i / count) * turns * Math.PI * 2
      const y = (i / count) * 8 - 4
      items.push({
        id: i,
        pos: [Math.cos(t) * 2.5, y, Math.sin(t) * 2.5],
        phase: i * 0.6,
        size: 0.1 + (i % 3) * 0.04,
        color: i % 2 === 0 ? '#41b878' : '#f0aa73',
      })
    }
    return items
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.08
    groupRef.current.children.forEach((child, i) => {
      const n = nodes[i]
      if (n) {
        child.scale.setScalar(n.size * (1 + Math.sin(t * 1.5 + n.phase) * 0.25))
      }
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n) => (
        <mesh key={n.id} position={n.pos}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataConnections() {
  const linesRef = useRef()

  const geometry = useMemo(() => {
    const pts = []
    const turns = 3
    const count = 12
    const positions = []
    for (let i = 0; i < count; i++) {
      const t = (i / count) * turns * Math.PI * 2
      const y = (i / count) * 8 - 4
      positions.push(new THREE.Vector3(Math.cos(t) * 2.5, y, Math.sin(t) * 2.5))
    }
    // Connect every other node
    for (let i = 0; i < positions.length - 2; i++) {
      pts.push(positions[i], positions[i + 2])
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.getElapsedTime() * 0.08
    }
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#7ad5a0" transparent opacity={0.12} />
    </lineSegments>
  )
}

function HelixParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6],
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
        p.pos[1] + Math.cos(t * 0.4 + p.phase) * 0.2,
        p.pos[2]
      )
      dummy.scale.setScalar(0.018 + Math.sin(t * 0.9 + p.phase) * 0.006)
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
        opacity={0.5}
      />
    </instancedMesh>
  )
}

export default function TimelineScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [5, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[5, 6, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-4, 3, 3]} intensity={0.7} color="#41b878" />
        <pointLight position={[3, -3, 2]} intensity={0.5} color="#f0aa73" />

        <HelixSpiral />
        <TimelineNodes />
        <DataConnections />
        <HelixParticles />
      </Canvas>
    </div>
  )
}
