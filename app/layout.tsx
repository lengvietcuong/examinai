import type { Metadata } from "next";
import { Montserrat, Comfortaa } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const comfortaa = Comfortaa({
  subsets: ["latin", "vietnamese"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Examinai — AI-Powered IELTS Practice",
  description:
    "Practice IELTS Writing and Speaking with an AI examiner. Get instant, detailed feedback from multiple expert perspectives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${comfortaa.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
