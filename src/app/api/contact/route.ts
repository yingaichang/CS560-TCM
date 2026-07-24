import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

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
    if (!smtpConfig) {
      return NextResponse.json(
        { error: '伺服器郵件設定不完整，請聯絡管理員' },
        { status: 500 }
      )
    }

    const { name, email, subject, message } = validation.value

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
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

    let savedToDatabase = false
    try {
      await prisma.contact.create({
        data: {
          name,
          email,
          subject,
          message,
          status: 'new',
        },
      })
      savedToDatabase = true
    } catch (dbError) {
      console.error('Contact saved email but DB write failed:', dbError)
    }

    return NextResponse.json(
      {
        message: '訊息已成功送出，我們會盡快回覆您。',
        savedToDatabase,
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
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
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
