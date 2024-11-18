"use client"
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Table, Button, Col, Card, Input, Row, Select, Result, Spin, Space, Modal, message, Menu, Switch, Search, Tooltip, Tabs } from 'antd';
import { ReloadOutlined, HighlightOutlined, LeftOutlined, RightOutlined, SearchOutlined, SwapRightOutlined, DownOutlined, EditOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Carousel } from 'react-responsive-carousel';
import { MailOutlined, SettingOutlined } from '@ant-design/icons';
import StickyBox from 'react-sticky-box';

// import { , Select } from 'antd';
import { useTokenContext } from '../components/parent';

const { SubMenu } = Menu;
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Createnewuser from './users-components/create-newuser';
import Newaddaccounts from './users-components/add-newaccount';
import Edituseraccesses from './users-components/edit-usersaccess';
import EditAccountAccess from './users-components/edit-accountaccess';
import EditNetworkAccess from './users-components/edit-network';

import debounce from 'lodash.debounce';

const contentStyle = {
    margin: 0,
    // height: '800px',
    color: '#66fc03',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#fbfcfa',
};
const roles = ['All', 'Media_Buyer', 'Admin', 'Manager', 'Special_User'];
const accountStatus = ['All', 'Active', 'InActive'];
const availableNetworks = ['All', "MEDIA_DOT_NET", "MEDIA_DOT_NET_BING", "ENKI", "TONIC", "System1", "Bodies", "Bodies1", "Rsoc", "Domain Active"];
const networkStatus = ['All', 'Active', 'InActive'];

