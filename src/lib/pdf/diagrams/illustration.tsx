import React from 'react'
import { Circle, Ellipse, Rect, Line, Path, Polygon, Polyline, Text as SvgText } from '@react-pdf/renderer'
import { ILLUSTRATIONS } from '@/lib/questions/illustrations'
import type { IllustrationDiagram } from '@/types'
import { Canvas, Frame, SVG_FONT } from './shared'

type Fit = { fit?: number; bare?: boolean }

/** Draws authored vector artwork (see src/lib/questions/illustrations.ts) —
 * figures a parametric renderer cannot express. Scales to fit, keeping its
 * aspect ratio. */
export function IllustrationView({ diagram, fit, bare }: { diagram: IllustrationDiagram } & Fit) {
  const art = ILLUSTRATIONS[diagram.id]
  if (!art) return null
  return (
    <Frame title={diagram.title} bare={bare}>
      <Canvas w={art.width} h={art.height} fit={Math.min(fit ?? 300, 300)}>
        {art.elements.map((el, i) => {
          const { stroke, strokeWidth, fill } = el
          switch (el.t) {
            case 'circle':
              return <Circle key={i} cx={el.cx} cy={el.cy} r={el.r} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'ellipse':
              return <Ellipse key={i} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'rect':
              return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'line':
              return <Line key={i} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={stroke} strokeWidth={strokeWidth} />
            case 'path':
              return <Path key={i} d={el.d} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'polygon':
              return <Polygon key={i} points={el.points} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'polyline':
              return <Polyline key={i} points={el.points} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'text':
              return (
                <SvgText key={i} x={el.x} y={el.y} fill={el.fill ?? '#000'} textAnchor={el.textAnchor} style={{ fontSize: el.fontSize ?? 12, fontFamily: SVG_FONT }}>
                  {el.content}
                </SvgText>
              )
          }
        })}
      </Canvas>
    </Frame>
  )
}
