import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

// Initialize client (checking for API key safely)
if (process.env.API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateText = async (prompt: string, type: 'news' | 'about' | 'hero'): Promise<string> => {
  if (!aiClient) {
    throw new Error("API Key tidak ditemukan. Fitur AI tidak tersedia.");
  }

  try {
    const modelId = "gemini-2.5-flash"; // Fast and effective for text
    
    let systemInstruction = "";
    if (type === 'news') {
        systemInstruction = "Anda adalah penulis berita profesional untuk sebuah organisasi politik/sosial. Buatlah berita yang inspiratif, formal namun mudah dipahami, dalam Bahasa Indonesia.";
    } else if (type === 'about') {
        systemInstruction = "Anda adalah humas profesional. Buatlah deskripsi 'Tentang Kami' yang meyakinkan, profesional, dan visioner.";
    } else {
        systemInstruction = "Buatlah copy marketing yang pendek, punchy, dan inspiratif untuk hero section website.";
    }

    const response = await aiClient.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Gagal menghasilkan teks.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gagal menghubungi AI Service.");
  }
};
