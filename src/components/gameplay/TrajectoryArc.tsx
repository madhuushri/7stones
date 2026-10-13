import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TrajectoryArcProps {
  startPos: [number, number, number];
  direction: [number, number, number];
  power: number; // 0.1 to 1.0 (maps to velocity e.g. 12 to 28 m/s)
  visible: boolean;
}

export const TrajectoryArc: React.FC<TrajectoryArcProps> = ({
  startPos,
  direction,
  power,
  visible,
}) => {
  const { points, hitGroundPos } = useMemo(() => {
    if (!visible) return { points: [], hitGroundPos: null };

    const pts: [number, number, number][] = [];
    const speed = 12 + power * 18; // 12 to 30 m/s
    const vx = direction[0] * speed;
    const vy = (direction[1] + 0.15) * speed; // slight upward loft for arc
    const vz = direction[2] * speed;
    const g = -9.81;

    let x = startPos[0];
    let y = startPos[1];
    let z = startPos[2];
    const dt = 0.04;
    let groundPos: [number, number, number] | null = null;

    pts.push([x, y, z]);

    for (let step = 0; step < 35; step++) {
      const t = (step + 1) * dt;
      const nextX = startPos[0] + vx * t;
      const nextY = startPos[1] + vy * t + 0.5 * g * t * t;
      const nextZ = startPos[2] + vz * t;

      if (nextY <= 0.2) {
        // Impact with ground level
        groundPos = [nextX, 0.05, nextZ];
        pts.push(groundPos);
        break;
      }

      pts.push([nextX, nextY, nextZ]);
    }

    return { points: pts, hitGroundPos: groundPos };
  }, [startPos, direction, power, visible]);

  if (!visible || points.length < 2) return null;

  return (
    <group>
      {/* Dynamic trajectory points */}
      {points.map((pt, idx) => {
        const factor = idx / points.length;
        const scale = 0.08 * (1 - factor * 0.4);
        return (
          <mesh key={idx} position={pt}>
            <sphereGeometry args={[scale, 8, 8]} />
            <meshBasicMaterial
              color="#FBBF24"
              transparent
              opacity={0.85 - factor * 0.3}
            />
          </mesh>
        );
      })}

      {/* Target marker on ground where ball will land */}
      {hitGroundPos && (
        <group position={hitGroundPos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.45, 24]} />
            <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 16]} />
            <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};
