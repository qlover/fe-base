import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  public override render(): React.ReactElement {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
