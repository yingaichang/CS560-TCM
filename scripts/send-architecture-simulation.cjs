const { randomUUID } = require('node:crypto')
class SimulationError extends Error {}

async function main() {
  if (process.env.NODE_ENV !== 'development' || process.env.ARCHITECTURE_SIMULATION_ENABLED !== 'true') throw new SimulationError('Development simulation flag is required; production is never supported.')
  const origin = new URL(process.env.ARCHITECTURE_SIMULATION_ORIGIN || 'http://localhost:3000')
  if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) || !['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new SimulationError('Only a loopback development origin is allowed.')
  const cookie = process.env.ARCHITECTURE_TEST_SESSION_COOKIE
  if (!cookie || /[\r\n]/.test(cookie)) throw new SimulationError('An authenticated development administrator session cookie is required; there is no login bypass.')
  const headers = { Cookie: cookie, Origin: origin.origin, 'Content-Type': 'application/json' }
  const options = { headers, redirect: 'error', signal: AbortSignal.timeout(35_000) }
  const endpoint = origin.origin + '/api/admin/development/architecture-tests'
  const response = await fetch(endpoint, options)
  if (!response.ok) throw new SimulationError('Administrator catalog request was rejected (HTTP ' + response.status + ').')
  const catalog = await response.json()
  if (!catalog.simulationEnabled) throw new SimulationError('Server-side development simulation is disabled.')
  const scenario = process.argv[2] || 'kiosk-arrival'
  const selected = catalog.scenarios?.find(item => item.id === scenario)
  if (!selected) throw new SimulationError('Unknown simulation scenario.')
  const result = await fetch(endpoint + '/simulate', { ...options, signal: AbortSignal.timeout(35_000), method: 'POST', body: JSON.stringify({ runId: randomUUID(), source: 'Development Simulation', scenario, input: selected.fixture }) })
  if (!result.ok) throw new SimulationError('Simulation was rejected (HTTP ' + result.status + ').')
  const run = await result.json()
  if (run.source !== 'Development Simulation') throw new SimulationError('Unexpected simulation source.')
  const statuses = new Set(['Passed', 'Failed', 'Not Tested', 'Planned', 'Not Applicable'])
  console.log(JSON.stringify({ source: run.source, status: statuses.has(run.status) ? run.status : 'Not Tested', steps: (run.steps || []).filter(step => /^[a-z0-9-]{1,64}$/.test(step.id)).map(step => ({ id: step.id, status: statuses.has(step.status) ? step.status : 'Not Tested' })) }, null, 2))
}
if (require.main === module) main().catch(error => { console.error(error instanceof SimulationError ? error.message : 'Simulation failed; request details withheld.'); process.exitCode = 1 })
module.exports = { main }
