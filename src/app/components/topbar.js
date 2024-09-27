// Topbar.js
import { useState, useEffect } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
const { Header } = Layout;
import { useTokenContext } from './parent';
import moment from 'moment-timezone';
import ContactForm from './mail';
import { PlusOutlined } from '@ant-design/icons';

const items = (setUserDetails, router) => [
    {
        key: "1",
        label: (
            <Button
                style={{
                    border: "none",
                    outline: "none",
                    background: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "0",
                    fontSize: "inherit",
                }}
                onClick={() => signIn()}>
                Sign in
            </Button>
        ),
    },
    {
        key: "2",
        label: (
            <Button
                style={{
                    border: "none",
                    outline: "none",
                    background: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "0",
                    fontSize: "inherit",
                }}
                onClick={() => {
                    localStorage.clear();
                    localStorage.setItem("redirectUrl", router.asPath);
                    router.push("/api/auth/signout");
                }}>
                Sign Out
            </Button>
        ),
    },
];

const Topbar = ({ session, darkMode, toggleTheme, setUserDetails }) => {

    const router = useRouter();
    const dropdownItems = items(setUserDetails, router);

    return (
        <div style={{ backgroundColor: darkMode ? '#333' : '#f0f2f5', padding: '0 20px' }}>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: darkMode ? '#fff' : '#000'
                }}
            >
                <Image
                    src="/Ads.png"
                    width={150}
                    height={60}
                    priority={true}
                    alt="Logo"
                    style={{ maxWidth: "8rem", maxHeight: "4rem" }}
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "1em",
                    }}>
                    <h2 style={{ color: darkMode ? '#fff' : '#000', margin: 0, fontSize: '1.2rem' }}>Hi {session ? session.user.name : ""}</h2>
                    <Dropdown
                        menu={{
                            items: dropdownItems
                        }}
                        placement="bottomLeft"
                        arrow={{ pointAtCenter: true }}>
                        <Avatar
                            size="large"
                            style={{
                                background: "white",
                                fontSize: "1.8em",
                            }}>
                        </Avatar>
                    </Dropdown>
                    <Switch checked={darkMode} onChange={toggleTheme} />
                    <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
            </div>
        </div>
    );
};

