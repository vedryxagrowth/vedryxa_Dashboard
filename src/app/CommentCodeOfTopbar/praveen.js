// const Topbar = ({ }) => {
//   const { darkMode, toggleTheme, usersData } = useTokenContext();
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   //   const [darkMode, setDarkMode] = React.useState(false);

//   //   const toggleTheme = () => {
//   //     setDarkMode(!darkMode);

//   const { userdetails } = useTokenContext();

//   const [userProfile, setUserProfile] = useState(userdetails);

//   useEffect(() => {
//     if (userdetails) {
//       setUserProfile(userdetails);
//     }
//   }, [userdetails]);

//   const handleProfileUpdate = (updatedProfileData) => {
//     setUserProfile(prev => ({
//       ...prev,
//       ...updatedProfileData,
//     }));
//   };
//   //   };

//   const [isModalVisible, setIsModalVisible] = useState(false);

//   const openProfileModal = () => {
//     setIsModalVisible(true);
//   };

//   const onHandleCancel = () => {
//     setIsModalVisible(false);
//   }

//   const renderAdAccounts = () => {
//     if (!userdetails?.adAccounts) return null;

//     return Object.keys(userdetails.adAccounts).map((key) => (
//       <div key={key} style={{ textAlign: 'left', marginBottom: '20px' }}>
//         <h4>{key}:</h4>
//         <ul>
//           {userdetails.adAccounts[key].map((accountId, index) => (
//             <li key={index}>{typeof accountId === 'object' ? accountId.accountNumber : accountId}</li>
//           ))}
//         </ul>
//       </div>
//     ));
//   };

//   const dropdownItems = status === 'authenticated' ? [
//     {
//       key: '1',
//       label: (
//         <a onClick={openProfileModal} style={{ padding: '5px' }}>
//           Profile
//         </a>
//       ),
//     },
//     {
//       key: '2',
//       label: (
//         <a
//           onClick={() => {
//             localStorage.clear();
//             localStorage.setItem('redirectUrl', router.asPath);
//             router.push('/api/auth/signout');
//           }}
//         >
//           Sign Out
//         </a>
//       ),
//     },
//   ] : [
//     {
//       key: '1',
//       label: (
//         <span onClick={() => signIn()} style={{ cursor: 'pointer' }}>
//           Sign in
//         </span>
//       ),
//     }

//   ];

//   const maleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960655/3d-rendering-cartoon-character-with-eyeglasses-jacket_lu1cqi.jpg';

//   const femaleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960642/portrait-3d-female-doctor_cei7bm.jpg';

//   const getAvatarSrc = () => {
//     if (userdetails?.gender === 'Male') {
//       return maleImoji;
//     } else if (userdetails?.gender === 'Female') {
//       return femaleImoji;
//     }
//     // return defaultImoji
//   }

//   // const dropdownItems = [
//   //   {
//   //     key: '1',
//   //     label: (
//   //       <a href="/api/auth/signin">Sign in</a>
//   //     ),
//   //   },
//   //   {
//   //     key: '2',
//   //     label: (
//   //       <a
//   //         onClick={() => {
//   //           localStorage.clear();
//   //           localStorage.setItem('redirectUrl', router.asPath);
//   //           router.push('/api/auth/signout');
//   //         }}
//   //       >
//   //         Sign Out
//   //       </a>
//   //     ),
//   //   },
//   // ];

//   return (
//     <div
//       style={{
//         backgroundColor: darkMode ? '#333' : '#fff',
//         // width:'100%',
//         paddingRight: '20px',
//         margin: '10px',
//         display: 'flex',
//         justifyContent: "space-between",
//         alignItems: 'center'
//         // transition: 'background-color 0.3s ease',
//       }}
//     >
//       <div>
//           <Image
//             src={darkMode ? "/4.png" : "/RR1.png"}
//             width={150}  // Larger logo when expanded
//             height={60}
//             priority={true}
//             alt="Expanded Logo"
//             style={{ margin: "0px 20px", objectFit: "cover" }}
//           // src={darkMode ? "/4.png" : "/RR1.png"}
//           // width={150}
//           // height={60}
//           // priority={true}
//           // alt="Logo"
//           // // style={{ maxWidth: "8rem", maxHeight: "4rem", marginBottom: '10px', margin:"0px 20px"}} // Optional margin for spacing
//           // style={{ margin: "0px 20px" }} // Optional margin for spacing
//           />
//       </div>


