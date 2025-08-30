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
    
    // Calcular distribuição ideal por time
    const totalLevel1 = level1Players.length;
    const totalLevel2 = level2Players.length;
    const totalPlayersNeeded = teamsCount * playersPerPosition;
    
    // Se não temos jogadores suficientes, usar o que temos
    const availablePlayers = Math.min(totalLevel1 + totalLevel2, totalPlayersNeeded);
    
    // Distribuir de forma mais equilibrada possível
    // Priorizar que cada time tenha pelo menos um de cada nível quando possível
    let level1Index = 0;
    let level2Index = 0;
    
    for (let teamIndex = 0; teamIndex < teamsCount; teamIndex++) {
      const currentTeamPlayers: Player[] = [];
      
      // Para cada slot neste time
      for (let slot = 0; slot < playersPerPosition; slot++) {
        // Calcular quantos jogadores de cada nível já foram distribuídos neste time
        const currentLevel1InTeam = currentTeamPlayers.filter(p => p.level === 1).length;
        const currentLevel2InTeam = currentTeamPlayers.filter(p => p.level === 2).length;
        
        // Calcular quantos ainda precisamos distribuir globalmente
        const remainingLevel1 = totalLevel1 - level1Index;
        const remainingLevel2 = totalLevel2 - level2Index;
        const remainingSlots = (teamsCount - teamIndex) * playersPerPosition - currentTeamPlayers.length;
        
        // Decidir qual nível priorizar para manter equilíbrio
        let preferLevel1 = false;
        
        if (remainingLevel1 > 0 && remainingLevel2 > 0) {
          // Se ambos estão disponíveis, priorizar o que está menos representado neste time
          if (currentLevel1InTeam < currentLevel2InTeam) {
            preferLevel1 = true;
          } else if (currentLevel1InTeam > currentLevel2InTeam) {
            preferLevel1 = false;
          } else {
            // Se estão iguais, priorizar baseado na distribuição global restante
            preferLevel1 = remainingLevel1 >= remainingLevel2;
          }
        } else {
          // Se só um está disponível, usar esse
          preferLevel1 = remainingLevel1 > 0;
        }
        
        // Adicionar jogador baseado na preferência
        if (preferLevel1 && level1Index < totalLevel1) {
          currentTeamPlayers.push(level1Players[level1Index]);
          level1Index++;
        } else if (level2Index < totalLevel2) {
          currentTeamPlayers.push(level2Players[level2Index]);
          level2Index++;
        } else if (level1Index < totalLevel1) {
          currentTeamPlayers.push(level1Players[level1Index]);
          level1Index++;
        }
      }
      
      teams[teamIndex] = currentTeamPlayers;
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
    const goalkeepers = getPlayersByPosition("goalkeeper");
    const defenders = getPlayersByPosition("defender");
    const midfielders = getPlayersByPosition("midfielder");
    const attackingMidfielders = getPlayersByPosition("attacking_midfielder");
    const pivots = getPlayersByPosition("pivot");

    return {
      goalkeepers: {
        total: goalkeepers.length,
        level1: goalkeepers.filter(p => p.level === 1).length,
        level2: goalkeepers.filter(p => p.level === 2).length
      },
      defenders: {
        total: defenders.length,
        level1: defenders.filter(p => p.level === 1).length,
        level2: defenders.filter(p => p.level === 2).length
      },
      midfielders: {
        total: midfielders.length,
        level1: midfielders.filter(p => p.level === 1).length,
        level2: midfielders.filter(p => p.level === 2).length
      },
      attackingMidfielders: {
        total: attackingMidfielders.length,
        level1: attackingMidfielders.filter(p => p.level === 1).length,
        level2: attackingMidfielders.filter(p => p.level === 2).length
      },
      pivots: {
        total: pivots.length,
        level1: pivots.filter(p => p.level === 1).length,
        level2: pivots.filter(p => p.level === 2).length
      }
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

  const handleReservePlayerSelect = (player: Player, position: string) => {
    if (!swapMode) return;

    const playerSelection = { player, teamIndex: -1, position }; // -1 indica reserva
    
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
      
      // Só permitir troca se um for da reserva e outro de time
      if (firstSelection.teamIndex === -1 && playerSelection.teamIndex === -1) {
        toast.error("Não é possível trocar dois jogadores da reserva!");
        return;
      }
      
      // Realizar a troca
      performSwap(firstSelection, playerSelection);
      setSelectedPlayers([]);
    }
  };

  const performSwap = (player1: { player: Player; teamIndex: number; position: string }, player2: { player: Player; teamIndex: number; position: string }) => {
    const updatedTeams = [...draftedTeams];
    
    // Remover jogadores de suas equipes originais (apenas se não for reserva)
    const removePlayerFromTeam = (teamIndex: number, playerId: string, position: string) => {
      if (teamIndex === -1) return; // É da reserva, não precisa remover
      
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
          team.attackingMidfielders = team.attackingMidfielders?.filter(p => p.id !== playerId) || [];
          break;
        case 'pivot':
          team.pivots = team.pivots?.filter(p => p.id !== playerId) || [];
          break;
      }
      team.players = team.players.filter(p => p.id !== playerId);
    };
    
    // Adicionar jogador ao novo time (apenas se não for reserva)
    const addPlayerToTeam = (teamIndex: number, player: Player, position: string) => {
      if (teamIndex === -1) return; // É para reserva, não precisa adicionar
      
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
          if (!team.attackingMidfielders) team.attackingMidfielders = [];
          team.attackingMidfielders.push(player);
          break;
        case 'pivot':
          if (!team.pivots) team.pivots = [];
          team.pivots.push(player);
          break;
      }
      team.players.push(player);
      
      // Atualizar forwards para compatibilidade
      if (position === 'attacking_midfielder' || position === 'pivot') {
        team.forwards = [...(team.attackingMidfielders || []), ...(team.pivots || [])];
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
      const player1Name = player1.player.name;
      const player2Name = player2.player.name;
      
      if (player1.teamIndex === -1) {
        toast.success(`${player1Name} entrou no time!`);
      } else if (player2.teamIndex === -1) {
        toast.success(`${player2Name} entrou no time!`);
      } else {
        toast.success(`${player1Name} e ${player2Name} foram trocados!`);
      }
    }).catch(() => {
      toast.error("Erro ao salvar a troca de jogadores.");
    });
  };

  const getReservePlayers = () => {
    if (draftedTeams.length === 0) return { goalkeepers: [], defenders: [], midfielders: [], attackingMidfielders: [], pivots: [] };
    
    const draftedPlayerIds = new Set(draftedTeams.flatMap(team => team.players.map(p => p.id)));
    
    return {
      goalkeepers: getPlayersByPosition("goalkeeper").filter(p => !draftedPlayerIds.has(p.id)),
      defenders: getPlayersByPosition("defender").filter(p => !draftedPlayerIds.has(p.id)),
      midfielders: getPlayersByPosition("midfielder").filter(p => !draftedPlayerIds.has(p.id)),
      attackingMidfielders: getPlayersByPosition("attacking_midfielder").filter(p => !draftedPlayerIds.has(p.id)),
      pivots: getPlayersByPosition("pivot").filter(p => !draftedPlayerIds.has(p.id))
    };
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{counts.goalkeepers.total}</p>
              <p className="text-sm font-medium mb-1">Goleiros</p>
              <div className="flex justify-center gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Nível 1: {counts.goalkeepers.level1}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nível 2: {counts.goalkeepers.level2}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-left">
                  <p className="font-medium text-foreground mb-1">Nível 1:</p>
                  {getPlayersByPosition("goalkeeper").filter(p => p.level === 1).map(player => (
                    <p key={player.id} className="text-xs text-foreground">{player.name}</p>
                  ))}
                </div>
                <div className="text-xs text-left">
                  <p className="font-medium text-primary mb-1">Nível 2:</p>
                  {getPlayersByPosition("goalkeeper").filter(p => p.level === 2).map(player => (
                    <p key={player.id} className="text-xs text-primary">{player.name}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{counts.defenders.total}</p>
              <p className="text-sm font-medium mb-1">Zagueiros</p>
              <div className="flex justify-center gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Nível 1: {counts.defenders.level1}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nível 2: {counts.defenders.level2}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-left">
                  <p className="font-medium text-foreground mb-1">Nível 1:</p>
                  {getPlayersByPosition("defender").filter(p => p.level === 1).map(player => (
                    <p key={player.id} className="text-xs text-foreground">{player.name}</p>
                  ))}
                </div>
                <div className="text-xs text-left">
                  <p className="font-medium text-primary mb-1">Nível 2:</p>
                  {getPlayersByPosition("defender").filter(p => p.level === 2).map(player => (
                    <p key={player.id} className="text-xs text-primary">{player.name}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{counts.midfielders.total}</p>
              <p className="text-sm font-medium mb-1">Meio-campo</p>
              <div className="flex justify-center gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Nível 1: {counts.midfielders.level1}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nível 2: {counts.midfielders.level2}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-left">
                  <p className="font-medium text-foreground mb-1">Nível 1:</p>
                  {getPlayersByPosition("midfielder").filter(p => p.level === 1).map(player => (
                    <p key={player.id} className="text-xs text-foreground">{player.name}</p>
                  ))}
                </div>
                <div className="text-xs text-left">
                  <p className="font-medium text-primary mb-1">Nível 2:</p>
                  {getPlayersByPosition("midfielder").filter(p => p.level === 2).map(player => (
                    <p key={player.id} className="text-xs text-primary">{player.name}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{counts.attackingMidfielders.total}</p>
              <p className="text-sm font-medium mb-1">Meia-atacantes</p>
              <div className="flex justify-center gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Nível 1: {counts.attackingMidfielders.level1}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nível 2: {counts.attackingMidfielders.level2}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-left">
                  <p className="font-medium text-foreground mb-1">Nível 1:</p>
                  {getPlayersByPosition("attacking_midfielder").filter(p => p.level === 1).map(player => (
                    <p key={player.id} className="text-xs text-foreground">{player.name}</p>
                  ))}
                </div>
                <div className="text-xs text-left">
                  <p className="font-medium text-primary mb-1">Nível 2:</p>
                  {getPlayersByPosition("attacking_midfielder").filter(p => p.level === 2).map(player => (
                    <p key={player.id} className="text-xs text-primary">{player.name}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{counts.pivots.total}</p>
              <p className="text-sm font-medium mb-1">Pivôs</p>
              <div className="flex justify-center gap-2 text-xs mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Nível 1: {counts.pivots.level1}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nível 2: {counts.pivots.level2}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-left">
                  <p className="font-medium text-foreground mb-1">Nível 1:</p>
                  {getPlayersByPosition("pivot").filter(p => p.level === 1).map(player => (
                    <p key={player.id} className="text-xs text-foreground">{player.name}</p>
                  ))}
                </div>
                <div className="text-xs text-left">
                  <p className="font-medium text-primary mb-1">Nível 2:</p>
                  {getPlayersByPosition("pivot").filter(p => p.level === 2).map(player => (
                    <p key={player.id} className="text-xs text-primary">{player.name}</p>
                  ))}
                </div>
              </div>
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
        <div className="space-y-6">
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
                        {team.attackingMidfielders?.map((player: Player) => (
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
                        {team.pivots?.map((player: Player) => (
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

          {/* Lista de Reservas */}
          {(() => {
            const reservePlayers = getReservePlayers();
            const hasReserves = Object.values(reservePlayers).some(positionPlayers => positionPlayers.length > 0);
            
            if (!hasReserves) return null;
            
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Jogadores Reservas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Goleiros Reservas */}
                    {reservePlayers.goalkeepers.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">GOLEIROS</h4>
                        <div className="space-y-1">
                          {reservePlayers.goalkeepers.map(player => (
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
                              onClick={() => handleReservePlayerSelect(player, 'goalkeeper')}
                            >
                              <span className="text-sm">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Zagueiros Reservas */}
                    {reservePlayers.defenders.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">ZAGUEIROS</h4>
                        <div className="space-y-1">
                          {reservePlayers.defenders.map(player => (
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
                              onClick={() => handleReservePlayerSelect(player, 'defender')}
                            >
                              <span className="text-sm">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meio-campo Reservas */}
                    {reservePlayers.midfielders.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">MEIO-CAMPO</h4>
                        <div className="space-y-1">
                          {reservePlayers.midfielders.map(player => (
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
                              onClick={() => handleReservePlayerSelect(player, 'midfielder')}
                            >
                              <span className="text-sm">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meia-atacantes Reservas */}
                    {reservePlayers.attackingMidfielders.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">MEIA-ATACANTES</h4>
                        <div className="space-y-1">
                          {reservePlayers.attackingMidfielders.map(player => (
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
                              onClick={() => handleReservePlayerSelect(player, 'attacking_midfielder')}
                            >
                              <span className="text-sm">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pivôs Reservas */}
                    {reservePlayers.pivots.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">PIVÔS</h4>
                        <div className="space-y-1">
                          {reservePlayers.pivots.map(player => (
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
                              onClick={() => handleReservePlayerSelect(player, 'pivot')}
                            >
                              <span className="text-sm">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
};