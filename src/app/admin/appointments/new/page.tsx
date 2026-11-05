import AdminPageScaffold from '@/components/AdminPageScaffold'

export default function NewAppointmentPage() {
  return (
    <AdminPageScaffold
      title="新增預約"
      description="建立病人預約的表單頁面架構。資料儲存尚未實作。"
      backHref="/admin/appointments"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此填寫病人、醫師、日期、時段與服務項目。</p>
        <button type="button" disabled className="mt-5 rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600">
          儲存預約（尚未開放）
        </button>
      </div>
    </AdminPageScaffold>
  )
}
