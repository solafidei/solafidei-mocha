// Paints the cinematic backdrop and writes hooks/painting.js. Rerun after a change:
//   node make-painting.mjs
// A wide mountain lake: golden hour by day, moonlight by night. Every form is built from
// overlapping brush dabs; the filters ragged their edges and lay canvas and impasto relief on top.
import { writeFileSync } from 'node:fs'

let seed = 23
const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const R = (a, b) => a + r() * (b - a)
const f = n => String(Math.round(n))
const W = 1600
const H = 900
const SUN = [1080, 470]
const MOON = [1250, 170]
const SHORE = 690

// One dab of the brush: a short bowed stroke from a point, along an angle.
const dab = (x, y, len, ang, bow = 6) => {
  const x2 = x + Math.cos(ang) * len
  const y2 = y + Math.sin(ang) * len
  return `M${f(x)} ${f(y)}Q${f((x + x2) / 2 + R(-bow, bow))} ${f((y + y2) / 2 + R(-bow, bow))} ${f(x2)} ${f(y2)}`
}
const stroke = (color, width, opacity, d, extra = '') =>
  d.length ? `<path class="s-${color}${extra}" stroke-width="${width}" opacity="${opacity}" d="${d.join('')}"/>` : ''

const peaks = (base, list, wob) => x =>
  base - list.reduce((sum, [at, tall, wide]) => sum + tall * Math.exp(-(((x - at) / wide) ** 2)), 0) +
  wob * Math.sin(x / 37 + base) + (wob / 2) * Math.sin(x / 13 + 2)
const far = peaks(520, [[380, 150, 260], [760, 120, 170], [1420, 180, 200]], 14)
const mid = peaks(602, [[150, 120, 240], [700, 80, 260], [1500, 110, 260]], 11)
const near = peaks(668, [[80, 70, 200], [1220, 44, 300]], 7)

// A range: a filled silhouette, then dabs down its slopes, lit on the side that faces the light.
const range = (fn, name, depth, n) => {
  let d = `M-40 ${H}`
  for (let x = -40; x <= W + 40; x += 16) {
    d += `L${x} ${f(fn(x))}`
  }
  const lit = []
  const shade = []
  const body = []
  for (let i = 0; i < n; i++) {
    const x = R(-20, W + 20)
    const slope = fn(x + 6) - fn(x - 6)
    const facesLight = x < SUN[0] ? slope > 0.6 : slope < -0.6
    const y = fn(x) + R(4, depth)
    const ang = Math.atan2(1, slope > 0 ? 0.75 : -0.75) + R(-0.25, 0.25)
    ;(y - fn(x) > depth * 0.55 ? body : facesLight ? lit : shade).push(dab(x, y, R(26, 64), ang))
  }
  return [
    `<path class="f-${name}" d="${d}L${W + 40} ${H}Z"/>`,
    stroke(name, 22, 0.85, body),
    stroke(`${name}d`, 20, 0.8, shade),
    stroke(`${name}l`, 18, 0.85, lit.slice(0, lit.length / 2)),
    stroke(`${name}l`, 9, 0.9, lit.slice(lit.length / 2)),
  ].join('')
}
// Mist lying at the foot of a range.
const haze = (y, opacity) => {
  const d = []
  for (let i = 0; i < 16; i++) {
    d.push(dab(R(-100, W), y + R(-16, 16), R(260, 520), R(-0.03, 0.03), 4))
  }
  return `<g filter="url(#soft)">${stroke('s3', 44, opacity, d)}</g>`
}

const paint = []

// Clouds: dark on top, lit from underneath.
for (const [cx, cy, w, h] of [[300, 150, 360, 30], [860, 90, 300, 22], [1340, 215, 320, 26], [620, 300, 260, 16], [1150, 335, 220, 14], [130, 345, 190, 14]]) {
  const top = []
  const belly = []
  for (let i = 0; i < 44; i++) {
    const a = R(0, 6.28)
    const q = Math.sqrt(r())
    const x = cx + Math.cos(a) * q * w
    const y = cy + Math.sin(a) * q * h
    ;(y > cy + h * 0.1 ? belly : top).push(dab(x - 50, y, R(50, 150) * (1.2 - q), R(-0.1, 0.1)))
  }
  paint.push(
    `<g filter="url(#soft)">${stroke('cd', 46, 0.5, top.slice(0, 8))}</g>`,
    stroke('cd', 20, 0.55, top),
    stroke('cl', 13, 0.7, belly),
    stroke('cl', 6, 0.75, belly.slice(0, 10)),
    stroke('gl', 4, 0.6, belly.slice(0, 5)),
  )
}


