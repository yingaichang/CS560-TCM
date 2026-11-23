import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseKioskTestReport } from './kioskTestReport'

// Read afresh for every authorized page request, rather than a bundled JSON import.
// The test runner and application must share this checkout/artifact directory.
export function readKioskTestReport() {
  try {
    return parseKioskTestReport(JSON.parse(readFileSync(join(process.cwd(), 'src/data/kioskConnectionVerification.json'), 'utf8')))
  } catch {
    // Missing/invalid evidence must not fall back to an old successful snapshot.
    return null
  }
}
