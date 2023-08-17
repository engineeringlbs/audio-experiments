const NOTES = {
  C4: 261.63,
  Db4: 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Gb4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
}

/** 
 * Keyboard mapping
 * 
 *  W E   T Y   U
 * A S D F G H J K
 */
const KEYS = {
  A: NOTES.C4,
  W: NOTES.Db4,
  S: NOTES.D4,
  E: NOTES.Eb4,
  D: NOTES.E4,
  F: NOTES.F4,
  T: NOTES.Gb4,
  G: NOTES.G4,
  Y: NOTES.Ab4,
  H: NOTES.A4,
  U: NOTES.Bb4,
  J: NOTES.B4,
  K: NOTES.C5,
}

const garbage = []

/**
 * Main setup
 */
let tempo = 120.0
let playing = false
let currentNote = 0 // current note index

// Main Aucio Context
const context = new AudioContext()
const main = new GainNode(context)
const analyser = new AnalyserNode(context)

main.gain.value = 0.2
main.connect(analyser)
main.connect(context.destination)

// UI
const startBtn = document.querySelector('#play')
const stopBtn = document.querySelector('#pause')
const tempoCtrl = document.querySelector('#tempo')
const volumeCtrl = document.querySelector('#volume')

startBtn.addEventListener('click', () => {
  if (!playing) {
    playing = true

    if (context.state === 'suspended') context.resume()

    loop()
  }
})

stopBtn.addEventListener('click', () => {
  playing = false

  if (context.state === 'running') {
    context.suspend()
  }
})

tempoCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    tempo = value
    document.querySelector('#bpm').innerText = `${value} bpm`
  },
  false
)

volumeCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    main.gain.value = value
    document.querySelector('#vol').innerText = `${value}`
  },
  false
)

document.addEventListener('keydown', (event) => {
  const char = event.code.replace('Key', '')
  const freq = KEYS[char]
  if (freq && !event.repeat) {
    noteOn(freq, char)
  }
})

document.addEventListener('keyup', (event) => {
  const char = event.code.replace('Key', '')
  const freq = KEYS[char]
  noteOff(freq, char)
})

/**
 * Vaveform setup
 */
const waveforms = document.getElementsByName('waveform')
let waveform = 'sine'

waveforms.forEach((waveformInput) =>
  waveformInput.addEventListener('change', setWaveform)
)

function setWaveform() {
  for (var i = 0; i < waveforms.length; i++) {
    if (waveforms[i].checked) {
      waveform = waveforms[i].value
    }
  }
}

/**
 * Notes setup
 */
const currentNotes = [0, 3, 0, 7, 8, 7, 3, 2]
const notesWrapper = document.querySelector('.notes-wrapper')

for (let i = 0; i <= 7; i++) {
  const select = document.createElement('select')
  select.id = `note ${i + 1}`

  for (let j = 0; j < Object.keys(NOTES).length; j++) {
    const option = document.createElement('option')
    option.value = j
    option.innerText = `${Object.keys(NOTES)[j]}`
    select.appendChild(option)
    select.addEventListener('change', onSelectNoteChange)
  }

  notesWrapper.appendChild(select)
}

function setNoteSelects() {
  for (let i = 0; i < currentNotes.length; i++) {
    selects[i].value = currentNotes[i]
  }
}

const selects = document.querySelectorAll('select')
setNoteSelects()

function onSelectNoteChange() {
  for (let i = 0; i < selects.length; i++) {
    currentNotes[i] = selects[i].value
  }
}

/**
 * AHDSR Envelope (Attack, Hold, Decay, Sustain, Release)
 */
const WIDTH = 400
const HEIGHT = 200
const HALF_HEIGHT = HEIGHT / 2
const attackCtrl = document.querySelector('#attack')
const decayCtrl = document.querySelector('#decay')
const sustainCtrl = document.querySelector('#sustain')
const releaseCtrl = document.querySelector('#release')
const holdCtrl = document.querySelector('#hold')
const AHDSRContainer = document.querySelector('.adsr-visualizer')
const AHDSRVisualizer = {
  container: AHDSRContainer,
  shape: AHDSRContainer.querySelector('.shape'),
  preshape: AHDSRContainer.querySelector('.pre.shape'),
  posshape: AHDSRContainer.querySelector('.pos.shape'),
  attack: AHDSRContainer.querySelector('.dot-attack'),
  hold: AHDSRContainer.querySelector('.dot-hold'),
  decay: AHDSRContainer.querySelector('.dot-decay'),
  sustain: AHDSRContainer.querySelector('.dot-sustain'),
  release: AHDSRContainer.querySelector('.dot-release'),
}

