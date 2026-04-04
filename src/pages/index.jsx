import Head from "next/head";
import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Pikachu Card Matching</title>
                <meta name="description" content="Classic Pikachu card matching game built with Phaser 3 and Next.js" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <AppWithoutSSR />
            </main>
        </>
    );
}
