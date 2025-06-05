export async function getRiskScoreFromLLM(profileData) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

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

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || '{}';

    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("LLM error:", err);
    return {
      emoji: '🟡',
      level: 'medium',
      summary: 'Unable to verify risk due to error.',
      warning: 'Proceed with caution. Risk check service failed.'
    };
  }
}
