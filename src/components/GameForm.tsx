import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Player, GameEvent } from "@/types/football";
import { DraftedTeam } from "@/hooks/useFootballData";
import { Calendar, Plus, Target, Users, Trash2, Shield, SkipBack } from "lucide-react";

interface GameFormProps {
  players: Player[];
  draftedTeams: DraftedTeam[];
  onAddGame: (game: {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
    events: GameEvent[];
  }) => void;
}

export const GameForm = ({ players, draftedTeams, onAddGame }: GameFormProps) => {
  const [date, setDate] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [eventType, setEventType] = useState<"goal" | "assist" | "own_goal" | "goal_conceded">("goal");
  
  // Função para encontrar o time de um jogador
  const findPlayerTeam = (playerId: string): string => {
    for (const team of draftedTeams) {
      const allPlayers = [
        ...team.goalkeepers,
        ...team.defenders,
        ...team.midfielders,
        ...team.forwards
      ];
      if (allPlayers.some(p => p.id === playerId)) {
        return team.name;
      }
    }
    return "";
  };
  
  // Calcular placar automaticamente baseado nos eventos
  const homeGoals = events.filter(event => {
    const playerTeam = findPlayerTeam(event.playerId);
    return (event.type === 'goal' && playerTeam === homeTeam) ||
           (event.type === 'own_goal' && playerTeam === awayTeam) ||
           (event.type === 'goal_conceded' && playerTeam === homeTeam);
  }).length;
  
  const awayGoals = events.filter(event => {
    const playerTeam = findPlayerTeam(event.playerId);
    return (event.type === 'goal' && playerTeam === awayTeam) ||
           (event.type === 'own_goal' && playerTeam === homeTeam) ||
           (event.type === 'goal_conceded' && playerTeam === awayTeam);
  }).length;

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
    if (date && homeTeam && awayTeam && homeTeam !== awayTeam) {
      onAddGame({
        date,
        homeTeam,
        awayTeam,
        homeGoals,
        awayGoals,
        events
      });
      
      // Reset form
      setDate("");
      setHomeTeam("");
      setAwayTeam("");
      setEvents([]);
      setSelectedPlayer("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Registrar Jogo
        </CardTitle>
      </CardHeader>
      
      <CardContent>
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
              
              <Select value={eventType} onValueChange={(value: "goal" | "assist" | "own_goal" | "goal_conceded") => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Gol</SelectItem>
                  <SelectItem value="assist">Assistência</SelectItem>
                  <SelectItem value="own_goal">Gol Contra</SelectItem>
                  <SelectItem value="goal_conceded">Gol Sofrido</SelectItem>
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
                      ) : event.type === 'assist' ? (
                        <Users className="h-4 w-4 text-assist" />
                      ) : event.type === 'own_goal' ? (
                        <SkipBack className="h-4 w-4 text-destructive" />
                      ) : (
                        <Shield className="h-4 w-4 text-destructive" />
                      )}
                      <span>{event.playerName}</span>
                      <span className="text-muted-foreground">({findPlayerTeam(event.playerId)})</span>
                      <Badge variant={
                        event.type === 'goal' ? 'default' : 
                        event.type === 'assist' ? 'secondary' : 
                        'destructive'
                      }>
                        {event.type === 'goal' ? 'Gol' : 
                         event.type === 'assist' ? 'Assistência' : 
                         event.type === 'own_goal' ? 'Gol Contra' : 
                         'Gol Sofrido'}
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

          <Button type="submit" className="w-full">
            Registrar Jogo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};