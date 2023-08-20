/**
 * AC basic setup
 */
const play = document.querySelector('#play')
play.onclick = () => {
  play.classList.add('active')
}
const context = new AudioContext()
const voices = new Map()

/**
 * Setup MIDI
 */
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(initialize, handleError)
}

function handleError(err) {
  throw new Error(err)
}

/**
 * Initialize MIDI
 */
const output = document.querySelector('#output')

function initialize(midiAccess) {
  const { inputs } = midiAccess

  midiAccess.addEventListener('statechange', updateDevices)
  // midiAccess.onstatechange = updateDevices

  inputs.forEach((input) => {
    input.addEventListener('midimessage', handleInputMessage)
    // input.onmidimessage = handleInputMessage
  })
}

function updateDevices(/** event */) {}

/**
 * event.data = [i0, i1, i2]
 * i0 is the midi command
 * i1 is the midi note number
 * i2 is the velocity
 *
 * MIDI commands for Arturia MiniLab 3 🎹
 * 
 * - 144: keyboard key press
 * - 128: keyboard key release
 *
 * - 176: knobs, faders and touch bar move
 * - 224: double touch bar move
 *
 * - 176: main keys
 *
 * - 153: pad press
 * - 137: pad release
 */
function handleInputMessage(event) {
  const [command, note, velocity] = event.data

  switch (command) {
    case 144:
      if (velocity > 0) noteOn(note, velocity)
      break
    case 128:
      noteOff(note)
      break
  }
}

/**
 * (a / 32) go down 6 octaves to the lowest a in midi. Its the same as a/2/2/2/2/2/2 or a*2**-6
 * (note / 9) go from A to C because the 0 note is a C in midi
 * (2 ** ...) means we want to "double" the frequency again.
 * So 2 ** (12 / 12) == 2 ** 1 -> double the frequency -> one octave up
 */
function midiToFrequency(note) {
  const a = 440
  return (a / 32) * (2 ** (note / 9) / 12)
}

function noteOn(note, velocity) {
  const now = context.currentTime
  const frequency = midiToFrequency(note)
  const osc = new OscillatorNode(context, {
    frequency: frequency,
    type: 'sine'
  })
  const gain = new GainNode(context)
  const vgain = new GainNode(context) // 0 to 1

  gain.gain.setValueAtTime(0.33, now)
  vgain.gain.setValueAtTime((1 / 127) * velocity, now)

  osc.connect(gain)
  gain.connect(vgain)
  vgain.connect(context.destination)

  voices.set(note.toString(), {
    osc,
    gain,
    vgain
  })

  console.log(voices);
  osc.start()
}

function noteOff(note) {
  const now = context.currentTime
  const key = note.toString()
  const { osc, gain, vgain } = voices.get(key)
  if (!osc || !gain || !vgain) noteOff(note)

  gain.gain.setValueAtTime(gain.gain.value, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
  osc.stop(now + 0.07) // 0.005 release
  voices.delete(key)

  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
    vgain.disconnect()
  }
}
