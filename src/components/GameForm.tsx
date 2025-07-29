import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Player, GameEvent } from "@/types/football";
import { Calendar, Plus, Target, Users, Trash2 } from "lucide-react";

interface GameFormProps {
  players: Player[];
  onAddGame: (game: {
    date: string;
    opponent: string;
    homeGoals: number;
    awayGoals: number;
    isHome: boolean;
    events: GameEvent[];
  }) => void;
}

export const GameForm = ({ players, onAddGame }: GameFormProps) => {
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [isHome, setIsHome] = useState(true);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [eventType, setEventType] = useState<"goal" | "assist">("goal");
  const [minute, setMinute] = useState("");

  const addEvent = () => {
    if (selectedPlayer && minute) {
      const player = players.find(p => p.id === selectedPlayer);
      if (player) {
        const newEvent: GameEvent = {
          playerId: selectedPlayer,
          playerName: player.name,
          type: eventType,
          minute: parseInt(minute)
        };
        setEvents(prev => [...prev, newEvent]);
        setSelectedPlayer("");
        setMinute("");
      }
    }
  };

  const removeEvent = (index: number) => {
    setEvents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && opponent) {
      onAddGame({
        date,
        opponent,
        homeGoals,
        awayGoals,
        isHome,
        events
      });
      
      // Reset form
      setDate("");
      setOpponent("");
      setHomeGoals(0);
      setAwayGoals(0);
      setIsHome(true);
      setEvents([]);
      setSelectedPlayer("");
      setMinute("");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            
            <Input
              placeholder="Adversário"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <Select value={isHome ? "home" : "away"} onValueChange={(value) => setIsHome(value === "home")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Casa</SelectItem>
                  <SelectItem value="away">Fora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input
                type="number"
                min="0"
                value={homeGoals}
                onChange={(e) => setHomeGoals(parseInt(e.target.value) || 0)}
                className="text-center"
              />
              <span className="text-center font-bold">X</span>
              <Input
                type="number"
                min="0"
                value={awayGoals}
                onChange={(e) => setAwayGoals(parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {isHome ? "Nós" : opponent} vs {isHome ? opponent : "Nós"}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Eventos do Jogo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
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
              
              <Input
                type="number"
                min="1"
                max="120"
                placeholder="Minuto"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              />
              
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
                      <Badge variant={event.type === 'goal' ? 'default' : 'secondary'}>
                        {event.type === 'goal' ? 'Gol' : 'Assistência'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event.minute}'</span>
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