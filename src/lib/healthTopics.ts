export interface HealthTopic {
  id: string
  topic: string
  summary: string
  date: string
  time: string
  presenter: string
  location: string
  feeTwd: number
}

export const healthTopics: HealthTopic[] = [
  {
    id: 'wellness-care',
    topic: '養生保健',
    summary: '從作息、飲食與節氣調養出發，幫助你建立可長期維持的日常養生節奏。',
    date: '2026-08-02',
    time: '10:00-11:30',
    presenter: '林若晴 中醫師',
    location: '台北院區 2F 講堂 A',
    feeTwd: 2000,
  },
  {
    id: 'constitution-adjustment',
    topic: '體質調理',
    summary: '帶你辨識寒熱虛實與常見體質特徵，快速找到更適合自己的調理方向。',
    date: '2026-08-09',
    time: '14:00-15:30',
    presenter: '陳柏宇 中醫師',
    location: '台北院區 2F 講堂 B',
    feeTwd: 2200,
  },
  {
    id: 'common-diseases',
    topic: '常見疾病',
    summary: '以門診高頻案例說明中醫在失眠、過敏與腸胃不適等問題的調理策略。',
    date: '2026-08-16',
    time: '10:00-11:30',
    presenter: '王欣怡 中醫師',
    location: '台北院區 3F 多功能教室',
    feeTwd: 2100,
  },
  {
    id: 'therapy-introduction',
    topic: '療法介紹',
    summary: '系統介紹針灸、艾灸與推拿的適應症與注意事項，幫助你安心選擇合適療程。',
    date: '2026-08-23',
    time: '14:00-15:30',
    presenter: '張以恆 主治醫師',
    location: '台北院區 3F 示範空間',
    feeTwd: 2300,
  },
]

export function findHealthTopicById(topicId: string) {
  return healthTopics.find((topic) => topic.id === topicId)
}
