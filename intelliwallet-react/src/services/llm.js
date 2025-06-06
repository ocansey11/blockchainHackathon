export async function getRiskScoreFromLLM(profileData) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  // Check if API key is available
  if (!apiKey || apiKey.length < 10) {
    console.warn('⚠️ VITE_DEEPSEEK_API_KEY is missing or invalid. Using fallback risk assessment.');
    return {
      emoji: '🟡',
      level: 'medium',
      summary: 'Unable to verify address - API key not configured.',
      warning: 'Risk assessment service unavailable. Please configure API keys.'
    };
  }

  const systemPrompt = `
You are a blockchain security expert. Based on wallet metadata, analyze its risk level and assign one of: 🟢 Low, 🟡 Medium, 🔴 High.
Respond in this JSON format:
{
  "emoji": "🟢" | "🟡" | "🔴",
  "level": "low" | "medium" | "high",
  "summary": "One-line reason",
  "warning": "Human-friendly message"
}
`;

  const userPrompt = `
Evaluate the following Ethereum wallet profile:
${JSON.stringify(profileData, null, 2)}
`;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }
    
    const raw = data?.choices?.[0]?.message?.content || '{}';

    const parsed = JSON.parse(raw);
    
    // Validate required fields
    if (!parsed.emoji || !parsed.level || !parsed.summary) {
      throw new Error('Invalid response format from LLM');
    }
    
    return parsed;
  } catch (err) {
    console.error("LLM error:", err);
    
    // Different fallback messages based on error type
    if (err.message.includes('401')) {
      return {
        emoji: '🟡',
        level: 'medium',
        summary: 'API authentication failed.',
        warning: 'Risk assessment unavailable - please check API credentials.'
      };
    } else if (err.message.includes('CORS') || err.message.includes('fetch')) {
      return {
        emoji: '🟡',
        level: 'medium',
        summary: 'Network error accessing risk service.',
        warning: 'Risk assessment temporarily unavailable due to connection issues.'
      };
    } else {
      return {
        emoji: '🟡',
        level: 'medium',
        summary: 'Unable to verify risk due to error.',
        warning: 'Proceed with caution. Risk check service failed.'
      };
    }
  }
}
