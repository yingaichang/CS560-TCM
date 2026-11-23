const fs = require('node:fs')
const path = require('node:path')

function writeReport(root, report) {
  const destination = path.join(root, 'src/data/kioskConnectionVerification.json')
  const temporary = destination + '.' + process.pid + '.tmp'
  try {
    fs.writeFileSync(temporary, JSON.stringify(report, null, 2) + '\n')
    fs.renameSync(temporary, destination)
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary)
  }
}
module.exports = { writeReport }
