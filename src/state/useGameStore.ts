import { create } from 'zustand';
import confetti from 'canvas-confetti';
import {
  MatchPhase,
  GameMode,
  TeamType,
  GameSettings,
  PlayerState,
  StoneData,
  BallState,
  MatchScore,
  CharacterCustomization,
} from '../types/game';
import {
  INITIAL_SETTINGS,
  DEFAULT_PLAYER_CUSTOMIZATION,
  createSevenStones,
  createPlayers,
  getDist2D,
  getDist3D,
  isInsideSafeZone,
} from './gameEngine';
import { soundManager } from '../audio/soundManager';

interface GameStore {
  phase: MatchPhase;
  mode: GameMode;
  humanTeam: TeamType;
  settings: GameSettings;
  customization: CharacterCustomization;
  score: MatchScore;
  players: PlayerState[];
  stones: StoneData[];
  ball: BallState;
  roundTimeLeft: number;
  throwPower: number;
  isChargingThrow: boolean;
  aimDirection: [number, number, number];
  cameraAngles: { yaw: number; pitch: number };
  notification: string | null;

  // Actions
  setMode: (mode: GameMode) => void;
  setHumanTeam: (team: TeamType) => void;
  updateCustomization: (customization: Partial<CharacterCustomization>) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startMatch: (mode?: GameMode, team?: TeamType) => void;
  pauseMatch: () => void;
  resumeMatch: () => void;
  resetRound: () => void;
  returnToMenu: () => void;

  // Controls
  setCameraAngles: (yaw: number, pitch: number) => void;
  handlePlayerMove: (dx: number, dz: number, isSprinting: boolean, isJumping: boolean) => void;
  startChargingThrow: () => void;
  updateChargingThrow: (delta: number) => void;
  releaseThrow: () => void;
  handleInteract: () => void;

  // Frame Simulation
  stepSimulation: (delta: number) => void;
  showNotification: (msg: string) => void;
}

