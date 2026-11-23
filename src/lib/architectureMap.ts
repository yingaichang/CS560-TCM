import kioskVerification from '@/data/kioskConnectionVerification.json'
import snapshot from '@/data/architectureStatusSnapshot.json'
import verification from '@/data/architectureStatusVerification.json'
import softwareVerification from '@/data/softwareConnectionVerification.json'

export type ConnectionStatus = 'connected' | 'partly_connected' | 'planned' | 'unknown' | 'failed'
export type Evidence = { kind: 'code' | 'plan'; path: string; symbol: string; anchor: string; line: number }
export type TestRecord = { at: string; command: string; scope: string; result: 'passed' | 'failed' }
export type ArchitectureComponent = {
  name: string; layer: string; purpose: string; status: ConnectionStatus; assessment: string
  missingRequirement: string; safeError: string | null; evidence: Evidence[]; lastTest: TestRecord | null
}
export type ComponentId = 'public' | 'admin' | 'clinical' | 'kiosk' | 'payment' | 'contact' | 'portals' | 'identity' | 'guard' | 'bookingApi' | 'patientApi' | 'clinicalWrite' | 'kioskApi' | 'checkout' | 'webhook' | 'contactApi' | 'audit' | 'db' | 'mail' | 'sms' | 'stripe' | 'registration' | 'ai' | 'ubuntuHost' | 'databaseServer'
export type ArchitectureConnection = {
  id: string; from: ComponentId; to: ComponentId; status: ConnectionStatus
  description: string; data: string; assessment: string; evidence: Evidence[]
  next: string; missingRequirement: string; safeError: string | null; lastTest: TestRecord | null
}

export const systemStatuses: Record<ConnectionStatus, { label: string; style: string; explanation: string }> = {
  connected: { label: '已連接', style: 'border-green-300 bg-green-50 text-green-900', explanation: '有可查核的程式碼路徑或測試證據；證據範圍不等於正式環境已驗證。' },
  partly_connected: { label: '部分連接', style: 'border-amber-300 bg-amber-50 text-amber-950', explanation: '已有部分實作，但仍有已知設定、環境或流程缺口。' },
  planned: { label: '規劃中', style: 'border-slate-300 bg-slate-100 text-slate-800', explanation: '已有需求或模型，所需連線或完整服務尚未建置。' },
  unknown: { label: '未知', style: 'border-blue-300 bg-blue-50 text-blue-950', explanation: '目前證據不足以確認實際服務或資料庫連線結果。' },
  failed: { label: '失敗', style: 'border-red-300 bg-red-50 text-red-950', explanation: '必須有可核對的失敗測試、服務回應或事件紀錄；不可僅因未測試而判定失敗。' },
}

function lastTest(kind: 'component' | 'connection', id: string): TestRecord | null {
  let latest: TestRecord | null = null
  for (const report of [verification, kioskVerification, softwareVerification]) {
    const targets: string[] = kind === 'component' ? report.components : report.connections
    if (!report.at || report.result !== 'passed' || !targets.includes(id)) continue
    if (!latest || Date.parse(report.at) > Date.parse(latest.at)) latest = { at: report.at, command: report.command, scope: report.scope, result: 'passed' }
  }
  return latest
}

