export const symptomGroups: Record<string, string[]> = {
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

export const medicalConditions = [
  'Cancer', 'Diabetes', 'Hepatitis', 'Hypertension', 'Autoimmune disease', 'Stroke', 'Heart disease',
  'Seizures', 'Arthritis', 'Asthma', 'Thyroid disease', 'Mental illness', 'Infectious diseases',
]

export const cptCodes = [
  { code: '99201', service: 'Initial Evaluation', type: 'Evaluation', sequence: 'Initial' },
  { code: '99202', service: 'Initial Evaluation', type: 'Evaluation', sequence: 'Initial' },
  { code: '99203', service: 'Initial Evaluation', type: 'Evaluation', sequence: 'Initial' },
  { code: '97813', service: 'Electric Acupuncture', type: 'Electro-Acupuncture', sequence: 'Subsequent' },
  { code: '97814', service: 'Electric Acupuncture', type: 'Electro-Acupuncture', sequence: 'Subsequent' },
  { code: '97140', service: 'Manual Therapy', type: 'Manual Therapy', sequence: 'Subsequent' },
]