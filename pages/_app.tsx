import Layout from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCronitor } from "@cronitorio/cronitor-rum-nextjs";

export default function App({ Component, pageProps }: AppProps) {
  useCronitor("c12a9238601d732ad0291a4ebbfb0770");
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
