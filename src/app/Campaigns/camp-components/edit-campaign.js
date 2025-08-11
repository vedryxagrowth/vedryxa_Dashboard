"use client"
import React from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Skeleton } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;

const EditCampaignDrawer = ({ rowData, visible, onClose }) => {
    if (!rowData) {
        return null
    }
    const [EditCampaignData, setEditCampaignData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const { data: session } = useSession();
    var token = localStorage.getItem("token")
    const [showBidAmount, setShowBidAmount] = useState(false);
    const handleBidStrategyChange = (value) => {
        // Show bid_amount if the selected bid strategy is "Bid Cap", otherwise hide it
        setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP");
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (rowData) {
                    const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${rowData.identifier}`
                        , {

                            headers: {
                                'Authorization': token
                            }

                        }
                    );
                    console.log("hello Editdata", response.data[0]);
                    setEditCampaignData(response.data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign list:", error);
                // Retry the API call after a short delay (e.g., 1 second)
            }
        };

        fetchData();
    }, [rowData]);

    const handleFormChange = (changedValues, allValues) => {
        // Check if all fields are filled
        const isComplete = Object.values(allValues).every(value => value !== undefined && value !== '');
        setIsFormComplete(isComplete);
    };

    // let s3UrlPath = "";

    // const customRequest = async (imageshow, onSuccess, onError) => {
    //     try {
    //         const response = await axios.post("/api/uploadImage", imageshow, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });

    //         if (response.status === 200) {
    //             onSuccess("ok", response);
    //             console.log(response);
    //             // setS3Url(response.data);
    //             s3UrlPath = response.data.imageUrl;
    //         } else {
    //             onError("error", response);
    //         }
    //     } catch (error) {
    //         console.error("Error uploading file:", error);
    //         onError("error", error);
    //     }
    // };

    const handleBeforeUpload = (file) => {
        const formData = new FormData();
        formData.append("file", file);
        setimageshow(formData);

        return false;
    };

    const handleOk = async () => {
        setIsModalVisible(false); // Close the modal

        if (formValues) {
            // const onSuccess = (status, response) => {
            //     console.log("Upload success:", response);
            //     // Add any success handling logic here
            // };

            // const onError = (status, error) => {
            //     console.error("Upload error:", error);
            //     // Add any error handling logic here
            // };

            try {
                // await customRequest(imageshow, onSuccess, onError);
                await postData(formValues);
            } catch (error) {
                console.error("Error:", error);
            }
        }

        // Reset form fields
        if (formRef.current) {
            formRef.current.resetFields();
        }

        message.success("Campaign created successfully");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onFinish = (values) => {
        setIsModalVisible(true)
        console.log("Form values:", values);
        setFormValues(values);
    };
    const postData = async (values) => {
        try {
            const data1 = {
                Approval: "PENDING_APPROVAL",
                campaign_name: values.Name,
                Account_Number: values.Account_Number,
                fbstatus: "No-Live",
                camapaignlevel: {
                    createdby: session?.user?.name,
                    Name: values.Name,
                    Objectives: values.Objectives,
                    Special_categories: values.Special_categories,
                    Bid_strategy: values.Bid_strategy,
                    Daily_amount: (parseInt(values.Daily_amount) * 100),
                    Status: values.Status
                },
                adsetlevel: {
                    AdsetName: values.AdsetName,
                    optimization_goal: values.optimization_goal,
                    billing_event: values.billing_event,
                    start_time: moment(values.DatePicker).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
                    action_source: values.action_source,
                    custom_event_type: values.custom_event_type,
                    pixel_id: values.pixel_id,
                    bid_amount: values.bid_amount ? (parseInt(values.bid_amount) * 100) : 0,
                    countries: values.countries,
                    Min_Age: values.Min_Age,
                    Max_Age: values.Max_Age,
                    Gender: parseInt(values.Gender),
                    publisher_platforms: values.publisher_platforms,
                    Facebook_positions: values.Facebook_positions,
                    device_platforms: values.device_platforms,
                    buying_type: "AUCTION"
                },
                addlevel: {
                    AddName: values.AddName,
                    filename: EditCampaignData?.addlevel?.filename,
                    imag_hash: EditCampaignData?.addlevel?.imag_hash,
                    page_id: values.page_id,
                    message: values.message,
                    headline: values.headline,
                    Description: values.Description,
                    Caption: values.Caption,
                    Website_URL: values.Website_URL,
                    urlParameters: values.urlParameters
                }
            };

            const response = await fetch(`https://www.testapi.adsgoat.in/api/updateFormData/${rowData.identifier}`, {
                method: 'PUT',
                headers: {

                    'Content-Type': 'application/json',
                    Authorization: token
                },
                body: JSON.stringify(data1)
            });

            if (response.ok) {
                console.log('Form data submitted successfully');
                onClose(); // Close the drawer or perform any other action
            } else {
                console.error('Failed to submit form data');
            }
        } catch (error) {
            console.error('Error submitting form data:', error);
        }
    };


    const handleChange = (info) => {
        if (info.fileList.length > 0) {
            // Update the selected file
            setSelectedFile(info.fileList[0].originFileObj);
        } else {
            setSelectedFile(null); // Clear the selected file if fileList is empty
        }
    };

    const initialValues = {
        Account_Number: EditCampaignData.Account_Number,
        // createdby:EditCampaignData?.camapaignlevel?.createdby,
        Name: EditCampaignData?.camapaignlevel?.Name,
        Objectives: EditCampaignData?.camapaignlevel?.Objectives,
        Special_categories: EditCampaignData?.camapaignlevel?.Special_categories,
        Bid_strategy: EditCampaignData?.camapaignlevel?.Bid_strategy,
        Daily_amount: (EditCampaignData?.camapaignlevel?.Daily_amount) / 100,
        Status: EditCampaignData?.camapaignlevel?.Status,
        AdsetName: EditCampaignData?.adsetlevel?.AdsetName,
        optimization_goal: EditCampaignData?.adsetlevel?.optimization_goal,
        billing_event: EditCampaignData?.adsetlevel?.billing_event,
        // start_time: EditCampaignData?.adsetlevel?.start_time,
        action_source: EditCampaignData?.adsetlevel?.action_source,
        custom_event_type: EditCampaignData?.adsetlevel?.custom_event_type,
        pixel_id: EditCampaignData?.adsetlevel?.pixel_id,
        bid_amount: (EditCampaignData?.adsetlevel?.bid_amount) / 100,
        countries: EditCampaignData?.adsetlevel?.countries,
        Min_Age: EditCampaignData?.adsetlevel?.Min_Age,
        Max_Age: EditCampaignData?.adsetlevel?.Max_Age,
        Gender: EditCampaignData?.adsetlevel?.Gender,
        publisher_platforms: EditCampaignData?.adsetlevel?.publisher_platforms,
        device_platforms: EditCampaignData?.adsetlevel?.device_platforms,
        Facebook_positions: EditCampaignData?.adsetlevel?.Facebook_positions,
        // buying_type: EditCampaignData?.adsetlevel?.buying_type,
        AddName: EditCampaignData?.addlevel?.AddName,
        // filename: EditCampaignData?.addlevel?.filename,
        page_id: EditCampaignData?.addlevel?.page_id,
        message: EditCampaignData?.addlevel?.message,
        headline: EditCampaignData?.addlevel?.headline,
        Description: EditCampaignData?.addlevel?.Description,
        Caption: EditCampaignData?.addlevel?.Caption,
        Website_URL: EditCampaignData?.addlevel?.Website_URL,
        urlParameters: EditCampaignData?.addlevel?.urlParameters,

    };


    return (
        <Drawer
            title="Edit campaign campaign"
            width="100%"
            open={visible}
            onClose={onClose}
        >
            {EditCampaignData.identifier === rowData.identifier ? (

                <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues}>
                    <Collapse accordion defaultActiveKey={['1']} >
                        <Panel header="CAMPAIGN LEVEL" key="1">
                            <div style={{ display: "flex" }}>
                                <Form.Item
                                    name="Account_Number"
                                    label={<span style={{ color: "#B4B4B4" }}>Account Number</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.2 }}>
                                    <Input

                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Name"
                                    label={<span style={{ color: "#B4B4B4" }}>Campaign name</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.25 }}>
                                    <Input
                                        style={{ width: "100%", marginLeft: "3%" }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Objectives"
                                    label={<span style={{ color: "#B4B4B4" }}>Objectives</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads" },
                                            { value: "OUTCOME_SALES", label: "Sales" },
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App promotion" }

                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Special_categories"
                                    label={<span style={{ color: "#B4B4B4" }}>Categories</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        mode="multiple"
                                        allowClear
                                        options={[
                                            { value: "HOUSING", label: "Housing" },
                                            { value: "CREDIT", label: "Credit" },
                                            { value: "EMPLOYMENT", label: "Employment" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
                                            { value: "NONE", label: "None" }

                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Bid_strategy"
                                    label={<span style={{ color: "#B4B4B4" }}>Bid strategy</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume" },
                                            { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap" },
                                            { value: "COST_CAP", label: "Cost Cap" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" }
                                        ]}
                                        onChange={handleBidStrategyChange}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Daily_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Input
                                        type="number"
                                        placeholder="$"

                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Status"
                                    label={<span style={{ color: "#B4B4B4" }}>Status</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "ACTIVE", label: "ACTIVE" },
                                            { value: "PAUSED", label: "PAUSE" },

                                        ]}
                                    />
                                </Form.Item>

                            </div>
                        </Panel>
                        <Panel header="ADSET LEVEL" key="2">
                            <div style={{ display: "flex" }}>
                                <Form.Item
                                    name="AdsetName"
                                    label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.25 }}>
                                    <Input
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="optimization_goal"
                                    label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                                            { value: "LINK_CLICKS", label: "Clicks" },
                                            { value: "REACH", label: "Reach" },
                                            { value: "VALUE", label: "Value" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="billing_event"
                                    label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "IMPRESSIONS", label: "Impressions" },
                                            { value: "VALUE", label: "Value" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="DatePicker"
                                    label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}

                                >
                                    <DatePicker />
                                </Form.Item>
                                <Form.Item
                                    name="action_source"
                                    label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "website", label: "Website" },
                                            { value: "email", label: "Email" },
                                            { value: "app", label: "App" },
                                            { value: "phone_call", label: "Phone Call" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="custom_event_type"
                                    label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "LEAD", label: "Lead" },
                                            { value: "PURCHASE", label: "Purchase" },
                                            { value: "SEARCH", label: "Search" },
                                            { value: "CONTACT", label: "Contact" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="pixel_id"
                                    label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.15, marginLeft: "2%" }}>
                                    <Input
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="bid_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Bid_amount</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Input
                                        type="number"
                                        placeholder="$"

                                    />
                                </Form.Item>



                            </div>
                            <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>
                            <div style={{ display: "flex" }}>
                                <Form.Item
                                    name="countries"
                                    label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.12 }}>
                                    <Select
                                        variant="filled"

                                        options={[
                                            { value: "US", label: "United States" },
                                            { value: "GB", label: "United Kingdom" },
                                            { value: "AU", label: "Australia" },
                                            { value: "IN", label: "India" },
                                            { value: "AE", label: "United Arab Emirates" },
                                            { value: "CA", label: "Canada" },
                                            { value: "DE", label: "Germany" },
                                            { value: "FR", label: "France" },
                                            { value: "JP", label: "Japan" },
                                            { value: "CN", label: "China" },
                                            { value: "BR", label: "Brazil" },
                                            { value: "ZA", label: "South Africa" },
                                            { value: "RU", label: "Russia" },
                                            { value: "IT", label: "Italy" },
                                            { value: "ES", label: "Spain" },
                                            { value: "SG", label: "Singapore" },
                                            { value: "NZ", label: "New Zealand" },
                                            { value: "MX", label: "Mexico" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Min_Age"
                                    label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ marginLeft: "2%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "18", label: "18" },
                                            { value: "25", label: "25" },
                                            { value: "35", label: "35" },
                                            { value: "40", label: "40", disabled: true },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Max_Age"
                                    label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                >
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "20", label: "20" },
                                            { value: "30", label: "30" },
                                            { value: "65", label: "65+" },
                                            { value: "80", label: "80", disabled: true },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Gender"
                                    label={<span style={{ color: "#B4B4B4" }}> Gender</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "0", label: "All" },
                                            { value: "1", label: "Male" },
                                            { value: "2", label: "Female" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="publisher_platforms"
                                    label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "facebook", label: "Facebook" },
                                            { value: "instagram", label: "Instagram" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Facebook_positions"
                                    label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.25, marginLeft: "2%" }}>
                                    <Select
                                        mode="multiple"
                                        variant="filled"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder="Please select"
                                        // defaultValue={['a10', 'c12']}
                                        // onChange={handlepositionChange}
                                        options={[
                                            { value: "feed", label: "Facebook Feed" },
                                            { value: "marketplace", label: "Facebook Marketplace" },
                                            { value: "video_feeds", label: "Facebook Video Feeds" },
                                            { value: "search", label: "Facebook Search Results" },
                                            { value: "explore", label: "Facebook business Explore" },
                                            { value: "right_hand_column", label: "Facebook Right Column" },
                                            { value: "story", label: "Facebook Stories" },
                                            { value: "instream_video", label: "Facebook In-Stream Videos" },
                                            { value: "reels", label: "Facebook Reels" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="device_platforms"
                                    label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.18, marginLeft: "2%" }}>
                                    <Select
                                        mode="multiple"
                                        variant="filled"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder="Please select"
                                        options={[
                                            { value: "mobile", label: "Mobile" },
                                            { value: "desktop", label: "Desktop" }
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                        </Panel>
                        <Panel header="ADD LEVEL" key="3">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: "70%", marginRight: "5%" }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {/* <Form.Item
                                            name="MediaContent"
                                            label={<span style={{ color: "#B4B4B4" }}>Upload</span>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select Upload!",
                                                },
                                            ]}
                                            style={{ flex: 1 }}
                                        >
                                            <Upload
                                                beforeUpload={handleBeforeUpload}
                                                onChange={handleChange}
                                                maxCount={1}
                                                accept=".png,.jpg,.jpeg"
                                            >
                                                <Button icon={<UploadOutlined />}>Select File</Button>
                                            </Upload>
                                        </Form.Item> */}
                                        <Form.Item
                                            name="page_id"
                                            label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select an option!",
                                                },
                                            ]}
                                            style={{ flex: 3 }}
                                        >
                                            <Input style={{ width: "45%" }} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item
                                        name="AddName"
                                        label={<span style={{ color: "#B4B4B4" }}>Ad name</span>}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select an option!",
                                            },
                                        ]}
                                    >
                                        <Input
                                            style={{ width: "60%" }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Primary text"
                                        name="message"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a message!",
                                            },
                                        ]}
                                        required
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Primary text"
                                            autoSize={{ minRows: 2, maxRows: 10 }}

                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Headline"
                                        name="headline"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a Name!",
                                            },
                                        ]}
                                        required
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Headline"
                                            autoSize={{ minRows: 2, maxRows: 10 }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Description"
                                        name="Description"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a Description!",
                                            },
                                        ]}
                                        required
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Description"
                                            autoSize={{ minRows: 2, maxRows: 10 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Caption"
                                        name="Caption"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a Caption!",
                                            },
                                        ]}
                                        required
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Caption"
                                            autoSize={{ minRows: 2, maxRows: 10 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Website_URL"
                                        name="Website_URL"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select Website_URL!",
                                            },
                                        ]}
                                        required
                                        tooltip="This is a required field"
                                    >
                                        <TextArea
                                            placeholder="Website_URL"
                                            autoSize={{ minRows: 5, maxRows: 15 }}

                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="URL Parameters"
                                        name="urlParameters"
                                        tooltip="This is a required field"
                                    >
                                        <TextArea
                                            placeholder="URL Parameters"
                                            autoSize={{ minRows: 5, maxRows: 15 }}
                                        />
                                    </Form.Item>
                                </div>
                                <div style={{ flex: "30%" }}>
                                    {EditCampaignData?.addlevel?.filename && (
                                        <div className="container-ad-preview">
                                            <div className="ad-preview">
                                                <div className="ad-heading">
                                                    <div className="img">
                                                        <img
                                                            src={EditCampaignData?.addlevel?.filename}
                                                            alt="page id"
                                                            width="40"
                                                            height="40"
                                                        />
                                                    </div>
                                                    <div className="title">
                                                        <div className="main">{"Facebook Page"}</div>
                                                        <div className="sub">
                                                            Sponsored <GlobalOutlined style={{ opacity: "0.6" }} />
                                                        </div>
                                                    </div>
                                                    <div className="close">
                                                        <CloseOutlined style={{ fontSize: "20px" }} />
                                                    </div>
                                                    <div className="moreoptions">
                                                        <MoreOutlined style={{ fontSize: "20px" }} />
                                                    </div>
                                                </div>
                                                <div className="ad-desc">{"adMessage"}</div>
                                                <div className="ad-image">
                                                    <img
                                                        src={EditCampaignData?.addlevel?.filename}
                                                    />
                                                </div>
                                                <div className="ad-cta">
                                                    <div className="details">
                                                        <div className="link">{"adCaption"}</div>
                                                        <div className="title">{"adName"}</div>
                                                        <div className="desc">{"adDesc"}</div>
                                                    </div>
                                                    <div className="ad-button">
                                                        <button type="button">Learn More</button>
                                                    </div>
                                                </div>
                                                <div className="icons">
                                                    <div className="like">
                                                        <LikeOutlined style={{ fontSize: "20px" }} />
                                                        Like
                                                    </div>
                                                    <div className="comment">
                                                        <CommentOutlined style={{ fontSize: "20px" }} />
                                                        Comment
                                                    </div>
                                                    <div className="share">
                                                        <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                        Share
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>


                        </Panel>
                    </Collapse>
                    <Form.Item label=" ">
                        {isFormComplete && (
                            <Button type="primary" htmlType="submit" style={{ background: '#21c55d', minWidth: '200px' }}>
                                Submit
                            </Button>
                        )}
                    </Form.Item>
                    <Modal
                        title="Confirmation"
                        open={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}>
                        <p>Are you sure you want to submit?</p>
                    </Modal>
                </Form>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    {/* <Spin size="large" /> */}
                    <div style={{ padding: '24px' }}>
                        <Skeleton active paragraph={{ rows: 20 }} />
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default EditCampaignDrawer;
