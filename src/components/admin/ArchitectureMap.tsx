import {
  architectureComponents, architectureConnections, architectureWorkflows, architectureDiscovery, systemStatuses,
  type ComponentId, type ConnectionStatus, type Evidence, type TestRecord,
} from '@/lib/architectureMap'
import ArchitectureAutoRefresh from './ArchitectureAutoRefresh'

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const display = systemStatuses[status]
  return <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${display.style}`}>{display.label}</span>
}

function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return <ul className="space-y-2 text-sm leading-6 text-gray-600">{evidence.map(item => (
    <li key={`${item.path}-${item.symbol}`}>
      <span className="font-medium text-gray-900">安全來源參照：</span><code className="break-all rounded bg-gray-50 px-1.5 py-0.5">{item.path}:{item.line > 0 ? item.line : '待確認'}</code>
      <p className="mt-1">查核類型：{item.kind === 'plan' ? '期末部署需求文件' : '程式碼路徑'}。不展示原始碼內容或日誌。</p>
    </li>
  ))}</ul>
}

function LastTest({ test }: { test: TestRecord | null }) {
  if (!test) return <p className="text-sm leading-6 text-gray-600">尚無可對應的測試時間；程式碼查核時間不當作服務測試時間。</p>
  return <div className="space-y-1 text-sm leading-6 text-gray-600">
    <p><time dateTime={test.at}>{new Intl.DateTimeFormat('zh-TW', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'long' }).format(new Date(test.at))}</time>（美國洛杉磯時間）</p>
    <p>結果：{test.result === 'passed' ? '通過本機隔離測試。' : '最近一次測試未通過，請重新檢查。'}</p><p>範圍：{test.scope}</p>
    <p>驗證來源：{test.command === 'node scripts/test-kiosk-connection.cjs' ? '報到畫面與服務整合測試' : '專案架構回歸檢查'}。</p>
    <p>這是上次執行的紀錄；重新整理頁面不會重新測試。</p>
  </div>
}

export default function ArchitectureMap({ kioskTest }: { kioskTest?: TestRecord | null } = {}) {
  // Runtime evidence overrides the bundled record, including explicit absence.
  const testFor = (kind: 'component' | 'connection', id: string, original: TestRecord | null) =>
    kioskTest !== undefined && (kind === 'component' ? ['kiosk', 'kioskApi', 'sms'] : ['kiosk-request', 'kiosk-save', 'kiosk-sms', 'kiosk-audit']).includes(id)
      ? kioskTest : original
  const components = Object.entries(architectureComponents) as [ComponentId, (typeof architectureComponents)[ComponentId]][]
  return (
    <section className="space-y-6" aria-labelledby="connection-map-title">
      <div>
        <h2 id="connection-map-title" className="text-2xl font-semibold text-gray-900">專案架構連線圖</h2>
        <p className="mt-3 max-w-4xl text-base leading-7 text-gray-600">追蹤 {architectureWorkflows.length} 條主要流程，逐項列出元件與連線的目前狀態、交換資料、支持證據、最後測試紀錄及缺少條件。</p>
        <ArchitectureAutoRefresh />
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        業務判定由專案證據維護；開發模式在來源變更後自動掃描，正式建置前也會更新快照。失去來源依據的已連接項目會改為未知，新增的本機服務呼叫會自動列入下方盤點。「已連接」不代表已完成正式環境整合測試。
        畫面存在、設定存在、資料模型存在，不能單獨證明外部服務成功或資料已儲存。未測試標為未知，不會憑空標示失敗；規劃中的連線也會列在相關元件中。
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5" aria-labelledby="discovery-title">
        <h3 id="discovery-title" className="text-xl font-semibold text-gray-900">每週新增服務與連線自動盤點</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">最近來源掃描：{architectureDiscovery.generatedAt ? new Intl.DateTimeFormat('zh-TW', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'long' }).format(new Date(architectureDiscovery.generatedAt)) : '尚未掃描'}（美國洛杉磯時間）。這是來源掃描時間，不是服務測試時間。</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">自動發現本機服務路由與固定網址的程式碼呼叫；動態網址、遠端主機、資料庫及外部服務須另提供驗證。Ubuntu 主機與資料庫伺服器維持規劃中，直到有經審核的實際連通證據。</p>
        <details className="mt-4"><summary className="cursor-pointer font-semibold text-[#355C46]">查看安全盤點摘要：{architectureDiscovery.routes.length} 個服務元件、{architectureDiscovery.connections.length} 條呼叫</summary>
          <ul className="mt-3 space-y-3 text-sm leading-6">{architectureDiscovery.routes.map(route => <li key={route.path} className="rounded-lg border p-3"><p className="font-semibold text-gray-900">服務元件：<code className="break-all">{route.path}</code></p><p>狀態：{route.status === 'connected' ? '已連接（有固定網址呼叫與對應處理端）' : '未知（未發現可確認的固定網址呼叫）'}</p><p>相關呼叫元件：{[...new Set(architectureDiscovery.connections.filter(item => item.handler === route.file).map(item => item.caller))].join('、') || '尚未確認'}</p><p>方法：{route.methods.join('、') || '未辨識'}。證據：<code className="break-all">{route.file}</code></p><p>交換資料：服務請求與回應；不收集或展示內容。最後服務測試：尚無紀錄。</p><p>缺少條件：仍需執行授權與實際服務測試。安全錯誤訊息：未記錄可核對的失敗訊息。</p></li>)}</ul>
          <ul className="mt-3 space-y-3 text-sm leading-6">{architectureDiscovery.connections.map((connection, index) => <li key={`${connection.caller}-${connection.line}-${index}`} className="rounded-lg border p-3"><p className="font-semibold text-gray-900">連線：<code className="break-all">{connection.caller}</code> → <code className="break-all">{connection.path}</code></p><p>狀態：{connection.status === 'connected' ? '已連接（程式碼證據）' : '部分連接（尚缺可對應的處理端）'}</p><p>交換資料：{connection.method} 請求與服務回應；內容未擷取。證據：來源第 {connection.line} 行{connection.handler ? `；處理端 ${connection.handler}` : '；處理端尚待確認'}。</p><p>最後服務測試：尚無紀錄。缺少條件：{connection.handler ? '仍需實際服務與授權驗證。' : '補齊對應請求方法的服務處理端。'}</p><p>安全錯誤訊息：{connection.handler ? '未記錄可核對的失敗訊息。' : '找不到可確認的對應處理端。'}</p></li>)}</ul>
        </details>
        <p className="mt-3 text-sm leading-6 text-gray-600">只顯示元件名稱、來源路徑、方法、狀態及時間。憑證、連線設定值、病人或學生資料、付款明細、醫療內容及原始日誌不會載入儀表板。</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="五種狀態圖例與數量">
        {(Object.keys(systemStatuses) as ConnectionStatus[]).map(status => (
          <div key={status} className={`rounded-xl border p-4 ${systemStatuses[status].style}`}>
            <p className="font-semibold">{systemStatuses[status].label}</p>
            <p className="mt-2 text-sm">元件 {components.filter(([, item]) => item.status === status).length} 個・連線 {architectureConnections.filter(item => item.status === status).length} 條</p>
            <p className="mt-2 text-sm leading-6">{systemStatuses[status].explanation}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5" aria-labelledby="components-title">
        <h3 id="components-title" className="text-xl font-semibold text-gray-900">主要元件與責任（{components.length} 個）</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {components.map(([id, component]) => {
            const related = architectureConnections.filter(item => item.from === id || item.to === id)
            const peers = [...new Set(related.map(item => item.from === id ? item.to : item.from))]
            return <article key={id} id={`component-${id}`} className="scroll-mt-6 rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-medium text-[#355C46]">{component.layer}</p><h4 className="mt-1 font-semibold text-gray-900">{component.name}</h4></div><StatusBadge status={component.status} /></div>
              <p className="mt-3 text-sm leading-6 text-gray-700">{component.purpose}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">目前判定：{component.assessment}</p>
              <details className="mt-3 border-t border-gray-100 pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#355C46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">查看連線、證據與測試紀錄</summary>
                <dl className="mt-4 space-y-4 text-sm leading-6">
                  <div><dt className="font-semibold text-gray-900">相關元件（含規劃連線）</dt><dd className="mt-1 flex flex-wrap gap-2">{peers.map(peer => <a key={peer} href={`#component-${peer}`} className="text-[#355C46] underline underline-offset-4">{architectureComponents[peer].name}</a>)}</dd></div>
                  <div><dt className="font-semibold text-gray-900">連線方向與交換資料</dt><dd className="mt-1"><ul className="space-y-3">{related.map(item => <li key={item.id}><a href={`#connection-${item.id}`} className="font-medium text-[#355C46] underline underline-offset-4">{architectureComponents[item.from].name} → {architectureComponents[item.to].name}（{systemStatuses[item.status].label}）</a><p className="mt-1 text-gray-600">{item.data}</p></li>)}</ul></dd></div>
                  <div><dt className="font-semibold text-gray-900">支持證據（相關程式碼）</dt><dd className="mt-2"><EvidenceList evidence={component.evidence} /></dd></div>
                  <div><dt className="font-semibold text-gray-900">最後測試時間與範圍</dt><dd className="mt-1"><LastTest test={testFor('component', id, component.lastTest)} /></dd></div>
                  <div><dt className="font-semibold text-gray-900">缺少條件或待驗證事項</dt><dd className="mt-1 text-gray-700">{component.missingRequirement}</dd></div>
                  <div><dt className="font-semibold text-gray-900">安全錯誤訊息</dt><dd className="mt-1 text-gray-600">{component.safeError ? '來源狀態需要重新確認，請執行安全檢查。' : '未記錄可核對的失敗訊息。'}</dd></div>
                </dl>
              </details>
            </article>
          })}
        </div>
      </section>

      <nav aria-label="架構流程索引" className="flex flex-wrap gap-2">
        {architectureWorkflows.map(workflow => <a key={workflow.id} href={`#flow-${workflow.id}`} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#355C46] hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">{workflow.name}</a>)}
      </nav>
      {architectureWorkflows.map(workflow => (
        <section key={workflow.id} id={`flow-${workflow.id}`} aria-labelledby={`flow-title-${workflow.id}`} className="scroll-mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 id={`flow-title-${workflow.id}`} className="text-xl font-semibold text-gray-900">{workflow.name}</h3>
          <p className="mt-2 text-base leading-7 text-gray-600">{workflow.outcome}</p>
          <ol className="mt-5 space-y-4">{workflow.connections.map(id => {
            const connection = architectureConnections.find(item => item.id === id)!
            return <li key={id} id={`connection-${id}`} className="scroll-mt-6 rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold sm:text-base">
                <a href={`#component-${connection.from}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 underline underline-offset-4">{architectureComponents[connection.from].name}</a>
                <span aria-label="資料傳送至" className="text-gray-500">→</span>
                <a href={`#component-${connection.to}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 underline underline-offset-4">{architectureComponents[connection.to].name}</a>
                <StatusBadge status={connection.status} />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{connection.description}</p>
              <dl className="mt-3 space-y-3 text-sm leading-6">
                <div><dt className="font-semibold text-gray-900">交換資料</dt><dd className="mt-1 text-gray-700">{connection.data}</dd></div>
                <div><dt className="font-semibold text-gray-900">目前判定</dt><dd className="mt-1 text-gray-700">{connection.assessment}</dd></div>
                <div><dt className="font-semibold text-gray-900">最後測試時間與範圍</dt><dd className="mt-1"><LastTest test={testFor('connection', connection.id, connection.lastTest)} /></dd></div>
                <div><dt className="font-semibold text-gray-900">缺少條件或待驗證事項</dt><dd className="mt-1 text-gray-700">{connection.missingRequirement}</dd></div>
                <div><dt className="font-semibold text-gray-900">安全錯誤訊息</dt><dd className="mt-1 text-gray-600">{connection.safeError ? '來源狀態需要重新確認，請執行安全檢查。' : '未記錄可核對的失敗訊息。'}</dd></div>
              </dl>
              <details className="mt-3 border-t border-gray-100 pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#355C46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">支持證據與下一步</summary>
                <div className="mt-3"><EvidenceList evidence={connection.evidence} /></div>
                <p className="mt-3 text-sm leading-6 text-gray-700"><strong>下一步：</strong>{connection.next}</p>
              </details>
            </li>
          })}</ol>
        </section>
      ))}
    </section>
  )
}
