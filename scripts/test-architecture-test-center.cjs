const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { randomUUID } = require('node:crypto')
const root = path.resolve(__dirname, '..')
const cache = new Map()
let administrator = false, uiState = null, stateIndex = 0
function load(file) {
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }; cache.set(file, module)
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText
  const localRequire = name => {
    if (name === '@/lib/architectureStatusAccess') return { canViewArchitectureStatus: async () => administrator }
    if (name === 'next/navigation') return { notFound() { throw new Error('NOT_FOUND') } }
    if (name === 'next/link') return ({ children, ...props }) => React.createElement('a', props, children)
    if (name === 'react') return { ...React, useState(initial) { return [stateIndex++ === 0 ? uiState : initial, () => {}] }, useRef: () => ({ current: null }), useEffect() {}, useCallback: x => x }
    if (name.startsWith('@/')) {
      const stem = 'src/' + name.slice(2)
      const found = ['.ts', '.tsx', '.json'].map(ext => stem + ext).find(p => fs.existsSync(path.join(root, p)))
      return found.endsWith('.json') ? require(path.join(root, found)) : load(found)
    }
    if (name.startsWith('.')) return load(path.posix.join(path.posix.dirname(file), name) + '.ts')
    return require(name)
  }
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports)
  return module.exports
}
async function main() {
  const { scenarioIds, scenarioFixtures } = load('src/lib/architectureTests/fixtures.ts')
  const { runSimulation, scenarioNames } = load('src/lib/architectureTests/runner.ts')
  const { unrunSteps } = load('src/lib/architectureTests/catalog.ts')
  const { testStatuses, aggregateStatus } = load('src/lib/architectureTests/types.ts')
  const previousFetch = global.fetch
  global.fetch = () => { throw new Error('Simulator must not contact a service') }
  try {
    for (const id of scenarioIds) {
      const run = runSimulation(id, randomUUID())
      assert.equal(run.source, 'Development Simulation')
      assert.ok(run.steps.length > 2)
      assert.ok(run.steps.every(step => testStatuses.includes(step.status)))
      assert.ok(run.steps.some(step => step.status === 'Not Tested' && step.scope === 'Real Service / Device'))
      assert.ok(run.steps.some(step => step.status === 'Not Applicable'))
      assert.notEqual(run.status, 'Passed')
      assert.deepEqual(run.steps.map(s => s.id).sort(), unrunSteps(id).map(s => s.id).sort(), id + ' history definitions')
      assert.equal(run.steps.filter(s => s.status === 'Failed').length, id === 'sms-failure' ? 1 : 0, id)
    }
  } finally { global.fetch = previousFetch }
  const failed = runSimulation('sms-failure', randomUUID())
  assert.equal(failed.status, 'Failed')
  assert.equal(failed.steps.find(s => s.id === 'checkin-once').status, 'Not Tested')
  assert.equal(failed.steps.find(s => s.id === 'stop-after-rejection').status, 'Passed')
  for (const status of testStatuses) assert.equal(aggregateStatus([{ status }]), status)
  const { readBoundedBody, parseJson } = load('src/lib/integrations/httpBoundary.ts')
  const bomBody = new Request('http://localhost/test', { method: 'POST', body: Buffer.from([0xef, 0xbb, 0xbf, 0x7b, 0x7d]) })
  const decoded = await readBoundedBody(bomBody)
  assert.equal(decoded.charCodeAt(0), 0xfeff, 'Preserve exact signed UTF-8 bytes')
  assert.throws(() => parseJson(decoded), error => error.status === 400)
  await assert.rejects(readBoundedBody(new Request('http://localhost/test', { method: 'POST', body: Buffer.from([0xff]) })), error => error.status === 400)
  await assert.rejects(readBoundedBody(new Request('http://localhost/test', { method: 'POST', body: 'x'.repeat(16385) })), error => error.status === 413)
  const page = load('src/app/admin/development/architecture-tests/page.tsx').default
  await assert.rejects(page(), /NOT_FOUND/)
  administrator = true
  assert.ok(await page())
  const Center = load('src/components/admin/ArchitectureTestCenter.tsx').default
  assert.match(renderToStaticMarkup(React.createElement(Center)), /role="status"/)
  uiState = { simulationEnabled: false, contracts: [], schemas: {}, scenarios: scenarioIds.map(id => ({ id, name: scenarioNames[id], fixture: scenarioFixtures[id], steps: unrunSteps(id) })), history: [], historyStatus: 'Passed', receipts: [], recordedSoftwareVerification: { result: 'not_tested', at: null, scope: 'Fictional test display', connections: [] } }
  stateIndex = 0
  const html = renderToStaticMarkup(React.createElement(Center))
  assert.match(html, /Development Simulation/)
  assert.match(html, /ARCHITECTURE_SIMULATION_ENABLED/)
  assert.match(html, /disabled=""/)
  assert.match(html, /Not Tested/)
  for (const status of testStatuses) assert.ok(html.includes(status))
  uiState.historyStatus = 'Failed'
  stateIndex = 0
  assert.match(renderToStaticMarkup(React.createElement(Center)), /role="alert"/)
  console.log('PASS: nine fictional workflows, status semantics, no network, history definitions, administrator page, disabled simulator and unavailable-history rendering.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
