import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NODE_COUNT = 24

function NetworkNodes() {
  const groupRef = useRef()
  const linesRef = useRef()

  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => ({
      id: i,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 - 2
      ),
      size: 0.06 + Math.random() * 0.14,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '#f0aa73' : Math.random() > 0.4 ? '#41b878' : '#7ad5a0',
    }))
  }, [])

  const connections = useMemo(() => {
    const conns = []
    const threshold = 5.5
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].pos.distanceTo(nodes[j].pos)
        if (dist < threshold) {
          conns.push([i, j, dist])
        }
      }
    }
    return conns
  }, [nodes])

  const lineGeometry = useMemo(() => {
    const points = []
    connections.forEach(([i, j]) => {
      points.push(nodes[i].pos, nodes[j].pos)
    })
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [nodes, connections])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    nodes.forEach((node, i) => {
      dummy.position.set(
        node.pos.x + Math.sin(t * node.speed + node.phase) * 0.25,
        node.pos.y + Math.cos(t * node.speed * 0.8 + node.phase) * 0.2,
        node.pos.z
      )
      dummy.scale.setScalar(node.size * (0.8 + Math.sin(t * 1.5 + node.phase) * 0.2))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#29a064" transparent opacity={0.14} />
      </line>

      <instancedMesh ref={meshRef} args={[null, null, NODE_COUNT]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color="#41b878"
          emissive="#1a7a4c"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </>
  )
}

function PulseRing() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const scale = 1 + (t % 3) * 2
    meshRef.current.scale.setScalar(scale)
    meshRef.current.material.opacity = Math.max(0, 0.25 - (t % 3) * 0.08)
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <ringGeometry args={[0.8, 1, 48]} />
      <meshBasicMaterial color="#29a064" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function DataNetworkScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <pointLight position={[8, 6, 4]} intensity={1.4} color="#41b878" />
        <pointLight position={[-6, -4, 2]} intensity={0.7} color="#f0aa73" />
        <NetworkNodes />
        <PulseRing />
      </Canvas>
    </div>
  )
}
