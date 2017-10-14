const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Create backup directory
const bakDir = '.bak-' + crypto.randomBytes(5).toString('hex')
fs.mkdirSync(path.join(__dirname, bakDir))

// List all files
fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.diff'))
  // Read all files
  .map(f => ({
    path: f,
    absPath: path.join(__dirname, f),
    number: Number(f.substring(0, f.lastIndexOf('.'))),
    content: fs.readFileSync(path.join(__dirname, f))
  }))
  .sort((a, b) => a.number - b.number)
  // Backup old files in backup directory
  .map(f => {
    const bakFile = path.join(__dirname, bakDir, f.path)
    fs.writeFileSync(bakFile, f.content)
    return f
  })
  // Delete old files
  .map(f => {
    fs.unlinkSync(f.absPath)
    return f
  })
  // Write new files
  .forEach((f, i) => {
    const file = path.join(__dirname, `${i}.diff`)
    fs.writeFileSync(file, f.content)
  })