let duration = 4
let attackTime = 0.25 // s
let holdTime = 0.25 // s
let decayTime = 0.25 // s
let sustainLevel = 0.8 // % or dB
let releaseTime = 1 // s

attackCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    attackTime = value
    document.querySelector('#attck').innerText = `${value.toFixed(2)}`
    updateADSR()
  },
  false
)

holdCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    holdTime = value
    document.querySelector('#hld').innerText = `${value.toFixed(2)}`
    updateADSR()
  },
  false
)

decayCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    decayTime = value
    document.querySelector('#dcy').innerText = `${value.toFixed(2)}`
    updateADSR()
  },
  false
)

sustainCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    sustainLevel = value
    document.querySelector('#sstn').innerText = `${value.toFixed(2)}`
    updateADSR()
  },
  false
)

releaseCtrl.addEventListener(
  'input',
  (event) => {
    const value = Number(event.target.value)
    releaseTime = value
    document.querySelector('#rls').innerText = `${value.toFixed(2)}`
    updateADSR()
  },
  false
)

function updateADSR() {
  duration = attackTime + holdTime + decayTime + releaseTime

  const points = calcEnvelopePoints(
    duration,
    attackTime,
    holdTime,
    decayTime,
    sustainLevel,
    releaseTime
  )

  AHDSRVisualizer.shape.setAttribute('points', points)

  AHDSRVisualizer.attack.setAttribute('cx', points[2])

  AHDSRVisualizer.hold.setAttribute('cx', points[4])
  AHDSRVisualizer.hold.setAttribute('cy', points[5])

  AHDSRVisualizer.decay.setAttribute('cx', points[6])
  AHDSRVisualizer.decay.setAttribute('cy', points[7])

  AHDSRVisualizer.sustain.setAttribute('cx', points[8])
  AHDSRVisualizer.sustain.setAttribute('cy', points[9])
}

updateADSR()

function calcEnvelopePoints(dur, attack, hold, decay, sustain, release) {
  const bpp = WIDTH / dur
  const att = bpp * attack
  const hol = att + bpp * hold
  const dec = hol + bpp * decay
  const susx = dec + bpp * (dur - attack - hold - decay - release)
  const susy = HALF_HEIGHT * (1 - sustain)
  const rel = susx + bpp * release

  return [
    0,
    HALF_HEIGHT,
    att,
    0,
    hol,
    0,
    dec,
    susy,
    susx,
    susy,
    rel,
    HALF_HEIGHT,
  ]
}

// Loop
let t = 0
function loop() {
  const spb = 60.0 / tempo

  if (playing) {
    playNote()
    nextNote()

    // Improve clock
    window.setTimeout(() => {
      loop()
    }, spb * 1000)
  }
}

const notes = new Map()
function noteOn(freq, char) {
  const now = context.currentTime
  const osc = new OscillatorNode(context, {
    type: waveform,
    frequency: freq,
  })

  const note = new GainNode(context)
  note.gain.setValueAtTime(0, now)
  // Attack
  note.gain.linearRampToValueAtTime(1, now + attackTime)
  // note.gain.setValueAtTime(1, attck)
  // Hold
  const hld = now + attackTime + holdTime
  note.gain.linearRampToValueAtTime(1, hld)
  // Decay and sustain
  note.gain.linearRampToValueAtTime(
    sustainLevel,
    now + attackTime + holdTime + decayTime
  )

  notes[char] = { osc, note }

  osc.connect(note).connect(main)

  osc.start()
}

function noteOff(freq, char) {
  const now = context.currentTime
  const { osc, note } = notes[char]
  console.log(osc);
  console.log(note);
  note.gain.setValueAtTime(sustainLevel, now + attackTime + holdTime + decayTime)
  note.gain.linearRampToValueAtTime(0, now + duration)
  osc.stop(now + duration)
  delete notes[char]
}

/**
 * Play a note.
 */
