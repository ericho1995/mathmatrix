/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    // pdfkit (used by @react-pdf/renderer in the exam PDF routes) loads its
    // standard font files with a dynamic require() at runtime, which Next's
    // serverless file tracing doesn't detect — without this, those routes
    // 500 in production with "Cannot find module
    // .../pdfkit/js/standard-fonts/Helvetica.cjs".
    outputFileTracingIncludes: {
      '/api/exams/[id]/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
      '/api/exams/[id]/answers': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    },
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
