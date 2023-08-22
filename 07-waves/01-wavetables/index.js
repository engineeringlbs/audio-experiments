// import Waveforms from './waveforms.js'
import wavetables from './wavetables/index.js'

console.log(wavetables.Bass)


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
  const wave = createAudioWave(Wavetables.Bass)
  console.log(Wavetables.Bass);
  oscillator.setPeriodicWave(wave)

  // WAA wave
  // oscillator.type = selectedWave
  oscillator.frequency.value = 440.0
  volumeNode.gain.value = 0.5

  volumeNode.gain.setValueAtTime(0.0001, now)
  volumeNode.gain.linearRampToValueAtTime(1, now + 0.02)

  oscillator.connect(volumeNode)
  oscillator.start()
}

function pause() {
  const now = acontext.currentTime

  volumeNode.gain.exponentialRampToValueAtTime(0.3, now + 0.03)
  volumeNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)
  
  oscillator.stop(now + 0.03)
  oscillator.onended = () => {
    console.log('End');
    oscillator.disconnect()
  }
}

function changeFrequency(event) {
  oscillator.frequency.value = event.target.value
  frequencyOut.innerHTML = event.target.value + ' Hz'
}

function changeVolume(event) {
  volumeNode.gain.value = event.target.value
  volumeOut.innerHTML = event.target.value
}
