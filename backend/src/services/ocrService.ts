/**
 * OCR Service — extracts payment data from Egyptian payment screenshots
 * using Google Gemini Flash via fal.ai (vision-capable, cheap).
 */

import { fal } from '@fal-ai/client';
import type { OcrResult } from '../utils/paymentVerifier.js';

const LLM_MODEL = process.env.FAL_LLM_MODEL || 'google/gemini-flash-1.5';

const OCR_PROMPT = `This is an Egyptian mobile payment screenshot (InstaPay or Vodafone Cash).
Extract the following payment information:
- transaction_id: The unique transaction/reference number (string, e.g. "TXN123456")
- amount_egp: The transferred amount in Egyptian Pounds (number only, no currency symbol)
- receiver_phone: The recipient's phone number (include country code if present)
- date_time: The transaction date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)

Return ONLY valid JSON. No markdown, no explanation. If a field cannot be found, use null.
Example: {"transaction_id": "123456", "amount_egp": 39, "receiver_phone": "01012345678", "date_time": "2024-01-15T14:30:00"}`;

/**
 * Analyzes a payment screenshot and extracts transaction data.
 * @param imageUrl - Public URL or base64 data URL of the screenshot
 */
export async function extractPaymentData(imageUrl: string): Promise<OcrResult> {
  try {
    const result: any = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: LLM_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: OCR_PROMPT },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      },
    });

    const content = result?.output;
    if (!content) {
      return { transaction_id: null, amount_egp: null, receiver_phone: null, date_time: null };
    }

    // Strip markdown code blocks if LLM wraps response
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as Partial<OcrResult>;

    return {
      transaction_id: parsed.transaction_id ?? null,
      amount_egp: typeof parsed.amount_egp === 'number' ? parsed.amount_egp : null,
      receiver_phone: parsed.receiver_phone ?? null,
      date_time: parsed.date_time ?? null,
    };
  } catch (err) {
    console.error('[ocrService] OCR extraction failed:', err);
    return { transaction_id: null, amount_egp: null, receiver_phone: null, date_time: null };
  }
}
