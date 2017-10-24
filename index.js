'use strict'

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const hash = () => window.location.hash.slice(1)

function Paragraph(className, text) {
  const para = document.createElement('p')
  para.classList.add(className)
  para.innerHTML = text
    .replace(/ /g, '&nbsp;') // whitespace => &nbsp;
    .replace(/\\w/g, ' ') // \w => whitespace
  return para
}

function Line(text) {
  switch (text.charAt(0)) {
    case '>':
      return Paragraph('file', text)
    case '$':
      return Paragraph('shell', text)
    case '|':
      return Paragraph('code', ` ${text.slice(1)}`)
    case '#':
      return Paragraph('comment', ` ${text.slice(1)}`)
    case '+':
      return Paragraph('add', text)
    case '-':
      return Paragraph('rm', text)
  }
}

function Slide(text) {
  const frag = document.createDocumentFragment()
  text
    .replace(/\n\r/g, '\n') // rm win32 carriage return
    .split('\n')
    .map(line => new Line(line))
    .filter(Boolean)
    .forEach(node => frag.appendChild(node))
  return frag
}

class Component {
  constructor(props, initialState) {
    this.props = props
    this.setState(initialState)
    this.init()
  }

  setState(newState) {
    if (!deepEqual(this.state, newState)) {
      this.state = newState
      this.unmount()
      const node = this.render()
      this.mount(node)
    }
  }

  mount(node) {
    const { root } = this.props
    root.appendChild(node)
  }

  unmount() {
    const { root } = this.props
    while (root.firstChild) {
      root.removeChild(root.firstChild)
    }
  }
}

class Presentation extends Component {
  init() {
    document.addEventListener('hashchange', this.onHashChange.bind(this))
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onHashChange() {
    this.setState({ number: Number(hash()) })
  }

  onKeyDown(event) {
    const { number } = this.state
    switch (event.keyCode) {
      case 37: // left
        return this.setState({ number: number - 1 })
      case 39: // right
        return this.setState({ number: number + 1 })
    }
  }

  render() {
    const { error, slides } = this.props
    const { number } = this.state

    if (error) {
      return document.createTextNode(error.message)
    }

    window.location.hash = `#${number}`

    return Slide(slides[number])
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')
  fetch('slides.json')
    .then(res => res.json())
    .then(slides => {
      const props = { slides, root }
      const initialState = { number: Number(hash()) }
      new Presentation(props, initialState)
    })
    .catch(error => new Presentation({ error, root }))
})
