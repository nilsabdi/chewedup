type Type = //'GameStart' |
  // 'GameRoundFreeze' |
  | "GameRoundStart"
  | "GameRoundEnd"
  | "GameRoundWin"
  // 'GameScore' |
  // 'GamePause' |
  | "FaceItScore"
  | "PlayerDropped"
  | "PlayerPickedUp"
  | "PlayerKill"
  | "PlayerKillAssist"
  | "PlayerAttack"
  // 'PlayerThrew' |
  // 'PlayerBlinded' |
  | "PlayerMoneyChange"
  // 'PlayerMoneyHas' |
  | "PlayerPurchase"
  | "PlayerLeftBuyzone"
  // 'PlayerBombGot' |
  // 'PlayerBombBeginPlant' |
  // 'PlayerBombPlanted' |
  // 'PlayerBombDropped' |
  // 'PlayerBombBeginDefuse' |
  // 'PlayerBombDefused' |
  | "TeamScored"
  | "TeamSide";

type Meta = {
  time: number;
  type: Type;
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
  player: Player;
  weapon: string;
} & Meta;

type PlayerPickedUp = {
  player: Player;
  weapon: string;
} & Meta;

type PlayerKill = {
  attacker: Player;
  attackerPosition: Position;
  victim: Player;
  victimPosition: Position;
  weapon: string;
  headshot: boolean;
  penetrated: boolean;
} & Meta;

type PlayerKillAssist = {
  attacker: Player;
  victim: Player;
  flash: boolean;
} & Meta;

type PlayerAttack = {
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
  player: Player;
  equation: Equation;
  purchase?: string;
} & Meta;

type PlayerLeftBuyzone = {
  player: Player;
  weapons: string[];
} & Meta;

type TeamScored = {
  team: string;
  score: number;
  players: number;
} & Meta;

type TeamSide = {
  team: string;
  name: string;
} & Meta;

type GameRoundStart = {} & Meta;

type GameRoundEnd = {} & Meta;

type GameRoundWin = {
  team: string;
  method: string; //'win' | 'defuse' | 'bomb';
  round: number;
  ct_score: number;
  t_score: number;
} & Meta;

type AllEvents = PlayerDropped &
  PlayerPickedUp &
  PlayerKill &
  PlayerKillAssist &
  PlayerAttack &
  PlayerMoneyChange &
  PlayerLeftBuyzone &
  TeamScored &
  TeamSide &
  GameRoundStart &
  GameRoundEnd &
  GameRoundWin;
