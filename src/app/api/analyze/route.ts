import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { parseDocument } from '@/lib/document-parser';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const maxDuration = 60; // Allow 60 seconds on Vercel


export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let contractText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      contractText = await parseDocument(buffer, file.type);
    } else {
      const body = await req.json();
      contractText = body.contractText;
    }

    if (!contractText || contractText.trim() === "") {
      return NextResponse.json({ error: 'Contract text is required or empty' }, { status: 400 });
    }

    const systemInstruction = `
      You are LEXGUARD, an advanced adversarial AI contract defense system.
      Your goal is to detect exploitative clauses, hidden liabilities, legal ambiguities, and real-world risks before users sign agreements.
      Analyze the actual contract text provided and segment it clause-by-clause. For EACH flagged or important clause, act simultaneously as three personas:
      1. Shark Agent: An aggressive corporate lawyer justifying the terms.
      2. Advocate Agent: A user protection lawyer detecting unfairness.
      3. Judge Agent: A neutral evaluator.
      
      Translate jargon into plain English. 
      IMPORTANT FOR INDIA: Frame risks regarding fairness carefully (e.g. "May conflict with fair consumer protection principles"). DO NOT claim outright illegality under Indian law unless undeniable.
      
      CRITICAL SCORING LOGIC:
      - You must calculate the REAL scores based ONLY on the provided contract text.
      - "overall_score" MUST be a logical reflection of the "category_scores" (e.g., the highest category score or a weighted average). Never output a high overall score if all categories are low.
      - If the contract is standard and safe, the scores MUST be low. Do not invent risks.
      - The JSON structure below is STRICTLY for schema reference. DO NOT copy the dummy numbers into your response.
      
      You MUST output a valid JSON object matching this exact structure:
      {
        "overall_score": <Calculated Integer 0-100>,
        "category_scores": { "Financial Risk": <0-100>, "Privacy Risk": <0-100>, "Employment Risk": <0-100>, "Legal Ambiguity": <0-100>, "Consumer Risk": <0-100> },
        "trust_metrics": { "Transparency": <0-100>, "User Fairness": <0-100>, "Employer Dominance": <0-100> },
        "industry_aggression_score": "<String>",
        "final_verdict": {
          "summary": "<String>",
          "top_dangers": ["<String>", "<String>"],
          "power_imbalance": "<String>"
        },
        "clauses": [
          {
            "clause_type": "<Type>",
            "severity": "Low | Medium | High | Critical",
            "risk_score": <0-100>,
            "flagged_text": "<Exact text>",
            "plain_english": "<String>",
            "why_risky": "<String>",
            "worst_case": "<String>",
            "shark_view": "<String>",
            "advocate_view": "<String>",
            "judge_verdict": "<String>",
            "negotiation_suggestion": "<String>",
            "rewritten_clause": "<String>"
          }
        ]
      }
      Do NOT wrap your response in markdown code blocks. Output ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contractText,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from AI");
    }

    const analysisResult = JSON.parse(resultText);

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error('Error analyzing contract:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze contract' }, { status: 500 });
  }
}
