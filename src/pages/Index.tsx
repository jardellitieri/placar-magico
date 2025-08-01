import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFootballData } from "@/hooks/useFootballData";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayerCard } from "@/components/PlayerCard";
import { GameForm } from "@/components/GameForm";
import { StatsTable } from "@/components/StatsTable";
import { GamesList } from "@/components/GamesList";
import { TeamManager } from "@/components/TeamManager";
import { Users, Calendar, Trophy, Activity, Shield, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportStatsToExcel } from "@/utils/excelExport";

const Index = () => {
  const { 
    players, 
    games, 
    teams, 
    addPlayer, 
    removePlayer, 
    addGame, 
    getPlayerStats,
    addTeam,
    removeTeam,
    addPlayerToTeam,
    removePlayerFromTeam
  } = useFootballData();
  const { toast } = useToast();

  const handleAddPlayer = (playerData: { name: string; position: string; teamId?: string }) => {
    addPlayer(playerData);
    toast({
      title: "Jogador adicionado!",
      description: `${playerData.name} foi adicionado ao elenco.`,
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    removePlayer(playerId);
    toast({
      title: "Jogador removido",
      description: `${player?.name} foi removido do elenco.`,
      variant: "destructive",
    });
  };

  const handleAddGame = (gameData: any) => {
    addGame(gameData);
    toast({
      title: "Jogo registrado!",
      description: `Partida contra ${gameData.opponent} foi registrada.`,
    });
  };

  const handleExportToExcel = () => {
    exportStatsToExcel(playerStats, games, players, teams);
    toast({
      title: "Excel exportado!",
      description: "As estatísticas foram exportadas com sucesso.",
    });
  };

  const playerStats = getPlayerStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-light to-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-field mb-2">⚽ Controle de Futebol</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie jogadores, registre jogos e acompanhe estatísticas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{teams.length}</p>
              <p className="text-sm text-muted-foreground">Times</p>
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
                {games.reduce((total, game) => total + (game.isHome ? game.homeGoals : game.awayGoals), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Gols Marcados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-assist" />
              <p className="text-2xl font-bold">
                {players.reduce((total, player) => total + player.assists, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Assistências</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Times
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jogadores
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

          <TabsContent value="teams" className="space-y-6">
            <TeamManager
              teams={teams}
              players={players}
              onAddTeam={addTeam}
              onRemoveTeam={removeTeam}
              onAddPlayerToTeam={addPlayerToTeam}
              onRemovePlayerFromTeam={removePlayerFromTeam}
            />
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AddPlayerForm teams={teams} onAddPlayer={handleAddPlayer} />
              </div>
              
              <div className="lg:col-span-2">
                {players.length === 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onRemove={handleRemovePlayer}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            {players.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Cadastre jogadores primeiro</h3>
                  <p className="text-muted-foreground">
                    Você precisa ter jogadores cadastrados para registrar jogos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <GameForm players={players} onAddGame={handleAddGame} />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={handleExportToExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar para Excel
              </Button>
            </div>
            <StatsTable playerStats={playerStats} teams={teams} players={players} games={games} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <GamesList games={games} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;