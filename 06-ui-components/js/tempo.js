/**
 * Tempo
 */
export default class Tempo {
  bpm = 120.0 // tempo
  UI = {
    wrapper: undefined,
    input: undefined,
    output: undefined,
  }
  onChange = undefined

  constructor({ wrapper, bpm = 120.0, onChange = undefined }) {
    const w = document.querySelector(wrapper)

    this.bpm = bpm
    this.UI = {
      wrapper: w,
      input: w.querySelector('input'),
      output: w.querySelector('.output'),
    }
    this.onChange = onChange
    this.UI.input.addEventListener(
      'input',
      (event) => {
        const value = Number(event.target.value)
        this.setBpm(value)
        this.onChange(Number(value))
      },
      false
    )

    this.setBpm(this.bpm)
  }

  setBpm(value) {
    this.UI.output.innerText = `${value} bpm`
  }

  getBpm() {
    return Number(this.bpm)
  }
}
