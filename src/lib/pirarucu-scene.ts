/*
 * Pirarucu nadando num rio visto de cima (WebGL, sem dependências).
 *
 * Como funciona:
 * - A textura é o pirarucu "esticado" (public/assets/pirarucu.webp): a
 *   ilustração curva foi endireitada ao longo da espinha, com a cabeça
 *   para a direita. Aqui ela vira uma malha (tira de triângulos) que segue
 *   uma espinha animada, então o corpo inteiro dobra e ondula.
 * - A cabeça passeia devagar pela água. O corpo segue o rastro da cabeça
 *   (assim ele faz curvas como peixe de verdade) e, por cima, uma onda
 *   percorre o corpo, mais forte na cauda.
 * - As peitorais remam. De tempos em tempos ele sobe para respirar: fica
 *   mais nítido, a sombra se afasta e a cabeça solta uma onda na superfície.
 * - O cursor espanta de leve; clicar faz onda e, perto dele, um susto.
 * - A água é um shader: cor de rio amazônico, luz (caustics) e ondas.
 */

export interface PirarucuOptions {
  /** comprimento do peixe em px de layout (padrão: 60% do menor lado) */
  length?: number
  /** URL da textura esticada */
  texture?: string
  /** desenha a água (false = fundo transparente, só peixe e sombra) */
  water?: boolean
}

type V = { x: number; y: number }

const TEX_W = 1122 // px da textura original (comprimento do peixe)
const TEX_H = 454 // altura da textura (espinha no meio)
const NU = 72 // segmentos ao longo do corpo
const NV = 10 // segmentos na largura
const MAX_RIPPLES = 12

/* ------------------------------------------------------------- shaders */
const RIPPLE_GLSL = `
uniform vec4 ripples[${MAX_RIPPLES}];
uniform float time;
// devolve (deslocamento.xy, anel) para um ponto em px de layout
vec3 rippleField(vec2 p){
  vec2 disp = vec2(0.0); float ring = 0.0;
  for (int k = 0; k < ${MAX_RIPPLES}; k++) {
    vec4 r = ripples[k];
    float age = time - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec2 d = p - r.xy;
    float dist = length(d);
    float x = dist - age * 95.0;
    float env = exp(-x*x/(260.0 + age*260.0)) * exp(-age*1.1) * r.w;
    float wave = sin(x * 0.32) * env;
    disp += (d / (dist + 0.001)) * wave * 3.0;
    ring += wave;
  }
  return vec3(disp, ring);
}
float caustic(vec2 q, float t){
  const float TAU = 6.28318530718;
  vec2 p = mod(q*TAU, TAU) - 250.0;
  vec2 i = p; float c = 1.0; float inten = .005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n+1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0/length(vec2(p.x / (sin(i.x+tt)/inten), p.y / (cos(i.y+tt)/inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}
`

const WATER_VS = `attribute vec2 a; varying vec2 uv; void main(){ uv = a*0.5+0.5; gl_Position = vec4(a,0.,1.); }`
const WATER_FS = `
precision highp float;
varying vec2 uv;
uniform vec2 size; // px de layout
${RIPPLE_GLSL}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i=0;i<5;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vec2(uv.x, 1.0-uv.y) * size;
  vec3 rf = rippleField(p);
  vec2 q = p + rf.xy + vec2(sin(p.y*0.02 + time*0.9), cos(p.x*0.018 + time*0.7)) * 1.6;
  vec2 st = q / size.y;
  // fundo de rio: chá escuro esverdeado, com manchas de lodo e areia
  float n = fbm(st*3.2 + vec2(time*0.004, 0.0));
  float m = fbm(st*9.0 + 7.0);
  vec3 deep = vec3(0.09, 0.10, 0.055);
  vec3 mid  = vec3(0.21, 0.20, 0.10);
  vec3 sand = vec3(0.36, 0.30, 0.15);
  vec3 col = mix(deep, mid, smoothstep(0.3, 0.75, n));
  col = mix(col, sand, smoothstep(0.62, 0.9, m) * 0.35);
  float vign = length((uv - 0.5) * vec2(size.x/size.y, 1.0));
  col *= 1.0 - smoothstep(0.3, 0.9, vign) * 0.5;
  // luz que atravessa a água (fraca: água turva)
  float c = caustic(st * 2.1 + rf.xy*0.004, time * 0.3 + 23.0);
  col += vec3(0.95, 0.85, 0.5) * c * 0.2;
  col += rf.z * 0.06;
  gl_FragColor = vec4(col, 1.0);
}`

