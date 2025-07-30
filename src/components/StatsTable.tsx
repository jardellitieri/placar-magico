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
import { PlayerStats, Team, Game } from "@/types/football";
import { Trophy, Target, Users, Shield } from "lucide-react";

interface StatsTableProps {
  playerStats: PlayerStats[];
  teams: Team[];
  players: any[];
  games: Game[];
}

export const StatsTable = ({ playerStats, teams, players, games }: StatsTableProps) => {
  const getPlayerTeam = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player?.teamId) return null;
    return teams.find(t => t.id === player.teamId);
  };

  // Ranking de gols
  const goalRanking = [...playerStats]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  // Ranking de assistências
  const assistRanking = [...playerStats]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10);

  // Calcular gols sofridos por goleiro
  const goalkeepers = players.filter(p => p.position === 'Goleiro');
  const goalkeeperStats = goalkeepers.map(gk => {
    const gamesPlayed = games.filter(game => 
      game.events.some(event => event.playerId === gk.id)
    ).length;
    
    const goalsConceded = games.reduce((total, game) => {
      const isGoalkeeperInGame = game.events.some(event => event.playerId === gk.id);
      if (!isGoalkeeperInGame) return total;
      
      // Assumindo que o goleiro sofreu os gols do adversário
      return total + (game.isHome ? game.awayGoals : game.homeGoals);
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
                {goalRanking.map((player, index) => (
                  <div key={player.playerId} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">
                        {index + 1}º
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <Badge className="bg-goal text-goal-foreground">
                      {player.goals} gols
                    </Badge>
                  </div>
                ))}
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
                {assistRanking.map((player, index) => (
                  <div key={player.playerId} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">
                        {index + 1}º
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <Badge className="bg-assist text-assist-foreground">
                      {player.assists} assists
                    </Badge>
                  </div>
                ))}
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