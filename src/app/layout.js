// Layout.js
"use client"
import "./globals.css";
import { Inter } from "next/font/google";
import Appbar from "./components/appbar";
import Topbar from "./components/topbar";
import { SessionProvider, useSession } from 'next-auth/react';
import Parent, { TokenProvider } from "./components/parent";
import LayoutWrapper from "./components/topbar";

const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head >
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <TokenProvider>
            <LayoutWrapper>
              <Appbar>
                {children}
              </Appbar>
            </LayoutWrapper>
          </TokenProvider>
        </SessionProvider>

      </body>
    </html>
  );
}
