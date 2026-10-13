import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BallState } from '../../types/game';

interface BallProps {
  ballState: BallState;
  isAiming?: boolean;
}

export const Ball: React.FC<BallProps> = ({ ballState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // If held by someone, the ball can be rendered in that player's hand,
  // or positioned at the ballState.position (which tracks the player's throwing hand).
  return (
    <group position={ballState.position}>
      {/* 3D Tennis / Lagori Ball */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#A3E635" // Bright vibrant tennis ball lime-yellow
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Ball seam line */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.222, 0.012, 12, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Motion glow when flying freely */}
      {ballState.isFree && (
        <pointLight
          ref={glowRef}
          color="#BEF264"
          intensity={1.2}
          distance={2.5}
        />
      )}

      {/* Shadow indicator on ground if high up */}
      {ballState.position[1] > 0.4 && (
        <mesh
          position={[0, -ballState.position[1] + 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[Math.max(0.1, 0.35 - ballState.position[1] * 0.04), 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};
