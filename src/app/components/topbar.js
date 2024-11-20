// Topbar.js
import { useState, useEffect, useRef } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin, Form, Input, Divider, Modal, Badge, Card, notification } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
const { Header } = Layout;
import { useTokenContext } from './parent';
import moment from 'moment-timezone';
import ContactForm from './mail';
import { BellFilled, EyeOutlined, GoogleOutlined, LockOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Bell, Edit3Icon, Moon, Sun } from 'lucide-react';
import { getSession } from 'next-auth/react';
import debounce from 'lodash.debounce';
import soundFile from "../../../public/notification_sounds.mp3";

import { message } from 'antd';

import { useGlobalLoading } from "../layout";

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

const Topbar = () => {
  const { darkMode, toggleTheme } = useTokenContext();
  const router = useRouter();
  const { data: session, status } = useSession(); // Session status from next-auth
  const { userdetails } = useTokenContext(); // User details from your context
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');
  const [notifications, setNotifications] = useState([]); // New state for notifications
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false); // Notification modal state
  const [isAddNotificationModalVisible, setIsAddNotificationModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const wrapperRef = useRef(null);

  const notificationIconRef = useRef(null); // Ref for the notification icon
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 }); // Modal position
  const [selectedNotification, setSelectedNotification] = useState(null); // For the notification to be displayed in modal
  const [isViewNotificationModalVisible, setIsViewNotificationModalVisible] = useState(false); // View notification moda

  console.log(userdetails);

  const tokenForAuth = localStorage.getItem('token');


  // Handle viewing and removing the notification after modal closes
  const handleViewNotification = async (notification) => {
    if (!notification || !notification._id) {
      console.error('Invalid notification:', notification);
      return;
    }

    try {
      console.log('Marking notification as viewed:', notification._id);
      const response = await axios.post('https://prodapis.adsgoat.in/Notifications/view', {
        email: userdetails?.email,
        notificationId: notification._id,
      },
        {
          headers: {
            Authorization: tokenForAuth,
          }
        });

      if (response.status === 200) {
        console.log('Notification marked as viewed and removed:', notification._id);
        // Remove the notification from the list in the frontend
        setNotifications((prevNotifications) =>
          prevNotifications.filter((n) => n._id !== notification._id)
        );
        setSelectedNotification(null); // Clear selected notification after viewing
        message.success("Message Viewed");
      } else {
        console.error('Failed to mark notification as viewed:', response.data);
      }
    } catch (error) {
      console.error('Error viewing notification:', error);
    }
  };

  // Open the notifications list modal
  const openNotificationsList = () => {
    setIsNotificationModalVisible(true);
  };


  // Open the view notification modal for a specific notification
  const openViewNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsViewNotificationModalVisible(true);
  };

  // Close the view notification modal and remove the notification
  const closeViewNotificationModal = async () => {
    if (selectedNotification) {
      await handleViewNotification(selectedNotification);
      setIsViewNotificationModalVisible(false);
    }
  };


  // Fetch notifications function
  const fetchNotificationsWithRetry = async (retries = 3, delay = 5000) => {
    const makeRequest = async (retryAttempt) => {
      try {
        console.log(tokenForAuth);
        let response;
        if(isNotificationsFetched.current === false){
          response = await axios.get(
            `https://prodapis.adsgoat.in/Notifications/get?email=${userdetails?.email}`,
            {
              headers: {
                Authorization: tokenForAuth,
              }
            }
          );
        }
        if (response.status === 200) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        if (retryAttempt > 0 && error.response?.status === 500) {
          // Retry after delay for 500 errors
          await new Promise((resolve) => setTimeout(resolve, delay));
          return makeRequest(retryAttempt - 1); // Retry
        }
        console.error('Error fetching notifications:', error); // Log error if no retries left or other status
      }
    };
  
    // First attempt without delay
    await makeRequest(retries);
  };

  useEffect(() => {
    if (userdetails?.email && status === "authenticated") {
      fetchNotificationsWithRetry();
    }
  }, [userdetails?.email]);


  const openNotificationModal = () => {
    if (notificationIconRef.current) {
      const iconRect = notificationIconRef.current.getBoundingClientRect();
      setModalPosition({
        top: iconRect.bottom + 100,
        right: window.innerWidth - iconRect.right,
      });
    }
    setIsNotificationModalVisible(true);
  };
  const openNotification = () => {
    const audio = new Audio(soundFile); // Create an audio object with the sound file
    audio.play(); // Play the sound

    notification.open({
      message: title,
      description: description,
      duration: 3, // Auto-close after 3 seconds
    });
  };

  // Function to handle adding a notification via the backend API
  const handleAddNotification = async () => {
    if (!title || !description) {
      alert('Title and description are required.');
      return;
    }

    try {
      const response = await axios.post('https://prodapis.adsgoat.in/Notifications/add', {
        title,
        description,
      },
        {
          headers: {
            Authorization: tokenForAuth,
          }
        }
      );

      if (response.status === 200) {
        message.success('Notification added to all users');
        openNotification()
        setTitle('');
        setDescription('');
        setIsAddNotificationModalVisible(false);
        fetchNotificationsWithRetry(); // Refetch notifications to update the list
      } else {
        message.error('Failed to add notification');
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      message.error('An error occurred while adding the notification.');
    }
  };


  const renderNotifications = () => {
    return notifications.map((notification, index) => (
      <div
        key={index}
        style={{
          padding: '5px 0',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          minHeight: 'auto',
          // paddingRight: '50px', // Ensure space for the Eye icon
        }}
      >
        <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
            {notification.title}
          </h3>

          <p
            style={{
              fontSize: '14px',
              marginBottom: '20px',
              color: darkMode ? '#fff' : '#555',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {notification.description}
          </p>

        </div>

        <EyeOutlined
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#1890ff',
          }}
          onClick={() => openViewNotificationModal(notification)}
        />

        <div
          style={{
            fontSize: '12px',
            color: '#888',
            textAlign: 'right',
            marginTop: '10px',
          }}
        >
          {notification.date}
        </div>
      </div>
    ));
  };


  // Function to close the modals
  const onHandleNotificationCancel = () => {
    setIsNotificationModalVisible(false);
  };

  // Function to open the add notification modal
  const openAddNotificationModal = () => {
    setIsAddNotificationModalVisible(true);
  };

  const onHandleAddNotificationCancel = () => {
    setIsAddNotificationModalVisible(false);
  };

  const openProfileModal = () => {
    setIsModalVisible(true);
  };

  const onHandleCancel = () => {
    setIsModalVisible(false);
  };

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

  const maleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960655/3d-rendering-cartoon-character-with-eyeglasses-jacket_lu1cqi.jpg';
  const femaleImoji = 'https://res.cloudinary.com/dyogjqsil/image/upload/v1727960642/portrait-3d-female-doctor_cei7bm.jpg';

  const getAvatarSrc = () => {
    if (userdetails?.gender === 'Male') {
      return maleImoji;
    } else if (userdetails?.gender === 'Female') {
      return femaleImoji;
    }
  };

  // Dropdown for authenticated users (Profile + Sign Out)
  const dropdownItemsAuthenticated = [
    {
      key: '1',
      label: (
        <a onClick={openProfileModal} style={{ padding: '5px' }}>
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
  ];

  const dropdownItemsUnauthenticated = [
    {
      key: '1',
      label: (
        <span onClick={() => signIn()} style={{ cursor: 'pointer' }}>
          Sign in
        </span>
      ),
    }
  ];

  // Only show profile and signout if the user is authenticated and has access
  const isUserAuthorized = status === 'authenticated' && userdetails;

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#333' : '#fff',
        paddingRight: '20px',
        margin: '10px',
        display: 'flex',
        justifyContent: "space-between",
        alignItems: 'center',
      }}
    >
      {/* Show logo only if the user is NOT authenticated */}
      {status !== 'authenticated' && status !== 'loading' && (
        <div>
          <Image
            src={darkMode ? "/4.png" : "/RR1.png"}
            width={150}
            height={60}
            priority={true}
            alt="Logo"
            style={{ margin: "0px 20px", objectFit: "cover" }}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1em',
          height: '60px',
          // justifyContent: 'flex-end',
          marginLeft: 'auto',
        }}
      >
        {/* Conditional rendering based on authentication and authorization status */}
        {isUserAuthorized ? (
          <>
            <div className="relative inline-block" ref={wrapperRef}>
              <div className="cursor-pointer" onClick={openNotificationsList}>
                <Bell size={24} />
                {notifications.length > 0 && (
                  <Badge
                    style={{ color: 'red' }}
                    className="Badge absolute -top-2 -right-2"
                    variant="destructive"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </div>
            </div>



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
                items: dropdownItemsAuthenticated,
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
          </>
        ) : (
          <Dropdown
            menu={{
              items: dropdownItemsUnauthenticated,
            }}
            placement="bottomLeft"
            arrow={{ pointAtCenter: true }}
          >
            <Avatar
              size="large"
              style={{
                background: darkMode ? '#333' : '#ebebeb',
                fontSize: '1.8em',
                transition: 'background 0.3s ease',
              }}
            />
          </Dropdown>
        )}
      </div>

      {/* View Notification Modal */}
      <Modal
        title={null}
        visible={isViewNotificationModalVisible}
        onOk={closeViewNotificationModal} // Close the modal and remove the notification
        onCancel={() => setIsViewNotificationModalVisible(false)}
        // onCancel={closeViewNotificationModal}
        okText="Ok"
      >
        {selectedNotification && (
          <>
            <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '10px' }}>
              {selectedNotification.title}
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              {selectedNotification.description}
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>
              {selectedNotification.date.split('T')[0]}
            </p>
          </>
        )}
      </Modal>

      {/*Notifications Modal */}
      <Modal
        visible={isNotificationModalVisible}
        width={`25%`}
        onCancel={onHandleNotificationCancel}
        footer={null}
        title={null}
        bodyStyle={{
          padding: '0px',
          margin: '0px',
        }}
        style={{
          top: `${modalPosition.top + 70}px`,  // Set dynamically based on the icon's position
          right: `${modalPosition.right + 1}rem`, // Align with the icon's right edge
          position: 'absolute',
          padding: '0px'
        }}
      >
        {userdetails?.role === 'Admin' && <button style={{ marginRight: '10px', padding: '7px', borderRadius: '5px', backgroundColor: '#6495ED', border: 'none', color: 'white' }} onClick={openAddNotificationModal}>Add Notification</button>} {/* Only visible to admin */}

        <div style={{ padding: '0px' }}>
          {renderNotifications()}
        </div>
      </Modal>




      {/* Add Notification Modal */}
      <Modal
        visible={isAddNotificationModalVisible}
        width={`30%`}
        onCancel={onHandleAddNotificationCancel}
        onOk={handleAddNotification}
        title="Add Notification"
        okText="OK"
        cancelText="Cancel"
        style={{
          top: `${modalPosition.top + 100}px`,  // Set dynamically based on the icon's position
          right: `${modalPosition.right + 500}px`, // Align with the icon's right edge
          position: 'absolute',
        }}
      >
        <Input
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input.TextArea
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </Modal>

      <Modal
        visible={isModalVisible}
        width={`50%`}
        onCancel={onHandleCancel}
        footer={null}
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
            </div>
            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "flex-start", padding: "0px" }}>
              <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>ID:</span> {userdetails ? userdetails._id : ""}</p>
              <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>EMAIL_ID:</span> {userdetails ? userdetails.email : "No email"}</p>
              <p style={{ margin: "1px" }}><span style={{ fontWeight: "bold" }}>Name:</span> {userdetails ? userdetails.userName : "Guest"}</p>
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
// };

