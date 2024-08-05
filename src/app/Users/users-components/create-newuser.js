"use client"
import React, { useState } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const Createnewuser = ({ visible, onClose }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: [],
    });
    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    var token = localStorage.getItem("token")

    const submitForm = async (values) => {
        try {
            const formattedData = {
                ...values,
                adAccounts: additionalAccounts.length > 0 ? additionalAccounts : [],
            };

            const response = await axios.post('https://www.testapi.adsgoat.in/api/users', formattedData,
                {
                    headers: {
                        'Authorization': token
                    }
                });

            if (response.status === 200) {
                console.log('User created successfully');
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
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleAddAccount = () => {
        setAdditionalAccounts([...additionalAccounts, '']);
    };

    const handleRemoveAccount = (index) => {
        const newAccounts = [...additionalAccounts];
        newAccounts.splice(index, 1);
        setAdditionalAccounts(newAccounts);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
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
                        <Select.Option value="MEDIA_BUYER">MEDIA_BUYER</Select.Option>
                        <Select.Option value="SPECIAL_USER">SPECIAL_USER</Select.Option>
                        <Select.Option value="ADMIN">ADMIN</Select.Option>
                        <Select.Option value="MANAGER">MANAGER</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        {(formalldata.adAccounts || []).map((account, index) => (
                            <div key={index}>{account}</div>
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








