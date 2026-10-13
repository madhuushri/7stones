import React, { useMemo } from 'react';
import * as THREE from 'three';

export const Playground: React.FC = () => {
  // Trees distribution around playground borders
  const treePositions = useMemo(() => {
    const list: [number, number, number, number][] = [];
    const radius = 28;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = radius + (Math.sin(i * 3) * 3);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 0.8 + (i % 3) * 0.25;
      list.push([x, 0, z, scale]);
    }
    return list;
  }, []);

  // Background houses / buildings
  const housePositions = useMemo(() => {
    return [
      { pos: [-34, 0, -10] as [number, number, number], rot: 0.3, wallColor: '#FED7AA', roofColor: '#EA580C', size: [10, 6, 8] as [number, number, number] },
      { pos: [34, 0, -8] as [number, number, number], rot: -0.4, wallColor: '#FEF08A', roofColor: '#C2410C', size: [12, 7, 9] as [number, number, number] },
      { pos: [-15, 0, -36] as [number, number, number], rot: 0.1, wallColor: '#E2E8F0', roofColor: '#B45309', size: [14, 6.5, 9] as [number, number, number] },
      { pos: [18, 0, -35] as [number, number, number], rot: -0.2, wallColor: '#FDE68A', roofColor: '#DC2626', size: [11, 6, 8] as [number, number, number] },
    ];
  }, []);

  return (
    <group>
      {/* Dynamic Warm Outdoor Lighting */}
      <ambientLight intensity={0.65} color="#FEF3C7" />
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
        color="#FFFBEB"
      />
      <hemisphereLight args={['#60A5FA', '#15803D', 0.4]} />

      {/* Main Ground: Grass Turf with Warm Earth Undertone */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.85} />
      </mesh>

      {/* Inner Playing Court Field (Dusty Sandy Clay Indian Playground) */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.7} />
      </mesh>

      {/* Chalk Court Boundary Lines */}
      {/* Outer Boundary Box */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshBasicMaterial color="#FFFFFF" wireframe wireframeLinewidth={3} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>

      {/* Center Stone Circle Pedestal */}
      <group position={[0, 0.03, 0]}>
        {/* Ring outline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.05, 48]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
        {/* Pedestal Pad */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[1.5, 1.7, 0.1, 32]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
        </mesh>
        {/* Center Target Bullseye */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.6, 24]} />
          <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
        </mesh>
      </group>

      {/* Throwing Crease Lines (Runners throw from behind this line) */}
      <group position={[0, 0.04, 9]}>
        {/* Crease line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 0.3]} />
          <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
        {/* Text / Marker Sign post */}
        <mesh position={[9, 0.75, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 12]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[9, 1.3, 0]}>
          <boxGeometry args={[1.8, 0.5, 0.1]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>
      </group>

      {/* Opposite Throwing Line */}
      <group position={[0, 0.04, -9]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 0.3]} />
          <meshBasicMaterial color="#FBBF24" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      </group>

      {/* Safe Zones (Marked Circles in Two Corners) */}
      {[[-14, 14], [14, -14]].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.035, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 2.7, 32]} />
            <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.5, 32]} />
            <meshBasicMaterial color="#A7F3D0" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </mesh>
        </group>
      ))}

      {/* Boundary Fences around the playing field */}
      {[-18, 18].map((x) => (
        <group key={`fence-x-${x}`} position={[x, 0, 0]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0, 0.7, (i - 4) * 4]} castShadow>
              <boxGeometry args={[0.2, 1.4, 0.2]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.15, 0.1, 36]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.15, 0.1, 36]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {[-18, 18].map((z) => (
        <group key={`fence-z-${z}`} position={[0, 0, z]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[(i - 4) * 4, 0.7, 0]} castShadow>
              <boxGeometry args={[0.2, 1.4, 0.2]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[36, 0.1, 0.15]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[36, 0.1, 0.15]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Procedural Neem / Mango Playground Trees */}
      {treePositions.map(([x, y, z, scale], idx) => (
        <group key={idx} position={[x, y, z]} scale={[scale, scale, scale]}>
          {/* Trunk */}
          <mesh castShadow receiveShadow position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.45, 0.65, 4.4, 8]} />
            <meshStandardMaterial color="#713F12" roughness={0.9} />
          </mesh>
          {/* Foliage Layers */}
          <mesh castShadow position={[0, 4.5, 0]}>
            <sphereGeometry args={[2.2, 12, 12]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#15803D' : '#166534'} roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0.6, 5.2, 0.4]}>
            <sphereGeometry args={[1.6, 10, 10]} />
            <meshStandardMaterial color="#22C55E" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[-0.5, 5.0, -0.5]}>
            <sphereGeometry args={[1.7, 10, 10]} />
            <meshStandardMaterial color="#15803D" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Village Houses in Background */}
      {housePositions.map((h, idx) => (
        <group key={idx} position={h.pos} rotation={[0, h.rot, 0]}>
          {/* Main House Box */}
          <mesh castShadow receiveShadow position={[0, h.size[1] / 2, 0]}>
            <boxGeometry args={h.size} />
            <meshStandardMaterial color={h.wallColor} roughness={0.8} />
          </mesh>
          {/* Terracotta Roof */}
          <mesh castShadow position={[0, h.size[1] + 1.8, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[Math.max(h.size[0], h.size[2]) * 0.72, 3.6, 4]} />
            <meshStandardMaterial color={h.roofColor} roughness={0.6} />
          </mesh>
          {/* Arched Door */}
          <mesh position={[0, 1.5, h.size[2] / 2 + 0.05]}>
            <boxGeometry args={[1.8, 3.0, 0.1]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
          {/* Windows */}
          {[-2.5, 2.5].map((wx, wi) => (
            <mesh key={wi} position={[wx, 3.2, h.size[2] / 2 + 0.05]}>
              <boxGeometry args={[1.4, 1.4, 0.1]} />
              <meshStandardMaterial color="#0284C7" roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Spectator Benches at Side of Court */}
      {[-8, 0, 8].map((x, i) => (
        <group key={i} position={[x, 0, -20.5]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[3.6, 0.12, 0.9]} />
            <meshStandardMaterial color="#B45309" roughness={0.6} />
          </mesh>
          {/* Bench Legs */}
          {[-1.5, 1.5].map((lx, li) => (
            <mesh key={li} position={[lx, 0.25, 0]}>
              <boxGeometry args={[0.2, 0.5, 0.8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Decorative Banners: "LAGORI / SEVEN STONES TOURNAMENT" */}
      <group position={[0, 4.5, -20]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[14, 1.8]} />
          <meshStandardMaterial color="#BE123C" side={THREE.DoubleSide} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[13.4, 1.4]} />
          <meshStandardMaterial color="#FBBF24" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
