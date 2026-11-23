const fs = require('node:fs')
const ts = require('typescript')
const { z } = require('zod')
const source = fs.readFileSync('src/lib/integrations/contracts.ts', 'utf8')
const target = { exports: {} }
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
new Function('require', 'module', 'exports', code)(require, target, target.exports)
const { adapterSchemas, smsRequestSchema, smsAcceptanceSchema, mailRequestSchema, audioMetadataSchema, voiceRequestSchema, learningGrantRequestSchema, storageUploadRequestSchema, stripeEventSchema, clerkEventSchema } = target.exports
const schemas = { ...adapterSchemas, smsRequest: smsRequestSchema, smsAcceptance: smsAcceptanceSchema, smtpMessage: mailRequestSchema, audioMetadata: audioMetadataSchema, voiceRequest: voiceRequestSchema, learningGrantRequest: learningGrantRequestSchema, storageUploadRequest: storageUploadRequestSchema, stripeConsumedProjection: stripeEventSchema, clerkConsumedProjection: clerkEventSchema }
const result = { version: 1, scope: 'Application-proposed v1 adapters and consumed native-event projections. Native Stripe/Clerk endpoints retain SDK signature verification and accept their complete provider payloads.', schemas: Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [name, z.toJSONSchema(schema)])) }
const json = JSON.stringify(result, null, 2) + '\n'
const file = 'docs/integration-contracts.v1.json'
if (process.argv.includes('--check')) {
  if (fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== json) throw new Error('Published contract schemas are stale. Run node scripts/export-integration-contracts.cjs.')
  console.log('PASS: documented integration schemas match runtime validators.')
} else { fs.writeFileSync(file, json); console.log('Exported application contract schemas; no credentials or environment files read.') }
