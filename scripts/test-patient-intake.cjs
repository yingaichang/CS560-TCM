const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
function load(file, overrides = {}) {
  const m = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  new Function('require', 'module', 'exports', code)(name => overrides[name] || require(name), m, m.exports)
  return m.exports
}
const schema = load('src/lib/ehr/patientIntakeForm.ts')
const { intakeSteps, validateIntakeStep } = schema
const answers = {}
for (const step of intakeSteps) for (const field of step.fields) {
  answers[field.name] = field.options?.[0] || (field.type === 'checkbox' ? 'true' : field.type === 'date' ? '2000-01-01' : field.type === 'email' ? 'synthetic@example.com' : field.type === 'tel' ? '+1 555 123 4567' : 'Synthetic answer')
}
for (let i=0; i<9; i++) {
  assert.ok(Object.keys(validateIntakeStep(i, {})).length > 0, `Step ${i+1} rejects empty required fields`)
  assert.deepEqual(validateIntakeStep(i, answers), {})
}
assert.ok(validateIntakeStep(0, {...answers, dateOfBirth:'2999-01-01'}).dateOfBirth)
assert.ok(validateIntakeStep(0, {...answers, dateOfBirth:'2025-02-30'}).dateOfBirth)
assert.ok(validateIntakeStep(1, {...answers, email:'bad', phone:'123'}).email)
assert.ok(validateIntakeStep(1, {...answers, phone:'123'}).phone)
assert.ok(validateIntakeStep(7, {...answers, insuranceProvider:''}).insuranceProvider)
assert.deepEqual(validateIntakeStep(7, {...answers, insuranceStatus:'自費／無保險', insuranceProvider:'', memberId:'', policyholder:''}), {})
assert.ok(validateIntakeStep(8, {...answers, privacyAcknowledged:'false'}).privacyAcknowledged)

const states=[], refs=[]
let cursor=0, refCursor=0
const Form = load('src/components/admin/PatientIntakeForm.tsx', {
  react: {...React, useEffect() {}, useRef(value) { const i=refCursor++; return refs[i] ||= { current:value } }, useState(initial) { const i=cursor++; if (!(i in states)) states[i]=initial; return [states[i], value => { states[i]=typeof value==='function' ? value(states[i]) : value }] }},
  'next/link': { __esModule:true, default:({children,...props})=>React.createElement('a',props,children) },
  '@/lib/chinese': {chineseText:value=>value},
  '@/lib/ehr/patientIntakeForm':schema,
}).default
function render() { cursor=0; refCursor=0; return Form({}) }
function text() { return renderToStaticMarkup(render()) }
const event={preventDefault(){}}
async function main() {
  assert.ok(text().includes('病人基本資料'))
  assert.ok(!text().includes('聯絡人姓名'))
  await render().props.onSubmit(event)
  assert.equal(states[0],0)
  assert.ok(text().includes('此欄位為必填。'))
  states[1]={...answers}
  for(let i=0;i<8;i++) { await render().props.onSubmit(event); assert.equal(states[0],i+1) }
  assert.ok(text().includes('儲存病人資料'))
  // Back retains answers.
  const tree=render(); tree.props.children.at(-1).props.children[0].props.onClick()
  assert.equal(states[0],7); assert.equal(states[1].firstName,answers.firstName)
  await render().props.onSubmit(event)
  const calls=[]
  const original=global.fetch
  global.fetch=async (url, options) => { calls.push(JSON.parse(options.body)); return {ok:false,status:503,json:async()=>({error:'Synthetic retry'})} }
  await render().props.onSubmit(event)
  assert.equal(calls.length,1); assert.equal(states[1].firstName,answers.firstName)
  assert.equal(calls[0].intake.medications,answers.medications)
  global.fetch=async()=>({ok:true,json:async()=>({patient:{id:'synthetic',patientId:'SYN-001'}})})
  await render().props.onSubmit(event)
  assert.ok(text().includes('九個部分的資料皆已儲存'))
  global.fetch=original
  console.log('PASS: all nine validation steps, invalid dates/contact details, conditional insurance, consent, navigation, retained answers, save payload, retry, and success state.')
}
main().catch(error=>{console.error(error);process.exitCode=1})

async function testApi() {
  let createdData, transactions=0
  const patient={id:'synthetic-record',patientId:'SYN-002'}
  const route=load('src/app/api/ehr/patients/route.ts', {
    '@/lib/ehr/patientIntakeForm':schema,
    '@/lib/ehrAuthorization':{authorizeEhrRequest:async()=>({role:'clinic_staff',userId:'synthetic-user'})},
    '@/lib/prisma':{prisma:{patient:{findFirst:async()=>patient}}},
    '@/lib/auditLog':{writeAuditLog:async()=>{}},
    '@/lib/softwareCommands':{CommandError:class extends Error{},runSoftwareCommand:async(scope,key,data,callback)=>{
      transactions++
      return {duplicate:false,result:await callback({patient:{create:async input=>{createdData=input.data;return patient}}})}
    }},
  })
  const profile=Object.fromEntries(intakeSteps.slice(0,3).flatMap(step=>step.fields).map(field=>[field.name,answers[field.name]]))
  const request=body=>new Request('http://localhost/api/ehr/patients',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const invalid=await route.POST(request({...profile,intake:{...answers,privacyAcknowledged:''}}))
  assert.equal(invalid.status,400);assert.equal(transactions,0)
  const valid=await route.POST(request({...profile,requireCompleteProfile:true,intake:answers}))
  assert.equal(valid.status,201);assert.equal(transactions,1)
  const stored=JSON.parse(createdData.intakes.create.additionalInformation)
  assert.equal(stored.answers.medications,answers.medications)
  assert.equal(stored.answers.allergies,answers.allergies)
  assert.equal(stored.answers.privacyAcknowledged,'true')
  assert.equal(stored.answers.memberId,answers.memberId)
  assert.equal(createdData.profile.create.phone,undefined)
  assert.equal(createdData.phone,answers.phone)
  console.log('PASS: API rejects incomplete intake before writes and persists the complete intake and patient in one transaction.')
}
testApi().catch(error=>{console.error(error);process.exitCode=1})
