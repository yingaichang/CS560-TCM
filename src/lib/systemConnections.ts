import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { request as httpRequest } from 'node:http'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import type { SystemCheck, SystemCheckId, SystemConnectionReport } from './systemConnectionTypes'

type Outcome = Pick<SystemCheck, 'status' | 'detail'>
const passed = (detail: string): Outcome => ({ status: 'connected', detail })
const incomplete = (detail: string): Outcome => ({ status: 'partly_connected', detail })
const failed = (detail: string): Outcome => ({ status: 'failed', detail })
const timeoutMs = 8_000
let pending: Promise<SystemConnectionReport> | undefined
let cached: SystemConnectionReport | undefined

async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Health check timeout')), timeoutMs) })])
  } finally { if (timer) clearTimeout(timer) }
}

async function get(url: string, headers?: Record<string, string>) {
  return fetch(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(timeoutMs), redirect: 'error' })
}

function readUbuntuHomepage(): Promise<string> {
  // Preserve the public Host header when contacting Caddy over Docker DNS.
  return new Promise((resolve, reject) => {
    const request = httpRequest({ hostname: 'proxy', port: 80, path: '/', method: 'GET', headers: { Host: 'cse03.tcmusa.ai' } }, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error('Proxy homepage unhealthy')); return }
      response.setEncoding('utf8')
      let body = ''
      response.on('data', chunk => {
        body += chunk
        if (body.length > 1_000_000) request.destroy(new Error('Proxy response too large'))
      })
      response.on('end', () => resolve(body))
      response.on('error', reject)
    })
    request.setTimeout(timeoutMs, () => request.destroy(new Error('Proxy timeout')))
    request.on('error', reject)
    request.end()
  })
}

async function verifySchema(): Promise<Outcome> {
  const postgres = /^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '')
  const source = await readFile(join(process.cwd(), 'prisma', postgres ? 'schema.production.prisma' : 'schema.prisma'), 'utf8')
  const expected = [...source.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g)]
  if (!expected.length) return incomplete('找不到可比對的資料模型；尚未驗證結構。')
  const actual: Array<{ table_name: string; column_name: string }> = postgres
    ? await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema()`
    : []
  let missing = 0
  for (const [, table, fields] of expected) {
    let columns: Set<string>
    if (postgres) columns = new Set(actual.filter(item => item.table_name === table).map(item => item.column_name))
    else {
      // Table names come from the checked-in Prisma model syntax, never a request.
      const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("${table}")`)
      columns = new Set(rows.map(row => row.name))
    }
    for (const field of fields.matchAll(/^\s*(\w+)\s+(?:String|Int|Float|Boolean|DateTime|Json|Bytes|Decimal|BigInt)[?\[\]]*(?:\s|$)/gm)) {
      if (!columns.has(field[1])) missing++
    }
  }
  return missing ? failed(`資料庫缺少 ${missing} 個必要欄位；需要審查結構更新。`) : passed('已唯讀比對所有 Prisma 模型的必要資料表與欄位；未修改資料。')
}

