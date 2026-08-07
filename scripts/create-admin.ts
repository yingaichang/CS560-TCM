import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const [,, emailArg, passwordArg, nameArg, roleArg] = process.argv

if (!emailArg || !passwordArg) {
  console.error('Usage: npx tsx scripts/create-admin.ts <email> <password> [name] [role]')
  process.exit(1)
}

const email = emailArg
const password = passwordArg
const name = nameArg || '診所管理員'
const role = roleArg || 'admin'

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`User with email ${email} already exists. Updating password and role...`)
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.update({
      where: { email },
      data: { password: passwordHash, name, role },
    })
    console.log('Updated user:', user.email)
  } else {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name, role },
    })
    console.log('Created admin user:', user.email)
  }
}

main()
  .catch((error) => {
    console.error('Error creating admin user:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
