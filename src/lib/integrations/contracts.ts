import { z } from 'zod'

const code = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/)
const deviceId = z.string().regex(/^dev_[a-zA-Z0-9_-]{1,40}$/)
const base = { version: z.literal(1), eventId: z.uuid(), occurredAt: z.iso.datetime() }
export const adapterServices = ['scanner', 'sms', 'voice', 'learning', 'storage', 'measurements'] as const
export type AdapterService = typeof adapterServices[number]

export const adapterSchemas = {
  scanner: z.object({ ...base, kind: z.literal('scanner.read'), data: z.object({ deviceId, scanType: z.enum(['license_token', 'membership_token']), token: z.uuid() }).strict() }).strict(),
  sms: z.object({ ...base, kind: z.literal('sms.delivery'), data: z.object({ messageId: code, status: z.enum(['delivered', 'failed', 'unknown']), attempt: z.number().int().min(1).max(10) }).strict() }).strict(),
  voice: z.object({ ...base, kind: z.literal('voice.result'), data: z.object({ interviewId: z.uuid(), consentReference: z.uuid(), mode: z.enum(['text', 'audio']), transcript: z.string().trim().min(1).max(4000), reviewRequired: z.literal(true) }).strict() }).strict(),
  learning: z.object({ ...base, kind: z.literal('course.completed'), data: z.object({ registrationId: z.string().cuid(), subjectReference: z.uuid(), courseId: code, completedAt: z.iso.datetime(), creditUnits: z.number().finite().min(0).max(100) }).strict() }).strict(),
  storage: z.object({ ...base, kind: z.literal('document.stored'), data: z.object({ documentReference: z.uuid(), objectReference: z.uuid(), sha256: z.string().regex(/^[a-f0-9]{64}$/), contentType: z.enum(['application/pdf', 'image/png', 'image/jpeg']), bytes: z.number().int().min(1).max(10_000_000) }).strict() }).strict(),
  measurements: z.object({ ...base, kind: z.literal('measurement.recorded'), data: z.object({ deviceId, subjectReference: z.uuid(), reading: z.discriminatedUnion('metric', [
    z.object({ metric: z.literal('blood_pressure'), systolic: z.number().finite().positive(), diastolic: z.number().finite().positive(), unit: z.literal('mmHg') }).strict(),
    z.object({ metric: z.literal('blood_glucose'), value: z.number().finite().positive(), unit: z.enum(['mg/dL', 'mmol/L']) }).strict(),
    z.object({ metric: z.literal('weight'), value: z.number().finite().positive(), unit: z.literal('kg') }).strict(),
    z.object({ metric: z.literal('sleep'), durationMinutes: z.number().int().min(0).max(1440) }).strict(),
  ]) }).strict() }).strict(),
}

export const smsRequestSchema = z.object({ to: z.string().regex(/^\+?[0-9]{10,15}$/), code: z.string().regex(/^[0-9]{6}$/) }).strict()
export const smsAcceptanceSchema = z.object({ messageId: code, status: z.enum(['accepted', 'rejected']) }).strict()
export const mailRequestSchema = z.object({ from: z.email(), to: z.array(z.email()).min(1).max(10), replyTo: z.email().optional(), subject: z.string().min(1).max(200), text: z.string().max(6000) }).strict()
export const audioMetadataSchema = z.object({ contentType: z.enum(['audio/webm', 'audio/ogg']), bytes: z.number().int().min(1).max(10_000_000), durationSeconds: z.number().finite().positive().max(120), sampleRateHz: z.number().int().min(8000).max(96000), sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict()
export const voiceRequestSchema = z.object({ version: z.literal(1), requestId: z.uuid(), interviewId: z.uuid(), consentReference: z.uuid(), locale: z.enum(['zh-TW', 'en-US']), purpose: z.literal('patient_reported_intake'), input: z.discriminatedUnion('mode', [z.object({ mode: z.literal('text'), text: z.string().trim().min(1).max(4000) }).strict(), z.object({ mode: z.literal('audio'), objectReference: z.uuid(), metadata: audioMetadataSchema }).strict()]), requireProviderReview: z.literal(true) }).strict()
export const learningGrantRequestSchema = z.object({ version: z.literal(1), requestId: z.uuid(), registrationId: z.string().cuid(), subjectReference: z.uuid(), courseId: code, entitlement: z.literal('course_access') }).strict()
export const storageUploadRequestSchema = z.object({ version: z.literal(1), requestId: z.uuid(), documentReference: z.uuid(), subjectReference: z.uuid(), contentType: z.enum(['application/pdf', 'image/png', 'image/jpeg']), bytes: z.number().int().min(1).max(10_000_000), sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict()
export const stripeEventSchema = z.object({ id: code, type: z.enum(['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired']), data: z.object({ object: z.object({ id: code, mode: z.literal('payment'), currency: z.literal('twd'), amount_total: z.number().int().nonnegative(), payment_status: z.enum(['paid', 'unpaid', 'no_payment_required']), metadata: z.object({ topicId: code }).strict() }).strict() }).strict() }).strict()
export const clerkEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['session.created', 'session.ended']), data: z.object({ id: code, user_id: code }).strict() }).strict(),
  z.object({ type: z.enum(['user.created', 'user.updated', 'user.deleted']), data: z.object({ id: code }).strict() }).strict(),
])

