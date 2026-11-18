// Cuts the woodblock-print backdrop and writes hooks/print.js. Rerun after a change:
//   node make-print.mjs
// A bay with a pine headland and a lone peak: a red sun by day, a full moon by night.
// Flat colour blocks under a dark key line, graded skies, and wood grain and paper fibre on top.
import { writeFileSync } from 'node:fs'

let seed = 31
const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const R = (a, b) => a + r() * (b - a)
const f = n => String(Math.round(n))
const W = 1600
const H = 900
const SEA = 560
const DISC = [1085, 425, 128]
const PEAK = [1300, 235]

// A rounded shape through jittered points on an ellipse.
const blob = (cx, cy, rx, ry, n = 9, jit = 0.2) => {
  const p = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 6.283
    const k = 1 + R(-jit, jit)
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  const mid = (a, b) => `${f((a[0] + b[0]) / 2)} ${f((a[1] + b[1]) / 2)}`
  return `M${mid(p[n - 1], p[0])}${p.map((q, i) => `Q${f(q[0])} ${f(q[1])} ${mid(q, p[(i + 1) % n])}`).join('')}Z`
}
const under = (fn, x0, x1, floor, step = 14) => {
  let d = `M${x0} ${floor}`
  for (let x = x0; x <= x1; x += step) {
    d += `L${x} ${f(fn(x))}`
  }
  return `${d}L${x1} ${floor}Z`
}
const poly = pts => `M${pts.map(([x, y]) => `${f(x + R(-4, 4))} ${f(y + R(-4, 4))}`).join('L')}Z`
const shape = (cls, d, extra = '') => `<path class="f-${cls} o" d="${d}"${extra}/>`

const out = []

// Stars for the night block.
const stars = Array.from({ length: 46 }, () => `<circle cx="${f(R(20, W - 20))}" cy="${f(R(15, 400) * R(0.3, 1))}" r="${R(1.2, 2.6).toFixed(1)}"/>`)
out.push(`<g class="f-sn night">${stars.join('')}</g>`)

// The disc: sun or moon, by the palette.
out.push(`<circle class="f-su o" cx="${DISC[0]}" cy="${DISC[1]}" r="${DISC[2]}"/>`)

// The lone peak, graded to mist at its foot, with a notched snow cap.
const peak = x => {
  const dx = Math.abs(x - PEAK[0])
  return dx > 470 ? SEA : Math.max(PEAK[1], SEA - (SEA - PEAK[1] + 14) * (1 - dx / 470) ** 1.75)
}
out.push(`<path class="o" fill="url(#peak)" d="${under(peak, 820, 1780, SEA + 4, 10)}"/>`)
{
  let d = ''
  const notches = [[-118, 108], [-84, 84], [-58, 124], [-28, 96], [2, 132], [30, 92], [62, 126], [90, 86], [120, 108]]
  for (let x = PEAK[0] - 120; x <= PEAK[0] + 120; x += 8) {
    d += `${d ? 'L' : 'M'}${x} ${f(peak(x))}`
  }
  out.push(shape('sn', `${d}${notches.reverse().map(([dx, dy]) => `L${PEAK[0] + dx} ${PEAK[1] + dy}`).join('')}Z`))
}

// Mist bands, the stepped bars of a print.
const band = (x, y, w, h) =>
  `<rect class="f-mi o" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect class="f-mi o" x="${x + w * 0.24}" y="${y + h * 0.72}" width="${w * 0.6}" height="${h * 0.8}" rx="${h * 0.4}"/><rect class="f-mi" x="${x + w * 0.25}" y="${y + h * 0.4}" width="${w * 0.58}" height="${h * 0.7}"/>`
out.push(band(880, 468, 640, 26), band(170, 168, 520, 24), band(560, 262, 360, 18), band(1270, 120, 300, 20))

// Far shore, two blocks.
const hill1 = x => SEA - 78 * Math.exp(-(((x - 250) / 250) ** 2)) - 44 * Math.exp(-(((x - 640) / 170) ** 2)) - 26 * Math.exp(-(((x - 1560) / 150) ** 2))
const hill2 = x => SEA - 46 * Math.exp(-(((x - 70) / 210) ** 2)) - 24 * Math.exp(-(((x - 470) / 130) ** 2)) - 14 * Math.exp(-(((x - 1450) / 120) ** 2))
out.push(shape('h1', under(hill1, -20, W + 20, SEA + 4)), shape('h2', under(hill2, -20, W + 20, SEA + 4)))

