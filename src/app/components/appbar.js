"use client";
import {
    HomeOutlined,
    PieChartOutlined,
    DesktopOutlined,
    ContainerOutlined,
    SettingOutlined,
    LockOutlined,
    LogoutOutlined,
    DoubleRightOutlined,
    DoubleLeftOutlined,
    DatabaseOutlined,
    UserOutlined,
    LaptopOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, message } from 'antd';
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from 'next-auth/react';
const { Content, Sider } = Layout;
import Image from "next/image";
import LayoutWrapper from './topbar';
import { useTokenContext } from './parent';
import { UAParser } from "ua-parser-js";
import jwt from 'jsonwebtoken';
import axios from 'axios';
function getItem(label, key, icon) {
    return {
        key,
        icon,
        label,
    };
}
{/* <UserOutlined /> */ }
// const menuItems = [
//     getItem('Dashboard', '/Dashboard', <HomeOutlined />),
//     getItem('Reports', '/Reports', <DatabaseOutlined />),
//     getItem('Creatives', '/Creatives', <PieChartOutlined />),
//     getItem('Campaigns', '/Campaigns', <DesktopOutlined />),
//     // getItem('Users', '/Users', <ContainerOutlined />),
//     getItem('NewUser', '/NewUser', <UserOutlined />),
//     getItem('Setting', '/setting', <SettingOutlined />),
//     getItem('Password', '/password', <LockOutlined />),
//     getItem('Sign Out', '/signout', <LogoutOutlined />),
// ].filter(Boolean);

// const retryFetch = async (fetchFunc, retries = 3) => {
//     try {
//         return await fetchFunc();  // Try the API call
//     } catch (error) {
//         if (retries === 1) throw error;  // Throw error if no retries left
  
//         console.log(`Retrying... Attempts left: ${retries - 1}`);
        
//         // Use debounce for a delay before retrying
//         return new Promise((resolve, reject) => {
//             debouncedRetry(fetchFunc, retries, resolve, reject);
//         });
//     }
// };

const UserLocationFinder = ({ children, onComplete }) => {
    const router = useRouter();
    const { data: session, status } = useSession();
  
    async function getUserDetails(name) {
      const userAgent = navigator.userAgent || "";
      const parser = new UAParser(userAgent);
      const deviceType = parser.getDevice()?.type || "desktop";
  
      // Fetch IP Address
      const ip = await fetch("https://api64.ipify.org?format=json")
        .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch IP")))
        .then((data) => data.ip)
        .catch((err) => {
          console.error(err);
          return "Unknown";
        });
  
      // Fetch Location
      const location = await fetch(`https://prodapis.adsgoat.in/geolocationDetails?ip=${ip}`)
        .then((res) =>
          res.ok ? res.json() : Promise.reject("Failed to fetch location")
        )
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
  
      const userActivities = {
        timestamp,
        ip,
        location,
        device: { type: deviceType },
        userAgent,
        name,
      };
  
      // Post User Activities
      await fetch("https://prodapis.adsgoat.in/UsersActivities/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ userActivities }),
      })
        .then((res) =>
          res.ok ? res.json() : res.json().then((err) => Promise.reject(err))
        )
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
  
    
    
    useEffect(() => {
        if (status === "authenticated") {
          const token = localStorage.getItem("token");
          let decodedToken;
    
          if (token) {
            // try {
            //   // Decode the token
            //   decodedToken = jwt.decode(token);
    
            //   if (!decodedToken || !decodedToken.exp) {
            //     console.error("Decoded token is invalid or missing 'exp' field:", decodedToken);
            //     throw new Error("Invalid token structure.");
            //   }
    
            //   // Compare the token expiration with the current time
            //   const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            //   console.log("Decoded token expiration:", decodedToken.exp);
            //   console.log("Current time:", currentTime);
    
            //   if (decodedToken.exp < currentTime) {
            //     console.log("Token is expired. Clearing localStorage and signing out.");
    
            //     // Broadcast sign-out to all tabs
            //     localStorage.setItem("signout", "true");
    
            //     // Clear local changes and log out
            //     localStorage.clear();
            //     localStorage.removeItem("token");
            //     localStorage.setItem("redirectUrl", router.pathname);
            //     signOut();
            //     return;
            //   }
            //   else{onComplete()}
            // } catch (err) {
            //   console.error("Error decoding token or handling expiration check:", err);
            //   // Handle invalid token gracefully
            //   localStorage.clear();
            //   signOut();
            //   onComplete();
            //   return;
            // }
            onComplete();
          } else {
            console.log("No token found in localStorage. Proceeding to generate.");
            if (!localStorage.getItem("isProcessing")) {
              // Set a lock to indicate processing
              localStorage.setItem("isProcessing", "true");
    
              // Generate token and fetch user details
              const processUserDetails = async () => {
                const email = session.user.email;
                const tokenResponse = await axios.post("/api/auth/jwt", { email });
                const token = tokenResponse.data.token;
                localStorage.setItem("token", token);
                await getUserDetails(session?.user?.email);
              };
    
              processUserDetails()
                .then(() => {
                  console.log("Token generated and user details fetched.");
                })
                .catch((err) => {
                  console.error("Error during token generation:", err);
                })
                .finally(() => {
                  // Remove the lock
                  localStorage.removeItem("isProcessing");
                  onComplete();
                });
            } else {
              console.log("Another tab is already processing. Waiting...");
            }
          }
        }
        if(status === "unauthenticated"){
            signOut();
            onComplete();
        }
      }, [status]);

  
    return <>{children}</>;
};

