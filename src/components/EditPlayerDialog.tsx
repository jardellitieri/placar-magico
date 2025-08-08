import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { Player } from "@/types/football";
import { toast } from "sonner";

interface EditPlayerDialogProps {
  player: Player;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
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

export const EditPlayerDialog = ({ player, onUpdatePlayer }: EditPlayerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(player.name);
  const [position, setPosition] = useState(player.position);
  const [level, setLevel] = useState<1 | 2>(player.level);
  const [availableForDraft, setAvailableForDraft] = useState(player.availableForDraft);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && position) {
      try {
        await onUpdatePlayer(player.id, {
          name: name.trim(),
          position,
          level,
          availableForDraft
        });
        setOpen(false);
        toast.success("Jogador atualizado com sucesso!");
      } catch (error) {
        toast.error("Erro ao atualizar jogador");
      }
    }
  };

  const resetForm = () => {
    setName(player.name);
    setPosition(player.position);
    setLevel(player.level);
    setAvailableForDraft(player.availableForDraft);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="position">Posição</Label>
            <Select value={position} onValueChange={setPosition} required>
              <SelectTrigger>
                <SelectValue />
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
            <Label htmlFor="level">Nível</Label>
            <Select value={level.toString()} onValueChange={(value) => setLevel(Number(value) as 1 | 2)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nível 1</SelectItem>
                <SelectItem value="2">Nível 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available-for-draft"
              checked={availableForDraft}
              onCheckedChange={setAvailableForDraft}
            />
            <Label htmlFor="available-for-draft">
              Disponível para sorteio
            </Label>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};