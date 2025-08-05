import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Team } from "@/types/football";
import { toast } from "sonner";

interface AddPlayerFormProps {
  teams: Team[];
  onAddPlayer: (player: { name: string; position: string; level: 1 | 2; teamId?: string }) => void;
}

const positions = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito", 
  "Lateral Esquerdo",
  "Volante",
  "Meio-campo",
  "Meia-atacante",
  "Ponta Direita",
  "Ponta Esquerda",
  "Centroavante"
];

export const AddPlayerForm = ({ teams, onAddPlayer }: AddPlayerFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);
  const [teamId, setTeamId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && position) {
      onAddPlayer({ 
        name: name.trim(), 
        position,
        level,
        teamId: teamId || undefined
      });
      setName("");
      setPosition("");
      setLevel(1);
      setTeamId("");
      toast.success("Jogador adicionado com sucesso!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Adicionar Jogador
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nome do jogador"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Select value={position} onValueChange={setPosition} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={level.toString()} onValueChange={(value) => setLevel(Number(value) as 1 | 2)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nível 1</SelectItem>
                <SelectItem value="2">Nível 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Time (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};