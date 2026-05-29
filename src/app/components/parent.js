// // // parent.ja
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';

// const TokenContext = createContext();

// export const useTokenContext = () => useContext(TokenContext);

// export const TokenProvider = ({ children }) => {
//     const { data: session } = useSession();
//     const [userdetails, setuserdetails] = useState(null);
//     const [darkMode, setDarkMode] = React.useState(false);

//     const toggleTheme = () => {
//       setDarkMode(!darkMode);
//     };
//     // useEffect(() => {
//     //     if (session) {
//     //         setToken(session);
//     //     }
//     // }, [session]);

//     return (
//         <TokenContext.Provider value={{ userdetails, setuserdetails,toggleTheme }}>
//             {children}
//         </TokenContext.Provider>
//     );
// };
// parent.js (TokenProvider)
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';

// const TokenContext = createContext();

// export const useTokenContext = () => useContext(TokenContext);
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import 'ag-grid-enterprise';
// export const TokenProvider = ({ children }) => {

//   const { data: session } = useSession();
//   const [userdetails, setuserdetails] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);
//   const [theme, setTheme] = useState('light'); // Default theme is light


//   const toggleTheme = () => {
//     setDarkMode(!darkMode);
//     setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
//   };

//   return (
//     <TokenContext.Provider value={{ userdetails, setuserdetails, darkMode, toggleTheme,theme }}>
//       {children}
//     </TokenContext.Provider>
//   );
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const TokenContext = createContext();

export const useTokenContext = () => useContext(TokenContext);

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import 'ag-grid-enterprise';
import ChatWidget from './supportchat';
import ChatWithAI from './chartwithAI'

export const TokenProvider = ({ children }) => {
  const { data: session } = useSession();
  const [cachedSession, setCachedSession] = useState(null);
  const [userdetails, setuserdetails] = useState(null);
  const [jwttoken, setjwttoken] = useState(null);

  // We need a flag to determine if we're on the client-side to avoid the hydration error
  const [isMounted, setIsMounted] = useState(false);

  const [theme, setTheme] = useState('light'); // Default to light theme
  const [darkMode, setDarkMode] = useState(false);

  // console.log(session);

  useEffect(() => {
    // After the component mounts, we can access localStorage and set the theme
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Only apply the theme to the body after the component has mounted to prevent hydration issues
  useEffect(() => {
    if (isMounted) {
      const body = document.body;
      body.classList.remove('light', 'dark');
      body.classList.add(theme);
    }
  }, [theme, isMounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setDarkMode(newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  const token = jwttoken ? jwttoken : typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '';
  const apiClient = axios.create({
    baseURL: 'https://app.vyaktimetrics.com', // Relative URL
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token, // Use session token if available
    },
  });

  if (!isMounted) {
    // While the component is mounting, render nothing to avoid mismatch between SSR and client
    return null;
  }

  return (
    <TokenContext.Provider value={{ userdetails, setuserdetails, darkMode, toggleTheme, theme, apiClient, setjwttoken }}>
      {/* {userdetails && userdetails.role !== "Revenue_Partner" && <ChatWithAI />} */}
      {/* {userdetails && userdetails.role !== "Revenue_Partner" && <ChatWidget />} */}
      {children}
    </TokenContext.Provider>
  );
};
