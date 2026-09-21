import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { Document, Page, View, Text, renderToBuffer } from '@react-pdf/renderer'
import { pdfStyles } from '@/lib/pdf/theme'
import { DiagramView, OptionDiagrams } from '@/lib/pdf/diagrams'
import { GALLERY, GALLERY_OPTIONS, GALLERY_NET_OPTIONS } from '@/lib/pdf/diagrams/gallery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: every diagram kind on one PDF, for checking by eye.
 *
 * Refuses to run in a production build and off localhost. It exposes no
 * question content, but there is no reason for it to exist anywhere a customer
 * can reach.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const doc = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.sectionHeader}>Diagram gallery</Text>
        {GALLERY.map((g, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 12, borderBottom: '0.5pt solid #eee', paddingBottom: 6 }}>
            <Text style={{ fontSize: 8, color: '#888', marginBottom: 4 }}>{g.name}</Text>
            <DiagramView diagram={g.diagram} />
          </View>
        ))}
        <View wrap={false} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 8, color: '#888', marginBottom: 4 }}>option_diagrams — dot plots</Text>
          <OptionDiagrams diagrams={GALLERY_OPTIONS} captions={['', '', '', '']} />
        </View>
        <View wrap={false} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 8, color: '#888', marginBottom: 4 }}>option_diagrams — nets</Text>
          <OptionDiagrams diagrams={GALLERY_NET_OPTIONS} captions={['', '', '', '']} />
        </View>
      </Page>
    </Document>
  )

  const buffer = await renderToBuffer(doc)
  return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/pdf' } })
}
