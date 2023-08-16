const state = {
  synths: {
    osc: {
      toggle: true,
    },
    lfo: {
      toggle: false,
    },
    envelope: {
      toggle: true,
    },
  },
}

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

main.gain.value = 0.2
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

  if (context.state === 'running') context.suspend()
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
  if (event.code === 'KeyA') playNote()
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
const WIDTH = 600
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

let duration = 2
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
  duration = Math.max(attackTime + holdTime + decayTime + 0.5 + releaseTime, 0)

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

/**
 * Play a note.
 */
function playNote() {
  // trying to keep garbage clean as possible
  clean()

  const now = context.currentTime
  const freq = Object.values(NOTES)[`${currentNotes[currentNote]}`]
  const osc = new OscillatorNode(context, {
    type: waveform,
    frequency: freq,
  })
  const note = new GainNode(context)
  note.gain.setValueAtTime(0, now)
  // Attack
  note.gain.linearRampToValueAtTime(1, now + attackTime)
  note.gain.setValueAtTime(1, now + attackTime)
  // Hold
  note.gain.linearRampToValueAtTime(1, now + attackTime + holdTime)
  // Decay and sustain
  note.gain.linearRampToValueAtTime(
    sustainLevel,
    now + attackTime + holdTime + decayTime
  )

  // trying to keep garbage clean as possible
  garbage.push(osc)
  garbage.push(note)

  osc.connect(note).connect(main)

  osc.start(0)
  osc.stop(now + duration)
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
