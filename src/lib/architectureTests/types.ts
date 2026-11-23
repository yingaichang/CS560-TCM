export const testStatuses = ['Passed', 'Failed', 'Not Tested', 'Planned', 'Not Applicable'] as const
export type TestStatus = typeof testStatuses[number]
export const simulationSource = 'Development Simulation' as const
export type TestStep = { id: string; name: string; status: TestStatus; detail: string; scope: 'Contract / Sandbox' | 'Real Service / Device' }
export type TestRun = { runId: string; scenario: string; source: 'Development Simulation' | 'Application Read-only Check'; checkedAt: string; status: TestStatus; steps: TestStep[]; duplicate?: boolean }
export function aggregateStatus(steps: Pick<TestStep, 'status'>[]): TestStatus {
  if (!steps.length) return 'Not Tested'
  if (steps.some(x => x.status === 'Failed')) return 'Failed'
  if (steps.some(x => x.status === 'Planned')) return 'Planned'
  if (steps.some(x => x.status === 'Not Tested')) return 'Not Tested'
  return steps.every(x => x.status === 'Not Applicable') ? 'Not Applicable' : 'Passed'
}
