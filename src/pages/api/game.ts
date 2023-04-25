import type { NextApiRequest, NextApiResponse } from 'next'

// Regexes of lines to ignore
const blacklist = [
  / connected, address/, // Player connected
  / STEAM USERID validated/, // Player validated
  / entered the game/, // Player entered the game
  / Your server needs to be restarted in order to receive the latest update./, // Server software update
  /Please be aware that this match has overtime enabled, there is no tie./, // Overtime enabled
  /disconnected/, // Player disconnected
  /say(_team)?/, // Ignore chat messages
  /func_breakable<\d*>/, // Ignore func_breakable
  /projectile spawned at/, // Ignore spawned projectiles
  /killed other/, // Ignore NPC kills
  /(Spectator|Unassigned)>' blinded /, // Ignore bots/spectator blinded
  /Vote (cast|started|succeeded) 'StartTimeOut '/, // Ignore votes
  /ACCOLADE, FINAL/, // Ignore accolades, we want to compute these ourselves
  // /World triggered/, // Ignore world triggered events
  /switched from team/, // Ignore team switches
  /FACEIT(\^)?]/, // Ignore FACEIT messages
  /Game Over: competitive/,
]

const patterns = {
  GameStartPattern: /LIVE/,
  GameRoundFreezePattern: /Starting Freeze period/,
  GameRoundStartPattern: /World triggered 'Round_Start'/,
  GameRoundEndPattern: /World triggered 'Round_End'/,
  GameRoundWinPattern: /Team '(\w+)' triggered 'SFUI_Notice_(\w+)' \(CT '(\d+)'\) \(T '(\d+)'\)/,
  GameScorePattern: /MatchStatus: Score: (\d+):(\d+) on map '[\w:]+' RoundsPlayed: (\d+)/,
  GamePausePattern: /Match pause is (enabled|disabled) - ([\w:]+)/,
  FaceItScorePattern: /(?:\^])\s+([^[]+)\s+\[(\d+)\s+-\s+(\d+)\]\s+([^[]+)/,
  PlayerDroppedPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' dropped '(\w+)'/,
  PlayerPickedUpPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' picked up '(\w+)'/,
  PlayerKillPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' \[(-?\d+) (-?\d+) (-?\d+)\] killed '(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' \[(-?\d+) (-?\d+) (-?\d+)\] with '(\w+)' ?(\(?(headshot|penetrated|headshot penetrated)?\))?/,
	PlayerKillAssistPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' (flash-)?assisted killing '(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>'/,
	PlayerAttackPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' \[(-?\d+) (-?\d+) (-?\d+)\] attacked '(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' \[(-?\d+) (-?\d+) (-?\d+)\] with '(\w+)' \(damage '(\d+)'\) \(damage_armor '(\d+)'\) \(health '(\d+)'\) \(armor '(\d+)'\) \(hitgroup '([\w ]+)'\)/,
	PlayerThrewPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' threw (\w+) \[(-?\d+) (-?\d+) (-?\d+)\]( flashbang entindex (\d+))?\)?/,
  PlayerBlindedPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' blinded for ([\d.]+) by '(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' from flashbang entindex (\d+)/,
  PlayerMoneyChangePattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' money change (\d+)\+?(-?\d+) = \$(\d+) \(tracked\)( \(purchase: (\w+)\))?/,
  PlayerMoneyHasPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' has (\d+)\$/,
	PlayerPurchasePattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' purchased '(\w+)'/,
  PlayerLeftBuyzonePattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' left buyzone with \[ (.*) \]/,
  PlayerBombGotPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Got_The_Bomb'/,
  PlayerBombBeginPlantPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Bomb_Begin_Plant' at bombsite ([A-Za-z])/,
	PlayerBombPlantedPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Planted_The_Bomb' at bombsite ([A-Za-z])/,
	PlayerBombDroppedPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Dropped_The_Bomb'/,
	PlayerBombBeginDefusePattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Begin_Bomb_Defuse_With(out)?_Kit'/,
	PlayerBombDefusedPattern: /'(.+)<(\d+)><([\w:]+)><(TERRORIST|CT)>' triggered 'Defused_The_Bomb'/,
  TeamScoredPattern: /Team '(CT|TERRORIST)' scored '(\d+)' with '(\d+)' players/,
  TeamSidePattern: /Team playing '(CT|TERRORIST)': (.+)/,
}

const parseTime = (line: string): number => {
  const dateTimeRegex: RegExp = /(\d{1,2}\/\d{1,2}\/\d{4}) - (\d{2}:\d{2}:\d{2})/;
  const [, dateStr, timeStr]: string[] = line.match(dateTimeRegex) || [];
  
  const [month, day, year]: number[] = dateStr.split("/").map(Number);
  const [hours, minutes, seconds]: number[] = timeStr.split(":").map(Number);
  const dateObj: Date = new Date(year, month - 1, day, hours, minutes, seconds);
  
  return dateObj.getTime() / 1000;
  }

const parseLine = (line: string, i: number) => {
  // Test to see if line should be ignored
  const shouldSkip = blacklist.some(rx => rx.test(line))
  if (shouldSkip) return null;

  // Iterate over patterns
  for (const [key, pattern] of Object.entries(patterns)) {
    const regex = new RegExp(pattern)
    const match = regex.exec(line)
    if (match) {
      switch (key) {
        case 'PlayerDroppedPattern':
          const PlayerDropped: PlayerDropped = {
            time: parseTime(line),
            type: 'PlayerDropped',
            player: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            weapon: match[5],
          }
          return PlayerDropped
        case 'PlayerPickedUpPattern':
          const PlayerPickedUp: PlayerPickedUp = {
            time: parseTime(line),
            type: 'PlayerPickedUp',
            player: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            weapon: match[5],
          }
          return PlayerPickedUp;
        case 'PlayerKillPattern':
          const PlayerKill: PlayerKill = {
            time: parseTime(line),
            type: 'PlayerKill',
            attacker: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            attackerPosition: {
              x: Number(match[5]),
              y: Number(match[6]),
              z: Number(match[7]),
            },
            victim: {
              name: match[8],
              id: Number(match[9]),
              steamId: match[10],
              team: match[11],
            },
            victimPosition: {
              x: Number(match[12]),
              y: Number(match[13]),
              z: Number(match[14]),
            },
            weapon: match[15],
            headshot: !!match[17]?.includes('headshot'),
            penetrated: !!match[17]?.includes('penetrated'),
          }
          return PlayerKill;
        case 'PlayerKillAssistPattern':
          const PlayerKillAssist: PlayerKillAssist = {
            time: parseTime(line),
            type: 'PlayerKillAssist',
            attacker: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            victim: {
              name: match[6],
              id: Number(match[7]),
              steamId: match[8],
              team: match[9],
            },
            flash: !!match[5]?.includes('flash'),
          }
          return PlayerKillAssist;
        case 'PlayerAttackPattern':
          const PlayerAttack: PlayerAttack = {
            time: parseTime(line),
            type: 'PlayerAttack',
            attacker: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            attackerPosition: {
              x: Number(match[5]),
              y: Number(match[6]),
              z: Number(match[7]),
            },
            victim: {
              name: match[8],
              id: Number(match[9]),
              steamId: match[10],
              team: match[11],
            },
            victimPosition: {
              x: Number(match[12]),
              y: Number(match[13]),
              z: Number(match[14]),
            },
            weapon: match[15],
            damage: Number(match[16]),
            damageArmor: Number(match[17]),
            health: Number(match[18]),
            armor: Number(match[19]),
            hitgroup: match[20],
          }
          return PlayerAttack;
        case 'PlayerMoneyChangePattern':
          const PlayerMoneyChange: PlayerMoneyChange = {
            time: parseTime(line),
            type: 'PlayerMoneyChange',
            player: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            equation: {
              a: Number(match[5]),
              b: Number(match[6]),
              result: Number(match[7]),
            },
            purchase: match[9],
          }
          return PlayerMoneyChange;
        case 'PlayerLeftBuyzonePattern':
          const PlayerLeftBuyzone: PlayerLeftBuyzone = {
            time: parseTime(line),
            type: 'PlayerLeftBuyzone',
            player: {
              name: match[1],
              id: Number(match[2]),
              steamId: match[3],
              team: match[4],
            },
            weapons: match[5].split(' '),
          }
          return PlayerLeftBuyzone;
        case 'TeamScoredPattern':
          const TeamScored: TeamScored = {
            time: parseTime(line),
            type: 'TeamScored',
            team: match[1],
            score: Number(match[2]),
            players: Number(match[3])
          }
          return TeamScored;
        case 'TeamSidePattern':
          const TeamSide: TeamSide = {
            time: parseTime(line),
            type: 'TeamSide',
            team: match[1],
            name: match[2],
          }
          return TeamSide;
        case 'GameRoundStartPattern':
          const GameRoundStart: GameRoundStart = {
            time: parseTime(line),
            type: 'GameRoundStart',
          }
          return GameRoundStart;
        case 'GameRoundEndPattern':
          const GameRoundEnd: GameRoundEnd = {
            time: parseTime(line),
            type: 'GameRoundEnd',
          }
          return GameRoundEnd;
        case 'GameRoundWinPattern':
          const GameRoundWin: GameRoundWin = {
            time: parseTime(line),
            type: 'GameRoundWin',
            team: match[1],
            method: match[2],
            round: Number(match[3]) + Number(match[4]),
            ct_score: Number(match[3]),
            t_score: Number(match[4]),                     
          }
          return GameRoundWin;
        default:
          return {
            type: key,
            data: match,
            line,
            i,
          }
        }
    }
  }

  return {
    type: 'unknown',
    line,
    i,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // Fetch server log
  const serverLog = await fetch('https://blast-recruiting.s3.eu-central-1.amazonaws.com/NAVIvsVitaGF-Nuke.txt')
  const raw = await serverLog.text()
  // Split lines and remove escaped characters
  const lines = raw.split('\r\n')
    .map(line => line.replace(/\"/g, '\''))

  // To save time, remove anything before lo3, optimally we'd parse the whole log
  const lo3Index = lines.findIndex(line => line.includes('LIVE'))
  const gameLines = lines.slice(lo3Index)

  // Parse each line
  const parsed = gameLines.map((line, i) => parseLine(line, i))
    .filter(n => n) // Remove null lines
    .filter(line => line?.type != 'unknown') // Remove unknown lines

  res.status(200).json(parsed)
}
