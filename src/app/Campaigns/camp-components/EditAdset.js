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
  theme
} from "antd";

import { useTokenContext } from "../../components/parent";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import moment from "moment-timezone";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
const { Option } = Select;
const { TabPane } = Tabs;

const publisherOptions = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Messenger', value: 'messenger' },
  { label: 'Audience Network', value: 'audience_network' }
];

// const positionOptions = {
//   facebook: [
//     { key: "feed", label: "Facebook Feed" },
//     { key: "marketplace", label: "Facebook Marketplace" },
//     { key: "video_feeds", label: "Facebook Video Feeds" },
//     { key: "instream_video", label: "Facebook In-Stream Videos" },
//     { key: "facebook_reels", label: "Facebook Reels" },
//     { key: "profile_feed", label: "Facebook Profile Feed" },
//     { key: "search", label: "Facebook Search" },
//     { key: "story_fb", label: "Facebook Stories" },
//     { key: "right_column", label: "Facebook Right Column" }, // Added
//     { key: "instant_articles", label: "Facebook Instant Articles" } // Added
//   ],
//   instagram: [
//     { key: "stream", label: "Instagram Stream" },
//     { key: "story_in", label: "Instagram Story" },
//     { key: "explore", label: "Instagram Explore" },
//     { key: "explore_home", label: "Instagram Explore Home" },
//     { key: "reels", label: "Instagram Reels" },
//     { key: "profile_feed_in", label: "Instagram Profile Feed" },
//     { key: "ig_search", label: "Instagram Search" },
//     { key: "profile_reels", label: "Instagram Profile Reels" }
//   ],
//   messenger: [
//     { key: "messenger_home", label: "Messenger Home" },
//     { key: "story_ms", label: "Messenger Story" },
//     { key: "sponsored_messages", label: "Messenger Sponsored Messages" },
//     { key: "messenger_inbox", label: "Messenger Inbox" } // Added
//   ],
//   audience_network: [
//     { key: "classic", label: "Audience Network Classic" },
//     { key: "rewarded_video", label: "Audience Network Rewarded Video" },
//     { key: "in_stream", label: "Audience Network In-Stream Video" } // Added
//   ]
// };
const positionOptions = {
  facebook: [
    { key: "feed", label: "Facebook Feed" },
    { key: "marketplace", label: "Facebook Marketplace" },
    { key: "video_feeds", label: "Facebook Video Feeds" },
    // { key: "instream_video", label: "Facebook In-Stream Videos" },
    // { key: "reels", label: "Facebook Reels" }, // ✅ renamed from facebook_reels
    { key: "profile_feed", label: "Facebook Profile Feed" },
    { key: "search", label: "Facebook Search" },
    { key: "story", label: "Facebook Stories" }, // ✅ renamed from story_fb
    { key: "right_hand_column", label: "Facebook Right Column" }, // ✅ renamed from right_column
    { key: "instant_article", label: "Facebook Instant Articles" } // ✅ renamed from instant_articles
  ],

  instagram: [
    { key: "stream", label: "Instagram Stream" },
    { key: "story", label: "Instagram Stories" }, // ✅ renamed from story_in
    { key: "explore", label: "Instagram Explore" },
    // { key: "reels", label: "Instagram Reels" },
    { key: "profile_feed", label: "Instagram Profile Feed" } // ✅ renamed from profile_feed_in
    // ❌ Removed: explore_home, ig_search, profile_reels
  ],

  messenger: [
    { key: "messenger_home", label: "Messenger Home" },
    { key: "story", label: "Messenger Stories" }, // ✅ renamed from story_ms
    // { key: "sponsored_messages", label: "Messenger Sponsored Messages" }
    // ❌ Removed: messenger_inbox
  ],

  audience_network: [
    { key: "classic", label: "Audience Network Classic" },
    { key: "rewarded_video", label: "Audience Network Rewarded Video" },
    { key: "instream_video", label: "Audience Network In-Stream Video" } // ✅ renamed from in_stream
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
export default function Editadset({ selectedRow, onClose, editadsetlevel, changeRRefrst, rerender }) {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState(["feed"]);
  const [isManual, setIsManual] = useState(false);
  const [platform, setPlatform] = useState("facebook");
  const { theme } = useTokenContext();



  const handleModeChange = (value) => {
    setIsManual(value === "manual");
  };

  useEffect(() => {
    if (editadsetlevel) {
      setSelectedPublishers(editadsetlevel.publisher_platforms || []);
      setSelectedPositions(editadsetlevel.position || ["feed"]);
      form.setFieldsValue({
        positions: editadsetlevel.position || ["feed"],
        AdsetName: editadsetlevel?.AdsetName,
        optimization_goal: editadsetlevel?.optimization_goal,
        billing_event: editadsetlevel?.billing_event,
        DailyAdd_amount: editadsetlevel?.Daily_amount ? (editadsetlevel?.Daily_amount) / 100 : null,
        // start_time: editadsetlevel?.start_time,
        action_source: editadsetlevel?.action_source,
        custom_event_type: editadsetlevel?.custom_event_type,
        pixel_id: editadsetlevel?.pixel_id,
        bid_amount: (editadsetlevel?.bid_amount) / 100,
        countries: editadsetlevel?.countries,
        Min_Age: editadsetlevel?.Min_Age,
        Max_Age: editadsetlevel?.Max_Age,
        Gender: editadsetlevel?.Gender,
        publisher_platforms: editadsetlevel?.publisher_platforms,
        device_platforms: editadsetlevel?.device_platforms,
        Language: editadsetlevel?.locales,
        placements: editadsetlevel?.placements,
      });
    }
  }, [editadsetlevel, form]);

  const handlePublisherChange = (value) => {
    setSelectedPublishers(value);
    // setSelectedPositions(["feed"]); // Set default positions to "feed"
    // form.resetFields(['positions']); // Reset positions field
  };

  const handlePositionChange = (value) => {
    setSelectedPositions(value);
  };

  const getPositionOptions = () => {
    if (!Array.isArray(selectedPublishers) || selectedPublishers.length === 0) {
      return [];
    }

    const allPositions = selectedPublishers.reduce((acc, publisher) => {
      return acc.concat(positionOptions[publisher] || []);
    }, []);
    return [...new Set(allPositions)]; // Remove duplicates
  };

  var token = localStorage.getItem("token")
  // console.log(selectedRow, "selectedRow")

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
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

        // setIsModalVisible(true);
        setFormData({
          publisher_platforms: values.publisher_platforms,
          ...selectedPlatforms,
          ...values
        });
        // setFormData(values);
        setIsModalVisible(true);
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const handleClear = () => {
    form.resetFields();
  };

  const handleModalOk = async () => {
    setIsModalVisible(false);
    if (formData) {
      try {
        await postData(formData);
      } catch (error) {
        console.error("Error:", error);
      }
    }
    message.success("Adset Edited successfully");
    console.log('Modal ok clicked');
    rerender()
    onClose()

  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    console.log('Modal cancel clicked');
  };
  const currentDate = dayjs();
  var initialValue = {
    AdsetName: editadsetlevel?.AdsetName,
    optimization_goal: editadsetlevel?.optimization_goal,
    billing_event: editadsetlevel?.billing_event,
    DailyAdd_amount: editadsetlevel?.Daily_amount ? (editadsetlevel?.Daily_amount) / 100 : null,
    // start_time: editadsetlevel?.start_time,
    action_source: editadsetlevel?.action_source,
    custom_event_type: editadsetlevel?.custom_event_type,
    pixel_id: editadsetlevel?.pixel_id,
    bid_amount: (editadsetlevel?.bid_amount) / 100,
    countries: editadsetlevel?.countries,
    Min_Age: editadsetlevel?.Min_Age,
    Max_Age: editadsetlevel?.Max_Age,
    Gender: editadsetlevel?.Gender,
    publisher_platforms: editadsetlevel?.publisher_platforms,
    device_platforms: editadsetlevel?.device_platforms,
    Language: editadsetlevel?.locales,
    placements: editadsetlevel?.placements
    // Facebook_positions: editadsetlevel?.Facebook_positions,
  }
  const postData = async (values) => {
    try {
      const data1 = {
        adsetlevel: {
          AdsetName: values.AdsetName,
          Daily_amount: parseInt(values.DailyAdd_amount) * 100,
          optimization_goal: values.optimization_goal,
          billing_event: values.billing_event,
          start_time: moment(values.DatePicker).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
          action_source: values.action_source,
          custom_event_type: values.custom_event_type,
          pixel_id: values.pixel_id,
          bid_amount: values.bid_amount ? parseFloat(values.bid_amount) * 100 : 0,
          countries: values.countries,
          Min_Age: values.Min_Age,
          Max_Age: values.Max_Age,
          Gender: parseInt(values.Gender),
          placements: values.placements,
          ...(values.placements !== 'Advance' && {
            publisher_platforms: values.publisher_platforms,
            Facebook_positions: values.facebook_positions || [],
            instagram_positions: values.instagram_positions || [],
            audience_network_positions: values.audience_network_positions || [],
            messenger_positions: values.messenger_positions || [],
            position: values.positions,
            device_platforms: values.device_platforms,
          }),
          // publisher_platforms: values.publisher_platforms,
          // Facebook_positions: values.facebook_positions || [],
          // instagram_positions: values.instagram_positions || [],
          // audience_network_positions: values.audience_network_positions || [],
          // messenger_positions: values.messenger_positions || [],
          // device_platforms: values.device_platforms,
          // position: values.positions,
          locales: values.Language,
          buying_type: "AUCTION"
        }
      }
      const response = await fetch(`https://www.testapi.adsgoat.in/api/Editedadset/${selectedRow.identifier}`, {
        method: 'PUT',
        headers: {

          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(data1)
      });

      if (response.ok) {
        console.log('Form data submitted successfully');
        // onClose(); // Close the drawer or perform any other action
      } else {
        console.error('Failed to submit form data');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  }

  return (
    <>
      <h3>{editadsetlevel?.AdsetName}</h3>
      <Card style={{ width: '100%' }} className="editcard">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialValue}
          className={theme === 'dark' ? 'form-dark' : 'form-light'}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <Form.Item
              name="AdsetName"
              label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 20%" }}
            >
              <Input  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
            </Form.Item>

            <Form.Item
              name="optimization_goal"
              label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 15%" }}
            >
              <Select
                options={[
                  { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                  { value: "LINK_CLICKS", label: "Clicks" },
                  { value: "REACH", label: "Reach" },
                  { value: "VALUE", label: "Value" }
                ]}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="billing_event"
              label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 15%" }}
            >
              <Select
                options={[
                  { value: "IMPRESSIONS", label: "Impressions" },
                  { value: "VALUE", label: "Value" }
                ]}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="DatePicker"
              label={<span style={{ color: "#B4B4B4" }}>Start time</span>}
              rules={[{ required: true, message: 'Please input!' }]}
              style={{ flex: "1 1 15%" }}
              initialValue={currentDate}
            >
              <DatePicker dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}/>
            </Form.Item>

            <Form.Item
              name="action_source"
              label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 15%" }}
            >
              <Select
                options={[
                  { value: "website", label: "Website" },
                  { value: "email", label: "Email" },
                  { value: "app", label: "App" },
                  { value: "phone_call", label: "Phone Call" }
                ]}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="custom_event_type"
              label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 15%" }}
            >
              <Select
                options={[
                  { value: "LEAD", label: "Lead" },
                  { value: "PURCHASE", label: "Purchase" },
                  { value: "SEARCH", label: "Search" },
                  { value: "CONTACT", label: "Contact" }
                ]}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="pixel_id"
              label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 20%" }}
            >
              <Input  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
            </Form.Item>

            <Form.Item
              name="DailyAdd_amount"
              label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
              style={{ flex: "1 1 15%" }}
            >
              <Input type="number" placeholder="$"  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
            </Form.Item>

            {initialValue.bid_amount > 0 && (
              <Form.Item
                name="bid_amount"
                label={<span style={{ color: "#B4B4B4" }}>Cost per result goal</span>}
                rules={[
                  { required: true, message: "Please enter a bid amount!" },
                  {
                    validator: (_, value) =>
                      value && !isNaN(value) && parseFloat(value) > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("Please enter a valid float value!")),
                  },
                ]}
                style={{ flex: "1 1 15%" }}
              >
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
                  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                />
              </Form.Item>
            )}

          </div>

          <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <Form.Item
              name="countries"
              label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 20%" }}
            >
              <Select
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
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="Min_Age"
              label={<span style={{ color: "#B4B4B4" }}>Min age</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 10%" }}
            >
              <Select
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
              label={<span style={{ color: "#B4B4B4" }}>Max age</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 10%" }}
            >
              <Select
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
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 15%" }}
            >
              <Select
                options={[
                  { value: "0", label: "All" },
                  { value: "1", label: "Male" },
                  { value: "2", label: "Female" }
                ]}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              />
            </Form.Item>

            <Form.Item
              name="Language"
              label={<span style={{ color: "#B4B4B4" }}>Language</span>}
              rules={[{ required: true, message: "Please select an option!" }]}
              style={{ flex: "1 1 20%" }}
            >
              <Select mode="multiple" placeholder="Select Language" options={localesdata.map(option => ({ label: option.name, value: option.key }))} 
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}/>
            </Form.Item>
            <Form.Item
              label={<span style={{ color: "#B4B4B4" }}>Placements</span>}
              name="placements"
              rules={[{ required: true, message: 'Please select a mode!' }]}
            >
              <Select placeholder="Select a mode" onChange={handleModeChange}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                <Option value="Advance">Advance</Option>
                <Option value="manual">Manual</Option>

              </Select>
            </Form.Item>

            {editadsetlevel?.placements === 'manual' || isManual && (
              <>
                <Form.Item
                  name="publisher_platforms"
                  label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                  rules={[{ required: true, message: "Please select an option!" }]}
                  style={{ flex: "1 1 20%" }}
                >
                  <Select mode="multiple" placeholder="Select Platforms" options={publisherOptions?.map(option => ({ label: option.label, value: option.value }))} 
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}/>
                </Form.Item>

                <Form.Item
                  name="positions"
                  label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                  rules={[{ required: true, message: "Please select an option!" }]}
                  style={{ flex: "1 1 30%" }}
                >
                  <Select mode="multiple" placeholder="Select Positions" options={positionOptions[platform]?.map((position) => ({
                    label: position.label,
                    value: position.key
                  }))} 
                  dropdownClassName={theme === 'dark' && "custom-dropdown"}
                  className={theme === 'dark' ? 'dark-theme' : 'light-theme'}/>
                </Form.Item>

                <Form.Item
                  name="device_platforms"
                  label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                  rules={[{ required: true, message: "Please select an option!" }]}
                  style={{ flex: "1 1 20%" }}
                >
                  <Select
                    mode="multiple"
                    placeholder="Please select"
                    options={[
                      { value: "mobile", label: "Mobile" },
                      { value: "desktop", label: "Desktop" }
                    ]}
                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                  />
                </Form.Item>
              </>
            )}
          </div>

          <Form.Item>
            <Space>
              <Button style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} htmlType="submit">Submit</Button>
              <Button className="dark-icon-button" onClick={handleClear}   style={{color: theme === "dark" ? "white" : "#000"}}>Clear</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>


      <Modal
        title="Form Data"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        {/* Display form data in modal */}
        {formData && (
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        )}
      </Modal>
    </>
  );

}
