/**
 * Utility functions for handling Steam IDs and profile URLs
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Extract Steam ID64 from various Steam URL formats
 *
 * Supports:
 * - steamcommunity.com/profiles/76561197960287930
 * - steamcommunity.com/id/gabelogannewell
 * - s.team/p/abc-def
 * - Raw Steam ID64
 */
export async function extractSteamId(input: string): Promise<{ id: string | null; error?: string }> {
  // Remove whitespace
  input = input.trim();

  // Check if it's already a Steam ID64 (17 digits)
  if (/^\d{17}$/.test(input)) {
    return { id: input };
  }

  // Try to extract from URL patterns
  const patterns = [
    // https://steamcommunity.com/profiles/76561197960287930
    /steamcommunity\.com\/profiles\/(\d{17})/,

    // https://steamcommunity.com/profiles/76561197960287930/
    /steamcommunity\.com\/profiles\/(\d{17})\//,

    // http://steamcommunity.com/profiles/76561197960287930
    /https?:\/\/steamcommunity\.com\/profiles\/(\d{17})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return { id: match[1] };
    }
  }

  // Check for vanity URL (custom URL)
  const vanityPatterns = [
    // https://steamcommunity.com/id/gabelogannewell
    /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/,

    // https://steamcommunity.com/id/gabelogannewell/
    /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)\//,
  ];

  for (const pattern of vanityPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      // Need to resolve vanity URL to Steam ID64 using Steam API
      return await resolveVanityUrl(match[1]);
    }
  }

  return {
    id: null,
    error: 'Invalid Steam ID or profile URL. Please enter a valid Steam ID64 or profile URL.'
  };
}

/**
 * Resolve a vanity URL (custom URL) to Steam ID64 using Steam API
 *
 * Example: "gabelogannewell" → "76561197960287930"
 */
async function resolveVanityUrl(vanityUrl: string): Promise<{ id: string | null; error?: string }> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/steam/resolve/${vanityUrl}`
    );

    if (!response.ok) {
      return {
        id: null,
        error: 'Failed to resolve custom Steam URL. Make sure the URL is correct.'
      };
    }

    const data = await response.json();

    if (data.response?.steamid) {
      return { id: data.response.steamid };
    }

    return {
      id: null,
      error: 'Steam profile not found. Check the custom URL.'
    };
  } catch (error) {
    return {
      id: null,
      error: 'Failed to resolve Steam URL. Please try again or use your Steam ID64 directly.'
    };
  }
}

/**
 * Validate Steam ID64 format
 */
export function isValidSteamId64(id: string): boolean {
  return /^\d{17}$/.test(id);
}

/**
 * Extract Steam ID from common input formats
 * Returns the Steam ID64 or null if invalid
 */
export function quickExtractSteamId(input: string): string | null {
  input = input.trim();

  // Already a Steam ID64
  if (/^\d{17}$/.test(input)) {
    return input;
  }

  // Extract from profiles URL
  const profileMatch = input.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch && profileMatch[1]) {
    return profileMatch[1];
  }

  return null;
}
