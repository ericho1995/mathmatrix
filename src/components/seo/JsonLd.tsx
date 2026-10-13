/**
 * Structured data for search engines, as a JSON-LD script tag.
 *
 * `<` is escaped so a title containing "</script>" cannot close the tag early;
 * the JSON stays valid because < is the same character to a parser.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
