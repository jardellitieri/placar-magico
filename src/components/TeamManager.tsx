import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Team, Player } from "@/types/football";
import { Users, Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface TeamManagerProps {
  teams: Team[];
  players: Player[];
  onAddTeam: (name: string) => void;
  onRemoveTeam: (teamId: string) => void;
  onAddPlayerToTeam: (playerId: string, teamId: string) => void;
  onRemovePlayerFromTeam: (playerId: string) => void;
}

export const TeamManager = ({
  teams,
  players,
  onAddTeam,
  onRemoveTeam,
  onAddPlayerToTeam,
  onRemovePlayerFromTeam
}: TeamManagerProps) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Nome do time é obrigatório");
      return;
    }
    
    onAddTeam(newTeamName.trim());
    setNewTeamName("");
    toast.success("Time criado com sucesso!");
  };

  const handleAddPlayerToTeam = () => {
    if (!selectedPlayer || !selectedTeam) {
      toast.error("Selecione um jogador e um time");
      return;
    }
    
    onAddPlayerToTeam(selectedPlayer, selectedTeam);
    setSelectedPlayer("");
    toast.success("Jogador adicionado ao time!");
  };

  const getPlayersInTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    
    return team.players
      .map(playerId => players.find(p => p.id === playerId))
      .filter(Boolean) as Player[];
  };

  const unassignedPlayers = players.filter(player => !player.teamId);

  return (
    <div className="space-y-6">
      {/* Criar novo time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do time"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
            />
            <Button onClick={handleAddTeam}>
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adicionar jogador ao time */}
      {unassignedPlayers.length > 0 && teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Jogador ao Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar jogador" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} ({player.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar time" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddPlayerToTeam}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum time criado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => {
                const teamPlayers = getPlayersInTeam(team.id);
                
                return (
                  <div key={team.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {teamPlayers.length} jogador(es)
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          onRemoveTeam(team.id);
                          toast.success("Time removido!");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {teamPlayers.length > 0 ? (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Jogadores:</h5>
                        <div className="flex flex-wrap gap-2">
                          {teamPlayers.map((player) => (
                            <div key={player.id} className="flex items-center gap-1">
                              <Badge variant="secondary" className="pr-1">
                                {player.name} ({player.position})
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => {
                                    onRemovePlayerFromTeam(player.id);
                                    toast.success("Jogador removido do time!");
                                  }}
                                >
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum jogador neste time
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};