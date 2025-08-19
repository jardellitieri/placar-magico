import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/football";
import { DraftedTeam } from "@/hooks/useFootballData";
import { Shuffle, Users, Trophy, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

interface TeamDraftProps {
  players: Player[];
  draftedTeams: DraftedTeam[];
  onSaveDraftedTeams: (teams: DraftedTeam[]) => Promise<void>;
  onClearDraftedTeams: () => Promise<void>;
}

const POSITIONS_MAP = {
  "Goleiro": "goalkeeper",
  "Zagueiro": "defender",
  "Lateral Direito": "defender", 
  "Lateral Esquerdo": "defender",
  "Volante": "midfielder",
  "Meio-campo": "midfielder",
  "Meia-atacante": "attacking_midfielder",
  "Ponta Direita": "attacking_midfielder",
  "Ponta Esquerda": "attacking_midfielder",
  "Centroavante": "pivot",
  "Pivo": "pivot"
};

// Formação: 1 Goleiro, 2 Zagueiros, 1 Meio-campo, 2 Meia-atacantes, 1 Pivô = 7 jogadores
const TEAM_FORMATION = {
  goalkeeper: 1,
  defender: 2,
  midfielder: 1,
  attacking_midfielder: 2,
  pivot: 1
};

export const TeamDraft = ({ players, draftedTeams, onSaveDraftedTeams, onClearDraftedTeams }: TeamDraftProps) => {
  const [swapMode, setSwapMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<{ player: Player; teamIndex: number; position: string }[]>([]);

  const getPlayersByPosition = (position: string) => {
    return players.filter(player => 
      player.availableForDraft &&
      POSITIONS_MAP[player.position as keyof typeof POSITIONS_MAP] === position
    );
  };

  const balanceTeamsByLevel = (playersInPosition: Player[], teamsCount: number, playersPerPosition: number) => {
    const level1Players = shuffleArray(playersInPosition.filter(p => p.level === 1));
    const level2Players = shuffleArray(playersInPosition.filter(p => p.level === 2));
    
    const teams: Player[][] = Array.from({ length: teamsCount }, () => []);
    
    // Distribuir jogadores por posição, priorizando equilíbrio entre níveis
    const totalPlayersNeeded = teamsCount * playersPerPosition;
    const targetLevel1PerTeam = Math.floor(level1Players.length / teamsCount);
    const targetLevel2PerTeam = Math.floor(level2Players.length / teamsCount);
    
    // Primeiro, distribuir de forma equilibrada
    for (let teamIndex = 0; teamIndex < teamsCount; teamIndex++) {
      // Adicionar jogadores nível 1 (limitado ao que temos)
      const level1ToAdd = Math.min(targetLevel1PerTeam, playersPerPosition);
      for (let i = 0; i < level1ToAdd && level1Players.length > 0; i++) {
        teams[teamIndex].push(level1Players.shift()!);
      }
      
      // Completar com jogadores nível 2
      const remainingSlots = playersPerPosition - teams[teamIndex].length;
      for (let i = 0; i < remainingSlots && level2Players.length > 0; i++) {
        teams[teamIndex].push(level2Players.shift()!);
      }
    }
    
    // Distribuir jogadores restantes de forma circular
    let teamIndex = 0;
    let attempts = 0;
    const maxAttempts = teamsCount * 2; // Evita loop infinito
    
    while ((level1Players.length > 0 || level2Players.length > 0) && attempts < maxAttempts) {
      let playerAdded = false;
      
      if (teams[teamIndex].length < playersPerPosition) {
        if (level1Players.length > 0) {
          teams[teamIndex].push(level1Players.shift()!);
          playerAdded = true;
        } else if (level2Players.length > 0) {
          teams[teamIndex].push(level2Players.shift()!);
          playerAdded = true;
        }
      }
      
      teamIndex = (teamIndex + 1) % teamsCount;
      
      // Se completamos uma volta sem adicionar jogadores, pare para evitar loop infinito
      if (!playerAdded) {
        attempts++;
      } else {
        attempts = 0; // Reset attempts when we successfully add a player
      }
    }
    
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
    const attackingMidfielders = getPlayersByPosition("attacking_midfielder");
    const pivots = getPlayersByPosition("pivot");

    // Verificar se há jogadores suficientes para formar pelo menos 1 time
    if (goalkeepers.length < TEAM_FORMATION.goalkeeper ||
        defenders.length < TEAM_FORMATION.defender ||
        midfielders.length < TEAM_FORMATION.midfielder ||
        attackingMidfielders.length < TEAM_FORMATION.attacking_midfielder ||
        pivots.length < TEAM_FORMATION.pivot) {
      toast.error("Jogadores insuficientes! Necessário pelo menos: 1 goleiro, 2 zagueiros, 1 meio-campo, 2 meia-atacantes e 1 pivô para formar um time.");
      return;
    }

    // Calcular quantos times podem ser formados (7 jogadores por time)
    const maxTeams = Math.min(
      Math.floor(goalkeepers.length / TEAM_FORMATION.goalkeeper),
      Math.floor(defenders.length / TEAM_FORMATION.defender),
      Math.floor(midfielders.length / TEAM_FORMATION.midfielder),
      Math.floor(attackingMidfielders.length / TEAM_FORMATION.attacking_midfielder),
      Math.floor(pivots.length / TEAM_FORMATION.pivot)
    );

    if (maxTeams === 0) {
      toast.error("Não é possível formar nenhum time com os jogadores disponíveis.");
      return;
    }

    // Distribuir jogadores equilibradamente por nível e posição
    const teamGoalkeepers = balanceTeamsByLevel(goalkeepers, maxTeams, TEAM_FORMATION.goalkeeper);
    const teamDefenders = balanceTeamsByLevel(defenders, maxTeams, TEAM_FORMATION.defender);
    const teamMidfielders = balanceTeamsByLevel(midfielders, maxTeams, TEAM_FORMATION.midfielder);
    const teamAttackingMidfielders = balanceTeamsByLevel(attackingMidfielders, maxTeams, TEAM_FORMATION.attacking_midfielder);
    const teamPivots = balanceTeamsByLevel(pivots, maxTeams, TEAM_FORMATION.pivot);

    // Criar times
    const teams: DraftedTeam[] = [];
    for (let i = 0; i < maxTeams; i++) {
      const teamPlayers = [
        ...teamGoalkeepers[i],
        ...teamDefenders[i],
        ...teamMidfielders[i],
        ...teamAttackingMidfielders[i],
        ...teamPivots[i]
      ];

      const level1Count = teamPlayers.filter(p => p.level === 1).length;
      const level2Count = teamPlayers.filter(p => p.level === 2).length;

      teams.push({
        name: `Time ${String.fromCharCode(65 + i)}`,
        players: teamPlayers,
        goalkeepers: teamGoalkeepers[i],
        defenders: teamDefenders[i],
        midfielders: teamMidfielders[i],
        forwards: [...teamAttackingMidfielders[i], ...teamPivots[i]], // Salvar tudo em forwards para compatibilidade
        attackingMidfielders: teamAttackingMidfielders[i],
        pivots: teamPivots[i],
        level1Count,
        level2Count
      });
    }

    onSaveDraftedTeams(teams).then(() => {
      toast.success(`${maxTeams} times sorteados com sucesso! (7 jogadores por time)`);
    }).catch(() => {
      toast.error("Erro ao salvar times sorteados.");
    });
  };

  const clearTeams = () => {
    onClearDraftedTeams().then(() => {
      toast.success("Times limpos!");
    }).catch(() => {
      toast.error("Erro ao limpar times.");
    });
  };

  const getPlayerCountsByPosition = () => {
    return {
      goalkeepers: getPlayersByPosition("goalkeeper").length,
      defenders: getPlayersByPosition("defender").length,
      midfielders: getPlayersByPosition("midfielder").length,
      attackingMidfielders: getPlayersByPosition("attacking_midfielder").length,
      pivots: getPlayersByPosition("pivot").length
    };
  };

  const handlePlayerSelect = (player: Player, teamIndex: number, position: string) => {
    if (!swapMode) return;

    const playerSelection = { player, teamIndex, position };
    
    if (selectedPlayers.length === 0) {
      setSelectedPlayers([playerSelection]);
    } else if (selectedPlayers.length === 1) {
      const firstSelection = selectedPlayers[0];
      
      // Verificar se é o mesmo jogador
      if (firstSelection.player.id === player.id) {
        setSelectedPlayers([]); // Desselecionar
        return;
      }
      
      // Verificar se são da mesma posição
      if (firstSelection.position !== position) {
        toast.error("Só é possível trocar jogadores da mesma posição!");
        return;
      }
      
      // Realizar a troca
      performSwap(firstSelection, playerSelection);
      setSelectedPlayers([]);
    }
  };

  const performSwap = (player1: { player: Player; teamIndex: number; position: string }, player2: { player: Player; teamIndex: number; position: string }) => {
    const updatedTeams = [...draftedTeams];
    
    // Remover jogadores de suas equipes originais
    const removePlayerFromTeam = (teamIndex: number, playerId: string, position: string) => {
      const team = updatedTeams[teamIndex];
      switch (position) {
        case 'goalkeeper':
          team.goalkeepers = team.goalkeepers.filter(p => p.id !== playerId);
          break;
        case 'defender':
          team.defenders = team.defenders.filter(p => p.id !== playerId);
          break;
        case 'midfielder':
          team.midfielders = team.midfielders.filter(p => p.id !== playerId);
          break;
        case 'attacking_midfielder':
          (team as any).attackingMidfielders = (team as any).attackingMidfielders.filter((p: Player) => p.id !== playerId);
          break;
        case 'pivot':
          (team as any).pivots = (team as any).pivots.filter((p: Player) => p.id !== playerId);
          break;
      }
      team.players = team.players.filter(p => p.id !== playerId);
    };
    
    // Adicionar jogador ao novo time
    const addPlayerToTeam = (teamIndex: number, player: Player, position: string) => {
      const team = updatedTeams[teamIndex];
      switch (position) {
        case 'goalkeeper':
          team.goalkeepers.push(player);
          break;
        case 'defender':
          team.defenders.push(player);
          break;
        case 'midfielder':
          team.midfielders.push(player);
          break;
        case 'attacking_midfielder':
          if (!(team as any).attackingMidfielders) (team as any).attackingMidfielders = [];
          (team as any).attackingMidfielders.push(player);
          break;
        case 'pivot':
          if (!(team as any).pivots) (team as any).pivots = [];
          (team as any).pivots.push(player);
          break;
      }
      team.players.push(player);
      
      // Atualizar forwards para compatibilidade
      if (position === 'attacking_midfielder' || position === 'pivot') {
        team.forwards = [...((team as any).attackingMidfielders || []), ...((team as any).pivots || [])];
      }
      
      // Recalcular contadores de nível
      team.level1Count = team.players.filter(p => p.level === 1).length;
      team.level2Count = team.players.filter(p => p.level === 2).length;
    };
    
    // Realizar as trocas
    removePlayerFromTeam(player1.teamIndex, player1.player.id, player1.position);
    removePlayerFromTeam(player2.teamIndex, player2.player.id, player2.position);
    
    addPlayerToTeam(player2.teamIndex, player1.player, player1.position);
    addPlayerToTeam(player1.teamIndex, player2.player, player2.position);
    
    // Salvar as alterações
    onSaveDraftedTeams(updatedTeams).then(() => {
      toast.success(`${player1.player.name} e ${player2.player.name} foram trocados!`);
    }).catch(() => {
      toast.error("Erro ao salvar a troca de jogadores.");
    });
  };

  const isPlayerSelected = (playerId: string) => {
    return selectedPlayers.some(selection => selection.player.id === playerId);
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
              <p className="text-2xl font-bold">{counts.attackingMidfielders}</p>
              <p className="text-sm text-muted-foreground">Meia-atacantes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.pivots}</p>
              <p className="text-sm text-muted-foreground">Pivôs</p>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <Badge variant="outline" className="text-sm">
              Formação: 1 Goleiro + 2 Zagueiros + 1 Meio-campo + 2 Meia-atacantes + 1 Pivô = 7 jogadores
            </Badge>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={generateTeams} className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Sortear Times
            </Button>
            {draftedTeams.length > 0 && (
              <>
                <Button 
                  variant={swapMode ? "default" : "outline"} 
                  onClick={() => {
                    setSwapMode(!swapMode);
                    setSelectedPlayers([]);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {swapMode ? "Sair do Modo Troca" : "Trocar Jogadores"}
                </Button>
                <Button variant="outline" onClick={clearTeams}>
                  Limpar Times
                </Button>
              </>
            )}
          </div>
          
          {swapMode && (
            <div className="text-center mt-4">
              <Badge variant="secondary" className="text-sm">
                Modo troca ativo - Clique em dois jogadores da mesma posição para trocá-los
              </Badge>
              {selectedPlayers.length === 1 && (
                <div className="mt-2">
                  <Badge variant="default" className="text-sm">
                    {selectedPlayers[0].player.name} selecionado - Escolha outro jogador da posição {selectedPlayers[0].position === 'goalkeeper' ? 'Goleiro' : 
                    selectedPlayers[0].position === 'defender' ? 'Zagueiro' :
                    selectedPlayers[0].position === 'midfielder' ? 'Meio-campo' :
                    selectedPlayers[0].position === 'attacking_midfielder' ? 'Meia-atacante' : 'Pivô'}
                  </Badge>
                </div>
              )}
            </div>
          )}
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
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Goleiros */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">GOLEIRO</h4>
                    {team.goalkeepers.map(player => (
                      <div 
                        key={player.id} 
                        className={`p-2 rounded transition-colors ${
                          swapMode 
                            ? `cursor-pointer hover:bg-primary/20 ${
                                isPlayerSelected(player.id) 
                                  ? 'bg-primary/30 border-2 border-primary' 
                                  : 'bg-secondary/50'
                              }` 
                            : 'bg-secondary/50'
                        }`}
                        onClick={() => handlePlayerSelect(player, index, 'goalkeeper')}
                      >
                        <span className="text-sm">{player.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Zagueiros */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">ZAGUEIROS</h4>
                    <div className="space-y-1">
                      {team.defenders.map(player => (
                        <div 
                          key={player.id} 
                          className={`p-2 rounded transition-colors ${
                            swapMode 
                              ? `cursor-pointer hover:bg-primary/20 ${
                                  isPlayerSelected(player.id) 
                                    ? 'bg-primary/30 border-2 border-primary' 
                                    : 'bg-secondary/50'
                                }` 
                              : 'bg-secondary/50'
                          }`}
                          onClick={() => handlePlayerSelect(player, index, 'defender')}
                        >
                          <span className="text-sm">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meio-campo */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">MEIO-CAMPO</h4>
                    <div className="space-y-1">
                      {team.midfielders.map(player => (
                        <div 
                          key={player.id} 
                          className={`p-2 rounded transition-colors ${
                            swapMode 
                              ? `cursor-pointer hover:bg-primary/20 ${
                                  isPlayerSelected(player.id) 
                                    ? 'bg-primary/30 border-2 border-primary' 
                                    : 'bg-secondary/50'
                                }` 
                              : 'bg-secondary/50'
                          }`}
                          onClick={() => handlePlayerSelect(player, index, 'midfielder')}
                        >
                          <span className="text-sm">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meia-atacantes */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">MEIA-ATACANTES</h4>
                    <div className="space-y-1">
                      {(team as any).attackingMidfielders?.map((player: Player) => (
                        <div 
                          key={player.id} 
                          className={`p-2 rounded transition-colors ${
                            swapMode 
                              ? `cursor-pointer hover:bg-primary/20 ${
                                  isPlayerSelected(player.id) 
                                    ? 'bg-primary/30 border-2 border-primary' 
                                    : 'bg-secondary/50'
                                }` 
                              : 'bg-secondary/50'
                          }`}
                          onClick={() => handlePlayerSelect(player, index, 'attacking_midfielder')}
                        >
                          <span className="text-sm">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pivô */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground">PIVÔ</h4>
                    <div className="space-y-1">
                      {(team as any).pivots?.map((player: Player) => (
                        <div 
                          key={player.id} 
                          className={`p-2 rounded transition-colors ${
                            swapMode 
                              ? `cursor-pointer hover:bg-primary/20 ${
                                  isPlayerSelected(player.id) 
                                    ? 'bg-primary/30 border-2 border-primary' 
                                    : 'bg-secondary/50'
                                }` 
                              : 'bg-secondary/50'
                          }`}
                          onClick={() => handlePlayerSelect(player, index, 'pivot')}
                        >
                          <span className="text-sm">{player.name}</span>
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