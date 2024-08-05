"use client"
import { useState } from 'react';
import { Form, Input, Button, Drawer, Modal, message } from 'antd';
import axios from 'axios';
import { CloseOutlined } from '@ant-design/icons';

const Newaddaccounts = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    var token = localStorage.getItem("token")

    const onFinish = async (values) => {
        try {
            const response = await axios.post('https://www.testapi.adsgoat.in/api/newaddaccount', values,
                {
                    headers: {
                        'Authorization': token
                    }
                });
            if (response.status === 200) {
                console.log('User created successfully');
                message.success('Account created successfully');
                form.resetFields();
                onClose(); // Close the drawer after successful submission
            } else {
                message.error('Failed to create account');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            message.error('Failed to create account');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    return (
        <>
            <Drawer
                title="New Add Account"
                open={visible}
                onClose={onClose}
                width="60%"
                closeIcon={<CloseOutlined />}
            >
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ width: "80%" }}>
                    <Form.Item label="External Partner" name="extPartner" rules={[{ required: true, message: 'Please input the external partner!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="External Account ID" name="extAccountId" rules={[{ required: true, message: 'Please input the external account ID!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Token" name="token" rules={[{ required: true, message: 'Please input the token!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Time Zone" name="timeZone" rules={[{ required: true, message: 'Please input the time zone!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please input the status!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Revenue Partner" name="revenuePartner" rules={[{ required: true, message: 'Please input the revenue partner!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Revenue Account ID" name="revenueAccountId" rules={[{ required: true, message: 'Please input the revenue account ID!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Media Buyer Name" name="mediaBuyerName" rules={[{ required: true, message: 'Please input the media buyer name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Agency ID" name="agencyId" rules={[{ required: true, message: 'Please input the agency ID!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Agency Name" name="agencyName" rules={[{ required: true, message: 'Please input the agency name!' }]}>
                        <Input />
                    </Form.Item>                    <Form.Item>
                        <Button type="primary" onClick={showModal}>Submit</Button>
                    </Form.Item>
                </Form>
            </Drawer>
            <Modal
                title="Confirmation"
                open={isModalVisible}
                onOk={() => {
                    form.submit();
                    setIsModalVisible(false);
                }}
                onCancel={handleCancel}
            >
                <p>Are you sure you want to submit?</p>
            </Modal>
        </>
    );
};

export default Newaddaccounts;
