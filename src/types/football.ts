export interface Team {
  id: string;
  name: string;
  players: string[]; // Array of player IDs
}

export interface Player {
  id: string;
  name: string;
  position: string;
  level: 1 | 2;
  teamId?: string;
  goals: number;
  assists: number;
  gamesPlayed: number;
  availableForDraft: boolean;
}

export interface GameEvent {
  playerId: string;
  playerName: string;
  type: 'goal' | 'assist' | 'own_goal' | 'goal_conceded';
  minute: number;
}

export interface Game {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
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