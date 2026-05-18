"use client";
import "./globals.css";
import axios from 'axios';
import { Inter } from "next/font/google";
import Appbar from "./components/appbar";
import Topbar from "./components/topbar";
import TopBar1 from "./components/topbar1";
import { SessionProvider, useSession } from 'next-auth/react';
import { signOut } from "next-auth/react";
import Parent, { TokenProvider, useTokenContext } from "./components/parent";
import { useEffect, useState, useMemo } from "react";
import jwt from 'jsonwebtoken';
import { useRouter } from "next/navigation";
import { UAParser } from "ua-parser-js";

import { Spin, message, Skeleton } from 'antd';

const inter = Inter({ subsets: ["latin"] });

async function getUserDetails(name) {
  const userAgent = navigator.userAgent || "";
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice()?.type || "desktop";

  // Fetch IP Address
  const ip = await fetch("https://api64.ipify.org?format=json")
    .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch IP"))
    .then((data) => data.ip)
    .catch((err) => {
      console.error(err);
      return "Unknown";
    });

  // Fetch Location
  const location = await fetch(`http://ip-api.com/json/${ip}`)
    .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch location"))
    .catch((err) => {
      console.error(err);
      return {
        status: "Unknown",
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        timezone: "Unknown",
        isp: "Unknown",
      };
    });

  // Format IST Timestamp
  const timestamp = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const userActivities = { timestamp, ip, location, device: { type: deviceType }, userAgent, name };

  // Post User Activities
  await fetch("https://prodapis.adsgoat.in/UsersActivities/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify({ userActivities }),
  })
    .then((res) => res.ok ? res.json() : res.json().then((err) => Promise.reject(err)))
    .then((result) => {
      message.success("User activity posted successfully!");
      console.log("Response:", result);
    })
    .catch((err) => {
      console.error("Error posting user activity:", err);
      message.error(err.message || "Error posting user activity.");
    });

  return userActivities;
}

const retryFetch = async (fetchFunc, retries = 3) => {
  try {
    return await fetchFunc();  // Try the API call
  } catch (error) {
    if (retries === 1) throw error;  // Throw error if no retries left

    console.log(`Retrying... Attempts left: ${retries - 1}`);

    // Use debounce for a delay before retrying
    return new Promise((resolve, reject) => {
      debouncedRetry(fetchFunc, retries, resolve, reject);
    });
  }
};

const BodyWrapper = ({ children }) => {
  const { darkMode, userdetails } = useTokenContext();
  // console.log(userdetails);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode'); // Add class for dark mode
    } else {
      document.body.classList.remove('dark-mode'); // Remove class for light mode
    }
  }, [darkMode]);

  return <>{children}</>;
};

const UserActivities = ({ children, onComplete }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [useractivites, setuseractivites] = useState({});
  const { sessionClose, setSessionClose } = useState("open");

  useEffect(() => {
    if (sessionClose === "close") {
      const handleSignOutAcrossTabs = () => {
        console.log("Sign-out triggered across all tabs.");
        const { storedData, activeTab, showGraph } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab, showGraph });
        localStorage.removeItem("token");
        signOut(); // Sign out the user using your existing auth logic
        // Trigger the onComplete callback
      };

      const handleStorageEvent = (event) => {
        if (event.key === "signout" && event.newValue === "true") {
          // Another tab triggered the sign-out
          handleSignOutAcrossTabs();
          onComplete();
        }
      };

      window.addEventListener("storage", handleStorageEvent);

      return () => {
        window.removeEventListener("storage", handleStorageEvent);
      };
    }
  }, [sessionClose]);

  useEffect(() => {
    if (status === "authenticated") {
      const token = localStorage.getItem("token");
      console.log(token);
      let decodedToken;

      if (token) {
        // console.log("Hi");
        try {
          // Decode the token
          decodedToken = jwt.decode(token);
          // console.log("This");

          if (!decodedToken || !decodedToken.exp) {
            // console.log("is");
            console.error("Decoded token is invalid or missing 'exp' field:", decodedToken);
            throw new Error("Invalid token structure.");
          }

          // Compare the token expiration with the current time
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          // console.log("Decoded token expiration:", decodedToken.exp);
          // console.log("Current time:", currentTime);

          if (decodedToken.exp < currentTime) {
            // console.log("praveen");
            // console.log("Token is expired. Clearing localStorage and signing out.");

            // Broadcast sign-out to all tabs
            localStorage.setItem("signout", "true");

            // Clear local changes and log out
            const { storedData, activeTab, showGraph } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab, showGraph });
            localStorage.removeItem("token");
            localStorage.setItem("redirectUrl", router.pathname);
            signOut();
            setSessionClose("close");
            return;

          }
          else if (decodedToken.exp > currentTime) {
            // Token exists and is valid
            // console.log("testing");
            console.log("Token is already stored and valid:", token);
            onComplete();
          }
        } catch (err) {
          // console.error("Error decoding token or handling expiration check:", err);
          // console.log("authentication");
          // Handle invalid token gracefully
          const { storedData, activeTab } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab });
          signOut();
          onComplete();
          return;
        }
      } else {
        // console.log("for");
        console.log("No token found in localStorage.");
        onComplete();
        // signOut();
      }
    }
    if (status === "unauthenticated") {
      console.log("users");
      const { storedData, activeTab, showGraph } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab, showGraph });
      onComplete();
      // signOut();
      console.log("un auth");
    }
  }, [status]);

  return <>{children}</>;
};

