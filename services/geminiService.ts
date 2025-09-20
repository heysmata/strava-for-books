import { GoogleGenAI } from "@google/genai";
import { Book } from '../types';

let aiInstance: GoogleGenAI | null = null;

/**
 * Safely retrieves the API key from the environment.
 * This function prevents the app from crashing if the `process` object is not defined,
 * which is common in browser environments without a build-step.
 * @returns {string} The API key.
 * @throws {Error} If the API key is not found in the environment.
 */
const getApiKey = (): string => {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    if (!apiKey) {
        console.error("API_KEY is not configured in the environment.");
        throw new Error("API_KEY is not configured in the environment.");
    }
    
    return apiKey;
};


// Lazy initialization of the AI client
const getAiInstance = (): GoogleGenAI => {
    if (!aiInstance) {
        // This will now throw a catchable error if the key is missing,
        // instead of causing a ReferenceError on load.
        const apiKey = getApiKey();
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

export const fetchBookMetadata = async (title: string): Promise<{ author: string; summary: string; coverImage: string; totalPages: number }> => {
  const prompt = `Based on the book title "${title}", provide the author, a spoiler-free summary, a public domain URL for a cover image, and the typical page count. Format the response as a JSON object with keys "author", "summary", "coverImage", and "totalPages". If you cannot determine the author, set it to "Unknown Author".`;
  
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    // Handle cases where the model might wrap the JSON in markdown
    const sanitizedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    const data = JSON.parse(sanitizedJsonText);

    return {
      author: data.author || 'Unknown Author',
      summary: data.summary || 'No summary available.',
      coverImage: data.coverImage || 'https://via.placeholder.com/300x450.png?text=No+Cover',
      totalPages: data.totalPages || 300,
    };
  } catch (error) {
    console.error("Error generating book summary:", error);
    // Provide a user-friendly fallback
    return {
      author: 'Unknown Author',
      summary: `Could not generate a summary for "${title}". Please add one manually.`,
      coverImage: 'https://via.placeholder.com/300x450.png?text=No+Cover',
      totalPages: 300,
    };
  }
};

export const fetchBookMetadataFromCover = async (coverImageBase64: string, mimeType: string): Promise<{ title: string; author: string; summary: string; coverImage: string; totalPages: number }> => {
  const prompt = `Analyze the provided book cover image. Identify the book's title and author. Provide a brief, spoiler-free summary, and the typical page count. Also, find a high-quality public-domain URL for this cover image. Respond ONLY with a JSON object containing 'title', 'author', 'summary', 'coverImage', and 'totalPages'. If any detail cannot be found, use a sensible default (e.g., 'Unknown Author', 'No summary available.', a placeholder image URL).`;

  try {
    const ai = getAiInstance();
    const imagePart = {
      inlineData: {
        data: coverImageBase64,
        mimeType: mimeType,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const jsonText = response.text.trim();
    const sanitizedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    const data = JSON.parse(sanitizedJsonText);

    return {
      title: data.title || 'Unknown Title',
      author: data.author || 'Unknown Author',
      summary: data.summary || 'No summary available.',
      coverImage: data.coverImage || 'https://via.placeholder.com/300x450.png?text=No+Cover',
      totalPages: data.totalPages || 300,
    };

  } catch (error) {
    console.error("Error generating book metadata from cover:", error);
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      summary: `Could not analyze the book cover. Please add details manually.`,
      coverImage: 'https://via.placeholder.com/300x450.png?text=No+Cover',
      totalPages: 300,
    };
  }
};


export const generateChatResponse = async (book: Book, userQuery: string): Promise<string> => {
  const prompt = `
    You are BookWyrm AI, a helpful companion for readers. You are discussing the book "${book.title}" by ${book.author}.
    The user has read up to page ${book.currentPage} of ${book.totalPages}.
    The book's summary is: "${book.summary}".
    
    IMPORTANT: Do NOT reveal any plot points or character developments that occur after page ${book.currentPage}. Your knowledge is strictly limited to the content up to that page. If the user asks about future events, gently decline to answer and remind them it's to avoid spoilers.
    
    User's question: "${userQuery}"
    
    Your response:
  `;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to get a response from BookWyrm AI.");
  }
};

export const generateImagePromptFromText = async (text: string): Promise<string> => {
  const prompt = `
    You are an AI assistant that creates succinct, descriptive prompts for an image generation model.
    Based on the following text from a book, create a single, descriptive sentence that captures the main scene, mood, and key elements.
    The prompt should be suitable for generating a visually compelling illustration.
    Focus on visual details. Do not include character names unless they are universally known.
    For example, instead of "Harry Potter cast a spell", say "A young wizard with a scar on his forehead points a glowing wand, casting a brilliant spell in a dark castle corridor."

    Book Text:
    "${text.substring(0, 1000)}..." 

    Image Generation Prompt:
  `;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // Clean up the response, removing potential quotes or extra text
    return response.text.trim().replace(/"/g, '');
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return "A single open book on a wooden table."; // Fallback prompt
  }
};


export const generateImageForText = async (textPrompt: string): Promise<string> => {
  const fullPrompt = `An atmospheric, digital painting style illustration for a book. The scene is: ${textPrompt}. Cinematic lighting, evocative mood.`;
  
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    } else {
        throw new Error("No image was generated.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image.");
  }
};