//        <div
//         style={{
//           display: 'flex',
//           flexDirection: 'row',
//           alignItems: 'center',
//           gap: '1em',
//           height: '60px',
//           justifyContent: 'flex-end',
//         }}
//       >
//         <h2
//           style={{
//             color: darkMode ? '#fff' : '#000',
//             margin: 0,
//             fontSize: '1.2rem',
//             transition: 'color 0.3s ease',
//           }}
//         >
//           Hi, {session?.user?.name || ''}
//         </h2>
//         <Dropdown
//           menu={{
//             items: dropdownItems,
//           }}
//           placement="bottomLeft"
//           arrow={{ pointAtCenter: true }}
//         >
//           <Avatar
//             size="large"
//             src={getAvatarSrc()}
//             style={{
//               background: darkMode ? '#333' : '#ebebeb',
//               fontSize: '1.8em',
//               transition: 'background 0.3s ease',
//             }}
//           />
//         </Dropdown>

//         {/* <Button
//         onClick={toggleTheme}
//         style={{
//           backgroundColor: darkMode ? '#333' : '#f0f0f0',
//           color: darkMode ? '#fff' : '#000',
//           transition: 'background-color 0.3s ease, color 0.3s ease',
//         }}
//       >
//         {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
//       </Button> */}
//         <button
//           onClick={toggleTheme}
//           className={`theme-toggle-btn ${darkMode ? 'dark-mode' : 'light-mode'}`}
//         >
//           {darkMode ? (
//             <Sun className="icon sun-icon" />
//           ) : (
//             <Moon className="icon moon-icon" />
//           )}
//         </button>

//       </div>  

//       <Modal
//         visible={isModalVisible}
//         width={`50%`}
//         onCancel={onHandleCancel}
//         footer={[
//           // <Button key="close" onClick={onHandleCancel}>Close</Button>
//         ]}
//         style={{ textAlign: "center", borderRadius: '8px', padding: '0px' }}
//       >
//         <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: '100%' }}>
//           <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", height: "12%", marginBottom: '10px' }}>
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <Avatar
//                 size={110}
//                 src={getAvatarSrc()}
//                 style={{ border: "2px solid #ccc" }}
//               />
//               {/* <Button 
//                                 type="primary" 
//                                 style={{ height: "25px", width: "70px", marginLeft: "10px", marginTop: "10px" }}
//                                 onClick={() => handleProfileUpdate({ image: '/new-image.png' })}
//                             >
//                                 Upload
//                             </Button> */}
//             </div>
//             <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "flex-start", padding: "0px" }}>
//               <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>ID:</span> {userdetails ? userdetails._id : ""}</p>
//               <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>EMAIL_ID:</span> {userdetails ? userdetails.email : "No email"}</p>
//               <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>Name:</span> {userdetails ? userdetails.userName : "Guest"}</p>
//             </div>
//           </div>
//           <hr style={{ border: "1px solid black", width: "100%" }} />
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//             <div style={{ maxHeight: '200px', width: "100%", overflowY: 'auto', padding: '10px', border: '1px solid #ccc', marginBottom: '20px' }}>
//               {renderAdAccounts()}
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }; // From Topbar

// const items = (setuserdetails, router) => [
//     {
//       key: "1",
//       label: (
//         <Button
//           style={{
//             border: "none",
//             outline: "none",
//             background: "none",
//             cursor: "pointer",
//             textDecoration: "underline",
//             padding: "0",
//             fontSize: "inherit",
//           }}
//           onClick={() => signIn()}>
//           Sign in
//         </Button>
//       ),
//     },
//     {
//       key: "2",
//       label: (
//         <Button
//           style={{
//             border: "none",
//             outline: "none",
//             background: "none",
//             cursor: "pointer",
//             textDecoration: "underline",
//             padding: "0",
//             fontSize: "inherit",
//           }}
//           onClick={() => {
//             localStorage.clear();
//             localStorage.setItem("redirectUrl", router.asPath);
//             router.push("/api/auth/signout");
//           }}>
//           Sign Out
//         </Button>
//       ),
//     },
//   ]; // From Topbar
  
