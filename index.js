'use strict'

// UTILS

const getHash = () => Number(window.location.hash.slice(1)) || 0
const setHash = page => {
  window.location.hash = `#${page}`
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
  }

  setState(state) {
    const newState = Object.assign({}, this.state, state)
    if (this.shouldRerender(this.state, newState)) {
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
  constructor(props) {
    super(props)
    this.state = { page: getHash() }
    this.initEventListeners()
  }

  initEventListeners() {
    const onHashchange = () => {
      this.setState({ page: getHash() })
    }

    const onKeydown = event => {
      const { page } = this.state
      switch (event.keyCode) {
        case 37: // left
          return this.setState({ page: page - 1 })
        case 39: // right
          return this.setState({ page: page + 1 })
      }
    }

    const onTouchstart = event => {
      this.setState({ touchstartX: event.touches[0].clientX })
    }

    const onTouchmove = event => {
      this.setState({ touchmoveX: event.touches[0].clientX })
    }

    const onTouchend = event => {
      const { touchstartX, touchmoveX, page } = this.state

      if (!touchstartX || !touchmoveX) return

      const diff = touchstartX - touchmoveX
      const threshold = 0.1 * document.documentElement.clientWidth

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // swipe left, go right
          this.setState({ page: page + 1 })
        } else {
          // swipe right, go left
          this.setState({ page: page - 1 })
        }
      }

      this.setState({ touchstartX: null, touchmoveX: null })
    }

    window.addEventListener('hashchange', onHashchange, false)
    document.addEventListener('keydown', onKeydown, false)
    document.addEventListener('touchstart', onTouchstart, false)
    document.addEventListener('touchmove', onTouchmove, false)
    document.addEventListener('touchend', onTouchend, false)

    window.addEventListener('unload', () => {
      window.removeEventListener('hashchange', onHashchange)
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('touchstart', onTouchstart)
      document.removeEventListener('touchmove', onTouchmove)
      document.removeEventListener('touchend', onTouchend)
    })
  }

  shouldRerender(oldState, newState) {
    return oldState.page !== newState.page
  }

  render() {
    const { error, slides } = this.props
    const { page } = this.state

    if (error) {
      return ErrMsg(error.message)
    }

    setHash(page)

    const slide = slides[page]

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