let syncAccumulator = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  mode: 'match',
  humanTeam: 'runners',
  settings: INITIAL_SETTINGS,
  customization: DEFAULT_PLAYER_CUSTOMIZATION,
  score: {
    runnersScore: 0,
    seekersScore: 0,
    currentRound: 1,
    maxRounds: 3,
  },
  players: [],
  stones: createSevenStones(),
  ball: {
    position: [0, 1.2, 9],
    velocity: [0, 0, 0],
    holderId: null,
    isFree: false,
    lastThrownBy: null,
  },
  roundTimeLeft: 90,
  throwPower: 0,
  isChargingThrow: false,
  aimDirection: [0, 0, -1],
  cameraAngles: { yaw: 0, pitch: 0.2 },
  notification: null,

  setMode: (mode) => set({ mode }),
  setHumanTeam: (humanTeam) => set({ humanTeam }),
  updateCustomization: (partial) =>
    set((state) => ({ customization: { ...state.customization, ...partial } })),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  showNotification: (msg: string) => {
    set({ notification: msg });
    setTimeout(() => {
      if (get().notification === msg) set({ notification: null });
    }, 3200);
  },

  startMatch: (optMode, optTeam) => {
    const mode = optMode || get().mode;
    const team = optTeam || get().humanTeam;
    const settings = get().settings;
    const customization = get().customization;

    const initialPlayers = createPlayers(team, customization, settings.runnerLives);
    const initialStones = createSevenStones();

    const initialBall: BallState = {
      position: [0, 1.2, 8.8],
      velocity: [0, 0, 0],
      holderId: team === 'runners' ? 'player-human' : (initialPlayers.find((p) => p.team === 'runners')?.id || null),
      isFree: false,
      lastThrownBy: null,
    };

    soundManager.playWhistle();
    soundManager.startAmbient();

    set({
      phase: 'aiming_throw',
      mode,
      humanTeam: team,
      players: initialPlayers,
      stones: initialStones,
      ball: initialBall,
      roundTimeLeft: settings.roundDuration,
      throwPower: 0,
      isChargingThrow: false,
      score: {
        runnersScore: 0,
        seekersScore: 0,
        currentRound: 1,
        maxRounds: 3,
      },
      notification: team === 'runners'
        ? 'Your Turn to Throw! Hold Left Click / Throw Button to Aim at the Stones!'
        : 'Watch the Runners throw at the stones, then retrieve the ball!',
    });
  },

  pauseMatch: () => {
    if (get().phase !== 'menu' && get().phase !== 'customizing') {
      set({ phase: 'paused' });
    }
  },

  resumeMatch: () => {
    if (get().phase === 'paused') {
      set({ phase: 'active' });
    }
  },

  returnToMenu: () => {
    soundManager.stopAmbient();
    set({ phase: 'menu' });
  },

  resetRound: () => {
    const { humanTeam, customization, settings, score } = get();
    const initialPlayers = createPlayers(humanTeam, customization, settings.runnerLives);
    const initialStones = createSevenStones();

    const initialBall: BallState = {
      position: [0, 1.2, 8.8],
      velocity: [0, 0, 0],
      holderId: humanTeam === 'runners' ? 'player-human' : (initialPlayers.find((p) => p.team === 'runners')?.id || null),
      isFree: false,
      lastThrownBy: null,
    };

    soundManager.playWhistle();

    set({
      phase: 'aiming_throw',
      players: initialPlayers,
      stones: initialStones,
      ball: initialBall,
      roundTimeLeft: settings.roundDuration,
      throwPower: 0,
      isChargingThrow: false,
      notification: `Round ${score.currentRound} Started! Aim at the stones!`,
    });
  },

  setCameraAngles: (yaw, pitch) => {
    // Continuous aim calculation matching exact camera perspective
    set({
      cameraAngles: { yaw, pitch },
      aimDirection: [-Math.sin(yaw), -Math.sin(pitch), -Math.cos(yaw)],
    });
  },

  handlePlayerMove: (dx, dz, isSprinting, isJumping) => {
    const { phase, players, cameraAngles } = get();
    if (phase === 'paused' || phase === 'menu' || phase === 'customizing') return;

    const human = players.find((p) => p.isHuman);
    if (!human || human.isEliminated) return;

    if (dx === 0 && dz === 0) {
      if (human.animation === 'walk' || human.animation === 'run') {
        human.animation = 'idle';
      }
      return;
    }

    // Camera relative movement
    const forwardX = -Math.sin(cameraAngles.yaw);
    const forwardZ = -Math.cos(cameraAngles.yaw);
    const rightX = Math.cos(cameraAngles.yaw);
    const rightZ = -Math.sin(cameraAngles.yaw);

    const moveX = forwardX * dz + rightX * dx;
    const moveZ = forwardZ * dz + rightZ * dx;

    // Movement speed
    const baseSpeed = isSprinting ? 9.5 : 5.8;
    const nextX = Math.max(-17.2, Math.min(17.2, human.position[0] + moveX * baseSpeed * 0.016));
    const nextZ = Math.max(-17.2, Math.min(17.2, human.position[2] + moveZ * baseSpeed * 0.016));

    const facingAngle = Math.atan2(moveX, moveZ);

    human.position = [nextX, human.position[1], nextZ];
    human.rotation = facingAngle;
    human.animation = isJumping ? 'jump' : isSprinting ? 'run' : 'walk';
  },

  startChargingThrow: () => {
    const { phase, ball, players } = get();
    if (phase !== 'aiming_throw' && phase !== 'active') return;

    const human = players.find((p) => p.isHuman);
    if (!human || human.isEliminated) return;

    if (ball.holderId === human.id) {
      set({ isChargingThrow: true, throwPower: 0.1 });
    }
  },

  updateChargingThrow: (delta) => {
    const { isChargingThrow, throwPower } = get();
    if (!isChargingThrow) return;

    const nextPower = Math.min(1.0, throwPower + delta * 1.5);
    set({ throwPower: nextPower });
  },

  releaseThrow: () => {
    const { isChargingThrow, throwPower, ball, players, aimDirection } = get();
    if (!isChargingThrow) return;

    const human = players.find((p) => p.isHuman);
    if (!human || ball.holderId !== human.id) {
      set({ isChargingThrow: false, throwPower: 0 });
      return;
    }

    human.animation = 'throw';
    setTimeout(() => {
      if (human.animation === 'throw') human.animation = 'idle';
    }, 400);

    const speed = 15 + throwPower * 18; // 15 to 33 m/s
    const vx = aimDirection[0] * speed;
    const vy = (aimDirection[1] + 0.18) * speed;
    const vz = aimDirection[2] * speed;

    soundManager.playThrowWhoosh();

    const updatedBall: BallState = {
      position: [human.position[0], human.position[1] + 1.4, human.position[2]],
      velocity: [vx, vy, vz],
      holderId: null,
      isFree: true,
      lastThrownBy: human.id,
    };

    set({
      isChargingThrow: false,
      throwPower: 0,
      ball: updatedBall,
      players: [...players],
    });
  },

  handleInteract: () => {
    const { phase, players, stones, ball } = get();
    if (phase !== 'active' && phase !== 'aiming_throw') return;

    const human = players.find((p) => p.isHuman);
    if (!human || human.isEliminated) return;

    // 1. If human is a Seeker and near loose ball -> Pick up ball
    if (human.team === 'seekers' && ball.isFree) {
      const distToBall = getDist3D(human.position, ball.position);
      if (distToBall < 2.0) {
        ball.holderId = human.id;
        ball.isFree = false;
        ball.velocity = [0, 0, 0];
        soundManager.playStonePickup();
        set({ ball: { ...ball } });
        get().showNotification('Grabbed the ball! Aim and throw at the runners!');
        return;
      }
    }

    // 2. If human is a Runner:
    if (human.team === 'runners') {
      if (human.carryingStoneIndex !== null) {
        const distToBase = getDist2D(human.position, [0, 0, 0]);
        if (distToBase <= 2.8) {
          const stoneIdx = human.carryingStoneIndex;
          const stone = stones.find((s) => s.id === stoneIdx);
          if (stone) {
            const stackedCount = stones.filter((s) => s.isStacked).length;
            const targetY = 0.08 + stackedCount * 0.12 + 0.06;

            stone.isStacked = true;
            stone.isHeld = false;
            stone.carrierId = null;
            stone.position = [0, targetY, 0];
            stone.rotation = [0, stackedCount * 0.4, 0];
            stone.velocity = [0, 0, 0];
            stone.angularVelocity = [0, 0, 0];

            human.carryingStoneIndex = null;
            soundManager.playStonePlace(stackedCount);

            const newStackedCount = stackedCount + 1;
            get().showNotification(`Stone ${newStackedCount}/7 Rebuilt!`);

            if (newStackedCount === 7) {
              soundManager.playLagoriVictory();
              confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
              });
              set((state) => ({
                phase: 'lagori',
                score: {
                  ...state.score,
                  runnersScore: state.score.runnersScore + 1,
                },
                notification: 'LAGORI! Runners rebuilt all 7 stones and won the round!',
              }));
            }

            set({ stones: [...stones], players: [...players] });
            return;
          }
        }
      }

      if (human.carryingStoneIndex === null) {
        let closestStone: StoneData | null = null;
        let minDist = 2.0;

        for (const stone of stones) {
          if (!stone.isStacked && !stone.isHeld) {
            const dist = getDist3D(human.position, stone.position);
            if (dist < minDist) {
              minDist = dist;
              closestStone = stone;
            }
          }
        }

        if (closestStone) {
          closestStone.isHeld = true;
          closestStone.carrierId = human.id;
          human.carryingStoneIndex = closestStone.id;
          soundManager.playStonePickup();
          get().showNotification(`Picked up Stone ${closestStone.id + 1}! Bring it to the center!`);
          set({ stones: [...stones], players: [...players] });
          return;
        }
      }
    }
  },

  stepSimulation: (delta) => {
    const { phase, players, stones, ball, settings, roundTimeLeft, mode } = get();
    if (phase === 'paused' || phase === 'menu' || phase === 'customizing') return;

    let hasEventStateChange = false;

    // 1. Advance round timer
    if (phase === 'active' && mode === 'match') {
      const nextTimer = Math.max(0, roundTimeLeft - delta);
      if (nextTimer <= 0) {
        soundManager.playDefeat();
        set((state) => ({
          phase: 'time_up',
          roundTimeLeft: 0,
          score: {
            ...state.score,
            seekersScore: state.score.seekersScore + 1,
          },
          notification: 'Time Up! Seekers prevented the stack from being rebuilt!',
        }));
        return;
      }
    }

    // 2. Ball physical updates when free
    if (ball.isFree) {
      const g = -9.81;
      const nextVx = ball.velocity[0] * 0.992;
      const nextVy = ball.velocity[1] + g * delta;
      const nextVz = ball.velocity[2] * 0.992;

      let nextX = ball.position[0] + nextVx * delta;
      let nextY = ball.position[1] + nextVy * delta;
      let nextZ = ball.position[2] + nextVz * delta;

      // Ground bounce
      if (nextY <= 0.22) {
        nextY = 0.22;
        if (Math.abs(nextVy) > 0.8) {
          ball.velocity[1] = -nextVy * 0.62;
          soundManager.playBallBounce(Math.abs(nextVy) / 10);
        } else {
          ball.velocity[1] = 0;
        }
      } else {
        ball.velocity[1] = nextVy;
      }
      ball.velocity[0] = nextVx;
      ball.velocity[2] = nextVz;

      // Wall boundaries bounce
      if (Math.abs(nextX) > 17.5) {
        ball.velocity[0] = -ball.velocity[0] * 0.7;
        nextX = Math.sign(nextX) * 17.5;
        soundManager.playBallBounce(0.3);
      }
      if (Math.abs(nextZ) > 17.5) {
        ball.velocity[2] = -ball.velocity[2] * 0.7;
        nextZ = Math.sign(nextZ) * 17.5;
        soundManager.playBallBounce(0.3);
      }

      ball.position = [nextX, nextY, nextZ];

      // A. Collision with the Stone Stack
      const distToCenter = Math.sqrt(nextX * nextX + nextZ * nextZ);
      const isAnyStacked = stones.some((s) => s.isStacked);

      if (isAnyStacked && distToCenter < 1.4 && nextY < 1.3 && nextY > 0.1) {
        soundManager.playStoneCrash();
        stones.forEach((stone, i) => {
          if (stone.isStacked) {
            stone.isStacked = false;
            const angle = (i / 7) * Math.PI * 2 + (Math.random() - 0.5);
            const impulse = 3.5 + Math.random() * 5.0;
            stone.velocity = [
              Math.cos(angle) * impulse,
              2.5 + Math.random() * 2.5,
              Math.sin(angle) * impulse,
            ];
            stone.angularVelocity = [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
            ];
          }
        });

        if (get().phase === 'aiming_throw') {
          hasEventStateChange = true;
          set({ phase: 'active' });
          get().showNotification('STONES TOPPLED! Seekers chase the ball, Runners rebuild the stack!');
        }

        ball.velocity[0] *= -0.4;
        ball.velocity[2] *= -0.4;
        ball.velocity[1] = 3.0;
      }

      // B. Hit Detection against Runners
      const ballSpeed = Math.sqrt(
        ball.velocity[0] ** 2 + ball.velocity[1] ** 2 + ball.velocity[2] ** 2
      );

      if (ballSpeed > 3.0 && phase === 'active') {
        for (const runner of players) {
          if (runner.team === 'runners' && !runner.isEliminated) {
            const dist = getDist3D(ball.position, [
              runner.position[0],
              runner.position[1] + 1.0,
              runner.position[2],
            ]);

            const inSafeZone = settings.safeZonesEnabled && isInsideSafeZone(runner.position);

            if (dist < 1.15 && !inSafeZone) {
              soundManager.playPlayerHit();
              runner.animation = 'hit';
              runner.lives -= 1;
              hasEventStateChange = true;

              get().showNotification(`${runner.name} was HIT! (${runner.lives} lives remaining)`);

              if (runner.carryingStoneIndex !== null) {
                const carriedStone = stones.find((s) => s.id === runner.carryingStoneIndex);
                if (carriedStone) {
                  carriedStone.isHeld = false;
                  carriedStone.carrierId = null;
                  carriedStone.position = [runner.position[0], 0.15, runner.position[2]];
                  carriedStone.velocity = [0, 0, 0];
                }
                runner.carryingStoneIndex = null;
              }

              if (runner.lives <= 0) {
                runner.isEliminated = true;
                get().showNotification(`${runner.name} is ELIMINATED!`);
              }

              ball.velocity[0] = -ball.velocity[0] * 0.3;
              ball.velocity[1] = 2.0;
              ball.velocity[2] = -ball.velocity[2] * 0.3;

              const remainingRunners = players.filter(
                (p) => p.team === 'runners' && !p.isEliminated
              );

              if (remainingRunners.length === 0) {
                soundManager.playDefeat();
                set((state) => ({
                  phase: 'eliminated',
                  score: {
                    ...state.score,
                    seekersScore: state.score.seekersScore + 1,
                  },
                  notification: 'All runners eliminated! Seekers win the round!',
                }));
                return;
              }
              break;
            }
          }
        }
      }
    } else if (ball.holderId) {
      const holder = players.find((p) => p.id === ball.holderId);
      if (holder) {
        ball.position = [
          holder.position[0] + Math.sin(holder.rotation) * 0.4,
          holder.position[1] + 1.2,
          holder.position[2] + Math.cos(holder.rotation) * 0.4,
        ];
      }
    }

    // 3. Update scattered stones
    stones.forEach((stone) => {
      if (!stone.isStacked && !stone.isHeld) {
        stone.velocity[1] -= 9.81 * delta;
        stone.position[0] += stone.velocity[0] * delta;
        stone.position[1] += stone.velocity[1] * delta;
        stone.position[2] += stone.velocity[2] * delta;

        if (stone.position[1] <= stone.height / 2 + 0.02) {
          stone.position[1] = stone.height / 2 + 0.02;
          if (Math.abs(stone.velocity[1]) > 0.5) {
            stone.velocity[1] = -stone.velocity[1] * 0.35;
          } else {
            stone.velocity[1] = 0;
          }
          stone.velocity[0] *= 0.88;
          stone.velocity[2] *= 0.88;
          stone.angularVelocity[0] *= 0.85;
          stone.angularVelocity[1] *= 0.85;
          stone.angularVelocity[2] *= 0.85;
        }

        stone.rotation[0] += stone.angularVelocity[0] * delta;
        stone.rotation[1] += stone.angularVelocity[1] * delta;
        stone.rotation[2] += stone.angularVelocity[2] * delta;

        stone.position[0] = Math.max(-17.2, Math.min(17.2, stone.position[0]));
        stone.position[2] = Math.max(-17.2, Math.min(17.2, stone.position[2]));
      }
    });

    // 4. Update AI Players
    const speedMult = settings.difficulty === 'easy' ? 0.75 : settings.difficulty === 'hard' ? 1.2 : 1.0;

    players.forEach((ai) => {
      if (ai.isHuman || ai.isEliminated) return;

      if (ai.animation === 'hit') {
        setTimeout(() => {
          if (ai.animation === 'hit') ai.animation = 'idle';
        }, 500);
      }

      // --- RUNNER AI ---
      if (ai.team === 'runners') {
        if (phase === 'aiming_throw') {
          if (ball.holderId === ai.id) {
            ai.throwCooldown = (ai.throwCooldown || 0) + delta;
            if (ai.throwCooldown > 2.0) {
              const targetX = 0 + (Math.random() - 0.5) * 0.4;
              const targetZ = 0 + (Math.random() - 0.5) * 0.4;
              const dx = targetX - ai.position[0];
              const dz = targetZ - ai.position[2];
              const dist = Math.sqrt(dx * dx + dz * dz) || 1;
              const dir = [dx / dist, 0.14, dz / dist];

              soundManager.playThrowWhoosh();
              ai.animation = 'throw';
              ball.holderId = null;
              ball.isFree = true;
              ball.velocity = [dir[0] * 19, 4.5, dir[2] * 19];
              ball.position = [ai.position[0], 1.4, ai.position[2]];
              ai.throwCooldown = 0;
            }
          }
          return;
        }

        if (phase !== 'active') return;

        const seekerWithBall = players.find(
          (p) => p.team === 'seekers' && ball.holderId === p.id
        );
        const distToThreat = seekerWithBall
          ? getDist2D(ai.position, seekerWithBall.position)
          : 999;

        if (distToThreat < 6.5) {
          const fleeDx = ai.position[0] - seekerWithBall!.position[0];
          const fleeDz = ai.position[2] - seekerWithBall!.position[2];
          const fleeLen = Math.sqrt(fleeDx * fleeDx + fleeDz * fleeDz) || 1;

          ai.position[0] += (fleeDx / fleeLen) * 6.2 * speedMult * delta;
          ai.position[2] += (fleeDz / fleeLen) * 6.2 * speedMult * delta;
          ai.rotation = Math.atan2(fleeDx, fleeDz);
          ai.animation = 'run';
        } else if (ai.carryingStoneIndex !== null) {
          const distToBase = getDist2D(ai.position, [0, 0, 0]);
          if (distToBase <= 2.2) {
            const stoneIdx = ai.carryingStoneIndex;
            const stone = stones.find((s) => s.id === stoneIdx);
            if (stone) {
              const stackedCount = stones.filter((s) => s.isStacked).length;
              stone.isStacked = true;
              stone.isHeld = false;
              stone.carrierId = null;
              stone.position = [0, 0.08 + stackedCount * 0.12 + 0.06, 0];
              stone.rotation = [0, stackedCount * 0.4, 0];
              stone.velocity = [0, 0, 0];
              ai.carryingStoneIndex = null;
              soundManager.playStonePlace(stackedCount);
              hasEventStateChange = true;

              const newCount = stackedCount + 1;
              get().showNotification(`Stone ${newCount}/7 Rebuilt by ${ai.name}!`);

              if (newCount === 7) {
                soundManager.playLagoriVictory();
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                set((state) => ({
                  phase: 'lagori',
                  score: { ...state.score, runnersScore: state.score.runnersScore + 1 },
                  notification: 'LAGORI! Runners rebuilt all 7 stones and won the round!',
                }));
                return;
              }
            }
          } else {
            const dirX = -ai.position[0];
            const dirZ = -ai.position[2];
            const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
            ai.position[0] += (dirX / len) * 5.8 * speedMult * delta;
            ai.position[2] += (dirZ / len) * 5.8 * speedMult * delta;
            ai.rotation = Math.atan2(dirX, dirZ);
            ai.animation = 'run';
          }
        } else {
          let bestStone: StoneData | null = null;
          let bestDist = 999;
          stones.forEach((stone) => {
            if (!stone.isStacked && !stone.isHeld) {
              const dist = getDist2D(ai.position, stone.position);
              if (dist < bestDist) {
                bestDist = dist;
                bestStone = stone;
              }
            }
          });

          if (bestStone) {
            const bStone = bestStone as StoneData;
            if (bestDist < 1.6) {
              bStone.isHeld = true;
              bStone.carrierId = ai.id;
              ai.carryingStoneIndex = bStone.id;
              hasEventStateChange = true;
              soundManager.playStonePickup();
            } else {
              const dirX = bStone.position[0] - ai.position[0];
              const dirZ = bStone.position[2] - ai.position[2];
              const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              ai.position[0] += (dirX / len) * 5.5 * speedMult * delta;
              ai.position[2] += (dirZ / len) * 5.5 * speedMult * delta;
              ai.rotation = Math.atan2(dirX, dirZ);
              ai.animation = 'walk';
            }
          }
        }
      }

      // --- SEEKER AI ---
      if (ai.team === 'seekers' && phase === 'active') {
        if (ball.isFree) {
          const distToBall = getDist2D(ai.position, ball.position);
          if (distToBall < 1.6) {
            ball.holderId = ai.id;
            ball.isFree = false;
            ball.velocity = [0, 0, 0];
            hasEventStateChange = true;
            soundManager.playStonePickup();
          } else {
            const dirX = ball.position[0] - ai.position[0];
            const dirZ = ball.position[2] - ai.position[2];
            const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
            ai.position[0] += (dirX / len) * 6.5 * speedMult * delta;
            ai.position[2] += (dirZ / len) * 6.5 * speedMult * delta;
            ai.rotation = Math.atan2(dirX, dirZ);
            ai.animation = 'run';
          }
        } else if (ball.holderId === ai.id) {
          let targetRunner: PlayerState | null = null;
          let minRunnerDist = 999;

          players.forEach((p) => {
            if (p.team === 'runners' && !p.isEliminated) {
              const d = getDist2D(ai.position, p.position);
              const weight = p.carryingStoneIndex !== null ? 0.6 : 1.0;
              if (d * weight < minRunnerDist) {
                minRunnerDist = d * weight;
                targetRunner = p;
              }
            }
          });

          if (targetRunner) {
            const tRunner = targetRunner as PlayerState;
            const dist = getDist2D(ai.position, tRunner.position);

            if (dist <= 8.5) {
              ai.throwCooldown = (ai.throwCooldown || 0) + delta;
              if (ai.throwCooldown > (settings.difficulty === 'hard' ? 0.8 : 1.4)) {
                const dx = tRunner.position[0] - ai.position[0];
                const dz = tRunner.position[2] - ai.position[2];
                const len = Math.sqrt(dx * dx + dz * dz) || 1;

                const spread = settings.difficulty === 'easy' ? 0.25 : settings.difficulty === 'normal' ? 0.12 : 0.04;
                const throwDir = [
                  dx / len + (Math.random() - 0.5) * spread,
                  0.15,
                  dz / len + (Math.random() - 0.5) * spread,
                ];

                soundManager.playThrowWhoosh();
                ai.animation = 'throw';
                ball.holderId = null;
                ball.isFree = true;
                const throwSpeed = 16 + (settings.difficulty === 'hard' ? 6 : 0);
                ball.velocity = [throwDir[0] * throwSpeed, 4.2, throwDir[2] * throwSpeed];
                ball.position = [ai.position[0], 1.3, ai.position[2]];
                ai.throwCooldown = 0;
                hasEventStateChange = true;
              }
            } else {
              const dirX = tRunner.position[0] - ai.position[0];
              const dirZ = tRunner.position[2] - ai.position[2];
              const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              ai.position[0] += (dirX / len) * 6.2 * speedMult * delta;
              ai.position[2] += (dirZ / len) * 6.2 * speedMult * delta;
              ai.rotation = Math.atan2(dirX, dirZ);
              ai.animation = 'run';
            }
          }
        }
      }

      ai.position[0] = Math.max(-17.2, Math.min(17.2, ai.position[0]));
      ai.position[2] = Math.max(-17.2, Math.min(17.2, ai.position[2]));
    });

    // Throttled UI State Synchronization (12 FPS update for HUD radar & timer)
    // Three.js meshes update at 60+ FPS while avoiding 60 React DOM re-renders per second!
    syncAccumulator += delta;
    if (syncAccumulator >= 0.08 || hasEventStateChange) {
      syncAccumulator = 0;
      set({
        players: [...players],
        stones: [...stones],
        ball: { ...ball },
        roundTimeLeft: phase === 'active' && mode === 'match' ? Math.max(0, roundTimeLeft - delta) : roundTimeLeft,
      });
    }
  },
}));