const FISH_VS = `
attribute vec4 a; // x, y (px de layout), u, v
uniform vec2 size;
uniform vec2 offset;
varying vec2 uv;
varying vec2 pos;
void main(){
  vec2 p = a.xy + offset;
  pos = p;
  uv = a.zw;
  gl_Position = vec4(p.x/size.x*2.0-1.0, 1.0-p.y/size.y*2.0, 0.0, 1.0);
}`
const FISH_FS = `
precision highp float;
varying vec2 uv;
varying vec2 pos;
uniform sampler2D tex;
uniform float shadow;   // 1 = passada da sombra
uniform float blur;     // raio da sombra em uv
uniform float haze;     // 0 na superfície, 1 no fundo
uniform vec2 size;
${RIPPLE_GLSL}
void main(){
  if (shadow > 0.5) {
    float a = 0.0;
    for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++)
      a += texture2D(tex, uv + vec2(float(i), float(j)*2.6) * blur).a;
    a /= 25.0;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.5); // pré-multiplicado
    return;
  }
  vec4 c = texture2D(tex, uv);
  vec3 rf = rippleField(pos);
  // água por cima do peixe: verde-chá, mais forte quando ele está fundo
  vec3 water = vec3(0.12, 0.13, 0.07) * c.a;
  vec3 col = mix(c.rgb, water, 0.04 + haze * 0.18);
  float l = caustic(pos / size.y * 2.1 + rf.xy*0.004, time * 0.3 + 23.0);
  col += vec3(0.95, 0.85, 0.5) * l * 0.2 * c.a * (1.0 - haze*0.5);
  col += rf.z * 0.05 * c.a;
  gl_FragColor = vec4(col, c.a);
}`

/* ------------------------------------------------------------- helpers */
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
function angleDiff(from: number, to: number) {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader")
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link")
  const u = (name: string) => gl.getUniformLocation(p, name)
  return { p, u, a: gl.getAttribLocation(p, "a") }
}

/* --------------------------------------------------------------- peixe */
class Fish {
  head: V
  angle: number
  speed: number
  base: number
  turn = 0
  phase = 0
  finPhase = 0
  trail: V[] = []
  startle = 0
  /** 1 = fundo, 0 = encostado na superfície */
  depth = 1
  nextBreath: number
  breathT = -1
  breathed = false

  len: number

  constructor(len: number, x: number, y: number, angle: number, now: number) {
    this.len = len
    this.head = { x, y }
    this.angle = angle
    this.base = len * 0.13
    this.speed = this.base
    this.nextBreath = now + 6 + Math.random() * 4
    for (let d = 0; d <= len + 40; d += 2)
      this.trail.push({ x: x - Math.cos(angle) * d, y: y - Math.sin(angle) * d })
  }

