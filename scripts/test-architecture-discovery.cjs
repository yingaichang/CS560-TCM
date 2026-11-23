const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { scan, safePath } = require('./update-architecture-status.cjs')

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-scan-'))
try {
  fs.mkdirSync(path.join(temporary, 'src/app/api/weekly'), { recursive: true })
  fs.mkdirSync(path.join(temporary, 'src/components'), { recursive: true })
  fs.writeFileSync(path.join(temporary, 'src/app/api/weekly/route.ts'), 'export async function GET() { return null }\n')
  fs.writeFileSync(path.join(temporary, 'src/components/Weekly.tsx'), "fetch('/api/weekly?token=SENSITIVE_QUERY_CANARY'); fetch('/api/later', { method: 'POST', body: 'PRIVATE_BODY_CANARY' }); fetch('https://example.test/PRIVATE_URL_CANARY')\n")
  fs.writeFileSync(path.join(temporary, '.env'), 'PRIVATE_ENV_CANARY')
  fs.writeFileSync(path.join(temporary, 'private.log'), 'PRIVATE_LOG_CANARY')
  const definitions = { componentDefinitions: {}, connectionDefinitions: [] }
  let snapshot = scan(temporary, definitions)
  assert.equal(snapshot.routes.length, 1)
  assert.equal(snapshot.connections.length, 2)
  assert.equal(snapshot.connections.find(item => item.path === '/api/weekly').status, 'connected')
  assert.equal(snapshot.connections.find(item => item.path === '/api/later').status, 'partly_connected')
  for (const value of ['SENSITIVE_QUERY_CANARY', 'PRIVATE_BODY_CANARY', 'PRIVATE_ENV_CANARY', 'PRIVATE_LOG_CANARY', 'PRIVATE_URL_CANARY']) {
    assert.ok(!JSON.stringify(snapshot).includes(value), 'Snapshot must contain only safe structural metadata')
  }
  fs.mkdirSync(path.join(temporary, 'src/app/api/later'), { recursive: true })
  fs.writeFileSync(path.join(temporary, 'src/app/api/later/route.ts'), 'export async function POST() { return null }\n')
  snapshot = scan(temporary, definitions)
  assert.equal(snapshot.connections.find(item => item.path === '/api/later').status, 'connected', 'New weekly handler must be discovered on the next scan')
  fs.writeFileSync(path.join(temporary, 'src/app/api/later/route.ts'), 'export async function GET() { return null }\n')
  snapshot = scan(temporary, definitions)
  assert.equal(snapshot.connections.find(item => item.path === '/api/later').status, 'partly_connected', 'Wrong method must not count as connected')
  assert.ok(!safePath('.env') && !safePath('src/../.env') && !safePath('private.log'))
  const reference = { path: 'src/components/Weekly.tsx', symbol: 'weekly', anchor: 'NO_LONGER_PRESENT' }
  snapshot = scan(temporary, { componentDefinitions: { sample: { evidence: [reference] } }, connectionDefinitions: [] })
  assert.equal(snapshot.evidence['src/components/Weekly.tsx|weekly'].valid, false)
  console.log('Passed automatic discovery, weekly additions, method matching, stale evidence, and sensitive-data exclusion checks.')
} finally {
  const absolute = path.resolve(temporary)
  const expectedPrefix = path.resolve(os.tmpdir()) + path.sep + 'architecture-scan-'
  if (!absolute.startsWith(expectedPrefix)) throw new Error('Unexpected temporary test directory')
  fs.rmSync(absolute, { recursive: true, force: true })
}
