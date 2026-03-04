exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const messages = (body.messages || []).map((m) => ({
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
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${GEMINI_API_KEY}\`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، حدث خطأ. حاول مجدداً!";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
