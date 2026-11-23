import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { contactSmtpConfig, deliverContact } from '@/lib/contactDelivery'
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

export async function POST(request: NextRequest) {
  try {
    let raw: unknown
    try { raw = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
    if (!raw || typeof raw !== 'object' || !['name', 'email', 'subject', 'message'].every(key => typeof (raw as Record<string, unknown>)[key] === 'string')) return NextResponse.json({ error: 'Invalid contact fields.' }, { status: 400 })
    const body = raw as Partial<ContactPayload>
    const validation = validateContactPayload(body)

    if (!validation.valid || !validation.value) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const smtpConfig = contactSmtpConfig()
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
      const delivery = await deliverContact(contact.id)
      return NextResponse.json({ message: delivery === 'sent' ? '訊息已保存，郵件服務已接受通知。' : '訊息已保存；郵件結果尚未確認，診所可從管理清單追蹤。', savedToDatabase: true, emailDeliveryStatus: delivery }, { status: 201 })
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
