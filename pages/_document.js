import Document, { Html, Head, Main, NextScript } from 'next/document'

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <script
            async
            defer
            data-domain="search.openknowhow.org"
            src="https://plausible.io/js/plausible.outbound-links.js"
          ></script>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
