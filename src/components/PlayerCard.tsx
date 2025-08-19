import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/football";
import { Trash2, Users } from "lucide-react";
import { EditPlayerDialog } from "./EditPlayerDialog";

interface PlayerCardProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
}

export const PlayerCard = ({ players, onRemovePlayer, onUpdatePlayer }: PlayerCardProps) => {
  // Garantir que players seja sempre um array
  const safePlayersList = players || [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {safePlayersList.map((player) => (
        <Card key={player.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{player.position}</Badge>
                  <Badge variant={player.availableForDraft ? "default" : "destructive"}>
                    {player.availableForDraft ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <EditPlayerDialog 
                  player={player} 
                  onUpdatePlayer={onUpdatePlayer}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemovePlayer(player.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-semibold">{player.goals}</p>
                <p className="text-muted-foreground">Gols</p>
              </div>
              <div>
                <p className="font-semibold">{player.assists}</p>
                <p className="text-muted-foreground">Assistências</p>
              </div>
              <div>
                <p className="font-semibold">{player.gamesPlayed}</p>
                <p className="text-muted-foreground">Jogos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};