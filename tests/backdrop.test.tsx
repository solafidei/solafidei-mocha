import { expect, test } from 'claude-code/testing'

// Every scene a take names must come back from the engine as a drawing it accepts.
for (const scene of ['sketch', 'painting', 'print', 'gouache', 'fantasy']) {
  test(`the ${scene} backdrop is drawn`, async $ => {
    const ui = await $.ui.mount({
      plugin: 'solafidei-mocha',
      surface: 'desktop',
      component: 'Backdrop',
      props: { scene, plugin: 'solafidei-mocha', glass: false },
    })

    expect(await ui.find({ type: 'Svg' })).toBeDefined()
    await ui.unmount()
  })
}
