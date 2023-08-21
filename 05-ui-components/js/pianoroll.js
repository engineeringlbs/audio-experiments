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
  /**
   * An object to hold the grid information.
   * We need to create a row per instrument/note.
   * Inside the rows we need to create an Array for each bar, and inside we need an Array
   * for each beat.
   *
   * By other hand, we need to create a matrix to store the positions of the grid items to
   * easy access and calculate the mouse interactions.
   *
   * To find notes quickly we can create an array and store the ids.
   *
   * @example to 4 intruments (k, s, oh, ch) and siignature 4 / 4
   *
   * layout = {
   *    width: 847,
   *    height: 240,
   *    bar: 4,
   *    beats: 4,
   *    columnWidth: 52.9375, // 847px width
   *    columns: 16,
   *    rowHeight: 60, // 240px height
   *    rows: 4,
   *    grid: {
   *      0: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
   *      1: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
   *      2: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
   *      3: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
   *    },
   *    ponts: {
   *      rows: [0, 52.9375, 105,875, ...],
   *      columns: [0, 240, 480, ...],
   *    },
   *    notes: []
   * }
   */
  layout = []

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

    this.setup()
  }

  setup() {
    this.setupLayout()
    this.setupGrid()
    this.setupHighlights()
    this.setupEvents()
  }

  setupLayout() {
    const { width, height } = this.bbox
    const total = this.columns * this.subcolumns
    const grid = {}

    for (let r = 0; r < this.rows; r++) {
      const bars = Array.from({ length: this.columns }, (i) => {
        return Array.from({ length: this.subcolumns }, () => 0)
      })

      grid[r] = bars
    }

    this.layout = {
      width,
      height,
      bar: this.columns,
      beats: this.subcolumns,
      noteWidth: Math.round(width / total),
      columns: total,
      noteHeight: Math.round(height / this.rows),
      rows: this.rows,
      grid,
      points: {
        rows: [],
        columns: [],
      },
      notes: [],
    }
  }

  setupGrid() {
    // Keep it clean
    this.editor && this.container.removeChild(this.editor)

    const { width, height, columns, noteWidth, noteHeight } = this.layout

    this.editor = document.createElementNS(NS, 'svg')
    this.editor.setAttribute('class', 'pr-editor')
    this.editor.setAttribute('width', width)
    this.editor.setAttribute('height', height)
    this.container.appendChild(this.editor)

    this.grid = document.createElementNS(NS, 'svg')
    this.grid.setAttribute('class', 'pr-grid')
    this.grid.setAttribute('width', width)
    this.grid.setAttribute('height', height)
    this.editor.appendChild(this.grid)

    this.highlights = document.createElementNS(NS, 'svg')
    this.highlights.setAttribute('class', 'pr-highlight')
    this.highlights.setAttribute('width', width)
    this.highlights.setAttribute('height', height)
    this.editor.appendChild(this.highlights)

    // Rows
    for (let r = 0; r < this.rows; r++) {
      const rect = document.createElementNS(NS, 'rect')
      const position = Math.round(noteHeight * r)

      rect.setAttribute('class', 'pr-horizontal-grid-line')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', width)
      rect.setAttribute('height', 1)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', position)
      this.grid.appendChild(rect)

      this.layout.points.rows.push(position)
    }

    // Columns
    for (let c = 0; c < columns; c++) {
      const rect = document.createElementNS(NS, 'rect')
      const cls = `pr-vertical-grid-line ${c % this.subcolumns === 0 && ' bar'}`
      const position = Math.round(noteWidth * c)

      rect.setAttribute('class', cls)
      rect.setAttribute('data-id', c)
      rect.setAttribute('width', 1)
      rect.setAttribute('height', height)
      rect.setAttribute('x', position)
      rect.setAttribute('y', 0)
      this.grid.appendChild(rect)

      this.layout.points.columns.push(position)
    }
  }

  setupHighlights() {
    const { width, noteHeight } = this.layout

    for (let r = 0; r < this.rows; r++) {
      const rect = document.createElementNS(NS, 'svg')
      const position = Math.round(noteHeight * r)

      rect.setAttribute('class', 'pr-highlight-row')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', width)
      rect.setAttribute('height', noteHeight)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', position)
      this.highlights.appendChild(rect)
    }

    // TODO: add default notes
    // if (this.notes.length) {
    //   this.notes.forEach((n) => this.addHighlight(n))
    // }
  }

  /**
   * 🧠
   *
   * Pensar sobre tener una variable `currentRow` para controlar las posiciones.
   * Nos puede ser muy util para lanzar sonidos cuando hagamos `mousedown` y `mousemove`
   * por la cuadrícula. También para poder mover los `highlights` por la cuadrícula.
   */
  setupEvents() {
    this.mouseObserver.setAttribute('class', 'pr-mouse-observer')
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
    const exist = this.layout.notes.find((n) => n.id === highlight.id)
    console.log(highlight)
    if (exist) {
      this.removeHighlight(exist)
    } else {
      this.addHighlight(highlight)
    }
  }

  addHighlight(highlight) {
    const { id, x, row, beat, note } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = document.createElementNS(NS, 'rect')

    rect.setAttribute('class', 'pr-highlight')
    rect.setAttribute('data-id', id)
    rect.setAttribute('width', this.layout.noteWidth - 2)
    rect.setAttribute('height', this.layout.noteHeight - 2)
    rect.setAttribute('x', x + 1)
    rect.setAttribute('y', 1)
    rect.setAttribute('rx', 3)
    container.appendChild(rect)

    const element = { ...highlight, id }
    this.layout.grid[row][beat][note] = element
    this.layout.notes.push(element)
  }

  removeHighlight(highlight) {
    const { id, row, beat, note } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = container.querySelector(`.pr-highlight[data-id="${id}"]`)

    container.removeChild(rect)

    this.layout.grid[row][beat][note] = 0
    this.layout.notes = this.layout.notes.filter((n) => n.id !== id)
  }

  /**
   * Utils
   */
  getHighlightRectFromMouse(position) {
    const { mx, my } = position
    const { bar, beats, noteWidth, points, noteHeight } = this.layout
    const x = points.columns.reduce((p, c) => (mx > p && mx > c ? c : p))
    const y = points.rows.reduce((p, c) => (my > p && my > c ? c : p))
    const row = y / noteHeight
    const beat = Math.floor(x / (noteWidth * bar))
    const note = (x / noteWidth) % beats
    const id = `note-${row}-${beat}-${note}`

    return { id, x, row, beat, note }
  }

  /**
   * Public API
   */
  setBpm(bpm) {
    this.bpm = bpm

    this.setup()
  }

  setTimeSignature(signature) {
    this.columns = signature.numerator ??= this.columns
    this.subcolumns = signature.denominator ??= this.subcolumns

    this.setup()
  }
}