  update(dt: number, t: number, W: number, H: number, pointer: V | null, emit: (p: V, s: number, delay?: number) => void) {
    const L = this.len
    // passeio: nada até um ponto no miolo da água, depois escolhe outro
    const goalDist = Math.hypot(this.goal.x * W - this.head.x, this.goal.y * H - this.head.y)
    if (goalDist < L * 0.35 || t > this.goalUntil) this.pickGoal(t)
    const toGoal = Math.atan2(this.goal.y * H - this.head.y, this.goal.x * W - this.head.x)
    const wander = Math.sin(t * 0.37) * 0.12
    this.turn += (angleDiff(this.angle, toGoal) * 0.45 + wander - this.turn) * dt * 1.2
    let steer = this.turn
    // borda: só por segurança, se ele encostar demais
    const mx = Math.min(W, H) * 0.12
    const edge = Math.max(smooth(W - mx, W, this.head.x) + smooth(mx, 0, this.head.x), smooth(H - mx, H, this.head.y) + smooth(mx, 0, this.head.y))
    if (edge > 0) {
      const toC = Math.atan2(H / 2 - this.head.y, W / 2 - this.head.x)
      steer += angleDiff(this.angle, toC) * edge
    }
    let target = this.base
    // cursor: desvia sem pressa
    if (pointer) {
      const dx = this.head.x - pointer.x, dy = this.head.y - pointer.y
      const d = Math.hypot(dx, dy)
      const r = L * 0.6
      if (d < r) {
        const k = 1 - d / r
        steer += angleDiff(this.angle, Math.atan2(dy, dx)) * k * 1.2
        target *= 1 + k * 0.8
      }
    }
    // susto
    if (this.startle > 0) {
      this.startle = Math.max(0, this.startle - dt)
      target *= 1 + this.startle * 2.2
    }
    // respiração: sobe, encosta na superfície, desce
    if (this.breathT < 0 && t > this.nextBreath) { this.breathT = 0; this.breathed = false }
    if (this.breathT >= 0) {
      this.breathT += dt
      const T = 4.2
      const x = this.breathT / T
      this.depth = 1 - Math.sin(Math.PI * clamp(x, 0, 1)) ** 1.5
      target *= 0.65
      if (!this.breathed && x > 0.5) {
        this.breathed = true
        emit(this.head, 1.4)
        emit({ x: this.head.x + Math.cos(this.angle) * 6, y: this.head.y + Math.sin(this.angle) * 6 }, 0.6, 0.35)
        emit({ x: this.head.x - Math.cos(this.angle) * 14, y: this.head.y - Math.sin(this.angle) * 14 }, 0.45, 0.8)
      }
      if (x >= 1) { this.breathT = -1; this.depth = 1; this.nextBreath = t + 14 + Math.random() * 8 }
    }

    this.speed += (target - this.speed) * dt * 1.6
    // curva larga: o corpo é grande e não dobra no meio
    const maxTurn = this.startle > 0 ? 1.1 : 0.42
    this.angle += clamp(steer, -maxTurn, maxTurn) * dt
    this.head.x += Math.cos(this.angle) * this.speed * dt
    this.head.y += Math.sin(this.angle) * this.speed * dt
    // nado: a frequência acompanha a velocidade
    this.phase += dt * (1.6 + (this.speed / this.base) * 1.9)
    this.finPhase += dt * (2.2 + (this.speed / this.base) * 0.8)

    // rastro da cabeça
    const last = this.trail[0]
    if (Math.hypot(this.head.x - last.x, this.head.y - last.y) >= 2) {
      this.trail.unshift({ x: this.head.x, y: this.head.y })
      if (this.trail.length > (L + 60) / 2) this.trail.pop()
    } else {
      this.trail[0] = { x: this.head.x, y: this.head.y }
    }
  }

  goal: V = { x: 0.5, y: 0.5 }
  goalUntil = 0
  pickGoal(t: number) {
    // alterna lados para ele atravessar a água em vez de rodar no lugar
    const side = this.goal.x < 0.5 ? 1 : -1
    this.goal = { x: 0.5 + side * (0.12 + Math.random() * 0.16), y: 0.25 + Math.random() * 0.5 }
    this.goalUntil = t + 12
  }

  startleFrom(p: V) {
    this.startle = 1.2
    this.angle += angleDiff(this.angle, Math.atan2(this.head.y - p.y, this.head.x - p.x)) * 0.5
  }

