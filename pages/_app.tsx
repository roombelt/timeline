import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import "./styles.css";
import Head from "next/head";

// Dynamically import the Layout component with SSR disabled
const ApplicationLayout = dynamic(() => import("@/src/layout/index"), {
  ssr: false,
});

export default function Application({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Roombelt Timeline</title>
        <meta name="description" content="Various utilities for calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FullPageLoader />
      <ApplicationLayout>
        <Component {...pageProps} />
      </ApplicationLayout>
    </SessionProvider>
  );
}

function FullPageLoader() {
  return (
    <div id="loader-wrapper">
      <svg id="loader-logo" viewBox="0 0 876.000000 573.000000">
        <g transform="translate(0.000000,573.000000) scale(0.100000,-0.100000)" fill="#1857a2" stroke="none">
          <path
            d="M723 5313 c-398 -230 -719 -420 -715 -424 15 -15 1432 -829 1442
-829 6 0 10 70 10 205 l0 206 1813 -3 1812 -3 77 -22 c158 -45 258 -115 336
-235 134 -206 145 -480 29 -717 -44 -91 -151 -198 -242 -244 -154 -77 -51 -71
-1295 -78 -1209 -6 -1168 -4 -1321 -62 -179 -68 -282 -188 -341 -402 l-23 -80
-3 -1072 -3 -1073 426 0 425 0 2 905 3 905 28 27 27 28 657 0 657 0 348 -590
c571 -967 555 -941 626 -1016 105 -112 227 -173 434 -218 150 -32 330 -41 876
-41 l502 0 0 -240 c0 -132 3 -240 8 -240 16 1 1434 826 1434 835 1 9 -1418
835 -1434 835 -5 0 -8 -108 -8 -241 l0 -240 -507 3 c-594 4 -579 2 -673 96
-59 60 -61 64 -464 757 l-215 369 102 36 c254 90 461 241 618 453 384 515 397
1377 28 1867 -191 254 -502 440 -848 510 -196 39 -264 40 -2103 40 l-1788 0 0
205 c0 113 -3 205 -7 205 -5 0 -333 -188 -730 -417z"
          />
        </g>
      </svg>
      <div id="loader"></div>
    </div>
  );
}
