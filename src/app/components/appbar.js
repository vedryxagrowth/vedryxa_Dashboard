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
import { Layout, Menu, Button, theme, message, Spin } from 'antd';
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
import dayjs from 'dayjs';
function getItem(label, key, icon) {
    return {
        key,
        icon,
        label,
    };
}

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
          // message.success("User activity posted successfully!");
          console.log("Response:", result);
        })
        .catch((err) => {
          console.error("Error posting user activity:", err);
          // message.error(err.message || "Error posting user activity.");
        });
  
      return userActivities;
    }
  
    
    
    useEffect(() => {
        if (status === "authenticated") {
          const token = localStorage.getItem("token");
          let decodedToken;
    
          if (token) {
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
    const [moveForward, setMoveForward] = useState(false);

    const handleUserActivitiesComplete = () => {
        setIsUserActivitiesComplete(true);
    };

    const handleMoveForward = () =>{
      setMoveForward(true);
    }
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
        getItem('Dashboard', '/Dashboard', <HomeOutlined className={pathname === '/Dashboard' && 'black-icon'}/>),
        usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Reports', '/Reports', <DatabaseOutlined  className={pathname === '/Reports' && 'black-icon'}/>),
        usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Creatives', '/Creatives', <PieChartOutlined  className={pathname === '/Creatives' && 'black-icon'}/>),
        usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Campaigns', '/Campaigns', <DesktopOutlined  className={pathname === '/Campaigns' && 'black-icon'}/>),
        // getItem('Users', '/Users', <ContainerOutlined />),
        usersDataForLogin[0]?.role === 'Admin' && getItem('NewUser', '/NewUser', <UserOutlined  className={pathname === '/NewUser' && 'black-icon'}/>),
        usersDataForLogin[0]?.role === 'Admin' && getItem('Activities', '/Activities', <LaptopOutlined  className={pathname === '/Activities' && 'black-icon'}/>),
    ].filter(Boolean);

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
                            icon={collapsed ? <DoubleRightOutlined className='black-icon'/> : <DoubleLeftOutlined className='black-icon' />}
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
                        <Menu.Item key={item.key} icon={item.icon}  style={{ borderRadius: '8px', margin: '5px 0', color: darkMode ? 'green' : '#000', fontWeight: "500", fontSize: "16px" }}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>

            </Sider>

            <Layout style={{ marginLeft: collapsed ? 0 : 0, transition: 'margin-left 0.2s', backgroundColor: darkMode ? '#262426d6' : '#f5f5f5' }}>
                
              
                <LayoutWrapper usersDataForLogin={usersDataForLogin} onComplete={handleMoveForward} style={{position:'absolute'}}/>
                {!moveForward &&
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Spin size="large" />
                </div>}
                
                {moveForward && (
  <div
    style={{
      margin: "0px 10px",
      height: "86vh",
      overflowY: 'auto',
      backgroundColor: darkMode ? '#333' : '#f0f0f0',
      scrollbarWidth: "thin",
    }}
  >
    {/* Full-height flex column */}
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Main content */}
      <div>
        {React.Children.map(children, child => {
          return React.cloneElement(child, { darkMode });
        })}
      </div>

      {/* Footer always at bottom of 86vh */}
      <div style={{ marginTop: '50px', marginLeft: '15px', marginBottom:'10px' }}>
        <h4 style={{ fontWeight: "200", margin: 0 }}>
          Copyright © {dayjs().format('YYYY')} All rights reserved | vyaktimetrics
        </h4>
      </div>
    </div>
  </div>
)}


            </Layout>
        </Layout>
      )}
    </>
        
    );
};

export default Appbar;