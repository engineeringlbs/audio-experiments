# Engineering Labs W3 Audio Experiments

Welcome to the W3 Audio Experiments project at the Engineering Labs!


## JavaScript WebAudio API and WASM

JavaScript has a well known API to play with audio, the [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
This API provides _provides a powerful and versatile system for controlling audio on the Web_, 
but the audio processing requires computation-intensive processing that will causes performance
and UX issues. To avoid this performance issues and 

Why can’t we keep things simple and perform the audio on the main thread?

- Audio processing is often computation-intensive. This is due to the large number of samples 
that need to be processed every second (about 44,100 samples each second).

- The JIT compilation and garbage collection of JavaScript happen on the main thread, and we
want to avoid this in the audio-processing code for consistent performance.

- If the time taken to process a frame of audio were to eat significantly into the 16.7 ms
frame budget, the UX would suffer from choppy animation.

- We want our app to run smoothly even on lower-performance mobile devices!

```sh
wasm-pack build --target web
```

## Sources
## Controls
## Effects
## FMOscillator

Creates an FM oscillator using the [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [web-sys](https://rustwasm.github.io/wasm-bindgen/api/web_sys/)

[FM oscillator](https://en.wikipedia.org/wiki/Frequency_modulation_synthesis)