const UsersTable = () => {
    const { userdetails } = useTokenContext();
    const [isSearchingNetwork, setIsSearchingNetwork] = useState(false); //prudhvi
    const [netSearchInput, setNetSearchInput] = useState(""); //prudhvi
    const [networkAccessDrawerkVisible, setNetworkAccessDrawerVisible] = useState(false); //prudhvi
    const [networkFilteredData, setNetworkFilteredData] = useState([]); //prudhvi
    const [networksData, setNetworksData] = useState([]); //prudhvi
    const [urlBuilderData, setUrlBuilderData] = useState([]);
    const [networkAccessData, setNetworkAccessData] = useState(null);

    const [usersData, setUsersData] = useState([]);
    const [AccountsData, setAccountsData] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [accFilteredData, setaccFilteredData] = useState([]);
    const [paginationSize, setPaginationSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [accountDrawerVisible, setaccountDrawerVisible] = useState(false);
    const [usersaccessDrawerVisible, setusersaccessDrawerVisible] = useState(false);
    const [accountaccessDrawerVisible, setaccountaccessDrawerVisible ] = useState(false);
    const [usersaccessData, setusersaccessData] = useState(null);
    const [accountaccessData, setaccountaccessData] = useState(null);
    const [newSearchInput, setNewSearchInput] = useState("");

    const [role, setRole] = useState('');
    const [status, setStatus] = useState('All');
    const [revenuePartner, setRevenuePartner] = useState('All');
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchingAccount, setIsSearchingAccount] = useState(false);

    const carouselRef = useRef();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeSlide, setActiveSlide] = useState(0);
    const { theme } = useTokenContext();

    const handleDotClick = (index) => {
        if (carouselRef.current) {
            carouselRef.current.goTo(index);
            setCurrentSlide(index);
        }
    };

    const handleSearchClick = () => {
        setIsSearching(true);
    };

    const handleBlur = () => {
        if (searchInput.trim() === '') {
            setIsSearching(false);
        }
    };

    const handleChangeInput = (e) => {
        setInputValue(e.target.value);
        // console.log(e.target.value);
        // const filteredLiveData = rowData.filter((each)=> each.campaignName.includes(e.target.value));

        // const filteredDailyData = dailyData.filter((each)=> each.campaignName.includes(e.target.value));
        // const filteredAllCampaignsData = campaignData.filter((each)=> each.campaignName.includes(e.target.value));
        // setRowData(filteredLiveData);
        // setdailyData(filteredDailyData);
        // setCampaignData(filteredAllCampaignsData);
    };

    const handleSearchClick1 = () => {
        setIsSearchingAccount(true);
    };

    const handleBlur1 = () => {
        if (newSearchInput.trim() === '') {
            setIsSearchingAccount(false);
        }
    };

    const items = [
        { key: '1', label: 'Users', content: 'Content for Live data' },
        { key: '2', label: 'Accounts', content: 'Content for Daily data' },
        { key: '3', label: 'Networks', content: 'Content for Campaign data' },
        { key: '4', label: 'UrlBuilder', content: 'Content for Campaign data' }
    ];

    const handleTabChange = (key) => {
        const index = parseInt(key, 10) - 1; // Convert tab key to slide index
        setActiveSlide(index); // Update the active slide
    };

    const handleCarouselChange = (index) => {
        setActiveSlide(index); // Update the active tab based on the carousel's current slide
    };

    const renderCarouselNav = () => (
        <div style={{marginLeft:'10px'}}>
            <Tabs
                activeKey={(activeSlide + 1).toString()} // Sync the active tab with the slide
                onChange={handleTabChange} // Update the slide on tab change
                items={items.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
            />
        </div>
    );

    // const handleChangeInput1 = (e) => {
    //     setInputValue(e.target.value);
    //     // console.log(e.target.value);
    //     // const filteredLiveData = rowData.filter((each)=> each.campaignName.includes(e.target.value));

    //     // const filteredDailyData = dailyData.filter((each)=> each.campaignName.includes(e.target.value));
    //     // const filteredAllCampaignsData = campaignData.filter((each)=> each.campaignName.includes(e.target.value));
    //     // setRowData(filteredLiveData);
    //     // setdailyData(filteredDailyData);
    //     // setCampaignData(filteredAllCampaignsData);
    // };

    // const [accountsData, setAccountsData] = useState([]);
    //new Added below
    // const [openKeys, setOpenKeys] = useState([]);
    // const [selectedValue, setSelectedValue] = useState(null);
    // const transformData = (data) => {
    //     const items = [];
        
    //     // Example transformation based on the provided structure
    //     // You can adjust this based on your specific data structure
    //     Object.keys(data).forEach((key, index) => {
    //       const children = data[key].map((itemKey, idx) => ({
    //         key: `${index + 2}${idx + 1}`,
    //         label: itemKey,
    //       }));
      
    //       items.push({
    //         key: `${index + 2}`,
    //         icon: index === 0 ? <MailOutlined /> : <SettingOutlined />,
    //         label: key,
    //         children: children.length ? children : undefined,
    //       });
    //     });
      
    //     return items;
    //   };

    // useEffect(() => {
    //     // Set the default selected value to the key of the first item
    //     const initialSelectedKey = items.length > 0 ? items[0].key : null;
    //     setSelectedValue(initialSelectedKey);
    //   }, []);
    
    //   const onOpenChange = (keys) => {
    //     setOpenKeys(keys);
    //   };
    
    //   const handleSelectChange = (value) => {
    //     setSelectedValue(value);
    //   };
    const handleSelectChange = (value) => {
        console.log('Selected value:', value);
    };

    const transformData = (data) => {
        // const newData = data.adAccounts;
        return Object.keys(data).map((key, index) => ({
          key: `${index + 2}`,
          label: key,
          children: data[key].map((itemKey, idx) => ({
            key: `${index + 2}${idx + 1}`,
            label: itemKey,
          })),
        }));
    };
    //newly added above

    var token = localStorage.getItem("token")
    useEffect(() => {
        if (userdetails?.adAccounts) {
            const debouncedFetchData = debounce(fetchusersData, 1200);
            const debouncedFetchData1 = debounce(fetchAccountsData, 2500);
            const debouncedFetchData2 = debounce(fetchNetworksData, 3500);
            const debouncedFetchData4 = debounce(fetchUrlBuilderData, 4500);
    
            const functionaCall = async () => {
                const retryWithDelay = async (fn, retries = 3, delay = 1000) => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            return await fn();
                        } catch (error) {
                            if (i < retries - 1) {
                                console.warn(`Retrying (${i + 1}/${retries})...`);
                                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                            } else {
                                console.error('All retry attempts failed');
                                throw error;
                            }
                        }
                    }
                };
    
                try {
                    await retryWithDelay(debouncedFetchData);
                    await retryWithDelay(debouncedFetchData1);
                    await retryWithDelay(debouncedFetchData2);
                    await retryWithDelay(debouncedFetchData4);
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                }
            };
    
            functionaCall();
        }
    }, [userdetails]);
    
    const handleDelete = async (values) => {
        // console.log(values, "Delete");

        try {
            // Check if values.email exists
            const url = values.email ? `https://prodapis.adsgoat.in/api/deleteUser?email=${values.email}` : '';

            if (url) {
                // Show modal confirmation
                Modal.confirm({
                    title: 'Confirm',
                    content: 'Are you sure you want to remove access?',
                    onOk: async () => {
                        try {
                            const response = await axios.delete(url,
                            {
                                headers: {
                                    'Authorization': token
                                }
                            });
                            // const response = await fetch(url, {
                            //     method: 'DELETE',
                            //     headers: {
                            //         Authorization: token
                            //     }
                            // });

                            if (response.status === 200) {
                                // console.log('User deleted successfully');
                                message.success(`${values.userName} User access removed successfully`);
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1500);
                                // Handle success, such as updating UI or showing a success message
                            } else {
                                console.error('Failed to delete user');
                                // Handle error, such as showing an error message
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            // Handle error, such as showing an error message
                        }
                    },
                    onCancel: () => {
                        console.log('Cancel');
                    },
                });
            } else {
                console.error('Email address is missing');
                // Handle error, such as showing an error message
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error, such as showing an error message
        }
    };
    const handleStatusChange = async(accountNumber, checked) => {
        // console.log(checked, "checked");
        const newData = AccountsData.map((item) => {
            if (item.accountNumber === accountNumber) {
                // console.log(`Account Number: ${item.accountNumber}`);
                return {
                    ...item,
                    status: checked ? 'Active' : 'InActive',
                };
            }
            return item;
        });
        // console.log(newData, "newData");
        const newStatus = checked ? 'Active' : 'InActive';
        // console.log(newStatus, "newStatus");
        // console.log(token, "token");
        const response = await axios.get(`https://prodapis.adsgoat.in/updateAccount/?accountNumber=${accountNumber}&status=${newStatus}`, {
                headers: {
                    Authorization: token
                }
        });
        // console.log(response.data);
        setAccountsData(newData);
    };

    const fetchusersData = async () => {
        try {
            const response = await axios.get('https://prodapis.adsgoat.in/get/usersdata/', {
                headers: {
                    Authorization: token
                }
            });
            if (response.status === 200) {
                setUsersData(response.data);
                // console.log(response.data, "users")
            } else {
                console.error('Failed to fetch users data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountsData = async () => {
        try {
            const response = await axios.get('https://prodapis.adsgoat.in/api/getAccountsData/', {
                headers: {
                    Authorization: token
                }
            });
            // const response = await axios.get('https://www.testapi.adsgoat.in/api/getAccountsData', {
            //     headers: {
            //         Authorization: token
            //     }
            // });
            if (response.status === 200) {
                setAccountsData(response.data);
                // console.log(response.data, "accounts data")
            } else {
                console.error('Failed to fetch users data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    //Networks Details
    const handleSearchNetwork = () => {
        setIsSearchingNetwork(true);
    };

    const handleBlur2 = () => {
        setIsSearchingNetwork(false);
    };

    const handleNetworkStatusChange = async(revenuePartner, checked) => {
        // console.log(checked, "checked");
        const newData = networksData.map((item) => {
            if (item.revenuePartner === revenuePartner) {
                // console.log(`Account Number: ${item.accountNumber}`);
                return {
                    ...item,
                    Status: checked ? 'Active' : 'InActive',
                };
            }
            return item;
        });
        // console.log(newData, "newData");
        const newStatus = checked ? 'Active' : 'InActive';
        // console.log(newStatus, "newStatus");
        // console.log(token, "token");
        const response = await axios.get(`https://prodapis.adsgoat.in/updateNetwork/?revenuePartner=${revenuePartner}&Status=${newStatus}`, {
                headers: {
                    Authorization: token
                }
        });
        console.log(response.data);
        setNetworksData(newData);
    };

    const fetchNetworksData = async () => {
        try{
            const response = await axios.get('https://prodapis.adsgoat.in/get/networksData/', {
                headers: {
                    Authorization: token
                }
            });
            console.log("Response:", response.data);
            if (response.status === 200) {
                setNetworksData(response.data);
                console.log(response.data, "Networks Data");
            } else {
                console.error('Failed to fetch Networks data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const fetchUrlBuilderData = async () => {
        try{
            const response = await axios.get('https://prodapis.adsgoat.in/get/allurlbuilderdata/', {
                headers: {
                    Authorization: token
                }
            });
            console.log("Response:", response.data);
            if (response.status === 200) {
                setUrlBuilderData(response.data);
                console.log(response.data, "Networks Data");
            } else {
                console.error('Failed to fetch Networks data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }


    const networkFilterData = () => {
        console.log(status, 'status');
        console.log(revenuePartner, 'revenuePartner');
        return networksData?.filter(item => 
            // Check if the status matches the selected status
            (status === 'All' || item.status === status) &&
            // Check if the revenuePartner matches or is 'All'
            (revenuePartner === 'All' || item.revenuePartner === revenuePartner)
        );
    };

    const filteredNetworkData = networkFilterData();

    const [passwordVisibility, setPasswordVisibility] = useState(
        Array(filteredNetworkData.length).fill(false)
    );

    const toggleVisibility = (index) => {
        setPasswordVisibility((prevState) => {
            const newVisibility = [...prevState];
            newVisibility[index] = !newVisibility[index]; 
            return newVisibility;
        });
    };

    const networksColumn = [
        {
            title: 'CronStaus',
            dataIndex: 'cronStatus',
            key: 'cronStatus',
            render: (text) => (text ? text : '---'),
        },
        {
            title: 'Message',
            dataIndex: 'Message',
            key: 'Message',
            render: (text) => (text ? text: '---')
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            render: (text, record) => (
                <Row
                    gutter={[8, 8]}
                    align="middle"
                    wrap
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        width: '100%',
                        justifyContent:'center'
                    }}
                >
                    <Col flex="1 1 auto">
                        <span>{text}</span>
                    </Col>
                    <Col flex="1 1 auto">
                        <Switch
                            checked={record.Status === 'Active'}
                            onChange={(checked) => handleNetworkStatusChange(record.revenuePartner, checked)}
                        />
                    </Col>
                    <Col flex="1 1 auto">
                        <EditOutlined style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => handleEditNetwork(record)} />
                    </Col>
                </Row>
            ),
        },
        {
            title: 'RevenuePartner',
            dataIndex: 'revenuePartner',
            key: 'revenuePartner',
            render: (text) => (text ? text: '---')
        },
        {
            title: 'TimeZone',
            dataIndex: 'timeZone',
            key: 'timeZone',
            render: (text) => (text ? text: '---')
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
            render: (text) => (text ? text: '---')
        },
        {
            title: 'Password',
            dataIndex: 'Password',
            key: 'Password',
            render: (text, record, index) => {
                if (!text) {
                    return '---'; 
                }

                const isVisible = passwordVisibility[index]; 

                return (
                    <Row gutter={[8, 8]} align="middle" wrap>
                        <Col flex="1 1 auto">
                            <span>{isVisible ? text : '*****'.repeat(Math.ceil(text.length / 5))}</span>
                        </Col>
                        <Col flex="1 1 auto">
                            <Tooltip title={isVisible ? 'Hide Password' : 'Show Password'}>
                                {isVisible ? (
                                    <EyeInvisibleOutlined
                                        onClick={() => toggleVisibility(index)} 
                                        style={{ fontSize: '20px', cursor: 'pointer' }}
                                    />
                                ) : (
                                    <EyeOutlined
                                        onClick={() => toggleVisibility(index)} 
                                        style={{ fontSize: '20px', cursor: 'pointer' }}
                                    />
                                )}
                            </Tooltip>
                        </Col>
                    </Row>
                );
            },
        },               
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'displayKey',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            }
        },
        {
            title: 'Consumer_Key',
            dataIndex: 'consumer_key',
            key: 'consumer_key',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            width: 130
        },
        {
            title: 'Consumer_Secret',
            dataIndex: 'consumer_secret',
            key: 'consumer_secret',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            width: 150
        },
        {
            title: 'Client_ID',
            dataIndex: 'client_id',
            key: 'client_id',
            render: (text) => (text ? text: '---')
        },
        {
            title: 'Secret',
            dataIndex: 'Secret',
            key: 'Secret',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            }
        },
        {
            title: 'Service',
            dataIndex: 'Service',
            key: 'Service',
            render: (text) => (text ? text: '---'),
            width: 80
        },
        {
            title: 'Market',
            dataIndex: 'Market',
            key: 'Market',
            render: (text) => (text ? text: '---'),
            width: 80
        },
        {
            title: 'Config_ID',
            dataIndex: 'config_id',
            key: 'config_id',
            render: (text) => (text ? text: '---'),
            width: 100
        },
        {
            title: 'Token',
            dataIndex: 'Token',
            Key: 'Token',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            }
        },
    ];


    const Accountscolumn = [
        {
            title: 'Spend Account ID',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            width: 160,
        },
        {
            title: 'Time Zone',
            dataIndex: 'timeZone',
            key: 'timeZone',
        },
        {
            title: 'Spend Partner',
            dataIndex: 'spendPartner',
            key: 'spendPartner',
            width: 120,
        },
        {
            title: 'Revenue Partner',
            dataIndex: 'revenuePartner',
            key: 'revenuePartner',
        },
        {
            title: 'Media Buyer Name',
            dataIndex: 'MediaBuyerName',
            key: 'MediaBuyerName',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <Row
                    gutter={[8, 8]}
                    align="middle"
                    wrap
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        width: '100%',
                        justifyContent:'center'
                    }}
                >
                    <Col flex="1 1 auto">
                        <span>{text}</span>
                    </Col>
                    <Col flex="1 1 auto">
                        <Switch
                            checked={record.status === 'Active'}
                            onChange={(checked) => handleStatusChange(record.accountNumber, checked)}
                        />
                    </Col>
                    <Col flex="1 1 auto">
                        <EditOutlined style={{ fontSize: '20px' }} onClick={()=> handleEditAccount(record)} />
                    </Col>
                </Row>
            ),
        },

        // {
        //     title: 'Token',
        //     dataIndex: 'token',
        //     key: 'token',
        // },



        {
            title: 'Revenue Account ID',
            dataIndex: 'revenueAccountId',
            key: 'revenueAccountId',
        },
        // {
        //     title: 'BM ID',
        //     dataIndex: 'BMId',
        //     key: 'BMId',
        // },
        {
            title: 'BM Name',
            dataIndex: 'BMName',
            key: 'BMName',
        },
        {
            title: 'Holder',
            dataIndex: 'Holder',
            key: 'Holder',
        },

        // {
        //     title: 'Agency ID',
        //     dataIndex: 'agencyId',
        //     key: 'agencyId',
        // },
        // {
        //     title: 'Agency Name',
        //     dataIndex: 'agencyName',
        //     key: 'agencyName',
        // },
    ];


    const columns = [
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Ad Accounts',
            dataIndex: 'adAccounts',
            key: 'adAccounts',
            render: adAccounts => {
                // console.log(adAccounts, "adding the accounts");
                const menuItems = transformData(adAccounts);
                if(menuItems.length >0){
                    return((
                        <Select
                            defaultValue={'Network wise accounts'}
                            style={{ width: '200px',
                            }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            onChange={handleSelectChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            dropdownRender={(menu) => (
                                <Menu
                                onClick={() => {}}
                                style={{ width: 256 }}
                                mode="inline"
                                defaultSelectedKeys={['2']}
                                >
                                {menuItems.map(item => (
                                    <SubMenu key={item.key} title={<span style={{width:'150px', display:'flex', justifyContent: 'space-between'}}>{item.label} <DownOutlined size={10}/></span>} className="custom-submenu">
                                    {item.children && item.children.map(child => (
                                        <Menu.Item key={child.key}>
                                        {child.label}
                                        </Menu.Item>
                                    ))}
                                    </SubMenu>
                                ))}
                                </Menu>
                            )}
                            >
                            {menuItems.map(item => (
                                <Select.Option key={item.key} value={item.key}>
                                {item.label}
                                </Select.Option>
                            ))}
                        </Select>
    
                    ))
                }else{
                    return(
                        <Select style={{ width: '200px'
                         }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        defaultValue={'No accounts available'} 
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Select.Option key="empty" value="">
                                No accounts available
                            </Select.Option>
                        </Select>
                    );
                }
                
            },

        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="dashed" onClick={() => handleDelete(record)}>Remove Access</Button>
                </Space>
            ),
        },
    ];

    const urlbuilder = [
        {
            title: 'Network',
            dataIndex: 'Network',
            key: 'Network',
        },
        {
            title: 'Domains',
            dataIndex: 'Domains',
            key: 'Domains',
            render: Domains => {
                const newDomains = Domains;
                if (Domains && Domains.length > 0) {
                    return (
                        <Select
                            defaultValue={'Domains'}
                            style={{ width: '200px' }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            onChange={handleSelectChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            dropdownRender={(menu) => (
                                <Menu
                                    onClick={() => {}}
                                    style={{ width: 256, maxHeight: 300, overflowY: 'auto' }}
                                    mode="inline"
                                    // defaultSelectedKeys={['2']}
                                >
                                    {newDomains.map(item => (
                                        <SubMenu
                                            key={item.key}
                                            title={
                                                <span style={{ width: '150px', display: 'flex', justifyContent: 'space-between' }}>
                                                    {item.name} <DownOutlined size={10} />
                                                </span>
                                            }
                                            className="custom-submenu"
                                        >
                                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginLeft:'25px' }}>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>Name:</strong> {item.name}</p>
                                                <p><strong>Code:</strong> {item.code}</p>
                                                <p><strong>Account:</strong> {item.account}</p>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '8px', paddingTop:'10px' }}><strong>URL:</strong></div>
                                                    <div style={{
                                                        marginRight:'25px',
                                                        display: 'block',
                                                        maxWidth: '200px',       // Limit max width
                                                        whiteSpace: 'normal',    // Allows text to wrap to new lines
                                                        wordBreak: 'break-word', // Forces breaks within long words
                                                        overflowWrap: 'break-word', // Ensures breaking at any possible point
                                                        lineHeight: '1.5', // Space out lines for readability
                                                        color: '#000', // Adjust text color if needed
                                                    }}>
                                                        {item.url}
                                                    </div>
                                                </div>
                                            </div>
                                        </SubMenu>
                                    ))}
                                </Menu>
                            )}
                        >
                            {/* Placeholder for Select options if needed */}
                        </Select>
                    );
                } else {
                    return (
                        <Select
                            style={{ width: '200px' }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            defaultValue={'No Data'}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                        >
                            <Select.Option key="empty" value="">
                            No Data
                            </Select.Option>
                        </Select>
                    );
                }
            }
        },
        {
            title: 'Source',
            dataIndex: 'Source',
            key: 'Source',
            render: Source => {
                // console.log(adAccounts, "adding the accounts");
                // const menuItems = transformData(adAccounts);
                const newSource = Source;
                if(Source && Source.length >0){
                    return((
                        <Select
                            defaultValue={'Source'}
                            style={{ width: '200px',
                            }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            onChange={handleSelectChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            dropdownRender={(menu) => (
                                <Menu
                                onClick={() => {}}
                                style={{ width: 256, maxHeight: 300, overflowY: 'auto'  }}
                                mode="inline"
                                // defaultSelectedKeys={['2']}
                                >
                                {newSource.map(item => (
                                    <SubMenu
                                        key={item.key}
                                        title={
                                            <span style={{ width: '150px', display: 'flex', justifyContent: 'space-between' }}>
                                                {item.name} <DownOutlined size={10} />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginLeft:'25px' }}>
                                            <p><strong>ID:</strong> {item.id}</p>
                                            <p><strong>Name:</strong> {item.name}</p>
                                            <p><strong>Code:</strong> {item.code}</p>
                                            <p><strong>CampaignID:</strong> {item.campaignId}</p>
                                            <p><strong>CampaignID:</strong> {item.AdsetId}</p>
                                        </div>
                                    </SubMenu>
                                ))}
                                </Menu>
                            )}
                            >
                            {/* {menuItems.map(item => (
                                <Select.Option key={item.key} value={item.key}>
                                {item.label}
                                </Select.Option>
                            ))} */}
                        </Select>
    
                    ))
                }else{
                    return(
                        <Select style={{ width: '200px'
                         }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        defaultValue={'No Data'} 
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Select.Option key="empty" value="">
                            No Data
                            </Select.Option>
                        </Select>
                    );
                }
           }
        },
        {
            title: 'channels',
            dataIndex: 'channels',
            key: 'channels',
            render: channels => {
                // console.log(adAccounts, "adding the accounts");
                // const menuItems = transformData(adAccounts);
                const newChannels = channels;
                if(channels && channels.length >0){
                    return((
                        <Select
                            defaultValue={'channels'}
                            style={{ width: '200px',
                            }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            onChange={handleSelectChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            dropdownRender={(menu) => (
                                <Menu
                                onClick={() => {}}
                                style={{ width: 256, maxHeight: 300, overflowY: 'auto'  }}
                                mode="inline"
                                // defaultSelectedKeys={['2']}
                                >
                                {newChannels.map(item => (
                                    <SubMenu
                                        key={item.key}
                                        title={
                                            <span style={{ width: '150px', display: 'flex', justifyContent: 'space-between' }}>
                                                {item.name} <DownOutlined size={10} />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginLeft:'25px' }}>
                                            <p><strong>ID:</strong> {item.id}</p>
                                            <p><strong>Name:</strong> {item.name}</p>
                                            <p><strong>Source:</strong> {item.source}</p>
                                            <p><strong>Value:</strong> {item.value}</p>
                                        </div>
                                    </SubMenu>
                                ))}
                                </Menu>
                            )}
                            >
                            {/* {menuItems.map(item => (
                                <Select.Option key={item.key} value={item.key}>
                                {item.label}
                                </Select.Option>
                            ))} */}
                        </Select>
    
                    ))
                }else{
                    return(
                        <Select style={{ width: '200px'
                         }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        defaultValue={'No Data'} 
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Select.Option key="empty" value="">
                            No Data
                            </Select.Option>
                        </Select>
                    );
                }
            }
        },
        {
            title: 'BusinessData',
            dataIndex: 'businessData',
            key: 'businessData',
            render: businessData => {
                const newBusinessData = businessData;
                // console.log(adAccounts, "adding the accounts");
                // const menuItems = transformData(adAccounts);
                if(businessData && businessData.length >0){
                    return((
                        <Select
                            defaultValue={'BusinessData'}
                            style={{ width: '200px' }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            onChange={handleSelectChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            dropdownRender={(menu) => (
                                <Menu
                                    onClick={() => {}}
                                    style={{ width: 256, maxHeight: 300, overflowY: 'auto' }}
                                    mode="inline"
                                >
                                    {newBusinessData.map(item => (
                                        <SubMenu
                                            key={item.key}
                                            title={
                                                <span style={{ width: '150px', display: 'flex', justifyContent: 'space-between' }}>
                                                    {item.name} <DownOutlined size={10} />
                                                </span>
                                            }
                                            className="custom-submenu"
                                        >
                                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '25px' }}>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>Name:</strong> {item.name}</p>
                                                <p><strong>Code:</strong> {item.code}</p>
                                                <p><strong>Account:</strong> {item.account}</p>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '8px', paddingTop:'10px' }}><strong>URL:</strong></div>
                                                    <div style={{
                                                        marginRight:'25px',
                                                        display: 'block',
                                                        maxWidth: '200px',       // Limit max width
                                                        whiteSpace: 'normal',    // Allows text to wrap to new lines
                                                        wordBreak: 'break-word', // Forces breaks within long words
                                                        overflowWrap: 'break-word', // Ensures breaking at any possible point
                                                        lineHeight: '1.5', // Space out lines for readability
                                                        color: '#000', // Adjust text color if needed
                                                    }}>
                                                        {item.url}
                                                    </div>
                                                </div>
                                            </div>
                                        </SubMenu>
                                    ))}
                                </Menu>
                            )}
                        >
                        </Select>
    
                    ))
                }else{
                    return(
                        <Select style={{ width: '200px'
                         }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        defaultValue={'No Data'} 
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Select.Option key="empty" value="">
                                No Data
                            </Select.Option>
                        </Select>
                    );
                }
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (text, record) => (
                <Space size="middle">
                    <Button type="primary">Edit</Button>
                    {/* <Button type="dashed" onClick={() => handleDelete(record)}>Remove Access</Button> */}
                </Space>
            ),
        },
    ];

    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchInput(searchValue);
        const filtered = usersData.filter((item) =>
            Object.values(item).some((field) =>
                typeof field === 'string' && field.toLowerCase().includes(searchValue)
            )
        );
        setFilteredData(filtered);
    };

    const handleaccountSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setNewSearchInput(searchValue);
        const accfiltered = AccountsData.filter((item) =>
            Object.values(item).some((field) =>
                typeof field === 'string' && field.toLowerCase().includes(searchValue)
            )
        );
        setaccFilteredData(accfiltered);
    };

    const handleNetworkSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setNetSearchInput(searchValue);
        
        // Filtering only fields that are strings
        const networkFiltered = networksData.filter((item) =>
            Object.values(item).some((field) =>
                typeof field === 'string' && field.toLowerCase().includes(searchValue)
            )
        );
        setNetworkFilteredData(networkFiltered);
    };

    const showNetworkDrawer = () => {
        setNetworkDrawerVisible(true)
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setPaginationSize(5);
            } else if (window.innerWidth < 2560) {
                setPaginationSize(15);
            } else {
                setPaginationSize(25);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const shownewuserdrawar = () => {
        setDrawerVisible(true)
    }
    const shownnewaccountdrawar = () => {
        setaccountDrawerVisible(true)
    }
    const handleEdit = (values) => {
        setusersaccessDrawerVisible(true)
        setusersaccessData(values)
        // console.log(values, "Edit")
    }

    const handleEditAccount = (values) => {
        setaccountaccessDrawerVisible(true)
        setaccountaccessData(values)
        // console.log(values, "Edit")
    }

    const handleEditNetwork = (values) => {
        setNetworkAccessDrawerVisible(true)
        setNetworkAccessData(values)
    }

    // const onCloseDrawer = () => {
    //     setDrawerVisible(false);
    //     setaccountDrawerVisible(false)
    //     setusersaccessDrawerVisible(false)
    //     setaccountaccessDrawerVisible(false)
    //     setNetworkAccessDrawerVisible(false);
    // };

    const onChangeRole = (value) => {
        // if(value === 'All'){
        //     setRole('');
        // }
        setRole(value);
    }

    const onChangeNetwork = (value) =>{
        setRevenuePartner(value);
    }

    const onChangeStatus = (value) => {
        setStatus(value);
    }

    const filteredRoleData = role !== 'All' ? usersData?.filter((each)=> each.role.includes(role)) : usersData;
    // console.log(filteredRoleData, "filteredData");
    // console.log(usersData, "usersData");
    const filterData = () => {
        // console.log(status, 'status');
        // console.log(revenuePartner, 'revenuePartner');
        return AccountsData?.filter(item => 
            // Check if the status matches the selected status
            (status === 'All' || item.status === status) &&
            // Check if the revenuePartner matches or is 'All'
            (revenuePartner === 'All' || item.revenuePartner === revenuePartner)
        );
    };
    
    const filteredAccountData = filterData();

    // const rowStyle = {
    //     backgroundColor: '#e3f2fd', // Light blue background color
    // };
    
    // const rowHoverStyle = {
    //     backgroundColor: '#bbdefb', // Slightly darker blue for hover effect
    // };
    // console.log(filteredAccountData, "filteredAccountData");

    const refreshUsers = async () => {
        try {
            setLoading(true);
            const response = await fetchusersData();  
            setUsersData(response.data);  
        } catch (error) {
            console.error("Error refreshing account data:", error);
            
        } finally {
          
            setLoading(false);
        }
    };

    const refreshAccounts = async () => {
        try { 
            setLoading(true);
            const response = await fetchAccountsData(); 
            setAccountsData(response.data);  
        } catch (error) {
            console.error("Error refreshing account data:", error);
            
        } finally {
          
            setLoading(false);
        }
    };
    
    const refreshNetworks = async () => {
        try {
            setLoading(true);
            const response = await fetchNetworksData();  
            setNetworksData(response.data); 
        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUrlBuilder = async () => {
        try {
            setLoading(true);
            const response = await fetchUrlBuilderData();  
            setUrlBuilderData(response.data); 
        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setLoading(false);
        }
    };




    const onCloseDrawer = (updatedData) => {
        if (updatedData) {
          if (updatedData.email) {
            // Handle user data update
            setUsersData((prevData) =>
              prevData.map((user) =>
                user.email === updatedData.email ? updatedData : user
              )
            );
          } else if (updatedData.accountNumber) {
            // Handle account data update
            setAccountsData((prevData) =>
              prevData.map((account) =>
                account.accountNumber === updatedData.accountNumber ? updatedData : account
              )
            );
          } else if (updatedData.revenuePartner) {
            // Handle network data update
            setNetworksData((prevData) =>
              prevData.map((network) =>
                network.revenuePartner === updatedData.revenuePartner ? updatedData : network
              )
            );
          }
        }
      
        // Close all relevant drawers
        setDrawerVisible(false);
        setaccountDrawerVisible(false);
        setusersaccessDrawerVisible(false);
        setaccountaccessDrawerVisible(false);
        setNetworkAccessDrawerVisible(false);
    };


    

    return (
        <>
            <Createnewuser visible={drawerVisible} onClose={onCloseDrawer} />
            <Newaddaccounts visible={accountDrawerVisible} onClose={onCloseDrawer} />
            <Edituseraccesses editeddata={usersaccessData} visible={usersaccessDrawerVisible} onClose={onCloseDrawer} />
            <EditAccountAccess editeddata={accountaccessData} visible={accountaccessDrawerVisible} onClose={onCloseDrawer} />
            <EditNetworkAccess editeddata={networkAccessData} visible={networkAccessDrawerkVisible} onClose={onCloseDrawer} />

            <div style={{padding:'0px', margin:'0px'}}>
                    {renderCarouselNav()}
            </div>
            <Carousel
                // className="custom-carousel"
                showThumbs={false}
                showIndicators={false}
                showStatus={false}
                selectedItem={activeSlide} // Control the active slide
                onChange={handleCarouselChange} // Sync the tab when the slide changes
                // showThumbs={false}
                // showIndicators={false}
                // showStatus={false}
            >   
                
                <div style={{width:'100%'}}>
                    <Card title="Users Access" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            {/* {isSearching ? ( */}
                                                <>
                                                    <Button  style={{color: theme === "dark" ? "#333": "#fff"}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} />
                                                    <Input
                                                        placeholder="Search here"
                                                        autoFocus
                                                        value={searchInput}
                                                        onChange={handleSearchChange}
                                                        onBlur={handleBlur}
                                                        style={{
                                                            width: '100%',
                                                            borderRadius: '5px',
                                                            marginLeft: '8px',
                                                            backgroundColor: theme === 'dark' ? '#333' : '#ffffff',  // Dark theme: dark background, Light theme: white background
                                                            color: theme === 'dark' ? '#ffffff' : '#333',            // Dark theme: white text, Light theme: dark text
                                                            borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'       // Optional: adjust border color as well
                                                        }}
                                                    />
                                                </>
                                            {/* ) : (
                                                <Button
                                                    icon={<SearchOutlined />}
                                                    onClick={handleSearchClick}
                                                />
                                            )} */}
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Role</span>
                                        <Select
                                            onChange={onChangeRole}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={roles.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Category</span>
                                        <Select
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={[
                                                { value: "jack", label: "Jack" },
                                                { value: "All", label: "All" },
                                                { value: "Yiminghe", label: "Yiminghe" },
                                                { value: "disabled", label: "Disabled", disabled: true },
                                            ]}
                                        />
                                    </Col>
                                    
                                </Row>
                            </Col>
                            <Col xs={24} md={8}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined />} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }} 
                                    onClick={refreshUsers}  // Call refresh function when clicked
                                >
                                </Button>
                                <Button type="primary" style={{ float: "right" }} onClick={shownewuserdrawar}>
                                    Create User
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading ? (
                        <Spin />
                    ) : usersData.length > 0 ? (
                        <Table
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dataSource={searchInput ? filteredData.map((item, index) => ({ ...item, key: index })) : filteredRoleData.map((item, index) => ({ ...item, key: index }))}
                            columns={columns}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)' }}
                            // style={{backgroundColor:'skyblue'}}
                            
                        />
                    ) : (
                        <Result
                            status="404"
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            title="No Users Data Available"
                            extra={<Button type="primary" onClick={shownewuserdrawar}>
                                Create User
                            </Button>}
                        />
                    )}
                </div>
                <div>
                    <Card title="All accounts" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <Button  style={{color: theme === "dark" ? "#333": "#fff"}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingAccount}  // Only autofocus when searching
                                                value={newSearchInput}
                                                onChange={handleaccountSearchChange}
                                                onBlur={handleBlur1}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '5px',
                                                    marginLeft: '8px',
                                                    backgroundColor: theme === 'dark' ? '#333' : '#ffffff',  // Dark theme: dark background, Light theme: white background
                                                    color: theme === 'dark' ? '#ffffff' : '#333',            // Dark theme: white text, Light theme: dark text
                                                    borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'       // Optional: adjust border color as well
                                                }} // Adjust input width and margin dynamically
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            onChange={onChangeNetwork}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={availableNetworks.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Status</span>
                                        <Select
                                            onChange={onChangeStatus}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={accountStatus.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    
                                </Row>
                            </Col>
                            <Col xs={24} md={8}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined />} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }} 
                                    onClick={refreshAccounts}  // Call refresh function when clicked
                                >
                                </Button>
                                <Button type="primary" style={{ float: "right", marginLeft: "5%" }} onClick={shownnewaccountdrawar}>
                                    Add New Account
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading ? (
                        <Spin />
                    ) : AccountsData.length > 0 ? (
                        <Table
                            // bordered
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dataSource={newSearchInput ? accFilteredData.map((item, index) => ({ ...item, key: index })) : filteredAccountData.map((item, index) => ({ ...item, key: index }))}
                            columns={Accountscolumn}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)' }}
                        />
                    ) : (
                        <Result
                            status="404"
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            title="No Accounts Data Available"
                            subTitle="Sorry, this page contains no data."
                            extra={<Button type="primary" onClick={shownnewaccountdrawar}>
                                Add New Account
                            </Button>}
                        />
                    )}
                </div>
                <div>
                    <Card title="All Networks" size="small">
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <Button  style={{color: theme === "dark" ? "#333": "#fff"}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchNetwork} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingNetwork}  // Only autofocus when searching
                                                value={netSearchInput}
                                                onChange={handleNetworkSearchChange}
                                                onBlur={handleBlur2}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '5px',
                                                    marginLeft: '8px',
                                                    backgroundColor: theme === 'dark' ? '#333' : '#ffffff',  // Dark theme: dark background, Light theme: white background
                                                    color: theme === 'dark' ? '#ffffff' : '#333',            // Dark theme: white text, Light theme: dark text
                                                    borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'       // Optional: adjust border color as well
                                                }} // Adjust input width and margin dynamically
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            onChange={onChangeNetwork}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            options={availableNetworks.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Status</span>
                                        <Select
                                            onChange={onChangeStatus}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            options={networkStatus.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    
                                </Row>
                            </Col>
                            <Col xs={24} md={8}>
                                {/* <Button type="primary" style={{ float: "right", marginLeft: "5%" }} onClick={showNetworkDrawer}>
                                    Add New Network
                                </Button> */}
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined />} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }} 
                                    onClick={refreshNetworks}
                                >
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading ? (
                        <Spin />
                    ) : networksData.length > 0 ? ( 
                        <Table
                            // bordered
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dataSource={netSearchInput ? networkFilteredData.map((item, index) => ({ ...item, key: item.key, id: index })) : filteredNetworkData.map((item, index) => ({ ...item, key: item.key, id: index }))}
                            columns={networksColumn}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)', x: 'max-content' }}
                            // style={{ tableLayout: 'auto' }} 
                            // scroll={{ x: 'max-content' }} 
                        />
                    ) : (
                        <Result
                            status="404"
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            title="No Networks Data Available"
                            subTitle="Sorry, this page contains no data."
                            extra={<Button type="primary" onClick={showNetworkDrawer}>
                                Add New Network
                            </Button>}
                        />
                    )}
                </div>
                <div>
                    <Card title="URL Builder" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <Button  style={{color: theme === "dark" ? "#333": "#fff"}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingAccount}  // Only autofocus when searching
                                                value={newSearchInput}
                                                // onChange={handleaccountSearchChange}
                                                // onBlur={handleBlur1}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '5px',
                                                    marginLeft: '8px',
                                                    backgroundColor: theme === 'dark' ? '#333' : '#ffffff',  // Dark theme: dark background, Light theme: white background
                                                    color: theme === 'dark' ? '#ffffff' : '#333',            // Dark theme: white text, Light theme: dark text
                                                    borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'       // Optional: adjust border color as well
                                                }} // Adjust input width and margin dynamically
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            // onChange={onChangeNetwork}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={availableNetworks.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col>
                                    {/* <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Status</span>
                                        <Select
                                            // onChange={onChangeStatus}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px'
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={accountStatus.map((item) => ({
                                                value: item,
                                                label: item,
                                            }))}
                                        />
                                    </Col> */}
                                    
                                </Row>
                            </Col>
                            <Col xs={24} md={8}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined />} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }} 
                                    onClick={refreshUrlBuilder}  // Call refresh function when clicked
                                >
                                </Button>
                                <Button type="primary" style={{ float: "right", marginLeft: "5%" }}>
                                    Add New URL Builder
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading ? (
                        <Spin />
                    ) : urlBuilderData.length > 0 ? (
                        <Table
                            // bordered
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dataSource={urlBuilderData}
                            // dataSource={newSearchInput ? accFilteredData.map((item, index) => ({ ...item, key: index })) : filteredAccountData.map((item, index) => ({ ...item, key: index }))}
                            columns={urlbuilder}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)' }}
                        />
                    ) : (
                        <Result
                            status="404"
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            title="No Accounts Data Available"
                            subTitle="Sorry, this page contains no data."
                            extra={<Button type="primary" onClick={shownnewaccountdrawar}>
                                Add New Account
                            </Button>}
                        />
                    )}
                </div>
            </Carousel>
        </>
    );

};

export default UsersTable;

