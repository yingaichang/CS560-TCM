import type { TestRecord } from './architectureMap'

// Copy only allowlisted metadata. Never render report payloads, errors or logs.
export function parseKioskTestReport(value: unknown): TestRecord | null {
  if (!value || typeof value !== 'object') return null
  const report = value as Record<string, unknown>
  if (report.command !== 'node scripts/test-kiosk-connection.cjs' || typeof report.at !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(report.at)
    || !Number.isFinite(Date.parse(report.at)) || Date.parse(report.at) > Date.now() + 300_000
    || !['passed', 'failed'].includes(String(report.result))) return null
  if (report.result === 'passed') {
    const cases = report.cases as Array<Record<string, unknown>> | undefined
    const expected = [
      ['成功報到', [200, 200, 200], ['/api/kiosk/lookup', '/api/kiosk/verify', '/api/kiosk/checkin']],
      ['錯誤驗證碼', [200, 401], ['/api/kiosk/lookup', '/api/kiosk/verify']],
      ['簡訊替身拒收', [503], ['/api/kiosk/lookup']],
    ] as const
    if (!Array.isArray(cases) || !expected.every(([name, statuses, paths]) => {
      const item = cases.find(item => item && item.name === name && item.result === 'passed')
      const requests = item?.requests as Array<Record<string, unknown>> | undefined
      return Array.isArray(requests) && requests.length === statuses.length
        && requests.every((request, index) => request.method === 'POST' && request.status === statuses[index] && request.path === paths[index])
        && (name === '成功報到' ? item?.savedCheckin === true && item.encounterCreatedOnce === true && item.auditVerified === true
          : name === '錯誤驗證碼' ? item?.savedCheckin === false && item.auditVerified === true : item?.challengeInvalidated === true)
    })) return null
  }
  return {
    at: report.at, command: 'node scripts/test-kiosk-connection.cjs', result: report.result as 'passed' | 'failed',
    scope: report.result === 'passed'
      ? '本機隔離測試：已連結病人的成功報到會建立單一待指派看診並核對稽核；錯碼拒絕與簡訊替身拒收均未錯誤報到。使用實際畫面、既有處理函式及暫存 SQLite；未驗證 Next 中介層、正式部署、真實簡訊或掃描設備。'
      : '最近一次本機隔離報到測試未通過；請在開發環境重新檢查。未公開錯誤內容或測試資料。',
  }
}
