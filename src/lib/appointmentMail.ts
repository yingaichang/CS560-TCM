import nodemailer from 'nodemailer'

type MailAppointment = {
  id: string
  name: string
  email: string | null
  phone: string
  service: string
  date: Date
  appointmentTime: string | null
  message: string | null
  status: string
}

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>')

function getConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user
  const to = process.env.CONTACT_RECEIVER_EMAIL || user
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
  if (!host || !user || !pass || !from || !to || Number.isNaN(port)) return null
  return { host, port, user, pass, from, to, secure }
}

async function send(options: { to: string; subject: string; lines: string[] }) {
  const config = getConfig()
  if (!config) {
    console.warn('SMTP not configured; appointment email skipped')
    return
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  })
  await transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    text: options.lines.join('\n'),
    html: options.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
  })
}

const dateLabel = (a: MailAppointment) =>
  `${a.date.toISOString().slice(0, 10)} ${a.appointmentTime ?? ''}`.trim()

const statusLabels: Record<string, string> = {
  confirmed: '已確認 (Confirmed)',
  cancelled: '已取消 (Cancelled)',
  completed: '已完成 (Completed)',
  pending: '待確認 (Pending)',
}

// Never throws: email problems must not fail the booking or update.
export async function notifyNewAppointment(a: MailAppointment) {
  const config = getConfig()
  try {
    if (config) {
      await send({
        to: config.to,
        subject: `新預約: ${a.name} ${dateLabel(a)}`,
        lines: [
          '收到新的預約申請',
          `姓名: ${a.name}`,
          `電話: ${a.phone}`,
          `Email: ${a.email || '-'}`,
          `服務: ${a.service}`,
          `時間: ${dateLabel(a)}`,
          a.message ? `備註: ${a.message}` : '',
        ].filter(Boolean),
      })
    }
  } catch (error) {
    console.error('Failed to send admin appointment email:', error)
  }

  try {
    if (a.email) {
      await send({
        to: a.email,
        subject: '我們已收到您的預約申請 / Appointment request received',
        lines: [
          `${a.name} 您好，我們已收到您的預約申請，診所確認後會再通知您。`,
          `服務: ${a.service}`,
          `時間: ${dateLabel(a)}`,
          `Hello ${a.name}, we received your appointment request and will confirm it shortly.`,
        ],
      })
    }
  } catch (error) {
    console.error('Failed to send patient appointment email:', error)
  }
}

export async function notifyAppointmentStatus(a: MailAppointment) {
  if (!a.email) return
  try {
    await send({
      to: a.email,
      subject: `預約狀態更新: ${statusLabels[a.status] ?? a.status}`,
      lines: [
        `${a.name} 您好，您的預約狀態已更新為：${statusLabels[a.status] ?? a.status}`,
        `服務: ${a.service}`,
        `時間: ${dateLabel(a)}`,
        `Hello ${a.name}, your appointment status is now: ${statusLabels[a.status] ?? a.status}.`,
      ],
    })
  } catch (error) {
    console.error('Failed to send appointment status email:', error)
  }
}
