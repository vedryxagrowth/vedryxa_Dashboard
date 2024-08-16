// "use client";
// import {
//   CheckOutlined,
//   CloseOutlined,
//   CommentOutlined,
//   GlobalOutlined,
//   LikeOutlined,
//   MoreOutlined,
//   ShareAltOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import {
//   Button,
//   Card,
//   ConfigProvider,
//   DatePicker,
//   Form,
//   Input,
//   Modal,
//   Select,
//   Space,
//   Tabs,
//   Upload,
//   message,
//   theme
// } from "antd";
// import TextArea from "antd/es/input/TextArea";
// import axios from "axios";
// import moment from "moment-timezone";
// import { useEffect, useRef, useState } from "react";
// const { Option } = Select;
// const { TabPane } = Tabs;
// export default function Editcampaign({ selectedRow, editadsetlevel }) {
//   const [form] = Form.useForm();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [formData, setFormData] = useState(null);
//   var token = localStorage.getItem("token")
//   // console.log(selectedRow, "selectedRow")

//   const handleSubmit = () => {
//     form
//       .validateFields()
//       .then((values) => {
//         console.log('Form data:', values);
//         setFormData(values);
//         setIsModalVisible(true);
//       })
//       .catch((errorInfo) => {
//         console.log('Validation failed:', errorInfo);
//       });
//   };

//   const handleClear = () => {
//     form.resetFields();
//   };

//   const handleModalOk = async () => {
//     setIsModalVisible(false);
//     if (formData) {
//       try {
//         await postData(formData);
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     }
//     message.success("Adset Edited successfully");
//     console.log('Modal ok clicked');
//   };

//   const handleModalCancel = () => {
//     setIsModalVisible(false);
//     console.log('Modal cancel clicked');
//   };
//   var initialValue = {
//     AdsetName: editadsetlevel?.AdsetName,
//     optimization_goal: editadsetlevel?.optimization_goal,
//     billing_event: editadsetlevel?.billing_event,
//     // start_time: editadsetlevel?.start_time,
//     action_source: editadsetlevel?.action_source,
//     custom_event_type: editadsetlevel?.custom_event_type,
//     pixel_id: editadsetlevel?.pixel_id,
//     bid_amount: (editadsetlevel?.bid_amount) / 100,
//     countries: editadsetlevel?.countries,
//     Min_Age: editadsetlevel?.Min_Age,
//     Max_Age: editadsetlevel?.Max_Age,
//     Gender: editadsetlevel?.Gender,
//     publisher_platforms: editadsetlevel?.publisher_platforms,
//     device_platforms: editadsetlevel?.device_platforms,
//     Facebook_positions: editadsetlevel?.Facebook_positions,
//   }
//   const postData = async (values) => {
//     try {
//       const data1 = {
//         adsetlevel: {
//           AdsetName: values.AdsetName,
//           optimization_goal: values.optimization_goal,
//           billing_event: values.billing_event,
//           start_time: moment(values.DatePicker).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
//           action_source: values.action_source,
//           custom_event_type: values.custom_event_type,
//           pixel_id: values.pixel_id,
//           bid_amount: values.bid_amount ? (parseInt(values.bid_amount) * 100) : 0,
//           countries: values.countries,
//           Min_Age: values.Min_Age,
//           Max_Age: values.Max_Age,
//           Gender: parseInt(values.Gender),
//           publisher_platforms: values.publisher_platforms,
//           Facebook_positions: values.Facebook_positions,
//           device_platforms: values.device_platforms,
//           buying_type: "AUCTION"
//         }
//       }
//       const response = await fetch(`https://www.testapi.adsgoat.in/api/Editedadset/${selectedRow.identifier}`, {
//         method: 'PUT',
//         headers: {

//           'Content-Type': 'application/json',
//           Authorization: token
//         },
//         body: JSON.stringify(data1)
//       });

//       if (response.ok) {
//         console.log('Form data submitted successfully');
//         // onClose(); // Close the drawer or perform any other action
//       } else {
//         console.error('Failed to submit form data');
//       }
//     } catch (error) {
//       console.error('Error submitting form data:', error);
//     }
//   }

//   return (
//     <>
//       <h3>{editadsetlevel?.AdsetName}</h3>
//       <Card style={{ width: '100%' }} className="editcard">
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleSubmit}
//           initialValues={initialValue}
//         >
//           <div style={{ display: "flex" }}>
//             <Form.Item
//               name="AdsetName"
//               label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.25 }}>
//               <Input
//                 style={{ width: "100%" }}
//               />
//             </Form.Item>
//             <Form.Item
//               name="optimization_goal"
//               label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select

//                 variant="filled"
//                 options={[
//                   { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
//                   { value: "LINK_CLICKS", label: "Clicks" },
//                   { value: "REACH", label: "Reach" },
//                   { value: "VALUE", label: "Value" }
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="billing_event"
//               label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select

//                 variant="filled"
//                 options={[
//                   { value: "IMPRESSIONS", label: "Impressions" },
//                   { value: "VALUE", label: "Value" }
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="DatePicker"
//               label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: 'Please input!',
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}

