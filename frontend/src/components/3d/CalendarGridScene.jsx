import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function MonthGrid() {
  const groupRef = useRef()

  // 4 rows × 3 cols representing 12 months
  const tiles = useMemo(() => {
    const items = []
    const sowMonths = [5, 6, 7, 9, 10, 11] // May-Jul, Sep-Nov
    const harvestMonths = [1, 2, 3, 4, 8, 9, 10, 11, 12] // scattered harvest

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const month = row * 3 + col + 1
        const isSow = sowMonths.includes(month)
        const isHarvest = harvestMonths.includes(month) && !isSow

        items.push({
          id: month,
          pos: [(col - 1) * 1.4, (1.5 - row) * 1.2, 0],
          color: isSow ? '#29a064' : isHarvest ? '#f0aa73' : '#2a3a30',
          emissive: isSow ? '#1a7a4c' : isHarvest ? '#c8611f' : '#1a2a20',
          emissiveIntensity: isSow || isHarvest ? 0.6 : 0.1,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }
    return items
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.12
    groupRef.current.rotation.x = -0.2 + Math.sin(t * 0.1) * 0.04
    groupRef.current.children.forEach((child, i) => {
      const tile = tiles[i]
      if (tile) {
        child.position.z = Math.sin(t * 0.5 + tile.phase) * 0.12
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {tiles.map((tile) => (
        <group key={tile.id} position={tile.pos}>
          <mesh>
            <boxGeometry args={[1.1, 0.9, 0.15]} />
            <meshStandardMaterial
              color={tile.color}
              emissive={tile.emissive}
              emissiveIntensity={tile.emissiveIntensity}
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.1, 0.9, 0.15)]} />
            <lineBasicMaterial color="#7ad5a0" transparent opacity={0.2} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function SeasonParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = 45

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5 - 1],
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      isLeaf: i < 20,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      if (p.isLeaf) {
        // Leaves drift downward
        dummy.position.set(
          p.pos[0] + Math.sin(t * 0.6 + p.phase) * 0.5,
          ((p.pos[1] - t * p.speed * 2) % 8 + 8) % 8 - 4,
          p.pos[2]
        )
        dummy.rotation.set(t * 0.3 + p.phase, t * 0.2, t * 0.1 + p.phase)
        dummy.scale.set(0.04, 0.06, 0.01)
      } else {
        // Ambient particles
        dummy.position.set(
          p.pos[0] + Math.sin(t * 0.4 + p.phase) * 0.2,
          p.pos[1] + Math.cos(t * 0.35 + p.phase) * 0.2,
          p.pos[2]
        )
        dummy.scale.setScalar(0.018 + Math.sin(t + p.phase) * 0.006)
      }
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#7ad5a0"
        emissive="#41b878"
        emissiveIntensity={1.5}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

function SeasonRings() {
  const ring1 = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * 4.5, Math.sin(a) * 4.5 * 0.25, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  return (
    <line geometry={ring1}>
      <lineBasicMaterial color="#29a064" transparent opacity={0.12} />
    </line>
  )
}

export default function CalendarGridScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [2, 2, 8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#d4edd9" />
        <directionalLight position={[5, 6, 4]} intensity={1.2} color="#f0f8e8" />
        <pointLight position={[-4, 2, 3]} intensity={0.7} color="#41b878" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#f0aa73" />

        <MonthGrid />
        <SeasonParticles />
        <SeasonRings />
      </Canvas>
    </div>
  )
}
