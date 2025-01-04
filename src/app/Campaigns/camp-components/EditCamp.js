// "use client"
// import React from 'react';
// import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin } from 'antd';
// import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
// import moment from 'moment-timezone';
// import { useState, useRef } from 'react';
// import TextArea from 'antd/es/input/TextArea';
// import axios from 'axios';
// import { useEffect } from 'react';
// import { useSession } from 'next-auth/react';

// const { Panel } = Collapse;
// const { Option } = Select;
// const { Step } = Steps;

// const EditCampaignDrawer1 = ({ rowData, visible, onClose }) => {
//     if (!rowData) {
//         return null
//     }
//     const [EditCampaignData, setEditCampaignData] = useState({});
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [imageshow, setimageshow] = useState(null);
//     const [formValues, setFormValues] = useState(null);
//     const [form] = Form.useForm();
//     const formRef = useRef(null);
//     const [isFormComplete, setIsFormComplete] = useState(false);
//     const { data: session } = useSession();
//     var token = localStorage.getItem("token")
//     const [showBidAmount, setShowBidAmount] = useState(false);
//     const handleBidStrategyChange = (value) => {
//         // Show bid_amount if the selected bid strategy is "Bid Cap", otherwise hide it
//         setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP");
//     };


//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 if (rowData) {
//                     const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${rowData.identifier}`
//                         , {

//                             headers: {
//                                 'Authorization': token
//                             }

//                         }
//                     );
//                     console.log("hello Editdata", response.data[0]);
//                     setEditCampaignData(response.data[0]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching campaign list:", error);
//                 // Retry the API call after a short delay (e.g., 1 second)
//             }
//         };

//         fetchData();
//     }, [rowData]);

//     const handleFormChange = (changedValues, allValues) => {
//         // Check if all fields are filled
//         const isComplete = Object.values(allValues).every(value => value !== undefined && value !== '');
//         setIsFormComplete(isComplete);
//     };

//     // let s3UrlPath = "";

//     // const customRequest = async (imageshow, onSuccess, onError) => {
//     //     try {
//     //         const response = await axios.post("/api/uploadImage", imageshow, {
//     //             headers: {
//     //                 "Content-Type": "multipart/form-data",
//     //             },
//     //         });

//     //         if (response.status === 200) {
//     //             onSuccess("ok", response);
//     //             console.log(response);
//     //             // setS3Url(response.data);
//     //             s3UrlPath = response.data.imageUrl;
//     //         } else {
//     //             onError("error", response);
//     //         }
//     //     } catch (error) {
//     //         console.error("Error uploading file:", error);
//     //         onError("error", error);
//     //     }
//     // };

//     const handleBeforeUpload = (file) => {
//         const formData = new FormData();
//         formData.append("file", file);
//         setimageshow(formData);

//         return false;
//     };

//     const handleOk = async () => {
//         setIsModalVisible(false); // Close the modal

//         if (formValues) {
//             // const onSuccess = (status, response) => {
//             //     console.log("Upload success:", response);
//             //     // Add any success handling logic here
//             // };

//             // const onError = (status, error) => {
//             //     console.error("Upload error:", error);
//             //     // Add any error handling logic here
//             // };

//             try {
//                 // await customRequest(imageshow, onSuccess, onError);
//                 await postData(formValues);
//             } catch (error) {
//                 console.error("Error:", error);
//             }
//         }

//         // Reset form fields
//         if (formRef.current) {
//             formRef.current.resetFields();
//         }

//         message.success("Campaign created successfully");
//         setTimeout(() => {
//             window.location.reload();
//         }, 2000);
//     };

