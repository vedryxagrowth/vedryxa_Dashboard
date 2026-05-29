"use client"
import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, Popover, Tooltip } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';
import { FaTrashCan } from 'react-icons/fa6';

const Createnewuser = ({ visible, onClose, refreshUsers, AccountsData }) => {
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
    // console.log(userdetails);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: {},
    });
    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    const [availableNetworks, setAvailableNetworks] = useState([]);
    const [allApiAccounts, setAllApiAccounts] = useState([]);


    const [form] = Form.useForm();

    var token = localStorage.getItem("token");

    // const availableNetworks = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic1", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !selectedNetworks.includes(network));
    const handleAddAccount = () => {
        if (availableNetworks?.length > 0 && (availableNetworks?.length !== additionalAccounts?.length)) {
            setAdditionalAccounts([...additionalAccounts, { network: '', inputs: [''] }]);

        }
    };
    useEffect(() => {
        const fetchAllAccounts = async () => {
            try {
                const res = await apiClient.get(
                    "/userrole/accounts",
                    { headers: { Authorization: token } }
                );
                setAllApiAccounts(res.data || []);
            } catch (err) {
                console.error("API accounts fetch failed:", err);
            }
        };

        fetchAllAccounts();
    }, []);
    const getAccountsForNetwork = (network) => {
        if (!network) return [];

        const local = AccountsData
            ?.filter(item => String(item.Network).trim() === network.trim())
            .map(item => String(item.accountNumber).trim());

        const api = allApiAccounts
            ?.filter(item => String(item.Network).trim() === network.trim())
            .map(item => String(item.accountNumber).trim());

        return Array.from(new Set([...(local || []), ...(api || [])]));
    };

    const handleRemoveAccount = (index) => {
        const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
        setAdditionalAccounts(updatedAccounts);
        setSelectedNetworks(updatedAccounts.map(account => account.network));
    };

    const handleNetworkChange = (index, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[index].network = value;
        setAdditionalAccounts(updatedAccounts);
        setSelectedNetworks(updatedAccounts.map(account => account.network));
    };

    const handleInputChange = (accountIndex, inputIndex, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs[inputIndex] = value;
        setAdditionalAccounts(updatedAccounts);
    };

    const handleRemoveInput = (accountIndex, inputIndex) => {
        const updatedAccounts = [...additionalAccounts];

        updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
        const indexes = updatedAccounts[accountIndex].inputs.length;
        if (indexes === 0) {
            handleRemoveAccount(accountIndex);
        }
        setAdditionalAccounts(updatedAccounts);
    };

    const handleAddInput = (accountIndex) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs.push('');
        setAdditionalAccounts(updatedAccounts);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    };

    // useEffect(() => {
    //     fetch("http://localhost:8000/networks", {
    //         headers: {
    //             Authorization: token
    //         }
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setAvailableNetworks(Array.isArray(data) ? data : []);
    //         })
    //         .catch((err) => console.error("Error fetching networks:", err));
    // }, []);

    useEffect(() => {
        if (userdetails?.role !== "Special_User") {
            const fetchNetworks = async () => {
                try {
                    const res = await apiClient.get("/userrole/networks");
                    setAvailableNetworks(Array.isArray(res.data) ? [...new Set(res.data.map(item => item.Network?.trim()).filter(Boolean))] : []);
                } catch (err) {
                    console.error("Error fetching networks:", err);
                }
            };

            fetchNetworks()
        } else {
            const networks = []
            for (const [network, value] of Object.entries(userdetails?.adAccounts)) {
                networks.push(network)
            }
            setAvailableNetworks(networks);
        }
    }, [visible]);
    const validateAllAccountsBeforeSubmit = async () => {
        for (const acc of additionalAccounts) {
            if (!acc.network?.trim()) {
                message.open({
                    type: 'error',
                    content: `Please select a network for all accounts`,
                    className: theme === 'dark' ? 'dark-message' : '',
                });
                return false;
            }

            const selectedNetwork = acc.network.trim();
            const seen = new Set();

            for (const id of acc.inputs) {
                const accountNumber = id?.trim();
                if (!accountNumber) {
                    message.open({
                        type: 'error',
                        content: `Account ID cannot be empty`,
                        className: theme === 'dark' ? 'dark-message' : '',
                    });
                    return false;
                }
                if (seen.has(accountNumber)) {
                    message.open({
                        type: 'error',
                        content: `Account ${accountNumber} is added more than once in ${selectedNetwork}`,
                        className: theme === 'dark' ? 'dark-message' : '',
                    });
                    return false;
                }
                seen.add(accountNumber);
                if (accountNumber.toLowerCase() === "all") continue;
                const localMatch = AccountsData?.find(
                    item => String(item.accountNumber).trim() === accountNumber
                );

                if (localMatch) {
                    const localNetwork = String(localMatch.Network).trim();

                    if (localNetwork !== selectedNetwork) {
                        message.open({
                            type: 'error',
                            content: `Account ${accountNumber} already exists in network ${localNetwork}`,
                            className: theme === 'dark' ? 'dark-message' : '',
                        });
                        return false;
                    }

                    continue;
                }

                let apiList = [];
                try {
                    const res = await apiClient.get("/userrole/accounts", {
                        headers: { Authorization: token }
                    });
                    apiList = res.data || [];
                } catch (err) {
                    message.open({
                        type: 'error',
                        content: `Error validating account. Please try again.`,
                        className: theme === 'dark' ? 'dark-message' : '',
                    });
                    return false;
                }

                const apiMatch = apiList.find(
                    item => String(item.accountNumber).trim() === accountNumber
                );

                if (apiMatch) {
                    const apiNetwork = String(apiMatch.Network).trim();

                    if (apiNetwork === selectedNetwork) {
                        message.open({
                            type: 'error',
                            content: `Account ${accountNumber} exists in this network but you don't have access.`,
                            className: theme === 'dark' ? 'dark-message' : '',
                        });

                        return false;
                    } else {
                        message.open({
                            type: 'error',
                            content: `Account ${accountNumber} exists in network ${apiNetwork}. You do not have access.`,
                            className: theme === 'dark' ? 'dark-message' : '',
                        });

                        return false;
                    }
                }
                message.open({
                    type: 'error',
                    content: `Account ${accountNumber} does NOT exist in any network. Please add.`,
                    className: theme === 'dark' ? 'dark-message' : '',
                });
                return false;
            }
        }

        return true;
    };
    const rolevalid = (selectedRole) => {
        if (selectedRole !== "Admin" && additionalAccounts.length === 0) {

            message.open({
                type: 'error',
                content: `Please select at least one project`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
            return false;
        }
        return true;
    };
    const checkEmailExists = async (email) => {
        try {
            const res = await apiClient.patch("/userrole/users", { email });
            return res.data.exists;
        } catch (e) {
            return false;
        }
    }
    const submitForm = async (values) => {
        values.userName = values.userName?.trim();
        values.email = values.email?.trim();
        values.role = values.role?.trim();

        const cleanedAccounts = additionalAccounts.map(acc => ({
            network: acc.network?.trim(),
            inputs: acc.inputs.map(i => i.trim())
        }));

        const isValid = await validateAllAccountsBeforeSubmit();
        const isValidRole = rolevalid(values.role);

        if (!isValid) return;
        if (!isValidRole) return;

        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to create new user?',
            className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
            onOk: async () => {
                try {
                    let data = {};
                    if (values.role !== "Revenue_Partner") {
                        additionalAccounts.map((each) => {
                            data[each.network] = each.inputs;
                        });
                    }
                    else {
                        additionalAccounts.map((each) => {
                            data[each.network.split("_")[1]] = each.inputs;
                        });
                    }

                    const formattedData = {
                        ...values,
                        adAccounts: additionalAccounts.length > 0 ? data : [],
                    };

                    const response = await apiClient.post('/userrole/users', { formattedData });

                    if (response.status === 200 || response.status === 201) {
                        // Display success message
                        message.open({
                            type: 'success',
                            content: `User created successfully`,
                            className: theme === 'dark' ? 'dark-message' : '',
                        })
                        refreshUsers();
                        setIsModalVisible(false); // Close modal after success

                        form.resetFields();
                        setAdditionalAccounts([]); // Clear dynamic accounts
                        setSelectedNetworks([]);

                        onClose("email"); // Close drawer
                    } else {
                        console.error('Failed to create user');
                        // Handle error, show error message
                    }
                } catch (error) {
                    console.error('Error creating user:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    };


    return (
        <Drawer
            title="Create a new user"
            width="40%"
            open={visible} // Change visible to open
            onClose={onClose}
            closeIcon={<CloseOutlined />}
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={submitForm}
                className={theme === 'dark' ? 'form-dark' : 'form-light'}
            >
                <Form.Item
                    label="User Name"
                    name="userName"
                    rules={[
                        { required: true, message: "Please input the UserName!" },

                    ]}
                >
                    <Input autoComplete="off" placeholder='Enter User Name' className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    validateTrigger="onSubmit"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },

                        {
                            validator: async (_, value) => {
                                if (!value) return Promise.resolve();

                                const exists = await checkEmailExists(value.trim());
                                if (exists) {
                                    return Promise.reject("This email already exists");
                                }

                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input autoComplete="off" placeholder='Enter User Email' className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: 'Please select the role!',
                        },
                    ]}
                >
                    <Select
                        placeholder="Select a role"
                        className={theme === 'dark' ? 'custom-select-dark' : ''}
                        // style={{
                        //     backgroundColor: theme === 'dark' && '#333', // Background color
                        //     color: theme === 'dark' && '#fff',
                        // }}
                        // dropdownClassName={theme === 'dark' && "custom-dropdown"}
                        // dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                        classNames={{
                            popup: {
                                root: theme === 'dark' ? 'custom-dropdown' : ''
                            }
                        }}
                    >
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        {userdetails.role !== "Special_User" && (
                            <Select.Option value="Network_Partner">Network_Partner</Select.Option>
                        )}
                        {userdetails.role !== "Special_User" && (
                            <Select.Option value="Revenue_Partner">Revenue_Partner</Select.Option>
                        )}
                        {userdetails.role !== "Special_User" && (
                            <Select.Option value="Admin">Admin</Select.Option>
                        )}
                        {userdetails.role !== "Special_User" && (
                            <Select.Option value="Manager">Manager</Select.Option>
                        )}
                    </Select>
                </Form.Item>

                <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        <div>
                            {additionalAccounts.map((account, accountIndex) => (
                                <div key={accountIndex}>
                                    <div className='add-accounts' style={{ display: 'flex', width: "100%" }}>
                                        <Select
                                            placeholder="Select a network"
                                            className='add-accounts-select-network'
                                            style={{
                                                backgroundColor: theme === 'dark' && '#333', // Background color
                                                color: theme === 'dark' && '#fff',
                                                width: '160px',
                                                paddingRight: '8px',
                                            }}
                                            // dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            classNames={{
                                                popup: {
                                                    root: theme === 'dark' ? 'custom-dropdown' : ''
                                                }
                                            }}
                                            value={account.network}
                                            onChange={(value) => handleNetworkChange(accountIndex, value)}
                                        >
                                            {availableNetworks
                                                // 👇 Filter so that only unselected networks OR the current one is visible
                                                .filter(network =>
                                                    !selectedNetworks.includes(network) || network === account.network
                                                )
                                                .map((network) => (
                                                    <Select.Option key={network} value={network}>
                                                        {network}
                                                    </Select.Option>
                                                ))}
                                        </Select>
                                        <div className='add-account-container' style={{ width: '100%', padding: '0px', margin: '0px' }}>
                                            {account.inputs.map((input, inputIndex) => (
                                                <div key={inputIndex} className='add-account-container-input'>
                                                    <Popover
                                                        placement="right"
                                                        title={
                                                            <div
                                                                style={{
                                                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                                                    background: theme === "dark" ? "#1f1f1f" : "#ffffff",
                                                                }}
                                                            >
                                                                Accounts in {account.network}
                                                            </div>
                                                        }
                                                        styles={{
                                                            body: {background: theme === "dark" ? "#1f1f1f" : "#ffffff",
                                                            color: theme === "dark" ? "#ffffff" : "#000000",
                                                            border: theme === "dark" ? "1px solid #444" : "1px solid #ddd",
                                                            }
                                                        }}
                                                        content={
                                                            <div style={{ maxHeight: 200, overflowY: "auto", color: theme === "dark" ? "#ffffff" : "#000000" }}>
                                                                {getAccountsForNetwork(account.network).map(acc => (
                                                                    <div key={acc}>{acc}</div>
                                                                ))}
                                                            </div>
                                                        }
                                                    >
                                                        <Input
                                                            value={input}
                                                            onChange={(e) => handleInputChange(accountIndex, inputIndex, e.target.value)}
                                                            placeholder="Enter Account ID"
                                                            style={{ width: '100%', marginRight: '8px', height: '32px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                        />
                                                    </Popover>
                                                    {account.inputs.length === 1 && inputIndex === 0 && (
                                                        <Button
                                                            type="text"
                                                            onClick={() => handleRemoveAccount(accountIndex)}
                                                            icon={<FaTrashCan color="#EC7117" />}
                                                        >

                                                        </Button>
                                                    )}
                                                    {account.inputs.length > 1 && inputIndex !== 0 && (
                                                        <DeleteOutlined
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                                        />
                                                    )}
                                                    {/* {inputIndex === account.inputs.length - 1 && (
                                                        <PlusOutlined
                                                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                            onClick={() => handleAddInput(accountIndex)}
                                                        />
                                                    )} */}
                                                    {inputIndex === account.inputs.length - 1 && (
                                                        input?.trim().toLowerCase() === "all" ? (
                                                            <Tooltip title="'All' includes every account. You cannot add another Account ID" 
                                                            styles={{
                                                                body: {backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                                                color: theme === 'dark' ? '#fff' : '#000',
                                                                }
                                                            }}>
                                                                <InfoCircleOutlined
                                                                    style={{ color: "#1890ff", marginLeft: "8px", fontSize: "16px" }}
                                                                />
                                                            </Tooltip>
                                                        ) : (
                                                            <PlusOutlined
                                                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                                onClick={() => handleAddInput(accountIndex)}
                                                            />
                                                        )
                                                    )}

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="dashed" style={{ border: 'none', backgroundColor: '#91C25F', color: 'black', fontWeight: '600' }} onClick={handleAddAccount} icon={<PlusOutlined className="black-icon" />}>
                            Add Project
                        </Button>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button style={{ border: 'none', backgroundColor: '#91C25F', color: 'black', fontWeight: '600' }} htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="Confirmation"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="ok" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                <p>Are you sure you want to submit?</p>
            </Modal>
        </Drawer>
    );
};

export default Createnewuser;








