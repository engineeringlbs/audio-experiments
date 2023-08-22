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

//https://opendoctype.com
const acontext = new AudioContext()
const volumeNode = acontext.createGain()
let oscillator = undefined

volumeNode.connect(acontext.destination)

function play() {
  oscillator = acontext.createOscillator()

  // Custom square wave
  const wave = triangleWave()
  oscillator.setPeriodicWave(wave)

  // WA square wave
  // oscillator.type = 'triangle'
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

function squareWave() {
  // max 4096
  const n = 2048
  /**
   * @real - Coeficientes del coseno de la serie de Fourier
   * @imag - Coeficientes del seno
   *
   * Aambas matrices se inicializan con ceros, así que sólo las partes no nulas de los
   * términos seno deben ser calculadas y colocados en las posiciones correctas en imag.
   */
  const real = new Float32Array(n)
  const imag = new Float32Array(n)

  // Square wave
  for (let x = 1; x < n; x += 2) {
    imag[x] = 4.0 / (Math.PI * x)
  }

  /**
   * El método `createPeriodicWave` hace la suma de las partes seno automáticamente.
   * Además, normaliza el cálculo de modo que la constante C puede omitirse siendo 1.
   */
  const wt = acontext.createPeriodicWave(real, imag)
  return wt
}

function sineWave() {
  const n = 2048
  const real = new Float32Array(n)
  const imag = new Float32Array(n)

  imag[1] = 1

  const wt = acontext.createPeriodicWave(real, imag)
  return wt
}

function triangleWave() {
  const n = 2048
  const real = new Float32Array(n)
  const imag = new Float32Array(n)

  for (let i = 1; i < n; i += 2) {
    // imag[i] = (2 / i) * Math.PI
    imag[i] = (8 / Math.PI) * Math.sin(i * Math.PI / 2) / (i * i);
  }

  return acontext.createPeriodicWave(real, imag)
}

function sawtoothWave() {
  const n = 2048
  const real = new Float32Array(n)
  const imag = new Float32Array(n)

  for (let i = 1; i < n; i++) {
    imag[i] = -2 / i
  }

  return acontext.createPeriodicWave(real, imag)
}

// const acontext = new AudioContext()

// function play() {
//   const now = acontext.currentTime
//   const pdata = data.map((d) => d / 1000)
//   console.log(pdata)

//   const ft = new DFT(pdata.length)
//   ft.forward(pdata)
//   console.log(ft)

//   const osc = new OscillatorNode(acontext)
//   const wave = acontext.createPeriodicWave(ft.real, ft.imag)

//   osc.setPeriodicWave(wave)
//   osc.connect(acontext.destination)

//   osc.start(now)
//   osc.stop(now + 2)

//   osc.onended = () => {
//     osc.disconnect()
//   }
// }

// // DFT is a class for calculating the Discrete Fourier Transform of a signal.
// function DFT(bufferSize, sampleRate) {
//   const N = (bufferSize / 2) * bufferSize
//   const TWO_PI = 2 * Math.PI

//   this.bufferSize = bufferSize
//   this.sampleRate = sampleRate
//   this.bandwidth = ((2 / bufferSize) * sampleRate) / 2

//   this.spectrum = new Float64Array(bufferSize / 2)
//   this.real = new Float64Array(bufferSize)
//   this.imag = new Float64Array(bufferSize)

//   this.peakBand = 0
//   this.peak = 0

//   this.sinTable = new Float64Array(N)
//   this.cosTable = new Float64Array(N)

//   for (let i = 0; i < N; i++) {
//     this.sinTable[i] = Math.sin((i * TWO_PI) / bufferSize)
//     this.cosTable[i] = Math.cos((i * TWO_PI) / bufferSize)
//   }

//   this.forward = (buffer) => {
//     let real = this.real
//     let imag = this.imag
//     let rval = undefined
//     let ival = undefined

//     for (let k = 0; k < this.bufferSize / 2; k++) {
//       rval = 0.0
//       ival = 0.0

//       for (let n = 0; n < buffer.length; n++) {
//         rval += this.cosTable[k * n] * buffer[n]
//         ival += this.sinTable[k * n] * buffer[n]
//       }

//       real[k] = rval
//       imag[k] = ival
//     }

//     return this.calculateSpectrum()
//   }

//   this.calculateSpectrum = () => {
//     const bSi = 2 / this.bufferSize
//     const sqrt = Math.sqrt
//     let rval
//     let ival
//     let mag

//     for (var i = 0, N = this.bufferSize / 2; i < N; i++) {
//       rval = this.real[i]
//       ival = this.imag[i]
//       mag = bSi * sqrt(rval * rval + ival * ival)

//       if (mag > this.peak) {
//         this.peakBand = i
//         this.peak = mag
//       }

//       this.spectrum[i] = mag
//     }
//   }
// }
