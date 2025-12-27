import type { Metadata } from "next";
import { Bungee, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

const metadataBase = new URL(siteUrl);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "japanese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ダーツ自己紹介カードメーカー",
  description:
    "ダーツの自己紹介カードを作ってPNG出力し、Xで #ダーツ好きと繋がりたい #ダーツ自己紹介カード と一緒に投稿できます。",
  applicationName: "ダーツ自己紹介カードメーカー",
  metadataBase,
  openGraph: {
    title: "ダーツ自己紹介カードメーカー",
    description:
      "ダーツの自己紹介カードを作ってPNG出力し、Xで #ダーツ好きと繋がりたい #ダーツ自己紹介カード と一緒に投稿できます。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ダーツ自己紹介カードメーカー",
    description:
      "ダーツの自己紹介カードを作ってPNG出力し、Xで #ダーツ好きと繋がりたい #ダーツ自己紹介カード と一緒に投稿できます。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
