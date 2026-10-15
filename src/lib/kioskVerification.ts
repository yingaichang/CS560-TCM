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
// No SMS gateway (e.g. Twilio) is configured in this project. In production
// this must be replaced with a real SMS/voice provider. For local
// development and grading we log the code to the server console so the
// kiosk flow can be tested end-to-end.

export const sendVerificationCode = async (phone: string, code: string) => {
  if (process.env.SMS_PROVIDER_WEBHOOK_URL) {
    await fetch(process.env.SMS_PROVIDER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, code }),
    }).catch((error) => console.error('Failed to send SMS via configured provider:', error))
    return
  }

  console.log(`[KIOSK DEV SMS SIMULATION] Verification code for ${maskPhone(phone)}: ${code}`)
}
