const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Operator CLI: runs the same read-only checks as the authorized status page.
// The container supplies configuration. Never print raw errors or service bodies.
const root = path.resolve(__dirname, '..')
const source = fs.readFileSync(path.join(root, 'src/lib/systemConnections.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText
const target = { exports: {} }
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ log: [] })
new Function('require', 'module', 'exports', compiled)(name => {
  if (name === 'server-only') return {}
  if (name === '@/lib/prisma') return { prisma }
  return require(name)
}, target, target.exports)
target.exports.getSystemConnections().then(report => console.log(JSON.stringify(report, null, 2))).catch(() => {
  console.error('System check failed. Diagnostic details were not published.')
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
