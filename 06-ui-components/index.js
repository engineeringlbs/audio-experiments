import Tempo from './js/tempo.js'
import TimeSignature from './js/time-signature.js'
import Pianoroll from './js/pianoroll.js'

/**
 * Basic audio setup
 *
 * DynamicCompressorNode --> GainNode --> AudioCOntextDestination
 */
const context = new AudioContext()
const output = context.destination
const destination = new GainNode(context)

destination.connect(output)

// UI settings
const RATIO = window.devicePixelRatio
const SETTINGS = {
  bpm: 120.0, // Beats per minute. 20-999,
  octaves: 7,
  // 0 = white, 1 = black
  // 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0
  notes: 12,
  signature: {
    numerator: 4, // Beats per bar. 1-99
    denominator: 4, // Beat value. 1, 2, 4, 8 or 16
  },
  minCellWidth: 30,
  maxCellWidth: 300,
  zoom: 1,
}

const pianoroll = new Pianoroll({
  wrapper: '.pianoroll',
  bpm: SETTINGS.bpm,
  signature: SETTINGS.signature,
  instruments: ['Open Hat', 'Closed Hat', 'Clap', 'Kick'],
  onChange: (props) => {
    console.log(`Pianoroll change: ${props}`)
  },
})

const tempo = new Tempo({
  wrapper: '.bpm',
  bpm: SETTINGS.bpm,
  onChange: (bpm) => {
    SETTINGS.bpm = bpm
    pianoroll.setBpm(bpm)
  },
})

const timesignature = new TimeSignature({
  wrapper: '.signature',
  signature: SETTINGS.signature,
  onChange: (props) => {
    SETTINGS.signature.numerator = props.numerator
    SETTINGS.signature.denominator = props.denominator
    pianoroll.setTimeSignature(SETTINGS.signature)
  },
})
