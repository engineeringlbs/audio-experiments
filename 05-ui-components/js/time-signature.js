/**
 * Time Signature
 */

export default class TimeSignature {
  numerator = 4 // Beats per bar. 1-99
  denominator = 4 // Beat value. 1, 2, 4, 8 or 16
  UI = {
    wrapper: undefined,
    numerator: undefined,
    denominator: undefined,
  }
  onChange = undefined

  constructor({ wrapper, signature = {}, onChange = undefined }) {
    const w = document.querySelector(wrapper)
    this.UI = {
      wrapper: w,
      numerator: w.querySelector('#numerator'),
      denominator: w.querySelector('#denominator'),
    }
    console.log(signature);
    this.numerator = signature.numerator ??= this.numerator
    this.denominator = signature.denominator ??= this.denominator
    this.onChange = onChange

    this.UI.numerator.addEventListener(
      'input',
      (event) => {
        const value = Number(event.target.value)
        this.setNumerator(value)
        this.onChange?.({
          numerator: this.numerator,
          denominator: this.denominator,
        })
      },
      false
    )
    
    this.UI.denominator.addEventListener(
      'change',
      (event) => {
        const value = Number(event.target.value)
        this.setDenominator(value)
        this.onChange?.({
          numerator: this.numerator,
          denominator: this.denominator,
        })
      },
      false
    )

    this.UI.numerator.value = Number(this.numerator)
    this.UI.denominator.selected = this.denominator
  }

  setNumerator(value) {
    this.numerator = value
  }

  getNumerator() {
    return this.numerator
  }

  setDenominator(value) {
    this.denominator = value
  }

  getDenominator() {
    return this.denominator
  }
}
