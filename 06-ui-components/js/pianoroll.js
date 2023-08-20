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
  // Values
  bpm = 120
  rows = 7 // octaves
  subrows = 12 // notes
  // Need another property to handle how many bars need to draw
  columns = 4 // 1 bars (compás)
  subcolumns = 4 // beats

  constructor({
    wrapper,
    bpm = 120,
    signature = {},
    instruments = [],
    onChange = undefined,
  }) {
    this.container = document.querySelector(wrapper)
    this.bbox = this.container.getBoundingClientRect()
    this.bpm = bpm
    this.rows = instruments.length ??= this.rows
    this.subrows = instruments.length ? 0 : this.subrows
    this.columns = signature.numerator ??= this.columns
    this.subcolumns = signature.denominator ??= this.subcolumns

    window.addEventListener('resize', () => this.setupGrid(), false)
    this.setupGrid()
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
    }

    // Columns
    for (let c = 0; c < columns; c++) {
      const rect = document.createElementNS(NS, 'rect')
      const cls =
        c % this.subcolumns === 0
          ? 'pianoroll-bar-grid-line'
          : 'pianoroll-vertical-grid-line'
      rect.setAttribute('class', cls)
      rect.setAttribute('data-id', c)
      rect.setAttribute('width', 1)
      rect.setAttribute('height', height)
      rect.setAttribute('x', x * c)
      rect.setAttribute('y', 0)
      this.grid.appendChild(rect)
    }
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
