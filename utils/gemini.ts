import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Ensure you have VITE_GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateText = async (prompt: string, type: string): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("Gemini API Key is missing");
        return "AI Generation is disabled (Missing API Key). Please add VITE_GEMINI_API_KEY to your .env file.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
};
