/**
 * Basic setup for play some rithm
 */
const context = new AudioContext()
const output = context.destination
const main = new GainNode(context)
const compressor = new DynamicsCompressorNode(context)

const synth = {
  drum: {
    sample: '../assets/samples/drum-kd-02.mp3',
    pattern: [1, 0, 0, 0,  0, 0, 0, 1,  0, 1, 1, 0,  0, 0, 1, 0],
    buffer: [],
  },
  hihat: {
    sample: '../assets/samples/drum-hh-01.mp3',
    pattern: [1, 0, 1, 1,  1, 0, 1, 1,  0, 1, 0, 1,  1, 1, 0, 0],
    buffer: [],
  },
  snare: {
    sample: '../assets/samples/drum-perc-01.mp3',
    pattern: [1, 0, 0, 0,  0, 0, 0, 1,  0, 1, 1, 0,  0, 0, 1, 0],
    buffer: [],
  },
}

function playSample(buffer) {
  const bufferSource = new AudioBufferSourceNode(context, { buffer: buffer })
  const amp = new GainNode(context)

  bufferSource.connect(amp).connect(output)
  bufferSource.start()
}

async function setAudioBuffers() {
  Object.keys(synth).forEach(async (key) => {
    const response = await fetch(synth[key].sample)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)
    synth[key].buffer = audioBuffer
  })
}

setAudioBuffers()

// For testing sounds
document.querySelector('#drum').addEventListener('click', () => {
  playSample(synth.drum.buffer)
})
document.querySelector('#hh').addEventListener('click', () => {
  playSample(synth.hihat.buffer)
})
document.querySelector('#snare').addEventListener('click', () => {
  playSample(synth.snare.buffer)
})

/**
 * The JavaScript time accurracy is too creepy. We need to create a mos precise timer that
 * allows us to handle the audio files or audio samples.
 *
 * This is an example to calculate the inacurate time with the JavaScript setTimeout API and..
 * the results are too bad 😢
 *
 * Start!
 * Drift: 7
 * Drift: 20
 * Drift: 26
 * Drift: 35
 * Drift: 43
 * Drift: 51
 * Drift: 57
 * Drift: 68
 * Drift: 75
 * Drift: 84
 * Drift: 90
 * Drift: 91
 * Drift: 97
 * Stop!
 *
 **/

// document.querySelector('#play').addEventListener('click', play, false)
// document.querySelector('#stop').addEventListener('click', stop, false)

// let timeOut

// function play() {
//   console.log('Start!')
//   const start = Date.now()
//   let total = 0

//   const interval = () => {
//     timeOut = setTimeout(() => {
//       // Increment total time
//       total += 1000
//       const elapsed = Date.now() - start
//       console.log('Drift:', elapsed - total)
//       interval()
//     }, 1000)
//   }

//   interval()
// }

// function stop() {
//   console.log('Stop!')
//   clearTimeout(timeOut)
// }

/**
 * Ok, let's try to make an accurate Timer.
 * The code is really simple.
 */

function Clock(callback, interval, errorCallback = undefined) {
  this.interval = interval
  this.expected = 0
  this.timeout = undefined

  this.start = () => {
    this.expected = Date.now() + this.interval
    this.timeout = setTimeout(this.normalize, this.interval)
    console.log('Start!')
  }
  
  this.stop = () => {
    clearTimeout(this.timeout)
    console.log('Stop!')
  }
  
  this.normalize = () => {
    const drift = Date.now() - this.expected
    if (drift > this.interval) {
      if (errorCallback) errorCallback(drift)
    }
  
    callback()
    
    this.expected += this.interval
    this.timeout = setTimeout(this.normalize, this.interval - drift)
  }
}

// const timer = new Timer(
//   () => {
//     console.log('Something')
//   },
//   500,
//   (drift) =>
//     console.error(`The drift is bigger than interval! Drift value: ${drift}.`)
// )

// document.querySelector('#play').addEventListener('click', timer.start, false)
// document.querySelector('#stop').addEventListener('click', timer.stop, false)


/**
 * Ok, let's try to make some noise here!
 */

const bpm = 120
const tempo = (60000 / bpm) / 4 // 60000 / bpm = quarter / 4 = 16th
const loop = new Clock(makeSomeNoise, tempo, () => console.error('Error'))

let beat = 0
function makeSomeNoise() {
  if (beat === 16) beat = 0

  for (const voice in synth) {
    const { buffer, pattern } = synth[voice]
    if (pattern[beat] === 1) {
      playSample(buffer)
    }
  }

  beat ++
}

document.querySelector('#play').addEventListener('click', loop.start, false)
document.querySelector('#stop').addEventListener('click', loop.stop, false)