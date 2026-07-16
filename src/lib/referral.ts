/**
 * Parses a given URL string and extracts the 'ref' query parameter,
 * which is used to identify the inviter_id during user registration.
 *
 * @param urlOrQuery - The full URL or query string (e.g. "https://example.com/signup?ref=123-abc")
 * @returns The extracted inviter ID as a string, or null if not found.
 */
export function parseReferralCode(urlOrQuery: string): string | null {
  try {
    let urlString = urlOrQuery;

    // If it's just a query string starting with '?', dummy base URL to make it parseable by URL API
    if (urlString.startsWith('?')) {
      urlString = 'http://localhost' + urlString;
    }

    const url = new URL(urlString, 'http://localhost');
    return url.searchParams.get('ref');
  } catch (error) {
    console.error('Failed to parse referral code from URL:', error);
    return null;
  }
}
