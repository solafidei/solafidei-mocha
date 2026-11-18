# solafidei-mocha

A mod for Claude Code that puts a picture behind your chat in the Claude desktop and mobile apps, with app colours to match. It has five backdrops, and each one has a day version and a night version.

| Take | What it is |
| --- | --- |
| `sketch` | Hills drawn in pastel, charcoal, pencil, chalk and sanguine on toned paper |
| `painting` | A cinematic mountain lake between pines, built from brush dabs |
| `print` | A woodblock print of a bay with a pine and a lone peak |
| `gouache` | A lighthouse on sea cliffs under tall clouds |
| `fantasy` | Floating rock islands with giant trees and waterfalls |

## Install

At the prompt of a terminal session:

```
/plugin install solafidei-mocha --marketplace solafidei/solafidei-mocha
```

Answer `y` to add the marketplace, then choose a scope (the user scope applies it to every session).

From a shell:

```
claude plugin install solafidei-mocha --marketplace solafidei/solafidei-mocha
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `solafidei/solafidei-mocha`, then Add plugin.

## Use

- `/mocha` moves to the next backdrop. `/mocha fantasy` (or any name from the table) jumps to one. The choice is remembered across sessions.
- `/mocha-off` removes the theme. `/mocha` brings it back.

Day and night follow the app's light and dark mode: light mode shows the day picture and light colours, dark mode shows the night picture and dark colours. Nothing looks at the clock.

## Limits

- Only the desktop and mobile apps draw the backdrop and colours. A terminal session loads the mod and its commands but draws nothing.
- Only one theme can be set at a time, so this mod replaces any other mod's theme while it is on.
- Every backdrop is pure vector, as the app requires. The desktop app would not paint a drawing of 127,824 characters, so each is kept near or under 118,000.

## How the pictures are made

`sketch`, `painting` and `print` are drawn by the three generator scripts at the top of the repository. Each writes its drawing into `hooks/` and can be rerun after a change:

```
node make-scene.mjs
node make-painting.mjs
node make-print.mjs
```

`gouache` and `fantasy` were painted by an image model and then traced into flat vector shapes. Their source images and tracing scripts are not in this repository, so `hooks/gouache.js` and `hooks/fantasy.js` are here as finished drawings.

## Tests

```
claude plugin test .
```

The tests ask the engine to draw each backdrop and check that `/mocha` switches takes.
