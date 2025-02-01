// pages/_document.js

import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    {/* Add Google Fonts for Questrial */}
                    <link
                        href="https://fonts.googleapis.com/css2?family=Questrial&display=swap"
                        rel="stylesheet"
                    />
                    {/* Favicon Links */}
                    <link rel="icon" href="/favicon.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <title>Credit Bank Diaspora Campaign</title>
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;