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
   return ((8 / Math.PI) * Math.sin((i * Math.PI) / 2)) / (i * i)
 }

 static sawtooth(i) {
  //  return -2 / i
   return ((-1)**i + 1) * (2 / (i * Math.PI))
 }
}