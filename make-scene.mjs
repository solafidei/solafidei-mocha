// Draws the sketchbook backdrop and writes hooks/scene.js. Rerun after a change:
//   node make-scene.mjs
// Five dry tools on toned paper: soft pastel, charcoal, graphite pencil, white chalk, sanguine conte.
// Every mark is a jittered stroke; the filters wobble it and break it up on the paper's tooth.
import { writeFileSync } from 'node:fs'

let seed = 11
const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const R = (a, b) => a + r() * (b - a)
const f = n => String(Math.round(n * 10) / 10)
const W = 1600
const H = 900

// One hand stroke: a slightly bowed line.
const mark = (x1, y1, x2, y2, bow = 4) =>
  `M${f(x1)} ${f(y1)}Q${f((x1 + x2) / 2 + R(-bow, bow))} ${f((y1 + y2) / 2 + R(-bow, bow))} ${f(x2)} ${f(y2)}`
const path = (cls, width, opacity, d) =>
  `<path class="${cls}" stroke-width="${width}" opacity="${opacity}" d="${d.join('')}"/>`
// A line restated by hand: the same points, drawn again a little off.
const contour = (fn, x0, x1, step, jit) => {
  let d = ''
  for (let x = x0; x <= x1; x += step) {
    d += `${x === x0 ? 'M' : 'L'}${f(x + R(-jit, jit))} ${f(fn(x) + R(-jit, jit))}`
  }
  return d
}

const ridge = x =>
  650 + 40 * Math.sin(x / 260 + 1) - 120 * Math.exp(-(((x - 180) / 330) ** 2)) - 140 * Math.exp(-(((x - 1460) / 300) ** 2))
const ground = x => 800 - 60 * ((x - 800) / 800) ** 2 + 12 * Math.sin(x / 90)

// Hatching between two curves, all leaning one way.
const hatch = (top, bottom, n, dx, dy, bow) => {
  const d = []
  for (let i = 0; i < n; i++) {
    const x = R(-40, W + 40)
    const y = R(top(x) + 4, Math.max(top(x) + 8, bottom(x)))
    const k = R(0.6, 1.3)
    d.push(mark(x, y, x + dx * k + R(-14, 14), y + dy * k + R(-11, 11), bow))
  }
  return d
}
const below = () => H + 40

const out = []

// Sky: the side of a pastel stick dragged across the top.
const sky = []
for (let i = 0; i < 46; i++) {
  const x = R(-100, W - 200)
  const y = R(10, 330) * R(0.4, 1)
  sky.push(mark(x, y, x + R(260, 620), y + R(-14, 14), 10))
}
out.push(path('p1', 26, 0.2, sky.slice(0, 24)), path('p1', 14, 0.28, sky.slice(24)))

// Cloud bands, left and right of the middle: pastel under, chalk over.
const cloud = (cx, cy, w, n) => {
  const d = []
  for (let i = 0; i < n; i++) {
    const x = cx + R(-w, w) * R(0.3, 1)
    const y = cy + R(-26, 26)
    d.push(mark(x - R(30, 90), y, x + R(30, 90), y + R(-5, 5), 6))
  }
  return d
}
for (const [cx, cy, w] of [[330, 150, 250], [1010, 95, 200], [640, 250, 130]]) {
  out.push(path('p4', 12, 0.3, cloud(cx, cy + 12, w, 16)), path('w cl', 9, 0.7, cloud(cx, cy, w * 0.8, 18)))
}

// Sun by day: ochre scumble, sanguine ring drawn twice, pencil rays.
const SX = 1300
const SY = 200
const ring = (rad, jit) => {
  let d = ''
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * Math.PI * 2 + 0.3
    d += `${i ? 'L' : 'M'}${f(SX + Math.cos(a) * (rad + R(-jit, jit)))} ${f(SY + Math.sin(a) * (rad + R(-jit, jit)))}`
  }
  return d
}
const disc = (rad, n, len) => {
  const d = []
  for (let i = 0; i < n; i++) {
    const a = R(0, 6.28)
    const q = Math.sqrt(r()) * rad
    const x = SX + Math.cos(a) * q
    const y = SY + Math.sin(a) * q
    d.push(mark(x - len, y + len * 0.7, x + len, y - len * 0.7, 3))
  }
  return d
}
const rays = []
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * 6.28 + R(-0.08, 0.08)
  const a0 = R(92, 104)
  const a1 = a0 + R(18, 46)
  rays.push(mark(SX + Math.cos(a) * a0, SY + Math.sin(a) * a0, SX + Math.cos(a) * a1, SY + Math.sin(a) * a1, 2))
}
out.push(
  path('p2 day', 16, 0.3, disc(120, 26, 22)),
  path('p2 day', 9, 0.75, disc(66, 70, 13)),
  path('w day', 6, 0.8, disc(34, 14, 9)),
  path('s day', 3.2, 0.8, [ring(74, 3)]),
  path('s day', 1.6, 0.6, [ring(77, 4)]),
  path('g day', 1.5, 0.65, rays),
)

