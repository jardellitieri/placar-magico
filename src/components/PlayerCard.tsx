import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/football";
import { Trash2, Target, Users } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onRemove: (playerId: string) => void;
}

export const PlayerCard = ({ player, onRemove }: PlayerCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{player.name}</CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">
                {player.position}
              </Badge>
              <Badge variant={player.level === 1 ? "outline" : "default"}>
                Nível {player.level}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(player.id)}
            className="text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-goal" />
              <span className="text-2xl font-bold text-goal">{player.goals}</span>
            </div>
            <p className="text-xs text-muted-foreground">Gols</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-assist" />
              <span className="text-2xl font-bold text-assist">{player.assists}</span>
            </div>
            <p className="text-xs text-muted-foreground">Assistências</p>
          </div>
          
          <div className="space-y-1">
            <span className="text-2xl font-bold">{player.gamesPlayed}</span>
            <p className="text-xs text-muted-foreground">Jogos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};