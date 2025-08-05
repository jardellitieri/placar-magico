import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/football";
import { Shuffle, Users, Trophy } from "lucide-react";
import { toast } from "sonner";

interface DraftedTeam {
  name: string;
  players: Player[];
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  level1Count: number;
  level2Count: number;
}

interface TeamDraftProps {
  players: Player[];
}

const POSITIONS_MAP = {
  "Goleiro": "goalkeeper",
  "Zagueiro": "defender",
  "Lateral Direito": "defender", 
  "Lateral Esquerdo": "defender",
  "Volante": "midfielder",
  "Meio-campo": "midfielder",
  "Meia-atacante": "midfielder",
  "Ponta Direita": "forward",
  "Ponta Esquerda": "forward",
  "Centroavante": "forward"
};

export const TeamDraft = ({ players }: TeamDraftProps) => {
  const [draftedTeams, setDraftedTeams] = useState<DraftedTeam[]>([]);

  const getPlayersByPosition = (position: string) => {
    return players.filter(player => 
      POSITIONS_MAP[player.position as keyof typeof POSITIONS_MAP] === position
    );
  };

  const balanceTeamsByLevel = (playersInPosition: Player[], teamsCount: number, playersPerTeam: number) => {
    const level1Players = playersInPosition.filter(p => p.level === 1);
    const level2Players = playersInPosition.filter(p => p.level === 2);
    
    const teams: Player[][] = Array.from({ length: teamsCount }, () => []);
    
    // Distribuir jogadores nível 2 primeiro (mais equilibrados)
    level2Players.forEach((player, index) => {
      teams[index % teamsCount].push(player);
    });
    
    // Distribuir jogadores nível 1
    level1Players.forEach((player, index) => {
      teams[index % teamsCount].push(player);
    });
    
    return teams;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateTeams = () => {
    const goalkeepers = getPlayersByPosition("goalkeeper");
    const defenders = getPlayersByPosition("defender");
    const midfielders = getPlayersByPosition("midfielder");
    const forwards = getPlayersByPosition("forward");

    // Verificar se há jogadores suficientes
    const minPlayersNeeded = {
      goalkeepers: 1,
      defenders: 2,
      midfielders: 2,
      forwards: 2
    };

    if (goalkeepers.length < minPlayersNeeded.goalkeepers ||
        defenders.length < minPlayersNeeded.defenders ||
        midfielders.length < minPlayersNeeded.midfielders ||
        forwards.length < minPlayersNeeded.forwards) {
      toast.error("Jogadores insuficientes! Necessário pelo menos 1 goleiro, 2 zagueiros, 2 meio-campistas e 2 atacantes.");
      return;
    }

    // Calcular quantos times podem ser formados
    const maxTeams = Math.min(
      Math.floor(goalkeepers.length / 1),
      Math.floor(defenders.length / 2),
      Math.floor(midfielders.length / 2),
      Math.floor(forwards.length / 2)
    );

    if (maxTeams === 0) {
      toast.error("Não é possível formar nenhum time com os jogadores disponíveis.");
      return;
    }

    // Embaralhar jogadores
    const shuffledGoalkeepers = shuffleArray(goalkeepers);
    const shuffledDefenders = shuffleArray(defenders);
    const shuffledMidfielders = shuffleArray(midfielders);
    const shuffledForwards = shuffleArray(forwards);

    // Distribuir jogadores equilibradamente por nível
    const teamGoalkeepers = balanceTeamsByLevel(shuffledGoalkeepers, maxTeams, 1);
    const teamDefenders = balanceTeamsByLevel(shuffledDefenders, maxTeams, 2);
    const teamMidfielders = balanceTeamsByLevel(shuffledMidfielders, maxTeams, 2);
    const teamForwards = balanceTeamsByLevel(shuffledForwards, maxTeams, 2);

    // Criar times
    const teams: DraftedTeam[] = [];
    for (let i = 0; i < maxTeams; i++) {
      const teamPlayers = [
        ...teamGoalkeepers[i],
        ...teamDefenders[i],
        ...teamMidfielders[i],
        ...teamForwards[i]
      ];

      const level1Count = teamPlayers.filter(p => p.level === 1).length;
      const level2Count = teamPlayers.filter(p => p.level === 2).length;

      teams.push({
        name: `Time ${String.fromCharCode(65 + i)}`,
        players: teamPlayers,
        goalkeepers: teamGoalkeepers[i],
        defenders: teamDefenders[i],
        midfielders: teamMidfielders[i],
        forwards: teamForwards[i],
        level1Count,
        level2Count
      });
    }

    setDraftedTeams(teams);
    toast.success(`${maxTeams} times sorteados com sucesso!`);
  };

  const clearTeams = () => {
    setDraftedTeams([]);
    toast.success("Times limpos!");
  };

  const getPlayerCountsByPosition = () => {
    return {
      goalkeepers: getPlayersByPosition("goalkeeper").length,
      defenders: getPlayersByPosition("defender").length,
      midfielders: getPlayersByPosition("midfielder").length,
      forwards: getPlayersByPosition("forward").length
    };
  };

  const counts = getPlayerCountsByPosition();

  return (
    <div className="space-y-6">
      {/* Status dos jogadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.goalkeepers}</p>
              <p className="text-sm text-muted-foreground">Goleiros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.defenders}</p>
              <p className="text-sm text-muted-foreground">Zagueiros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.midfielders}</p>
              <p className="text-sm text-muted-foreground">Meio-campo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.forwards}</p>
              <p className="text-sm text-muted-foreground">Atacantes</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={generateTeams} className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Sortear Times
            </Button>
            {draftedTeams.length > 0 && (
              <Button variant="outline" onClick={clearTeams}>
                Limpar Times
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Times sorteados */}
      {draftedTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftedTeams.map((team, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-primary/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {team.name}
                  </span>
                  <div className="flex gap-1">
                    <Badge variant="outline">N1: {team.level1Count}</Badge>
                    <Badge variant="default">N2: {team.level2Count}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Goleiros */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">GOLEIRO</h4>
                    {team.goalkeepers.map(player => (
                      <div key={player.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                        <span className="text-sm">{player.name}</span>
                        <Badge variant={player.level === 1 ? "outline" : "default"} className="text-xs">
                          N{player.level}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Zagueiros */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">ZAGUEIROS</h4>
                    <div className="space-y-1">
                      {team.defenders.map(player => (
                        <div key={player.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                          <span className="text-sm">{player.name}</span>
                          <Badge variant={player.level === 1 ? "outline" : "default"} className="text-xs">
                            N{player.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meio-campo */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">MEIO-CAMPO</h4>
                    <div className="space-y-1">
                      {team.midfielders.map(player => (
                        <div key={player.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                          <span className="text-sm">{player.name}</span>
                          <Badge variant={player.level === 1 ? "outline" : "default"} className="text-xs">
                            N{player.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Atacantes */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">ATACANTES</h4>
                    <div className="space-y-1">
                      {team.forwards.map(player => (
                        <div key={player.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                          <span className="text-sm">{player.name}</span>
                          <Badge variant={player.level === 1 ? "outline" : "default"} className="text-xs">
                            N{player.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};