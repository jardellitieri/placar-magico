import { Users, Calendar, Shuffle, Trophy, Plus, Download, RotateCcw, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamDraft } from "@/components/TeamDraft";
import { GameForm } from "@/components/GameForm";
import { GamesList } from "@/components/GamesList";
import { StatsTable } from "@/components/StatsTable";
import { useFootballData } from "@/hooks/useFootballData";
import { exportStatsToExcel } from "@/utils/excelExport";
import { GoalkeeperRanking } from "@/components/GoalkeeperRanking";
import { EditGameDialog } from "@/components/EditGameDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Game } from "@/types/football";

const Index = () => {
  const { 
    players, 
    games, 
    draftedTeams, 
    loading: dataLoading,
    addPlayer,
    removePlayer,
    updatePlayer,
    addGame,
    updateGame,
    getGoalkeeperStats,
    getPlayerStats,
    saveDraftedTeams,
    clearDraftedTeams,
    resetAllData
  } = useFootballData();
  const { toast } = useToast();
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const { user, signOut, loading: authLoading } = useAuth();

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  const handleAddPlayer = async (playerData: { name: string; position: string; level: 1 | 2; goalsConceded?: number }) => {
    try {
      await addPlayer({ ...playerData, goalsConceded: 0 });
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
    try {
      await removePlayer(playerId);
      toast({
        title: "Jogador removido!",
        description: "O jogador foi removido do elenco.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover jogador",
        description: "Ocorreu um erro ao remover o jogador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddGame = async (gameData: {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
    events: any[];
  }) => {
    try {
      await addGame(gameData);
      toast({
        title: "Jogo registrado!",
        description: "O jogo foi registrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar jogo",
        description: "Ocorreu um erro ao registrar o jogo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGame = async (gameId: string, updatedGame: any) => {
    try {
      await updateGame(gameId, updatedGame);
      toast({
        title: "Jogo atualizado!",
        description: "O jogo foi atualizado com sucesso.",
      });
      setEditingGame(null);
    } catch (error) {
      toast({
        title: "Erro ao atualizar jogo",
        description: "Ocorreu um erro ao atualizar o jogo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const playerStats = getPlayerStats();

  const handleClearTeams = async () => {
    try {
      await clearDraftedTeams();
      toast({
        title: "Times limpos!",
        description: "Todos os times sorteados foram removidos.",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar times",
        description: "Ocorreu um erro ao limpar os times. Tente novamente.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
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
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{players.length}</p>
              <p className="text-sm text-muted-foreground">Jogadores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{games.length}</p>
              <p className="text-sm text-muted-foreground">Jogos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">
                {playerStats.length > 0 ? playerStats[0]?.totalPoints || 0 : 0}
              </p>
              <p className="text-sm text-muted-foreground">Maior Pontuação</p>
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
            <TabsTrigger value="goalkeepers" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Goleiros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-6">
            <AddPlayerForm onAddPlayer={handleAddPlayer} />
            
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando jogadores...</p>
              </div>
            ) : (
              <PlayerCard
                players={players}
                onRemovePlayer={handleRemovePlayer}
                onUpdatePlayer={updatePlayer}
              />
            )}
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sorteio de Times</h2>
              <Button variant="outline" onClick={handleClearTeams}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar Times
              </Button>
            </div>
            <TeamDraft 
              players={players} 
              draftedTeams={draftedTeams}
              onSaveDraftedTeams={saveDraftedTeams}
              onClearDraftedTeams={handleClearTeams}
            />
          </TabsContent>
          
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GameForm 
                players={players} 
                draftedTeams={draftedTeams} 
                onAddGame={handleAddGame}
              />
              <GamesList 
                games={games} 
                onEditGame={setEditingGame}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Estatísticas dos Jogadores</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button variant="destructive" onClick={handleResetAllData}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Zerar Dados
                </Button>
              </div>
            </div>
            <StatsTable 
              playerStats={getPlayerStats()}
              draftedTeams={draftedTeams}
              players={players}
              games={games}
            />
          </TabsContent>
          
          <TabsContent value="goalkeepers" className="space-y-6">
            <GoalkeeperRanking goalkeepers={getGoalkeeperStats()} />
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