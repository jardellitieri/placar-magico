import { useState, useEffect } from 'react';
import { Player, Game, PlayerStats, Team } from '@/types/football';

const STORAGE_KEYS = {
  PLAYERS: 'football-players',
  GAMES: 'football-games',
  TEAMS: 'football-teams'
};

export const useFootballData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const savedGames = localStorage.getItem(STORAGE_KEYS.GAMES);
    const savedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
    
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
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
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  const addPlayer = (player: Omit<Player, 'id' | 'goals' | 'assists' | 'gamesPlayed'>) => {
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
      goals: 0,
      assists: 0,
      gamesPlayed: 0
    };
    setPlayers(prev => [...prev, newPlayer]);
    
    // Add player to team if teamId is provided
    if (player.teamId) {
      setTeams(prev => prev.map(team => 
        team.id === player.teamId 
          ? { ...team, players: [...team.players, newPlayer.id] }
          : team
      ));
    }
  };

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    
    // Remove player from team
    setTeams(prev => prev.map(team => ({
      ...team,
      players: team.players.filter(id => id !== playerId)
    })));
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

  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      players: []
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const removeTeam = (teamId: string) => {
    // Remove team association from players
    setPlayers(prev => prev.map(player => 
      player.teamId === teamId 
        ? { ...player, teamId: undefined }
        : player
    ));
    
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const addPlayerToTeam = (playerId: string, teamId: string) => {
    // Remove player from current team first
    setTeams(prev => prev.map(team => ({
      ...team,
      players: team.players.filter(id => id !== playerId)
    })));
    
    // Add to new team
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, players: [...team.players, playerId] }
        : team
    ));
    
    // Update player's teamId
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, teamId }
        : player
    ));
  };

  const removePlayerFromTeam = (playerId: string) => {
    setTeams(prev => prev.map(team => ({
      ...team,
      players: team.players.filter(id => id !== playerId)
    })));
    
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, teamId: undefined }
        : player
    ));
  };

  return {
    players,
    games,
    teams,
    addPlayer,
    removePlayer,
    addGame,
    getPlayerStats,
    addTeam,
    removeTeam,
    addPlayerToTeam,
    removePlayerFromTeam
  };
};