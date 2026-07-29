// ─── Browser microphone audio capture → base64 PCM16 ───────────────────────
// Captures raw PCM audio directly from the microphone using ScriptProcessorNode,
// avoiding the Opus encode/decode cycle that degrades quality.
// Output: 16-bit signed PCM at 24000 Hz, mono, base64-encoded.

let audioCtx: AudioContext | null = null
let scriptNode: ScriptProcessorNode | null = null
let mediaStream: MediaStream | null = null
let sourceNode: MediaStreamAudioSourceNode | null = null
let isRecording = false

// Module-level promise callbacks so stopRecording() can resolve the promise
let resolveRecord: ((value: { base64: string; durationMs: number }) => void) | null = null
let rejectRecord: ((reason: Error) => void) | null = null
let recordTimeout: number | null = null
let pcmChunks: Float32Array[] = []
let startTime = 0

/**
 * Starts recording audio from the microphone.
 * Captures raw PCM audio directly, avoiding the Opus encode/decode cycle.
 * Stops when stopRecording() is called or after 30 seconds.
 */
export async function recordAudio(): Promise<{ base64: string; durationMs: number }> {
  if (isRecording) {
    throw new Error('Ya hay una grabación en curso')
  }

  pcmChunks = []
  isRecording = true

  // Get microphone stream with optimal voice settings
  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      // Don't constrain sampleRate — let the browser use its native rate
      // AudioContext will handle resampling to 24000 Hz
    },
  })

  // Create AudioContext at 24000 Hz — the ScriptProcessorNode will
  // capture at this rate, and AudioContext auto-resamples the input
  audioCtx = new AudioContext({ sampleRate: 24000 })

  // Connect microphone stream → AudioContext source → ScriptProcessorNode
  sourceNode = audioCtx.createMediaStreamSource(mediaStream)

  // ScriptProcessorNode: bufferSize=4096, 1 input channel, 1 output channel
  scriptNode = audioCtx.createScriptProcessor(4096, 1, 1)

  sourceNode.connect(scriptNode)
  scriptNode.connect(audioCtx.destination) // needed to keep processing alive

  startTime = Date.now()

  // Collect raw PCM chunks from the audio processing thread
  scriptNode.onaudioprocess = (event: AudioProcessingEvent) => {
    if (!isRecording) return
    // Get the raw PCM data (Float32, already at 24000 Hz)
    const input = event.inputBuffer.getChannelData(0)
    pcmChunks.push(new Float32Array(input))
  }

  // Safety timeout: 30 seconds max
  recordTimeout = setTimeout(() => {
    cleanup()
    if (rejectRecord) {
      rejectRecord(new Error('Tiempo de grabación excedido (30s)'))
    }
    rejectRecord = null
  }, 30000)

  return new Promise((resolve, reject) => {
    resolveRecord = resolve
    rejectRecord = reject
  })
}

/**
 * Stops the active recording and processes the captured PCM data.
 */
export function stopRecording() {
  if (!isRecording) return

  const durationMs = Date.now() - startTime
  cleanup()

  if (!resolveRecord) return

  try {
    // Concatenate all PCM chunks
    const totalLength = pcmChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    if (totalLength === 0) {
      resolveRecord = null
      rejectRecord = null
      throw new Error('No se capturó audio')
    }

    const fullPcm = new Float32Array(totalLength)
    let offset = 0
    for (const chunk of pcmChunks) {
      fullPcm.set(chunk, offset)
      offset += chunk.length
    }

    // Apply gentle gain boost (1.5×) to compensate for quiet microphones
    // with soft clipping to prevent distortion
    for (let i = 0; i < fullPcm.length; i++) {
      let sample = fullPcm[i] * 1.5
      // Soft clipping: tanh-like curve
      if (sample > 1.0) sample = 1.0
      if (sample < -1.0) sample = -1.0
      fullPcm[i] = sample
    }

    // Convert Float32 → Int16 PCM
    const pcm16 = new Int16Array(fullPcm.length)
    for (let i = 0; i < fullPcm.length; i++) {
      const s = Math.max(-1, Math.min(1, fullPcm[i]))
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }

    // Convert Int16 → base64
    const bytes = new Uint8Array(pcm16.buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)

    resolveRecord({ base64, durationMs: Math.max(durationMs, 100) })
    resolveRecord = null
    rejectRecord = null
  } catch (err) {
    if (rejectRecord) {
      rejectRecord(err instanceof Error ? err : new Error('Error al procesar audio'))
    }
    rejectRecord = null
  }
}

/**
 * Cleanup all resources: stop tracks, close AudioContext, nullify references.
 */
function cleanup() {
  isRecording = false

  if (recordTimeout) {
    clearTimeout(recordTimeout)
    recordTimeout = null
  }

  // Disconnect and stop ScriptProcessorNode
  if (scriptNode) {
    scriptNode.disconnect()
    scriptNode = null
  }

  // Disconnect source node
  if (sourceNode) {
    sourceNode.disconnect()
    sourceNode = null
  }

  // Stop all media tracks
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }

  // Close AudioContext
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close()
    audioCtx = null
  }
}