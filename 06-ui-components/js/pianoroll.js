/**
 * Pianoroll 🎹
 */
export default class Pianoroll {
  wrapper = undefined
  bbox = undefined
  canvas = undefined
  context = undefined

  constructor(name) {
    this.wrapper = document.querySelector(name)
    this.bbox = this.wrapper.getBoundingClientRect()

    this.setupCanvas()
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvas.width = this.bbox.width * RATIO
    this.canvas.height = this.bbox.height * RATIO
    this.canvas.stype.width = this.bbox.width + 'px'
    this.canvas.stype.height = this.bbox.height + 'px'

    this.wrapper.appendChild(this.canvas)
  }

  drawGrid() {
    // Horizontal sections
    for (let o = 0; o < SETTINGS.octaves; o++) {}
  }
}

const pianoroll = new Pianoroll('.pianoroll')
