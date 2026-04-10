export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  modelId: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('No OpenRouter API key provided');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173', 
      'X-Title': 'ClaimMind-v3'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data && data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  }

  throw new Error('Valid JSON, but no choices in OpenRouter response');
}
