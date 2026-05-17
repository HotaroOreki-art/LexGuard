import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.INTEGER, description: "Total risk score from 0 to 100" },
    category_scores: {
      type: Type.OBJECT,
      properties: {
        "Financial Risk": { type: Type.INTEGER },
        "Privacy Risk": { type: Type.INTEGER },
        "Employment Risk": { type: Type.INTEGER },
        "Legal Ambiguity": { type: Type.INTEGER },
        "Consumer Risk": { type: Type.INTEGER }
      }
    },
    trust_metrics: {
      type: Type.OBJECT,
      properties: {
        Transparency: { type: Type.INTEGER },
        "User Fairness": { type: Type.INTEGER },
        "Employer Dominance": { type: Type.INTEGER }
      }
    },
    industry_aggression_score: { type: Type.STRING, description: "A statement comparing this to industry standard" },
    final_verdict: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        top_dangers: { type: Type.ARRAY, items: { type: Type.STRING } },
        power_imbalance: { type: Type.STRING }
      }
    },
    clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause_type: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          risk_score: { type: Type.INTEGER, description: "Risk score from 0-100" },
          flagged_text: { type: Type.STRING, description: "Exact clause text" },
          plain_english: { type: Type.STRING, description: "Translate legal jargon into normal human language" },
          why_risky: { type: Type.STRING, description: "Explain legal/financial danger" },
          worst_case: { type: Type.STRING, description: "Explain real-world consequences" },
          shark_view: { type: Type.STRING, description: "Corporate defense" },
          advocate_view: { type: Type.STRING, description: "User defense" },
          judge_verdict: { type: Type.STRING, description: "Neutral conclusion" },
          negotiation_suggestion: { type: Type.STRING, description: "Safer alternatives" },
          rewritten_clause: { type: Type.STRING, description: "Rewrite into a fairer, user-safe, balanced version" }
        },
        required: ["clause_type", "severity", "risk_score", "flagged_text", "plain_english", "why_risky", "worst_case", "shark_view", "advocate_view", "judge_verdict", "negotiation_suggestion", "rewritten_clause"]
      }
    }
  },
  required: ["overall_score", "category_scores", "trust_metrics", "industry_aggression_score", "final_verdict", "clauses"]
};

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "This is a test contract where I agree to give away my soul.",
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    console.log("SUCCESS:", response.text);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}

test();
