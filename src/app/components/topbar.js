// Topbar.js
import { useState, useEffect } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin, Form, Input, Divider, Modal } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
const { Header } = Layout;
import { useTokenContext } from './parent';
import moment from 'moment-timezone';
import ContactForm from './mail';
import { GoogleOutlined, LockOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Moon, Sun } from 'lucide-react';
import { getSession } from 'next-auth/react';
import debounce from 'lodash.debounce';



const items = (setuserdetails, router) => [
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

// const Topbar = ({ session, darkMode, toggleTheme, setUserDetails }) => {

//     const router = useRouter();
//     const dropdownItems = items(setUserDetails, router);

//     return (
//         <div style={{ backgroundColor: darkMode ? '#333' : '#fff', padding: '0 20px',margin:"10px" }}>
//             <div>
               
//                 <div
//                     style={{
//                         display: "flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                         gap: "1em",
//                         height :"60px",
//                         justifyContent:"end"
//                     }}>
//                     <h2 style={{ color: darkMode ? '#fff' : '#000', margin: 0, fontSize: '1.2rem' }}>Hi {session ? session.user.name : ""}</h2>
//                     <Dropdown
//                         menu={{
//                             items: dropdownItems
//                         }}
//                         placement="bottomLeft"
//                         arrow={{ pointAtCenter: true }}>
//                         <Avatar
//                             size="large"
//                             style={{
//                                 background: "#ebebeb",
//                                 fontSize: "1.8em",
//                             }}>
//                         </Avatar>
//                     </Dropdown>
//                     <Switch checked={darkMode} onChange={toggleTheme} />
//                     <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
//                 </div>
//             </div>
//         </div>
//     );
// };
const Topbar = ({  }) => {
    const { darkMode, toggleTheme, usersData } = useTokenContext();
  const router = useRouter();
  const { data: session, status } = useSession();
//   const [darkMode, setDarkMode] = React.useState(false);

//   const toggleTheme = () => {
//     setDarkMode(!darkMode);

const {userdetails} = useTokenContext();

const [userProfile, setUserProfile] = useState(userdetails);

useEffect(() => {
    if(userdetails){
        setUserProfile(userdetails);
    }
}, [userdetails]);

const handleProfileUpdate = (updatedProfileData) => {
    setUserProfile(prev => ({
        ...prev,
        ...updatedProfileData,
    }));
};
//   };

const [isModalVisible, setIsModalVisible] = useState(false);

const openProfileModal = () => {
  setIsModalVisible(true);
};

const onHandleCancel = () => {
  setIsModalVisible(false);
}

const renderAdAccounts = () => {
  if (!userdetails?.adAccounts) return null;

  return Object.keys(userdetails.adAccounts).map((key) => (
      <div key={key} style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h4>{key}:</h4>
          <ul>
              {userdetails.adAccounts[key].map((accountId, index) => (
                  <li key={index}>{typeof accountId === 'object' ? accountId.accountNumber : accountId}</li>
              ))}
          </ul>
      </div>
  ));
};

const dropdownItems = status === 'authenticated' ? [
  {
    key: '1',
    label: (
      <a onClick={openProfileModal} style={{padding: '5px'}}>
        Profile
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a
        onClick={() => {
          localStorage.clear();
          localStorage.setItem('redirectUrl', router.asPath);
          router.push('/api/auth/signout');
        }}
      >
        Sign Out
      </a>
    ),
  },
] : [
  {
    key: '1',
    label: (
      <a href="/api/auth/signin">Sign in</a>
    ),
  },
];

const maleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960655/3d-rendering-cartoon-character-with-eyeglasses-jacket_lu1cqi.jpg';

const femaleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960642/portrait-3d-female-doctor_cei7bm.jpg';

const getAvatarSrc = () => {
  if (userdetails?.gender === 'Male') {
    return maleImoji;
  } else if (userdetails?.gender === 'Female') {
    return femaleImoji;
  }
  // return defaultImoji
}

  // const dropdownItems = [
  //   {
  //     key: '1',
  //     label: (
  //       <a href="/api/auth/signin">Sign in</a>
  //     ),
  //   },
  //   {
  //     key: '2',
  //     label: (
  //       <a
  //         onClick={() => {
  //           localStorage.clear();
  //           localStorage.setItem('redirectUrl', router.asPath);
  //           router.push('/api/auth/signout');
  //         }}
  //       >
  //         Sign Out
  //       </a>
  //     ),
  //   },
  // ];

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#333' : '#fff',
        // width:'100%',
        paddingRight: '20px',
        margin: '10px',
        display:'flex',
        justifyContent:"space-between",
        alignItems:'center'
        // transition: 'background-color 0.3s ease',
      }}
    >
      <div>
        {(status !== "authenticated" || (status === "authenticated" && usersData?.length === 0)) ? (
          <Image
            src="/Ads.png"
            width={150}
            height={60}
            priority={true}
            alt="Logo"
            // style={{ maxWidth: "8rem", maxHeight: "4rem", marginBottom: '10px', margin:"0px 20px"}} // Optional margin for spacing
            style={{ margin:"0px 20px"}} // Optional margin for spacing
          />
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1em',
          height: '60px',
          justifyContent: 'flex-end',
        }}
      >
        <h2
          style={{
            color: darkMode ? '#fff' : '#000',
            margin: 0,
            fontSize: '1.2rem',
            transition: 'color 0.3s ease',
          }}
        >
          Hi, {session?.user?.name || ''}
        </h2>
        <Dropdown
          menu={{
            items: dropdownItems,
          }}
          placement="bottomLeft"
          arrow={{ pointAtCenter: true }}
        >
          <Avatar
            size="large"
            src={getAvatarSrc()}
            style={{
              background: darkMode ? '#333' : '#ebebeb',
              fontSize: '1.8em',
              transition: 'background 0.3s ease',
            }}
          />
        </Dropdown>
        
        {/* <Button
        onClick={toggleTheme}
        style={{
          backgroundColor: darkMode ? '#333' : '#f0f0f0',
          color: darkMode ? '#fff' : '#000',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </Button> */}
      <button
        onClick={toggleTheme}
        className={`theme-toggle-btn ${darkMode ? 'dark-mode' : 'light-mode'}`}
      >
        {darkMode ? (
          <Sun className="icon sun-icon" />
        ) : (
          <Moon className="icon moon-icon" />
        )}
      </button>

      </div>
            <Modal
                visible={isModalVisible}
                width={`50%`}
                onCancel={onHandleCancel}
                footer={[
                    // <Button key="close" onClick={onHandleCancel}>Close</Button>
                ]}
                style={{ textAlign: "center", borderRadius: '8px', padding: '0px' }}
            >
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: '100%' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", height: "12%", marginBottom: '10px' }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Avatar 
                                size={110}
                                src={getAvatarSrc()}
                                style={{ border: "2px solid #ccc" }}
                            />
                            {/* <Button 
                                type="primary" 
                                style={{ height: "25px", width: "70px", marginLeft: "10px", marginTop: "10px" }}
                                onClick={() => handleProfileUpdate({ image: '/new-image.png' })}
                            >
                                Upload
                            </Button> */}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "flex-start", padding: "0px" }}>
                            <p style={{margin: "1px"}}><span style={{ fontWeight: "bold" }}>ID:</span> {userdetails ? userdetails._id : ""}</p>
                            <p style={{margin: "1px"}}><span style={{ fontWeight: "bold" }}>EMAIL_ID:</span> {userdetails ? userdetails.email : "No email"}</p>
                            <p style={{margin: "1px"}}><span style={{ fontWeight: "bold" }}>Name:</span> {userdetails ? userdetails.userName : "Guest"}</p>
                        </div>
                    </div>
                    <hr style={{ border: "1px solid black", width: "100%" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ maxHeight: '200px', width: "100%", overflowY: 'auto', padding: '10px', border: '1px solid #ccc', marginBottom: '20px' }}>
                            {renderAdAccounts()}
                        </div>
                    </div>
                </div>
            </Modal>
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
      const fetchData = async () => {
          try {
              console.log("Session Status: ", sessionStatus);
              console.log("Session Data: ", session);
              if(session?.user?.email){
                
                const userResponse = await axios.get(`https://prodapis.adsgoat.in/api/getusersData?email=${session.user.email}`);
                if (userResponse.status === 200) {
                    const fetchedUsersData = userResponse.data;
                    setUsersData(fetchedUsersData);
                    setLoading(false);

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
                                    console.log(MediaBuyerkeysOfAdAccounts, "keys");
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
                                    console.log(SpecialUserkeysOfAdAccounts, "keys");
                                    for (let item of SpecialUserkeysOfAdAccounts) {
                                        if (SpecialUseradAccounts[item][0] === "All") {
                                            const networkResponse = await axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`);
                                            SpecialUsernewObject[item] = await networkResponse.data;
                                            console.log(await networkResponse.data);
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
                                    console.log(ManagerkeysOfAdAccounts, "keys");
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
                                    console.log(responseData, "responseData");
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
                            console.log("Token is already stored:", localStorage.getItem("token"));
                        }
                    } else {
                        console.error('Invalid user data or user email mismatch');
                        localStorage.removeItem("token");
                    }
                } else {
                    console.error('Failed to fetch users data');
                }
              }
          } catch (error) {
              console.error('Error:', error);
          } finally {
              setLoading(false);
              setInitialized(true);
          }
      };
      const debouncedFetchData = debounce(fetchData, 2000);
      if (sessionStatus === "authenticated" && session?.user?.email && !initialized) {
        debouncedFetchData();


      } else if (sessionStatus === 'authenticated' && !session?.user?.email) {
        console.log("Authenticated but session.user.email is undefined or not available.");
      }
    }, [session, sessionStatus, initialized]);

    // useEffect(() => {
    //   // Reload page if session has just become authenticated to avoid session delay issues
    //   if (sessionStatus === 'authenticated' && !usersData) {
    //     router.reload();  // Force reload to ensure session is fully loaded
    //   }
    // }, [sessionStatus, usersData, router]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };
    const onFinish = (values) => {
      console.log('Received values of form: ', values);
      // Perform your login logic here (e.g., API call for username/password)
    };
  
    const handleGoogleSignIn = () => {
      signIn('google'); // Use Next-auth for Google sign-in
    };

    return (
        <>
            <Topbar session={session} darkMode={darkMode} toggleTheme={toggleTheme} usersData={!loading && usersData} />
            {/* {usersData.length === 0 && redirect("/")} */}
            {/* {session && usersData && usersData.length > 0 &&
                session.user && session.user.email ? (
                usersData.some(user => user.email.toLowerCase() === session.user.email.toLowerCase()) ? (
                    loading ? (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Spin size="large" />
                        </div>
                    ) 
                    : (
                        // React.Children.map(children, child => {
                        //     return React.cloneElement(child, { darkMode: darkMode });
                        // })
                        React.Children.map(children, child => {
                          return React.cloneElement(child, { darkMode });
                      })
                      // <p>Hello</p>
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
            ) : 
            ( sessionStatus !== "authenticated" ? (
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
              ):
                <p style={{height:'0px', margin:'0px', padding:'0px'}}></p>
            )
          } */}
          {sessionStatus === "authenticated" && usersData?.length === 0 && !loading ? (
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
          ) : 
            ( sessionStatus !== "authenticated" ? (
              <div
      style={{
        display: 'flex',
        height: '100vh',
      }}
    >
      {/* Left side: Image */}
      <div
        style={{
          flex: 1,
          position: 'relative',
         height:"80%",
         width:"100%",
         marginLeft:"0.8%"
        }}
      >
        <Image
          src="/yu.jpeg"
          alt="Login Image"
          // layout="fill"
          width={'1000'}
          height={'540'}
         
        />
      </div>

      {/* Right side: Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          // alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '20px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            height:"60%",
            width: '100%',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>

          <Button
            type="primary"
            icon={<GoogleOutlined />}
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              marginBottom: '20px',
            }}
          >
            Sign in with Google
          </Button>

          <Divider>Or</Divider>

          <Form name="login_form" onFinish={onFinish}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                style={{ padding: '10px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                style={{ padding: '10px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
            ):
              <p style={{height:'0px', margin:'0px', padding:'0px'}}></p>
            )
          }

        </>
    );
};

export default LayoutWrapper;
