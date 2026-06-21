
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Subject } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiExplanation = async (
  prompt: string, 
  userProfile: UserProfile, 
  subject: Subject
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const systemInstruction = `You are a friendly, enthusiastic, and patient AI tutor for children aged ${userProfile.age}. 
  The student is in ${userProfile.grade}. 
  Current subject: ${subject}. 
  Guidelines:
  - KEEP ANSWERS BRIEF AND CONCISE. Provide direct, short explanations (1-2 sentences).
  - Use simple language, metaphors, and fun examples appropriate for a ${userProfile.age}-year-old.
  - Break down complex topics into small, bite-sized steps.
  - Be encouraging! Use phrases like "Great question!", "You've got this!", or "Let's explore this together!".
  - If the student asks something outside Math, Science, or English, gently steer them back or answer briefly then return to learning.
  - Format your response with clear headings and bullet points using Markdown only if necessary for clarity.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
};

export const generateEducationalImage = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A vibrant, clear, and child-friendly educational illustration of: ${topic}. Digital art style, professional educational quality, no scary elements, high contrast, suitable for a school textbook.` },
      ],
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateQuiz = async (topic: string, userProfile: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 3-question multiple choice quiz about ${topic} for a ${userProfile.age}-year-old.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-indexed)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const textToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this in a friendly, helpful teacher voice: ${text}` }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
