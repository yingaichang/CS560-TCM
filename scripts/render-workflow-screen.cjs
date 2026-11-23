const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

// Exercises real receiving component effects with responses from the isolated
// application's actual handlers. No browser, identity or external service claim.
module.exports = async function renderScreen(file, exported, props, receive) {
  const states = [], effects = [], pending = [], cleanups = []
  let cursor = 0, initialized = false
  const previousFetch = global.fetch
  const cache = new Map()
  global.fetch = (url, options) => {
    const promise = Promise.resolve().then(() => receive(String(url), options))
    pending.push(promise)
    return promise
  }
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports
    const module = { exports: {} }; cache.set(relative, module)
    const code = ts.transpileModule(fs.readFileSync(path.resolve(relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText
    const imports = {
      react: { ...React, useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value }] }, useEffect(callback) { if (!initialized) effects.push(callback) }, useCallback: callback => callback, useMemo: callback => callback(), useRef: initial => ({ current: initial }) },
      'next/link': { __esModule: true, default: ({ children, ...attributes }) => React.createElement('a', attributes, children) },
      'next/navigation': { useRouter: () => ({ push() {} }), usePathname: () => '/admin', useSearchParams: () => new URLSearchParams() },
      '@/lib/chinese': { chineseText: value => value },
      './EncounterQueueScreen': { __esModule: true, default: () => null },
      './WorkflowScreen': { __esModule: true, default: () => null },
    }
    new Function('require', 'module', 'exports', code)(name => {
      if (Object.hasOwn(imports, name)) return imports[name]
      if (name.startsWith('@/')) {
        const stem = 'src/' + name.slice(2)
        return load(['.ts', '.tsx'].map(ext => stem + ext).find(file => fs.existsSync(file)))
      }
      return require(name)
    }, module, module.exports)
    return module.exports
  }
  try {
    const Screen = load(file)[exported]
    function render() { cursor = 0; const element = Screen(props); initialized = true; return renderToStaticMarkup(element) }
    render()
    effects.forEach(callback => { const cleanup = callback(); if (typeof cleanup === 'function') cleanups.push(cleanup) })
    for (let turn = 0; turn < 20; turn++) { await Promise.allSettled(pending); await new Promise(resolve => setImmediate(resolve)) }
    return render()
  } finally { cleanups.forEach(cleanup => cleanup()); global.fetch = previousFetch }
}
