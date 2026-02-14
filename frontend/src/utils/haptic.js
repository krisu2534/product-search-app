/**
 * Trigger haptic feedback when supported (Android, some browsers).
 * No-op on iOS Safari (not supported), safe to call everywhere.
 */
export function hapticFeedback() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

let audioCtx = null

/**
 * Play a short tap sound. Works on iPhone and all devices.
 * Uses Web Audio API - no external files needed.
 */
export function playTapSound() {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  try {
    if (audioCtx === null) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      audioCtx = new Ctx()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 600
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.04)
  } catch (_) {}
}
