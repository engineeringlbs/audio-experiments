import Waveforms from './waveforms.js'

// UI
const playBtn = document.querySelector('#play')
playBtn.addEventListener('click', handlePlayClick, false)

function handlePlayClick(event) {
  if (playBtn.classList.contains('active')) {
    pause()
  } else {
    play()
  }

  playBtn.classList.toggle('active')
}

const waves = ['sine', 'square', 'triangle', 'sawtooth']
const waveBtn = document.querySelector('#wave')
waveBtn.addEventListener('click', nextWave, false)

let wi = 2
let selectedWave = 'square'
function nextWave() {
  if (wi === 3) wi = 0
  else wi += 1

  waveBtn.className = `ml-8 ${waves[wi]}`
  selectedWave = waves[wi]
}
nextWave()

const frequencyControl = document.querySelector('.frequency-control')
const frequencySlider = frequencyControl.querySelector('#frequency')
const frequencyOut = frequencyControl.querySelector('.output')
frequencySlider.addEventListener('input', changeFrequency, false)

const volumeControl = document.querySelector('.volume-control')
const volumeSlider = volumeControl.querySelector('#volume')
const volumeOut = volumeControl.querySelector('.output')
volumeSlider.addEventListener('input', changeVolume, false)

// Canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const dpx = window.devicePixelRatio
const w = 160 * dpx
const h = 80 * dpx

canvas.style.width = 160 + 'px'
canvas.style.height = 80 + 'px'
canvas.width = w
canvas.height = h

// WAA
const acontext = new AudioContext()
const volumeNode = acontext.createGain()
let oscillator = undefined

volumeNode.connect(acontext.destination)

// Waveforms
const bufferSize = acontext.sampleRate // max 4096
/**
 * @real - Fourier series cosine coefficients
 * @imag - Sine coefficients
 *
 * Both matrices are initialized with zeros, so only the non-zero parts of the sine terms
 * must be calculated and placed in the correct positions in imag.
 *
 * Sine terms must be calculated and placed in the correct positions in imag.
 */
const real = new Float32Array(bufferSize)
const imag = new Float32Array(bufferSize)
// Create the waveforms to avoid the delay caused for computation time if we create it on the fly.
// Maybe we can use an AudioWorklet instead.
const waveforms = {
  sine: createAudioWave('sine', bufferSize),
  square: createAudioWave('square', bufferSize),
  sawtooth: createAudioWave('sawtooth', bufferSize),
  triangle: createAudioWave('triangle', bufferSize),
}

function play() {
  oscillator = acontext.createOscillator()
  // Custom wave
  oscillator.setPeriodicWave(waveforms[selectedWave])

  // WAA wave
  // oscillator.type = selectedWave
  oscillator.frequency.value = 440.0
  volumeNode.gain.value = 0.5

  oscillator.connect(volumeNode)
  oscillator.start()
}

function pause() {
  oscillator.stop()
}

function changeFrequency(event) {
  oscillator.frequency.value = event.target.value
  frequencyOut.innerHTML = event.target.value + ' Hz'
}

function changeVolume(event) {
  volumeNode.gain.value = event.target.value
  volumeOut.innerHTML = event.target.value
}

function createAudioWave(type, bufferSize) {
  // Square wave
  for (let x = 1; x < bufferSize; x += 2) {
    imag[x] = Waveforms[type](x)
  }

  /**
   * The `createPeriodicWave` method does the sum of the sine parts automatically.
   * In addition, it normalizes the calculation so that the constant C can be omitted as 1.
   */
  const wt = acontext.createPeriodicWave(real, imag)
  return wt
}

function draw(type) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()
  ctx.lineWidth = 2

  for (let x = 1; x < w; x += 2) {
    const y = (Waveforms[type](x) * h) / 2
    ctx.lineTo(x, y + h / 2)
  }

  ctx.stroke()
}

draw(selectedWave)
