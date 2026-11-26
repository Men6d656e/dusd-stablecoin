import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TestnetBanner } from "@/components/TestnetBanner";
import {
  activeChainId,
  activeNetwork,
  activeNetworkConfig,
  safetyLabel,
} from "@/lib/networks";
import { wagmiConfig } from "@/lib/wagmi/config";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `dUSD — fiat-backed stablecoin (${activeNetworkConfig.label})`,
  description: `A fiat-backed stablecoin case study on ${activeNetworkConfig.label} (chain ${activeChainId}). ${safetyLabel(activeNetwork)} · No real money.`,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookie = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <Providers initialState={initialState}>
          <TestnetBanner />
          <SiteHeader />
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
