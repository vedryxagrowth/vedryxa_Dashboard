"use client";
import "./globals.css";
import axios from 'axios';
import { Inter } from "next/font/google";
import Appbar from "./components/appbar";
import Topbar from "./components/topbar";
import TopBar1 from "./components/topbar1";
import { SessionProvider, useSession } from 'next-auth/react';
import Parent, { TokenProvider, useTokenContext } from "./components/parent";
import { useEffect, useState, useMemo } from "react";

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
  const [isComponentMounted, setIsComponentMounted] = useState(false); // To prevent initial rendering issues

  console.log(session?.user?.email);

  // useEffect to fetch user data
  useEffect(() => {
    let isMounted = true;

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
          setLoading(false); // Stop loading on error
        }
      } else {
        setLoading(false); // Stop loading if no session
      }
    };

    fetchUserData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [session?.user?.email]);

  useEffect(() => {
    // Mark component as mounted after all initial effects are done
    setIsComponentMounted(true);
  }, []); // This effect runs once when the component mounts

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  console.log(usersDataForLogin, "usersLogin");

  // Unified conditional logic to show either Topbar or Appbar
  const shouldRenderTopbarOrAppbar = useMemo(() => {
    if (!isComponentMounted || status === "loading" || loading) {
      return null;
    }

    if (status !== "authenticated") {
      return <Topbar />;
    }

    if ((status === "authenticated" && usersDataForLogin.length === 0 && !loading)){
      return <TopBar1 />
    }

    if (status === "authenticated" && usersDataForLogin?.length !== 0) {
      return (
        <Appbar darkMode={darkMode} toggleTheme={toggleTheme}>
          {children}
        </Appbar>
      );
    }

    return null; // Just in case no conditions are met
  }, [status, usersDataForLogin, loading, isComponentMounted, darkMode]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="small" />
      </div>
    );
  }

  return <>{shouldRenderTopbarOrAppbar}</>;
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
