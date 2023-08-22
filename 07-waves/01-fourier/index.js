/**
 * Based on Fourier transforms
 *
 * Refs:
 * https://stackoverflow.com/questions/1073606/is-there-a-one-line-function-that-generates-a-triangle-wave#answer-1073634
 */

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const dpxr = window.devicePixelRatio

const width = 600 * dpxr
const height = 200 * dpxr
const center = height / 2
const limits = { x: width, y: height - 40 } // Implement limit Y

const parameters = [
  // freq = x (20hz, 400hz, 1600hz, 20.000hz), amp = y (0, 120)
  { freq: 440, amp: 120, type: 'sine' },
  // { freq: 40, amp: 20, type: 'noise' },
  // { freq: 440, amp: 120, type: 'triangle' },
  // { freq: 440, amp: 120, type: 'sawtooth' },
  // { freq: 440, amp: 20, type: 'square' },
  // { freq: 300, amp: 50, type: 'sine' },
  // { freq: 150, amp: 10, type: 'sine' },
  // { freq: 70, amp: 10, type: 'sine' },
]
//
const zoom = 1 // from 1 to 100?
const scale = { x: width * zoom, y: 1 }

let currentX = 0
let wavecolor = '#fefefe'
let areacolor = 'rgba(255, 255, 255, 0.13)'
let data = []
let period = 0.143

canvas.width = width
canvas.height = height

// UI
const zoomControl = document.querySelector('.zoom-control')
const zoomSlider = zoomControl.querySelector('#zoom')
const zoomOutput = zoomControl.querySelector('span.output')
zoomSlider.addEventListener('input', (event) => {
  const value = Number(event.target.value)
  zoomOutput.innerHTML = value
  scale.x = width * value
  update()
})

function createControls() {
  const wrapper = document.querySelector('.controls-wrapper')
  parameters.forEach((param, i) => {
    const control = document.createElement('div')
    const label = document.createElement('p')
    const out = document.createElement('span')
    const slider = document.createElement('input')

    out.setAttribute('class', 'output')
    label.setAttribute('class', 'label flex mb-8')
    slider.setAttribute('type', 'range')
    slider.setAttribute('name', `control-${i}`)
    slider.setAttribute('id', `control-${i}`)
    // slider.setAttribute('min', )
    // slider.setAttribute('', '')

    wrapper.appendChild(control)
  })
}

update()
createControls()

// calculate waves
function update() {
  ctx.clearRect(0, 0, width, height)
  data = []

  for (let currentX = 0; currentX < width; currentX++) {
    let currentY = 0

    for (let pid = 0; pid < parameters.length; pid++) {
      const p = parameters[pid]
      const freq = p.freq * period
      // ✅ Sine wave
      const v = Math.sin((freq * currentX) / scale.x)
      let value = v

      // ✅ Triangle wave
      if (p.type == 'triangle') {
        const rel = scale.x / (freq * period)
        const t = currentX % rel

        if (t < rel / 2) {
          value = t / (rel / 2)
        } else {
          value = (rel - t) / (rel / 2)
        }

        value = 2 * value - 1
      }

      // ✅ Sawtooth wave
      if (p.type == 'sawtooth') {
        const t = currentX / (scale.x / (freq * period))
        const w = t - Math.floor(t)

        // Note thach switching 2 for -2 the waveform direction changes
        value = 2 * (w - 0.5)
      }

      // ✅ Square wave
      if (p.type == 'square') {
        value = value >= 0 ? 1 : -1
      }

      // ✅ Noise wave
      if (p.type == 'noise') {
        value = Math.random() - 0.5
      }

      currentY += value * p.amp * scale.y
    }

    data.push(currentY)
  }

  drawWave(ctx, data)
}

// Draw waves
function drawWave(ctx, data) {
  ctx.beginPath()
  ctx.moveTo(0, center)
  let lastY = 0

  for (let currentX = 0; currentX < limits.x; currentX++) {
    let currentY = data[currentX]
    ctx.lineTo(currentX, currentY + center)
    lastY = currentY
  }

  ctx.lineTo(width, center)
  ctx.fillStyle = areacolor
  ctx.fill()
  ctx.strokeStyle = wavecolor
  ctx.lineWidth = 1 * dpxr
  ctx.stroke()
}

// ✅ Squarepusher wave
// if (p.type == 'squarepusher') {
//   value = currentY - Math.floor(value + 1 / 2)
// }
// ✅ Sawquare wave
// if (p.type == 'sawquare') {
//   value = value - Math.floor(value + 1 / 2)
// }

/**
 * Let's try to play the waveforms sounds
 */
