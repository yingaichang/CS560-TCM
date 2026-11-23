const fs = require('node:fs')
const path = require('node:path')

// Keep the SQLite development schema while generating a PostgreSQL client in Docker.
const sourcePath = path.resolve(__dirname, '../prisma/schema.prisma')
const targetPath = path.resolve(__dirname, '../prisma/schema.production.prisma')
const source = fs.readFileSync(sourcePath, 'utf8')
let production = source.replace(/(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*)"sqlite"/, '$1"postgresql"')
if (!/datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"postgresql"/.test(production)) {
  throw new Error('Expected a SQLite or PostgreSQL datasource in the Prisma schema')
}
// The existing production database still has these legacy authentication columns.
// Retain them so schema synchronization cannot delete historical account data.
production = production.replace(/model User \{([\s\S]*?)\n\}/, (model, fields) => {
  const retained = []
  if (!/^\s*password\s/m.test(fields)) retained.push('  password String?')
  if (!/^\s*googleId\s/m.test(fields)) retained.push('  googleId String? @unique')
  return model.replace(/\n\}$/, '\n' + retained.join('\n') + '\n}')
})
fs.writeFileSync(targetPath, production)
console.log('Prepared PostgreSQL production schema')
