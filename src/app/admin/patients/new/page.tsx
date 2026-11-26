import AdminPageScaffold from '@/components/AdminPageScaffold'
import PatientIntakeForm from '@/components/admin/PatientIntakeForm'

export default function NewPatientPage() {
  return <AdminPageScaffold title="Patient Intake Form" description="Complete the patient’s intake information for Traditional Chinese Medicine care." backHref="/admin/patients" backLabel="Back to Patients">
    <PatientIntakeForm />
  </AdminPageScaffold>
}