export const componentDefinitions: Record<ComponentId, Omit<ArchitectureComponent, 'lastTest'>> = {
  "public": {
    "name": "公開預約表單",
    "layer": "操作介面",
    "purpose": "收集姓名、聯絡方式、醫師、時段及主訴",
    "status": "connected",
    "assessment": "表單已有送出預約的程式碼路徑。",
    "missingRequirement": "仍需實際預約服務與資料庫整合測試。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/components/appointment/AppointmentForm.tsx",
        "symbol": "fetch /api/appointments",
        "kind": "code",
        "anchor": "fetch('/api/appointments'",
        "line": 800
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "POST",
        "kind": "code",
        "anchor": "POST",
        "line": 79
      }
    ]
  },
  "admin": {
    "name": "管理後台",
    "layer": "操作介面",
    "purpose": "預約管理、使用者管理與系統狀態",
    "status": "partly_connected",
    "assessment": "預約、收件匣、實際本機帳號對應清單及受保護狀態頁已有實作；外部帳號異動尚未開放。",
    "missingRequirement": "外部帳號建立、停用及角色異動需要跨服務身分對應與同步復原規格。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/layout.tsx",
        "symbol": "ClerkProvider",
        "kind": "code",
        "anchor": "ClerkProvider",
        "line": 1
      },
      {
        "path": "src/app/sign-in/[[...sign-in]]/page.tsx",
        "symbol": "SignIn",
        "kind": "code",
        "anchor": "SignIn",
        "line": 1
      },
      {
        "path": "src/middleware.ts",
        "symbol": "auth.protect",
        "kind": "code",
        "anchor": "auth.protect",
        "line": 31
      },
      {
        "path": "src/app/admin/development/architecture-status/page.tsx",
        "symbol": "canViewArchitectureStatus / notFound",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 4
      },
      {
        "path": "src/app/admin/layout.tsx",
        "symbol": "showDevelopment",
        "kind": "code",
        "anchor": "showDevelopment",
        "line": 14
      },
      {
        "path": "src/middleware.ts",
        "symbol": "protectedRoots",
        "kind": "code",
        "anchor": "protectedRoots",
        "line": 5
      },
      {
        "path": "src/app/admin/users/page.tsx",
        "symbol": "AdminUsersPage",
        "kind": "code",
        "anchor": "AdminUsersPage",
        "line": 9
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "isUserAccessEvent / writeAuditLog",
        "kind": "code",
        "anchor": "isUserAccessEvent",
        "line": 29
      },
      {
        "path": "src/app/admin/appointments/page.tsx",
        "symbol": "fetchAppointments / AppointmentUpdates",
        "kind": "code",
        "anchor": "fetchAppointments",
        "line": 98
      },
      {
        "path": "src/app/api/appointments/[id]/route.ts",
        "symbol": "GET / PATCH / DELETE / authorizeEhrRequest",
        "kind": "code",
        "anchor": "GET",
        "line": 23
      },
      {
        "path": "src/app/admin/audit-logs/AuditLogViewer.tsx",
        "symbol": "fetch / verifyChain",
        "kind": "code",
        "anchor": "fetch",
        "line": 52
      },
      {
        "path": "src/app/api/admin/audit-logs/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 3
      },
      {
        "path": "src/app/api/admin/audit-logs/verify-chain/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 2
      },
      {
        "path": "src/app/admin/users/page.tsx",
        "symbol": "administrator local account directory",
        "kind": "code",
        "anchor": "prisma.user.findMany",
        "line": 15
      }
    ]
  },
  "clinical": {
    "name": "電子病歷工作區",
    "layer": "操作介面",
    "purpose": "病人建檔、初診問卷及病歷檢視",
    "status": "partly_connected",
    "assessment": "開發環境已接上看診、簽核、治療、帳務草稿、用藥與受授權接收畫面，隔離 PostgreSQL 測試通過；正式環境仍禁止臨床寫入。",
    "missingRequirement": "正式臨床寫入政策與實際使用者工作流程尚待驗證；不宣稱完成真實診療或收費。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientDirectoryScreen / NewPatientScreen / IntakeScreen",
        "kind": "code",
        "anchor": "PatientDirectoryScreen",
        "line": 36
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 116
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 51
      },
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "include / encounters / clinicalNote / documents",
        "kind": "code",
        "anchor": "include",
        "line": 51
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientRecordRoute / StoredProfileTabs",
        "kind": "code",
        "anchor": "PatientRecordRoute",
        "line": 308
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "ModuleScreen / ModuleTable / 新增看診紀錄",
        "kind": "code",
        "anchor": "ModuleScreen",
        "line": 294
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Encounter / ClinicalNote / Treatment / BillingRecord / Document",
        "kind": "code",
        "anchor": "Encounter",
        "line": 41
      },
      {
        "path": "src/app/ai-health-analysis/page.tsx",
        "symbol": "RoutePlaceholderPage",
        "kind": "code",
        "anchor": "RoutePlaceholderPage",
        "line": 1
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "尚未開始問診 / 智慧語音問診",
        "kind": "code",
        "anchor": "尚未開始問診",
        "line": 140
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AiVoiceInterview",
        "kind": "code",
        "anchor": "AiVoiceInterview",
        "line": 120
      },
      {
        "path": "src/app/api/ehr/workflow/route.ts",
        "symbol": "development workflow / runSoftwareCommand",
        "kind": "code",
        "anchor": "runSoftwareCommand",
        "line": 7
      },
      {
        "path": "src/app/ehr/WorkflowScreen.tsx",
        "symbol": "saved workflow records and explicit commands",
        "kind": "code",
        "anchor": "fetch('/api/ehr/workflow'",
        "line": 30
      }
    ]
  },
  "kiosk": {
    "name": "自助報到介面",
    "layer": "操作介面",
    "purpose": "查詢、驗證及確認報到",
    "status": "partly_connected",
    "assessment": "手機查詢、驗證及報到有程式碼；掃描設備與簡訊投遞未完成驗證。",
    "missingRequirement": "已有報到後看診串接；仍需真實簡訊供應商與掃描設備驗證。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/kiosk/page.tsx",
        "symbol": "submitLookup / submitVerification / confirmCheckIn / UnavailableMethod",
        "kind": "code",
        "anchor": "submitLookup",
        "line": 61
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "checkinToken",
        "kind": "code",
        "anchor": "checkinToken",
        "line": 107
      }
    ]
  },
  "payment": {
    "name": "講座付款介面",
    "layer": "操作介面",
    "purpose": "選擇講座及轉往付款",
    "status": "partly_connected",
    "assessment": "結帳跳轉與伺服器端付款狀態查詢已有實作；成功狀態只會由已驗證的付款事件更新。",
    "missingRequirement": "設定付款平台測試環境並驗證外部事件投遞與資料庫遷移。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "handleStripeCheckout / window.location.assign",
        "kind": "code",
        "anchor": "handleStripeCheckout",
        "line": 44
      },
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "findHealthTopicById / sessionUrl",
        "kind": "code",
        "anchor": "findHealthTopicById",
        "line": 3
      }
    ]
  },
  "contact": {
    "name": "聯絡表單",
    "layer": "操作介面",
    "purpose": "提交姓名、電子郵件、主旨及訊息",
    "status": "connected",
    "assessment": "表單與聯絡服務已有提交及回應處理路徑。",
    "missingRequirement": "驗證實際寄送、存檔及服務錯誤的畫面呈現。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/components/ContactSection.tsx",
        "symbol": "fetch /api/contact",
        "kind": "code",
        "anchor": "fetch('/api/contact'",
        "line": 37
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "validateContactPayload / savedToDatabase",
        "kind": "code",
        "anchor": "validateContactPayload",
        "line": 15
      }
    ]
  },
  "portals": {
    "name": "病人／學生服務",
    "layer": "待完成服務",
    "purpose": "病人追蹤、學習權益及學分；目前尚未形成資料流程",
    "status": "planned",
    "assessment": "目前為靜態資訊或規劃中的個人服務。",
    "missingRequirement": "建立本人資料授權、學生權益與課程完成服務。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/courses-events/page.tsx",
        "symbol": "registrationSteps / 尚未開放",
        "kind": "code",
        "anchor": "registrationSteps",
        "line": 33
      },
      {
        "path": "src/app/patient-center/page.tsx",
        "symbol": "patientModules",
        "kind": "code",
        "anchor": "patientModules",
        "line": 10
      }
    ]
  },
  "identity": {
    "name": "外部身分驗證服務",
    "layer": "外部服務",
    "purpose": "登入、註冊、工作階段及身分事件",
    "status": "unknown",
    "assessment": "專案已有身分服務整合，未取得本次實際服務回應。",
    "missingRequirement": "驗證部署金鑰、登入、工作階段與事件投遞。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/layout.tsx",
        "symbol": "ClerkProvider",
        "kind": "code",
        "anchor": "ClerkProvider",
        "line": 1
      },
      {
        "path": "src/app/sign-in/[[...sign-in]]/page.tsx",
        "symbol": "SignIn",
        "kind": "code",
        "anchor": "SignIn",
        "line": 1
      },
      {
        "path": "src/middleware.ts",
        "symbol": "auth.protect",
        "kind": "code",
        "anchor": "auth.protect",
        "line": 31
      },
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "canViewArchitectureStatus",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 9
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      },
      {
        "path": "src/app/admin/users/page.tsx",
        "symbol": "AdminUsersPage",
        "kind": "code",
        "anchor": "AdminUsersPage",
        "line": 9
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "isUserAccessEvent / writeAuditLog",
        "kind": "code",
        "anchor": "isUserAccessEvent",
        "line": 29
      }
    ]
  },
  "guard": {
    "name": "伺服器權限驗證",
    "layer": "伺服器",
    "purpose": "檢查登入、角色及醫師的病歷存取範圍",
    "status": "connected",
    "assessment": "後台與電子病歷的伺服器版型會在呈現內容前驗證角色；API 另行授權。版型權限邊界已通過十六種存取情境測試。",
    "missingRequirement": "真實使用者登入與各角色的完整業務流程仍需端到端驗證。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "prisma.user.findUnique",
        "kind": "code",
        "anchor": "prisma.user.findUnique",
        "line": 21
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest / authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "providerAccess",
        "kind": "code",
        "anchor": "providerAccess",
        "line": 75
      },
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "canViewArchitectureStatus",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 9
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      },
      {
        "path": "src/app/admin/development/architecture-status/page.tsx",
        "symbol": "canViewArchitectureStatus / notFound",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 4
      },
      {
        "path": "src/app/admin/layout.tsx",
        "symbol": "showDevelopment",
        "kind": "code",
        "anchor": "showDevelopment",
        "line": 14
      },
      {
        "path": "src/middleware.ts",
        "symbol": "protectedRoots",
        "kind": "code",
        "anchor": "protectedRoots",
        "line": 5
      },
      {
        "kind": "code",
        "path": "src/app/admin/layout.tsx",
        "symbol": "authorizeEhrRequest layout role check",
        "anchor": "authorizeEhrRequest(['admin', 'clinic_staff'])",
        "line": 13
      }
    ]
  },
  "bookingApi": {
    "name": "預約介面服務",
    "layer": "伺服器",
    "purpose": "驗證預約、檢查休診與時段衝突、更新狀態",
    "status": "connected",
    "assessment": "預約驗證、清單與異動均有處理端及稽核呼叫。",
    "missingRequirement": "驗證實際交易、併發衝突與狀態更新。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/components/appointment/AppointmentForm.tsx",
        "symbol": "fetch /api/appointments",
        "kind": "code",
        "anchor": "fetch('/api/appointments'",
        "line": 800
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "POST",
        "kind": "code",
        "anchor": "POST",
        "line": 79
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "prisma.$transaction / appointment.create",
        "kind": "code",
        "anchor": "prisma.$transaction",
        "line": 193
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Holiday / @@unique([doctorId, date, appointmentTime])",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/app/admin/appointments/page.tsx",
        "symbol": "fetchAppointments / AppointmentUpdates",
        "kind": "code",
        "anchor": "fetchAppointments",
        "line": 98
      },
      {
        "path": "src/app/api/appointments/[id]/route.ts",
        "symbol": "GET / PATCH / DELETE / authorizeEhrRequest",
        "kind": "code",
        "anchor": "GET",
        "line": 23
      },
      {
        "path": "src/lib/appointmentMail.ts",
        "symbol": "send / notifyNewAppointment / notifyAppointmentStatus",
        "kind": "code",
        "anchor": "send",
        "line": 14
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "notifyNewAppointment",
        "kind": "code",
        "anchor": "notifyNewAppointment",
        "line": 5
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Patient",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/components/appointment/AppointmentForm.tsx",
        "symbol": "consultationTypeRoutes / router.push",
        "kind": "code",
        "anchor": "consultationTypeRoutes",
        "line": 75
      },
      {
        "path": "src/app/appointments/ai-questionnaire/page.tsx",
        "symbol": "AiQuestionnairePage",
        "kind": "code",
        "anchor": "AiQuestionnairePage",
        "line": 8
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 5
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      }
    ]
  },
  "patientApi": {
    "name": "病人與問卷服務",
    "layer": "伺服器",
    "purpose": "病人新增、讀取、修改與初診問卷儲存",
    "status": "partly_connected",
    "assessment": "已接上病人與問卷的受授權持久化、送出識別碼、重試防重複與稽核；開發資料庫整合已驗證。",
    "missingRequirement": "正式環境仍依既有政策禁止病人與問卷寫入；需另行確認正式啟用策略。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 5
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Patient",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/components/appointment/AppointmentForm.tsx",
        "symbol": "consultationTypeRoutes / router.push",
        "kind": "code",
        "anchor": "consultationTypeRoutes",
        "line": 75
      },
      {
        "path": "src/app/appointments/ai-questionnaire/page.tsx",
        "symbol": "AiQuestionnairePage",
        "kind": "code",
        "anchor": "AiQuestionnairePage",
        "line": 8
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientDirectoryScreen / NewPatientScreen / IntakeScreen",
        "kind": "code",
        "anchor": "PatientDirectoryScreen",
        "line": 36
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 116
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 51
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "patient.create / providerAccess",
        "kind": "code",
        "anchor": "patient.create",
        "line": 144
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "patientIntake.create / lifestyleEntry.upsert",
        "kind": "code",
        "anchor": "patientIntake.create",
        "line": 83
      },
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "GET / PUT",
        "kind": "code",
        "anchor": "GET",
        "line": 39
      }
    ]
  },
  "clinicalWrite": {
    "name": "看診與臨床簽核服務",
    "layer": "待完成服務",
    "purpose": "建立看診、簽核病歷、治療、用藥及帳務",
    "status": "partly_connected",
    "assessment": "開發環境已接上看診、簽核、治療、帳務草稿、用藥與受授權接收畫面，隔離 PostgreSQL 測試通過；正式環境仍禁止臨床寫入。",
    "missingRequirement": "正式臨床寫入政策與實際使用者工作流程尚待驗證；不宣稱完成真實診療或收費。",
    "safeError": null,
    "evidence": [
      {
        "path": "prisma/schema.prisma",
        "symbol": "Encounter / ClinicalNote / TcmAssessment / Treatment / BillingRecord / Document",
        "kind": "code",
        "anchor": "Encounter",
        "line": 41
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "ModuleScreen",
        "kind": "code",
        "anchor": "ModuleScreen",
        "line": 294
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "ModuleScreen / ModuleTable / 新增看診紀錄",
        "kind": "code",
        "anchor": "ModuleScreen",
        "line": 294
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Encounter / ClinicalNote / Treatment / BillingRecord / Document",
        "kind": "code",
        "anchor": "Encounter",
        "line": 41
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "appointment.updateMany",
        "kind": "code",
        "anchor": "appointment.updateMany",
        "line": 60
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "patientId: appointment.id",
        "kind": "code",
        "anchor": "patientId: appointment.id",
        "line": 109
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Encounter",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/app/api/ehr/workflow/route.ts",
        "symbol": "development workflow / runSoftwareCommand",
        "kind": "code",
        "anchor": "runSoftwareCommand",
        "line": 7
      },
      {
        "path": "src/app/ehr/WorkflowScreen.tsx",
        "symbol": "saved workflow records and explicit commands",
        "kind": "code",
        "anchor": "fetch('/api/ehr/workflow'",
        "line": 30
      }
    ]
  },
  "kioskApi": {
    "name": "報到介面服務",
    "layer": "伺服器",
    "purpose": "查詢、一次性驗證碼檢查及報到更新",
    "status": "connected",
    "assessment": "查詢、驗證與報到三個處理端及狀態儲存路徑已存在。",
    "missingRequirement": "驗證實際預約、逾期、重複報到及併發請求。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      },
      {
        "path": "src/app/kiosk/page.tsx",
        "symbol": "submitLookup / submitVerification / confirmCheckIn / UnavailableMethod",
        "kind": "code",
        "anchor": "submitLookup",
        "line": 61
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "checkinToken",
        "kind": "code",
        "anchor": "checkinToken",
        "line": 107
      },
      {
        "path": "src/lib/kioskVerification.ts",
        "symbol": "sendVerificationCode / SMS_PROVIDER_WEBHOOK_URL",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 40
      },
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "sendVerificationCode",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 10
      },
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "verificationCodeExpiresAt",
        "kind": "code",
        "anchor": "verificationCodeExpiresAt",
        "line": 78
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "verifiedForCheckinAt",
        "kind": "code",
        "anchor": "verifiedForCheckinAt",
        "line": 95
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "CHECKIN_GRANT_TTL_MS / updateMany",
        "kind": "code",
        "anchor": "CHECKIN_GRANT_TTL_MS",
        "line": 3
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "appointment.updateMany",
        "kind": "code",
        "anchor": "appointment.updateMany",
        "line": 60
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "patientId: appointment.id",
        "kind": "code",
        "anchor": "patientId: appointment.id",
        "line": 109
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Encounter",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      }
    ]
  },
  "checkout": {
    "name": "結帳服務",
    "layer": "伺服器",
    "purpose": "依講座主檔建立付款工作階段",
    "status": "connected",
    "assessment": "服務會由講座主檔建立付款工作階段並回傳網址。",
    "missingRequirement": "驗證付款平台測試回應、失敗處理及回跳網址。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      },
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "handleStripeCheckout / window.location.assign",
        "kind": "code",
        "anchor": "handleStripeCheckout",
        "line": 44
      },
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "findHealthTopicById / sessionUrl",
        "kind": "code",
        "anchor": "findHealthTopicById",
        "line": 3
      },
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "STRIPE_SECRET_KEY / NEXT_PUBLIC_APP_URL / checkout.sessions.create",
        "kind": "code",
        "anchor": "STRIPE_SECRET_KEY",
        "line": 10
      }
    ]
  },
  "webhook": {
    "name": "外部事件接收服務",
    "layer": "伺服器",
    "purpose": "驗證付款與身分事件簽章、去除重複事件",
    "status": "partly_connected",
    "assessment": "簽章檢查、去重與稽核已有實作，外部事件投遞未實測。",
    "missingRequirement": "完成端點設定與事件重送測試，再串接報名或帳號同步。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "constructEvent / auditWebhookReceipt.create / event.type",
        "kind": "code",
        "anchor": "constructEvent",
        "line": 21
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 6
      },
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "params.get / status === success",
        "kind": "code",
        "anchor": "params.get",
        "line": 9
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AuditWebhookReceipt / BillingRecord",
        "kind": "code",
        "anchor": "AuditWebhookReceipt",
        "line": 654
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "auditWebhookReceipt",
        "line": 65
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "verifyWebhook / auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "verifyWebhook",
        "line": 1
      }
    ]
  },
  "contactApi": {
    "name": "聯絡訊息服務",
    "layer": "伺服器",
    "purpose": "驗證訊息、寄信及嘗試存檔",
    "status": "connected",
    "assessment": "訊息先保存，再追蹤郵件結果；管理員可處理狀態並以嘗試次數防止重複重試，結果不明時不盲目重寄。",
    "missingRequirement": "程式與隔離資料庫測試通過；SMTP 真實認證及投遞結果仍以即時檢查與供應商紀錄為準。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      },
      {
        "path": "src/components/ContactSection.tsx",
        "symbol": "fetch /api/contact",
        "kind": "code",
        "anchor": "fetch('/api/contact'",
        "line": 37
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "validateContactPayload / savedToDatabase",
        "kind": "code",
        "anchor": "validateContactPayload",
        "line": 15
      },
      {
        "path": "src/lib/contactDelivery.ts",
        "symbol": "deliverContact / bounded SMTP / delivery audit",
        "kind": "code",
        "anchor": "deliverContact",
        "line": 14
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "contact.create / savedToDatabase / GET",
        "kind": "code",
        "anchor": "contact.create",
        "line": 85
      },
      {
        "path": "src/middleware.ts",
        "symbol": "protectedRoots",
        "kind": "code",
        "anchor": "protectedRoots",
        "line": 5
      },
      {
        "path": "src/lib/contactDelivery.ts",
        "symbol": "deliverContact / bounded SMTP / delivery audit",
        "kind": "code",
        "anchor": "deliverContact",
        "line": 14
      }
    ]
  },
  "audit": {
    "name": "稽核與紀錄鏈服務",
    "layer": "伺服器",
    "purpose": "記錄操作、篩選查詢及雜湊鏈驗證",
    "status": "connected",
    "assessment": "稽核寫入、持久化、查詢與雜湊驗證都有程式碼路徑。",
    "missingRequirement": "實測資料庫交易、併發及竄改偵測；畫面測試不代表紀錄鏈實測。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 5
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "auditWebhookReceipt",
        "line": 65
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "verifyWebhook / auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "verifyWebhook",
        "line": 1
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "appendAuditLog / verifyAuditChain",
        "kind": "code",
        "anchor": "appendAuditLog",
        "line": 231
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AuditLog / AuditLogChain / AuditWebhookReceipt",
        "kind": "code",
        "anchor": "AuditLog",
        "line": 113
      },
      {
        "path": "src/app/admin/audit-logs/AuditLogViewer.tsx",
        "symbol": "fetch / verifyChain",
        "kind": "code",
        "anchor": "fetch",
        "line": 52
      },
      {
        "path": "src/app/api/admin/audit-logs/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 3
      },
      {
        "path": "src/app/api/admin/audit-logs/verify-chain/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 2
      }
    ]
  },
  "db": {
    "name": "關聯式資料庫",
    "layer": "資料儲存",
    "purpose": "經資料存取層保存預約、病歷、權限、聯絡訊息及稽核；目前結構使用本機資料庫",
    "status": "unknown",
    "assessment": "已定義資料模型與資料存取層；尚無本次可核對的實際資料庫成功回應或新存紀錄。",
    "missingRequirement": "驗證連線、結構版本、讀寫、交易及備份策略。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "prisma.user.findUnique",
        "kind": "code",
        "anchor": "prisma.user.findUnique",
        "line": 21
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest / authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "providerAccess",
        "kind": "code",
        "anchor": "providerAccess",
        "line": 75
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Encounter / ClinicalNote / TcmAssessment / Treatment / BillingRecord / Document",
        "kind": "code",
        "anchor": "Encounter",
        "line": 41
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "ModuleScreen",
        "kind": "code",
        "anchor": "ModuleScreen",
        "line": 294
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "BillingRecord / AuditWebhookReceipt；未見課程報名模型",
        "kind": "code",
        "anchor": "BillingRecord",
        "line": 156
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "POST",
        "kind": "code",
        "anchor": "POST",
        "line": 9
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "prisma.$transaction / appointment.create",
        "kind": "code",
        "anchor": "prisma.$transaction",
        "line": 193
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Holiday / @@unique([doctorId, date, appointmentTime])",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "patient.create / providerAccess",
        "kind": "code",
        "anchor": "patient.create",
        "line": 144
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "patientIntake.create / lifestyleEntry.upsert",
        "kind": "code",
        "anchor": "patientIntake.create",
        "line": 83
      },
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "GET / PUT",
        "kind": "code",
        "anchor": "GET",
        "line": 39
      },
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "include / encounters / clinicalNote / documents",
        "kind": "code",
        "anchor": "include",
        "line": 51
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientRecordRoute / StoredProfileTabs",
        "kind": "code",
        "anchor": "PatientRecordRoute",
        "line": 308
      },
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "verificationCodeExpiresAt",
        "kind": "code",
        "anchor": "verificationCodeExpiresAt",
        "line": 78
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "verifiedForCheckinAt",
        "kind": "code",
        "anchor": "verifiedForCheckinAt",
        "line": 95
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "CHECKIN_GRANT_TTL_MS / updateMany",
        "kind": "code",
        "anchor": "CHECKIN_GRANT_TTL_MS",
        "line": 3
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "contact.create / savedToDatabase / GET",
        "kind": "code",
        "anchor": "contact.create",
        "line": 85
      },
      {
        "path": "src/middleware.ts",
        "symbol": "protectedRoots",
        "kind": "code",
        "anchor": "protectedRoots",
        "line": 5
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "appendAuditLog / verifyAuditChain",
        "kind": "code",
        "anchor": "appendAuditLog",
        "line": 231
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AuditLog / AuditLogChain / AuditWebhookReceipt",
        "kind": "code",
        "anchor": "AuditLog",
        "line": 113
      }
    ]
  },
  "mail": {
    "name": "郵件伺服器",
    "layer": "外部服務",
    "purpose": "預約通知、狀態更新及聯絡訊息投遞",
    "status": "unknown",
    "assessment": "已有郵件呼叫程式碼，尚無可核對的實際投遞回應。",
    "missingRequirement": "確認郵件設定及投遞結果，實作失敗追蹤與重試。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/lib/appointmentMail.ts",
        "symbol": "send / notifyNewAppointment / notifyAppointmentStatus",
        "kind": "code",
        "anchor": "send",
        "line": 14
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "notifyNewAppointment",
        "kind": "code",
        "anchor": "notifyNewAppointment",
        "line": 5
      },
      {
        "path": "src/lib/contactDelivery.ts",
        "symbol": "deliverContact / bounded SMTP / delivery audit",
        "kind": "code",
        "anchor": "deliverContact",
        "line": 14
      }
    ]
  },
  "sms": {
    "name": "簡訊供應商",
    "layer": "外部服務",
    "purpose": "投遞報到驗證碼；未設定或投遞失敗時阻擋流程。",
    "status": "partly_connected",
    "assessment": "已有簡訊回呼、回應檢查與安全失敗處理，真實供應商投遞仍待驗證。",
    "missingRequirement": "串接供應商、檢查非成功回應及投遞結果。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/lib/kioskVerification.ts",
        "symbol": "sendVerificationCode / SMS_PROVIDER_WEBHOOK_URL",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 40
      },
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "sendVerificationCode",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 10
      }
    ]
  },
  "stripe": {
    "name": "外部付款平台",
    "layer": "外部服務",
    "purpose": "收款及回傳付款事件",
    "status": "unknown",
    "assessment": "專案有付款平台呼叫與回呼接收器，未取得本次付款服務成功證據。",
    "missingRequirement": "驗證測試收款、事件簽章與付款狀態回查。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "STRIPE_SECRET_KEY / NEXT_PUBLIC_APP_URL / checkout.sessions.create",
        "kind": "code",
        "anchor": "STRIPE_SECRET_KEY",
        "line": 10
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "constructEvent / auditWebhookReceipt.create / event.type",
        "kind": "code",
        "anchor": "constructEvent",
        "line": 21
      }
    ]
  },
  "registration": {
    "name": "正式報名與權益服務",
    "layer": "待完成服務",
    "purpose": "以已驗證付款建立報名、課程權益及學分紀錄",
    "status": "partly_connected",
    "assessment": "付款工作階段已有唯一報名紀錄，只有簽章驗證事件可更新付款狀態；課程權益尚未建置。",
    "missingRequirement": "完成資料庫結構部署、付款測試事件驗證及課程權益授予。",
    "safeError": null,
    "evidence": [
      {
        "path": "prisma/schema.prisma",
        "symbol": "HealthTopicRegistration / checkoutSessionId",
        "kind": "code",
        "anchor": "model HealthTopicRegistration",
        "line": 662
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "POST",
        "kind": "code",
        "anchor": "POST",
        "line": 9
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 6
      },
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "api/payment/registration status lookup",
        "kind": "code",
        "anchor": "/api/payment/registration?sessionId=",
        "line": 31
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AuditWebhookReceipt / BillingRecord",
        "kind": "code",
        "anchor": "AuditWebhookReceipt",
        "line": 654
      },
      {
        "path": "src/app/courses-events/page.tsx",
        "symbol": "registrationSteps / 尚未開放",
        "kind": "code",
        "anchor": "registrationSteps",
        "line": 33
      },
      {
        "path": "src/app/patient-center/page.tsx",
        "symbol": "patientModules",
        "kind": "code",
        "anchor": "patientModules",
        "line": 10
      }
    ]
  },
  "ai": {
    "name": "智慧分析與語音問診服務",
    "layer": "待完成服務",
    "purpose": "收集問診、分析摘要並交由醫療人員審核",
    "status": "planned",
    "assessment": "分析頁與語音問診為佔位或規劃，未串接分析供應商。",
    "missingRequirement": "完成資料用途、問診收集、分析呼叫與醫療人員審核。",
    "safeError": null,
    "evidence": [
      {
        "path": "src/app/ai-health-analysis/page.tsx",
        "symbol": "RoutePlaceholderPage",
        "kind": "code",
        "anchor": "RoutePlaceholderPage",
        "line": 1
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "尚未開始問診 / 智慧語音問診",
        "kind": "code",
        "anchor": "尚未開始問診",
        "line": 140
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AiVoiceInterview",
        "kind": "code",
        "anchor": "AiVoiceInterview",
        "line": 120
      }
    ]
  },
  "ubuntuHost": {
    "name": "Ubuntu 主機（期末部署）",
    "layer": "期末部署規劃",
    "purpose": "執行網站應用程式與受保護的服務。",
    "status": "planned",
    "assessment": "未找到部署成功或主機連通的可驗證證據，保持規劃中。",
    "missingRequirement": "完成 Ubuntu 部署、服務啟動、網路路徑及不含內容的健康測試。",
    "safeError": null,
    "evidence": [
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## Ubuntu 主機",
        "anchor": "## Ubuntu 主機",
        "line": 3
      }
    ]
  },
  "databaseServer": {
    "name": "資料庫伺服器（期末部署）",
    "layer": "期末部署規劃",
    "purpose": "提供期末部署的持久化資料服務，與目前本機資料庫分開評估。",
    "status": "planned",
    "assessment": "目前資料模型使用本機 SQLite，未提供遠端資料庫成功連線證據。",
    "missingRequirement": "完成資料庫驅動與結構遷移、伺服器設定及唯讀連線測試。",
    "safeError": null,
    "evidence": [
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## 資料庫伺服器",
        "anchor": "## 資料庫伺服器",
        "line": 8
      }
    ]
  }
}

