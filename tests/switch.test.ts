import { expect, mock, test } from 'claude-code/testing'

test('with nothing saved, /mocha moves on from the default take', async ($, on) => {
  mock.store(on)
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 't' } }))

  const ran = await $.command.run({ command: 'mocha', args: '' } as never)

  expect(ran.text).toContain('Take: sketch.')
})

test('/mocha fantasy selects the fantasy take', async ($, on) => {
  mock.store(on)
  const set: unknown[] = []
  on('theme.set', (_, e) => {
    set.push(e)

    return { value: { isDrawn: true, requestId: 't' } }
  })

  const ran = await $.command.run({ command: 'mocha', args: 'fantasy' } as never)

  expect(ran.text).toContain('Take: fantasy.')
  expect(JSON.stringify(set[0])).toContain('"scene":"fantasy"')
})
