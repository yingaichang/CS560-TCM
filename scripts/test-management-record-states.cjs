const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

async function renderDirectory(response) {
  const states = [], effects = []
  let cursor = 0, initialized = false, resolveFetch
  const originalFetch = global.fetch
  global.fetch = () => new Promise(resolve => { resolveFetch = resolve })
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('src/app/ehr/EhrScreens.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  const overrides = {
    react: { ...React, useState: initial => { const index = cursor++; if (!initialized) states[index] = initial; return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }] }, useEffect: callback => { if (!initialized) effects.push(callback) } },
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@/lib/chinese': { chineseText: value => value },
    '@/lib/ehr/catalog': { medicalConditions: [], symptomGroups: [] },
    './EncounterQueueScreen': { __esModule: true, default: () => null },
    '@/components/admin/PatientIntakeForm': { __esModule: true, default: () => null },
    './WorkflowScreen': { __esModule: true, default: () => null },
  }
  try {
    new Function('require', 'module', 'exports', code)(name => Object.hasOwn(overrides, name) ? overrides[name] : require(name), module, module.exports)
    function render() { cursor = 0; const element = module.exports.PatientDirectoryScreen(); initialized = true; return renderToStaticMarkup(element) }
    const initial = render()
    assert.ok(initial.includes('載入中'))
    assert.ok(!initial.includes('沒有符合條件'), 'Loading must not be shown as an empty database')
    effects.forEach(callback => callback())
    resolveFetch(response)
    await new Promise(resolve => setImmediate(resolve))
    return render()
  } finally { global.fetch = originalFetch }
}

async function main() {
  const failure = await renderDirectory({ ok: false, json: async () => ({ error: 'synthetic denial' }) })
  assert.ok(failure.includes('role="alert"'))
  assert.ok(failure.includes('無法載入病人清單'))
  assert.ok(!failure.includes('沒有符合條件'))
  assert.ok(!failure.includes('Avery'), 'Failed requests must not substitute demo patients')
  const empty = await renderDirectory({ ok: true, json: async () => ({ patients: [] }) })
  assert.ok(empty.includes('沒有符合條件的已儲存紀錄'))
  assert.ok(!empty.includes('role="alert"'))
  const saved = await renderDirectory({ ok: true, json: async () => ({ patients: [{ id: 'synthetic-record', patientId: 'SYN-PERSISTED', firstName: 'Fictional', lastName: 'Patient', dateOfBirth: null, gender: null, phone: null, email: null, preferredLanguage: null, status: 'active', profile: null, createdAt: '2026-01-01T00:00:00Z' }] }) })
  assert.ok(saved.includes('SYN-PERSISTED'))
  assert.ok(saved.includes('href="/ehr/patients/synthetic-record"'))
  assert.ok(saved.includes('1 筆紀錄'))
  assert.ok(!saved.includes('沒有符合條件'))
  console.log('PASS: rendered management directory distinguishes loading, failure, empty and saved records without fictional fallback.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
