"use client";
import {
    CheckOutlined,
    CloseOutlined,
    CommentOutlined,
    GlobalOutlined,
    LikeOutlined,
    MoreOutlined,
    ShareAltOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    ConfigProvider,
    DatePicker,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Tabs,
    Upload,
    message,
    theme,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import moment from "moment-timezone";
import dayjs from "dayjs";
import { use } from "react";
import { useEffect, useRef, useState } from "react";

const { Option } = Select;
const { TabPane } = Tabs;

export default function Viewadsets({ selectedRow, onClose, viewadsetlevel }) {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState(null);
    const token = localStorage.getItem("token");
    console.log(viewadsetlevel);
    const defaultDate = viewadsetlevel?.start_time
    ? moment(viewadsetlevel?.start_time) // Parse ISO date using Day.js
    : null;

  const [date, setDate] = useState(defaultDate);
    console.log(date);

    const initialValue = {
        AdsetName: viewadsetlevel?.AdsetName,
        DailyAdd_amount: viewadsetlevel?.Daily_amount ? (viewadsetlevel?.Daily_amount) / 100 : null,
        optimization_goal: viewadsetlevel?.optimization_goal,
        billing_event: viewadsetlevel?.billing_event,
        action_source: viewadsetlevel?.action_source,
        custom_event_type: viewadsetlevel?.custom_event_type,
        // DatePicker: viewadsetlevel?.start_time.split("T")[0],
        pixel_id: viewadsetlevel?.pixel_id,
        bid_amount: viewadsetlevel?.bid_amount / 100,
        countries: viewadsetlevel?.countries,
        Min_Age: viewadsetlevel?.Min_Age,
        Max_Age: viewadsetlevel?.Max_Age,
        Gender: viewadsetlevel?.Gender,
        publisher_platforms: viewadsetlevel?.publisher_platforms,
        device_platforms: viewadsetlevel?.device_platforms,
        Facebook_positions: viewadsetlevel?.Facebook_positions,
        placements: viewadsetlevel?.placements
    };
    console.log(initialValue, "initialValueinitialValueinitialValue")

    return (
        <>
            <h3>{viewadsetlevel?.AdsetName}</h3>
            <Card style={{ width: "100%" }} className="editcard">
                <Form form={form} layout="vertical" initialValues={initialValue}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        
                        <Form.Item
                            name="AdsetName"
                            label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
                            style={{ flex: "1 1 20%" }}
                        >
                            <Input disabled style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="optimization_goal"
                            label={<span style={{ color: "#B4B4B4" }}>Optimization goal</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Select
                                disabled
                                options={[
                                    { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                                    { value: "LINK_CLICKS", label: "Clicks" },
                                    { value: "REACH", label: "Reach" },
                                    { value: "VALUE", label: "Value" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="billing_event"
                            label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Select
                                disabled
                                options={[
                                    { value: "IMPRESSIONS", label: "Impressions" },
                                    { value: "VALUE", label: "Value" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="DatePicker"
                            label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
                            style={{ flex: "1 1 15%" }}
                            initialValue={date}
                        >
                            <DatePicker disabled />
                        </Form.Item>
                        <Form.Item
                            name="action_source"
                            label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Select
                                disabled
                                options={[
                                    { value: "website", label: "Website" },
                                    { value: "email", label: "Email" },
                                    { value: "app", label: "App" },
                                    { value: "phone_call", label: "Phone Call" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="custom_event_type"
                            label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Select
                                disabled
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
                            style={{ flex: "1 1 20%" }}
                        >
                            <Input disabled style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="DailyAdd_amount"
                            label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                            style={{ flex: "1 1 15%" }}>
                            <Input disabled style={{ width: "100%" }}
                                type="number"
                                placeholder="$"

                            />
                        </Form.Item>
                        <Form.Item
                            name="bid_amount"
                            label={<span style={{ color: "#B4B4B4" }}>Bid amount</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Input type="number" placeholder="$" disabled />
                        </Form.Item>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "green" }}>Targeting</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        <Form.Item
                            name="countries"
                            label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                            style={{ flex: "1 1 20%" }}
                        >
                            <Select
                                disabled
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
                            style={{ flex: "1 1 10%" }}
                        >
                            <Select
                                disabled
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
                            label={<span style={{ color: "#B4B4B4", flex: "1 1 10%" }}>Max Age</span>}
                        >
                            <Select
                                disabled
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
                            label={<span style={{ color: "#B4B4B4" }}>Gender</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Select
                                disabled
                                options={[
                                    { value: "0", label: "All" },
                                    { value: "1", label: "Male" },
                                    { value: "2", label: "Female" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<span style={{ color: "#B4B4B4" }}>Placements</span>}
                            name="placements"
                            style={{ flex: 0.1, marginLeft: "2%" }}
                        >
                            <Select
                                placeholder="Select placements"
                                disabled
                                options={[
                                    { value: "Advance", label: "Advance" },
                                    { value: "manual", label: "Manual" }
                                ]}
                            />
                        </Form.Item>


                        {viewadsetlevel?.placements === "manual" && (
                            <>
                                <Form.Item
                                    name="publisher_platforms"
                                    label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                    style={{ flex: "1 1 20%" }}
                                >
                                    <Select
                                        disabled
                                        options={[
                                            { value: "facebook", label: "Facebook" },
                                            { value: "instagram", label: "Instagram" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Facebook_positions"
                                    label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                    style={{ flex: "1 1 30%" }}
                                >
                                    <Select
                                        disabled
                                        mode="multiple"
                                        allowClear
                                        style={{ width: "100%" }}
                                        placeholder="Please select"
                                        options={[
                                            { value: "feed", label: "Facebook Feed" },
                                            { value: "marketplace", label: "Facebook Marketplace" },
                                            { value: "video_feeds", label: "Facebook Video Feeds" },
                                            { value: "search", label: "Facebook Search Results" },
                                            { value: "explore", label: "Facebook Explore" },
                                            { value: "right_hand_column", label: "Facebook Right Column" },
                                            { value: "story", label: "Facebook Stories" },
                                            { value: "instream_video", label: "Facebook In-Stream Videos" },
                                            { value: "reels", label: "Facebook Reels" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="device_platforms"
                                    label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                                    style={{ flex: "1 1 20%" }}
                                >
                                    <Select
                                        disabled
                                        mode="multiple"
                                        allowClear
                                        style={{ width: "100%" }}
                                        placeholder="Please select"
                                        options={[
                                            { value: "mobile", label: "Mobile" },
                                            { value: "desktop", label: "Desktop" },
                                        ]}
                                    />
                                </Form.Item>
                            </>
                        )}
                    </div>
                </Form>
            </Card>
        </>
    );
}
