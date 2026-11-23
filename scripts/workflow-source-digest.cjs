const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
module.exports = function sourceDigest(root) {
  const files = []
  function walk(directory, pattern) {
    if (!fs.existsSync(path.join(root, directory))) return
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue
      const file = directory + '/' + entry.name
      if (entry.isDirectory()) walk(file, pattern)
      else if (pattern.test(file)) files.push(file)
    }
  }
  walk('src', /\.tsx?$/)
  walk('scripts', /\.cjs$/)
  files.push('prisma/schema.prisma', 'prisma/schema.production.prisma', 'package-lock.json')
  const hash = createHash('sha256')
  for (const file of files.sort()) if (fs.existsSync(path.join(root, file))) hash.update(file + '\0').update(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')).update('\0')
  return hash.digest('hex')
}
