import { GoogleGenAI, Type } from "@google/genai";
import { PolicyAnalysis } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePolicyByName = async (policyName: string): Promise<PolicyAnalysis> => {
  const ai = createClient();

  const prompt = `
    You are a policy expert. 
    1. Search for the official full text and detailed interpretation of the policy/regulation named: "${policyName}".
    2. Analyze the content found to simplify it for a general audience.
    3. Return the result as a strict JSON object adhering to the schema.

    Ensure the summary and explanations are based on the actual latest version of the policy found via search.
  `;

  // Schema definition for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The full official title of the policy found" },
      summary_tldr: { type: Type.STRING, description: "A 2-3 sentence executive summary" },
      eli5_explanation: { type: Type.STRING, description: "A simplified explanation using analogies, as if explaining to a 12-year-old" },
      core_concepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING, description: "Simple definition of the term" }
          }
        }
      },
      action_items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            who: { type: Type.STRING, description: "Who is responsible or affected" },
            what: { type: Type.STRING, description: "What they must do or avoid" },
            deadline: { type: Type.STRING, description: "Timeframe if mentioned, otherwise 'Ongoing'" }
          }
        }
      },
      mnemonic_device: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING, description: "An acronym or rhyme to remember the main points" },
          explanation: { type: Type.STRING, description: "How to use this mnemonic" }
        }
      },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "A specific question about the policy" },
            answer: { type: Type.STRING, description: "The direct answer" }
          }
        }
      },
      tone_and_intent: { type: Type.STRING, description: "Brief analysis of the strictness and goal of the policy" }
    },
    required: ["title", "summary_tldr", "eli5_explanation", "core_concepts", "mnemonic_device", "flashcards"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Google Search grounding
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as PolicyAnalysis;
      
      // Extract grounding sources
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => {
          if (chunk.web) {
            return { title: chunk.web.title, uri: chunk.web.uri };
          }
          return null;
        })
        .filter((source: any) => source !== null) as { title: string; uri: string }[];

      if (sources && sources.length > 0) {
        data.sources = sources;
      }

      return data;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};