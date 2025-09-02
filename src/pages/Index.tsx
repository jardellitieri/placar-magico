import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFootballData } from "@/hooks/useFootballData";
import { useAuth } from "@/hooks/useAuth";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayerCard } from "@/components/PlayerCard";
import { GameForm } from "@/components/GameForm";
import { StatsTable } from "@/components/StatsTable";
import { GamesList } from "@/components/GamesList";
import { EditGameDialog } from "@/components/EditGameDialog";
import { AuthForm } from "@/components/AuthForm";
import { TeamDraft } from "@/components/TeamDraft";
import { Game } from "@/types/football";
import { Users, Calendar, Trophy, Activity, Shield, Download, Shuffle, LogOut, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportStatsToExcel } from "@/utils/excelExport";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    players,
    games,
    draftedTeams,
    loading,
    addPlayer,
    removePlayer,
    updatePlayer,
    addGame,
    updateGame,
    getPlayerStats,
    saveDraftedTeams,
    clearDraftedTeams,
    resetAllData
  } = useFootballData();
  const { toast } = useToast();
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  const handleAddPlayer = async (playerData: { name: string; position: string; level: 1 | 2 }) => {
    try {
      await addPlayer(playerData);
      toast({
        title: "Jogador adicionado!",
        description: `${playerData.name} foi adicionado ao elenco.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar jogador",
        description: "Ocorreu um erro ao adicionar o jogador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    try {
      await removePlayer(playerId);
      toast({
        title: "Jogador removido",
        description: `${player?.name} foi removido do elenco.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover jogador",
        description: "Ocorreu um erro ao remover o jogador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddGame = async (gameData: any) => {
    try {
      await addGame(gameData);
      toast({
        title: "Jogo registrado!",
        description: `Partida ${gameData.homeTeam} vs ${gameData.awayTeam} foi registrada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar jogo",
        description: "Ocorreu um erro ao registrar o jogo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGame = async (gameId: string, gameData: any) => {
    try {
      await updateGame(gameId, gameData);
      toast({
        title: "Jogo atualizado!",
        description: `Partida ${gameData.homeTeam} vs ${gameData.awayTeam} foi atualizada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar jogo",
        description: "Ocorreu um erro ao atualizar o jogo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    exportStatsToExcel(playerStats, games, players, draftedTeams);
    toast({
      title: "Excel exportado!",
      description: "As estatísticas foram exportadas com sucesso.",
    });
  };

  const handleResetAllData = async () => {
    try {
      await resetAllData();
      toast({
        title: "Dados zerados!",
        description: "Todas as estatísticas e históricos foram zerados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao zerar dados",
        description: "Ocorreu um erro ao zerar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const playerStats = getPlayerStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-light to-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-field">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-light to-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-field mb-2">⚽ Controle - PPFC</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie jogadores, registre jogos e acompanhe estatísticas
            </p>
          </div>
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{draftedTeams.length}</p>
              <p className="text-sm text-muted-foreground">Times Sorteados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{players.length}</p>
              <p className="text-sm text-muted-foreground">Jogadores</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{games.length}</p>
              <p className="text-sm text-muted-foreground">Jogos</p>
            </CardContent>
          </Card>
          
           <Card>
             <CardContent className="p-4 text-center">
               <Trophy className="h-8 w-8 mx-auto mb-2 text-goal" />
                <p className="text-2xl font-bold">
                  {games.reduce((total, game) => total + game.homeGoals + game.awayGoals, 0)}
                </p>
               <p className="text-sm text-muted-foreground">Gols Total</p>
             </CardContent>
           </Card>
          
        </div>

        {/* Main Content */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jogadores
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Sorteio
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>


          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AddPlayerForm onAddPlayer={handleAddPlayer} />
              </div>
              
               <div className="lg:col-span-2">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Carregando jogadores...</p>
                    </CardContent>
                  </Card>
                ) : players?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum jogador cadastrado</h3>
                      <p className="text-muted-foreground">
                        Comece adicionando jogadores ao seu elenco
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <PlayerCard 
                    players={players || []} 
                    onRemovePlayer={handleRemovePlayer}
                    onUpdatePlayer={updatePlayer}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-6">
            {players.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Cadastre jogadores primeiro</h3>
                  <p className="text-muted-foreground">
                    Você precisa ter jogadores cadastrados para sortear times
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TeamDraft 
                players={players} 
                draftedTeams={draftedTeams}
                onSaveDraftedTeams={saveDraftedTeams}
                onClearDraftedTeams={clearDraftedTeams}
              />
            )}
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            {draftedTeams.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Sorteie times primeiro</h3>
                  <p className="text-muted-foreground">
                    Você precisa sortear times antes de registrar jogos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <GameForm players={players} draftedTeams={draftedTeams} onAddGame={handleAddGame} />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="flex justify-end gap-2 mb-4">
              <Button 
                onClick={handleResetAllData} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Zerar Estatísticas
              </Button>
              <Button onClick={handleExportToExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar para Excel
              </Button>
            </div>
            <StatsTable playerStats={playerStats} draftedTeams={draftedTeams} players={players} games={games} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <GamesList games={games} onEditGame={setEditingGame} />
          </TabsContent>
        </Tabs>

        {/* Edit Game Dialog */}
        <EditGameDialog
          game={editingGame}
          players={players}
          draftedTeams={draftedTeams}
          onUpdateGame={handleUpdateGame}
          onClose={() => setEditingGame(null)}
        />
      </div>
    </div>
  );
};

export default Index;