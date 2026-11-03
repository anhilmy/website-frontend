import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveMediaUrl } from './media.js'

const base = 'http://localhost:9098/api/v1'

test('empty values stay empty', () => {
  assert.equal(resolveMediaUrl('', base), '')
  assert.equal(resolveMediaUrl(null, base), '')
})

test('absolute and data URLs are unchanged', () => {
  assert.equal(resolveMediaUrl('https://cdn.example.com/a.png', base), 'https://cdn.example.com/a.png')
  assert.equal(resolveMediaUrl('data:image/png;base64,abc', base), 'data:image/png;base64,abc')
})

test('managed paths resolve against the API origin', () => {
  assert.equal(
    resolveMediaUrl('/media/menu/menu-1-20261029120000-abcdef12.png', base),
    'http://localhost:9098/media/menu/menu-1-20261029120000-abcdef12.png',
  )
})

test('relative paths stay on the current origin when the API base is relative', () => {
  assert.equal(resolveMediaUrl('/media/menu/a.png', '/api/v1'), '/media/menu/a.png')
  assert.equal(resolveMediaUrl('menu/a.png', '/api/v1'), '/media/menu/a.png')
})
