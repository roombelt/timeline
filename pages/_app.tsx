import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { trpc } from "@/utils/trpc";

// Dynamically import the Layout component with SSR disabled
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), {
  ssr: false,
});

function Application({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </SessionProvider>
  );
}

export default trpc.withTRPC(Application);
