import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Portfolio of Shun Kushigami - Experienced Cloud Support Engineer and Software Engineer specializing in AWS, automation tools, and web development with over a decade of experience." />
        <meta name="keywords" content="Shun Kushigami, Cloud Support Engineer, Software Engineer, AWS, JavaScript, Python, Web Development" />
        <meta name="author" content="Shun Kushigami" />
        <meta property="og:title" content="Shun Kushigami - Cloud Support Engineer & Software Engineer" />
        <meta property="og:description" content="Portfolio of Shun Kushigami - Experienced Cloud Support Engineer and Software Engineer specializing in AWS, automation tools, and web development." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}