/**
 * Pianoroll 🎹
 *
 * https://learningmusic.ableton.com/es/make-beats/bars.html
 */
const NS = 'http://www.w3.org/2000/svg'

export default class Pianoroll {
  container = undefined
  bbox = undefined
  editor = undefined
  grid = undefined
  highlights = undefined
  mouseObserver = undefined
  // Values
  bpm = 120
  rows = 7 // octaves
  subrows = 12 // notes
  // Need another property to handle how many bars need to draw
  columns = 4 // 1 bars (compás)
  subcolumns = 4 // beats
  points = { h: [], v: [] }
  // Notes
  selected = []

  constructor({
    wrapper,
    bpm = 120,
    signature = {},
    instruments = [],
    onChange = undefined,
  }) {
    this.container = document.querySelector(wrapper)
    this.mouseObserver = document.createElement('div')
    this.bbox = this.container.getBoundingClientRect()
    this.bpm = bpm
    this.rows = instruments.length ??= this.rows
    this.subrows = instruments.length ? 0 : this.subrows
    this.columns = signature.numerator ??= this.columns
    this.subcolumns = signature.denominator ??= this.subcolumns

    window.addEventListener('resize', () => this.setupGrid(), false)

    this.setupGrid()
    this.setupHighlights()
    this.setupEvents()
  }

  setupGrid() {
    // Keep it clean
    this.editor && this.container.removeChild(this.editor)

    const { width, height } = this.bbox
    const columns = this.columns * this.subcolumns
    const y = height / this.rows
    const x = width / columns

    this.editor = document.createElementNS(NS, 'svg')
    this.editor.setAttribute('class', 'pianoroll-editor')
    this.editor.setAttribute('width', width)
    this.editor.setAttribute('height', height)
    this.container.appendChild(this.editor)

    this.grid = document.createElementNS(NS, 'svg')
    this.grid.setAttribute('class', 'pianoroll-grid')
    this.grid.setAttribute('width', width)
    this.grid.setAttribute('height', height)
    this.editor.appendChild(this.grid)

    this.highlights = document.createElementNS(NS, 'svg')
    this.highlights.setAttribute('class', 'pianoroll-highlight')
    this.highlights.setAttribute('width', width)
    this.highlights.setAttribute('height', height)
    this.editor.appendChild(this.highlights)

    // Rows
    for (let r = 0; r < this.rows; r++) {
      const rect = document.createElementNS(NS, 'rect')
      rect.setAttribute('class', 'pianoroll-horizontal-grid-line')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', width)
      rect.setAttribute('height', 1)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', y * r)
      this.grid.appendChild(rect)

      this.points.v.push(y * r)
    }

    // Columns
    for (let c = 0; c < columns; c++) {
      const rect = document.createElementNS(NS, 'rect')
      const cls = `pianoroll-vertical-grid-line ${
        c % this.subcolumns === 0 && ' bar'
      }`
      rect.setAttribute('class', cls)
      rect.setAttribute('data-id', c)
      rect.setAttribute('width', 1)
      rect.setAttribute('height', height)
      rect.setAttribute('x', x * c)
      rect.setAttribute('y', 0)
      this.grid.appendChild(rect)

      this.points.h.push(x * c)
    }
  }

  setupHighlights() {
    const h = this.bbox.height / this.rows
    for (let r = 0; r < this.rows; r++) {
      const rect = document.createElementNS(NS, 'svg')
      rect.setAttribute('class', 'pianoroll-highlight-row')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', this.bbox.width)
      rect.setAttribute('height', h)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', h * r)
      this.highlights.appendChild(rect)
    }
  }

  setupEvents() {
    this.mouseObserver.setAttribute('class', 'pianoroll-mouse-observer')
    this.container.appendChild(this.mouseObserver)
    this.mouseObserver?.addEventListener(
      'click',
      this.onGridClick.bind(this),
      false
    )
  }

  onGridClick(event) {
    const { layerX, layerY } = event
    const highlight = this.getHighlightRectFromMouse({ mx: layerX, my: layerY })

    this.addHighlight(highlight)
  }

  addHighlight(highlight) {
    const { x, width, height, row } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = document.createElementNS(NS, 'rect')
    rect.setAttribute('class', 'pianoroll-highlight')
    rect.setAttribute('width', width - 2)
    rect.setAttribute('height', height - 2)
    rect.setAttribute('x', x + 1)
    rect.setAttribute('y', 1)
    container.appendChild(rect)
  }

  /**
   * Utils
   */
  getHighlightRectFromMouse(position) {
    const { width, height } = this.bbox
    const { mx, my } = position
    const columns = this.columns * this.subcolumns
    const h = height / this.rows
    const w = width / columns
    const x = this.points.h.reduce((p, c) => (mx > p && mx > c ? c : p))
    const y = this.points.v.reduce((p, c) => (my > p && my > c ? c : p))
    const index = this.points.v.indexOf(y)
    return { x: x, width: w, height: h, row: index }
  }

  /**
   * Public API
   */
  setBpm(bpm) {
    this.bpm = bpm

    this.setupGrid()
  }

  setTimeSignature(signature) {
    this.columns = signature.numerator ??= this.columns
    this.subcolumns = signature.denominator ??= this.subcolumns

    this.setupGrid()
  }
}
