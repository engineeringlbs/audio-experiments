/**
 * Basic setup
 *
 * DynamicCompressorNode --> GainNode --> AudioCOntextDestination
 */
const ZERO = 0.00001
const context = new AudioContext()
const output = context.destination
const destination = new GainNode(context)
const compressor = new DynamicsCompressorNode(context)

destination.connect(output)
// destination.connect(compressor).connect(output)

document.querySelector('#kick').addEventListener('click', playKick, false)

/**
 * The Kick sounds more complicated as we’d like but as you can see below
 * the implementation is pretty simple.
 *
 * OscillatorNode --> GainNode --> Destination
 *
 * Maybe we can improve the kick..
 *
 * OscillatorNode --> GainNode --> Destination \
 *                                              --> Destination
 * OscillatorNode --> GainNode --> Destination /
 */
function playKick() {
  const now = context.currentTime
  const osc = new OscillatorNode(context, {
    frequency: 150,
  })
  const gain = new GainNode(context)

  osc.connect(gain)
  gain.connect(destination)

  // Nothe that we use exponential ramping!
  osc.frequency.exponentialRampToValueAtTime(ZERO, now + 0.65)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.65)

  osc.start(now)
  osc.stop(now + 0.65)

  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }
}

/**
 * The Snare drum is pretty simple too.
 *
 *                             OscillatorNode --> GainNode  \
 *                                                           --> Destination
 * AudioBufferSourceNode --> BiquadFilterNode --> GainNode  /
 *                           highpass
 */
document.querySelector('#snare').addEventListener('click', playSnare, false)

function playSnare() {
  const now = context.currentTime
  const osc = new OscillatorNode(context)
  const gain = new GainNode(context)
  osc.type = 'triangle'

  const noise = new AudioBufferSourceNode(context)
  const noiseFilter = new BiquadFilterNode(context)
  const noiseGain = new GainNode(context)
  noise.buffer = noiseBuffer()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1000

  osc.connect(gain)
  gain.connect(destination)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(destination)

  noiseGain.gain.setValueAtTime(1, now)
  noiseGain.gain.exponentialRampToValueAtTime(ZERO, now + 0.2)

  osc.frequency.setValueAtTime(100, now)
  gain.gain.setValueAtTime(0.7, now)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.1)

  noise.start(now)
  osc.start(now)

  osc.stop(now + 0.2)
  noise.stop(now + 0.2)
}

// Make some nois with random values 😎
function noiseBuffer() {
  const bufferSize = context.sampleRate
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const output = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return buffer
}

/**
 * The HiHat 🤯
 *
 * The hi-hat is hard. When you strike a disk of metal the sound that produces is a complex
 * mix of unevenly-spaced harmonics wich decay at different times.
 *
 * Joe Sullivan talk about that in his [blog](http://joesul.li/van/synthesizing-hi-hats/)
 * Synthesizing Bells - https://www.soundonsound.com/techniques/synthesizing-bells
 *
 * OscillatorNode \
 * OscillatorNode -\
 * OscillatorNode --\    bandpass             highpass
 *                   --> BiquadFilterNode --> BiquadFilterNode --> GainNode --> Destination
 * OscillatorNode --/
 * OscillatorNode -/
 * OscillatorNode /
 */
document.querySelector('#hihat').addEventListener('click', playHiHat, false)

function playHiHat() {
  const now = context.currentTime
  const fundamental = 40
  const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21]
  const gain = new GainNode(context)
  const bandpass = new BiquadFilterNode(context)
  const highpass = new BiquadFilterNode(context)
  const oscs = []

  bandpass.type = 'bandpass'
  bandpass.frequency.value = 10000

  highpass.type = 'highpass'
  highpass.frequency.value = 7000

  bandpass.connect(highpass)
  highpass.connect(gain)
  gain.connect(destination)

  ratios.forEach((ratio) => {
    const osc = new OscillatorNode(context, {
      type: 'square',
      frequency: fundamental * ratio,
    })

    osc.connect(bandpass)

    osc.start(now)
    osc.stop(now + 0.3)

    oscs.push(osc)
  })

  gain.gain.setValueAtTime(ZERO, now)
  gain.gain.linearRampToValueAtTime(1, now + 0.02)
  // gain.gain.exponentialRampToValueAtTime(1, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.03)

  oscs[oscs.length - 1].onended = () => {
    oscs.forEach((osc) => osc.disconnect())
    gain.disconnect()
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyK') {
    playKick()
  }
  if (event.code === 'KeyS') {
    playSnare()
  }
  if (event.code === 'KeyA') {
    playHiHat()
  }
}, false)


/**
 * Draw WaveForm
 */
function WaveMaker() {
  const SMOOTH = 0 // from 0 to 1
  const PARTS = 64
  const NS = 'http://www.w3.org/2000/svg'
  const container = document.querySelector('.wave-maker')
  const svg = document.createElementNS(NS, 'svg')
  const path = document.createElementNS(NS, 'path')
  const bbox = container.getBoundingClientRect()
  const w = bbox.width / (PARTS - 1)
  const points = []
  let vector = ``

  svg.setAttribute('width', bbox.width)
  svg.setAttribute('height', bbox.height)
  svg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`)
  container.appendChild(svg)
  svg.insertBefore(path, svg.firstChild)

  this.drawPath = () => {
    vector = ``

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1]
      const end = points[i]
      // M
      const mx = start[0]
      const my = start[1]
      // L
      const lx = Math.abs(end[0] - start[0]) * 0 + start[0]
      const ly = start[1]
      // C
      const cx = start[0] + Math.abs(end[0] - start[0]) * SMOOTH
      const cy = start[1]
      const dx = end[0] - Math.abs(end[0] - start[0]) * SMOOTH
      const dy = end[1]
      const ex = -Math.abs(end[0] - start[0]) * 0 + end[0]
      const ey = end[1]
      // L
      const fx = end[0]
      const fy = end[1]

      vector = `${vector} M ${mx},${my} L ${lx},${ly} C ${cx},${cy} ${dx},${dy} ${ex},${ey} L ${fx},${fy}`
    }

    console.log(vector)
    path.setAttribute('d', vector)
    path.setAttribute('stroke', '#000000')
    path.setAttribute('stroke-width', 1)
    path.setAttribute('fill', 'none')
  }

  this.init = () => {
    const h = bbox.height / 2

    for (let i = 0; i < PARTS; i++) {
      const circle = document.createElementNS(NS, 'circle')
      const y = h
      const sx = i * w

      circle.setAttribute('id', `rect-${i}`)
      circle.setAttribute('cx', sx)
      circle.setAttribute('cy', y)
      circle.setAttribute('r', 3)
      circle.setAttribute('fill', i === 0 || i === PARTS - 1 ? 'transparent' : '#000000')
      circle.setAttribute('data-index', i)
      svg.appendChild(circle)

      circle.addEventListener('mousedown', (event) => {
        const ci = event.target
        const id = ci.getAttribute('id').replace('rect-', '')
        let m = false
        const move = (event) => {
          const ny = event.clientY - bbox.top
          points[Number(id)][1] = ny
          circle.setAttribute('cy', ny)

          this.drawPath()
        }

        ci.setAttribute('r', 4)

        document.addEventListener('mousemove', move, false)

        document.addEventListener('mouseup', () => {
          ci.setAttribute('r', 3)
          document.removeEventListener('mousemove', move)
        })
      })

      points.push([sx, y])
    }
  }

  this.init()
  this.drawPath()

  return { svg, itemWidth: w, bbox }
}

const wm = new WaveMaker()
