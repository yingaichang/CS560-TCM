import AdminPageScaffold from '@/components/AdminPageScaffold'
import PatientIntakeForm from '@/components/admin/PatientIntakeForm'

export default function NewPatientPage() {
  return <AdminPageScaffold title="病人初診資料表" description="請依序填寫中醫診所所需的病人初診資料。" backHref="/admin/patients" backLabel="返回病人清單">
    <PatientIntakeForm />
  </AdminPageScaffold>
}
