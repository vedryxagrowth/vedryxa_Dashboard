"use client"
import React, { useState } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const Createnewuser = ({ visible, onClose }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: {},
    });
    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    // const [inputsArray, setInputArray] = useState([]);
    // console.log(additionalAccounts, "addition");
    // const [data, setData] = useState({});
    // const [inputValue, setInputValue] = useState();
    // const netData = {...data};
    // console.log(netData);
    // const [network, setNetwork] = useState();
    // const [accounts, setAccounts] = useState();
    var token = localStorage.getItem("token");

    const availableNetworks = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !selectedNetworks.includes(network));
    const handleAddAccount = () => {
        if(availableNetworks.length > 0){
            setAdditionalAccounts([...additionalAccounts, { network: '', inputs: [''] }]);
        }
    };

    const handleRemoveAccount = (index) => {
        const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
        setAdditionalAccounts(updatedAccounts);
        setSelectedNetworks(updatedAccounts.map(account => account.network));
        // console.log(index, "remove");
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
        // console.log(inputIndex, "inputIndex");
        // console.log(accountIndex, "accountIndex");
        const updatedAccounts = [...additionalAccounts];
        
        updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
        const indexes = updatedAccounts[accountIndex].inputs.length;
        // console.log(indexes, "length of inputs");
        if(indexes === 0){
            // console.log(accountIndex, "index index");
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

    const submitForm = async (values) => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to create new user?',
            onOk: async() => {
                try {
                    let data = {};
                    additionalAccounts.map((each)=>{
                        data[each.network] = each.inputs;
                    });
                    
                    const formattedData = {
                        ...values,
                        adAccounts: additionalAccounts.length > 0 ? data : [],
                    };
                    // console.log(formattedData, "formatted Data");
                    const response = await axios.post('https://prodapis.adsgoat.in/api/createUser/', {formattedData},
                        {
                            headers: {
                                'Authorization': token
                            }
                        });
                    
                    if (response.status === 200) {
                        // console.log('User created successfully');
                        message.success("User created successfully"); // Display success message
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                        setIsModalVisible(false); // Close modal after success
                        onClose(); // Close drawer
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
            width="50%"
            open={visible} // Change visible to open
            onClose={onClose}
            closeIcon={<CloseOutlined />}
        >
            <Form
                layout="vertical"
                onFinish={submitForm}
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
                    <Input />
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
                    <Input />
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
                    <Select>
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Manager">Manager</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        <div>
                        {additionalAccounts.map((account, accountIndex) => (
                                <div key={accountIndex}>
                                    <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                                        <Select
                                            placeholder="Select a network"
                                            style={{ maxWidth: '120px', height: '30px', marginRight:'8px' }}
                                            value={account.network}
                                            onChange={(value) => handleNetworkChange(accountIndex, value)}
                                        >
                                            {availableNetworks.map((network) => (
                                                <Select.Option key={network} value={network}>
                                                    {network}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            {account.inputs.map((input, inputIndex) => (
                                                <div key={inputIndex} style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '8px',
                                                    width: '100%',
                                                    height: '30px',
                                                    justifyContent: 'center',
                                                 }}>
                                                    <Input
                                                        value={input}
                                                        onChange={(e) => handleInputChange(accountIndex, inputIndex, e.target.value)}
                                                        placeholder="Enter ad input"
                                                        style={{ width: '100%', marginRight: '8px' }}
                                                    />
                                                    {account.inputs.length === 1 && inputIndex === 0 && (
                                                        <Button
                                                            style={{ marginTop: '8px', marginBottom: '8px' }}
                                                            type="default"
                                                            onClick={() => handleRemoveAccount(accountIndex)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                    {account.inputs.length > 1 && inputIndex !== 0 && (
                                                        <DeleteOutlined
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                                        />
                                                    )}
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
                        </div>
                        <Button type="dashed" onClick={handleAddAccount} icon={<PlusOutlined />}>
                            Add Account
                        </Button>
                    </div>
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

export default Createnewuser;








