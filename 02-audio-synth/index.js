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

const context = new AudioContext()
const volume = new GainNode(context)

volume.gain.value = 0.2

// Create the audio graph
volume.connect(context.destination)

// UI
const startBtn = document.querySelector('#play')
const stopBtn = document.querySelector('#pause')
const tempoCtrl = document.querySelector('#tempo')

startBtn.addEventListener('click', () => {
  if (!playing) {
    playing = true
    loop()
  }
})

stopBtn.addEventListener('click', () => {
  playing = false
})

tempoCtrl.addEventListener(
  'input',
  function () {
    tempo = Number(this.value)
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
 * Effects setup
 *
 * - ADSR Envelope (Attack, Decay, Sustain and Release)
 * - Delay
 * - Vibrato
 */

// ADSR
let attackTime = 0.2 // ms
let decayTime = 0.5 // ms
let sustainLevel = 0.8 // %
let releaseTime = 0.2 // ms
let len = attackTime + decayTime + releaseTime

let t = 0
// Loop
function loop() {
  const spb = 60.0 / tempo

  if (playing) {
    playNote()
    nextNote()

    window.setTimeout(() => {
      loop()
    }, spb * 1000)
  }
}

function playNote() {
  // clean()

  const now = context.currentTime
  const osc = new OscillatorNode(context)
  const note = new GainNode(context)
  const freq = Object.values(NOTES)[`${currentNotes[currentNote]}`]
  console.log(freq);
  osc.type = waveform
  osc.frequency.setValueAtTime(freq, 0)
  garbage.push(osc) // trying to garbage

  note.gain.setValueAtTime(0, 0)
  note.gain.linearRampToValueAtTime(sustainLevel, now + len * attackTime)
  note.gain.setValueAtTime(sustainLevel, now + len * releaseTime)
  note.gain.linearRampToValueAtTime(0, now + len)
  garbage.push(note) // trying to garbage

  osc.connect(note)
  note.connect(volume)

  osc.start(0)
  osc.stop(now + len)
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
