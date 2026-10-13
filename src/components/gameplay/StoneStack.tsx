import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { StoneData } from '../../types/game';

interface StoneStackProps {
  stones: StoneData[];
  playerPos: [number, number, number];
  isRunner: boolean;
  canPlaceStone: boolean;
  canPickupStoneId: number | null;
}

// Colors for the 7 traditional stones
export const STONE_COLORS = [
  '#78716C', // Stone 0: Granite Grey
  '#C2410C', // Stone 1: Terracotta Orange
  '#B45309', // Stone 2: Indian Sandstone Ochre
  '#475569', // Stone 3: Slate Blue
  '#A16207', // Stone 4: River Rock Brown
  '#0D9488', // Stone 5: Turquoise Patina
  '#E11D48', // Stone 6: Ruby / Crimson Crown Stone
];

export const StoneStack: React.FC<StoneStackProps> = ({
  stones,
  playerPos,
  isRunner,
  canPlaceStone,
  canPickupStoneId,
}) => {
  const stonesGroupRef = useRef<THREE.Group>(null);

  return (
    <group ref={stonesGroupRef}>
      {/* Stone Placement Hologram Guide (when runner is near base carrying a stone) */}
      {isRunner && canPlaceStone && (
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.8, 32]} />
            <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
          <pointLight position={[0, 0.5, 0]} color="#10B981" intensity={2.5} distance={3} />
        </group>
      )}

      {/* Render each of the 7 stones */}
      {stones.map((stone, index) => {
        // If stone is currently carried by someone, hide it here (it renders attached to player hands)
        if (stone.isHeld) return null;

        const isNearbyPickup = canPickupStoneId === stone.id;

        return (
          <group
            key={stone.id}
            position={stone.position}
            rotation={stone.rotation}
          >
            {/* The 3D Stone Mesh: Rounded Beveled Cylinder / Flat Boulder */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry
                args={[stone.size * 0.92, stone.size, stone.height, 24]}
              />
              <meshStandardMaterial
                color={STONE_COLORS[index % STONE_COLORS.length]}
                roughness={0.75}
                metalness={0.15}
              />
            </mesh>

            {/* Decorative traditional carved band around stone */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry
                args={[stone.size * 0.93, stone.size * 1.01, stone.height * 0.35, 24]}
              />
              <meshStandardMaterial
                color="#FFFFFF"
                roughness={0.9}
                transparent
                opacity={0.25}
              />
            </mesh>

            {/* Interactive Pickup Pulsing Ring & Indicator */}
            {isNearbyPickup && isRunner && (
              <group position={[0, stone.height + 0.3, 0]}>
                {/* Floating Pickup Arrow / Diamond */}
                <mesh rotation={[0, Math.PI / 4, 0]}>
                  <octahedronGeometry args={[0.22, 0]} />
                  <meshBasicMaterial color="#FBBF24" wireframe />
                </mesh>
                <pointLight color="#F59E0B" intensity={1.5} distance={2} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