paint.push(range(far, 'm1', 150, 260), haze(600, 0.5), range(mid, 'm2', 110, 220), haze(662, 0.4), range(near, 'm3', 60, 150))

// The lake: the sky laid back down in level strokes, and the light's path across it.
const water = { s2: [], s3: [], wl: [], wa: [] }
for (let i = 0; i < 230; i++) {
  const y = R(SHORE + 4, H)
  const depth = (y - SHORE) / (H - SHORE)
  const key = ['s2', 's3', 'wl', 'wa', 'wa'][Math.floor(R(0, 5))]
  water[key].push(dab(R(-60, W), y, R(60, 220) * (0.5 + depth), R(-0.02, 0.02), 3))
}
const glitter = (cx, spread, n) => {
  const d = []
  for (let i = 0; i < n; i++) {
    const y = R(SHORE + 6, H - 10)
    const reach = 20 + ((y - SHORE) / (H - SHORE)) * spread
    d.push(dab(cx + R(-reach, reach) - 20, y, R(24, 70), R(-0.03, 0.03), 2))
  }
  return d
}
paint.push(
  `<rect class="f-wa" x="0" y="${SHORE}" width="${W}" height="${H - SHORE}"/>`,
  stroke('m3', 26, 0.7, Array.from({ length: 40 }, () => dab(R(-60, W), SHORE + R(4, 40), R(120, 300), R(-0.02, 0.02), 3))),
  stroke('wa', 16, 0.75, water.wa),
  stroke('s2', 9, 0.5, water.s2),
  stroke('s3', 7, 0.5, water.s3),
  stroke('wl', 5, 0.7, water.wl),
  stroke('gl', 7, 0.85, glitter(SUN[0], 90, 46), ' day'),
  stroke('gl', 5, 0.7, glitter(MOON[0], 60, 34), ' night'),
)

// One lit window on the far shore at night, and its reflection.
paint.push(
  `<g class="night" filter="url(#soft)"><circle class="f-ac" cx="452" cy="${SHORE - 6}" r="22" opacity=".55"/></g>`,
  stroke('ac', 6, 1, [dab(448, SHORE - 7, 9, 0, 0)], ' night'),
  stroke('ac', 4, 0.7, glitter(452, 10, 12).map(d => d).slice(0, 12), ' night'),
)

// Pines framing the two sides, dark against the light, with a rim where it catches them.
const pine = (x, base, tall) => {
  const dark = [dab(x, base, tall, -Math.PI / 2, 3)]
  const rim = []
  for (let t = 0.06; t < 1; t += R(0.022, 0.04)) {
    const y = base - tall * (1 - t)
    const reach = tall * 0.21 * t + 5
    for (const side of [-1, 1]) {
      const d = dab(x, y, reach * R(0.7, 1.15), side > 0 ? R(0.3, 0.7) : Math.PI - R(0.3, 0.7), 4)
      dark.push(d)
      if ((x < SUN[0] ? side > 0 : side < 0) && r() < 0.3) {
        rim.push(d)
      }
    }
  }
  return [stroke('fg', Math.max(5, tall / 46), 0.96, dark), stroke('fr', 3, 0.7, rim)].join('')
}
const bank = (x0, x1, top) => {
  const d = []
  for (let i = 0; i < 70; i++) {
    const x = R(x0, x1)
    d.push(dab(x, R(top + Math.abs(x - (x0 < 400 ? x0 : x1)) * 0.22, H + 20), R(60, 150), R(-0.2, 0.2)))
  }
  return stroke('fg', 40, 0.97, d)
}
paint.push(bank(-60, 430, 790), bank(1200, W + 60, 800))
for (const [x, tall] of [[40, 560], [120, 430], [196, 610], [270, 360], [338, 250], [1340, 270], [1408, 400], [1478, 590], [1548, 470], [1596, 640]]) {
  paint.push(pine(x, H + 10, tall))
}

const stars = []
for (let i = 0; i < 110; i++) {
  const x = R(10, W - 10)
  const y = R(10, 440) * R(0.25, 1)
  stars.push(dab(x, y, R(1, 3), 0, 0))
}

