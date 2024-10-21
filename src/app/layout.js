"use client";
import "./globals.css";
import axios from 'axios';
import { Inter } from "next/font/google";
import Appbar from "./components/appbar";
import Topbar from "./components/topbar";
import { SessionProvider, useSession } from 'next-auth/react';
import Parent, { TokenProvider, useTokenContext } from "./components/parent";
import { useEffect, useState } from "react";

import {Spin} from 'antd';

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
  const [usersDataForLogin, setusersDataForLogin] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(session?.user?.email);

  // Refactored useEffect with proper async handling to prevent destroy function error
  useEffect(() => {
    let isMounted = true; // Track if the component is still mounted

    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
        setLoading(true);
          const userResponse = await axios.get(`https://prodapis.adsgoat.in/api/getusersData?email=${session?.user?.email}`);
          if (isMounted) {
            setusersDataForLogin(userResponse.data);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false); // Make sure to stop loading in case of an error
        }
      } else {
        setLoading(false); // Stop loading if there is no session
      }
    };

    fetchUserData();

    // Cleanup function to set `isMounted` to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [session?.user?.email]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  console.log(usersDataForLogin, "usersLogin");

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="small" /> 
      </div>
    );
  }

  return (
    <>
      {/* Conditionally hide Topbar when the user is logged in */}
      {status !== "authenticated" || (status === "authenticated" && usersDataForLogin && usersDataForLogin?.length === 0 && !loading) ? <Topbar /> : null}

      {/* {status === "authenticated" && usersDataForLogin?.length === 0 && <Topbar/> } */}
      {status === "authenticated" && usersDataForLogin?.length !== 0 && (
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
      <body className={`${inter.className} full-width`}>
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









