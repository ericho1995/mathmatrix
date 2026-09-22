import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { Diagram } from '@/types'
import { BarChart, LineGraph, PieChart, Pictograph, DotPlot, StemLeaf, BoxPlot, DataTable } from './charts'
import { Spinner, Venn } from './chance'
import { Figure, GridShape, CoordinatePlane, Solid, Net } from './geometry'
import { FunctionGraph, NetworkGraph, MatrixView } from './graphs'
import { Measure, Clock, Balance, Calendar } from './measurement'
import { NumberLine, FractionModel, BarModel, PlaceValue, ArrayDots, Money, TilePattern, PriceTags } from './number'
import { GridMap } from './maps'
import { IllustrationView } from './illustration'
import { SimpleShape } from './legacy'
import { INK } from './shared'

type Props = { diagram: Diagram; fit?: number; bare?: boolean }

/**
 * The diagram registry. Adding a kind means adding its type in
 * src/types/diagrams.ts, a renderer in this folder, and one case here — the
 * exhaustive switch makes the compiler refuse a kind that has no renderer.
 */
export function DiagramView({ diagram, fit, bare }: Props) {
  const p = { fit, bare }
  switch (diagram.kind) {
    case 'bar_chart': return <BarChart diagram={diagram} {...p} />
    case 'line_graph': return <LineGraph diagram={diagram} {...p} />
    case 'pie_chart': return <PieChart diagram={diagram} {...p} />
    case 'pictograph': return <Pictograph diagram={diagram} {...p} />
    case 'dot_plot': return <DotPlot diagram={diagram} {...p} />
    case 'stem_leaf': return <StemLeaf diagram={diagram} {...p} />
    case 'box_plot': return <BoxPlot diagram={diagram} {...p} />
    case 'data_table': return <DataTable diagram={diagram} {...p} />
    case 'spinner': return <Spinner diagram={diagram} {...p} />
    case 'venn': return <Venn diagram={diagram} {...p} />
    case 'figure': return <Figure diagram={diagram} {...p} />
    case 'grid_shape': return <GridShape diagram={diagram} {...p} />
    case 'coordinate_plane': return <CoordinatePlane diagram={diagram} {...p} />
    case 'solid': return <Solid diagram={diagram} {...p} />
    case 'net': return <Net diagram={diagram} {...p} />
    case 'function_graph': return <FunctionGraph diagram={diagram} {...p} />
    case 'network_graph': return <NetworkGraph diagram={diagram} {...p} />
    case 'matrix': return <MatrixView diagram={diagram} {...p} />
    case 'measure': return <Measure diagram={diagram} {...p} />
    case 'clock': return <Clock diagram={diagram} {...p} />
    case 'balance': return <Balance diagram={diagram} {...p} />
    case 'calendar': return <Calendar diagram={diagram} {...p} />
    case 'number_line': return <NumberLine diagram={diagram} {...p} />
    case 'fraction_model': return <FractionModel diagram={diagram} {...p} />
    case 'bar_model': return <BarModel diagram={diagram} {...p} />
    case 'place_value': return <PlaceValue diagram={diagram} {...p} />
    case 'array': return <ArrayDots diagram={diagram} {...p} />
    case 'money': return <Money diagram={diagram} {...p} />
    case 'tile_pattern': return <TilePattern diagram={diagram} {...p} />
    case 'price_tags': return <PriceTags diagram={diagram} {...p} />
    case 'grid_map': return <GridMap diagram={diagram} {...p} />
    case 'illustration': return <IllustrationView diagram={diagram} {...p} />
    case 'simple_shape': return <SimpleShape diagram={diagram} />
    default: {
      const unreachable: never = diagram
      return unreachable
    }
  }
}

/**
 * Kinds that cannot shrink to an answer panel: they lay text out with Views
 * rather than inside the SVG, so they would overflow a half-width cell. The
 * question-bank check refuses them as option_diagrams.
 */
export const NON_SCALING_KINDS = new Set(['simple_shape'])

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Picture answers, as a 2 × 2 grid of lettered panels — how real papers set
 * "Select the dot plot that correctly displays the data" or "Which net makes
 * this cube?". Each diagram is drawn at panel width through the same renderer
 * used full size, so a picture option is never a second implementation.
 */
export function OptionDiagrams({ diagrams, captions }: { diagrams: Diagram[]; captions: string[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginLeft: 12, marginTop: 2 }}>
      {diagrams.map((dg, i) => (
        <View
          key={i}
          wrap={false}
          style={{ width: '48.5%', border: `0.75pt solid ${INK}`, borderRadius: 3, padding: 6, marginBottom: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 10, fontWeight: 700, alignSelf: 'flex-start', marginBottom: 2 }}>{LETTERS[i]}</Text>
          <DiagramView diagram={dg} fit={225} bare />
          {captions[i] ? <Text style={{ fontSize: 9, marginTop: 3 }}>{captions[i]}</Text> : null}
        </View>
      ))}
    </View>
  )
}
