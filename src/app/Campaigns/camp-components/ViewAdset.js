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
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useTokenContext } from "../../components/parent";
import axios from "axios";
import moment from "moment-timezone";
// import dayjs from "dayjs";
import dayjs from "dayjs";
import { use } from "react";
import { useEffect, useRef, useState } from "react";

const { Option } = Select;
const { TabPane } = Tabs;

export default function Viewadsets({ selectedRow, onClose, viewadsetlevel }) {
    const { theme } = useTokenContext();
    const [form] = Form.useForm();
    const [formData, setFormData] = useState(null);
    const token = localStorage.getItem("token");
    // console.log(viewadsetlevel);
    const defaultDate = viewadsetlevel?.start_time
        ? dayjs(viewadsetlevel?.start_time) // Parse ISO date using Day.js
        : null;

    const [date, setDate] = useState(defaultDate);
    // console.log(date);

    useEffect(() => {
        if (viewadsetlevel) {
            //   setSelectedPublishers(viewadsetlevel.publisher_platforms || []);
            //   setSelectedPositions(viewadsetlevel.position || ["feed"]);
            form.setFieldsValue({
                positions: viewadsetlevel.position || ["feed"],
                AdsetName: viewadsetlevel?.AdsetName,
                optimization_goal: viewadsetlevel?.optimization_goal,
                billing_event: viewadsetlevel?.billing_event,
                DailyAdd_amount: viewadsetlevel?.Daily_amount ? (viewadsetlevel?.Daily_amount) / 100 : null,
                // start_time: viewadsetlevel?.start_time,
                action_source: viewadsetlevel?.action_source,
                custom_event_type: viewadsetlevel?.custom_event_type,
                pixel_id: viewadsetlevel?.pixel_id,
                bid_amount: (viewadsetlevel?.bid_amount) / 100,
                countries: viewadsetlevel?.countries,
                Min_Age: viewadsetlevel?.Min_Age,
                Max_Age: viewadsetlevel?.Max_Age,
                Gender: viewadsetlevel?.Gender,
                publisher_platforms: viewadsetlevel?.publisher_platforms,
                device_platforms: viewadsetlevel?.device_platforms,
                Language: viewadsetlevel?.locales,
                placements: viewadsetlevel?.placements,
            });
        }
    }, [viewadsetlevel, form]);

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
    // console.log(initialValue, "initialValueinitialValueinitialValue")

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
                            <Input disabled style={{ width: "100%" }} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            />
                        </Form.Item>
                        <Form.Item
                            name="DatePicker"
                            label={<span style={{ color: "#B4B4B4" }}>Start time</span>}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            />
                        </Form.Item>
                        <Form.Item
                            name="pixel_id"
                            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                            style={{ flex: "1 1 20%" }}
                        >
                            <Input disabled style={{ width: "100%" }} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                        </Form.Item>
                        <Form.Item
                            name="DailyAdd_amount"
                            label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                            style={{ flex: "1 1 15%" }}>
                            <Input disabled style={{ width: "100%" }}
                                type="number"
                                placeholder="$"
                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            />
                        </Form.Item>
                        <Form.Item
                            name="bid_amount"
                            label={<span style={{ color: "#B4B4B4" }}>Bid amount</span>}
                            style={{ flex: "1 1 15%" }}
                        >
                            <Input type="number" placeholder="$" disabled className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                        </Form.Item>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        <Form.Item
                            name="countries"
                            label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                            style={{ flex: "1 1 20%" }}
                        >
                            <Select
                                disabled
                                // options={[
                                //     { value: "US", label: "United States" },
                                //     { value: "GB", label: "United Kingdom" },
                                //     { value: "AU", label: "Australia" },
                                //     { value: "IN", label: "India" },
                                //     { value: "AE", label: "United Arab Emirates" },
                                //     { value: "CA", label: "Canada" },
                                //     { value: "DE", label: "Germany" },
                                //     { value: "FR", label: "France" },
                                //     { value: "JP", label: "Japan" },
                                //     { value: "CN", label: "China" },
                                //     { value: "BR", label: "Brazil" },
                                //     { value: "ZA", label: "South Africa" },
                                //     { value: "RU", label: "Russia" },
                                //     { value: "IT", label: "Italy" },
                                //     { value: "ES", label: "Spain" },
                                //     { value: "SG", label: "Singapore" },
                                //     { value: "NZ", label: "New Zealand" },
                                //     { value: "MX", label: "Mexico" }
                                // ]}
                                showSearch
                                optionFilterProp="label"
                                options={[
                                    { value: "US", label: "United States", title: "" },
                                    { value: "GB", label: "United Kingdom", title: "" },
                                    { value: "AU", label: "Australia", title: "" },
                                    { value: "IN", label: "India", title: "" },
                                    { value: "AE", label: "United Arab Emirates", title: "" },
                                    { value: "CA", label: "Canada", title: "" },
                                    { value: "DE", label: "Germany", title: "" },
                                    { value: "FR", label: "France", title: "" },
                                    { value: "JP", label: "Japan", title: "" },
                                    { value: "CN", label: "China", title: "" },
                                    { value: "BR", label: "Brazil", title: "" },
                                    { value: "ZA", label: "South Africa", title: "" },
                                    { value: "RU", label: "Russia", title: "" },
                                    { value: "IT", label: "Italy", title: "" },
                                    { value: "ES", label: "Spain", title: "" },
                                    { value: "SG", label: "Singapore", title: "" },
                                    { value: "NZ", label: "New Zealand", title: "" },
                                    { value: "MX", label: "Mexico", title: "" },
                                    { value: "AT", label: "Austria", title: "" },
                                    { value: "BE", label: "Belgium", title: "" },
                                    { value: "BG", label: "Bulgaria", title: "" },
                                    { value: "HR", label: "Croatia", title: "" },
                                    { value: "CY", label: "Cyprus", title: "" },
                                    { value: "CZ", label: "Czech Republic", title: "" },
                                    { value: "DK", label: "Denmark", title: "" },
                                    { value: "EE", label: "Estonia", title: "" },
                                    { value: "FI", label: "Finland", title: "" },
                                    { value: "GR", label: "Greece", title: "" },
                                    { value: "HU", label: "Hungary", title: "" },
                                    { value: "IE", label: "Ireland", title: "" },
                                    { value: "LV", label: "Latvia", title: "" },
                                    { value: "LT", label: "Lithuania", title: "" },
                                    { value: "LU", label: "Luxembourg", title: "" },
                                    { value: "MT", label: "Malta", title: "" },
                                    { value: "NL", label: "Netherlands", title: "" },
                                     { value: "NO", label: "Norway",title:""},
                                    { value: "PL", label: "Poland", title: "" },
                                    { value: "PT", label: "Portugal", title: "" },
                                    { value: "RO", label: "Romania", title: "" },
                                    { value: "SK", label: "Slovakia", title: "" },
                                    { value: "SI", label: "Slovenia", title: "" },
                                    { value: "SE", label: "Sweden", title: "" },
                                ]}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            />
                        </Form.Item>
                        <Form.Item
                            name="Min_Age"
                            label={<span style={{ color: "#B4B4B4" }}>Min age</span>}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            />
                        </Form.Item>
                        <Form.Item
                            name="Max_Age"
                            label={<span style={{ color: "#B4B4B4", flex: "1 1 10%" }}>Max age</span>}
                        >
                            <Select
                                disabled
                                options={[
                                    { value: "20", label: "20" },
                                    { value: "30", label: "30" },
                                    { value: "65", label: "65+" },
                                    { value: "80", label: "80", disabled: true },
                                ]}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                            { label: 'Facebook', value: 'facebook' },
                                            { label: 'Instagram', value: 'instagram' },
                                            { label: 'Messenger', value: 'messenger' },
                                            { label: 'Audience Network', value: 'audience_network' }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                            { key: "feed", label: "Facebook Feed" },
                                            { key: "marketplace", label: "Facebook Marketplace" },
                                            { key: "video_feeds", label: "Facebook Video Feeds" },
                                            { key: "instream_video", label: "Facebook In-Stream Videos" },
                                            { key: "facebook_reels", label: "Facebook Reels" },
                                            { key: "profile_feed-f", label: "Facebook Profile Feed" },
                                            { key: "search", label: "Facebook Search" },
                                            { key: "story_f", label: "Facebook Stories" },
                                            { key: "right_hand_column", label: "Facebook Right Column" },
                                            { key: "instant_article", label: "Facebook Instant Articles" },
                                            { key: "biz_disco_feed", label: "Facebook Business Explore" },

                                            { key: "stream", label: "Instagram Stream" },
                                            { key: "story_i", label: "Instagram Stories" },
                                            { key: "explore", label: "Instagram Explore" },
                                            { key: "explore_home", label: "Instagram Explore Home" },
                                            { key: "reels", label: "Instagram Reels" },
                                            { key: "profile_feed-i", label: "Instagram Profile Feed" },
                                            { key: "ig_search", label: "Instagram Search" },
                                            { key: "profile_reels", label: "Instagram Profile Reels" },

                                            { key: "messenger_home", label: "Messenger Home" },
                                            { key: "story_m", label: "Messenger Stories" },
                                            { key: "sponsored_messages", label: "Messenger Sponsored Messages" },

                                            { key: "classic", label: "Audience Network Classic" },
                                            { key: "rewarded_video", label: "Audience Network Rewarded Video" }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
