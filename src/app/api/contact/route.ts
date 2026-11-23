import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import nodemailer from 'nodemailer'
import { writeAuditLog } from '@/lib/auditLog'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

function validateContactPayload(payload: Partial<ContactPayload>) {
  const name = (payload.name || '').trim()
  const email = (payload.email || '').trim()
  const subject = (payload.subject || '').trim()
  const message = (payload.message || '').trim()

  if (!name || !email || !subject || !message) {
    return { valid: false, error: '請完整填寫所有必填欄位' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: '請輸入有效的電子郵件格式' }
  }

  if (name.length > 100 || subject.length > 150 || message.length > 3000) {
    return { valid: false, error: '輸入內容超過長度限制' }
  }

  return {
    valid: true,
    value: {
      name,
      email,
      subject,
      message,
    },
  }
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user
  const to = process.env.CONTACT_RECEIVER_EMAIL || user
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465

  if (!host || !user || !pass || !from || !to || Number.isNaN(port)) {
    return null
  }

  return { host, port, user, pass, from, to, secure }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ContactPayload>
    const validation = validateContactPayload(body)

    if (!validation.valid || !validation.value) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const smtpConfig = getSmtpConfig()
    const { name, email, subject, message } = validation.value
    const submissionId = request.headers.get('idempotency-key')
    if (submissionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission identifier.' }, { status: 400 })
    }

    if (submissionId) {
      const previous = await prisma.contact.findUnique({ where: { submissionId } })
      if (previous) {
        const sameSubmission = previous.name === name
          && previous.email === email
          && previous.subject === subject
          && previous.message === message
        if (!sameSubmission) return NextResponse.json({ error: 'Submission identifier was already used.' }, { status: 409 })
        return NextResponse.json({
          message: previous.emailDeliveryStatus === 'sent'
            ? '訊息已保存，通知郵件已送出。'
            : '訊息已保存；郵件通知尚未確認，診所可從管理清單追蹤。',
          savedToDatabase: true,
          emailDeliveryStatus: previous.emailDeliveryStatus,
          duplicate: true,
        })
      }
    }

    let contact: { id: string }
    try {
      contact = await prisma.$transaction(async (transaction) => {
        const saved = await transaction.contact.create({
          data: {
            submissionId,
            name,
            email,
            subject,
            message,
            status: 'new',
            emailDeliveryStatus: smtpConfig ? 'sending' : 'not_configured',
            emailDeliveryAttempts: smtpConfig ? 1 : 0,
            emailDeliveryAttemptedAt: smtpConfig ? new Date() : null,
          },
          select: { id: true, submissionId: true },
        })
        await writeAuditLog({
          serviceId: 'contact-form',
          action: 'submit',
          resource: 'contact_message',
          resourceId: saved.id,
          actorRole: 'public',
          source: 'public.contact',
          module: 'contact',
          outcome: 'saved',
          summary: 'Contact message saved',
        }, transaction)
        return saved
      })
    } catch (error) {
      if (submissionId && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const previous = await prisma.contact.findUnique({ where: { submissionId } })
        if (previous) {
          const sameSubmission = previous.name === name
            && previous.email === email
            && previous.subject === subject
            && previous.message === message
          if (!sameSubmission) return NextResponse.json({ error: 'Submission identifier was already used.' }, { status: 409 })
          return NextResponse.json({
            message: '訊息已保存；郵件通知尚未確認，診所可從管理清單追蹤。',
            savedToDatabase: true,
            emailDeliveryStatus: previous.emailDeliveryStatus,
            duplicate: true,
          })
        }
      }
      throw error
    }

    if (smtpConfig) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: { user: smtpConfig.user, pass: smtpConfig.pass },
        })
        await transporter.sendMail({
          from: smtpConfig.from,
          to: smtpConfig.to,
          replyTo: email,
          subject: `網站聯絡表單: ${subject}`,
          text: [
            '收到新的聯絡訊息',
            '',
            `姓名: ${name}`,
            `Email: ${email}`,
            `主旨: ${subject}`,
            '',
            '內容:',
            message,
          ].join('\n'),
          html: `
            <h2>收到新的聯絡訊息</h2>
            <p><strong>姓名:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>主旨:</strong> ${escapeHtml(subject)}</p>
            <p><strong>內容:</strong><br/>${escapeHtml(message)}</p>
          `,
        })
        await prisma.$transaction(async (transaction) => {
          await transaction.contact.update({
            where: { id: contact.id },
            data: { emailDeliveryStatus: 'sent' },
          })
          await writeAuditLog({
            serviceId: 'contact-form',
            action: 'notification_sent',
            resource: 'contact_message',
            resourceId: contact.id,
            actorRole: 'system',
            source: 'system.contact-mail',
            module: 'contact',
            outcome: 'success',
            summary: 'Contact notification sent',
          }, transaction)
        })
      } catch (error) {
        console.error('Contact message saved but email delivery could not be confirmed:', error)
        await prisma.$transaction(async (transaction) => {
          await transaction.contact.update({
            where: { id: contact.id },
            data: { emailDeliveryStatus: 'failed' },
          })
          await writeAuditLog({
            serviceId: 'contact-form',
            action: 'notification_failed',
            resource: 'contact_message',
            resourceId: contact.id,
            actorRole: 'system',
            source: 'system.contact-mail',
            module: 'contact',
            outcome: 'failed',
            summary: 'Contact notification delivery failed',
          }, transaction)
        })
        return NextResponse.json({
          message: '訊息已保存，但郵件通知未能確認送達；診所可從管理清單追蹤。',
          savedToDatabase: true,
          emailDeliveryStatus: 'failed',
        }, { status: 201 })
      }
    }

    return NextResponse.json(
      {
        message: smtpConfig
          ? '訊息已保存，通知郵件已送出。'
          : '訊息已保存；郵件尚未設定，診所可從管理清單追蹤。',
        savedToDatabase: true,
        emailDeliveryStatus: smtpConfig ? 'sent' : 'not_configured',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending contact message:', error)
    return NextResponse.json(
      { error: '發送訊息失敗，請稍後重試' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      actorRole: actor.role,
      action: 'read_list',
      resource: 'contact_message',
      source: 'admin.contact-list',
      module: 'contact',
      summary: 'Contact message list read',
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: '無法獲取聯絡資訊' },
      { status: 500 }
    )
  }
}
