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
const { Content, Sider } = Layout;

function getItem(label, key, icon) {
    return {
        key,
        icon,
        label,
    };
}
<UserOutlined />
const menuItems = [
    getItem('Dashboard', '/Dashboard', <HomeOutlined />),
    getItem('Reports', '/Reports', <DatabaseOutlined />),
    getItem('Creatives', '/Creatives', <PieChartOutlined />),
    getItem('Campaigns', '/Campaigns', <DesktopOutlined />),
    getItem('Users', '/Users', <ContainerOutlined />),
    getItem('NewUser', '/NewUser', <UserOutlined />),
    getItem('Setting', '/setting', <SettingOutlined />),
    getItem('Password', '/password', <LockOutlined />),
    getItem('Sign Out', '/signout', <LogoutOutlined />),
].filter(Boolean);

const Appbar = ({ children, darkMode, toggleTheme }) => {
    const { token: { colorBgContainer } } = theme.useToken();
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const [height, setHeight] = useState(0);

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

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuItemClick = (key) => {
        router.push(key);
    };

    return (
        <Layout style={{ minHeight: height, background: darkMode ? '#333' : colorBgContainer }}>
            <Sider
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={220}
                style={{
                    background: '#39ac39',
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
                    <div style={{ marginTop: '10px' }}>
                        <Button
                            type="primary"
                            icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
                            onClick={toggleCollapsed}
                            style={{
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                border: 'none',
                                background: '#fff',
                                color: '#007BFF',
                            }}
                        />
                    </div>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{
                        background: '#39ac39',
                        color: '#007BFF',
                        fontSize: '16px',
                        borderRight: 'none',
                        marginTop: '10px', // Adjusted margin to prevent overlap
                    }}
                    onClick={(e) => handleMenuItemClick(e.key)}
                >
                    {menuItems.map(item => (
                        <Menu.Item key={item.key} icon={item.icon} style={{ borderRadius: '8px', margin: '5px 0', color: '#fff' }}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 0 : 0, transition: 'margin-left 0.2s' }}>
                <Content style={{ margin: "2px", background: darkMode ? '#333' : colorBgContainer }}>
                    <div style={{ border: "2px solid green", borderRadius: "8px", height: "100vh", overflow: "auto" }}>
                        {React.Children.map(children, child => {
                            return React.cloneElement(child, { darkMode });
                        })}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Appbar;
