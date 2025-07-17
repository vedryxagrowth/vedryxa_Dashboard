"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Col, Card, Input, Row, Select, Result, Spin, Space, Modal, message, Menu, Switch, Tooltip, Tabs, Flex, Skeleton } from 'antd';
import { ReloadOutlined, SearchOutlined, DownOutlined, EditOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Carousel } from 'react-responsive-carousel';
import { redirect } from 'next/navigation';
import { useTokenContext } from '../components/parent';

const { SubMenu } = Menu;
import 'react-responsive-carousel/lib/styles/carousel.min.css';

//UrlBuilder Components
import MnetUrlBuilder from '../Campaigns/camp-components/urlbuilder/mnet';
import System1UrlBuilder from '../Campaigns/camp-components/urlbuilder/system1'
import TonicUrlBuilder from '../Campaigns/camp-components/urlbuilder/tonic';
import DActiveUrlBuilder from '../Campaigns/camp-components/urlbuilder/dactive';

import debounce from 'lodash.debounce';

import dynamic from 'next/dynamic';

const DynamicCreatenewuser = dynamic(() => import('./users-components/create-newuser'), {
    ssr: false,
    loading: () => <p>I am fetching</p>
});
const DynamicNewaddaccounts = dynamic(() => import('./users-components/add-newaccount'));
const DynamicEdituseraccesses = dynamic(() => import('./users-components/edit-usersaccess'));
const DynamicEditAccountAccess = dynamic(() => import('./users-components/edit-accountaccess'));
const DynamicEditNetworkAccess = dynamic(() => import('./users-components/edit-network'));
const DynamicEditUrlBuilder = dynamic(() => import('./users-components/edit-urlbulder'));
const DynamicRequestComponent = dynamic(() => import('../CronDashboard/crons'));
const UploadComponent = dynamic(() => import('./users-components/updates_notifications'));

const roles = ['All', 'Media_Buyer', 'Admin', 'Manager', 'Special_User', "Revenue_Partner"];
const accountStatus = ['All', 'Active', 'InActive'];
const availableNetworks = ['All', "MEDIA_DOT_NET", "MEDIA_DOT_NET_BING", "ENKI", "TONIC", "System1", "Bodies", "Bodies1", "Rsoc", "Domain Active"];
const networkStatus = ['All', 'Active', 'InActive'];

