import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceCommandButtonProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
}

export const VoiceCommandButton = ({ onCommand, disabled }: VoiceCommandButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = processAudio;

      mediaRecorderRef.current.start();
      setIsRecording(true);

      toast({
        title: "Gravando",
        description: "Diga o comando de voz. Ex: 'adicionar gol do jogador Manu'",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          console.log('Sending audio to transcription...');
          
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) {
            throw error;
          }

          if (data?.text) {
            console.log('Transcription result:', data.text);
            onCommand(data.text);
            
            toast({
              title: "Comando processado",
              description: `Texto reconhecido: "${data.text}"`,
            });
          } else {
            throw new Error('Nenhum texto foi reconhecido');
          }
        } catch (error) {
          console.error('Error processing transcription:', error);
          toast({
            title: "Erro",
            description: "Erro ao processar o áudio",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('Error in processAudio:', error);
      setIsProcessing(false);
      toast({
        title: "Erro",
        description: "Erro ao processar o áudio",
        variant: "destructive",
      });
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <>
          <Square className="h-4 w-4 animate-pulse" />
          Processando...
        </>
      ) : isRecording ? (
        <>
          <MicOff className="h-4 w-4" />
          Parar
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Comando de Voz
        </>
      )}
    </Button>
  );
};