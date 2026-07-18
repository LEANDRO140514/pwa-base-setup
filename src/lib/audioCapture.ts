// ─── Browser microphone audio capture → base64 PCM16 ───────────────────────

/**
 * Records audio from the microphone until the user stops, then returns
 * the audio as a base64-encoded PCM16 string at 24000 Hz sample rate.
 */
export async function recordAudio(): Promise<{ base64: string; durationMs: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // Create AudioContext at 24000 Hz to match xAI expectations
  const audioCtx = new AudioContext({ sampleRate: 24000 })
  const source = audioCtx.createMediaStreamSource(stream)

  // Collect raw float32 samples
  const samples: Float32Array[] = []
  const processor = audioCtx.createScriptProcessor(4096, 1, 1)

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Tiempo de grabación excedido (30s)'))
    }, 30000)

    const cleanup = () => {
      clearTimeout(timeout)
      processor.disconnect()
      source.disconnect()
      stream.getTracks().forEach((t) => t.stop())
      audioCtx.close()
    }

    processor.onaudioprocess = (event) => {
      const channel = event.inputBuffer.getChannelData(0)
      samples.push(new Float32Array(channel))
    }

    source.connect(processor)
    processor.connect(audioCtx.destination)

    // Expose stop function to caller
    const stop = () => {
      cleanup()

      // Concatenate all samples
      let totalLen = 0
      for (const s of samples) totalLen += s.length
      const all = new Float32Array(totalLen)
      let offset = 0
      for (const s of samples) {
        all.set(s, offset)
        offset += s.length
      }

      // Convert Float32 → Int16 PCM
      const pcm16 = new Int16Array(all.length)
      for (let i = 0; i < all.length; i++) {
        const s = Math.max(-1, Math.min(1, all[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // Convert Int16 → base64
      const bytes = new Uint8Array(pcm16.buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      const durationMs = Math.round((all.length / 24000) * 1000)

      resolve({ base64, durationMs })
    }

    // Store stop on the return value so caller can stop early
    ;(recordAudio as unknown as { _stop: () => void })._stop = stop
  })
}

/**
 * Stops an active recording early.
 */
export function stopRecording() {
  const stop = (recordAudio as unknown as { _stop?: () => void })._stop
  if (stop) stop()
}