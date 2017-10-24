const fs = require('fs')
const path = require('path')

process.chdir('slides')

const basename = f => path.basename(f, path.extname(f))

fs
  .readdirSync('.')
  .sort((a, b) => Number(basename(a)) - Number(basename(b)))
  .map(f => {
    const b = fs.readFileSync(f)
    fs.unlinkSync(f)
    return b
  })
  .forEach((b, i) => fs.writeFileSync(`${i}.diff`, b))
