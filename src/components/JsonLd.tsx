export function JsonLd({ data }: { data: object }) {
  // Prevent </script>-style breakouts inside inline JSON-LD payloads.
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  )
}