export const connectionDefinitions: Omit<ArchitectureConnection, 'lastTest'>[] = [
  {
    "id": "guard-storage",
    "from": "guard",
    "to": "db",
    "status": "connected",
    "data": "本機帳號電子郵件、角色、稽核檢視權限及醫師的病人存取授權。",
    "assessment": "身分服務未提供角色時依電子郵件讀取本機帳號；醫師的病歷範圍依病人授權關聯查詢。",
    "evidence": [
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "prisma.user.findUnique",
        "kind": "code",
        "anchor": "prisma.user.findUnique",
        "line": 21
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest / authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "providerAccess",
        "kind": "code",
        "anchor": "providerAccess",
        "line": 75
      }
    ],
    "next": "驗證本機帳號對應、角色優先順序及醫師授權撤銷。",
    "description": "查詢本機角色及病人存取授權。",
    "missingRequirement": "驗證本機帳號對應、角色優先順序及醫師授權撤銷。",
    "safeError": null
  },
  {
    "id": "clinical-persist",
    "from": "clinicalWrite",
    "to": "db",
    "status": "connected",
    "data": "開發環境的病歷簽核、治療與帳務草稿、用藥均在具防重複保護的交易中保存並寫入稽核；隔離 PostgreSQL 驗證通過。",
    "assessment": "開發環境的病歷簽核、治療與帳務草稿、用藥均在具防重複保護的交易中保存並寫入稽核；隔離 PostgreSQL 驗證通過。",
    "evidence": [
      {
        "path": "src/app/api/ehr/encounters/[id]/notes/route.ts",
        "symbol": "clinicalNote.upsert / writeAuditLog",
        "kind": "code",
        "anchor": "clinicalNote.upsert",
        "line": 61
      },
      {
        "path": "src/app/api/ehr/encounters/[id]/route.ts",
        "symbol": "encounter.update / writeAuditLog",
        "kind": "code",
        "anchor": "encounter.update",
        "line": 56
      },
      {
        "path": "src/app/api/ehr/workflow/route.ts",
        "symbol": "development workflow / runSoftwareCommand",
        "kind": "code",
        "anchor": "runSoftwareCommand",
        "line": 7
      }
    ],
    "next": "持續驗證角色、重送與資料衝突；外部服務與正式啟用狀態需獨立證據。",
    "description": "儲存完整看診、臨床簽核與治療帳務。",
    "missingRequirement": "已驗證的範圍為開發軟體與隔離 PostgreSQL；不包含正式臨床寫入、真實身分、實際投遞或收款。",
    "safeError": null
  },
  {
    "id": "registration-persist",
    "from": "registration",
    "to": "db",
    "status": "connected",
    "data": "已以隔離資料庫及本機簽章事件驗證報名持久化、金額幣別核對、防重送、亂序狀態與稽核；不代表外部付款成功。",
    "assessment": "已以隔離資料庫及本機簽章事件驗證報名持久化、金額幣別核對、防重送、亂序狀態與稽核；不代表外部付款成功。",
    "evidence": [
      {
        "path": "prisma/schema.prisma",
        "symbol": "HealthTopicRegistration / checkoutSessionId",
        "kind": "code",
        "anchor": "model HealthTopicRegistration",
        "line": 662
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "healthTopicRegistration.upsert / writeAuditLog",
        "kind": "code",
        "anchor": "healthTopicRegistration.upsert",
        "line": 84
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "registration amount and currency match",
        "kind": "code",
        "anchor": "const matches",
        "line": 77
      }
    ],
    "next": "持續驗證角色、重送與資料衝突；外部服務與正式啟用狀態需獨立證據。",
    "description": "保存正式報名與已驗證付款的對應。",
    "missingRequirement": "已驗證的範圍為開發軟體與隔離 PostgreSQL；不包含正式臨床寫入、真實身分、實際投遞或收款。",
    "safeError": null
  },
  {
    "id": "patient-audit",
    "from": "patientApi",
    "to": "audit",
    "status": "connected",
    "data": "業務操作、資源編號、行為人或服務、來源及結果；不傳送完整病歷或訊息本文作為稽核摘要。",
    "assessment": "此服務已呼叫共同稽核函式；病人問卷與報到的主要寫入與稽核共用交易，聯絡與建立結帳則是外部操作後記錄。",
    "evidence": [
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 5
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      }
    ],
    "next": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "description": "記錄病人與問卷的受保護操作。",
    "missingRequirement": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "safeError": null
  },
  {
    "id": "kiosk-audit",
    "from": "kioskApi",
    "to": "audit",
    "status": "connected",
    "data": "業務操作、資源編號、行為人或服務、來源及結果；不傳送完整病歷或訊息本文作為稽核摘要。",
    "assessment": "此服務已呼叫共同稽核函式；病人問卷與報到的主要寫入與稽核共用交易，聯絡與建立結帳則是外部操作後記錄。",
    "evidence": [
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      }
    ],
    "next": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "description": "記錄報到驗證及狀態異動。",
    "missingRequirement": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "safeError": null
  },
  {
    "id": "contact-audit",
    "from": "contactApi",
    "to": "audit",
    "status": "connected",
    "data": "業務操作、資源編號、行為人或服務、來源及結果；不傳送完整病歷或訊息本文作為稽核摘要。",
    "assessment": "此服務已呼叫共同稽核函式；病人問卷與報到的主要寫入與稽核共用交易，聯絡與建立結帳則是外部操作後記錄。",
    "evidence": [
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      }
    ],
    "next": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "description": "記錄聯絡訊息的提交與處理結果。",
    "missingRequirement": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "safeError": null
  },
  {
    "id": "checkout-audit",
    "from": "checkout",
    "to": "audit",
    "status": "connected",
    "data": "業務操作、資源編號、行為人或服務、來源及結果；不傳送完整病歷或訊息本文作為稽核摘要。",
    "assessment": "此服務已呼叫共同稽核函式；病人問卷與報到的主要寫入與稽核共用交易，聯絡與建立結帳則是外部操作後記錄。",
    "evidence": [
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "safeSummary / writeAuditLog",
        "kind": "code",
        "anchor": "safeSummary",
        "line": 62
      }
    ],
    "next": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "description": "記錄結帳工作階段建立結果。",
    "missingRequirement": "驗證業務結果、稽核紀錄與失敗時的交易邊界一致。",
    "safeError": null
  },
  {
    "id": "identity-session",
    "from": "admin",
    "to": "identity",
    "status": "connected",
    "data": "登入／註冊資料、登入工作階段及使用者識別碼。",
    "assessment": "登入與註冊頁使用身分驗證元件；受保護路徑由中介層要求登入。此連線也支援電子病歷入口。",
    "evidence": [
      {
        "path": "src/app/layout.tsx",
        "symbol": "ClerkProvider",
        "kind": "code",
        "anchor": "ClerkProvider",
        "line": 1
      },
      {
        "path": "src/app/sign-in/[[...sign-in]]/page.tsx",
        "symbol": "SignIn",
        "kind": "code",
        "anchor": "SignIn",
        "line": 1
      },
      {
        "path": "src/middleware.ts",
        "symbol": "auth.protect",
        "kind": "code",
        "anchor": "auth.protect",
        "line": 31
      }
    ],
    "next": "以實際測試帳號驗證部署環境的登入、逾期及登出流程。",
    "description": "建立登入工作階段並保護後台入口。",
    "missingRequirement": "以實際測試帳號驗證部署環境的登入、逾期及登出流程。",
    "safeError": null
  },
  {
    "id": "identity-role",
    "from": "identity",
    "to": "guard",
    "status": "connected",
    "data": "使用者識別碼、主要電子郵件及受信任的角色中繼資料。",
    "assessment": "角色中繼資料優先；未提供角色時才依電子郵件查詢本機帳號。未登入或無管理員角色者不能取得本頁。",
    "evidence": [
      {
        "path": "src/lib/architectureStatusAccess.ts",
        "symbol": "canViewArchitectureStatus",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 9
      },
      {
        "path": "src/lib/ehrAuthorization.ts",
        "symbol": "authorizeEhrRequest",
        "kind": "code",
        "anchor": "authorizeEhrRequest",
        "line": 42
      }
    ],
    "next": "持續維護角色優先順序及拒絕存取的回歸檢查。",
    "description": "以身分與角色決定存取資格。",
    "missingRequirement": "持續維護角色優先順序及拒絕存取的回歸檢查。",
    "safeError": null
  },
  {
    "id": "admin-guard",
    "from": "guard",
    "to": "admin",
    "status": "connected",
    "data": "管理員判定結果、選單顯示權限及直接網址請求的拒絕結果。",
    "assessment": "所有後台頁面繼承伺服器端管理員／診所人員角色邊界；架構狀態頁仍限管理員存取。",
    "evidence": [
      {
        "path": "src/app/admin/development/architecture-status/page.tsx",
        "symbol": "canViewArchitectureStatus / notFound",
        "kind": "code",
        "anchor": "canViewArchitectureStatus",
        "line": 4
      },
      {
        "path": "src/app/admin/layout.tsx",
        "symbol": "showDevelopment",
        "kind": "code",
        "anchor": "showDevelopment",
        "line": 14
      },
      {
        "path": "src/middleware.ts",
        "symbol": "protectedRoots",
        "kind": "code",
        "anchor": "protectedRoots",
        "line": 5
      },
      {
        "kind": "code",
        "path": "src/app/admin/layout.tsx",
        "symbol": "authorizeEhrRequest layout role check",
        "anchor": "authorizeEhrRequest(['admin', 'clinic_staff'])",
        "line": 13
      }
    ],
    "next": "持續維護角色邊界回歸測試；帳號管理功能另需完成實作。",
    "description": "控制架構頁的直接存取及管理選單。",
    "missingRequirement": "持續維護角色邊界回歸測試；帳號管理功能另需完成實作。",
    "safeError": null
  },
  {
    "id": "account-management",
    "from": "admin",
    "to": "identity",
    "status": "planned",
    "data": "應傳送：建立帳號、變更角色及停用帳號的已授權指令。",
    "assessment": "使用者管理頁明示為靜態示範；未形成實際帳號異動流程。身分事件回呼目前記錄稽核，未同步建立本機使用者資料。",
    "evidence": [
      {
        "path": "src/app/admin/users/page.tsx",
        "symbol": "AdminUsersPage",
        "kind": "code",
        "anchor": "AdminUsersPage",
        "line": 9
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "isUserAccessEvent / writeAuditLog",
        "kind": "code",
        "anchor": "isUserAccessEvent",
        "line": 29
      }
    ],
    "next": "實作管理操作、身分與本機帳號對應、角色更新及稽核。",
    "description": "從後台建立、停用帳號與異動角色。",
    "missingRequirement": "實作管理操作、身分與本機帳號對應、角色更新及稽核。",
    "safeError": null
  },
  {
    "id": "booking-submit",
    "from": "public",
    "to": "bookingApi",
    "status": "connected",
    "data": "姓名、電話、電子郵件、服務、醫師、日期、時段及主訴；回傳預約資料。",
    "assessment": "公開表單送出請求至預約服務；服務檢查必填欄位、日期、服務及醫師選項。",
    "evidence": [
      {
        "path": "src/components/appointment/AppointmentForm.tsx",
        "symbol": "fetch /api/appointments",
        "kind": "code",
        "anchor": "fetch('/api/appointments'",
        "line": 800
      },
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "POST",
        "kind": "code",
        "anchor": "POST",
        "line": 79
      }
    ],
    "next": "以合法輸入、休診日及重複時段執行實際資料庫整合測試。",
    "description": "送出公開預約並接收驗證結果。",
    "missingRequirement": "以合法輸入、休診日及重複時段執行實際資料庫整合測試。",
    "safeError": null
  },
  {
    "id": "booking-save",
    "from": "bookingApi",
    "to": "db",
    "status": "connected",
    "data": "預約、休診查詢、醫師與時段唯一性、預約狀態及同交易稽核事件。",
    "assessment": "建立預約與建立稽核同在交易內；資料結構另有醫師、日期、時段的唯一限制。",
    "evidence": [
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "prisma.$transaction / appointment.create",
        "kind": "code",
        "anchor": "prisma.$transaction",
        "line": 193
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment / Holiday / @@unique([doctorId, date, appointmentTime])",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      }
    ],
    "next": "驗證部署資料庫可寫入、交易回滾及併發衝突行為。",
    "description": "在交易中保存預約與稽核。",
    "missingRequirement": "驗證部署資料庫可寫入、交易回滾及併發衝突行為。",
    "safeError": null
  },
  {
    "id": "booking-manage",
    "from": "admin",
    "to": "bookingApi",
    "status": "connected",
    "data": "登入與角色、篩選及分頁條件、預約編號、狀態／日期／時段變更；回傳清單或更新結果。",
    "assessment": "後台呼叫預約清單及異動服務；服務限制管理員或診所人員，更新後可觸發通知。",
    "evidence": [
      {
        "path": "src/app/admin/appointments/page.tsx",
        "symbol": "fetchAppointments / AppointmentUpdates",
        "kind": "code",
        "anchor": "fetchAppointments",
        "line": 98
      },
      {
        "path": "src/app/api/appointments/[id]/route.ts",
        "symbol": "GET / PATCH / DELETE / authorizeEhrRequest",
        "kind": "code",
        "anchor": "GET",
        "line": 23
      }
    ],
    "next": "驗證狀態更新、刪除及異動後畫面重新整理。",
    "description": "讀取清單並管理預約狀態與時段。",
    "missingRequirement": "驗證狀態更新、刪除及異動後畫面重新整理。",
    "safeError": null
  },
  {
    "id": "holiday-management",
    "from": "admin",
    "to": "bookingApi",
    "status": "connected",
    "data": "管理人員新增、查詢、移除或明確匯入休診日；建立及移除操作同交易記錄稽核事件。",
    "assessment": "受保護的休診日管理畫面連接休診 API；日期唯一限制避免重複紀錄，匯入操作不覆蓋既有資料。",
    "evidence": [
      {
        "path": "src/app/admin/holidays/page.tsx",
        "symbol": "fetch /api/holidays",
        "kind": "code",
        "anchor": "fetch('/api/holidays",
        "line": 40
      },
      {
        "path": "src/app/api/holidays/route.ts",
        "symbol": "authorizeEhrRequest / holiday.create / writeAuditLog",
        "kind": "code",
        "anchor": "transaction.holiday.create",
        "line": 117
      },
      {
        "path": "src/app/api/holidays/seed/route.ts",
        "symbol": "createMany / writeAuditLog",
        "kind": "code",
        "anchor": "createMany",
        "line": 109
      }
    ],
    "next": "使用隔離開發資料驗證日期篩選、重複日期及預約 API 對休診日的拒絕。",
    "description": "由管理後台維護預約可用的休診日期。",
    "missingRequirement": "使用隔離開發資料驗證日期篩選、重複日期及預約 API 對休診日的拒絕。",
    "safeError": null
  },
  {
    "id": "booking-notify",
    "from": "bookingApi",
    "to": "mail",
    "status": "partly_connected",
    "data": "管理員新預約通知、病人收件通知及預約狀態更新。",
    "assessment": "預約通知已有持久化結果、嘗試次數、受授權重試入口及稽核；不明結果不會自動重寄。",
    "evidence": [
      {
        "path": "src/lib/appointmentMail.ts",
        "symbol": "sendAppointmentNotification / persisted state and audit",
        "kind": "code",
        "anchor": "sendAppointmentNotification",
        "line": 14
      },
      {
        "path": "src/app/api/appointments/[id]/notification/route.ts",
        "symbol": "authorized explicit appointment notification retry",
        "kind": "code",
        "anchor": "sendAppointmentNotification",
        "line": 6
      }
    ],
    "next": "由使用者更新 Ubuntu 私有 SMTP 設定後，獨立確認實際投遞。",
    "description": "將預約收件及狀態更新通知寄給相關人員。",
    "missingRequirement": "軟體流程已用虛構 SMTP 回應驗證；正式 SMTP 設定與實際投遞仍需驗證。",
    "safeError": null
  },
  {
    "id": "booking-patient",
    "from": "bookingApi",
    "to": "patientApi",
    "status": "partly_connected",
    "data": "診所人員明確選取的病人主檔識別碼；不依姓名或電話自動合併。",
    "assessment": "預約可由管理介面連結既有病人並記錄稽核；公開預約仍不會自動建立或猜測病人主檔。",
    "evidence": [
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment.patientId / Patient",
        "kind": "code",
        "anchor": "Appointment",
        "line": 16
      },
      {
        "path": "src/app/admin/appointments/page.tsx",
        "symbol": "patientId / updateAppointment",
        "kind": "code",
        "anchor": "patientId",
        "line": 20
      },
      {
        "path": "src/app/api/appointments/[id]/route.ts",
        "symbol": "patientId / writeAuditLog",
        "kind": "code",
        "anchor": "patientId",
        "line": 20
      }
    ],
    "next": "驗證明確連結、錯誤病人修正及 kiosk 僅處理已連結預約。",
    "description": "將公開預約關聯至病人主檔及初診問卷。",
    "missingRequirement": "公開預約至病人主檔及初診問卷的本人識別流程尚未建置。",
    "safeError": null
  },
  {
    "id": "patient-entry",
    "from": "clinical",
    "to": "patientApi",
    "status": "connected",
    "data": "病人與問卷畫面讀取已儲存紀錄並以固定送出識別碼提交；空清單及連線失敗不再以模擬病人替代。",
    "assessment": "病人與問卷畫面讀取已儲存紀錄並以固定送出識別碼提交；空清單及連線失敗不再以模擬病人替代。",
    "evidence": [
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientDirectoryScreen / NewPatientScreen / IntakeScreen",
        "kind": "code",
        "anchor": "PatientDirectoryScreen",
        "line": 36
      },
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 116
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "NODE_ENV === production",
        "kind": "code",
        "anchor": "NODE_ENV === 'production'",
        "line": 51
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "stable patient and intake submission keys",
        "kind": "code",
        "anchor": "submissionKeys",
        "line": 192
      }
    ],
    "next": "持續驗證角色、重送與資料衝突；外部服務與正式啟用狀態需獨立證據。",
    "description": "從臨床工作區讀取或提交病人與問卷資料。",
    "missingRequirement": "已驗證的範圍為開發軟體與隔離 PostgreSQL；不包含正式臨床寫入、真實身分、實際投遞或收款。",
    "safeError": null
  },
  {
    "id": "patient-save",
    "from": "patientApi",
    "to": "db",
    "status": "connected",
    "data": "病人主檔、個人資料、問卷、症狀選項、診斷檢查、病史、過敏及生活習慣；附操作稽核。",
    "assessment": "開發環境的服務已使用資料存取層及交易；醫師角色的讀取與問卷寫入限制於已授權病人。",
    "evidence": [
      {
        "path": "src/app/api/ehr/patients/route.ts",
        "symbol": "patient.create / providerAccess",
        "kind": "code",
        "anchor": "patient.create",
        "line": 144
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "patientIntake.create / lifestyleEntry.upsert",
        "kind": "code",
        "anchor": "patientIntake.create",
        "line": 83
      },
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "GET / PUT",
        "kind": "code",
        "anchor": "GET",
        "line": 39
      }
    ],
    "next": "以開發資料庫驗證新增、修改、問卷與未授權醫師存取。",
    "description": "保存病人、問卷及相關病史資料。",
    "missingRequirement": "以開發資料庫驗證新增、修改、問卷與未授權醫師存取。",
    "safeError": null
  },
  {
    "id": "clinical-read",
    "from": "db",
    "to": "clinical",
    "status": "connected",
    "data": "經病人詳情服務回傳病人、問卷、病史、看診、病歷、治療、帳務及文件關聯。",
    "assessment": "詳情服務有關聯查詢，病人頁讀取回傳資料；能讀取既有關聯不代表已有建立這些關聯的操作。",
    "evidence": [
      {
        "path": "src/app/api/ehr/patients/[id]/route.ts",
        "symbol": "include / encounters / clinicalNote / documents",
        "kind": "code",
        "anchor": "include",
        "line": 51
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "PatientRecordRoute / StoredProfileTabs",
        "kind": "code",
        "anchor": "PatientRecordRoute",
        "line": 308
      }
    ],
    "next": "驗證已存病歷的呈現與不同角色可見範圍。",
    "description": "透過詳情服務呈現已儲存的病人關聯資料。",
    "missingRequirement": "驗證已存病歷的呈現與不同角色可見範圍。",
    "safeError": null
  },
  {
    "id": "clinical-write",
    "from": "clinical",
    "to": "clinicalWrite",
    "status": "connected",
    "data": "看診、治療、用藥與帳務畫面已連到開發環境授權服務及實際紀錄；正式寫入仍停用。",
    "assessment": "看診、治療、用藥與帳務畫面已連到開發環境授權服務及實際紀錄；正式寫入仍停用。",
    "evidence": [
      {
        "path": "src/app/ehr/EncounterQueueScreen.tsx",
        "symbol": "saveDraft / fetch /api/ehr/encounters",
        "kind": "code",
        "anchor": "/api/ehr/encounters/${encodeURIComponent(encounter.id)}/notes",
        "line": 92
      },
      {
        "path": "src/app/api/ehr/encounters/[id]/notes/route.ts",
        "symbol": "clinicalNote.upsert / writeAuditLog",
        "kind": "code",
        "anchor": "clinicalNote.upsert",
        "line": 61
      },
      {
        "path": "src/app/api/ehr/workflow/route.ts",
        "symbol": "development workflow / runSoftwareCommand",
        "kind": "code",
        "anchor": "runSoftwareCommand",
        "line": 7
      },
      {
        "path": "src/app/ehr/WorkflowScreen.tsx",
        "symbol": "saved workflow records and explicit commands",
        "kind": "code",
        "anchor": "fetch('/api/ehr/workflow'",
        "line": 30
      }
    ],
    "next": "持續驗證角色、重送與資料衝突；外部服務與正式啟用狀態需獨立證據。",
    "description": "由畫面建立看診、病歷及臨床簽核。",
    "missingRequirement": "已驗證的範圍為開發軟體與隔離 PostgreSQL；不包含正式臨床寫入、真實身分、實際投遞或收款。",
    "safeError": null
  },
  {
    "id": "clinical-ai",
    "from": "clinical",
    "to": "ai",
    "status": "planned",
    "data": "應傳送：經同意的病人自述資料；回傳逐字稿與摘要，再交醫療人員審核。",
    "assessment": "公開分析頁為佔位頁，語音問診畫面明示尚未開始；只有問診資料模型，未發現語音或模型服務呼叫。",
    "evidence": [
      {
        "path": "src/app/ai-health-analysis/page.tsx",
        "symbol": "RoutePlaceholderPage",
        "kind": "code",
        "anchor": "RoutePlaceholderPage",
        "line": 1
      },
      {
        "path": "src/app/ehr/EhrScreens.tsx",
        "symbol": "尚未開始問診 / 智慧語音問診",
        "kind": "code",
        "anchor": "尚未開始問診",
        "line": 140
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AiVoiceInterview",
        "kind": "code",
        "anchor": "AiVoiceInterview",
        "line": 120
      }
    ],
    "next": "先完成問診收集、資料用途與審核流程，再整合分析服務。",
    "description": "以病人自述資料建立問診逐字稿與分析摘要。",
    "missingRequirement": "先完成問診收集、資料用途與審核流程，再整合分析服務。",
    "safeError": null
  },
  {
    "id": "kiosk-request",
    "from": "kiosk",
    "to": "kioskApi",
    "status": "connected",
    "data": "手機或社會安全碼末四碼 → 查詢憑證與遮罩電話 → 六碼驗證碼 → 報到憑證與預約摘要 → 報到結果。",
    "assessment": "畫面依序呼叫查詢、驗證、確認報到三個服務；駕照與會員卡掃描僅顯示設備尚未安裝。",
    "evidence": [
      {
        "path": "src/app/kiosk/page.tsx",
        "symbol": "submitLookup / submitVerification / confirmCheckIn / UnavailableMethod",
        "kind": "code",
        "anchor": "submitLookup",
        "line": 61
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "checkinToken",
        "kind": "code",
        "anchor": "checkinToken",
        "line": 107
      }
    ],
    "next": "使用測試預約驗證三步驟及掃描設備的獨立整合。",
    "description": "依序完成查詢、驗證及確認報到請求。",
    "missingRequirement": "使用測試預約驗證三步驟及掃描設備的獨立整合。",
    "safeError": null
  },
  {
    "id": "kiosk-sms",
    "from": "kioskApi",
    "to": "sms",
    "status": "partly_connected",
    "data": "預約所存手機號碼及六碼驗證碼。",
    "assessment": "呼叫已設定的簡訊介面並檢查成功回應；缺少設定、逾時或非成功回應會回傳安全錯誤並使未送達的驗證碼失效，不再輸出驗證碼。真實供應商仍待驗證。",
    "evidence": [
      {
        "path": "src/lib/kioskVerification.ts",
        "symbol": "sendVerificationCode / SMS_PROVIDER_WEBHOOK_URL",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 40
      },
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "sendVerificationCode",
        "kind": "code",
        "anchor": "sendVerificationCode",
        "line": 10
      }
    ],
    "next": "串接真實簡訊供應商、檢查回應與投遞結果，再驗證正式報到。",
    "description": "把驗證碼投遞至預約所留手機。",
    "missingRequirement": "串接真實簡訊供應商、檢查回應與投遞結果，再驗證正式報到。",
    "safeError": null
  },
  {
    "id": "kiosk-save",
    "from": "kioskApi",
    "to": "db",
    "status": "connected",
    "data": "當日預約、驗證碼期限、失敗次數、短期報到授權、報到時間及狀態。",
    "assessment": "驗證狀態持久化於預約；成功驗證後才可報到，並以尚未報到的更新條件避免重複處理。",
    "evidence": [
      {
        "path": "src/app/api/kiosk/lookup/route.ts",
        "symbol": "verificationCodeExpiresAt",
        "kind": "code",
        "anchor": "verificationCodeExpiresAt",
        "line": 78
      },
      {
        "path": "src/app/api/kiosk/verify/route.ts",
        "symbol": "verifiedForCheckinAt",
        "kind": "code",
        "anchor": "verifiedForCheckinAt",
        "line": 95
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "CHECKIN_GRANT_TTL_MS / updateMany",
        "kind": "code",
        "anchor": "CHECKIN_GRANT_TTL_MS",
        "line": 3
      }
    ],
    "next": "驗證逾期、錯碼、重複報到及多請求競爭。",
    "description": "保存驗證狀態並更新當日預約的報到結果。",
    "missingRequirement": "驗證逾期、錯碼、重複報到及多請求競爭。",
    "safeError": null
  },
  {
    "id": "checkin-encounter",
    "from": "kioskApi",
    "to": "clinicalWrite",
    "status": "connected",
    "data": "已明確連結病人的已報到預約、待指派醫師的看診及工作清單；未連結病人時不建立看診。",
    "assessment": "報到會在同一交易更新預約、建立唯一看診及寫入稽核；已通過實際畫面與隔離資料庫整合測試，Ubuntu 必要結構另由即時檢查驗證。",
    "evidence": [
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "appointment.updateMany / ensureCheckinEncounter",
        "kind": "code",
        "anchor": "ensureEncounterForCheckedInAppointment",
        "line": 5
      },
      {
        "path": "src/lib/checkinEncounter.ts",
        "symbol": "encounter.upsert / appointmentId",
        "kind": "code",
        "anchor": "appointmentId",
        "line": 20
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "Appointment.patientId / Encounter.appointmentId",
        "kind": "code",
        "anchor": "appointmentId      String?  @unique",
        "line": 419
      }
    ],
    "next": "正式流程仍需驗證真實簡訊及人員事先連結病人的操作；不以隔離測試宣稱簡訊已投遞。",
    "description": "由報到結果建立後續看診工作。",
    "missingRequirement": "報到前需先由人員明確連結病人；真實簡訊及現場設備另行驗證。",
    "safeError": null
  },
  {
    "id": "payment-request",
    "from": "payment",
    "to": "checkout",
    "status": "connected",
    "data": "講座識別碼；伺服器由主檔決定名稱與金額，回傳結帳網址供瀏覽器跳轉。",
    "assessment": "付款頁與結帳服務已連接；費用由伺服器主題資料取得，不直接信任瀏覽器金額。",
    "evidence": [
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "handleStripeCheckout / window.location.assign",
        "kind": "code",
        "anchor": "handleStripeCheckout",
        "line": 44
      },
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "findHealthTopicById / sessionUrl",
        "kind": "code",
        "anchor": "findHealthTopicById",
        "line": 3
      }
    ],
    "next": "使用測試模式驗證有效與無效講座的結帳行為。",
    "description": "由講座付款頁取得結帳網址。",
    "missingRequirement": "使用測試模式驗證有效與無效講座的結帳行為。",
    "safeError": null
  },
  {
    "id": "payment-platform",
    "from": "checkout",
    "to": "stripe",
    "status": "partly_connected",
    "data": "台幣金額、講座名稱、主題中繼資料、成功／取消回跳網址；回傳付款工作階段。",
    "assessment": "建立結帳工作階段的呼叫已存在；金鑰、部署網址及外部服務仍需設定與實測，本次未驗證付款。",
    "evidence": [
      {
        "path": "src/app/api/payment/checkout-session/route.ts",
        "symbol": "STRIPE_SECRET_KEY / NEXT_PUBLIC_APP_URL / checkout.sessions.create",
        "kind": "code",
        "anchor": "STRIPE_SECRET_KEY",
        "line": 10
      }
    ],
    "next": "完成測試金鑰與回跳網址設定，驗證付款成功及取消。",
    "description": "向付款平台建立指定講座的結帳工作階段。",
    "missingRequirement": "完成測試金鑰與回跳網址設定，驗證付款成功及取消。",
    "safeError": null
  },
  {
    "id": "payment-callback",
    "from": "stripe",
    "to": "webhook",
    "status": "partly_connected",
    "data": "已簽章的付款完成、非同步成功／失敗及逾期事件。",
    "assessment": "接收器驗證簽章並透過事件收據去重；仍需在付款平台註冊端點及設定簽章密鑰，未驗證外部事件實際送達。",
    "evidence": [
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "constructEvent / auditWebhookReceipt.create / event.type",
        "kind": "code",
        "anchor": "constructEvent",
        "line": 21
      }
    ],
    "next": "用付款平台測試事件驗證簽章、重送及非同步結果。",
    "description": "接收並驗證付款平台事件。",
    "missingRequirement": "用付款平台測試事件驗證簽章、重送及非同步結果。",
    "safeError": null
  },
  {
    "id": "payment-registration",
    "from": "webhook",
    "to": "registration",
    "status": "connected",
    "data": "可信簽章事件須對應既有報名、課程、金額、幣別及付款模式，才更新付款狀態；本機事件隔離測試通過。",
    "assessment": "可信簽章事件須對應既有報名、課程、金額、幣別及付款模式，才更新付款狀態；本機事件隔離測試通過。",
    "evidence": [
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "constructEvent / healthTopicRegistration.upsert",
        "kind": "code",
        "anchor": "healthTopicRegistration.upsert",
        "line": 84
      },
      {
        "path": "src/app/payment/page.tsx",
        "symbol": "/api/payment/registration status lookup",
        "kind": "code",
        "anchor": "/api/payment/registration?sessionId=",
        "line": 31
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "HealthTopicRegistration / checkoutSessionId",
        "kind": "code",
        "anchor": "model HealthTopicRegistration",
        "line": 662
      },
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "registration amount and currency match",
        "kind": "code",
        "anchor": "const matches",
        "line": 77
      }
    ],
    "next": "持續驗證角色、重送與資料衝突；外部服務與正式啟用狀態需獨立證據。",
    "description": "根據可信付款事件建立正式報名。",
    "missingRequirement": "已驗證的範圍為開發軟體與隔離 PostgreSQL；不包含正式臨床寫入、真實身分、實際投遞或收款。",
    "safeError": null
  },
  {
    "id": "portal-entitlements",
    "from": "registration",
    "to": "portals",
    "status": "planned",
    "data": "應傳送：報名權益、課程出席、完成紀錄與繼續教育學分；病人追蹤需另有本人病歷授權。",
    "assessment": "課程頁為設計稿，病人中心是靜態建置中卡片；未形成學生課程權益或病人自助病歷的服務連線。",
    "evidence": [
      {
        "path": "src/app/courses-events/page.tsx",
        "symbol": "registrationSteps / 尚未開放",
        "kind": "code",
        "anchor": "registrationSteps",
        "line": 33
      },
      {
        "path": "src/app/patient-center/page.tsx",
        "symbol": "patientModules",
        "kind": "code",
        "anchor": "patientModules",
        "line": 10
      }
    ],
    "next": "分別設計學生與病人身分對應、授權資料服務及完成狀態。",
    "description": "把報名與課程完成結果轉為個人服務權益。",
    "missingRequirement": "分別設計學生與病人身分對應、授權資料服務及完成狀態。",
    "safeError": null
  },
  {
    "id": "contact-submit",
    "from": "contact",
    "to": "contactApi",
    "status": "connected",
    "data": "姓名、電子郵件、主旨與訊息；回傳是否送出及是否已存入資料庫。",
    "assessment": "表單呼叫聯絡服務，伺服器檢查欄位、格式與長度。",
    "evidence": [
      {
        "path": "src/components/ContactSection.tsx",
        "symbol": "fetch /api/contact",
        "kind": "code",
        "anchor": "fetch('/api/contact'",
        "line": 37
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "validateContactPayload / savedToDatabase",
        "kind": "code",
        "anchor": "validateContactPayload",
        "line": 15
      }
    ],
    "next": "以測試信箱驗證送出與錯誤訊息。",
    "description": "提交聯絡訊息並接收送出結果。",
    "missingRequirement": "以測試信箱驗證送出與錯誤訊息。",
    "safeError": null
  },
  {
    "id": "contact-mail",
    "from": "contactApi",
    "to": "mail",
    "status": "partly_connected",
    "data": "收件者、回覆地址、主旨與已跳脫內容的郵件本文。",
    "assessment": "郵件服務接受、明確拒絕與結果不明分開保存；安全重試與管理畫面已完成隔離測試。",
    "evidence": [
      {
        "path": "src/lib/contactDelivery.ts",
        "symbol": "deliverContact / bounded SMTP / delivery audit",
        "kind": "code",
        "anchor": "deliverContact",
        "line": 14
      }
    ],
    "next": "使用者更新 Ubuntu SMTP 設定後再確認實際投遞。",
    "description": "向診所投遞聯絡訊息郵件。",
    "missingRequirement": "正式 SMTP 認證與實際投遞仍需供應商證據。",
    "safeError": null
  },
  {
    "id": "contact-storage",
    "from": "contactApi",
    "to": "db",
    "status": "connected",
    "data": "先保存的聯絡訊息、郵件投遞狀態、管理處理狀態與稽核事件。",
    "assessment": "聯絡訊息保存、重複送出、接收清單與郵件狀態均已在隔離資料庫驗證。",
    "evidence": [
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "contact.create / savedToDatabase / authorizeEhrRequest",
        "kind": "code",
        "anchor": "transaction.contact.create",
        "line": 85
      },
      {
        "path": "src/app/api/admin/contacts/[id]/route.ts",
        "symbol": "contact.update / writeAuditLog",
        "kind": "code",
        "anchor": "transaction.contact.update",
        "line": 31
      }
    ],
    "next": "以隔離資料庫驗證冪等重試、保存優先、收件匣授權與狀態稽核。",
    "description": "保存訊息並供受保護的收件匣處理。",
    "missingRequirement": "正式郵件投遞另行驗證；保存成功不代表收件匣已送達。",
    "safeError": null
  },
  {
    "id": "business-audit",
    "from": "bookingApi",
    "to": "audit",
    "status": "connected",
    "data": "操作、資源識別碼、行為人、角色、來源與結果；病歷服務另傳病人識別碼。",
    "assessment": "預約、病歷、報到、聯絡及結帳服務已有稽核呼叫；部分業務寫入與稽核共用交易。此連線代表共同依賴，不表示所有操作均已完整涵蓋。",
    "evidence": [
      {
        "path": "src/app/api/appointments/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/ehr/intakes/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 5
      },
      {
        "path": "src/app/api/kiosk/checkin/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      },
      {
        "path": "src/app/api/contact/route.ts",
        "symbol": "writeAuditLog",
        "kind": "code",
        "anchor": "writeAuditLog",
        "line": 4
      }
    ],
    "next": "逐項核對需要稽核的操作與交易失敗情境。",
    "description": "把預約操作送入共同稽核服務。",
    "missingRequirement": "逐項核對需要稽核的操作與交易失敗情境。",
    "safeError": null
  },
  {
    "id": "webhook-audit",
    "from": "webhook",
    "to": "audit",
    "status": "connected",
    "data": "付款或身分事件識別碼、工作階段、行為人、結果與去重收據。",
    "assessment": "付款與身分回呼均在交易中保存事件收據及稽核；身分回呼同樣依賴外部端點與簽章設定。",
    "evidence": [
      {
        "path": "src/app/api/webhooks/stripe/route.ts",
        "symbol": "auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "auditWebhookReceipt",
        "line": 65
      },
      {
        "path": "src/app/api/webhooks/clerk/route.ts",
        "symbol": "verifyWebhook / auditWebhookReceipt / writeAuditLog",
        "kind": "code",
        "anchor": "verifyWebhook",
        "line": 1
      }
    ],
    "next": "使用測試事件確認身分事件投遞與重複事件處理。",
    "description": "保存付款與身分事件的去重及稽核紀錄。",
    "missingRequirement": "使用測試事件確認身分事件投遞與重複事件處理。",
    "safeError": null
  },
  {
    "id": "audit-storage",
    "from": "audit",
    "to": "db",
    "status": "connected",
    "data": "稽核事件、前筆與本筆雜湊、紀錄鏈頭及驗證結果。",
    "assessment": "稽核服務鎖定並更新紀錄鏈，讀取事件重新計算雜湊；此機制提供竄改跡象，並非完整營運監控。",
    "evidence": [
      {
        "path": "src/lib/auditLog.ts",
        "symbol": "appendAuditLog / verifyAuditChain",
        "kind": "code",
        "anchor": "appendAuditLog",
        "line": 231
      },
      {
        "path": "prisma/schema.prisma",
        "symbol": "AuditLog / AuditLogChain / AuditWebhookReceipt",
        "kind": "code",
        "anchor": "AuditLog",
        "line": 113
      }
    ],
    "next": "驗證新增、回滾、竄改偵測及併發寫入。",
    "description": "保存稽核事件並維護可驗證的雜湊鏈。",
    "missingRequirement": "驗證新增、回滾、竄改偵測及併發寫入。",
    "safeError": null
  },
  {
    "id": "audit-view",
    "from": "admin",
    "to": "audit",
    "status": "connected",
    "data": "授權角色、篩選與分頁條件；回傳事件清單、總數及紀錄鏈驗證結果。",
    "assessment": "管理員可讀取；診所人員另需稽核檢視權限。檢視與驗證介面均呼叫伺服器授權。",
    "evidence": [
      {
        "path": "src/app/admin/audit-logs/AuditLogViewer.tsx",
        "symbol": "fetch / verifyChain",
        "kind": "code",
        "anchor": "fetch",
        "line": 52
      },
      {
        "path": "src/app/api/admin/audit-logs/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 3
      },
      {
        "path": "src/app/api/admin/audit-logs/verify-chain/route.ts",
        "symbol": "authorizeAuditLogAccess",
        "kind": "code",
        "anchor": "authorizeAuditLogAccess",
        "line": 2
      }
    ],
    "next": "以管理員、授權人員及無權限帳號驗證讀取結果。",
    "description": "在授權後查詢事件與驗證紀錄鏈。",
    "missingRequirement": "以管理員、授權人員及無權限帳號驗證讀取結果。",
    "safeError": null
  },
  {
    "id": "ubuntu-application",
    "from": "ubuntuHost",
    "to": "public",
    "description": "在 Ubuntu 主機部署網站應用程式。",
    "data": "應傳送：網站請求、服務狀態與不含內容的健康回應。",
    "missingRequirement": "完成部署與成功回應驗證。",
    "status": "planned",
    "assessment": "屬期末專案規劃，尚無可核對的成功部署或連線結果。",
    "next": "完成部署與成功回應驗證。",
    "safeError": null,
    "evidence": [
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## Ubuntu 主機",
        "anchor": "## Ubuntu 主機",
        "line": 3
      },
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## 資料庫伺服器",
        "anchor": "## 資料庫伺服器",
        "line": 8
      }
    ]
  },
  {
    "id": "ubuntu-database",
    "from": "ubuntuHost",
    "to": "databaseServer",
    "description": "從 Ubuntu 應用程式連接資料庫伺服器。",
    "data": "應交換：受保護的資料存取請求；儀表板僅保留連通狀態。",
    "missingRequirement": "完成驅動、網路設定與唯讀連線測試。",
    "status": "planned",
    "assessment": "屬期末專案規劃，尚無可核對的成功部署或連線結果。",
    "next": "完成驅動、網路設定與唯讀連線測試。",
    "safeError": null,
    "evidence": [
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## Ubuntu 主機",
        "anchor": "## Ubuntu 主機",
        "line": 3
      },
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## 資料庫伺服器",
        "anchor": "## 資料庫伺服器",
        "line": 8
      }
    ]
  },
  {
    "id": "database-migration",
    "from": "db",
    "to": "databaseServer",
    "description": "將本機資料結構遷移至期末資料庫伺服器。",
    "data": "應交換：版本化資料結構與遷移結果；不展示資料列。",
    "missingRequirement": "確認目標資料庫相容性並驗證遷移。",
    "status": "planned",
    "assessment": "屬期末專案規劃，尚無可核對的成功部署或連線結果。",
    "next": "確認目標資料庫相容性並驗證遷移。",
    "safeError": null,
    "evidence": [
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## Ubuntu 主機",
        "anchor": "## Ubuntu 主機",
        "line": 3
      },
      {
        "kind": "plan",
        "path": "docs/architecture-final-project.md",
        "symbol": "## 資料庫伺服器",
        "anchor": "## 資料庫伺服器",
        "line": 8
      }
    ]
  }
]

