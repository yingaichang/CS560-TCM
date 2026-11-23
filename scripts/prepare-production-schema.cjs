const fs = require('node:fs')
const path = require('node:path')

// Keep the SQLite development schema while generating a PostgreSQL client in Docker.
const sourcePath = path.resolve(__dirname, '../prisma/schema.prisma')
const targetPath = path.resolve(__dirname, '../prisma/schema.production.prisma')
const source = fs.readFileSync(sourcePath, 'utf8')
const production = source.replace(/(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*)"sqlite"/, '$1"postgresql"')
if (!/datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"postgresql"/.test(production)) {
  throw new Error('Expected a SQLite or PostgreSQL datasource in the Prisma schema')
}
fs.writeFileSync(targetPath, production)
console.log('Prepared PostgreSQL production schema')
