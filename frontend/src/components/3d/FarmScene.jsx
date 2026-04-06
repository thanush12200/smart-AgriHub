import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function TerrainMesh() {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(26, 26, 60, 60)
    const pos = geo.attributes.position.array
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i]
      const z = pos[i + 2]
      pos[i + 1] =
        Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.9 +
        Math.sin(x * 0.7 + z * 0.4) * 0.45 +
        Math.sin(x * 0.18 + z * 0.22) * 1.4
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.025
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2.3, 0, 0.3]}
      position={[0, -3.5, -2]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#1a5c35"
        roughness={0.85}
        metalness={0.05}
        wireframe={false}
      />
    </mesh>
  )
}

function TerrainEdge() {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(26, 26, 60, 60)
    const pos = geo.attributes.position.array
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i]
      const z = pos[i + 2]
      pos[i + 1] =
        Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.9 +
        Math.sin(x * 0.7 + z * 0.4) * 0.45 +
        Math.sin(x * 0.18 + z * 0.22) * 1.4
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.025
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2.3, 0, 0.3]}
      position={[0, -3.52, -2]}
    >
      <meshStandardMaterial
        color="#29a064"
        roughness={1}
        metalness={0}
        wireframe
        transparent
        opacity={0.18}
      />
    </mesh>
  )
}

function FloatingOrbs() {
  const groupRef = useRef()

  const orbs = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 14,
        Math.random() * 3 - 0.5,
        (Math.random() - 0.5) * 6 - 1,
      ],
      scale: 0.08 + Math.random() * 0.16,
      speed: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const orb = orbs[i]
        if (orb) {
          child.position.y = orb.position[1] + Math.sin(clock.getElapsedTime() * orb.speed + orb.phase) * 0.4
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb) => (
        <mesh key={orb.id} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#41b878"
            emissive="#29a064"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

function CropRows() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.025
    }
  })

  const rows = useMemo(() => {
    const items = []
    for (let row = -4; row <= 4; row += 1.6) {
      for (let col = -6; col <= 6; col += 0.9) {
        items.push({
          id: `${row}-${col}`,
          pos: [col, -2.8 + Math.sin(col * 0.4) * 0.3, row - 2],
        })
      }
    }
    return items
  }, [])

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2.3, 0, 0.3]}>
      {rows.map((item) => (
        <mesh key={item.id} position={item.pos}>
          <coneGeometry args={[0.06, 0.28, 5]} />
          <meshStandardMaterial
            color="#2d8c55"
            roughness={0.7}
            emissive="#1a5c35"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} color="#d4edd9" />
      <directionalLight
        position={[8, 12, 4]}
        intensity={1.4}
        color="#f0f8e8"
        castShadow
      />
      <pointLight position={[-6, 6, -2]} intensity={0.8} color="#41b878" />
      <pointLight position={[6, 2, 4]} intensity={0.5} color="#f0aa73" />
      <hemisphereLight
        skyColor="#d4edd9"
        groundColor="#0a2c1b"
        intensity={0.5}
      />
    </>
  )
}

export default function FarmScene({ interactive = false, className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 4, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneLights />
        <TerrainMesh />
        <TerrainEdge />
        <CropRows />
        <FloatingOrbs />
        <Stars
          radius={60}
          depth={30}
          count={600}
          factor={1.8}
          saturation={0.2}
          fade
          speed={0.4}
        />
        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 4}
            autoRotate
            autoRotateSpeed={0.4}
          />
        )}
      </Canvas>
    </div>
  )
}