const UsersTable = () => {
    const { userdetails } = useTokenContext();
    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
            {/* <Flex align="center" gap="middle">
                <Spin size="large" />
            </Flex> */}
        </div>;
    }

    if(userdetails?.role !== "Admin"){
        redirect("/Dashboard");
    };
    const [isSearchingNetwork, setIsSearchingNetwork] = useState(false); //prudhvi
    const [netSearchInput, setNetSearchInput] = useState(""); //prudhvi
    const [networkAccessDrawerkVisible, setNetworkAccessDrawerVisible] = useState(false); //prudhvi
    const [urlBuliderAccessDrawerkVisible, setUrlBuliderAccessDrawerkVisible] = useState(false);//Praveen
    const [networkFilteredData, setNetworkFilteredData] = useState([]); //prudhvi
    const [networksData, setNetworksData] = useState([]); //prudhvi
    const [urlBuilderData, setUrlBuilderData] = useState([]);
    const [networkAccessData, setNetworkAccessData] = useState(null);
    const [urlBuilderAccessData, setUrlBuilderAccessData] = useState(null);//Praveen
    const [usersData, setUsersData] = useState([]);
    const [AccountsData, setAccountsData] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [accFilteredData, setaccFilteredData] = useState([]);
    const [paginationSize, setPaginationSize] = useState();
    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [loading3, setLoading3] = useState(true);
    const [loading4, setLoading4] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [accountDrawerVisible, setaccountDrawerVisible] = useState(false);
    const [usersaccessDrawerVisible, setusersaccessDrawerVisible] = useState(false);
    const [accountaccessDrawerVisible, setaccountaccessDrawerVisible ] = useState(false);
    const [usersaccessData, setusersaccessData] = useState(null);
    const [accountaccessData, setaccountaccessData] = useState(null);
    const [newSearchInput, setNewSearchInput] = useState("");
    const [newRefreshUrlBuilder, setNewRefreshUrlbuilder] = useState(null);

    const [role, setRole] = useState('All');
    const [status, setStatus] = useState('All');
    const [revenuePartner, setRevenuePartner] = useState('All');
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchingAccount, setIsSearchingAccount] = useState(false);

    
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);

    const [activeTab, setActiveTab] = useState("1");

    const handleCancelForURLBuilder = () => {
        setIsModalVisibleForURLBuilder(false);
    };

    const [activeSlide, setActiveSlide] = useState(0);
    const [network, setNetwork] = useState("");
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();

    const uploadRef = useRef();

    const handleBlur = () => {
        if (searchInput.trim() === '') {
            setIsSearching(false);
        }
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
        { key: '4', label: 'UrlBuilder', content: 'Content for Campaign data' },
        {key: '5', label: 'CronDashboard', content: 'Content for Crons'},
        {key: '6', label: 'Updates', content: 'Content for Updates'}
    ];

    const handleTabChange = (key) => {
        // const index = parseInt(key, 10) - 1; // Convert tab key to slide index
        // setActiveSlide(index); // Update the active slide
        setActiveTab(key);
    };
    

    const handleCarouselChange = (index) => {
        setActiveSlide(index); // Update the active tab based on the carousel's current slide
    };

    const renderCarouselNav = () => (
        <div style={{marginLeft:'10px'}}>
            <Tabs
                activeKey={activeTab} // Sync the active tab with the slide
                onChange={handleTabChange} // Update the slide on tab change
                items={items.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
                className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
                style={{
                    backgroundColor:  'transparent',
                    padding: '0',
                    marginBottom: '0',
                }}
                tabBarStyle={{
                    fontSize: '12px',
                    padding: '0',
                    height: '30px',
                    lineHeight: '30px',
                    // marginBottom: '-1px',
                    borderBottom: 'none',
                }}
            />
        </div>
    );

    const onClickOpenUrlBuilder = (action) =>{
        setNetwork(action.Network);
        setIsModalVisibleForURLBuilder(true);
    }

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
        try {
            // Check if values.email exists
            const url = values.email ? `/api/deleteUser?email=${values.email}` : '';

            if (url) {
                // Show modal confirmation
                Modal.confirm({
                    title: 'Confirm',
                    content: 'Are you sure you want to remove access?',
                    className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
                    okText: 'OK',
                    cancelText: 'Cancel',
                    onOk: async () => {
                      try {
                        const response = await apiClient.delete(url);
                        if (response.status === 200) {
                          message.success(`${values.userName} User access removed successfully`);
                          refreshUsers();
                        } else {
                          console.error('Failed to delete user');
                        }
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    },
                    onCancel: () => {
                      console.log('Cancel');
                    },
                  });
            } else {
                console.error('Email address is missing');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleStatusChange = async(accountNumber, checked) => {
        const newData = AccountsData.map((item) => {
            if (item.accountNumber === accountNumber) {
                return {
                    ...item,
                    status: checked ? 'Active' : 'InActive',
                };
            }
            return item;
        });
        const newStatus = checked ? 'Active' : 'InActive';
        const response = await apiClient.get(`/updateAccount/?accountNumber=${accountNumber}&status=${newStatus}`);
        setAccountsData(newData);
    };

    const fetchusersData = async () => {
        try {
            const response = await apiClient.get('/get/usersdata/');
            if (response.status === 200) {
                setUsersData(response.data);
            } else {
                console.error('Failed to fetch users data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading1(false);
        }
    };

    const fetchAccountsData = async () => {
        try {
            const response = await apiClient.get('/api/getAccountsData/');
            if (response.status === 200) {
                setAccountsData(response.data);
            } else {
                console.error('Failed to fetch users data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading2(false);
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
        const newData = networksData.map((item) => {
            if (item.revenuePartner === revenuePartner) {
                return {
                    ...item,
                    Status: checked ? 'Active' : 'InActive',
                };
            }
            return item;
        });
        const newStatus = checked ? 'Active' : 'InActive';
        const response = await apiClient.get(`/updateNetwork/?revenuePartner=${revenuePartner}&Status=${newStatus}`);
        console.log(response.data);
        setNetworksData(newData);
    };

    const fetchNetworksData = async () => {
        try{
            const response = await apiClient.get('/get/networksData/');
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
            setLoading3(false);
        }
    }

    const fetchUrlBuilderData = async () => {
        try{
            const response = await apiClient.get('/get/allurlbuilderdata/');
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
            setLoading4(false);
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
                   className='networks-status-column'
                >
                    <Col flex="1 1 auto">
                        <span>{text}</span>
                    </Col>
                    <Col flex="1 1 auto">
                        <Switch
                            checked={record.Status === 'Active'}
                            style={{backgroundColor: record.Status === 'Active' && "#91C25F"}}
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
                const str = text !== undefined && text !== null ? String(text) : '';
                return str ? `****${str.slice(-5)}` : '---';
            }
        },                       
        // {
        //     title: 'Key',
        //     dataIndex: 'key',
        //     key: 'displayKey',
        //     render: (text) => {
        //         if (text) {
        //             return `****${text.slice(-5)}`;
        //         }
        //         return '---';
        //     }
        // },
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
                    className='networks-status-column'
                >
                    <Col flex="1 1 auto">
                        <span>{text}</span>
                    </Col>
                    <Col flex="1 1 auto">
                        <Switch
                            checked={record.status === 'Active'}
                            style={{backgroundColor: record.status === 'Active' && "#91C25F"}}
                            onChange={(checked) => handleStatusChange(record.accountNumber, checked)}
                        />
                    </Col>
                    <Col flex="1 1 auto">
                        <EditOutlined style={{ fontSize: '20px' }} onClick={()=> handleEditAccount(record)} />
                    </Col>
                </Row>
            ),
        },
        {
            title: 'Revenue Account ID',
            dataIndex: 'revenueAccountId',
            key: 'revenueAccountId',
        },
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
                                className={`custom-dropdown-menu ${theme === 'dark' ? 'dark-menu' : ''}`}
                                >
                                {menuItems.map(item => (
                                    <SubMenu  key={item.key} title={<span>{item.label} <DownOutlined size={10}/></span>}>
                                    <div style={{maxHeight:"200px", overflow:'auto'}}>
                                        {item.children && item.children.map(child => (
                                        <Menu.Item key={child.key}>
                                        {child.label}
                                        </Menu.Item>
                                    ))}
                                    </div>
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
                    <Button style={{backgroundColor:'#91C25F', color:'black'}} onClick={() => handleEdit(record)}>Edit</Button>
                    <Button style={{backgroundColor: "transparent", color: theme === "dark" ? "white" : "black"}} onClick={() => handleDelete(record)}>Remove Access</Button>
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
                                    className={`custom-dropdown-menu ${theme === 'dark' ? 'dark-menu' : ''}`}
                                >
                                    {newDomains.map(item => (
                                        <SubMenu
                                            key={item.key}
                                            title={
                                                <span className='columns-submenu'>
                                                    {item.name} <DownOutlined size={10} />
                                                </span>
                                            }
                                            className="custom-submenu"
                                        >
                                            <div className='urlbuilder-submenu-container'>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>Name:</strong> {item.name}</p>
                                                <p><strong>Code:</strong> {item.code}</p>
                                                <p><strong>Account:</strong> {item.account}</p>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '8px', paddingTop:'10px' }}><strong>URL:</strong></div>
                                                    <div className='urlbuilder-submenu-container-item'>
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
                                    style={{ width: 256, maxHeight: 300, overflowY: 'auto' }}
                                    mode="inline"
                                    className={`custom-dropdown-menu ${theme === 'dark' ? 'dark-menu' : ''}`}
                                >
                                    {newSource.map(item => (
                                        <SubMenu
                                            key={item.key}
                                            title={
                                                <span className='columns-submenu'>
                                                    {item.name} <DownOutlined size={10} />
                                                </span>
                                            }
                                            className="custom-submenu"
                                        >
                                            <div className='urlbuilder-submenu-container'>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>Name:</strong> {item.name}</p>
                                                <p><strong>Code:</strong> {item.code}</p>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '10px', paddingTop:'10px' }}><strong>CampaignID:</strong></div>
                                                    <div className='urlbuilder-submenu-container-item'>
                                                        {item.campaignId}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '10px', paddingTop:'10px' }}><strong>AdsetID:</strong></div>
                                                    <div className='urlbuilder-submenu-container-item'>
                                                        {item.AdsetId}
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
            title: 'channels',
            dataIndex: 'channels',
            key: 'channels',
            render: channels => {
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
                                className={`custom-dropdown-menu ${theme === 'dark' ? 'dark-menu' : ''}`}
                                >
                                {newChannels.map(item => (
                                    <SubMenu
                                        key={item.key}
                                        title={
                                            <span className='columns-submenu'>
                                                {item.name} <DownOutlined size={10} />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div className='urlbuilder-submenu-container'>
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
                                    className={`custom-dropdown-menu ${theme === 'dark' ? 'dark-menu' : ''}`}
                                >
                                    {newBusinessData.map(item => (
                                        <SubMenu
                                            key={item.key}
                                            title={
                                                <span className='columns-submenu'>
                                                    {item.name} <DownOutlined size={10} />
                                                </span>
                                            }
                                            className="custom-submenu"
                                        >
                                            <div className='urlbuilder-submenu-container'>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>Name:</strong> {item.name}</p>
                                                <p><strong>Code:</strong> {item.code}</p>
                                                <p><strong>Account:</strong> {item.account}</p>
                                                <div style={{ display: 'flex', marginRight:'25px' }}>
                                                    <div style={{ paddingRight: '8px', paddingTop:'10px' }}><strong>URL:</strong></div>
                                                    <div className='urlbuilder-submenu-container-item'>
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
            width: 150,
            render: (text, record) => (
                <Space size="middle">
                    <Button style={{backgroundColor:'#91C25F', color:'black'}} onClick={()=>handleEditUrlBuilder(record)}>Edit</Button>
                    {/* <Button type="dashed" onClick={() => handleDelete(record)}>Remove Access</Button> */}
                    <EditOutlined style={{ fontSize: '20px', cursor: 'pointer'}} onClick={()=>onClickOpenUrlBuilder(record)}  />
                </Space>
            ),
        },
    ];

    // const handleSearchChange = (e) => {
    //     const searchValue = e.target.value.toLowerCase();
    //     setSearchInput(searchValue);
    //     const filtered = usersData.filter((item) =>
    //         Object.values(item).some((field) =>
    //             typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //         )
    //     );
    //     setFilteredData(filtered);
    // };

    // setaccFilteredData(AccountsData);
    //     setNetworkFilteredData(networksData);

    useEffect(() => {
        // Helper function to apply search filter
        const searchFilter = (data, searchValue) => {
          if (!searchValue) return data;
          return data.filter((item) =>
            Object.values(item).some(
              (field) =>
                typeof field === 'string' &&
                field.toLowerCase().includes(searchValue)
            )
          );
        };
      
        // For Users – use your existing filterUserData function
        setFilteredData(filterUserData());
      
        // For Accounts: first filter by Status and Revenue Partner, then apply search (if any)
        let accData = AccountsData?.filter(
          (item) =>
            (status === 'All' || item.status === status) &&
            (revenuePartner === 'All' || item.revenuePartner === revenuePartner)
        );
        if (newSearchInput) {
          accData = searchFilter(accData, newSearchInput);
        }
        setaccFilteredData(accData);
      
        // For Networks: note that your networks data uses "Status" (capital S)
        let netData = networksData?.filter(
          (item) =>
            (status === 'All' || item.Status === status) &&
            (revenuePartner === 'All' || item.revenuePartner === revenuePartner)
        );
        if (netSearchInput) {
          netData = searchFilter(netData, netSearchInput);
        }
        setNetworkFilteredData(netData);
      }, [
        usersData,
        searchInput,
        role,
        status,
        revenuePartner,
        AccountsData,
        newSearchInput,
        networksData,
        netSearchInput
    ]);
      

    // useEffect(() => {
    //     const filterData = (data, searchValue) => {
    //         if (!searchValue) return data; // ✅ Restore full list if search bar is empty
    //         const filtered = data.filter((item) =>
    //             Object.values(item).some(
    //                 (field) => typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //             )
    //         );
    //         return filtered.length > 0 ? filtered : []; // ✅ Show empty if no matches
    //     };
    
    //     // ✅ Apply filtering logic dynamically for each dataset
    //     setFilteredData(filterData(usersData, searchInput));
    //     setFilteredData(filterUserData());
    //     setaccFilteredData(filterData(AccountsData, newSearchInput));
    //     setNetworkFilteredData(filterData(networksData, netSearchInput));
    
    // }, [usersData, searchInput, role,status, 
    //     revenuePartner, AccountsData, newSearchInput, networksData, netSearchInput]); // ✅ Dependencies ensure real-time updates
    

    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchInput(searchValue);
    
        if (!searchValue) {
            setFilteredData(usersData);
        } else {
            // ✅ Filter usersData dynamically to prevent showing deleted items
            const filtered = usersData.filter((item) =>
                Object.values(item).some((field) =>
                    typeof field === 'string' && field.toLowerCase().includes(searchValue)
                )
            );
    
            setFilteredData(filtered.length > 0 ? filtered : []); // ✅ Show empty if no match
        }
    };
    
    
    // const handleaccountSearchChange = (e) => {
    //     const searchValue = e.target.value.toLowerCase();
    //     setNewSearchInput(searchValue);

    //     if (!searchValue) {
    //         setaccFilteredData(AccountsData);
    //     } else {
    //         const accfiltered = AccountsData.filter((item) =>
    //             Object.values(item).some((field) =>
    //                 typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //             )
    //         );
    //         setaccFilteredData(accfiltered);
    //     }
    // };

    const handleaccountSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setNewSearchInput(searchValue);
    
        if (!searchValue) {
            // ✅ Restore full list when search bar is cleared
            setaccFilteredData(AccountsData);
        } else {
            // ✅ Always filter from the latest AccountsData to remove deleted items
            const accfiltered = AccountsData.filter((item) =>
                Object.values(item).some((field) =>
                    typeof field === 'string' && field.toLowerCase().includes(searchValue)
                )
            );
    
            setaccFilteredData(accfiltered.length > 0 ? accfiltered : []); // ✅ Show empty if no match
        }
    };
    
    // const handleNetworkSearchChange = (e) => {
    //     const searchValue = e.target.value.toLowerCase();
    //     setNetSearchInput(searchValue);

    //     if (!searchValue) {
    //         setNetworkFilteredData(networksData);
    //     } else {
    //         // Filtering only fields that are strings
    //         const networkFiltered = networksData.filter((item) =>
    //             Object.values(item).some((field) =>
    //                 typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //             )
    //         );
    //         setNetworkFilteredData(networkFiltered);
    //     }
    // };

    const handleNetworkSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setNetSearchInput(searchValue);
    
        if (!searchValue) {
            // ✅ Restore full list when search bar is cleared
            setNetworkFilteredData(networksData);
        } else {
            // ✅ Always filter from the latest networksData to remove deleted items
            const networkFiltered = networksData.filter((item) =>
                Object.values(item).some((field) =>
                    typeof field === 'string' && field.toLowerCase().includes(searchValue)
                )
            );
    
            setNetworkFilteredData(networkFiltered.length > 0 ? networkFiltered : []); // ✅ Show empty if no match
        }
    };
    
    const showNetworkDrawer = () => {
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setPaginationSize();
            } else if (window.innerWidth < 2560) {
                setPaginationSize();
            } else {
                setPaginationSize();
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
    }

    const handleEditUrlBuilder = (record) =>{
        setUrlBuliderAccessDrawerkVisible(true);
        setUrlBuilderAccessData(record);
    }

    const handleEditAccount = (values) => {
        setaccountaccessDrawerVisible(true)
        setaccountaccessData(values)
    }

    const handleEditNetwork = (values) => {
        setNetworkAccessDrawerVisible(true)
        setNetworkAccessData(values)
    }

    const onChangeRole = (value) => {
        setRole(value);
    }

    const onChangeNetwork = (value) =>{
        setRevenuePartner(value);
    }

    const onChangeStatus = (value) => {
        setStatus(value);
    }

    const filteredRoleData = role !== 'All' ? usersData?.filter((each)=> each.role.includes(role)) : usersData;
    
    const filterData = () => {
        return AccountsData?.filter(item => 
            (status === 'All' || item.status === status) &&
            (revenuePartner === 'All' || item.revenuePartner === revenuePartner)
        );
    };
    
    const filteredAccountData = filterData();

    const refreshUsers = async () => {
        try {
            setLoading1(true);
            const response = await fetchusersData();  
            setUsersData(response.data);  
        } catch (error) {
            console.error("Error refreshing account data:", error);
            
        } finally {
          
            setLoading1(false);
        }
    };

    const refreshAccounts = async () => {
        try { 
            setLoading2(true);
            const response = await fetchAccountsData(); 
            setAccountsData(response.data);  
        } catch (error) {
            console.error("Error refreshing account data:", error); 
        } finally {
            setLoading2(false);
        }
    };
    
    const refreshNetworks = async () => {
        try {
            setLoading3(true);
            const response = await fetchNetworksData();  
            setNetworksData(response.data); 
        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setLoading3(false);
        }
    };

    const refreshUrlBuilder = async () => {
        try {
            setLoading4(true);
            const response = await fetchUrlBuilderData();  
            setUrlBuilderData(response.data); 
        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setLoading4(false);
        }
    };


    useEffect(()=>{
        if(newRefreshUrlBuilder !== null){
            refreshUrlBuilder();
        }
    },[newRefreshUrlBuilder]);

    const onCloseDrawer = (updatedData) => {
        console.log(updatedData);
        if (updatedData) {
          if (updatedData.email || updatedData === "email") {
            // Handle user data update
            setUsersData((prevData) =>
              prevData.map((user) =>
                user.email === updatedData.email ? updatedData : user
              )
            );
          } else if (updatedData === "AccountNumber" || updatedData.accountNumber) {
            refreshAccounts();
          } else if (updatedData.revenuePartner) {
            // Handle network data update
            setNetworksData((prevData) =>
              prevData.map((network) =>
                network.revenuePartner === updatedData.revenuePartner ? updatedData : network
              )
            );
          }else if(newRefreshUrlBuilder !== null){
            setNewRefreshUrlbuilder(updatedData);
          }
        }
      
        // Close all relevant drawers
        setDrawerVisible(false);
        setaccountDrawerVisible(false);
        setusersaccessDrawerVisible(false);
        setaccountaccessDrawerVisible(false);
        setNetworkAccessDrawerVisible(false);
        setUrlBuliderAccessDrawerkVisible(false);
    };

    console.log(accFilteredData);
    
    const getUrlBuilder = (network) => {
        switch (network) {
            case 'Mnet':
                return <MnetUrlBuilder showSubmitButton={true} />
            case 'Tonic':
                return <TonicUrlBuilder showSubmitButton={true}  />
            case 'System1':
                return <System1UrlBuilder showSubmitButton={true}  /> //onReturnMessage={onReturnUrl}
            case 'DActive':
                return <DActiveUrlBuilder showSubmitButton={true}  />
        }
    }

    const filterUserData = () => {
        return usersData?.filter(item =>
          // Check if the role matches or if "All" is selected
          (role === 'All' || item.role === role) &&
          // Check search input: if empty, include all items; otherwise, match any string field
          (!searchInput || Object.values(item).some(
            field => typeof field === 'string' && field.toLowerCase().includes(searchInput.toLowerCase())
          ))
        );
    };

    const handleSlideChange = () =>{
        setActiveTab((parseInt(to)+1).toString());
    }
    

    return (
        <div style={{height:"100%"}}>
            {drawerVisible && <DynamicCreatenewuser visible={drawerVisible} onClose={onCloseDrawer} refreshUsers={refreshUsers} />}
            <DynamicNewaddaccounts visible={accountDrawerVisible} onClose={onCloseDrawer} />
            <DynamicEdituseraccesses editeddata={usersaccessData} visible={usersaccessDrawerVisible} onClose={onCloseDrawer} />
            <DynamicEditAccountAccess editeddata={accountaccessData} visible={accountaccessDrawerVisible} onClose={onCloseDrawer} />
            <DynamicEditNetworkAccess editeddata={networkAccessData} visible={networkAccessDrawerkVisible} onClose={onCloseDrawer} />
            <DynamicEditUrlBuilder editeddata={urlBuilderAccessData} visible={urlBuliderAccessDrawerkVisible} onClose={onCloseDrawer} />

            <div style={{padding:'0px', margin:'0px'}}>
                    {renderCarouselNav()}
            </div>
            <Tabs activeKey={activeTab} onChange={handleSlideChange} renderTabBar={() => <></>}>
                <Tabs.TabPane key="1">
                <div style={{width:'100%'}}>
                        <Card title="Users Access" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <Row gutter={[5,0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Col style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                    <>
                                                        {/* <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid green', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} /> */}
                                                        <Input
                                                            placeholder="Search user"
                                                            autoFocus
                                                            value={searchInput}
                                                            onChange={handleSearchChange}
                                                            onBlur={handleBlur} 
                                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                            // style={{ width: '100%', border: '1px solid #37474F', borderRadius: '6px', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'  }}
                                                            style={{ width: '170px', marginLeft: '3px', border: '1px solid #91C25F', }}
                                                        />
                                                    </>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Role</span>
                                            <Select
                                                onChange={onChangeRole}
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                options={roles.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>
                                        {/* <Col xs={24} sm={12} md={8}>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Category</span>
                                            <Select
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
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
                                        </Col>  */}
                                        <Col style={{marginTop:'8%',}}>
                                            <div style={{marginLeft: '5px', color: theme === 'dark' ? '#fff' : '#333' }}>
                                                Total.No Of Records {filteredData.length}
                                            </div>
                                        </Col>
                                    </Col>    
                                
                                <Col style={{marginTop:'2%'}}>
                                    <Button 
                                        type="default" 
                                        icon={<ReloadOutlined className="black-icon"/>} 
                                        style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                        onClick={refreshUsers}  // Call refresh function when clicked
                                    >
                                    </Button>
                                    <Button style={{ float: "right", border: 'none', backgroundColor: '#91C25F', color:'black' }} onClick={() => setDrawerVisible(true)}>
                                        Create User
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                        {loading1 ? (
                            <div style={{ padding: '24px' }}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                            </div>
                            // <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight: 'calc(80vh - 100px)'}}>
                            //     <Spin />
                            // </div>   
                        ) : usersData.length > 0 ? (
                            <Table
                                className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                                dataSource={filteredData.map((item, index) => ({ ...item, key: index }))}
                                // style={{backgroundColor: theme === 'dark' ? '#333' : '#fff', }}
                                columns={columns}
                                pagination={{ pageSize: paginationSize }}
                                scroll={{ y: 'calc(80vh - 200px)' }}
                            />
                            // <Table
                            //     className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            //     dataSource={searchInput ? filteredData.map((item, index) => ({ ...item, key: index })) : usersData.map((item, index) => ({ ...item, key: index }))}
                            //     columns={columns}
                            //     pagination={{ pageSize: paginationSize }}
                            //     scroll={{ y: 'calc(80vh - 200px)' }}
                            // />
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
                </Tabs.TabPane>
                <Tabs.TabPane key="2">
                <div>
                        <Card title="All accounts" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <Row gutter={[5, 0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Col style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                        
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                {/* <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid green', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} /> */}
                                                <Input
                                                    placeholder="Search here"
                                                    autoFocus={isSearchingAccount}  // Only autofocus when searching
                                                    value={newSearchInput}
                                                    onChange={handleaccountSearchChange}
                                                    onBlur={handleBlur1} 
                                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                    // style={{ width: '100%', border: '1px solid green', borderRadius: '6px', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'  }} 
                                                    style={{ width: '170px', marginLeft: '3px', border: '1px solid #91C25F', }}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                            <Select
                                                onChange={onChangeNetwork}
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                options={availableNetworks.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Status</span>
                                            <Select
                                                onChange={onChangeStatus}
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                options={accountStatus.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>
                                        <Col style={{marginTop:'5%',}}>
                                            <div style={{marginLeft: '5px', color: theme === 'dark' ? '#fff' : '#333' }}>
                                                Total.No Of Records {accFilteredData.length}
                                            </div>
                                        </Col>
                                </Col>
                                <Col style={{marginTop:'2%'}}>
                                    <Button 
                                        type="default" 
                                        icon={<ReloadOutlined className="black-icon"/>} 
                                        style={{ float: "right", marginLeft: "8px", backgroundColor: '#91C25F' }} 
                                        onClick={refreshAccounts}  // Call refresh function when clicked
                                    >
                                    </Button>
                                    <Button style={{ float: "right", border: 'none', backgroundColor: '#91C25F', color: "black" }} onClick={shownnewaccountdrawar}>
                                        Add New Account
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                        {(loading2) ? (
                            <div style={{ padding: '24px' }}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                            </div>
                            // <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight: 'calc(80vh - 100px)'}}>
                            //     <Spin />
                            // </div> 
                        ) : AccountsData.length > 0 ? (
                            <Table
                                className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                                // dataSource={newSearchInput ? accFilteredData.map((item, index) => ({ ...item, key: index })) : AccountsData.map((item, index) => ({ ...item, key: index }))}
                                dataSource={accFilteredData.map((item, index) => ({ ...item, key: index }))}
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
                </Tabs.TabPane>
                <Tabs.TabPane key="3">
                <div>
                        <Card title="All Networks" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <Row align={"bottom"} gutter={[5, 0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Col style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                    {/* <Row gutter={[16, 16]}> */}
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                {/* <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", borderColor: "", border: '1px solid green', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchNetwork} /> */}
                                                <Input
                                                    placeholder="Search here"
                                                    autoFocus={isSearchingNetwork}  // Only autofocus when searching
                                                    value={netSearchInput}
                                                    onChange={handleNetworkSearchChange}
                                                    onBlur={handleBlur2} 
                                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                    // style={{ width: '100%', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#37474F'}}
                                                    style={{ width: '170px', marginLeft: '3px', border: '1px solid #91C25F', }} 
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                            <Select
                                                onChange={onChangeNetwork}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                options={availableNetworks.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Status</span>
                                            <Select
                                                onChange={onChangeStatus}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                options={networkStatus.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col> 
                                        <Col style={{marginTop:'5%',}}>
                                            <div style={{marginLeft: '0px', color: theme === 'dark' ? '#fff' : '#333' }}>
                                                Total.No Of Records {networkFilteredData.length}
                                            </div>
                                        </Col>                   
                                    {/* </Row> */}
                                </Col>
                               
                                <Col style={{marginTop:'2%'}}>
                                    <Button 
                                        type="default" 
                                        icon={<ReloadOutlined className="black-icon"/>} 
                                        style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                        onClick={refreshNetworks}  // Call refresh function when clicked
                                    >
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                        {(loading3) ? (
                            <div style={{ padding: '24px' }}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                            </div>
                            // <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight: 'calc(80vh - 100px)'}}>
                            //     <Spin />
                            // </div> 
                        ) : networksData.length > 0 ? ( 
                            <Table
                                className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                                // dataSource={netSearchInput ? networkFilteredData.map((item, index) => ({ ...item, key: item.key, id: index })) : networksData.map((item, index) => ({ ...item, key: item.key, id: index }))}
                                dataSource={networkFilteredData.map((item, index) => ({ ...item, key: item.key || index, id: index }))}
                                columns={networksColumn}
                                pagination={{ pageSize: paginationSize }}
                                scroll={{ y: 'calc(80vh - 200px)', x: 'max-content' }}
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
                </Tabs.TabPane>
                <Tabs.TabPane key="4">
                <div>
                        <Card title="URL Builder" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <Row gutter={[5, 0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Col style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                    {/* <Row gutter={[16, 16]}> */}
                                        
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                {/* <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid #91C25F', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} /> */}
                                                <Input
                                                    placeholder="Search here"
                                                    autoFocus={isSearchingAccount}  // Only autofocus when searching
                                                    value={newSearchInput} 
                                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                    // style={{ width: '100%', border: '1px solid green', borderRadius: '6px', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'  }} 
                                                    style={{ width: '170px', marginLeft: '3px', border: '1px solid #91C25F', }}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                            <Select
                                                defaultValue="All"
                                                style={{ width: "170px", marginTop: '8px', border: '1px solid #91C25F', borderRadius: '6px',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                options={availableNetworks.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>
                                    {/* </Row> */}
                                </Col>
                                <Col style={{display:'flex', marginTop:'2%'}}>
                                    <Button  style={{ float: "right", backgroundColor:'#91C25F', color:'black' }}>
                                        Add New URL Builder
                                    </Button>
                                    <Button 
                                        type="default" 
                                        icon={<ReloadOutlined className="black-icon"/>} 
                                        style={{ float: "right", marginLeft: "7px", backgroundColor: '#91C25F' }} 
                                        onClick={refreshUrlBuilder}  // Call refresh function when clicked
                                    >
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                        {(loading4) ? (
                            <div style={{ padding: '24px' }}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                            </div>
                            // <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight: 'calc(80vh - 100px)'}}>
                            //     <Spin />
                            // </div> 
                        ) : urlBuilderData.length > 0 ? (
                            <Table
                                className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                                dataSource={urlBuilderData}
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
                        <Modal
                            title="URL Builder"
                            visible={isModalVisibleForURLBuilder}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onCancel={handleCancelForURLBuilder}
                            footer={null}
                            width="80%" // Set width of the modal
                            bodyStyle={{ height: '50vh', overflowY: 'auto' }}
                            >
                                {getUrlBuilder(network)}
                        </Modal>
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="5">
                    <div>
                        <Card title="Ad Account Details" size="small"  className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <div className='account-details-container'>
                                <div className='user-account-container'>
                                    {userdetails?.adAccounts ? (
                                        Object.keys(userdetails.adAccounts).map((network) => (
                                            <DynamicRequestComponent
                                                key={network}
                                                network={network}
                                                adAccounts={userdetails.adAccounts[network]}
                                            />
                                        ))
                                    ) : (
                                        <div>Loading account details...</div> // Fallback while loading
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane key="6">
                    <div className="h-screen flex items-center justify-center">
                        <div className="form-container">
                            <UploadComponent ref={uploadRef} isLoading={false} />
                        </div>
                    </div>
                </Tabs.TabPane>
            </Tabs>
            {/* <Carousel
                showArrows={false}
                showThumbs={false}
                showIndicators={false}
                showStatus={false}
                selectedItem={activeSlide} 
                onChange={handleCarouselChange} 
                style={{height:'50%'}}
            >    
                <div style={{width:'100%'}}>
                    <Card title="Users Access" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                                <>
                                                    <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid #37474F', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} />
                                                    <Input
                                                        placeholder="Search here"
                                                        autoFocus
                                                        value={searchInput}
                                                        onChange={handleSearchChange}
                                                        onBlur={handleBlur} 
                                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                        style={{ width: '100%', marginLeft: '8px' }}
                                                    />
                                                </>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Role</span>
                                        <Select
                                            onChange={onChangeRole}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                            <Col xs={24} sm={12} md={3}>
                                <div style={{marginLeft: '0px', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}>
                                    Total.No Of Records {filteredData.length}
                                </div>
                            </Col>
                            <Col xs={24} md={5}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined className="black-icon"/>} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                    onClick={refreshUsers}  
                                >
                                </Button>
                                <Button style={{ float: "right", border: 'none', backgroundColor: '#91C25F', color:'black' }} onClick={() => setDrawerVisible(true)}>
                                    Create User
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading1 ? (
                        <div style={{ padding: '24px' }}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div> 
                    ) : usersData.length > 0 ? (
                        <Table
                            className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                            dataSource={filteredData.map((item, index) => ({ ...item, key: index }))}
                            columns={columns}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)' }}
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
                                            <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid #37474F', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingAccount} 
                                                value={newSearchInput}
                                                onChange={handleaccountSearchChange}
                                                onBlur={handleBlur1} 
                                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                style={{ width: '100%', border: '1px solid #37474F', borderRadius: '6px', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'  }} 
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            onChange={onChangeNetwork}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                            <Col xs={24} sm={12} md={3}>
                                <div style={{marginLeft: '0px', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}>
                                    Total.No Of Records {accFilteredData.length}
                                </div>
                            </Col>
                            <Col xs={24} md={5}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined className="black-icon"/>} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                    onClick={refreshAccounts}  
                                >
                                </Button>
                                <Button style={{ float: "right", border: 'none', backgroundColor: '#91C25F', color: "black" }} onClick={shownnewaccountdrawar}>
                                    Add New Account
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {(loading2) ? (
                        <div style={{ padding: '24px' }}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                    ) : AccountsData.length > 0 ? (
                        <Table
                            className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                            dataSource={accFilteredData.map((item, index) => ({ ...item, key: index }))}
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
                    <Card title="All Networks" size="small" className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <Row align={"bottom"} gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Search</span>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", borderColor: "", border: '1px solid #37474F', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchNetwork} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingNetwork}  
                                                value={netSearchInput}
                                                onChange={handleNetworkSearchChange}
                                                onBlur={handleBlur2} 
                                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                style={{ width: '100%', marginLeft: '8px' }} 
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            onChange={onChangeNetwork}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
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
                            <Col xs={24} sm={12} md={3}>
                                <div style={{marginLeft: '0px', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}>
                                    Total.No Of Records {networkFilteredData.length}
                                </div>
                            </Col>
                            <Col xs={24} md={5}>
                                <Button 
                                    type="default" 
                                    icon={<ReloadOutlined className="black-icon"/>} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                    onClick={refreshNetworks}  
                                >
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {(loading3) ? (
                        <div style={{ padding: '24px' }}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                    ) : networksData.length > 0 ? ( 
                        <Table
                            className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                            dataSource={networkFilteredData.map((item, index) => ({ ...item, key: item.key || index, id: index }))}
                            columns={networksColumn}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)', x: 'max-content' }}
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
                                            <Button  style={{backgroundColor: theme === "dark" ? "#555": "#fff", border: '1px solid #37474F', borderRadius: '6px',}} icon={<SearchOutlined  style={{color: theme === "dark" ? "#fff": "#333"}} />} onClick={handleSearchClick1} />
                                            <Input
                                                placeholder="Search here"
                                                autoFocus={isSearchingAccount} 
                                                value={newSearchInput} 
                                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                style={{ width: '100%', border: '1px solid #37474F', borderRadius: '6px', marginLeft: '8px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555',borderColor: theme === 'dark' ? '#444444' : '#d9d9d9'  }} 
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <span style={{ color: "#B4B4B4", display: 'block' }}>Network</span>
                                        <Select
                                            defaultValue="All"
                                            style={{ width: "100%", marginTop: '8px', border: '1px solid #37474F', borderRadius: '6px',
                                            }}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            options={availableNetworks.map((item) => ({
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
                                    icon={<ReloadOutlined className="black-icon"/>} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }} 
                                    onClick={refreshUrlBuilder}  
                                >
                                </Button>
                                <Button  style={{ float: "right", marginLeft: "5%", backgroundColor:'#91C25F', color:'black' }}>
                                    Add New URL Builder
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {(loading4) ? (
                        <div style={{ padding: '24px' }}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                        
                    ) : urlBuilderData.length > 0 ? (
                        <Table
                            className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
                            dataSource={urlBuilderData}
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
                    <Modal
                        title="URL Builder"
                        visible={isModalVisibleForURLBuilder}
                        onCancel={handleCancelForURLBuilder}
                        footer={null}
                        width="80%" 
                        bodyStyle={{ height: '50vh', overflowY: 'auto' }}
                        >
                            {getUrlBuilder(network)}
                    </Modal>
                </div>
                
                <div>
                    <Card title="Ad Account Details" size="small"  className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        <div className='account-details-container'>
                            <div className='user-account-container'>
                                {userdetails?.adAccounts ? (
                                    Object.keys(userdetails.adAccounts).map((network) => (
                                        <DynamicRequestComponent
                                            key={network}
                                            network={network}
                                            adAccounts={userdetails.adAccounts[network]}
                                        />
                                    ))
                                ) : (
                                    <div>Loading account details...</div> 
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="upload-form-wrapper h-screen w-screen flex items-center justify-center bg-gray-50">
                    <div className="form-container w-full max-w-xl">
                        <UploadComponent ref={uploadRef} isLoading={false} />
                    </div>
                </div>
   
            </Carousel> */}
        </div>
    );

};

export default UsersTable;

