import { useState, useEffect } from 'react';
import { Player, Game, PlayerStats } from '@/types/football';

const STORAGE_KEYS = {
  PLAYERS: 'football-players',
  GAMES: 'football-games',
  DRAFTED_TEAMS: 'football-drafted-teams'
};

export interface DraftedTeam {
  name: string;
  players: Player[];
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  level1Count: number;
  level2Count: number;
}

export const useFootballData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [draftedTeams, setDraftedTeams] = useState<DraftedTeam[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const savedGames = localStorage.getItem(STORAGE_KEYS.GAMES);
    const savedDraftedTeams = localStorage.getItem(STORAGE_KEYS.DRAFTED_TEAMS);
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
    
    if (savedDraftedTeams) {
      setDraftedTeams(JSON.parse(savedDraftedTeams));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRAFTED_TEAMS, JSON.stringify(draftedTeams));
  }, [draftedTeams]);

  const addPlayer = (player: Omit<Player, 'id' | 'goals' | 'assists' | 'gamesPlayed'>) => {
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
      goals: 0,
      assists: 0,
      gamesPlayed: 0
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const addGame = (game: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...game,
      id: Date.now().toString()
    };
    
    setGames(prev => [...prev, newGame]);
    
    // Update player stats
    updatePlayerStats(newGame);
  };

  const updatePlayerStats = (game: Game) => {
    const playerUpdates: { [key: string]: { goals: number; assists: number } } = {};
    
    // Count events for each player
    game.events.forEach(event => {
      if (!playerUpdates[event.playerId]) {
        playerUpdates[event.playerId] = { goals: 0, assists: 0 };
      }
      
      if (event.type === 'goal') {
        playerUpdates[event.playerId].goals++;
      } else if (event.type === 'assist') {
        playerUpdates[event.playerId].assists++;
      }
    });

    // Get all players who participated
    const participatingPlayers = new Set(game.events.map(e => e.playerId));

    setPlayers(prev => prev.map(player => {
      const updates = playerUpdates[player.id];
      const participated = participatingPlayers.has(player.id);
      
      return {
        ...player,
        goals: player.goals + (updates?.goals || 0),
        assists: player.assists + (updates?.assists || 0),
        gamesPlayed: player.gamesPlayed + (participated ? 1 : 0)
      };
    }));
  };

  const getPlayerStats = (): PlayerStats[] => {
    return players
      .map(player => ({
        playerId: player.id,
        name: player.name,
        goals: player.goals,
        assists: player.assists,
        gamesPlayed: player.gamesPlayed,
        totalPoints: player.goals + player.assists
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const saveDraftedTeams = (teams: DraftedTeam[]) => {
    setDraftedTeams(teams);
  };

  const clearDraftedTeams = () => {
    setDraftedTeams([]);
  };

  return {
    players,
    games,
    draftedTeams,
    addPlayer,
    removePlayer,
    addGame,
    getPlayerStats,
    saveDraftedTeams,
    clearDraftedTeams
  };
};