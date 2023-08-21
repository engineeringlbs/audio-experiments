const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const dpxr = window.devicePixelRatio

const width = 600 * dpxr
const height = 200 * dpxr
const center = height / 2
const limits = { x: width, y: height - 40 } // Implement limit Y

const parameters = [
  // { freq: 440, amp: 140, type: 'sine' },
  // { freq: 3, amp: 25, type: 'sine' },
  // { freq: 9, amp: 5, type: 'sine' },
  // { freq: 27, amp: 1, type: 'sine' },
  // { freq: 81, amp: 1, type: 'noise' },
  // { freq: 440, amp: 140, type: 'square' },
  // { freq: 3, amp: 25, type: 'square' },
  // { freq: 9, amp: 5, type: 'square' },
  // { freq: 27, amp: 1, type: 'square' },
  // { freq: 81, amp: 2, type: 'noise' },
  // { freq: 440, amp: 140, type: 'sawtooth' },
  // { freq: 3, amp: 25, type: 'sawtooth' },
  // { freq: 9, amp: 5, type: 'sawtooth' },
  // { freq: 27, amp: 1, type: 'sawtooth' },
  { freq: 440, amp: 140, type: 'triangle' },
  // { freq: 81, amp: 180, type: 'noise' },
]
//
const zoom = 1 // from 1 to 100?
const scale = { x: width * zoom, y: 1 }

let currentX = 0
let lastpos = { x: 0, y: center }
let wavecolor = '#fefefe'
let areacolor = 'rgba(255, 255, 255, 0.13)'
let data = []

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
    // const min = param
    console.log(param)

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
  // caculate wave
  data = []

  for (let currentX = 0; currentX < width; currentX++) {
    let currentY = 0

    for (let pid = 0; pid < parameters.length; pid++) {
      const p = parameters[pid]
      const freq = p.freq / 20
      // https://stackoverflow.com/questions/1073606/is-there-a-one-line-function-that-generates-a-triangle-wave#answer-1073634
      // sine wave
      const v = Math.sin((freq * currentX) / scale.x)
      let value = v

      // squarepusher wave
      if (p.type == 'squarepusher') {
        value = currentY - Math.floor(v + 1 / 2)
      }
      // sawquare wave
      if (p.type == 'sawquare') {
        value = v - Math.floor(v + 1 / 2)
      }
      // sawtooth wave
      if (p.type == 'sawtooth') {
        // value = 1 - 2 * ((scale.x / currentX) % 1) // mola
        value = 1 - 2 * ((currentX / scale.x) % 1)
      }
      // trangle wave
      if (p.type == 'triangle') {
        value = freq - ((currentX / scale.x) % freq) - freq
      }
      // square wave
      if (p.type == 'square') {
        value = v >= 0 ? 1 : -1
      }
      // noise wave
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
