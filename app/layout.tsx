import type { Metadata } from "next";
import { Rubik_Mono_One } from "next/font/google";
import "./globals.css";
import BackButton from "../components/BackButton";

const rubikMono = Rubik_Mono_One({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Future Poetic",
  description: "Future Poetic site and zine viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubikMono.className} antialiased`}>
        <BackButton />
        {children}
      </body>
    </html>
  );
}