//     const handleCancel = () => {
//         setIsModalVisible(false);
//     };
//     const onFinish = (values) => {
//         setIsModalVisible(true)
//         console.log("Form values:", values);
//         setFormValues(values);
//     };
//     const postData = async (values) => {
//         try {
//             const data1 = {
//                 Approval: "PENDING_APPROVAL",
//                 campaign_name: values.Name,
//                 Account_Number: values.Account_Number,
//                 fbstatus: "No-Live",
//                 camapaignlevel: {
//                     createdby: session?.user?.name,
//                     Name: values.Name,
//                     Objectives: values.Objectives,
//                     Special_categories: values.Special_categories,
//                     Bid_strategy: values.Bid_strategy,
//                     Daily_amount: (parseInt(values.Daily_amount) * 100),
//                     Status: values.Status
//                 },
//                 adsetlevel: {
//                     AdsetName: values.AdsetName,
//                     optimization_goal: values.optimization_goal,
//                     billing_event: values.billing_event,
//                     start_time: moment(values.DatePicker).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
//                     action_source: values.action_source,
//                     custom_event_type: values.custom_event_type,
//                     pixel_id: values.pixel_id,
//                     bid_amount: values.bid_amount ? (parseInt(values.bid_amount) * 100) : 0,
//                     countries: values.countries,
//                     Min_Age: values.Min_Age,
//                     Max_Age: values.Max_Age,
//                     Gender: parseInt(values.Gender),
//                     publisher_platforms: values.publisher_platforms,
//                     Facebook_positions: values.Facebook_positions,
//                     device_platforms: values.device_platforms,
//                     buying_type: "AUCTION"
//                 },
//                 addlevel: {
//                     AddName: values.AddName,
//                     filename: EditCampaignData?.addlevel?.filename,
//                     imag_hash: EditCampaignData?.addlevel?.imag_hash,
//                     page_id: values.page_id,
//                     message: values.message,
//                     headline: values.headline,
//                     Description: values.Description,
//                     Caption: values.Caption,
//                     Website_URL: values.Website_URL,
//                     urlParameters: values.urlParameters
//                 }
//             };

//             const response = await fetch(`https://www.testapi.adsgoat.in/api/updateFormData/${rowData.identifier}`, {
//                 method: 'PUT',
//                 headers: {

//                     'Content-Type': 'application/json',
//                     Authorization: token
//                 },
//                 body: JSON.stringify(data1)
//             });

//             if (response.ok) {
//                 console.log('Form data submitted successfully');
//                 onClose(); // Close the drawer or perform any other action
//             } else {
//                 console.error('Failed to submit form data');
//             }
//         } catch (error) {
//             console.error('Error submitting form data:', error);
//         }
//     };


//     const handleChange = (info) => {
//         if (info.fileList.length > 0) {
//             // Update the selected file
//             setSelectedFile(info.fileList[0].originFileObj);
//         } else {
//             setSelectedFile(null); // Clear the selected file if fileList is empty
//         }
//     };

//     const initialValues = {
//         Account_Number: EditCampaignData.Account_Number,
//         // createdby:EditCampaignData?.camapaignlevel?.createdby,
//         Name: EditCampaignData?.camapaignlevel?.Name,
//         Objectives: EditCampaignData?.camapaignlevel?.Objectives,
//         Special_categories: EditCampaignData?.camapaignlevel?.Special_categories,
//         Bid_strategy: EditCampaignData?.camapaignlevel?.Bid_strategy,
//         Daily_amount: (EditCampaignData?.camapaignlevel?.Daily_amount) / 100,
//         Status: EditCampaignData?.camapaignlevel?.Status,
//         AdsetName: EditCampaignData?.adsetlevel?.AdsetName,
//         optimization_goal: EditCampaignData?.adsetlevel?.optimization_goal,
//         billing_event: EditCampaignData?.adsetlevel?.billing_event,
//         // start_time: EditCampaignData?.adsetlevel?.start_time,
//         action_source: EditCampaignData?.adsetlevel?.action_source,
//         custom_event_type: EditCampaignData?.adsetlevel?.custom_event_type,
//         pixel_id: EditCampaignData?.adsetlevel?.pixel_id,
//         bid_amount: (EditCampaignData?.adsetlevel?.bid_amount) / 100,
//         countries: EditCampaignData?.adsetlevel?.countries,
//         Min_Age: EditCampaignData?.adsetlevel?.Min_Age,
//         Max_Age: EditCampaignData?.adsetlevel?.Max_Age,
//         Gender: EditCampaignData?.adsetlevel?.Gender,
//         publisher_platforms: EditCampaignData?.adsetlevel?.publisher_platforms,
//         device_platforms: EditCampaignData?.adsetlevel?.device_platforms,
//         Facebook_positions: EditCampaignData?.adsetlevel?.Facebook_positions,
//         // buying_type: EditCampaignData?.adsetlevel?.buying_type,
//         AddName: EditCampaignData?.addlevel?.AddName,
//         // filename: EditCampaignData?.addlevel?.filename,
//         page_id: EditCampaignData?.addlevel?.page_id,
//         message: EditCampaignData?.addlevel?.message,
//         headline: EditCampaignData?.addlevel?.headline,
//         Description: EditCampaignData?.addlevel?.Description,
//         Caption: EditCampaignData?.addlevel?.Caption,
//         Website_URL: EditCampaignData?.addlevel?.Website_URL,
//         urlParameters: EditCampaignData?.addlevel?.urlParameters,

