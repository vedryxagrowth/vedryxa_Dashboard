"use client"
import React, { useState } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const Edituseraccess = ({ editeddata, visible, onClose }) => {
    // console.log(editeddata, "heyy edit-useraccess page")
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: [],
    });
    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [editeddatas, setEditeddatas] = useState(null);
    var token = localStorage.getItem("token")


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

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleAddAccount = () => {
        setAdditionalAccounts([...additionalAccounts, '']);
    };

    // const handleRemoveAccount = (index) => {
    //     const newAccounts = [...additionalAccounts];
    //     newAccounts.splice(index, 1);
    //     setAdditionalAccounts(newAccounts);
    // };
    const submitForm = async (values) => {
        try {
            const allAccounts = [
                ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
                ...additionalAccounts
            ];

            const formattedData = {
                ...values,
                adAccounts: allAccounts,
            };

            const response = await axios.put(`https://www.testapi.adsgoat.in/api/users/${editeddata && editeddata.email}`, formattedData,
                {
                    headers: {
                        'Authorization': token
                    }
                });

            if (response.status === 200) {
                console.log('User updated successfully');
                message.success("User Edits updated successfully"); // Display success message
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                setIsModalVisible(false); // Close modal after success
                onClose(); // Close drawer
            } else {
                console.error('Failed to update user');
                // Handle error, show error message
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };


    const handleRemoveAccount = (index, type) => {
        if (type === 'existing') {
            // Logic to remove existing account from editeddata
            const newEditedData = { ...editeddata };
            newEditedData.adAccounts.splice(index, 1);
            setEditeddatas(newEditedData);
        } else {
            // Logic to remove additional account
            const newAccounts = [...additionalAccounts];
            newAccounts.splice(index, 1);
            setAdditionalAccounts(newAccounts);
        }
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
        // Add other fields with their initial values here
    } : null;

    // console.log(initialValues, "initialValues")
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
                initialValues={initialValues}
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

                <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        {(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []).map((account, index) => (
                            <div key={index}>
                                <Input
                                    value={account}
                                    readOnly // Ensure the input is read-only to display existing accounts
                                    placeholder="Existing ad account"
                                />
                                <Button type="default" onClick={() => handleRemoveAccount(index, 'existing')}>
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

export default Edituseraccess;








