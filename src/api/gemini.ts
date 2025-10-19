import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCHM7hoXP2xLF08aM_xhlTQws9eee59kp0';

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

interface ProfileSummaryData {
  username?: string;
  musicGenres?: string[];
  favoriteGames?: string[];
  favoriteShows?: string[];
  spotifyData?: {
    topArtists?: string[];
    topTracks?: string[];
  };
  steamData?: {
    games?: Array<{ name: string; playtime_forever?: number }>;
  };
  traktData?: {
    shows?: string[];
    movies?: string[];
  };
}

export async function generateProfileSummary(profileData: ProfileSummaryData): Promise<string> {
  try {
    // Build the prompt based on available data
    let prompt = `You are a creative profile bio generator. Create a friendly, engaging, and personalized profile summary (2-3 sentences max) based on the following information about a user:\n\n`;

    if (profileData.username) {
      prompt += `Username: ${profileData.username}\n`;
    }

    // Music interests
    if (profileData.musicGenres && profileData.musicGenres.length > 0) {
      prompt += `\nMusic Genres: ${profileData.musicGenres.join(', ')}\n`;
    }
    if (profileData.spotifyData?.topArtists && profileData.spotifyData.topArtists.length > 0) {
      prompt += `Top Artists: ${profileData.spotifyData.topArtists.slice(0, 5).join(', ')}\n`;
    }
    if (profileData.spotifyData?.topTracks && profileData.spotifyData.topTracks.length > 0) {
      prompt += `Favorite Tracks: ${profileData.spotifyData.topTracks.slice(0, 3).join(', ')}\n`;
    }

    // Gaming interests
    if (profileData.favoriteGames && profileData.favoriteGames.length > 0) {
      prompt += `\nFavorite Games: ${profileData.favoriteGames.join(', ')}\n`;
    }
    if (profileData.steamData?.games && profileData.steamData.games.length > 0) {
      const topGames = profileData.steamData.games
        .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
        .slice(0, 5)
        .map(g => `${g.name} (${Math.round((g.playtime_forever || 0) / 60)}h)`)
        .join(', ');
      prompt += `Steam Library Top Games: ${topGames}\n`;
    }

    // Shows/Movies interests
    if (profileData.favoriteShows && profileData.favoriteShows.length > 0) {
      prompt += `\nFavorite Shows/Movies: ${profileData.favoriteShows.join(', ')}\n`;
    }
    if (profileData.traktData?.shows && profileData.traktData.shows.length > 0) {
      prompt += `Currently Watching: ${profileData.traktData.shows.slice(0, 5).join(', ')}\n`;
    }
    if (profileData.traktData?.movies && profileData.traktData.movies.length > 0) {
      prompt += `Movies on Watchlist: ${profileData.traktData.movies.slice(0, 5).join(', ')}\n`;
    }

    prompt += `\nCreate a concise, friendly profile summary that captures this person's interests and personality. Be casual and engaging. Keep it to 2-3 sentences maximum.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const summary = response.text;

    if (!summary) {
      throw new Error('No summary generated');
    }

    // Save to localStorage
    localStorage.setItem('ai_profile_summary', summary.trim());

    return summary.trim();
  } catch (error) {
    console.error('Error generating profile summary:', error);
    throw error;
  }
}

// Get cached summary from localStorage
export function getCachedSummary(): string | null {
  return localStorage.getItem('ai_profile_summary');
}

// Clear cached summary
export function clearCachedSummary(): void {
  localStorage.removeItem('ai_profile_summary');
}

export async function generateGamePrompt(game: string): Promise<string> {
  try {
    let prompt = `You are an enigmatic creative mastermind of a game prompt generator. `;
    if (game === `hot_takes`) {
      prompt += `Greet the users to the game 'Hot Takes', come up with and present to the users a topic up to three ` +
                `words that is prone to have some hot takes, tell them write their hot take ` +
                `and then press submit to submit their responses, and that both user's responses ` +
                `will be revealed after both of them have submitted. This response should be no longer than 4 sentences ` +
                `and not include special effects, only text that is speech.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      const summary = response.text;

      if (!summary) {
        throw new Error('No summary generated');
      }

      return summary.trim();
    } else if (game === `emoji_story`) {

    } else if (game === `two_truths_and_a_vibe`) {

    } else if (game === `guilty_pleasure_guess`) {

    } else if (game === `spicy_statements`) {

    } else if (game === `first_best_forever`) {

    } else if (game === `lets_rate_it`) {
      
    }
    return '';
  } catch (error) {
    console.error('Error generating game prompt:', error);
    throw error;
  }

}

export async function generateGameResponse(gamePrompt: string, personality: string): Promise<string> {
  try {
    let prompt = `Given the following prompt, write a hot take that is about one sentence long that connects to the topic ` +
                  ` in the prompt that reads like someone with a ` + personality + ` personality: ` + gamePrompt;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const gameResponse = response.text;

    if (!gameResponse) {
      throw new Error('No game response generated');
    }

    return gameResponse.trim();
  } catch (error) {
    console.error('Error generating game prompt:', error);
    throw error;
  }
}

export async function callGemini(prompt: string): Promise<string> {
  try {
    const gemini = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const response = gemini.text;

    if (!response) {
      throw new Error('No game response generated');
    }

    return response.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// Calculate similarity between user profile and a candidate profile (DEPRECATED - use batch version)
export async function calculateProfileSimilarity(
  userProfile: {
    hobbies: string;
    musicGenres: string[];
    favoriteGames: string[];
    favoriteShows: string[];
  },
  candidateProfile: {
    username: string;
    personality: string;
    interests: string[];
  }
): Promise<number> {
  try {
    const prompt = `You are a profile matching algorithm. Compare these two profiles and return ONLY a similarity score from 0-100 (where 100 is extremely similar, 0 is completely different).

User Profile:
- Hobbies: ${userProfile.hobbies || 'Not specified'}
- Music Genres: ${userProfile.musicGenres.join(', ') || 'None'}
- Favorite Games: ${userProfile.favoriteGames.join(', ') || 'None'}
- Favorite Shows: ${userProfile.favoriteShows.join(', ') || 'None'}

Candidate Profile (${candidateProfile.username}):
- Personality: ${candidateProfile.personality}
- Interests: ${candidateProfile.interests.join(', ')}

Consider:
- Overlap in interests, hobbies, entertainment preferences
- Personality compatibility with user's interests
- Potential for meaningful connection

Return ONLY the number (0-100), nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const scoreText = response.text?.trim() || '50';
    const score = parseInt(scoreText);

    if (isNaN(score) || score < 0 || score > 100) {
      console.warn('Invalid similarity score:', scoreText);
      return 50; // Default to neutral if parsing fails
    }

    return score;
  } catch (error) {
    console.error('Error calculating profile similarity:', error);
    return 50; // Return neutral score on error
  }
}

