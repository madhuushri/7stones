export type TeamType = 'runners' | 'seekers';

export type GameMode = 'match' | 'practice';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type MatchPhase =
  | 'menu'
  | 'customizing'
  | 'aiming_throw' // Round start: Runner aims ball at the stone stack
  | 'active'       // Stones scattered: Runners collect & stack, Seekers hunt runners
  | 'lagori'       // Stones completely stacked: Runners victory celebration
  | 'eliminated'   // All runners tagged out: Seekers victory
  | 'time_up'      // Round timer expired: Seekers victory
  | 'paused';

export interface CharacterCustomization {
  skinTone: string;
  hairStyle: 'spiky' | 'curly' | 'cap' | 'headband' | 'bald';
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory: 'none' | 'glasses' | 'badge' | 'wristband';
  faceExpression: 'smile' | 'determined' | 'excited' | 'cool';
  avatarName: string;
}

export type AvatarAnimationState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'throw'
  | 'hit'
  | 'dance'
  | 'celebrate';

export interface PlayerState {
  id: string;
  name: string;
  team: TeamType;
  isHuman: boolean;
  position: [number, number, number];
  rotation: number; // yaw angle in radians
  velocity: [number, number, number];
  isGrounded: boolean;
  isEliminated: boolean;
  lives: number;
  carryingStoneIndex: number | null; // index 0-6 of stone held, or null
  animation: AvatarAnimationState;
  customization: CharacterCustomization;
  aiState?: 'IDLE' | 'FIND_STONE' | 'DELIVER_STONE' | 'FLEE' | 'CHASE_BALL' | 'CHASE_RUNNER' | 'AIM_AND_THROW' | 'CELEBRATE';
  targetPos?: [number, number, number];
  throwCooldown?: number;
}

export interface StoneData {
  id: number; // 0 (bottom, largest) to 6 (top, smallest)
  size: number; // radius
  height: number;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isStacked: boolean; // currently on the tower
  isHeld: boolean;
  carrierId: string | null;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}

export interface BallState {
  position: [number, number, number];
  velocity: [number, number, number];
  holderId: string | null; // player holding the ball, or null if loose
  isFree: boolean;
  lastThrownBy: string | null;
}

export interface GameSettings {
  difficulty: AIDifficulty;
  roundDuration: number; // in seconds (e.g. 90)
  runnerLives: number; // 1 to 3
  safeZonesEnabled: boolean;
  audioVolume: number;
  musicVolume: number;
  cameraSensitivity: number;
  shadows: boolean;
}

export interface MatchScore {
  runnersScore: number;
  seekersScore: number;
  currentRound: number;
  maxRounds: number;
}
