import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { Playground } from '../world/Playground';
import { StoneStack } from './StoneStack';
import { Ball } from './Ball';
import { TrajectoryArc } from './TrajectoryArc';
import { RobloxAvatar } from '../character/RobloxAvatar';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { DesktopControls } from '../controls/DesktopControls';
import { getDist2D, getDist3D } from '../../state/gameEngine';

export const GameScene: React.FC = () => {
  const {
    phase,
    players,
    stones,
    ball,
    humanTeam,
    throwPower,
    isChargingThrow,
    aimDirection,
    cameraAngles,
    stepSimulation,
    settings,
  } = useGameStore();

  // Run the physics & AI step simulation every frame
  useFrame((_, delta) => {
    // Limit delta to 0.05 to avoid huge leaps if tab becomes unfocused
    const clampedDelta = Math.min(0.05, delta);
    stepSimulation(clampedDelta);
  });

  const human = players.find((p) => p.isHuman);
  const playerPos = human ? human.position : ([0, 0, 9] as [number, number, number]);
  const playerRot = human ? human.rotation : Math.PI;

  // Contextual helper checks
  let canPlaceStone = false;
  let canPickupStoneId: number | null = null;

  if (human && !human.isEliminated && human.team === 'runners') {
    if (human.carryingStoneIndex !== null) {
      if (getDist2D(human.position, [0, 0, 0]) <= 2.8) {
        canPlaceStone = true;
      }
    } else {
      let minDist = 2.0;
      for (const stone of stones) {
        if (!stone.isStacked && !stone.isHeld) {
          const dist = getDist3D(human.position, stone.position);
          if (dist < minDist) {
            minDist = dist;
            canPickupStoneId = stone.id;
          }
        }
      }
    }
  }

  // Trajectory arc visibility
  const isHoldingBall = human && ball.holderId === human.id;
  const showTrajectory = Boolean(isHoldingBall && (isChargingThrow || phase === 'aiming_throw'));

  return (
    <>
      {/* Input controller */}
      <DesktopControls />

      {/* Camera */}
      <ThirdPersonCamera
        targetPos={playerPos}
        targetRotation={playerRot}
        isAiming={isChargingThrow}
        sensitivity={settings.cameraSensitivity}
      />

      {/* Outdoor Indian Playground Environment */}
      <Playground />

      {/* The 7 Stones Tower & Scattered Stones */}
      <StoneStack
        stones={stones}
        playerPos={playerPos}
        isRunner={humanTeam === 'runners'}
        canPlaceStone={canPlaceStone}
        canPickupStoneId={canPickupStoneId}
      />

      {/* Tennis / Pitthu Ball */}
      <Ball ballState={ball} isAiming={isChargingThrow} />

      {/* 3D Aiming Parabolic Trajectory Arc */}
      <TrajectoryArc
        startPos={[playerPos[0], playerPos[1] + 1.4, playerPos[2]]}
        direction={aimDirection}
        power={throwPower > 0.05 ? throwPower : 0.4}
        visible={showTrajectory}
      />

      {/* All Human & AI Avatars */}
      {players.map((player) => (
        <RobloxAvatar
          key={player.id}
          customization={player.customization}
          team={player.team}
          animation={player.animation}
          isHuman={player.isHuman}
          isEliminated={player.isEliminated}
          carryingStoneIndex={player.carryingStoneIndex}
          position={player.position}
          rotation={player.rotation}
          name={player.name}
          lives={player.lives}
        />
      ))}
    </>
  );
};
