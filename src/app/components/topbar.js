// Topbar.js
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin, Form, Input, Divider, Modal, Badge, Card, Upload, notification, Drawer, Menu } from "antd";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { io } from "socket.io-client";
import axios from 'axios';
const { Header } = Layout;
import { useTokenContext } from './parent';
import Draggable from "react-draggable";
import moment from 'moment-timezone';
import ContactForm from './mail';
import {
  BellFilled, EyeOutlined, GoogleOutlined, LockOutlined, PlusOutlined, UserOutlined, UploadOutlined, CalculatorOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
  BellOutlined, SoundOutlined, AudioMutedOutlined
} from '@ant-design/icons';
import {
  HomeOutlined,
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  SettingOutlined,
  // LockOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  // UserOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import { Bell, Edit3Icon, Moon, Sun, StickyNote, View, Eye, MoonIcon } from 'lucide-react';
import { getSession } from 'next-auth/react';
import debounce from 'lodash.debounce';
import soundFile from "../../../public/notification_sounds.mp3";
import jwt from 'jsonwebtoken';
import { UAParser } from "ua-parser-js";
import StickyNotes from './StickyNotes';
import Calculator from './calculator';
import WorldTime from './worldtimebuddy';
import { LuStickyNote } from "react-icons/lu";
import { ImBook } from "react-icons/im";
import { SlNotebook } from "react-icons/sl";
import { LuNotebook } from "react-icons/lu";
import { TfiWorld } from "react-icons/tfi";
import { CloseOutlined } from '@ant-design/icons';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';


import { message, Popconfirm } from 'antd';


import { useGlobalLoading } from "../layout";
import { CalculateOutlined, StickyNote2Outlined } from '@mui/icons-material';

// const socket = io("http://localhost:4000");
const socket = io("https://app.vyaktimetrics.com", {
  transports: ["websocket"],

  reconnection: true,

  reconnectionAttempts: Infinity,

  reconnectionDelay: 1000,

  reconnectionDelayMax: 10000,

  randomizationFactor: 0.5,
});

// const socket = io("https://prodapis.adsgoat.in");

// const socket = io("https://prodapis.adsgoat.in", {
//   transports: ["websocket"], // Forces websocket
//   secure: true
// });

const Topbar = ({ onComplete, usersDataForLogin }) => {
  const { darkMode, toggleTheme } = useTokenContext();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession(); // Session status from next-auth
  const { userdetails } = useTokenContext(); // User details from your context
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCalculator, setOpenCalculator] = useState(false);
  const [openWorldTime, setOpenWorldTime] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');
  const [notifications, setNotifications] = useState([]); // New state for notifications
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false); // Notification modal state
  const [isAddNotificationModalVisible, setIsAddNotificationModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const prevNotificationsRef = useRef([]);
  const hasReceivedSocketUpdate = useRef(false);
  const [api, contextHolder] = notification.useNotification();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null); // assuming you're already using this
  const handleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const { theme } = useTokenContext();

  const themeForNotifications = useRef(theme);

  const [showIcons, setShowIcons] = useState(false);


  const { apiClient } = useTokenContext();

  const notificationIconRef = useRef(null); // Ref for the notification icon
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 }); // Modal position
  const [selectedNotification, setSelectedNotification] = useState(null); // For the notification to be displayed in modal
  const [isViewNotificationModalVisible, setIsViewNotificationModalVisible] = useState(false); // View notification moda
  // inside your notifications component
  const [previewUrl, setPreviewUrl] = useState(null);   // store clicked image url
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);  // control modal




  const [loading, setLoading] = useState(false);
  // console.log(userdetails);

  const toggleDrawer = () => setVisible((prev) => !prev);

  const tokenForAuth = localStorage.getItem('token');
  if (userdetails?.role === "Revenue_Partner") {
    onComplete();
  }
  const [showAll, setShowAll] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  // Fetch mute state from DB on mount
  useEffect(() => {
    const fetchNotificationSound = async () => {
      try {
        const response = await apiClient.get(`/open/notifications/sound`, {
          params: { email: userdetails?.email },
        });

        setIsMuted(response.data.notificationSound === 'true');
      } catch (error) {
        console.error('Failed to load notification sound setting:', error);
      }
    };

    if (userdetails?.email) {
      fetchNotificationSound();
    }
  }, [userdetails?.email]);

  // Toggle mute
  const toggleMute = async (e) => {
    e.stopPropagation();
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    try {
      await apiClient.put('/open/notifications/sound', {
        email: userdetails?.email,
        isMuted: newMuteState,
      });
    } catch (error) {
      console.error('Failed to update sound setting:', error);
    }
  };

  const isMutedRef = useRef(isMuted);

  // Keep the ref updated with the latest value
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // const items = [
  //   { label: 'Connections', count: 3, color: 'orange' },
  //   { label: 'Reports', count: 3, color: 'purple' },
  //   { label: 'Exports', count: 1, color: 'cyan' },
  //   { label: 'Resources', count: 42, color: 'red' },
  //   { label: 'Miscellaneous', count: 1, color: 'green' },
  //   { label: 'Connections', count: 3, color: 'orange' },
  //   { label: 'Reports', count: 3, color: 'purple' },
  //   { label: 'Exports', count: 1, color: 'cyan' },
  //   { label: 'Resources', count: 42, color: 'red' },
  //   { label: 'Miscellaneous', count: 1, color: 'green' },
  // ];

  const onClickNotificationView = async (item, key, email) => {
    const notificationData = await apiClient.put('/open/notifications/view', { email, key, item }, {
      headers: {
        Authorization: localStorage.getItem('token'),
        accept: 'application/json',
      }
    })
  }

  // const handleClearAll = async (e) => {
  //   e.stopPropagation();
  //   for (const [key, items] of Object.entries(notifications)) {
  //     for (const item of items) {
  //       await onClickNotificationView(item, key, userdetails?.email);
  //     }
  //   }
  //   const cleared = {};
  //   Object.keys(notifications).forEach((key) => {
  //     cleared[key] = [];
  //   });
  //   setNotifications(cleared);
  // };

  const handleClearAll = async (e) => {
    e.stopPropagation();

    try {
      await apiClient.put('/open/notifications/viewall', {
        email: userdetails?.email
      }, {
        headers: {
          Authorization: localStorage.getItem('token'),
          accept: 'application/json',
        }
      });

      // ✅ Re-fetch updated notifications from DB
      const freshNotifications = await fetchNotifications();
      prevNotificationsRef.current = freshNotifications?.notifications || {};
      setNotifications(freshNotifications?.notifications || {});
    } catch (err) {
      console.error("❌ Failed to mark all as seen:", err);
    }
  };


  const items = Object.entries(notifications).map(([key, value]) => ({
    label: key,
    count: value.length,
    color: "#EC7117"
  }));

  const displayedItems = showAll ? items : items.slice(0, 5);


  const menu = (
    <Menu
      style={{
        color: darkMode ? '#fff' : '#000',
        borderRadius: 8,
        width: '280px',
        paddingBottom: 0,
      }}
    >
      <Menu.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: darkMode ? '#fff' : '#000' }}>Notifications</span>
          <span onClick={toggleMute} style={{ display: 'flex', alignItems: 'center' }}>
            {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
          </span>
          {/* <strong style={{ color: darkMode ? '#fff' : '#000' }}>{Object.values(notifications)
            .filter(Array.isArray)
            .flat().length} NEW
          </strong> */}

        </div>
      </Menu.Item>
      <Menu.Divider style={{
        borderTop: `1px solid ${darkMode ? '#808080' : '#ccc'}`,
      }} />
      <Menu.Item style={{ padding: 0 }}>
        <div
          style={{
            maxHeight: 240,
            overflowY: 'auto',
            background: darkMode ? '#333' : '#fff',
          }}
        >
          {/* {displayedItems.map(({ label, count, color }, index) => (
            <div key={label + index}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand(index);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  color: darkMode ? '#fff' : '#000',
                  cursor: 'pointer',
                }}
              >
                {label}
                <Badge count={count} style={{ backgroundColor: color,  color: darkMode ? '#fff' : '#000', }} />
              </div>

              {expandedIndex === index &&
                ['Sub Item 1', 'Sub Item 2', 'Sub Item 3'].map((sub, subIdx) => (
                  <div
                    key={`sub-${index}-${subIdx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 15px 6px 20px',
                      color: darkMode ? '#fff' : '#888',
                      fontSize: '13px',
                      alignItems: 'center'
                    }}
                  >
                    <span>{sub}</span>
                    <Eye style={{ fontSize: 12, color: darkMode ? '#fff' : '#888' }} />
                  </div>
                ))}
            </div>
          ))} */}
          {displayedItems.map(({ label, count, color }, index) => (
            <div key={label + index}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand(index);

                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  color: darkMode ? '#fff' : '#000',
                  cursor: 'pointer',
                  color:
                    expandedIndex === index || hoveredIndex === index
                      ? '#91C25F'
                      : darkMode
                        ? '#fff'
                        : '#000',
                  textDecoration:
                    expandedIndex === index
                      ? 'underline'
                      : 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                {label}
                <Badge count={count} style={{ backgroundColor: color, color: darkMode ? '#000' : '#fff', border: '#EC7117' }} />
              </div>

              {/* {expandedIndex === index &&
                notifications[label]?.map((item, subIdx) => ( */}
              {expandedIndex === index &&
                [...notifications[label]]
                  .sort((a, b) =>
                    moment(b.date, 'DD-MM-YYYY hh:mm A').valueOf() -
                    moment(a.date, 'DD-MM-YYYY hh:mm A').valueOf()
                  )
                  .map((item, subIdx) => (
                    <div
                      key={`sub-${index}-${subIdx}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '12px 16px',
                        marginBottom: '10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: darkMode ? '#fff' : '#444',
                        minHeight: '80px',
                      }}
                    >

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '12px', }}>
                        <span style={{ fontSize: '12px' }}>{item.date}</span>
                        <CloseOutlined
                          style={{ marginLeft: 8, cursor: 'pointer', color: '#999', fontSize: '12px' }}
                          onClick={(e) => {
                            onClickNotificationView(item, label, userdetails?.email);
                            e.stopPropagation();
                            const updated = { ...notifications };
                            updated[label] = updated[label].filter((_, i) => i !== subIdx);
                            setNotifications(updated);
                          }}
                        />

                      </div>

                      {/* <span>{item.message}</span> */}
                      {/* <Popconfirm
            title="Delete Notification"
            description="Are you sure to delete this task?"
            onConfirm={confirm}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <Eye style={{ fontSize: 12, color: darkMode ? '#fff' : '#888' }} onClick={()=> {console.log(item, label)}} />
          </Popconfirm> */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >

                        <div style={{ fontSize: '12px', flex: 1, marginRight: '10px', width: '100%' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: darkMode ? '#fff' : '#333' }}>{item.title}</div>

                            <div
                              style={{
                                fontSize: '14px',
                                color: darkMode ? '#fff' : '#333',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap', // preserve newlines, wrap long lines
                                wordBreak: 'break-word', // force break for long words
                                maxWidth: '100%', // prevent overflow
                              }}
                            >
                              {item.message}
                            </div>
                            {/* {item.imageUrl?.includes('.mp4') ? (
                            <video
                              controls
                              src={item.imageUrl}
                              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          ) : (
                            <img
                              src={item.imageUrl}
                              alt="Notification"
                              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          )} */}
                            {item.imageUrl && ( // check if imageUrl exists before rendering
                              item.imageUrl.includes('.mp4') ? (
                                <video
                                  controls
                                  src={item.imageUrl}
                                  style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();   // 🔑 stop menu from closing
                                    setPreviewUrl(item.imageUrl);
                                    setIsPreviewVisible(true);
                                  }}
                                />
                              ) : (
                                <img
                                  src={item.imageUrl}
                                  alt="Notification"
                                  style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();   // 🔑 stop menu from closing
                                    setPreviewUrl(item.imageUrl);
                                    setIsPreviewVisible(true);
                                  }}
                                />
                              )
                            )}
                          </div>

                          <Divider
                            style={{
                              margin: '3px 0',
                              borderColor: darkMode ? '#808080' : '#ccc',
                            }}
                          />
                        </div>
                        {/* <Eye
                        style={{
                          fontSize: '14px',
                          cursor: 'pointer',
                          color: darkMode ? '#fff' : '#555',
                          flexShrink: 0,
                        }}
                        onClick={() => {
                          onClickNotificationView(item, label, userdetails?.email);
                        }}
                      /> */}
                      </div>
                    </div>

                    /* <span>{item.date}</span>
                    <Eye style={{ fontSize: 12, color: darkMode ? '#fff' : '#888' }} onClick={() => { onClickNotificationView(item, label, userdetails?.email) }} />
                  </div> */


                  ))}
            </div>
          ))}
        </div>
      </Menu.Item>

      <Menu.Divider style={{
        borderTop: `1px solid ${darkMode ? '#808080' : '#ccc'}`,
      }} />

      {/* <Menu.Item style={{ padding: 0 }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(!showAll);
          }}
          style={{
            textAlign: 'center',
            padding: '10px',
            color: darkMode ? '#fff' : '#000',
            cursor: 'pointer',
          }}
        >
          <u>{showAll ? 'Show less' : 'See all events'}</u>
        </div>
      </Menu.Item> */}
      <Menu.Item style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '10px 16px',
            color: darkMode ? '#fff' : '#000',
          }}
        >
          {/* Left side – <u> text link */}
          {/* <div
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(!showAll);
            }}
            style={{
              cursor: 'pointer',
              fontWeight: 500,
              color: '#91C25F',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            {showAll ? 'Show less' : 'See all '}
          </div> */}

          {/* Right side – Ant Design Button */}
          <Button
            type="primary"
            style={{
              backgroundColor: '#91C25F',
              color: '#000',
              border: 'none',
              boxShadow: 'none',
              height: '25px',
              fontSize: '12px',
            }}
            onClick={handleClearAll}
          >
            Mark all as seen
          </Button>
        </div>
      </Menu.Item>
      <Modal
        open={isPreviewVisible}
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
        centered
        width="100%"
        zIndex={3000}
        getContainer={document.body}
        bodyStyle={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
        style={{
          maxWidth: "80vw",

        }}
      >
        {previewUrl?.includes(".mp4") ? (
          <video
            src={previewUrl}
            controls
            style={{
              width: "100%",
              height: "80vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              height: "90vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        )}
      </Modal>


    </Menu>
  );



  // Handle viewing and removing the notification after modal closes
  const handleViewNotification = async (notification) => {
    if (!notification || !notification._id) {
      console.error('Invalid notification:', notification);
      return;
    }

    try {
      // console.log('Marking notification as viewed:', notification._id);
      const response = await apiClient.post('/Notifications/view', {
        email: userdetails?.email,
        notificationId: notification._id,
      });

      if (response.status === 200) {
        // console.log('Notification marked as viewed and removed:', notification._id);
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

  const isNotificationsFetched = useRef(true);

  function getItem(label, key, icon) {
    return {
      key,
      icon,
      label,
    };
  }

  const menuItems = [
    getItem('Dashboard', '/Dashboard', <HomeOutlined className={pathname === '/Dashboard' && 'black-icon'} />),
    status === 'authenticated' && (usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Reports', '/Reports', <DatabaseOutlined className={pathname === '/Reports' && 'black-icon'} />)),
    status === 'authenticated' && (usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Creatives', '/Creatives', <PieChartOutlined className={pathname === '/Creatives' && 'black-icon'} />)),
    status === 'authenticated' && (usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Campaigns', '/Campaigns', <DesktopOutlined className={pathname === '/Campaigns' && 'black-icon'} />)),
    // getItem('Users', '/Users', <ContainerOutlined />),
    status === 'authenticated' && (usersDataForLogin[0]?.role === 'Admin' && getItem('NewUser', '/NewUser', <UserOutlined className={pathname === '/NewUser' && 'black-icon'} />)),
    status === 'authenticated' && (usersDataForLogin[0]?.role === 'Admin' && getItem('Activities', '/Activities', <LaptopOutlined className={pathname === '/Activities' && 'black-icon'} />)),
  ].filter(Boolean);

  useLayoutEffect(() => {
    if (visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDrawerPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [visible]);

  useEffect(() => {
    themeForNotifications.current = theme;
  }, [theme]);

  useEffect(() => {
    const updateDrawerPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDrawerPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (visible) updateDrawerPosition();

    window.addEventListener("resize", updateDrawerPosition);
    return () => window.removeEventListener("resize", updateDrawerPosition);
  }, [visible]);



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
  const handleMenuItemClick = (key) => {
    router.push(key);
    setVisible(false);
  };

  // Function to handle adding a notification via the backend API
  const handleAddNotification = async () => {
    if (!title || !description) {
      alert('Title and description are required.');
      return;
    }

    try {
      const response = await apiClient.post('/Notifications/add', {
        title,
        description,
      });

      if (response.status === 200) {
        message.success('Notification added to all users');
        openNotification()
        setTitle('');
        setDescription('');
        setIsAddNotificationModalVisible(false);
      } else {
        message.error('Failed to add notification');
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      message.error('An error occurred while adding the notification.');
    }
  };


  // const renderNotifications = () => {
  //   return notifications.map((notification, index) => (
  //     <div
  //       key={index}
  //       style={{
  //         padding: '5px 0',
  //         borderBottom: '1px solid #f0f0f0',
  //         display: 'flex',
  //         flexDirection: 'column',
  //         justifyContent: 'space-between',
  //         position: 'relative',
  //         minHeight: 'auto',
  //       }}
  //     >
  //       <div>
  //         <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
  //           {notification.title}
  //         </h3>

  //         <p
  //           style={{
  //             fontSize: '14px',
  //             marginBottom: '20px',
  //             color: darkMode ? '#fff' : '#555',
  //             overflow: 'hidden',
  //             textOverflow: 'ellipsis',
  //             display: '-webkit-box',
  //             WebkitLineClamp: 2,
  //             WebkitBoxOrient: 'vertical',
  //           }}
  //         >
  //           {notification.description}
  //         </p>

  //       </div>

  //       <EyeOutlined
  //         style={{
  //           position: 'absolute',
  //           top: '10px',
  //           right: '10px',
  //           fontSize: '18px',
  //           cursor: 'pointer',
  //           color: '#1890ff',
  //         }}
  //         onClick={() => openViewNotificationModal(notification)}
  //       />

  //       <div
  //         style={{
  //           fontSize: '12px',
  //           color: '#888',
  //           textAlign: 'right',
  //           marginTop: '10px',
  //         }}
  //       >
  //         {notification.date}
  //       </div>
  //     </div>
  //   ));
  // };


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

  // const getAvatarSrc = () => {
  //   if (userdetails?.gender === 'Male') {
  //     return maleImoji;
  //   } else if (userdetails?.gender === 'Female') {
  //     return femaleImoji;
  //   }
  // };

  // Dropdown for authenticated users (Profile + Sign Out)
  const dropdownItemsAuthenticated = [
    {
      key: '1',
      label: (
        <a onClick={openProfileModal} >
          Profile
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a
          onClick={() => {
            const { storedData, activeTab, showGraph } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab, showGraph });
            localStorage.setItem('redirectUrl', router.asPath);
            router.push('/api/auth/signout');
          }}
        >
          Sign out
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

  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewImage, setPreviewImage] = useState(null);  // State for image preview
  const [imageFile, setImageFile] = useState(null);  // Temporary state for storing the file before upload
  // const [open, setOpen] = useState(false);  


  // Fetch the user's avatar URL on page load or when userdetails change
  // let shouldRetry = true; // Global or module-level flag to control retries

  // const fetchUserAvatarWithRetry = async (retries = 3, delay = 2500) => {
  //   try {
  //     if (!shouldRetry) {
  //       console.log('Retries have been stopped due to a 404 error.');
  //       return;
  //     }

  //     console.log('Fetching user avatar with retry...');
  //     const email = userdetails?.email;

  //     if (!email) {
  //       console.warn('Email is missing. Cannot fetch user avatar.');
  //       setAvatarUrl(getDefaultAvatar());
  //       return;
  //     }

  //     const response = await axios.get(`https://prodapis.adsgoat.in/GetUserImage`, {
  //       params: { email },
  //       headers: {
  //         Authorization: localStorage.getItem('token'),
  //       },
  //     });

  //     if (response.data.success) {
  //       const fetchedAvatarUrl = response.data.imageUrl;
  //       console.log('Fetched avatar URL:', fetchedAvatarUrl);
  //       setAvatarUrl(fetchedAvatarUrl || getDefaultAvatar());
  //     } else {
  //       console.error('Error fetching avatar:', response.data.message);
  //       setAvatarUrl(getDefaultAvatar());
  //     }
  //   } catch (error) {
  //     if (error.response && error.response.status === 404) {
  //       // Stop retries if the response status is 404
  //       console.error('Error 404: Resource not found. Stopping retries.');
  //       shouldRetry = false; // Set flag to false to stop further retries
  //       setAvatarUrl(getDefaultAvatar());
  //       return;
  //     }

  //     if (retries > 0) {
  //       console.log(`Retrying... (${retries} retries left)`);
  //       setTimeout(() => fetchUserAvatarWithRetry(retries - 1, delay), delay);
  //     } else {
  //       console.error('Failed to fetch avatar after retries:', error);
  //       setAvatarUrl(getDefaultAvatar());
  //     }
  //   }
  // };

  const showAllAntdNotificationsSequentially = (notifications) => {
    notifications.forEach((notif, index) => {
      setTimeout(() => {
        // ✅ use current mute state
        if (!isMutedRef.current) {
          playNotificationSound();
        }

        api.open({
          key: `notify-${index}`,
          message: notif._category,
          description: notif.message,
          placement: "topRight",
          duration: 5,
          pauseOnHover: true,
          showProgress: true,
          className: themeForNotifications.current === "dark" ? "custom-dark-notification" : "",
        });
      }, index * 500);
    });
  };


  // const showAllAntdNotificationsSequentially = (notifications) => {
  //   notifications.forEach((notif, index) => {
  //     setTimeout(() => {
  //       playNotificationSound(); // if needed
  //       api.open({
  //         key: `notify-${index}`,
  //         message: notif._category, // 👈 category as title
  //         description: notif.message,
  //         placement: "topRight",
  //         duration: 5,
  //         pauseOnHover: true,
  //         showProgress: true,
  //         className: themeForNotifications.current === "dark" ? "custom-dark-notification" : "",
  //       });
  //     }, index * 500);
  //   });
  // };

  const playNotificationSound = () => {
    const audio = new Audio(soundFile); // Create an audio object with the sound file
    audio.play().catch((err) => console.error("🔇 Sound error:", err));
  };

  useEffect(() => {
    // shouldRetry = true; // Reset flag when `userdetails` changes
    // fetchUserAvatarWithRetry();
    if (userdetails?.profileImage) {
      setAvatarUrl(userdetails?.profileImage);
    }
  }, [userdetails]);


  // useEffect(() => {
  //   console.log("🔔 Setting up notifications...");
  //   if (!userdetails?.email) return;

  //   // Register with backend
  //   socket.emit("register", userdetails.email.trim().toLowerCase());

  //   // Initial fetch to seed prev ref
  //   fetchNotifications().then((initial) => {
  //     console.log("🟢 Initial full notifications:", initial);
  //     prevNotificationsRef.current = initial;
  //   });

  //   const handleUpdate = async () => {
  //     const newNotifications = await fetchNotifications();
  //     const old = prevNotificationsRef.current || {};
  //     const newlyAdded = [];

  //     console.log("📦 New full notifications:", newNotifications);
  //     console.log("📁 Previous:", old);

  //     for (const category of Object.keys(newNotifications)) {
  //       const newItems = newNotifications[category];
  //       const oldItems = old[category] || [];

  //       const newInCategory = newItems.filter((n) => {
  //         return !oldItems.some((o) => {
  //           return n.id && o.id ? n.id === o.id : (
  //             o.message === n.message &&
  //             new Date(o.date).getTime() === new Date(n.date).getTime()
  //           );
  //         });
  //       });

  //       newInCategory.forEach((item) =>
  //         newlyAdded.push({ ...item, _category: category })
  //       );
  //     }

  //     console.log("🆕 Newly added:", newlyAdded);

  //     if (newlyAdded.length > 0) {
  //       console.log("theme", theme);
  //       showAllAntdNotificationsSequentially(newlyAdded);
  //     }

  //     prevNotificationsRef.current = newNotifications;
  //   };

  //   socket.on("notifications_updated", handleUpdate);

  //   return () => {
  //     socket.off("notifications_updated", handleUpdate);
  //   };
  // }, [userdetails?.email]);

//   useEffect(() => {

//     console.log("🔔 Setting up notifications...");

//     if (!userdetails?.email) return;

//     /*
//     ✅ NORMALIZE EMAIL
//     */
//     const normalizedEmail =
//       userdetails.email.trim().toLowerCase();

//     /*
//     ✅ REGISTER USER
//     */
//     const registerUser = () => {

//       console.log("📨 REGISTERING:", normalizedEmail);

//       socket.emit("register", normalizedEmail);

//     };

//     /*
//     ✅ INITIAL CONNECT
//     */
//     socket.on("connect", () => {

//   console.log(
//     "✅ SOCKET CONNECTED:",
//     socket.id
//   );

//   /*
//   ✅ JOIN ROOM AGAIN
//   */
//   registerUser();

// });

//     /*
//     ✅ RECONNECT AFTER SERVER RESTART
//     */
//     // socket.on("reconnect", () => {

//     //   console.log(
//     //     "♻️ SOCKET RECONNECTED:",
//     //     socket.id
//     //   );

//     //   registerUser();

//     // });

//     /*
//     ✅ INITIAL FETCH
//     */
//     fetchNotifications().then((initial) => {

//       console.log(
//         "🟢 Initial full notifications:",
//         initial
//       );

//       prevNotificationsRef.current =
//         initial || {};

//     });

//     /*
//     ✅ HANDLE SOCKET EVENT
//     */
//     const handleUpdate = async () => {

//       console.log(
//         "🔥 notifications_updated RECEIVED"
//       );

//       const newNotifications =
//         await fetchNotifications();

//       const old =
//         prevNotificationsRef.current || {};

//       const newlyAdded = [];

//       console.log(
//         "📦 New full notifications:",
//         newNotifications
//       );

//       console.log(
//         "📁 Previous:",
//         old
//       );

//       for (
//         const category of Object.keys(
//           newNotifications || {}
//         )
//       ) {

//         const newItems =
//           newNotifications[category] || [];

//         const oldItems =
//           old[category] || [];

//         const newInCategory =
//           newItems.filter((n) => {

//             return !oldItems.some((o) => {

//               return n.id && o.id
//                 ? n.id === o.id
//                 : (
//                   o.message === n.message &&
//                   new Date(o.date).getTime() ===
//                   new Date(n.date).getTime()
//                 );

//             });

//           });

//         newInCategory.forEach((item) => {

//           newlyAdded.push({
//             ...item,
//             _category: category,
//           });

//         });

//       }

//       console.log(
//         "🆕 Newly added:",
//         newlyAdded
//       );

//       if (newlyAdded.length > 0) {

//         showAllAntdNotificationsSequentially(
//           newlyAdded
//         );

//       }

//       prevNotificationsRef.current =
//         newNotifications || {};

//     };

//     /*
//     ✅ SOCKET EVENT LISTENER
//     */
//     socket.on(
//       "notifications_updated",
//       handleUpdate
//     );

//     /*
//     ✅ CLEANUP
//     */
//     return () => {

//       socket.off("connect");

//       // socket.off("reconnect");

//       socket.off(
//         "notifications_updated",
//         handleUpdate
//       );

//     };

//   }, [userdetails?.email]);

useEffect(() => {

  // console.log("🔔 Setting up notifications...");

  if (!userdetails?.email) return;

  /*
  ✅ NORMALIZE EMAIL
  */
  const normalizedEmail =
    userdetails.email.trim().toLowerCase();

  /*
  ✅ REGISTER USER INTO ROOM
  */
  const registerUser = () => {

    // console.log(
    //   "📨 REGISTERING:",
    //   normalizedEmail
    // );

    socket.emit(
      "register",
      normalizedEmail
    );

  };

  /*
  ✅ SOCKET ALREADY CONNECTED
  */
  if (socket.connected) {

    // console.log(
    //   "✅ SOCKET ALREADY CONNECTED:",
    //   socket.id
    // );

    registerUser();

  }

  /*
  ✅ CONNECT + RECONNECT
  */
  const handleConnect = () => {

    // console.log(
    //   "✅ SOCKET CONNECTED:",
    //   socket.id
    // );

    registerUser();

  };

  socket.on("connect", handleConnect);

  /*
  ✅ INITIAL FETCH
  */
  fetchNotifications().then((initial) => {

    // console.log(
    //   "🟢 Initial full notifications:",
    //   initial
    // );

    prevNotificationsRef.current =
      initial || {};

  });

  /*
  ✅ HANDLE SOCKET EVENT
  */
  const handleUpdate = async () => {

    // console.log(
    //   "🔥 notifications_updated RECEIVED"
    // );

    const newNotifications =
      await fetchNotifications();

    const old =
      prevNotificationsRef.current || {};

    const newlyAdded = [];

    // console.log(
    //   "📦 New full notifications:",
    //   newNotifications
    // );

    // console.log(
    //   "📁 Previous:",
    //   old
    // );

    for (
      const category of Object.keys(
        newNotifications || {}
      )
    ) {

      const newItems =
        newNotifications[category] || [];

      const oldItems =
        old[category] || [];

      const newInCategory =
        newItems.filter((n) => {

          return !oldItems.some((o) => {

            return n.id && o.id
              ? n.id === o.id
              : (
                  o.message === n.message &&
                  new Date(o.date).getTime() ===
                  new Date(n.date).getTime()
                );

          });

        });

      newInCategory.forEach((item) => {

        newlyAdded.push({
          ...item,
          _category: category,
        });

      });

    }

    // console.log(
    //   "🆕 Newly added:",
    //   newlyAdded
    // );

    if (newlyAdded.length > 0) {

      showAllAntdNotificationsSequentially(
        newlyAdded
      );

    }

    prevNotificationsRef.current =
      newNotifications || {};

  };

  /*
  ✅ SOCKET LISTENER
  */
  socket.on(
    "notifications_updated",
    handleUpdate
  );

  /*
  ✅ CLEANUP
  */
  return () => {

    socket.off(
      "connect",
      handleConnect
    );

    socket.off(
      "notifications_updated",
      handleUpdate
    );

  };

}, [userdetails?.email]);

  // fetchNotifications always returns array
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get(`https://app.vyaktimetrics.com/open/notifications/${session.user.email}`);
      setNotifications(res.data); // Update state with fetched notifications
      onComplete();
      return res.data || {};
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      return [];
    }
  };





  // Get the default avatar source based on gender
  const getDefaultAvatar = () => {
    // console.log('Determining default avatar...');
    if (userdetails?.gender === 'Male') {
      return maleImoji;
    } else if (userdetails?.gender === 'Female') {
      return femaleImoji;
    } else {
      return ''; // Fallback if gender is not available
    }
  };

  // Store image URL in the database
  const storeImageUrlInDb = async (imageUrl) => {
    try {
      const email = userdetails?.email;
      if (!email) {
        throw new Error('Email is required to store image URL.');
      }

      const response = await apiClient.post(
        '/open/userimage',
        { email, imageUrl },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json',
          },
        }
      );

      return response; // Return the response containing the updated user data
    } catch (error) {
      console.error('Error storing image URL in the database:', error);
      alert('Error storing image URL. Please try again later.');
    }
  };

  // Handle the preview of the selected image
  const handlePreviewImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result); // Set the preview image as the file content
      // console.log("Image preview updated.");
    };
    if (file) {
      reader.readAsDataURL(file); // Read the file as a DataURL
      setImageFile(file); // Store the file temporarily
      // console.log("Image file temporarily stored:", file);
    }
  };

  // Handle confirm to upload the selected image
  const handleConfirmUpload = () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      // console.log("FormData prepared for upload:", formData);

      // Call your API here to upload the image
      fetch('https://app.vyaktimetrics.com/creatives/userfiles/uploaduserimage', {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData,
      })
        .then((response) => response.json())
        .then(async (data) => {

          if (data.imageUrl) {
            // console.log("Image successfully uploaded. Image URL:", data.imageUrl);

            // Store the image URL in the database
            const response = await storeImageUrlInDb(data.imageUrl);

            // Update the avatar and clear the preview
            if (response?.data?.success) {
              setAvatarUrl(data.imageUrl); // Update the avatar with the stored URL
              setPreviewImage(null); // Clear the preview after successful upload and store
            } else {
              console.error("Failed to store the image URL in the database.");
            }
          } else {
            console.error("Image URL not returned from upload API.");
            alert("Image upload failed. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error during file upload:", error);
          alert("Something went wrong while uploading the image. Please try again.");
        });
    } else {
      console.log("No image file to upload.");
    }
  };


  // Upload properties for the file uploader
  const uploadProps = {
    name: 'file',
    action: 'https://www.testapi.adsgoat.in/upload',
    headers: {
      Authorization: localStorage.getItem('token'),
    },
    showUploadList: false,
    // onChange: handleFileChange,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        alert('You can only upload image files!');
        return false; // Cancel upload if not an image
      }
      handlePreviewImage(file); // Preview image on file selection
      return false; // Prevent the automatic upload
    },
    onError: (error) => {
      console.error('Error during file upload:', error);
      alert('Something went wrong while uploading the image. Please try again.');
    },
  };

  const onChangeStickyNotes = () => {
    setOpen(true);
  };

  const onClickCalculator = () => {
    setOpenCalculator(true);
  };

  const onClickWorlTime = () => {
    setOpenWorldTime(true);
  }
  // console.log("Notifications:", notifications);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: darkMode ? '#333' : '#fff',
        paddingRight: '20px',
        margin: '10px',
        display: 'flex',
        justifyContent: "space-between",
        alignItems: 'center',
        height: '50px',
      }}
    >
      {contextHolder}
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
          justifyContent: 'flex-end',
          marginLeft: 'auto',
          width: '100%',
        }}
      >
        {/* Conditional rendering based on authentication and authorization status */}
        {isUserAuthorized ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", width: '100%' }}>
            <div>
              <Image
                // src="/ssk1.png"
                src={darkMode ? "/ssk2.png" : "/ssk1.png"}
                width={70}   // Smaller logo when collapsed
                height={35}
                priority={true}
                alt="Collapsed Logo"
                style={{ margin: "0px 12px", width: "60%", height: "revert-layer", objectFit: "contain" }}
                onClick={toggleDrawer}
                className='logo'
              />
            </div>
            <div className='navbar-1'>
              {/* <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <span style={{ cursor: 'pointer' }}>
                <Bell style={{ fontSize: 24 }} />
              </span>
            </Dropdown> */}



              {userdetails?.role !== "Revenue_Partner" && <button style={{
                padding: '0px', margin: '0px', backgroundColor: theme === "dark" &&
                  "transparent"
              }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onClickCalculator}>
                <CalculateOutlined size={20} style={{ marginRight: '10px' }} />
              </button>}

              {userdetails?.role !== "Revenue_Partner" && <button style={{
                padding: '0px', margin: '0px',
                backgroundColor: theme === "dark" &&
                  "transparent"
              }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onClickWorlTime}>
                <TfiWorld size={20} style={{ marginRight: '10px' }} />
              </button>}

              {userdetails?.role !== "Revenue_Partner" && <div className="relative inline-block" ref={wrapperRef} style={{ marginRight: "0px", paddingRight: '0px' }}>
                <div className="cursor-pointer" style={{ paddingRight: '0px' }}>
                  {/* <Bell size={20} /> */}
                  <Dropdown popupRender={() => menu} trigger={['click']} placement="bottomRight">
                    <span style={{ cursor: 'pointer' }}>
                      <Bell style={{ fontSize: 24 }} />
                    </span>
                  </Dropdown>

                  {Object.values(notifications)
                    .filter(Array.isArray)
                    .flat().length > 0 && (
                      <Badge
                        style={{ color: 'red' }}
                        className="Badge absolute -top-2 -right-2"
                        variant="destructive"
                      >
                        {/* {Object.values(notifications)
                          .filter(Array.isArray)
                          .flat().length} */}
                        {(() => {
                          const count = Object.values(notifications)
                            .filter(Array.isArray)
                            .flat().length;

                          return count > 99 ? "99+" : count;
                        })()}
                      </Badge>
                    )}
                </div>
              </div>}

              {userdetails?.role !== "Revenue_Partner" && <button style={{
                padding: '0px', margin: '0px', backgroundColor: theme === "dark" &&
                  "transparent"
              }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onChangeStickyNotes}>
                <StickyNote2Outlined size={20} style={{ marginRight: '10px', marginLeft: '10px' }} />
              </button>}

              <button
                onClick={toggleTheme}
                style={{
                  padding: '0px', margin: '0px', marginRight: '10px', backgroundColor: theme === "dark" &&
                    "transparent"
                }}
                className={`${darkMode ? 'dark-mode' : 'light-mode'}`}
              >
                {darkMode ? (
                  <Sun className="icon sun-icon" style={{ width: "20px", height: "20px" }} />
                ) : (
                  <MoonIcon size={20} className="icon moon-icon" style={{ width: "20px", height: "20px", fontSize: '20px' }} />
                )}
              </button>
              <h2
                style={{
                  color: darkMode ? '#fff' : '#000',
                  margin: 0,
                  fontSize: '17px',
                  transition: 'color 0.3s ease',
                  // display: width <= 500 ? 'none' : 'block', 
                  marginLeft: '10px',
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
                  size={36}
                  src={avatarUrl || getDefaultAvatar()}
                  style={{
                    background: darkMode ? '#6e6b6b' : '#ebebeb',
                    fontSize: '1.8em',
                    transition: 'background 0.3s ease',
                    marginLeft: '10px',
                  }}
                />
              </Dropdown>
            </div>
            <div className='navbar-2'>
              {!showIcons && <div><DoubleLeftOutlined onClick={() => setShowIcons(true)} style={{ fontSize: '10px', padding: '0px', margin: '0px' }} /></div>}


              {userdetails?.role !== "Revenue_Partner" && showIcons && <div className="relative inline-block" ref={wrapperRef}>
                <div className="cursor-pointer">
                  {/* <Bell size={20} style={{marginLeft:  '5px'}}/>  onClick={openNotificationsList}*/}
                  <Dropdown popupRender={() => menu} trigger={['click']} placement="bottomRight">
                    <span style={{ cursor: 'pointer' }}>
                      <Bell style={{ fontSize: 24 }} />
                    </span>
                  </Dropdown>
                  {Object.values(notifications)
                    .filter(Array.isArray)
                    .flat().length > 0 && (
                      <Badge
                        style={{ color: 'red' }}
                        className="Badge absolute -top-2 -right-2"
                        variant="destructive"
                      >
                        {/* {Object.values(notifications)
                          .filter(Array.isArray)
                          .flat().length} */}
                        {(() => {
                          const count = Object.values(notifications)
                            .filter(Array.isArray)
                            .flat().length;

                          return count > 99 ? "99+" : count;
                        })()}
                      </Badge>
                    )}
                </div>
              </div>}

              {userdetails?.role !== "Revenue_Partner" && showIcons && <button style={{ padding: '0px', margin: '0px' }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onChangeStickyNotes}>
                <SlNotebook size={20} style={{ marginLeft: '5px' }} />
              </button>}

              {userdetails?.role !== "Revenue_Partner" && showIcons && <button style={{ padding: '0px', margin: '0px' }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onClickCalculator}>
                <CalculatorOutlined style={{ fontSize: '20px', padding: '0px', margin: '0px', marginLeft: '5px' }} />
              </button>}
              {userdetails?.role !== "Revenue_Partner" && showIcons && <button style={{
                padding: '0px', margin: '0px', backgroundColor: theme === "dark" &&
                  "green"
              }} className={`${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={onClickWorlTime}>
                <TfiWorld size={20} style={{ marginLeft: '5px' }} />
              </button>}

              {showIcons && <button
                onClick={toggleTheme}
                style={{ padding: '0px', margin: '0px', marginLeft: '5px' }}
                className={`${darkMode ? 'dark-mode' : 'light-mode'}`}
              >
                {darkMode ? (
                  <Sun className="icon sun-icon" style={{ width: "20px", height: "20px" }} />
                ) : (
                  <Moon className="icon moon-icon" style={{ width: "20px", height: "20px", }} />
                )}
              </button>}
              {showIcons && <div><DoubleRightOutlined onClick={() => setShowIcons(false)} style={{ fontSize: '10px', padding: '0px', margin: '0px', marginLeft: '5px' }} /></div>}
              <Dropdown
                menu={{
                  items: dropdownItemsAuthenticated,
                }}
                placement="bottomLeft"
                arrow={{ pointAtCenter: true }}
              >
                <Avatar
                  size={36}
                  src={avatarUrl || getDefaultAvatar()}
                  style={{
                    background: darkMode ? '#333' : '#ebebeb',
                    fontSize: '1.8em',
                    transition: 'background 0.3s ease',
                    marginLeft: '5px',
                  }}
                />
              </Dropdown>
            </div>
          </div>
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
        open={isViewNotificationModalVisible}
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
      {/* <Modal
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
          top: `${modalPosition.top + 70}px`, 
          right: `${modalPosition.right + 1}rem`,
          position: 'absolute',
          padding: '0px'
        }}
      >
        {userdetails?.role === 'Admin' && <button style={{ marginRight: '10px', padding: '7px', borderRadius: '5px', backgroundColor: '#6495ED', border: 'none', color: 'white' }} onClick={openAddNotificationModal}>Add Notification</button>}

        <div style={{ padding: '0px' }}>
          {renderNotifications()}
        </div>
      </Modal> */}




      {/* Add Notification Modal */}
      <Modal
        open={isAddNotificationModalVisible}
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
        open={isModalVisible}
        width="50%"
        onCancel={onHandleCancel}
        footer={null}
        style={{ textAlign: 'center', borderRadius: '8px', padding: '0px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', height: '12%', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Display the image preview if exists */}
              <img
                src={previewImage || avatarUrl || getDefaultAvatar()} // Show the preview image or fallback to avatarUrl or default
                alt="Avatar"
                style={{ width: 110, height: 110, borderRadius: '50%', border: '2px solid #ccc' }}
              />

              <Upload {...uploadProps}>
                <Button style={{ marginTop: '10px', backgroundColor: '#91C25F', border: '#91C25F' }} icon={<UploadOutlined className="black-icon" />} loading={loading}>
                  {loading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </Upload>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'flex-start', padding: '0px' }}>
              <p style={{ margin: '1px' }}><span style={{ fontWeight: 'bold' }}>ID:</span> {userdetails ? userdetails._id : ''}</p>
              <p style={{ margin: '1px' }}><span style={{ fontWeight: 'bold' }}>EMAIL_ID:</span> {userdetails ? userdetails.email : 'No email'}</p>
              <p style={{ margin: '1px' }}><span style={{ fontWeight: 'bold' }}>Name:</span> {userdetails ? userdetails.userName : 'Guest'}</p>
            </div>
          </div>

          {/* Display the Confirm button to trigger upload */}
          {previewImage && (
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleConfirmUpload} type="primary">
                Confirm & Upload Image
              </Button>
            </div>
          )}

          <hr style={{ border: '1px solid black', width: '100%' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ maxHeight: '200px', width: '100%', overflowY: 'auto', padding: '10px', border: '1px solid #ccc', marginBottom: '20px' }}>
              {/* Render Ad Accounts or any other content */}
              {renderAdAccounts && renderAdAccounts()}
            </div>
          </div>
        </div>
      </Modal>
      {open && (
        // <Draggable>
        <div
          style={{
            position: "absolute",
            top: "20px", // or wherever you want it to start
            right: "20px",
            background: "white", // or transparent if you'd like
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            borderRadius: "8px",
            zIndex: 9999
          }}
        >
          {/* A close button to hide it again */}
          {/* <button 
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                float: "right",
                fontSize: "16px"
              }}
            >
              ✖
            </button> */}

          {/* The actual sticky notes component */}
          <StickyNotes userEmail={userdetails?.email} setOpen={setOpen} userdetails={userdetails} />
        </div>
        // </Draggable>
      )}

      {openCalculator &&
        (<div>
          <Calculator setOpenCalculator={setOpenCalculator} />
        </div>)
      }
      {/* <Modal open={openWorldTime} width="100%" onCancel={()=> setOpenWorldTime(false)}>
      <div>
        <WorldTime setOpenWorldTime={setOpenWorldTime} />
      </div>
    </Modal> */}
      <Drawer open={openWorldTime} width="95%" onClose={() => setOpenWorldTime(false)} style={{
        backgroundColor: theme === 'dark' ? '#333' : '#fff'
      }}>
        <div>
          <WorldTime setOpenWorldTime={setOpenWorldTime} />
        </div>
      </Drawer>
      {/* <Modal open={openCalculator} width="100%" onCancel={()=> setOpenCalculator(false)}>
      <div>
        <Calculator setOpenCalculator={setOpenCalculator} />
      </div>
    </Modal> */}
      <Drawer open={openCalculator} width="32%" onClose={() => setOpenCalculator(false)} style={{
        backgroundColor: theme === 'dark' ? '#333' : '#fff'
      }}>
        <div>
          <Calculator setOpenCalculator={setOpenCalculator} />
        </div>
      </Drawer>

      {visible && (
        <div
          style={{
            position: "fixed",
            top: drawerPosition.top,
            left: drawerPosition.left,
            width: drawerPosition.width,
            zIndex: 1000, // above page content
            // display: width > 500 ? 'none' : 'block', // Hide on mobile
          }}
          className='mobile-navbar'
        >
          <Drawer
            open={visible}
            onClose={() => setVisible(false)}
            placement="top"
            height={50}
            getContainer={false}
            mask={false} // ❌ no AntD mask
            motion={null}
            closable={false}
            title={null}
            bodyStyle={{ padding: 0 }}
            style={{
              position: "fixed",
              top: drawerPosition.top,
              left: drawerPosition.left,
              width: drawerPosition.width,
              height: 50,
              margin: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "none",
              // backgroundColor: theme === "dark" ? "#000" : "#fff",
            }}
          >
            {/* 🔥 Transparent full-page backdrop for outside click detection */}
            <div
              onClick={() => setVisible(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: -1, // behind drawer content
                background: "transparent", // fully transparent
                pointerEvents: "none",
              }}
            />

            {/* 👇 Your actual content */}
            <div style={{ zIndex: 1 }}>
              <Menu
                mode="inline"
                selectedKeys={[pathname]}
                style={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  color: darkMode ? '#007BFF' : '#000',
                  // color: '#007BFF',
                  fontSize: '16px',
                  borderRight: 'none',
                  // marginTop: '10px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={(e) => handleMenuItemClick(e.key)}
              >
                {menuItems.map(item => (
                  <Menu.Item key={item.key} style={{ color: darkMode ? pathname === item.key ? "#000" : 'white' : '#000', fontWeight: "500", fontSize: "16px", display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                  </Menu.Item>
                ))}
              </Menu>
            </div>
          </Drawer>
        </div>
      )}

    </div>
  );
};

const LayoutWrapper = ({ children, usersDataForLogin, onComplete }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const { setuserdetails } = useTokenContext();
  const { apiClient } = useTokenContext();
  const [topbarStatus, setTopbarStatus] = useState(false);
  const [loginError, setLoginError] = useState(false);


  const isCalledRef = useRef(false);  // To ensure getUsersData API is called only once

  const debouncedRetry = debounce((fetchFunc, retries, resolve, reject) => {
    retryFetch(fetchFunc, retries - 1).then(resolve).catch(reject);
  }, 2000);

  const retryFetch = async (fetchFunc, retries = 3) => {
    try {
      return await fetchFunc();  // Try the API call
    } catch (error) {
      if (retries === 1) throw error;  // Throw error if no retries left

      // console.log(`Retrying... Attempts left: ${retries - 1}`);

      // Use debounce for a delay before retrying
      return new Promise((resolve, reject) => {
        debouncedRetry(fetchFunc, retries, resolve, reject);
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // console.log(localStorage.getItem("token"))
      try {
        // console.log("Session Status: ", sessionStatus);
        // console.log("Session Data: ", session);
        setUsersData(usersDataForLogin);
        setLoading(false);
        const path = typeof window !== "undefined" ? window.location.pathname : null;
        // console.log(path.split("/"));
        //  && path.split("/")[1] !== "DailyAndCampaignHistory" && path.split("/")[1] !== "AllCampaigns" && path.split("/")[1] !== "LiveHistory"
        if (usersDataForLogin) {
          // console.log(usersDataForLogin);
          // Case Media_Buyer
          switch (usersDataForLogin[0].role) {

            case 'Media_Buyer':
              const MediaBuyeradAccounts = usersDataForLogin[0].adAccounts;
              const MediaBuyerkeysOfAdAccounts = Object.keys(MediaBuyeradAccounts);
              const MediaBuyernewObject = {};
              // console.log(MediaBuyerkeysOfAdAccounts, "keys");

              for (let item of MediaBuyerkeysOfAdAccounts) {
                if (MediaBuyeradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  const networkResponse = await retryFetch(() => apiClient.get(`/open/auth/network?network=${item}`));
                  MediaBuyernewObject[item] = networkResponse.data.data;
                } else {
                  const response = await retryFetch(() =>
                    apiClient.post('/open/auth/nameandstatusofaccounts', { updatedNetwork: MediaBuyeradAccounts[item] })
                  );
                  MediaBuyernewObject[item] = response.data.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: MediaBuyernewObject });
              break;

            case 'Revenue_Partner':
              // const RevenuePartneradAccounts = usersDataForLogin[0].adAccounts;
              // const RevenuePartnerkeysOfAdAccounts = Object.keys(RevenuePartneradAccounts);
              // const RevenuePartnernewObject = {};
              // console.log(RevenuePartnerkeysOfAdAccounts, "keys");

              // for (let item of RevenuePartnerkeysOfAdAccounts) {
              //   if (RevenuePartneradAccounts[item][0] === "All") {
              //     // Retry logic for Accounts API
              //     const networkResponse = await retryFetch(() => axios.get(`https://prodapis.adsgoat.in/network/Accounts?network=${item}`));
              //     RevenuePartnernewObject[item] = networkResponse.data;
              //   } else {
              //     const response = await retryFetch(() =>
              //       axios.post('https://prodapis.adsgoat.in/getAccountNameandStatusofNetwork/', { updatedNetwork: RevenuePartneradAccounts[item] })
              //     );
              //     RevenuePartnernewObject[item] = response.data;
              //   }
              // }
              setuserdetails({ ...usersDataForLogin[0] });
              break;

            // Case Special_User
            case 'Special_User':
              const SpecialUseradAccounts = usersDataForLogin[0].adAccounts;
              const SpecialUserkeysOfAdAccounts = Object.keys(SpecialUseradAccounts);
              const SpecialUsernewObject = {};
              // console.log(SpecialUserkeysOfAdAccounts, "keys");

              for (let item of SpecialUserkeysOfAdAccounts) {
                if (SpecialUseradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  // console.log(item);
                  const networkResponse = await retryFetch(() => apiClient.get(`/open/auth/network?network=${item}`));
                  SpecialUsernewObject[item] = networkResponse.data.data;
                } else {
                  const response = await retryFetch(() =>
                    apiClient.post('/open/auth/nameandstatusofaccounts', { updatedNetwork: SpecialUseradAccounts[item] })
                  );
                  SpecialUsernewObject[item] = response.data.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: SpecialUsernewObject });
              break;

            // Case Manager
            case 'Manager':
              const ManageradAccounts = usersDataForLogin[0].adAccounts;
              const ManagerkeysOfAdAccounts = Object.keys(ManageradAccounts);
              const ManagernewObject = {};
              // console.log(ManagerkeysOfAdAccounts, "keys");

              for (let item of ManagerkeysOfAdAccounts) {
                if (ManageradAccounts[item][0] === "All") {
                  // Retry logic for Accounts API
                  const networkResponse = await retryFetch(() => apiClient.get(`/open/auth/network?network=${item}`));
                  ManagernewObject[item] = networkResponse.data.data;
                } else {
                  const response = await retryFetch(() =>
                    apiClient.post('/open/auth/nameandstatusofaccounts', { updatedNetwork: ManageradAccounts[item] })
                  );
                  ManagernewObject[item] = response.data.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: ManagernewObject });
              break;

            case 'Network_Partner':
              const Network_Partner = usersDataForLogin[0].adAccounts;
              const NetworkPartnerAdAccounts = Object.keys(Network_Partner);
              const NetworkPartnerObject = {};
              // console.log(NetworkPartnerAdAccounts, "keys");

              for (let item of NetworkPartnerAdAccounts) {
                if (Network_Partner[item][0] === "All") {
                  // Retry logic for Accounts API
                  // console.log(item);
                  const networkResponse = await retryFetch(() => apiClient.get(`/open/auth/network?network=${item}`));
                  NetworkPartnerObject[item] = networkResponse.data.data;
                } else {
                  const response = await retryFetch(() =>
                    apiClient.post('/open/auth/nameandstatusofaccounts', { updatedNetwork: Network_Partner[item] })
                  );
                  NetworkPartnerObject[item] = response.data.data;
                }
              }
              setuserdetails({ ...usersDataForLogin[0], adAccounts: NetworkPartnerObject });
              break;

            // Case Admin
            case 'Admin':
              // Retry logic for All Accounts API
              const AllAccountsData = await retryFetch(() => apiClient.get(`/open/auth/admin`));
              const responseData = AllAccountsData.data.data;
              // console.log(responseData, "responseData");
              setuserdetails({ ...usersDataForLogin[0], adAccounts: responseData });
              break;

            default:
              setuserdetails(usersDataForLogin);
          }
        }
        else {
          setuserdetails(usersDataForLogin[0]);
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

  useEffect(() => {
    if (initialized && topbarStatus) {
      onComplete();
    }
  }, [initialized, topbarStatus]);


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

  const handleTopbarCalling = () => {
    setTopbarStatus(true)
  }

  //   return (
  //     <>
  //       <Topbar usersDataForLogin={usersDataForLogin} session={session} darkMode={darkMode} toggleTheme={toggleTheme} usersData={!loading && usersData} onComplete={handleTopbarCalling} />

  //       {sessionStatus == "authenticated" && usersData?.length === 0 && !loading ?
  //         null
  //         :
  //         (sessionStatus !== "authenticated" ? (
  //           <div
  //             style={{
  //               display: 'flex',
  //               height: '100vh',
  //             }}
  //           >
  //             {/* Left side: Image */}
  //             <div
  //               style={{
  //                 flex: 1,
  //                 position: 'relative',
  //                 height: "80%",
  //                 width: "100%",
  //                 marginLeft: "0.8%"
  //               }}
  //             >
  //               <img
  //                 style={{
  //                   width: '100%',
  //                   height: 'auto',
  //                   maxHeight: '90vh',
  //                 }}
  //                 src="/hope.png"
  //                 alt="img"
  //               />
  //             </div>

  //             {/* Right side: Form */}
  //             {/* <div
  //               style={{
  //                 flex: 1,
  //                 display: 'flex',
  //                 // alignItems: 'center',
  //                 justifyContent: 'flex-end',
  //                 padding: '20px',
  //                 backgroundColor: darkMode ? '#333' : '#fff',
  //               }}
  //             > */}
  //             <div
  //               style={{
  //                 marginTop: "5%",
  //                 marginRight: "2%",
  //                 maxWidth: '400px',
  //                 height: "60%",
  //                 width: '100%',
  //                 padding: '20px',
  //                 backgroundColor: darkMode ? '#333' : '#fff',
  //                 borderRadius: '8px',
  //                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  //               }}
  //             >
  //               <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>

  //               <Button
  //                 type="primary"
  //                 icon={<GoogleOutlined />}
  //                 onClick={handleGoogleSignIn}
  //                 style={{
  //                   width: '100%',
  //                   marginBottom: '20px',
  //                 }}
  //               >
  //                 Sign in with Google
  //               </Button>

  //               <Divider>Or</Divider>

  //               <Form name="login_form" onFinish={onFinish}>
  //                 <Form.Item
  //                   name="username"
  //                   rules={[{ required: true, message: 'Please input your Username!' }]}
  //                 >
  //                   <Input
  //                     prefix={<UserOutlined />}
  //                     placeholder="Username"
  //                     style={{ padding: '10px' }}
  //                   />
  //                 </Form.Item>

  //                 <Form.Item
  //                   name="password"
  //                   rules={[{ required: true, message: 'Please input your Password!' }]}
  //                 >
  //                   <Input.Password
  //                     prefix={<LockOutlined />}
  //                     placeholder="Password"
  //                     style={{ padding: '10px' }}
  //                   />
  //                 </Form.Item>

  //                 <Form.Item>
  //                   <Button
  //                     type="primary"
  //                     htmlType="submit"
  //                     style={{
  //                       width: '100%',
  //                       padding: '10px',
  //                     }}
  //                   >
  //                     Login
  //                   </Button>
  //                 </Form.Item>
  //               </Form>
  //             </div>
  //             {/* </div> */}
  //           </div>
  //         ) :
  //           <p style={{ height: '0px', margin: '0px', padding: '0px' }}></p>
  //         )
  //       }

  //     </>
  //   );
  // };

  // export default LayoutWrapper;
  return (
    <>
      {sessionStatus === "authenticated" && (
        <Topbar
          usersDataForLogin={usersDataForLogin}
          session={session}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          usersData={!loading && usersData}
          onComplete={handleTopbarCalling}
        />
      )}
      {sessionStatus !== "authenticated" && (
        <div
          style={{
            background: "#edfaf3",
            height: "100vh",
            overflow: "hidden",
            position: "relative",
            display: 'flex',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src="/robot.png"
              alt="Robot"
              style={{
                width: '100%',
                height: '100%',
                marginTop: '80px',
                marginLeft: '40px',
                objectFit: 'contain',
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '500px',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: '10px', color: '#1B1F23', fontSize: '18px' }}>Welcome Back</h2>
                <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '10px' }}>
                  Sign in to your Vyaktimetrics dashboard
                </p>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  marginTop: '15px',
                  height: '36px',
                  fontWeight: 500,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <img src="/google-logo.png" alt="Google" style={{ width: '18px', height: '18px' }} />
                Continue with Google
              </Button>

              <Divider style={{ margin: '12px 0', color: '#9CA3AF' }}>or</Divider>

              <Form name="login_form" onFinish={onFinish} layout="vertical" requiredMark={false}>
                <Form.Item
                  label="Email"
                  name="username"
                  style={{ marginBottom: '12px' }}
                  rules={[{ required: true, message: 'Please input your email!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your email"
                    style={{ padding: '8px', fontSize: '14px', borderColor: '#E0E0E0' }}
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  style={{ marginBottom: '10px' }}
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    style={{ padding: '8px', fontSize: '14px', borderColor: '#E0E0E0' }}
                  />
                </Form.Item>

                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                  <a style={{ color: '#4CAF50', fontSize: '12px', cursor: 'text', }}>
                    Forgot password?
                  </a>
                </div>

                <Form.Item style={{ marginBottom: '0' }}>
                  <Button
                    htmlType="submit"
                    onClick={() => setLoginError(true)}
                    style={{
                      width: '100%',
                      backgroundColor: '#4CAF50',
                      borderColor: '#4CAF50',
                      height: '36px',
                      fontWeight: 'bold',
                      //  cursor: 'not-allowed',
                      transition: 'none',
                      // pointerEvents: 'none',
                    }}

                  >
                    Sign In
                  </Button>
                </Form.Item>
                {loginError && (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#ff4d4f",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Login with Google if permitted. Otherwise, contact your admin.
                  </div>
                )}

              </Form>

              <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '18px' }}>
                Don’t have an account?{' '}
                <a style={{ color: '#4CAF50', cursor: 'text' }}>
                  Contact your administrator
                </a>
              </div>
            </div>

            <div
              style={{
                marginTop: '10px',
                textAlign: 'center',
                fontSize: '13px',
                color: '#1B1F23',
              }}
            >
              Secure enterprise-grade authentication
            </div>
          </div>
          <img
            src="/logolight.png"
            alt="Logo"
            style={{
              position: 'absolute',
              top: '-50px',
              left: '10px',
              width: '180px',
              height: 'auto',
            }}
          />
        </div>
      )}
    </>
  );
};
export default LayoutWrapper;

