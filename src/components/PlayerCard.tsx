import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/football";
import { Trash2, Edit3, Target, Users, Trophy, Shield } from "lucide-react";
import { EditPlayerDialog } from "./EditPlayerDialog";

interface PlayerCardProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
}

export const PlayerCard = ({ players, onRemovePlayer, onUpdatePlayer }: PlayerCardProps) => {
  // Garantir que players seja sempre um array
  const safePlayersList = players || [];

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Goleiro':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'Pivo':
        return <Target className="h-4 w-4 text-accent" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goleiro':
        return 'border-primary/20 bg-primary/5';
      case 'Pivo':
        return 'border-accent/20 bg-accent/5';
      default:
        return 'border-muted/20 bg-muted/5';
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {safePlayersList.map((player) => (
        <Card 
          key={player.id} 
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-card to-card/50 border-border/50 ${getPositionColor(player.position)}`}
        >
          {/* Header com Nome e Posição */}
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getPositionIcon(player.position)}
                  <h3 className="font-bold text-lg text-foreground truncate">{player.name}</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-medium border-border/50 bg-background/50"
                  >
                    {player.position}
                  </Badge>
                  
                  <Badge 
                    variant={player.availableForDraft ? "default" : "destructive"}
                    className="text-xs font-medium"
                  >
                    {player.availableForDraft ? "Disponível" : "Indisponível"}
                  </Badge>
                  
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                  >
                    Nível {player.level}
                  </Badge>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-1 ml-2">
                <EditPlayerDialog 
                  player={player} 
                  onUpdatePlayer={onUpdatePlayer}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePlayer(player.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Estatísticas */}
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-goal" />
                </div>
                <p className="text-2xl font-bold text-goal">{player.goals}</p>
                <p className="text-xs text-muted-foreground font-medium">Gols</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-assist" />
                </div>
                <p className="text-2xl font-bold text-assist">{player.assists}</p>
                <p className="text-xs text-muted-foreground font-medium">Assistências</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{player.gamesPlayed}</p>
                <p className="text-xs text-muted-foreground font-medium">Jogos</p>
              </div>
            </div>

            {/* Indicador de Performance */}
            {(player.goals > 0 || player.assists > 0) && (
              <div className="mt-4 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {player.goals + player.assists} contribuições
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          {/* Efeito de borda para destacar jogadores disponíveis */}
          {player.availableForDraft && (
            <div className="absolute inset-0 rounded-lg border-2 border-primary/20 pointer-events-none" />
          )}
        </Card>
      ))}
    </div>
  );
};