export function parseAdapterEvent(service: AdapterService, input: unknown) {
  return adapterSchemas[service].parse(input)
}

export type IntegrationContract = { id: string; name: string; sends: string; receives: string; endpoint: string; readiness: 'Receipt Only' | 'Existing Adapter' | 'Planned'; limitation: string }
export const integrationContracts: IntegrationContract[] = [
  { id: 'scanner', name: '駕照／會員卡掃描器', sends: 'scanner.read v1：deviceId、scanType、一次性 opaque token；不接受駕照原文、SSN 或卡號。', receives: '202 receiptId、accepted=true、applied=false、Planned；不提供身分驗證或報到授權。', endpoint: '/api/integrations/scanner', readiness: 'Receipt Only', limitation: '設備、token 簽發與本人對應尚未配置。' },
  { id: 'sms', name: '簡訊供應商', sends: '應用送出 to、6 位 code；供應商回傳 messageId、accepted/rejected；投遞回呼為 sms.delivery v1。', receives: '原有 HTTP 接受不等於送達；新回呼僅回傳 receiptId，尚不更新預約。', endpoint: '/api/integrations/sms', readiness: 'Receipt Only', limitation: '需要供應商、訊息 ID 對應及真實投遞驗證。' },
  { id: 'smtp', name: 'SMTP 郵件服務', sends: 'from、to、replyTo（選填）、subject、text，透過 SMTP/TLS；認證只由私有環境設定提供。', receives: 'accepted/rejected 收件者及錯誤代碼；部分接受或逾時視為 unknown，服務接受不等於收件匣送達。', endpoint: 'src/lib/contactDelivery.ts / src/lib/appointmentMail.ts', readiness: 'Existing Adapter', limitation: '仍須有效 SMTP 設定及實際投遞證據。' },
  { id: 'stripe', name: 'Stripe Checkout／付款事件', sends: 'Checkout mode、TWD 最小單位金額、topicId、回跳網址及冪等鍵。', receives: 'session id/url；原始事件 body 與 Stripe-Signature；核對既有工作階段、課程、金額與幣別。', endpoint: '/api/payment/checkout-session → /api/webhooks/stripe', readiness: 'Existing Adapter', limitation: '仍須有效金鑰、簽章設定、公開事件投遞；模擬不代表付款。' },
  { id: 'clerk', name: 'Clerk 登入／帳號事件', sends: '瀏覽器使用 Clerk SDK；伺服器發送帶認證的唯讀 API；不經測試中心輸入密碼。', receives: 'session.created/ended 或 user.created/updated/deleted；原始 body 及 Svix 簽章標頭。', endpoint: '/api/webhooks/clerk', readiness: 'Existing Adapter', limitation: '事件格式不等於真實登入；帳號角色同步與復原仍需規格。' },
  { id: 'voice', name: '麥克風／AI 語音與文字問診', sends: '本機音訊 metadata 或經同意的文字問診請求；實體錄音與上傳尚未實作。', receives: 'voice.result v1：interviewId、consentReference、mode、transcript、reviewRequired=true。', endpoint: '/api/integrations/voice', readiness: 'Receipt Only', limitation: '需要同意流程、服務與安全儲存；不保存逐字稿或產生已簽核診斷。' },
  { id: 'learning', name: '課程平台／學生權益與學分', sends: '未啟用權益授予；提出以已驗證報名 ID、外部學員 reference、courseId 串接。', receives: 'course.completed v1：registrationId、subjectReference、courseId、completedAt、creditUnits。', endpoint: '/api/integrations/learning', readiness: 'Receipt Only', limitation: '需要本人對應、課程及學分規則；接收事件不會自動授予權益。' },
  { id: 'storage', name: '文件儲存服務', sends: '受保護物件儲存介面尚待選定；文件內容不經 receipt-only 端點傳送。', receives: 'document.stored v1：opaque document/object references、sha256、contentType、bytes。', endpoint: '/api/integrations/storage', readiness: 'Receipt Only', limitation: '沒有檔案上傳或下載能力；不接受任意外部 URL。' },
  { id: 'measurements', name: '血壓／血糖／體重／睡眠量測裝置', sends: 'measurement.recorded v1：deviceId、subjectReference、reading（數值與明確單位）。', receives: '202 receiptId、applied=false；不做臨床判讀或警示。', endpoint: '/api/integrations/measurements', readiness: 'Receipt Only', limitation: '設備、本人對應、觀察資料模型及臨床驗證尚未配置。' },
  { id: 'routing', name: '學校 HTTPS 反向代理／公開網址', sends: '保留 Host: cse03.tcmusa.ai，HTTP 至 Ubuntu 192.168.60.112:80，傳遞可信代理標頭。', receives: 'Ubuntu 首頁 HTTP 200 與對應版本資源；公開與 Ubuntu 資源須一致。', endpoint: '學校上游代理 → Ubuntu Caddy', readiness: 'Planned', limitation: '需 IT 實際完成切換；測試中心不能修改學校代理。' },
]