// Moon by night: a chalk crescent, a pale halo, chalk stars.
const crescent = []
for (let i = 0; i < 400 && crescent.length < 150; i++) {
  const x = SX + R(-66, 66)
  const y = SY + R(-66, 66)
  const inMoon = (x - SX) ** 2 + (y - SY) ** 2 < 64 ** 2
  const inBite = (x - SX - 34) ** 2 + (y - SY + 14) ** 2 < 58 ** 2
  if (inMoon && !inBite) {
    crescent.push(mark(x - 7, y + 6, x + 7, y - 6, 2))
  }
}
const stars = []
const dots = []
for (let i = 0; i < 70; i++) {
  const x = R(20, W - 20)
  const y = R(15, 520) * R(0.3, 1)
  if ((x - SX) ** 2 + (y - SY) ** 2 < 150 ** 2) {
    continue
  }
  if (i % 5 === 0) {
    const k = R(5, 9)
    stars.push(mark(x - k, y, x + k, y + R(-1, 1), 1), mark(x, y - k, x + R(-1, 1), y + k, 1))
  } else {
    dots.push(mark(x, y, x + R(1, 3), y + R(-1, 2), 1))
  }
}
out.push(
  path('p2 night', 18, 0.16, disc(150, 30, 26)),
  path('w night', 5.5, 0.9, crescent),
  path('w night', 1.6, 0.85, stars),
  path('w night', 3.4, 0.8, dots),
)

// Birds by day, in pencil.
const birds = []
for (const [x, y, k] of [[420, 330, 13], [470, 300, 9], [520, 345, 11], [1090, 270, 10], [1140, 250, 7]]) {
  birds.push(mark(x - k, y - k * 0.5, x, y, 3), mark(x, y, x + k, y - k * 0.6, 3))
}
out.push(path('g day', 1.8, 0.8, birds))

// Far hills: sage pastel hatching one way, ochre across it, a blue shadow low down.
out.push(
  path('p3', 9, 0.5, hatch(ridge, ground, 230, -52, 40, 5)),
  path('p2', 6, 0.3, hatch(ridge, ground, 90, 46, 30, 5)),
  path('p1', 11, 0.3, hatch(x => ridge(x) + 60, ground, 80, -70, 26, 6)),
)
// Ridge line, restated three times in pencil.
out.push(
  path('g', 1.7, 0.75, [contour(ridge, -20, W + 20, 38, 2.5)]),
  path('g', 1.1, 0.55, [contour(x => ridge(x) + 3, -20, W + 20, 52, 4)]),
  path('g', 0.9, 0.4, [contour(x => ridge(x) - 4, 60, W - 80, 64, 5)]),
)

// Trees on the two shoulders: sage under, charcoal scribble over, a pencil trunk.
const tree = (x, size) => {
  const base = ridge(x) + 4
  const cy = base - size * 1.25
  const scribble = (rx, ry, n) => {
    let d = `M${f(x + R(-rx, rx))} ${f(cy + R(-ry, ry))}`
    for (let i = 0; i < n; i++) {
      d += `Q${f(x + R(-rx, rx))} ${f(cy + R(-ry, ry))} ${f(x + R(-rx, rx) * 0.8)} ${f(cy + R(-ry, ry) * 0.8)}`
    }
    return d
  }
  return [
    path('p3', 8, 0.6, [scribble(size * 0.62, size * 0.8, 9)]),
    path('c', 3.2, 0.8, [scribble(size * 0.5, size * 0.7, 16)]),
    path('c', 1.4, 0.7, [scribble(size * 0.6, size * 0.78, 10)]),
    path('g', 2.2, 0.85, [mark(x + R(-2, 2), base, x + R(-3, 3), cy + size * 0.2, 3), mark(x + 3, base, x + R(0, 5), cy + size * 0.35, 3)]),
  ]
}
for (const [x, size] of [[70, 64], [150, 92], [236, 58], [318, 40], [1338, 46], [1420, 84], [1500, 104], [1570, 60]]) {
  out.push(...tree(x, size))
}

