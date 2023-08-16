/**
 * Let's try to find the way to work with audio nodes declaratively
 */

const audioParamProperties = [
  'attack',
  'delayTime',
  'detune',
  'frequency',
  'gain',
  'knee',
  'pan',
  'playbackRate',
  'ratio',
  'release',
  'threshold',
  'Q',
]

const constructorParamsKeys = [
  'maxDelayTime',
  'mediaElement',
  'mediaStream',
  'numberOfOutputs',
]

/**
 * Because we work with nodes, the main function can be `createNode`.
 *
 * This function is called
 */
const createNode =
  (node) =>
  (output, ...rest) =>
    new SynthAudioNode(node, output, ...rest)

const gain = createNode('gain')
const oscillator = createNode('oscillator')

const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1)

const equals = (a, b) => {
  if (a === b) return true
  const typeA = typeof a

  if (typeA !== typeof b || typeA !== 'object') return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) if (!equals(a[i], b[i])) return false

    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (!equals(a[key], b[key])) return false
  }

  return true
}

const values = (obj) => {
  const keys = Object.keys(obj)
  const ret = []
  for (let i = 0; i < keys.length; i++) ret[i] = obj[keys[i]]
  return ret
}

const createAudioNode = (
  audioContext /** AudioContext | OfflineAudioContext */,
  name /** string */,
  audioNodeFactoryParam /** [key: string]: any */
) => {
  // check type
  const audioNodeFactoryName = `create${capitalize(name)}`
  const audioNode = audioContext[audioNodeFactoryName](audioNodeFactoryParam)
  return audioNode
}

const connectAudioNodes = (nodes, handleConnectionToOutput) => {
  for (const [id, virtualNode] of Object.entries(nodes)) {
    console.log(virtualNode)
    if (virtualNode.connected || virtualNode.output === undefined) continue

    for (const output of Array.isArray(virtualNode.output)
      ? virtualNode.output
      : [virtualNode.output]) {
      if (output === 'output') {
        handleConnectionToOutput(virtualNode)
        continue
      }

      if (typeof output === 'object') {
        const { key, destination, inputs, outputs } = output

        if (key === null) {
          throw new Error(`id: ${id} - output object requires a key property`)
        }
        if (inputs) {
          if (inputs.length !== outputs?.length) {
            throw new Error(
              `id: ${id} - outputs and inputs arrays are not the same length`
            )
          }
          for (let i = 0; i++; i < inputs.length) {
            virtualNode.connect(nodes[key].node, outputs[i], inputs[i])
          }
          continue
        }

        virtualNode.connect(nodes[key].node[destination])
        continue
      }

      const destinationVirtualAudioNode = nodes[output]
      console.log(destinationVirtualAudioNode)

      // if (destinationVirtualAudioNode instanceof SynthAudioNode) {
      //   for (const node of values(destinationVirtualAudioNode.node)) {
      //     if (node instanceof SynthAudioNode && node.input === 'input') {
      //       virtualNode.connect(node.audioNode)
      //     }
      //   }
      //   continue
      // }

      virtualNode.connect(destinationVirtualAudioNode.node)
    }
  }
}

export class Synth {
  audioContext = undefined
  nodes = {}

  constructor({
    context /** AudioContext | OfflineAudioContext */,
    output /** AudioDestinationNode */,
  }) {
    this.audioContext = context
  }

  set(nodes) {
    if (nodes.hasOwnProperty('output')) {
      throw new Error('"output" is not a valid id')
    }

    if (!Object.keys(nodes).length) {
      console.log('vacio')
      this.disconnectNodes()
    }

    for (const key of Object.keys(nodes)) {
      const node = nodes[key]
      const synthNode = this.nodes[key]

      if (synthNode === undefined) {
        this.nodes[key] = node.init(this.audioContext)
        continue
      }

      synthNode.update(node.params, this.audioContext)
    }

    // connect audio nodes
    connectAudioNodes(this.nodes, (node) =>
      node.connect(this.audioContext.destination)
    )

    return this
  }

  get synthTime() {
    return this.audioContext.currentTime
  }

  getAudioNodeById(id) {
    return this.nodes[id]?.node
  }

  disconnectNodes() {
    for (const node of Object.values(this.nodes)) {
      node.disconnect()
    }
  }
}

class SynthAudioNode {
  /** AudioNode */
  node = undefined
  output = undefined
  params = undefined
  input = undefined
  connected = false
  /** AudioNode[] */
  connections = []
  willStop = false

