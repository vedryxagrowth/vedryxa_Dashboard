"use client"
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Col, Card, Drawer, Dropdown, Flex, Input, Row, Select, Spin, Menu, Space, Modal, message, Switch, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined, CloseOutlined, SwapRightOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";
import CreateCampaignDrawer from './camp-components/create_camapaign';
import ViewDrawer from './camp-components/view-campaign';
import axios from 'axios';
import EditCampaignDrawer from './camp-components/edit-campaign';
import { useTokenContext } from '../components/parent';
import Adsets from './camp-components/Adsets';
import Editcampaign from './camp-components/EditCampaign';
import Editcam from './camp-components/EditCampaign';
import DuplicateCampaignDrawer from './camp-components/Dupcampaign';
import { redirect } from 'next/navigation';

const App = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [paginationSize, setPaginationSize] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [cdrawerVisible, setDrawerVisible] = useState(false);
    const [dupdrawerVisible, setdupDrawerVisible] = useState(false);
    const [campaignData, setCampaignData] = useState([]);
    const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [viewEditDrawerVisible, setViewEditDrawerVisible] = useState(false);
    const [selectedEditRowData, setSelectedEditRowData] = useState(null);
    const [EditcamapaignDrawerVisible, setEditcamapaignDrawerVisible] = useState(false);
    const [selectedEditCampaign, setselectedEditCampaign] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adsetsdrawerVisible, setadsetsDrawerVisible] = useState(false);
    const [adsetcampaigndata, setadsetcampaigndata] = useState(null)
    const [duplicatenewcampaigns, setduplicatenewcampaigns] = useState(null)
    const [refrst, setRefrst] = useState(false)
    const { userdetails } = useTokenContext();
    console.log("useTokenContext", userdetails)
    const [options, setOptions] = useState([]);
    const [createcamselectedacc, setcreatecamselectedacc] = useState("");
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [valueOptions, setValueOptions] = useState([]);
    const [error, setError] = useState(null);
    if (userdetails === null) {
        redirect("/Dashboard");
        // console.log("hi");
    }
    // const [selectedAccount, setSelectedAccount] = useState('All');


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
        console.log(record, "viewdata campaign")
        setSelectedRowData(record);
        setViewDrawerVisible(true);
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
            }));
            setValueOptions(accountNumbers);  // Update valueOptions with account numbers
        } else {
            setValueOptions([]);
        }
    }, [selectedKey, userdetails]);

    // Fetch campaign data based on selected value
    const fetchData = async (accountNumber = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}`, {
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
            console.error("Error fetching campaign list:", error);
            setError("Failed to fetch campaign data.");
        } finally {
            setLoading(false);
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
                body: JSON.stringify({ Approval: newApprovalValue }),
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
    // const onToggleStatus = async (record, checked) => {
    //     console.log(record, campaignData, "all datata")
    //     try {
    //         const token = localStorage.getItem("token");
    //         console.log('Token:', token);

    //         const response = await fetch(`https://www.testapi.adsgoat.in/api/status/${record?.identifier}`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': token,
    //             },
    //             body: JSON.stringify({ Status: checked ? 'ACTIVE' : 'PAUSED' }),
    //         });

    //         const responseData = await response.json();
    //         console.log('Response status:', response.status);
    //         console.log('Response data:', responseData);

    //         if (response.ok) {
    //             message.success("Status updated successfully");

    //             // Update the state to reflect the change in UI
    //             setCampaignData(prevCampaigns =>
    //                 prevCampaigns.map(campaign =>
    //                     campaign.identifier === record.identifier
    //                         ? { ...campaign, Status: checked ? 'ACTIVE' : 'PAUSED' }
    //                         : campaign
    //                 )
    //             );
    //         } else {
    //             console.error('Failed to update status:', responseData);
    //             message.error(`Failed to update status: ${responseData.message || 'Unknown error'}`);
    //         }
    //     } catch (error) {
    //         console.error('Error updating status:', error);
    //         message.error("Error updating status");
    //     }
    // };



    // const EditableField = ({ value, record, dataIndex, updateTableRow }) => {
    //     const [editing, setEditing] = useState(false);
    //     const [inputValue, setInputValue] = useState(value);

    //     const handleInputChange = (e) => {
    //         setInputValue(e.target.value);
    //     };

    //     const handleEdit = () => {
    //         setEditing(true);
    //     };
    //     const handleSave = async () => {
    //         if (record && inputValue) {
    //             try {
    //                 const budgets = inputValue * 100; // Convert input value to the required format

    //                 const response = await fetch(`https://www.testapi.adsgoat.in/api/dailyBudget/${record?.identifier}`, {
    //                     method: 'PUT',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'Authorization': localStorage.getItem("token"),
    //                     },
    //                     body: JSON.stringify({ Daily_amount: budgets }),
    //                 });

    //                 if (response.ok) {
    //                     console.log("Daily amount updated successfully");

    //                     // Update the table row data with the new daily amount
    //                     updateTableRow({ ...record, Daily_amount: budgets });

    //                     message.success("Daily amount updated successfully");

    //                     changeRRefrst()
    //                 } else {
    //                     console.error("Failed to update daily amount");
    //                     message.error("Failed to update daily amount");
    //                 }
    //             } catch (error) {
    //                 console.error("Error updating daily amount:", error);
    //                 message.error("Error updating daily amount");
    //             }
    //         }

    //         setEditing(false);
    //     };

    //     return (
    //         <div>
    //             {editing ? (
    //                 <Input
    //                     value={inputValue}
    //                     onChange={handleInputChange}
    //                     onPressEnter={handleSave}
    //                     onBlur={handleSave}
    //                     autoFocus
    //                 />
    //             ) : (
    //                 <div onClick={handleEdit}>
    //                     {value}
    //                     <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} />
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };
    const updateTablebudget = (updatedRecord) => {
        setCampaignData(prevCampaigns =>
            prevCampaigns.map(campaign =>
                campaign.identifier === updatedRecord.identifier
                    ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
                    : campaign
            )
        );
    };

    // const updateTablebudget = (updatedRecord) => {
    //     // Find the index of the updated record in the campaignList
    //     const updatedIndex = campaignData.findIndex(
    //         (item) => item.identifier === updatedRecord.identifier
    //     );

    //     // If the updated record is found, update it in the campaignList
    //     if (updatedIndex !== -1) {
    //         setCampaignData((prevCampaigns) => [
    //             ...prevCampaigns.slice(0, updatedIndex),
    //             updatedRecord,
    //             ...prevCampaigns.slice(updatedIndex + 1),
    //         ]);
    //     }
    // };
    const duplicatenewcampaign = (record) => {
        console.log(record, "duplicate camapaign")
        setDrawerVisible(true);
        setdupDrawerVisible(true)
        setduplicatenewcampaigns(record)
    }
    const columns = [
        {
            title: '',
            dataIndex: 'fbstatus',
            key: 'fbstatus',
            width: '3%',
            align: 'center',
            render: (text, record) => (
                <>
                    {record.fbstatus === 'Live' ? (
                        <Tag color="green-inverse"> + </Tag>
                    ) : (
                        <Tag color="red-inverse"> - </Tag>
                    )}
                </>
            ),
        },
        {
            title: "Campaign Name",
            dataIndex: "campaign_name",
            key: "campaign_name",
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
                    <span style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e6f7ff', marginLeft: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tooltip title="Clone">
                            <CopyOutlined style={{ color: 'red' }} onClick={() => duplicatenewcampaign(record)} />
                        </Tooltip>
                    </span>
                </div>
            ),
        },

        {
            title: "Account Number",
            dataIndex: "Account_Number",
            key: "Account_Number",
            width: "12%",
            align: "center",

        },
        {
            title: "Platform",
            dataIndex: "Platform",
            key: "Platform",
            width: "8%",
            align: "center",
        },
        {
            title: "createdby",
            dataIndex: "createdby",
            key: "createdby",
            width: "12%",
        },
        {
            title: "Daily Amount",
            dataIndex: "Daily_amount",
            width: "5%",
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
            width: "11%",
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
            title: "Approval",
            dataIndex: "Approval",
            key: "Approval",
            width: "10%",
            align: "center",
            render: (text) => {
                let color;
                if (text === "PENDING_APPROVAL") {
                    color = "red";
                } else if (text === "Approved") {
                    color = "green";
                } else {
                    color = "black"; // Set default color or handle other cases
                }
                return <span style={{ color }}>{text}</span>;
            },
        },
        {
            title: 'Action',
            dataIndex: 'Action',
            // width: "50%",
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => handleViewClick(record)}>View</Button>
                    {record.Approval === 'PENDING_APPROVAL' && (
                        <Button type="primary" onClick={() => handleApproval(record)}>Approve</Button>
                    )}
                    {record.Approval === 'Approved' && (
                        <Tag color="green">APPROVED</Tag>
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
            ),
        }
    ];

    return (
        <div>
            <CreateCampaignDrawer visible={cdrawerVisible} accountis={createcamselectedacc} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} />

            <DuplicateCampaignDrawer visible={dupdrawerVisible} onClose={onCloseDrawer} selectedRow={duplicatenewcampaigns} changeRRefrst={changeRRefrst} />
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
            {/* <Editcam
                rowData={selectedEditCampaign}
                visible={EditcamapaignDrawerVisible}
                onClose={() => setEditcamapaignDrawerVisible(false)}
            /> */}
            <Card title="Campaigns" size="small">
                <Row justify="space-between" align="middle">
                    <Col span={3}>
                        <Select
                            placeholder="Select Key"
                            style={{ width: '100%' }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                        >
                            {options.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    {/* <button onClick={changeRRefrst}>Test Refresh</button> */}
                    <Col span={4}>
                        <Select
                            placeholder="Select Value"
                            style={{ width: '100%' }}
                            onChange={handleValueChange}
                            disabled={!selectedKey}
                            value={selectedValue}
                        >
                            {valueOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>

                        <Input
                            placeholder="Search..."
                            suffix={<SearchOutlined />}
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </Col>
                    <Col>
                        <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
                            Create Campaign
                        </Button>
                    </Col>

                </Row>
            </Card>


            <Table
                style={{ marginTop: "1%" }}
                rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
                columns={columns}
                dataSource={searchInput ? filteredData.map((item, index) => ({ ...item, key: index })).reverse() : campaignData.map((item, index) => ({ ...item, key: index })).reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{ y: 'calc(80vh - 200px)' }}
            />

            <Drawer
                title={adsetcampaigndata?.campaign_name || ''}
                placement="right"
                onClose={onCloseDrawer}
                open={adsetsdrawerVisible}
                width="90%" // Adjust width as needed
            >
                <Adsets selectedRow={adsetcampaigndata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} />
            </Drawer>
            {/* <Drawer
                title={adsetcampaigndata?.campaign_name || ''}
                placement="right"
                onClose={onCloseDrawer}
                open={EditcamapaignDrawerVisible}
                width="90%" // Adjust width as needed
            >
                <Editcam selectedRow={selectedEditCampaign} onClose={onCloseDrawer} />
            </Drawer> */}
        </div>

    )

};
export default App;

