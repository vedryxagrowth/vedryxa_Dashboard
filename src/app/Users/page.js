"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Col, Card, Input, Row, Select, Result, Spin, Space, Modal, message } from 'antd';
import { HighlightOutlined, LeftOutlined, RightOutlined, SearchOutlined, SwapRightOutlined } from "@ant-design/icons";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Createnewuser from './users-components/create-newuser';
import Newaddaccounts from './users-components/add-newaccount';
import Edituseraccess from './users-components/edit-usersaccess';

const UsersTable = () => {
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
    const [usersaccessData, setusersaccessData] = useState(null);
    var token = localStorage.getItem("token")
    useEffect(() => {
        fetchusersData();
        fetchAccountsData();
    }, []);
    const handleDelete = async (values) => {
        console.log(values, "Delete");

        try {
            // Check if values.email exists
            const url = values.email ? `https://www.testapi.adsgoat.in/api/users/${values.email}` : '';

            if (url) {
                // Show modal confirmation
                Modal.confirm({
                    title: 'Confirm',
                    content: 'Are you sure you want to remove access?',
                    onOk: async () => {
                        try {
                            const response = await fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: token
                                }
                            });

                            if (response.ok) {
                                console.log('User deleted successfully');
                                message.success(`${values.userName} User access removed successfully`);
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


    const fetchusersData = async () => {
        try {
            const response = await axios.get('https://www.testapi.adsgoat.in/api/getusersData');
            if (response.status === 200) {
                setUsersData(response.data);
                console.log(response.data, "users")
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
            const response = await axios.get('https://www.testapi.adsgoat.in/api/getAccountsData', {
                headers: {
                    Authorization: token
                }
            });
            if (response.status === 200) {
                setAccountsData(response.data);
                console.log(response.data, "accounts data")
            } else {
                console.error('Failed to fetch users data');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    const Accountscolumn = [
        {
            title: 'External Account ID',
            dataIndex: 'extAccountId',
            key: 'extAccountId',
        },
        {
            title: 'Time Zone',
            dataIndex: 'timeZone',
            key: 'timeZone',
        },
        {
            title: 'External Partner',
            dataIndex: 'extPartner',
            key: 'extPartner',
        },
        {
            title: 'Revenue Partner',
            dataIndex: 'revenuePartner',
            key: 'revenuePartner',
        },
        {
            title: 'Media Buyer Name',
            dataIndex: 'mediaBuyerName',
            key: 'mediaBuyerName',
        },
        // {
        //     title: 'Status',
        //     dataIndex: 'status',
        //     key: 'status',
        // },

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

        {
            title: 'Agency ID',
            dataIndex: 'agencyId',
            key: 'agencyId',
        },
        {
            title: 'Agency Name',
            dataIndex: 'agencyName',
            key: 'agencyName',
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
            render: adAccounts => (
                <Select
                    defaultValue={adAccounts.length > 0 ? adAccounts[0] : ""} // Set the default value of the dropdown
                    style={{ width: 200 }}
                >
                    {adAccounts.length > 0 ? (
                        adAccounts.map((account, index) => (
                            <Select.Option key={index} value={account}>
                                {account}
                            </Select.Option>
                        ))
                    ) : (
                        <Select.Option key="empty" value="">
                            No accounts available
                        </Select.Option>
                    )}
                </Select>
            ),

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
        setSearchInput(searchValue);
        const accfiltered = AccountsData.filter((item) =>
            Object.values(item).some((field) =>
                typeof field === 'string' && field.toLowerCase().includes(searchValue)
            )
        );
        setaccFilteredData(accfiltered);
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

    const shownewuserdrawar = () => {
        setDrawerVisible(true)
    }
    const shownnewaccountdrawar = () => {
        setaccountDrawerVisible(true)
    }
    const handleEdit = (values) => {
        setusersaccessDrawerVisible(true)
        setusersaccessData(values)
        console.log(values, "Edit")
    }
    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setaccountDrawerVisible(false)
        setusersaccessDrawerVisible(false)

    };



    return (
        <>
            <Createnewuser visible={drawerVisible} onClose={onCloseDrawer} />
            <Newaddaccounts visible={accountDrawerVisible} onClose={onCloseDrawer} />
            <Edituseraccess editeddata={usersaccessData} visible={usersaccessDrawerVisible} onClose={onCloseDrawer} />

            <Carousel showThumbs={false}>
                <div>
                    <Card title="Users Access" size="small">
                        <Row align={"bottom"}>
                            <Col span={16}>
                                <Row gutter={10}>
                                    <Col span={12}>
                                        <SwapRightOutlined />
                                        <Input
                                            placeholder="Search..."
                                            variant="filled"
                                            suffix={<SearchOutlined />}
                                            value={searchInput}
                                            onChange={handleSearchChange}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <span style={{ color: "#B4B4B4" }}>Status</span>
                                        <Select
                                            defaultValue="All"
                                            variant="filled"
                                            style={{ width: "100%" }}
                                            items={[
                                                { value: "jack", label: "Jack" },
                                                { value: "All", label: "All" },
                                                { value: "Yiminghe", label: "yiminghe" },
                                                { value: "disabled", label: "Disabled", disabled: true },
                                            ]}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <span style={{ color: "#B4B4B4" }}>Category</span>
                                        <Select
                                            defaultValue="All"
                                            variant="filled"
                                            style={{ width: "100%" }}
                                            items={[
                                                { value: "jack", label: "Jack" },
                                                { value: "All", label: "All" },
                                                { value: "Yiminghe", label: "yiminghe" },
                                                { value: "disabled", label: "Disabled", disabled: true },
                                            ]}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" style={{ float: "right", marginLeft: "5%" }} onClick={shownnewaccountdrawar}>
                                    Add New Account
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
                            dataSource={searchInput ? filteredData.map((item, index) => ({ ...item, key: index })) : usersData.map((item, index) => ({ ...item, key: index }))}
                            columns={columns}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(80vh - 200px)' }}
                        />
                    ) : (
                        <Result
                            status="404"
                            title="No Users Data Avilable"
                            // subTitle="Sorry,This page contains no data."
                            extra={<Button type="primary" onClick={shownewuserdrawar}>
                                Create User
                            </Button>}
                        />
                    )}
                </div>
                <div>
                    <Card title="All accounts" size="small">
                        <Row align={"bottom"}>
                            <Col span={16}>
                                <Row gutter={10}>
                                    <Col span={12}>
                                        <HighlightOutlined />
                                        <SwapRightOutlined />
                                        <Input
                                            placeholder="Search..."
                                            variant="filled"
                                            suffix={<SearchOutlined />}
                                            value={searchInput}
                                            onChange={handleaccountSearchChange}
                                        />
                                    </Col>
                                    {/* <Col span={6}>
                                        <span style={{ color: "#B4B4B4" }}>Status</span>
                                        <Select
                                            defaultValue="All"
                                            variant="filled"
                                            style={{ width: "100%" }}
                                            items={[
                                                { value: "jack", label: "Jack" },
                                                { value: "All", label: "All" },
                                                { value: "Yiminghe", label: "yiminghe" },
                                                { value: "disabled", label: "Disabled", disabled: true },
                                            ]}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <span style={{ color: "#B4B4B4" }}>Category</span>
                                        <Select
                                            defaultValue="All"
                                            variant="filled"
                                            style={{ width: "100%" }}
                                            items={[
                                                { value: "jack", label: "Jack" },
                                                { value: "All", label: "All" },
                                                { value: "Yiminghe", label: "yiminghe" },
                                                { value: "disabled", label: "Disabled", disabled: true },
                                            ]}
                                        />
                                    </Col> */}
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" style={{ float: "right", marginLeft: "5%" }} onClick={shownnewaccountdrawar}>
                                    Add New Account
                                </Button>
                                <Button type="primary" style={{ float: "right" }} onClick={shownewuserdrawar}>
                                    Create User
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    {loading ? (
                        <Spin />
                    ) : AccountsData.length > 0 ? (
                        <Table
                            bordered
                            dataSource={searchInput ? accFilteredData.map((item, index) => ({ ...item, key: index })) : AccountsData.map((item, index) => ({ ...item, key: index }))}
                            columns={Accountscolumn}
                            pagination={{ pageSize: paginationSize }}
                            scroll={{ y: 'calc(70vh - 200px)' }}
                        />
                    ) : (
                        <Result
                            status="404"
                            title="No Accounts Data Avilable"
                            subTitle="Sorry,This page contains no data."
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