//   async function getUserDetails(name) {
//     // Get user agent details
//     const userAgent = navigator.userAgent || "";
//     const parser = new UAParser(userAgent);
//     const device = parser.getDevice();
//     let deviceType = device?.type || "desktop";
  
//     // Fetch public IP
//     let ip = "Unknown";
//     try {
//       const ipRes = await fetch("https://api64.ipify.org?format=json");
//       if (!ipRes.ok) throw new Error("Failed to fetch IP address");
//       const ipData = await ipRes.json();
//       ip = ipData.ip || "Unknown";
//     } catch (error) {
//       console.error("Error fetching IP address:", error);
//     }
  
//     // Fetch location based on IP
//     let location = {
//       status: "Unknown",
//       country: "Unknown",
//       countryCode: "Unknown",
//       region: "Unknown",
//       regionName: "Unknown",
//       city: "Unknown",
//       zip: "Unknown",
//       lat: "Unknown",
//       lon: "Unknown",
//       timezone: "Unknown",
//       isp: "Unknown",
//       org: "Unknown",
//       as: "Unknown",
//       query: ip,
//     };
  
//     try {
//       const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
//       if (!geoRes.ok) throw new Error("Failed to fetch location data");
//       const geoData = await geoRes.json();
//       if (geoData.status === "success") {
//         location = { ...geoData };
//       }
//     } catch (error) {
//       console.error("Error fetching location:", error);
//     }
  
//     // Get current timestamp in IST
//     const now = new Date();
//     const istFormatter = new Intl.DateTimeFormat("en-IN", {
//       timeZone: "Asia/Kolkata",
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
  
//     const istTimestamp = istFormatter.format(now);
  
//     console.log({
//       timestamp: istTimestamp,
//       ip,
//       location,
//       device: {
//         type: deviceType,
//       },
//       userAgent,
//       name
//     });
  
//     return {
//       timestamp: istTimestamp,
//       ip,
//       location,
//       device: {
//         type: deviceType,
//       },
//       userAgent,
//       name
//     };
//   } // from Topbar

// const localstorageItem = localStorage.getItem("token");
        // console.log(localstorageItem)
        const decodedToken = jwt.decode(localStorage.getItem("token"));
        // console.log(decodedToken);
        // console.log(decodedToken.exp);
        // console.log(Math.floor(Date.now() / 1000));
        // if (decodedToken && decodedToken.exp < Math.floor(Date.now() / 1000)) {
          
          
        //   console.log("Token has expired.");
        // }
        
        

        // if (!localStorage.getItem("token")) {
        //   const email = session.user.email;
        //   const tokenResponse = await retryFetch(() => axios.post('/api/auth/jwt', { email }));
        //   const token = tokenResponse.data.token;
        //   localStorage.setItem("token", token);
        //   const response = await getUserDetails(email);
        //   console.log(response,"hellooaxios.post")
        //   setuseractivites(response)
        // }
        // else if(decodedToken && decodedToken.exp < Math.floor(Date.now() / 1000)){
        //   const email = session.user.email;
        //   // const tokenResponse = await retryFetch(() => axios.post('/api/auth/jwt', { email }));
        //   // const token = tokenResponse.data.token;
        //   // localStorage.setItem("token", token);
        //   localStorage.clear();
        //   localStorage.setItem('redirectUrl', router.asPath);
        //   signOut();
        // }
        // else {
        //   console.log("Token is already stored:", localStorage.getItem("token"));
        // }//From Topbar LayoutWraper useEffect

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
            // } // appbar.js/UserLocationFinder/useEffect

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
// }; // appbar.js starting