// Foreground: charcoal laid on its side, cross-hatched, with sanguine grasses.
out.push(
  path('c', 15, 0.38, hatch(ground, below, 120, -120, 52, 9)),
  path('c', 3, 0.55, hatch(x => ground(x) + 14, below, 190, 84, 46, 7)),
  path('p1', 10, 0.3, hatch(ground, below, 50, -80, 22, 6)),
  path('c', 2.4, 0.85, [contour(ground, -20, W + 20, 34, 3)]),
  path('g', 1.2, 0.6, [contour(x => ground(x) - 4, -20, W + 20, 46, 4)]),
)
const grass = []
for (let i = 0; i < 90; i++) {
  const x = R(0, W) < 800 ? R(-10, 520) : R(1080, W + 10)
  const y = ground(x) + R(-2, 10)
  grass.push(mark(x, y, x + R(-10, 14), y - R(14, 44), 5))
}
out.push(path('s', 1.8, 0.8, grass.slice(0, 50)), path('p2', 2.6, 0.7, grass.slice(50)))

// each tool's marks, in the order they were drawn ('<path class="' is 13 characters)
const by = tool => out.filter(p => tool.test(p.slice(13))).join('')

const box =`x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"`
// wobble the stroke, then keep it only where the paper's tooth would catch it
const tool = (id, wobble, scale, grain, gain, bias, blur = 0) => `<filter id="${id}" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="${wobble}" numOctaves="2" seed="4" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
${blur ? `<feGaussianBlur in="d" stdDeviation="${blur}" result="d"/>` : ''}
<feTurbulence type="fractalNoise" baseFrequency="${grain}" numOctaves="2" seed="9" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${gain} 0 0 0 ${bias}" result="t"/>
<feComposite in="d" in2="t" operator="in"/>
</filter>`
const speck = (id, v, freq, gain, bias) => `<filter id="${id}" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="2"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${v} 0 0 0 0 ${v} 0 0 0 0 ${v} ${gain} 0 0 0 ${bias}"/>
</filter>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
svg{--paper:#e8dfcc;--g:#4a4a50;--c:#2b2a2c;--p1:#7fa3ba;--p2:#d9a441;--p3:#86a070;--p4:#d79a90;--w:#fffdf6;--s:#b5533c}
.night,.grain-night{display:none}
@media (prefers-color-scheme: dark){
svg{--paper:#15171f;--g:#8d95aa;--c:#07080b;--p1:#3d5a8a;--p2:#e8d38a;--p3:#4f7a6e;--p4:#7a5c9a;--w:#f4f1e6;--s:#c46a4a}
.day,.grain-day{display:none}
.night,.grain-night{display:inline}
.cl{opacity:.22}
}
path{fill:none;stroke-linecap:round;stroke-linejoin:round}
.g{stroke:var(--g)}.c{stroke:var(--c)}.p1{stroke:var(--p1)}.p2{stroke:var(--p2)}.p3{stroke:var(--p3)}.p4{stroke:var(--p4)}.w{stroke:var(--w)}.s{stroke:var(--s)}
</style>
<defs>
${tool('pastel', 0.011, 12, 0.7, 2.7, -0.82)}
${tool('charcoal', 0.014, 9, 0.85, 2.4, -0.62, 0.5)}
${tool('pencil', 0.02, 5, 1.1, 2.2, -0.42)}
${speck('fibre-dark', 0.25, '0.9 0.6', 0.55, -0.2)}
${speck('fibre-light', 0.95, '0.9 0.6', 0.4, -0.14)}
${speck('blotch-dark', 0.3, 0.006, 0.3, -0.12)}
${speck('blotch-light', 0.7, 0.006, 0.16, -0.06)}
</defs>
<rect width="${W}" height="${H}" fill="var(--paper)"/>
<rect class="grain-day" width="${W}" height="${H}" filter="url(#blotch-dark)"/>
<rect class="grain-night" width="${W}" height="${H}" filter="url(#blotch-light)"/>
<g filter="url(#pastel)">${by(/^(p\d|w)\b/)}</g>
<g filter="url(#charcoal)">${by(/^c\b/)}</g>
<g filter="url(#pencil)">${by(/^[gs]\b/)}</g>
<rect class="grain-day" width="${W}" height="${H}" filter="url(#fibre-dark)"/>
<rect class="grain-night" width="${W}" height="${H}" filter="url(#fibre-light)"/>
</svg>`

if (svg.includes('`') || svg.includes('\\') || svg.length > 131072) {
  throw new Error(`scene refused: ${svg.length} characters, or a backtick or backslash in it`)
}
writeFileSync(new URL('./hooks/scene.js', import.meta.url), `// Generated by make-scene.mjs. Don't edit it.\nexport const SCENE = \`${svg}\`\n`)
writeFileSync(new URL('./hooks/scene.d.ts', import.meta.url), 'export const SCENE: string\n')
console.log(`scene.js written, ${svg.length} characters`)
