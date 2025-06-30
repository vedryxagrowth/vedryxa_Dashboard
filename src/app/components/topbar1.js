import { useState, useEffect, useRef } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin, Form, Input, Divider, Modal, Badge, Card } from "antd";
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


const TopBar1 = () => {
    const { darkMode, toggleTheme } = useTokenContext();
    const router = useRouter();
    const { data: session, status } = useSession(); // Session status from next-auth
    const { userdetails } = useTokenContext(); // User details from your context
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
  
    const showModal = () => {
      setOpen(true);
    };
  
    const handleOk = () => {
      // Create a new notification object
      const newNotification = {
        key: (notifications.length + 1).toString(),
        title: title || 'No Title Provided',
        description: description || 'No Description Provided',
      };
  
      // Add new notification to the existing list
      setNotifications([...notifications, newNotification]);
  
      setConfirmLoading(true);
  
      // Simulate a delay (e.g., saving data)
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
        setTitle(''); // Clear input fields after submission
        setDescription('');
      }, 2000);
    };
  
    const handleCancel = () => {
      setOpen(false);
    };
    // console.log('Session Status:', status);
    const [notifications, setNotifications] = useState([
      {
        key: '1',
        title: 'New Message',
        description: 'You have received a new message from John Doe.',
      },
      {
        key: '2',
        title: 'Order Shipped',
        description: 'Your order #12345 has been shipped and is on its way.',
      },
    ]);
    
   
    const [showNotifications, setShowNotifications] = useState(false);
    const wrapperRef = useRef(null);
  
    useEffect(() => {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setShowNotifications(false);
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [wrapperRef]);
    const removeNotification = (key) => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.key !== key)
      );
    };
    const toggleNotifications = () => {
      setShowNotifications(!showNotifications);
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
              const { storedData, activeTab, showGraph } = localStorage; localStorage.clear(); Object.assign(localStorage, { storedData, activeTab, showGraph });
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
      <div style={{height:'100vh'}}>
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
            { isUserAuthorized ? (
                <>
            <div className="relative inline-block" ref={wrapperRef}>
            <div className="cursor-pointer" onClick={toggleNotifications}>
            <Bell size={24} />
            <Bell size={24} />
            <Badge className="Badge absolute -top-2 -right-2" variant="destructive">
                {notifications.length}
            </Badge>
            </div>
            
            {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="notifiview py-1">
            {userdetails ?.role ==="Admin" && 
            <Edit3Icon  onClick={showModal}
                        style={{
                        marginLeft: '8px',
                        color: '#333',
                        fontSize: '18px',
                        }}
                        
                    />
                }
                
                {notifications.map((notification) => (
                    <div key={notification.key} className="px-4 py-2 hover:bg-gray-100">
                    <div className='View' style={{display:"flex", justifyContent:'space-between'}}>
                    <h3 className="text-sm font-semibold">{notification.title} </h3>
                    <EyeOutlined
                        style={{
                        marginLeft: '8px',
                        color: '#333',
                        fontSize: '18px',
                        }}
                        onClick={() => removeNotification(notification.key)}
                    />
                    </div>
                    <p className="text-xs text-gray-600" style={{margin:"0px"}}>{notification.description}</p>
                    </div>
                ))}
                </div>
            </div>
            )}
            
        
            <Modal
            title="Title"
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
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
          <div style={{ position: 'absolute', top: 10, right: 4, zIndex: 2, border: "2px dotted green", padding: "1%" }}>
            <h3>You are not Authorized {session.user.email}`</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    );
  };

export default TopBar1;