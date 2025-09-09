import { Player } from "@/types/football";

export interface ParsedVoiceCommand {
  action: 'add_event' | 'unknown';
  eventType?: 'goal' | 'assist' | 'own_goal' | 'goal_conceded';
  playerName?: string;
  playerId?: string;
}

export const parseVoiceCommand = (text: string, players: Player[]): ParsedVoiceCommand => {
  const normalizedText = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();

  console.log('Parsing voice command:', normalizedText);

  // Padrões para diferentes tipos de eventos
  const patterns = {
    goal: [
      /(?:adicionar|add|marcar)?\s*(?:um\s+)?gol\s+(?:do|da|de)\s+(?:jogador\s+)?(.+)/,
      /(.+)\s+(?:fez|marcou)\s+(?:um\s+)?gol/,
      /gol\s+(?:do|da|de)\s+(.+)/
    ],
    assist: [
      /(?:adicionar|add)?\s*(?:uma\s+)?assist(?:encia)?\s+(?:do|da|de)\s+(?:jogador\s+)?(.+)/,
      /(.+)\s+(?:deu|fez)\s+(?:uma\s+)?assist(?:encia)?/,
      /assist(?:encia)?\s+(?:do|da|de)\s+(.+)/
    ],
    own_goal: [
      /(?:adicionar|add)?\s*gol\s+contra\s+(?:do|da|de)\s+(?:jogador\s+)?(.+)/,
      /(.+)\s+(?:fez|marcou)\s+gol\s+contra/,
      /gol\s+contra\s+(?:do|da|de)\s+(.+)/
    ],
    goal_conceded: [
      /(?:adicionar|add)?\s*gol\s+sofrido\s+(?:do|da|de)\s+(?:goleiro\s+)?(.+)/,
      /(.+)\s+sofreu\s+(?:um\s+)?gol/,
      /gol\s+sofrido\s+(?:do|da|de)\s+(.+)/
    ]
  };

  // Tenta encontrar o tipo de evento e o nome do jogador
  for (const [eventType, eventPatterns] of Object.entries(patterns)) {
    for (const pattern of eventPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        const playerNameFromCommand = match[1].trim();
        
        // Procura o jogador mais próximo
        const matchedPlayer = findBestPlayerMatch(playerNameFromCommand, players);
        
        if (matchedPlayer) {
          console.log(`Matched event: ${eventType}, player: ${matchedPlayer.name}`);
          return {
            action: 'add_event',
            eventType: eventType as 'goal' | 'assist' | 'own_goal' | 'goal_conceded',
            playerName: matchedPlayer.name,
            playerId: matchedPlayer.id
          };
        }
      }
    }
  }

  console.log('No match found for command:', normalizedText);
  return { action: 'unknown' };
};

const findBestPlayerMatch = (searchName: string, players: Player[]): Player | null => {
  const normalizedSearch = searchName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Busca exata primeiro
  let bestMatch = players.find(player => 
    player.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') === normalizedSearch
  );

  if (bestMatch) return bestMatch;

  // Busca por contém o nome
  bestMatch = players.find(player => 
    player.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(normalizedSearch)
  );

  if (bestMatch) return bestMatch;

  // Busca por nome que contém a busca
  bestMatch = players.find(player => 
    normalizedSearch.includes(
      player.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    )
  );

  if (bestMatch) return bestMatch;

  // Busca fuzzy simples (primeiras letras)
  const searchWords = normalizedSearch.split(' ');
  bestMatch = players.find(player => {
    const playerWords = player.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ');
    
    return searchWords.some(searchWord => 
      playerWords.some(playerWord => 
        playerWord.startsWith(searchWord) || searchWord.startsWith(playerWord)
      )
    );
  });

  return bestMatch || null;
};