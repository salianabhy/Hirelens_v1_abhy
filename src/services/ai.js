import Groq from 'groq-sdk';

/**
 * 🔒 SECURITY NOTICE: 
 * For 10,000+ users, this service should be moved to a Firebase Cloud Function.
 * This prevents your Groq API key from being exposed in the browser.
 */

const getGroqClient = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing Groq API Key");
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

export const callGroq = async (prompt, attempt = 0) => {
  const groq = getGroqClient();
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    return completion;
  } catch (err) {
    if (err.status === 429 && attempt < 3) {
      const wait = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, wait));
      return callGroq(prompt, attempt + 1);
    }
    throw err;
  }
};
