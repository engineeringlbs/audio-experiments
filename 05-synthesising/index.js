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
document.querySelector('#kick2').addEventListener('click', playKick2, false)

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
  const osc = new OscillatorNode(context)
  const gain = new GainNode(context)

  osc.connect(gain)
  gain.connect(destination)

  osc.frequency.setValueAtTime(150, now) // Kick frequency
  gain.gain.setValueAtTime(1, now)

  // Nothe that we use exponential ramping!
  osc.frequency.exponentialRampToValueAtTime(ZERO, now + 0.5)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.5)

  osc.start(now)
  osc.stop(now + 0.5)
}

function playKick2() {
  const now = context.currentTime
  const osc = new OscillatorNode(context)
  const osc2 = new OscillatorNode(context)
  const gain = new GainNode(context)
  const gain2 = new GainNode(context)

  osc.type = 'triangle'
  osc2.type = 'sine'

  osc.connect(gain)
  gain.connect(destination)

  osc2.connect(gain2)
  gain2.connect(destination)

  osc.frequency.setValueAtTime(40, now)
  gain.gain.setValueAtTime(1, now)

  osc2.frequency.setValueAtTime(80, now)
  gain2.gain.setValueAtTime(1, now)

  osc.frequency.exponentialRampToValueAtTime(ZERO, now + 0.5)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.5)
  
  osc2.frequency.exponentialRampToValueAtTime(ZERO, now + 0.5)
  gain2.gain.exponentialRampToValueAtTime(ZERO, now + 0.5)

  osc.start(now)
  osc2.start(now)

  osc.stop(now + 0.5)
  osc2.stop(now + 0.5)
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

  noiseGain.gain.setValueAtTime(1, now);
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

  bandpass.type = 'bandpass'
  bandpass.frequency.value = 10000
  
  highpass.type = 'highpass'
  highpass.frequency.value = 7000

  bandpass.connect(highpass)
  highpass.connect(gain)
  gain.connect(destination)

  ratios.forEach((ratio) => {
    const osc = new OscillatorNode(context)
    osc.type = 'square'
    osc.frequency.value = fundamental * ratio
    
    osc.connect(bandpass)

    osc.start(now)
    osc.stop(now + 0.3)
  })

  gain.gain.setValueAtTime(ZERO, now)
  gain.gain.linearRampToValueAtTime(1, now + 0.02)
  // gain.gain.exponentialRampToValueAtTime(1, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(ZERO, now + 0.03)
}