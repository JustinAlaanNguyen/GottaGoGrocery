// frontend/pages/_app.tsx
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import theme from "../theme";
import localFont from "next/font/local";

// ✅ load your font
const kugile = localFont({
  src: "../public/fonts/Kugile_Demo.ttf",
  variable: "--font-kugile",
});

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        {/* 👇 add the className so Chakra + Next know about it */}
        <main className={kugile.variable}>
          <Component {...pageProps} />
        </main>
      </ChakraProvider>
    </SessionProvider>
  );
}