function checked<T extends { status: ConnectionStatus; evidence: Evidence[]; safeError: string | null }>(item: T): T {
  const checks = snapshot.evidence as Record<string, { valid: boolean; line: number }>
  const valid = item.evidence.length > 0 && item.evidence.every(evidence => checks[evidence.path + '|' + evidence.symbol]?.valid)
  return { ...item, status: item.status === 'connected' && !valid ? 'unknown' : item.status, safeError: item.status === 'connected' && !valid ? '來源證據需要重新確認。' : item.safeError, evidence: item.evidence.map(evidence => ({ ...evidence, line: checks[evidence.path + '|' + evidence.symbol]?.line ?? evidence.line })) }
}

export const architectureComponents: Record<ComponentId, ArchitectureComponent> = Object.fromEntries(Object.entries(componentDefinitions).map(([id, component]) => [id, { ...checked(component), lastTest: lastTest('component', id) }])) as Record<ComponentId, ArchitectureComponent>
export const architectureConnections: ArchitectureConnection[] = connectionDefinitions.map(connection => ({ ...checked(connection), lastTest: lastTest('connection', connection.id) }))
export const architectureDiscovery = snapshot
export const architectureWorkflows = [
  {
    "id": "identity",
    "name": "登入、角色與後台存取",
    "outcome": "本架構頁已具管理員檢查；其他後台頁與帳號管理仍須補齊。",
    "connections": [
      "identity-session",
      "identity-role",
      "guard-storage",
      "admin-guard",
      "account-management"
    ]
  },
  {
    "id": "booking",
    "name": "公開預約至後台管理與通知",
    "outcome": "表單、儲存與後台管理已有接線；通知投遞仍需實測。",
    "connections": [
      "booking-submit",
      "booking-save",
      "booking-manage",
      "holiday-management",
      "booking-notify"
    ]
  },
  {
    "id": "clinical",
    "name": "預約轉病人、問卷與臨床照護",
    "outcome": "預約可由人員明確連結病人，報到可為已連結預約建立待指派看診；草稿寫入已接線，臨床簽核與帳務未完成。",
    "connections": [
      "booking-patient",
      "patient-entry",
      "patient-save",
      "clinical-read",
      "clinical-write",
      "clinical-persist",
      "clinical-ai"
    ]
  },
  {
    "id": "kiosk",
    "name": "當日預約至驗證報到與看診",
    "outcome": "報到會冪等建立已連結病人的待指派看診；簡訊真實投遞及資料庫遷移尚未驗證。",
    "connections": [
      "kiosk-request",
      "kiosk-sms",
      "kiosk-save",
      "checkin-encounter"
    ]
  },
  {
    "id": "payment",
    "name": "講座結帳至正式報名與課程權益",
    "outcome": "結帳已建立待付款報名，簽章事件更新狀態且付款頁向伺服器查詢；外部事件和課程權益尚未驗證或建置。",
    "connections": [
      "payment-request",
      "payment-platform",
      "payment-callback",
      "payment-registration",
      "registration-persist",
      "portal-entitlements"
    ]
  },
  {
    "id": "contact",
    "name": "聯絡表單至郵件與訊息保存",
    "outcome": "訊息先存檔並由受保護收件匣管理；郵件服務設定與實際投遞仍待驗證。",
    "connections": [
      "contact-submit",
      "contact-mail",
      "contact-storage"
    ]
  },
  {
    "id": "audit",
    "name": "業務與外部事件至稽核檢視",
    "outcome": "稽核寫入、持久化、查詢及驗證已有接線；外部事件投遞與實際資料庫行為需整合驗證。",
    "connections": [
      "business-audit",
      "patient-audit",
      "kiosk-audit",
      "contact-audit",
      "checkout-audit",
      "webhook-audit",
      "audit-storage",
      "audit-view"
    ]
  },
  {
    "id": "infrastructure",
    "name": "期末部署：Ubuntu 主機與資料庫伺服器",
    "outcome": "目前僅有本機資料庫模型；兩個期末部署元件與三條連線均保持規劃中。",
    "connections": [
      "ubuntu-application",
      "ubuntu-database",
      "database-migration"
    ]
  }
]