  /** ponto do rastro a uma distância d da cabeça */
  private along(d: number): V {
    const tr = this.trail
    let acc = 0
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1], b = tr[i]
      const seg = Math.hypot(b.x - a.x, b.y - a.y)
      if (acc + seg >= d) {
        const f = seg ? (d - acc) / seg : 0
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
      }
      acc += seg
    }
    const a = tr[tr.length - 2], b = tr[tr.length - 1]
    const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1
    return { x: b.x + (dx / n) * (d - acc), y: b.y + (dy / n) * (d - acc) }
  }

  /** escreve a malha (x, y, u, v por vértice) */
  mesh(out: Float32Array, scale: number) {
    const L = this.len * scale
    const k = L / TEX_W // px de layout por px de textura
    const amp = L * 0.06
    const lambda = L * 1.05
    // espinha: rastro + onda lateral
    const C: V[] = []
    for (let i = 0; i <= NU; i++) {
      const s = (i / NU) * L // da cabeça para a cauda
      const p = this.along(s / scale)
      const q = this.along(s / scale + 3)
      const tx = p.x - q.x, ty = p.y - q.y, tn = Math.hypot(tx, ty) || 1
      const sn = s / L
      const lat = amp * (0.07 + 0.93 * sn ** 2.2) * Math.sin((2 * Math.PI * s) / lambda - this.phase)
      C.push({ x: p.x + (-ty / tn) * lat, y: p.y + (tx / tn) * lat })
    }
    let o = 0
    for (let i = 0; i <= NU; i++) {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(NU, i + 1)]
      let tx = a.x - b.x, ty = a.y - b.y
      const tn = Math.hypot(tx, ty) || 1
      tx /= tn; ty /= tn // tangente apontando para a cabeça
      const nx = -ty, ny = tx
      const u = 1 - i / NU
      const texX = u * TEX_W
      // peitorais: zona ~730–870 px da textura
      const pec = smooth(720, 760, texX) * (1 - smooth(830, 880, texX))
      for (let j = 0; j <= NV; j++) {
        const v = j / NV
        const vpx = (v - 0.5) * TEX_H
        let x = C[i].x + nx * vpx * k
        let y = C[i].y + ny * vpx * k
        if (pec > 0) {
          const f = smooth(80, 190, Math.abs(vpx)) * pec
          const side = vpx > 0 ? 0 : 1.9
          const flap = Math.sin(this.finPhase + side) * 26 * k * f
          x += tx * flap
          y += ty * flap
        }
        out[o++] = x; out[o++] = y; out[o++] = u; out[o++] = v
      }
    }
  }
}