const LayoutWrapper = ({ children, usersDataForLogin }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const { setuserdetails } = useTokenContext();
  const isCalledRef = useRef(false);  // To ensure getUsersData API is called only once

  // Generic retry mechanism for any API
  const debouncedRetry = debounce((fetchFunc, retries, resolve, reject) => {
    retryFetch(fetchFunc, retries - 1).then(resolve).catch(reject);
  }, 2000);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Session Status: ", sessionStatus);
        console.log("Session Data: ", session);
        setUsersData(usersDataForLogin);
        setLoading(false);
        const path = typeof window !== "undefined" ? window.location.pathname : null;
        console.log(path.split("/"));
        //  && path.split("/")[1] !== "DailyAndCampaignHistory" && path.split("/")[1] !== "AllCampaigns" && path.split("/")[1] !== "LiveHistory"
        if (usersDataForLogin) {
          // console.log(usersDataForLogin);
          // Case Media_Buyer
          switch (usersDataForLogin[0].role) {
            
            case 'Media_Buyer':
              const MediaBuyeradAccounts = usersDataForLogin[0].adAccounts;
              const MediaBuyerkeysOfAdAccounts = Object.keys(MediaBuyeradAccounts);
              const MediaBuyernewObject = {};
              console.log(MediaBuyerkeysOfAdAccounts, "keys");

              for (let item of MediaBuyerkeysOfAdAccounts) {
                if (MediaBuyeradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  const networkResponse = await retryFetch(() => axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`));
                  MediaBuyernewObject[item] = networkResponse.data;
                } else {
                  const response = await retryFetch(() =>
                    axios.post('https://prodapis.adsgoat.in/getAccountNameandStatusofNetwork/', { updatedNetwork: MediaBuyeradAccounts[item] })
                  );
                  MediaBuyernewObject[item] = response.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: MediaBuyernewObject });
              break;

            // Case Special_User
            case 'Special_User':
              const SpecialUseradAccounts = usersDataForLogin[0].adAccounts;
              const SpecialUserkeysOfAdAccounts = Object.keys(SpecialUseradAccounts);
              const SpecialUsernewObject = {};
              console.log(SpecialUserkeysOfAdAccounts, "keys");

              for (let item of SpecialUserkeysOfAdAccounts) {
                if (SpecialUseradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  const networkResponse = await retryFetch(() => axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`));
                  SpecialUsernewObject[item] = networkResponse.data;
                } else {
                  const response = await retryFetch(() =>
                    axios.post('https://prodapis.adsgoat.in/getAccountNameandStatusofNetwork/', { updatedNetwork: SpecialUseradAccounts[item] })
                  );
                  SpecialUsernewObject[item] = response.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: SpecialUsernewObject });
              break;

            // Case Manager
            case 'Manager':
              const ManageradAccounts = usersDataForLogin[0].adAccounts;
              const ManagerkeysOfAdAccounts = Object.keys(ManageradAccounts);
              const ManagernewObject = {};
              console.log(ManagerkeysOfAdAccounts, "keys");

              for (let item of ManagerkeysOfAdAccounts) {
                if (ManageradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  const networkResponse = await retryFetch(() => axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`));
                  ManagernewObject[item] = networkResponse.data;
                } else {
                  const response = await retryFetch(() =>
                    axios.post('https://prodapis.adsgoat.in/getAccountNameandStatusofNetwork/', { updatedNetwork: ManageradAccounts[item] })
                  );
                  ManagernewObject[item] = response.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: ManagernewObject });
              break;

            // Case Admin
            case 'Admin':
              // Retry logic for All Accounts API
              const AllAccountsData = await retryFetch(() => axios.get(`https://prodapis.adsgoat.in/All/Accounts/`));
              const responseData = AllAccountsData.data;
              console.log(responseData, "responseData");
              setuserdetails({ ...usersDataForLogin[0], adAccounts: responseData });
              break;

            default:
              setuserdetails(usersDataForLogin);
          }
        }
        else{
          setuserdetails(usersDataForLogin[0]);
        }
        
        // const localstorageItem = localStorage.getItem("token");
        // console.log(localstorageItem)
        const decodedToken = jwt.decode(localStorage.getItem("token"));
        console.log(decodedToken);
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
        // }
        

        if (!localStorage.getItem("token")) {
          const email = session.user.email;
          const tokenResponse = await retryFetch(() => axios.post('/api/auth/jwt', { email }));
          const token = tokenResponse.data.token;
          localStorage.setItem("token", token);
        }
        else if(decodedToken && decodedToken.exp < Math.floor(Date.now() / 1000)){
          const email = session.user.email;
          const tokenResponse = await retryFetch(() => axios.post('/api/auth/jwt', { email }));
          const token = tokenResponse.data.token;
          localStorage.setItem("token", token);
        }
        else {
          console.log("Token is already stored:", localStorage.getItem("token"));
        }
      } catch (error) {
        console.error('Error during API call:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (sessionStatus === "authenticated" && session?.user?.email && !isCalledRef.current) {
      isCalledRef.current = true;  // Set flag to true after first call
      fetchData();  // Call fetchData only once
    } else if (sessionStatus === 'authenticated' && !session?.user?.email) {
      console.log("Authenticated but session.user.email is undefined or not available.");
    }
  }, [sessionStatus, session]);

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
      {sessionStatus == "authenticated" && usersData?.length === 0 && !loading ?
        // (
        //   <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        //     <img
        //       style={{
        //         width: '100%',
        //         height: 'auto',
        //         maxHeight: '90vh',
        //       }}
        //       src="/hope.png"
        //       alt="img"
        //     />
        //     <div style={{ position: 'absolute', top: 10, right: 4, zIndex: 2, border: "2px dotted green", padding: "1%" }}>
        //       <h3>You are not Authorized {session.user.email}`</h3>
        //       <ContactForm />
        //     </div>
        //   </div>
        // ) 
        null
        :
        (sessionStatus !== "authenticated" ? (
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
                height: "80%",
                width: "100%",
                marginLeft: "0.8%"
              }}
            >
              <img
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '90vh',
                }}
                src="/hope.png"
                alt="img"
              />
            </div>

            {/* Right side: Form */}
            {/* <div
              style={{
                flex: 1,
                display: 'flex',
                // alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '20px',
                backgroundColor: darkMode ? '#333' : '#fff',
              }}
            > */}
            <div
              style={{
                marginTop: "5%",
                marginRight: "2%",
                maxWidth: '400px',
                height: "60%",
                width: '100%',
                padding: '20px',
                backgroundColor: darkMode ? '#333' : '#fff',
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
            {/* </div> */}
          </div>
        ) :
          <p style={{ height: '0px', margin: '0px', padding: '0px' }}></p>
        )
      }

    </>
  );
};

export default LayoutWrapper;
