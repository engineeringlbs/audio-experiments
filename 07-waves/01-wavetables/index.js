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

// Canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const dpx = window.devicePixelRatio
const w = 160 * dpx
const h = 80 * dpx

ctx.width = w
ctx.height = h

// WAA
const bufferSize = 2048 // max 4096
const acontext = new AudioContext()
const volumeNode = acontext.createGain()
let oscillator = undefined

volumeNode.connect(acontext.destination)

function play() {
  oscillator = acontext.createOscillator()

  // Custom wave
  const wave = createAudioWave('square')
  oscillator.setPeriodicWave(wave)

  draw('square')

  // WAA wave
  // oscillator.type = 'square'
  oscillator.frequency.value = 440.0

  volumeNode.gain.value = 0.3

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

function createAudioWave(type) {
  /**
   * @real - Coeficientes del coseno de la serie de Fourier
   * @imag - Coeficientes del seno
   *
   * Aambas matrices se inicializan con ceros, así que sólo las partes no nulas de los
   * términos seno deben ser calculadas y colocados en las posiciones correctas en imag.
   */
  const real = new Float32Array(bufferSize)
  const imag = new Float32Array(bufferSize)

  // Square wave
  for (let x = 1; x < bufferSize; x += 2) {
    imag[x] = Waveforms[type](x)
  }

  /**
   * El método `createPeriodicWave` hace la suma de las partes seno automáticamente.
   * Además, normaliza el cálculo de modo que la constante C puede omitirse siendo 1.
   */
  const wt = acontext.createPeriodicWave(real, imag)
  return wt
}

class Waveforms {
  static sine(x) {
    return 1
  }

  static square(i) {
    return 4.0 / (Math.PI * i)
  }

  static triangle(i) {
    return ((8 / Math.PI) * Math.sin((i * Math.PI) / 2)) / (i * i)
  }

  static sawtooth(i) {
    return -2 / i
  }
}

function draw(type) {
  ctx.beginPath()

  if (type === 'square') {
    // onda cuadrada
    ctx.moveTo(1, 40)
    ctx.lineTo(1, 4)
    ctx.lineTo(80, 4)
    ctx.lineTo(80, 76)
    ctx.lineTo(179, 76)
  }

  ctx.stroke()
}