//     };


//     return (
//         <Drawer
//             title="Edit campaign campaign"
//             width="95%"
//             open={visible}
//             onClose={onClose}
//         >
//             {EditCampaignData.identifier === rowData.identifier ? (

//                 <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues}>
//                     <Collapse accordion defaultActiveKey={['1']} >
//                         <Panel header="CAMPAIGN LEVEL" key="1">
//                             <div style={{ display: "flex" }}>
//                                 <Form.Item
//                                     name="Account_Number"
//                                     label={<span style={{ color: "#B4B4B4" }}>Account Number</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.2 }}>
//                                     <Input

//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Name"
//                                     label={<span style={{ color: "#B4B4B4" }}>Campaign name</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.25 }}>
//                                     <Input
//                                         style={{ width: "100%", marginLeft: "3%" }}
//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Objectives"
//                                     label={<span style={{ color: "#B4B4B4" }}>Objectives</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.1, marginLeft: "2%" }}>
//                                     <Select

//                                         variant="filled"
//                                         options={[
//                                             { value: "OUTCOME_LEADS", label: "Leads" },
//                                             { value: "OUTCOME_SALES", label: "Sales" },
//                                             { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
//                                             { value: "OUTCOME_AWARENESS", label: "Awareness" },
//                                             { value: "OUTCOME_TRAFFIC", label: "Traffic" },
//                                             { value: "OUTCOME_APP_PROMOTION", label: "App promotion" }

//                                         ]}
//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Special_categories"
//                                     label={<span style={{ color: "#B4B4B4" }}>Categories</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.1, marginLeft: "2%" }}>
//                                     <Select

//                                         variant="filled"
//                                         mode="multiple"
//                                         allowClear
//                                         options={[
//                                             { value: "HOUSING", label: "Housing" },
//                                             { value: "CREDIT", label: "Credit" },
//                                             { value: "EMPLOYMENT", label: "Employment" },
//                                             { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
//                                             { value: "NONE", label: "None" }

//                                         ]}
//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Bid_strategy"
//                                     label={<span style={{ color: "#B4B4B4" }}>Bid strategy</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.1, marginLeft: "2%" }}>
//                                     <Select

//                                         variant="filled"
//                                         options={[
//                                             { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume" },
//                                             { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap" },
//                                             { value: "COST_CAP", label: "Cost Cap" },
//                                             { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" }
//                                         ]}
//                                         onChange={handleBidStrategyChange}
//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Daily_amount"
//                                     label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.1, marginLeft: "2%" }}>
//                                     <Input
//                                         type="number"
//                                         placeholder="$"

//                                     />
//                                 </Form.Item>
//                                 <Form.Item
//                                     name="Status"
//                                     label={<span style={{ color: "#B4B4B4" }}>Status</span>}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: "Please select an option!",
//                                         },
//                                     ]}
//                                     style={{ flex: 0.1, marginLeft: "2%" }}>
//                                     <Select
//                                         variant="filled"
//                                         options={[
//                                             { value: "ACTIVE", label: "ACTIVE" },
//                                             { value: "PAUSED", label: "PAUSED" },

//                                         ]}
//                                     />
//                                 </Form.Item>

//                             </div>
//                         </Panel>
//                     </Collapse>
//                     <Form.Item label=" ">
//                         {isFormComplete && (
//                             <Button type="primary" htmlType="submit" style={{ background: '#21c55d', minWidth: '200px' }}>
//                                 Submit
//                             </Button>
//                         )}
//                     </Form.Item>
//                     <Modal
//                         title="Confirmation"
//                         open={isModalVisible}
//                         onOk={handleOk}
//                         onCancel={handleCancel}>
//                         <p>Are you sure you want to submit?</p>
//                     </Modal>
//                 </Form>
//             ) : (
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//                     <Spin size="large" />
//                 </div>
//             )}
//         </Drawer>
//     );
// };

