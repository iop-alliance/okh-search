import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                /*
                * lazy-simon.js
                *
                *  Minimal effort 350 byte JavaScript library to lazy load all <img> on your website
                *
                * License: MIT (https://github.com/simonfrey/lazysimon/blob/master/LICENSE)
                */
                const o = new IntersectionObserver((a, s) => {
                  a.forEach(e => {
                    if (e.isIntersecting) {
                      e.target.src = e.target.dataset.l;
                      s.unobserve(e.target);
                    }
                  });
                });
                const d = document.querySelectorAll("img");
                for (i = d.length - 1; i >= 0; i--) {
                  const e = d[i];
                  if (e.loading != undefined){
                    e.loading = "lazy"
                  }else{
                  e.dataset.l = e.src;
                  e.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' />";
                  o.observe(e);
                  }
                }
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
