/**
 * Pianoroll 🎹
 *
 * https://learningmusic.ableton.com/es/make-beats/bars.html
 */
const NS = 'http://www.w3.org/2000/svg'

export default class Pianoroll {
  // DOM
  container = undefined
  editor = undefined
  grid = undefined
  highlights = undefined
  mouseObserver = undefined
  // Utils
  bbox = undefined
  // Values
  bpm = 120
  bars = 1
  beats = 4
  steps = 4
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
   * core = {
   *    width: container.width,
   *    height: container.height,
   *    bars: numerator,
   *    beats: denominator,
   *    beatWidth: width / beats,
   *    steps: beats * steps,
   *    stepWidth: width / steps,
   *    stepHeight: 60,
   *    columns: beats * steps,
   *    grid: {
   *          --- beat ---  --- beat ---  --- beat ---  --- beat ---
   *          4 x step      4 x step      4 x step      4 x step
   *      0: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // bar
   *      1: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // bar
   *      2: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // bar
   *      3: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // bar
   *    },
   *    ponts: {
   *      rows: [0, 52.9375, 105,875, ...],
   *      columns: [0, 240, 480, ...],
   *    },
   *    notes: [{ id: 'note-0-0-0', x: 0, ... }, ...]
   * }
   */
  core = {
    width: undefined,
    height: undefined,
    bars: undefined,
    beats: undefined,
    beatWidth: undefined,
    steps: undefined,
    stepWidth: undefined,
    stepHeight: undefined,
    columns: undefined,
    grid: {},
    points: {
      rows: [],
      columns: [],
    },
    notes: [],
  }

  constructor({
    wrapper,
    bpm = 120,
    signature = {},
    bars = [],
    onChange = undefined,
  }) {
    this.container = document.querySelector(wrapper)
    this.mouseObserver = document.createElement('div')
    this.bbox = this.container.getBoundingClientRect()
    this.bpm = bpm
    this.bars = bars.length || this.bars
    this.beats = signature.numerator || this.beats
    this.steps = signature.denominator || this.steps

    window.addEventListener('resize', () => this.setupGrid(), false)

    this.setup()
    this.setupEvents()
  }

  setup() {
    this.setupLayout()
    this.setupGrid()
    this.setupHighlights()

    console.log(this.core.grid)
  }

  setupLayout() {
    const { width, height } = this.bbox
    const total = this.beats * this.steps
    const grid = {}

    for (let r = 0; r < this.bars; r++) {
      const bars = Array.from({ length: this.beats }, () => {
        return Array.from({ length: this.steps }, () => 0)
      })

      grid[r] = bars
    }

    this.core = {
      width,
      height,
      bars: this.bars,
      beats: this.beats,
      beatWidth: width / this.beats,
      steps: this.steps,
      stepWidth: width / total,
      stepHeight: height / this.bars,
      columns: total,
      grid: grid,
      points: {
        rows: [],
        columns: [],
      },
      notes: this.core.notes,
    }
    console.log(this.core)
  }

  setupGrid() {
    // Keep it clean
    this.editor && this.container.removeChild(this.editor)

    const {
      width,
      height,
      bars,
      steps,
      columns,
      stepWidth,
      stepHeight,
      points,
    } = this.core

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
    for (let r = 0; r < bars; r++) {
      const rect = document.createElementNS(NS, 'rect')
      const position = Math.round(stepHeight * r)

      rect.setAttribute('class', 'pr-horizontal-grid-line')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', width)
      rect.setAttribute('height', 1)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', position)
      this.grid.appendChild(rect)

      points.rows.push(position)
    }

    // Columns
    for (let c = 0; c < columns; c++) {
      const rect = document.createElementNS(NS, 'rect')
      const cls = `pr-vertical-grid-line ${c % steps === 0 ? ' bar' : ''}`
      const position = Math.round(stepWidth * c)

      rect.setAttribute('class', cls)
      rect.setAttribute('data-id', c)
      rect.setAttribute('width', 1)
      rect.setAttribute('height', height)
      rect.setAttribute('x', position)
      rect.setAttribute('y', 0)
      this.grid.appendChild(rect)

      points.columns.push(position)
    }
  }

  setupHighlights() {
    const { width, bars, stepHeight, notes } = this.core

    for (let r = 0; r < bars; r++) {
      const rect = document.createElementNS(NS, 'svg')
      const position = Math.round(stepHeight * r)

      rect.setAttribute('class', 'pr-highlight-row')
      rect.setAttribute('data-id', r)
      rect.setAttribute('width', width)
      rect.setAttribute('height', stepHeight)
      rect.setAttribute('x', 0)
      rect.setAttribute('y', position)
      this.highlights.appendChild(rect)
    }

    // TODO: add default notes
    if (notes.length) {
      notes.forEach((n) => this.addHighlight(n))
    }
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
    const exist = this.core.notes.find((n) => n.id === highlight.id)

    // if (exist) {
    //   this.selectHighlight(exist)
    // } else {
    //   this.addHighlight(highlight)
    // }
  }

  addHighlight(highlight) {
    const { id, x, row, beat, note } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = document.createElementNS(NS, 'rect')
    const element = { ...highlight, id }

    rect.setAttribute('class', 'pr-highlight')
    rect.setAttribute('data-id', id)
    rect.setAttribute('width', this.core.stepWidth - 2)
    rect.setAttribute('height', this.core.stepHeight - 2)
    rect.setAttribute('x', x + 1)
    rect.setAttribute('y', 1)
    rect.setAttribute('rx', 3)
    container.appendChild(rect)

    this.core.grid[row][beat][note] = element
    this.core.notes.push(element)
  }

  selectHighlight(highlight) {
    const { id, row } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = container.querySelector(`.pr-highlight[data-id="${id}"]`)
    rect.classList.toggle('selected')
  }

  /**
   * @todo implement correctly
   */
  removeHighlight(highlight) {
    console.log('Remove')
    const { id, row, beat, note } = highlight
    const container = this.highlights.querySelector(`svg[data-id="${row}"]`)
    const rect = container.querySelector(`.pr-highlight[data-id="${id}"]`)
    rect.classList.toggle('selected')

    container.removeChild(rect)

    this.core.grid[row][beat][note] = 0
    this.core.notes = this.core.notes.filter((n) => n.id !== id)
  }

  /**
   * Utils
   */
  getHighlightRectFromMouse(position) {
    const { mx, my } = position
    const { beatWidth, stepWidth, stepHeight } = this.core
    const bar = Math.floor(my / stepHeight)
    const beat = Math.floor(mx / beatWidth)
    const step = Math.floor((mx - (beatWidth * beat)) / stepWidth)
    const id = `step-${bar}-${beat}-${step}`

    return { id, bar, beat, step }
  }

  /**
   * Public API
   */
  setBpm(bpm) {
    this.bpm = bpm

    this.setup()
  }

  setTimeSignature(signature) {
    this.beats = signature.numerator ??= this.beats
    this.steps = signature.denominator ??= this.steps

    this.setup()
  }
}
