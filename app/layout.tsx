import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2 to Twelve - Word Puzzle Game",
  description: "Guess a 12-letter word within 12 minutes by answering 12 general knowledge questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-game-background text-game-text min-h-screen">
        {children}
      </body>
    </html>
  );
}