/* --------------------------------------------------------------- cena */
export function createPirarucuScene(canvas: HTMLCanvasElement, opts: PirarucuOptions = {}) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true })
  if (!gl) return null
  const drawWater = opts.water !== false
  const water = drawWater ? compile(gl, WATER_VS, WATER_FS) : null
  const fishP = compile(gl, FISH_VS, FISH_FS)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const verts = new Float32Array((NU + 1) * (NV + 1) * 4)
  const vbuf = gl.createBuffer()
  const idx: number[] = []
  for (let i = 0; i < NU; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j, b = a + NV + 1
      idx.push(a, b, a + 1, a + 1, b, b + 1)
    }
  const ibuf = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW)

  const tex = gl.createTexture()
  let texReady = false
  let texSize = 0

  const ripples = new Float32Array(MAX_RIPPLES * 4)
  let rIdx = 0
  const t0 = performance.now()
  const now = () => (performance.now() - t0) / 1000
  const emit = (p: V, s: number, delay = 0) => {
    ripples.set([p.x, p.y, now() + delay, s], rIdx * 4)
    rIdx = (rIdx + 1) % MAX_RIPPLES
  }

  let W = 2, H = 2, dpr = 1
  let fish: Fish | null = null
  let pointer: V | null = null
  let lastMoveRipple = 0
  let raf = 0
  let running = false
  let last = 0

  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = opts.texture ?? "assets/pirarucu.webp"

  /* textura reduzida para o tamanho de tela: evita o cintilar das escamas */
  function uploadTexture() {
    if (!img.complete || !img.naturalWidth || !fish) return
    const want = clamp(Math.ceil(fish.len * dpr * 1.15), 128, img.naturalWidth)
    if (want === texSize) return
    texSize = want
    const c = document.createElement("canvas")
    c.width = want
    c.height = Math.round((want * img.naturalHeight) / img.naturalWidth)
    const g = c.getContext("2d")!
    g.imageSmoothingQuality = "high"
    g.drawImage(img, 0, 0, c.width, c.height)
    gl!.bindTexture(gl!.TEXTURE_2D, tex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, c)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    texReady = true
  }
  img.onload = () => { uploadTexture(); if (!running) frame(performance.now()) }

  function resize() {
    W = Math.max(2, canvas.clientWidth)
    H = Math.max(2, canvas.clientHeight)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const len = opts.length ?? Math.min(W, H) * 0.6
    if (!fish) fish = new Fish(len, W * 0.32, H * 0.58, Math.PI * 1.08, now())
    else fish.len = len
    uploadTexture()
  }

  function draw(t: number) {
    gl!.viewport(0, 0, canvas.width, canvas.height)
    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    if (water) {
      gl!.useProgram(water.p)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
      gl!.enableVertexAttribArray(water.a)
      gl!.vertexAttribPointer(water.a, 2, gl!.FLOAT, false, 0, 0)
      gl!.uniform2f(water.u("size"), W, H)
      gl!.uniform1f(water.u("time"), t)
      gl!.uniform4fv(water.u("ripples"), ripples)
      gl!.disable(gl!.BLEND)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }
    if (!fish || !texReady) return
    const lift = 1 - fish.depth // 0 fundo, 1 superfície
    fish.mesh(verts, 1 + lift * 0.06)
    gl!.useProgram(fishP.p)
    gl!.bindBuffer(gl!.ARRAY_BUFFER, vbuf)
    gl!.bufferData(gl!.ARRAY_BUFFER, verts, gl!.DYNAMIC_DRAW)
    gl!.enableVertexAttribArray(fishP.a)
    gl!.vertexAttribPointer(fishP.a, 4, gl!.FLOAT, false, 0, 0)
    gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, ibuf)
    gl!.activeTexture(gl!.TEXTURE0)
    gl!.bindTexture(gl!.TEXTURE_2D, tex)
    gl!.uniform1i(fishP.u("tex"), 0)
    gl!.uniform2f(fishP.u("size"), W, H)
    gl!.uniform1f(fishP.u("time"), t)
    gl!.uniform4fv(fishP.u("ripples"), ripples)
    gl!.uniform1f(fishP.u("haze"), fish.depth)
    gl!.enable(gl!.BLEND)
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA)
    // sombra no fundo do rio: mais longe e mais borrada quando ele sobe
    const off = fish.len * (0.05 + lift * 0.07)
    gl!.uniform2f(fishP.u("offset"), off * 0.6, off)
    gl!.uniform1f(fishP.u("shadow"), 1)
    gl!.uniform1f(fishP.u("blur"), 0.004 + lift * 0.004)
    gl!.drawElements(gl!.TRIANGLES, idx.length, gl!.UNSIGNED_SHORT, 0)
    // peixe
    gl!.uniform2f(fishP.u("offset"), 0, 0)
    gl!.uniform1f(fishP.u("shadow"), 0)
    gl!.drawElements(gl!.TRIANGLES, idx.length, gl!.UNSIGNED_SHORT, 0)
  }

  function frame(ms: number) {
    const t = now()
    const dt = Math.min(0.05, last ? (ms - last) / 1000 : 0.016)
    last = ms
    fish?.update(dt, t, W, H, pointer, emit)
    draw(t)
    if (running) raf = requestAnimationFrame(frame)
  }

  /* entrada */
  const toLocal = (e: PointerEvent): V => {
    const r = canvas.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }
  const onMove = (e: PointerEvent) => {
    pointer = toLocal(e)
    const t = now()
    if (t - lastMoveRipple > 0.12) { emit(pointer, 0.35); lastMoveRipple = t }
  }
  const onLeave = () => { pointer = null }
  const onDown = (e: PointerEvent) => {
    const p = toLocal(e)
    emit(p, 1.1)
    if (fish && Math.hypot(fish.head.x - p.x, fish.head.y - p.y) < fish.len * 0.7) fish.startleFrom(p)
  }
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerleave", onLeave)
  canvas.addEventListener("pointerdown", onDown)

  const ro = new ResizeObserver(() => { resize(); if (!running) draw(now()) })
  ro.observe(canvas)
  resize()

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
  const start = () => { if (running || reduce.matches) return; running = true; last = 0; raf = requestAnimationFrame(frame) }
  const stop = () => { running = false; cancelAnimationFrame(raf) }
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
  io.observe(canvas)
  if (reduce.matches) draw(now())

  return {
    destroy() {
      stop()
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("pointerdown", onDown)
    },
  }
}
