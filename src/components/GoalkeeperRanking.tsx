import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy } from "lucide-react";
import { PlayerStats } from "@/types/football";

interface GoalkeeperRankingProps {
  goalkeepers: PlayerStats[];
}

export const GoalkeeperRanking = ({ goalkeepers }: GoalkeeperRankingProps) => {
  if (goalkeepers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ranking de Goleiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum goleiro encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Ranking de Goleiros - Liberados para Sorteio (Menos Gols Sofridos)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goalkeepers.map((goalkeeper, index) => (
          <div key={goalkeeper.playerId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                <span className="font-semibold text-lg">#{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{goalkeeper.name}</p>
                <p className="text-sm text-muted-foreground">
                  {goalkeeper.gamesPlayed} jogos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {goalkeeper.goalsConceded} gols sofridos
              </Badge>
              {goalkeeper.goals > 0 && (
                <Badge variant="default" className="text-xs">
                  {goalkeeper.goals} gols
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};