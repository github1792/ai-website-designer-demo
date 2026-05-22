export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "Use POST" }, { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({
      ok: false,
      error: "GEMINI_API_KEY is missing. Add it in Netlify Site Settings > Environment variables."
    }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = String(body.mode || "website").slice(0, 40);
  const prompt = String(body.prompt || "").slice(0, 4000);
  const style = String(body.style || "rainbow").slice(0, 80);

  if (!prompt.trim()) {
    return Response.json({ ok: false, error: "Prompt is required" }, { status: 400 });
  }

  const systemInstruction = `You are an AI website and 2D game generator.
Return ONLY valid JSON. No markdown. No explanation.
Create a practical generation blueprint for a frontend-only static demo.

JSON shape:
{
  "title": "short title",
  "mode": "website | special | game",
  "theme": "short visual theme",
  "headline": "hero headline",
  "subheadline": "hero subheadline",
  "colors": ["#hex1","#hex2","#hex3","#hex4"],
  "sections": [
    {"title":"section title","description":"section description","items":["item1","item2","item3"]}
  ],
  "quizQuestions": [
    {"question":"...", "options":["A","B","C","D"], "answer":0}
  ],
  "game": {
    "type": "catcher | dodger | shooter | maze | platformer | quiz",
    "playerEmoji": "emoji",
    "goodEmoji": "emoji",
    "badEmoji": "emoji",
    "goal": "short game goal"
  },
  "specialEffects": ["confetti","floating hearts","countdown","gallery","surprise reveal"]
}

Rules:
- If mode is special, make it personal, emotional, colourful and highly customized.
- If prompt mentions birthday/mama/mother, include montage, quiz, cake/love, animation, and celebration ideas.
- If mode is game, create a playable simple game plan.
- Do not mention checkout/payment unless the prompt explicitly asks for it.
- Avoid generic business landing-page sections for emotional or game prompts.`;

  const userPrompt = `Mode: ${mode}
Style: ${style}
User prompt: ${prompt}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return Response.json({
        ok: false,
        error: data.error?.message || "Gemini API request failed",
        details: data
      }, { status: geminiResponse.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let blueprint;
    try {
      blueprint = JSON.parse(text);
    } catch {
      blueprint = { title: "AI Generated Website", headline: "AI Generated Website", raw: text };
    }

    return Response.json({
      ok: true,
      provider: "gemini",
      model: "gemini-2.0-flash",
      blueprint
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message || "AI request failed"
    }, { status: 500 });
  }
};

export const config = {
  path: "/api/generate-ai"
};
