const fs = require('fs')
const path = require('path')

process.chdir('slides')

const basename = f => path.basename(f, path.extname(f))

const files = fs
  .readdirSync('.')
  .sort((a, b) => Number(basename(a)) - Number(basename(b)))
  .map(f => fs.readFileSync(f))
  .map(b => b.toString())

process.chdir('..')

fs.writeFileSync('slides.json', JSON.stringify(files))
