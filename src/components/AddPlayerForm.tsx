import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface AddPlayerFormProps {
  onAddPlayer: (player: { name: string; position: string }) => void;
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

export const AddPlayerForm = ({ onAddPlayer }: AddPlayerFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && position) {
      onAddPlayer({ name: name.trim(), position });
      setName("");
      setPosition("");
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
          
          <Button type="submit" className="w-full">
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};