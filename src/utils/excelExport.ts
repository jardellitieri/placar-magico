import * as XLSX from 'xlsx';
import { PlayerStats, Game, Player } from '@/types/football';
import { DraftedTeam } from '@/hooks/useFootballData';

export const exportStatsToExcel = (
  playerStats: PlayerStats[],
  games: Game[],
  players: Player[],
  draftedTeams: DraftedTeam[]
) => {
  // Função para obter o time do jogador
  const getPlayerTeam = (playerId: string) => {
    for (const team of draftedTeams) {
      if (team.players.some(p => p.id === playerId)) {
        return team.name;
      }
    }
    return "Sem time";
  };

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Estatísticas Gerais dos Jogadores
  const generalStats = playerStats.map((stat, index) => {
    return {
      'Posição': index + 1,
      'Jogador': stat.name,
      'Time': getPlayerTeam(stat.playerId),
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
      
      // Para cada jogo, assumir que o goleiro sofreu os gols dos gols totais menos os do seu time
      const goalsInGame = game.events.filter(e => e.type === 'goal' && e.playerId === gk.id).length;
      return total + Math.max(0, (game.homeGoals + game.awayGoals) - goalsInGame);
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
    'Time da Casa': game.homeTeam,
    'Time Visitante': game.awayTeam,
    'Resultado': `${game.homeGoals} x ${game.awayGoals}`,
    'Total de Eventos': game.events.length
  }));

  const ws5 = XLSX.utils.json_to_sheet(gamesHistory);
  XLSX.utils.book_append_sheet(wb, ws5, "Histórico de Jogos");

  // Aba 6: Times e Jogadores
  const teamsData = draftedTeams.map(team => {
    return {
      'Time': team.name,
      'Número de Jogadores': team.players.length,
      'Jogadores': team.players.map(p => p.name).join(', ')
    };
  });

  const ws6 = XLSX.utils.json_to_sheet(teamsData);
  XLSX.utils.book_append_sheet(wb, ws6, "Times e Jogadores");

  // Gerar arquivo e fazer download
  const fileName = `estatisticas_futebol_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};