'use strict'

// UTILS

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const getHash = () => Number(window.location.hash.slice(1)) || 0
const setHash = number => {
  window.location.hash = `#${number}`
}

// COMPONENTS

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

function ErrMsg(msg) {
  const span = document.createElement('span')
  span.classList.add('error')
  span.textContent = msg
  return span
}

class Component {
  constructor(props) {
    this.props = props
    this.setState({ number: getHash() })
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
    const onHashchange = () => {
      this.setState({ number: getHash() })
    }

    const onKeydown = event => {
      const { number } = this.state
      switch (event.keyCode) {
        case 37: // left
          return this.setState({ number: number - 1 })
        case 39: // right
          return this.setState({ number: number + 1 })
      }
    }

    window.addEventListener('hashchange', onHashchange, false)
    document.addEventListener('keydown', onKeydown, false)

    window.addEventListener('unload', () => {
      window.removeEventListener('hashchange', onHashchange)
      document.removeEventListener('keydown', onKeydown)
    })
  }

  render() {
    const { error, slides } = this.props
    const { number } = this.state

    if (error) {
      return ErrMsg(error.message)
    }

    setHash(number)

    const slide = slides[number]

    if (!slide) {
      return ErrMsg('404 - Not Found')
    }

    return Slide(slide)
  }
}

// MAIN

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')

  const ensureOk = res =>
    !res.ok
      ? Promise.reject(new Error(`${res.status} - ${res.statusText}`))
      : Promise.resolve(res)

  const onSlides = slides => new Presentation({ slides, root })
  const onError = error => new Presentation({ error, root })

  fetch('slides.json')
    .then(ensureOk)
    .then(res => res.json())
    .then(onSlides)
    .catch(onError)
})
