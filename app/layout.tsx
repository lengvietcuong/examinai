import type { Metadata } from "next";
import { Montserrat, Comfortaa } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});
const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Examinai",
  description:
    "Supercharge your IELTS preparation with a personalized examiner. Enjoy a natural, engaging learning experience without formulas or rote memorization.",
};

export const maxDuration = 5;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${comfortaa.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