const Appbar = ({ children, usersDataForLogin }) => {
    const { darkMode, toggleTheme } = useTokenContext();
    const { session, status } = useSession(); // useSession to check login status
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const [height, setHeight] = useState(0);
    // console.log(session?.user?.email)
    const { userdetails } = useTokenContext();
    const [isUserActivitiesComplete, setIsUserActivitiesComplete] = useState(false);

    const handleUserActivitiesComplete = () => {
        setIsUserActivitiesComplete(true);
    };
    // console.log(userdetails);

    useEffect(() => {
        const handleResize = () => {
            setHeight(window.innerHeight); // Set the height to the viewport height
        };

        handleResize(); // Set initial height
        window.addEventListener("resize", handleResize); // Listen for window resize events

        return () => {
            window.removeEventListener("resize", handleResize); // Clean up event listener
        };
    }, []);
    const menuItems = [
        getItem('Dashboard', '/Dashboard', <HomeOutlined />),
        usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Reports', '/Reports', <DatabaseOutlined />),
        usersDataForLogin[0]?.role === 'Admin' && getItem('Creatives', '/Creatives', <PieChartOutlined />),
        usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Campaigns', '/Campaigns', <DesktopOutlined />),
        // getItem('Users', '/Users', <ContainerOutlined />),
        usersDataForLogin[0]?.role === 'Admin' && getItem('NewUser', '/NewUser', <UserOutlined />),
        usersDataForLogin[0]?.role === 'Admin' && getItem('Activities', '/Activities', <LaptopOutlined />),
    ].filter(Boolean);

    //     useEffect(async()=>{
    //     const userResponse = await axios.get(`https://prodapis.adsgoat.in/api/getusersData?email=${session?.user?.email}`);
    //     setusersDataForLogin(userResponse.data);
    //   },[session?.user?.email]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuItemClick = (key) => {
        router.push(key);
    };

    return (
        <>
      {!isUserActivitiesComplete ? (
        <UserLocationFinder onComplete={handleUserActivitiesComplete} />
      ) : (
        <Layout style={{ minHeight: height, backgroundColor: darkMode ? '#333' : '#fff' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={220}
                style={{
                    backgroundColor: darkMode ? '#333' : '#fff',
                    color: darkMode ? '#fff' : '#000',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    height: '100vh',

                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '16px',
                        position: 'relative',
                        width: '100%',
                    }}
                >
                    <div style={{ marginTop: '1.6rem', position: "absolute", left: "auto", right: "20px", zIndex: "999 !important", }}>
                        <Button
                            type="primary"
                            icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
                            onClick={toggleCollapsed}
                            style={{
                                borderRadius: '50%',
                                width: '35px',
                                height: '35px',
                                // border: 'none',
                                // background: '#fff',
                                // color: '#007BFF',
                                background: "rgb(199 243 154)",
                                color: "rgb(56 102 121)",
                                border: `solid 5px ${darkMode ? '#282628' : '#f1f1f1'}`,

                                position: "fixed",
                                zIndex: "999"
                            }}
                        />
                    </div>
                </div>

                {/* <Menu
                
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{
                        background: '',
                        color: '#007BFF',
                        fontSize: '16px',
                        borderRight: 'none',
                        marginTop: '10px', // Adjusted margin to prevent overlap
                    }}
                    onClick={(e) => handleMenuItemClick(e.key)}
                >
                    {menuItems.map(item => (
                        <Menu.Item key={item.key} icon={item.icon} style={{ borderRadius: '8px', margin: '5px 0', color: '#384551', fontWeight:"500", fontSize:"16px " }}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu> */}
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{
                        backgroundColor: darkMode ? '#333' : '#fff',
                        color: darkMode ? '#007BFF' : '#000',
                        // color: '#007BFF',
                        fontSize: '16px',
                        borderRight: 'none',
                        marginTop: '10px',

                    }}
                    onClick={(e) => handleMenuItemClick(e.key)}
                >
                    {/* <Image
                        src="/Ads.png"
                        width={150}
                        height={60}
                        priority={true}
                        alt="Logo"
                        // style={{ maxWidth: "8rem", maxHeight: "4rem", marginBottom: '10px', margin:"0px 20px"}} // Optional margin for spacing
                        style={{ margin:"0px 20px"}} // Optional margin for spacing
                    /> */}
                    {collapsed ? (
                        <Image
                            // src="/ssk1.png"
                            src={darkMode ? "/ssk2.png" : "/ssk1.png"}
                            width={100}   // Smaller logo when collapsed
                            height={50}
                            priority={true}
                            alt="Collapsed Logo"
                            style={{ margin: "0px 12px", width: "60%", height: "revert-layer", objectFit: "contain" }}
                        />
                    ) : (
                        <Image
                            // src="/RR1.png"
                            src={darkMode ? "/4.png" : "/RR1.png"}
                            width={150}  // Larger logo when expanded
                            height={60}
                            priority={true}
                            alt="Expanded Logo"
                            style={{ margin: "0px 20px", objectFit: "cover" }}
                        />
                    )}
                    {menuItems.map(item => (
                        <Menu.Item key={item.key} icon={item.icon} style={{ borderRadius: '8px', margin: '5px 0', color: darkMode ? '#fff' : '#000', fontWeight: "500", fontSize: "16px" }}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>

            </Sider>

            <Layout style={{ marginLeft: collapsed ? 0 : 0, transition: 'margin-left 0.2s', backgroundColor: darkMode ? '#262426d6' : '#f5f5f5' }}>
                <LayoutWrapper usersDataForLogin={usersDataForLogin} />

                <div style={{ border: "", margin: "0px 10px", borderRadius: "", height: "86vh", overflow: "auto", backgroundColor: darkMode ? '#333' : '#f0f0f0', scrollbarWidth: "thin " }}>


                    {React.Children.map(children, child => {
                        return React.cloneElement(child, { darkMode });
                    })}
                </div>

            </Layout>
        </Layout>
      )}
    </>
        
    );
};

export default Appbar;