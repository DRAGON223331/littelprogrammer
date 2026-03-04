export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { messages = [] } = req.body;

  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const systemPrompt = `أنت مساعد برمجي ذكي لمنصة "المبرمج الصغير" — منصة تعليم البرمجة للناشئين العرب.
مهمتك الوحيدة: الإجابة على أسئلة البرمجة فقط (Python، JavaScript، HTML، CSS، البرمجة العامة).
قواعد:
- أجب دائماً بالعربية بأسلوب بسيط ومناسب للمبتدئين
- إذا كان السؤال غير برمجي، قل بلطف إنك متخصص في البرمجة فقط
- استخدم أمثلة كود واضحة عند الحاجة
- كن مشجعاً ومحفزاً
- لا تطول كثيراً، كن مختصراً ومفيداً`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
  return res.status(200).json({ reply: "❌ Gemini Error: " + JSON.stringify(data) });
}
const text = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
