import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateCommentary(
  shotType: string,
  outcome: string,
  runs: number,
  isWicket: boolean,
  score: string
) {
  try {
    const prompt = `You are a professional cricket commentator. 
    The batsman played a ${shotType} shot. 
    The outcome was: ${isWicket ? "WICKET!" : outcome}. 
    Runs scored: ${runs}. 
    Current Score: ${score}.
    Provide a short, exciting, 1-sentence commentary for this delivery.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a witty and energetic cricket commentator like Ravi Shastri or Richie Benaud. Keep it to one sentence.",
      },
    });

    return response.text || "What a delivery!";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "The crowd goes wild!";
  }
}
