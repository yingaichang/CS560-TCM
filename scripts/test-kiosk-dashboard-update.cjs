const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { writeReport } = require('./write-kiosk-test-report.cjs')

function load(file, overrides = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', compiled)(name => Object.hasOwn(overrides, name) ? overrides[name] : require(name), module, module.exports)
  return module.exports
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'kiosk-dashboard-'))
try {
  fs.mkdirSync(path.join(temporary, 'src/data'), { recursive: true })
  // A rendering test must not depend on the last integration run succeeding.
  const original = {
    at: new Date(Date.now() - 10_000).toISOString(), result: 'passed',
    command: 'node scripts/test-kiosk-connection.cjs',
    components: ['kiosk', 'kioskApi', 'clinicalWrite', 'sms'],
    connections: ['kiosk-request', 'kiosk-save', 'kiosk-sms', 'kiosk-audit', 'checkin-encounter'],
    cases: [
      { name: '成功報到', result: 'passed', savedCheckin: true, encounterCreatedOnce: true, auditVerified: true,
        requests: ['/api/kiosk/lookup', '/api/kiosk/verify', '/api/kiosk/checkin'].map(path => ({ method: 'POST', path, status: 200 })) },
      { name: '錯誤驗證碼', result: 'passed', savedCheckin: false, auditVerified: true,
        requests: [{ method: 'POST', path: '/api/kiosk/lookup', status: 200 }, { method: 'POST', path: '/api/kiosk/verify', status: 401 }] },
      { name: '簡訊替身拒收', result: 'passed', challengeInvalidated: true,
        requests: [{ method: 'POST', path: '/api/kiosk/lookup', status: 503 }] },
    ],
  }
  const parser = load('src/lib/kioskTestReport.ts')
  // Keep the same loaded reader and UI modules while replacing the on-disk report.
  const reader = load('src/lib/readKioskTestReport.ts', {
    'server-only': {}, './kioskTestReport': parser,
    'node:fs': { readFileSync: (file, encoding) => {
      assert.equal(file, path.join(process.cwd(), 'src/data/kioskConnectionVerification.json'))
      return fs.readFileSync(path.join(temporary, 'src/data/kioskConnectionVerification.json'), encoding)
    } },
  })
  const map = load('src/lib/architectureMap.ts', {
    '@/data/kioskConnectionVerification.json': original,
    '@/data/architectureStatusVerification.json': JSON.parse(fs.readFileSync('src/data/architectureStatusVerification.json', 'utf8')),
    '@/data/architectureStatusSnapshot.json': JSON.parse(fs.readFileSync('src/data/architectureStatusSnapshot.json', 'utf8')),
  })
  const View = load('src/components/admin/ArchitectureMap.tsx', {
    '@/lib/architectureMap': map, './ArchitectureAutoRefresh': { default: () => null, __esModule: true },
    '@/lib/architectureLiveStatus': load('src/lib/architectureLiveStatus.ts'),
  }).default
  const render = () => renderToStaticMarkup(React.createElement(View, { kioskTest: reader.readKioskTestReport() }))
  const kioskCard = html => html.split('id="component-kiosk"')[1].split('</article>')[0]
  writeReport(temporary, original)
  let html = render()
  assert.ok(kioskCard(html).includes(`dateTime="${original.at}"`))
  assert.ok(kioskCard(html).includes('部分連接'))
  assert.ok(kioskCard(html).includes('單一待指派看診'))
  assert.ok(kioskCard(html).includes('錯碼拒絕'))
  assert.ok(kioskCard(html).includes('簡訊替身拒收'))
  assert.ok(kioskCard(html).includes('src/app/kiosk/page.tsx:'))
  for (const id of ['kiosk-request', 'kiosk-save', 'kiosk-sms', 'kiosk-audit']) {
    assert.ok(html.split(`id="connection-${id}"`)[1].split('</article>')[0].includes(`dateTime="${original.at}"`))
  }
  const newer = { ...original, at: new Date(Date.parse(original.at) + 1000).toISOString() }
  writeReport(temporary, newer)
  assert.equal(reader.readKioskTestReport().at, newer.at, 'Must reread updated file without module reload/build')
  assert.ok(kioskCard(render()).includes(`dateTime="${newer.at}"`))
  const failed = { ...newer, result: 'failed', at: new Date(Date.parse(original.at) + 2000).toISOString(), cases: [], scope: 'PRIVATE_CANARY', error: 'PRIVATE_CANARY' }
  writeReport(temporary, failed)
  html = render()
  assert.ok(kioskCard(html).includes('最近一次測試未通過'))
  assert.ok(kioskCard(html).includes(`dateTime="${failed.at}"`))
  assert.ok(kioskCard(html).includes('部分連接'), 'A test result must not silently promote overall connectivity')
  assert.ok(!html.includes('PRIVATE_CANARY'))
  writeReport(temporary, { ...original, cases: [] })
  assert.equal(reader.readKioskTestReport(), null, 'Unsubstantiated pass must be rejected')
  fs.writeFileSync(path.join(temporary, 'src/data/kioskConnectionVerification.json'), '{invalid')
  assert.equal(reader.readKioskTestReport(), null)
  assert.ok(kioskCard(render()).includes('尚無可對應的測試時間'))
  fs.unlinkSync(path.join(temporary, 'src/data/kioskConnectionVerification.json'))
  assert.equal(reader.readKioskTestReport(), null)

  let tick, onVisible, cleanup, refreshes = 0, removed = false, cleared = false
  global.document = { visibilityState: 'visible', addEventListener: (event, cb) => { assert.equal(event, 'visibilitychange'); onVisible = cb }, removeEventListener: (event, cb) => { removed = cb === onVisible } }
  global.window = { setInterval: (cb, ms) => { assert.equal(ms, 30000); tick = cb; return 7 }, clearInterval: id => { cleared = id === 7 } }
  const AutoRefresh = load('src/components/admin/ArchitectureAutoRefresh.tsx', {
    react: { useEffect: fn => { cleanup = fn() } }, 'next/navigation': { useRouter: () => ({ refresh: () => refreshes++ }) },
  }).default
  AutoRefresh()
  tick(); assert.equal(refreshes, 1)
  document.visibilityState = 'hidden'; tick(); assert.equal(refreshes, 1)
  document.visibilityState = 'visible'; onVisible(); assert.equal(refreshes, 2)
  cleanup(); assert.ok(removed && cleared)
  console.log('PASS: live report replacement -> server reader -> dashboard status/evidence/time; failed/missing/invalid reports; privacy allowlist; 30-second refresh and visibility cleanup. Production report unchanged.')
} finally {
  delete global.document; delete global.window
  assert.ok(path.resolve(temporary).startsWith(path.resolve(os.tmpdir()) + path.sep + 'kiosk-dashboard-'))
  fs.rmSync(temporary, { recursive: true, force: true })
}
