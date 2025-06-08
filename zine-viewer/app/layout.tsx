import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zine Viewer",
  description: "Minimal floating zine viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
