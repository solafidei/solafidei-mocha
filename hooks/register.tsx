import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { FANTASY } from './fantasy.js'
import { GOUACHE } from './gouache.js'
import { PAINTING } from './painting.js'
import { PRINT } from './print.js'
import { SCENE } from './scene.js'

// Each backdrop a take can name, and what a screen reader hears for it.
const BACKDROPS: Record<string, { source: string; alt: string }> = {
  sketch: { source: SCENE, alt: 'A pastel and charcoal sketch of hills, with a sun by day and a moon by night' },
  print: { source: PRINT, alt: 'A woodblock print of a bay with a pine and a lone peak, under a red sun by day and a full moon by night' },
  fantasy: { source: FANTASY, alt: 'Floating rock islands with giant trees and waterfalls over a misty valley, in golden light by day and under a full moon by night' },
  gouache: { source: GOUACHE, alt: 'A gouache painting of a lighthouse on sea cliffs under tall clouds, sunlit by day and moonlit by night' },
  painting: { source: PAINTING, alt: 'A painting of a mountain lake between pines, at sunset by day and under a moon by night' },
}

const TAKES: Record<string, ThemeSetArgs> = {
  // Sketch: a hand-drawn backdrop (make-scene.mjs) on toned paper, day and night.
  // Colours are the drawing's own: paper, charcoal text, sanguine accent.
  sketch: {
    backdrop: { scene: 'sketch', glass: { blur: 4, opacity: 0.55 } },
    colors: makeColors({
      label: 'Sketchbook',
      roles: { accent: '#b5533c', danger: '#b3263a', success: '#5f8a4e', warning: '#c08a1e', pro: '#6f5a94' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#e8dfcc',
            'surface-1': '#eee6d6',
            'surface-2': '#f4eee1',
            'text-primary': '#2b2a2c',
            'text-secondary': '#4d4a48',
            'text-muted': '#69645d',
          },
        },
      },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#15171f',
            'surface-1': '#1b1e28',
            'surface-2': '#212430',
            'surface-3': '#262a37',
            'text-primary': '#ece7da',
            'text-secondary': '#c9c4b8',
            'text-muted': '#a39f95',
          },
        },
      },
    }).theme,
  },
  // Painting: a cinematic mountain lake (make-painting.mjs), golden hour and moonlight.
  // Colours are the painting's own: warm ground and burnt orange by day, navy and moon blue by night.
  painting: {
    backdrop: { scene: 'painting', glass: { blur: 4, opacity: 0.55 } },
    colors: makeColors({
      label: 'Painting',
      roles: { accent: '#c2562d', danger: '#b3263a', success: '#4f7f5a', warning: '#b9801a', pro: '#6a5a92' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#ecdcc6',
            'surface-1': '#f2e6d4',
            'surface-2': '#f7efe2',
            'text-primary': '#1f2233',
            'text-secondary': '#42455a',
            'text-muted': '#62637a',
          },
        },
      },
      dark: {
        roles: { accent: '#7fa3dc', pro: '#ffb35c' },
        gray: {
          anchors: {
            'surface-0': '#080d1c',
            'surface-1': '#0d1428',
            'surface-2': '#121b33',
            'surface-3': '#16203a',
            'text-primary': '#e3ecff',
            'text-secondary': '#bcc8e4',
            'text-muted': '#93a1c2',
          },
        },
      },
    }).theme,
  },
  // Print: a woodblock print of a bay (make-print.mjs), red sun and full moon.
  // Colours are the print's own: washi paper and vermilion by day, indigo by night.
  print: {
    backdrop: { scene: 'print', glass: { blur: 4, opacity: 0.55 } },
    colors: makeColors({
      label: 'Woodblock',
      roles: { accent: '#c8452f', danger: '#a8223a', success: '#3f7a55', warning: '#b9801a', pro: '#3f5f96' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#ece2cc',
            'surface-1': '#f2ead8',
            'surface-2': '#f7f1e4',
            'text-primary': '#1b2036',
            'text-secondary': '#3d4359',
            'text-muted': '#5e6377',
          },
        },
      },
      dark: {
        roles: { accent: '#e06a50' },
        gray: {
          anchors: {
            'surface-0': '#0a1124',
            'surface-1': '#0f1830',
            'surface-2': '#14203c',
            'surface-3': '#182644',
            'text-primary': '#ece6d6',
            'text-secondary': '#c5c4bf',
            'text-muted': '#9aa1b4',
          },
        },
      },
    }).theme,
  },
  // Gouache: a lighthouse coast painted by Gemini and traced to vector (art/), day and night.
  // Colours are the painting's own: cream and burnt orange by day, indigo and lamp orange by night.
  gouache: {
    backdrop: { scene: 'gouache', glass: { blur: 4, opacity: 0.55 } },
    colors: makeColors({
      label: 'Gouache',
      roles: { accent: '#b5562f', danger: '#a8223a', success: '#3f7a55', warning: '#b9801a', pro: '#2f7f86' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#eddfc6',
            'surface-1': '#f3e8d4',
            'surface-2': '#f8f0e1',
            'text-primary': '#1f2226',
            'text-secondary': '#42464c',
            'text-muted': '#62666b',
          },
        },
      },
      dark: {
        roles: { accent: '#ffb35c', pro: '#8f9fd8' },
        gray: {
          anchors: {
            'surface-0': '#0b1026',
            'surface-1': '#111735',
            'surface-2': '#171e42',
            'surface-3': '#1b2349',
            'text-primary': '#ece6d2',
            'text-secondary': '#c6c3bd',
            'text-muted': '#9ea2b8',
          },
        },
      },
    }).theme,
  },
  // Fantasy: floating islands, drawn by Gemini as a flat illustration and traced (art/trace-fantasy.mjs).
  // Colours are the scene's own: golden haze and amber by day, navy with glowing teal by night.
  fantasy: {
    backdrop: { scene: 'fantasy', glass: { blur: 4, opacity: 0.55 } },
    colors: makeColors({
      label: 'Fantasy',
      roles: { accent: '#a8741a', danger: '#a8223a', success: '#4f6b3a', warning: '#b9801a', pro: '#5f6f3a' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#e9e0cb',
            'surface-1': '#f0e8d6',
            'surface-2': '#f6f0e2',
            'text-primary': '#23211a',
            'text-secondary': '#46433a',
            'text-muted': '#66625a',
          },
        },
      },
      dark: {
        roles: { accent: '#4fd6c4', pro: '#a78bdc', success: '#6fbf8a' },
        gray: {
          anchors: {
            'surface-0': '#070c1a',
            'surface-1': '#0c1326',
            'surface-2': '#111a31',
            'surface-3': '#151f39',
            'text-primary': '#e6ecf7',
            'text-secondary': '#bcc6da',
            'text-muted': '#939fb8',
          },
        },
      },
    }).theme,
  },
}
const NAMES = Object.keys(TAKES)
// Renamed each time a new take becomes the default, so the old pick doesn't win.
const KEY = 'pick-9'
const DEFAULT = 'fantasy'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'mocha',
      description: `Switch the backdrop: ${NAMES.join(', ')} (no name: the next one)`,
    })
    await $.command.register({ name: 'mocha-off', description: 'Remove the theme' })

    const saved = ((await $.store.get(KEY)) as string | undefined) ?? DEFAULT
    const take = saved === 'off' ? undefined : TAKES[saved] ?? TAKES[DEFAULT]
    if (take) {
      await $.theme.set(take)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const backdrop = BACKDROPS[e.props.scene]
    if (!backdrop || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={backdrop.source} alt={backdrop.alt} />
  })

  on('command.run', { command: 'mocha' }, async ($, e) => {
    const asked = (e.args ?? '').trim().toLowerCase()
    const current = ((await $.store.get(KEY)) as string | undefined) ?? DEFAULT
    const take = asked || NAMES[(NAMES.indexOf(current) + 1) % NAMES.length]!

    if (!TAKES[take]) {
      return { text: `No take "${asked}". Try: ${NAMES.join(', ')}.`, isTextDisplayOnly: true }
    }
    await $.store.set(KEY, take)
    const set = await $.theme.set(TAKES[take])

    return {
      text: set.isDrawn ? `Take: ${take}. All takes: ${NAMES.join(', ')}.` : `Take ${take} saved, not drawn here: ${set.reason}`,
      isTextDisplayOnly: true,
    }
  })

  on('command.run', { command: 'mocha-off' }, async $ => {
    await $.store.set(KEY, 'off')
    await $.theme.clear()

    return { text: 'Theme removed. /mocha brings it back.', isTextDisplayOnly: true }
  })
}
