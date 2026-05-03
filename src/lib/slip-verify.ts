// ────────────────────────────────────────────────────────────
// slip-verify.ts
// ตรวจสลิปอัตโนมัติ — EasySlip API (primary) + Claude Vision (fallback)
// ────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk'

// ── Types ─────────────────────────────────────────────────────

export interface SlipVerifyResult {
  success:         boolean
  method:          'easyslip' | 'claude_vision' | 'failed'
  transactionRef:  string | null   // unique ref ป้องกันซ้ำ
  amount:          number | null   // ยอดเงินที่โอน
  transferredAt:   string | null   // ISO datetime
  senderName:      string | null
  receiverName:    string | null
  receiverProxy:   string | null   // เบอร์ PromptPay ปลายทาง
  rawResponse:     unknown
  errorMessage:    string | null
}

// ── Config ────────────────────────────────────────────────────

const EASYSLIP_API_URL = 'https://developer.easyslip.com/api/v1/verify'
const OUR_PROMPTPAY    = process.env.KRABBIE_PROMPTPAY_NUMBER ?? ''  // เบอร์ PromptPay ของ Krabbie


// ── PRIMARY: EasySlip API ─────────────────────────────────────
// docs: https://developer.easyslip.com

async function verifyWithEasySlip(imageBase64: string): Promise<SlipVerifyResult> {
  const apiKey = process.env.EASYSLIP_API_KEY
  if (!apiKey) throw new Error('EASYSLIP_API_KEY not set')

  const res = await fetch(EASYSLIP_API_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ data: imageBase64 }),
  })

  const json = await res.json()

  if (!res.ok || !json.status || json.status !== 200) {
    return {
      success: false, method: 'easyslip',
      transactionRef: null, amount: null, transferredAt: null,
      senderName: null, receiverName: null, receiverProxy: null,
      rawResponse: json,
      errorMessage: json.message ?? `EasySlip error ${res.status}`,
    }
  }

  const d = json.data
  return {
    success:        true,
    method:         'easyslip',
    transactionRef: d.transRef ?? null,
    amount:         d.amount?.amount ?? null,
    transferredAt:  d.date ?? null,
    senderName:     d.sender?.account?.name?.th ?? d.sender?.account?.name?.en ?? null,
    receiverName:   d.receiver?.account?.name?.th ?? d.receiver?.account?.name?.en ?? null,
    receiverProxy:  d.receiver?.account?.proxy?.value ?? null,
    rawResponse:    json,
    errorMessage:   null,
  }
}


// ── FALLBACK: Claude Vision ───────────────────────────────────
// อ่านสลิปด้วย AI — ไม่ verify กับ bank จริง แต่อ่านได้แม่นยำ

async function verifyWithClaudeVision(imageBase64: string, mimeType: string): Promise<SlipVerifyResult> {
  const client = new Anthropic()

  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        {
          type:   'image',
          source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageBase64 },
        },
        {
          type: 'text',
          text: `นี่คือสลิปการโอนเงินไทย กรุณาอ่านและตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น:
{
  "amount": <ยอดเงิน เป็นตัวเลข เช่น 150.00>,
  "transferredAt": <วันเวลาโอน ISO format เช่น "2026-05-03T14:30:00+07:00">,
  "transactionRef": <เลขอ้างอิง/เลขที่รายการ ถ้ามี>,
  "senderName": <ชื่อผู้โอน>,
  "receiverName": <ชื่อผู้รับ>,
  "receiverProxy": <เบอร์โทร/เลขบัญชีปลายทาง ถ้าเป็น PromptPay>,
  "bankName": <ชื่อธนาคาร>
}
ถ้าอ่านไม่ออกให้ใส่ null`,
        },
      ],
    }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from Claude response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      success: false, method: 'claude_vision',
      transactionRef: null, amount: null, transferredAt: null,
      senderName: null, receiverName: null, receiverProxy: null,
      rawResponse: rawText,
      errorMessage: 'อ่านสลิปไม่สำเร็จ',
    }
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    success:        parsed.amount != null,
    method:         'claude_vision',
    transactionRef: parsed.transactionRef ?? null,
    amount:         parsed.amount ? parseFloat(String(parsed.amount)) : null,
    transferredAt:  parsed.transferredAt ?? null,
    senderName:     parsed.senderName ?? null,
    receiverName:   parsed.receiverName ?? null,
    receiverProxy:  parsed.receiverProxy ?? null,
    rawResponse:    parsed,
    errorMessage:   parsed.amount == null ? 'อ่านยอดเงินไม่ได้' : null,
  }
}


// ── MAIN: verifySlip ──────────────────────────────────────────
// เรียกฟังก์ชันนี้จาก API route
// imageBase64: base64 string ของรูปสลิป (ไม่มี data: prefix)
// mimeType: 'image/jpeg' | 'image/png' | 'image/webp'

export async function verifySlip(
  imageBase64: string,
  mimeType    = 'image/jpeg'
): Promise<SlipVerifyResult> {
  // ลอง EasySlip ก่อน
  if (process.env.EASYSLIP_API_KEY) {
    try {
      const result = await verifyWithEasySlip(imageBase64)
      if (result.success) return result
      // EasySlip ตอบมาแต่ verify ไม่ผ่าน → ไม่ต้อง fallback
      if (result.errorMessage && !result.errorMessage.includes('network')) return result
    } catch (e) {
      console.error('[verifySlip] EasySlip failed, falling back to Claude Vision:', e)
    }
  }

  // Fallback: Claude Vision
  try {
    return await verifyWithClaudeVision(imageBase64, mimeType)
  } catch (e) {
    return {
      success: false, method: 'failed',
      transactionRef: null, amount: null, transferredAt: null,
      senderName: null, receiverName: null, receiverProxy: null,
      rawResponse: null,
      errorMessage: e instanceof Error ? e.message : 'ระบบตรวจสลิปขัดข้อง',
    }
  }
}


// ── BUSINESS LOGIC: validatePayment ──────────────────────────
// ตรวจว่าสลิปที่ verify มาแล้ว ถูกต้องสำหรับ payment นี้หรือเปล่า

export interface PaymentValidation {
  valid:   boolean
  reason?: string
}

export function validatePayment(
  result:          SlipVerifyResult,
  expectedAmount:  number,
  toleranceTHB   = 0  // อนุญาต tolerance เท่าไหร่ (default 0 = ต้องตรงพอดี)
): PaymentValidation {
  if (!result.success || result.amount == null) {
    return { valid: false, reason: result.errorMessage ?? 'ตรวจสลิปไม่สำเร็จ' }
  }

  // ตรวจยอดเงิน
  if (Math.abs(result.amount - expectedAmount) > toleranceTHB) {
    return {
      valid:  false,
      reason: `ยอดเงินไม่ตรง: ได้รับ ${result.amount} ฿ แต่ต้องการ ${expectedAmount} ฿`,
    }
  }

  // ตรวจ PromptPay ปลายทาง (ถ้า config ไว้)
  if (OUR_PROMPTPAY && result.receiverProxy) {
    const normalized = result.receiverProxy.replace(/[-\s]/g, '')
    if (!normalized.includes(OUR_PROMPTPAY.replace(/[-\s]/g, ''))) {
      return {
        valid:  false,
        reason: `PromptPay ปลายทางไม่ตรง: ${result.receiverProxy}`,
      }
    }
  }

  return { valid: true }
}
