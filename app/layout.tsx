import "./globals.css"
import { Inter as FontSans, Poppins } from "next/font/google"
import { Providers } from "./providers";
import { cn } from "@/lib/utils"
import Header from "@/components/layout/Header";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontPoppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: "700"
})

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable, fontPoppins.variable
        )}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
