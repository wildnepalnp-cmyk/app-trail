import { GoogleGenAI } from "@google/genai";
import { Question } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainAnswer = async (question: Question): Promise<string> => {
  try {
    const prompt = `
      तपाईं नेपालको सवारी चालक अनुमति पत्र (Driving License) को विज्ञ प्रशिक्षक हुनुहुन्छ।
      यो प्रश्नको सही उत्तर किन त्यो भयो, स्पष्ट नेपाली भाषामा बुझाउनुहोस्। छोटो र मिठो (३०-४० शब्दमा) हुनुपर्छ।

      प्रश्न: ${question.question}
      विकल्पहरू:
      ${question.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}
      सही उत्तर: ${question.options[question.correctAnswer]}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "अहिले व्याख्या उपलब्ध छैन।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "माफ गर्नुहोला, प्राविधिक समस्याका कारण व्याख्या लोड हुन सकेन।";
  }
};

export const generateTrickyQuestion = async (): Promise<Partial<Question> | null> => {
  try {
     const prompt = `
      नेपालको ड्राइभिङ लाइसेन्स लिखित परीक्षाका लागि एउटा "झुक्याउने" (Tricky) प्रश्न तयार गर्नुहोस्।
      ढाँचा JSON हुनुपर्छ:
      {
        "question": "प्रश्न यहाँ",
        "options": ["क", "ख", "ग", "घ"],
        "correctAnswer": 0 // index
      }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
      console.error(e);
      return null;
  }
}
