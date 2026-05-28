import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  public override render(): React.ReactElement {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
