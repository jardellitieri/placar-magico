import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game } from "@/types/football";
import { Calendar, Target, Users, Edit, SortDesc, SortAsc } from "lucide-react";
import { useState } from "react";

interface GamesListProps {
  games: Game[];
  onEditGame?: (game: Game) => void;
}

export const GamesList = ({ games, onEditGame }: GamesListProps) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const sortedGames = [...games].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Jogos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Mais recentes
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    Mais antigos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedGames.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum jogo registrado ainda
          </p>
        ) : (
          <div className="space-y-4">
            {sortedGames.map((game) => {
              const date = new Date(game.date).toLocaleDateString('pt-BR');
              const result = `${game.homeGoals} x ${game.awayGoals}`;
              
              const homeWin = game.homeGoals > game.awayGoals;
              const isDraw = game.homeGoals === game.awayGoals;
              
              return (
                  <div key={game.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {game.homeTeam} vs {game.awayTeam}
                          </h4>
                          <Badge 
                            variant={homeWin ? "default" : isDraw ? "secondary" : "destructive"}
                          >
                            {homeWin ? `${game.homeTeam} venceu` : isDraw ? "Empate" : `${game.awayTeam} venceu`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{result}</p>
                          <p className="text-xs text-muted-foreground">
                            {game.homeTeam} vs {game.awayTeam}
                          </p>
                        </div>
                        {onEditGame && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditGame(game)}
                            className="ml-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  
                  {game.events.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Eventos:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {game.events.map((event, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {event.type === 'goal' ? (
                              <Target className="h-4 w-4 text-goal" />
                            ) : (
                              <Users className="h-4 w-4 text-assist" />
                            )}
                            <span>{event.playerName}</span>
                            <Badge 
                              variant={event.type === 'goal' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.type === 'goal' ? 'Gol' : 'Assist'}
                            </Badge>
                            
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};