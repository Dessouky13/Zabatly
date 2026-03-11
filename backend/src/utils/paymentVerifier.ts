/**
 * Payment verification logic for Egyptian payment methods.
 * Implements fraud prevention rules described in the PRD.
 */

import pool from '../db/pool.js';

export interface OcrResult {
  transaction_id: string | null;
  amount_egp: number | null;
  receiver_phone: string | null;
  date_time: string | null; // ISO format
}

export interface VerificationResult {
  valid: boolean;
  status: 'verified' | 'rejected' | 'manual_review';
  reason?: string;
  details?: Record<string, unknown>;
}

// Expected plan prices
const PLAN_PRICES: Record<string, number> = {
  basic:   Number(process.env.PLAN_PRICE_BASIC) || 39,
  premium: Number(process.env.PLAN_PRICE_PREMIUM) || 79,
};

// Amount tolerance for rounding differences (±1 EGP)
const AMOUNT_TOLERANCE = 1;

// Maximum age of payment in hours
const MAX_PAYMENT_AGE_HOURS = 48;

/**
 * Verifies extracted OCR data against expected payment parameters.
 *
 * Rules:
 * 1. No duplicate transaction ID in DB
 * 2. Amount matches plan price (±1 EGP tolerance)
 * 3. Receiver phone matches configured phone number
 * 4. Timestamp within last 48 hours
 * 5. If any field is null → flag for manual review
 */
export async function verifyPayment(
  ocr: OcrResult,
  plan: string,
  method: 'instapay' | 'vodafone_cash'
): Promise<VerificationResult> {
  // Rule 5: If OCR couldn't extract required fields → manual review
  if (ocr.transaction_id === null || ocr.amount_egp === null ||
      ocr.receiver_phone === null || ocr.date_time === null) {
    return {
      valid: false,
      status: 'manual_review',
      reason: 'OCR could not extract all required fields from the screenshot. A human will review this.',
      details: { ocr_result: ocr },
    };
  }

  // Rule 1: Check for duplicate transaction ID
  const { rows } = await pool.query(
    'SELECT id, status FROM payments WHERE transaction_id = $1 LIMIT 1',
    [ocr.transaction_id]
  );

  if (rows.length > 0) {
    return {
      valid: false,
      status: 'rejected',
      reason: 'This transaction ID has already been used.',
      details: { transaction_id: ocr.transaction_id },
    };
  }

  // Rule 2: Amount verification
  const expectedAmount = PLAN_PRICES[plan];
  if (!expectedAmount) {
    return {
      valid: false,
      status: 'rejected',
      reason: `Unknown plan: ${plan}`,
    };
  }

  const amountDiff = Math.abs(ocr.amount_egp - expectedAmount);
  if (amountDiff > AMOUNT_TOLERANCE) {
    return {
      valid: false,
      status: 'rejected',
      reason: `Amount mismatch. Expected ${expectedAmount} EGP, found ${ocr.amount_egp} EGP.`,
      details: { expected: expectedAmount, received: ocr.amount_egp, tolerance: AMOUNT_TOLERANCE },
    };
  }

  // Rule 3: Receiver phone verification
  const expectedPhone = method === 'instapay'
    ? process.env.INSTAPAY_PHONE
    : process.env.VODAFONE_CASH_PHONE;

  if (!expectedPhone) {
    // Config missing — flag for manual review
    return {
      valid: false,
      status: 'manual_review',
      reason: 'Payment phone number not configured. Manual review required.',
    };
  }

  // Normalize phone numbers (remove +20 prefix, spaces, dashes)
  const normalizePhone = (p: string) => p.replace(/[\s\-\+]/g, '').replace(/^20/, '0');
  const receivedPhone = normalizePhone(ocr.receiver_phone);
  const configPhone = normalizePhone(expectedPhone);

  if (receivedPhone !== configPhone) {
    return {
      valid: false,
      status: 'rejected',
      reason: 'Payment was sent to incorrect phone number.',
      details: { expected_phone: configPhone.slice(-4).padStart(configPhone.length, '*') },
    };
  }

  // Rule 4: Timestamp validation
  try {
    const paymentDate = new Date(ocr.date_time);
    const now = new Date();
    const ageHours = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);

    if (isNaN(paymentDate.getTime())) {
      return {
        valid: false,
        status: 'manual_review',
        reason: 'Could not parse payment date. Manual review required.',
      };
    }

    if (ageHours > MAX_PAYMENT_AGE_HOURS) {
      return {
        valid: false,
        status: 'rejected',
        reason: `Payment screenshot is too old (${Math.floor(ageHours)} hours). Screenshots must be within 48 hours.`,
        details: { payment_date: ocr.date_time, max_age_hours: MAX_PAYMENT_AGE_HOURS },
      };
    }

    // Future date (more than 1 hour ahead) — likely tampered
    if (ageHours < -1) {
      return {
        valid: false,
        status: 'rejected',
        reason: 'Payment timestamp is in the future. This screenshot may be fraudulent.',
      };
    }
  } catch {
    return {
      valid: false,
      status: 'manual_review',
      reason: 'Error validating payment timestamp.',
    };
  }

  // All checks passed ✓
  return { valid: true, status: 'verified' };
}
