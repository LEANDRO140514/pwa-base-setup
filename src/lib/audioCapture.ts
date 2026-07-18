// ─── Browser microphone audio capture → base64 PCM16 ───────────────────────
// Uses MediaRecorder to capture audio, then decodes to PCM via AudioContext.
// More reliable than ScriptProcessorNode (deprecated).

let mediaRecorder: MediaRecorder | null = null

/**
 * Records audio from the microphone until the user stops, then returns
 * the audio as a base64-encoded PCM16 string at 24000 Hz sample rate.
 */
export async function recordAudio(): Promise<{ base64: string; durationMs: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 24000,
      echoCancellation: true,
      noiseSuppression: true,
    },
  })

  return new Promise((resolve, reject) => {
    const chunks: Blob[] = []
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    mediaRecorder = new MediaRecorder(stream, { mimeType })

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Tiempo de grabación excedido (30s)'))
    }, 30000)

    const cleanup = () => {
      clearTimeout(timeout)
      if (mediaRecorder?.state !== 'inactive') {
        mediaRecorder?.stop()
      }
      stream.getTracks().forEach((t) => t.stop())
      mediaRecorder = null
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      clearTimeout(timeout)
      cleanup()

      const blob = new Blob(chunks, { type: mimeType })
      const arrayBuffer = await blob.arrayBuffer()

      // Decode WebM/Opus to PCM using AudioContext
      const audioCtx = new AudioContext({ sampleRate: 24000 })
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

      // Get mono channel data
      const channelData = audioBuffer.getChannelData(0)

      // Resample to 24000 Hz if needed
      let pcmData: Float32Array
      if (audioBuffer.sampleRate !== 24000) {
        pcmData = resample(channelData, audioBuffer.sampleRate, 24000)
      } else {
        pcmData = channelData
      }

      // Convert Float32 → Int16 PCM
      const pcm16 = new Int16Array(pcmData.length)
      for (let i = 0; i < pcmData.length; i++) {
        const s = Math.max(-1, Math.min(1, pcmData[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // Convert Int16 → base64
      const bytes = new Uint8Array(pcm16.buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      const durationMs = Math.round((pcmData.length / 24000) * 1000)

      audioCtx.close()
      resolve({ base64, durationMs })
    }

    mediaRecorder.onerror = () => {
      cleanup()
      reject(new Error('Error al grabar audio'))
    }

    // Start recording
    mediaRecorder.start(100) // Collect data every 100ms
  })
}

/**
 * Stops an active recording early.
 */
export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

/**
 * Simple linear resample from one sample rate to another.
 */
function resample(data: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return data
  const ratio = toRate / fromRate
  const newLength = Math.round(data.length * ratio)
  const result = new Float32Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const pos = i / ratio
    const index = Math.floor(pos)
    const frac = pos - index
    if (index >= data.length - 1) {
      result[i] = data[data.length - 1]
    } else {
      result[i] = data[index] * (1 - frac) + data[index + 1] * frac
    }
  }
  return result
}