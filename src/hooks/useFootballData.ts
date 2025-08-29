import { useState, useEffect } from 'react';
import { Player, Game, PlayerStats } from '@/types/football';
import { supabase } from '@/integrations/supabase/client';

export interface DraftedTeam {
  name: string;
  players: Player[];
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  attackingMidfielders?: Player[];
  pivots?: Player[];
  level1Count: number;
  level2Count: number;
}

export const useFootballData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [draftedTeams, setDraftedTeams] = useState<DraftedTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });
      
      // Load games with events
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          game_events (
            player_id,
            player_name,
            event_type,
            minute
          )
        `)
        .order('created_at', { ascending: false });
      
      // Load drafted teams
      const { data: draftedTeamsData } = await supabase
        .from('drafted_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (playersData) {
        const formattedPlayers = playersData.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          level: player.level as 1 | 2,
          goals: player.goals,
          assists: player.assists,
          gamesPlayed: player.games_played,
          availableForDraft: player.available_for_draft ?? true
        }));
        setPlayers(formattedPlayers);
      }

      if (gamesData) {
        const formattedGames = gamesData.map(game => ({
          id: game.id,
          date: game.date,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          homeGoals: game.home_goals,
          awayGoals: game.away_goals,
          events: game.game_events.map((event: any) => ({
            playerId: event.player_id,
            playerName: event.player_name,
            type: event.event_type,
            minute: event.minute
          }))
        }));
        setGames(formattedGames);
      }

      if (draftedTeamsData) {
        const formattedTeams = draftedTeamsData.map(team => ({
          name: team.name,
          players: typeof team.players === 'string' ? JSON.parse(team.players) : (team.players as unknown) as Player[],
          goalkeepers: typeof team.goalkeepers === 'string' ? JSON.parse(team.goalkeepers) : (team.goalkeepers as unknown) as Player[],
          defenders: typeof team.defenders === 'string' ? JSON.parse(team.defenders) : (team.defenders as unknown) as Player[],
          midfielders: typeof team.midfielders === 'string' ? JSON.parse(team.midfielders) : (team.midfielders as unknown) as Player[],
          forwards: typeof team.forwards === 'string' ? JSON.parse(team.forwards) : (team.forwards as unknown) as Player[],
          level1Count: team.level1_count,
          level2Count: team.level2_count
        }));
        setDraftedTeams(formattedTeams);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (player: Omit<Player, 'id' | 'goals' | 'assists' | 'gamesPlayed' | 'availableForDraft'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to add players');
      }

      const { data, error } = await supabase
        .from('players')
        .insert({
          name: player.name,
          position: player.position,
          level: player.level,
          user_id: user.id,
          available_for_draft: true // Sempre disponível por padrão
        })
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        position: data.position,
        level: data.level as 1 | 2,
        goals: data.goals,
        assists: data.assists,
        gamesPlayed: data.games_played,
        availableForDraft: data.available_for_draft ?? true
      };

      setPlayers(prev => [...prev, newPlayer]);
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      setPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (error) {
      console.error('Error removing player:', error);
      throw error;
    }
  };

  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to add games');
      }

      // Insert game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          date: game.date,
          home_team: game.homeTeam,
          away_team: game.awayTeam,
          home_goals: game.homeGoals,
          away_goals: game.awayGoals,
          user_id: user.id
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Insert game events
      if (game.events.length > 0) {
        const gameEvents = game.events.map(event => ({
          game_id: gameData.id,
          player_id: event.playerId,
          player_name: event.playerName,
          event_type: event.type,
          minute: event.minute,
          user_id: user.id
        }));

        const { error: eventsError } = await supabase
          .from('game_events')
          .insert(gameEvents);

        if (eventsError) throw eventsError;
      }

      // Update player stats
      await updatePlayerStats(game);

      // Reload data to get fresh stats
      await loadData();
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  };

  const updatePlayerStats = async (game: Omit<Game, 'id'>) => {
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

    // Update each player in the database
    for (const player of players) {
      const updates = playerUpdates[player.id];
      const participated = participatingPlayers.has(player.id);
      
      if (updates || participated) {
        const newGoals = player.goals + (updates?.goals || 0);
        const newAssists = player.assists + (updates?.assists || 0);
        const newGamesPlayed = player.gamesPlayed + (participated ? 1 : 0);

        await supabase
          .from('players')
          .update({
            goals: newGoals,
            assists: newAssists,
            games_played: newGamesPlayed
          })
          .eq('id', player.id);
      }
    }
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

  const saveDraftedTeams = async (teams: DraftedTeam[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to save drafted teams');
      }

      // Clear existing drafted teams
      await supabase.from('drafted_teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new teams
      if (teams.length > 0) {
        const teamsData = teams.map(team => ({
          name: team.name,
          user_id: user.id,
          players: JSON.stringify(team.players),
          goalkeepers: JSON.stringify(team.goalkeepers),
          defenders: JSON.stringify(team.defenders),
          midfielders: JSON.stringify(team.midfielders),
          forwards: JSON.stringify([...(team.attackingMidfielders || []), ...(team.pivots || [])]),
          level1_count: team.level1Count,
          level2_count: team.level2Count
        }));

        const { error } = await supabase
          .from('drafted_teams')
          .insert(teamsData);

        if (error) throw error;
      }

      setDraftedTeams(teams);
    } catch (error) {
      console.error('Error saving drafted teams:', error);
      throw error;
    }
  };

  const clearDraftedTeams = async () => {
    try {
      const { error } = await supabase
        .from('drafted_teams')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setDraftedTeams([]);
    } catch (error) {
      console.error('Error clearing drafted teams:', error);
      throw error;
    }
  };

  const resetAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to reset data');
      }

      // Clear all games and events
      await supabase.from('game_events').delete().eq('user_id', user.id);
      await supabase.from('games').delete().eq('user_id', user.id);
      
      // Clear drafted teams
      await supabase.from('drafted_teams').delete().eq('user_id', user.id);
      
      // Reset player statistics but keep players
      await supabase
        .from('players')
        .update({
          goals: 0,
          assists: 0,
          games_played: 0
        })
        .eq('user_id', user.id);

      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error resetting all data:', error);
      throw error;
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: updates.name,
          position: updates.position,
          level: updates.level,
          available_for_draft: updates.availableForDraft
        })
        .eq('id', playerId);

      if (error) throw error;

      setPlayers(prev => prev.map(p => 
        p.id === playerId 
          ? { ...p, ...updates }
          : p
      ));
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  return {
    players,
    games,
    draftedTeams,
    loading,
    addPlayer,
    removePlayer,
    updatePlayer,
    addGame,
    getPlayerStats,
    saveDraftedTeams,
    clearDraftedTeams,
    resetAllData
  };
};