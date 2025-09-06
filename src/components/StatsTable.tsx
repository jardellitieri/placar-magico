import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerStats, Game } from "@/types/football";
import { DraftedTeam } from "@/hooks/useFootballData";
import { Trophy, Target, Users, Shield, Calendar } from "lucide-react";
import { useState } from "react";

interface StatsTableProps {
  playerStats: PlayerStats[];
  draftedTeams: DraftedTeam[];
  players: any[];
  games: Game[];
}

export const StatsTable = ({ playerStats, draftedTeams, players, games }: StatsTableProps) => {
  const [selectedDate, setSelectedDate] = useState<string>("all");

  const getPlayerTeam = (playerId: string) => {
    for (const team of draftedTeams) {
      if (team.players.some(p => p.id === playerId)) {
        return team;
      }
    }
    return null;
  };

  // Obter datas únicas dos jogos
  const uniqueDates = [...new Set(games.map(game => game.date))].sort().reverse();

  // Filtrar jogos por data selecionada (para rankings específicos)
  const filteredGames = selectedDate === "all" ? games : games.filter(game => game.date === selectedDate);

  // Calcular estatísticas por data selecionada
  const getStatsForDate = (gamesForDate: Game[]) => {
    const statsMap = new Map<string, { goals: number; assists: number; gamesPlayed: number }>();
    
    // Inicializar com todos os jogadores
    players.forEach(player => {
      statsMap.set(player.id, { goals: 0, assists: 0, gamesPlayed: 0 });
    });

    // Contar estatísticas dos jogos filtrados
    gamesForDate.forEach(game => {
      const playersInGame = new Set<string>();
      
      game.events.forEach(event => {
        playersInGame.add(event.playerId);
        const stats = statsMap.get(event.playerId);
        if (stats) {
          if (event.type === 'goal') {
            stats.goals++;
          } else if (event.type === 'assist') {
            stats.assists++;
          }
        }
      });

      // Contar jogos para jogadores que participaram
      playersInGame.forEach(playerId => {
        const stats = statsMap.get(playerId);
        if (stats) {
          stats.gamesPlayed++;
        }
      });
    });

    return Array.from(statsMap.entries()).map(([playerId, stats]) => {
      const player = players.find(p => p.id === playerId);
      return {
        playerId,
        name: player?.name || 'Desconhecido',
        ...stats
      };
    });
  };

  const dateStats = getStatsForDate(filteredGames);

  // Ranking de gols (por data selecionada) - mostra todos com mesma pontuação
  const goalRankingData = dateStats
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  
  const goalRanking = goalRankingData.length > 0 
    ? goalRankingData.filter(p => p.goals >= goalRankingData[0].goals || goalRankingData.findIndex(player => player.goals === p.goals) < 10)
    : [];

  // Ranking de assistências (por data selecionada) - mostra todos com mesma pontuação
  const assistRankingData = dateStats
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists);
    
  const assistRanking = assistRankingData.length > 0 
    ? assistRankingData.filter(p => p.assists >= assistRankingData[0].assists || assistRankingData.findIndex(player => player.assists === p.assists) < 10)
    : [];

  // Calcular gols sofridos por goleiro (por data selecionada)
  const goalkeepers = players.filter(p => p.position === 'Goleiro');
  const goalkeeperStats = goalkeepers.map(gk => {
    const gamesPlayed = filteredGames.filter(game => 
      game.events.some(event => event.playerId === gk.id)
    ).length;
    
    const goalsConceded = filteredGames.reduce((total, game) => {
      const isGoalkeeperInGame = game.events.some(event => event.playerId === gk.id);
      if (!isGoalkeeperInGame) return total;
      
      // Para cada jogo, assumir que o goleiro sofreu os gols dos gols totais menos os do seu time
      const goalsInGame = game.events.filter(e => e.type === 'goal' && e.playerId === gk.id).length;
      return total + Math.max(0, (game.homeGoals + game.awayGoals) - goalsInGame);
    }, 0);

    return {
      ...gk,
      gamesPlayed,
      goalsConceded,
      average: gamesPlayed > 0 ? (goalsConceded / gamesPlayed).toFixed(2) : 0
    };
  }).sort((a, b) => Number(a.average) - Number(b.average));
  return (
    <div className="space-y-6">
      {/* Tabela geral de estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Estatísticas dos Jogadores
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {playerStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum jogador cadastrado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">Jogos</TableHead>
                  <TableHead className="text-center">Gols</TableHead>
                  <TableHead className="text-center">Assistências</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map((player, index) => (
                  <TableRow key={player.playerId}>
                    <TableCell>
                      {index === 0 && (
                        <Badge className="bg-goal text-goal-foreground">
                          1º
                        </Badge>
                      )}
                      {index === 1 && (
                        <Badge variant="secondary">
                          2º
                        </Badge>
                      )}
                      {index === 2 && (
                        <Badge variant="outline">
                          3º
                        </Badge>
                      )}
                      {index > 2 && (
                        <span className="text-muted-foreground">{index + 1}º</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      {getPlayerTeam(player.playerId) ? (
                        <Badge variant="outline" className="text-xs">
                          {getPlayerTeam(player.playerId)?.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem time</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="h-4 w-4 text-goal" />
                        <span className="font-semibold text-goal">{player.goals}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-assist" />
                        <span className="font-semibold text-assist">{player.assists}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold">
                        {player.totalPoints}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Seletor de data para rankings específicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rankings por Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Filtrar por data:</span>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                {uniqueDates.map(date => (
                  <SelectItem key={date} value={date}>
                    {new Date(date).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Gols</p>
              <p className="text-2xl font-bold text-goal">
                {dateStats.reduce((total, player) => total + player.goals, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Assistências</p>
              <p className="text-2xl font-bold text-assist">
                {dateStats.reduce((total, player) => total + player.assists, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Jogos Analisados</p>
              <p className="text-2xl font-bold">
                {filteredGames.length}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            {selectedDate === "all" 
              ? "Mostrando estatísticas de todas as datas" 
              : `Mostrando estatísticas do dia ${new Date(selectedDate).toLocaleDateString('pt-BR')}`
            }
          </p>
        </CardContent>
      </Card>

      {/* Rankings específicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking de Gols */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-goal" />
              Top Artilheiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalRanking.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum gol marcado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {goalRanking.map((player, index) => {
                  const position = goalRankingData.findIndex(p => p.goals === player.goals) + 1;
                  return (
                    <div key={player.playerId} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">
                          {position}º
                        </span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <Badge className="bg-goal text-goal-foreground">
                        {player.goals} gols
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ranking de Assistências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-assist" />
              Top Assistências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assistRanking.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma assistência ainda
              </p>
            ) : (
              <div className="space-y-2">
                {assistRanking.map((player, index) => {
                  const position = assistRankingData.findIndex(p => p.assists === player.assists) + 1;
                  return (
                    <div key={player.playerId} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">
                          {position}º
                        </span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <Badge className="bg-assist text-assist-foreground">
                        {player.assists} assists
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ranking de Goleiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ranking Goleiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalkeeperStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum goleiro cadastrado
              </p>
            ) : (
              <div className="space-y-2">
                {goalkeeperStats.map((gk, index) => (
                  <div key={gk.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">
                        {index + 1}º
                      </span>
                      <div>
                        <span className="font-medium block">{gk.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {gk.gamesPlayed} jogos
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {gk.goalsConceded} gols
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Média: {gk.average}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};