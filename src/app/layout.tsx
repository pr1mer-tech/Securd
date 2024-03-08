import React, { ReactNode } from "react";
import "./styles/globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Header from "@/components/Header/Header";
import Modals from "./Modals";
import StyledComponentsRegistry from "./styles/registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Securd",
  description: "Multichain DEFI protocol",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <StyledComponentsRegistry>
            <div>
              <Header />
              {children}
            </div>
          </StyledComponentsRegistry>
          <Modals />
        </Providers>
      </body>
    </html>
  );
}
