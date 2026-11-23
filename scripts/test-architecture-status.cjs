const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

// Exercise the real server guard and page without external accounts or a database.
function load(file, overrides) {
  const source = fs.readFileSync(file, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', outputText)(
    (name) => Object.hasOwn(overrides, name) ? overrides[name] : require(name),
    module,
    module.exports,
  )
  return module.exports
}

async function main() {
  const verificationFile = 'src/data/architectureStatusVerification.json'
  const verification = JSON.parse(fs.readFileSync(verificationFile, 'utf8'))
  const map = load('src/lib/architectureMap.ts', {
    '@/data/architectureStatusVerification.json': verification,
    '@/data/kioskConnectionVerification.json': JSON.parse(fs.readFileSync('src/data/kioskConnectionVerification.json', 'utf8')),
    '@/data/architectureStatusSnapshot.json': JSON.parse(fs.readFileSync('src/data/architectureStatusSnapshot.json', 'utf8')),
  })
  const ArchitectureMap = load('src/components/admin/ArchitectureMap.tsx', {
    '@/lib/architectureMap': map,
    '@/lib/architectureLiveStatus': load('src/lib/architectureLiveStatus.ts', {}),
    './ArchitectureAutoRefresh': { __esModule: true, default: () => null },
  }).default
  const connectionIds = map.architectureConnections.map((connection) => connection.id)
  assert.equal(new Set(connectionIds).size, connectionIds.length, 'Connection IDs must be unique')
  const usedComponents = new Set()
  assert.deepEqual(Object.keys(map.systemStatuses).sort(), ['connected', 'partly_connected', 'planned', 'unknown', 'failed'].sort())
  function checkItem(item) {
    assert.ok(Object.hasOwn(map.systemStatuses, item.status), `Invalid status ${item.status}`)
    assert.ok(item.assessment && item.missingRequirement)
    assert.ok(Object.hasOwn(item, 'safeError') && Object.hasOwn(item, 'lastTest'))
    assert.ok(item.evidence.length, 'Every item must show supporting evidence')
    for (const evidence of item.evidence) {
      assert.ok(['code', 'plan'].includes(evidence.kind))
      const source = fs.readFileSync(evidence.path, 'utf8')
      assert.ok(evidence.anchor && source.includes(evidence.anchor), `Unverifiable evidence ${evidence.path}: ${evidence.symbol}`)
      assert.ok(source.split(/\r?\n/)[evidence.line - 1]?.includes(evidence.anchor), `Incorrect evidence line ${evidence.path}:${evidence.line}`)
    }
    if (item.status === 'connected') assert.ok(item.evidence.some(evidence => evidence.kind === 'code'))
    if (item.status === 'failed') assert.ok(item.safeError, 'Failures must provide a safe error message')
    if (item.lastTest) {
      assert.ok(!Number.isNaN(Date.parse(item.lastTest.at)))
      assert.ok([verification.at, JSON.parse(fs.readFileSync('src/data/kioskConnectionVerification.json', 'utf8')).at].includes(item.lastTest.at))
      assert.ok(item.lastTest.command && item.lastTest.scope)
    }
  }
  for (const component of Object.values(map.architectureComponents)) checkItem(component)
  assert.equal(map.architectureComponents.ubuntuHost.status, 'planned')
  assert.equal(map.architectureComponents.databaseServer.status, 'planned')
  const withoutEvidence = load('src/lib/architectureMap.ts', {
    '@/data/kioskConnectionVerification.json': JSON.parse(fs.readFileSync('src/data/kioskConnectionVerification.json', 'utf8')),
    '@/data/architectureStatusVerification.json': verification,
    '@/data/architectureStatusSnapshot.json': { generatedAt: null, evidence: {}, routes: [], connections: [] },
  })
  assert.equal(withoutEvidence.architectureComponents.bookingApi.status, 'unknown', 'Missing evidence must downgrade connected components')
  assert.equal(withoutEvidence.architectureConnections.find(item => item.id === 'booking-submit').status, 'unknown', 'Missing evidence must downgrade connected connections')
  assert.equal(withoutEvidence.architectureComponents.ubuntuHost.status, 'planned', 'Source scans cannot promote planned infrastructure')
  assert.equal(withoutEvidence.architectureComponents.databaseServer.status, 'planned')
  for (const connection of map.architectureConnections) {
    for (const endpoint of [connection.from, connection.to]) {
      assert.ok(map.architectureComponents[endpoint], `Unknown endpoint ${endpoint}`)
      usedComponents.add(endpoint)
    }
    checkItem(connection)
    assert.ok(connection.description)
    assert.ok(connection.data && connection.assessment && connection.next)
    assert.ok(connection.evidence.length, `No evidence for ${connection.id}`)
    for (const evidence of connection.evidence) {
      assert.ok(fs.existsSync(evidence.path), `Missing source ${evidence.path}`)
      assert.ok(evidence.symbol, `Missing source location for ${connection.id}`)
    }
  }
  assert.deepEqual([...usedComponents].sort(), Object.keys(map.architectureComponents).sort())
  const workflowConnections = map.architectureWorkflows.flatMap((workflow) => workflow.connections)
  assert.deepEqual([...workflowConnections].sort(), [...connectionIds].sort(), 'Each connection must belong to one workflow')
  const mapHtml = renderToStaticMarkup(React.createElement(ArchitectureMap))
  for (const workflow of map.architectureWorkflows) assert.ok(mapHtml.includes(workflow.name))
  for (const connection of map.architectureConnections) assert.ok(mapHtml.includes(connection.assessment))
  for (const component of Object.values(map.architectureComponents)) assert.ok(mapHtml.includes(component.assessment))
  for (const text of ['已連接', '部分連接', '規劃中', '未知', '失敗', '最後測試時間與範圍', '安全錯誤訊息']) assert.ok(mapHtml.includes(text))
  assert.ok(!mapHtml.includes('可核對的程式碼：'), 'Do not render raw source snippets')
  const roles = ['user', 'patient', 'student', 'customer', 'clinic_staff', 'provider', 'billing_staff']
  const cases = [
    { name: 'signed out', signedIn: false, databaseRole: 'admin', allowed: false },
    { name: 'unassigned', allowed: false },
    { name: 'database administrator', databaseRole: 'admin', allowed: true },
    { name: 'metadata administrator', metadataRole: 'admin', databaseRole: 'patient', allowed: true },
    { name: 'missing email', metadataRole: 'admin', email: null, allowed: false },
    ...roles.flatMap((role) => [
      { name: `database ${role}`, databaseRole: role, allowed: false },
      { name: `metadata ${role} overrides database admin`, metadataRole: role, databaseRole: 'admin', allowed: false },
    ]),
  ]

  for (const scenario of cases) {
    const { canViewArchitectureStatus } = load('src/lib/architectureStatusAccess.ts', {
      'server-only': {},
      react: { cache: (fn) => fn },
      '@clerk/nextjs/server': {
        auth: async () => ({ userId: scenario.signedIn === false ? null : 'synthetic-user' }),
        clerkClient: async () => ({ users: { getUser: async () => ({
          primaryEmailAddress: scenario.email === null ? null : { emailAddress: 'synthetic@example.test' },
          publicMetadata: { role: scenario.metadataRole },
        }) } }),
      },
      '@/lib/prisma': { prisma: { user: { findUnique: async () => scenario.databaseRole ? { role: scenario.databaseRole } : null } } },
    })
    assert.equal(await canViewArchitectureStatus(), scenario.allowed, scenario.name)

    let reportReads = 0
    let connectionReads = 0
    const page = load('src/app/admin/development/architecture-status/page.tsx', {
      '@/components/admin/ArchitectureMap': { __esModule: true, default: ArchitectureMap },
      '@/lib/architectureStatusAccess': { canViewArchitectureStatus },
      '@/lib/readKioskTestReport': { readKioskTestReport: () => { reportReads++; return null } },
      '@/lib/architectureMap': map,
      '@/lib/systemConnections': { getSystemConnections: async () => { connectionReads++; return { checkedAt: new Date().toISOString(), environment: 'local', databaseKind: 'sqlite', checks: [] } } },
      'next/navigation': { notFound: () => { throw new Error('NOT_FOUND') } },
      'next/link': { __esModule: true, default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) },
    })
    if (!scenario.allowed) {
      await assert.rejects(page.default(), /NOT_FOUND/, scenario.name)
      assert.equal(reportReads, 0, 'Denied requests must not read test evidence')
      assert.equal(connectionReads, 0, 'Denied requests must not execute service probes')
    } else {
      const html = renderToStaticMarkup(await page.default())
      assert.equal(reportReads, 1, 'Authorized page must read current test evidence')
      assert.equal(connectionReads, 1)
      for (const text of ['系統架構狀態總覽', '臨時開發工具', '已連接', '部分連接', '規劃中', '未知', '失敗', '目前部署的實際連線檢查']) {
        assert.ok(html.includes(text), `Administrator view missing ${text}`)
      }
    }
    assert.equal(page.dynamic, 'force-dynamic')
    assert.deepEqual(page.metadata.robots, { index: false, follow: false })
  }

  for (const showDevelopment of [false, true]) {
    const sidebar = load('src/components/AdminSidebar.tsx', {
      'next/navigation': { usePathname: () => '/admin/development/architecture-status' },
      'next/link': { __esModule: true, default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) },
    }).default
    const html = renderToStaticMarkup(React.createElement(sidebar, { showDevelopment }))
    assert.equal(html.includes('href="/admin/development/architecture-status"'), showDevelopment)
  }

  const references = []
  function scan(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) scan(file)
      else if (/\.tsx?$/.test(file)) {
        const source = fs.readFileSync(file, 'utf8')
        if (source.includes("'/admin/development/architecture-status'") || source.includes('"/admin/development/architecture-status"')) {
          references.push(file.replaceAll('\\', '/'))
        }
      }
    }
  }
  scan('src')
  assert.deepEqual(references.sort(), [
    'src/app/admin/development/architecture-status/page.tsx',
    'src/components/AdminSidebar.tsx',
  ])
  if (process.argv.includes('--record')) {
    // Record only the scopes actually exercised with mocks; no operational service claims.
    fs.writeFileSync(verificationFile, JSON.stringify({ ...verification, at: new Date().toISOString(), result: 'passed' }, null, 2) + '\n')
  }
  console.log(`Passed ${cases.length} access scenarios, direct-page denials, admin rendering, conditional navigation, navigation isolation, and ${connectionIds.length} evidence-backed map connections across ${map.architectureWorkflows.length} workflows.`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
