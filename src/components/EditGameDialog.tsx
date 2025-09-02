import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Player, GameEvent, Game } from "@/types/football";
import { DraftedTeam } from "@/hooks/useFootballData";
import { Plus, Target, Users, Trash2 } from "lucide-react";

interface EditGameDialogProps {
  game: Game | null;
  players: Player[];
  draftedTeams: DraftedTeam[];
  onUpdateGame: (gameId: string, updatedGame: {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
    events: GameEvent[];
  }) => void;
  onClose: () => void;
}

export const EditGameDialog = ({ 
  game, 
  players, 
  draftedTeams, 
  onUpdateGame, 
  onClose 
}: EditGameDialogProps) => {
  const [date, setDate] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [eventType, setEventType] = useState<"goal" | "assist">("goal");

  // Populate form with game data when game changes
  useEffect(() => {
    if (game) {
      setDate(game.date);
      setHomeTeam(game.homeTeam);
      setAwayTeam(game.awayTeam);
      setEvents(game.events);
      setSelectedPlayer("");
    }
  }, [game]);

  // Função para encontrar o time de um jogador
  const findPlayerTeam = (playerId: string): string => {
    for (const team of draftedTeams) {
      const allPlayers = [
        ...team.goalkeepers,
        ...team.defenders,
        ...team.midfielders,
        ...team.forwards,
        ...(team.attackingMidfielders || []),
        ...(team.pivots || [])
      ];
      if (allPlayers.some(p => p.id === playerId)) {
        return team.name;
      }
    }
    return "";
  };

  // Calcular placar automaticamente baseado nos eventos
  const homeGoals = events.filter(event => 
    event.type === 'goal' && findPlayerTeam(event.playerId) === homeTeam
  ).length;
  
  const awayGoals = events.filter(event => 
    event.type === 'goal' && findPlayerTeam(event.playerId) === awayTeam
  ).length;

  const addEvent = () => {
    if (selectedPlayer) {
      const player = players.find(p => p.id === selectedPlayer);
      if (player) {
        const newEvent: GameEvent = {
          playerId: selectedPlayer,
          playerName: player.name,
          type: eventType,
          minute: 0
        };
        setEvents(prev => [...prev, newEvent]);
        setSelectedPlayer("");
      }
    }
  };

  const removeEvent = (index: number) => {
    setEvents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (game && date && homeTeam && awayTeam && homeTeam !== awayTeam) {
      onUpdateGame(game.id, {
        date,
        homeTeam,
        awayTeam,
        homeGoals,
        awayGoals,
        events
      });
      onClose();
    }
  };

  if (!game) return null;

  return (
    <Dialog open={!!game} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Jogo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            
            <Select value={homeTeam} onValueChange={setHomeTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Time da Casa" />
              </SelectTrigger>
              <SelectContent>
                {draftedTeams.map((team) => (
                  <SelectItem key={team.name} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={awayTeam} onValueChange={setAwayTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Time Visitante" />
              </SelectTrigger>
              <SelectContent>
                {draftedTeams.map((team) => (
                  <SelectItem key={team.name} value={team.name} disabled={team.name === homeTeam}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center text-sm text-muted-foreground">
              {homeTeam || "Time da Casa"}
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input
                type="number"
                min="0"
                value={homeGoals}
                readOnly
                className="text-center bg-muted"
              />
              <span className="text-center font-bold">X</span>
              <Input
                type="number"
                min="0"
                value={awayGoals}
                readOnly
                className="text-center bg-muted"
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {awayTeam || "Time Visitante"}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Eventos do Jogo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => {
                    const playerTeam = findPlayerTeam(player.id);
                    return (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} {playerTeam && `(${playerTeam})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={eventType} onValueChange={(value: "goal" | "assist") => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Gol</SelectItem>
                  <SelectItem value="assist">Assistência</SelectItem>
                </SelectContent>
              </Select>
              
              <Button type="button" onClick={addEvent} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {events.length > 0 && (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {event.type === 'goal' ? (
                        <Target className="h-4 w-4 text-goal" />
                      ) : (
                        <Users className="h-4 w-4 text-assist" />
                      )}
                      <span>{event.playerName}</span>
                      <span className="text-muted-foreground">({findPlayerTeam(event.playerId)})</span>
                      <Badge variant={event.type === 'goal' ? 'default' : 'secondary'}>
                        {event.type === 'goal' ? 'Gol' : 'Assistência'}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};