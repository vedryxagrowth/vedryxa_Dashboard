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
    UserOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession } from 'next-auth/react';
const { Content, Sider } = Layout;
import Image from "next/image";
import LayoutWrapper from './topbar';
import { useTokenContext } from './parent';
function getItem(label, key, icon) {
    return {
        key,
        icon,
        label,
    };
}
{/* <UserOutlined /> */}
const menuItems = [
    getItem('Dashboard', '/Dashboard', <HomeOutlined />),
    getItem('Reports', '/Reports', <DatabaseOutlined />),
    getItem('Creatives', '/Creatives', <PieChartOutlined />),
    getItem('Campaigns', '/Campaigns', <DesktopOutlined />),
    // getItem('Users', '/Users', <ContainerOutlined />),
    getItem('NewUser', '/NewUser', <UserOutlined />),
    getItem('Setting', '/setting', <SettingOutlined />),
    getItem('Password', '/password', <LockOutlined />),
    getItem('Sign Out', '/signout', <LogoutOutlined />),
].filter(Boolean);

const Appbar = ({ children }) => {
    const { darkMode, toggleTheme } = useTokenContext();
    const { session, status } = useSession(); // useSession to check login status
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const [height, setHeight] = useState(0);
    console.log(session?.user?.email)
    const { userdetails } = useTokenContext();
    console.log(userdetails);

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
        <Layout style={{ minHeight: height, backgroundColor: darkMode ? '#333' : '#fff' }}>
            
            <Sider
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={220}
                style={{
                    backgroundColor: darkMode ? '#333' : '#fff' ,
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
                    <div style={{ marginTop: '1.6rem',position:"absolute",left:"auto",right:"20px",zIndex:"999 !important", }}>
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
                                zIndex:"999"
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
                        backgroundColor: darkMode ? '#333' : '#fff' ,
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
                        src="/ssk1.png"
                        width={100}   // Smaller logo when collapsed
                        height={50}
                        priority={true}
                        alt="Collapsed Logo"
                        style={{ margin: "0px 12px", width:"60%",height:"revert-layer",objectFit:"contain" }}
                        />
                        ) : (
                            <Image
                            src="/RR1.png"
                            width={150}  // Larger logo when expanded
                            height={60}
                            priority={true}
                            alt="Expanded Logo"
                            style={{ margin: "0px 20px" }}
                            />
                        )}
                    {menuItems.map(item => (
                        <Menu.Item key={item.key} icon={item.icon} style={{ borderRadius: '8px', margin: '5px 0',  color: darkMode ? '#fff' : '#000', fontWeight: "500", fontSize: "16px" }}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>

            </Sider>
           
            <Layout style={{ marginLeft: collapsed ? 0 : 0, transition: 'margin-left 0.2s', backgroundColor: darkMode ? '#262426d6' : '#f5f5f5'  }}>
                 <LayoutWrapper/>
               
                    <div style={{ border: "", margin:"0px 10px", borderRadius: "", height: "86vh", overflow: "auto",  backgroundColor: darkMode ? '#333' : '#fff' ,scrollbarWidth:"thin "}}>
                   

                        {React.Children.map(children, child => {
                            return React.cloneElement(child, { darkMode });
                        })}
                    </div>
               
            </Layout>
        </Layout>
    );
};

export default Appbar;
