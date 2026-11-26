export type IntakeField = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  options?: string[]
  autoComplete?: string
  maxLength?: number
  when?: [string, string]
}

export const intakeSteps: { title: string; description: string; fields: IntakeField[] }[] = [
  { title: '病人基本資料', description: '請填寫病人的身分資料與偏好語言。', fields: [
    { name: 'firstName', label: '名字', required: true, maxLength: 80, autoComplete: 'given-name' },
    { name: 'lastName', label: '姓氏', required: true, maxLength: 80, autoComplete: 'family-name' },
    { name: 'middleName', label: '中間名（如適用）', maxLength: 80, autoComplete: 'additional-name' },
    { name: 'dateOfBirth', label: '出生日期', type: 'date', required: true, autoComplete: 'bday' },
    { name: 'gender', label: '性別', type: 'select', required: true, options: ['女性', '男性', '非二元性別', '其他', '不願透露'] },
    { name: 'preferredLanguage', label: '偏好語言', maxLength: 80 },
  ] },
  { title: '聯絡資料', description: '請填寫目前的聯絡方式與通訊地址。', fields: [
    { name: 'phone', label: '電話號碼', type: 'tel', required: true, autoComplete: 'tel', maxLength: 40 },
    { name: 'email', label: '電子郵件地址', type: 'email', required: true, autoComplete: 'email', maxLength: 254 },
    { name: 'address', label: '街道地址', required: true, autoComplete: 'street-address', maxLength: 240 },
    { name: 'city', label: '城市', required: true, autoComplete: 'address-level2', maxLength: 120 },
    { name: 'state', label: '州／省', required: true, autoComplete: 'address-level1', maxLength: 120 },
    { name: 'postalCode', label: '郵遞區號', required: true, autoComplete: 'postal-code', maxLength: 30 },
    { name: 'country', label: '國家', required: true, autoComplete: 'country-name', maxLength: 120 },
  ] },
  { title: '緊急聯絡人', description: '發生緊急情況時，我們應聯絡誰？', fields: [
    { name: 'emergencyContact', label: '聯絡人姓名', required: true, maxLength: 160 },
    { name: 'emergencyRelationship', label: '與病人的關係', required: true, maxLength: 80 },
    { name: 'emergencyContactPhone', label: '聯絡人電話號碼', type: 'tel', required: true, maxLength: 40 },
    { name: 'emergencyContactEmail', label: '聯絡人電子郵件地址', type: 'email', required: true, maxLength: 254 },
  ] },
  { title: '病史', description: '請填寫相關疾病、手術、住院及家族病史；如無相關情況或不清楚，請填寫「無」或「不詳」。', fields: [
    { name: 'medicalHistory', label: '過去及目前的疾病', type: 'textarea', required: true },
    { name: 'surgeries', label: '手術、受傷及住院紀錄', type: 'textarea', required: true },
    { name: 'familyHistory', label: '相關家族病史', type: 'textarea' },
    { name: 'pregnancyStatus', label: '懷孕狀況', type: 'select', required: true, options: ['不適用', '未懷孕', '已懷孕', '可能懷孕', '希望與醫療人員面談'] },
  ] },
  { title: '用藥與過敏紀錄', description: '請包含處方藥、非處方藥、中草藥及保健品；如未使用或不清楚，請填寫「無」或「不詳」。', fields: [
    { name: 'medications', label: '目前使用的藥物、中草藥及保健品（劑量與使用頻率）', type: 'textarea', required: true },
    { name: 'allergies', label: '過敏或敏感物質及相關反應', type: 'textarea', required: true },
  ] },
  { title: '目前健康問題', description: '請以病人自己的話描述目前的健康問題與目標。', fields: [
    { name: 'majorComplaints', label: '主要健康問題', type: 'textarea', required: true },
    { name: 'onsetDate', label: '症狀開始日期（如知道）', type: 'date' },
    { name: 'symptomFrequency', label: '症狀發生頻率', type: 'select', required: true, options: ['持續發生', '經常發生', '偶爾發生', '間歇發生', '不適用'] },
    { name: 'symptomTriggers', label: '哪些因素會改善或加重症狀？', type: 'textarea' },
    { name: 'healthGoals', label: '健康目標及對日常生活的影響', type: 'textarea', required: true },
  ] },
  { title: '生活習慣與社會背景', description: '請填寫日常生活習慣；涉及敏感問題時，可選擇或填寫「希望與醫療人員面談」。', fields: [
    { name: 'sleep', label: '睡眠品質與平常睡眠時數', required: true },
    { name: 'diet', label: '飲食、食慾與消化狀況', type: 'textarea', required: true },
    { name: 'exercise', label: '日常活動與運動習慣', required: true },
    { name: 'stress', label: '壓力與情緒狀況', type: 'select', required: true, options: ['低', '中等', '高', '希望與醫療人員面談'] },
    { name: 'substanceUse', label: '菸草、酒精、咖啡因或其他物質使用情形', type: 'textarea', required: true },
    { name: 'occupation', label: '職業與相關社會生活狀況' },
  ] },
  { title: '保險與醫療提供者資料', description: '請填寫保險及目前就醫的醫療人員資料，保障範圍可另由診所人員確認。', fields: [
    { name: 'insuranceStatus', label: '保險狀況', type: 'select', required: true, options: ['有保險', '自費／無保險', '不詳／請診所協助確認'] },
    { name: 'insuranceProvider', label: '保險公司', required: true, when: ['insuranceStatus', '有保險'] },
    { name: 'memberId', label: '會員編號／保單號碼', required: true, when: ['insuranceStatus', '有保險'] },
    { name: 'policyholder', label: '保單持有人姓名', required: true, when: ['insuranceStatus', '有保險'] },
    { name: 'groupNumber', label: '團體保險編號（如適用）', when: ['insuranceStatus', '有保險'] },
    { name: 'primaryProvider', label: '主要照護醫師／診所（或填寫「無」／「不詳」）', required: true },
    { name: 'providerPhone', label: '醫療提供者電話', type: 'tel', maxLength: 40 },
    { name: 'referralSource', label: '轉介醫師或轉介來源' },
  ] },
  { title: '同意與隱私確認', description: '簽名前可按「上一步」檢查填寫內容。本步驟僅確認初診資料與隱私事項；臨床醫療同意將另行辦理。', fields: [
    { name: 'informationConfirmed', label: '本人確認，以上資料在本人所知範圍內均為正確。', type: 'checkbox', required: true },
    { name: 'privacyAcknowledged', label: '本人了解，以上資料將儲存於診所病人紀錄中，並由獲授權的診所人員用於初診登記及照護協調。', type: 'checkbox', required: true },
    { name: 'signatureName', label: '病人或獲授權代理人姓名', required: true, maxLength: 160 },
    { name: 'signatureDate', label: '簽署日期', type: 'date', required: true },
    { name: 'representativeRelationship', label: '與病人的關係（由代理人簽署時填寫）' },
  ] },
]

export const fieldIsVisible = (field: IntakeField, values: Record<string, string>) => !field.when || values[field.when[0]] === field.when[1]

export function validateIntakeStep(step: number, values: Record<string, string>, today = new Date().toLocaleDateString('en-CA')) {
  const errors: Record<string, string> = {}
  for (const field of intakeSteps[step].fields) {
    if (!fieldIsVisible(field, values)) continue
    const value = (values[field.name] || '').trim()
    if (field.required && !value) errors[field.name] = field.type === 'checkbox' ? '請勾選確認此聲明。' : '此欄位為必填。'
    else if (value) {
      if (value.length > (field.maxLength || 2000)) errors[field.name] = `請輸入 ${field.maxLength || 2000} 個字元以內。`
      if (field.options && !field.options.includes(value)) errors[field.name] = '請選擇有效的選項。'
      if (field.type === 'checkbox' && value !== 'true') errors[field.name] = '請勾選確認此聲明。'
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.name] = '請輸入有效的電子郵件地址。'
      if (field.type === 'tel' && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) errors[field.name] = '請輸入有效的電話號碼（7 至 15 位數字）。'
      if (field.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value > today)) errors[field.name] = '請輸入有效日期，且不得晚於今天。'
    }
  }
  return errors
}
