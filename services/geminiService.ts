import { GoogleGenAI, Type } from "@google/genai";
import { PolicyAnalysis } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeUploadedPolicy = async (
  fileBase64: string, 
  mimeType: string, 
  lang: 'zh' | 'en'
): Promise<PolicyAnalysis> => {
  const ai = createClient();

  const langInstruction = lang === 'zh' 
    ? "Output all JSON values in Simplified Chinese." 
    : "Output all JSON values in English.";

  const prompt = `
    You are a specialized Policy Analyst for Product Managers and System Architects.
    
    1. **Input Analysis**: 
       - Analyze the **attached document** thoroughly. This is the source of truth.
       - Extract the official title, version history (if mentioned in the text), and all articles.
    
    2. **Analysis Phase**:
       - **History**: Identify the timeline if the document describes its revision history (e.g., "Amended in 2021"). If not mentioned, state "Based on uploaded document".
       - **Core Points**: Summarize the document's key objectives.
       - **Detailed Articles**: Extract the key articles/clauses. 
       - **PM/System Design Impact (CRITICAL)**: For *each* article, analyze if it requires a change in a software system (e.g., "Requires data retention for 6 months", "Requires user consent checkbox", "Requires admin audit logs"). If it does, mark it as 'high' or 'medium' priority and explain the specific system design requirement.

    3. **Output Phase**:
       - Return a strict JSON object.
       - ${langInstruction}

    Ensure the specific article numbers (e.g., "Article 12") are accurate to the real text provided.
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
            date: { type: Type.STRING, description: "Date of version/event (YYYY-MM-DD) or 'Unknown'" },
            version_name: { type: Type.STRING, description: "e.g., 'Current Version' or '2023 Amendment'" },
            change_summary: { type: Type.STRING, description: "Brief summary of what changed or happened" }
          }
        }
      },

      // 2. Core Points
      summary_tldr: { type: Type.STRING, description: "Executive summary of the document" },
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
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: fileBase64
                }
            },
            { text: prompt }
        ]
      },
      config: {
        // tools: [], // Google Search removed
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as PolicyAnalysis;
      return data;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};