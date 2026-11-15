/*
 * Efeitos sonoros sintetizados (Web Audio), sem arquivos de áudio.
 * Inspirado no ch.sh: um "tick" curto no hover e um "click" ao apertar.
 * Começa ligado; a preferência fica salva no navegador.
 */
let ctx: AudioContext | null = null
let enabled = true
try { enabled = localStorage.getItem("sfx") !== "off" } catch { /* sem storage */ }

const listeners = new Set<(on: boolean) => void>()

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType = "sine") {
  if (!enabled) return
  const a = audio()
  if (!a) return
  const t = a.currentTime
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  tick: () => blip(2400, 0.03, 0.025, "triangle"),
  click: () => blip(900, 0.06, 0.06, "triangle"),
  pop: () => { blip(520, 0.09, 0.07); setTimeout(() => blip(780, 0.08, 0.05), 55) },
  whoosh: () => {
    if (!enabled) return
    const a = audio()
    if (!a) return
    const t = a.currentTime, dur = 0.35
    const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    const src = a.createBufferSource(); src.buffer = buf
    const f = a.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8
    f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur)
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(f).connect(g).connect(a.destination); src.start(t)
  },
  get enabled() { return enabled },
  setEnabled(on: boolean) {
    enabled = on
    try { localStorage.setItem("sfx", on ? "on" : "off") } catch { /* sem storage */ }
    listeners.forEach((l) => l(on))
    if (on) blip(1200, 0.07, 0.05, "triangle")
  },
  subscribe(l: (on: boolean) => void) { listeners.add(l); return () => { listeners.delete(l) } },
}

/** Liga os sons a todo link e botão da página (hover = tick, clique = click). */
export function installGlobalSfx() {
  const isTarget = (el: EventTarget | null) =>
    el instanceof Element ? el.closest("a, button, [role=button]") : null
  let last: Element | null = null
  const over = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const t = isTarget(e.target)
    if (t && t !== last) sfx.tick()
    last = t
  }
  const down = (e: PointerEvent) => {
    const t = isTarget(e.target)
    if (t && !(t as HTMLElement).dataset.sfx) sfx.click()
  }
  document.addEventListener("pointerover", over)
  document.addEventListener("pointerdown", down)
  return () => {
    document.removeEventListener("pointerover", over)
    document.removeEventListener("pointerdown", down)
  }
}
