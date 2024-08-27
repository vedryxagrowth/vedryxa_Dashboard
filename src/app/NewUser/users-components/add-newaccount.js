"use client"
import { useState } from 'react';
import { Form, Input, Button, Drawer, Modal, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;
import { CloseOutlined } from '@ant-design/icons';

const timezones = [
    'UTC',
    'EEST',
    'EDT',
    'CST',
    'PDT',
    'IST',
    'BST',
    'GMT',
    'MST',
    'CDT',
    'AST',
    'DST'
];

const timeZoneFullNames = {
    'EDT': 'America/New_York',
    'UTC': 'Atlantic/Azores',
    'EEST': 'Europe/Athens',
    'CEST':"Europe/Paris",
    'CST':'America/Mexico_City',
    'PDT':'America/Los_Angeles',
    'BST':'Europe/London',
    'GMT':'Africa/Accra',
    'IST':'Asia/Kolkata',
    'MST':'America/Dawson',
    'CDT':'America/Chicago',
    'AST':'America/Puerto_Rico',
    'DST':'Asia/Dubai',
    'HST':'Pacific/Honolulu',
    'EST':'America/Toronto'
};


const availableNetworks = ["MEDIA_DOT_NET", "ENKI", "TONIC", "System1", "Bodies", "Bodies1", "Rsoc", "Domain Active"];

const Newaddaccounts = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [timeZone, setTimeZone] = useState('UTC');
    const [status, setStatus] = useState('Active');
    const [spendPartner, setSpendPartner] = useState("Facebook");
    const [revenuePartner, setRevenuePartner] = useState("MEDIA_DOT_NET");
    const [BMName, setBMName] = useState("Winkleads Search");
    const [accountNumber, setAccountNumber] = useState();
    const [pixelId, setPixelId] = useState('');
    const [pageName, setPageName] = useState('');
    const [pageId, setPageId] = useState('');
    var token = localStorage.getItem("token")

    const onFinish = async (values) => {
        try {
            // console.log(values, "values");
            // const response = await axios.post('https://www.testapi.adsgoat.in/api/newaddaccount', values,
            //     {
            //         headers: {
            //             'Authorization': token
            //         }
            //     });
            const newValues = {...values, timeZone: timeZoneFullNames[values.timeZone], pageName: values.pageName ? values.pageName : '', pageId: values.pageId ? values.pageId : '' , pixelId: values.pixelId ? values.pixelId : ''}
            // console.log(newValues, "newValues");
            const response = await axios.post('https://prodapis.adsgoat.in/createNewAccount/', {newAccount: newValues},
                {
                    headers: {
                        'Authorization': token
                    }
            });
            // console.log(response.data);
            if (response.status === 200) {
                console.log('Account created successfully');
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

    const onChangeTimeZone = (value) => {
        setTimeZone(value);
    }

    const onChangeAccountNumber = (event) => {
        setAccountNumber(event.target.value);
        // console.log(event.target.value);
    }
    const onChangePagelId = (event) => {
        setPageId(event.target.value);
        // console.log(event.target.value);
    }
    const onChangePageName = (event) => {
        setPageName(event.target.value);
        // console.log(event.target.value);
    }
    const onChangePixelId = (event) => {
        setPixelId(event.target.value);
        // console.log(event.target.value);
    }

    const onChangeSpendPartner = (value)=>{
        setSpendPartner(value);
    }

    const onChangeBMName = (value)=>{
        setBMName(value);
    }

    const onChangeStatus = (value)=>{
        setStatus(value);
    }

    const onChangeRevenuePartner = (value)=>{
        setRevenuePartner(value);
    }

    return (
        <>
            <Drawer
                title="New Add Account"
                open={visible}
                onClose={onClose}
                width="60%"
                closeIcon={<CloseOutlined />}
            >
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ width: "80%" }} initialValues={{ status: status, spendPartner: spendPartner, revenuePartner: revenuePartner, BMName: BMName, timeZone: timeZone }} >
                    <Form.Item label="Spend Partner" name="spendPartner" value={spendPartner}>
                        <Select placeholder="Select a status" 
                            defaultValue="Facebook" onChange={onChangeSpendPartner}>
                            <Option value="Facebook" defaultValue>Facebook</Option>
                            <Option value="Google">Google</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Spend Account ID" name="accountNumber" rules={[{ required: true, message: 'Please input the Spend Account ID!' }]}>
                        <Input value={accountNumber} onChange={onChangeAccountNumber} />
                    </Form.Item>
                    <Form.Item label="Pixel ID" name="pixelId">
                        <Input value={pixelId} onChange={onChangePixelId}/>
                    </Form.Item>
                    <Form.Item label="Page ID" name="pageId">
                        <Input value={pageId} onChange={onChangePagelId} />
                    </Form.Item>
                    <Form.Item label="Page Name" name="pageName">
                        <Input value={pageName} onChange={onChangePageName} />
                    </Form.Item>
                    <Form.Item label="BM Name" name="BMName" value={BMName}>
                        <Select placeholder="Select a status" 
                            defaultValue="Winkleads Search" onChange={onChangeBMName}>
                            <Option value="Winkleads Search" defaultValue>Winkleads Search</Option>
                            <Option value="MODO LEO BM X1">MODO LEO BM X1</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Time Zone" name="timeZone" value={timeZone}>
                        <Select
                            showSearch
                            onChange={onChangeTimeZone}
                            style={{ width: '100%' }}
                            placeholder="Select Timezone"
                            optionFilterProp="label"
                            defaultValue="UTC"
                            options={timezones.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Status" name="status" value={status}>
                        <Select placeholder="Select a status"
                            defaultValue="Active" onChange={onChangeStatus}>
                            <Option value="Active">Active</Option>
                            <Option value="InActive">Inactive</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Revenue Partner" name="revenuePartner" value={revenuePartner} >
                        <Select
                            showSearch
                            onChange={onChangeRevenuePartner}
                            style={{ width: '100%' }}
                            placeholder="Select RevenuePartner"
                            optionFilterProp="label"
                            defaultValue="MEDIA_DOT_NET"
                            options={availableNetworks.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Form.Item>
                    {/* <Form.Item label="Revenue Account ID" name="revenueAccountId" rules={[{ required: true, message: 'Please input the revenue account ID!' }]}>
                        <Input />
                    </Form.Item> */}
                    {/* <Form.Item label="Media Buyer Name" name="mediaBuyerName" rules={[{ required: true, message: 'Please input the media buyer name!' }]}>
                        <Input />
                    </Form.Item> */}
                    {/* <Form.Item label="Agency ID" name="agencyId" rules={[{ required: true, message: 'Please input the agency ID!' }]}>
                        <Input />
                    </Form.Item> */}
                    {/* <Form.Item label="Agency Name" name="agencyName" rules={[{ required: true, message: 'Please input the agency name!' }]}>
                        <Input />
                    </Form.Item>                     */}
                    <Form.Item>
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
