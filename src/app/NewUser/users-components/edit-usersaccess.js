"use client"
import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Add } from '@mui/icons-material';
import { useTokenContext } from '../../components/parent';

const Edituseraccesses = ({ editeddata, visible, onClose }) => {
    const userAccess = editeddata?.adAccounts;
    userAccess !== null && userAccess !== undefined ? Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })) : [];
    let userName;
    if (editeddata !== null){
        userName = editeddata.userName;
    }

    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    
    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: [],
    });
    
    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [formAccounts, setFormAccounts] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    const [editeddatas, setEditeddatas] = useState(null);
    var token = localStorage.getItem("token")

    useEffect(()=>{
        if(userAccess !== null && userAccess !== undefined){
            setAdditionalAccounts(Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })))
        }
        else{
            setAdditionalAccounts([])
        }
    }, [userAccess]);

    let AddAccounts ;

    useEffect(() => {
        updateSelectedNetworks([...additionalAccounts, ...formAccounts]);
    }, [additionalAccounts, formAccounts]);

    const handleAddAccount = () => {
        if(AddAccounts.length > 1){
            const newAccount = { network: '', inputs: [''] };
            setAdditionalAccounts(prevAdditionalAccounts => [...prevAdditionalAccounts, newAccount]);
        }
    };

    const handleRemoveAccount = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            onOk: () => {
                try {
                    const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setAdditionalAccounts(updatedAccounts);
                    updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    };

    const handleRemoveAccount1 = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            onOk: () => {
                try {
                    const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setFormAccounts(updatedFormAccounts);
                    updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
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
            onOk: () => {
                try {
                    const updatedAccounts = [...additionalAccounts];
                    updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
                    setAdditionalAccounts(updatedAccounts);
                } catch (error) {
                    console.error('Error:', error);
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

    const getAvailableNetworks = (currentNetwork = '') => {
        const allSelectedNetworks = selectedNetworks.filter(network => network !== currentNetwork);
        const data = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !allSelectedNetworks.includes(network));
        AddAccounts = data;
        return data;
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const submitForm = async (values) => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to submit?',
            onOk: async() => {
                try {
                    const singleObject = additionalAccounts.reduce((acc, obj) => {
                        const key = obj[Object.keys(obj)[0]];
                        const value = Object.keys(obj)[1];
                        acc[key] = obj[value]; // Assign the value to the accumulated object using the key
                        return acc;
                    }, {});
        
                    const formattedData = {
                        ...values, adAccounts: singleObject
                    };
        
                    const response = await apiClient.put(`/api/updateUserTableData/`, {formattedData});
        
                    if (response.status === 200) {
                        message.success("User Edits updated successfully"); // Display success message
                        // Pass the updated user data back to the parent to update the table
                        const updatedUserData = { ...editeddata, ...formattedData };
                        // Call onClose and pass the updated data to the parent
                        onClose(updatedUserData);
                        setIsModalVisible(false); 
                    }
                     else {
                        console.error('Failed to update user');
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

    const handleOk = () => {
        setIsModalVisible(false);
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    };
    const initialValues = editeddata ? {
        userName: editeddata.userName,
        email: editeddata.email,
        role: editeddata.role,
        adAccounts: editeddata.adAccounts
    } : null;

    return (
        <Drawer
            title={`Edit the user ${userName}`}
            width="50%"
            open={visible} // Change visible to open
            onClose={onClose}
            closeIcon={<CloseOutlined />}
        >
            <Form
                layout="vertical"
                onFinish={submitForm}
                initialValues={initialValues}
                key={initialValues?.userName} 
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
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
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
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
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
                    style={{
                        width: '100%',
                        backgroundColor: theme === 'dark' && '#333', // Background color
                        color: theme === 'dark' && '#fff',
                    }}      
                    dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Manager">Manager</Select.Option>
                    </Select>
                </Form.Item>
                
                {additionalAccounts?.map((account, accountIndex) => (
                    <div key={accountIndex}>
                        <div className='add-accounts'>
                            <Select
                                placeholder="Select a network"
                                className='add-accounts-select-network'
                                style={{
                                    backgroundColor: theme === 'dark' && '#333', // Background color
                                    color: theme === 'dark' && '#fff',
                                }}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                value={account.network}
                                onChange={(value) => handleNetworkChange(accountIndex, value)}
                            >
                                {getAvailableNetworks(account.network).map((network) => (
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
                                    className='add-account-container-input'
                                    >
                                    <Input
                                        value={input}
                                        onChange={(e) =>
                                        handleInputChange(accountIndex, inputIndex, e.target.value)
                                        }
                                        placeholder="Enter ad input"
                                        style={{ width: '100%', marginRight: '8px', color: theme === "dark" ? 'white' : "black" }}
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
                                        style={{ marginTop: '8px', marginBottom: '8px' }}
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

                <Form.Item name="adAccounts">
                    <div>
                        {formAccounts.map((account, accountIndex) => (
                            <div key={accountIndex}>
                                <div className='add-accounts'>
                                    <Select
                                        placeholder="Select a network"
                                        style={{ width: '120px', marginRight: '8px',
                                            backgroundColor: theme === 'dark' && '#333', // Background color
                                            color: theme === 'dark' && '#fff',
                                         }}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        value={account.network}
                                        onChange={(value) => handleNetworkChange1(accountIndex, value)}
                                    >
                                        {getAvailableNetworks(account.network).map((network) => (
                                            <Select.Option key={network} value={network}>
                                                {network}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <div className='add-account-container'>
                                        {account.inputs.map((input, inputIndex) => (
                                            <div key={inputIndex} className='add-account-input-container'>
                                                <Input
                                                    value={input}
                                                    onChange={(e) => handleInputChange1(accountIndex, inputIndex, e.target.value)}
                                                    placeholder="Enter ad input"
                                                    style={{ width: '100%', marginRight: '8px', color: theme === "dark" ? 'white' : "black" }}
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
                                    style={{ marginTop: '8px', marginBottom: '8px' }}
                                    type="default"
                                    onClick={() => handleRemoveAccount1(accountIndex)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="dashed" onClick={handleAddAccount} icon={<span style={{ color: theme === 'dark' ? 'white' : 'black' }}> {/* Wrap icon in a span */}
                        <PlusOutlined />
                        </span>}>
                        Add Account
                    </Button>
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" htmlType="submit">
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