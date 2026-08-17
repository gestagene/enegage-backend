export async function checkUrlSafety(url: string) {
  const response = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: {
          clientId: "your-app-name",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            {
              url,
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Safe Browsing API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    safe: !data.matches || data.matches.length === 0,
    matches: data.matches ?? [],
  };
}