const ContentWrapper = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status } = useSession(); // useSession to check login status
  const [usersDataForLogin, setusersDataForLogin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComponentMounted, setIsComponentMounted] = useState(false); // To prevent initial rendering issues

  // useEffect to fetch user data
  const fetchDataUntilSuccess = async (email, delay = 1500) => {
    while (true) {
      try {
        const response = await axios.get(`http://localhost:4000/auth/user/verify?email=${email}`);
        if (response.status === 200) {
          return [response.data.data]; // Exit loop if successful
        }
      } catch (error) {
        if (!error.response || error.response.status !== 500) {
          console.error("Non-retryable error encountered:", error);
          throw error; // Stop retrying if the error is not a 500 status
        }
        console.error("500 error encountered, retrying...");
      }
      // Wait before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          setLoading(true);

          const userData = await fetchDataUntilSuccess(session?.user?.email);
          if (isMounted) {
            setusersDataForLogin(userData);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (isMounted) setLoading(false); // Stop loading on error
        }
      } else {
        if (isMounted) setLoading(false); // Stop loading if no session
      }
    };
    fetchUserData();

    return () => {
      isMounted = false; // Cleanup on component unmount
    };
  }, [session?.user?.email]);


  useEffect(() => {
    // Mark component as mounted after all initial effects are done
    setIsComponentMounted(true);
  }, []); // This effect runs once when the component mounts

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Unified conditional logic to show either Topbar or Appbar
  const shouldRenderTopbarOrAppbar = useMemo(() => {
    if (!isComponentMounted || status === "loading" || loading) {
      return null;
    }

    if (status !== "authenticated") {
      return <Topbar />;
    }

    if ((status === "authenticated" && usersDataForLogin.length === 0 && !loading)) {
      return <TopBar1 />
    }

    if (status === "authenticated" && usersDataForLogin?.length !== 0) {
      console.log("app to console");
      return (
        <Appbar darkMode={darkMode} toggleTheme={toggleTheme} usersDataForLogin={usersDataForLogin}>
          {children}
        </Appbar>
      );
    }

    return null; // Just in case no conditions are met
  }, [status, usersDataForLogin, loading, isComponentMounted, darkMode]);

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 20 }} />
      </div>
      // <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      //   <Spin size="small" />
      // </div>
    );
  }

  return <>{shouldRenderTopbarOrAppbar}</>;
};

const AuthenticationProvider = ({ children }) => {
  const [isUserActivitiesComplete, setIsUserActivitiesComplete] = useState(false);

  const handleUserActivitiesComplete = () => {
    setIsUserActivitiesComplete(true);
  };

  return (
    <>
      {!isUserActivitiesComplete ? (
        <UserActivities onComplete={handleUserActivitiesComplete} />
      ) : (
        <TokenProvider>
          <BodyWrapper>
            <ContentWrapper className="zoom-90">{children}</ContentWrapper>
          </BodyWrapper>
        </TokenProvider>
      )}
    </>
  );
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png"  href="/ssk1.png"/>
         
      </head>
      <body className={`${inter.className} full-width `}>
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} broadcast={false}>

          <AuthenticationProvider>
            {children}
          </AuthenticationProvider>


        </SessionProvider>
      </body>
    </html>
  );
}