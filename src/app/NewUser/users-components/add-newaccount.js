"use client"
import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Drawer, Modal, message, Select } from 'antd';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';

const { Option } = Select;
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

const timezones = [
    "UTC",
    "EEST",
    "CEST",
    "EDT",
    "CST",
    "PDT",
    "IST",
    "BST",
    "GMT",
    "MST",
    "CDT",
    "AST",
    "DST",
    "HST",
    "EST",
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


const availableNetworks = ["MEDIA_DOT_NET", "MEDIA_DOT_NET_BING", "ENKI", "TONIC", "System1", "Bodies", "Bodies1", "Rsoc", "Domain Active"];

const Newaddaccounts = ({ visible, onClose, AccountsData }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [timeZone, setTimeZone] = useState('UTC');
    const [status, setStatus] = useState('Active');
    const [spendPartner, setSpendPartner] = useState("Facebook");
    const [revenuePartner, setRevenuePartner] = useState("MEDIA_DOT_NET");
    const [BMName, setBMName] = useState("Winkleads Search");
    const [accountNumber, setAccountNumber] = useState();
    const [accountName, setAccountName] = useState();
    const [pixelId, setPixelId] = useState('');
    const [pageName, setPageName] = useState('');
    const [AgencyName, setAgencyName] = useState('');
    const [pageId, setPageId] = useState('');
    const [isVisibleBMId, setIsVisibleBMId] = useState(null);
    var token = localStorage.getItem("token");
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    
    const [uniquePartners, setUniquePartners] = useState([]);
   
    const [options, setOptions] = useState([]);

    const [newOptions, setNewOptions] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newValue, setNewValue] = useState("");
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const containerRef = useRef(null); // Reference to the container div

    // Calculate modal position based on the container
    useEffect(() => {
        if (isModalOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setModalPosition({ top: rect.top, left: rect.left });
        }
    }, [isModalOpen]);

    const handleAddNewValue = () => {
        if (newValue && !options.includes(newValue)) {
            setOptions([...options, newValue]);
            setBMName(newValue);
        }
        setNewValue("");
        setIsVisibleBMId("visible");
        setIsModalOpen(false);
    };

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ BMName: BMName });
        // Check if all required fields are complete
        setIsVisibleBMId("visible");
    }, [newValue, form]);

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ BMName: BMName });
    }, [BMName, form]);

    // const functionCallBMNames = async() =>{
    //     const fetchData = await apiClient.get(`/getBMNames/`);
    //     const mainData = fetchData.data;
    //     setOptions(mainData);
    //     setNewOptions(mainData);
    // }

    useEffect(()=>{
        if(visible){
            const uniqueBMName  = [...new Set(AccountsData?.map(item => item?.BMName).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
            const uniquePartners = [...new Set(AccountsData?.map(item => item?.revenuePartner).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
            setUniquePartners(uniquePartners);
            setOptions(uniqueBMName);
            setNewOptions(uniqueBMName);
            setBMName(uniqueBMName[0])
            setRevenuePartner(uniquePartners[0])
        }
    }, [visible, AccountsData]);

    const onFinish = async (values) => {
        try {
            const newValues = {...values, timeZone: timeZoneFullNames[values.timeZone], pageName: values.pageName ? values.pageName : '', pageID: values.pageID ? values.pageID : '' , pixelID: values.pixelID ? values.pixelID : '', AgencyName: values?.AgencyName ? values?.AgencyName: ""}
            console.log(newValues, "newValues");
            const response = await apiClient.post('/createNewAccount/', {newAccount: newValues});
            if (response.status === 200) {
                message.success('Account created successfully');
                form.resetFields();
                setBMName("Winkleads Search");
                onClose("AccountNumber"); // Close the drawer after successful submission
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
    }
    const onChangeAccountName = (event) => {
        setAccountName(event.target.value);
    }
    const onChangePagelId = (event) => {
        setPageId(event.target.value);
    }
    const onChangePageName = (event) => {
        setPageName(event.target.value);
    }

    const onChangeAgencyName = (event) => {
        setAgencyName(event.target.value);
    }
    const onChangePixelId = (event) => {
        setPixelId(event.target.value);
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
                style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
            >
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ width: "80%" }} initialValues={{ status: status, spendPartner: spendPartner, revenuePartner: revenuePartner, BMName: BMName, timeZone: timeZone }} className={theme === 'dark' ? 'form-dark' : 'form-light'}>
                    <Form.Item label="Spend Partner" name="spendPartner" value={spendPartner}>
                        <Select placeholder="Select a status" 
                            defaultValue="Facebook" onChange={onChangeSpendPartner}
                            title=''
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Option value="Facebook" title='' defaultValue>Facebook</Option>
                            <Option value="Google" title=''>Google</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Spend Account ID" name="accountNumber" rules={[{ required: true, message: 'Please input the spend account ID!' }]}>
                        <Input autoComplete="off"  value={accountNumber} onChange={onChangeAccountNumber} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Spend Account Name" name="accountName" rules={[{ required: true, message: 'Please input the Spend Account ID!' }]}>
                        <Input autoComplete="off" value={accountName} onChange={onChangeAccountName} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Pixel ID" name="pixelID">
                        <Input autoComplete="off" value={pixelId} onChange={onChangePixelId}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Page ID" name="pageID">
                        <Input autoComplete="off" value={pageId} onChange={onChangePagelId}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Page Name" name="pageName">
                        <Input autoComplete="off" value={pageName} onChange={onChangePageName}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Agency Name" name="AgencyName">
                        <Input autoComplete="off" value={AgencyName} onChange={onChangeAgencyName}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="BM name" name="BMName">
                        <div ref={containerRef} className='form-item-bmname' style={{display:'flex'}}>
                            <Select
                                showSearch
                                placeholder="Select or add a value"
                                value={BMName}
                                onChange={onChangeBMName}
                                title=''
                                style={{
                                    flex: 1,
                                    backgroundColor: theme === "dark" ? "#333" : undefined,
                                    color: theme === "dark" ? "#fff" : undefined,
                                }}
                                dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                                allowClear
                            >
                                {options.map((option) => (
                                    <Option key={option} value={option} title=''>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                            <Button style={{backgroundColor:'#91C25F', width:'24px', marginLeft:'5px'}} onClick={() => setIsModalOpen(true)}>
                                <PlusOutlined  className="black-icon"/>
                            </Button>
                        </div>

                        {/* Modal for adding new value */}
                        <Modal
                            title="Add new value"
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            visible={isModalOpen}
                            onOk={handleAddNewValue}
                            onCancel={() => setIsModalOpen(false)}
                            okText="Add"
                            cancelText="Cancel"
                            centered={false} // Prevent centering
                            getContainer={false} // Render modal within the same DOM hierarchy
                            style={{
                                position: "absolute",
                                top: `${modalPosition.top - 50}px`, // Offset the modal above the Select
                                left: `${modalPosition.left}px`,
                                transform: "translateY(0)",
                                width:'200px'
                            }}
                        >
                            <Input
                                placeholder="Enter new value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                            />
                        </Modal>
                    </Form.Item>
                    { !(newOptions.includes(BMName)) && 
                    <Form.Item label="BM ID" name="BMId" rules={[{ required: true, message: 'Please input the BM ID!' }]}>
                        <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    }

                    <Form.Item label="Time zone" name="timeZone" value={timeZone}>
                        <Select
                            showSearch
                            onChange={onChangeTimeZone}
                            style={{ 
                                width: '100%',
                                backgroundColor: theme === 'dark' && '#333', // Background color
                                color: theme === 'dark' && '#fff',
                            }}
                            placeholder="Select Timezone"
                            optionFilterProp="label"
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            defaultValue="UTC"
                            options={timezones.map((item) => ({
                                value: item,
                                label: item,
                                title: ''
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Status" name="status" value={status}>
                        <Select placeholder="Select a status"
                            defaultValue="Active" onChange={onChangeStatus}
                            title=''
                            style={{
                                backgroundColor: theme === 'dark' && '#333', // Background color
                                color: theme === 'dark' && '#fff',
                            }}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Option value="Active" title=''>Active</Option>
                            <Option value="InActive" title=''>Inactive</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Revenue partner" name="revenuePartner" value={revenuePartner} >
                        <Select
                            showSearch
                            onChange={onChangeRevenuePartner}
                            style={{ 
                                width: '100%',
                                backgroundColor: theme === 'dark' && '#333', // Background color
                                color: theme === 'dark' && '#fff',
                            }}
                            placeholder="Select Revenue partner"
                            optionFilterProp="label"
                            defaultValue={uniquePartners[0]}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            options={uniquePartners.map((item) => ({
                                value: item,
                                label: item,
                                title: ''
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Media Buyer Name" name="MediaBuyerName" rules={[{ required: true, message: 'Please input the Media Buyer Name ID!' }]}>
                        <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item label="Holder" name="Holder" rules={[{ required: true, message: 'Please input the Holder Name ID!' }]}>
                        <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                    </Form.Item>
                    <Form.Item>
                        <Button style={{backgroundColor:'#91C25F'}} onClick={showModal}>Submit</Button>
                    </Form.Item>
                </Form>
            </Drawer>
            <Modal
                title="Confirmation"
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