const LayoutWrapper = ({ children }) => {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const { data: session, status: sessionStatus } = useSession();
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [usersData, setUsersData] = useState([]);
    const { setuserdetails } = useTokenContext();

    useEffect(() => {
        if (sessionStatus === "authenticated" && !initialized) {
            const fetchData = async () => {
                try {
                    const userResponse = await axios.get(`https://prodapis.adsgoat.in/api/getusersData?email=${session.user.email}`);
                    if (userResponse.status === 200) {
                        const fetchedUsersData = userResponse.data;
                        setUsersData(fetchedUsersData);

                        if (fetchedUsersData.length > 0 &&
                            session && session.user && session.user.email &&
                            fetchedUsersData.some(user => user.email.toLowerCase() === session.user.email.toLowerCase())) {
                            const matchedUser = fetchedUsersData.find(
                                user => user.email.toLowerCase() === session.user.email.toLowerCase()
                            );

                            if (matchedUser) {
                                // setuserdetails(matchedUser);
                                switch (matchedUser.role) {
                                    case 'Media_Buyer':
                                        const MediaBuyeradAccounts = matchedUser.adAccounts;
                                        const MediaBuyerkeysOfAdAccounts = Object.keys(MediaBuyeradAccounts);
                                        const MediaBuyernewObject = {};
                                        // console.log(MediaBuyerkeysOfAdAccounts, "keys");
                                        for (let item of MediaBuyerkeysOfAdAccounts) {
                                            if (MediaBuyeradAccounts[item][0] === "All") {
                                                const networkResponse = await axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`);
                                                MediaBuyernewObject[item] = await networkResponse.data;
                                                // console.log(await networkResponse.data);
                                            }
                                            else {
                                                MediaBuyernewObject[item] = MediaBuyeradAccounts[item];
                                            }
                                        };
                                        setuserdetails({ ...matchedUser, adAccounts: MediaBuyernewObject });
                                        // console.log("New Object", MediaBuyernewObject);
                                        // console.log("Matched User:", matchedUser);
                                        //   setuserdetails({ ...matchedUser, extraInfo: "Media Buyer Specific Info" });
                                        break;
                                    case 'Special_User':
                                        const SpecialUseradAccounts = matchedUser.adAccounts;
                                        const SpecialUserkeysOfAdAccounts = Object.keys(SpecialUseradAccounts);
                                        const SpecialUsernewObject = {};
                                        // console.log(SpecialUserkeysOfAdAccounts, "keys");
                                        for (let item of SpecialUserkeysOfAdAccounts) {
                                            if (SpecialUseradAccounts[item][0] === "All") {
                                                const networkResponse = await axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`);
                                                SpecialUsernewObject[item] = await networkResponse.data;
                                                // console.log(await networkResponse.data);
                                            }
                                            else {
                                                SpecialUsernewObject[item] = SpecialUseradAccounts[item];
                                            }
                                        };
                                        setuserdetails({ ...matchedUser, adAccounts: SpecialUsernewObject });
                                        // console.log("New Object", SpecialUsernewObject);
                                        // console.log("Matched User:", matchedUser);
                                        //   setuserdetails({ ...matchedUser, extraInfo: "Special User Specific Info" });
                                        break;
                                    case 'Manager':
                                        const ManageradAccounts = matchedUser.adAccounts;
                                        const ManagerkeysOfAdAccounts = Object.keys(ManageradAccounts);
                                        const ManagernewObject = {};
                                        // console.log(ManagerkeysOfAdAccounts, "keys");
                                        for (let item of ManagerkeysOfAdAccounts) {
                                            if (ManageradAccounts[item][0] === "All") {
                                                const networkResponse = await axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`);
                                                ManagernewObject[item] = await networkResponse.data;
                                                // console.log(await networkResponse.data);
                                            }
                                            else {
                                                ManagernewObject[item] = ManageradAccounts[item];
                                            }
                                        };
                                        setuserdetails({ ...matchedUser, adAccounts: ManagernewObject });
                                        // console.log("New Object", ManagernewObject);
                                        // console.log("Matched User:", matchedUser);
                                        //   setuserdetails({ ...matchedUser, extraInfo: "Manager Specific Info" });
                                        break;
                                    case 'Admin':
                                        const AllAccountsData = await axios.get(`https://prodapis.adsgoat.in/All/Accounts/`);
                                        const responseData = await AllAccountsData.data;
                                        // console.log(responseData, "responseData");
                                        setuserdetails({ ...matchedUser, adAccounts: responseData });
                                        //   const adAccounts = matchedUser.adAccounts;
                                        //   const keysOfAdAccounts = Object.keys(adAccounts);
                                        //   const newObject ={};
                                        //   console.log(keysOfAdAccounts, "keys");
                                        //   for(let item of keysOfAdAccounts){
                                        //     if (adAccounts[item][0] === "All"){
                                        //         console.log("Yes");
                                        //         const networkResponse = await axios.get(`http://localhost:8080/network/Accounts?network=${item}`);
                                        //         newObject[item] = await networkResponse.data;
                                        //         // console.log(await networkResponse.data);
                                        //     }
                                        //     else{
                                        //         newObject[item] = adAccounts[item];
                                        //     }
                                        //   };
                                        //   setuserdetails({...matchedUser, adAccounts: newObject});
                                        //   console.log("New Object",newObject);
                                        //   console.log("Matched User:", matchedUser);
                                        //   setuserdetails({ ...matchedUser, extraInfo: "Admin Specific Info" });
                                        break;
                                    default:
                                        setuserdetails(matchedUser);
                                }
                            }

                            const email = session.user.email;
                            const tokenResponse = await axios.post('/api/auth/jwt', { email });
                            const token = tokenResponse.data.token;

                            if (!localStorage.getItem("token")) {
                                localStorage.setItem("token", token);
                            } else {
                                // console.log("Token is already stored:", localStorage.getItem("token"));
                                console.log("Token is already stored");
                            }
                        } else {
                            console.error('Invalid user data or user email mismatch');
                            localStorage.removeItem("token");
                        }
                    } else {
                        console.error('Failed to fetch users data');
                    }
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    setLoading(false);
                    setInitialized(true);
                }
            };

            fetchData();
        }
    }, [session, sessionStatus, initialized]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <>
            <Topbar session={session} darkMode={darkMode} toggleTheme={toggleTheme} />
            {session && usersData && usersData.length > 0 &&
                session.user && session.user.email ? (
                usersData.some(user => user.email.toLowerCase() === session.user.email.toLowerCase()) ? (
                    loading ? (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        React.Children.map(children, child => {
                            return React.cloneElement(child, { darkMode: darkMode });
                        })
                    )
                ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
                        <img
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '90vh',
                            }}
                            src="/hope.png"
                            alt="img"
                        />
                        <div style={{ position: 'absolute', top: 40, right: 4, zIndex: 2, border: "2px dotted green", padding: "1%" }}>
                            <h3>You are not Authorized {session.user.email}`</h3>
                            <ContactForm />
                        </div>
                    </div>

                )
            ) : (
                <img
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '90vh',
                    }}
                    src="/hope.png"
                    alt="img"
                    as="image"
                />
            )}

        </>
    );
};

export default LayoutWrapper;
