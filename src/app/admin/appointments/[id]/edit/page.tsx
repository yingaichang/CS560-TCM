import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="修改預約"
      description={`預約編號：${id}。此頁為介面架構，修改表單與資料儲存尚未實作。`}
      backHref="/admin/appointments"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此調整預約資料。現有清單中的日期、時段與取消操作仍可使用。</p>
      </div>
    </AdminPageScaffold>
  )
}
