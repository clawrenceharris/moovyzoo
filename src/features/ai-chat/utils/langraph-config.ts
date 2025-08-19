import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Initialize the OpenAI model
export const createChatModel = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please set OPENAI_API_KEY in your environment variables.');
  }

  return new ChatOpenAI({
    model: 'gpt-4o',
    apiKey,
    temperature: 0,
    streaming: true,
  });
};

// Movie-related tools for Zoovie
export const getMovieRecommendation = tool((input) => {
  // This is a mock implementation - in a real app, you'd integrate with TMDB API
  const genres = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'romance'];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  
  const mockMovies = {
    action: ['Mad Max: Fury Road', 'John Wick', 'The Dark Knight'],
    comedy: ['The Grand Budapest Hotel', 'Superbad', 'Anchorman'],
    drama: ['The Shawshank Redemption', 'Parasite', 'Moonlight'],
    horror: ['Hereditary', 'Get Out', 'The Conjuring'],
    'sci-fi': ['Blade Runner 2049', 'Interstellar', 'Ex Machina'],
    romance: ['The Princess Bride', 'Eternal Sunshine', 'Her']
  };

  const movies = mockMovies[randomGenre as keyof typeof mockMovies] || mockMovies.drama;
  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  
  return `Based on your preferences for ${input.genre || 'great movies'}, I recommend "${randomMovie}" - it's a fantastic ${randomGenre} film that many Zoovie users love!`;
}, {
  name: 'get_movie_recommendation',
  description: 'Get personalized movie recommendations based on genre preferences',
  schema: z.object({
    genre: z.string().optional().describe('Preferred movie genre (action, comedy, drama, etc.)'),
    mood: z.string().optional().describe('Current mood or what type of experience they want')
  })
});

export const analyzeMovieScene = tool((input) => {
  // Mock scene analysis - in a real app, this would use computer vision
  const analyses = [
    'This scene uses warm lighting and close-up shots to create intimacy between characters.',
    'The cinematography here employs the rule of thirds and leading lines to guide the viewer\'s eye.',
    'Notice the color palette shift from cool blues to warm oranges, symbolizing the character\'s emotional journey.',
    'The use of shallow depth of field isolates the subject and creates visual emphasis.',
    'This establishing shot uses wide framing to show the character\'s isolation in the environment.'
  ];
  
  const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
  return `Scene Analysis: ${randomAnalysis} The scene you're describing likely contains rich visual storytelling elements that enhance the narrative.`;
}, {
  name: 'analyze_movie_scene',
  description: 'Analyze movie scenes for cinematography, symbolism, and storytelling techniques',
  schema: z.object({
    description: z.string().describe('Description of the movie scene to analyze'),
    movie: z.string().optional().describe('Name of the movie (if known)')
  })
});

// Create the LangGraph agent with movie-focused tools
export const createAIAgent = () => {
  const model = createChatModel();
  
  const agent = createReactAgent({
    llm: model,
    tools: [getMovieRecommendation, analyzeMovieScene],
    messageModifier: `You are Zoovie's AI assistant, a friendly and knowledgeable companion for movie and TV enthusiasts. 

Your personality:
- Passionate about cinema and storytelling
- Helpful and encouraging 
- Knowledgeable about film history, techniques, and culture
- Excited to help users discover new content and deepen their appreciation
- Casual and conversational, like talking to a fellow movie buff

Guidelines:
- Always relate responses back to movies, TV shows, or entertainment when possible
- Encourage users to explore different genres and eras of cinema
- Share interesting film facts and behind-the-scenes insights
- Help users find their next great watch
- Be enthusiastic about the art of filmmaking
- If users ask about non-movie topics, gently guide the conversation back to entertainment

Remember: You're here to enhance the Zoovie experience and help users connect with great content!`
  });

  return agent;
};

// Configuration for LangSmith tracing (optional)
export const configureLangSmith = () => {
  if (process.env.LANGCHAIN_API_KEY) {
    process.env.LANGCHAIN_TRACING_V2 = 'true';
    process.env.LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || 'Zoovie';
  }
};