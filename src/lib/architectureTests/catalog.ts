import type { ScenarioId } from './fixtures'
import type { TestStep } from './types'

const names: Record<string, string> = {
  'scanner-contract': '掃描格式', 'sms-request': '簡訊請求格式', 'sms-acceptance': '虛構簡訊接受回應', 'wrong-code': '錯碼拒絕', 'checkin-once': 'Sandbox 報到與看診', 'duplicate-checkin': 'Sandbox 防重複報到', 'stop-after-rejection': '拒絕後安全停止', 'scanner-identity': '卡片／駕照本人對應', 'scanner-device': '實體掃描器', 'sms-delivery': '真實簡訊投遞',
  'mail-contract': '通知郵件格式', 'saved-before-mail': 'Sandbox 訊息先保存', 'partial-acceptance': '郵件部分接受政策', 'preserve-contact': '保留訊息與安全復原', 'smtp-delivery': '真實 SMTP 認證及投遞',
  'stripe-contract': 'Stripe 消費欄位投影', 'payment-match': '付款課程／金額／幣別', 'reject-wrong-amount': '錯誤金額拒絕', 'receipt-once': 'Sandbox 事件防重複', 'stripe-signature': '真實 Stripe 簽章投遞', 'actual-payment': '真實付款及持久化',
  'clerk-contract': 'Clerk 消費欄位投影', 'no-role-injection': '拒絕角色注入', 'clerk-session': '真實登入及 Svix 驗證', 'account-sync': '帳號身分與角色同步',
  'audio-metadata': '音訊 metadata 格式', 'voice-contract': '逐字稿事件格式', 'review-required': '保留人工審核', 'reject-auto-sign': '拒絕跳過審核', microphone: '實體收音及上傳', 'ai-consent': '同意、服務及臨床審核',
  'learning-contract': '課程完成格式', 'reject-negative-credit': '拒絕負數學分', 'entitlement-mapping': '本人與課程權益', 'learning-platform': '真實課程平台事件',
  'storage-contract': '文件 metadata 格式', 'reject-url': '拒絕任意下載 URL', 'storage-object': '真實物件存取', 'storage-access': '物件儲存授權',
  'measurement-contract': '量測格式及單位', 'reject-unit': '拒絕錯誤單位', 'measurement-device': '實體量測設備及校驗', 'observation-mapping': '本人及觀察紀錄對應',
  'external-side-effects': '真實發送、扣款及照護寫入',
}
export const scenarioStepIds: Record<ScenarioId, string[]> = {
  'kiosk-arrival': ['scanner-contract', 'sms-request', 'sms-acceptance', 'wrong-code', 'checkin-once', 'duplicate-checkin', 'scanner-identity', 'scanner-device', 'sms-delivery'],
  'sms-failure': ['scanner-contract', 'sms-request', 'sms-acceptance', 'stop-after-rejection', 'checkin-once', 'scanner-identity', 'scanner-device', 'sms-delivery'],
  'contact-delivery': ['mail-contract', 'saved-before-mail', 'partial-acceptance', 'preserve-contact', 'smtp-delivery'],
  'payment-registration': ['stripe-contract', 'payment-match', 'reject-wrong-amount', 'receipt-once', 'stripe-signature', 'actual-payment'],
  'identity-event': ['clerk-contract', 'no-role-injection', 'clerk-session', 'account-sync'],
  'voice-intake': ['audio-metadata', 'voice-contract', 'review-required', 'reject-auto-sign', 'microphone', 'ai-consent'],
  'course-completion': ['learning-contract', 'reject-negative-credit', 'entitlement-mapping', 'learning-platform'],
  'document-storage': ['storage-contract', 'reject-url', 'storage-object', 'storage-access'],
  measurements: ['measurement-contract', 'reject-unit', 'measurement-device', 'observation-mapping'],
}
const planned = new Set(['scanner-identity', 'account-sync', 'ai-consent', 'entitlement-mapping', 'storage-access', 'observation-mapping'])
const real = new Set([...planned, 'scanner-device', 'sms-delivery', 'smtp-delivery', 'stripe-signature', 'actual-payment', 'clerk-session', 'microphone', 'learning-platform', 'storage-object', 'measurement-device'])
export function unrunSteps(scenario: ScenarioId): TestStep[] {
  return [...scenarioStepIds[scenario], 'external-side-effects'].map(id => ({ id, name: names[id], status: planned.has(id) ? 'Planned' : id === 'external-side-effects' ? 'Not Applicable' : 'Not Tested', scope: real.has(id) ? 'Real Service / Device' : 'Contract / Sandbox', detail: planned.has(id) ? '尚缺核准的服務、本人對應或業務規格。' : id === 'external-side-effects' ? '此模擬不允許外部副作用。' : '尚未執行；不推測成功或失敗。' }))
}
