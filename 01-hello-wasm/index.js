import init, { FMOscillator } from './pkg/hello_wasm.js'
// Important step below. Wasm initalization is required!
init()
console.log('WebAssembly initialized! 🚀')

const platBtn = document.querySelector('#play')
const noteInput = document.querySelector('#note')
const freqInput = document.querySelector('#freq')
const amountInput = document.querySelector('#amount')
let osc = null

platBtn.addEventListener('click', () => {
  if (osc === null) {
    console.log('pasa')
    osc = new FMOscillator()
    console.log(osc)
    osc.set_note(50)
    osc.set_fm_frequency(0)
    osc.set_fm_amount(0)
    osc.set_gain(0.8)
  } else {
    osc.free()
    osc = null
  }
})

noteInput.addEventListener('input', (event) => {
  if (osc) osc.set_note(parseInt(event.target.value))
})

freqInput.addEventListener('input', (event) => {
  if (osc) osc.set_fm_frequency(parseFloat(event.target.value))
})

amountInput.addEventListener('input', (event) => {
  if (osc) osc.set_fm_amount(parseFloat(event.target.value))
})
