export async function fetchLiveBenchmarks(): Promise<any[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) throw new Error('Failed to fetch OpenRouter models');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching models', err);
    return [];
  }
}