function playNote(fr, create = true) {
  // trying to keep garbage clean as possible
  clean()

  const now = context.currentTime
  const freq = fr || Object.values(NOTES)[`${currentNotes[currentNote]}`]
  const osc = new OscillatorNode(context, {
    type: waveform,
    frequency: freq,
  })
  const note = new GainNode(context)
  note.gain.setValueAtTime(0, now)
  // Attack
  note.gain.linearRampToValueAtTime(1, now + attackTime)
  // note.gain.setValueAtTime(1, attck)
  // Hold
  const hld = now + attackTime + holdTime
  note.gain.linearRampToValueAtTime(1, hld)
  // Decay and sustain
  note.gain.linearRampToValueAtTime(
    sustainLevel,
    now + attackTime + holdTime + decayTime
  )
  note.gain.linearRampToValueAtTime(0, now + duration)

  // trying to keep garbage clean as possible
  garbage.push(osc)
  garbage.push(note)

  osc.connect(note).connect(main)

  osc.start()
  osc.stop(now + duration)

  console.log(navigator.hardwareConcurrency)
}

function nextNote() {
  currentNote += 1

  if (currentNote === 8) {
    currentNote = 0
  }
}

// Force GC cleaning up shit
function clean() {
  garbage.length = 0
}

/**
 * Audio visualizations
 *
 * - Plot
 * - Oscilloscope
 * - Waveform
 * - Spectrum
 * - Spectogram
 */

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 120
const RATIO = window.devicePixelRatio

function drawPlot({ context = context, data = [] }) {
  const len = data.length
  const get = (i) => data[i | 0] ?? data[len - 1]
  const ox = RATIO / 100
  const w = CANVAS_WIDTH * RATIO
  const height = CANVAS_HEIGHT * RATIO
  const l = 1
  const hl = l
  const hw = w * 0.5 * hl
  const h = height - l
  const step = Math.max(0.00001, 2 / len) // * 2 move two periods
  if (!isFinite(step)) return
  const sx = 1 / w
  const cf = len / (w * 2)
  // panning
  const ds = cf * w * 2

  let i = ((len - ds) / cf) * ox
  let cx = 0
  let cy = 0
  let x = -1

  const calculate = (y) => {
    cx = (x + 1) * hw - hl
    cy = (1 - (y + 1) * 0.5) * h + hl
  }
  calculate(get(0))

  context.lineWidth = 2
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, w, height)
  context.beginPath()
  context.moveTo(cx, cy)

  for (x = -1; x <= 1; x += sx) {
    calculate(get(i++ * cf))
    context.lineTo(cx, cy)
  }

  calculate(get(i++ * cf))
  context.lineTo(cx, cy)
  context.lineTo(cx, cy)
  context.stroke()
  context.restore()
}

// initialize Plot
const plot = document.querySelector('#plot')
const plotCtx = plot.getContext('2d', { alpha: false, desynchronized: true })

plot.width = CANVAS_WIDTH * RATIO
plot.height = CANVAS_HEIGHT * RATIO
plot.style.width = CANVAS_WIDTH + 'px'
plot.style.height = CANVAS_HEIGHT + 'px'

const size = 0.2
const w = CANVAS_WIDTH * size
const h = CANVAS_HEIGHT * size

function animate() {
  requestAnimationFrame(animate)

  const oscw = new Float32Array(analyser.frequencyBinCount)
  analyser.getFloatTimeDomainData(oscw)
  
  drawPlot({ context: plotCtx, data: oscw })
  
  // Pixelating data 🤘
  // plotCtx.imageSmoothingEnabled = false
  // plotCtx.drawImage(plot, 0, 0, w, h)
  // plotCtx.drawImage(plot, 0, 0, w, h, 0, 0, CANVAS_WIDTH * RATIO, CANVAS_HEIGHT* RATIO)
}

// performance animation
let lastTime = null
function frame(time) {
  if (lastTime != null) {
    animate(Math.min(100, time - lastTime) / 1000)
  }
  lastTime = time
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)


/**
 * Try to keep track of CPU
 */
const work = new Worker(
  'data:text/javascript,setInterval(` dl=Date.now();for(itr=1;itr<1000;itr++){};dl=Date.now()-dl;postMessage(dl);`,1000);'
)

work.onmessage = (event) => {
  console.info(
    12 -
      event.data +
      (' point' +
        (new Intl.PluralRules(navigator.language).select(12 - event.data) ===
        'one'
          ? ''
          : 's'))
  )
}
