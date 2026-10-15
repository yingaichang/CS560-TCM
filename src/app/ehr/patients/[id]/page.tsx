import { PatientRecordRoute } from '../../EhrScreens'

export default async function EhrPatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PatientRecordRoute id={id} />
}