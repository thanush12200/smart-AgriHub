import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CircuitTraces() {
  const ref = useRef()

  const geometry = useMemo(() => {
    const pts = []
    // Horizontal traces
    for (let y = -4; y <= 4; y += 1.2) {
      const xStart = -8 + Math.random() * 2
      const xEnd = 6 + Math.random() * 2
      pts.push(new THREE.Vector3(xStart, y, 0))
      pts.push(new THREE.Vector3(xEnd, y, 0))
      // Add some zigzag breaks
      const breakX = xStart + (xEnd - xStart) * (0.3 + Math.random() * 0.4)
      pts.push(new THREE.Vector3(breakX, y, 0))
      pts.push(new THREE.Vector3(breakX + 0.5, y + 0.6, 0))
    }
    // Vertical traces
    for (let x = -6; x <= 6; x += 1.5) {
      const yStart = -4 + Math.random() * 1
      const yEnd = 3 + Math.random() * 1
      pts.push(new THREE.Vector3(x, yStart, 0))
      pts.push(new THREE.Vector3(x, yEnd, 0))
    }
    // Diagonal connections
    for (let i = 0; i < 10; i++) {
      const x1 = (Math.random() - 0.5) * 14
      const y1 = (Math.random() - 0.5) * 8
      pts.push(new THREE.Vector3(x1, y1, 0))
      pts.push(new THREE.Vector3(x1 + (Math.random() - 0.5) * 3, y1 + (Math.random() - 0.5) * 2, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.3) * 0.03
    }
  })

  return (
    <lineSegments ref={ref} geometry={geometry} position={[0, 0, -1]}>
      <lineBasicMaterial color="#29a064" transparent opacity={0.13} />
    </lineSegments>
  )
}

function JunctionNodes() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = 30

  const junctions = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, -1],
      size: 0.05 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
      isActive: i < 10,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    junctions.forEach((j, i) => {
      dummy.position.set(j.pos[0], j.pos[1], j.pos[2])
      const pulse = j.isActive ? (1 + Math.sin(t * j.speed + j.phase) * 0.4) : 0.7
      dummy.scale.setScalar(j.size * pulse)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial
        color="#41b878"
        emissive="#29a064"
        emissiveIntensity={1.6}
        roughness={0.15}
        metalness={0.6}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}

function EnergyFlow() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = 20

  const flows = useMemo(() =>
    Array.from({ length: count }, () => {
      const isHorizontal = Math.random() > 0.5
      const fixedPos = (Math.random() - 0.5) * 8
      return {
        isHorizontal,
        fixedPos,
        range: 14,
        speed: 1.5 + Math.random() * 2,
        offset: Math.random() * 14,
      }
    })
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    flows.forEach((f, i) => {
      const progress = ((t * f.speed + f.offset) % f.range) - f.range / 2
      if (f.isHorizontal) {
        dummy.position.set(progress, f.fixedPos, -0.8)
      } else {
        dummy.position.set(f.fixedPos, progress, -0.8)
      }
      dummy.scale.setScalar(0.035)
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
        emissiveIntensity={2.5}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}

function ChipComponents() {
  const groupRef = useRef()

  const chips = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        -0.5,
      ],
      scale: 0.15 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const chip = chips[i]
      if (chip) {
        child.position.z = chip.pos[2] + Math.sin(t * 0.5 + chip.phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {chips.map((chip) => (
        <group key={chip.id} position={chip.pos}>
          <mesh scale={chip.scale}>
            <boxGeometry args={[1.2, 0.8, 0.12]} />
            <meshStandardMaterial
              color="#1a5c35"
              emissive="#0a2c1b"
              emissiveIntensity={0.3}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          <lineSegments scale={chip.scale}>
            <edgesGeometry args={[new THREE.BoxGeometry(1.2, 0.8, 0.12)]} />
            <lineBasicMaterial color="#41b878" transparent opacity={0.3} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

function AmbientParticles() {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 3],
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    pts.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * 0.3 + p.phase) * 0.2,
        p.pos[1] + Math.cos(t * 0.25 + p.phase) * 0.15,
        p.pos[2]
      )
      dummy.scale.setScalar(0.013 + Math.sin(t * 0.7 + p.phase) * 0.004)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 30]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#f0aa73"
        emissive="#c8611f"
        emissiveIntensity={1.5}
        transparent
        opacity={0.4}
      />
    </instancedMesh>
  )
}

export default function CircuitBoardScene({ className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.35} color="#d4edd9" />
        <pointLight position={[6, 5, 4]} intensity={1.2} color="#41b878" />
        <pointLight position={[-5, -3, 3]} intensity={0.6} color="#f0aa73" />
        <pointLight position={[0, 0, 5]} intensity={0.4} color="#7ad5a0" />

        <CircuitTraces />
        <JunctionNodes />
        <EnergyFlow />
        <ChipComponents />
        <AmbientParticles />
      </Canvas>
    </div>
  )
}
