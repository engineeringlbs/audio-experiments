/**
 * Ref:
 * https://webaudio.github.io/web-audio-api/#oscillator-coefficients
 */
export default class Waveforms {
  static sine(i) {
    return Math.pow(i, -4.0)
  }

  static square(i) {
    return 4.0 / (Math.PI * i)
  }

  static triangle(i) {
    return ((8.0 / Math.PI) * Math.sin((i * Math.PI) / 2)) / (Math.PI * i)
  }

  static sawtooth(i) {
    return 4.0 / (Math.pow(-1, i) * Math.PI * i)
    // return (Math.pow(-1, Math.floor(i / 2)) * 2) / i // Preciosa la forma de onda
    //  return -2 / i
  }
}
