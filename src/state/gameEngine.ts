import {
  PlayerState,
  StoneData,
  BallState,
  MatchPhase,
  TeamType,
  AIDifficulty,
  GameSettings,
  MatchScore,
  CharacterCustomization,
} from '../types/game';
import { soundManager } from '../audio/soundManager';

export const INITIAL_SETTINGS: GameSettings = {
  difficulty: 'normal',
  roundDuration: 90,
  runnerLives: 2,
  safeZonesEnabled: true,
  audioVolume: 0.8,
  musicVolume: 0.4,
  cameraSensitivity: 1.0,
  shadows: true,
};

export const DEFAULT_PLAYER_CUSTOMIZATION: CharacterCustomization = {
  skinTone: '#FCD34D',
  hairStyle: 'spiky',
  hairColor: '#1F2937',
  shirtColor: '#F59E0B',
  pantsColor: '#1E293B',
  accessory: 'none',
  faceExpression: 'smile',
  avatarName: 'You',
};

// Generate the 7 stones with physical properties
export function createSevenStones(): StoneData[] {
  const stones: StoneData[] = [];
  const stoneColors = [
    '#78716C', // Stone 0
    '#C2410C', // Stone 1
    '#B45309', // Stone 2
    '#475569', // Stone 3
    '#A16207', // Stone 4
    '#0D9488', // Stone 5
    '#E11D48', // Stone 6
  ];

  let currentY = 0.08;
  for (let i = 0; i < 7; i++) {
    const size = 0.58 - i * 0.055; // 0.58 down to 0.25
    const height = 0.12;
    stones.push({
      id: i,
      size,
      height,
      color: stoneColors[i],
      position: [0, currentY + height / 2, 0],
      rotation: [0, (i * 0.4), 0],
      isStacked: true,
      isHeld: false,
      carrierId: null,
      velocity: [0, 0, 0],
      angularVelocity: [0, 0, 0],
    });
    currentY += height;
  }
  return stones;
}

// Generate match players (Human + AI teammates and opponents)
export function createPlayers(
  humanTeam: TeamType,
  customization: CharacterCustomization,
  lives: number
): PlayerState[] {
  const players: PlayerState[] = [];

  // Human player
  players.push({
    id: 'player-human',
    name: customization.avatarName || 'You',
    team: humanTeam,
    isHuman: true,
    position: humanTeam === 'runners' ? [0, 0, 9] : [0, 0, -8],
    rotation: humanTeam === 'runners' ? Math.PI : 0,
    velocity: [0, 0, 0],
    isGrounded: true,
    isEliminated: false,
    lives: lives,
    carryingStoneIndex: null,
    animation: 'idle',
    customization: customization,
  });

  // Runner AI teammates / opponents
  const runnerNames = ['Aarav', 'Diya', 'Rohan'];
  const runnerSkins = ['#FBBF24', '#FCD34D', '#F59E0B'];
  const runnerHairs: CharacterCustomization['hairStyle'][] = ['curly', 'headband', 'cap'];

  for (let i = 0; i < 3; i++) {
    if (humanTeam === 'runners' && i === 0) {
      // 1 human + 2 AI runners
      continue;
    }
    const idx = i;
    const spawnZ = 7 + idx * 2.5;
    const spawnX = (idx % 2 === 0 ? 1 : -1) * (3.5 + idx * 2.5);

    players.push({
      id: `ai-runner-${idx}`,
      name: runnerNames[idx],
      team: 'runners',
      isHuman: false,
      position: [spawnX, 0, spawnZ],
      rotation: Math.PI,
      velocity: [0, 0, 0],
      isGrounded: true,
      isEliminated: false,
      lives: lives,
      carryingStoneIndex: null,
      animation: 'idle',
      customization: {
        skinTone: runnerSkins[idx],
        hairStyle: runnerHairs[idx],
        hairColor: idx === 1 ? '#451A03' : '#111827',
        shirtColor: '#F59E0B',
        pantsColor: '#1E293B',
        accessory: idx === 0 ? 'wristband' : 'badge',
        faceExpression: idx === 1 ? 'excited' : 'determined',
        avatarName: runnerNames[idx],
      },
      aiState: 'IDLE',
      throwCooldown: 0,
    });
  }

  // Seeker AI teammates / opponents
  const seekerNames = ['Kabir', 'Ananya', 'Vivaan'];
  const seekerSkins = ['#FCD34D', '#FDE68A', '#FBBF24'];
  const seekerHairs: CharacterCustomization['hairStyle'][] = ['spiky', 'headband', 'curly'];

  for (let i = 0; i < 3; i++) {
    if (humanTeam === 'seekers' && i === 0) {
      // 1 human + 2 AI seekers
      continue;
    }
    const idx = i;
    const spawnZ = -6 - idx * 2.5;
    const spawnX = (idx % 2 === 0 ? -1 : 1) * (4 + idx * 2);

    players.push({
      id: `ai-seeker-${idx}`,
      name: seekerNames[idx],
      team: 'seekers',
      isHuman: false,
      position: [spawnX, 0, spawnZ],
      rotation: 0,
      velocity: [0, 0, 0],
      isGrounded: true,
      isEliminated: false,
      lives: lives,
      carryingStoneIndex: null,
      animation: 'idle',
      customization: {
        skinTone: seekerSkins[idx],
        hairStyle: seekerHairs[idx],
        hairColor: '#111827',
        shirtColor: '#0284C7',
        pantsColor: '#0F172A',
        accessory: idx === 2 ? 'glasses' : 'wristband',
        faceExpression: idx === 0 ? 'determined' : 'cool',
        avatarName: seekerNames[idx],
      },
      aiState: 'IDLE',
      throwCooldown: 0,
    });
  }

  return players;
}

// Distance helper
export function getDist3D(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function getDist2D(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

// Check if player is inside one of the safe zones
export function isInsideSafeZone(pos: [number, number, number]): boolean {
  const safeZones: [number, number][] = [[-14, 14], [14, -14]];
  for (const [zx, zz] of safeZones) {
    const dist = Math.sqrt((pos[0] - zx) ** 2 + (pos[2] - zz) ** 2);
    if (dist <= 2.6) return true;
  }
  return false;
}
