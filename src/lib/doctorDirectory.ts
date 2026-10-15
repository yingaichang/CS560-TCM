// Maps the doctorId slug stored on Appointment records back to a display name.
// Mirrors the doctorIdMap used when appointments are created in
// src/app/api/appointments/route.ts.
export const doctorNameById: Record<string, string> = {
  'doctor-li-ming-zhi': '李明智醫師',
  'doctor-wang-fang-yu': '王芳妤醫師',
  'doctor-zhang-wei-xiang': '張瑋翔醫師',
  'doctor-chen-ya-qi': '陳雅琪醫師',
}

export const getDoctorName = (doctorId: string) => doctorNameById[doctorId] || doctorId
