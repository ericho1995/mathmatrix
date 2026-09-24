import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import { Watermark, PageFooter } from './Brand'
import { RichText } from './math/MathText'
import type { FormulaSheet } from './formulaSheets'

/**
 * The formula sheet, printed after the last question. VCAA supplies it as a
 * separate sheet; here it is the paper's closing pages, so a printed paper is
 * complete. Laid out as VCAA does: a titled box per area of study, a narrow
 * label column and one or two formula cells per row.
 */
export function FormulaSheetPages({ sheet, examTitle }: { sheet: FormulaSheet; examTitle: string }) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <Watermark />
      <Text style={pdfStyles.runningHeader}>Formula sheet</Text>
      <Text style={pdfStyles.formulaTitle}>{sheet.title}</Text>
      {sheet.sections.map((section, si) => (
        <View key={si} wrap={false}>
          <Text style={pdfStyles.formulaSectionTitle}>{section.title}</Text>
          <View style={pdfStyles.formulaTable}>
            {section.rows.map((row, ri) => (
              <View key={ri} style={[pdfStyles.formulaRow, ri === 0 ? { borderTop: 'none' } : {}]} wrap={false}>
                {section.rows.some(r => r.label) ? (
                  <View style={pdfStyles.formulaLabel}>
                    {row.label ? <RichText text={row.label} style={{ fontSize: 8.5, color: '#333' }} /> : null}
                  </View>
                ) : null}
                {row.cells.map((cell, ci) => (
                  <View key={ci} style={[pdfStyles.formulaCell, ci > 0 ? { borderLeft: '0.5pt solid #ccc' } : {}]}>
                    {cell ? <RichText text={cell} style={{ fontSize: 9.5 }} /> : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text style={{ fontSize: 9, color: '#666', textAlign: 'center', marginTop: 4 }}>END OF FORMULA SHEET</Text>
      <PageFooter examTitle={examTitle} />
    </Page>
  )
}