// The sea, its wave lines, and the disc's path across it.
out.push(`<rect class="o" fill="url(#sea)" x="-10" y="${SEA}" width="${W + 20}" height="${H - SEA + 10}"/>`)
{
  let waves = ''
  let path = ''
  for (let y = SEA + 14, gap = 10; y < H; y += gap, gap *= 1.13) {
    for (let x = R(-80, 40); x < W; ) {
      const len = R(60, 240) * (0.6 + (y - SEA) / 300)
      const amp = 2 + (y - SEA) / 60
      waves += `M${f(x)} ${f(y)}q${f(len / 4)} ${f(-amp)} ${f(len / 2)} 0t${f(len / 2)} 0`
      x += len + R(30, 160)
    }
    const reach = 26 + (y - SEA) * 0.34
    if (y < SEA + 230) {
      path += `M${f(DISC[0] - reach * R(0.5, 1))} ${f(y - 3)}h${f(reach * R(1, 1.9))}`
    }
  }
  out.push(`<path class="s-wv" stroke-width="2" d="${waves}"/>`, `<path class="s-su" stroke-width="5" opacity=".85" d="${path}"/>`)
}

// Sails on the bay; at night each carries a lantern.
for (const [x, s] of [[742, 1], [828, 0.7], [1004, 0.55]]) {
  const y = SEA + 8 * s
  out.push(
    shape('sl', `M${x} ${f(y - 4)}L${f(x + 4 * s)} ${f(y - 46 * s)}L${f(x + 30 * s)} ${f(y - 40 * s)}L${f(x + 27 * s)} ${f(y - 4)}Z`),
    shape('rk', `M${f(x - 14 * s)} ${f(y - 3)}L${f(x + 40 * s)} ${f(y - 3)}L${f(x + 32 * s)} ${f(y + 6 * s)}L${f(x - 6 * s)} ${f(y + 6 * s)}Z`),
    `<g class="night"><circle class="f-la" filter="url(#soft)" cx="${f(x + 14 * s)}" cy="${f(y - 8)}" r="${f(16 * s)}" opacity=".7"/><circle class="f-la" cx="${f(x + 14 * s)}" cy="${f(y - 8)}" r="${(3 * s).toFixed(1)}"/></g>`,
  )
}

// Birds crossing by day.
{
  let d = ''
  for (const [x, y, k] of [[596, 330, 12], [634, 312, 10], [668, 326, 9], [708, 304, 8], [738, 316, 7]]) {
    d += `M${x - k} ${y - 3}q${f(k / 2)} ${-k / 2} ${k} 2q${f(k / 2)} ${-k / 2 - 2} ${k} ${-3}`
  }
  out.push(`<path class="s-ol day" stroke-width="2.4" d="${d}"/>`)
}

// The headland on the left, a rock on the right.
out.push(
  shape('rk', poly([[-30, 910], [-30, 604], [66, 588], [150, 600], [214, 642], [292, 660], [332, 722], [424, 760], [470, 832], [530, 910]])),
  // the lit top plane, then cracks cut with the key line
  shape('rl', poly([[-30, 606], [66, 590], [150, 602], [214, 644], [290, 662], [246, 680], [150, 642], [60, 630], [-30, 644]])),
  '<path class="s-ol" stroke-width="2.4" d="M40 660L112 700L98 770M196 676L262 748L360 796M84 806L196 838L250 900M330 730L318 800"/>',
  shape('rk', poly([[1322, 910], [1378, 822], [1452, 790], [1530, 802], [1606, 756], [1640, 910]])),
  shape('rl', poly([[1378, 824], [1452, 792], [1530, 804], [1604, 758], [1600, 786], [1528, 826], [1456, 814], [1396, 842]])),
  '<path class="s-ol" stroke-width="2.4" d="M1420 860L1476 838L1540 852M1500 880L1560 836"/>',
)

// The pine: a leaning trunk, two boughs, and pads of needles, dark below and lit above.
const trunk = 'M150 618C168 524 262 506 246 404S330 300 428 286'
const boughs = 'M242 432C200 400 160 380 118 362M300 334C340 356 372 372 400 392M352 302C330 262 322 240 326 222'
out.push(
  `<path class="s-ol" stroke-width="27" d="${trunk}"/><path class="s-tr" stroke-width="18" d="${trunk}"/>`,
  `<path class="s-ol" stroke-width="13" d="${boughs}"/><path class="s-tr" stroke-width="7" d="${boughs}"/>`,
)
for (const [x, y, rx, ry] of [[118, 350, 92, 28], [404, 392, 104, 30], [326, 212, 96, 30], [444, 276, 124, 34], [566, 300, 80, 24], [214, 292, 84, 26], [498, 226, 84, 24]]) {
  out.push(shape('pn', blob(x, y, rx, ry, 11, 0.16)), `<path class="f-pl" d="${blob(x - rx * 0.08, y - ry * 0.34, rx * 0.74, ry * 0.46, 9, 0.18)}"/>`)
}

