const createParagraph = (className, text) => {
  const p = document.createElement('p')
  p.classList.add(className)
  p.innerHTML = text
    .replace(/ /g, '&nbsp;') // whitespace => &nbsp;
    .replace(/\\w/g, ' ') // \w => whitespace
  return p
}

const renderDiff = text => {
  const body = document.body
  const fragment = document.createDocumentFragment()

  text.split('\n')
  .map(line => {
    switch (line.charAt(0)) {
      case '>': return createParagraph('file', line)
      case '$': return createParagraph('shell', line)
      case '|': return createParagraph('code', ' ' + line.slice(1))
      case '#': return createParagraph('comment', ' ' + line.slice(1))
      case '+': return createParagraph('add', line)
      case '-': return createParagraph('rm', line)
      default: return void 0
    }
  })
  .filter(Boolean)
  .forEach(node => fragment.appendChild(node))

  while (body.firstChild) {
    body.removeChild(body.firstChild)
  }

  body.appendChild(fragment)

  return Promise.resolve()
}

const fetchDiff = number =>
  fetch(`slides/${number}.diff`)
  .then(res => res.text())
  .then(renderDiff)
  .then(() => { window.location.hash = `#${number}` })

let number = Number(window.location.hash.slice(1)) || 0

document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 37: return fetchDiff(--number)
    case 39: return fetchDiff(++number)
  }
})

fetchDiff(number)