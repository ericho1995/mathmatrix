import { test } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { pdfToHtml, styleToCss } from '../../src/lib/web/pdfToHtml.ts'

const h = React.createElement

test('an SVG drawing maps element for element, with SVG attribute names', () => {
  const tree = h(
    'SVG',
    { width: 10, height: 10, viewBox: '0 0 10 10' },
    h('LINE', { x1: 0, y1: 0, x2: 10, y2: 10, strokeWidth: 2, strokeDasharray: '2,2', stroke: '#000' }),
    h('TEXT', { x: 5, y: 5, textAnchor: 'middle', style: { fontSize: 8, fontFamily: 'DejaVuSans' } }, 'a<b')
  )
  const html = pdfToHtml(tree)
  assert.match(html, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="10pt" height="10pt" viewBox="0 0 10 10" style="max-width:100%;height:auto">/)
  assert.match(html, /<line x1="0" y1="0" x2="10" y2="10" stroke-width="2" stroke-dasharray="2,2" stroke="#000"><\/line>/)
  assert.match(html, /<text x="5" y="5" text-anchor="middle" style="font-size:8pt;font-family:Inter[^"]*">a&lt;b<\/text>/)
  assert.match(html, /<\/svg>$/)
})

test('views become flex columns and text becomes divs and spans', () => {
  const html = pdfToHtml(
    h('VIEW', { style: [{ flexDirection: 'row', paddingVertical: 4 }, { marginHorizontal: 2 }], wrap: false }, h('TEXT', { style: { fontSize: 9 } }, 'Key ', h('TEXT', { style: { fontWeight: 700 } }, 'A')))
  )
  assert.equal(
    html,
    '<div style="display:flex;flex-direction:row;padding-top:4pt;padding-bottom:4pt;margin-left:2pt;margin-right:2pt"><div style="font-size:9pt">Key <span style="font-weight:700">A</span></div></div>'
  )
})

test('function components and fragments are expanded', () => {
  const Box = ({ label }) => h(React.Fragment, null, h('RECT', { x: 1, y: 1, width: 2, height: 2 }), h('TEXT', { x: 0, y: 0 }, label))
  const html = pdfToHtml(h('SVG', { width: 4, height: 4 }, h(Box, { label: 'Q"1' }), null, false, [h('CIRCLE', { key: 'c', cx: 1, cy: 1, r: 1 })]))
  assert.match(html, /<rect x="1" y="1" width="2" height="2"><\/rect><text x="0" y="0">Q&quot;1<\/text><circle cx="1" cy="1" r="1"><\/circle>/)
})

test('attribute values are escaped and react-pdf-only props dropped', () => {
  const html = pdfToHtml(h('SVG', { width: 1, height: 1 }, h('PATH', { d: 'M0 0"><script>', fixed: true, debug: true })))
  assert.ok(!html.includes('<script>'))
  assert.ok(!/fixed|debug/.test(html))
})

test('style conversion', () => {
  assert.equal(styleToCss({ fontSize: 10, lineHeight: 1.4, flex: 1, border: '0.75pt solid #1a1a1a', width: '50%' }), 'font-size:10pt;line-height:1.4;flex:1;border:0.75pt solid #1a1a1a;width:50%')
  assert.equal(styleToCss({ fontFamily: 'DejaVuSansMono' }).startsWith('font-family:ui-monospace'), true)
})
