const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const { update } = require('./update-architecture-status.cjs')

const root = path.resolve(__dirname, '..')
update(root)
let timer
let pending = false
let closed = false
function refresh() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (pending || closed) return
    pending = true
    try { update(root); console.log('Architecture source inventory refreshed.') }
    catch { console.error('Architecture refresh unavailable; existing snapshot retained.') }
    finally { pending = false }
  }, 500)
}
const watchers = ['src', 'prisma', 'docs'].map(directory => fs.watch(path.join(root, directory), { recursive: true }, (_event, filename) => {
  if (!filename || /architectureStatusSnapshot\.json$/.test(String(filename))) return
  if (/\.(tsx?|md|prisma|json)$/.test(String(filename))) refresh()
}))
const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', windowsHide: true })
function close() { closed = true; clearTimeout(timer); watchers.forEach(watcher => watcher.close()) }
child.on('exit', code => { close(); process.exitCode = code ?? 1 })
child.on('error', () => { close(); console.error('Development server could not start.'); process.exitCode = 1 })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { close(); child.kill(signal) })
