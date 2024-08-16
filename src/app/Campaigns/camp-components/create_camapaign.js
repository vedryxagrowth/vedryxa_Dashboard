"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;
const publisherOptions = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Messenger', value: 'messenger' },
    { label: 'Audience Network', value: 'audience_network' }
];

const positionOptions = {
    facebook: [
        { key: "feed", label: "Facebook Feed" },
        { key: "marketplace", label: "Facebook Marketplace" },
        { key: "video_feeds", label: "Facebook Video Feeds" },
        { key: "instream_video", label: "Facebook In-Stream Videos" },
        { key: "facebook_reels", label: "Facebook Reels" },
        { key: "profile_feed", label: "Facebook Profile Feed" },
        { key: "search", label: "Facebook search" }
    ],
    instagram: [
        { key: "stream", label: "Instagram Stream" },
        { key: "story", label: "Instagram Story" },
        { key: "explore", label: "Instagram Explore" },
        { key: "explore_home", label: "Instagram Explore Home" },
        { key: "reels", label: "Instagram Reels" },
        { key: "profile_feed", label: "Instagram Profile Feed" },
        { key: "ig_search", label: "Instagram Search" },
        { key: "profile_reels", label: "Instagram Profile Reels" }
    ],
    messenger: [
        { key: "messenger_home", label: "Messenger Home" },
        { key: "story", label: "Messenger Story" }
    ],
    audience_network: [
        { key: "classic", label: "Audience Network Classic" },
        { key: "rewarded_video", label: "Audience Network Rewarded Video" }
    ]
};
const localesdata = [
    {
        "name": "English (US)",
        "key": 6
    },
    {
        "name": "Catalan",
        "key": 1
    },
    {
        "name": "Czech",
        "key": 2
    },
    {
        "name": "Cebuano",
        "key": 56
    },
    {
        "name": "Welsh",
        "key": 3
    },
    {
        "name": "Danish",
        "key": 4
    },
    {
        "name": "German",
        "key": 5
    },
    {
        "name": "Basque",
        "key": 59
    },
    {
        "name": "Spanish",
        "key": 23
    },
    {
        "name": "Spanish (Spain)",
        "key": 7
    },
    {
        "name": "Guarani",
        "key": 66
    },
    {
        "name": "Finnish",
        "key": 8
    },
    {
        "name": "French (France)",
        "key": 9
    },
    {
        "name": "Galician",
        "key": 65
    },
    {
        "name": "Hungarian",
        "key": 30
    },
    {
        "name": "Italian",
        "key": 10
    },
    {
        "name": "Japanese",
        "key": 11
    },
    {
        "name": "Korean",
        "key": 12
    },
    {
        "name": "Norwegian (bokmal)",
        "key": 13
    },
    {
        "name": "Norwegian (nynorsk)",
        "key": 84
    },
    {
        "name": "Dutch",
        "key": 14
    },
    {
        "name": "Frisian",
        "key": 63
    },
    {
        "name": "Polish",
        "key": 15
    },
    {
        "name": "Portuguese (Brazil)",
        "key": 16
    },
    {
        "name": "Portuguese (Portugal)",
        "key": 31
    },
    {
        "name": "Romanian",
        "key": 32
    },
    {
        "name": "Russian",
        "key": 17
    },
    {
        "name": "Slovak",
        "key": 33
    },
    {
        "name": "Slovenian",
        "key": 34
    },
    {
        "name": "Swedish",
        "key": 18
    },
    {
        "name": "Thai",
        "key": 35
    },
    {
        "name": "Turkish",
        "key": 19
    },
    {
        "name": "Northern Kurdish (Kurmanji)",
        "key": 76
    },
    {
        "name": "Simplified Chinese (China)",
        "key": 20
    },
    {
        "name": "Traditional Chinese (Hong Kong)",
        "key": 21
    },
    {
        "name": "Traditional Chinese (Taiwan)",
        "key": 22
    },
    {
        "name": "Afrikaans",
        "key": 36
    },
    {
        "name": "Albanian",
        "key": 87
    },
    {
        "name": "Armenian",
        "key": 68
    },
    {
        "name": "Azerbaijani",
        "key": 53
    },
    {
        "name": "Belarusian",
        "key": 54
    },
    {
        "name": "Bengali",
        "key": 45
    },
    {
        "name": "Bosnian",
        "key": 55
    },
    {
        "name": "Bulgarian",
        "key": 37
    },
    {
        "name": "Croatian",
        "key": 38
    },
    {
        "name": "Flemish",
        "key": 83
    },
    {
        "name": "English (UK)",
        "key": 24
    },
    {
        "name": "Esperanto",
        "key": 57
    },
    {
        "name": "Estonian",
        "key": 58
    },
    {
        "name": "Faroese",
        "key": 62
    },
    {
        "name": "French (Canada)",
        "key": 44
    },
    {
        "name": "Georgian",
        "key": 72
    },
    {
        "name": "Greek",
        "key": 39
    },
    {
        "name": "Gujarati",
        "key": 67
    },
    {
        "name": "Hindi",
        "key": 46
    },
    {
        "name": "Icelandic",
        "key": 69
    },
    {
        "name": "Indonesian",
        "key": 25
    },
    {
        "name": "Irish",
        "key": 64
    },
    {
        "name": "Javanese",
        "key": 71
    },
    {
        "name": "Kannada",
        "key": 75
    },
    {
        "name": "Kazakh",
        "key": 73
    },
    {
        "name": "Latvian",
        "key": 78
    },
    {
        "name": "Lithuanian",
        "key": 40
    },
    {
        "name": "Macedonian",
        "key": 79
    },
    {
        "name": "Malay",
        "key": 41
    },
    {
        "name": "Marathi",
        "key": 81
    },
    {
        "name": "Mongolian",
        "key": 80
    },
    {
        "name": "Nepali",
        "key": 82
    },
    {
        "name": "Punjabi",
        "key": 47
    },
    {
        "name": "Serbian",
        "key": 42
    },
    {
        "name": "Swahili",
        "key": 88
    },
    {
        "name": "Filipino",
        "key": 26
    },
    {
        "name": "Tamil",
        "key": 48
    },
    {
        "name": "Telugu",
        "key": 49
    },
    {
        "name": "Malayalam",
        "key": 50
    },
    {
        "name": "Ukrainian",
        "key": 52
    },
    {
        "name": "Uzbek",
        "key": 91
    },
    {
        "name": "Vietnamese",
        "key": 27
    },
    {
        "name": "Khmer",
        "key": 74
    },
    {
        "name": "Tajik",
        "key": 89
    },
    {
        "name": "Arabic",
        "key": 28
    },
    {
        "name": "Hebrew",
        "key": 29
    },
    {
        "name": "Urdu",
        "key": 90
    },
    {
        "name": "Persian",
        "key": 60
    },
    {
        "name": "Pashto",
        "key": 85
    },
    {
        "name": "Sinhala",
        "key": 86
    },
    {
        "name": "Japanese (Kansai)",
        "key": 70
    },
    {
        "name": "English (All)",
        "key": 1001
    },
    {
        "name": "Spanish (All)",
        "key": 1002
    },
    {
        "name": "French (All)",
        "key": 1003
    },
    {
        "name": "Chinese (All)",
        "key": 1004
    },
    {
        "name": "Portuguese (All)",
        "key": 1005
    }
]

