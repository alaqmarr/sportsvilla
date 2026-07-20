import { NextResponse } from 'next/server';
import { authenticateClient } from '@/lib/auth-middleware';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/upload/validate-utr called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  try {
    const { imageUrl, expectedAmount, expectedUpiId, tournamentId } = await request.json();
    if (!imageUrl) {
      return jsonResponse({ error: 'Image URL is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found. Please add it to your .env file.");
      return jsonResponse({ error: 'Server missing Gemini API Key for validation' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Fetch image and convert to base64
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Failed to fetch image for validation");
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

    const prompt = `You are a strict UPI payment screenshot validator. 
Analyze the provided image. Respond with JSON EXACTLY matching this format: 
{ "genuine": boolean, "utr": "string", "amount": "string", "note": "string", "reason": "string" }

Context:
- Expected Amount: ₹${expectedAmount || 'Any'}
- Expected Payee/UPI ID: ${expectedUpiId || 'Any'}
- Current System Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Rules:
1. If the image is not a payment screenshot, or looks manipulated/forged, set "genuine" to false and explain why in "reason". (Do not flag as forgery purely based on the date being recent/today).
2. If "Expected Amount" is provided (and is not "Any"), verify the amount paid in the screenshot matches EXACTLY. If not, set "genuine" to false and state the mismatch in "reason".
3. If "Expected Payee/UPI ID" is provided (and is not "Any"), verify the payment was sent to that payee or UPI ID. If not, set "genuine" to false and state the mismatch in "reason".
4. If it is a valid UPI screenshot AND matches all expected details, set "genuine" to true.
5. Extract the 12-digit UTR/Transaction ID into "utr" (or empty string if not found).
6. Extract the payment amount into "amount" (e.g., "500").
7. Extract the payment note/message into "note" (or empty string if not found).
8. Return ONLY valid JSON, without any markdown formatting or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }
      ]
    });

    let resultText = response.text || '';
    
    // Clean up if Gemini accidentally returns markdown backticks
    resultText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let resultJson;
    try {
      resultJson = JSON.parse(resultText);
    } catch (e) {
    console.error(`[API ERROR] POST /api/client/v1/upload/validate-utr ->`, e);
      console.error("Failed to parse Gemini output:", resultText);
      return jsonResponse({ error: 'Failed to process AI response' }, { status: 500 });
    }

    // Database Duplicate Check
    if (resultJson.genuine && resultJson.utr && tournamentId) {
      const existing = await prisma.tournamentRegistration.findFirst({
        where: {
          tournamentId,
          paymentUtr: String(resultJson.utr),
          status: { not: 'REJECTED' }
        }
      });
      
      if (existing) {
        resultJson.genuine = false;
        resultJson.reason = "This payment has already been used for a registration in this tournament. Duplicate payments are not allowed.";
      }
    }

    return jsonResponse({ 
      success: true, 
      genuine: resultJson.genuine, 
      utr: resultJson.utr || null,
      amount: resultJson.amount || null,
      note: resultJson.note || null,
      reason: resultJson.reason || null 
    });

  } catch (error: any) {
    console.error('Gemini validation error:', error);
    return jsonResponse({ error: 'Internal server error' }, { status: 500 });
  }
}
