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
      model: "gemini-2.0-flash-lite",
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
        model: "gemini-2.0-flash-lite",
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
      model: "gemini-2.0-flash-lite",
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
