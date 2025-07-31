import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Studio Ghibli-inspired Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700;800&family=Comfortaa:wght@300;400;500;600;700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Fira+Code:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;600&family=Orbitron:wght@300;400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=Audiowide&family=Share+Tech+Mono&family=Noto+Sans+JP:wght@300;400;500;600;700&family=M+PLUS+Rounded+1c:wght@300;400;500;700&family=M+PLUS+1+Code:wght@300;400;500;600&family=Comic+Neue:wght@300;400;500;600;700&family=Fredoka+One&family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Serif+KR:wght@300;400;500;600;700&family=Playfair+Display:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Crimson+Text:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}