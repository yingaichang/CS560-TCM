export type DemoPatient = {
  id: string
  patientId: string
  firstName: string
  lastName: string
  age: number
  gender: string
  phone: string
  email: string
  language: string
  status: 'Active' | 'Intake due' | 'Follow-up'
  lastVisit: string
  nextVisit: string
  complaint: string
  emergencyContact: string
  relationship: string
  emergencyPhone: string
  dateOfBirth: string
  address: string
  createdAt: string
}

export const demoPatients: DemoPatient[] = [
  {
    id: 'demo-1001', patientId: 'YAI-DEMO-1001', firstName: 'Avery', lastName: 'Chen', age: 42,
    gender: 'Female', phone: '(555) 010-0101', email: 'avery.chen@example.test', language: 'English',
    status: 'Active', lastVisit: 'Sep 24, 2026', nextVisit: 'Oct 1, 2026', complaint: 'Neck and shoulder tension',
    emergencyContact: 'Morgan Chen', relationship: 'Partner', emergencyPhone: '(555) 010-0199', dateOfBirth: 'Feb 14, 1984', address: '240 Willow Lane · Oakland, CA 94612', createdAt: 'Aug 12, 2026',
  },
  {
    id: 'demo-1002', patientId: 'YAI-DEMO-1002', firstName: 'Jordan', lastName: 'Lee', age: 36,
    gender: 'Male', phone: '(555) 010-0102', email: 'jordan.lee@example.test', language: 'English',
    status: 'Intake due', lastVisit: 'New patient', nextVisit: 'Sep 29, 2026', complaint: 'Sleep and stress support',
    emergencyContact: 'Taylor Lee', relationship: 'Sibling', emergencyPhone: '(555) 010-0198', dateOfBirth: 'Jul 8, 1990', address: '19 Alder Street · Oakland, CA 94610', createdAt: 'Sep 28, 2026',
  },
  {
    id: 'demo-1003', patientId: 'YAI-DEMO-1003', firstName: 'Riley', lastName: 'Wong', age: 51,
    gender: 'Female', phone: '(555) 010-0103', email: 'riley.wong@example.test', language: 'Mandarin',
    status: 'Follow-up', lastVisit: 'Sep 18, 2026', nextVisit: 'Sep 30, 2026', complaint: 'Low back discomfort',
    emergencyContact: 'Casey Wong', relationship: 'Spouse', emergencyPhone: '(555) 010-0197', dateOfBirth: 'Nov 19, 1975', address: '412 Lakeview Avenue · Berkeley, CA 94704', createdAt: 'May 3, 2026',
  },
  {
    id: 'demo-1004', patientId: 'YAI-DEMO-1004', firstName: 'Sam', lastName: 'Patel', age: 29,
    gender: 'Non-binary', phone: '(555) 010-0104', email: 'sam.patel@example.test', language: 'English',
    status: 'Active', lastVisit: 'Sep 22, 2026', nextVisit: 'Oct 6, 2026', complaint: 'Digestive wellness',
    emergencyContact: 'Dev Patel', relationship: 'Parent', emergencyPhone: '(555) 010-0196', dateOfBirth: 'Apr 2, 1997', address: '78 Garden Court · Emeryville, CA 94608', createdAt: 'Jul 17, 2026',
  },
]