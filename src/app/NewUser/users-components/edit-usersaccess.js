"use client"
import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Add } from '@mui/icons-material';
import { useTokenContext } from '../../components/parent';

const Edituseraccesses = ({ editeddata, visible, onClose, AccountsData }) => {
    // console.log(editeddata, "heyy edit-useraccess page")
    console.log(editeddata, "editeddata");
    const userAccess = editeddata?.adAccounts;
    // console.log(userAccess, "adAccounts");
    userAccess !== null && userAccess !== undefined ? Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })) : [];
    // console.log(userAccessresult, "userAccessResult");
    let userName;
    if (editeddata !== null) {
        userName = editeddata.userName;
    }
    // console.log(userName, "userName");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme, userdetails } = useTokenContext();
    const [availableNetworks, setAvailableNetworks] = useState([]);


    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: [],
    });
    // const userAccessData =  [{network: "Mnet", inputs: ['123456789', '987654321']}, {network: "Enki", inputs: ['123456789', '987654321']}];

    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [formAccounts, setFormAccounts] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    const [editeddatas, setEditeddatas] = useState(null);
    var token = localStorage.getItem("token")
    const [form] = Form.useForm();
    useEffect(() => {
        if (userAccess !== null && userAccess !== undefined) {
            setAdditionalAccounts(Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })))
        }
        else {
            setAdditionalAccounts([])
        }
    }, [userAccess]);
    // const submitForm = async (values) => {
    //     try {
    //         const allAccounts = [
    //             ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
    //             ...additionalAccounts
    //         ];

    //         const formattedData = {
    //             ...values,
    //             adAccounts: allAccounts,
    //         };

    //         const response = await axios.put(`https://www.testapi.adsgoat.in/api/users/${editeddata && editeddata.email}`, formattedData);

    //         if (response.status === 200) {
    //             console.log('User created successfully');
    //             message.success("User created successfully"); // Display success message
    //             setIsModalVisible(false); // Close modal after success
    //             onClose(); // Close drawer
    //         } else {
    //             console.error('Failed to create user');
    //             // Handle error, show error message
    //         }
    //     } catch (error) {
    //         console.error('Error creating user:', error);
    //     }
    // };

    let AddAccounts;

    useEffect(() => {
        updateSelectedNetworks([...additionalAccounts, ...formAccounts]);
    }, [additionalAccounts, formAccounts]);

    const handleAddAccount = () => {
        console.log(AddAccounts, "AddAccounts");
        console.log(selectedNetworks);
        console.log(additionalAccounts);
        if (selectedNetworks?.length !== availableNetworks?.length) {
            // additionalAccounts
            const newAccount = { network: '', inputs: [''] };
            // setFormAccounts(prevFormAccounts => [...prevFormAccounts, newAccount]);
            setAdditionalAccounts(prevAdditionalAccounts => [...prevAdditionalAccounts, newAccount]);
        }
    };

    const handleRemoveAccount = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
            onOk: () => {
                try {
                    const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setAdditionalAccounts(updatedAccounts);
                    updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        // const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
        // setAdditionalAccounts(updatedAccounts);
        // updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    };

    const handleRemoveAccount1 = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
            onOk: () => {
                try {
                    const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setFormAccounts(updatedFormAccounts);
                    updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        // const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
        // setFormAccounts(updatedFormAccounts);
        // updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
    };

    const handleNetworkChange = (index, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[index].network = value;
        setAdditionalAccounts(updatedAccounts);
        updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    };

    const handleNetworkChange1 = (index, value) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[index].network = value;
        setFormAccounts(updatedAccounts);
        updateSelectedNetworks([...updatedAccounts, ...additionalAccounts]);
    };

    const handleInputChange = (accountIndex, inputIndex, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs[inputIndex] = value;
        setAdditionalAccounts(updatedAccounts);
    };

    const handleInputChange1 = (accountIndex, inputIndex, value) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs[inputIndex] = value;
        setFormAccounts(updatedAccounts);
    };

    const handleRemoveInput = (accountIndex, inputIndex) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Account?',
            className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
            onOk: () => {
                try {
                    const updatedAccounts = [...additionalAccounts];
                    updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
                    setAdditionalAccounts(updatedAccounts);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    };

    const handleRemoveInput1 = (accountIndex, inputIndex) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
        setFormAccounts(updatedAccounts);
    };

    const handleAddInput = (accountIndex) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs.push('');
        setAdditionalAccounts(updatedAccounts);
    };

    const handleAddInput1 = (accountIndex) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs.push('');
        setFormAccounts(updatedAccounts);
    };

    const updateSelectedNetworks = (allAccounts) => {
        setSelectedNetworks(allAccounts.map(account => account.network).filter(network => network !== ''));
    };

    // const getAvailableNetworks = (currentNetwork = '') => {
    //     const allSelectedNetworks = selectedNetworks.filter(network => network !== currentNetwork);

    //     const data = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !allSelectedNetworks.includes(network));
    //     // setNetworks(data);
    //     AddAccounts = data;
    //     return data;
    // };

    // useEffect(() => {
    //     fetch("http://localhost:8000/networks", { headers: { Authorization: token } })
    //         .then((res) => res.json())
    //         .then((data) => {
    //         const networks = Array.isArray(data) ? data : [];
    //         const filteredNetworks = networks.filter(n => !selectedNetworks.includes(n));
    //         setAvailableNetworks(filteredNetworks);
    //         })
    //         .catch((err) => console.error("Error fetching networks:", err));
    // }, [selectedNetworks, token]);

    useEffect(() => {
        if (userdetails?.role !== "Special_User") {
            const fetchNetworks = async () => {
                try {
                    const res = await axios.get("https://prodapis.adsgoat.in/networks", {
                        headers: {
                            Authorization: token,
                        },
                    });

                    const networks = Array.isArray(res.data) ? res.data : [];
                    const filteredNetworks = networks.filter(
                        (n) => !selectedNetworks.includes(n)
                    );

                    setAvailableNetworks(filteredNetworks);
                } catch (err) {
                    console.error("Error fetching networks:", err);
                }
            };

            fetchNetworks();
        } else {
            const networks = []
            for (const [network, value] of Object.entries(userdetails?.adAccounts)) {
                networks.push(network)
            }
            setAvailableNetworks(networks);
        }
    }, [visible]);


    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // const handleAddAccount = () => {
    //     setAdditionalAccounts([...additionalAccounts, '']);
    // };

    // const handleRemoveAccount = (index) => {
    //     const newAccounts = [...additionalAccounts];
    //     newAccounts.splice(index, 1);
    //     setAdditionalAccounts(newAccounts);
    // };
    const validateAllAccountsBeforeSubmit = async () => {
        for (const acc of additionalAccounts) {

            if (!acc.network) {
                message.error("Please select a network for all accounts");
                return false;
            }

            const selectedNetwork = acc.network.trim();

            for (const id of acc.inputs) {
                const accountNumber = id?.trim();

                if (!accountNumber) {
                    message.error("Account ID cannot be empty");
                    return false;
                }

                if (accountNumber.toLowerCase() === "all") continue;



                const localMatch = AccountsData.find(
                    item => String(item.accountNumber).trim() === accountNumber
                );

                if (localMatch) {
                    const localNetwork = String(localMatch.Network).trim();

                    if (localNetwork === selectedNetwork) {

                        continue;
                    } else {

                        message.error(
                            `Account ${accountNumber} is present in network ${localNetwork}. Please check.`
                        );
                        return false;
                    }
                }



                let apiList = [];
                try {
                    const res = await axios.get("https://prodapis.adsgoat.in/allaccounts", {
                        headers: { Authorization: token }
                    });
                    apiList = res.data || [];
                } catch (err) {
                    console.error("API validation failed:", err);
                    message.error("Error validating account. Please try again.");
                    return false;
                }

                const apiMatch = apiList.find(
                    item => String(item.accountNumber).trim() === accountNumber
                );

                if (apiMatch) {
                    const apiNetwork = String(apiMatch.Network).trim();

                    if (apiNetwork === selectedNetwork) {

                        message.error(
                            `Account ${accountNumber} exists in this network but you don't have access.`
                        );
                        return false;
                    } else {

                        message.error(
                            `Account ${accountNumber} exists in network ${apiNetwork}. You do not have access.`
                        );
                        return false;
                    }
                }



                message.error(
                    `Account ${accountNumber} does NOT exist in any network. Please add.`
                );
                return false;
            }
        }

        return true;
    };
    const submitForm = async (values) => {
        const isValid = await validateAllAccountsBeforeSubmit();
        if (!isValid) return;
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to submit?',
            className: theme === 'dark' ? 'custom-confirm-dark' : 'custom-confirm-light',
            onOk: async () => {
                try {
                    // const allAccounts = [
                    //     ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
                    //     ...additionalAccounts
                    // ];
                    const singleObject = additionalAccounts.reduce((acc, obj) => {
                        const key = obj[Object.keys(obj)[0]];
                        const value = Object.keys(obj)[1];
                        // console.log() // Get the key from the current object
                        // console.log(obj, "obj")
                        acc[key] = obj[value]; // Assign the value to the accumulated object using the key
                        return acc;
                    }, {});

                    const formattedData = {
                        ...values, adAccounts: singleObject
                    };
                    // console.log(formattedData);
                    // console.log(additionalAccounts, "additionalAccounts data");
                    // console.log(singleObject, ":singleObject");

                    const response = await axios.put(`https://prodapis.adsgoat.in/api/updateUserTableData/`, { formattedData },
                        {
                            headers: {
                                'Authorization': token
                            }
                        });

                    if (response.status === 200) {
                        message.success("User Edits updated successfully"); // Display success message

                        // Pass the updated user data back to the parent to update the table
                        const updatedUserData = { ...editeddata, ...formattedData };

                        // Call onClose and pass the updated data to the parent
                        onClose(updatedUserData);

                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 1500);

                        setIsModalVisible(false);
                    }
                    else {
                        console.error('Failed to update user');
                        // Handle error, show error message
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    };


    // const handleRemoveAccount = (index, type) => {
    //     if (type === 'existing') {
    //         // Logic to remove existing account from editeddata
    //         const newEditedData = { ...editeddata };
    //         newEditedData.adAccounts.splice(index, 1);
    //         setEditeddatas(newEditedData);
    //     } else {
    //         // Logic to remove additional account
    //         const newAccounts = [...additionalAccounts];
    //         newAccounts.splice(index, 1);
    //         setAdditionalAccounts(newAccounts);
    //     }
    // };


    const handleOk = () => {
        setIsModalVisible(false);
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    };
    const initialValues = editeddata ? {
        userName: editeddata.userName,
        email: editeddata.email,
        role: editeddata.role,
        adAccounts: editeddata.adAccounts
        // Add other fields with their initial values here
    } : null;


    // console.log(initialValues, "initialValues")
    return (
        <Drawer
            title={`Edit the user ${userName}`}
            width="50%"
            open={visible} // Change visible to open
            onClose={onClose}
            closeIcon={<CloseOutlined />}
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={submitForm}
                initialValues={initialValues}
                key={initialValues?.userName}
                className={theme === 'dark' ? 'form-dark' : 'form-light'}
            >
                <Form.Item
                    label="UserName"
                    name="userName"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the username!',
                        },
                    ]}
                >
                    <Input disabled className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <Input disabled className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
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
                        className={theme === 'dark' ? 'custom-select-dark' : ''}
                        style={{
                            width: '100%',
                            backgroundColor: theme === 'dark' && '#333', // Background color
                            color: theme === 'dark' && '#fff',
                        }}
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                    >
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        {userdetails.role !== "Special_User" && (
                            <Select.Option value="Network_Partner">Network_Partner</Select.Option>
                        )}
                        {userdetails?.role !== "Special_User" && (
                            <Select.Option value="Admin">Admin</Select.Option>
                        )}
                        {userdetails?.role !== "Special_User" && (
                            <Select.Option value="Manager">Manager</Select.Option>
                        )}
                    </Select>
                </Form.Item>
                {/* <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        {(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []).map((account, index) => (
                            <div key={index}>
                                <Input
                                    value={account}
                                    readOnly // Ensure the input is read-only to display existing accounts
                                    placeholder="Existing ad account"
                                />
                                <Button type="default" onClick={() => handleRemoveAccount(index)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {additionalAccounts.map((account, index) => (
                            <div key={index}>
                                <Input
                                    value={account}
                                    onChange={(e) => {
                                        const newAccounts = [...additionalAccounts];
                                        newAccounts[index] = e.target.value;
                                        setAdditionalAccounts(newAccounts);
                                    }}
                                    placeholder="Enter ad account"
                                />
                                <Button type="default" onClick={() => handleRemoveAccount(index)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="dashed" onClick={handleAddAccount} icon={<PlusOutlined />}>
                            Add Account
                        </Button>
                    </div>
                </Form.Item> */}
                {additionalAccounts?.map((account, accountIndex) => (
                    <div key={accountIndex}>
                        <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                            <Select
                                placeholder="Select a network"
                                style={{
                                    width: '145px', height: '30px', marginRight: '8px',
                                    backgroundColor: theme === 'dark' && '#333', // Background color
                                    color: theme === 'dark' && '#fff',
                                }}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                value={account.network}
                                onChange={(value) => handleNetworkChange(accountIndex, value)}
                            >
                                {/* {availableNetworks.map((network) => (
                                    <Select.Option key={network} value={network}>
                                        {network}
                                    </Select.Option>
                                ))} */}
                                {availableNetworks
                                    .filter(
                                        (network) =>
                                            !selectedNetworks.includes(network) || network === account.network
                                    )
                                    .map((network) => (
                                        <Select.Option key={network} value={network}>
                                            {network}
                                        </Select.Option>
                                    ))}
                            </Select>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    marginTop: '0px',
                                    paddingTop: '0px',
                                }}
                            >
                                {account.inputs.map((input, inputIndex) => (
                                    <div
                                        key={inputIndex}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            width: '100%',
                                            height: '30px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Input
                                            value={input}
                                            onChange={(e) =>
                                                handleInputChange(accountIndex, inputIndex, e.target.value)
                                            }
                                            placeholder="Enter Account ID"
                                            style={{ width: '100%', marginRight: '8px', height: '32px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />

                                        {/* Show DeleteOutlined only if there is more than one input */}
                                        {account.inputs.length > 1 && inputIndex !== 0 && (
                                            <DeleteOutlined
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                            />
                                        )}

                                        {/* Show Remove button only if there is exactly one input */}
                                        {account.inputs.length === 1 && inputIndex === 0 && (
                                            <Button
                                                style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                                type="default"
                                                onClick={() => handleRemoveAccount(accountIndex)}
                                            >
                                                Remove
                                            </Button>
                                        )}

                                        {/* Show PlusOutlined only for the last input */}
                                        {inputIndex === account.inputs.length - 1 && (
                                            <PlusOutlined
                                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                onClick={() => handleAddInput(accountIndex)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>


                        </div>

                    </div>
                ))}

                {/* <Form.Item name="adAccounts">
                    <div>
                        {formAccounts.map((account, accountIndex) => (
                            <div key={accountIndex}>
                                <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                                    <Select
                                        placeholder="Select a network"
                                        style={{
                                            width: '120px', marginRight: '8px',
                                            backgroundColor: theme === 'dark' && '#333', 
                                            color: theme === 'dark' && '#fff',
                                        }}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        value={account.network}
                                        onChange={(value) => handleNetworkChange1(accountIndex, value)}
                                    >
                                        {availableNetworks.map((network) => (
                                            <Select.Option key={network} value={network}>
                                                {network}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        {account.inputs.map((input, inputIndex) => (
                                            <div key={inputIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                                                <Input
                                                    value={input}
                                                    onChange={(e) => handleInputChange1(accountIndex, inputIndex, e.target.value)}
                                                    placeholder="Enter Account ID"
                                                    style={{ width: '100%', marginRight: '8px', height: '32px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                />
                                                {inputIndex !== 0 && (
                                                    <DeleteOutlined
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                                    />
                                                )}
                                                <PlusOutlined
                                                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                    onClick={() => handleAddInput1(accountIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                    type="default"
                                    onClick={() => handleRemoveAccount1(accountIndex)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="dashed" style={{ border: 'none', backgroundColor: '#91C25F', color: 'black', fontWeight: '600' }} onClick={handleAddAccount} icon={<span style={{ color: theme === 'dark' ? 'white' : 'black' }}> 
                        <PlusOutlined className="black-icon" />
                    </span>}>
                        Add Project
                    </Button>
                </Form.Item> */}
                <Form.List name="adAccounts">
                    {(projectFields) => (
                        <div>
                            {projectFields.map((projField, projIndex) => (
                                <div
                                    key={projField.key}
                                    style={{
                                        marginBottom: 12,
                                        borderBottom: "1px dashed #eee",
                                        paddingBottom: 12,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        {/* Network Select */}
                                        <Form.Item
                                            name={[projField.name, "network"]}
                                            fieldKey={[projField.fieldKey, "network"]}
                                            rules={[{ required: true, message: "Select network" }]}
                                            style={{ margin: 0, minWidth: 140 }}
                                        >
                                            <Select
                                                placeholder="Select Network"
                                                style={{ width: 140 }}
                                                dropdownClassName={theme === "dark" && "custom-dropdown"}
                                                value={additionalAccounts[projIndex]?.network}
                                                onChange={(val) => handleNetworkChange(projIndex, val)}
                                            >
                                                {availableNetworks
                                                    .filter(
                                                        (network) =>
                                                            !selectedNetworks.includes(network) ||
                                                            network === additionalAccounts[projIndex]?.network
                                                    )
                                                    .map((network) => (
                                                        <Select.Option key={network} value={network}>
                                                            {network}
                                                        </Select.Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>

                                        {/* Nested Inputs */}
                                        <div style={{ flex: 1 }}>
                                            <Form.List name={[projField.name, "inputs"]}>
                                                {(inputFields) => (
                                                    <>
                                                        {inputFields.map((inputField, inputIndex) => (
                                                            <div
                                                                key={inputField.key}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 8,
                                                                    marginBottom: 8,
                                                                }}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                            >
                                                                <Form.Item
                                                                    name={[inputField.name]}
                                                                    fieldKey={[inputField.fieldKey]}
                                                                    rules={[
                                                                        { required: true, message: "Enter Account ID" },
                                                                    ]}
                                                                    style={{ margin: 0, flex: 1 }}
                                                                >
                                                                    <Input
                                                                        placeholder="Enter Account ID"
                                                                        value={
                                                                            additionalAccounts[projIndex]?.inputs[inputIndex]
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleInputChange(
                                                                                projIndex,
                                                                                inputIndex,
                                                                                e.target.value
                                                                            )
                                                                        }

                                                                    />
                                                                </Form.Item>

                                                                {/* Remove Input */}
                                                                {inputIndex > 0 && (
                                                                    <Button
                                                                        type="text"
                                                                        danger
                                                                        onClick={() =>
                                                                            handleRemoveInput(projIndex, inputIndex)
                                                                        }
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                )}

                                                                {/* Add Input */}
                                                                {inputIndex ===
                                                                    additionalAccounts[projIndex].inputs.length - 1 && (
                                                                        <Button
                                                                            type="text"
                                                                            onClick={() => handleAddInput(projIndex)}
                                                                        >
                                                                            <PlusOutlined />
                                                                        </Button>
                                                                    )}
                                                            </div>
                                                        ))}

                                                        {/* If no inputs */}
                                                        {additionalAccounts[projIndex]?.inputs.length === 0 && (
                                                            <Button onClick={() => handleAddInput(projIndex)}>
                                                                Add Input
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </Form.List>
                                        </div>

                                        {/* Remove Project */}
                                        <Button danger onClick={() => handleRemoveAccount(projIndex)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Project */}
                            <Form.Item style={{ marginTop: 8 }}>
                                <Button type="dashed" onClick={handleAddAccount} icon={<PlusOutlined />}>
                                    Add Project
                                </Button>
                            </Form.Item>
                        </div>
                    )}
                </Form.List>


                <Form.Item>
                    <Button style={{ border: 'none', backgroundColor: '#91C25F', color: 'black', fontWeight: '600' }} htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="Confirmation"
                visible={isModalVisible}
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

export default Edituseraccesses;