  constructor(node, output = undefined, params = {}, input = undefined) {
    console.log('SynthAudioNode: constructor', node, output, params, input)

    this.node = node
    this.output = output
    this.params = params
    this.input = input
    this.willStop = params?.stopTime !== undefined
  }

  connect(...args /** any[] */) {
    const filtered = args.filter(Boolean)
    const [output, ...rest] = filtered
    this.node?.connect(output || this.node.context.destination, ...rest)
    this.connections = this.connections.concat(filtered)
    this.connected = true
  }

  disconnect(node = undefined) {
    if (node) {
      console.log(node)
      // check if node is a SynthAudioNode
      this.connections = this.connections.filter((n) => n !== node.node)
    }
    this.node?.disconnect()
    this.connected = false
  }

  init(context /** AudioContext | OfflineAudioContext */) {
    const params = this.params || {}
    const { offsetTime, startTime, stopTime, ...props } = params
    const audioNode = createAudioNode(context, this.node, props)

    this.node = audioNode
    this.params = undefined
    this.update(params)

    if (this.node instanceof OscillatorNode) {
      audioNode.start(startTime ?? context.currentTime)

      if (stopTime !== null) {
        audioNode.stop(stopTime)
      }
    }

    return this
  }

  update(_params /** [k: string]: any | null | undefined */) {
    const params = _params ?? {}
    const audioNode = this.node

    for (const key of Object.keys(params)) {
      if (constructorParamsKeys.indexOf(key) !== -1) continue

      const param = params[key]

      if (this.params && equals(this.params[key], param)) continue

      if (audioParamProperties.indexOf(key) !== -1) {
        if (Array.isArray(param)) {
          if (this.params) audioNode[key].cancelScheduledValues(0)

          const callMethod = ([methodName, ...args]) =>
            audioNode[key][methodName](...args)

          Array.isArray(param[0])
            ? param.forEach(callMethod)
            : callMethod(param)

          continue
        }

        audioNode[key].value = param
        continue
      }

      audioNode[key] = param
    }

    this.params = params

    return this
  }
}

/**
 *
 */

let context = undefined
let synth = undefined

const loadButton = document.querySelector('.load')
const playButton = document.querySelector('.play')
const stopButton = document.querySelector('.stop')
const getButton = document.querySelector('.get')

loadButton.addEventListener('click', () => {
  context = new AudioContext()
  synth = new Synth({
    context: context,
    output: context.destination,
  })
})

playButton.addEventListener('click', () => {
  const { synthTime } = synth

  synth.set({
    // main: gain('output', { gain: 0.5 }),
    // osc1: oscillator('main', { stopTime: synthTime + 3.0 }),

    // main: gain('output', { gain: 0.5 }),
    // osc1: oscillator('main', {
    //   type: 'sawtooth',
    //   frequency: 440.0,
    //   startTime: synthTime,
    //   stopTime: synthTime + 2.5,
    // }),

    // osc2: oscillator('main', {
    //   type: 'square',
    //   frequency: 554.365,
    //   startTime: synthTime + 0.5,
    //   stopTime: synthTime + 2.5,
    //   detune: 4,
    // }),

    // osc3: oscillator('main', {
    //   type: 'triangle',
    //   frequency: 660.0,
    //   startTime: synthTime + 1,
    //   stopTime: synthTime + 2.5,
    // }),

    main: gain('output', { gain: 0.2 }),
    note: gain('main', {
      gain: [
        ['setValueAtTime', 0, synthTime],
        ['linearRampToValueAtTime', 1, synthTime + 0.5],
        ['setValueAtTime', 1, synthTime + 0.5],
        ['linearRampToValueAtTime', 0, synthTime + 0.5 + 4],
      ],
    }),
    osc1: oscillator('note', {
      type: 'triangle',
      frequency: 440.0,
      startTime: 0,
      stopTime: synthTime + 4.5,
    }),

    // main: gain('output', { gain: 0.2 }),
    // osc1: oscillator('main', { stopTime: synthTime + 3 }),
    // wow: gain({ destination: 'frequency', key: 'osc1' }, { gain: 350 }),
    // osc2: oscillator(['wow', 'output'], { frequency: 1, type: 'triangle' }),
  })

  console.log(synth)
})

stopButton.addEventListener('click', () => {
  console.log('Stopping...')
  synth.set({})
})

getButton.addEventListener('click', () => {
  const osc = synth.getAudioNodeById('osc1')
  console.log(osc)
})





