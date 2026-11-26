export type IntakeField = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  options?: string[]
  autoComplete?: string
  maxLength?: number
  when?: [string, string]
}

export const intakeSteps: { title: string; description: string; fields: IntakeField[] }[] = [
  { title: 'Patient Information', description: 'Enter the patient’s identity and communication preferences.', fields: [
    { name: 'firstName', label: 'First name', required: true, maxLength: 80, autoComplete: 'given-name' },
    { name: 'lastName', label: 'Last name', required: true, maxLength: 80, autoComplete: 'family-name' },
    { name: 'middleName', label: 'Middle name', maxLength: 80, autoComplete: 'additional-name' },
    { name: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true, autoComplete: 'bday' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Female', 'Male', 'Non-binary', 'Other', 'Prefer not to say'] },
    { name: 'preferredLanguage', label: 'Preferred language', maxLength: 80 },
  ] },
  { title: 'Contact Information', description: 'Provide current contact details and mailing address.', fields: [
    { name: 'phone', label: 'Phone number', type: 'tel', required: true, autoComplete: 'tel', maxLength: 40 },
    { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email', maxLength: 254 },
    { name: 'address', label: 'Street address', required: true, autoComplete: 'street-address', maxLength: 240 },
    { name: 'city', label: 'City', required: true, autoComplete: 'address-level2', maxLength: 120 },
    { name: 'state', label: 'State / province', required: true, autoComplete: 'address-level1', maxLength: 120 },
    { name: 'postalCode', label: 'Postal code', required: true, autoComplete: 'postal-code', maxLength: 30 },
    { name: 'country', label: 'Country', required: true, autoComplete: 'country-name', maxLength: 120 },
  ] },
  { title: 'Emergency Contact', description: 'Who should we contact in an emergency?', fields: [
    { name: 'emergencyContact', label: 'Contact’s full name', required: true, maxLength: 160 },
    { name: 'emergencyRelationship', label: 'Relationship to patient', required: true, maxLength: 80 },
    { name: 'emergencyContactPhone', label: 'Contact’s phone number', type: 'tel', required: true, maxLength: 40 },
    { name: 'emergencyContactEmail', label: 'Contact’s email address', type: 'email', required: true, maxLength: 254 },
  ] },
  { title: 'Medical History', description: 'Include relevant conditions, surgeries, hospitalizations, and family history. Write “None” or “Unknown” where appropriate.', fields: [
    { name: 'medicalHistory', label: 'Past and current medical conditions', type: 'textarea', required: true },
    { name: 'surgeries', label: 'Surgeries, injuries, and hospitalizations', type: 'textarea', required: true },
    { name: 'familyHistory', label: 'Relevant family medical history', type: 'textarea' },
    { name: 'pregnancyStatus', label: 'Pregnancy status', type: 'select', required: true, options: ['Not applicable', 'Not pregnant', 'Pregnant', 'Possibly pregnant', 'Prefer to discuss with clinician'] },
  ] },
  { title: 'Medications & Allergies', description: 'Include prescriptions, over-the-counter medicines, herbs, and supplements. Write “None” or “Unknown” where appropriate.', fields: [
    { name: 'medications', label: 'Current medications, herbs, and supplements (dose and frequency)', type: 'textarea', required: true },
    { name: 'allergies', label: 'Allergies or sensitivities and reactions', type: 'textarea', required: true },
  ] },
  { title: 'Present Health Concerns', description: 'Describe the patient’s concerns and goals in their own words.', fields: [
    { name: 'majorComplaints', label: 'Primary health concerns', type: 'textarea', required: true },
    { name: 'onsetDate', label: 'When did symptoms begin? (if known)', type: 'date' },
    { name: 'symptomFrequency', label: 'Symptom frequency', type: 'select', required: true, options: ['Constant', 'Frequent', 'Occasional', 'Intermittent', 'Not applicable'] },
    { name: 'symptomTriggers', label: 'What improves or worsens symptoms?', type: 'textarea' },
    { name: 'healthGoals', label: 'Health goals and impact on daily life', type: 'textarea', required: true },
  ] },
  { title: 'Lifestyle & Social History', description: 'Help us understand daily habits. You may select “Prefer to discuss with clinician” for sensitive questions.', fields: [
    { name: 'sleep', label: 'Sleep quality and typical hours', required: true },
    { name: 'diet', label: 'Diet, appetite, and digestion', type: 'textarea', required: true },
    { name: 'exercise', label: 'Physical activity and exercise', required: true },
    { name: 'stress', label: 'Stress and emotional wellbeing', type: 'select', required: true, options: ['Low', 'Moderate', 'High', 'Prefer to discuss with clinician'] },
    { name: 'substanceUse', label: 'Tobacco, alcohol, caffeine, or other substance use', type: 'textarea', required: true },
    { name: 'occupation', label: 'Occupation and relevant social circumstances' },
  ] },
  { title: 'Insurance & Provider Information', description: 'Record coverage and existing care providers. Coverage can be confirmed separately by clinic staff.', fields: [
    { name: 'insuranceStatus', label: 'Insurance status', type: 'select', required: true, options: ['Insured', 'Self-pay / no insurance', 'Unknown / confirm with clinic'] },
    { name: 'insuranceProvider', label: 'Insurance company', required: true, when: ['insuranceStatus', 'Insured'] },
    { name: 'memberId', label: 'Member / policy ID', required: true, when: ['insuranceStatus', 'Insured'] },
    { name: 'policyholder', label: 'Policyholder’s full name', required: true, when: ['insuranceStatus', 'Insured'] },
    { name: 'groupNumber', label: 'Group number (if applicable)', when: ['insuranceStatus', 'Insured'] },
    { name: 'primaryProvider', label: 'Primary care provider / clinic (or “None” / “Unknown”)', required: true },
    { name: 'providerPhone', label: 'Provider phone number', type: 'tel', maxLength: 40 },
    { name: 'referralSource', label: 'Referring provider or referral source' },
  ] },
  { title: 'Consent & Privacy', description: 'Review the entries using Back before signing. This acknowledges intake information and privacy preferences; clinical consent is handled separately.', fields: [
    { name: 'informationConfirmed', label: 'I confirm that the information provided is accurate to the best of my knowledge.', type: 'checkbox', required: true },
    { name: 'privacyAcknowledged', label: 'I understand this information will be stored in my clinic record and used by authorized clinic staff for intake and care coordination.', type: 'checkbox', required: true },
    { name: 'signatureName', label: 'Patient or authorized representative’s full name', required: true, maxLength: 160 },
    { name: 'signatureDate', label: 'Date signed', type: 'date', required: true },
    { name: 'representativeRelationship', label: 'Relationship to patient (if signing as a representative)' },
  ] },
]

export const fieldIsVisible = (field: IntakeField, values: Record<string, string>) => !field.when || values[field.when[0]] === field.when[1]

export function validateIntakeStep(step: number, values: Record<string, string>, today = new Date().toLocaleDateString('en-CA')) {
  const errors: Record<string, string> = {}
  for (const field of intakeSteps[step].fields) {
    if (!fieldIsVisible(field, values)) continue
    const value = (values[field.name] || '').trim()
    if (field.required && !value) errors[field.name] = field.type === 'checkbox' ? 'Please acknowledge this statement.' : 'This field is required.'
    else if (value) {
      if (value.length > (field.maxLength || 2000)) errors[field.name] = `Use ${field.maxLength || 2000} characters or fewer.`
      if (field.options && !field.options.includes(value)) errors[field.name] = 'Choose a valid option.'
      if (field.type === 'checkbox' && value !== 'true') errors[field.name] = 'Please acknowledge this statement.'
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.name] = 'Enter a valid email address.'
      if (field.type === 'tel' && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) errors[field.name] = 'Enter a valid phone number (7–15 digits).'
      if (field.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value > today)) errors[field.name] = 'Enter a valid date that is not in the future.'
    }
  }
  return errors
}
