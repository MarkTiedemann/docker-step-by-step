const fs = require('fs')

process.chdir('slides')

const files = fs
  .readdirSync('.')
  .map(f => fs.readFileSync(f))
  .map(b => b.toString())

process.chdir('..')

fs.writeFileSync('slides.json', JSON.stringify(files))
