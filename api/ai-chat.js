export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: "API key not configured" });

  const { messages = [] } = req.body;

  const systemPrompt = `أنت مساعد برمجي ذكي لمنصة "المبرمج الصغير" — منصة تعليم البرمجة للناشئين العرب.
مهمتك الوحيدة: الإجابة على أسئلة البرمجة فقط (Python، JavaScript، HTML، CSS، البرمجة العامة).
قواعد:
- أجب دائماً بالعربية بأسلوب بسيط ومناسب للمبتدئين
- إذا كان السؤال غير برمجي، قل بلطف إنك متخصص في البرمجة فقط
- استخدم أمثلة كود واضحة عند الحاجة
- كن مشجعاً ومحفزاً
- لا تطول كثيراً، كن مختصراً ومفيداً`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "عذراً، حدث خطأ. حاول مجدداً!";
    return res.status(200).json({ reply: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
