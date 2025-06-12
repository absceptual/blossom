
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

import "@/styles/globals.css";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