const CreateCampaignDrawer = ({ visible, onClose, changeRRefrst, accountis }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    // console.log("heyy", formValues?.Account_Number)
    const [accountNumber, setAccountNumber] = useState(accountis);
    const [imagehash, setimagehash] = useState(null)
    const [filesof, setfilesof] = useState(null)
    const [pixelids, setpixelid] = useState(null)
    const [pageid, setpageid] = useState(null)
    const { data: session } = useSession();
    // console.log(session, "session")
    // console.log("accountis", accountis)

    var token = localStorage.getItem("token")
    const [showBidAmount, setShowBidAmount] = useState(false);
    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedPositions, setSelectedPositions] = useState({});


    const handlePublisherChange = (value) => {
        setSelectedPublishers(value);
        setSelectedPositions([]); // Clear positions when publisher selection changes
        // form.resetFields(['positions']); // Reset positions field
    };

    const handlePositionChange = (value) => {
        setSelectedPositions(value);
        setSelectedPositions(["feed"]); // Set default positions to "feed"
        // form.resetFields(['positions']);
    };

    const getPositionOptions = () => {
        const allPositions = selectedPublishers.reduce((acc, publisher) => {
            return acc.concat(positionOptions[publisher] || []);
        }, []);
        return [...new Set(allPositions)]; // Remove duplicates
    };

    const handleBidStrategyChange = (value) => {
        // Show bid_amount if the selected bid strategy is "Bid Cap", otherwise hide it
        setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP");
    };
    useEffect(() => {
        setAccountNumber(accountis);
    }, [accountis]);

    const Accountchange = (e) => {
        setAccountNumber(e.target.value);
    };
    // const handlepositionChange = async (values) => {
    //     console.log(values, "handlepositionChange")
    // }
    const handleNameChange = async (e) => {
        // console.log("Account Number:", accountNumber);

        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${accountNumber}`,
                {
                    headers: {
                        'Authorization': token
                    }
                }
            );
            console.log("siddu account data", response.data);
            setimagehash(response.data)
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            // Handle error
        }
    };

    const getpixelandpageid = async () => {
        try {
            // Make the GET request to the Facebook Graph API
            const Pixeldata = await axios.get(
                `https://graph.facebook.com/v19.0/act_${imagehash[0]?.extAccountId}/adspixels`,
                {
                    params: {
                        fields: 'id,name',
                        access_token: imagehash[0]?.token
                    }
                }
            );

            console.log('Response data PIXEL ID:', Pixeldata?.data?.data[0]?.id);
            setpixelid(Pixeldata?.data?.data[0]?.id)
            // res.status(200).json(response.data);
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            // res.status(error.response?.status || 500).json({ error: 'Internal Server Error' });
        }

        try {
            // Make the GET request to the Facebook Graph API
            const pageiddata = await axios.get(
                `https://graph.facebook.com/v19.0/act_${imagehash[0]?.extAccountId}/adcreatives`,
                {
                    params: {
                        fields: 'object_story_spec{page_id}',
                        access_token: imagehash[0]?.token,
                    }
                }
            );

            // Log the response data
            console.log('Response data Pageid:', pageiddata?.data?.data[0]?.object_story_spec?.page_id);
            setpageid(pageiddata?.data?.data[0]?.object_story_spec?.page_id)
            // res.status(200).json(response.data);
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            // res.status(error.response?.status || 500).json({ error: 'Internal Server Error' });
        }
    }
    const handleFormChange = (changedValues, allValues) => {
        // Check if all fields are filled
        const isComplete = Object.values(allValues).every(value => value !== undefined && value !== '');
        setIsFormComplete(isComplete);
    };

    let s3UrlPath = "";
    let hashid = "";

    const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
        var token = imagehash[0].token
        var account = imagehash[0].extAccountId



        try {
            const response = await axios.post("/api/uploadImage", imageshow, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const formData = new FormData();
            formData.append('filename', filesof);
            formData.append('access_token', token);

            const hasrespons = await axios.post(`https://graph.facebook.com/v19.0/act_${account}/adimages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Ensure to set Content-Type to multipart/form-data
                }
            })


            if (response.status === 200 && hasrespons.status === 200) {
                onSuccess("ok", response);
                console.log(response);
                hashid = hasrespons.data?.images?.[filesof.name]?.hash;
                console.log("hashid is", hashid);
                // setS3Url(response.data);
                s3UrlPath = response.data.imageUrl;
            } else {
                onError("error", response);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            onError("error", error);
        }
    };

    const handleBeforeUpload = (file) => {
        setfilesof(file)
        const formData = new FormData();
        formData.append("file", file);
        setimageshow(formData);
        return false;
    };

    const handleOk = async () => {
        setIsModalVisible(false); // Close the modal

        if (formValues) {
            const onSuccess = (status, response) => {
                console.log("Upload success:", response);
                // Add any success handling logic here
            };

            const onError = (status, error) => {
                console.error("Upload error:", error);
                // Add any error handling logic here
            };

            try {
                await customRequest(imageshow, imagehash, onSuccess, onError);
                await postData(formValues);
                changeRRefrst()
            } catch (error) {
                console.error("Error:", error);
            }
        }

        // Reset form fields
        // if (formRef.current) {
        //     formRef.current.resetFields();
        // }

        message.success("Campaign created successfully");
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onFinish = (values) => {
        const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
            acc[publisher + '_positions'] = values.positions.filter(position =>
                positionOptions[publisher].map(option => option.key).includes(position)
            );
            return acc;
        }, {});
        console.log({
            publisher_platforms: values.publisher_platforms,
            ...selectedPlatforms, ...values
        });

        setIsModalVisible(true);
        setFormValues({
            publisher_platforms: values.publisher_platforms,
            ...selectedPlatforms,
            ...values
        });
    };

    const postData = async (values) => {
        try {
            const data1 = {
                campaign_name: values.Name,
                Account_Number: values.Account_Number,
                Approval: "PENDING_APPROVAL",
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
                    start_time: moment(values.DatePicker.$d).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
                    action_source: values.action_source,
                    custom_event_type: values.custom_event_type,
                    pixel_id: values.pixel_id,
                    bid_amount: values.bid_amount ? parseFloat(values.bid_amount) * 100 : 0,
                    countries: values.countries,
                    Min_Age: values.Min_Age,
                    Max_Age: values.Max_Age,
                    Gender: parseInt(values.Gender),
                    publisher_platforms: values.publisher_platforms,
                    Facebook_positions: values.facebook_positions || [],
                    instagram_positions: values.instagram_positions || [],
                    audience_network_positions: values.audience_network_positions || [],
                    messenger_positions: values.messenger_positions || [],
                    position: values.positions,
                    locales: values.Language,
                    device_platforms: values.device_platforms,
                    buying_type: "AUCTION"
                },
                addlevel: [{
                    id: uuidv4(),
                    AddName: values.AddName,
                    filename: s3UrlPath,
                    imag_hash: hashid,
                    page_id: values.page_id,
                    message: values.message,
                    headline: values.headline,
                    Description: values.Description,
                    Caption: values.Caption,
                    Website_URL: values.Website_URL,
                    urlParameters: values.urlParameters
                }]
            };
            console.log(data1, "from UI")
            const response = await fetch('https://www.testapi.adsgoat.in/api/submitFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                },
                body: JSON.stringify(data1)
            });

            // Check if the request was successful
            if (response.ok) {
                console.log('Form data submitted successfully');
                onClose(); // Close the drawer or perform any other action
            } else {
                console.error('Failed to subit form data');
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
    const currentDate = moment();
    console.log(moment(), "currentDate")
    let initialValues = {
        Status: "PAUSED",
        // Objectives: "OUTCOME_LEADS",
        Special_categories: "NONE",
        Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        Status: "PAUSED",
        optimization_goal: "OFFSITE_CONVERSIONS",
        billing_event: "IMPRESSIONS",
        action_source: "website",
        custom_event_type: "LEAD",
        countries: "US",
        Min_Age: "18",
        Max_Age: "65",
        Gender: "0",
        positions: ["feed"],
        publisher_platforms: ["facebook"],
        Account_Number: accountis == "All" ? '' : accountis,
        Language: [6]
        // device_platforms: "mobile",

    };
    useEffect(() => {
        // Update the form fields when accountis changes
        form.setFieldsValue({ Account_Number: accountis, pixel_id: pixelids, page_id: pageid });
    }, [pixelids, pageid, accountis, form]);


    const handleDrawerClose = () => {
        form.resetFields()
        onClose(); // Call onClose handler to close the drawer
    };
    return (
        <Drawer
            title="Create a new campaign"
            width="95%"
            open={visible}
            onClose={handleDrawerClose}
        >
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
                                <Input value={accountNumber} onChange={Accountchange} />
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
                                <Input onChange={handleNameChange}
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
                                <Select onChange={getpixelandpageid}
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
                                        { value: "PAUSED", label: "PAUSED" },
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
                                initialValue={currentDate}

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
                                initialValue={pixelids}
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
                            {showBidAmount && (
                                <Form.Item
                                    name="bid_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Bid_amount</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a bid amount!",
                                        },
                                        {
                                            validator: (_, value) =>
                                                value && !isNaN(value) && parseFloat(value) > 0
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error("Please enter a valid float value!")),
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Input
                                        type="number"
                                        placeholder="$"
                                        onKeyPress={(event) => {
                                            const charCode = event.charCode;
                                            const charStr = String.fromCharCode(charCode);
                                            const regex = /^[0-9]*\.?[0-9]*$/;
                                            if (!regex.test(charStr)) {
                                                event.preventDefault();
                                            }
                                        }}
                                    />
                                </Form.Item>
                            )}



                        </div>
                        <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "green" }}>Targeting</span>
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
                                name="Language"
                                label={<span style={{ color: "#B4B4B4" }}>Language</span>}
                                rules={[{ required: true, message: "Please select an option!" }]}
                                style={{ flex: 0.1, marginLeft: "2%" }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Language"
                                    // onChange={handlePublisherChange}
                                    // value={selectedPublishers}
                                    style={{ width: 150 }}
                                >
                                    {localesdata.map(option => (
                                        <Option key={option.key} value={option.key}>
                                            {option.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="publisher_platforms"
                                label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                rules={[{ required: true, message: "Please select an option!" }]}
                                style={{ flex: 0.1, marginLeft: "2%" }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Publishers"
                                    onChange={handlePublisherChange}
                                    value={selectedPublishers}
                                    style={{ width: 300 }}
                                >
                                    {publisherOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="positions"
                                label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                rules={[{ required: true, message: "Please select an option!" }]}
                                style={{ flex: 0.1, marginLeft: "2%" }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Positions"
                                    value={selectedPositions}
                                    onChange={handlePositionChange}
                                    // disabled={selectedPublishers.length === 0}
                                    style={{ width: 400 }}
                                >
                                    {selectedPublishers.length > 0 && getPositionOptions().map(position => (
                                        <Option key={`${position.key}_${position.label}`} value={position.key}>
                                            {position.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>


                            {/* <Form.Item
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
                            </Form.Item> */}
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
                                    <Form.Item
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
                                            accept="image/*, video/*"
                                        >
                                            <Button icon={<UploadOutlined />}>Select File</Button>
                                        </Upload>
                                    </Form.Item>
                                    <Form.Item
                                        name="page_id"
                                        initialValue={pageid}
                                        label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select an option!",
                                            },
                                        ]}
                                        style={{ flex: 3, marginLeft: "1%" }}
                                    >
                                        <Input style={{ width: "45%" }} />
                                    </Form.Item>
                                </div>
                                <Form.Item
                                    name="AddName"
                                    label={<span style={{ color: "#B4B4B4" }}>Add name</span>}
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
                                {selectedFile && (
                                    <div className="container-ad-preview">
                                        <div className="ad-preview">
                                            <div className="ad-heading">
                                                <div className="img">
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
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
                                                    src={selectedFile && URL.createObjectURL(selectedFile)}
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
        </Drawer>
    );
};

export default CreateCampaignDrawer;
