import crypto from 'crypto'

// --- Same-day helpers -------------------------------------------------

export const getTodayRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { start, end }
}

export const normalizeDigits = (value: unknown) => String(value ?? '').replace(/\D/g, '')

export const maskPhone = (phone: string) => phone.length >= 4 ? `***-***-${phone.slice(-4)}` : '****'

// --- Verification state (persisted on the Appointment row) -------------
//
// State is stored on the Appointment record itself (not in-memory) so it
// survives across separate Next.js route handler bundles/processes and
// server restarts.

export const VERIFICATION_TTL_MS = 5 * 60 * 1000
export const CHECKIN_GRANT_TTL_MS = 3 * 60 * 1000
export const MAX_VERIFICATION_ATTEMPTS = 5

export const generateVerificationCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')

// --- Verification code delivery ----------------------------------------
//
// Development tests use a loopback-only delivery stub. Never log codes or
// pretend that an unconfigured/failed delivery was successful.

export class KioskDeliveryError extends Error {
  constructor() {
    super('驗證簡訊暫時無法傳送，請稍後再試或洽櫃檯協助。')
    this.name = 'KioskDeliveryError'
  }
}

export const sendVerificationCode = async (phone: string, code: string) => {
  const endpoint = process.env.SMS_PROVIDER_WEBHOOK_URL
  if (!endpoint) throw new KioskDeliveryError()
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, code }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) throw new KioskDeliveryError()
  } catch {
    throw new KioskDeliveryError()
  }
}
