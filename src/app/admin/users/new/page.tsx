import AdminPageScaffold from '@/components/AdminPageScaffold'

export default function NewAdminUserPage() {
  return (
    <AdminPageScaffold
      title="新增使用者"
      description="新增後台使用者的頁面架構。帳號建立與角色權限尚未實作。"
      backHref="/admin/users"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此輸入使用者資訊並指定初始角色。</p>
        <button type="button" disabled className="mt-5 rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600">
          建立使用者（尚未開放）
        </button>
      </div>
    </AdminPageScaffold>
  )
}
