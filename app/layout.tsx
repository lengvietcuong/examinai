import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Examinai",
	description: "AI-powered IELTS examiner",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