const COLORS = {
  day: { k1: '#2f5f8f', k2: '#bcd6d2', k3: '#f6dcb4', su: '#d5482f', mi: '#f6ecd6', mt: '#4f76a3', sn: '#fbf6e9', h1: '#6f9c95', h2: '#2e5d63', s1: '#4a7da3', s2: '#1c3c66', wv: '#d5e6e4', rk: '#383748', rl: '#8a7b78', pn: '#274f40', pl: '#5a8a5c', tr: '#6b4a3c', sl: '#fbf6e9', la: '#ffb35c', ol: '#1b2036' },
  night: { k1: '#050a1d', k2: '#122a55', k3: '#35588a', su: '#f3eeda', mi: '#2b4372', mt: '#1c2f58', sn: '#c3cfe6', h1: '#16344b', h2: '#0c2233', s1: '#17346a', s2: '#070f26', wv: '#5d7fb4', rk: '#090c18', rl: '#1c2440', pn: '#0a2426', pl: '#1d4a46', tr: '#17121e', sl: '#aab8d4', la: '#ffb35c', ol: '#03050c' },
}
const vars = mode => Object.entries(COLORS[mode]).map(([k, v]) => `--${k}:${v}`).join(';')
const classes = Object.keys(COLORS.day).map(k => `.s-${k}{stroke:var(--${k});fill:none}.f-${k}{fill:var(--${k})}.g-${k}{stop-color:var(--${k})}`).join('')

const box = `x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"`
// A noise layer kept as faint specks of one grey: the block's grain, or the paper's fibre.
const speck = (id, v, freq, octaves, gain, bias) => `<filter id="${id}" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="6"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${v} 0 0 0 0 ${v} 0 0 0 0 ${v} ${gain} 0 0 0 ${bias}"/>
</filter>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
svg{${vars('day')}}
.night{display:none}
@media (prefers-color-scheme: dark){
svg{${vars('night')}}
.day{display:none}
.night{display:inline}
}
path{stroke-linecap:round;stroke-linejoin:round}
${classes}
.o{stroke:var(--ol);stroke-width:2.6}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="g-k1" offset="0"/><stop class="g-k2" offset=".34"/><stop class="g-k3" offset=".62"/></linearGradient>
<linearGradient id="peak" x1="0" y1="0" x2="0" y2="1"><stop class="g-mt" offset=".35"/><stop class="g-k3" offset="1"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop class="g-s1" offset="0"/><stop class="g-s2" offset="1"/></linearGradient>
<filter id="carve" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="soft" ${box}><feGaussianBlur stdDeviation="9"/></filter>
${speck('grain-dark', 0.1, '0.0018 0.11', 2, 1.3, -0.55)}
${speck('grain-light', 1, '0.0018 0.11', 2, 1.1, -0.5)}
${speck('fibre-dark', 0.15, 0.85, 3, 0.9, -0.38)}
${speck('fibre-light', 1, 0.85, 3, 0.7, -0.3)}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g filter="url(#carve)">${out.join('')}</g>
<rect width="${W}" height="${H}" filter="url(#grain-light)" opacity=".16"/>
<rect width="${W}" height="${H}" filter="url(#grain-dark)" opacity=".2"/>
<rect width="${W}" height="${H}" filter="url(#fibre-light)" opacity=".6"/>
<rect width="${W}" height="${H}" filter="url(#fibre-dark)" opacity=".6"/>
</svg>`

if (svg.includes('`') || svg.includes('\\') || svg.length > 131072) {
  throw new Error(`print refused: ${svg.length} characters, or a backtick or backslash in it`)
}
writeFileSync(new URL('./hooks/print.js', import.meta.url), `// Generated by make-print.mjs. Don't edit it.\nexport const PRINT = \`${svg}\`\n`)
writeFileSync(new URL('./hooks/print.d.ts', import.meta.url), 'export const PRINT: string\n')
console.log(`print.js written, ${svg.length} characters`)
