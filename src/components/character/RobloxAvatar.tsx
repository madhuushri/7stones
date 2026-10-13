import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CharacterCustomization, AvatarAnimationState, TeamType } from '../../types/game';

interface RobloxAvatarProps {
  customization: CharacterCustomization;
  team: TeamType;
  animation: AvatarAnimationState;
  isHuman?: boolean;
  isEliminated?: boolean;
  carryingStoneIndex?: number | null;
  position?: [number, number, number];
  rotation?: number; // radians
  name?: string;
  lives?: number;
}

// Global texture cache to prevent creating new canvases and textures on re-renders
const faceTextureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateFaceTexture(skinTone: string, faceExpression: string): THREE.CanvasTexture {
  const key = `${skinTone}_${faceExpression}`;
  if (faceTextureCache.has(key)) {
    return faceTextureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    faceTextureCache.set(key, dummy);
    return dummy;
  }

  // Background skin tone
  ctx.fillStyle = skinTone || '#FCD34D';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';

  // Eyes
  if (faceExpression === 'cool') {
    // Sunglasses style
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(50, 75, 60, 40);
    ctx.fillRect(146, 75, 60, 40);
    ctx.beginPath();
    ctx.moveTo(110, 95);
    ctx.lineTo(146, 95);
    ctx.stroke();
  } else if (faceExpression === 'excited') {
    // Wide star-like eyes
    ctx.beginPath();
    ctx.arc(80, 90, 18, 0, Math.PI * 2);
    ctx.arc(176, 90, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(85, 85, 7, 0, Math.PI * 2);
    ctx.arc(181, 85, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
  } else {
    // Friendly round eyes
    ctx.beginPath();
    ctx.arc(80, 95, 14, 0, Math.PI * 2);
    ctx.arc(176, 95, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(84, 91, 5, 0, Math.PI * 2);
    ctx.arc(180, 91, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
  }

  // Eyebrows
  ctx.beginPath();
  if (faceExpression === 'determined') {
    ctx.moveTo(60, 68);
    ctx.lineTo(100, 78);
    ctx.moveTo(196, 68);
    ctx.lineTo(156, 78);
  } else {
    ctx.moveTo(65, 72);
    ctx.lineTo(95, 68);
    ctx.moveTo(191, 72);
    ctx.lineTo(161, 68);
  }
  ctx.stroke();

  // Mouth
  ctx.beginPath();
  if (faceExpression === 'excited') {
    ctx.arc(128, 145, 36, 0, Math.PI, false);
    ctx.fillStyle = '#BE123C';
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.arc(128, 140, 32, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
  }

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.arc(58, 125, 16, 0, Math.PI * 2);
  ctx.arc(198, 125, 16, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  faceTextureCache.set(key, texture);
  return texture;
}

export const RobloxAvatar: React.FC<RobloxAvatarProps> = ({
  customization,
  team,
  animation,
  isHuman = false,
  isEliminated = false,
  carryingStoneIndex = null,
  position = [0, 0, 0],
  rotation = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  const jerseyColor = useMemo(() => {
    if (customization.shirtColor) return customization.shirtColor;
    return team === 'runners' ? '#F59E0B' : '#0284C7';
  }, [customization.shirtColor, team]);

  const faceTexture = useMemo(() => {
    return getOrCreateFaceTexture(
      customization.skinTone || '#FCD34D',
      customization.faceExpression || 'smile'
    );
  }, [customization.skinTone, customization.faceExpression]);

  // Procedural animation frame loop with smooth rotation interpolation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Smooth position
    groupRef.current.position.set(position[0], position[1], position[2]);

    // Smooth shortest-arc rotation angle interpolation (avoids jerky snapping)
    const currentRot = groupRef.current.rotation.y;
    let diff = (rotation - currentRot) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = currentRot + diff * Math.min(1, delta * 14);

    const leftArm = leftArmRef.current;
    const rightArm = rightArmRef.current;
    const leftLeg = leftLegRef.current;
    const rightLeg = rightLegRef.current;
    const torso = torsoRef.current;
    const head = headRef.current;

    if (!leftArm || !rightArm || !leftLeg || !rightLeg || !torso || !head) return;

    if (isEliminated) {
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      leftArm.rotation.x = 0.5;
      rightArm.rotation.x = 0.5;
      leftArm.rotation.z = 0.6;
      rightArm.rotation.z = -0.6;
      leftLeg.rotation.x = 0.3;
      rightLeg.rotation.x = -0.3;
      torso.position.y = 1.0;
      head.rotation.x = 0.3;
      return;
    }

    switch (animation) {
      case 'idle': {
        const breath = Math.sin(time * 2.5) * 0.04;
        torso.position.y = 1.1 + breath;
        head.position.y = 1.85 + breath * 0.8;
        head.rotation.y = Math.sin(time * 1.2) * 0.08;
        head.rotation.x = 0;

        if (carryingStoneIndex !== null) {
          leftArm.rotation.x = -1.1;
          rightArm.rotation.x = -1.1;
          leftArm.rotation.z = 0.3;
          rightArm.rotation.z = -0.3;
        } else {
          leftArm.rotation.x = Math.sin(time * 2.5) * 0.05;
          rightArm.rotation.x = -Math.sin(time * 2.5) * 0.05;
          leftArm.rotation.z = 0.1;
          rightArm.rotation.z = -0.1;
        }
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        break;
      }

      case 'walk':
      case 'run': {
        const speed = animation === 'run' ? 12 : 7;
        const legSwing = Math.sin(time * speed) * (animation === 'run' ? 0.85 : 0.55);
        const bob = Math.abs(Math.sin(time * speed)) * 0.1;

        torso.position.y = 1.1 + bob;
        head.position.y = 1.85 + bob;
        head.rotation.x = animation === 'run' ? 0.1 : 0.05;

        leftLeg.rotation.x = legSwing;
        rightLeg.rotation.x = -legSwing;

        if (carryingStoneIndex !== null) {
          leftArm.rotation.x = -1.2 + Math.sin(time * speed * 0.5) * 0.1;
          rightArm.rotation.x = -1.2 - Math.sin(time * speed * 0.5) * 0.1;
          leftArm.rotation.z = 0.35;
          rightArm.rotation.z = -0.35;
        } else {
          leftArm.rotation.x = -legSwing * 1.1;
          rightArm.rotation.x = legSwing * 1.1;
          leftArm.rotation.z = 0.12;
          rightArm.rotation.z = -0.12;
        }
        break;
      }

      case 'jump': {
        torso.position.y = 1.35;
        head.position.y = 2.1;
        leftLeg.rotation.x = -0.4;
        rightLeg.rotation.x = -0.2;
        leftArm.rotation.x = -2.2;
        rightArm.rotation.x = -2.2;
        leftArm.rotation.z = 0.4;
        rightArm.rotation.z = -0.4;
        break;
      }

      case 'throw': {
        // Continuous smooth sinusoidal throwing motion without discontinuous modulo snap
        const throwCycle = Math.sin(time * 12);
        rightArm.rotation.x = -throwCycle * 1.8;
        rightArm.rotation.z = -0.2;
        leftArm.rotation.x = 0.4;
        torso.rotation.y = throwCycle * 0.3;
        leftLeg.rotation.x = 0.3;
        rightLeg.rotation.x = -0.3;
        break;
      }

      case 'hit': {
        torso.position.y = 1.0;
        head.rotation.x = -0.3;
        head.rotation.y = Math.sin(time * 12) * 0.15;
        leftArm.rotation.x = 0.8;
        rightArm.rotation.x = 0.8;
        leftArm.rotation.z = 0.5;
        rightArm.rotation.z = -0.5;
        leftLeg.rotation.x = 0.3;
        rightLeg.rotation.x = -0.2;
        break;
      }

      case 'dance':
      case 'celebrate': {
        const danceCycle = time * 7;
        const hop = Math.abs(Math.sin(danceCycle)) * 0.25;
        torso.position.y = 1.1 + hop;
        head.position.y = 1.85 + hop;
        head.rotation.z = Math.sin(danceCycle * 0.5) * 0.2;

        leftArm.rotation.x = -2.4 + Math.sin(danceCycle) * 0.5;
        rightArm.rotation.x = -2.4 - Math.sin(danceCycle) * 0.5;
        leftArm.rotation.z = 0.6 + Math.cos(danceCycle) * 0.3;
        rightArm.rotation.z = -0.6 - Math.cos(danceCycle) * 0.3;

        leftLeg.rotation.x = Math.sin(danceCycle) * 0.3;
        rightLeg.rotation.x = -Math.sin(danceCycle) * 0.3;
        break;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ground Halo for Controlled Player */}
      {isHuman && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 32]} />
          <meshBasicMaterial
            color={team === 'runners' ? '#F59E0B' : '#0284C7'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 1. Torso */}
      <group ref={torsoRef} position={[0, 1.1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.95, 0.45]} />
          <meshStandardMaterial color={jerseyColor} roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Collar Accent */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.46]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* Chest Team Badge */}
        <mesh position={[0, 0.15, 0.23]}>
          <planeGeometry args={[0.35, 0.35]} />
          <meshStandardMaterial
            color={team === 'runners' ? '#EF4444' : '#10B981'}
            roughness={0.2}
          />
        </mesh>

        {customization.accessory === 'badge' && (
          <mesh position={[0.22, 0.22, 0.24]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
          </mesh>
        )}

        {/* Carried Stone Visual Attached to Hands */}
        {carryingStoneIndex !== null && (
          <group position={[0, 0.1, 0.55]}>
            <mesh castShadow>
              <cylinderGeometry
                args={[
                  0.35 - carryingStoneIndex * 0.03,
                  0.38 - carryingStoneIndex * 0.03,
                  0.14,
                  24,
                ]}
              />
              <meshStandardMaterial color="#A8A29E" roughness={0.8} metalness={0.1} />
            </mesh>
            <pointLight color="#F59E0B" intensity={1.5} distance={1.2} />
          </group>
        )}
      </group>

      {/* 2. Head with Face */}
      <group ref={headRef} position={[0, 1.85, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial
            attach="material-4"
            map={faceTexture || undefined}
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
          <meshStandardMaterial
            attach="material-0"
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
          <meshStandardMaterial
            attach="material-1"
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
          <meshStandardMaterial
            attach="material-2"
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
          <meshStandardMaterial
            attach="material-3"
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
          <meshStandardMaterial
            attach="material-5"
            color={customization.skinTone || '#FCD34D'}
            roughness={0.4}
          />
        </mesh>

        {/* Hair Styles */}
        {customization.hairStyle === 'spiky' && (
          <group position={[0, 0.35, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.66, 0.18, 0.66]} />
              <meshStandardMaterial color={customization.hairColor || '#1F2937'} roughness={0.9} />
            </mesh>
            {[-0.18, 0, 0.18].map((x, i) => (
              <mesh key={i} position={[x, 0.15, -0.05]} rotation={[0.2, 0, x * 0.8]}>
                <coneGeometry args={[0.1, 0.22, 5]} />
                <meshStandardMaterial color={customization.hairColor || '#1F2937'} />
              </mesh>
            ))}
          </group>
        )}

        {customization.hairStyle === 'curly' && (
          <group position={[0, 0.34, -0.05]}>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 16, 16]} />
              <meshStandardMaterial color={customization.hairColor || '#1F2937'} roughness={0.95} />
            </mesh>
          </group>
        )}

        {customization.hairStyle === 'cap' && (
          <group position={[0, 0.32, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.66, 0.15, 0.66]} />
              <meshStandardMaterial color="#DC2626" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.02, 0.42]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.6, 0.05, 0.35]} />
              <meshStandardMaterial color="#DC2626" roughness={0.4} />
            </mesh>
          </group>
        )}

        {customization.hairStyle === 'headband' && (
          <group position={[0, 0.18, 0]}>
            <mesh>
              <boxGeometry args={[0.65, 0.12, 0.65]} />
              <meshStandardMaterial color="#F43F5E" roughness={0.3} />
            </mesh>
          </group>
        )}
      </group>

      {/* 3. Left Arm */}
      <group ref={leftArmRef} position={[-0.64, 1.45, 0]}>
        <group position={[0, -0.42, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[0.38, 0.44, 0.4]} />
            <meshStandardMaterial color={jerseyColor} roughness={0.4} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
            <boxGeometry args={[0.34, 0.44, 0.36]} />
            <meshStandardMaterial color={customization.skinTone || '#FCD34D'} roughness={0.4} />
          </mesh>
          {customization.accessory === 'wristband' && (
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.36, 0.1, 0.38]} />
              <meshStandardMaterial color="#E11D48" />
            </mesh>
          )}
        </group>
      </group>

      {/* 4. Right Arm */}
      <group ref={rightArmRef} position={[0.64, 1.45, 0]}>
        <group position={[0, -0.42, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[0.38, 0.44, 0.4]} />
            <meshStandardMaterial color={jerseyColor} roughness={0.4} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
            <boxGeometry args={[0.34, 0.44, 0.36]} />
            <meshStandardMaterial color={customization.skinTone || '#FCD34D'} roughness={0.4} />
          </mesh>
          {customization.accessory === 'wristband' && (
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.36, 0.1, 0.38]} />
              <meshStandardMaterial color="#E11D48" />
            </mesh>
          )}
        </group>
      </group>

      {/* 5. Left Leg */}
      <group ref={leftLegRef} position={[-0.23, 0.65, 0]}>
        <group position={[0, -0.32, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.68, 0.42]} />
            <meshStandardMaterial color={customization.pantsColor || '#1E293B'} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0.05]}>
            <boxGeometry args={[0.42, 0.12, 0.48]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* 6. Right Leg */}
      <group ref={rightLegRef} position={[0.23, 0.65, 0]}>
        <group position={[0, -0.32, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.68, 0.42]} />
            <meshStandardMaterial color={customization.pantsColor || '#1E293B'} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0.05]}>
            <boxGeometry args={[0.42, 0.12, 0.48]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
