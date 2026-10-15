import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const symptomGroups: Record<string, string[]> = {
  Heart: [
    'Irregular heartbeat', 'Cold hands or feet', 'Excessive dreams', 'Chest pain', 'High blood pressure',
    'Night sweating', 'Dizziness', 'Low blood pressure', 'Insomnia', 'Easily wakened', 'Palpitation',
    'Swelling hands or feet', 'Oversleep', 'Poor memory',
  ],
  Lungs: [
    'Cough', 'Phlegm', 'Asthma', 'Shortness of breath', 'Difficulty breathing', 'Sore throat', 'Bronchitis',
    'Common cold', 'Pneumonia', 'Spontaneous sweating', 'Sinus problems', 'Skin problems', 'Loss of voice',
    'Coughing blood', 'Depression',
  ],
  'Spleen & Stomach': [
    'Constipation', 'Diarrhea', 'Nausea', 'Abdominal pain/cramps', 'Stomach pain', 'Abdominal bloating',
    'Loose stool', 'Gassiness', 'Vomiting', 'Acid reflux', 'Indigestion', 'Prolapse', 'Thirst', 'Belching',
    'Foul breath', 'Hemorrhoids', 'Bruise easily', 'Fatigue',
  ],
  Liver: [
    'Headaches', 'Easily sigh', 'Facial redness', 'Easily upset', 'Muscle twitching/spasm', 'Eye problems',
    'Numbness', 'Bitter taste in mouth', 'Brittle nails', 'Pain in ribs', 'Dizziness',
  ],
  Kidney: [
    'Edema', 'Joint pain', 'Night urination', 'Hearing loss', 'Ear ringing', 'Panic/anxiety',
    'Urinary problems', 'Decreased sexual drive', 'Back pain', 'Knee pain', 'Impotence',
  ],
}

const cptCodes = [
  { code: '99201', serviceName: 'Initial Evaluation', serviceType: 'Evaluation', encounterType: 'Initial' },
  { code: '99202', serviceName: 'Initial Evaluation', serviceType: 'Evaluation', encounterType: 'Initial' },
  { code: '99203', serviceName: 'Initial Evaluation', serviceType: 'Evaluation', encounterType: 'Initial' },
  { code: '97813', serviceName: 'Electric Acupuncture', serviceType: 'Electro-Acupuncture', encounterType: 'Subsequent' },
  { code: '97814', serviceName: 'Electric Acupuncture', serviceType: 'Electro-Acupuncture', encounterType: 'Subsequent' },
  { code: '97140', serviceName: 'Manual Therapy', serviceType: 'Manual Therapy', encounterType: 'Subsequent' },
]

async function main() {
  for (const code of cptCodes) {
    await prisma.cptCode.upsert({ where: { code: code.code }, create: code, update: {} })
  }

  for (const [category, names] of Object.entries(symptomGroups)) {
    for (const name of names) {
      await prisma.symptom.upsert({
        where: { category_name: { category, name } },
        create: { category, name },
        update: {},
      })
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async () => {
    await prisma.$disconnect()
    process.exitCode = 1
  })