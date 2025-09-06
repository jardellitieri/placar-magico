import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Target, Star } from "lucide-react";
import { toast } from "sonner";

interface AddPlayerFormProps {
  onAddPlayer: (player: { name: string; position: string; level: 1 | 2 }) => void;
}

const positions = [
  { value: "Goleiro", icon: Target, color: "text-primary" },
  { value: "Zagueiro", icon: User, color: "text-muted-foreground" },
  { value: "Meio-campo", icon: User, color: "text-muted-foreground" },
  { value: "Meia-atacante", icon: User, color: "text-muted-foreground" },
  { value: "Pivo", icon: Target, color: "text-accent" }
];

export const AddPlayerForm = ({ onAddPlayer }: AddPlayerFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && position) {
      onAddPlayer({ 
        name: name.trim(), 
        position,
        level
      });
      setName("");
      setPosition("");
      setLevel(1);
      toast.success("Jogador adicionado com sucesso!");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          Adicionar Novo Jogador
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Jogador */}
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome do Jogador
            </Label>
            <Input
              id="playerName"
              placeholder="Digite o nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Posição em Campo
            </Label>
            <Select value={position} onValueChange={setPosition} required>
              <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Escolha a posição do jogador" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                {positions.map((pos) => (
                  <SelectItem 
                    key={pos.value} 
                    value={pos.value}
                    className="cursor-pointer hover:bg-accent/50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2">
                      <pos.icon className={`h-4 w-4 ${pos.color}`} />
                      {pos.value}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Habilidade */}
          <div className="space-y-2">
            <Label htmlFor="level" className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Nível de Habilidade
            </Label>
            <Select value={level.toString()} onValueChange={(value) => setLevel(Number(value) as 1 | 2)} required>
              <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Selecione o nível de habilidade" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                <SelectItem 
                  value="1" 
                  className="cursor-pointer hover:bg-accent/50 transition-colors duration-150"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Nível 1 - Iniciante
                  </div>
                </SelectItem>
                <SelectItem 
                  value="2"
                  className="cursor-pointer hover:bg-accent/50 transition-colors duration-150"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    Nível 2 - Avançado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Botão de Submissão */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Adicionar Jogador ao Time
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};