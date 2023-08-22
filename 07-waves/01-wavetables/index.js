import wavetables from './wavetables/index.js'

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

const frequencyControl = document.querySelector('.frequency-control')
const frequencySlider = frequencyControl.querySelector('#frequency')
const frequencyOut = frequencyControl.querySelector('.output')
frequencySlider.addEventListener('input', changeFrequency, false)

const volumeControl = document.querySelector('.volume-control')
const volumeSlider = volumeControl.querySelector('#volume')
const volumeOut = volumeControl.querySelector('.output')
volumeSlider.addEventListener('input', changeVolume, false)

const wavetablesList = document.querySelector('#wavetables')
const selected = {}

Object.keys(wavetables).forEach(key => {
  const button = document.createElement('button')
  button.setAttribute('id', `wavetable-${wavetables[key].name}`)
  button.setAttribute('class', 'button wavetable')
  button.innerText = wavetables[key].name

  button.addEventListener('click', () => {
    const prev = selected.button

    prev && prev.classList.remove('selected')
    button.classList.add('selected')
    
    selected.button = button
    selected.wavetable = wavetables[key]
  }, false)

  wavetablesList.appendChild(button)
})

// WAA
const acontext = new AudioContext()
const volumeNode = acontext.createGain()
let oscillator = undefined
let frequency = 440.0
let volume = 0.5

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
function createAudioWave(data) {
  /**
   * The `createPeriodicWave` method does the sum of the sine parts automatically.
   * In addition, it normalizes the calculation so that the constant C can be omitted as 1.
   */
  return acontext.createPeriodicWave(data.real, data.imag)
}

function play() {
  const now = acontext.currentTime
  oscillator = acontext.createOscillator()
  // Custom wave
  const wave = createAudioWave(selected.wavetable)
  oscillator.setPeriodicWave(wave)

  // WAA wave
  // oscillator.type = selectedWave
  oscillator.frequency.value = frequency
  volumeNode.gain.value = volume

  volumeNode.gain.setValueAtTime(0.0001, now)
  volumeNode.gain.linearRampToValueAtTime(volume, now + 0.02)

  oscillator.connect(volumeNode)
  oscillator.start()
}

function pause() {
  const now = acontext.currentTime

  volumeNode.gain.exponentialRampToValueAtTime(0.3, now + 0.03)
  volumeNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)
  
  oscillator.stop(now + 0.03)
  oscillator.onended = () => {
    oscillator.disconnect()
  }
}

function changeFrequency(event) {
  frequency = event.target.value
  oscillator.frequency.value = event.target.value
  frequencyOut.innerHTML = event.target.value + ' Hz'
}

function changeVolume(event) {
  volume = event.target.value
  volumeNode.gain.value = event.target.value
  volumeOut.innerHTML = event.target.value
}
