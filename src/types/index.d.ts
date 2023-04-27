type Meta = {
  time: number;
};

type Position = {
  x: number;
  y: number;
  z: number;
};

type Player = {
  name: string;
  id: number;
  steamId: string;
  team: string;
};

type Equation = {
  a: number;
  b: number;
  result: number;
};

// Event types
type PlayerDropped = {
  type: "PlayerDropped";
  player: Player;
  weapon: string;
} & Meta;

type PlayerPickedUp = {
  type: "PlayerPickedUp";
  player: Player;
  weapon: string;
} & Meta;

type PlayerKill = {
  type: "PlayerKill";
  attacker: Player;
  attackerPosition: Position;
  victim: Player;
  victimPosition: Position;
  weapon: string;
  headshot: boolean;
  penetrated: boolean;
} & Meta;

type PlayerKillAssist = {
  type: "PlayerKillAssist";
  attacker: Player;
  victim: Player;
  flash: boolean;
} & Meta;

type PlayerAttack = {
  type: "PlayerAttack";
  attacker: Player;
  attackerPosition: Position;
  victim: Player;
  victimPosition: Position;
  weapon: string;
  damage: number;
  damageArmor: number;
  health: number;
  armor: number;
  hitgroup: string;
} & Meta;

type PlayerMoneyChange = {
  type: "PlayerMoneyChange";
  player: Player;
  equation: Equation;
  purchase?: string;
} & Meta;

type PlayerLeftBuyzone = {
  type: "PlayerLeftBuyzone";
  player: Player;
  weapons: string[];
} & Meta;

type TeamScored = {
  type: "TeamScored";
  team: string;
  score: number;
  players: number;
} & Meta;

type TeamSide = {
  type: "TeamSide";
  team: string;
  name: string;
} & Meta;

type GameRoundStart = {
  type: "GameRoundStart";
} & Meta;

type GameRoundEnd = {
  type: "GameRoundEnd";
} & Meta;

type GameRoundWin = {
  type: "GameRoundWin";
  team: string;
  method: string; //'win' | 'defuse' | 'bomb';
  round: number;
  ct_score: number;
  t_score: number;
} & Meta;

// Let's use a discriminated union together with assert functions to make sure we have the correct type
type LogEvent =
  | PlayerDropped
  | PlayerPickedUp
  | PlayerKill
  | PlayerKillAssist
  | PlayerAttack
  | PlayerMoneyChange
  | PlayerLeftBuyzone
  | TeamScored
  | TeamSide
  | GameRoundStart
  | GameRoundEnd
  | GameRoundWin;
