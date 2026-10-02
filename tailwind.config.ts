import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // The 2026-10 look (docs/superpowers/specs/2026-10-02-premium-ui-design.md):
      // bright, rounded and friendly, after Duolingo's web pages. 500s are the
      // bright fills (the bird, progress bars) and are decorative only; text and
      // buttons use 600, which passes WCAG AA on white. Same for green and
      // orange: 400 is the fill, 600 the text.
      colors: {
        brand: {
          50:  '#EEF6FE',
          100: '#D3E9FD',
          200: '#A9D3FA',
          400: '#5AA7F0',
          500: '#2F8FEA',
          600: '#1D74CC',
          700: '#165EA6',
          800: '#12497F',
          900: '#0B2F54',
        },
        // Strengths and "correct": a leafy green.
        teal: {
          50:  '#EAF8DD',
          400: '#58CC02',
          600: '#2E7D00',
        },
        // Focus areas: a warm orange.
        amber: {
          50:  '#FFF2DE',
          400: '#FF9600',
          600: '#A35200',
        },
        sun: { 50: '#FFF8E1', 400: '#FFC530', 600: '#8A6100' },
        grape: { 50: '#F7EEFF', 400: '#CE82FF', 600: '#8549BA' },
        ink: '#3C3C3C',
        line: '#E5E5E5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
    // Nunito is light at 400, so every weight steps up one notch: markup written
    // for Inter (font-medium labels, font-semibold headings) comes out with the
    // chunky, friendly weight the new look wants.
    fontWeight: {
      normal: '500',
      medium: '700',
      semibold: '800',
      bold: '900',
      extrabold: '900',
      black: '900',
    },
  },
  plugins: [],
}

export default config
