// Layout.js
"use client"
import "./globals.css";
import axios from 'axios';
import { Inter } from "next/font/google";
import Appbar from "./components/appbar";
import Topbar from "./components/topbar";
import { SessionProvider, useSession } from 'next-auth/react';
import Parent, { TokenProvider, useTokenContext } from "./components/parent";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const BodyWrapper = ({ children }) => {
  const { darkMode, userdetails } = useTokenContext();
  console.log(userdetails);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode'); // Add class for dark mode
    } else {
      document.body.classList.remove('dark-mode'); // Remove class for light mode
    }
  }, [darkMode]);

  return <>{children}</>;
};

const ContentWrapper = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status } = useSession(); // useSession to check login status
  const [usersDataForLogin, setusersDataForLogin] = useState([])

  console.log(session?.user?.email);

  // useEffect(async()=>{
  //   const userResponse = await axios.get(`https://prodapis.adsgoat.in/api/getusersData?email=${session?.user?.email}`);
  //   setusersDataForLogin(userResponse.data);
  // },[session?.user?.email]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  console.log(usersDataForLogin, "usersLogin");

  return (
    <>
      {/* Conditionally hide Topbar when the user is logged in */}
      {status !== "authenticated" && <Topbar />}
      {status === "authenticated" && (
        <Appbar darkMode={darkMode} toggleTheme={toggleTheme}>
          {children}
        </Appbar>
      )}
    </>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <SessionProvider>
          <TokenProvider>
            <BodyWrapper>
              <ContentWrapper>
                {children}
                </ContentWrapper>
            </BodyWrapper>
          </TokenProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