//             >
//               <DatePicker />
//             </Form.Item>
//             <Form.Item
//               name="action_source"
//               label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select

//                 variant="filled"
//                 options={[
//                   { value: "website", label: "Website" },
//                   { value: "email", label: "Email" },
//                   { value: "app", label: "App" },
//                   { value: "phone_call", label: "Phone Call" }
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="custom_event_type"
//               label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select

//                 variant="filled"
//                 options={[
//                   { value: "LEAD", label: "Lead" },
//                   { value: "PURCHASE", label: "Purchase" },
//                   { value: "SEARCH", label: "Search" },
//                   { value: "CONTACT", label: "Contact" },
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="pixel_id"
//               // initialValue={pixelids}
//               label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.15, marginLeft: "2%" }}>
//               <Input
//                 style={{ width: "100%" }}
//               />
//             </Form.Item>
//             {/* {showBidAmount && ( */}
//             <Form.Item
//               name="bid_amount"
//               label={<span style={{ color: "#B4B4B4" }}>Bid_amount</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Input
//                 type="number"
//                 placeholder="$"

//               />
//             </Form.Item>
//             {/* )} */}


//           </div>
//           <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "green" }}>Targeting</span>
//           <div style={{ display: "flex" }}>
//             <Form.Item
//               name="countries"
//               label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.12 }}>
//               <Select
//                 variant="filled"

//                 options={[
//                   { value: "US", label: "United States" },
//                   { value: "GB", label: "United Kingdom" },
//                   { value: "AU", label: "Australia" },
//                   { value: "IN", label: "India" },
//                   { value: "AE", label: "United Arab Emirates" },
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="Min_Age"
//               label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ marginLeft: "2%" }}>
//               <Select
//                 variant="filled"
//                 options={[
//                   { value: "18", label: "18" },
//                   { value: "25", label: "25" },
//                   { value: "35", label: "35" },
//                   { value: "40", label: "40", disabled: true },
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="Max_Age"
//               label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//             >
//               <Select
//                 variant="filled"
//                 options={[
//                   { value: "20", label: "20" },
//                   { value: "30", label: "30" },
//                   { value: "65", label: "65+" },
//                   { value: "80", label: "80", disabled: true },
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="Gender"
//               label={<span style={{ color: "#B4B4B4" }}> Gender</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select
//                 variant="filled"
//                 options={[
//                   { value: "0", label: "All" },
//                   { value: "1", label: "Male" },
//                   { value: "2", label: "Female" },
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="publisher_platforms"
//               label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.1, marginLeft: "2%" }}>
//               <Select
//                 variant="filled"
//                 options={[
//                   { value: "facebook", label: "Facebook" },
//                   { value: "instagram", label: "Instagram" }
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="Facebook_positions"
//               label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.25, marginLeft: "2%" }}>
//               <Select
//                 mode="multiple"
//                 variant="filled"
//                 allowClear
//                 style={{ width: '100%' }}
//                 placeholder="Please select"
//                 // defaultValue={['a10', 'c12']}
//                 // onChange={handlepositionChange}
//                 options={[
//                   { value: "feed", label: "Facebook Feed" },
//                   { value: "marketplace", label: "Facebook Marketplace" },
//                   { value: "video_feeds", label: "Facebook Video Feeds" },
//                   { value: "search", label: "Facebook Search Results" },
//                   { value: "explore", label: "Facebook business Explore" },
//                   { value: "right_hand_column", label: "Facebook Right Column" },
//                   { value: "story", label: "Facebook Stories" },
//                   { value: "instream_video", label: "Facebook In-Stream Videos" },
//                   { value: "reels", label: "Facebook Reels" }
//                 ]}
//               />
//             </Form.Item>
//             <Form.Item
//               name="device_platforms"
//               label={<span style={{ color: "#B4B4B4" }}>Device</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 0.18, marginLeft: "2%" }}>
//               <Select
//                 mode="multiple"
//                 variant="filled"
//                 allowClear
//                 style={{ width: '100%' }}
//                 placeholder="Please select"
//                 options={[
//                   { value: "mobile", label: "Mobile" },
//                   { value: "desktop", label: "Desktop" }
//                 ]}
//               />
//             </Form.Item>
//           </div>

//           <Form.Item>
//             <Space>
//               <Button type="primary" htmlType="submit">
//                 Submit
//               </Button>
//               <Button onClick={handleClear}>Clear</Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Card>

//       <Modal
//         title="Form Data"
//         visible={isModalVisible}
//         onOk={handleModalOk}
//         onCancel={handleModalCancel}
//       >
//         {/* Display form data in modal */}
//         {formData && (
//           <pre>{JSON.stringify(formData, null, 2)}</pre>
//         )}
//       </Modal>
//     </>
//   );
//   // return(
//   //     <>
//   //     <h1>hello Editadset ${selectedRow.campaignName}</h1>
//   //     </>
//   // )
// }
"use client"
export default function Editcam() {
    return (
        <>
            <h1>edit campaign</h1>
        </>
    )
}