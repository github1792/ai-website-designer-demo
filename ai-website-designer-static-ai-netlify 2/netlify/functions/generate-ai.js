export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ ok:false, error:"Use POST" }, { status:405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ ok:false, error:"GEMINI_API_KEY missing" }, { status:500 });
  }

  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt || "").slice(0, 5000);
  if (!prompt.trim()) return Response.json({ ok:false, error:"Prompt required" }, { status:400 });

  const system = `Return only valid JSON. You are an AI website builder.
Create a website blueprint based on the user's prompt, selected type/template and special request.
Do not force a birthday or checkout section unless the user asks for it.
Keep outputs unique for each template.
JSON shape:
{
 "title":"...",
 "headline":"...",
 "subheadline":"...",
 "summary":"...",
 "sections":[{"title":"...","description":"...","items":["...","...","..."]}],
 "specialEffects":["..."]
}`;

  const user = `Selected type: ${body.selectedType || "auto"}
Selected template: ${body.selectedTemplate || "auto"}
Audience: ${body.audience || ""}
Style: ${body.style || ""}
Backend ideas: ${(body.backend || []).join(", ")}
Special request: ${body.special || ""}

Prompt:
${prompt}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:system}]},
        contents:[{role:"user",parts:[{text:user}]}],
        generationConfig:{temperature:0.85,responseMimeType:"application/json"}
      })
    });
    const data = await res.json();
    if(!res.ok) return Response.json({ ok:false, error:data.error?.message || "Gemini request failed", details:data }, { status:res.status });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let blueprint;
    try { blueprint = JSON.parse(text); } catch { blueprint = { title:"Generated Website", summary:text, sections:[] }; }

    return Response.json({ ok:true, provider:"gemini", blueprint });
  } catch (e) {
    return Response.json({ ok:false, error:e.message || "AI call failed" }, { status:500 });
  }
};

export const config = { path:"/api/generate-ai" };