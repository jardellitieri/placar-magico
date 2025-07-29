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
import { PlayerStats } from "@/types/football";
import { Trophy, Target, Users } from "lucide-react";

interface StatsTableProps {
  playerStats: PlayerStats[];
}

export const StatsTable = ({ playerStats }: StatsTableProps) => {
  return (
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
  );
};