// OPTIMIZED: Batch calculate similarity scores for multiple candidates in a single API call
export async function calculateBatchProfileSimilarity(
  userProfile: {
    hobbies: string;
    musicGenres: string[];
    favoriteGames: string[];
    favoriteShows: string[];
  },
  candidateProfiles: Array<{
    username: string;
    personality: string;
    interests: string[];
  }>
): Promise<Map<string, number>> {
  // Check cache first
  const cacheKey = generateSimilarityCacheKey(userProfile);
  const cached = getCachedSimilarityScores(cacheKey);

  if (cached) {
    console.log('Using cached similarity scores');
    return cached;
  }

  try {
    // Build a single prompt for all candidates
    const candidatesList = candidateProfiles.map((candidate, index) =>
      `${index + 1}. ${candidate.username}:
   - Personality: ${candidate.personality}
   - Interests: ${candidate.interests.join(', ')}`
    ).join('\n\n');

    const prompt = `You are a profile matching algorithm. Compare the user's profile with ALL ${candidateProfiles.length} candidate profiles below and return similarity scores for each.

User Profile:
- Hobbies: ${userProfile.hobbies || 'Not specified'}
- Music Genres: ${userProfile.musicGenres.join(', ') || 'None'}
- Favorite Games: ${userProfile.favoriteGames.join(', ') || 'None'}
- Favorite Shows: ${userProfile.favoriteShows.join(', ') || 'None'}

Candidate Profiles:
${candidatesList}

For EACH candidate, calculate a similarity score from 0-100 (where 100 is extremely similar, 0 is completely different).

Consider:
- Overlap in interests, hobbies, entertainment preferences
- Personality compatibility with user's interests
- Potential for meaningful connection

Return ONLY the scores in this exact format (one per line):
1. 85
2. 72
3. 91
(etc...)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const responseText = response.text?.trim() || '';
    const scores = new Map<string, number>();

    // Parse the response
    const lines = responseText.split('\n').filter(line => line.trim());

    candidateProfiles.forEach((candidate, index) => {
      const line = lines[index];
      if (line) {
        // Extract number from formats like "1. 85" or "85" or "1) 85"
        const match = line.match(/(\d+)[.)]\s*(\d+)|(\d+)/);
        if (match) {
          const score = parseInt(match[2] || match[3] || match[1]);
          if (!isNaN(score) && score >= 0 && score <= 100) {
            scores.set(candidate.username, score);
          } else {
            scores.set(candidate.username, 50); // Default if invalid
          }
        } else {
          scores.set(candidate.username, 50); // Default if parsing fails
        }
      } else {
        scores.set(candidate.username, 50); // Default if no line found
      }
    });

    // Cache the results
    cacheSimilarityScores(cacheKey, scores);

    console.log(`Calculated ${scores.size} similarity scores in a single API call`);
    return scores;
  } catch (error) {
    console.error('Error calculating batch profile similarity:', error);
    // Return default scores for all candidates
    const defaultScores = new Map<string, number>();
    candidateProfiles.forEach(candidate => {
      defaultScores.set(candidate.username, 50);
    });
    return defaultScores;
  }
}

// Generate a cache key based on user profile
function generateSimilarityCacheKey(userProfile: {
  hobbies: string;
  musicGenres: string[];
  favoriteGames: string[];
  favoriteShows: string[];
}): string {
  const profileData = JSON.stringify({
    hobbies: userProfile.hobbies || '',
    musicGenres: (userProfile.musicGenres || []).sort(),
    favoriteGames: (userProfile.favoriteGames || []).sort(),
    favoriteShows: (userProfile.favoriteShows || []).sort()
  });
  return `similarity_cache_${btoa(profileData).substring(0, 50)}`;
}

// Get cached similarity scores
function getCachedSimilarityScores(cacheKey: string): Map<string, number> | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    // Check if cache is less than 1 hour old
    if (Date.now() - data.timestamp > 60 * 60 * 1000) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return new Map(Object.entries(data.scores));
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

// Cache similarity scores
function cacheSimilarityScores(cacheKey: string, scores: Map<string, number>): void {
  try {
    const data = {
      timestamp: Date.now(),
      scores: Object.fromEntries(scores)
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching scores:', error);
  }
}

// Clear similarity cache (call this when user updates their profile)
export function clearSimilarityCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('similarity_cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Similarity cache cleared');
  } catch (error) {
    console.error('Error clearing similarity cache:', error);
  }
}

// Generate a hot take response based on a user's personality
export async function generatePersonalityHotTake(
  gamePrompt: string,
  personality: string,
  username: string,
  interests: string[]
): Promise<string> {
  try {
    const prompt = `You are roleplaying as ${username}, a person with this personality: "${personality}".
Their interests include: ${interests.join(', ')}.

Given this Hot Takes topic from the game prompt: "${gamePrompt}"

Write a single hot take (1-2 sentences max) that this person would say about the topic.
Make it authentic to their personality and interests. Be opinionated and engaging.
Do not use asterisks or any special formatting, just write the hot take as natural speech.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const hotTake = response.text;

    if (!hotTake) {
      throw new Error('No hot take generated');
    }

    return hotTake.trim();
  } catch (error) {
    console.error('Error generating personality hot take:', error);
    throw error;
  }
}

// Generate a conversational response based on personality and conversation history
export async function generatePersonalityResponse(
  username: string,
  personality: string,
  interests: string[],
  conversationHistory: Array<{ sender: string; text: string }>,
  userMessage: string
): Promise<string> {
  try {
    // Build conversation context
    const historyText = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.sender === 'user' ? 'User' : username}: ${msg.text}`)
      .join('\n');

    const prompt = `You are roleplaying as ${username}, a person with this personality: "${personality}".
Their interests include: ${interests.join(', ')}.

Conversation so far:
${historyText}

User just said: "${userMessage}"

Respond naturally as ${username} would, staying in character with their personality.
Keep your response conversational (1-3 sentences). Be engaging and show personality.
Do not use asterisks or any special formatting, just write as natural speech.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const conversationResponse = response.text;

    if (!conversationResponse) {
      throw new Error('No conversation response generated');
    }

    return conversationResponse.trim();
  } catch (error) {
    console.error('Error generating personality response:', error);
    throw error;
  }
}