import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const [,, emailArg, nameArg, roleArg, auditPermissionArg] = process.argv

if (!emailArg) {
  console.error('Usage: npx tsx scripts/create-admin.ts <email> [name] [role] [audit:read]')
  process.exit(1)
}

const email = emailArg.trim().toLowerCase()
const name = nameArg || '診所管理員'
const role = roleArg || 'admin'
const canViewAuditLogs = auditPermissionArg === 'audit:read'

async function main() {
  const user = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.user.upsert({
      where: { email },
      update: { name, role, canViewAuditLogs },
      create: { email, name, role, canViewAuditLogs },
    })
    await writeAuditLog({
      serviceId: 'admin-provisioning-script',
      action: 'user_role_configured',
      resource: 'user_account',
      resourceId: updated.id,
      actorRole: 'system',
      source: 'admin.user-provisioning',
      module: 'admin',
      summary: 'Application user role and audit permission configured',
    }, transaction)
    return updated
  })
  console.log(`Assigned ${user.role} application role to ${user.email}`)
}

main()
  .catch((error) => {
    console.error('Error creating admin user:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