const COLORS = {
  // day: golden hour, teal against orange
  day: { s1: '#27405f', s2: '#c8745a', s3: '#f4bd78', gl: '#ffe6b0', cl: '#f0a070', cd: '#5d5673', m1: '#8f7f9a', m1l: '#e8a983', m1d: '#6f6788', m2: '#565575', m2l: '#c98a78', m2d: '#42425f', m3: '#2c3149', m3l: '#8a6a70', m3d: '#22263a', wa: '#33455f', wl: '#f4c48a', fg: '#11131c', fr: '#d98a5a', ac: '#ffb35c' },
  // night: moonlight, deep blue, one warm window
  night: { s1: '#050816', s2: '#101d3f', s3: '#27456e', gl: '#e3ecff', cl: '#4a6594', cd: '#0c1430', m1: '#2a3b60', m1l: '#6c88b8', m1d: '#1f2c4b', m2: '#1a2644', m2l: '#4a6594', m2d: '#131c35', m3: '#0f1730', m3l: '#324a75', m3d: '#0b1124', wa: '#0d1833', wl: '#7f9ccc', fg: '#03050b', fr: '#3d5788', ac: '#ffb35c' },
}
const vars = mode => Object.entries(COLORS[mode]).map(([k, v]) => `--${k}:${v}`).join(';')
const classes = Object.keys(COLORS.day).map(k => `.s-${k}{stroke:var(--${k})}.f-${k}{fill:var(--${k})}.g-${k}{stop-color:var(--${k})}`).join('')

const box = `x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"`
// Relief: light a noise surface from the upper left, then keep only its highlights or its shadows.
const relief = (id, freq, octaves, height, light) => `<filter id="${id}" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="5"/>
<feDiffuseLighting surfaceScale="${height}" diffuseConstant="1" lighting-color="#ffffff"><feDistantLight azimuth="225" elevation="30"/></feDiffuseLighting>
<feColorMatrix type="matrix" values="0 0 0 0 ${light ? 1 : 0} 0 0 0 0 ${light ? 1 : 0} 0 0 0 0 ${light ? 1 : 0} ${light ? '1.1 0 0 0 -0.55' : '-1.1 0 0 0 0.55'}"/>
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
path{fill:none;stroke-linecap:round;stroke-linejoin:round}
${classes}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="g-s1" offset="0"/><stop class="g-s2" offset=".62"/><stop class="g-s3" offset=".8"/></linearGradient>
<radialGradient id="glow"><stop class="g-gl" offset="0" stop-opacity=".95"/><stop class="g-s3" offset=".35" stop-opacity=".5"/><stop class="g-s3" offset="1" stop-opacity="0"/></radialGradient>
<radialGradient id="edge" cx=".5" cy=".46" r=".75"><stop offset=".5" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".62"/></radialGradient>
<filter id="paint" ${box}>
<feTurbulence type="fractalNoise" baseFrequency="0.013 0.03" numOctaves="3" seed="7" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="24" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.05 0.4" numOctaves="2" seed="3" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0.3" result="t"/>
<feComposite in="d" in2="t" operator="in"/>
</filter>
<filter id="soft" ${box}><feGaussianBlur stdDeviation="16"/></filter>
<filter id="halo" ${box}><feGaussianBlur stdDeviation="2.5"/></filter>
${relief('canvas-light', 0.8, 2, 1.4, true)}
${relief('canvas-dark', 0.8, 2, 1.4, false)}
${relief('impasto-light', '0.02 0.045', 3, 7, true)}
${relief('impasto-dark', '0.02 0.045', 3, 7, false)}
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle class="day" cx="${SUN[0]}" cy="${SUN[1]}" r="520" fill="url(#glow)"/>
<circle class="night" cx="${MOON[0]}" cy="${MOON[1]}" r="300" fill="url(#glow)" opacity=".7"/>
${stroke('gl', 2.6, 0.85, stars, ' night')}
<g filter="url(#halo)"><circle class="f-gl day" cx="${SUN[0]}" cy="${SUN[1]}" r="46"/><circle class="f-gl night" cx="${MOON[0]}" cy="${MOON[1]}" r="32"/></g>
<g filter="url(#paint)">${paint.join('')}</g>
<rect width="${W}" height="${H}" fill="url(#edge)"/>
<rect width="${W}" height="${H}" filter="url(#impasto-light)" opacity=".13"/>
<rect width="${W}" height="${H}" filter="url(#impasto-dark)" opacity=".18"/>
<rect width="${W}" height="${H}" filter="url(#canvas-light)" opacity=".22"/>
<rect width="${W}" height="${H}" filter="url(#canvas-dark)" opacity=".3"/>
</svg>`

if (svg.includes('`') || svg.includes('\\') || svg.length > 131072) {
  throw new Error(`painting refused: ${svg.length} characters, or a backtick or backslash in it`)
}
writeFileSync(new URL('./hooks/painting.js', import.meta.url), `// Generated by make-painting.mjs. Don't edit it.\nexport const PAINTING = \`${svg}\`\n`)
writeFileSync(new URL('./hooks/painting.d.ts', import.meta.url), 'export const PAINTING: string\n')
console.log(`painting.js written, ${svg.length} characters`)
