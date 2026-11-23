import { adapterSchemas, audioMetadataSchema, clerkEventSchema, mailRequestSchema, parseAdapterEvent, smsAcceptanceSchema, smsRequestSchema, stripeEventSchema } from '@/lib/integrations/contracts'
import { classifyMailAcceptance, matchesRegistrationPayment, planCheckedInEncounter } from '@/lib/integrations/workflowPolicies'
import { scenarioFixtures, type ScenarioId } from './fixtures'
import { aggregateStatus, simulationSource, type TestRun, type TestStep, type TestStatus } from './types'

export const scenarioNames: Record<ScenarioId, string> = {
  'kiosk-arrival': '掃描 → 簡訊格式 → sandbox 報到與看診', 'sms-failure': '簡訊拒絕 → 安全停止（預期故障案例）',
  'contact-delivery': '訊息保存 → 郵件部分接受 → 人工復原', 'payment-registration': '付款事件格式 → 金額核對 → 防重送',
  'identity-event': '身分事件格式與權限邊界', 'voice-intake': '音訊 metadata → 逐字稿 → 待人工審核',
  'course-completion': '課程完成格式與權益邊界', 'document-storage': '文件 metadata 與儲存邊界', measurements: '量測格式與單位 → 待本人對應',
}

// Deliberately no database client, filesystem, SDK transport, fetch, or credentials.
// Each run has fresh memory; it cannot call real kiosk/payment/clinical endpoints.
export function runSimulation(scenario: ScenarioId, runId: string): TestRun {
  const steps: TestStep[] = []
  const add = (id: string, name: string, status: TestStatus, detail: string, scope: TestStep['scope'] = 'Contract / Sandbox') => steps.push({ id, name, status, detail, scope })
  const test = (id: string, name: string, operation: () => boolean) => {
    try { add(id, name, operation() ? 'Passed' : 'Failed', '僅執行已列出的格式／sandbox 斷言，不代表真實服務成功。') }
    catch { add(id, name, 'Failed', '格式或 sandbox 斷言失敗；未保存原始錯誤或輸入。') }
  }
  const external = (id: string, name: string) => add(id, name, 'Not Tested', '此模擬不連接真實設備、服務或身分。', 'Real Service / Device')
  if (scenario === 'kiosk-arrival' || scenario === 'sms-failure') {
    const fixture = scenarioFixtures[scenario]
    test('scanner-contract', '掃描資料格式', () => adapterSchemas.scanner.safeParse(fixture.scanner).success)
    test('sms-request', '送出簡訊格式', () => smsRequestSchema.safeParse(fixture.sms).success)
    test('sms-acceptance', '供應商接受（虛構回應）', () => smsAcceptanceSchema.parse(fixture.acceptance).status === 'accepted')
    const accepted = fixture.acceptance.status === 'accepted'
    if (accepted) {
      const sandbox = new Map<string, ReturnType<typeof planCheckedInEncounter>>()
      const redeem = (code: string) => {
        if (code !== fixture.sms.code || sandbox.has(fixture.appointment.id)) return false
        sandbox.set(fixture.appointment.id, planCheckedInEncounter({ ...fixture.appointment, date: new Date(fixture.appointment.date) }, 'SYN-ENC-001'))
        return true
      }
      test('wrong-code', '錯碼不建立看診', () => !redeem('111111') && sandbox.size === 0)
      test('checkin-once', 'sandbox 報到建立正確看診', () => redeem(fixture.sms.code) && sandbox.get(fixture.appointment.id)?.patientId === fixture.appointment.patientId)
      test('duplicate-checkin', 'sandbox 重複報到不新增看診', () => !redeem(fixture.sms.code) && sandbox.size === 1)
    } else {
      test('stop-after-rejection', '供應商拒絕後停止報到', () => !accepted)
      add('checkin-once', 'sandbox 報到與看診', 'Not Tested', '前置簡訊接受步驟失敗，未執行後續報到。')
    }
    add('scanner-identity', '真實卡片／駕照本人對應', 'Planned', '一次性 token 簽發與本人對應尚未建置。', 'Real Service / Device')
    external('scanner-device', '實體掃描設備')
    external('sms-delivery', '真實簡訊投遞')
  } else if (scenario === 'contact-delivery') {
    const fixture = scenarioFixtures[scenario]
    const inbox = new Map<string, string>()
    test('mail-contract', '通知郵件格式', () => mailRequestSchema.safeParse(fixture.envelope).success)
    test('saved-before-mail', 'sandbox 訊息先保存', () => { inbox.set('syn-contact-001', 'saved'); return inbox.size === 1 })
    test('partial-acceptance', '沿用應用政策：部分接受視為 unknown', () => classifyMailAcceptance(fixture.result) === 'unknown')
    test('preserve-contact', '不明投遞不刪除訊息、不自動重寄', () => inbox.get('syn-contact-001') === 'saved')
    external('smtp-delivery', '真實 SMTP 認證與送達')
  } else if (scenario === 'payment-registration') {
    const fixture = scenarioFixtures[scenario]
    const receipts = new Set<string>()
    test('stripe-contract', 'Stripe 最小消費欄位投影', () => stripeEventSchema.safeParse(fixture.event).success)
    const session = fixture.event.data.object
    test('payment-match', '沿用應用政策：課程／金額／幣別核對', () => matchesRegistrationPayment(fixture.registration, session, session.metadata.topicId === fixture.registration.topicId))
    test('reject-wrong-amount', '錯誤金額不能成為成功付款', () => !matchesRegistrationPayment(fixture.registration, { ...session, amount_total: 1 }, true))
    test('receipt-once', 'sandbox 同一事件只接收一次', () => { receipts.add(fixture.event.id); receipts.add(fixture.event.id); return receipts.size === 1 })
    external('stripe-signature', '真實供應商簽章與事件投遞')
    external('actual-payment', '實際付款與報名持久化')
  } else if (scenario === 'identity-event') {
    test('clerk-contract', 'Clerk 最小消費欄位投影', () => clerkEventSchema.safeParse(scenarioFixtures[scenario]).success)
    test('no-role-injection', '身分格式投影拒絕自行加入管理員角色', () => !clerkEventSchema.safeParse({ ...scenarioFixtures[scenario], role: 'admin' }).success)
    external('clerk-session', '真實登入、工作階段與 Svix 驗證')
    add('account-sync', '外部身分與本機帳號同步', 'Planned', '需要本人對應、角色規則及復原流程；不授予權限。')
  } else if (scenario === 'voice-intake') {
    const fixture = scenarioFixtures[scenario]
    test('audio-metadata', '音訊 metadata 格式（無音訊內容）', () => audioMetadataSchema.safeParse(fixture.audio).success)
    test('voice-contract', '逐字稿事件格式', () => adapterSchemas.voice.safeParse(fixture.result).success)
    test('review-required', '逐字稿必須保持待人工審核', () => parseAdapterEvent('voice', fixture.result).data && fixture.result.data.reviewRequired === true)
    test('reject-auto-sign', '拒絕跳過人工審核', () => !adapterSchemas.voice.safeParse({ ...fixture.result, data: { ...fixture.result.data, reviewRequired: false } }).success)
    external('microphone', '實體麥克風與音訊上傳')
    add('ai-consent', '同意、AI 服務及臨床審核串接', 'Planned', '沒有選定供應商或核准的同意與臨床保存規格。')
  } else if (scenario === 'course-completion') {
    const fixture = scenarioFixtures[scenario]
    test('learning-contract', '課程完成事件格式', () => adapterSchemas.learning.safeParse(fixture).success)
    test('reject-negative-credit', '拒絕負數學分', () => !adapterSchemas.learning.safeParse({ ...fixture, data: { ...fixture.data, creditUnits: -1 } }).success)
    add('entitlement-mapping', '已付款本人／課程／學分權益', 'Planned', '不依電子郵件猜測本人，不授予未核准的課程權益。')
    external('learning-platform', '真實課程平台事件')
  } else if (scenario === 'document-storage') {
    const fixture = scenarioFixtures[scenario]
    test('storage-contract', '文件 metadata 格式', () => adapterSchemas.storage.safeParse(fixture).success)
    test('reject-url', '拒絕任意下載 URL 或額外欄位', () => !adapterSchemas.storage.safeParse({ ...fixture, data: { ...fixture.data, downloadUrl: 'https://synthetic.invalid/' } }).success)
    external('storage-object', '實際檔案上傳、存取與下載')
    add('storage-access', '受保護物件儲存授權', 'Planned', '尚未選定儲存服務與檔案存取政策。')
  } else {
    const fixtures = scenarioFixtures.measurements
    test('measurement-contract', '血壓、血糖、體重、睡眠格式及單位', () => fixtures.every(item => adapterSchemas.measurements.safeParse(item).success))
    test('reject-unit', '拒絕錯誤量測單位', () => !adapterSchemas.measurements.safeParse({ ...fixtures[0], data: { ...fixtures[0].data, reading: { ...fixtures[0].data.reading, unit: 'kg' } } }).success)
    external('measurement-device', '真實量測設備與校驗')
    add('observation-mapping', '本人對應、觀察紀錄與臨床規則', 'Planned', '尚無已核准的量測保存／臨床判讀服務；不產生健康結論。')
  }
  add('external-side-effects', '向真實服務發送訊息、扣款或寫入照護紀錄', 'Not Applicable', '此模式只使用固定虛構輸入及每次新建的記憶體 sandbox，沒有外部副作用。')
  return { runId, scenario, source: simulationSource, checkedAt: new Date().toISOString(), status: aggregateStatus(steps), steps }
}
