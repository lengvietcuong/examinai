import type { Metadata } from "next";
import { Montserrat, Comfortaa, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/provider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const comfortaa = Comfortaa({
  subsets: ["latin", "vietnamese"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Examinai - AI-Powered IELTS Practice",
  description:
    "Practice IELTS Writing and Speaking with an AI examiner. Get instant, detailed feedback from multiple expert perspectives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${comfortaa.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
