import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Safe base64 decode to Uint8Array (avoid arbitrary chunking that can corrupt data)
function base64ToUint8Array(base64String: string) {
  try {
    // Remove any non-base64 characters (newlines, etc)
    const sanitized = base64String.replace(/[^A-Za-z0-9+/=]/g, '');
    const binaryString = atob(sanitized);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('Failed to decode base64 audio:', e);
    throw new Error('Invalid base64 audio data');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio } = await req.json()
    
    if (!audio) {
      console.error('No audio data provided in request');
      throw new Error('No audio data provided')
    }

    console.log('Processing audio data...');
    console.log('Audio data length:', audio.length);

    // Validate OpenAI API Key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey || !openaiKey.startsWith('sk-')) {
      console.error('Invalid or missing OPENAI_API_KEY. It must start with "sk-".');
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY inválida ou ausente. Defina um secret válido (começa com "sk-") em Settings > Functions.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process audio in chunks
    const base64: string = typeof audio === 'string' && audio.includes(',')
      ? (audio.split(',').pop() as string)
      : audio;
    const binaryAudio = base64ToUint8Array(base64)
    console.log('Binary audio length:', binaryAudio.length);
    
    // Prepare form data
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'pt')

    console.log('Sending request to OpenAI...');

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    })

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('Transcription result:', result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Voice to text error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})