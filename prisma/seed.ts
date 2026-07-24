import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const holidaySeeds = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day' },
  { date: '2026-02-16', name: "Washington's Birthday" },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-06-19', name: 'Juneteenth National Independence Day' },
  { date: '2026-07-03', name: 'Independence Day' },
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-10-12', name: 'Columbus Day' },
  { date: '2026-11-11', name: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
]

async function main() {
  // Clear existing data
  await prisma.holiday.deleteMany()
  await prisma.healthArticle.deleteMany()
  await prisma.doctor.deleteMany()

  // Create doctors
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: '李明智',
        title: '院長',
        specialty: '內科調理',
        bio: '國家高級中醫師，擅長體質調理與慢性病管理，深受患者信賴。',
        experience: '25年臨床經驗',
      },
    }),
    prisma.doctor.create({
      data: {
        name: '王芳妤',
        title: '主任醫師',
        specialty: '婦科調理',
        bio: '專攻女性健康，特別擅長月經調理與更年期症狀改善。',
        experience: '18年臨床經驗',
      },
    }),
    prisma.doctor.create({
      data: {
        name: '張瑋翔',
        title: '醫師',
        specialty: '骨傷科',
        bio: '專精於推拿、拔罐等物理療法，幫助患者快速恢復。',
        experience: '15年臨床經驗',
      },
    }),
    prisma.doctor.create({
      data: {
        name: '陳雅琪',
        title: '醫師',
        specialty: '針灸推拿',
        bio: '運用針灸、艾灸等傳統療法，改善各類疼痛與功能障礙。',
        experience: '12年臨床經驗',
      },
    }),
  ])

  console.log('✓ Created doctors:', doctors.length)

  // Create health articles
  const articles = await Promise.all([
    prisma.healthArticle.create({
      data: {
        title: '四季養生之春季調理要點',
        excerpt:
          '春季是萬物生發的季節，中醫認為春季應該順應自然規律，著重調理肝臟功能，培養陽氣。',
        content:
          '春季養生重點應放在調理肝臟與培養陽氣上。此時應早睡早起，多做溫和的運動以舒展筋骨。飲食上應以清淡為主，多食新鮮蔬菜和春筍等春季食材，避免過度進補。',
        category: '養生保健',
        published: true,
      },
    }),
    prisma.healthArticle.create({
      data: {
        title: '體質辨識：認識你的中醫體質',
        excerpt:
          '中醫強調「辨體論治」，了解自己的體質類型是制定個性化調理方案的第一步。',
        content:
          '中醫體質學將人體分為9種體質類型，包括平和質、氣虛質、陽虛質、陰虛質等。每種體質都有不同的調理方法和食療建議。通過科學的體質辨識，我們可以更有針對性地進行養生調理。',
        category: '體質調理',
        published: true,
      },
    }),
    prisma.healthArticle.create({
      data: {
        title: '中醫調理失眠的方法',
        excerpt:
          '失眠困擾著許多現代人。中醫從脾、心、腎等多個臟腑角度進行調理，效果顯著。',
        content:
          '失眠通常與心脾虛弱、心陰虛或肝火旺盛有關。中醫治療失眠不僅使用中藥調理，還可以結合針灸、推拿、食療等多種方法。建立良好的睡眠習慣同樣重要。',
        category: '常見疾病',
        published: true,
      },
    }),
    prisma.healthArticle.create({
      data: {
        title: '針灸療法在運動傷害中的應用',
        excerpt:
          '針灸是中醫的重要療法，對於運動損傷、肌肉酸痛等問題有快速舒緩的效果。',
        content:
          '針灸療法通過刺激穴位來活血化瘀、舒緩疼痛。對於運動後的肌肉酸痛、扭傷、拉傷等問題，針灸結合拔罐療法往往能快速減輕症狀並促進恢復。',
        category: '療法介紹',
        published: true,
      },
    }),
  ])

  console.log('✓ Created articles:', articles.length)

  const holidays = await prisma.holiday.createMany({
    data: holidaySeeds.map((holiday) => ({
      holidayDate: new Date(`${holiday.date}T00:00:00`),
      name: holiday.name,
      isClosed: true,
    })),
  })

  console.log('✓ Created holidays:', holidays.count)
  console.log('✓ Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('✗ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
