export async function fetchOllamaTags(baseUrl: string = 'http://localhost:11434'): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.models) {
      return data.models.map((m: any) => m.name);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch Ollama tags:", err);
    throw err;
  }
}
