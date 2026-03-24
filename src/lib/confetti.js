import confetti from 'canvas-confetti'

let confettiCanvas = null
let confettiApi = null

function getConfettiApi() {
  if (typeof window === 'undefined') return null
  if (!window.document?.body) return null

  if (confettiApi) return confettiApi

  confettiCanvas = window.document.createElement('canvas')
  confettiCanvas.setAttribute('aria-hidden', 'true')
  confettiCanvas.style.position = 'fixed'
  confettiCanvas.style.inset = '0'
  confettiCanvas.style.width = '100%'
  confettiCanvas.style.height = '100%'
  confettiCanvas.style.pointerEvents = 'none'
  confettiCanvas.style.zIndex = '9999'

  window.document.body.appendChild(confettiCanvas)

  confettiApi = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true,
  })

  return confettiApi
}

export function fireConfetti(options = {}) {
  const api = getConfettiApi()
  if (!api) return

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  const kind = options.kind || 'confetti'
  if (kind === 'fireworks') {
    fireFireworks(api, { ...options, prefersReducedMotion })
    return
  }

  const colors = options.colors || ['#6b5cff', '#ff5cd1', '#27c36a', '#ffd166', '#25b8ff']
  const origins = options.origins
    || (options.origin
      ? [options.origin]
      : [
          // Center-only, slightly lower so the burst happens around the chest area.
          { x: 0.5, y: 0.52 },
          { x: 0.46, y: 0.52 },
          { x: 0.54, y: 0.52 },
        ])
  const intensity = typeof options.intensity === 'number' ? options.intensity : 1

  const base = {
    colors,
    ticks: 220,
    gravity: 1.1,
    scalar: 1.25,
  }

  // Respect reduced motion by lowering intensity rather than disabling entirely.
  if (prefersReducedMotion) {
    const reducedCount = Math.max(10, Math.round(18 * intensity))
    for (const origin of origins.slice(0, 2)) {
      api({
        ...base,
        origin,
        particleCount: reducedCount,
        spread: 85,
        startVelocity: 24,
      })
    }
    return
  }

  const burstA = {
    ...base,
    particleCount: Math.round(95 * intensity),
    spread: 125,
    startVelocity: 44,
  }

  const burstB = {
    ...base,
    particleCount: Math.round(75 * intensity),
    spread: 165,
    startVelocity: 36,
    decay: 0.92,
  }

  const burstC = {
    ...base,
    particleCount: Math.round(55 * intensity),
    spread: 180,
    startVelocity: 28,
    decay: 0.93,
    gravity: 1.2,
  }

  for (const origin of origins) {
    api({ ...burstA, origin })
  }

  window.setTimeout(() => {
    for (const origin of origins) {
      api({ ...burstB, origin })
    }
  }, 140)

  window.setTimeout(() => {
    for (const origin of origins) {
      api({ ...burstC, origin })
    }
  }, 290)
}

function fireFireworks(api, options) {
  const colors = options.colors || ['#6b5cff', '#ff5cd1', '#27c36a', '#ffd166', '#25b8ff']
  const intensity = typeof options.intensity === 'number' ? options.intensity : 1
  const prefersReducedMotion = !!options.prefersReducedMotion

  const base = {
    colors,
    ticks: 260,
    gravity: 0.9,
    scalar: 1.1,
    shapes: ['circle'],
  }

  // Reduced motion: do one bright, wide burst and stop.
  if (prefersReducedMotion) {
    api({
      ...base,
      origin: { x: 0.5, y: 0.4 },
      particleCount: Math.max(12, Math.round(38 * intensity)),
      spread: 140,
      startVelocity: 34,
    })
    return
  }

  const start = window.performance?.now?.() || Date.now()
  const durationMs = 1000
  const launchEveryMs = 75

  function launch() {
    const now = window.performance?.now?.() || Date.now()
    const t = now - start
    if (t > durationMs) return

    // Center-only fireworks.
    const x = 0.46 + Math.random() * 0.08
    const y = 0.95

    // Upward launch (narrow spread, fast)
    api({
      ...base,
      origin: { x, y },
      particleCount: Math.round(30 * intensity),
      spread: 20,
      startVelocity: 62,
      angle: 90,
      decay: 0.90,
    })

    // Explosion slightly after the launch, nearer the top.
    window.setTimeout(() => {
      api({
        ...base,
        // Explosion height in the upper-middle area.
        origin: { x, y: 0.20 + Math.random() * 0.18 },
        particleCount: Math.round(115 * intensity),
        spread: 360,
        startVelocity: 28,
        decay: 0.92,
      })
    }, 160)

    window.setTimeout(launch, launchEveryMs)
  }

  launch()
}
