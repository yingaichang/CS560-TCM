const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const roots = ['src/', 'public/', 'prisma/', 'scripts/', 'docs/', 'e2e/']
const files = new Set(['.gitignore', '.dockerignore', 'package.json', 'package-lock.json', 'next.config.js', 'next-env.d.ts', 'tsconfig.json', 'tailwind.config.ts', 'postcss.config.js', '.eslintrc.json', 'playwright.config.ts', 'README.md'])
function allowed(file) {
  return (files.has(file) || roots.some(root => file.startsWith(root)))
    && !/(^|\/)(\.env(?:\..*)?|node_modules|\.next|\.git|cse03-ssh-YingAi)(\/|$)/i.test(file)
    && !/\.(?:db|sqlite|sqlite3|pem|key|p12|pfx|log)(?:-(?:wal|shm|journal))?$/i.test(file)
    && file !== 'prisma/schema.production.prisma'
}
function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000, maxBuffer: 32 * 1024 * 1024 })
}
function changes(root) {
  const parts = git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).split('\0')
  const result = []
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue
    const status = parts[i].slice(0, 2)
    const file = parts[i].slice(3)
    result.push({ file, status })
    if (/[RC]/.test(status)) result.push({ file: parts[++i], status })
  }
  return result
}
function snapshot(root) {
  return changes(root).filter(item => allowed(item.file)).map(item => {
    let stamp = 'deleted'
    try { const stat = fs.statSync(path.join(root, item.file)); stamp = `${stat.mtimeMs}:${stat.size}` } catch {}
    return `${item.status}:${item.file}:${stamp}`
  }).sort().join('\n')
}
function checkContent(root, file) {
  const full = path.join(root, file)
  if (!fs.existsSync(full)) return
  if (fs.lstatSync(full).isSymbolicLink()) throw new Error(`Symbolic link requires manual review: ${file}`)
  const data = fs.readFileSync(full)
  if (data.length > 20 * 1024 * 1024) throw new Error(`Large file requires manual review: ${file}`)
  if (/-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----|\b(?:sk_(?:live|test)_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/.test(data.toString('utf8'))) {
    throw new Error(`Possible credential requires manual review: ${file}`)
  }
}
function publish(root) {
  if (git(root, ['branch', '--show-current']).trim() !== 'main') throw new Error('Auto-publish only operates on main')
  const current = changes(root)
  const stagedOutsideScope = current.filter(item => item.status[0] !== ' ' && item.status !== '??' && !allowed(item.file))
  if (stagedOutsideScope.length) throw new Error('Staged files outside website scope require a manual commit')
  const scoped = current.filter(item => allowed(item.file))
  for (const { file } of scoped) checkContent(root, file)
  const selected = [...new Set(scoped.filter(item => item.status === '??' || item.status[1] !== ' ').map(item => item.file))]
  if (selected.length) git(root, ['add', '-A', '--', ...selected])
  if (scoped.length) {
    const staged = git(root, ['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean)
    const retained = new Set(git(root, ['diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z']).split('\0').filter(Boolean))
    for (const file of staged) {
      if (!allowed(file)) throw new Error(`Staged file outside website scope: ${file}`)
      // Inspect the actual staged blob too; do not publish a different staged credential.
      if (!retained.has(file)) continue
      const blob = git(root, ['show', `:${file}`])
      if (/-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----|\b(?:sk_(?:live|test)_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/.test(blob)) {
        throw new Error(`Possible staged credential requires manual review: ${file}`)
      }
    }
    if (staged.length) git(root, ['commit', '-m', 'Auto-publish saved website changes'])
  }
  git(root, ['push', 'origin', 'main'])
  return git(root, ['rev-parse', '--short', 'HEAD']).trim()
}

async function watch(root) {
  const state = path.join(root, '.local-deploy')
  fs.mkdirSync(state, { recursive: true })
  const lock = path.join(state, 'publisher.lock')
  if (fs.existsSync(lock)) {
    const previous = Number(fs.readFileSync(lock, 'utf8'))
    try { process.kill(previous, 0); throw new Error('Auto-publisher is already running') }
    catch (error) { if (error.code !== 'ESRCH') throw error }
    fs.unlinkSync(lock)
  }
  fs.writeFileSync(lock, String(process.pid), { flag: 'wx' })
  const cleanup = () => { try { fs.unlinkSync(lock) } catch {} }
  process.on('exit', cleanup)
  process.on('SIGINT', () => process.exit(0))
  process.on('SIGTERM', () => process.exit(0))
  let last = '', changedAt = Date.now(), lastAttempt = 0
  const log = message => console.log(`${new Date().toISOString()} ${message}`)
  log('Watching saved website files; 45-second quiet period before commit/push to main.')
  let paused = false
  while (true) {
    try {
      const pauseRequested = fs.existsSync(path.join(state, 'paused'))
      if (pauseRequested !== paused) { paused = pauseRequested; log(paused ? 'Publishing paused by local operator.' : 'Publishing resumed.') }
      if (paused) { await new Promise(resolve => setTimeout(resolve, 5000)); continue }
      const next = snapshot(root)
      if (next !== last) { last = next; changedAt = Date.now() }
      if (Date.now() - changedAt >= 45000 && Date.now() - lastAttempt >= 60000) {
        const ahead = Number(git(root, ['rev-list', '--count', 'origin/main..HEAD']).trim())
        if (next || ahead) {
          lastAttempt = Date.now()
          log(`Pushed ${publish(root)}; Ubuntu will pick up main automatically.`)
          last = snapshot(root)
        }
      }
    } catch (error) {
      lastAttempt = Date.now()
      log(`Auto-publish stopped this attempt: ${error.message.split('\n')[0]}`)
    }
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}
module.exports = { allowed, snapshot, publish }
if (require.main === module) {
  const root = path.resolve(__dirname, '..')
  if (process.argv.includes('--once')) {
    try { console.log(`Pushed ${publish(root)}`) } catch (error) { console.error(error.message); process.exitCode = 1 }
  } else {
    watch(root).catch(error => { console.error(error.message); process.exitCode = 1 })
  }
}
