export interface Team {
  id: string;
  name: string;
  players: string[]; // Array of player IDs
}

export interface Player {
  id: string;
  name: string;
  position: string;
  teamId?: string;
  goals: number;
  assists: number;
  gamesPlayed: number;
}

export interface GameEvent {
  playerId: string;
  playerName: string;
  type: 'goal' | 'assist';
  minute: number;
}

export interface Game {
  id: string;
  date: string;
  opponent: string;
  homeGoals: number;
  awayGoals: number;
  isHome: boolean;
  events: GameEvent[];
}

export interface PlayerStats {
  playerId: string;
  name: string;
  goals: number;
  assists: number;
  gamesPlayed: number;
  totalPoints: number;
}