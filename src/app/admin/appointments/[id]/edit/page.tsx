import AdminPageScaffold from '@/components/AdminPageScaffold'
import AppointmentEditor from '@/components/admin/AppointmentEditor'

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="修改預約"
      description={`預約編號：${id}。修改會檢查版本、休診日及時段衝突。`}
      backHref="/admin/appointments"
    >
      <AppointmentEditor id={id} />
    </AdminPageScaffold>
  )
}