async function inspect(): Promise<SystemConnectionReport> {
  const checkedAt = new Date().toISOString()
  const check = async (id: SystemCheckId, name: string, operation: () => Promise<Outcome>, failure: string): Promise<SystemCheck> => {
    try { return { id, name, ...await bounded(operation()), checkedAt } }
    catch { return { id, name, ...failed(failure), checkedAt } }
  }
  const isUbuntu = process.env.DEPLOYMENT_TARGET === 'ubuntu'
  let ubuntuHtml: Promise<string> | undefined
  const localHomepage = () => ubuntuHtml ??= readUbuntuHomepage()
  const checks = await Promise.all([
    check('database', '資料庫連線', async () => {
      await prisma.$queryRaw`SELECT 1`
      return passed(/^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '') ? 'PostgreSQL 實際唯讀查詢成功。' : '本機開發資料庫實際唯讀查詢成功；不代表遠端 PostgreSQL。')
    }, '資料庫唯讀查詢失敗或逾時；未顯示連線字串或資料。'),
    check('schema', '資料庫結構', verifySchema, '無法完成必要資料表與欄位比對；請檢查資料庫及產生的 schema。'),
    check('identity', 'Clerk 身分驗證 API', async () => {
      if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return incomplete('缺少 Clerk 金鑰設定。')
      const response = await get('https://api.clerk.com/v1/users/count', { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` })
      await response.arrayBuffer()
      return response.status === 200 ? passed('Clerk 已接受伺服器金鑰；唯讀 API 成功。實際登入與工作階段需另行驗證。') : failed('Clerk API 未接受連線或金鑰；未顯示回應內容。')
    }, 'Clerk API 無法連線或逾時。'),
    check('mail', 'SMTP 郵件連線', async () => {
      const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: pass } = process.env
      if (!host || !user || !pass) return incomplete('缺少 SMTP 主機或登入設定。')
      const port = Number(process.env.SMTP_PORT || 465)
      const transporter = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465, auth: { user, pass }, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 5000 })
      try { await transporter.verify(); return passed('SMTP 連線及登入驗證成功；本次未寄出郵件，不代表實際收件成功。') }
      catch (error) {
        const code = (error as { code?: string }).code
        return failed(code === 'EAUTH' ? 'SMTP 伺服器拒絕登入；請更新帳號及供應商應用程式密碼。' : code === 'ETIMEDOUT' ? 'SMTP 連線逾時；請確認供應商主機、連接埠及網路存取。' : 'SMTP 連線驗證失敗；請檢查供應商及 TLS 設定。')
      }
      finally { transporter.close() }
    }, 'SMTP 連線或登入驗證失敗；未寄出郵件或顯示憑證。'),
    check('stripe', 'Stripe 付款 API', async () => {
      if (!process.env.STRIPE_SECRET_KEY) return incomplete('缺少 Stripe 伺服器金鑰。')
      const response = await get('https://api.stripe.com/v1/balance', { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` })
      await response.arrayBuffer()
      return response.status === 200 ? passed(`${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? '測試模式' : '正式模式'} Stripe 唯讀 API 成功；未建立付款或收費。`) : failed(response.status === 401 ? 'Stripe 拒絕目前金鑰；請更新有效的伺服器金鑰。' : response.status === 403 ? 'Stripe 金鑰缺少唯讀 API 權限；請確認金鑰權限。' : 'Stripe API 未接受連線；未顯示付款資料。')
    }, 'Stripe API 無法連線或逾時。'),
    check('stripeWebhook', 'Stripe 付款回呼', async () => process.env.STRIPE_WEBHOOK_SECRET
      ? incomplete('簽章設定存在；仍須驗證供應商向目前公開網址投遞事件及重送。')
      : incomplete('缺少 STRIPE_WEBHOOK_SECRET；需在公開網址完成切換後設定並驗證事件投遞。'), '付款回呼設定無法檢查。'),
    check('clerkWebhook', 'Clerk 帳號事件回呼', async () => process.env.CLERK_WEBHOOK_SIGNING_SECRET
      ? incomplete('簽章設定存在；仍須驗證帳號事件投遞與同步。')
      : incomplete('缺少帳號事件回呼設定；API 連通不代表事件同步已完成。'), '帳號事件設定無法檢查。'),
    check('sms', '簡訊供應商', async () => process.env.SMS_PROVIDER_WEBHOOK_URL
      ? incomplete('供應商網址已設定；未向真實電話發送測試訊息，投遞尚待驗證。')
      : incomplete('尚未設定 SMS_PROVIDER_WEBHOOK_URL；報到驗證碼無法實際投遞。'), '簡訊供應商設定無法檢查。'),
    check('ubuntu', 'Ubuntu 應用程式部署', async () => {
      if (!isUbuntu) return { status: 'planned', detail: '這是本機開發環境；不以 localhost 回應宣稱 Ubuntu 已部署。' }
      const evidence = JSON.parse(await readFile(join(process.cwd(), '.local-deploy/deployment-status.json'), 'utf8'))
      const revision = (process.env.SITE_BUILD_REVISION || '').slice(0, 40)
      if (evidence.target !== 'ubuntu' || evidence.result !== 'passed' || !/^[a-f0-9]{40}$/.test(revision) || evidence.revision !== revision) return incomplete('部署證據與目前執行版本不一致；請檢查部署服務。')
      await localHomepage()
      return passed(`目前版本 ${revision.slice(0, 7)}；經 Ubuntu 部署服務驗證，Caddy 至應用程式實際回傳 HTTP 200。`)
    }, 'Ubuntu 部署證據或 Caddy 至應用程式檢查失敗。'),
    check('publicDomain', '正式網址與 Ubuntu 版本', async () => {
      if (!isUbuntu) return { status: 'unknown', detail: '請在 Ubuntu 狀態頁檢查正式網址與部署版本。' }
      const response = await get('https://cse03.tcmusa.ai/')
      if (response.status !== 200) return failed('正式網址尚未回傳 HTTP 200。')
      const publicHtml = await response.text()
      const assets = (html: string) => [...new Set(html.match(/\/_next\/static\/[^"<> ]+\.(?:js|css)/g) || [])].sort().join('\n')
      const expected = assets(await localHomepage())
      return expected && expected === assets(publicHtml) ? passed('正式網址與 Ubuntu 首頁的 JavaScript/CSS 版本指紋一致。') : failed('正式網址與 Ubuntu 版本不同；需要學校 IT 完成上游轉送切換。')
    }, '正式網址版本比對失敗或逾時。'),
  ])
  return { checkedAt, environment: isUbuntu ? 'ubuntu' : 'local', databaseKind: /^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '') ? 'postgresql' : 'sqlite', checks }
}

// Results contain fixed summaries only. No response bodies, credentials or patient data.
export async function getSystemConnections(): Promise<SystemConnectionReport> {
  if (cached && Date.now() - Date.parse(cached.checkedAt) < 30_000) return cached
  if (!pending) pending = inspect().then(report => { cached = report; return report }).finally(() => { pending = undefined })
  return pending
}