// export default EditCampaignDrawer1;


"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Button, Collapse, Form, Input, Select, message, Spin } from "antd";
import axios from "axios";

const { Panel } = Collapse;

const EditCampaignDrawer1 = ({ rowData, visible, onClose }) => {
    if (!rowData) {
        return null;
    }

    const [EditCampaignData, setEditCampaignData] = useState({});
    const [form] = Form.useForm();
    const [changedData, setChangedData] = useState({});

    const token = localStorage.getItem("token");

    // Fetch campaign data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (rowData) {
                    const response = await axios.get(
                        `https://www.testapi.adsgoat.in/api/viecampaigndata/${rowData.identifier}`,
                        { headers: { Authorization: token } }
                    );
                    setEditCampaignData(response.data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign data:", error);
            }
        };
        fetchData();
    }, [rowData]);

    const handleFormChange = (changedValues) => {
        // Track changes in the form
        setChangedData((prev) => ({
            ...prev,
            ...changedValues,
        }));
    };

    const onFinish = async () => {
        console.log("Changed Data:", changedData); // Log the changed data after submission

        const updatedCampaignData = {
            ...EditCampaignData,
            camapaignlevel: {
                ...EditCampaignData.camapaignlevel,
                ...changedData, // Only include the changed data
                Daily_amount: changedData.Daily_amount
                    ? parseInt(changedData.Daily_amount) * 100
                    : EditCampaignData.camapaignlevel.Daily_amount,
            },
        };

        try {
            const response = await fetch(
                `https://www.testapi.adsgoat.in/api/updateFormData/${rowData.identifier}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify(updatedCampaignData),
                }
            );

            if (response.ok) {
                message.success("Campaign updated successfully!");
                onClose();
            } else {
                message.error("Failed to update campaign.");
            }
        } catch (error) {
            console.error("Error updating campaign:", error);
            message.error("Error updating campaign.");
        }
    };

    const initialValues = {
        Account_Number: EditCampaignData.Account_Number,
        Name: EditCampaignData?.camapaignlevel?.Name,
        Objectives: EditCampaignData?.camapaignlevel?.Objectives,
        Special_categories: EditCampaignData?.camapaignlevel?.Special_categories,
        Bid_strategy: EditCampaignData?.camapaignlevel?.Bid_strategy,
        Daily_amount: EditCampaignData?.camapaignlevel?.Daily_amount / 100,
        Status: EditCampaignData?.camapaignlevel?.Status,
    };

    return (
        <Drawer
            title="Edit Campaign"
            width="95%"
            open={visible}
            onClose={onClose}
        >
            {EditCampaignData.identifier === rowData.identifier ? (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    onValuesChange={handleFormChange}
                    initialValues={initialValues}
                >
                    <Collapse accordion defaultActiveKey={["1"]}>
                        <Panel header="CAMPAIGN LEVEL" key="1">
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                <Form.Item
                                    name="Account_Number"
                                    label="Account Number"
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item
                                    name="Name"
                                    label="Campaign Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a campaign name!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="Objectives"
                                    label="Objectives"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an objective!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads" },
                                            { value: "OUTCOME_SALES", label: "Sales" },
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App Promotion" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Special_categories"
                                    label="Categories"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a category!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        mode="multiple"
                                        options={[
                                            { value: "HOUSING", label: "Housing" },
                                            { value: "CREDIT", label: "Credit" },
                                            { value: "EMPLOYMENT", label: "Employment" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
                                            { value: "NONE", label: "None" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Bid_strategy"
                                    label="Bid Strategy"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a bid strategy!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        options={[
                                            { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume" },
                                            { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap" },
                                            { value: "COST_CAP", label: "Cost Cap" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Daily_amount"
                                    label="Daily Budget"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a daily budget!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input type="number" placeholder="$" />
                                </Form.Item>
                                <Form.Item
                                    name="Status"
                                    label="Status"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a status!",
                                        },
                                    ]}
                                    style={{ flex: 1 }}
                                >
                                    <Select
                                        options={[
                                            { value: "ACTIVE", label: "ACTIVE" },
                                            { value: "PAUSED", label: "PAUSED" },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                        </Panel>
                    </Collapse>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <Spin size="large" />
                </div>
            )}
        </Drawer>
    );
};

export default EditCampaignDrawer1;



