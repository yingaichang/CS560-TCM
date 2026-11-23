import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { writeAuditLog, type AuditEvent } from '@/lib/auditLog'
import { CommandError, lockSoftwareWrites } from '@/lib/softwareCommands'

export function contactSmtpConfig() {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user, to = process.env.CONTACT_RECEIVER_EMAIL || user
  const port = Number(process.env.SMTP_PORT || 465)
  if (!host || !user || !pass || !from || !to || !Number.isInteger(port) || port < 1 || port > 65535) return null
  return { host, port, user, pass, from, to, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465 }
}

export async function deliverContact(id: string, retry = false, actor?: Pick<AuditEvent, 'userId' | 'externalUserId' | 'sessionId' | 'actorRole'>, expectedAttempts?: number) {
  const config = contactSmtpConfig()
  if (!config) throw new CommandError('Mail is not configured; the message remains saved.', 503)
  const contact = await prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    const record = await tx.contact.findUnique({ where: { id } })
    if (!record) throw new CommandError('Contact message not found.', 404)
    if (retry) {
      if (!['failed', 'not_configured'].includes(record.emailDeliveryStatus) || record.emailDeliveryAttempts !== expectedAttempts) throw new CommandError('Delivery state changed or already attempted. Reload the inbox.')
      await tx.contact.update({ where: { id }, data: { emailDeliveryStatus: 'sending', emailDeliveryAttempts: { increment: 1 }, emailDeliveryAttemptedAt: new Date() } })
      await writeAuditLog({ ...actor, actorRole: actor?.actorRole || 'system', action: 'notification_retry', resource: 'contact_message', resourceId: id, source: 'admin.contact-inbox', module: 'contact', summary: 'Explicit notification retry claimed' }, tx)
    } else if (record.emailDeliveryStatus !== 'sending') throw new CommandError('Notification is not awaiting initial delivery.')
    return record
  })
  let status: 'sent' | 'failed' | 'unknown' = 'unknown'
  const transport = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000 })
  try {
    const result = await transport.sendMail({ from: config.from, to: config.to, replyTo: contact.email, subject: `網站聯絡表單: ${contact.subject}`, text: `姓名: ${contact.name}\nEmail: ${contact.email}\n主旨: ${contact.subject}\n\n${contact.message}` })
    status = result.accepted?.length > 0 ? result.rejected?.length ? 'unknown' : 'sent' : 'failed'
  } catch (error) {
    // A timeout/disconnect may occur after acceptance. Do not encourage blind retries.
    const code = (error as { code?: string }).code
    status = ['EAUTH', 'EENVELOPE', 'ECONNECTION', 'EDNS'].includes(code || '') ? 'failed' : 'unknown'
  } finally { transport.close() }
  await prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    await tx.contact.update({ where: { id }, data: { emailDeliveryStatus: status } })
    await writeAuditLog({ serviceId: 'contact-form', actorRole: 'system', action: status === 'sent' ? 'notification_sent' : status === 'failed' ? 'notification_failed' : 'notification_unknown', resource: 'contact_message', resourceId: id, source: 'system.contact-mail', module: 'contact', outcome: status, summary: status === 'sent' ? 'SMTP server accepted notification; inbox delivery is not verified' : 'Notification result recorded without claiming delivery' }, tx)
  })
  return status
}
