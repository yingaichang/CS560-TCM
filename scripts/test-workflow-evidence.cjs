const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const snapshot = JSON.parse(fs.readFileSync('src/data/architectureStatusSnapshot.json', 'utf8'))
const stageIds = ['service', 'record', 'managementScreen', 'audit', 'finalResult', 'negativeCase']
const source = ts.transpileModule(fs.readFileSync('src/lib/architectureMap.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
const complete = { id: 'booking-save', at: '2030-01-07T09:00:00Z', source: 'Isolated Application Test (fictional records; identity/provider fixtures)', scope: 'Fictional unit witness', status: 'connected', remainingRequirement: 'Real providers remain unverified.', safeError: 'Reload the saved record.', stages: Object.fromEntries(stageIds.map(id => [id, { status: 'Passed', detail: 'Executed assertion.' }])), cases: stageIds.map(id => ({ id: 'booking-save:' + id, result: 'Passed', evidence: 'scripts/workflow-evidence-cases.cjs' })) }
function load(entries, digest = 'a') {
  const module = { exports: {} }
  new Function('require', 'module', 'exports', source)(name => {
    if (name === '@/data/workflowConnectionVerification.json') return { version: 1, sourceDigest: digest, connections: entries }
    if (name === '@/data/architectureStatusSnapshot.json') return { ...snapshot, workflowSourceDigest: 'a' }
    return JSON.parse(fs.readFileSync('src/data/' + name.split('/').pop(), 'utf8'))
  }, module, module.exports)
  return module.exports.architectureConnections.find(c => c.id === 'booking-save')
}
assert.equal(load([complete]).status, 'connected')
for (const stage of stageIds) {
  const missing = structuredClone(complete); missing.stages[stage].status = 'Not Tested'
  assert.equal(load([missing]).status, 'partly_connected', stage)
}
assert.equal(load([complete], 'stale').status, 'partly_connected')
assert.equal(load([complete], 'stale').lastTest, null)
assert.equal(load([complete, complete]).status, 'partly_connected')
const noCase = structuredClone(complete); noCase.cases.pop()
assert.equal(load([noCase]).status, 'partly_connected')
const invalidTime = { ...complete, at: 'invalid' }
assert.equal(load([invalidTime]).lastTest, null)
assert.equal(load([{ ...complete, source: 'Invented real success' }]).status, 'partly_connected')
const failed = structuredClone(complete); failed.status = 'failed'; failed.stages.audit.status = 'Failed'
assert.equal(load([failed]).status, 'failed')
console.log('PASS: complete per-connection evidence required; missing stages, missing cases, stale source, duplicate IDs, invalid time and untrusted sources cannot become Connected.')
