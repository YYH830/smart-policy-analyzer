import { GoogleGenAI, Type } from "@google/genai";
import { PolicyAnalysis } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePolicyByName = async (policyName: string, lang: 'zh' | 'en'): Promise<PolicyAnalysis> => {
  const ai = createClient();

  const langInstruction = lang === 'zh' 
    ? "Output all JSON values in Simplified Chinese." 
    : "Output all JSON values in English.";

  const prompt = `
    You are a specialized Policy Analyst for Product Managers and System Architects.
    
    1. **Search Phase**: 
       - First, search specifically on site:www.gov.cn for the *latest* official text of "${policyName}".
       - Also search for the *history* of this policy (previous versions, amendments, effective dates).
    
    2. **Analysis Phase**:
       - **History**: Identify the timeline of this policy (Draft date, Enactment date, Amendment dates).
       - **Core Points**: Summarize the *latest* version's key objectives.
       - **Detailed Articles**: Extract the key articles/clauses. 
       - **PM/System Design Impact (CRITICAL)**: For *each* article, analyze if it requires a change in a software system (e.g., "Requires data retention for 6 months", "Requires user consent checkbox", "Requires admin audit logs"). If it does, mark it as 'high' or 'medium' priority and explain the specific system design requirement.

    3. **Output Phase**:
       - Return a strict JSON object.
       - ${langInstruction}

    Ensure the specific article numbers (e.g., "Article 12") are accurate to the real text.
  `;

  // Schema definition for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The full official title of the policy" },
      tone_and_intent: { type: Type.STRING, description: "Brief analysis of the strictness and goal" },
      
      // 1. History
      history: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Date of version/event (YYYY-MM-DD)" },
            version_name: { type: Type.STRING, description: "e.g., '2015 Initial Version' or '2023 Amendment'" },
            change_summary: { type: Type.STRING, description: "Brief summary of what changed or happened" }
          }
        }
      },

      // 2. Core Points
      summary_tldr: { type: Type.STRING, description: "Executive summary of the latest version" },
      core_concepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          }
        }
      },

      // 3. Articles & PM Design Highlights
      articles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.STRING, description: "Chapter title if available (optional)" },
            article_number: { type: Type.STRING, description: "e.g., 'Article 4'" },
            content: { type: Type.STRING, description: "Summary or full text of the article content" },
            system_design_implication: { type: Type.STRING, description: "Specific instruction for Product Managers on how to design the system to comply. Null if no tech impact." },
            design_priority: { type: Type.STRING, enum: ["high", "medium", "low", "none"], description: "How critical is this for system compliance?" }
          }
        }
      },

      // Extras
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          }
        }
      },
    },
    required: ["title", "history", "summary_tldr", "core_concepts", "articles", "flashcards"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 } // Increased budget for detailed article analysis
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as PolicyAnalysis;
      
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