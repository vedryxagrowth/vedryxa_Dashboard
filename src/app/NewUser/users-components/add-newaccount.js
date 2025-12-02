"use client"
import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Drawer, Modal, message, Select } from 'antd';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';

const { Option } = Select;
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { FaTrashCan } from 'react-icons/fa6';

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
    'CEST': "Europe/Paris",
    'CST': 'America/Mexico_City',
    'PDT': 'America/Los_Angeles',
    'BST': 'Europe/London',
    'GMT': 'Africa/Accra',
    'IST': 'Asia/Kolkata',
    'MST': 'America/Dawson',
    'CDT': 'America/Chicago',
    'AST': 'America/Puerto_Rico',
    'DST': 'Asia/Dubai',
    'HST': 'Pacific/Honolulu',
    'EST': 'America/Toronto'
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
    const [pixels, setPixels] = useState([
        { pixelName: "", pixelId: "" }
    ]);
    const [pages, setPages] = useState([
        { pageName: "", pageId: "" }
    ]);


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

    useEffect(() => {
        if (visible) {
            const uniqueBMName = [...new Set(AccountsData?.map(item => item?.BMName).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
            const uniquePartners = [...new Set(AccountsData?.map(item => item?.revenuePartner).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
            setUniquePartners(uniquePartners);
            setOptions(uniqueBMName);
            setNewOptions(uniqueBMName);
            setBMName(uniqueBMName[0])
            setRevenuePartner(uniquePartners[0])
        }
    }, [visible, AccountsData]);
    const validateAccountBeforeSubmit = async () => {
        const acc = accountNumber?.trim();

        if (!acc) {
            message.open({
                type: 'error',
                content: `Account Number cannot be empty`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
            return false;
        }


        const localMatch = AccountsData?.find(
            item => String(item.accountNumber).trim() === acc
        );

        if (localMatch) {

            message.open({
                type: 'error',
                content: `Account ${acc} already exists. Please check.`,
                className: theme === 'dark' ? 'dark-message' : '',
            })

            return false;
        }


        let apiList = [];
        try {
            const res = await axios.get("https://prodapis.adsgoat.in/allaccounts", {
                headers: { Authorization: token }
            });
            apiList = res.data || [];
        } catch (err) {

            message.open({
                type: 'error',
                content: `Error validating account. Please try again.`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
            return false;
        }

        const apiMatch = apiList.find(
            item => String(item.accountNumber).trim() === acc
        );

        if (apiMatch) {
            message.open({
                type: 'error',
                content: `Account ${acc} already exists but you don't have access. Please check.`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
            return false;
        }

        return true;
    };
    const resetFormState = () => {
        form.resetFields();

        setPixels([{ pixelName: "", pixelId: "" }]);
        setPages([{ pageName: "", pageId: "" }]);

        setBMName("Winkleads Search");
        setAccountNumber("");
        setAccountName("");
        setAgencyName("");
    };
    const onFinish = async (values) => {
        const trimmedValues = Object.fromEntries(
            Object.entries(values).map(([key, val]) => [
                key,
                typeof val === "string" ? val.trim() : val
            ])
        );
        const isValid = await validateAccountBeforeSubmit();
        if (!isValid) return;

        let formattedPixels;
        if (pixels.length === 1) {
            formattedPixels = pixels[0].pixelId.trim();
        } else {
            formattedPixels = {};
            pixels.forEach(p => {
                if (p.pixelName && p.pixelId) {
                    formattedPixels[p.pixelName.trim()] = p.pixelId.trim();
                }
            });
        }

        let formattedPages;
        let formattedPageName;

        if (pages.length === 1) {
            formattedPages = pages[0].pageId.trim();
            formattedPageName = pages[0].pageName.trim();
        } else {
            formattedPages = {};
            pages.forEach(p => {
                if (p.pageName && p.pageId) {
                    formattedPages[p.pageName.trim()] = p.pageId.trim();
                }
            });
        }
        try {
            // const newValues = { ...values, timeZone: timeZoneFullNames[values.timeZone], pageName: values.pageName ? values.pageName : '', pageID: values.pageID ? values.pageID : '', pixelID: values.pixelID ? values.pixelID : '', AgencyName: values?.AgencyName ? values?.AgencyName : "" }
            const newValues = {
                ...trimmedValues,
                pixelID: formattedPixels,
                pageID: formattedPages,
                pageName: formattedPageName,
                timeZone: timeZoneFullNames[values.timeZone],
                pixelId: undefined
            };
            console.log(newValues, "newValues");
            const response = await apiClient.post('/createNewAccount/', { newAccount: newValues });
            if (response.status === 200) {
                // message.success('Account created successfully');
                // form.resetFields();
                // setPixels([
                //     { pixelName: "", pixelId: "" }
                // ]);
                // setPages([
                //     { pageName: "", pageId: "" }
                // ])
                // setBMName("Winkleads Search");
                // onClose("AccountNumber");

                message.open({
                    type: 'success',
                    content: `Account created successfully`,
                    className: theme === 'dark' ? 'dark-message' : '',
                })
                resetFormState();
                onClose("AccountNumber");

            } else {
                message.open({
                    type: 'error',
                    content: `Failed to create account`,
                    className: theme === 'dark' ? 'dark-message' : '',
                })
            }
        } catch (error) {
            console.error('Error creating account:', error);
            message.open({
                type: 'error',
                content: `Failed to create account`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModal = async () => {
        // setIsModalVisible(true);

        try {
            await form.validateFields();
        } catch {
            message.open({
                type: 'error',
                content: `Please fill all required fields`,
                className: theme === 'dark' ? 'dark-message' : '',
            })
            return;
        }
        const isValid = await validateAccountBeforeSubmit();
        if (!isValid) return;
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

    const onChangeSpendPartner = (value) => {
        setSpendPartner(value);
    }

    const onChangeBMName = (value) => {
        setBMName(value);
    }

    const onChangeStatus = (value) => {
        setStatus(value);
    }

    const onChangeRevenuePartner = (value) => {
        setRevenuePartner(value);
    }

    const handlePixelChange = (index, field, value) => {
        const updated = [...pixels];
        updated[index][field] = value;
        setPixels(updated);
    };

    const addPixelRow = () => {
        setPixels(prev => [...prev, { pixelName: "", pixelId: "" }]);
    };

    const removePixelRow = (index) => {
        const updated = pixels.filter((_, i) => i !== index);
        setPixels(updated);
    };


    const addPage = () => {
        setPages(prev => [...prev, { pageName: "", pageId: "" }]);
    };

    const removePage = (index) => {
        setPages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePageChange = (index, field, value) => {
        setPages(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };


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

                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
                            defaultValue="Facebook" onChange={onChangeSpendPartner}
                            title=''
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                            <Option value="Facebook" title='' defaultValue>Facebook</Option>
                            <Option value="Google" title=''>Google</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Spend Account ID" name="accountNumber" rules={[{ required: true, message: 'Please input the spend account ID!' }]}>
                        <Input autoComplete="off" value={accountNumber} onChange={onChangeAccountNumber} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item>
                    <Form.Item label="Spend Account Name" name="accountName" rules={[{ required: true, message: 'Please input the Spend Account ID!' }]}>
                        <Input autoComplete="off" value={accountName} onChange={onChangeAccountName} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item>
                    {/* <Form.Item label="Pixel ID" name="pixelID" rules={[{ required: true, message: 'Please input the Pixel ID!' }]}>
                        <Input autoComplete="off" value={pixelId} onChange={onChangePixelId} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item> */}
                    <Form.Item label="Pixel ID" rules={[{ required: true, message: 'Please input the Pixel ID!' }]}>
                        {pixels.map((row, index) => (
                            <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>

                                {/* Pixel Name */}
                                {pixels.length > 1 && (
                                    <Input
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                        placeholder="Pixel Name"
                                        value={row.pixelName}
                                        required
                                        onChange={(e) =>
                                            handlePixelChange(index, "pixelName", e.target.value)
                                        }
                                    />
                                )}

                                {/* Pixel ID */}
                                <Input
                                    placeholder="Pixel ID"
                                    required
                                    value={row.pixelId}
                                    onChange={(e) =>
                                        handlePixelChange(index, "pixelId", e.target.value)
                                    }
                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                />

                                {/* Remove */}
                                {pixels.length > 1 && (
                                    <Button type='text' onClick={() => removePixelRow(index)} icon={<FaTrashCan color="#EC7117" />}>

                                    </Button>
                                )}

                                {/* Add */}
                                {index === pixels.length - 1 && (
                                    <Button onClick={addPixelRow} icon={<PlusOutlined />} type="text" />


                                )}
                            </div>
                        ))}
                    </Form.Item>

                    {/* <Form.Item label="Page ID" name="pageID" rules={[{ required: true, message: 'Please input the Page ID!' }]}>
                        <Input autoComplete="off" value={pageId} onChange={onChangePagelId} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item> */}
                    {pages.length === 1 ? (
                        <>
                            <Form.Item
                                label="Page ID"
                                required
                                style={{ marginTop: 8 }}
                                rules={[{ required: true, message: 'Please input the Page ID!' }]}
                            >
                                <div style={{ display: "flex", gap: 8 }}>
                                    <Input
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                        placeholder="Page ID"
                                        value={pages[0].pageId}
                                        required
                                        onChange={(e) =>
                                            handlePageChange(0, "pageId", e.target.value)
                                        }
                                    />

                                    {/* add second row */}
                                    <Button
                                        type="text"
                                        onClick={addPage}
                                        icon={<PlusOutlined />}
                                    />
                                </div>
                            </Form.Item>

                            <Form.Item
                                label="Page Name"
                                required
                                style={{ marginTop: 8 }}
                                rules={[{ required: true, message: 'Please input the page name!' }]}
                            >
                                <Input
                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                    placeholder="Page Name"
                                    value={pages[0].pageName}
                                    required
                                    onChange={(e) =>
                                        handlePageChange(0, "pageName", e.target.value)
                                    }
                                />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item label="Page IDs" rules={[{ required: true, message: 'Please input the Pixel ID!' }]}>
                            {pages.map((p, index) => (
                                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <Input
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                        placeholder="Page Name"
                                        required
                                        value={p.pageName}
                                        onChange={(e) =>
                                            handlePageChange(index, "pageName", e.target.value)
                                        }
                                    />

                                    <Input
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }}
                                        placeholder="Page ID"
                                        value={p.pageId}
                                        required
                                        onChange={(e) =>
                                            handlePageChange(index, "pageId", e.target.value)
                                        }
                                    />

                                    <Button type="text" onClick={() => removePage(index)} icon={<FaTrashCan color="#EC7117" />}>
                                    </Button>

                                    {index === pages.length - 1 && (
                                        <Button
                                            type="text"
                                            onClick={addPage}
                                            icon={<PlusOutlined />}
                                        />
                                    )}
                                </div>
                            ))}
                        </Form.Item>
                    )}

                    {/* <Form.Item label="Page Name" name="pageName" rules={[{ required: true, message: 'Please input the Page Name!' }]}>
                        <Input autoComplete="off" value={pageName} onChange={onChangePageName} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item> */}


                    <Form.Item label="Agency Name" name="AgencyName" rules={[{ required: true, message: 'Please input the Agency Name!' }]}>
                        <Input autoComplete="off" value={AgencyName} onChange={onChangeAgencyName} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item>
                    <Form.Item label="BM name" name="BMName" rules={[{ required: true, message: 'Please input the BM Name!' }]}>
                        <div ref={containerRef} className='form-item-bmname' style={{ display: 'flex' }}>
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
                                className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                    } green-border-select`}
                                dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                                allowClear
                            >
                                {options.map((option) => (
                                    <Option key={option} value={option} title=''>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                            <Button style={{ backgroundColor: '#91C25F', width: '24px', marginLeft: '5px' }} onClick={() => setIsModalOpen(true)}>
                                <PlusOutlined className="black-icon" />
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
                                width: '200px'
                            }}
                        >
                            <Input
                                placeholder="Enter new value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                            />
                        </Modal>
                    </Form.Item>
                    {!(newOptions.includes(BMName)) &&
                        <Form.Item label="BM ID" name="BMId" rules={[{ required: true, message: 'Please input the BM ID!' }]}>
                            <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
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
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
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
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
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
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
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
                        <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item>
                    <Form.Item label="Holder" name="Holder" rules={[{ required: true, message: 'Please input the Holder Name ID!' }]}>
                        <Input autoComplete="off" className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ backgroundColor: '#91C25F' }} onClick={showModal}>Submit</Button>
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
