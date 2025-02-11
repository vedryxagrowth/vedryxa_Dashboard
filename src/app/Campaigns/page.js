"use client"
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Col, Card, Drawer, Dropdown, Flex, Input, Row, Select, Spin, Menu, Space, Modal, message, Switch, Tooltip, ConfigProvider } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined, CloseOutlined, SwapRightOutlined, PlusOutlined, CopyOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, ReloadOutlined, LinkOutlined } from "@ant-design/icons";
import CreateCampaignDrawer from './camp-components/create_camapaign';
import ViewDrawer from './camp-components/view-campaign';
// import EditOnlyCampaignDrawer from './camp-components/EditCamp';
import EditCampaignDrawer1 from './camp-components/EditCamp';
import axios from 'axios';
import EditCampaignDrawer from './camp-components/edit-campaign';
import { useTokenContext } from '../components/parent';
import Adsets from './camp-components/Adsets';
import Editcampaign from './camp-components/EditCampaign';
import Editcam from './camp-components/EditCampaign';
import DuplicateCampaignDrawer from './camp-components/Dupcampaign';
import { redirect } from 'next/navigation';
import ExpandedRowContent from './camp-components/expandcreatives';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
// import { redirect } from 'next/navigation';

const App = () => {
    const { userdetails } = useTokenContext();
    console.log("useTokenContext", userdetails)

    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Flex align="center" gap="middle">
                {/* <Spin size="small" />
                <Spin /> */}
                <Spin size="large" />
            </Flex>
        </div>;
    }
    if(userdetails?.role === "Revenue_Partner"){
        redirect("/Dashboard");
    }

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [paginationSize, setPaginationSize] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [cdrawerVisible, setDrawerVisible] = useState(false);
    const [dupdrawerVisible, setdupDrawerVisible] = useState(false);
    const [campaignData, setCampaignData] = useState([]);
    const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
    const [editOnlyDrawerVisible, setEditOnlyDrawerVisible] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [selectedOnlyEditData, setSelectedOnlyEditData] = useState(null);
    const [viewEditDrawerVisible, setViewEditDrawerVisible] = useState(false);
    const [selectedEditRowData, setSelectedEditRowData] = useState(null);
    const [EditcamapaignDrawerVisible, setEditcamapaignDrawerVisible] = useState(false);
    const [selectedEditCampaign, setselectedEditCampaign] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adsetsdrawerVisible, setadsetsDrawerVisible] = useState(false);
    const [adsetcampaigndata, setadsetcampaigndata] = useState(null)
    const [duplicatenewcampaigns, setduplicatenewcampaigns] = useState(null)
    const [refrst, setRefrst] = useState(false)
    const [options, setOptions] = useState([]);
    const [createcamselectedacc, setcreatecamselectedacc] = useState("");
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [valueOptions, setValueOptions] = useState([]);
    const [error, setError] = useState(false);
    const { theme } = useTokenContext();
    const [isOpen, setIsOpen] = useState(false); // State to track if dropdown is open
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const [startDate, setStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);

    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    console.log(selectedKey, "selectedKeyselectedKeyselectedKey")


    // const [selectedAccount, setSelectedAccount] = useState('All');
    const restrictedEmails = [
        "creatives@adsgoat.in",
        "mnetadmin@winkleads.com",
        "creativeteam@winkleads.com",
        "shravan.k@winkleads.com",
        "abhynay.k@winkleads.com",
    ];

    const rangePresets = [
        {
            label: 'Today',
            value: [dayjs(), dayjs()],
        },
        {
            label: 'Yesterday',
            value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
        },
        {
            label: 'Last 7 Days',
            value: [dayjs().subtract(7, 'day'), dayjs()],
        },
        {
            label: 'Last 14 Days',
            value: [dayjs().subtract(14, 'day'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().subtract(30, 'day'), dayjs()],
        },
        {
            label: 'Last 60 Days',
            value: [dayjs().subtract(60, 'day'), dayjs()],
        },
        {
            label: 'Last 90 Days',
            value: [dayjs().subtract(90, 'day'), dayjs()],
        },
        {
            label: 'This Month',
            value: [dayjs().startOf('month'), dayjs()],
        },
        {
            label: 'Last Month',
            value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
        },
    ];

    // Function to disable future dates
    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };



    // Function to handle click on campaign name
    const handleCampaignNameClick = (record) => {
        setadsetcampaigndata(record)
        console.log(record, "adsets data")
        setadsetsDrawerVisible(true);
    };

    const changeRRefrst = () => {
        // alert("hey rerendering")
        setRefrst((els) => !els)
    }

    // console.log("localStorage", localStorage.getItem("token"))
    // var token = localStorage.getItem("token");

    const handleViewClick = (record) => {
        console.log(record, "viewdata campaign");
        setSelectedRowData(record);
        setViewDrawerVisible(true);
    };

    const handleEditOnlyClick = (record) => {
        console.log(record, "viewdata campaign")
        setSelectedOnlyEditData(record);
        setEditOnlyDrawerVisible(true);
    };
    // const handleEditClick = (record) => {
    //     console.log(record, "Editdata")
    //     setSelectedEditRowData(record);
    //     setViewEditDrawerVisible(true);
    // };
    // const handleEditcampaign = (record) => {
    //     console.log(record, "Editcamapaign")
    //     setselectedEditCampaign(record);
    //     setEditcamapaignDrawerVisible(true);
    // }


    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setadsetsDrawerVisible(false);
        setEditcamapaignDrawerVisible(false)
        setdupDrawerVisible(false)
    };

    useEffect(() => {
        if (userdetails?.adAccounts) {
            const adAccountOptions = Object.keys(userdetails?.adAccounts).map(key => ({
                value: key,
                label: key
            }));
            setOptions(adAccountOptions);
        }
    }, []);

    // Populate value options in the second dropdown based on selected key
    // useEffect(() => {
    //     if (userdetails) {
    //         const values = userdetails?.adAccounts[selectedKey] || [];
    //         setValueOptions(values.map(value => ({
    //             value,
    //             label: value
    //         })));
    //     } else {
    //         setValueOptions([]);
    //     }
    // }, [selectedKey]);
    useEffect(() => {
        if (selectedKey && userdetails?.adAccounts) {
            // Mapping over the accounts based on the selected key
            const accountNumbers = userdetails.adAccounts[selectedKey]?.map(account => ({
                value: account.accountNumber,  // Set value as accountNumber
                label: account.accountNumber,  // Set label as accountNumber
                accountName: account.accountName,     // Include accountName for conditional rendering
                status: account.status
            }));
            setValueOptions(accountNumbers);  // Update valueOptions with account numbers
        } else {
            setValueOptions([]);
        }
    }, [selectedKey, userdetails]);

    // Fetch campaign data based on selected value
    // const fetchData = async (accountNumber = null) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const response = await axios.get(`https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}`, {
    //             headers: {
    //                 'Authorization': localStorage.getItem("token"),
    //             }
    //         });
    //         const allCampaigns = response?.data;

    //         // Filter campaigns based on selected value && accountNumber !== 'All'
    //         const filteredCampaignData = accountNumber
    //             ? allCampaigns.filter(campaign => campaign.Account_Number === accountNumber)
    //             : allCampaigns.filter(campaign => userdetails?.adAccounts[selectedKey]?.includes(campaign.Account_Number));

    //         setcreatecamselectedacc(accountNumber)

    //         setCampaignData(filteredCampaignData);
    //     } catch (error) {
    //         console.error("Error fetching campaign list:", error);
    //         setError("Failed to fetch campaign data.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const fetchData = async (accountNumber = null, start = startDate, end = endDate) => {
        setLoading(true);
        setError(null);
        try {
            // Construct URL with optional startDate and endDate
            let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
            if (start && end) {
                url += `&startDate=${start}&endDate=${end}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': localStorage.getItem("token"),
                }
            });
            const allCampaigns = response?.data;

            // Filter campaigns based on selected value && accountNumber !== 'All'
            const filteredCampaignData = accountNumber
                ? allCampaigns.filter(campaign => campaign.Account_Number === accountNumber)
                : allCampaigns.filter(campaign => userdetails?.adAccounts[selectedKey]?.includes(campaign.Account_Number));

            setcreatecamselectedacc(accountNumber)

            setCampaignData(filteredCampaignData);
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            setError("Failed to fetch campaign data.");
        } finally {
            setLoading(false);
        }
    };

    // Handle date range change
    const handleChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            const formattedStart = start.format('YYYY-MM-DD');
            const formattedEnd = end.format('YYYY-MM-DD');

            setStartDate(formattedStart);
            setEndDate(formattedEnd);

            if (selectedValue) {
                fetchData(selectedValue, formattedStart, formattedEnd);
            }
        }
    };
    // Handle key change
    const handleKeyChange = (key) => {
        setSelectedKey(key);
        setSelectedValue(null); // Reset value selection
        // Update value options based on selected key
    };

    // Handle value change
    const handleValueChange = (value) => {
        setSelectedValue(value);
        fetchData(value); // Fetch data based on selected value
    };

    useEffect(() => {
        if (selectedValue) {
            fetchData(selectedValue);
        }
    }, [refrst, selectedValue]);
    const handleRefresh = () => {
        if (selectedValue) {
            fetchData(selectedValue);
        } // This will re-fetch the data or update the component
    };
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

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchInput(searchValue);
        const filtered = campaignData.filter((item) =>
            Object.values(item).some((field) =>
                typeof field === 'string' && field.toLowerCase().includes(searchValue)
            )
        );
        setFilteredData(filtered);
    };
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [useaproval, setuseraproval] = useState(null)

    const handleUpdateApproval = async (id, newApprovalValue) => {
        try {
            const response = await fetch(`https://www.testapi.adsgoat.in/api/updateApproval/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    Approval: newApprovalValue,   // New approval value
                    Approved: userdetails?.userName,  // Username of the person who approved it
                    datetime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm [IST]') // Current datetime in IST
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCampaignData(prevData =>
                    prevData.map(record =>
                        record.identifier === id ? { ...record, Approval: newApprovalValue } : record
                    )
                );

                message.success("Approval confirmed");
                setIsModalVisible(false); // Close modal after updating
                changeRRefrst();
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2000);
            } else {
                console.error('Failed to update approval');
                // Handle failure
            }
        } catch (error) {
            console.error('Error updating approval:', error);
            // Handle error
        }
    };

    const handleApproval = (record) => {
        console.log(record, "record")
        setuseraproval(record)
        setIsModalVisible(true);
    };

    const handleOk = async () => {

        try {
            // Call the handleUpdateApproval function with the appropriate parameters
            await handleUpdateApproval(useaproval.identifier, "Approved");
            // Log the message to the console
            console.log('Approval confirmed');
            // Close the modal
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error updating approval:', error);
            // Handle error
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onToggleStatus = async (record, checked) => {
        try {
            const token = localStorage.getItem("token");
            console.log('Token:', token);

            // Update status on your backend
            const backendResponse = await fetch(`https://www.testapi.adsgoat.in/api/status/${record?.identifier}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ Status: checked ? 'ACTIVE' : 'PAUSED' }),
            });

            const responseData = await backendResponse.json();
            setCampaignData(prevCampaigns =>
                prevCampaigns.map(campaign =>
                    campaign.identifier === record.identifier
                        ? { ...campaign, Status: checked ? 'ACTIVE' : 'PAUSED' }
                        : campaign
                )
            );
            console.log('Backend response status:', backendResponse.status);
            console.log('Backend response data:', responseData);

            if (backendResponse.ok) {
                // If campaignId is available, update the Facebook campaign status
                if (record.campaignid) {

                    try {
                        const fbResponse = await axios.post(
                            `https://graph.facebook.com/v20.0/${record.campaignid}`,
                            null,
                            {
                                params: {
                                    status: checked ? 'ACTIVE' : 'PAUSED',
                                    access_token: record.access_token,
                                },
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            }
                        );

                        console.log('Facebook API response:', fbResponse.data);

                        if (fbResponse.status === 200) {
                            message.success("Status updated successfully");

                            // Update the state to reflect the change in UI
                            setCampaignData(prevCampaigns =>
                                prevCampaigns.map(campaign =>
                                    campaign.identifier === record.identifier
                                        ? { ...campaign, Status: checked ? 'ACTIVE' : 'PAUSED' }
                                        : campaign
                                )
                            );
                        } else {
                            console.error('Failed to update Facebook status:', fbResponse.data);
                            message.error(`Failed to update Facebook status: ${fbResponse.data.error.message}`);
                        }
                    } catch (fbError) {
                        console.error('Error updating Facebook status:', fbError);
                        message.error(`Error updating Facebook status: ${fbError.response?.data?.error?.message || fbError.message}`);
                    }
                } else {
                    // If no campaignId is available, only update the backend
                    message.success("Status updated successfully on backend");

                    // Update the state to reflect the change in UI
                    setCampaignData(prevCampaigns =>
                        prevCampaigns.map(campaign =>
                            campaign.identifier === record.identifier
                                ? { ...campaign, Status: checked ? 'ACTIVE' : 'PAUSED' }
                                : campaign
                        )
                    );
                }
            } else {
                console.error('Failed to update backend status:', responseData);
                message.error(`Failed to update status: ${responseData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            message.error("Error updating status");
        }
    };
    const EditableField = ({ value, record, dataIndex, updateTableRow, changeRRefrst }) => {
        const [editing, setEditing] = useState(false);
        const [inputValue, setInputValue] = useState(value);

        const handleInputChange = (e) => {
            setInputValue(e.target.value);
        };

        const handleEdit = () => {
            setEditing(true);
        };

        const handleSave = async () => {
            if (record && inputValue) {
                try {
                    const budgets = inputValue * 100; // Convert input value to the required format (cents)

                    // Step 1: Update the daily budget in your backend
                    const response = await fetch(`https://www.testapi.adsgoat.in/api/dailyBudget/${record?.identifier}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("token"),
                        },
                        body: JSON.stringify({ Daily_amount: budgets }),
                    });

                    if (response.ok) {
                        console.log("Daily amount updated successfully in backend");

                        // Step 2: If campaignId is available, update the budget on Facebook
                        if (record.campaignid) {
                            try {
                                const fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/${record.campaignid}`,
                                    null,
                                    {
                                        params: {
                                            daily_budget: budgets,
                                            access_token: record.access_token,
                                        },
                                        headers: {
                                            'Content-Type': 'application/json',
                                        }
                                    }
                                );

                                if (fbResponse.status === 200) {
                                    console.log("Daily budget updated successfully on Facebook");
                                    message.success("Daily amount updated successfully on both backend and Facebook");

                                    // Update the table row data with the new daily amount
                                    updateTableRow({ ...record, Daily_amount: budgets });

                                    // Trigger a refresh or any other necessary updates
                                    changeRRefrst();
                                } else {
                                    console.error("Failed to update daily amount on Facebook");
                                    // message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
                                }
                            } catch (fbError) {
                                console.error("Error updating daily amount on Facebook:", fbError);
                                // message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
                            }
                        } else {
                            // If no campaignId, just update the backend
                            message.success("Daily amount updated successfully");

                            // Update the table row data with the new daily amount
                            updateTableRow({ ...record, Daily_amount: budgets });

                            // Trigger a refresh or any other necessary updates
                            changeRRefrst();
                        }
                    } else {
                        console.error("Failed to update daily amount in backend");
                        message.error("Failed to update daily amount in backend");
                    }
                } catch (error) {
                    console.error("Error updating daily amount:", error);
                    message.error("Error updating daily amount");
                }
            }

            setEditing(false);
        };

        return (
            <div>
                {editing ? (
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        onPressEnter={handleSave}
                        onBlur={handleSave}
                        autoFocus
                    />
                ) : (
                    value !== 0 && value !== '' && (
                        <div onClick={handleEdit}>
                            {value}
                            <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} />
                        </div>
                    )
                )}
            </div>

        );
    };

    const updateTablebudget = (updatedRecord) => {
        setCampaignData(prevCampaigns =>
            prevCampaigns.map(campaign =>
                campaign.identifier === updatedRecord.identifier
                    ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
                    : campaign
            )
        );
    };


    const duplicatenewcampaign = (record) => {
        console.log(record, "duplicate camapaign")
        setDrawerVisible(true);
        setdupDrawerVisible(true)
        setduplicatenewcampaigns(record)

    }
    const newtworkCollections = {
        "FB_Mnet": "Facebook_Mnet",
        "FB_MnetBing": "Facebook_MnetBing",
        "FB_Enki": "Facebook_Enki",
        "FB_System1": 'Facebook_System1',
        "FB_Rsoc": 'Facebook_Rsoc',
        "FB_Tonic": 'Facebook_Tonic',
        "FB_DomainActive": "Facebook_DomainActive",
        "FB_Bodies": "Facebook_Bodies",
        "FB_Bodies1": "Facebook_Bodies1",
        "Newsbreak_DA": "Newsbreak_DomainActive"
    }
    const columns = [
        // {
        //     title: '',
        //     dataIndex: 'fbstatus',
        //     key: 'fbstatus',
        //     width: '5%',  // Adjust width
        //     align: 'center',
        //     render: (text, record) => (
        //         <>
        //             {record.fbstatus === 'Live' ? (
        //                 <CheckCircleFilled style={{ color: 'green' }} />
        //             ) : (
        //                 <CloseCircleFilled style={{ color: 'red' }} />
        //             )}
        //         </>
        //     ),
        // },
        {
            title: 'status',
            dataIndex: 'fbstatus',
            key: 'fbstatus',
            width: '5%',  // Adjust width
            align: 'center',
            render: (text, record) => (
                <>
                    {/* Display green check or red close icon based on fbstatus */}
                    {record.fbstatus === 'Live' ? (
                        <CheckCircleFilled style={{ color: 'green' }} />
                    ) : (
                        <CloseCircleFilled style={{ color: 'red' }} />
                    )}

                    {/* Display link icon if reports field is true */}
                    {record.reports === true && (
                        <LinkOutlined
                            style={{ color: 'blue', marginLeft: '8px', cursor: 'pointer' }}
                            onClick={() =>
                                window.open(
                                    `/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
                                    '_blank', // Opens in a new tab
                                    'noopener,noreferrer' // Security and performance considerations
                                )
                            }
                        />
                    )}
                </>
            ),
        },

        {
            title: "Campaign Name",
            dataIndex: "campaign_name",
            key: "campaign_name",
            width: '20%', // Adjust width
            align: 'left',  // Left align to keep names readable
            render: (text, record) => (

                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
                    {!restrictedEmails.includes(userdetails.email) && (
                        <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            // backgroundColor: '#e6f7ff',
                            backgroundColor: theme === "dark" ? "#333" : "white",
                            marginLeft: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Tooltip title="Clone">
                                <CopyOutlined style={{ color: 'red' }} onClick={() => duplicatenewcampaign(record)} />
                            </Tooltip>
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: "Account Number & Creatives Status",
            dataIndex: "Account_Number",
            key: "Account_Number",
            width: '15%',  // Adjust width
            align: 'center',  // Center align since it's numeric
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Account Number */}
                    <div>{record.Account_Number}</div>

                    {/* Approved, Rejected, Pending - stacked vertically */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                        {/* Approved */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
                            <Tooltip title="Approved">
                                <span style={{ color: 'green', fontWeight: 'bold' }}>{record.approvedCount}</span>
                            </Tooltip>
                        </div>

                        {/* Rejected */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
                            <Tooltip title="Rejected">
                                <span style={{ color: 'red', fontWeight: 'bold' }}>{record.rejectedCount}</span>
                            </Tooltip>
                        </div>

                        {/* Pending */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Tooltip title="Pending">
                                <span className="blinking" style={{ color: 'orange', fontWeight: 'bold' }}>{record.pendingCount}</span>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Created Date",
            dataIndex: "createdDate",
            key: "createdDate",
            width: '10%',  // Adjust width
            align: 'center',
        },

        {
            title: "Created By",
            dataIndex: "createdby",
            key: "createdby",
            width: '12%',  // Adjust width
            align: 'center',
        },
        {
            title: "Daily Amount",
            dataIndex: "Daily_amount",
            key: "Daily_amount",
            width: '10%',  // Adjust width
            align: 'center',
            render: (Daily_amount, record) => (
                <>
                    {loading ? (
                        <Spin />
                    ) : (
                        record?.Daily_amount !== undefined && (
                            <EditableField
                                value={record.Daily_amount / 100}
                                record={record}
                                dataIndex="Daily_amount"
                                updateTableRow={updateTablebudget}
                            />
                        )
                    )}
                </>
            ),
        },
        {
            title: "Status",
            dataIndex: "Status",
            key: "Status",
            width: '10%',
            align: "center",
            render: (text, record) => (
                <Switch
                    checked={record.Status === 'ACTIVE'}
                    onChange={(checked) => onToggleStatus(record, checked)}
                    checkedChildren="ACTIVE"
                    unCheckedChildren="PAUSED"
                />
            )
        },
        {
            title: "Approval status",
            dataIndex: "Approval",
            key: "Approval",
            width: '10%',
            align: 'center',
            render: (text, record) => {
                console.log(record, "recordeddata")
                let color = 'black';
                if (text === "PENDING_APPROVAL") {
                    color = 'red';
                } else if (text === "Approved") {
                    color = 'green';
                }

                // Accessing the Approved by field from the record
                const approvedBy = record?.Approvedby || "N/A"; // Replace 'Approved' with actual field name if needed

                return (
                    <div>
                        <span style={{ color }}>{`${text} By`}</span>
                        {text === "Approved" && (
                            <>
                                <br />
                                <small style={{ color: 'gray' }}> {approvedBy}</small>
                            </>
                        )}
                    </div>
                );
            },
        },

        // {
        //     title: "Approval status",
        //     dataIndex: "Approval",
        //     key: "Approval",
        //     width: '10%',
        //     align: 'center',
        //     render: (text) => {
        //         let color = 'black';
        //         if (text === "PENDING_APPROVAL") {
        //             color = 'red';
        //         } else if (text === "Approved") {
        //             color = 'green';
        //         }
        //         return <span style={{ color }}>{text}</span>;
        //     },
        // },
        {
            title: 'Action',
            dataIndex: 'Action',
            align: "center",
            render: (_, record) => {
                // console.log('Record in Action column:', record);
                // console.log('fbstatus:', record.fbstatus);

                if (record.Approval === 'Approved') {
                    return (
                        <Button icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
                    )
                } 
                // if (record.fbstatus === 'Live'){
                //     return (
                //         <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button> 
                //     )
                // }

                return (
                    <Space size="middle">
                        <Button icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
                        {record.Approval === 'PENDING_APPROVAL' && (
                            <Button type="primary" onClick={() => handleApproval(record)}>Approve</Button>
                        )}
                        {record.fbstatus !== 'Live' && (
                            <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button> 
                        )}
                        <Modal
                            title="Confirm Approval"
                            visible={isModalVisible}
                            onOk={handleOk}
                            onCancel={handleCancel}
                        >
                            <p>Are you sure you want to approve?</p>
                        </Modal>
                    </Space>
                );
            }
        }

    ];
    console.log(selectedKey);
    const totalDailySpend = (searchInput ? filteredData : campaignData).reduce((sum, record) => {
        return sum + (record.Daily_amount || 0);
    }, 0) / 100;  // Assuming Daily_amount is in cents

    return (
        <div>
            <CreateCampaignDrawer visible={cdrawerVisible} accountis={createcamselectedacc} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} network={selectedKey} />

            <DuplicateCampaignDrawer visible={dupdrawerVisible} onClose={onCloseDrawer} selectedRow={duplicatenewcampaigns} changeRRefrst={changeRRefrst} network={selectedKey} />
            <ViewDrawer
                rowData={selectedRowData}
                visible={viewDrawerVisible}
                changeRRefrst={changeRRefrst}
                onClose={() => setViewDrawerVisible(false)}
            />
            <EditCampaignDrawer
                rowData={selectedEditRowData}
                visible={viewEditDrawerVisible}
                changeRRefrst={changeRRefrst}
                onClose={() => setViewEditDrawerVisible(false)}
            />
             <EditCampaignDrawer1
                rowData={selectedOnlyEditData}
                visible={editOnlyDrawerVisible}
                changeRRefrst={changeRRefrst}
                onClose={() => setEditOnlyDrawerVisible(false)}
            />
            {/* <Editcam
                rowData={selectedEditCampaign}
                visible={EditcamapaignDrawerVisible}
                onClose={() => setEditcamapaignDrawerVisible(false)}
            /> */}
            <Card title="Campaigns" size="small">
                <Row justify="start" align="middle" gutter={[16, 16]}>
                    <Col span={3}>
                        <Select
                            showSearch
                            placeholder="Select Network"
                            style={{ width: '100%' }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                        >
                            {options.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    {/* <Col span={4}>

                        <Select
                            showSearch
                            placeholder="Select Account"
                            style={{ width: '100%' }}
                            onChange={handleValueChange}
                            disabled={!selectedKey}
                            value={selectedValue}
                            optionFilterProp="children" // Use this to filter on the option label
                            filterOption={(input, option) => {
                                // Only allow numbers as input and filter options by their value
                                return /^[0-9]*$/.test(input) && option?.value.toString().includes(input);
                            }}
                        >
                            {valueOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col> */}
                    <Col span={4}>
                        <Select
                            showSearch
                            placeholder="Select Account"
                            style={{ width: '100%' }}
                            onChange={handleValueChange}
                            disabled={!selectedKey}
                            value={selectedValue}
                            optionFilterProp="children"
                            filterOption={(input, option) => /^[0-9]*$/.test(input) && option?.value.toString().includes(input)}
                            onDropdownVisibleChange={(open) => setIsOpen(open)} // Track dropdown visibility
                        >
                            {valueOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '5px 0',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            maxWidth: '70%'
                                        }}>
                                            <p style={{
                                                margin: '0px',
                                                fontWeight: 'bold',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {option.label}
                                            </p>
                                            {isOpen && (
                                                <p style={{
                                                    margin: '0px',
                                                    fontSize: '12px',
                                                    color: 'gray',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {option.accountName || ''}
                                                </p>
                                            )}
                                        </div>
                                        <span style={{ marginLeft: '10px', flexShrink: 0 }}>
                                            {option.status === "Active" ? (
                                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px' }} />
                                            ) : (
                                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px' }} />
                                            )}
                                        </span>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>

                    <Col span={5}>
                        <ConfigProvider>
                            <RangePicker
                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={[dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')]}
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                            />
                        </ConfigProvider>
                    </Col>

                    <Col span={3}>

                        <Input
                            placeholder="Search..."
                            suffix={<SearchOutlined />}
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </Col>
                    {!restrictedEmails.includes(userdetails.email) && (
                        <Col>
                            <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                                Create Campaign
                            </Button>
                        </Col>
                    )}
                    <Button type="primary" onClick={handleRefresh} icon={<ReloadOutlined />}>
                    </Button>
                    <Col span={4}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            Total Daily Spend: ${totalDailySpend.toFixed(2)}
                        </span>
                    </Col>

                </Row>
            </Card>
            <Table
                style={{ width: "100%" }}  // Ensures table takes full available width
                columns={columns}
                dataSource={
                    searchInput
                        ? filteredData.map((item, index) => ({ ...item, key: index })).reverse()
                        : campaignData.map((item, index) => ({ ...item, key: index })).reverse()
                }
                pagination={{ pageSize: paginationSize }}
                scroll={{
                    x: 'max-content',  // Enable horizontal scroll if needed
                    y: 'calc(87vh - 200px)',  // Vertical scroll for overflow
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <ExpandedRowContent
                            record={record}
                            changeRRefrst={changeRRefrst} // Ensure this prop is passed
                        />
                    ),
                    rowExpandable: (record) => !!record,
                }}
                summary={() => {
                    const dataSource = searchInput ? filteredData : campaignData;

                    // Calculate total daily budget
                    const totalDailyBudget = dataSource.reduce((sum, record) => {
                        return sum + (record.Daily_amount || 0);
                    }, 0);

                    return (
                        <Table.Summary.Row >
                            <Table.Summary.Cell colSpan={columns.length - 2} align="right">
                                <strong>Total Daily Budget: ${(totalDailyBudget / 100).toFixed(2)}</strong>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}
            />


            {!restrictedEmails.includes(userdetails.email) && (
                <Drawer
                    title={adsetcampaigndata?.campaign_name || ''}
                    placement="right"
                    onClose={onCloseDrawer}
                    open={adsetsdrawerVisible}
                    width="90%" // Adjust width as needed
                >
                    <Adsets selectedRow={adsetcampaigndata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} network={selectedKey} />
                </Drawer>
            )}


            {/* <Drawer
                title={adsetcampaigndata?.campaign_name || ''}
                placement="right"
                onClose={onCloseDrawer}
                open={adsetsdrawerVisible}
                width="90%" // Adjust width as needed
            >
                <Adsets selectedRow={adsetcampaigndata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} />
            </Drawer> */}

        </div>

    )

};
export default App;

