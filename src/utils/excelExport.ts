import * as XLSX from 'xlsx';
import { PlayerStats, Game, Player, Team } from '@/types/football';

export const exportStatsToExcel = (
  playerStats: PlayerStats[],
  games: Game[],
  players: Player[],
  teams: Team[]
) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Estatísticas Gerais dos Jogadores
  const generalStats = playerStats.map((stat, index) => {
    const player = players.find(p => p.id === stat.playerId);
    const team = player?.teamId ? teams.find(t => t.id === player.teamId) : null;
    
    return {
      'Posição': index + 1,
      'Jogador': stat.name,
      'Time': team?.name || 'Sem time',
      'Jogos': stat.gamesPlayed,
      'Gols': stat.goals,
      'Assistências': stat.assists,
      'Total de Pontos': stat.totalPoints
    };
  });
  
  const ws1 = XLSX.utils.json_to_sheet(generalStats);
  XLSX.utils.book_append_sheet(wb, ws1, "Estatísticas Gerais");

  // Aba 2: Ranking de Artilheiros
  const topScorers = [...playerStats]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10)
    .map((player, index) => ({
      'Posição': index + 1,
      'Jogador': player.name,
      'Gols': player.goals
    }));

  const ws2 = XLSX.utils.json_to_sheet(topScorers);
  XLSX.utils.book_append_sheet(wb, ws2, "Top Artilheiros");

  // Aba 3: Ranking de Assistências
  const topAssists = [...playerStats]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10)
    .map((player, index) => ({
      'Posição': index + 1,
      'Jogador': player.name,
      'Assistências': player.assists
    }));

  const ws3 = XLSX.utils.json_to_sheet(topAssists);
  XLSX.utils.book_append_sheet(wb, ws3, "Top Assistências");

  // Aba 4: Ranking de Goleiros
  const goalkeepers = players.filter(p => p.position === 'Goleiro');
  const goalkeeperStats = goalkeepers.map(gk => {
    const gamesPlayed = games.filter(game => 
      game.events.some(event => event.playerId === gk.id)
    ).length;
    
    const goalsConceded = games.reduce((total, game) => {
      const isGoalkeeperInGame = game.events.some(event => event.playerId === gk.id);
      if (!isGoalkeeperInGame) return total;
      
      return total + game.opponentGoals;
    }, 0);

    return {
      'Goleiro': gk.name,
      'Jogos': gamesPlayed,
      'Gols Sofridos': goalsConceded,
      'Média por Jogo': gamesPlayed > 0 ? (goalsConceded / gamesPlayed).toFixed(2) : '0.00'
    };
  }).sort((a, b) => Number(a['Média por Jogo']) - Number(b['Média por Jogo']));

  const ws4 = XLSX.utils.json_to_sheet(goalkeeperStats);
  XLSX.utils.book_append_sheet(wb, ws4, "Ranking Goleiros");

  // Aba 5: Histórico de Jogos
  const gamesHistory = games.map(game => ({
    'Data': new Date(game.date).toLocaleDateString('pt-BR'),
    'Adversário': game.opponent,
    'Resultado': `${game.ourGoals} x ${game.opponentGoals}`,
    'Total de Eventos': game.events.length
  }));

  const ws5 = XLSX.utils.json_to_sheet(gamesHistory);
  XLSX.utils.book_append_sheet(wb, ws5, "Histórico de Jogos");

  // Aba 6: Times e Jogadores
  const teamsData = teams.map(team => {
    const teamPlayers = players.filter(p => p.teamId === team.id);
    return {
      'Time': team.name,
      'Número de Jogadores': teamPlayers.length,
      'Jogadores': teamPlayers.map(p => p.name).join(', ')
    };
  });

  const ws6 = XLSX.utils.json_to_sheet(teamsData);
  XLSX.utils.book_append_sheet(wb, ws6, "Times e Jogadores");

  // Gerar arquivo e fazer download
  const fileName = `estatisticas_futebol_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};