import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  }
  return aiClient;
}

export interface GeneratedQuestion {
  id: number;
  text: string;
  q: string;
  answer: string;
  options: string[];
}

export async function generateLessonQuestions(
  category: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias',
  age: number,
  grade: string
): Promise<GeneratedQuestion[]> {
  const prompt = `Genera un set de 5 lecciones educativas para un niño de ${age} años que está en ${grade}. 
  La categoría es ${category.toUpperCase()}.
  Cada lección debe tener un texto breve de contexto (un cuento corto o una premisa), una pregunta de opción múltiple basada en ese texto, la respuesta correcta (en minúsculas) y 4 opciones posibles.
  Asegúrate de que el contenido sea apropiado para su edad y nivel escolar. Si es un curso superior, aumenta la complejidad de los textos y razonamientos.
  
  Importante: Las opciones deben ser variadas y la respuesta correcta debe estar incluida en ellas.`;

  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            q: { type: Type.STRING },
            answer: { type: Type.STRING, description: "La respuesta correcta exacta en minúsculas" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "4 opciones de respuesta"
            },
          },
          required: ["id", "text", "q", "answer", "options"],
        },
      },
    },
  });

  try {
    const questions = JSON.parse(response.text);
    return questions;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("No se pudieron generar las preguntas.");
  }
}
