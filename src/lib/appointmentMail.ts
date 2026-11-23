import nodemailer from 'nodemailer'
import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'
import { contactSmtpConfig } from '@/lib/contactDelivery'
import { CommandError, lockSoftwareWrites } from '@/lib/softwareCommands'
import { classifyMailAcceptance } from '@/lib/integrations/workflowPolicies'

type MailAppointment = { id: string; name: string; email: string | null; phone: string; service: string; date: Date; appointmentTime: string | null; status: string; updatedAt: Date }
type Delivery = { state: string; attempts: number }
export function appointmentNotificationKey(a: { id: string; updatedAt: Date }, kind: 'admin' | 'patient') {
  return 'appointment-mail:' + createHash('sha256').update(`${a.id}:${a.updatedAt.toISOString()}:${kind}`).digest('hex')
}

export async function sendAppointmentNotification(a: MailAppointment, kind: 'admin' | 'patient', expectedAttempts?: number) {
  const id = appointmentNotificationKey(a, kind)
  const config = contactSmtpConfig()
  const claimed = await prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    const current = await tx.appointment.findUnique({ where: { id: a.id }, select: { updatedAt: true } })
    if (!current || current.updatedAt.getTime() !== a.updatedAt.getTime()) throw new CommandError('Appointment changed. Reload before sending.')
    const receipt = await tx.auditWebhookReceipt.findUnique({ where: { id } })
    const prior: Delivery | null = receipt ? JSON.parse(receipt.provider) : null
    if (expectedAttempts === undefined && prior) return { send: false, ...prior }
    if (expectedAttempts !== undefined && ((prior?.attempts ?? 0) !== expectedAttempts || (prior && !['failed', 'not_configured'].includes(prior.state)))) throw new CommandError('Notification state changed. Reload before retrying.')
    const state = !config ? 'not_configured' : kind === 'patient' && !a.email ? 'missing_recipient' : 'sending'
    const next = { state, attempts: (prior?.attempts ?? 0) + (state === 'sending' ? 1 : 0) }
    await tx.auditWebhookReceipt.upsert({ where: { id }, create: { id, provider: JSON.stringify(next) }, update: { provider: JSON.stringify(next) } })
    await writeAuditLog({ serviceId: 'appointment-mail', actorRole: 'system', action: 'notification_' + kind, resource: 'appointment_notification', resourceId: a.id, source: 'system.appointment-mail', module: 'appointments', outcome: state, summary: `Appointment ${kind} notification state recorded; attempt ${next.attempts}` }, tx)
    return { send: state === 'sending', ...next }
  })
  if (!claimed.send || !config) return claimed
  const transport = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000 })
  let state = 'unknown'
  try {
    const result = await transport.sendMail({ from: config.from, to: kind === 'admin' ? config.to : a.email!, subject: kind === 'admin' ? '新預約申請' : `預約狀態：${a.status}`, text: [`姓名: ${a.name}`, `服務: ${a.service}`, `日期: ${a.date.toISOString().slice(0, 10)} ${a.appointmentTime || ''}`, `狀態: ${a.status}`].join('\n') })
    state = classifyMailAcceptance(result)
  } catch (error) {
    state = ['EAUTH', 'EENVELOPE', 'ECONNECTION', 'EDNS'].includes((error as { code?: string }).code || '') ? 'failed' : 'unknown'
  } finally { transport.close() }
  await prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    await tx.auditWebhookReceipt.update({ where: { id }, data: { provider: JSON.stringify({ state, attempts: claimed.attempts }) } })
    await writeAuditLog({ serviceId: 'appointment-mail', actorRole: 'system', action: 'notification_' + kind, resource: 'appointment_notification', resourceId: a.id, source: 'system.appointment-mail', module: 'appointments', outcome: state, summary: `Appointment ${kind} notification result recorded; SMTP acceptance does not verify inbox delivery` }, tx)
  })
  return { state, attempts: claimed.attempts }
}

// A notification error must not undo a committed booking or status update.
export async function notifyNewAppointment(a: MailAppointment) {
  for (const kind of ['admin', 'patient'] as const) {
    try { await sendAppointmentNotification(a, kind) } catch { console.error('Appointment notification could not be confirmed; booking remains saved.') }
  }
}
export async function notifyAppointmentStatus(a: MailAppointment) {
  try { await sendAppointmentNotification(a, 'patient') } catch { console.error('Appointment notification could not be confirmed; status remains saved.') }
}
