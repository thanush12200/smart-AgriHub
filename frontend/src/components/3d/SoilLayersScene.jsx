import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const LAYERS = [
  { y: 1.6,  depth: 0.5,  color: '#2d8c55', emissive: '#1a5c35', label: 'Topsoil',    opacity: 1 },
  { y: 0.9,  depth: 0.6,  color: '#4a6741', emissive: '#2d4a28', label: 'Root Zone',   opacity: 1 },
  { y: 0.1,  depth: 0.7,  color: '#6b5c3e', emissive: '#4a3d28', label: 'Subsoil',     opacity: 1 },
  { y: -0.8, depth: 0.8,  color: '#8b7355', emissive: '#5e4d36', label: 'Clay Layer',  opacity: 1 },
  { y: -1.8, depth: 0.9,  color: '#5a4a35', emissive: '#3d3223', label: 'Bedrock',     opacity: 0.9 },
]

function SoilLayer({ layer, index }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.3 + index * 0.8) * 0.08
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, layer.y, 0]}
      rotation={[0, 0.12 * (index % 2 === 0 ? 1 : -1), 0]}
    >
      <boxGeometry args={[5.5 - index * 0.1, layer.depth, 3 + index * 0.2]} />
      <meshStandardMaterial
        color={layer.color}
        emissive={layer.emissive}
        emissiveIntensity={0.2}
        roughness={0.9}
        metalness={0.0}
        transparent
        opacity={layer.opacity}
      />
    </mesh>
  )
}

function SoilEdges({ layer, index }) {
  return (
    <lineSegments position={[0, layer.y, 0]} rotation={[0, 0.12 * (index % 2 === 0 ? 1 : -1), 0]}>
      <edgesGeometry args={[new THREE.BoxGeometry(5.5 - index * 0.1, layer.depth, 3 + index * 0.2)]} />
      <lineBasicMaterial color="#41b878" transparent opacity={0.15} />
    </lineSegments>
  )
}

function RootSystem() {
  const groupRef = useRef()

  const roots = useMemo(() => {
    const pts = []
    for (let i = 0; i < 16; i++) {
      const x = (Math.random() - 0.5) * 3
      const y0 = 1.6
      const y1 = -1.5 + Math.random() * 0.8
      const xBend = x + (Math.random() - 0.5) * 1.2
      pts.push({ x, y0, y1, xBend })
    }
    return pts
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const root = roots[i]
        if (root) {
          child.material.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 0.6 + i) * 0.08
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {roots.map((root, i) => {
        const points = [
          new THREE.Vector3(root.x, root.y0, 0),
          new THREE.Vector3(root.xBend, (root.y0 + root.y1) / 2, 0.3),
          new THREE.Vector3(root.x + (Math.random() - 0.5) * 0.5, root.y1, 0),
        ]
        const curve = new THREE.QuadraticBezierCurve3(...points)
        const curvePoints = curve.getPoints(20)
        const geo = new THREE.BufferGeometry().setFromPoints(curvePoints)
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#7ad5a0" transparent opacity={0.3} />
          </line>
        )
      })}
    </group>
  )
}

function MoistureParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      pos: [(Math.random() - 0.5) * 5, -3.5 + Math.random() * 5, (Math.random() - 0.5) * 2],
      speed: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(clock.getElapsedTime() * 0.5 + p.phase) * 0.15,
        ((p.pos[1] + clock.getElapsedTime() * p.speed * 8) % 5 + 5) % 5 - 3.5,
        p.pos[2]
      )
      dummy.scale.setScalar(0.025)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 40]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#7dd3fc"
        emissive="#38bdf8"
        emissiveIntensity={1.5}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

export default function SoilLayersScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [4, 0.5, 7], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} color="#d4edd9" />
        <directionalLight position={[5, 8, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-4, 2, 3]} intensity={0.7} color="#41b878" />

        {LAYERS.map((layer, i) => (
          <group key={layer.label}>
            <SoilLayer layer={layer} index={i} />
            <SoilEdges layer={layer} index={i} />
          </group>
        ))}

        <RootSystem />
        <MoistureParticles />
      </Canvas>
    </div>
  )
}
