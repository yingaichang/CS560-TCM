const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
function load(file, actor, calls) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const target = { exports: {} }
  const overrides = {
    '@/lib/ehrAuthorization': { authorizeEhrRequest: async roles => { calls.push(roles); return actor && roles.includes(actor.role) ? actor : null } },
    '@/lib/architectureStatusAccess': { canViewArchitectureStatus: async () => actor?.role === 'admin' },
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND') } },
    '../../components/ClerkAuthControls': { __esModule: true, default: () => null },
    '../../components/AdminSidebar': { __esModule: true, default: () => null },
    './EhrShell': { __esModule: true, default: ({ children }) => React.createElement('div', null, children) },
    './ehr.css': {},
  }
  new Function('require','module','exports',code)(name => Object.hasOwn(overrides,name) ? overrides[name] : require(name),target,target.exports)
  return target.exports.default
}
async function main() {
  for (const role of [null,'user','patient','student','admin','clinic_staff','provider','billing_staff']) {
    for (const [file,allowed] of [['src/app/admin/layout.tsx',['admin','clinic_staff']],['src/app/ehr/layout.tsx',['admin','clinic_staff','provider','billing_staff']]]) {
      const calls = []
      const layout = load(file,role ? {role} : null,calls)
      const operation = layout({children: React.createElement('p',null,'PROTECTED_CHILD')})
      if (allowed.includes(role)) assert.ok(renderToStaticMarkup(await operation).includes('PROTECTED_CHILD'))
      else await assert.rejects(operation,/NOT_FOUND/)
      assert.deepEqual(calls,[allowed])
    }
  }
  console.log('PASS: admin/EHR layouts enforce role boundaries before rendering children across 16 access scenarios.')
}
main().catch(error=>{console.error(error);process.exitCode=1})
