"use client";
import React, { useEffect, useMemo } from "react";
import {
  Drawer,
  Button,
  DatePicker,
  Space,
  Form,
  Input,
  Select,
  Collapse,
  Upload,
  Steps,
  Modal,
  message,
  Spin,
  Badge,
  Tooltip,
  InputNumber,
  Breadcrumb,
  Popconfirm,
  Checkbox,
  Switch
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  ShareAltOutlined,
  CommentOutlined,
  LikeOutlined,
  MoreOutlined,
  CloseOutlined,
  GlobalOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined
} from "@ant-design/icons";
import moment from "moment-timezone";
import { useState, useRef } from "react";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import MnetUrlBuilder from "./urlbuilder/mnet";
import TonicUrlBuilder from "./urlbuilder/tonic";
import System1UrlBuilder from "./urlbuilder/system1";
import DActiveUrlBuilder from "./urlbuilder/dactive";
import CreativesDrawer from "./creativesDrawer";
import ImageUploadPage from "../../Creatives/page";
import { NodeNextRequest } from "next/dist/server/base-http/node";
import { useTokenContext } from "../../components/parent";
import { useContext } from "react";
import { FaPenToSquare, FaShareFromSquare, FaTrashCan } from "react-icons/fa6";
import { Category } from "@mui/icons-material";

const FabricCanvas = dynamic(() => import("./Fabricanvas"), { ssr: false });

const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;
const publisherOptions = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "Messenger", value: "messenger" },
  { label: "Audience Network", value: "audience_network" },
];
const positionOptions = {
  facebook: [
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
    { key: "biz_disco_feed", label: "Facebook Business Explore" }, // Added Business Explore
  ],
  instagram: [
    { key: "stream", label: "Instagram Stream" },
    { key: "story_i", label: "Instagram Stories" },
    { key: "explore", label: "Instagram Explore" },
    { key: "explore_home", label: "Instagram Explore Home" },
    { key: "reels", label: "Instagram Reels" },
    { key: "profile_feed-i", label: "Instagram Profile Feed" },
    { key: "ig_search", label: "Instagram Search" },
    { key: "profile_reels", label: "Instagram Profile Reels" },
  ],
  messenger: [
    { key: "messenger_home", label: "Messenger Home" },
    { key: "story_m", label: "Messenger Stories" },
    { key: "sponsored_messages", label: "Messenger Sponsored Messages" },
    // { key: "messenger_inbox", label: "Messenger Inbox" }
  ],
  audience_network: [
    { key: "classic", label: "Audience Network Classic" },
    { key: "rewarded_video", label: "Audience Network Rewarded Video" },
    // { key: "instream_video", label: "Audience Network In-Stream Video" }
  ],
};

const allPositions = [
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
  { key: "rewarded_video", label: "Audience Network Rewarded Video" },
];

// const positionOptions = {
//     facebook: [
//         { key: "feed", label: "Facebook Feed" },
//         { key: "marketplace", label: "Facebook Marketplace" },
//         { key: "video_feeds", label: "Facebook Video Feeds" },
//         { key: "instream_video", label: "Facebook In-Stream Videos" },
//         { key: "facebook_reels", label: "Facebook Reels" },
//         { key: "profile_feed", label: "Facebook Profile Feed" },
//         { key: "search", label: "Facebook Search" },
//         { key: "story_fb", label: "Facebook Stories" },
//         { key: "right_column", label: "Facebook Right Column" }, // Added
//         { key: "instant_articles", label: "Facebook Instant Articles" } // Added
//     ],
//     instagram: [
//         { key: "stream", label: "Instagram Stream" },
//         { key: "story_in", label: "Instagram Story" },
//         { key: "explore", label: "Instagram Explore" },
//         { key: "explore_home", label: "Instagram Explore Home" },
//         { key: "reels", label: "Instagram Reels" },
//         { key: "profile_feed_in", label: "Instagram Profile Feed" },
//         { key: "ig_search", label: "Instagram Search" },
//         { key: "profile_reels", label: "Instagram Profile Reels" }
//     ],
//     messenger: [
//         { key: "messenger_home", label: "Messenger Home" },
//         { key: "story_ms", label: "Messenger Story" },
//         { key: "sponsored_messages", label: "Messenger Sponsored Messages" },
//         { key: "messenger_inbox", label: "Messenger Inbox" } // Added
//     ],
//     audience_network: [
//         { key: "classic", label: "Audience Network Classic" },
//         { key: "rewarded_video", label: "Audience Network Rewarded Video" },
//         { key: "in_stream", label: "Audience Network In-Stream Video" } // Added
//     ]
// };

const localesdata = [
  {
    name: "English (US)",
    key: 6,
  },
  {
    name: "Catalan",
    key: 1,
  },
  {
    name: "Czech",
    key: 2,
  },
  {
    name: "Cebuano",
    key: 56,
  },
  {
    name: "Welsh",
    key: 3,
  },
  {
    name: "Danish",
    key: 4,
  },
  {
    name: "German",
    key: 5,
  },
  {
    name: "Basque",
    key: 59,
  },
  {
    name: "Spanish",
    key: 23,
  },
  {
    name: "Spanish (Spain)",
    key: 7,
  },
  {
    name: "Guarani",
    key: 66,
  },
  {
    name: "Finnish",
    key: 8,
  },
  {
    name: "French (France)",
    key: 9,
  },
  {
    name: "Galician",
    key: 65,
  },
  {
    name: "Hungarian",
    key: 30,
  },
  {
    name: "Italian",
    key: 10,
  },
  {
    name: "Japanese",
    key: 11,
  },
  {
    name: "Korean",
    key: 12,
  },
  {
    name: "Norwegian (bokmal)",
    key: 13,
  },
  {
    name: "Norwegian (nynorsk)",
    key: 84,
  },
  {
    name: "Dutch",
    key: 14,
  },
  {
    name: "Frisian",
    key: 63,
  },
  {
    name: "Polish",
    key: 15,
  },
  {
    name: "Portuguese (Brazil)",
    key: 16,
  },
  {
    name: "Portuguese (Portugal)",
    key: 31,
  },
  {
    name: "Romanian",
    key: 32,
  },
  {
    name: "Russian",
    key: 17,
  },
  {
    name: "Slovak",
    key: 33,
  },
  {
    name: "Slovenian",
    key: 34,
  },
  {
    name: "Swedish",
    key: 18,
  },
  {
    name: "Thai",
    key: 35,
  },
  {
    name: "Turkish",
    key: 19,
  },
  {
    name: "Northern Kurdish (Kurmanji)",
    key: 76,
  },
  {
    name: "Simplified Chinese (China)",
    key: 20,
  },
  {
    name: "Traditional Chinese (Hong Kong)",
    key: 21,
  },
  {
    name: "Traditional Chinese (Taiwan)",
    key: 22,
  },
  {
    name: "Afrikaans",
    key: 36,
  },
  {
    name: "Albanian",
    key: 87,
  },
  {
    name: "Armenian",
    key: 68,
  },
  {
    name: "Azerbaijani",
    key: 53,
  },
  {
    name: "Belarusian",
    key: 54,
  },
  {
    name: "Bengali",
    key: 45,
  },
  {
    name: "Bosnian",
    key: 55,
  },
  {
    name: "Bulgarian",
    key: 37,
  },
  {
    name: "Croatian",
    key: 38,
  },
  {
    name: "Flemish",
    key: 83,
  },
  {
    name: "English (UK)",
    key: 24,
  },
  {
    name: "Esperanto",
    key: 57,
  },
  {
    name: "Estonian",
    key: 58,
  },
  {
    name: "Faroese",
    key: 62,
  },
  {
    name: "French (Canada)",
    key: 44,
  },
  {
    name: "Georgian",
    key: 72,
  },
  {
    name: "Greek",
    key: 39,
  },
  {
    name: "Gujarati",
    key: 67,
  },
  {
    name: "Hindi",
    key: 46,
  },
  {
    name: "Icelandic",
    key: 69,
  },
  {
    name: "Indonesian",
    key: 25,
  },
  {
    name: "Irish",
    key: 64,
  },
  {
    name: "Javanese",
    key: 71,
  },
  {
    name: "Kannada",
    key: 75,
  },
  {
    name: "Kazakh",
    key: 73,
  },
  {
    name: "Latvian",
    key: 78,
  },
  {
    name: "Lithuanian",
    key: 40,
  },
  {
    name: "Macedonian",
    key: 79,
  },
  {
    name: "Malay",
    key: 41,
  },
  {
    name: "Marathi",
    key: 81,
  },
  {
    name: "Mongolian",
    key: 80,
  },
  {
    name: "Nepali",
    key: 82,
  },
  {
    name: "Punjabi",
    key: 47,
  },
  {
    name: "Serbian",
    key: 42,
  },
  {
    name: "Swahili",
    key: 88,
  },
  {
    name: "Filipino",
    key: 26,
  },
  {
    name: "Tamil",
    key: 48,
  },
  {
    name: "Telugu",
    key: 49,
  },
  {
    name: "Malayalam",
    key: 50,
  },
  {
    name: "Ukrainian",
    key: 52,
  },
  {
    name: "Uzbek",
    key: 91,
  },
  {
    name: "Vietnamese",
    key: 27,
  },
  {
    name: "Khmer",
    key: 74,
  },
  {
    name: "Tajik",
    key: 89,
  },
  {
    name: "Arabic",
    key: 28,
  },
  {
    name: "Hebrew",
    key: 29,
  },
  {
    name: "Urdu",
    key: 90,
  },
  {
    name: "Persian",
    key: 60,
  },
  {
    name: "Pashto",
    key: 85,
  },
  {
    name: "Sinhala",
    key: 86,
  },
  {
    name: "Japanese (Kansai)",
    key: 70,
  },
  {
    name: "English (All)",
    key: 1001,
  },
  {
    name: "Spanish (All)",
    key: 1002,
  },
  {
    name: "French (All)",
    key: 1003,
  },
  {
    name: "Chinese (All)",
    key: 1004,
  },
  {
    name: "Portuguese (All)",
    key: 1005,
  },
];

function getPositionsByKeys(keys) {
  const keySet = new Set(keys); // Faster lookup
  return allPositions.filter((pos) => keySet.has(pos.key));
}
const AccountForm = ({
  account,
  theme,
  form,
  network,
  adset,
  index,
  allAccounts,
  selectedIndex,
  defaultUrlData,
  setNewDefaultURLBuilder
}) => {

  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] =
    useState(false);
  const [websiteURL, setWebsiteURL] = useState("");
  const [caption, setCaption] = useState("");
  const [defaultURLBuilder, setDefaultURLBuilder] = useState("");
  console.log("defaultUrlData in account form", defaultUrlData);


  const onReturnUrl = (text) => {
    // console.log(text)
    setWebsiteURL(text)
    setNewDefaultURLBuilder(text);
    setIsModalVisibleForURLBuilder(false);
    const currentAdsets = form.getFieldValue("adsets") || [];
    const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        [account]: {
          Website_URL: text,
          Caption: text.split("//")[1].split("/")[0],
        }
      };
    } else {
      setCaption(text.split("/")[0]);
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        [account]: {
          Website_URL: text,
          Caption: text.split("/")[0],
        }
      };
    }
    // Update the form with the new adsets
    form.setFieldsValue({
      adsets: updatedAdsets,
    });
  }

  const handleCancelForURLBuilder = () => {
    setIsModalVisibleForURLBuilder(false);
  }

  const onClickEdit = (index) => {
    setIsModalVisibleForURLBuilder(true);
    setDefaultURLBuilder(form.getFieldValue(["adsets", index, account, "Website_URL"]) ? form.getFieldValue(["adsets", index, account, "Website_URL"]) : defaultUrlData);
  };

  const onClickSetToAllAccounts = () => {
    const currentAdsets = form.getFieldValue("adsets") || [];
    const updatedAdsets = [...currentAdsets];
    // if (network === "FB_Mnet" || network === "FB_DomainActive") {
    //   setCaption(text.split("//")[1].split("/")[0]);
    //   updatedAdsets[index] = {
    //     ...updatedAdsets[index],
    //     [account]: {
    //       Website_URL: text,
    //       Caption: text.split("//")[1].split("/")[0],
    //     }
    //   };
    // } else {
    //   setCaption(text.split("/")[0]);
    //   updatedAdsets[index] = {
    //     ...updatedAdsets[index],
    //     [account]: {
    //       Website_URL: text,
    //       Caption: text.split("/")[0],
    //     }
    //   };
    // }
    for (const newAccount of allAccounts) {
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        [newAccount]: {
          Website_URL: websiteURL,
          Caption: caption,
        }
      };
    }
    // Update the form with the new adsets
    form.setFieldsValue({
      adsets: updatedAdsets,
    });
  }


  const getUrlBuilder = useMemo(() => {
    // return (extraString) => {
    switch (network) {
      case "FB_Mnet":
        //defaultValues
        return (
          <MnetUrlBuilder defaultValues={defaultURLBuilder} accountis={account} onReturnMessage={onReturnUrl} />
        );
      case "FB_Tonic1":
        return (
          <TonicUrlBuilder
            defaultValues={defaultURLBuilder}
            accountis={account}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            defaultValues={defaultURLBuilder}
            accountis={account}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            accountis={account}
            onReturnMessage={onReturnUrl}
          />
        );
    }
    // }
  }, [network, account, defaultURLBuilder, onReturnUrl]);

  // useEffect(() => {
  //   if (selectedIndex === account) {
  //     form.validateFields(); // Trigger validation when the form is mounted and visible
  //   }
  // }, [selectedIndex, account, form]); // Re-run validation on selection change

  // useEffect(() => {
  //   // Trigger validation only for the specific fields related to this account
  //   if (selectedIndex === account) {
  //     form.validateFields([["adsets", index, account, "Caption"], ["adsets", index, account, "Website_URL"]]); // Validate only relevant fields
  //   }
  // }, [selectedIndex, account, index, form]);

  const style = {
    width: '300vw',
    height: '300vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div>
      {/* <Form
        form={form}
        layout="vertical"
        name="accountForm"
        // initialValues={{ account }} // Populate form with account data
      > */}
      <Form.Item
        // label="Website URL"
        label={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingRight: "50px",
              }}
            >
              <span style={{ color: "#B4B4B4" }}>Website_URL</span>
            </div>
            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => onClickEdit(index)}
            />

            {allAccounts.length > 1 && (
              <Popconfirm
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                  color: theme === "dark" ? "#fff" : "#333",
                }}
                description={
                  <div style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    Are you sure to add website url and display link all accounts?
                  </div>
                }
                okText={
                  <div onClick={onClickSetToAllAccounts}>
                    Yes
                  </div>
                }
                cancelText="No"
              >

                <Button style={{
                  border: "1px solid #91C25F", color: theme === "dark" ? "#fff" : "#000",              // keep text color fixed
                  backgroundColor: "transparent", marginLeft: "50px"
                }}>Set to All Accounts</Button>
              </Popconfirm>
            )}
            {/* <div style={style}> */}
            {/* <Popconfirm title="Thanks for using antd. Have a nice day !" open>
                <Button type="primary">Set to All Accounts</Button>
              </Popconfirm> */}
            {/* </div> */}
            {/* <Button style={{marginLeft:"50px"}} >Set to All Accounts</Button> */}
          </div>
        }
        name={["adsets", index, account, "Website_URL"]}
        rules={[{ required: true, message: `Please input Website URL! for ${account}` }]}
        preserve={true}
      >
        <TextArea placeholder="Website URL" autoSize={{ minRows: 5, maxRows: 15 }} />
      </Form.Item>

      <Form.Item
        label="Display Link"
        name={["adsets", index, account, "Caption"]}
        rules={[{ required: true, message: `Please input Display Link! for ${account}` }]}
        preserve={true}
      >
        <TextArea placeholder="Display Link" autoSize={{ minRows: 2, maxRows: 10 }} />
      </Form.Item>

      <Modal
        title="URL Builder"
        visible={isModalVisibleForURLBuilder}
        onCancel={handleCancelForURLBuilder}
        footer={null}
        width="80%"
        bodyStyle={{ height: '50vh', overflowY: 'auto' }}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
      >
        {getUrlBuilder}
      </Modal>
      {/* </Form> */}
    </div>
  );
};

const AdPreviewPerAccount = ({
  account,
  adset,
  selectedFiles,
  form,
  theme,
  editedImages,
  imagehash,
}) => {
  const adFiles = selectedFiles[adset.id] || [];

  // Get form values for this adset and account
  const websiteURL = Form.useWatch(["adsets", adset.index, account, "Website_URL"], form) || "";
  const caption = Form.useWatch(["adsets", adset.index, account, "Caption"], form) || "";
  const headline = Form.useWatch(["adsets", adset.index, "headline"], form) || "";
  const description = Form.useWatch(["adsets", adset.index, "Description"], form) || "";
  const primaryText = Form.useWatch(["adsets", adset.index, "message"], form) || "";
  const addName = Form.useWatch(["adsets", adset.index, "AddName"], form) || "";

  if (adFiles.length === 0) return null;

  return (
    <div>
      {adFiles.map((file, i) => (
        <Badge
          key={i}
          style={{
            backgroundColor: "#52c41a",
            borderRadius: "50%",
            position: "absolute",
            top: "5px",
            right: "5px",
            zIndex: 10,
            cursor: "pointer",
          }}
          offset={[5, 5]}
        >
          <div className="container-ad-preview">
            <div
              className="ad-preview"
              style={{
                width: "350px",
                backgroundColor: theme === "dark" ? "#4f4f4d" : "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                marginBottom: "16px",
              }}
            >
              <div className="ad-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {file?.type?.startsWith("image/") ? (
                    <img
                      src={
                        editedImages[file?.name]
                          ? editedImages[file?.name]
                          : file?.originFileObj
                            ? URL.createObjectURL(file.originFileObj)
                            : file?.url
                      }
                      alt="preview"
                      width="40"
                      height="40"
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    <video
                      src={
                        file?.originFileObj
                          ? URL.createObjectURL(file.originFileObj)
                          : file?.url
                      }
                      width="40"
                      height="30"
                      style={{ objectFit: "cover" }}
                      muted
                    />
                  )}
                  <div
                    style={{
                      color: theme === "dark" ? "#fff" : "#000",
                      fontWeight: "500",
                    }}
                  >
                    {/* {addName} */}
                    <div style={{ opacity: 0.7, fontSize: "12px" }}>
                      <GlobalOutlined /> {imagehash?.pageName || "Page Name"}
                    </div>
                  </div>
                </div>
                <div>
                  <MoreOutlined style={{ fontSize: "20px", opacity: 0.6 }} />
                </div>
              </div>

              <div
                className="ad-desc"
                style={{
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  color: theme === "dark" ? "#fff" : "#000",
                  padding: "8px 12px",
                }}
              >
                {primaryText}
              </div>

              <div
                className="ad-image"
                style={{
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {file?.type?.startsWith("image/") ? (
                  <img
                    src={
                      editedImages[file?.name]
                        ? editedImages[file?.name]
                        : file?.originFileObj
                          ? URL.createObjectURL(file.originFileObj)
                          : file?.url
                    }
                    alt="ad"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <video
                    controls
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  >
                    <source
                      src={
                        file?.originFileObj
                          ? URL.createObjectURL(file.originFileObj)
                          : file?.url
                      }
                    />
                  </video>
                )}
              </div>

              <div
                className="ad-cta"
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {caption}
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {headline}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {description}
                  </div>
                </div>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#91C25F",
                    borderColor: "#91C25F",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                >
                  Learn More
                </Button>
              </div>

              {websiteURL && (
                <a
                  href={websiteURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#007bff",
                    padding: "6px 12px",
                    display: "block",
                    wordBreak: "break-all",
                  }}
                >
                  {websiteURL}
                </a>
              )}

              <div
                className="icons"
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "8px 0",
                  borderTop: "1px solid #ccc",
                }}
              >
                <div style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  <LikeOutlined /> Like
                </div>
                <div style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  <CommentOutlined /> Comment
                </div>
                <div style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  <ShareAltOutlined /> Share
                </div>
              </div>
            </div>
          </div>
        </Badge>
      ))}
    </div>
  );
};

const AdsetComponent = ({
  index,
  adset,
  theme,
  campaignName,
  imagehash,
  selectedFiles,
  setSelectedFiles,
  selectedFilesFromMedia,
  setSelectedFilesFromMedia,
  selectedFilesFromCreatives,
  setSelectedFilesFromCreatives,
  form,
  campaignLevelDailyBudget,
  isCampaignBudgetActive,
  isAnyAdsetBudgetSet,
  showBidAmount,
  updateAdMediaData,
  addAdset,
  removeAdset,
  cloneAdset,
  // currentDate,
  localesdata,
  handleFieldChange,
  network,
  accountis,
  handleAdsetChange,
  setSelectedPositions,
  selectedPositions,
  selectedPublishers,
  setSelectedPublishers,
  pixel_id_list,
  page_id_list,
  pageidList,
  pixelIdList,
  defaultUrlData,
  setDefaultUrlData,
  budgetType,
  page,
  pixel,
  geo
}) => {
  console.log(page_id_list, "page_id_list in adset component");
  console.log(pageidList, "pageidList in adset component");
  console.log(pixel_id_list, "pixel_id_list in adset component");
  console.log(pixelIdList, "pixelIdList in adset component");
  const currentDate = dayjs();
  const after30Days = currentDate.add(30, "day");
  const [activeMediaIndex, setActiveMediaIndex] = useState({});
  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] =
    useState(false);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [addName, setAddName] = useState(campaignName);
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [creativeIndex, setCreativeIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState("upload");
  const [editedImages, setEditedImages] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(String(accountis[0]));
  const [budget, setBudget] = useState(adset?.DailyAdd_amount ?? 0)
  console.log(selectedPositions, "selectedPositions in adset component");
  console.log(adset.id, "adset id in adset component");
  console.log(selectedPublishers, "selectedPublishers in adset component");
  console.log(selectedPositions?.[adset.id]);
  console.log(adset, "adset in adset component");
  console.log(defaultUrlData, "defaultUrlData in adset component");

  const objectiveValue = Form.useWatch("Objectives", form) ?? "";

  const watchedCampaignAmount = Form.useWatch("Daily_amount", form) ?? 0;
  const CampaignBudgetActive = Number(watchedCampaignAmount) > 0;

  const Bid_strategy_values = [
    {
      value: "LOWEST_COST_WITHOUT_CAP",
      label: "Highest Volume",
      title: "",
    },
    {
      value: "LOWEST_COST_WITH_BID_CAP",
      label: "Bid Cap",
      title: "",
    },
    {
      value: "COST_CAP",
      label: "Cost per Result Goal",
      title: "",
    },
    {
      value: "LOWEST_COST_WITH_MIN_ROAS",
      label: "ROAS Goal",
      title: "",
    },
  ];

  const bidStrategy = Form.useWatch("Bid_strategy", form);
  const Special_categories = Form.useWatch("Special_categories", form);
  console.log(Special_categories);

  const adsetLocationCountry = Form.useWatch(["adsets", index, "countries"], form);

  console.log(adsetLocationCountry);

  const allCountries = [
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
    { value: "MX", label: "Mexico" },
    { value: "AT", label: "Austria" },
    { value: "BE", label: "Belgium" },
    { value: "BG", label: "Bulgaria" },
    { value: "HR", label: "Croatia" },
    { value: "CY", label: "Cyprus" },
    { value: "CZ", label: "Czech Republic" },
    { value: "DK", label: "Denmark" },
    { value: "EE", label: "Estonia" },
    { value: "FI", label: "Finland" },
    { value: "GR", label: "Greece" },
    { value: "HU", label: "Hungary" },
    { value: "IE", label: "Ireland" },
    { value: "LV", label: "Latvia" },
    { value: "LT", label: "Lithuania" },
    { value: "LU", label: "Luxembourg" },
    { value: "MT", label: "Malta" },
    { value: "NL", label: "Netherlands" },
    { value: "PL", label: "Poland" },
    { value: "PT", label: "Portugal" },
    { value: "RO", label: "Romania" },
    { value: "SK", label: "Slovakia" },
    { value: "SI", label: "Slovenia" },
    { value: "SE", label: "Sweden" },
  ];



  const campaignCountries = Form.useWatch("countries", form) || [];
  const hasCountries = Array.isArray(campaignCountries) && campaignCountries.length > 0;

  console.log(campaignCountries);

  const newCampaignCountries = campaignCountries && campaignCountries.length > 0 ? campaignCountries.map(item => {
    return allCountries.find(item1 => item1.value === item)
  }) : []

  console.log(newCampaignCountries);

  //   const options = useMemo(() => {
  //   const newpageidList = form.getFieldValue(["adsets", index, "page_id"]) || []
  //   const norm = (v) =>
  //     v == null ? null
  //     : typeof v === "string" ? v
  //     : v.accountId ?? v.accountNumber ?? (Object.values(v)[0] ?? null);

  //   const selectedAccountIds = new Set(
  //     (newpageidList || []).map(norm).filter(Boolean)
  //   );

  //   const selectedValuesSet = new Set(
  //     (newpageidList || []).map((v) =>
  //       typeof v === "string" ? v : JSON.stringify(v)
  //     )
  //   );

  //   return (page_id_list || []).map((p) => {
  //     const accountId = p.accountId ?? norm(p.value);
  //     const valueKey = typeof p.value === "string" ? p.value : JSON.stringify(p.value);
  //     return {
  //       value: p.value,
  //       label: p.label ?? p.value,
  //       disabled: Boolean(accountId) && selectedAccountIds.has(accountId) && !selectedValuesSet.has(valueKey),
  //     };
  //   });
  // }, [page_id_list, form, index]);

  const allAdsets = Form.useWatch("adsets", form) || [];
  const thisSelected = allAdsets[index]?.page_id || [];

  const norm = (v) =>
    v == null ? null
      : typeof v === "string" ? (v.split(" - ")[0] || "").trim() || null
        : v.accountId ?? v.accountNumber ?? Object.values(v)[0] ?? null;

  const valueKeyOf = (v) => (typeof v === "string" ? v : JSON.stringify(v));

  const selectedAccountsInOther = useMemo(() => {
    const s = new Set();
    (allAdsets || []).forEach((ad, i) => {
      if (i === index) return;
      (ad?.page_id || []).forEach((v) => {
        const id = norm(v);
        if (id) s.add(id);
      });
    });
    return s;
  }, [allAdsets, index]);

  const thisSelectedKeys = useMemo(
    () => new Set((thisSelected || []).map((v) => valueKeyOf(v))),
    [thisSelected]
  );

  const options = useMemo(
    () =>
      (page_id_list || []).map((p) => {
        const acc = p.accountId ?? norm(p.value);
        const key = valueKeyOf(p.value);
        return {
          value: p.value,
          label: p.label ?? (typeof p.value === "string" ? p.value : JSON.stringify(p.value)),
          disabled: Boolean(acc) && selectedAccountsInOther.has(acc) && !thisSelectedKeys.has(key),
        };
      }),
    [page_id_list, selectedAccountsInOther, thisSelectedKeys]
  );

  // // const selected = Form.useWatch("page_id", form) || []; // array of strings
  // const coerceToString = (v) => (v == null ? "" : String(v?.value ?? v));
  // const extractAccount = (val) => {
  //   if (!val) return null;
  //   const parts = String(val).split(" - ");
  //   return parts[0]?.trim() || null;
  // };

  // watch the top-level Account_Number (array of account ids/strings)
  const watchedAccountList = Form.useWatch("Account_Number", form) || [];

  // normalize account id strings (trim)
  const normalizedRequiredAccounts = React.useMemo(() => {
    if (!Array.isArray(watchedAccountList)) return [];
    return watchedAccountList
      .map((a) => (a == null ? "" : String(a).trim()))
      .filter(Boolean);
  }, [watchedAccountList]);

  // helper: extract account prefix from an option value like "acctA - page1"
  const coerceToString = (v) => (v == null ? "" : String(v?.value ?? v));
  const extractAccount = (val) => {
    if (!val) return "";
    const parts = String(val).split(" - ");
    return parts[0]?.trim() || ""
  };

  const minSelectionValidatorPerAccount = (friendlyLabel) => ({
    validator: (_, value) => {
      // selected values from the field (array of strings or option objects)
      const selectedArray = Array.isArray(value) ? value : value ? [value] : [];

      // compute set of accounts present in selected values
      const selectedAccountsSet = new Set(
        selectedArray.map(coerceToString).map(extractAccount).filter(Boolean)
      );

      // which required accounts are missing from selection?
      const missing = normalizedRequiredAccounts.filter(
        (acct) => !selectedAccountsSet.has(String(acct))
      );

      if (missing.length === 0) {
        return Promise.resolve();
      }

      // friendly message: list missing accounts (or show count if too many)
      const maxList = 5; // if too many missing, don't spam
      const missingMsg =
        missing.length <= maxList ? missing.join(", ") : `${missing.length} accounts`;

      return Promise.reject(
        new Error(
          `Select ${friendlyLabel} for ${missingMsg} ${missing.length > 1 ? "accounts" : "account"}`
        )
      );
    },
  });

  // ---------- Per-adset watchers & memoized option lists ----------
  // For page_id (per adset)
  const selectedPages = Form.useWatch("page_id", form) || [];
  // const optionsWithDisabled = useMemo(() => {
  //   const selectedStrings = (selectedPages || []).map(coerceToString);
  //   const selectedAccounts = new Set(selectedStrings.map(extractAccount).filter(Boolean));

  //   return (page_id_list || []).map((opt) => {
  //     const optValue = coerceToString(opt?.value ?? opt);
  //     const optAccount = extractAccount(optValue);
  //     const alreadySelected = selectedStrings.includes(optValue);

  //     const disabled = Boolean(optAccount) && selectedAccounts.has(optAccount) && !alreadySelected;

  //     return {
  //       label: opt?.label ?? optValue,
  //       value: optValue,
  //       disabled,
  //     };
  //   });
  // }, [page_id_list, selectedPages]);

  // For pixel_id (per adset)

  const optionsWithDisabled = useMemo(() => {
    const selectedStrings = (selectedPages || []).map(coerceToString);
    const selectedAccounts = new Set(
      selectedStrings.map(extractAccount).filter(Boolean)
    );

    return (page_id_list || []).map((opt) => {
      const optValue = coerceToString(opt?.value ?? opt);
      const optAccount = extractAccount(optValue);
      const alreadySelected = selectedStrings.includes(optValue);

      // 🔥 When page = "Pages", no disabling at all
      if (page === "Pages") {
        return {
          label: opt?.label ?? optValue,
          value: optValue,
          disabled: false,
        };
      }

      // ✅ Original functionality (1 selection per account)
      const disabled =
        Boolean(optAccount) &&
        selectedAccounts.has(optAccount) &&
        !alreadySelected;

      return {
        label: opt?.label ?? optValue,
        value: optValue,
        disabled,
      };
    });
  }, [page_id_list, selectedPages, page]);


  const selectedPixels = Form.useWatch("pixel_id", form) || [];
  // const pixelOptionsWithDisabled = useMemo(() => {
  //   const selectedStrings = (selectedPixels || []).map(coerceToString);
  //   const selectedAccounts = new Set(selectedStrings.map(extractAccount).filter(Boolean));

  //   return (pixel_id_list || []).map((opt) => {
  //     const optValue = coerceToString(opt?.value ?? opt);
  //     const optAccount = extractAccount(optValue);
  //     const alreadySelected = selectedStrings.includes(optValue);

  //     const disabled = Boolean(optAccount) && selectedAccounts.has(optAccount) && !alreadySelected;

  //     return {
  //       label: opt?.label ?? optValue,
  //       value: optValue,
  //       disabled,
  //     };
  //   });
  // }, [pixel_id_list, selectedPixels]);

  // ---------- Validator factory (reusable) ----------
  // const minSelectionValidator = (fieldLabel, idx) => {
  //   // returns antd validator function (receives rule, value)
  //   return {
  //     validator: (_, value) => {
  //       // value may be undefined or array
  //       const vals = Array.isArray(value) ? value : (value ? [value] : []);
  //       const required = getRequiredCountForAdset(form.getFieldValue, idx);
  //       if (vals.length >= required) {
  //         return Promise.resolve();
  //       }
  //       return Promise.reject(
  //         new Error(`Select at least ${required} ${fieldLabel}${required > 1 ? "s" : ""}`)
  //       );
  //     },
  //   };
  // };

  const pixelOptionsWithDisabled = useMemo(() => {
    const selectedStrings = (selectedPixels || []).map(coerceToString);
    const selectedAccounts = new Set(
      selectedStrings.map(extractAccount).filter(Boolean)
    );

    return (pixel_id_list || []).map((opt) => {
      const optValue = coerceToString(opt?.value ?? opt);
      const optAccount = extractAccount(optValue);
      const alreadySelected = selectedStrings.includes(optValue);

      // 🔥 When page = "Pixels", no disabling at all
      if (pixel === "Pixels") {
        return {
          label: opt?.label ?? optValue,
          value: optValue,
          disabled: false,
        };
      }

      // ✅ Original functionality (1 selection per account)
      const disabled =
        Boolean(optAccount) &&
        selectedAccounts.has(optAccount) &&
        !alreadySelected;

      return {
        label: opt?.label ?? optValue,
        value: optValue,
        disabled,
      };
    });
  }, [pixel_id_list, selectedPixels, pixel]);



  const handleFirstOptimizationChange = (value) => {
    // Get current adsets from form
    const adsets = form.getFieldValue("adsets") || [];

    // Map through adsets and set optimization_goal to the new value
    const newAdsets = adsets.map((a) => ({
      ...a,
      optimization_goal: value,
    }));

    // Update the form
    form.setFieldsValue({ adsets: newAdsets });
  };


  const onReturnUrl = (text) => {
    setIsModalVisibleForURLBuilder(false);
    setWebsiteURL(text);
    const currentAdsets = form.getFieldValue("adsets") || [];
    const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        Website_URL: text,
        Caption: text.split("//")[1].split("/")[0],
      };
    } else {
      setCaption(text.split("/")[0]);
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        Website_URL: text,
        Caption: text.split("/")[0],
      };
    }

    // Update the form with the new adsets
    form.setFieldsValue({
      adsets: updatedAdsets,
    });

    // const checkFormCompletion = () => {
    //     const allValues = form.getFieldsValue(true);
    //     const isComplete = Object.keys(allValues).every(
    //         key => allValues[key] !== undefined && allValues[key] !== ''
    //     );
    //     setIsFormComplete(isComplete);
    // };

    // // Trigger form completion check
    // checkFormCompletion();
    // setIsFormComplete(true);
    // console.log(text, "text");
  };

  const getUrlBuilder = useMemo(() => {
    // return (extraString) => {
    switch (network) {
      case "FB_Mnet":
        //defaultValues
        return (
          <MnetUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
        );
      case "FB_Tonic1":
        return (
          <TonicUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
    }
    // }
  }, [network, accountis, onReturnUrl]);

  // const getPositionOptions = () => {
  //     const allPositions = selectedPublishers[adset.id].reduce((acc, publisher) => {
  //         return acc.concat(positionOptions[publisher] || []);
  //     }, []);
  //     return [...new Set(allPositions)]; // Remove duplicates
  // };

  // const getPositionOptions = () => {
  //     const publishers = selectedPublishers?.[adset.id] || [];
  //     const allPositions = publishers.reduce((acc, publisher) => {
  //       return acc.concat(positionOptions[publisher] || []);
  //     }, []);

  //     // Ensure uniqueness by key
  //     const uniqueMap = new Map(allPositions.map(pos => [pos.key, pos]));
  //     return Array.from(uniqueMap.values());
  //   };
  const getPositionOptions = () => {
    const publishers = selectedPublishers?.[adset.id] || [];

    const combined = publishers.flatMap((pub) => positionOptions[pub] || []);

    // De-duplicate by `key`
    const unique = Array.from(
      new Map(combined.map((pos) => [pos.key, pos])).values()
    );

    return unique;
  };

  // const handlePublisherChange = (value) => {
  //     setSelectedPublishers(prevState => ({
  //         ...prevState,
  //         [adset.id]: value // Update the specific adset's publishers
  //     }));
  //     // setSelectedPositions([]); // Clear positions when publisher selection changes
  // };

  // const handlePublisherChange = (value) => {
  //   setSelectedPublishers((prev) => ({
  //     ...prev,
  //     [adset.id]: value,
  //   }));

  //   // Optionally reset selected positions for this adset
  //   setSelectedPositions((prev) => ({
  //     ...prev,
  //     [adset.id]: [], // clear when publishers change
  //   }));
  // };

  const handlePublisherChange = (value) => {
    // 🧠 Start with the new selection
    let updated = [...value];

    // ⚙️ Meta-style dependencies
    // Messenger and Audience Network require Facebook
    // if (updated.includes("messenger") && !updated.includes("facebook")) {
    //   updated.push("facebook");
    // }
    if (updated.includes("audience_network") && !updated.includes("facebook")) {
      updated.push("facebook");
    }

    // 🧹 If Facebook is removed but required by others, re-add it
    if (
      !updated.includes("facebook") &&
      (
        // updated.includes("messenger") || 
        updated.includes("audience_network"))
    ) {
      updated.push("facebook");
    }

    // ✅ Update state for publishers
    setSelectedPublishers((prev) => ({
      ...prev,
      [adset.id]: updated,
    }));

    // // ✅ Reset selected positions when publishers change
    setSelectedPositions((prev) => ({
      ...prev,
      [adset.id]: [],
    }));



    // ✅ Preserve only valid positions
    //   setSelectedPublishers((prev) => ({
    //   ...prev,
    //   // current: updated,       // 👈 keeps UI happy
    //   [adset.id]: updated,    // 👈 keeps adset mapping
    // }));

    // ✅ Also update form value if you’re syncing with AntD Form
    form?.setFieldValue(["adsets", index, "platforms"], updated);
  };

  const handleCancelForURLBuilder = () => {
    setIsModalVisibleForURLBuilder(false);
  };

  const onClickCreativesDrawer = (adset, index) => {
    console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
    setCreativeIndex(adset.id);
  };

  const handlePositionChange = (values, options) => {
    console.log(values, "values");
    console.log(options, "options");
    const formatted = options.map((opt) => ({
      key: opt.value,
      label: opt.label || opt.children,
    }));
    console.log(formatted, "formatted positions");
    // setSelectedPositions(formatted);
    setSelectedPositions((prevState) => ({
      ...prevState, // Spread the previous state to preserve other entries
      [adset.id]: formatted, // Set the formatted array at the specific index
    }));
  };

  const onClickEdit = (index) => {
    setIsModalVisibleForURLBuilder(true);
  };

  const tooltipMsg = isCampaignBudgetActive
    ? "You have enabled daily budget in the campaign level"
    : isAnyAdsetBudgetSet
      ? "You have enabled daily budget in the Adset Level"
      : "";

  //   const selectedFilesData = (data) => {
  //     const mappedFiles = data.map((file, i) => ({
  //       uid: file.uid || `-${Date.now()}-${i}`,
  //       name: file?.name,
  //       status: 'done',
  //       type: file?.url?.endsWith(".jpg")
  //         ? "image/jpg"
  //         : file?.url?.endsWith(".jpeg")
  //         ? "image/jpeg"
  //         : file?.url?.endsWith(".png")
  //         ? "image/png"
  //         : "video/",
  //       url: file?.url,
  //     }));

  //     // ✅ Update selectedFiles
  //     setSelectedFiles((prev) => {
  //       const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
  //     //   updateAdMediaData(creativeIndex, updated); // ✅ Call here too
  //       return { ...prev, [creativeIndex]: updated };
  //     });

  //     // ✅ Update selectedFilesFromCreatives
  //     setSelectedFilesFromCreatives((prev) => {
  //       const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
  //       return { ...prev, [creativeIndex]: updated };
  //     });

  //     // ✅ Close drawer
  //     setOpenCreativesDrawer(false);

  //     // ✅ Update Form MediaContent
  //     const currentMediaContent = form.getFieldValue(['adsets', creativeIndex, 'MediaContent']) || [];
  //     const updatedMediaContent = [...currentMediaContent, ...mappedFiles];

  //     form.setFieldsValue({
  //       adsets: {
  //         [creativeIndex]: {
  //           MediaContent: updatedMediaContent
  //         }
  //       }
  //     });

  //     // form.validateFields('MediaContent');
  // };

  // const selectedFilesData = (data) => {
  //     console.log("Selected Files Data:", data);

  //     setSelectedFiles(prev => [...prev, ...data.map((file, index)=>{
  //         return({
  //             uid: file.uid || `-${index+1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //             url: file?.url,
  //         })
  //     })]);
  //     setSelectedFilesFromCreatives(prev => [...prev, ...data.map((file, index)=>{
  //         return({
  //             uid: file.uid || `-${index+1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //             url: file?.url,
  //         })
  //     })]);

  //     if (data.length > 0) {
  //         const currentMediaContent = form.getFieldValue("MediaContent") || [];

  //         const newFiles = data.map((file, index) => ({
  //             uid: file.uid || `-${index + 1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: file?.url?.endsWith(".jpg")
  //                 ? "image/jpg"
  //                 : file?.url?.endsWith(".jpeg")
  //                 ? "image/jpeg"
  //                 : file?.url?.endsWith(".png")
  //                 ? "image/png"
  //                 : "video/",
  //             url: file?.url,
  //         }));

  //         const updatedMediaContent = [...currentMediaContent, ...newFiles];

  //         form.setFieldsValue({ MediaContent: updatedMediaContent });
  //         form.validateFields(["MediaContent"]);
  //     }
  //     setOpenCreativesDrawer(false);
  // }

  // const selectedFilesData = (data) => {
  //      // hardcoded for now as you requested

  //     const mappedFiles = data.map((file, i) => ({
  //       uid: file.uid || `-${Date.now()}-${i}`,
  //       name: file?.name,
  //       status: 'done',
  //       type: file?.url?.endsWith(".jpg")
  //         ? "image/jpg"
  //         : file?.url?.endsWith(".jpeg")
  //         ? "image/jpeg"
  //         : file?.url?.endsWith(".png")
  //         ? "image/png"
  //         : "video/",
  //       url: file?.url,
  //     }));

  //     // ✅ Update selectedFiles as object by index
  //     setSelectedFiles((prev) => {
  //       const updated = [...(prev[index] || []), ...mappedFiles];
  //       return { ...prev, [index]: updated };
  //     });

  //     // ✅ Update selectedFilesFromCreatives as object by index
  //     setSelectedFilesFromCreatives((prev) => {
  //       const updated = [...(prev[index] || []), ...mappedFiles];
  //       return { ...prev, [index]: updated };
  //     });

  //     // ✅ Close creative drawer
  //     setOpenCreativesDrawer(false);

  //     // ✅ Update form MediaContent for adset[0]
  //     const currentMediaContent = form.getFieldValue(['adsets', index, 'MediaContent']) || [];
  //     const updatedMediaContent = [...currentMediaContent, ...mappedFiles];

  //     form.setFieldsValue({
  //       adsets: {
  //         [index]: {
  //           MediaContent: updatedMediaContent
  //         }
  //       }
  //     });

  //     form.validateFields([['adsets', index, 'MediaContent']]);
  //   };

  const selectedFilesData = (data, index, adsetId = creativeIndex) => {
    const mapped = data.map((file, i) => ({
      uid: file.uid || `-${Date.now()}-${i}`,
      name: file?.name,
      status: "done",
      type: file?.url?.endsWith(".jpg")
        ? "image/jpg"
        : file?.url?.endsWith(".jpeg")
          ? "image/jpeg"
          : file?.url?.endsWith(".png")
            ? "image/png"
            : "video/",
      url: file?.url,
    }));

    setSelectedFilesFromCreatives((prev) => ({
      ...prev,
      [adsetId]: [...(prev[adsetId] || []), ...mapped],
    }));

    setSelectedFiles((prev) => ({
      ...prev,
      [adsetId]: [...(prev[adsetId] || []), ...mapped],
    }));

    form.setFieldsValue({
      adsets: {
        [index]: {
          MediaContent: [
            ...(form.getFieldValue(["adsets", index, "MediaContent"]) || []),
            ...mapped,
          ],
        },
      },
    });

    form.validateFields([["adsets", index, "MediaContent"]]);
    setOpenCreativesDrawer(false);
  };

  // function needsBeneficiaryAndPayer(targetCountries = []) {
  const EU_AND_ASSOCIATED = [
    // EU 27
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
    "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
    // EU territories & regions
    "AX", "PT-20", "DE-BS", "IT-CO", "ES-CN", "GF", "GP", "DE-HL", "IT-LI", "PT-30",
    "MQ", "YT", "ES-ML", "GR-MA", "RE", "FR-MF"
  ];
  //   return targetCountries.some(c => EU_AND_ASSOCIATED.includes(c));
  // }
  //   const EU_AND_ASSOCIATED = [
  //   // ... your list ...
  //   "MQ", "YT", "ES-ML", "GR-MA", "RE", "FR-MF"
  // ];

  function needsBeneficiaryAndPayer(targetCountries) {
    if (!targetCountries) return false;

    // Normalize to an array:
    let countries = targetCountries;

    // If a comma/semicolon/space-separated string (common when reading form values)
    if (typeof targetCountries === 'string') {
      countries = targetCountries
        .split(/[,;]\s*|\s+/)   // split by comma, semicolon or whitespace
        .map(s => s.trim())
        .filter(Boolean);
    } else if (!Array.isArray(targetCountries)) {
      // If it's an object (e.g., {0: 'IN', 1: 'DE'}) try to get values and flatten
      if (typeof targetCountries === 'object' && targetCountries !== null) {
        countries = Object.values(targetCountries).flat().map(String).map(s => s.trim()).filter(Boolean);
      } else {
        // unknown type — bail out safely
        return false;
      }
    }

    // Finally, do the check
    return Array.isArray(countries) && countries.some(c => EU_AND_ASSOCIATED.includes(String(c)));
  }

  const BeneficiaryAndPayer = needsBeneficiaryAndPayer(adsetLocationCountry);
  console.log(BeneficiaryAndPayer);

  // useEffect(() => {
  //   setNewSelectedPageId(pageidList || []);
  //   setNewSelectedPixelId(pixelIdList || []);
  //   setNewPageIdList(page_id_list || []);
  //   setNewPixelIdList(pixel_id_list || []);
  // }, [page_id_list, pixel_id_list, pageidList, pixelIdList, form]);

  // useEffect(() => {
  //   if (hasCountries) {
  //     form.setFieldsValue({
  //       adsets: {
  //         [index]: {
  //           page_id: newpageidList,
  //           pixel_id: newPixelIdList
  //         },
  //       },
  //     });
  //   }
  // }, [newpageidList, newPixelIdList, form]);

  // useEffect(() => {
  //   // Only set if pageidList is defined (avoid overwriting user edits with undefined)
  //   // if (Array.isArray(newpageidList)) {
  //     form.setFieldsValue({
  //       adsets: {
  //         [index]: {
  //           page_id: newpageidList
  //         },
  //       },
  //     });
  //   // }
  // }, [newpageidList, index, form]);

  //   useEffect(() => {
  //   form.setFieldsValue({
  //     adsets: {
  //       [index]: {
  //         DatePicker: currentDate ? dayjs(currentDate) : dayjs(),
  //       },
  //     },
  //   });
  // }, [currentDate, index, form]);

  useEffect(() => {
    if (pixel === "Pixel") {
      form.setFieldsValue({
        pixel_id: pixelIdList || []
      });
    }
  }, [pixel, pixelIdList, form]);

  useEffect(() => {
    if (page === "Page") {
      form.setFieldsValue({
        page_id: pageidList || []
      });
    }
  }, [page, pageidList, form]);


  useEffect(() => {
    if (geo !== "Geos") return;

    if (!Array.isArray(allAdsets) || allAdsets.length === 0) return;

    // First adset's countries
    const firstCountries =
      Array.isArray(allAdsets[0]?.countries) ? allAdsets[0].countries : [];

    // Assign to all allAdsets
    const updated = allAdsets.map((a) => ({
      ...a,
      countries: firstCountries.slice(), // copy to avoid shared ref
    }));

    form.setFieldsValue({ adsets: updated });
  }, [geo, allAdsets, form]);

  useEffect(() => {
    if (hasCountries) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            Min_Age: "18",
            Max_Age: "65",
            Gender: "0"
          },
        },
      });
    }
  }, [hasCountries, index, form]);

  useEffect(() => {
    const creatives = selectedFilesFromCreatives?.[adset.id];
    if (Array.isArray(creatives) && creatives.length > 0) {
      setSelectedOption("creative");
    } else {
      setSelectedOption("upload");
    }
  }, [selectedFilesFromCreatives, adset.id]);

  useEffect(() => {
    // Re-run once selectedPositions or adset.id updates
    if (
      selectedPositions?.[adset.id] &&
      Array.isArray(selectedPositions[adset.id])
    ) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            positions: selectedPositions[adset.id].map((pos) => pos.key),
          },
        },
      });
    }
  }, [selectedPositions, adset.id]);

  useEffect(() => {
    // Re-run once selectedPositions or adset.id updates
    if (
      selectedPositions?.[adset.id] &&
      Array.isArray(selectedPositions[adset.id])
    ) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            positions: selectedPositions[adset.id].map((pos) => pos.key),
          },
        },
      });
    }
  }, [selectedPositions, adset.id]);
  //   useEffect(() => {
  //     console.log(adset, index)
  //   if (adset?.DailyAdd_amount !== undefined) {
  //     form.setFieldValue(
  //       ["adsets", index, "DailyAdd_amount"],
  //       adset.DailyAdd_amount
  //     );
  //   }
  // }, [adset?.DailyAdd_amount, index, form]);
  // useEffect(() => {
  //     if(adset?.DailyAdd_amount){
  //         form.setFieldsValue({
  //             adsets: {
  //               [index]: {
  //                 DailyAdd_amount: adset.DailyAdd_amount,
  //               },
  //             },
  //         });
  //     }
  // }, [adset]);
  // useEffect(() => {
  //   if (adset?.DailyAdd_amount !== undefined) {
  //     form.setFields([
  //       {
  //         name: ["adsets", index, "DailyAdd_amount"],
  //         value: adset.DailyAdd_amount,
  //       },
  //     ]);
  //   }
  // }, [adset?.DailyAdd_amount]);
  //   useEffect(() => {
  //   if (adset?.DailyAdd_amount !== undefined) {
  //     form.setFieldsValue({
  //       adsets: {
  //         [index]: {
  //           DailyAdd_amount: adset.DailyAdd_amount,
  //         },
  //       },
  //     });
  //   }
  // }, [adset?.DailyAdd_amount, index]);

  useEffect(() => {
    setSelectedIndex(String(accountis[0]));
  }, [accountis]);

  //   useEffect(() => {
  //     if (!selectedPublishers?.[adset.id]) return;

  //     // const allPositions = selectedPublishers[adset.id].reduce((acc, publisher) => {
  //     //   return acc.concat(positionOptions[publisher] || []);
  //     // }, []);

  //     const draftPositions = selectedPositions?.[adset.id] || [];

  //     // Optional: Only update if empty or differs
  //     if ((selectedPositions?.[adset.id]?.length ?? 0) === 0) {
  //       setSelectedPositions(prev => ({
  //         ...prev,
  //         [adset.id]: draftPositions,
  //       }));
  //     }
  //   }, [selectedPublishers, selectedPositions, adset.id]);

  // useEffect(() => {
  //     // Update selectedPublishers state when adset.id or index changes
  //     setSelectedPublishers(prev => ({
  //         ...prev,
  //         [adset.id]: selectedPublishers?.[adset.id] || []
  //     }));
  // }, [selectedPublishers, adset.id, index]);

  // useEffect(() => {
  //   // Get current adset country value
  //   const current = form.getFieldValue(["adsets", index, "countries"]);

  //   // 🧠 If campaign-level countries exist
  //   if (campaignCountries.length > 0) {
  //     // If current value is not one of the allowed campaign countries → set to first one
  //     if (!campaignCountries.includes(current)) {
  //       form.setFieldValue(["adsets", index, "countries"], campaignCountries[0]);
  //     }
  //   } 
  //   // 🧠 If campaign-level countries don't exist
  //   else {
  //     // If current value is invalid or empty → default to first allCountry
  //     if (!allCountries.some(c => c.value === current)) {
  //       form.setFieldValue(["adsets", index, "countries"], allCountries[0].value);
  //     }
  //   }
  // }, [campaignCountries, form, index, allCountries]);

  // useEffect(() => {
  //   // Get current adset country value
  //   const current = form.getFieldValue(["adsets", index, "countries"]);

  //   if (campaignCountries.length > 0) {
  //     // 🧠 CASE 1: Campaign-level countries exist
  //     // ✅ Keep previous value if it’s still part of new campaignCountries
  //     if (campaignCountries.includes(current)) {
  //       // Do nothing — current is still valid
  //       return;
  //     }

  //     // ❌ If not valid or empty, fallback to the first campaign country
  //     form.setFieldValue(["adsets", index, "countries"], campaignCountries[0]);
  //   } else {
  //     // 🧠 CASE 2: No campaign-level countries exist
  //     // ✅ Keep current if it’s part of all countries
  //     const isValid = allCountries.some((c) => c.value === current);

  //     if (!isValid) {
  //       // ❌ Not valid — default to first available
  //       form.setFieldValue(["adsets", index, "countries"], allCountries[0].value);
  //     }
  //   }
  // }, [campaignCountries, form, index, allCountries]);

  useEffect(() => {
    // always treat current as an array
    const current = form.getFieldValue(["adsets", index, "countries"]) || [];

    // helper to set an array value safely
    const setArrayValue = (valArray) => {
      form.setFields([
        { name: ["adsets", index, "countries"], value: valArray },
      ]);
      form.validateFields([`adsets.${index}.countries`]).catch(() => { });
    };

    if (campaignCountries.length > 0) {
      // Allowed values are campaignCountries
      const filtered = Array.isArray(current)
        ? current.filter((c) => campaignCountries.includes(c))
        : (campaignCountries.includes(current) ? [current] : []);

      if (filtered.length === 0) {
        // fallback to first campaign country (as an array)
        setArrayValue([campaignCountries[0]]);
        // form.setFieldsValue({
        //   adsets: {
        //     [index]: { countries: [campaignCountries[0]] }
        //   }
        // });
        // form.validateFields([`adsets.${index}.countries`]).catch(() => { });
      } else if (filtered.length !== (Array.isArray(current) ? current.length : 0)) {
        // remove invalid entries, keep the valid ones
        setArrayValue(filtered);
      }
    } else {
      // No campaign-level countries -> allowed values are allCountries' values
      const validSet = new Set(allCountries.map((c) => c.value));
      const filtered = Array.isArray(current)
        ? current.filter((c) => validSet.has(c))
        : (validSet.has(current) ? [current] : []);

      if (filtered.length === 0) {
        // fallback to first available country (as an array)
        setArrayValue([allCountries[0].value]);
        // form.setFieldsValue({
        //   adsets: {
        //     [index]: { countries: [allCountries[0].value] }
        //   }
        // });
        // form.validateFields([`adsets.${index}.countries`]).catch(() => { });
      }
      else if (filtered.length !== (Array.isArray(current) ? current.length : 0)) {
        setArrayValue(filtered);
      }
    }
    // include only necessary deps (allCountries is an array constant — ok to include)
  }, [campaignCountries, form, index, allCountries]);

  const handleFirstCountriesChange = (newCountriesArray) => {
    const adsets = form.getFieldValue("adsets") || [];
    const newAdsets = adsets.map((a, i) => ({
      ...a,
      countries: Array.isArray(newCountriesArray) ? newCountriesArray : [],
    }));
    form.setFieldsValue({ adsets: newAdsets });
  };

  const Optimization_goal_values = {
    OUTCOME_LEADS: [
      { value: "OFFSITE_CONVERSIONS", label: "Maximize number of conversions" },
      { value: "LANDING_PAGE_VIEWS", label: "Maximize number of landing page views" },
      { value: "LINK_CLICKS", label: "Maximize number of link clicks" },
      { value: "DAILY_UNIQUE_REACH", label: "Maximize daily unique reach" },
      { value: "IMPRESSIONS", label: "Maximize number of impressions" },
    ],
    OUTCOME_SALES: [
      { value: "OFFSITE_CONVERSIONS", label: "Maximize number of conversions" },
      { value: "VALUE", label: "Maximize value of conversions" },
      { value: "LANDING_PAGE_VIEWS ", label: "Maximize number of landing page views" },
      { value: "LINK_CLICKS", label: "Maximize number of link clicks" },
      { value: "DAILY_UNIQUE_REACH", label: "Maximize daily unique reach" },
      { value: "IMPRESSIONS", label: "Maximize number of impressions" },
    ]
  }

  const Conversion_Event_options = {
    OUTCOME_LEADS: [
      { value: "LEAD", label: "Lead" },
      { value: "CONTACT", label: "Contact" },
      { value: "SCHEDULE", label: "Schedule  " },
    ],
    OUTCOME_SALES: [
      { value: "PURCHASE", label: "Purchase" },
      { value: "INITIATED_CHECKOUT", label: "Initiate Checkout" },
      { value: "ADD_TO_CART ", label: "Add to Cart" },
      { value: "CONTENT_VIEW", label: "View Content" },
      { value: "ADD_TO_WISHLIST", label: " Add to Wishlist" },
    ]
  }

  const Action_Source_Values = {
    OUTCOME_LEADS: [
      { value: "website", label: "Website" },
    ],
    OUTCOME_SALES: [
      { value: "website", label: "Website" },
    ]
  }

  const optionsForOptimz_goal = Optimization_goal_values[objectiveValue] || [];

  // value currently in form for this adset (keeps UI in sync)
  const adsetsValues = form.getFieldValue("adsets") || [];
  const currentValue = adsetsValues[index]?.optimization_goal ?? "";

  const optionsForIndex =
    index === 0
      ? optionsForOptimz_goal
      : optionsForOptimz_goal.map((o) => ({ ...o, disabled: o.value !== currentValue }));

  const currentCountries = adsetsValues[index]?.countries ?? [];

  // source options: either filtered by campaignCountries or all
  const baseOptions =
    campaignCountries.length > 0
      ? allCountries.filter((c) => campaignCountries.includes(c.value))
      : allCountries;

  // Build options depending on geo and index
  const optionsForIndexOfCountries =
    geo === "Geos" && index > 0
      ? // disable any option that's NOT currently selected for this adset
      baseOptions.map((opt) => ({
        ...opt,
        disabled: !currentCountries.includes(opt.value),
      }))
      : // otherwise full options (fully editable)
      baseOptions;


  return (
    <Collapse
      accordion
      className={
        theme === "dark" ? "custom-collapse-dark" : "custom-collapse-light"
      }
    >
      <Panel
        header={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            className="adset-collapse-panel"
          >
            <span
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                alignContent: "center",
              }}
            >
              {adset.AdsetPanelName}
            </span>

            <div>
              {index !== 0 && (
                <Popconfirm
                  title="Are you sure to delete this Adset?"
                  onConfirm={(e) => {
                    e.stopPropagation(); // Prevent panel collapse
                    removeAdset(index, adset.id);
                  }}
                  okText="Yes"
                  cancelText="No"
                  style={{ float: "right", marginLeft: "10px" }}
                >
                  <Button
                    type="text"
                    onClick={(e) => e.stopPropagation()} // Prevent panel collapse
                    icon={<FaTrashCan color="#EC7117" />}
                  />
                </Popconfirm>
              )}
              <Button
                type="text"
                icon={
                  <PlusOutlined
                    style={{ color: theme === "dark" ? "#fff" : "#000" }}
                  />
                }
                // onClick={() => {
                //     const updatedAdsets = adsets.filter((_, i) => i !== index);
                //     setAdsets(updatedAdsets);
                //     setActiveKey(['1']); // Reset to the first panel
                // }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent panel
                  addAdset();
                }}
                style={{ float: "right", marginLeft: "10px" }}
              />
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent panel collapse
                  cloneAdset(adset.id);
                }}
                style={{ float: "right", marginLeft: "10px" }}
              />
            </div>
          </div>
        }
        key={adset.id}
        forceRender
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <Form.Item
            name={["adsets", index, "AdsetName"]}
            // initialValue={campaignName}
            label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 200px" }}
          >
            <Input
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
              onChange={(e) => {
                const value = e.target.value; // Correct way to get the value
                form.setFieldsValue({
                  adsets: [
                    ...form.getFieldValue("adsets").slice(0, index), // Get previous adsets before the current index
                    { ...form.getFieldValue("adsets")[index], AddName: value }, // Update AddName for the current adset
                    ...form.getFieldValue("adsets").slice(index + 1), // Get adsets after the current index
                  ],
                });
              }}
            />
          </Form.Item>
          <Form.Item
            name={["adsets", index, "action_source"]}
            label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "120px" }}
          // initialValue={adset.action_source || "website"}
          >
            <Select
              options={Action_Source_Values[objectiveValue] || []}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.action_source || "website"}
            // onChange={(value) => handleFieldChange(index, "action_source", value)}
            />
          </Form.Item>
          {/* <Form.Item
            name={["adsets", index, "optimization_goal"]}
            label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "120px" }}
          // initialValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
          >
            <Select
              options={
                Optimization_goal_values[objectiveValue] || []
                //   [
                //   { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                //   { value: "LINK_CLICKS", label: "Clicks" },
                //   { value: "REACH", label: "Reach" },
                //   { value: "VALUE", label: "Value" },
                // ]
              }
              // onChange={(value) => handleFieldChange(index, "optimization_goal", value)}
              // defaultValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item> */}
          <Form.Item
            key={index}
            name={["adsets", index, "optimization_goal"]}
            label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
            rules={[{ required: true, message: "Please select an option!" }]}
            style={{ flex: "120px" }}
          >
            {index === 0 ? (
              <Select
                options={optionsForIndex}
                value={currentValue}
                onChange={(val) => handleFirstOptimizationChange(val)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
              />
            ) : (
              // Select stays enabled but only the current option is enabled to pick
              <Select
                options={optionsForIndex}
                value={currentValue}
                // no onChange needed (user can't change to another value because other options are disabled)
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
              />
            )}
          </Form.Item>
          <Form.Item
            name={["adsets", index, "custom_event_type"]}
            label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "120px" }}
          // initialValue={adset.custom_event_type || "LEAD"}
          >
            <Select
              options={Conversion_Event_options[objectiveValue] || []}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.custom_event_type || "LEAD"}
            // onChange={(value) => handleFieldChange(index, "custom_event_type", value)}
            />
          </Form.Item>
          <Form.Item
            name={["adsets", index, "billing_event"]}
            label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "120px" }}
            initialValue={adset.billing_event || "IMPRESSIONS"}
          >
            <Select
              options={[
                { value: "IMPRESSIONS", label: "Impressions" },
                { value: "VALUE", label: "Value" },
              ]}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.billing_event || "IMPRESSIONS"}
            // onChange={(value) => handleFieldChange(index, "billing_event", value)}
            />
          </Form.Item>
          {/* <Form.Item
                        name="pixel_id"
                        initialValue={imagehash?.pixelID}
                        label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 200px' }}
                    >
                        <Input  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
                    </Form.Item> */}
          {/* <Form.Item
            name="pixel_id"
            // initialValue={
            //   typeof imagehash?.pixelID === "object"
            //     ? imagehash.pixelID.Universal
            //     : imagehash?.pixelID
            // }
            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "140px" }}
          >
            <Select
              mode="multiple"
              value={pixelIdList}                // array of strings
              // onChange={Accountchange}             // gets string[]
              options={pixel_id_list}             // [{value,label}]
              placeholder="Select account(s)"
              // showSearch
              optionFilterProp="label"
              allowClear
              maxTagCount={1}                                      // 👈 always show only the first selected
              maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
              className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Form.Item> */}


          {/* <Form.Item
            name="pixel_id"
            // initialValue={
            //   typeof imagehash?.pixelID === "object"
            //     ? imagehash.pixelID.Universal
            //     : imagehash?.pixelID
            // }
            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "140px" }}
          >
            <Form.Item shouldUpdate>
    {({ getFieldValue }) => {
      const selected = getFieldValue("pixel_id") || [];

      const options = pixel_id_list.map((p) => ({
        value: p.value,
        label: p.label,
        disabled: selected.includes(p.value)   // 👈 disable based on selected value
      }));

      return (
        <Select
              mode="multiple"
              value={pixelIdList}                // array of strings
              // onChange={Accountchange}             // gets string[]
              options={options}             // [{value,label}]
              placeholder="Select account(s)"
              // showSearch
              optionFilterProp="label"
              allowClear
              maxTagCount={1}                                      // 👈 always show only the first selected
              maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
              className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              style={{ width: "100%", borderRadius: 8 }}
            />
      );
    }}
  </Form.Item>
          </Form.Item> */}

          {/* <Form.Item
            // name = {["adsets", index, "pixel_id"]}
            name="pixel_id"
            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
            // rules={[
            //           {
            //             required: true,
            //             message: "Please select an option!",
            //           },
            //         ]}
            style={{ flex: "180px" }}
            rules={[{ type: "array", required: true, min: 1, message: "Please select at least one pixel!" }]}
          >
            <Form.Item shouldUpdate={(prev, cur) => prev.pixel_id !== cur.pixel_id}>
              {({ getFieldValue, setFieldsValue }) => {
                const selected = getFieldValue("pixel_id") || []; // e.g. ["abc - 123"]

                // Build set of selected account prefixes: split by ' - ' and take first part
                const selectedAccounts = new Set(
                  selected
                    .map(v => (typeof v === "string" ? v.split(" - ")[0].trim() : null))
                    .filter(Boolean)
                );

                // Build options and disable other values from already selected accounts
                const options = pixel_id_list.map(opt => {
                  // extract this option's account prefix in same way
                  const accountPrefix = typeof opt.value === "string" ? opt.value.split(" - ")[0].trim() : null;

                  // disabled if account already chosen AND this particular value is NOT already selected
                  const disabled = accountPrefix && selectedAccounts.has(accountPrefix) && !selected.includes(opt.value);

                  return {
                    value: opt.value,
                    label: opt.label ?? opt.value,
                    disabled,
                  };
                });

                return (
                  <Select
                    mode="multiple"
                    options={options}
                    placeholder="Select pixel(s)"
                    allowClear
                    onChange={(vals) => setFieldsValue({ pixel_id: vals })}
                    maxTagCount={1}
                    maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                    style={{ width: "100%" }}
                  />
                );
              }}
            </Form.Item>
          </Form.Item> */}
          <Form.Item
            name="pixel_id"
            required
            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
            validateTrigger={["onChange", "onBlur"]}
            dependencies={["Account_Number"]}                     // top-level dependency
            rules={[minSelectionValidatorPerAccount("pixel")]}    // <-- new validator
            style={{ flex: 3, marginLeft: "1%" }}
          >
            <Select
              mode="multiple"
              options={pixelOptionsWithDisabled}
              placeholder="Select pixel(s)"
              optionFilterProp="label"
              allowClear
              maxTagCount={1}
              maxTagPlaceholder={(omitted) => `+${omitted.length}`}
              className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
              dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Form.Item>

          {/*pk*/}
          {/* <Form.Item
                        name={['adsets', index, "DailyAdd_amount"]} 
                        // Make sure this name matches the field you want to capture
                        label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                        style={{ flex: '1 1 200px' }}
                        rules={[
                            ({ getFieldValue }) => ({
                            validator(_, value) {
                                const isCampaignLevelBudgetEnabled = campaignLevelDailyBudget !== 0;
                                if (isCampaignLevelBudgetEnabled || (value && parseFloat(value) > 0)) {
                                return Promise.resolve();
                                }
                                return Promise.reject(new Error(`Please enter daily budget in campaign level or Please enter a valid daily budget! in Adset ${index + 1}`));
                            },
                            }),
                        ]}
                    >
                        <Tooltip title={campaignLevelDailyBudget !== 0 ? "You have enabled daily budget in the Campaign Level" : ""}>
                            <Input
                                type="number"
                                placeholder="$"
                                // value={adsetLevelDailyBudget}
                                // onChange={onChangeAdsetLevelDailyBudget}
                            
                                readOnly={campaignLevelDailyBudget !== 0} // This will keep the field readonly
                                step="0.01"
                                onWheel={(e) => e.target.blur()}
                                style={{
                                    backgroundColor: campaignLevelDailyBudget !== 0 ? '#f0f0f0' : 'transparent',
                                    borderRadius: '6px',
                                    borderColor: campaignLevelDailyBudget !== 0 ? 'transparent' : undefined,
                                    fontSize: '14px',
                                    color: '#333',
                                    width: '200px',
                                    boxSizing: 'border-box'
                                }}
                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            />
                        </Tooltip>
                    </Form.Item> */}
          {/* <Form.Item
                        name={['adsets', index, "DailyAdd_amount"]}
                        label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                        style={{ flex: '1 1 200px' }}
                        rules={[
                            {
                            validator(_, value) {
                                const isReadOnly = parseInt(campaignLevelDailyBudget) !== 0;
                                if (isReadOnly) return Promise.resolve();
                        
                                const parsed = parseFloat(value);
                        
                                if (value === undefined || value === '' || isNaN(parsed) || parsed <= 0) {
                                return Promise.reject(
                                    new Error(`Please enter a valid number > 0 in Adset ${index + 1}`)
                                );
                                }
                        
                                return Promise.resolve();
                            },
                            },
                        ]}
                        >
                        <Tooltip
                            title={
                            campaignLevelDailyBudget !== 0
                                ? "You have enabled daily budget in the Campaign Level"
                                : ""
                            }
                        >
                            <Input
                            type="number"
                            placeholder="$"
                            readOnly={campaignLevelDailyBudget !== 0}
                            step="0.01"
                            onWheel={(e) => e.target.blur()}
                            style={{
                                backgroundColor: campaignLevelDailyBudget !== 0 ? '#f0f0f0' : 'transparent',
                                borderRadius: '6px',
                                borderColor: campaignLevelDailyBudget !== 0 ? 'transparent' : undefined,
                                fontSize: '14px',
                                color: '#333',
                                width: '200px',
                                boxSizing: 'border-box',
                            }}
                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            />
                        </Tooltip>
                    </Form.Item> */}
          {/* <Form.Item
                        key={adset.id}
                        name={['adsets', index, "DailyAdd_amount"]}
                        label={`Daily Budget`}
                        rules={[
                        {
                            validator(_, value) {
                            if (isCampaignBudgetActive) return Promise.resolve();

                            const val = parseFloat(value);
                            const shouldBeRequired = isAnyAdsetBudgetSet && !isCurrentFilled;

                            if (shouldBeRequired && (!val || val <= 0)) {
                            return Promise.reject(
                            new Error(`Please enter a valid number > 0 in Adset ${index + 1}`)
                            );
                        }

                        return Promise.resolve();
                        }
                        }
                        ]}
                        >
                        <Tooltip title={tooltipMsg}>
                            <InputNumber
                                placeholder="$"
                                min={0}
                                step={0.01}
                                readOnly={isCampaignBudgetActive}
                                onWheel={(e) => e.target.blur()}
                                style={{
                                    backgroundColor: isCampaignBudgetActive ? '#f0f0f0' : 'transparent',
                                    width: 200
                                }}
                                defaultValue={adset.DailyAdd_amount || 0}
                                // onChange={(value) => handleFieldChange(index, "DailyAdd_amount", value)}
                            />
                        </Tooltip>
                    </Form.Item> */}

          {/* <Form.Item
            name={["adsets", index, "DailyAdd_amount"]}
            label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
            rules={[
              {
                required: !(
                  isCampaignBudgetActive ||
                  form.getFieldValue(["adsets", index, "DailyAdd_amount"]) > 0
                ),
                message: `Please enter a valid number > 0 in Adset ${index + 1
                  }`,
              },
            ]}
          >
            <Tooltip
              title={
                isCampaignBudgetActive
                  ? "You have enabled daily budget in the Campaign Level"
                  : ""
              }
            >
              <InputNumber
                placeholder="$"
                min={0}
                step={0.01}
                value={adset.DailyAdd_amount}
                onChange={(value) => {
                  // Handle the change, updating the adset value both in the form and the adset state
                  handleAdsetChange(index, value);

                  // Ensure that 'adsets' is defined and is an array
                  const adsets = form.getFieldValue("adsets") || []; // Fallback to empty array if undefined

                  // Update only the DailyAdd_amount in the form without disturbing other values
                  const updatedAdsets = adsets.map((ad, i) =>
                    i === index ? { ...ad, DailyAdd_amount: value } : ad
                  );

                  form.setFieldsValue({
                    adsets: updatedAdsets,
                  });
                }}
                readOnly={isCampaignBudgetActive} // Make adset budget read-only if campaign budget is active
                style={{ width: 120 }}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            </Tooltip>
          </Form.Item> */}

          <Form.Item
            name={["adsets", index, "DailyAdd_amount"]}
            required={!CampaignBudgetActive}
            label={<span style={{ color: "#B4B4B4" }}>{`${budgetType} budget`}</span>}
            initialValue={0}
            // validateTrigger={["onBlur"]}
            // re-run validation whenever campaign-level Daily_amount changes
            validateTrigger={["onChange", "onBlur"]}
            dependencies={["adsets"]}
            // rules={[
            //     {
            //       required: (!CampaignBudgetActive),
            //       message: `Please enter a valid budget Adset ${index} `,
            //     }
            //   ]}
            // rules={[
            //   {
            //     // custom validator: valid if campaign has budget OR this adset has > 0
            //     validator: async (_, value) => {
            //       const campaignValue = Number(form.getFieldValue("Daily_amount")) || 0;
            //       const adsetValue = Number(value) || 0;

            //       if (campaignValue > 0 || adsetValue > 0) {
            //         return Promise.resolve();
            //       }

            //       return Promise.reject(
            //         new Error(`Please enter a valid budget > 0 in Adset ${index + 1}`)
            //       );
            //     },
            //   },
            // ]}
            //             rules={[
            //   {
            //     validator: async (_, _value) => {
            //       const allAdsets = form.getFieldValue("adsets") || [];

            //       // If only one adset → no validation needed
            //       if (allAdsets.length <= 1) {
            //         return Promise.resolve();
            //       }

            //       // Check if ANY adset has DailyAdd_amount > 0
            //       const anyGreaterThanZero = allAdsets.some(
            //         (a) => Number(a?.DailyAdd_amount ?? 0) > 0
            //       );

            //       // If ANY adset has > 0 → throw error
            //       if (anyGreaterThanZero) {
            //         const failingIndexes = allAdsets
            //           .map((a, i) => Number(a?.DailyAdd_amount ?? 0) > 0 ? i + 1 : null)
            //           .filter(Boolean);

            //         return Promise.reject(
            //           new Error(
            //             `Budget not allowed: Adset(s) ${failingIndexes.join(", ")} have value > 0`
            //           )
            //         );
            //       }

            //       // Otherwise valid
            //       return Promise.resolve();
            //     },
            //   },
            // ]}
            rules={[
              {
                validator: async () => {
                  const allAdsets = form.getFieldValue("adsets") || [];
                  const campaignValue = Number(form.getFieldValue("Daily_amount") ?? 0);

                  // Convert adsets to numbers safely
                  const adsetValues = allAdsets.map(a => Number(a?.DailyAdd_amount ?? 0));

                  const allAdsetsZero = adsetValues.every(v => v === 0);
                  const anyAdsetGreaterThanZero = adsetValues.some(v => v > 0);

                  // 2) If campaign = 0 AND ALL adsets = 0 → valid

                  if (campaignValue > 0) {
                    return Promise.resolve();
                  }

                  if (campaignValue === 0 && allAdsetsZero) {
                    return Promise.resolve();
                  }

                  // const anyGreaterThanZero = allAdsets.some(a => Number(a?.DailyAdd_amount ?? 0) > 0);
                  if (budget <= 0) {
                    const failing = allAdsets.map((a, i) => Number(a?.DailyAdd_amount ?? 0) > 0 ? i + 1 : null).filter(Boolean);
                    return Promise.reject(new Error(`Adset Budget enabled: provide budget > 0 at ${adset.AdsetPanelName}`));
                  }
                  return Promise.resolve();
                }
              }
            ]}

          >
            <Tooltip
              title={
                CampaignBudgetActive
                  ? "You have enabled budget in the Campaign Level"
                  : ""
              }
              overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: 6,
                // fontWeight: 500,
              }}
            >
              <InputNumber
                placeholder="$"
                min={0}
                step={0.01}
                value={budget}
                // DON'T set `value` prop here — let Form control the field
                // If you still need to sync external state, use onChange to notify (no setFieldsValue)
                onChange={(val) => {
                  // optional: keep external adset state in sync if you use one
                  // make sure handleAdsetChange is defined before calling
                  // if (typeof handleAdsetChange === "function") {
                  //   handleAdsetChange(index, val);
                  // }
                  setBudget(val)
                  form.setFieldValue(["adsets", index, "DailyAdd_amount"], val)
                  // No form.setFieldsValue here — Ant Form updates the field value automatically.
                }}
                // visually and functionally disable when campaign budget active
                disabled={CampaignBudgetActive}
                style={{ width: 120 }}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            </Tooltip>
          </Form.Item>

          <Form.Item
            name={["adsets", index, "DatePicker"]}
            label={<span style={{ color: "#B4B4B4" }}>Start Time (IST)</span>}
            rules={[
              {
                required: true,
                message: "Please input!",
              },
            ]}
            style={{ flex: "150px" }}
            initialValue={currentDate ? dayjs(currentDate) : dayjs()}
          >
            <DatePicker
              showTime
              dropdownClassName={theme === "dark" ? "dark-theme-dropdown" : ""}
              className="green-border-picker"
              //                                 onChange={(value, dateString) => {
              //     console.log("Local Time:", dateString)
              //     console.log("UTC ISO:", moment(value).utc().format("YYYY-MM-DDTHH:mm:ssZ"))
              //   }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          {budgetType !== "daily" &&
            <Form.Item
              name={["adsets", index, "DatePickerEnd"]}
              label={<span style={{ color: "#B4B4B4" }}>End Time (IST)</span>}
              rules={[
                {
                  required: true,
                  message: "Please input!",
                },
              ]}
              style={{ flex: "150px" }}
              initialValue={after30Days ? dayjs(after30Days) : dayjs()}
            >
              <DatePicker
                showTime
                dropdownClassName={theme === "dark" ? "dark-theme-dropdown" : ""}
                className="green-border-picker"
                //                                 onChange={(value, dateString) => {
                //     console.log("Local Time:", dateString)
                //     console.log("UTC ISO:", moment(value).utc().format("YYYY-MM-DDTHH:mm:ssZ"))
                //   }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          }

          {showBidAmount && (
            <Form.Item
              name={["adsets", index, "bid_amount"]}
              label={
                <span style={{ color: "#B4B4B4" }}>{Bid_strategy_values.find(item => item.value === bidStrategy)?.label}</span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter a bid amount!",
                },
                {
                  validator: (_, value) =>
                    value && !isNaN(value) && parseFloat(value) > 0
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("Please enter a valid float value!")
                      ),
                },
              ]}
              style={{ flex: "1 1 150px" }}
            >
              <InputNumber
                type="number"
                placeholder="$"
                step="0.1"
                style={{ color: theme === "dark" ? "#fff" : "#000" }}
                onWheel={(e) => e.target.blur()}
                onKeyPress={(event) => {
                  const charCode = event.charCode;
                  const charStr = String.fromCharCode(charCode);
                  const regex = /^[0-9]*\.?[0-9]*$/;
                  if (!regex.test(charStr)) {
                    event.preventDefault();
                  }
                }}
                onKeyDown={(event) => {
                  // Prevent up/down arrow keys from changing the value
                  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    event.preventDefault();
                  }
                }}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            </Form.Item>
          )}
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            color: "#91C25F",
          }}
        >
          Targeting
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {/* <Form.Item
            name={["adsets", index, "countries"]}
            label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "140px" }}
            initialValue={adset.countries || "US"}
          >
            <Select
              // options={[
              //   { value: "US", label: "United States", title: "" },
              //   { value: "GB", label: "United Kingdom", title: "" },
              //   { value: "AU", label: "Australia", title: "" },
              //   { value: "IN", label: "India", title: "" },
              //   { value: "AE", label: "United Arab Emirates", title: "" },
              //   { value: "CA", label: "Canada", title: "" },
              //   { value: "DE", label: "Germany", title: "" },
              //   { value: "FR", label: "France", title: "" },
              //   { value: "JP", label: "Japan", title: "" },
              //   { value: "CN", label: "China", title: "" },
              //   { value: "BR", label: "Brazil", title: "" },
              //   { value: "ZA", label: "South Africa", title: "" },
              //   { value: "RU", label: "Russia", title: "" },
              //   { value: "IT", label: "Italy", title: "" },
              //   { value: "ES", label: "Spain", title: "" },
              //   { value: "SG", label: "Singapore", title: "" },
              //   { value: "NZ", label: "New Zealand", title: "" },
              //   { value: "MX", label: "Mexico", title: "" },
              // ]}
              showSearch
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
                { value: "PL", label: "Poland", title: "" },
                { value: "PT", label: "Portugal", title: "" },
                { value: "RO", label: "Romania", title: "" },
                { value: "SK", label: "Slovakia", title: "" },
                { value: "SI", label: "Slovenia", title: "" },
                { value: "SE", label: "Sweden", title: "" },
              ]}
              // defaultValue={adset.countries || "US"}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item> */}
          {/* ✅ FIXED VERSION */}
          {/* <Form.Item
  // Outer wrapper: dependency trigger
  // shouldUpdate={(prev, curr) => prev.countries !== curr.countries}
  shouldUpdate={(prev, curr) =>
    JSON.stringify(prev.countries) !== JSON.stringify(curr.countries)
  }
  noStyle
>
  {({ getFieldValue }) => {
    const campaignCountries = getFieldValue("countries") || [];

    const allCountries = [
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
      { value: "MX", label: "Mexico" },
      { value: "AT", label: "Austria" },
      { value: "BE", label: "Belgium" },
      { value: "BG", label: "Bulgaria" },
      { value: "HR", label: "Croatia" },
      { value: "CY", label: "Cyprus" },
      { value: "CZ", label: "Czech Republic" },
      { value: "DK", label: "Denmark" },
      { value: "EE", label: "Estonia" },
      { value: "FI", label: "Finland" },
      { value: "GR", label: "Greece" },
      { value: "HU", label: "Hungary" },
      { value: "IE", label: "Ireland" },
      { value: "LV", label: "Latvia" },
      { value: "LT", label: "Lithuania" },
      { value: "LU", label: "Luxembourg" },
      { value: "MT", label: "Malta" },
      { value: "NL", label: "Netherlands" },
      { value: "PL", label: "Poland" },
      { value: "PT", label: "Portugal" },
      { value: "RO", label: "Romania" },
      { value: "SK", label: "Slovakia" },
      { value: "SI", label: "Slovenia" },
      { value: "SE", label: "Sweden" },
    ];

    const filteredOptions = campaignCountries.length
      ? allCountries.filter((c) => campaignCountries.includes(c.value))
      : allCountries;

    return (
      <Form.Item
        // 👇 Inner item is the actual field
        name={["adsets", index, "countries"]}
        label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
        rules={[
          {
            required: true,
            message: "Please select an option!",
          },
        ]}
        style={{ flex: "140px" }}
        initialValue={adset.countries || ["US"]}
      >
        <Select
          showSearch
          // mode="multiple"
          allowClear
          placeholder={
            campaignCountries.length
              ? "Select from campaign countries"
              : "Select any country"
          }
          // ✅ Only disable when campaign countries exist but are empty (rare)
          disabled={campaignCountries && campaignCountries.length < 0}
          options={filteredOptions}
          dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
          className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
        />
      </Form.Item>
    );
  }}
</Form.Item> */}
          {/* ✅ FINAL VERSION WITH useWatch */}
          {/* <Form.Item noStyle>
            <Form.Item
              name={["adsets", index, "countries"]}
              label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
              required={true}
              // rules={[{ required: true, message: "Please select at least one country!" }]}
              // rules={[
              //   { type: "array", required: true, min: 1, message: "Please select at least one country!" }
              // ]}
              style={{ flex: "0 0 140px" }}
            // initialValue={
            //   campaignCountries.length > 0
            //     ? [campaignCountries[0]]
            //     : [allCountries[0].value]
            // }
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder={
                  campaignCountries.length
                    ? "Select from campaign countries"
                    : "Select any country"
                }
                options={
                  campaignCountries.length > 0
                    ? allCountries.filter((c) => campaignCountries.includes(c.value))
                    : allCountries
                }
                getPopupContainer={(trigger) => trigger.parentNode}
                dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
              />
            </Form.Item>
          </Form.Item> */}

          <Form.Item noStyle key={index}>
            <Form.Item
              name={["adsets", index, "countries"]}
              label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
              required={true}
              style={{ flex: "0 0 140px" }}
            >
              {/*
          - index === 0 and geo === "Geos": onChange will propagate to all adsets
          - index > 0 and geo === "Geos": Select opens but only current items selectable (others disabled)
          - geo !== "Geos": every index is independent
        */}
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder={
                  campaignCountries.length ? "Select from campaign countries" : "Select any country"
                }
                disabled={(geo === "Geos" && index !== 0)}
                options={optionsForIndexOfCountries}
                getPopupContainer={(trigger) => trigger.parentNode}
                dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                // change handler: only needs to actively update when first index and geo === "Geos"
                onChange={(val) => {
                  if (geo === "Geos" && index === 0) {
                    handleFirstCountriesChange(val);
                  } else {
                    // For independent mode, let Ant Form handle the change automatically.
                    // If you need side effects when geo !== "Geos", handle them here.
                  }
                }}
              />
            </Form.Item>
          </Form.Item>


          {/* {
            BeneficiaryAndPayer && (
              <Form.Item
            name={["adsets", index, "Beneficiary"]}
            label={<span style={{ color: "#B4B4B4" }}>Beneficiary</span>}
            rules={[
              {
                required: true,
                message: "Please fill the input!",
              },
            ]}
            style={{ flex: "1 1 150px" }}
            // initialValue={adset.Min_Age || "18"}
          >
            <Input/>
          </Form.Item>
            )
          } */}

          {BeneficiaryAndPayer && (
            <>
              {/* 🌿 Beneficiary field with Switch in label */}
              <Form.Item
                label={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#B4B4B4" }}>Beneficiary</span>
                    <Tooltip placement="top" title={"Value must be Page ID or BM ID"}
                      overlayInnerStyle={{
                        backgroundColor: theme === 'dark' ? '#111' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000',
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        // fontWeight: 500,
                      }}
                    >
                      <InfoCircleOutlined
                        style={{
                          color: theme === "dark" ? "#bbb" : "#888",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>

                    {/* ✅ Switch controls visibility of Payer field */}
                    <Form.Item
                      noStyle
                      name={["adsets", index, "showPayer"]}
                      valuePropName="checked"
                    >
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                }
                name={["adsets", index, "Beneficiary"]}
                rules={[
                  {
                    required: true,
                    message: "Please fill the input!",
                  },
                ]}
                style={{ flex: "1 1 150px" }}
              >
                <Input />
              </Form.Item>

              {/* ✅ Conditionally render Payer field when switch is ON */}
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) =>
                  prev?.adsets?.[index]?.showPayer !== curr?.adsets?.[index]?.showPayer
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue(["adsets", index, "showPayer"]) ? (
                    <Form.Item
                      name={["adsets", index, "Payer"]}
                      label={
                        // <span style={{ color: "#B4B4B4" }}>Payer</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#B4B4B4" }}>Payer</span>
                          <Tooltip placement="top" title={"Value must be Page ID or BM ID"}
                            overlayInnerStyle={{
                              backgroundColor: theme === 'dark' ? '#111' : '#fff',
                              color: theme === 'dark' ? '#fff' : '#000',
                              border: '1px solid #ccc',
                              borderRadius: 6,
                              // fontWeight: 500,
                            }}
                          >
                            <InfoCircleOutlined
                              style={{
                                color: theme === "dark" ? "#bbb" : "#888",
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>
                        </div>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please fill the input!",
                        },
                      ]}
                      style={{ flex: "1 1 150px" }}
                    >
                      <Input />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </>
          )}


          {/* <Form.Item
            name={["adsets", index, "Min_Age"]}
            label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 150px" }}
            initialValue={adset.Min_Age || "18"}
          >
            <Select
              options={[
                { value: "18", label: "18", title: "" },
                { value: "25", label: "25", title: "" },
                { value: "35", label: "35", title: "" },
                { value: "40", label: "40", disabled: true, title: "" },
              ]}
              // defaultValue={adset.Min_Age || "18"}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item>
          <Form.Item
            name={["adsets", index, "Max_Age"]}
            label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 150px" }}
            initialValue={adset.Max_Age || "65"}
          >
            <Select
              options={[
                { value: "20", label: "20", title: "" },
                { value: "30", label: "30", title: "" },
                { value: "65", label: "65+", title: "" },
                { value: "80", label: "80", disabled: true, title: "" },
              ]}
              // defaultValue={adset.Max_Age || "65"}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item>
          <Form.Item
            name={["adsets", index, "Gender"]}
            label={<span style={{ color: "#B4B4B4" }}> Gender</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 150px" }}
            initialValue={adset.Gender || "0"}
          >
            <Select
              options={[
                { value: "0", label: "All", title: "" },
                { value: "1", label: "Male", title: "" },
                { value: "2", label: "Female", title: "" },
              ]}
              // defaultValue={"0"}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item> */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev?.adsets?.[index]?.countries !== curr?.adsets?.[index]?.countries
            }
          >
            {({ getFieldValue }) => {
              const selectedCountries = getFieldValue(["adsets", index, "countries"]);
              const isDisabled = Array.isArray(selectedCountries) && selectedCountries.length > 0;

              return (
                <>
                  {/* 🔹 Min Age */}
                  <Form.Item
                    name={["adsets", index, "Min_Age"]}
                    label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    style={{ flex: "1 1 150px" }}
                    initialValue={adset.Min_Age || "18"}
                  >
                    <Select
                      disabled={hasCountries}
                      options={[
                        { value: "18", label: "18", title: "" },
                        { value: "25", label: "25", title: "", disabled: hasCountries },
                        { value: "35", label: "35", title: "", disabled: hasCountries },
                        { value: "40", label: "40", disabled: true, title: "" },
                      ]}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    />
                  </Form.Item>

                  {/* 🔹 Max Age */}
                  <Form.Item
                    name={["adsets", index, "Max_Age"]}
                    label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    style={{ flex: "1 1 150px" }}
                    initialValue={adset.Max_Age || "65"}
                  >
                    <Select
                      disabled={hasCountries}
                      options={[
                        { value: "20", label: "20", title: "", disabled: hasCountries },
                        { value: "30", label: "30", title: "", disabled: hasCountries },
                        { value: "65", label: "65+", title: "" },
                        { value: "80", label: "80", disabled: true, title: "" },
                      ]}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    />
                  </Form.Item>

                  {/* 🔹 Gender */}
                  <Form.Item
                    name={["adsets", index, "Gender"]}
                    label={<span style={{ color: "#B4B4B4" }}>Gender</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    style={{ flex: "1 1 150px" }}
                    initialValue={adset.Gender || "0"}
                  >
                    <Select
                      disabled={hasCountries}
                      options={[
                        { value: "0", label: "All", title: "" },
                        { value: "1", label: "Male", title: "", disabled: hasCountries },
                        { value: "2", label: "Female", title: "", disabled: hasCountries },
                      ]}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item
            name={["adsets", index, "Language"]}
            label={<span style={{ color: "#B4B4B4" }}>Language</span>}
            rules={[{ required: true, message: "Please select an option!" }]}
            style={{ flex: "1 1 150px" }}
            initialValue={adset.Language || [6]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Language"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.Language || "English (US)"}
            >
              {localesdata.map((option) => (
                <Option key={option.key} value={option.key} title={null}>
                  {option.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item
                        label="Placements"
                        name={['adsets', index, "placements"]}
                        rules={[{ required: true, message: 'Please select a mode!' }]}
                    >
                        <Select placeholder="Select a mode" onChange={handleModeChange}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                            <Option value="Advance">Advance</Option>
                            <Option value="manual">Manual</Option>

                        </Select>
                    </Form.Item>
                    {isManual && (
                        <>
                            <Form.Item
                                name={['adsets', index, "platforms"]}
                                label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                rules={[{ required: true, message: "Please select an option!" }]}
                                style={{ flex: '1 1 300px' }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Platforms"
                                    onChange={handlePublisherChange}
                                    value={selectedPublishers}
                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                >
                                    {publisherOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name={['adsets', index, "positions"]}
                                label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                rules={[{ required: true, message: "Please select an option!" }]}
                                style={{ flex: '1 1 400px' }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Positions"
                                    value={selectedPositions.map(pos => pos.value)}
                                    onChange={handlePositionChange}
                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                >
                                    {selectedPublishers.length > 0 && getPositionOptions()?.map(position => (
                                        <Option key={`${position.key}_${position.label}`} value={position.key}>
                                            {position.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name={['adsets', index, "device_platforms"]}
                                label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select an option!",
                                    },
                                ]}
                                style={{ flex: '1 1 200px' }}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
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
                    )} */}
          <Form.Item
            label={<span style={{ color: "#B4B4B4" }}>Placements</span>}
            name={["adsets", index, "placements"]}
            rules={[{ required: true, message: "Please select a mode!" }]}
            initialValue={adset.placements || "Advance"}
          >
            <Select
              placeholder="Select a mode"
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.placements || "Advance"}
            >
              <Option value="Advance" title={null}>
                Advance
              </Option>
              <Option value="manual" title={null}>
                Manual
              </Option>
            </Select>
          </Form.Item>
          {/* <div style={{display:'flex', flexDirection:"row", justifyContent:'center', alignItems:"center", width:'100%'}}> */}

          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.adsets?.[index]?.placements !==
              curValues.adsets?.[index]?.placements
            }
          >
            {({ getFieldValue }) => {
              const placementValue = getFieldValue([
                "adsets",
                index,
                "placements",
              ]);
              return placementValue === "manual" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px", // spacing between items
                    width: "100%",
                    flexWrap: "wrap", // optional for responsive wrapping
                  }}
                >
                  <Form.Item
                    name={["adsets", index, "platforms"]}
                    label={
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#B4B4B4" }}>Platforms</span>

                        {(() => {
                          // 🧭 Define dependency rules once
                          const dependencyRules = {
                            messenger: "Messenger requires Facebook",
                            audience_network: "Audience Network requires Facebook",
                          };

                          // ✅ Fix: use per-adset array
                          const currentSelection = Array.isArray(selectedPublishers?.[adset.id])
                            ? selectedPublishers[adset.id]
                            : [];

                          // 🧩 Filter platforms that have dependency messages
                          const selectedWithDeps = currentSelection.filter(
                            (p) => dependencyRules[p]
                          );

                          if (selectedWithDeps.length === 0) return null;

                          const tooltipText = (
                            <div style={{ maxWidth: 260, lineHeight: 1.4 }}>
                              <b>Platform Dependencies:</b>
                              <br />
                              {selectedWithDeps.map((p) => (
                                <div key={p}>• {dependencyRules[p]}</div>
                              ))}
                              (Meta doesn’t allow these to run alone)
                            </div>
                          );

                          return (
                            <Tooltip placement="top" title={tooltipText}
                              overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                              }}
                            >
                              <InfoCircleOutlined
                                style={{
                                  color: theme === "dark" ? "#bbb" : "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          );
                        })()}
                      </div>
                    }
                    style={{ flex: 1, minWidth: "210px" }}
                    rules={[{ required: true, message: "Please select at least one platform!" }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Platforms"
                      onChange={handlePublisherChange}
                      value={selectedPublishers?.[adset.id] || []} // ✅ per adset
                      dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    >
                      {publisherOptions.map((option) => (
                        <Option key={option.value} value={option.value} title={null}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>


                  {/* <Form.Item
                    name={["adsets", index, "platforms"]}
                    label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    // style={{ flex: '1 1 300px' }}
                    style={{ flex: 1, minWidth: "210px" }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Platforms"
                      onChange={handlePublisherChange}
                      value={selectedPublishers}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"
                        } green-border-select`}
                    >
                      {publisherOptions.map((option) => (
                        <Option
                          key={option.value}
                          value={option.value}
                          title={null}
                        >
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item> */}

                  {/* <Form.Item
                    name={["adsets", index, "positions"]}
                    label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    style={{ flex: 2, minWidth: "215px" }}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Positions"
                      value={(selectedPositions?.[adset.id] || []).map(
                        (pos) => pos.key
                      )} // ✅ fixed
                      onChange={handlePositionChange}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"
                        } green-border-select`}
                    >
                      {Array.isArray(selectedPublishers?.[adset.id]) &&
                        selectedPublishers[adset.id].length > 0 &&
                        getPositionOptions().map((position) => (
                          <Option
                            key={`${position.key}_${position.label}`}
                            value={position.key}
                            title={null}
                          >
                            {position.label}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item> */}

                  {/* <Form.Item
  name={["adsets", index, "positions"]}
  label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
  style={{ flex: 2, minWidth: "215px" }}
  rules={[
    { required: true, message: "Please select at least one position!" },
    {
      // ⚙️ Added Meta dependency validation rule
      validator: (_, value = []) => {
        if (!Array.isArray(value)) return Promise.resolve();

        // 📘 Dependency rules (from Meta documentation)
        const deps = {
          story_f: ["feed", "story_i"], // Facebook Story → requires Feed or Instagram Story
          marketplace: ["feed"],
          right_hand_column: ["feed"],
          search: ["feed"],
          facebook_reels: ["feed"],
          profile_feed_f: ["feed"],
          classic: ["feed"], // Audience Network → requires Feed
        };

        // 🧩 Validate each selected position
        for (const pos of value) {
          const required = deps[pos];
          if (required && !required.some((r) => value.includes(r))) {
            return Promise.reject(
              new Error(
                `⚠️ “${pos}” requires ${required.join(" or ")} to be selected.`
              )
            );
          }
        }
        return Promise.resolve();
      },
    },
  ]}
>
  <Select
    mode="multiple"
    placeholder="Select Positions"
    value={(selectedPositions?.[adset.id] || []).map((pos) => pos.key)} // ✅ unchanged
    onChange={handlePositionChange}
    dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
    className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
  >
    {Array.isArray(selectedPublishers?.[adset.id]) &&
      selectedPublishers[adset.id].length > 0 &&
      getPositionOptions().map((position) => (
        <Option
          key={`${position.key}_${position.label}`}
          value={position.key}
          title={null}
        >
          {position.label}
        </Option>
      ))}
  </Select>
</Form.Item> */}

                  {/* <Form.Item
                    name={["adsets", index, "positions"]}
                    label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                    style={{ flex: 2, minWidth: "215px" }}
                    rules={[
                      { required: true, message: "Please select at least one position!" },
                      // {
                      //   // ⚙️ Full Meta dependency validation rule
                      //   validator: (_, value = []) => {
                      //     if (!Array.isArray(value)) return Promise.resolve();

                      //     // 📘 Dependency rules for all Meta platforms (FULL)
                      //     const deps = {
                      //       // 🔹 Facebook dependencies
                      //       story_f: ["feed", "story_i"], // Facebook Story → requires Feed or IG Story
                      //       marketplace: ["feed"],
                      //       right_hand_column: ["feed"],
                      //       search: ["feed"],
                      //       facebook_reels: ["feed"],
                      //       profile_feed_f: ["feed"],
                      //       instant_article: ["feed"],
                      //       biz_disco_feed: ["feed"],
                      //       instream_video: ["feed"],

                      //       // 🔹 Instagram dependencies
                      //       story_i: ["stream", "story_f"], // IG Story → requires Stream or FB Story
                      //       explore_home: ["explore"],
                      //       reels: ["stream"],
                      //       profile_feed_i: ["stream"],

                      //       // 🔹 Messenger dependencies
                      //       messenger_home: ["feed"], // ✅ requires Facebook Feed
                      //       story_m: ["messenger_home", "feed"], // ✅ requires Messenger Home + Feed
                      //       sponsored_messages: ["messenger_home", "feed"], // ✅ requires Messenger Home + Feed

                      //       // 🔹 Audience Network dependencies
                      //       classic: ["feed"], // ✅ requires Facebook Feed
                      //       rewarded_video: ["feed"], // ✅ requires Facebook Feed
                      //       instream_video_an: ["feed"], // ✅ requires Facebook Feed (optional naming)
                      //     };

                      //     // 🔍 Create a lookup map for key → label
                      //     const labelMap = {};
                      //     Object.entries(positionOptions).forEach(([platform, arr]) => {
                      //       arr.forEach((item) => {
                      //         labelMap[item.key] = item.label;
                      //       });
                      //     });

                      //     // 🧩 Validate each selected position
                      //     for (const pos of value) {
                      //       const required = deps[pos];
                      //       if (required && !required.some((r) => value.includes(r))) {
                      //         // Convert required keys → readable labels
                      //         const missingLabels = required.map((r) => labelMap[r] || r);
                      //         const posLabel = labelMap[pos] || pos;

                      //         return Promise.reject(
                      //           new Error(
                      //             `⚠️ "${posLabel}" requires "${missingLabels.join(" and ")}" to be selected.`
                      //           )
                      //         );
                      //       }
                      //     }

                      //     return Promise.resolve();
                      //   },
                      // },
                      {
                        validator: (_, value = []) => {
                          if (!Array.isArray(value)) return Promise.resolve();

                          // 📘 All dependency rules
                          const deps = {
                            // 🔹 Facebook dependencies
                            story_f: ["feed", "story_i"], // Requires both
                            marketplace: ["feed"],
                            right_hand_column: ["feed"],
                            search: ["feed"],
                            facebook_reels: ["feed"],
                            profile_feed_f: ["feed"],
                            instant_article: ["feed"],
                            biz_disco_feed: ["feed"],
                            instream_video: ["feed"],

                            // 🔹 Instagram dependencies
                            story_i: ["stream", "story_f"], // Requires both
                            explore_home: ["explore"],
                            reels: ["stream"],
                            profile_feed_i: ["stream"],

                            // 🔹 Messenger dependencies
                            messenger_home: ["feed"],
                            story_m: ["messenger_home", "feed"], // Requires both
                            sponsored_messages: ["messenger_home", "feed"], // Requires both

                            // 🔹 Audience Network dependencies
                            classic: ["feed"],
                            rewarded_video: ["feed"],
                            instream_video_an: ["feed"],
                          };

                          // 🔍 Build key → label map for readable errors
                          const labelMap = {};
                          Object.entries(positionOptions).forEach(([platform, arr]) => {
                            arr.forEach((item) => {
                              labelMap[item.key] = item.label;
                            });
                          });

                          // 🧩 Validate each selected position
                          for (const pos of value) {
                            const required = deps[pos];
                            if (required && !required.every((r) => value.includes(r))) {
                              // Find which required ones are missing
                              const missing = required.filter((r) => !value.includes(r));
                              const missingLabels = missing.map((r) => labelMap[r] || r);
                              const posLabel = labelMap[pos] || pos;

                              // Format message naturally (comma-separated + “and”)
                              const missingText =
                                missingLabels.length > 1
                                  ? `${missingLabels.slice(0, -1).join(", ")} and ${missingLabels[missingLabels.length - 1]
                                  }`
                                  : missingLabels[0];

                              return Promise.reject(
                                new Error(`⚠️ "${posLabel}" requires "${missingText}" to be selected.`)
                              );
                            }
                          }

                          return Promise.resolve();
                        },
                      }
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Positions"
                      value={(selectedPositions?.[adset.id] || []).map((pos) => pos.key)}
                      onChange={handlePositionChange}
                      dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    >
                      {Array.isArray(selectedPublishers?.[adset.id]) &&
                        selectedPublishers[adset.id].length > 0 &&
                        getPositionOptions().map((position) => (
                          <Option
                            key={`${position.key}_${position.label}`}
                            value={position.key}
                            title={null}
                          >
                            {position.label}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>




                  <Form.Item
                    name={["adsets", index, "device_platforms"]}
                    label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                    rules={[
                      { required: true, message: "Please select an option!" },
                    ]}
                    // style={{ flex: '1 1 200px' }}
                    style={{ flex: 1, minWidth: "215px" }}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Please select"
                      options={[
                        { value: "mobile", label: "Mobile", title: "" },
                        { value: "desktop", label: "Desktop", title: "" },
                      ]}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"
                        } green-border-select`}
                    />
                  </Form.Item> */}
                  {/* 🔹 POSITIONS */}
                  <Form.Item
                    name={["adsets", index, "positions"]}
                    label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                    style={{ flex: 2, minWidth: "215px" }}
                    rules={[
                      { required: true, message: "Please select at least one position!" },
                      {
                        // ✅ Meta-compliant dependency validator
                        validator: (_, value = []) => {
                          if (!Array.isArray(value)) return Promise.resolve();

                          // 📘 Dependencies (from Facebook official Marketing API)
                          const deps = {
                            // 🔹 Facebook
                            story_f: ["feed", "story_i"], // Facebook Story → requires Feed or IG Story (mobile)
                            marketplace: ["feed"],
                            search: ["feed"],
                            profile_feed_f: ["feed"],
                            notification: ["feed"],
                            right_hand_column: ["feed"],
                            facebook_reels_overlay: ["feed"],
                            instream_video: ["feed"], // can be standalone for specific objectives only

                            // 🔹 Instagram
                            // story_i: [], // ✅ independent
                            explore_home: ["explore"], // explore home → requires explore
                            // reels: [], // ✅ standalone
                            // stream: [], // ✅ default
                            // profile_feed_i: [], // ✅ standalone
                            // ig_search: [], // ✅ standalone
                            // profile_reels: [], // ✅ standalone

                            // 🔹 Messenger
                            story_m: ["feed", "story_i"], // Messenger Story → requires FB Feed or IG Story (mobile)
                            sponsored_messages: ["__exclusive__"], // must be isolated

                            // 🔹 Audience Network
                            classic: ["feed"], // requires FB Feed
                            rewarded_video: ["feed"], // requires FB Feed

                            // 🔹 Threads
                            threads_stream: ["stream"], // requires Instagram Stream
                          };

                          // 🔍 Build readable label map
                          const labelMap = {};
                          Object.entries(positionOptions).forEach(([platform, arr]) => {
                            arr.forEach((item) => {
                              labelMap[item.key] = item.label;
                            });
                          });

                          // 🧩 Validate exclusivity first (sponsored_messages)
                          if (value.includes("sponsored_messages") && value.length > 1) {
                            return Promise.reject(
                              new Error(
                                `⚠️ "Messenger Sponsored Messages" cannot be combined with other placements. Remove the other Platforms except Messenger`
                              )
                            );
                          }

                          // 🧩 Validate dependencies
                          for (const pos of value) {
                            const required = deps[pos];
                            if (!required || required.includes("__exclusive__")) continue;

                            // Require at least one (OR) dependency, not all
                            if (!required.some((r) => value.includes(r))) {
                              const missingLabels = required.map((r) => labelMap[r] || r);
                              const posLabel = labelMap[pos] || pos;

                              const missingText =
                                missingLabels.length > 1
                                  ? missingLabels.join(" or ")
                                  : missingLabels[0];

                              return Promise.reject(
                                new Error(`⚠️ "${posLabel}" requires "${missingText}" to be selected.`)
                              );
                            }
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Positions"
                      value={(selectedPositions?.[adset.id] || []).map((pos) => pos.key)}
                      onChange={handlePositionChange}
                      dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    >
                      {Array.isArray(selectedPublishers?.[adset.id]) &&
                        selectedPublishers[adset.id].length > 0 &&
                        getPositionOptions().map((position) => (
                          <Option
                            key={`${position.key}_${position.label}`}
                            value={position.key}
                            title={null}
                          >
                            {position.label}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>


                  {/* 🔹 DEVICE VALIDATION */}
                  <Form.Item
                    name={["adsets", index, "device_platforms"]}
                    label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                    style={{ flex: 1, minWidth: "215px" }}
                    rules={[
                      { required: true, message: "Please select at least one device!" },
                      {
                        // ✅ Soft dependency validator (platform + position awareness)
                        validator: (_, devices = []) => {
                          if (!Array.isArray(devices)) return Promise.resolve();

                          const selectedPos = form.getFieldValue(["adsets", index, "positions"]) || [];

                          // Positions that are mobile-only
                          const mobileOnly = [
                            "story_f",
                            "story_i",
                            "story_m",
                            "facebook_reels",
                            "facebook_reels_overlay",
                            "instant_article",
                            "profile_reels",
                            "rewarded_video",
                            "classic",
                          ];

                          // Positions that are desktop-only
                          const desktopOnly = ["right_hand_column"];

                          // If only mobile placements exist → warn if desktop chosen
                          const hasMobileOnly = selectedPos.some((p) => mobileOnly.includes(p));
                          const hasDesktopOnly = selectedPos.some((p) => desktopOnly.includes(p));

                          if (hasMobileOnly && devices.includes("desktop") && !devices.includes("mobile")) {
                            return Promise.reject(
                              new Error(
                                `⚠️ Selected positions are mobile-only. Please include "Mobile" in devices.`
                              )
                            );
                          }

                          if (hasDesktopOnly && devices.includes("mobile") && !devices.includes("desktop")) {
                            return Promise.reject(
                              new Error(
                                `⚠️ "Facebook Right Column" is desktop-only. Please include "Desktop" device.`
                              )
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select Devices"
                      options={[
                        { value: "mobile", label: "Mobile", title: "" },
                        { value: "desktop", label: "Desktop", title: "" },
                      ]}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                    />
                  </Form.Item>

                </div>
              ) : null;
            }}
          </Form.Item>
          {/* </div> */}
        </div>
        <Collapse defaultActiveKey={["open"]} expandIconPosition="start" className={
          theme === "dark"
            ? "custom-collapse-dark"
            : "custom-collapse-light"
        }>
          <Panel
            key="open"
            forceRender
            header={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>AD LEVEL</span>
                {(selectedFiles[index] || []).length > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Breadcrumb separator={<span style={{ color: theme === "dark" ? "#fff" : "#333" }}>/</span>}>
                      {selectedFiles[index].map((_, i) => (
                        <Breadcrumb.Item key={i}>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMediaIndex((prev) => ({
                                ...prev,
                                [index]: i,
                              }));
                            }}
                            style={{
                              fontWeight: activeMediaIndex[index] === i ? "500" : "normal",
                              color:
                                activeMediaIndex[index] === i
                                  ? "#91C25F"
                                  : theme === "dark"
                                    ? "#fff"
                                    : "#333",
                              cursor: "pointer",
                              backgroundColor:
                                activeMediaIndex[index] === i
                                  ? theme === "dark"
                                    ? "rgba(145,194,95,0.2)"
                                    : "rgba(145,194,95,0.15)"
                                  : "transparent",
                              border:
                                activeMediaIndex[index] === i
                                  ? "1px solid #4caf50"
                                  : "2px solid transparent",
                              borderRadius: "6px",
                              padding: "1px 5px",
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            {i + 1}
                          </span>
                        </Breadcrumb.Item>
                      ))}
                    </Breadcrumb>
                  </div>
                )}
              </div>
            }
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "70%", marginRight: "5%" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Form.Item
                      label={
                        <span style={{ color: "#B4B4B4" }}>Select source</span>
                      }
                      style={{ flex: 1 }}
                    >
                      <Select
                        value={selectedOption}
                        onChange={(value) => {
                          setSelectedOption(value);
                          form.validateFields(["MediaContent"]); // Revalidate when switching source
                        }}
                        style={{ marginBottom: 16 }}
                        dropdownClassName={
                          theme === "dark" && "custom-dropdown"
                        }
                        className={`${theme === "dark" ? "dark-theme" : "light-theme"
                          } green-border-select`}
                      >
                        <Option value="upload">Upload</Option>
                        <Option value="creative">Creative library</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name={["adsets", index, "MediaContent"]}
                      rules={[
                        {
                          validator: async () => {
                            // Default to empty array if the value for the index is undefined
                            const mediaFiles =
                              selectedFilesFromMedia[adset.id] || [];
                            const creativeFiles =
                              selectedFilesFromCreatives[adset.id] || [];

                            // Check if there are any files selected based on the selected option
                            if (
                              (selectedOption === "upload" &&
                                mediaFiles.length === 0) ||
                              (selectedOption === "creative" &&
                                creativeFiles.length === 0)
                            ) {
                              throw new Error("Please select Upload!");
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <div>
                        {/* Upload UI */}
                        <div
                          className="custom-dark-mode"
                          style={{
                            display:
                              selectedOption === "upload" ? "block" : "none",
                          }}
                        >
                          <Upload
                            beforeUpload={() => false}
                            // onChange={(info) => {
                            //   const newFiles = info.fileList.map((file) => ({
                            //     ...file,
                            //     uid: file.uid || `-${Date.now()}`,
                            //     source: "media",
                            //     thumbUrl:
                            //       file.thumbUrl ||
                            //       (file.originFileObj ? URL.createObjectURL(file.originFileObj) : undefined),
                            //   }));

                            //   setSelectedFiles((prev) => {
                            //     const existingUids = new Set((prev[index] || []).map((f) => f.uid));
                            //     const filtered = newFiles.filter((f) => !existingUids.has(f.uid));
                            //     const updated = [...(prev[index] || []), ...filtered];
                            //     const newState = { ...prev, [index]: updated };
                            //     form.setFieldsValue({ adsets: { [index]: { MediaContent: updated } } });
                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            //     return newState;
                            //   });

                            //   setSelectedFilesFromMedia((prev) => {
                            //     const existingUids = new Set((prev[index] || []).map((f) => f.uid));
                            //     const filtered = newFiles.filter((f) => !existingUids.has(f.uid));
                            //     const updated = [...(prev[index] || []), ...filtered];
                            //     const newState = { ...prev, [index]: updated };
                            //     form.setFieldsValue({ adsets: { [index]: { MediaContent: updated } } });
                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            //     return newState;
                            //   });
                            // }}
                            onChange={(info) => {
                              const newFiles = info.fileList.map((file) => ({
                                ...file,
                                uid: file.uid || `-${Date.now()}`,
                                source: "media",
                                thumbUrl:
                                  file.thumbUrl ||
                                  (file.originFileObj
                                    ? URL.createObjectURL(file.originFileObj)
                                    : undefined),
                              }));

                              setSelectedFiles((prev) => {
                                const existingUids = new Set(
                                  (prev[adset.id] || []).map((f) => f.uid)
                                );
                                const updated = [
                                  ...(prev[adset.id] || []),
                                  ...newFiles.filter(
                                    (f) => !existingUids.has(f.uid)
                                  ),
                                ];
                                return { ...prev, [adset.id]: updated };
                              });

                              setSelectedFilesFromMedia((prev) => {
                                const existingUids = new Set(
                                  (prev[adset.id] || []).map((f) => f.uid)
                                );
                                const updated = [
                                  ...(prev[adset.id] || []),
                                  ...newFiles.filter(
                                    (f) => !existingUids.has(f.uid)
                                  ),
                                ];
                                return { ...prev, [adset.id]: updated };
                              });

                              const formMedia =
                                form.getFieldValue([
                                  "adsets",
                                  index,
                                  "MediaContent",
                                ]) || [];
                              form.setFieldsValue({
                                adsets: {
                                  [index]: {
                                    MediaContent: [...formMedia, ...newFiles],
                                  },
                                },
                              });

                              form.validateFields([
                                ["adsets", index, "MediaContent"],
                              ]);
                            }}
                            // onRemove={(fileToRemove) => {
                            //   setSelectedFilesFromMedia((prev) => {
                            //     const updated = (prev[index] || []).filter((f) => f.uid !== fileToRemove.uid);
                            //     const newState = { ...prev, [index]: updated };
                            //     form.setFieldsValue({ adsets: { [index]: { MediaContent: updated } } });
                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            //     return newState;
                            //   });

                            //   setSelectedFiles((prev) => {
                            //     const updated = (prev[index] || []).filter((f) => f.uid !== fileToRemove.uid);
                            //     const newState = { ...prev, [index]: updated };
                            //     form.setFieldsValue({ adsets: { [index]: { MediaContent: updated } } });
                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            //     return newState;
                            //   });

                            //   return true;
                            // }}
                            // onChange={(info) => {
                            //     const newFiles = info.fileList.map((file) => ({
                            //       ...file,
                            //       uid: file.uid || `-${Date.now()}`,
                            //       status: 'done',
                            //       type: file.type,
                            //       thumbUrl: file.thumbUrl || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : undefined),
                            //       adsetIndex: index, // Tag the file with adsetIndex
                            //     }));

                            //     setSelectedFiles(prev => [...prev, ...newFiles]);
                            //     setSelectedFilesFromMedia(prev => [...prev, ...newFiles]);

                            //     const currentAll = [...selectedFiles, ...newFiles];
                            //     const filtered = currentAll.filter(f => f.adsetIndex === index);

                            //     form.setFieldsValue({
                            //       adsets: {
                            //         [index]: {
                            //           MediaContent: filtered
                            //         }
                            //       }
                            //     });

                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            // }}

                            // onRemove={(fileToRemove) => {
                            //     setSelectedFiles(prev => prev.filter(f => f.uid !== fileToRemove.uid));
                            //     setSelectedFilesFromMedia(prev => prev.filter(f => f.uid !== fileToRemove.uid));

                            //     const updated = selectedFiles.filter(f => f.uid !== fileToRemove.uid && f.adsetIndex === index);

                            //     form.setFieldsValue({
                            //       adsets: {
                            //         [index]: {
                            //           MediaContent: updated
                            //         }
                            //       }
                            //     });

                            //     form.validateFields([['adsets', index, 'MediaContent']]);
                            //     return true;
                            // }}

                            onRemove={(fileToRemove) => {
                              setSelectedFilesFromMedia((prev) => {
                                const updated = (prev[adset.id] || []).filter(
                                  (f) => f.uid !== fileToRemove.uid
                                );
                                return { ...prev, [adset.id]: updated };
                              });

                              setSelectedFiles((prev) => {
                                const updated = (prev[adset.id] || []).filter(
                                  (f) => f.uid !== fileToRemove.uid
                                );
                                return { ...prev, [adset.id]: updated };
                              });

                              const updatedFormMedia = (
                                form.getFieldValue([
                                  "adsets",
                                  index,
                                  "MediaContent",
                                ]) || []
                              ).filter((f) => f.uid !== fileToRemove.uid);

                              form.setFieldsValue({
                                adsets: {
                                  [index]: {
                                    MediaContent: updatedFormMedia,
                                  },
                                },
                              });

                              form.validateFields([
                                ["adsets", index, "MediaContent"],
                              ]);
                              return true;
                            }}
                            multiple
                            maxCount={10}
                            fileList={selectedFilesFromMedia[adset.id] || []}
                            listType="picture"
                            accept="image/*, video/*"
                          >
                            <Button
                              icon={<UploadOutlined />}
                              className="dark-icon-button"
                              style={{
                                color: theme === "dark" ? "white" : "#000",
                              }}
                            >
                              Select files
                            </Button>
                          </Upload>
                        </div>

                        {/* Creative Library UI */}
                        {selectedOption === "creative" && (
                          <div>
                            <Button
                              icon={<UploadOutlined />}
                              onClick={() => {
                                onClickCreativesDrawer(adset, index);
                              }}
                              className="dark-icon-button"
                              style={{
                                color: theme === "dark" ? "#fff" : "#000",
                              }}
                            >
                              Select files
                            </Button>

                            {selectedFilesFromCreatives[adset.id]?.length >
                              0 && (
                                <div style={{ marginTop: "10px" }}>
                                  {selectedFilesFromCreatives[adset.id].map(
                                    (file, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: 8,
                                        }}
                                      >
                                        {/* <PaperClipOutlined style={{ marginRight: 8 }} /> */}
                                        {/* <Tooltip title={file.name}> */}
                                        {file.type?.startsWith("image/") && (
                                          <img
                                            src={
                                              file.originFileObj
                                                ? URL.createObjectURL(
                                                  file.originFileObj
                                                )
                                                : file.url
                                            }
                                            alt="preview"
                                            style={{
                                              width: 40,
                                              height: 40,
                                              objectFit: "cover",
                                              borderRadius: 4,
                                              marginLeft: 8,
                                            }}
                                          />
                                        )}
                                        <span
                                          style={{
                                            maxWidth: 160,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            paddingLeft: 8,
                                            color:
                                              theme === "dark" ? "#fff" : "#000",
                                          }}
                                        >
                                          {file.name}
                                        </span>
                                        {/* </Tooltip> */}

                                        {/* <DeleteOutlined
                                                                    onClick={() => {
                                                                        const updated = selectedFilesFromCreatives[index].filter(
                                                                        (f) => f.uid !== file.uid
                                                                        );
                                                                        setSelectedFilesFromCreatives(updated);
                                                                        setSelectedFiles((prev) =>
                                                                        prev[index].filter((f) => f.uid !== file.uid)
                                                                        );
                                                                        form.setFieldsValue({ MediaContent: updated });
                                                                        form.validateFields(["MediaContent"]);
                                                                    }}
                                                                    style={{ color: "red", marginLeft: 12, cursor: "pointer" }}
                                                                    /> */}
                                        <DeleteOutlined
                                          onClick={() => {
                                            // Update selectedFilesFromCreatives for the current adset (index)
                                            const updatedCreatives =
                                              selectedFilesFromCreatives[
                                                adset.id
                                              ].filter((f) => f.uid !== file.uid);
                                            setSelectedFilesFromCreatives(
                                              (prev) => {
                                                const updated = {
                                                  ...prev,
                                                  [adset.id]: updatedCreatives,
                                                }; // Update the adset.id specifically
                                                return updated;
                                              }
                                            );

                                            // Update selectedFiles for the current adset (adset.id)
                                            const updatedFiles = selectedFiles[
                                              adset.id
                                            ].filter((f) => f.uid !== file.uid);
                                            setSelectedFiles((prev) => {
                                              const updated = {
                                                ...prev,
                                                [adset.id]: updatedFiles,
                                              }; // Update the index specifically
                                              return updated;
                                            });

                                            // Update form values with the new MediaContent array
                                            form.setFieldsValue({
                                              MediaContent: updatedCreatives,
                                            });

                                            // Trigger validation
                                            form.validateFields(["MediaContent"]);
                                          }}
                                          style={{
                                            color: "red",
                                            marginLeft: 12,
                                            cursor: "pointer",
                                          }}
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="page_id"
                    required
                    label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                    validateTrigger={["onChange", "onBlur"]}
                    dependencies={["Account_Number"]}                     // top-level dependency
                    rules={[minSelectionValidatorPerAccount("page")]}     // <-- new validator
                    style={{ flex: 3, marginLeft: "1%" }}
                  >
                    <Select
                      mode="multiple"
                      options={optionsWithDisabled}
                      placeholder="Select account(s)"
                      optionFilterProp="label"
                      allowClear
                      maxTagCount={1}
                      maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                      className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
                      dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  </Form.Item>

                  {/* <Form.Item
                    name="page_id"
                    // initialValue={pageidList || []}
                    label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                    rules={[
                      {
                        required: true,
                        message: "Please select an option!",
                      },
                    ]}
                    style={{ flex: 3, marginLeft: "1%" }}
                  >
                    
                    <Select
                      mode="multiple"
                      value={pageidList}                // array of strings
                      // onChange={Accountchange}             // gets string[]
                      options={page_id_list}             // [{value,label}]
                      placeholder="Select account(s)"
                      // showSearch
                      optionFilterProp="label"
                      allowClear
                      maxTagCount={1}                                      // 👈 always show only the first selected
                      maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
                      className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
                      dropdownClassName={theme === "dark" && "custom-dropdown"}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  </Form.Item> */}
                  {/* <Form.Item
                    name = {["adsets", index, "page_id"]}
                    // name="page_id"
                    required={true}
                    label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                    rules={[{ type: "array", required: true, min: 1, message: "Please select at least one page!" }]}
                    style={{ flex: 3, marginLeft: "1%" }}
                    // initialValue={newpageidList}
                  >
                    <Form.Item shouldUpdate={(prev, curr) => prev.page_id !== curr.page_id}>
                      {({ getFieldValue, setFieldsValue }) => {
                        const selected = getFieldValue("page_id") || []; // array of selected option values

                        // Build a set of account identifiers that are already selected.
                        // Prefer p.accountId if present; otherwise extract prefix before " - ".
                        const selectedAccounts = new Set(
                          selected
                            .map((val) => {
                              const found = page_id_list.find((o) => o.value === val);
                              if (found && found.accountId) return found.accountId;
                              if (typeof val === "string" && val.includes(" - ")) return val.split(" - ")[0].trim();
                              return null;
                            })
                            .filter(Boolean)
                        );

                        // Build options *from your existing page_id_list* and disable other
                        // entries from accounts that are already selected (except the selected one).
                        const options = page_id_list.map((p) => {
                          const accountId = p.accountId ?? (typeof p.value === "string" && p.value.includes(" - ") ? p.value.split(" - ")[0].trim() : null);
                          const disabled = accountId && selectedAccounts.has(accountId) && !selected.includes(p.value);

                          return {
                            value: p.value,
                            label: p.label ?? p.value,
                            disabled,
                          };
                        });

                        return (
                          <Select
                            mode="multiple"
                            value={newpageidList}
                            options={options}
                            placeholder="Select page(s)"
                            optionFilterProp="label"
                            allowClear
                            maxTagCount={1}
                            maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                            className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
                            dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                            style={{ width: "100%", borderRadius: 8 }}
                            // update the Form-managed value on change
                            onChange={(vals) => setFieldsValue({ page_id: vals })}
                          />
                        );
                      }}
                    </Form.Item>
                  </Form.Item> */}
                  {/* <Form.Item
                    name="page_id"
                    required={true}
                    label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                    rules={[
                      {
                        type: "array",
                        required: true,
                        min: 1,
                        message: "Please select at least one page!",
                      },
                    ]}
                    style={{ flex: 3, marginLeft: "1%" }}
                  >
                    {({ getFieldValue }) => {
                      const selected = getFieldValue("page_id") || [];

                      // Build set of accounts already selected
                      const selectedAccounts = new Set(
                        selected
                          .map((val) => {
                            const obj = page_id_list.find((o) => o.value === val);
                            if (obj?.accountId) return obj.accountId;

                            if (typeof val === "string" && val.includes(" - "))
                              return val.split(" - ")[0].trim();

                            return null;
                          })
                          .filter(Boolean)
                      );

                      // Build final option array with disabled flags
                      const options = page_id_list.map((p) => {
                        const accountId =
                          p.accountId ??
                          (typeof p.value === "string" && p.value.includes(" - ")
                            ? p.value.split(" - ")[0].trim()
                            : null);

                        const disabled =
                          accountId && selectedAccounts.has(accountId) && !selected.includes(p.value);

                        return {
                          value: p.value,
                          label: p.label ?? p.value,
                          disabled,
                        };
                      });

                      return (
                        <Select
                          mode="multiple"
                          options={options}
                          placeholder="Select page(s)"
                          optionFilterProp="label"
                          allowClear
                          maxTagCount={1}
                          maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                          className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"
                            }`}
                          dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                          style={{ width: "100%", borderRadius: 8 }}
                        />
                      );
                    }}
                  </Form.Item> */}

                  {/* <Form.Item
        name={["adsets", index, "page_id"]}
        required
        label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
        rules={[
          { type: "array", required: true, min: 1, message: "Please select at least one page!" },
        ]}
        style={{ flex: 3, marginLeft: "1%" }}
        // initialValue={newpageidList}
      >
        <Select
          mode="multiple"
          // value={newpageidList}
          options={options}
          placeholder="Select page(s)"
          optionFilterProp="label"
          allowClear
          maxTagCount={1}
          maxTagPlaceholder={(omitted) => `+${omitted.length}`}
          className={`single-row-select green-border-select ${
            theme === "dark" ? "custom-input-dark" : "custom-input-light"
          }`}
          dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
          style={{ width: "100%", borderRadius: 8 }}
        />
      </Form.Item> */}

                  {/* <Form.Item
      name={["adsets", index, "page_id"]}
      rules={[{ type: "array", required: true, min: 1, message: "Please select at least one page!" }]}
      style={{ flex: 3, marginLeft: "1%" }}
    >
      <Select
        mode="multiple"
        options={options}
        placeholder="Select page(s)"
        optionFilterProp="label"
        allowClear
        maxTagCount={1}
        maxTagPlaceholder={(omitted) => `+${omitted.length}`}
        className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
        dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
        style={{ width: "100%", borderRadius: 8 }}
      />
    </Form.Item> */}

                  {/* <Form.Item
  name={["adsets", index, "page_id"]}
  rules={[{ type: "array", required: true, min: 1, message: "Please select at least one page!" }]}
  style={{ flex: 3, marginLeft: "1%" }}
>
  <Form.Item
    shouldUpdate={(prev, cur) => JSON.stringify(prev.adsets) !== JSON.stringify(cur.adsets)}
    noStyle
  >
    {({ getFieldValue }) => {
      const allAdsets = getFieldValue("adsets") || [];

      // currently selected values in THIS adset (strings like "acct - val")
      const currentSelectedRaw = allAdsets[index]?.page_id || [];
      const currentSelected = (currentSelectedRaw || []).map((v) => String(v));

      const extractAccount = (val) => {
        if (!val) return null;
        const s = String(val);
        const parts = s.split(" - ");
        return parts[0]?.trim() || null;
      };

      // accounts used by other adsets (form values)
      const accountsWithSelectionElsewhere = new Set();
      allAdsets.forEach((adset, i) => {
        if (i === index) return;
        (adset?.page_id || []).forEach((v) => {
          const acc = extractAccount(v);
          if (acc) accountsWithSelectionElsewhere.add(acc);
        });
      });

      // include external/default values (pageidList) as already-taken
      (pageidList || []).forEach((v) => {
        const acc = extractAccount(v);
        if (acc) accountsWithSelectionElsewhere.add(acc);
      });

      // build options from page_id_list with disabled flags
      const optionsWithDisabled = (page_id_list || []).map((opt) => {
        const optValue = String(opt.value ?? opt);
        const optAccount = extractAccount(optValue);
        const alreadySelectedHere = currentSelected.includes(optValue);
        const disabled = Boolean(optAccount && accountsWithSelectionElsewhere.has(optAccount) && !alreadySelectedHere);
        return { ...opt, value: optValue, disabled };
      });

      return (
        <Select
          mode="multiple"
          options={optionsWithDisabled}
          placeholder="Select page(s)"
          optionFilterProp="label"
          allowClear
          maxTagCount={1}
          maxTagPlaceholder={(omitted) => `+${omitted.length}`}
          className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
          dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
          style={{ width: "100%", borderRadius: 8 }}
        />
      );
    }}
  </Form.Item>
</Form.Item> */}




                </div>
                <Form.Item
                  name={["adsets", index, "AddName"]}
                  // initialValue={campaignName}
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
                    onChange={(e) => setAddName(e.target.value)}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  />
                </Form.Item>
                <Form.Item
                  label={<span style={{ color: "#B4B4B4" }}>Primary text</span>}
                  name={["adsets", index, "message"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter a message!",
                    },
                  ]}
                  required
                // tooltip="This is a required field"
                >
                  <TextArea
                    placeholder="Primary text"
                    autoSize={{ minRows: 2, maxRows: 10 }}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    className={theme === "dark" ? "custom-input-dark" : "custom-input-light"}


                  />
                </Form.Item>
                {/* <Form.Item
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
                                        onChange={(e) => setCaption(e.target.value)}

                                    />
                                </Form.Item> */}
                <Form.Item
                  label={<span style={{ color: "#B4B4B4" }}>Headline</span>}
                  name={["adsets", index, "headline"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter a Name!",
                    },
                  ]}
                  required
                // tooltip="This is a required field"
                >
                  <TextArea
                    placeholder="Headline"
                    autoSize={{ minRows: 2, maxRows: 10 }}
                    onChange={(e) => setHeadline(e.target.value)}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: "#B4B4B4" }}>Description</span>}
                  name={["adsets", index, "Description"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter a Description!",
                    },
                  ]}
                  required
                  initialValue={"Find More"}
                // tooltip="This is a required field"
                >
                  <TextArea
                    placeholder="Description"
                    autoSize={{ minRows: 2, maxRows: 10 }}
                    onChange={(e) => setDescription(e.target.value)}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  />
                </Form.Item>
                {/* <Form.Item
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingRight: "50px",
                        }}
                      >
                        <span style={{ color: "#B4B4B4" }}>Website_URL</span>
                      </div>
                      <EditOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => onClickEdit(index)}
                      />
                    </div>
                  }
                  labelCol={{ style: { width: "100%" } }} // Makes the label full width
                  wrapperCol={{ style: { width: "100%" } }} // Ensures TextArea takes the same full width
                  name={["adsets", index, "Website_URL"]}
                  rules={[
                    {
                      required: true,
                      message: "Please select Website_URL!",
                    },
                  ]}
                  required
                >
                  <TextArea
                    placeholder="Website_URL"
                    autoSize={{ minRows: 5, maxRows: 15 }}
                    onChange={(e) => setWebsiteURL(e.target.value)}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  />
                </Form.Item>
                <Form.Item
                  label={<span style={{ color: "#B4B4B4" }}>Display link</span>}
                  name={["adsets", index, "Caption"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter a Caption!",
                    },
                  ]}
                  required
                // tooltip="This is a required field"
                >
                  <TextArea
                    placeholder="Display Link"
                    autoSize={{ minRows: 2, maxRows: 10 }}
                    onChange={(e) => setCaption(e.target.value)}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  />
                </Form.Item>
                <Modal
                  title="URL Builder"
                  visible={isModalVisibleForURLBuilder}
                  onCancel={handleCancelForURLBuilder}
                  footer={null}
                  width="80%" // Set width of the modal
                  bodyStyle={{ height: "50vh", overflowY: "auto" }}
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                >
                  {getUrlBuilder}
                </Modal> */}

                <div>
                  {/* Ant Design Breadcrumb for Visibility Control */}
                  {/* <Breadcrumb>
                    {accountis.map((account) => (
                      <Breadcrumb.Item
                        key={account}
                        onClick={() => setSelectedIndex(String(account))}
                        style={{
                          cursor: "pointer",
                          display: "inline-block", 
                          border: selectedIndex === String(account) ? "2px solid #91C25F" : "none",
                          borderRadius: "4px",
                          padding: "0 8px",
                          margin: "0 4px",
                          backgroundColor:
                            selectedIndex === String(account) ? "#f0f0f0" : "transparent",
                          fontWeight: selectedIndex === String(account) ? "bold" : "normal",
                        }}
                      >
                        {account}
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb> */}

                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", marginBottom: "16px" }}>
                    {watchedAccountList.map((account, index) => (
                      <React.Fragment key={account}>
                        <span
                          onClick={() => setSelectedIndex(String(account))}
                          style={{
                            cursor: "pointer",
                            border: selectedIndex === String(account) ? "1px solid #91C25F" : "",
                            borderRadius: selectedIndex === String(account) && "4px",
                            padding: "4px 8px",
                            // backgroundColor: selectedIndex === String(account) ? "#f0f0f0" : "#ffffff",
                            fontWeight: selectedIndex === String(account) ? "bold" : "normal",
                            transition: "all 0.1s ease",
                          }}
                        >
                          {account}
                        </span>

                        {/* Show "/" unless it's the last item */}
                        {index !== watchedAccountList.length - 1 && (
                          <span style={{ color: "#ccc", userSelect: "none" }}>/</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Render ALL AccountForms but only show active one */}
                  {watchedAccountList.map((account, newindex) => (
                    <div
                      key={account}
                      style={{ display: selectedIndex === account ? "block" : "none" }} // 🔑 hide inactive ones
                    >
                      <AccountForm
                        index={index}
                        account={account}
                        allAccounts={accountis}
                        adset={adset}
                        theme={theme}
                        network={network}
                        form={form}
                        onClickEdit={onClickEdit}
                        isModalVisibleForURLBuilder={isModalVisibleForURLBuilder}
                        selectedIndex={selectedIndex}
                        handleCancelForURLBuilder={handleCancelForURLBuilder}
                        getUrlBuilder={getUrlBuilder}
                        defaultUrlData={defaultUrlData}
                        setNewDefaultURLBuilder={setDefaultUrlData}
                      />
                    </div>
                  ))}
                </div>

                {/* <Form.Item
                                label="URL Parameters"
                                name="urlParameters"
                                tooltip="This is a required field"
                            >
                                <TextArea
                                    placeholder="URL Parameters"
                                    autoSize={{ minRows: 5, maxRows: 15 }}
                                />
                            </Form.Item> */}
              </div>

              {/* <div style={{ flex: "30%" }}>
                {selectedFiles[adset.id] && selectedFiles[adset.id].length > 0
                  ? selectedFiles[adset.id].map((file, i) => (
                    <Badge
                      key={i}
                      count={
                        file?.url?.endsWith(".png") ||
                          file?.url?.endsWith(".jpg") ||
                          file?.url?.endsWith(".jpeg") ||
                          file?.url?.endsWith(".mp4") ? null : (
                          <EditOutlined
                            style={{ fontSize: "25px", color: "#fff" }}
                            onClick={() => handleEditClick(file)}
                          />
                        )
                      }
                      style={{
                        backgroundColor: "#52c41a",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        zIndex: 10,
                        cursor: "pointer",
                      }}
                      offset={[5, 5]}
                    >
                      <div className="container-ad-preview">
                        <div
                          className="ad-preview"
                          style={{
                            width: "350px",
                            backgroundColor:
                              theme === "dark" ? "#4f4f4d" : "#fff",
                          }}
                        >
                          <div className="ad-heading">
                            <div className="img">
                              {file?.url?.endsWith(".png") ||
                                file?.url?.endsWith(".jpg") ||
                                file?.url?.endsWith(".jpeg") ? (
                                <img
                                  src={file?.url}
                                  alt="preview"
                                  width="40"
                                  height="40"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : file?.url?.endsWith(".mp4") ? (
                                <video
                                  src={file?.url}
                                  width="40"
                                  height="30"
                                  style={{ objectFit: "cover" }}
                                  muted
                                />
                              ) : file?.type?.startsWith("image/") ? (
                                <img
                                  src={
                                    editedImages[file?.name]
                                      ? editedImages[file?.name]
                                      : file?.originFileObj
                                        ? URL.createObjectURL(
                                          file.originFileObj
                                        )
                                        : file?.url
                                  }
                                  alt="preview"
                                  width="40"
                                  height="40"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <video
                                  src={
                                    file?.originFileObj
                                      ? URL.createObjectURL(
                                        file.originFileObj
                                      )
                                      : file?.url
                                  }
                                  width="40"
                                  height="30"
                                  style={{ objectFit: "cover" }}
                                  muted
                                />
                              )}
                            </div>

                            <div className="title">
                              <div
                                className="main"
                                style={{
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                  color: theme === "dark" ? "white" : "#000",
                                }}
                              >
                                {addName}
                                <div className="sub">
                                  {imagehash?.pageName ? (
                                    <>
                                      {imagehash.pageName}{" "}
                                      <GlobalOutlined
                                        style={{ opacity: "0.6" }}
                                      />
                                    </>
                                  ) : (
                                    <GlobalOutlined
                                      style={{ opacity: "0.6" }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="close">
                              <CloseOutlined style={{ fontSize: "20px" }} />
                            </div>
                            <div className="moreoptions">
                              <MoreOutlined style={{ fontSize: "20px" }} />
                            </div>
                          </div>

                          <div
                            className="ad-desc"
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              color: theme === "dark" ? "white" : "#000",
                            }}
                          >
                            {primaryText}
                          </div>

                          <div
                            className="ad-image"
                            style={{
                              width: "350px",
                              height: "300px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {file?.url?.endsWith(".png") ||
                              file?.url?.endsWith(".jpg") ||
                              file?.url?.endsWith(".jpeg") ? (
                              <img
                                src={file?.url}
                                alt="ad"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : file?.url?.endsWith(".mp4") ? (
                              <video
                                controls
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              >
                                <source src={file?.url} />
                                Your browser does not support the video tag.
                              </video>
                            ) : file?.type?.startsWith("image/") ? (
                              <img
                                src={
                                  editedImages[file?.name]
                                    ? editedImages[file?.name]
                                    : file?.originFileObj
                                      ? URL.createObjectURL(file.originFileObj)
                                      : file?.url
                                }
                                alt="ad"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <video
                                controls
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              >
                                <source
                                  src={
                                    file?.originFileObj
                                      ? URL.createObjectURL(
                                        file.originFileObj
                                      )
                                      : file?.url
                                  }
                                />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>

                          <div className="ad-cta">
                            <div className="details">
                              <div
                                className="link"
                                style={{
                                  color: theme === "dark" ? "white" : "#000",
                                }}
                              >
                                {caption}
                              </div>
                              <div
                                className="title"
                                style={{
                                  color: theme === "dark" ? "white" : "#000",
                                }}
                              >
                                {headline}
                              </div>
                              <div
                                className="desc"
                                style={{
                                  color: theme === "dark" ? "white" : "#000",
                                }}
                              >
                                {description}
                              </div>
                            </div>
                            <div className="ad-button">
                              <button
                                style={{
                                  backgroundColor: "#91C25F",
                                  color: "#000",
                                  borderColor: "#91C25F",
                                  borderWidth: "0px",
                                }}
                              >
                                Learn More
                              </button>
                            </div>
                          </div>

                          <a
                            href={websiteURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              color: "#0066cc",
                              padding: "10px",
                            }}
                          >
                            {websiteURL}
                          </a>

                          <div className="icons">
                            <div
                              className="like"
                              style={{
                                color: theme === "dark" ? "white" : "#000",
                              }}
                            >
                              <LikeOutlined style={{ fontSize: "20px" }} />{" "}
                              Like
                            </div>
                            <div
                              className="comment"
                              style={{
                                color: theme === "dark" ? "white" : "#000",
                              }}
                            >
                              <CommentOutlined style={{ fontSize: "20px" }} />{" "}
                              Comment
                            </div>
                            <div
                              className="share"
                              style={{
                                color: theme === "dark" ? "white" : "#000",
                              }}
                            >
                              <ShareAltOutlined
                                style={{ fontSize: "20px" }}
                              />{" "}
                              Share
                            </div>
                          </div>
                        </div>
                      </div>
                    </Badge>
                  ))
                  : null}
              </div> */}
              <div style={{ flex: "30%" }}>
                {watchedAccountList.map((account) =>
                  selectedIndex === account ? (
                    <AdPreviewPerAccount
                      key={account}
                      account={account}
                      adset={{ ...adset, index }}
                      selectedFiles={selectedFiles}
                      form={form}
                      theme={theme}
                      editedImages={editedImages}
                      imagehash={imagehash}
                    />
                  ) : null
                )}
              </div>
            </div>
          </Panel>
        </Collapse>
        {openCreativesDrawer && (
          <Drawer
            title="Select Creatives"
            width="95%"
            open={openCreativesDrawer}
            onClose={() => setOpenCreativesDrawer(false)}
            style={{
              backgroundColor: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            {/* <CreativesDrawer
                            selectedFilesData={selectedFilesData}
                            
                        /> */}
            <ImageUploadPage
              selectedFilesData={selectedFilesData}
              fromCampaigns={true}
              network={network}
              Account_Number={accountis}
            />
          </Drawer>
        )}
        <Modal
          title="URL Builder"
          visible={isModalVisibleForURLBuilder}
          onCancel={handleCancelForURLBuilder}
          // footer={[
          //     <Button key="cancel" onClick={handleCancel}>
          //         Cancel
          //     </Button>,
          //     <Button key="submit" type="primary" onClick={() => setIsModalVisible(false)}>
          //         Submit
          //     </Button>
          // ]}
          footer={null}
          width="80%" // Set width of the modal
          bodyStyle={{ height: "50vh", overflowY: "auto" }}
          className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
            }`}
        >
          {getUrlBuilder}
        </Modal>
      </Panel>
    </Collapse>
  );
};
const CreateCampaignDrawer = ({
  visible,
  onClose,
  changeRRefrst,
  accountis,
  network,
}) => {
  console.log(network, "network in CreateCampaignDrawer");
  console.log(accountis, "accountis in CreateCampaignDrawer");
  // const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] =
    useState(false);
  // const [imageshow, setimageshow] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [form] = Form.useForm();
  const formRef = useRef(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);

  const [accountNumber, setAccountNumber] = useState(accountis);
  const [pixel_id_list, setPixel_id_list] = useState([]);
  const [page_id_list, setPage_id_list] = useState([]);
  const [pageidList, setPageIdList] = useState([]);
  const [pixelIdList, setPixelIdList] = useState([]);
  const [imagehash, setimagehash] = useState("");
  const [imageHashArray, setImageHashArray] = useState([]);
  const [newImageHashArray, setNewImageHashArray] = useState([]);
  const { data: session } = useSession();
  var token = localStorage.getItem("token");
  const [showBidAmount, setShowBidAmount] = useState(false);
  const [selectedPublishers, setSelectedPublishers] = useState({});
  const [selectedPositions, setSelectedPositions] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [addName, setAddName] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [caption, setCaption] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); // File to be edited
  const [isImgEditorShown, setIsImgEditorShown] = useState(false);
  const [editedImages, setEditedImages] = useState({});
  const [isManual, setIsManual] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignLevelDailyBudget, setCampaignLevelDailyBudget] = useState(0);
  const [adsetLevelDailyBudget, setAdsetLevelDailyBudget] = useState(0);
  const [activeKey, setActiveKey] = useState(["1"]); // State to control active panels
  const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState({});
  const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState({});
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [adsets, setAdsets] = useState([]);
  const [creativeIndex, setCreativeIndex] = useState(0);
  const selectedRef = useRef(null);
  const newSelectedRef = useRef(null);
  const { theme } = useTokenContext();
  const [activeMediaIndex, setActiveMediaIndex] = useState({});
  const [adMediaData, setAdMediaData] = useState({});
  const [urlBuilderIndex, setUrlBuilderIndex] = useState(null);
  const [isCampaignBudgetActive, setIsCampaignBudgetActive] = useState(false);
  const [isAnyAdsetBudgetSet, setIsAnyAdsetBudgetSet] = useState(false);
  const [isCreateCampaignorDraft, setIsCreateCampaignorDraft] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [draftsData, setDraftsData] = useState([]);
  const [popupInputs, setPopupInputs] = useState({ input1: "", input2: "", reportCat: "" });
  const [errors, setErrors] = useState({ input1: "", input2: "", reportCat: "" });
  const [refreshDraft, setRefreshDraft] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // category object
  const [editedName, setEditedName] = useState("");
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [reportCategories, setReportCategories] = useState([]);
  const [newReportCategory, setNewReportCategory] = useState("");
  const [rEditModalVisible, setREditModalVisible] = useState(false);
  const [rDeleteModalVisible, setRDeleteModalVisible] = useState(false);
  const [rCurrentCategory, setRCurrentCategory] = useState(null);
  const [rEditedName, setREditedName] = useState("");
  // const []
  const [selectedAccount, setSelectedAccount] = useState("ALL");
  const [selectedObjective, setSelectedObjective] = useState("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [defaultUrlData, setDefaultUrlData] = useState("");
  const groupId = uuidv4();
  const [isEditAccountsModalOpen, setIsEditAccountsModalOpen] = useState(false);
  const [matchedAccounts, setMatchedAccounts] = useState([]);
  const [shareTemplate, setShareTemplate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState([]);
  const { userdetails } = useTokenContext();
  const [accountChanged, setAccountChanged] = useState(false);
  const [valueOptions, setValueOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const { adAccounts } = userdetails || {};
  const [selectedDraftForShare, setSelectedDraftForShare] = useState(null);
  const [geo, setGeos] = useState("Geo");
  const [pixel, setPixels] = useState("Pixel");
  const [page, setPages] = useState("Page");
  const userPickedRef = useRef(false);
  // const [budgetType, ]

  // const adsets = Form.useWatch("adsets", form) || [];

  //   // Extract all adset DailyAdd_amount values
  //   const isAnyAdsetBudgetSet = adsets.some(
  //     (item) => Number(item?.DailyAdd_amount) > 0
  //   );

  //   // Watch the campaign-level Daily_amount
  //   const campaignDailyBudget = Form.useWatch("Daily_amount", form);

  const [selectedKey, setSelectedKey] = useState(null);

  const [budgetType, setBudgetType] = useState("daily");

  const watchedAdsets = Form.useWatch("adsets", form) || [];

  // Derived condition name changed to watchedHasAdsetBudget
  const watchedHasAdsetBudget = Array.isArray(watchedAdsets)
    ? watchedAdsets.some(ad => Number(ad?.DailyAdd_amount) > 0)
    : false;

  // Watch campaign-level Daily_amount too (different name)
  const watchedCampaignBudget = Form.useWatch("Daily_amount", form);

  const objectiveValue = Form.useWatch("Objectives", form);

  const accountsForAccess = adAccounts[selectedKey];
  const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

  const account = useMemo(() => {
    if (Array.isArray(accountis)) {
      return accountis.map((a) => String(a).trim());
    }
    return [String(accountis ?? '').trim()];
  }, [accountis]);
  const { confirm } = Modal

  console.log(imageHashArray);
  console.log(defaultUrlData, "defaultUrlData in CreateCampaignDrawer");

  console.log(draftsData, "draftsData in CreateCampaignDrawer");
  console.log(page_id_list, "page_id_list in CreateCampaignDrawer");
  console.log(pixel_id_list, "pixel_id_list in CreateCampaignDrawer");
  const handleDropdownVisibleChange = (open) => {
    setIsOpen(open);

  };
  const onChangeSelect = (value) => {

  }
  const handleChange1 = (values) => {
    const uniq = Array.from(new Set(values.map(String)));
    setSelectedValue(uniq);
    userPickedRef.current = true;
    const last = values[values.length - 1];
    if (last) {
      const findAccount = (data, accountNumber) =>
        Object.values(data).flat().find((item) => item.accountNumber === accountNumber) || null;

      const accountNameForAccount = findAccount(userdetails?.adAccounts, last);

    }

    onChangeSelect(values);
    setAccountChanged(true);
  };
  const filteredAccounts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return accountsAccess;
    return accountsAccess.filter((a) =>
      `${a.accountNumber} ${a.accountName || ""}`.toLowerCase().includes(q)
    );
  }, [accountsAccess, searchText]);
  useEffect(() => {
    if (userdetails?.adAccounts) {
      const adAccountOptions = Object.keys(userdetails?.adAccounts).map(
        (key) => ({
          value: key,
          label: key,
        })
      );
      setOptions(adAccountOptions);
    }
  }, []);
  const renderAccountsCheckboxes = (theme) => (
    <Checkbox.Group
      options={filteredAccounts.map((account) => ({
        value: String(account.accountNumber),
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 10px',
              borderBottom: '1px solid #ddd'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
              {/* show accountName only when dropdown open (same as your old pattern) */}
              {isOpen && (
                <span style={{ fontSize: 12, color: 'gray' }}>
                  {account.accountName || ''}
                </span>
              )}
            </div>
            <span style={{ textAlign: 'right', marginLeft: 10 }}>
              {account.status === "Active" ? (
                <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
              ) : (
                <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
              )}
            </span>
          </div>
        ),
      }))}
      value={selectedValue}      // array of selected accountNumbers
      onChange={handleChange1}   // updates your selectedValue + notifies parent
      className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
    />
  );

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setSelectedValue([]);
  };

  useEffect(() => {
    if (selectedKey && userdetails?.adAccounts) {
      // Mapping over the accounts based on the selected key
      const accountNumbers = userdetails.adAccounts[selectedKey]?.map(
        (account) => ({
          value: account.accountNumber, // Set value as accountNumber
          label: account.accountNumber, // Set label as accountNumber
          accountName: account.accountName, // Include accountName for conditional rendering
          status: account.status,
        })
      );
      setValueOptions(accountNumbers); // Update valueOptions with account numbers
    } else {
      setValueOptions([]);
    }
  }, [selectedKey, userdetails]);

  useEffect(() => {
    // Run only when objectiveValue changes
    if (objectiveValue) {
      const adsets = form.getFieldValue("adsets") || [];

      const updatedAdsets = adsets.map((adset) => ({
        ...adset,
        optimization_goal: "OFFSITE_CONVERSIONS",
        custom_event_type:
          objectiveValue === "OUTCOME_LEADS" ? "LEAD" : "PURCHASE",
        action_source: "website"
      }));

      form.setFieldsValue({
        adsets: updatedAdsets,
      });
    }
  }, [objectiveValue, form]);

  const handleShareDraft = async () => {

    if (!selectedDraftForShare) {
      message.error("No draft selected to share.");
      return;
    }


    if (!selectedValue || selectedValue.length === 0) {
      message.warning("Please select at least one account.");
      return;
    }


    const cleanedDraft = {
      groupId: selectedDraftForShare.groupId,
      Draft_Name: selectedDraftForShare.Draft_Name,
      // Category: selectedDraftForShare.Category,
      camapaignlevel: selectedDraftForShare.camapaignlevel,
      adsetlevel_1: selectedDraftForShare.adsetlevel_1,
      createdby: session?.user?.name,
    };

    const payload = {
      draftData: cleanedDraft,
      targetAccounts: selectedValue,
      email: session?.user?.email,
      userName: session?.user?.name,
    };

    setLoading(true);

    try {
      const res = await fetch(
        "https://www.testapi.adsgoat.in/api/shareDraftToAccountsObject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.ok) {
        message.success(
          `Draft shared to: ${data.accountsShared.join(", ")}`
        );

        const skipped = selectedValue.filter(
          (acc) => !data.accountsShared.includes(acc)
        );
        if (skipped.length > 0) {
          message.info(
            `Skipped accounts (already have this draft): ${skipped.join(
              ", "
            )}`
          );
        }
        setShareTemplate(false);
        setSelectedValue([]);
        setSelectedDraftForShare(null);
      } else {
        message.error(data.message || "Failed to share draft.");
      }
    } catch (err) {
      console.error("Error sharing draft:", err);
      message.error("Something went wrong while sharing the draft.");
    } finally {
      setLoading(false);
    }
  };


  const categoryOptions = useMemo(() => {
    if (!Array.isArray(draftsData)) return [];

    const unique = [...new Set(draftsData.map(d => d.Category).filter(Boolean))];

    return [
      { value: "ALL", label: "All" },
      ...unique.map(c => ({ value: c, label: c })),
    ];
  }, [draftsData]);

  // const filteredDrafts = useMemo(() => {
  //   if (!Array.isArray(draftsData)) return [];

  //   return draftsData.filter((draft) => {
  //     const matchesSearch = searchText
  //       ? draft.Draft_Name?.toLowerCase().includes(searchText.toLowerCase()) ||
  //       draft.Category?.toLowerCase().includes(searchText.toLowerCase())
  //       : true;

  //     const matchesCategory =
  //       selectedCategory && selectedCategory !== "ALL"
  //         ? draft.Category === selectedCategory
  //         : true;

  //     return matchesSearch && matchesCategory;
  //   });
  // }, [draftsData, searchText, selectedCategory]);


  const filteredDrafts = useMemo(() => {
    if (!Array.isArray(draftsData)) return [];

    return draftsData.filter((draft) => {
      const formattedBudget = draft?.camapaignlevel?.Daily_amount != null
        ? `$${draft.camapaignlevel.Daily_amount}/day`
        : "";

      const matchesSearch = searchText
        ? draft.Draft_Name?.toLowerCase().includes(searchText.toLowerCase()) ||
        draft.Category?.toLowerCase().includes(searchText.toLowerCase()) ||
        draft?.camapaignlevel?.Daily_amount?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        formattedBudget.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchesCategory =
        selectedCategory && selectedCategory !== "ALL"
          ? draft.Category === selectedCategory
          : true;

      const matchesObjective =
        selectedObjective && selectedObjective !== "ALL"
          ? draft?.camapaignlevel?.Objectives === selectedObjective
          : true;
      const matchesAccount =
        selectedAccount && selectedAccount !== "ALL"
          ? draft.Account_Number === selectedAccount
          : true;

      return matchesSearch && matchesCategory && matchesObjective && matchesAccount;

    });
  }, [draftsData, searchText, selectedCategory, selectedObjective, selectedAccount]);
  const groupedDrafts = useMemo(() => {
    if (!Array.isArray(filteredDrafts)) return [];

    const groupMap = {};

    filteredDrafts.forEach((draft) => {
      const groupId = draft.groupId || draft.draftId;
      if (!groupMap[groupId]) {
        groupMap[groupId] = {
          ...draft,
          accounts: [draft.Account_Number],
        };
      } else {
        groupMap[groupId].accounts.push(draft.Account_Number);
      }
    });

    return Object.values(groupMap);
  }, [filteredDrafts]);

  useEffect(() => {
    if (!account || account.length === 0) return;

    const accountArray = Array.isArray(account) ? account : [account];

    (async () => {
      const resp = await fetch(`https://www.testapi.adsgoat.in/api/getcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ accounts: accountArray }),
      });

      const json = await resp.json();
      if (json.ok) {
        setCategories(json.categories);
      }
    })();
  }, [account, token]);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name || !account) return;

    const accounts = Array.isArray(account) ? account : [account];

    const resp = await fetch("https://www.testapi.adsgoat.in/api/newcategories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ accounts, name }),
    });

    const json = await resp.json();
    if (resp.ok && json.ok) {
      setCategories(prev => [...prev, ...json.added]);
      setPopupInputs(s => ({ ...s, input1: json.added[0]?.name || "" }));
      setNewCategory("");
      setErrors(e => ({ ...e, input1: "" }));
      message.success(`Category added to ${json.added.length} account(s)`);
    } else {
      message.error(json.message || "Add failed");
    }
  };
  const deleteCategory = async (accountNumber, catId) => {
    if (!catId || !accountNumber) return;

    const deleted = categories.find(c => c.categoryId === catId);

    const resp = await fetch(
      `https://www.testapi.adsgoat.in/api/categories/${accountNumber}/${catId}`,
      {
        method: "DELETE",
        headers: { Authorization: token },
      }
    );

    const json = await resp.json().catch(() => ({}));

    if (resp.ok && json.ok) {
      setCategories(prev =>
        prev.filter(c => !(c.categoryId === catId && c.accountNumber === accountNumber))
      );
      if (deleted?.name) {
        setPopupInputs(s => ({
          ...s,
          input1: s.input1 === deleted.name ? "" : s.input1
        }));
      }
      message.success("Category deleted");
    } else {
      message.error(json.message || "Delete failed");
    }
  };

  const renameCategory = async (accountNumber, catId, newName) => {
    const clean = newName?.trim();
    if (!catId || !clean || !accountNumber) return;

    // const oldName = categories.find(c => c.categoryId === catId)?.name;
    const oldName = categories.find(
      c => String(c.categoryId) === String(catId) && String(c.accountNumber) === String(accountNumber)
    )?.name;

    const resp = await fetch(
      `https://www.testapi.adsgoat.in/api/categories/${accountNumber}/${catId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ name: clean }),
      }
    );

    const json = await resp.json().catch(() => ({}));
    if (resp.ok && json.ok) {
      setCategories(prev =>
        prev.map(c =>
          c.categoryId === catId ? { ...c, name: clean } : c
        )
      );
      setPopupInputs(s => ({
        ...s,
        input1: s.input1 === oldName ? clean : s.input1,
      }));
      message.success("Category renamed");
    } else {
      message.error(json.message || "Rename failed");
    }
  };

  useEffect(() => {
    if (!account || account.length === 0) return;

    const accountArray = Array.isArray(account) ? account : [account];

    (async () => {
      const resp = await fetch(`https://www.testapi.adsgoat.in/api/getreportcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ accounts: accountArray }),
      });

      const json = await resp.json().catch(() => ({}));
      if (json.ok) {
        setReportCategories(json.categories);
      }
    })();
  }, [account, token]);


  const addReportCategory = async () => {
    const name = newReportCategory.trim();
    if (!name || !account) return;

    const accounts = Array.isArray(account) ? account : [account];

    const resp = await fetch("https://www.testapi.adsgoat.in/api/newreportcategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ accounts, name }),
    });

    const json = await resp.json();
    if (resp.ok && json.ok) {
      setReportCategories(prev => [...prev, ...json.added]);
      setPopupInputs(s => ({ ...s, reportCat: json.added[0]?.name || "" }));
      setNewReportCategory("");
      setErrors(e => ({ ...e, reportCat: "" }));

      message.success(`Report category added to ${json.added.length} account(s)`);
    } else {
      message.error(json.message || "Add failed");
    }
  };

  const renameReportCategory = async (accountNumber, catId, newName) => {
    const clean = newName?.trim();
    if (!catId || !clean || !accountNumber) return;

    const old = reportCategories.find(
      c => String(c.categoryId) === String(catId) && String(c.accountNumber) === String(accountNumber)
    )?.name;

    if (old && old.trim().toLowerCase() === clean.toLowerCase()) {
      message.info("No changes to save");
      return;
    }

    const resp = await fetch(
      `https://www.testapi.adsgoat.in/api/reportcategory/${accountNumber}/${catId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ name: clean }),
      }
    );

    const json = await resp.json().catch(() => ({}));
    if (resp.ok && json.ok) {
      setReportCategories(prev =>
        prev.map(c =>
          String(c.categoryId) === String(catId) &&
            String(c.accountNumber) === String(accountNumber)
            ? { ...c, name: clean }
            : c
        )
      );
      setPopupInputs(s => ({ ...s, reportCat: s.reportCat === old ? clean : s.reportCat }));
      message.success("Report category renamed");
    } else {
      message.error(json.message || "Rename failed");
    }
  };


  const deleteReportCategory = async (accountNumber, catId) => {
    if (!catId || !accountNumber) return;

    const resp = await fetch(
      `https://www.testapi.adsgoat.in/api/reportcategory/${accountNumber}/${catId}`,
      { method: "DELETE", headers: { Authorization: token } }
    );
    const json = await resp.json().catch(() => ({}));

    if (resp.ok && json.ok) {
      setReportCategories(prev =>
        prev.filter(c =>
          !(String(c.categoryId) === String(catId) &&
            String(c.accountNumber) === String(accountNumber))
        )
      );
      message.success("Report category deleted");
    } else {
      message.error(json.message || "Delete failed");
    }
  };






  // const handleConfirm = async() => {
  //   const newErrors = {
  //     input1: popupInputs.input1.trim() ? '' : 'First input is required',
  //     input2: popupInputs.input2.trim() ? '' : 'Second input is required',
  //   };

  //   setErrors(newErrors);

  //   const hasErrors = Object.values(newErrors).some((msg) => msg !== '');
  //   if (hasErrors) {
  //     return Promise.reject(); // prevent closing
  //   }

  //   setConfirmLoading(true);
  //   const allValues = form.getFieldsValue(true);
  // //   console.log(allValues);

  //   const draftData = await MultipleAdsetsDraftFetching(allValues);
  //   console.log(draftData, "draftData in handleConfirm");
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       setConfirmLoading(false);
  //       setOpen(false);
  //       setPopupInputs({ input1: '', input2: '' });
  //       setErrors({ input1: '', input2: '' });
  //       resolve();
  //     }, 1000);
  //   });
  // };

  // const handleConfirm = async () => {
  //   const newErrors = {
  //     input1: popupInputs.input1.trim() ? "" : "First input is required",
  //     input2: popupInputs.input2.trim() ? "" : "Second input is required",
  //   };

  //   setErrors(newErrors);

  //   const hasErrors = Object.values(newErrors).some((msg) => msg !== "");
  //   if (hasErrors) {
  //     return Promise.reject(); // keep Popconfirm open
  //   }

  //   setConfirmLoading(true);

  //   try {
  //     const allValues = form.getFieldsValue(true);

  //     const draftData = await MultipleAdsetsDraftFetching(allValues);
  //     const totalDraftData = {
  //       id: uuidv4(),
  //       Title: popupInputs.input1,
  //       Draft_Name: popupInputs.input2,
  //       ...draftData,
  //     };
  //     //   console.log(totalDraftData, "totalDraftData in handleConfirm");

  //     const response = await fetch(
  //       "https://www.testapi.adsgoat.in/api/submitDraftData",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: token,
  //         },
  //         body: JSON.stringify({
  //           draftData: totalDraftData,
  //           email: session?.user?.email,
  //           userName: session?.user?.name,
  //         }),
  //       }
  //     );
  //     if (response.status === 200 || response.status === 201) {
  //       setRefreshDraft((prev) => !prev);
  //     }
  //     console.log("Draft data submitted successfully:", response);

  //     // Close only after successful fetch and processing
  //     return new Promise((resolve) => {
  //       setTimeout(() => {
  //         setConfirmLoading(false);
  //         setOpen(false); // 👈 Close here after everything is done
  //         setPopupInputs({ input1: "", input2: "" });
  //         setErrors({ input1: "", input2: "" });
  //         resolve(); // must resolve to properly finish Popconfirm
  //       }, 500);
  //     });
  //   } catch (err) {
  //     console.error("❌ Error during MultipleAdsetsDraftFetching:", err);
  //     setConfirmLoading(false);
  //     return Promise.reject(); // keep Popconfirm open
  //   }
  // };

  const handleConfirm = async () => {
    const newErrors = {
      // input1: popupInputs.input1.trim() ? "" : " Template category is required",
      input2: popupInputs.input2.trim() ? "" : "Template name is required",
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((msg) => msg !== "");
    if (hasErrors) {
      // message?.error?.("Please fill the required fields");
      return Promise.reject();
    }

    setConfirmLoading(true);

    try {
      const allValues = form.getFieldsValue(true);

      const isDuplicate = (draftsData || []).some(
        (d) => d.Draft_Name.toLowerCase() === popupInputs.input2.trim().toLowerCase()
      );

      if (isDuplicate) {
        newErrors.input2 = "Template name already exists";
        setConfirmLoading(false);
        return Promise.reject();
      }

      const draftData = await MultipleAdsetsDraftFetching(allValues);

      for (const data of draftData) {
        const totalDraftData = {
          // id: uuidv4(),
          // Category: popupInputs.input1,
          Draft_Name: popupInputs.input2,
          ...data,
        };
        // check duplicate template name


        await fetch("https://www.testapi.adsgoat.in/api/NewsubmitDraftDataNew", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token, // if your middleware expects Bearer
          },
          body: JSON.stringify({
            accountNumber: data?.Account_Number,
            draftData: { ...totalDraftData, groupId },
            email: session?.user?.email,
            userName: session?.user?.name,
          }),
        });
      }
      message.success("Template saved successfully");
      // ✅ ensure non-2xx throws with a message
      // if (!resp.ok) {
      //   const errJson = await resp.json().catch(() => ({}));
      //   throw new Error(errJson.message || `Request failed: ${resp.status}`);
      // }
      await fetchDraftDetails();
      setRefreshDraft((prev) => !prev);

      // Resolve cleanly so Popconfirm closes without warnings
      await new Promise((r) => setTimeout(r, 500));
      setConfirmLoading(false);
      setOpen(false);
      setPopupInputs(prev => ({ input1: "", input2: "", reportCat: prev.reportCat }));
      setErrors({ input1: "", input2: "" });
      return;
    } catch (err) {
      console.error("❌ Draft save error:", err);
      setConfirmLoading(false);
      throw err instanceof Error ? err : new Error(String(err || "Unknown error"));
    }
  };


  // const handleCancelPop = () => {
  //   setOpen(false);
  //   setPopupInputs({ input1: "", input2: "" });
  //   setErrors({ input1: "", input2: "" });
  // };

  // Track if any adset has a budget set
  // useEffect(() => {
  //     const anyAdsetFilled = adsets.some(adset => adset.DailyAdd_amount > 0);
  //     setIsAnyAdsetBudgetSet(anyAdsetFilled);
  // }, [adsets]);

  // useEffect(() => {
  //   const adsets = form.getFieldValue("adsets") || [];
  //   const anyAdsetFilled = adsets?.some((adset) => adset?.DailyAdd_amount > 0);
  //   setIsAnyAdsetBudgetSet(anyAdsetFilled);
  // }, [form]);

  // Function to update adset value
  const handleAdsetChange = (index, value) => {
    const newAdsets = [...adsets];
    newAdsets[index].DailyAdd_amount = value;
    setAdsets(newAdsets);
    if (value > 0) {
      setIsAnyAdsetBudgetSet(true);
    } else {
      const adsets = form.getFieldValue("adsets") || [];
      const anyAdsetFilled = adsets.some((adset) => adset?.DailyAdd_amount > 0);
      setIsAnyAdsetBudgetSet(anyAdsetFilled);
    }
  };

  // const campaignLevelDailyBudget = Form.useWatch('Daily_amount', form);
  // const adsetValues = Form.useWatch('adsets', form) || [];

  // const isCampaignBudgetActive = parseFloat(campaignLevelDailyBudget) > 0;
  // const isAnyAdsetBudgetSet = (adsetValues && Array.isArray(adsetValues))
  // ? adsetValues.some(adset => parseFloat(adset?.DailyAdd_amount) > 0)
  // : false;

  const handleModeChange = (value) => {
    setIsManual(value === "manual");
  };
  useEffect(() => {
    if (visible) {
      form.resetFields(); // Reset form fields to their initialValues
      setWebsiteURL(""); // Clear website URL
      setSelectedFiles({}); // Clear selected files
      setCampaignName(""); // Clear campaign name
      setPrimaryText(""); // Clear primary text field
      setCaption(""); // Clear caption field
      setHeadline(""); // Clear headline field
      setDescription(""); // Clear description field
      setSelectedPublishers({}); // Clear selected publishers
      setSelectedPositions({}); // Clear selected positions
      setIsFormComplete(false); // Reset form completion state
      setCampaignName("");
      setAddName("");
      setAdsetLevelDailyBudget(0);
      const newAdsets = [
        { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "ADSET 1" },
      ]
      form.setFieldsValue({ adsets: newAdsets })
      setAdsets(newAdsets);
      // setCampaignLevelDailyBudget(0);
      setSelectedOption("upload");
      setIsManual(false);
      setGeos("Geo");
      setPages("Page");
      setPixels("Pixel");
    }
  }, [visible]);

  const handleFieldChange = (index, field, value) => {
    const updatedAdsets = [...adsets];
    updatedAdsets[index] = {
      ...updatedAdsets[index],
      [field]: value, // Update only the specific field
    };
    form.setFieldsValue({ adsets: updatedAdsets });
  };

  const updateAdMediaData = (index, files) => {
    const adset = form.getFieldValue(["adsets", index]) || {};
    console.log(adset, "adset in updateAdMediaData");
    console.log(files, "files in updateAdMediaData");
    console.log(index, "index in updateAdMediaData");
    console.log(
      form.getFieldValue("adsets"),
      "form.getFieldValue('adsets') in updateAdMediaData"
    );
    const formatted = files.map((file) => ({
      AddName: adset.AddName || "",
      Caption: adset.Caption || "",
      Description: adset.Description || "",
      message: adset.message || "",
      filename: file.name || "",
      headline: adset.headline || "",
      Website_URL: adset.Website_URL || "",
    }));

    setAdMediaData((prev) => ({
      ...prev,
      [index]: formatted,
    }));
  };

  // Helper function to get the next Adset name
  // const getNextAdsetName = (adsets) => {
  //     const adsetNames = adsets.map(adset => adset.AdsetPanelName);
  //     let highestNumber = 0;

  //     // Loop to find the highest number in adset names
  //     adsetNames.forEach((name) => {
  //         const match = name.match(/^Adset (\d+)/);
  //         if (match && match[1]) {
  //             const num = parseInt(match[1]);
  //             if (num > highestNumber) {
  //                 highestNumber = num;
  //             }
  //         }
  //     });

  //     return `Adset ${highestNumber + 1}`;
  // };

  // Helper function to get default adset data
  // Helper function to get the next Adset name
  // Helper function to get the next Adset name
  const getNextAdsetName = (adsets) => {
    const adsetNames = adsets.map((adset) => adset.AdsetPanelName);
    let highestNumber = 0;

    // Loop to find the highest number in adset names
    adsetNames.forEach((name) => {
      if (typeof name === "string") {
        const match = name.match(/^ADSET (\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1]);
          if (num > highestNumber) {
            highestNumber = num;
          }
        }
      }
    });

    return `ADSET ${highestNumber + 1}`;
  };

  // Helper function to get default adset data
  const getDefaultAdset = (
    campaignName,
    caption,
    websiteURL,
    imagehash,
    currentDate
  ) => {
    return {
      id: uuidv4(), // Generate a new unique ID for the adset
      AdsetPanelName: getNextAdsetName(adsets),
      AdsetName: campaignName,
      optimization_goal: "OFFSITE_CONVERSIONS",
      billing_event: "IMPRESSIONS",
      action_source: "website",
      custom_event_type: "LEAD",
      countries: "US",
      Min_Age: "18",
      Max_Age: "65",
      Gender: "0",
      Language: [6],
      placements: "Advance",
      DailyAdd_amount: 0,
      AddName: campaignName,
      Description: "Find More",
      Caption: caption,
      Website_URL: websiteURL,
      pixel_id: imagehash?.pixelID,
      start_date: currentDate,
      MediaContent: [], // Default MediaContent as empty array
    };
  };

  // For adding a new adset
  // For adding a new adset
  // For adding a new adset
  // For adding a new adset
  const addAdset = () => {
    const newAdsetName = getNextAdsetName(adsets); // Get the next highest number
    const allAdsets = form.getFieldValue("adsets") || [];
    const first = allAdsets[0] || {};
    const newAdset = {
      id: uuidv4(),
      AdsetPanelName: newAdsetName,
      AdsetName: "", // Add default values for the new adset
      optimization_goal: first.optimization_goal || "",
      billing_event: first.billing_event || "",
      action_source: first.action_source || "",
      custom_event_type: first.custom_event_type || "",
      countries: "US",
      Min_Age: "18",
      Max_Age: "65",
      Gender: "0",
      Language: [6],
      placements: "Advance",
      DailyAdd_amount: 0,
      AddName: "",
      Description: "Find More",
      Caption: "",
      Website_URL: "",
      pixel_id: "", // Or set it based on your requirement
      start_date: new Date(),
      MediaContent: [], // Default MediaContent as empty array
    };
    // setAdsets((prevAdsets) => [...prevAdsets, newAdset]);
    setAdsets((prevAdsets) => {
      const updatedAdsets = [...prevAdsets, newAdset];

      // Update the Ant Form: set the whole adsets array so form state stays in sync
      const currentFormAdsets = form.getFieldValue("adsets") || [];
      const updatedFormAdsets = [...currentFormAdsets, newAdset];
      form.setFieldsValue({ adsets: updatedFormAdsets });

      // Activate the last panel (new one)
      setActiveKey([`${updatedAdsets.length - 1}`]);

      return updatedAdsets;
    });

    // Add the new adset to the state
    // setAdsets(prevAdsets => {
    //     const updatedAdsets = [...prevAdsets, newAdset];

    //     // Update the form with only the new adset at the last index
    //     form.setFieldsValue({
    //         // Only update the last adset (the newly added one)
    //         [`adsets[${updatedAdsets.length - 1}]`]: {
    //             ...newAdset,
    //             [`adsets[${updatedAdsets.length - 1}].AdsetPanelName`]: newAdset.AdsetPanelName,
    //             [`adsets[${updatedAdsets.length - 1}].AdsetName`]: newAdset.AdsetName,
    //             [`adsets[${updatedAdsets.length - 1}].MediaContent`]: newAdset.MediaContent,
    //             // Add other fields as needed
    //         }
    //     });

    //     return updatedAdsets;
    // });

    // setActiveKey([`${adsets.length}`]); // Open the newly added adset by default
  };

  // const cloneAdset = (adsetId) => {
  //     const adsetIndex = adsets.findIndex(ad => ad.id === adsetId);
  //     if (adsetIndex === -1) return;

  //     const originalAdset = adsets[adsetIndex];
  //     const newId = uuidv4();

  //     const baseName = originalAdset.AdsetPanelName;
  //     const copyCount = adsets.filter(ad => ad.AdsetPanelName.startsWith(baseName)).length;
  //     const newPanelName = copyCount > 0 ? `${baseName}(${copyCount})_Copy` : `${baseName}_Copy`;

  //     const clonedAdset = {
  //       ...originalAdset,
  //       id: newId,
  //       AdsetPanelName: newPanelName,
  //     };

  //     const currentFormAdsets = form.getFieldValue('adsets') || [];

  //     // ✅ Match by UUID not index!
  //     const formIndex = currentFormAdsets.findIndex((_, i) => adsets[i]?.id === adsetId);
  //     const clonedFormData = { ...currentFormAdsets[formIndex] };

  //     const updatedFormAdsets = [...currentFormAdsets, clonedFormData];
  //     const updatedAdsets = [...adsets, clonedAdset];

  //     // ✅ Set both states
  //     setAdsets(updatedAdsets);
  //     form.setFieldsValue({ adsets: updatedFormAdsets });

  //     // ✅ Clone media/file states by UUID
  //     const cloneFiles = (prev, setter) => {
  //       setter(old => ({ ...old, [newId]: [...(old[adsetId] || [])] }));
  //     };

  //     cloneFiles(selectedFiles, setSelectedFiles);
  //     cloneFiles(selectedFilesFromMedia, setSelectedFilesFromMedia);
  //     cloneFiles(selectedFilesFromCreatives, setSelectedFilesFromCreatives);
  //     setSelectedPositions(prev => ({
  //         ...prev,
  //         [newId]: [...(prev[adsetId] || [])], // safely clone if exists
  //     }));

  //     // ✅ Open the last panel (the newly cloned one)
  //     setActiveKey([`${updatedAdsets.length - 1}`]);
  //   };

  // For cloning an existing adset
  // const cloneAdset = (index) => {
  //     const clonedAdset = { ...adsets[index], id: uuidv4() }; // Create a new clone with a new UUID

  //     // Ensure MediaContent is an array (default to empty array if it's undefined)
  //     // clonedAdset.MediaContent = Array.isArray(adsets[index].MediaContent)
  //     //     ? [...adsets[index].MediaContent]
  //     //     : [];  // If MediaContent is not an array, default to empty array

  //     // Handle the naming for the cloned adset
  //     const originalName = adsets[index].AdsetPanelName;
  //     const copyCount = adsets.filter(adset => adset.AdsetPanelName.startsWith(originalName)).length;

  //     const cloneName = copyCount > 0 ? `${originalName}(${copyCount})_Copy` : `${originalName}_Copy`;
  //     clonedAdset.AdsetPanelName = cloneName;

  //     // Add the cloned adset at the end of the list
  //     setAdsets(prevAdsets => {
  //         const updatedAdsets = [...prevAdsets, clonedAdset];

  //         // Update the form with only the cloned adset at the last index
  //         // form.setFieldsValue({
  //         //     // Only update the last adset (the newly cloned one)
  //         //     [`adsets[${updatedAdsets.length - 1}]`]: {
  //         //         ...clonedAdset,
  //         //         [`adsets[${updatedAdsets.length - 1}].AdsetPanelName`]: clonedAdset.AdsetPanelName,
  //         //         [`adsets[${updatedAdsets.length - 1}].AdsetName`]: clonedAdset.AdsetName,
  //         //         [`adsets[${updatedAdsets.length - 1}].MediaContent`]: clonedAdset.MediaContent,
  //         //         // Add other fields as needed
  //         //     }
  //         // });

  //         return updatedAdsets;
  //     });

  //     setActiveKey([`${adsets.length}`]); // Open the newly cloned adset by default
  // };

  // const cloneAdset = (index) => {
  //   // Clone logic here
  //   const clonedAdset = {
  //     ...adsets[index],
  //     id: uuidv4(),
  //     AdsetPanelName: `${adsets[index].AdsetPanelName}_Copy`, // Modify the name to make it unique
  //   };

  //   setAdsets((prevAdsets) => [...prevAdsets, clonedAdset]);
  // };

  // For removing an adset based on its id
  // const removeAdset = (id) => {
  //     // Safely remove the adset by id
  //     setAdsets(prevAdsets => {
  //         const newAdsets = prevAdsets.filter(adset => adset.id !== id); // Filter by id
  //         form.setFieldsValue({
  //             adsets: newAdsets // Update the form with remaining adsets
  //         });
  //         return newAdsets;
  //     });

  //     // Update the activeKey to reflect the removal
  //     setActiveKey(prevActiveKey => {
  //         // If the deleted adset was the active one, reset the active key
  //         if (prevActiveKey[0] === id) {
  //             return newAdsets.length > 0 ? ['0'] : [];
  //         }
  //         return prevActiveKey; // Keep the previous active key if it's valid
  //     });
  // };
  // const removeAdset = (id) => {
  //     setAdsets(prevAdsets => {
  //       const indexToRemove = prevAdsets.findIndex(adset => adset.id === id);
  //       if (indexToRemove === -1) return prevAdsets; // nothing to remove

  //       const newAdsets = [...prevAdsets];
  //       newAdsets.splice(indexToRemove, 1); // remove from state

  //       // Remove only the specific adset from the form
  //       const currentFormValues = form.getFieldValue("adsets") || [];
  //       const newFormAdsets = [...currentFormValues];
  //       newFormAdsets.splice(indexToRemove, 1); // remove corresponding form data
  //       form.setFieldsValue({ adsets: newFormAdsets });

  //       return newAdsets;
  //     });

  //     // Update the activeKey properly
  //     setActiveKey(prevActiveKey => {
  //       const newActiveIndex = activeKey.length > 0 ? 0 : [];
  //       return [String(newActiveIndex)];
  //     });
  // };

  // Sync form values after adsets state change
  // useEffect(() => {
  //     form.setFieldsValue({
  //         adsets: adsets.map((adset, index) => ({
  //             ...adset,
  //             [`adsets[${index}].AdsetPanelName`]: adset.AdsetPanelName,
  //             [`adsets[${index}].AdsetName`]: adset.AdsetName,
  //             // Include other fields as needed, including MediaContent
  //             [`adsets[${index}].MediaContent`]: adset.MediaContent
  //         }))
  //     });
  // }, [adsets]);

  const cloneAdset = (adsetId) => {
    const adsetIndex = adsetId
    console.log(adsetIndex)
    if (adsetIndex === -1) return;
    const adsets = form.getFieldValue("adsets") || [];
    console.log(adsets)
    const originalAdset = adsets.find(item => item.id === adsetIndex);
    const newId = uuidv4();

    console.log(originalAdset)

    const baseName = originalAdset.AdsetPanelName;
    const copyCount = adsets.filter((ad) =>
      ad.AdsetPanelName.startsWith(baseName)
    ).length;
    const newPanelName =
      copyCount > 0 ? `${baseName}(${copyCount})_Copy` : `${baseName}_Copy`;

    const clonedAdset = {
      ...originalAdset,
      id: newId,
      AdsetPanelName: newPanelName,
    };

    const currentFormAdsets = form.getFieldValue("adsets") || [];

    // ✅ Match by UUID not index!
    const formIndex = currentFormAdsets.findIndex(
      (_, i) => adsets[i]?.id === adsetId
    );
    const clonedFormData = { ...currentFormAdsets[formIndex] };

    // ✅ Add `_Copy` to AdsetName and AddName if present
    if (clonedFormData.AdsetName) {
      clonedFormData.AdsetName = `${clonedFormData.AdsetName}_Copy`;
    }
    if (clonedFormData.AddName) {
      clonedFormData.AddName = `${clonedFormData.AddName}_Copy`;
    }

    const updatedFormAdsets = [...currentFormAdsets, clonedFormData];
    const updatedAdsets = [...adsets, clonedAdset];

    // ✅ Set both states
    setAdsets(updatedAdsets);
    form.setFieldsValue({ adsets: updatedFormAdsets });

    // ✅ Clone media/file states by UUID
    const cloneFiles = (prev, setter) => {
      setter((old) => ({ ...old, [newId]: [...(old[adsetId] || [])] }));
    };

    cloneFiles(selectedFiles, setSelectedFiles);
    cloneFiles(selectedFilesFromMedia, setSelectedFilesFromMedia);
    cloneFiles(selectedFilesFromCreatives, setSelectedFilesFromCreatives);

    // ✅ Clone selectedPositions
    setSelectedPositions((prev) => ({
      ...prev,
      [newId]: [...(prev[adsetId] || [])],
    }));
    setSelectedPublishers((prev) => ({
      ...prev,
      [newId]: [...(prev[adsetId] || [])],
    }));

    // ✅ Open the last panel (the newly cloned one)
    setActiveKey([`${updatedAdsets.length - 1}`]);
  };

  const removeAdset = (index, adsetid) => {
    // Step 1: Get current form values safely
    const currentFormAdsets = form.getFieldValue("adsets") || [];

    // Step 2: Remove adset from state
    setAdsets((prevAdsets) => {
      const updatedAdsets = prevAdsets.filter((ad) => ad.id !== adsetid);

      // Step 3: Rebuild form values by matching UUIDs
      const newFormAdsets = updatedAdsets.map((updatedAdset) => {
        const oldIndex = prevAdsets.findIndex(
          (old) => old.id === updatedAdset.id
        );
        return currentFormAdsets[oldIndex]; // retain values of other adsets
      });

      console.log(newFormAdsets, "newFormAdsets in removeAdset");

      // Step 4: Set updated form values
      form.setFieldsValue({ adsets: newFormAdsets });

      return updatedAdsets;
    });

    // Step 5: Clean up all related file states
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      delete updated[adsetid];
      return updated;
    });

    setSelectedFilesFromMedia((prev) => {
      const updated = { ...prev };
      delete updated[adsetid];
      return updated;
    });

    setSelectedFilesFromCreatives((prev) => {
      const updated = { ...prev };
      delete updated[adsetid];
      return updated;
    });
  };

  // Function to handle edit icon click
  const handleEditClick = (file) => {
    setCurrentFile(file); // Set the file to be edited
    setIsImgEditorShown(true); // Open the image editor
  };

  // Function to handle saving the edited image
  const handleSaveEditedImage = (fileId, editedImageObject) => {
    setEditedImages((prev) => ({
      ...prev,
      [fileId]: editedImageObject.imageBase64 || editedImageObject.imageUrl,
    }));
    closeCanvasModal();
  };

  const closeCanvasModal = () => {
    setIsImgEditorShown(false); // Close the image editor
  };

  const onReturnUrl = (text) => {
    setIsModalVisibleForURLBuilder(false);
    setWebsiteURL(text);
    const currentAdsets = form.getFieldValue("adsets") || [];
    const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      updatedAdsets[urlBuilderIndex] = {
        ...updatedAdsets[urlBuilderIndex],
        Website_URL: text,
        Caption: text.split("//")[1].split("/")[0],
      };
    } else {
      setCaption(text.split("/")[0]);
      updatedAdsets[urlBuilderIndex] = {
        ...updatedAdsets[urlBuilderIndex],
        Website_URL: text,
        Caption: text.split("/")[0],
      };
    }

    // Update the form with the new adsets
    form.setFieldsValue({
      adsets: updatedAdsets,
    });

    // const checkFormCompletion = () => {
    //     const allValues = form.getFieldsValue(true);
    //     const isComplete = Object.keys(allValues).every(
    //         key => allValues[key] !== undefined && allValues[key] !== ''
    //     );
    //     setIsFormComplete(isComplete);
    // };

    // // Trigger form completion check
    // checkFormCompletion();
    setIsFormComplete(true);
    // console.log(text, "text");
  };

  // const onChangeCampaignLevelDailyBudget = (event) => {
  //     setCampaignLevelDailyBudget(parseFloat(event.target.value));
  //     console.log(event.target.value);
  // }

  const onChangeAdsetLevelDailyBudget = (event) => {
    setAdsetLevelDailyBudget(parseFloat(event.target.value));
    console.log(event.target.value);
    console.log(parseFloat(event.target.value));
  };

  const getUrlBuilder = useMemo(() => {
    switch (network) {
      case "FB_Mnet":
        return (
          <MnetUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
        );
      case "FB_Tonic1":
        return (
          <TonicUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
    }
  }, [network, accountis, onReturnUrl]);

  // const [imageHashes, setImageHashes] = useState([]);

  const onClickEdit = (index) => {
    setUrlBuilderIndex(index);
    setIsModalVisibleForURLBuilder(true);
  };

  const handleCancelForURLBuilder = () => {
    setUrlBuilderIndex(null);
    setIsModalVisibleForURLBuilder(false);
  };

  const handlePublisherChange = (value) => {
    setSelectedPublishers(value);
    setSelectedPositions({}); // Clear positions when publisher selection changes
  };

  const handlePositionChange = (values, options) => {
    console.log(values, "values");
    console.log(options, "options");
    const formatted = options.map((opt) => ({
      key: opt.value,
      label: opt.label || opt.children,
    }));
    console.log(formatted, "formatted positions");
    setSelectedPositions(formatted);
  };

  // const handlePositionChange = (value) => {
  //     setSelectedPositions(value);
  //     // setSelectedPositions(["feed"]); // Set default positions to "feed"
  //     // form.resetFields(['positions']);
  // };

  const getPositionOptions = () => {
    const allPositions = selectedPublishers.reduce((acc, publisher) => {
      return acc.concat(positionOptions[publisher] || []);
    }, []);
    return [...new Set(allPositions)]; // Remove duplicates
  };

  const handleBidStrategyChange = (value) => {
    // Show bid_amount if the selected bid strategy is "Bid Cap", otherwise hide it
    setShowBidAmount(
      value === "LOWEST_COST_WITH_BID_CAP" || value === "COST_CAP"
    );
    // setShowBidAmount(["LOWEST_COST_WITH_BID_CAP", "COST_CAP"].includes(value));
  };
  useEffect(() => {
    setAccountNumber(accountis);
    setDefaultUrlData("");
  }, [accountis]);

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    form.setFieldsValue({ Website_URL: websiteURL, Caption: caption });

    // Check if all required fields are complete
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    // Trigger form completion check
    checkFormCompletion();
  }, [websiteURL, form]);

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    form.setFieldsValue({
      Name: campaignName,
      AdsetName: campaignName,
      AddName: campaignName,
    });

    // Check if all required fields are complete
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    // Trigger form completion check
    checkFormCompletion();
  }, [campaignName, form]);

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    form.setFieldsValue({
      Daily_amount: campaignLevelDailyBudget,
      DailyAdd_amount: adsetLevelDailyBudget,
    });

    // Check if all required fields are complete
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    // Trigger form completion check
    checkFormCompletion();
  }, [campaignLevelDailyBudget, form]);

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    form.setFieldsValue({
      Daily_amount: campaignLevelDailyBudget,
      DailyAdd_amount: adsetLevelDailyBudget,
    });

    // Check if all required fields are complete
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    // Trigger form completion check
    checkFormCompletion();
  }, [adsetLevelDailyBudget, form]);

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    // const pageIDList = 
    console.log(imagehash, "imagehash in useEffect");
    // form.setFieldsValue({
    //   pixel_id: imagehash?.pixelID,
    //   page_id: imagehash?.pageID,
    // });

    // Check if all required fields are complete
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    // Trigger form completion check
    checkFormCompletion();
    if (imagehash) {
      if (
        imagehash.pixelID === null ||
        imagehash.pixelID === undefined ||
        imagehash.pixelID === ""
      ) {
        message.error(
          "There is no PageID and PixelID for this account. Contact your manager",
          10
        );
      }
    }
  }, [imagehash, form]);

  useEffect(() => {
    console.log(imageHashArray, "imageHashArray in useEffect");
    // const pageIdList = imageHashArray.map((item) => ({ value: `${item.accountNumber} - ${item.pageID}`, label: `${item.accountNumber} - ${item.pageID}` }));
    // const pageIdListFiltered = imageHashArray.map((item) => `${item.accountNumber} - ${item.pageID}`);
    const pixelIdListFiltered = imageHashArray.map((item) => {
      if (typeof item.pixelID === "object" && item.pixelID !== null && item.Network === network) {
        const universalValue = item.pixelID.Universal || Object.values(item.pixelID)[0];
        if (universalValue) {
          return `${item.accountNumber} - ${universalValue}`; // ✅ matches options.value
        }
        return null;
      }
      return `${item.accountNumber} - ${item.pixelID}`;       // ✅ matches options.value
    }).filter(Boolean)
    const pageIdListFiltered = imageHashArray.map((item) => {
      if (typeof item.pageID === "object" && item.pageID !== null && item.Network === network) {
        console.log(item);
        const universalValue = item.pageID.Universal || Object.values(item.pageID)[0];
        console.log(universalValue);
        if (universalValue) {
          return `${item.accountNumber} - ${universalValue}`; // ✅ matches options.value
        }
        return null;
      }
      return `${item.accountNumber} - ${item.pageID}`;       // ✅ matches options.value
    }).filter(Boolean)

    const pixelIdList = imageHashArray.flatMap((item) => {
      if (typeof item.pixelID === "object" && item.pixelID !== null && item.Network === network) {
        return Object.entries(item.pixelID).map(([key, value]) => ({
          value: `${item.accountNumber} - ${value}`,
          label: `${item.accountNumber} - ${key} - ${value}`,
        }));
      }

      return {
        value: `${item.accountNumber} - ${item.pixelID}`,
        label: `${item.accountNumber} - ${item.pixelID}`,
      };
    });

    const pageIdList = imageHashArray.flatMap((item) => {
      if (typeof item.pageID === "object" && item.pageID !== null && item.Network === network) {
        return Object.entries(item.pageID).map(([key, value]) => ({
          value: `${item.accountNumber} - ${value}`,
          label: `${item.accountNumber} - ${key} - ${value}`,
        }));
      }

      return {
        value: `${item.accountNumber} - ${item.pageID}`,
        label: `${item.accountNumber} - ${item.pageID}`,
      };
    });

    console.log(pixelIdList, "pixelIdList");
    console.log(pixelIdListFiltered, "pixelIdListFiltered");
    console.log(pageIdList, "pageIdList");
    console.log(pageIdListFiltered, "pageIdListFiltered");
    form.setFieldsValue({
      pixel_id: pixelIdListFiltered,
      page_id: pageIdListFiltered,
    });
    setPixel_id_list(pixelIdList);
    setPage_id_list(pageIdList);
    setPixelIdList(pixelIdListFiltered);
    setPageIdList(pageIdListFiltered);
  }, [imageHashArray, form]);

  const Accountchange = (e) => {
    console.log(e);
    const newAccounts = newImageHashArray.filter(item =>
      e.includes(item.label));
    console.log(newAccounts);
    // setAccountNumber(e.target.value);
  };
  // const handlepositionChange = async (values) => {
  //     console.log(values, "handlepositionChange")
  // }

  const fetchAccountDetails = async () => {
    try {
      const response = await axios.get(
        `https://www.testapi.adsgoat.in/api/newhashimageidentity/${accountNumber}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log("account data", ...response?.data);

      // response?.data?.map((item) => {
      //   console.log(item.Network === network, "item.Network === network");
      // });

      console.log(response?.data?.filter((item) => item.Network === network));

      setImageHashArray(response?.data?.filter((item) => item.Network === network) || []);
      setNewImageHashArray(response?.data?.filter((item) => item.Network === network) || []);

      setimagehash(...response?.data);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      // Handle error
    }
  };

  // const fetchDraftDeatils = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:4500/api/getDraftData?accountNumber=${accountNumber}`,
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );
  //     // console.log("account data", ...response?.data);
  //     console.log("Draft data fetched successfully:", response.data);
  //     // console.log((Array.isArray(response?.data?.Drafts && response?.data?.Drafts.length > 0) ? response?.data?.Drafts : []));
  //     // setDraftsData(
  //     //   Array.isArray(response?.data?.Drafts) &&
  //     //     response?.data?.Drafts.length > 0
  //     //     ? response?.data?.Drafts
  //     //     : []
  //     // );
  //     setDraftsData(
  //       Array.isArray(response?.data?.drafts) && response?.data?.drafts.length > 0
  //         ? response?.data?.drafts
  //         : []
  //     );
  //     // setimagehash(...response?.data)
  //   } catch (error) {
  //     console.error("Error fetching campaign data:", error);
  //     // Handle error
  //   }
  // };

  // const fetchDraftDetails = async () => {
  //   if (!account) return;
  //   try {
  //     const res = await axios.get("http://localhost:4500/api/newGetDraftData", {
  //       params: { accountNumber: account },
  //       headers: { Authorization: token },
  //       validateStatus: () => true,
  //     });

  //     if (res.status === 200 && res.data?.ok) {
  //       setDraftsData(Array.isArray(res.data.drafts) ? res.data.drafts : []);
  //     } else if (res.status === 404) {
  //       setDraftsData([]);
  //     } else {
  //       message.error(res.data?.message || `Failed to load drafts (${res.status})`);
  //     }
  //   } catch (err) {
  //     console.error("fetchDraftDetails error:", err);
  //     message.error("Error fetching drafts");
  //   }
  // };
  const fetchDraftDetails = async () => {
    if (!account) return;

    // normalize `account` to an array
    const accounts = Array.isArray(account) ? account.filter(Boolean) : [account];

    try {
      const res = await axios.post(
        "https://www.testapi.adsgoat.in/api/newGetDraftData",
        { accounts },
        {
          headers: { Authorization: token },
          validateStatus: () => true,
        }
      );

      if (res.status === 200 && res.data?.ok) {
        // flat list; each draft has `accountNumber`
        setDraftsData(Array.isArray(res.data.drafts) ? res.data.drafts : []);
        // If you prefer per-account map later:
        // setDraftsByAccount(res.data.draftsByAccount);
      } else {
        message.error(res.data?.message || `Failed to load drafts (${res.status})`);
      }
    } catch (err) {
      console.error("fetchDraftDetails error:", err);
      message.error("Error fetching drafts");
    }
  };


  // const deleteDraft = async (draftId) => {
  //   if (!draftId) {
  //     message.error("Draft ID is missing");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:4500/api/deleteDraft", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: token,
  //       },
  //       body: JSON.stringify({
  //         accountNumber: account,
  //         draftId: draftId
  //       })
  //     });

  //     const data = await response.json();

  //     if (data.ok) {
  //       message.open({
  //         type: 'success',
  //         content: "Draft deleted successfully",
  //         className: theme === 'dark' ? 'dark-message' : '',
  //       })
  //       await fetchDraftDetails();
  //     } else {
  //       message.error(data.message || "Failed to delete draft");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting draft:", error);
  //     message.error("An error occurred while deleting");
  //   }
  // };
  // const deleteDraft = async (accountNumber, draftId) => {
  //   if (!accountNumber || !draftId) {
  //     message.error("Missing account number or draft id");
  //     return;
  //   }

  //   const resp = await fetch("http://localhost:4500/api/deleteDraft", {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: token,
  //     },
  //     body: JSON.stringify({ accountNumber, draftId }),
  //   });

  //   const data = await resp.json().catch(() => ({}));

  //   if (resp.ok && data.ok) {

  //     setDraftsData(prev =>
  //       prev.filter(
  //         d => !(
  //           String(d.accountNumber) === String(accountNumber) &&
  //           String(d.draftId) === String(draftId)
  //         )
  //       )
  //     );
  //     message.success("Draft deleted successfully");
  //   } else {
  //     message.error(data.message || "Failed to delete draft");
  //   }
  // };
  const deleteDraft = async (groupId) => {
    if (!groupId) {
      message.error("Missing groupId");
      return;
    }

    const resp = await fetch("https://www.testapi.adsgoat.in/api/NewdeleteDraft", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ groupId }),
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.ok && data.ok) {
      // Remove all drafts in this group from local state
      setDraftsData(prev => prev.filter(d => d.groupId !== groupId));
      message.success("Drafts deleted successfully across all accounts");
    } else {
      message.error(data.message || "Failed to delete drafts");
    }
  };

  // const handleDelete = (Account_Number, draftId) => {
  //   setDeleteModal({ visible: true, id: draftId, Account_Number });
  // };
  const handleDelete = async (groupId) => {
    try {
      const res = await fetch(`https://www.testapi.adsgoat.in/api/getDraftsByGroupId/${groupId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: token },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to fetch drafts");

      const accounts = json.data.map(d => d.accountNumber);
      if (!accounts.length) {
        message.warning("No matching accounts found");
        return;
      }

      setMatchedAccounts(accounts);
      setDeleteModal({ visible: true, groupId });
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to fetch matching accounts");
    }
  };

  // const onConfirmDelete = async () => {
  //   try {
  //     setDeleting(true);
  //     await deleteDraft(deleteModal.Account_Number, deleteModal.id);
  //   } finally {
  //     setDeleting(false);
  //     setDeleteModal({ visible: false, id: null, Account_Number: null });
  //   }
  // };
  const onConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteDraft(deleteModal.groupId);
    } finally {
      setDeleting(false);
      setDeleteModal({ visible: false, groupId: null });
    }
  };


  const onCancelDelete = () => {
    setDeleteModal({ visible: false, id: null });
  };
  const handleEditDraft = (draft) => {
    onChangeDraft(draft.draftId);
    setIsTemplatesModalOpen(false);
    selectedRef.current = {
      Draft_Name: draft.Draft_Name,
      Draft_Id: draft.draftId,
      accountNumber: draft.Account_Number,
      groupId: draft.groupId
    };
    setPopupInputs({ input1: draft.Category || "", input2: draft.Draft_Name || "" });
    setIsEditingDraft(true);
    setSelectedTemplate(null);
  }

  const handleSaveEditedDraft = async () => {
    // const trimmedCat = popupInputs.input1.trim();
    const trimmedName = popupInputs.input2.trim();

    const newErrors = {
      // input1: trimmedCat ? "" : "Template category is required",
      input2: trimmedName ? "" : "Template name is required",
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(msg => msg !== "")) return Promise.reject();

    try {
      // Call your API that fetches all accounts with drafts
      const res = await fetch(
        `https://www.testapi.adsgoat.in/api/getDraftsByGroupId/${selectedRef.current.groupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to fetch drafts");


      const matchedAccounts = json.data
        .filter(account => account.Drafts.some(draft => draft.groupId === selectedRef.current.groupId))
        .map(account => account.accountNumber);

      if (matchedAccounts.length === 0) {
        message.info("No accounts have drafts with this groupId");
        return;
      }


      setMatchedAccounts(matchedAccounts);
      setIsEditAccountsModalOpen(true);

    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to fetch matched accounts");
    }
  };



  const postDraftSaveCleanup = async () => {
    await fetchDraftDetails();
    setIsEditingDraft(false);
    selectedRef.current = null;
    newSelectedRef.current = "";
    setPopupInputs({ input1: "", input2: "" });
    setAdsets([{ id: uuidv4(), AdsetPanelName: "ADSET 1", DailyAdd_amount: 0 }]);
    setSelectedFiles({});
    setSelectedFilesFromCreatives({});
    setSelectedFilesFromMedia?.({});
    setSelectedPositions({});
    setSelectedPublishers({});
    setIsManual?.(false);
    setCampaignLevelDailyBudget(0);
    setAdsetLevelDailyBudget?.(0);
    setIsCampaignBudgetActive?.(false);
    setShowBidAmount?.(false);
    setWebsiteURL?.("");
    setPrimaryText?.("");
    setCaption?.("");
    setHeadline?.("");
    setDescription?.("");
    setIsFormComplete?.(false);
    setSubmitErrors([]);
    setActiveKey("1");
    setIsTemplatesModalOpen(false);
    setOpenCreativesDrawer(false);
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (visible && accountNumber) {
      form.setFieldsValue({ Account_Number: accountNumber });
      fetchAccountDetails();
    }
  }, [accountNumber, visible, form]);

  useEffect(() => {
    setDraftsData([]);
    if (account) {
      fetchDraftDetails();
    }
  }, [account]);
  const handleNameChange = async (e) => {
    if (adsets.length === 1) {
      form.setFieldsValue({
        adsets: {
          [0]: {
            AdsetName: e.target.value,
            AddName: e.target.value,
          }
        }
      });
    }
    const newName = e.target.value;
    setCampaignName(newName);
  };

  const handleFormChange = (changedFields, allValues) => {
    if (!allValues) return; // Return early if allValues is undefined

    // Object.keys(changedFields).forEach((changedAdsetIndex) => {
    //     const { AddName, Caption, Description, message, headline, Website_URL } = changedFields[changedAdsetIndex] || {};
    //     console.log(changedAdsetIndex, "changedAdsetIndex");
    //     console.log(allValues, "allValues in handleFormChange");
    //     console.log(changedFields, "changedFields in handleFormChange");
    //     console.log(AddName, "AddName in handleFormChange");
    //     console.log(Caption, "Caption in handleFormChange");
    //     console.log(Description, "Description in handleFormChange");
    //     console.log(message, "message in handleFormChange");
    //     console.log(headline);
    //     console.log(Website_URL);
    //     // If any relevant field has changed
    //     if (AddName || Caption || Description || message || headline || Website_URL) {
    //       setAdMediaData((prev) => {
    //         const updatedAdset = { ...prev };

    //         // Update all media objects for the affected adset index
    //         if (updatedAdset[changedAdsetIndex]) {
    //           updatedAdset[changedAdsetIndex] = updatedAdset[changedAdsetIndex].map((file) => ({
    //             ...file,
    //             AddName: AddName || file.AddName,
    //             Caption: Caption || file.Caption,
    //             Description: Description || file.Description,
    //             message: message || file.message,
    //             headline: headline || file.headline,
    //             Website_URL: Website_URL || file.Website_URL,
    //           }));
    //         }

    //         return updatedAdset;
    //       });
    //     }
    // });

    // Check if all fields are filled
    const isComplete = Object.values(allValues).every(
      (value) => value !== undefined && value !== ""
    );
    setIsFormComplete(isComplete);
  };

  // const customRequest = async (onSuccess, onError) => {
  //     if (!imagehash || imagehash.length === 0) {
  //         onError("Image hash data not loaded");
  //         return [];
  //     }
  //     const token = imagehash.token;
  //     const account = imagehash.accountNumber;

  //     const uploadFilesSequentially = async (selectedFiles) => {
  //         const mediaHashArray = [];

  //         for (const file of selectedFiles) {
  //             try {
  //                 const fileType = file.type;
  //                 if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
  //                     onError("Unsupported file type");
  //                     continue;
  //                 }

  //                 if (file?.url) {
  //                     if (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") || file?.url?.endsWith('.mp4')) {
  //                         const formData = new FormData();
  //                         const response = await fetch(`https://prodapis.adsgoat.in/s3?s3Url=${file.url}`, {
  //                             method: 'GET',
  //                             headers: {
  //                                 'Content-Type': 'application/json',
  //                                 Authorization: localStorage.getItem("token"),
  //                             },
  //                         });

  //                         const uploadFile = await response.blob();
  //                         if (!(uploadFile instanceof Blob)) {
  //                             console.error("The fetched file is not a Blob:", uploadFile);
  //                             continue;
  //                         }

  //                         formData.append("file", uploadFile, file.name);
  //                         // console.log(formData);

  //                         let fbResponse;
  //                         if (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") ) {
  //                             formData.append('file', uploadFile, file.name);
  //                             formData.append('access_token', token);
  //                             const fileName = file.name.split('/').pop();

  //                             fbResponse = await axios.post(
  //                                 `https://graph.facebook.com/v20.0/act_${account}/adimages`,
  //                                 formData,
  //                                 { headers: { 'Content-Type': 'multipart/form-data' } }
  //                             );

  //                             if (fbResponse.status === 200) {
  //                                 onSuccess("ok", response);
  //                                 mediaHashArray.push({
  //                                     filename: file?.url,
  //                                     imag_hash: fbResponse.data?.images?.[fileName]?.hash,
  //                                 });
  //                             } else {
  //                                 onError("error", response);
  //                                 console.error("Image upload failed");
  //                             }
  //                         } else if (file?.url?.endsWith('.mp4')) {
  //                             formData.append('access_token', token);
  //                             fbResponse = await axios.post(
  //                                 `https://graph.facebook.com/v20.0/act_${account}/advideos`,
  //                                 formData,
  //                                 { headers: { 'Content-Type': 'multipart/form-data' } }
  //                             );

  //                             if (fbResponse.status === 200) {
  //                                 const videoid = fbResponse?.data?.id;
  //                                 await new Promise(resolve => setTimeout(resolve, 10000));

  //                                 const thumbnailResponse = await axios.get(
  //                                     `https://graph.facebook.com/v20.0/${videoid}`,
  //                                     {
  //                                         params: {
  //                                             access_token: token,
  //                                             fields: 'thumbnails',
  //                                             is_preferred: true
  //                                         }
  //                                     }
  //                                 );

  //                                 const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
  //                                 const uri = preferredThumbnail ? preferredThumbnail.uri : "";
  //                                 // console.log(videoid);
  //                                 // console.log(uri);

  //                                 onSuccess("ok", fbResponse);
  //                                 mediaHashArray.push({
  //                                     filename: file?.url,
  //                                     videoid: videoid,
  //                                     thambnailurl: uri,
  //                                 });
  //                             } else {
  //                                 onError("error", fbResponse);
  //                                 console.error("Video upload to Facebook failed");
  //                             }
  //                         }
  //                     }
  //                 } else {
  //                     if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
  //                         const formData = new FormData();
  //                         const uniqueId = uuidv4(); // Generate a unique ID for the file
  //                         const fileId = `${uniqueId}_${file.name}`;
  //                         const editedImage = editedImages[file.name];
  //                         const uploadFile = editedImage ? await fetch(editedImage).then(res => res.blob()) : null;

  //                         console.log(file.originFileObj.name);

  //                         if (uploadFile) {
  //                             formData.append("file", uploadFile, `blob/${uniqueId}_${file.name}`);
  //                         } else {
  //                             formData.append("file", file.originFileObj, `blob/${uniqueId}_${file.originFileObj.name}`);
  //                         }

  //                         // console.log(formData);
  //                         let response, fbResponse;

  //                         if (file.type.startsWith('image/')) {
  //                             response = await axios.post(
  //                                 'https://www.testapi.adsgoat.in/upload',
  //                                 formData,
  //                                 {
  //                                     headers: {
  //                                         'Authorization': localStorage.getItem("token"),
  //                                         "Content-Type": "multipart/form-data"
  //                                     },
  //                                 }
  //                             );

  //                             if (!response.data.imageUrl) {
  //                                 onError("Error: Image URL not returned from custom API");
  //                                 console.error("Image upload to custom API failed, imageUrl missing");
  //                                 continue;
  //                             }

  //                             // console.log("Custom API response imageUrl:", response);
  //                             formData.append('access_token', token);

  //                             fbResponse = await axios.post(
  //                                 `https://graph.facebook.com/v20.0/act_${account}/adimages`,
  //                                 formData,
  //                                 { headers: { 'Content-Type': 'multipart/form-data' } }
  //                             );

  //                             // console.log("Facebook API response:", fbResponse.data);

  //                             if (response.status === 200 && fbResponse.status === 200) {
  //                                 onSuccess("ok", response);
  //                                 mediaHashArray.push({
  //                                     filename: response.data.imageUrl,
  //                                     imag_hash: fbResponse.data?.images?.[fileId]?.hash,
  //                                 });
  //                             } else {
  //                                 onError("error", response);
  //                                 console.error("Image upload failed");
  //                             }
  //                         } else if (file.type.startsWith('video/')) {
  //                             response = await axios.post(
  //                                 'https://www.testapi.adsgoat.in/upload',
  //                                 formData,
  //                                 {
  //                                     headers: {
  //                                         'Authorization': localStorage.getItem("token"),
  //                                         "Content-Type": "multipart/form-data"
  //                                     },
  //                                 }
  //                             );

  //                             if (response.status !== 200) {
  //                                 onError("error", response);
  //                                 console.error("Video upload to custom API failed");
  //                                 continue;
  //                             }

  //                             formData.append('access_token', token);

  //                             fbResponse = await axios.post(
  //                                 `https://graph.facebook.com/v20.0/act_${account}/advideos`,
  //                                 formData,
  //                                 { headers: { 'Content-Type': 'multipart/form-data' } }
  //                             );

  //                             if (fbResponse.status === 200) {
  //                                 const videoid = fbResponse?.data?.id;
  //                                 await new Promise(resolve => setTimeout(resolve, 10000));

  //                                 const thumbnailResponse = await axios.get(
  //                                     `https://graph.facebook.com/v20.0/${videoid}`,
  //                                     {
  //                                         params: {
  //                                             access_token: token,
  //                                             fields: 'thumbnails',
  //                                             is_preferred: true
  //                                         }
  //                                     }
  //                                 );

  //                                 const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
  //                                 const uri = preferredThumbnail ? preferredThumbnail.uri : "";

  //                                 onSuccess("ok", fbResponse);
  //                                 mediaHashArray.push({
  //                                     filename: response.data.imageUrl,
  //                                     videoid: videoid,
  //                                     thambnailurl: uri,
  //                                 });
  //                             } else {
  //                                 onError("error", fbResponse);
  //                                 console.error("Video upload to Facebook failed");
  //                             }
  //                         }
  //                     }
  //                 }
  //             } catch (error) {
  //                 console.error("Error uploading file:", error);
  //                 onError("error", error);
  //             }
  //         }

  //         // console.log("All media files uploaded successfully:", mediaHashArray);
  //         return mediaHashArray;
  //     };

  //     try {
  //         const mediaHashArray = uploadFilesSequentially(selectedFiles);
  //         console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
  //         return mediaHashArray;
  //     } catch (error) {
  //         console.error("One or more media uploads failed:", error);
  //         return [];
  //     }
  // };

  const customRequest = async (singleaccount, data, index, onSuccess, onError, id) => {
    if (!imagehash || imagehash.length === 0) {
      onError("Image hash data not loaded");
      return [];
    }
    const newAccountObject = imageHashArray.find(item => item.accountNumber === singleaccount);
    const token = newAccountObject.token;
    const account = newAccountObject.accountNumber;

    const createS3Folder = async (folderPath) => {
      try {
        const response = await fetch(
          "https://prodapis.adsgoat.in/uploadUserFiles",
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("token"),
              username: newAccountObject.username || "default-user",
              "x-folder": folderPath.endsWith("/")
                ? folderPath
                : folderPath + "/",
              "x-action": "create-folder",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to create folder");
        const data = await response.json();
        console.log("Folder created:", folderPath);
        return true;
      } catch (err) {
        console.error("Error creating folder:", err);
        return false;
      }
    };

    const uploadFileToS3 = async (fileBlob, fileName, folderPath) => {
      const fullPath = `${folderPath}/${fileName}`;
      const formData = new FormData();
      formData.append("file", fileBlob, fileName);
      formData.append("filename", fullPath); // required in body

      try {
        const response = await fetch(
          "https://prodapis.adsgoat.in/uploadUserFiles",
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("token"),
              username: newAccountObject.username || "default-user", // required in headers
            },
            body: formData,
          }
        );

        if (!response.ok) throw new Error("S3 upload failed");

        const data = await response.json();
        return data.imageUrl;
      } catch (err) {
        console.error("Error uploading to S3:", err);
        return null;
      }
    };

    const uploadFilesSequentially = async (selectedFiles) => {
      const mediaHashArray = [];

      for (const file of selectedFiles) {
        try {
          const fileType = file.type;
          if (
            !fileType.startsWith("image/") &&
            !fileType.startsWith("video/")
          ) {
            onError("Unsupported file type");
            continue;
          }

          const folderPath = `${network}/${account}/${formValues ? formValues.Name : "Drafts"
            }`;
          await createS3Folder(folderPath);
          let fileBlob = null;
          let s3FileUrl = null;

          if (file?.url) {
            const response = await fetch(
              `https://prodapis.adsgoat.in/s3?s3Url=${file.url}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            fileBlob = await response.blob();
            s3FileUrl = await uploadFileToS3(fileBlob, file.name, folderPath);

            const formData = new FormData();
            formData.append("file", fileBlob, file.name);
            formData.append("access_token", token);

            let fbResponse;
            if (
              file.url.endsWith(".png") ||
              file.url.endsWith(".jpg") ||
              file.url.endsWith(".jpeg")
            ) {
              const fileName = file.name.split("/").pop();

              fbResponse = await axios.post(
                `https://graph.facebook.com/v23.0/act_${account}/adimages`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (fbResponse.status === 200) {
                onSuccess("ok", fbResponse);
                mediaHashArray.push({
                  filename: s3FileUrl,
                  imag_hash: fbResponse.data?.images?.[fileName]?.hash,
                });
              } else {
                onError("error", fbResponse);
                console.error("Image upload failed");
              }
            } else if (file.url.endsWith(".mp4")) {
              fbResponse = await axios.post(
                `https://graph.facebook.com/v23.0/act_${account}/advideos`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (fbResponse.status === 200) {
                const videoid = fbResponse?.data?.id;
                await new Promise((resolve) => setTimeout(resolve, 10000));

                const thumbnailResponse = await axios.get(
                  `https://graph.facebook.com/v23.0/${videoid}`,
                  {
                    params: {
                      access_token: token,
                      fields: "thumbnails",
                      is_preferred: true,
                    },
                  }
                );

                const preferredThumbnail =
                  thumbnailResponse.data.thumbnails.data.find(
                    (thumbnail) => thumbnail.is_preferred === true
                  );
                const uri = preferredThumbnail ? preferredThumbnail.uri : "";

                onSuccess("ok", fbResponse);
                mediaHashArray.push({
                  filename: s3FileUrl,
                  videoid: videoid,
                  thambnailurl: uri,
                });
              } else {
                onError("error", fbResponse);
                console.error("Video upload to Facebook failed");
              }
            }
          } else {
            const uniqueId = uuidv4();
            const safeName = `blob_${uniqueId}_${file.name}`;
            const editedImage = editedImages[file.name];
            fileBlob = editedImage
              ? await fetch(editedImage).then((res) => res.blob())
              : file.originFileObj;
            s3FileUrl = await uploadFileToS3(fileBlob, safeName, folderPath);

            const formData = new FormData();
            formData.append("file", fileBlob, safeName);
            formData.append("access_token", token);

            let response, fbResponse;

            if (file.type.startsWith("image/")) {
              response = await axios.post(
                "https://www.testapi.adsgoat.in/upload",
                formData,
                {
                  headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              if (!response.data.imageUrl) {
                onError("Error: Image URL not returned from custom API");
                console.error(
                  "Image upload to custom API failed, imageUrl missing"
                );
                continue;
              }

              fbResponse = await axios.post(
                `https://graph.facebook.com/v23.0/act_${account}/adimages`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (response.status === 200 && fbResponse.status === 200) {
                onSuccess("ok", response);
                mediaHashArray.push({
                  filename: s3FileUrl,
                  imag_hash: fbResponse.data?.images?.[safeName]?.hash,
                });
              } else {
                onError("error", response);
                console.error("Image upload failed");
              }
            } else if (file.type.startsWith("video/")) {
              response = await axios.post(
                "https://www.testapi.adsgoat.in/upload",
                formData,
                {
                  headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              if (response.status !== 200) {
                onError("error", response);
                console.error("Video upload to custom API failed");
                continue;
              }

              fbResponse = await axios.post(
                `https://graph.facebook.com/v23.0/act_${account}/advideos`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (fbResponse.status === 200) {
                const videoid = fbResponse?.data?.id;
                await new Promise((resolve) => setTimeout(resolve, 10000));

                const thumbnailResponse = await axios.get(
                  `https://graph.facebook.com/v23.0/${videoid}`,
                  {
                    params: {
                      access_token: token,
                      fields: "thumbnails",
                      is_preferred: true,
                    },
                  }
                );

                const preferredThumbnail =
                  thumbnailResponse.data.thumbnails.data.find(
                    (thumbnail) => thumbnail.is_preferred === true
                  );
                const uri = preferredThumbnail ? preferredThumbnail.uri : "";

                onSuccess("ok", fbResponse);
                mediaHashArray.push({
                  filename: s3FileUrl,
                  videoid: videoid,
                  thambnailurl: uri,
                });
              } else {
                onError("error", fbResponse);
                console.error("Video upload to Facebook failed");
              }
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          onError("error", error);
        }
      }

      return mediaHashArray;
    };

    try {
      let mediaHashArray = [];
      if (Array.isArray(selectedFiles[id]) && selectedFiles[id].length > 0) {
        mediaHashArray = await uploadFilesSequentially(selectedFiles[id]);
      }
      console.log(
        "All media files uploaded successfully. Media Hash Array:",
        mediaHashArray
      );
      return mediaHashArray;
    } catch (error) {
      console.error("One or more media uploads failed:", error);
      return [];
    }
  };

  const handleBeforeUpload = (file) => {
    return false; // Prevent auto-upload
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const onFinish = (values) => {
    // console.log("Form Values:", values);
    // console.log("Selected Publishers:", formValues);
    if (values.placements === "manual") {
      const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
        acc[publisher + "_positions"] = values.positions.filter((position) =>
          positionOptions[publisher]
            .map((option) => option.key)
            .includes(position)
        );
        return acc;
      }, {});
      console.log({
        publisher_platforms: values.publisher_platforms,
        ...selectedPlatforms,
        ...values,
      });

      setIsModalVisible(true);
      setFormValues({
        publisher_platforms: values.publisher_platforms,
        ...selectedPlatforms,
        ...values,
      });
    }
  };

  const submitDraftData = async () => {
    const campaignData = await MultipleAdsestsFetching(formValues);

    try {
      if (campaignData) {
        // console.log("Campaign Data:", campaignData);
        //https://www.testapi.adsgoat.in
        const response = await fetch(
          "https://www.testapi.adsgoat.in/api/newSubmitFormData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(campaignData),
          }
        );

        // if (response.ok) {
        //     message.success('Campaign created successfully');
        //     console.log('Form data submitted successfully');
        //     setLoading(false); // Stop the spinner
        //     setSelectedFilesFromCreatives({});
        //     setSelectedFilesFromMedia({});
        //     setSelectedFiles({});
        //     onClose();
        //     setSelectedPositions({});
        //     setAdsets([{ id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName:"Adset 1" }]);
        //     isManual !== "manual" && setIsManual(false);
        //     newSelectedRef.current = null; // Reset the newSelectedRef
        // } else {
        //     console.error('Failed to submit form data');
        // }
      }
    } catch (error) {
      console.error("Error during campaign creation:", error);
      message.error("An error occurred while creating the campaign.");
    }
  };

  const handleOk = async () => {
    setLoading(true); // Start the spinner
    setIsModalVisible(false); // Close the modal
    // console.log("Form Values:", formValues);
    // console.log("SelectedFiles:", selectedFiles);
    // console.log("adMediaData:", adMediaData);
    // console.log("MultipleAdsestsFetching", await MultipleAdsestsFetching(formValues));
    // console.log(selectedPositions, "selectedPositions");

    // abcd
    const selectedCategory = (popupInputs?.reportCat || "").trim();
    if (!selectedCategory) {
      // message.error("Category is required");
      return;
    }

    console.log("Form values", formValues);

    const campaignData = await MultipleAdsestsFetching(formValues);
    console.log("Campaign Data before adding category:", campaignData);
    // campaignData.Category = selectedCategory;
    //abcd

    try {
      if (campaignData) {
        // console.log("Campaign Data:", campaignData);
        //https://www.testapi.adsgoat.in

        for (const campaign of campaignData) {
          await fetch(
            "https://www.testapi.adsgoat.in/api/newsubmitFormData",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify({ ...campaign, Category: selectedCategory }),
            }
          );
        }



        // if (response.ok) {
        message.open({
          type: 'success',
          content: "Campaign created successfully",
          className: theme === 'dark' ? 'dark-message' : '',
        })
        console.log("Form data submitted successfully");
        setLoading(false); // Stop the spinner
        setSelectedFilesFromCreatives({});
        setSelectedFilesFromMedia({});
        setSelectedFiles({});
        onClose();
        setSelectedPositions({});
        setAdsets([
          { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "ADSET 1", AdsetName: "", AddName: "" },
        ]);
        isManual !== "manual" && setIsManual(false);
        newSelectedRef.current = null; // Reset the newSelectedRef
        setPopupInputs((s) => ({ ...s, reportCat: "" }));
        form.resetFields();
        form.setFieldValue({})
        changeRRefrst();
        setCampaignLevelDailyBudget(0);
        setAdsetLevelDailyBudget(0);
        setIsCampaignBudgetActive(false);
        setIsAnyAdsetBudgetSet(false);
        setShowBidAmount(false);
        setGeos("Geo");
        setPages("Page");
        setPixels("Pixel");
      }
    } catch (error) {
      console.error("Error during campaign creation:", error);
      message.error("An error occurred while creating the campaign.");
    } finally {
      setLoading(false); // Stop the spinner after the process is complete
    }
    //efgh

    // if (formValues) {
    //     const onSuccess = (status, response) => {
    //         console.log("Upload success:", response);
    //     };

    //     const onError = (status, error) => {
    //         console.error("Upload error:", error);
    //     };

    //     try {
    //         imagehash.campaignName = formValues.Name;
    //         const imageHashArray = await customRequest(onSuccess, onError);
    //         console.log("Image Hash Array:", imageHashArray);

    //         if (imageHashArray.length > 0) {  // Only proceed if all images are uploaded successfully
    //             console.log("Image Hashes just before postData:", { ...formValues, imageHashes: imageHashArray });
    //             await postData({ ...formValues, imageHashes: imageHashArray });
    //             changeRRefrst();
    //             message.success("Campaign created successfully");
    //         } else {
    //             message.error("Failed to upload one or more images. Campaign creation aborted.");
    //         }
    //     } catch (error) {
    //         console.error("Error:", error);
    //         message.error("An error occurred during the campaign creation process.");
    //     } finally {
    //         setLoading(false); // Stop the spinner after the process is complete
    //     }

    // }
  };

  function extractValuesByPartialLabel(dataArray, labelName) {
    console.log(dataArray, labelName);
    return dataArray
      .filter((item) =>
        item.label.toLowerCase().includes(labelName.toLowerCase())
      )
      .map((item) => {
        if (item.key.includes("story_")) return "story";
        if (item.key.includes("profile_feed-")) return "profile_feed";
        return item.key;
      });
  }

  const MultipleAdsestsFetching = async (values) => {

    const multipleAccounts = values.Account_Number;

    const multipleAccountsData = [];

    for (let account of multipleAccounts) {
      const newImageHash = imageHashArray.find(item => item.accountNumber === account);
      const list_of_page_id = values.page_id;
      const list_of_pixel_id = values.pixel_id;
      // const page_id = list_of_page_id.find(item => item.includes(account)).split("-");
      // const pixel_id = list_of_pixel_id.find(item => item.includes(account)).split("-");

      const matchedPageIds = list_of_page_id
        .filter(item => item.includes(account))
        .map(item => item.split("-")[1]?.trim());   // only index 1 (page name)

      const page_ids =
        page === "Pages"
          ? matchedPageIds                          // return all
          : matchedPageIds.length > 0
            ? [matchedPageIds[0]]                   // return only first
            : [];


      // Pixel IDs
      const matchedPixelIds = list_of_pixel_id
        .filter(item => item.includes(account))
        .map(item => item.split("-")[1]?.trim());   // only index 1 (pixel name)

      const pixel_ids =
        pixel === "Pixels"
          ? matchedPixelIds
          : matchedPixelIds.length > 0
            ? [matchedPixelIds[0]]
            : [];



      for (const page_id of page_ids) {
        for (const pixel_id of pixel_ids) {
          //12
          // console.log("page_id", account, page_id[page_id.length - 1].trim());
          // console.log("pixel_id", account, pixel_id[pixel_id.length - 1].trim());

          if (geo == "Geos") {
            const multipleGeoData = values.adsets[0].countries;
            for (const country of multipleGeoData) {
              let AllAdsetsData = {
                campaign_name: values.Name,
                Account_Number: account,
                Approval: "PENDING_APPROVAL",
                fbstatus: "No-Live",
                Category: selectedCategory,
                camapaignlevel: {
                  createdby: session?.user?.name,
                  Name: values.Name,
                  Objectives: values.Objectives,
                  Special_categories: values.Special_categories,
                  ...(Array.isArray(values?.Special_categories)
                    ? { Special_categories_countries: values.countries }
                    : {}),
                  Bid_strategy: values.Bid_strategy,
                  Budget_type: budgetType,
                  Daily_amount: parseFloat(values.Daily_amount) * 100,
                  Status: values.Status,
                  access_token: newImageHash.token,
                  createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
                },
              };
              const onSuccess = (status, response) => {
                console.log("Upload success:", response);
              };

              const onError = (status, error) => {
                console.error("Upload error:", error);
              };

              for (let i = 0; i < values.adsets.length; i++) {
                let AdsetsData = {};

                const imagesHashArray = await customRequest(
                  account,
                  values.adsets[i],
                  i,
                  onSuccess,
                  onError,
                  adsets[i].id
                );
                const addLevelData = imagesHashArray.map((media, index) => {
                  if (media.imag_hash) {
                    // This is an image
                    return {
                      id: uuidv4(),
                      AddName: `${values.adsets[i].AddName}_${index + 1}`,
                      filename: media.filename,
                      imag_hash: media.imag_hash,
                      page_id: page_id,
                      message: values.adsets[i].message,
                      headline: values.adsets[i].headline,
                      Description: values.adsets[i].Description,
                      Caption: values.adsets[i][account].Caption,
                      Website_URL: values.adsets[i][account].Website_URL,

                      // urlParameters: values.urlParameters
                    };
                  } else if (media.videoid) {
                    // This is a video
                    return {
                      id: uuidv4(),
                      AddName: `${values.adsets[i].AddName}_${index + 1}`,
                      filename: media.filename,
                      videoid: media.videoid,
                      thambnailurl: media.thambnailurl,
                      page_id: page_id,
                      message: values.adsets[i].message,
                      headline: values.adsets[i].headline,
                      Description: values.adsets[i].Description,
                      Caption: values.adsets[i][account].Caption,
                      Website_URL: values.adsets[i][account].Website_URL,
                      // urlParameters: values.urlParameters
                    };
                  }
                });
                AdsetsData[`adsetlevel_${i + 1}`] = {
                  id: uuidv4(),
                  AdsetName: values.adsets[i].AdsetName,
                  Budget_type: budgetType,
                  Daily_amount: values.adsets[i].DailyAdd_amount
                    ? parseFloat(values.adsets[i].DailyAdd_amount) * 100
                    : "",
                  optimization_goal: values.adsets[i].optimization_goal,
                  billing_event: values.adsets[i].billing_event,
                  start_time: moment(values.adsets[i].DatePicker.$d)
                    .tz(newImageHash.timeZone)
                    .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
                  ...(values.adsets[i].DatePickerEnd
                    ? {
                      end_time: moment(values.adsets[i].DatePickerEnd.$d)
                        .tz(newImageHash.timeZone)
                        .format("YYYY-MM-DDTHH:mm:ssZ"),
                    }
                    : {}),
                  action_source: values.adsets[i].action_source,
                  custom_event_type: values.adsets[i].custom_event_type,
                  pixel_id: pixel_id,
                  // bid_amount: values.adsets[i].bid_amount
                  //   ? parseFloat(values.adsets[i].bid_amount) * 100
                  //   : 0,
                  bid_amount: values.adsets[i].bid_amount
                    ? Math.round(Number(values.adsets[i].bid_amount) * 100)
                    : 0,
                  countries: [String(country)],
                  Min_Age: values.adsets[i].Min_Age,
                  Max_Age: values.adsets[i].Max_Age,
                  Gender: parseInt(values.adsets[i].Gender),
                  locales: values.adsets[i].Language,
                  placements: values.adsets[i].placements,
                  ...(values.adsets[i].placements !== "Advance" && {
                    publisher_platforms: values.adsets[i].platforms,
                    Facebook_positions:
                      extractValuesByPartialLabel(
                        selectedPositions[adsets[i].id],
                        "Facebook"
                      ) || [],
                    instagram_positions:
                      extractValuesByPartialLabel(
                        selectedPositions[adsets[i].id],
                        "Instagram"
                      ) || [],
                    audience_network_positions:
                      extractValuesByPartialLabel(
                        selectedPositions[adsets[i].id],
                        "Audience"
                      ) || [],
                    messenger_positions:
                      extractValuesByPartialLabel(
                        selectedPositions[adsets[i].id],
                        "Messenger"
                      ) || [],
                    position: values.adsets[i].positions,
                    device_platforms: values.adsets[i].device_platforms,
                  }),
                  ...(values.adsets[i].Beneficiary
                    ? { beneficiary: values.adsets[i].Beneficiary }
                    : {}),
                  ...(values.adsets[i].Beneficiary
                    ? values.adsets[i].Payer ? { payer: values.adsets[i].Payer } : { payer: values.adsets[i].Beneficiary }
                    : {}),
                  buying_type: "AUCTION",
                  addlevel: addLevelData,
                };
                AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
              }

              multipleAccountsData.push(AllAdsetsData);
            }
          }
          else {
            let AllAdsetsData = {
              campaign_name: values.Name,
              Account_Number: account,
              Approval: "PENDING_APPROVAL",
              fbstatus: "No-Live",
              Category: selectedCategory,
              camapaignlevel: {
                createdby: session?.user?.name,
                Name: values.Name,
                Objectives: values.Objectives,
                Special_categories: values.Special_categories,
                ...(Array.isArray(values?.Special_categories)
                  ? { Special_categories_countries: values.countries }
                  : {}),
                Bid_strategy: values.Bid_strategy,
                Budget_type: budgetType,
                Daily_amount: parseFloat(values.Daily_amount) * 100,
                Status: values.Status,
                access_token: newImageHash.token,
                createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
              },
            };
            const onSuccess = (status, response) => {
              console.log("Upload success:", response);
            };

            const onError = (status, error) => {
              console.error("Upload error:", error);
            };

            for (let i = 0; i < values.adsets.length; i++) {
              let AdsetsData = {};

              const imagesHashArray = await customRequest(
                account,
                values.adsets[i],
                i,
                onSuccess,
                onError,
                adsets[i].id
              );
              const addLevelData = imagesHashArray.map((media, index) => {
                if (media.imag_hash) {
                  // This is an image
                  return {
                    id: uuidv4(),
                    AddName: `${values.adsets[i].AddName}_${index + 1}`,
                    filename: media.filename,
                    imag_hash: media.imag_hash,
                    page_id: page_id,
                    message: values.adsets[i].message,
                    headline: values.adsets[i].headline,
                    Description: values.adsets[i].Description,
                    Caption: values.adsets[i][account].Caption,
                    Website_URL: values.adsets[i][account].Website_URL,

                    // urlParameters: values.urlParameters
                  };
                } else if (media.videoid) {
                  // This is a video
                  return {
                    id: uuidv4(),
                    AddName: `${values.adsets[i].AddName}_${index + 1}`,
                    filename: media.filename,
                    videoid: media.videoid,
                    thambnailurl: media.thambnailurl,
                    page_id: page_id,
                    message: values.adsets[i].message,
                    headline: values.adsets[i].headline,
                    Description: values.adsets[i].Description,
                    Caption: values.adsets[i][account].Caption,
                    Website_URL: values.adsets[i][account].Website_URL,
                    // urlParameters: values.urlParameters
                  };
                }
              });
              AdsetsData[`adsetlevel_${i + 1}`] = {
                id: uuidv4(),
                AdsetName: values.adsets[i].AdsetName,
                Budget_type: budgetType,
                Daily_amount: values.adsets[i].DailyAdd_amount
                  ? parseFloat(values.adsets[i].DailyAdd_amount) * 100
                  : "",
                optimization_goal: values.adsets[i].optimization_goal,
                billing_event: values.adsets[i].billing_event,
                start_time: moment(values.adsets[i].DatePicker.$d)
                  .tz(newImageHash.timeZone)
                  .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
                ...(values.adsets[i].DatePickerEnd
                  ? {
                    end_time: moment(values.adsets[i].DatePickerEnd.$d)
                      .tz(newImageHash.timeZone)
                      .format("YYYY-MM-DDTHH:mm:ssZ"),
                  }
                  : {}),
                action_source: values.adsets[i].action_source,
                custom_event_type: values.adsets[i].custom_event_type,
                pixel_id: pixel_id,
                // bid_amount: values.adsets[i].bid_amount
                //   ? parseFloat(values.adsets[i].bid_amount) * 100
                //   : 0,
                bid_amount: values.adsets[i].bid_amount
                  ? Math.round(Number(values.adsets[i].bid_amount) * 100)
                  : 0,
                countries: values.adsets[i].countries,
                Min_Age: values.adsets[i].Min_Age,
                Max_Age: values.adsets[i].Max_Age,
                Gender: parseInt(values.adsets[i].Gender),
                locales: values.adsets[i].Language,
                placements: values.adsets[i].placements,
                ...(values.adsets[i].placements !== "Advance" && {
                  publisher_platforms: values.adsets[i].platforms,
                  Facebook_positions:
                    extractValuesByPartialLabel(
                      selectedPositions[adsets[i].id],
                      "Facebook"
                    ) || [],
                  instagram_positions:
                    extractValuesByPartialLabel(
                      selectedPositions[adsets[i].id],
                      "Instagram"
                    ) || [],
                  audience_network_positions:
                    extractValuesByPartialLabel(
                      selectedPositions[adsets[i].id],
                      "Audience"
                    ) || [],
                  messenger_positions:
                    extractValuesByPartialLabel(
                      selectedPositions[adsets[i].id],
                      "Messenger"
                    ) || [],
                  position: values.adsets[i].positions,
                  device_platforms: values.adsets[i].device_platforms,
                }),
                ...(values.adsets[i].Beneficiary
                  ? { beneficiary: values.adsets[i].Beneficiary }
                  : {}),
                ...(values.adsets[i].Beneficiary
                  ? values.adsets[i].Payer ? { payer: values.adsets[i].Payer } : { payer: values.adsets[i].Beneficiary }
                  : {}),
                buying_type: "AUCTION",
                addlevel: addLevelData,
              };
              AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
            }

            multipleAccountsData.push(AllAdsetsData);
          }


          //45
        }
      }


      // //12
      // // console.log("page_id", account, page_id[page_id.length - 1].trim());
      // // console.log("pixel_id", account, pixel_id[pixel_id.length - 1].trim());
      // let AllAdsetsData = {
      //   campaign_name: values.Name,
      //   Account_Number: account,
      //   Approval: "PENDING_APPROVAL",
      //   fbstatus: "No-Live",
      //   Category: selectedCategory,
      //   camapaignlevel: {
      //     createdby: session?.user?.name,
      //     Name: values.Name,
      //     Objectives: values.Objectives,
      //     Special_categories: values.Special_categories,
      //     ...(Array.isArray(values?.Special_categories)
      //       ? { Special_categories_countries: values.countries }
      //       : {}),
      //     Bid_strategy: values.Bid_strategy,
      //     Budget_type: budgetType,
      //     Daily_amount: parseFloat(values.Daily_amount) * 100,
      //     Status: values.Status,
      //     access_token: newImageHash.token,
      //     createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
      //   },
      // };
      // const onSuccess = (status, response) => {
      //   console.log("Upload success:", response);
      // };

      // const onError = (status, error) => {
      //   console.error("Upload error:", error);
      // };

      // for (let i = 0; i < values.adsets.length; i++) {
      //   let AdsetsData = {};

      //   const imagesHashArray = await customRequest(
      //     account,
      //     values.adsets[i],
      //     i,
      //     onSuccess,
      //     onError,
      //     adsets[i].id
      //   );
      //   const addLevelData = imagesHashArray.map((media, index) => {
      //     if (media.imag_hash) {
      //       // This is an image
      //       return {
      //         id: uuidv4(),
      //         AddName: `${values.adsets[i].AddName}_${index + 1}`,
      //         filename: media.filename,
      //         imag_hash: media.imag_hash,
      //         page_id: newPageId,
      //         message: values.adsets[i].message,
      //         headline: values.adsets[i].headline,
      //         Description: values.adsets[i].Description,
      //         Caption: values.adsets[i][account].Caption,
      //         Website_URL: values.adsets[i][account].Website_URL,

      //         // urlParameters: values.urlParameters
      //       };
      //     } else if (media.videoid) {
      //       // This is a video
      //       return {
      //         id: uuidv4(),
      //         AddName: `${values.adsets[i].AddName}_${index + 1}`,
      //         filename: media.filename,
      //         videoid: media.videoid,
      //         thambnailurl: media.thambnailurl,
      //         page_id: newPageId,
      //         message: values.adsets[i].message,
      //         headline: values.adsets[i].headline,
      //         Description: values.adsets[i].Description,
      //         Caption: values.adsets[i][account].Caption,
      //         Website_URL: values.adsets[i][account].Website_URL,
      //         // urlParameters: values.urlParameters
      //       };
      //     }
      //   });
      //   AdsetsData[`adsetlevel_${i + 1}`] = {
      //     id: uuidv4(),
      //     AdsetName: values.adsets[i].AdsetName,
      //     Budget_type: budgetType,
      //     Daily_amount: values.adsets[i].DailyAdd_amount
      //       ? parseFloat(values.adsets[i].DailyAdd_amount) * 100
      //       : "",
      //     optimization_goal: values.adsets[i].optimization_goal,
      //     billing_event: values.adsets[i].billing_event,
      //     start_time: moment(values.adsets[i].DatePicker.$d)
      //       .tz(newImageHash.timeZone)
      //       .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
      //     ...(values.adsets[i].DatePickerEnd
      //       ? {
      //         end_time: moment(values.adsets[i].DatePickerEnd.$d)
      //           .tz(newImageHash.timeZone)
      //           .format("YYYY-MM-DDTHH:mm:ssZ"),
      //       }
      //       : {}),
      //     action_source: values.adsets[i].action_source,
      //     custom_event_type: values.adsets[i].custom_event_type,
      //     pixel_id: newPixelId,
      //     // bid_amount: values.adsets[i].bid_amount
      //     //   ? parseFloat(values.adsets[i].bid_amount) * 100
      //     //   : 0,
      //     bid_amount: values.adsets[i].bid_amount
      //       ? Math.round(Number(values.adsets[i].bid_amount) * 100)
      //       : 0,
      //     countries: values.adsets[i].countries,
      //     Min_Age: values.adsets[i].Min_Age,
      //     Max_Age: values.adsets[i].Max_Age,
      //     Gender: parseInt(values.adsets[i].Gender),
      //     locales: values.adsets[i].Language,
      //     placements: values.adsets[i].placements,
      //     ...(values.adsets[i].placements !== "Advance" && {
      //       publisher_platforms: values.adsets[i].platforms,
      //       Facebook_positions:
      //         extractValuesByPartialLabel(
      //           selectedPositions[adsets[i].id],
      //           "Facebook"
      //         ) || [],
      //       instagram_positions:
      //         extractValuesByPartialLabel(
      //           selectedPositions[adsets[i].id],
      //           "Instagram"
      //         ) || [],
      //       audience_network_positions:
      //         extractValuesByPartialLabel(
      //           selectedPositions[adsets[i].id],
      //           "Audience"
      //         ) || [],
      //       messenger_positions:
      //         extractValuesByPartialLabel(
      //           selectedPositions[adsets[i].id],
      //           "Messenger"
      //         ) || [],
      //       position: values.adsets[i].positions,
      //       device_platforms: values.adsets[i].device_platforms,
      //     }),
      //     ...(values.adsets[i].Beneficiary
      //       ? { beneficiary: values.adsets[i].Beneficiary }
      //       : {}),
      //     ...(values.adsets[i].Beneficiary
      //       ? values.adsets[i].Payer ? { payer: values.adsets[i].Payer } : { payer: values.adsets[i].Beneficiary }
      //       : {}),
      //     buying_type: "AUCTION",
      //     addlevel: addLevelData,
      //   };
      //   AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
      // }

      // multipleAccountsData.push(AllAdsetsData);

      // //45
    }


    return multipleAccountsData;
  };

  const MultipleAdsetsDraftFetching = async (values) => {
    const multipleAccounts = values.Account_Number;

    const multipleAccountsData = [];
    for (let account of multipleAccounts) {
      const newImageHash = imageHashArray.find(item => item.accountNumber === account);
      const list_of_page_id = values.page_id;
      const list_of_pixel_id = values.pixel_id;
      const page_id = list_of_page_id.find(item => item.includes(account)).split("-");
      const pixel_id = list_of_pixel_id.find(item => item.includes(account)).split("-");
      const newPageId = page_id[page_id.length - 1].trim();
      const newPixelId = pixel_id[pixel_id.length - 1].trim();

      let AllAdsetsData = {
        // id: uuidv4(),
        // Draft_Name:"",
        Account_Number: account,
        createdby: session?.user?.name,
        createdDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        editedDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        camapaignlevel: {
          // createdby: session?.user?.name,
          Name: values.Name || "",
          Objectives: values.Objectives || "",
          Special_categories: values.Special_categories || "NONE",
          ...(Array.isArray(values?.Special_categories)
            ? { Special_categories_countries: values.countries }
            : {}),
          Bid_strategy: values.Bid_strategy,
          Daily_amount: parseFloat(values.Daily_amount) * 100 || 0,
          Status: values.Status,
          // access_token: imagehash.token,
          createdDate: moment().tz(imagehash.timeZone).format("YYYY-MM-DD"),
        },
      };
      const onSuccess = (status, response) => {
        console.log("Upload success:", response);
      };

      const onError = (status, error) => {
        console.error("Upload error:", error);
      };

      console.log("Adsets:", values);

      for (let i = 0; i < values.adsets.length; i++) {
        let AdsetsData = {};

        const imageHashArray = await customRequest(
          account,
          values.adsets[i],
          i,
          onSuccess,
          onError,
          adsets[i].id
        );
        console.log("Image Hash Array:", imageHashArray);
        const adsetAccountData = values.adsets[i][account] || {};
        const addLevelData =
          imageHashArray && imageHashArray.length > 0
            ? {
              AddName: `${values.adsets[i].AddName}` || "",
              // filename: media.filename,
              // imag_hash: media.imag_hash,
              Ads: imageHashArray.map((media) => media.filename),
              page_id: newPageId,
              message: values.adsets[i].message,
              headline: values.adsets[i].headline,
              Description: values.adsets[i].Description,
              Caption: adsetAccountData.Caption,
              Website_URL: adsetAccountData.Website_URL,
            }
            : {
              AddName: `${values.adsets[i].AddName}` || "",
              Ads: [],
              page_id: newPageId || "",
              message: values.adsets[i].message || "",
              headline: values.adsets[i].headline || "",
              Description: values.adsets[i].Description || "",
              Caption: adsetAccountData.Caption || "",
              Website_URL: adsetAccountData.Website_URL || "",
            };
        console.log("Add Level Data:", addLevelData);
        AdsetsData[`adsetlevel_${i + 1}`] = {
          id: uuidv4(),
          AdsetName: values.adsets[i].AdsetName || "",
          Daily_amount: values.adsets[i].DailyAdd_amount
            ? parseFloat(values.adsets[i].DailyAdd_amount) * 100
            : "",
          optimization_goal: values.adsets[i].optimization_goal || "",
          billing_event: values.adsets[i].billing_event || "",
          // start_time: moment(values.adsets[i].DatePicker.$d)
          //   .tz(imagehash.timeZone)
          //   .format("YYYY-MM-DDTHH:mm:ssZ"), 
          action_source: values.adsets[i].action_source || "",
          custom_event_type: values.adsets[i].custom_event_type || "",
          pixel_id: newPixelId,
          // bid_amount: values.adsets[i].bid_amount
          //   ? parseFloat(values.adsets[i].bid_amount) * 100
          //   : 0,
          bid_amount: values.adsets[i].bid_amount
            ? Math.round(Number(values.adsets[i].bid_amount) * 100)
            : 0,
          countries: values.adsets[i].countries || "",
          Min_Age: values.adsets[i].Min_Age || "",
          Max_Age: values.adsets[i].Max_Age || "",
          Gender: parseInt(values.adsets[i].Gender) || 0,
          locales: values.adsets[i].Language || [6],
          placements: values.adsets[i].placements || "Advance",
          ...(values.adsets[i].placements !== "Advance" && {
            publisher_platforms: values.adsets[i].platforms,
            Facebook_positions:
              extractValuesByPartialLabel(
                selectedPositions[adsets[i].id],
                "Facebook"
              ) || [],
            instagram_positions:
              extractValuesByPartialLabel(
                selectedPositions[adsets[i].id],
                "Instagram"
              ) || [],
            audience_network_positions:
              extractValuesByPartialLabel(
                selectedPositions[adsets[i].id],
                "Audience"
              ) || [],
            messenger_positions:
              extractValuesByPartialLabel(
                selectedPositions[adsets[i].id],
                "Messenger"
              ) || [],
            position: values.adsets[i].positions,
            device_platforms: values.adsets[i].device_platforms,
          }),
          buying_type: "AUCTION",
          addlevel: addLevelData || [],
        };
        AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
      }
      multipleAccountsData.push(AllAdsetsData);
    }

    return multipleAccountsData;
  };

  const postData = async (values) => {
    console.log("Form Values:", values);
    setLoading(true); // Start the spinner
    try {
      console.log("Image Hashes before creating addlevel:", values.imageHashes);

      const addLevelData = values.imageHashes.map((media, index) => {
        if (media.imag_hash) {
          // This is an image
          return {
            id: uuidv4(),
            AddName: `${values.AddName}_${index + 1}`,
            filename: media.filename,
            imag_hash: media.imag_hash,
            page_id: values.page_id,
            message: values.message,
            headline: values.headline,
            Description: values.Description,
            Caption: values.Caption,
            Website_URL: values.Website_URL,

            // urlParameters: values.urlParameters
          };
        } else if (media.videoid) {
          // This is a video
          return {
            id: uuidv4(),
            AddName: `${values.AddName}_${index + 1}`,
            filename: media.filename,
            videoid: media.videoid,
            thambnailurl: media.thambnailurl,
            page_id: values.page_id,
            message: values.message,
            headline: values.headline,
            Description: values.Description,
            Caption: values.Caption,
            Website_URL: values.Website_URL,
            // urlParameters: values.urlParameters
          };
        }
      });

      let AdsetsData = {};

      // console.log("Add Level Data:", moment(values.DatePicker.$d).utc().format("YYYY-MM-DDTHH:mm:ssZ"),);

      const data1 = {
        campaign_name: values.Name,
        Account_Number: values.Account_Number,
        Approval: "PENDING_APPROVAL",
        fbstatus: "No-Live",
        ...(Object.keys(selectedRef.current).length > 0
          ? selectedRef.current
          : {}),
        camapaignlevel: {
          createdby: session?.user?.name,
          Name: values.Name,
          Objectives: values.Objectives,
          Special_categories: values.Special_categories,
          Bid_strategy: values.Bid_strategy,
          Daily_amount: parseFloat(values.Daily_amount) * 100,
          Status: values.Status,
          access_token: imagehash.token,
          createdDate: moment().tz(imagehash.timeZone).format("YYYY-MM-DD"),
        },
        adsetlevel: {
          AdsetName: values.AdsetName,
          Daily_amount: values.DailyAdd_amount
            ? parseFloat(values.DailyAdd_amount) * 100
            : "",
          optimization_goal: values.optimization_goal,
          billing_event: values.billing_event,
          start_time: moment(values.DatePicker.$d)
            .tz(imagehash.timeZone)
            .format("YYYY-MM-DDTHH:mm:ssZ"),
          action_source: values.action_source,
          custom_event_type: values.custom_event_type,
          pixel_id: values.pixel_id,
          bid_amount: values.bid_amount
            ? parseFloat(values.bid_amount) * 100
            : 0,
          countries: values.countries,
          Min_Age: values.Min_Age,
          Max_Age: values.Max_Age,
          Gender: parseInt(values.Gender),
          locales: values.Language,
          placements: values.placements,
          ...(values.placements !== "Advance" && {
            publisher_platforms: values.publisher_platforms,
            Facebook_positions:
              extractValuesByPartialLabel(selectedPositions, "Facebook") || [],
            instagram_positions:
              extractValuesByPartialLabel(selectedPositions, "Instagram") || [],
            audience_network_positions:
              extractValuesByPartialLabel(selectedPositions, "Audience") || [],
            messenger_positions:
              extractValuesByPartialLabel(selectedPositions, "Messenger") || [],
            position: values.positions,
            device_platforms: values.device_platforms,
          }),
          buying_type: "AUCTION",
        },
        addlevel: addLevelData,
      };

      // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Facebook'));

      // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Instagram'));

      // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Messenger'));

      // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Audience'));

      // console.log("selectedPositions:", selectedPositions);

      console.log("Final Data to Submit:", data1);
      // https://www.testapi.adsgoat.in
      const response = await fetch(
        "https://www.testapi.adsgoat.in/api/submitFormData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(data1),
        }
      );

      if (response.ok) {
        console.log("Form data submitted successfully");
        setSelectedFilesFromCreatives({});
        setSelectedFilesFromMedia({});
        setSelectedFiles({});
        onClose();
        setSelectedPositions({});
        isManual !== "manual" && setIsManual(false);
        newSelectedRef.current = null; // Reset the newSelectedRef
      } else {
        console.error("Failed to submit form data");
      }
    } catch (error) {
      console.error("Error submitting form data:", error);
    } finally {
      setLoading(false); // Stop the spinner after the process is complete
    }
  };

  console.log("test:");

  const handleChange = (info) => {
    const newFiles = info.fileList.map((file) => ({
      ...file,
      uid: file.uid || `-${Date.now()}`,
      source: "media",
    }));

    setSelectedFiles((prev) => {
      const existingUids = new Set(prev.map((f) => f.uid));
      const filteredNewFiles = newFiles.filter((f) => !existingUids.has(f.uid));
      return [...prev, ...filteredNewFiles];
    });

    // 👇 Update selectedFilesFromMedia — preserve + append
    setSelectedFilesFromMedia((prev) => {
      const existingUids = new Set(prev.map((f) => f.uid));
      const filteredNewFiles = newFiles.filter((f) => !existingUids.has(f.uid));
      return [...prev, ...filteredNewFiles];
    });
  };

  const currentDate = dayjs();
  console.log(moment(), "currentDate");
  // let initialValues = {
  //     Status: "PAUSED",
  //     // Objectives: "OUTCOME_LEADS",
  //     Special_categories: "NONE",
  //     Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
  //     Status: "PAUSED",
  //     DatePicker: currentDate,
  //     optimization_goal: "OFFSITE_CONVERSIONS",
  //     billing_event: "IMPRESSIONS",
  //     action_source: "website",
  //     custom_event_type: "LEAD",
  //     countries: "US",
  //     Min_Age: "18",
  //     Max_Age: "65",
  //     Gender: "0",
  //     positions: [],
  //     publisher_platforms: [],
  //     Account_Number: accountis == "All" ? '' : accountis,
  //     Language: [6],
  //     Website_URL: websiteURL,
  //     placements: "Advance",
  //     DailyAdd_amount: adsetLevelDailyBudget,
  //     Description: "Find More",
  //     Caption: caption,
  //     Name: campaignName,
  //     AdsetName: campaignName,
  //     AddName: campaignName,
  //     pixel_id: imagehash?.pixelID,
  //     page_id: imagehash?.pageID

  //     // AddName:
  //     // device_platforms: "mobile",

  // };

  // const initialValues = {
  //     Status: "PAUSED",
  //     Special_categories: "NONE",
  //     Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
  //     DatePicker: currentDate,
  //     Account_Number: accountis === "All" ? '' : accountis,
  //     Website_URL: websiteURL,
  //     Name: campaignName,
  //     Caption: caption,
  //     pixel_id: imagehash?.pixelID,
  //     page_id: imagehash?.pageID,

  //     adsets: [
  //       {
  //         AdsetName: campaignName,
  //         optimization_goal: "OFFSITE_CONVERSIONS",
  //         billing_event: "IMPRESSIONS",
  //         action_source: "website",
  //         custom_event_type: "LEAD",
  //         countries: "US",
  //         Min_Age: "18",
  //         Max_Age: "65",
  //         Gender: "0",
  //         Language: [6],
  //         placements: "Advance",
  //         DailyAdd_amount: adsetLevelDailyBudget,
  //         AddName: campaignName,
  //         Description: "Find More",
  //         headline: "",
  //         message: "",
  //         MediaContent: [],
  //         positions: [],
  //         publisher_platforms: [],
  //         device_platforms: ["mobile"]
  //       }
  //     ]
  // };

  // const getDefaultAdset = () => ({
  //     id: uuidv4(), // or use: Date.now() as fallback
  //     AdsetName: campaignName,
  //     optimization_goal: "OFFSITE_CONVERSIONS",
  //     billing_event: "IMPRESSIONS",
  //     action_source: "website",
  //     custom_event_type: "LEAD",
  //     countries: "US",
  //     Min_Age: "18",
  //     Max_Age: "65",
  //     Gender: "0",
  //     Language: [6],
  //     placements: "Advance",

  //     DailyAdd_amount: 0,
  //     AddName: campaignName,
  //     Description: "Find More",
  //     Caption: caption,
  //     Website_URL: websiteURL,
  //     pixel_id: imagehash?.pixelID,
  //     page_id: imagehash?.pageID,
  //     MediaContent: [],
  //     device_platforms: ["mobile"],
  //     DatePicker: currentDate,
  //     headline: "",
  //     message: ""
  // });

  const initialValues = {
    Status: "PAUSED",
    Special_categories: "NONE",
    Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    Account_Number: accountis === "All" ? "" : accountNumber,
    Daily_amount: 0, // Initial daily budget for the campaign
    // adsets: adsets,
    // Name: campaignName,
    // adsets: [
    //   getDefaultAdset(
    //     campaignName,
    //     caption,
    //     websiteURL,
    //     imagehash,
    //     currentDate
    //   ),
    // ], // 🔁 only one initial adset
  };

  useEffect(() => {
    // Update the form fields when accountis changes
    form.setFieldsValue({ Account_Number: accountis });
  }, [accountis, form]);

  const handleDrawerClose = () => {
    form.resetFields(); // Reset form fields to their initialValues
    setWebsiteURL(""); // Clear website URL
    setSelectedFiles({}); // Clear selected files
    setCampaignName(""); // Clear campaign name
    setPrimaryText(""); // Clear primary text field
    setCaption(""); // Clear caption field
    setHeadline(""); // Clear headline field
    setDescription(""); // Clear description field
    setSelectedPublishers({}); // Clear selected publishers
    setSelectedPositions({}); // Clear selected positions
    setIsFormComplete(false); // Reset form completion state
    setCampaignName("");
    setAddName("");
    setCampaignLevelDailyBudget(0); // Reset campaign level daily budget
    setAdsetLevelDailyBudget(0);
    // setCampaignLevelDailyBudget(0);
    setAdsets([
      { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "ADSET 1" },
    ]);
    onClose(); // Call onClose handler to close the drawer
    setActiveKey(["1"]);
    isManual !== "manual" && setIsManual(false);
    setSelectedPositions({}); // Clear selected positions
    newSelectedRef.current = null;
    setSelectedFilesFromCreatives({}); // Clear selected files from creatives
    setSelectedFilesFromMedia({}); // Clear selected files from media
    setSelectedFiles({}); // Clear all selected files
    setShowBidAmount(false); // Reset showBidAmount state




    // 4) Clear draft/template-related UI
    selectedRef.current = null;
    newSelectedRef.current = null;
    setPopupInputs({ input1: "", input2: "" });   // clear Category + Template Name
    setSubmitErrors([]);
    setErrors?.({ input1: "", input2: "" });      // if you keep field errors in state
    setIsEditingDraft?.(false);
    setSelectedTemplate(null);
    setGeos("Geo");
    setPages("Page");
    setPixels("Pixel");
  };

  const [selectedOption, setSelectedOption] = useState("upload");

  const handleSelectChange = (value) => {
    setSelectedOption(value);
  };

  const onClickCreativesDrawer = (index) => {
    console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
    setCreativeIndex(index);
  };

  // const selectedFilesData = (data) => {
  //     console.log("Selected Files Data:", data);
  //     setSelectedFiles(prev => [...prev, ...data.map((file, index)=>{
  //         return({
  //             uid: file.uid || `-${index+1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //             url: file?.url,
  //         })
  //     })]);
  //     setSelectedFilesFromCreatives(prev => [...prev, ...data.map((file, index)=>{
  //         return({
  //             uid: file.uid || `-${index+1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //             url: file?.url,
  //         })
  //     })]);
  //     setOpenCreativesDrawer(false);

  //     if (data.length > 0) {
  //         const currentMediaContent = form.getFieldValue("MediaContent") || [];

  //         const newFiles = data.map((file, index) => ({
  //             uid: file.uid || `-${index + 1}`,
  //             name: file?.name,
  //             status: 'done',
  //             type: file?.url?.endsWith(".jpg")
  //                 ? "image/jpg"
  //                 : file?.url?.endsWith(".jpeg")
  //                 ? "image/jpeg"
  //                 : file?.url?.endsWith(".png")
  //                 ? "image/png"
  //                 : "video/",
  //             url: file?.url,
  //         }));

  //         const updatedMediaContent = [...currentMediaContent, ...newFiles];

  //         form.setFieldsValue({ MediaContent: updatedMediaContent });
  //         form.validateFields(["MediaContent"]);
  //     }
  // }

  // const selectedFilesData = (data) => {
  //     // const index = 0; // hardcoded for now as you requested

  //     const mappedFiles = data.map((file, i) => ({
  //       uid: file.uid || `-${Date.now()}-${i}`,
  //       name: file?.name,
  //       status: 'done',
  //       type: file?.url?.endsWith(".jpg")
  //         ? "image/jpg"
  //         : file?.url?.endsWith(".jpeg")
  //         ? "image/jpeg"
  //         : file?.url?.endsWith(".png")
  //         ? "image/png"
  //         : "video/",
  //       url: file?.url,
  //     }));

  //     // ✅ Update selectedFiles as object by index
  //     setSelectedFiles((prev) => {
  //       const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
  //       return { ...prev, [creativeIndex]: updated };
  //     });

  //     // ✅ Update selectedFilesFromCreatives as object by creativeIndex
  //     setSelectedFilesFromCreatives((prev) => {
  //       const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
  //       return { ...prev, [creativeIndex]: updated };
  //     });

  //     // ✅ Close creative drawer
  //     setOpenCreativesDrawer(false);

  //     // ✅ Update form MediaContent for adset[0]
  //     const currentMediaContent = form.getFieldValue(['adsets', creativeIndex, 'MediaContent']) || [];
  //     const updatedMediaContent = [...currentMediaContent, ...mappedFiles];

  //     form.setFieldsValue({
  //       adsets: {
  //         [creativeIndex]: {
  //           MediaContent: updatedMediaContent
  //         }
  //       }
  //     });

  //     form.validateFields([['adsets', creativeIndex, 'MediaContent']]);
  // };


  const selectedFilesData = (data) => {
    const mappedFiles = data.map((file, i) => ({
      uid: file.uid || `-${Date.now()}-${i}`,
      name: file?.name,
      status: "done",
      type: file?.url?.endsWith(".jpg")
        ? "image/jpg"
        : file?.url?.endsWith(".jpeg")
          ? "image/jpeg"
          : file?.url?.endsWith(".png")
            ? "image/png"
            : "video/",
      url: file?.url,
    }));

    // ✅ Update selectedFiles
    setSelectedFiles((prev) => {
      const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
      updateAdMediaData(creativeIndex, updated); // ✅ Call here too
      return { ...prev, [creativeIndex]: updated };
    });

    // ✅ Update selectedFilesFromCreatives
    setSelectedFilesFromCreatives((prev) => {
      const updated = [...(prev[creativeIndex] || []), ...mappedFiles];
      return { ...prev, [creativeIndex]: updated };
    });

    // ✅ Close drawer
    setOpenCreativesDrawer(false);

    // ✅ Update Form MediaContent
    const currentMediaContent =
      form.getFieldValue(["adsets", creativeIndex, "MediaContent"]) || [];
    const updatedMediaContent = [...currentMediaContent, ...mappedFiles];

    form.setFieldsValue({
      adsets: {
        [creativeIndex]: {
          MediaContent: updatedMediaContent,
        },
      },
    });

    form.validateFields([["adsets", creativeIndex, "MediaContent"]]);
  };

  console.log("Selected Files:", selectedFiles);

  const handleRemoveFile = (uidToRemove) => {
    setSelectedFilesFromCreatives((prev) =>
      prev.filter((file) => file.uid !== uidToRemove)
    );
    setSelectedFiles((prev) => prev.filter((file) => file.uid !== uidToRemove));
  };

  const handleRemove = (fileToRemove) => {
    setSelectedFilesFromMedia((prev) =>
      prev.filter((file) => file.uid !== fileToRemove.uid)
    );
    setSelectedFiles((prev) =>
      prev.filter((file) => file.uid !== fileToRemove.uid)
    );
  };

  // const setFormValuesFromDraft = (draft) => {
  //     form.setFieldsValue({
  //         positions: draft?.adsetlevel?.position || [],
  //         // Account_Number: draft?.Account_Number,
  //         // createdby:draft?.camapaignlevel?.createdby,
  //         Name: draft?.camapaignlevel?.Name,
  //         Objectives: draft?.camapaignlevel?.Objectives,
  //         Special_categories: draft?.camapaignlevel?.Special_categories,
  //         Bid_strategy: draft?.camapaignlevel?.Bid_strategy,
  //         Daily_amount: (draft?.camapaignlevel?.Daily_amount) / 100,
  //         Status: draft?.camapaignlevel?.Status,
  //         AdsetName: draft?.adsetlevel?.AdsetName,
  //         DailyAdd_amount: draft?.adsetlevel?.Daily_amount ? (draft?.adsetlevel?.Daily_amount) / 100 : 0,
  //         optimization_goal: draft?.adsetlevel?.optimization_goal,
  //         billing_event: draft?.adsetlevel?.billing_event,
  //         // start_time: draft?.adsetlevel?.start_time,
  //         action_source: draft?.adsetlevel?.action_source,
  //         custom_event_type: draft?.adsetlevel?.custom_event_type,
  //         // pixel_id: draft?.adsetlevel?.pixel_id,
  //         bid_amount: (draft?.adsetlevel?.bid_amount) / 100,
  //         countries: draft?.adsetlevel?.countries,
  //         Min_Age: draft?.adsetlevel?.Min_Age,
  //         Max_Age: draft?.adsetlevel?.Max_Age,
  //         Gender: draft?.adsetlevel?.Gender,
  //         publisher_platforms: draft?.adsetlevel?.publisher_platforms ? draft?.adsetlevel?.publisher_platforms : null,
  //         device_platforms: draft?.adsetlevel?.device_platforms ? draft?.adsetlevel?.device_platforms : null,
  //         Language: draft?.adsetlevel?.locales,
  //         placements: draft?.adsetlevel?.placements,
  //         // Facebook_positions: draft?.adsetlevel?.Facebook_positions,
  //         // buying_type: draft?.adsetlevel?.buying_type,
  //         AddName: draft?.addlevel?.AddName,
  //         filename: draft?.addlevel?.filename,
  //         // page_id: draft?.addlevel?.page_id,
  //         message: draft?.addlevel?.message,
  //         headline: draft?.addlevel?.headline,
  //         Description: draft?.addlevel?.Description || "Find More",
  //         Caption: draft?.addlevel?.Caption,
  //         Website_URL: draft?.addlevel?.Website_URL,
  //         Caption: draft?.addlevel?.Caption,
  //         // pixel_id: draft?.addlevel[0]?.pixel_id,
  //         // page_id: draft?.addlevel[0]?.page_id,
  //         MediaContent: (draft?.addlevel?.ads)
  //     });
  //     // draft?.camapaignlevel?.Daily_amount && setCampaignLevelDailyBudget((draft?.camapaignlevel?.Daily_amount) / 100);
  //     draft?.adsetlevel?.Daily_amount && setAdsetLevelDailyBudget((draft?.adsetlevel?.Daily_amount) / 100);
  //     // draft?.adsetlevel?.bid_amount && setShowBidAmount(true);
  //     console.log(draft?.camapaignlevel?.Bid_strategy);
  //     draft?.camapaignlevel?.Bid_strategy !== "LOWEST_COST_WITHOUT_CAP" && setShowBidAmount(true);
  //     draft?.camapaignlevel?.Bid_strategy === "LOWEST_COST_WITHOUT_CAP" && setShowBidAmount(false);
  //     // setSelectedPositions(getPositionsByKeys(draft?.adsetlevel?.position || {}));
  //     console.log("Selected Positions:", draft?.adsetlevel?.position || []);
  //     console.log("Selected Positions:", getPositionsByKeys(draft?.adsetlevel?.position || []));
  //     setAddName(draft?.addlevel?.AddName);
  //     setSelectedFilesFromCreatives(draft?.addlevel?.ads);
  //     setSelectedFiles(draft?.addlevel?.ads);
  //     setSelectedPublishers(draft?.adsetlevel?.publisher_platforms || []);
  //     setIsManual(draft?.adsetlevel?.placements === "manual" ? "manual" : false);
  //     draft?.addlevel?.ads?.length > 0 ? setSelectedOption("creative"): setSelectedOption("upload");
  //     const checkFormCompletion = () => {
  //         const allValues = form.getFieldsValue(true);
  //         const isComplete = Object.keys(allValues).every(
  //             key => allValues[key] !== undefined && allValues[key] !== ''
  //         );
  //         setIsFormComplete(isComplete);
  //     };

  //     setSubmitErrors([]); // Reset submit errors when loading a draft

  //     // Trigger form completion check
  //     checkFormCompletion();
  // }

  // const setFormValuesFromDraft = (draft) => {
  //     if (!draft) return;

  //     const draftValues = {
  //       AdsetName: draft?.adsetlevel?.AdsetName,
  //       DailyAdd_amount: draft?.adsetlevel?.Daily_amount ? draft?.adsetlevel?.Daily_amount / 100 : 0,
  //       optimization_goal: draft?.adsetlevel?.optimization_goal,
  //       billing_event: draft?.adsetlevel?.billing_event,
  //       action_source: draft?.adsetlevel?.action_source,
  //       custom_event_type: draft?.adsetlevel?.custom_event_type,
  //       bid_amount: draft?.adsetlevel?.bid_amount / 100,
  //       countries: draft?.adsetlevel?.countries,
  //       Min_Age: draft?.adsetlevel?.Min_Age,
  //       Max_Age: draft?.adsetlevel?.Max_Age,
  //       Gender: draft?.adsetlevel?.Gender,
  //       platforms: draft?.adsetlevel?.publisher_platforms || [],
  //       device_platforms: draft?.adsetlevel?.device_platforms || [],
  //       Language: draft?.adsetlevel?.locales,
  //       placements: draft?.adsetlevel?.placements,
  //       position: draft?.adsetlevel?.position || [],
  //       AddName: draft?.addlevel?.AddName,
  //       filename: draft?.addlevel?.filename,
  //       message: draft?.addlevel?.message,
  //       headline: draft?.addlevel?.headline,
  //       Description: draft?.addlevel?.Description || "Find More",
  //       Caption: draft?.addlevel?.Caption,
  //       Website_URL: draft?.addlevel?.Website_URL,
  //       MediaContent: draft?.addlevel?.ads || [],
  //     };

  //     console.log("Draft Values:", draftValues);

  //     // Update each adset form item with draft values
  //     const currentAdsetsForm = form.getFieldValue('adsets') || [];

  //     const updatedFormAdsets = currentAdsetsForm.map(adset => ({
  //       ...adset,
  //       ...draftValues, // apply draft values to each adset
  //       DailyAdd_amount: draftValues.DailyAdd_amount,
  //     }));

  //     // Update form fields
  //     form.setFieldsValue({
  //       adsets: updatedFormAdsets,
  //       Name: draft?.camapaignlevel?.Name,
  //       Objectives: draft?.camapaignlevel?.Objectives,
  //       Special_categories: draft?.camapaignlevel?.Special_categories,
  //       Bid_strategy: draft?.camapaignlevel?.Bid_strategy,
  //       Daily_amount: draft?.camapaignlevel?.Daily_amount / 100,
  //       Status: draft?.camapaignlevel?.Status,
  //     });

  //     // Update states for each adset
  //     const updatedSelectedFiles = {};
  //     const updatedSelectedCreatives = {};
  //     const updatedSelectedPositions = {};
  //     const updatedSelectedPublishers = {};

  //     adsets.forEach(adset => {
  //       updatedSelectedFiles[adset.id] = draft?.addlevel?.ads || [];
  //       updatedSelectedCreatives[adset.id] = draft?.addlevel?.ads || [];
  //       updatedSelectedPositions[adset.id] = getPositionsByKeys(draft?.adsetlevel?.position || []);
  //       console.log("Draft Positions:", getPositionsByKeys(draft?.adsetlevel?.position || []));
  //       updatedSelectedPublishers[adset.id] = draft?.adsetlevel?.publisher_platforms || [];
  //     //   setSelectedPositions(prev => ({
  //     //     ...prev,
  //     //     [adset.id]: getPositionsByKeys(draft.adsetlevel.position || [])
  //     //   }));
  //     });

  //     console.log("Updated Selected Files:", updatedSelectedPositions);

  //     setSelectedFiles(updatedSelectedFiles);
  //     setSelectedFilesFromCreatives(updatedSelectedCreatives);
  //     setSelectedPositions((updatedSelectedPositions));
  //     setSelectedPublishers(updatedSelectedPublishers);

  //     setIsManual(draft?.adsetlevel?.placements === "manual" ? "manual" : false);
  //     setAddName(draft?.addlevel?.AddName);
  //     setSelectedOption(draft?.addlevel?.ads?.length > 0 ? "creative" : "upload");

  //     if (draft?.adsetlevel?.Daily_amount) {
  //       setAdsetLevelDailyBudget(draft?.adsetlevel?.Daily_amount / 100);
  //     }

  //     setShowBidAmount(draft?.camapaignlevel?.Bid_strategy !== "LOWEST_COST_WITHOUT_CAP");

  //     setAdsets((prevAdsets) =>
  //         prevAdsets.map((adset) => ({
  //           ...adset,
  //           ...(adset.hasOwnProperty('DailyAdd_amount') && {
  //             DailyAdd_amount: draft?.adsetlevel?.Daily_amount
  //               ? draft.adsetlevel.Daily_amount / 100
  //               : 0,
  //           }),
  //         }))
  //     );

  //     setSubmitErrors([]);

  //     const checkFormCompletion = () => {
  //       const allValues = form.getFieldsValue(true);
  //       const isComplete = Object.keys(allValues).every(
  //         key => allValues[key] !== undefined && allValues[key] !== ''
  //       );
  //       setIsFormComplete(isComplete);
  //     };

  //     checkFormCompletion();
  // };

  const objectiveOptions = [
    { value: "ALL", label: "All" },
    { value: "OUTCOME_LEADS", label: "Leads" },
    { value: "OUTCOME_SALES", label: "Sales" },
    { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
    { value: "OUTCOME_AWARENESS", label: "Awareness" },
    { value: "OUTCOME_TRAFFIC", label: "Traffic" },
    { value: "OUTCOME_APP_PROMOTION", label: "App promotion" },
  ];

  const objectiveLabels = Object.fromEntries(
    objectiveOptions.map((o) => [o.value, o.label])
  );

  const setFormValuesFromDraft = (draft) => {
    if (!draft) return;

    // 1. Extract adsetlevel_* blocks
    const adsetKeys = Object.keys(draft).filter((key) =>
      key.startsWith("adsetlevel_")
    );
    const adsetObjects = adsetKeys.map((key) => draft[key]);

    // 2. Update adsets state based on adsetlevel_* count
    setAdsets(
      adsetObjects.map((adsetObj, index) => ({
        id: adsetObj.id ?? uuidv4(),
        AdsetPanelName: `ADSET ${index + 1}`,
        DailyAdd_amount: adsetObj.Daily_amount
          ? adsetObj.Daily_amount / 100
          : 0,
      }))
    );

    // 3. Map adset form values
    const updatedFormAdsets = adsetObjects.map((adsetObj, index) => {
      const updatedAdset = {};
      accountis.forEach((account) => {
        updatedAdset[account] = {
          Website_URL: adsetObj.addlevel?.Website_URL || "",
          Caption: adsetObj.addlevel?.Caption || "",
        };
      });
      return {
        id: adsetObj.id ?? uuidv4(),
        AdsetPanelName: `ADSET ${index + 1}`,
        AdsetName: adsetObj.AdsetName,
        DailyAdd_amount: adsetObj.Daily_amount ? adsetObj.Daily_amount / 100 : 0,
        optimization_goal: adsetObj.optimization_goal,
        billing_event: adsetObj.billing_event,
        action_source: adsetObj.action_source,
        custom_event_type: adsetObj.custom_event_type,
        bid_amount: adsetObj.bid_amount / 100,
        countries: adsetObj.countries,
        Min_Age: adsetObj.Min_Age,
        Max_Age: adsetObj.Max_Age,
        Gender: adsetObj.Gender,
        platforms: adsetObj.publisher_platforms || [],
        device_platforms: adsetObj.device_platforms || [],
        Language: adsetObj.locales,
        placements: adsetObj.placements,
        position: adsetObj.position || [],
        AddName: adsetObj.addlevel?.AddName,
        filename: adsetObj.addlevel?.filename,
        message: adsetObj.addlevel?.message,
        headline: adsetObj.addlevel?.headline,
        Description: adsetObj.addlevel?.Description || "Find More",
        ...updatedAdset,
        // Caption: adsetObj.addlevel?.Caption,
        // Website_URL: adsetObj.addlevel?.Website_URL,
        MediaContent: adsetObj.addlevel?.Ads || [],
      };
    });

    // 4. Update the form fields
    form.setFieldsValue({
      adsets: updatedFormAdsets,
      Name: draft?.camapaignlevel?.Name,
      Objectives: draft?.camapaignlevel?.Objectives,
      Special_categories: draft?.camapaignlevel?.Special_categories,
      ...(Array.isArray(draft.camapaignlevel.Special_categories) && draft.camapaignlevel.Special_categories_countries
        ? { countries: draft.camapaignlevel.Special_categories_countries }
        : {}),
      Bid_strategy: draft?.camapaignlevel?.Bid_strategy,
      Daily_amount: draft?.camapaignlevel?.Daily_amount / 100,
      Status: draft?.camapaignlevel?.Status,
    });

    // 5. Update per-adset supporting states
    const updatedSelectedFiles = {};
    const updatedSelectedCreatives = {};
    const updatedSelectedPositions = {};
    const updatedSelectedPublishers = {};

    // const mapped = (data) => ({
    //    const i = {uid: file.uid || `-${Date.now()}-${i}`,
    //     name: file?.name,
    //     status: 'done',
    //     type: file?.url?.endsWith(".jpg") ? "image/jpg" :
    //           file?.url?.endsWith(".jpeg") ? "image/jpeg" :
    //           file?.url?.endsWith(".png") ? "image/png" : "video/",
    //     url: file?.url,}
    //     return "";
    // });
    const mapped = (data) =>
      data.map((file, i) => ({
        uid: `-${Date.now()}-${i}`,
        name: file,
        status: "done",
        type: file?.endsWith(".jpg")
          ? "image/jpg"
          : file?.endsWith(".jpeg")
            ? "image/jpeg"
            : file?.endsWith(".png")
              ? "image/png"
              : "video/",
        url: file,
      }));

    adsetObjects.forEach((adsetObj) => {
      const uuid = adsetObj.id ?? uuidv4();

      updatedSelectedFiles[uuid] = adsetObj.addlevel?.Ads
        ? mapped(adsetObj.addlevel?.Ads)
        : [];
      updatedSelectedCreatives[uuid] = adsetObj.addlevel?.Ads
        ? mapped(adsetObj.addlevel?.Ads)
        : [];
      updatedSelectedPositions[uuid] = getPositionsByKeys(
        adsetObj.position || []
      );
      updatedSelectedPublishers[uuid] = adsetObj.publisher_platforms || [];
    });

    setSelectedFiles(updatedSelectedFiles);
    setSelectedFilesFromCreatives(updatedSelectedCreatives);
    setSelectedPositions(updatedSelectedPositions);
    setSelectedPublishers(updatedSelectedPublishers);

    setIsManual(
      draft?.adsetObjects?.[0]?.placements === "manual" ? "manual" : false
    );
    setAddName(adsetObjects[0]?.addlevel?.AddName || "");
    setSelectedOption(
      adsetObjects[0]?.addlevel?.Ads?.length > 0 ? "creative" : "upload"
    );

    if (draft?.adsetObjects?.[0]?.Daily_amount) {
      setAdsetLevelDailyBudget(draft.adsetObjects[0].Daily_amount / 100);
    }

    setShowBidAmount(
      draft?.camapaignlevel?.Bid_strategy !== "LOWEST_COST_WITHOUT_CAP"
    );
    setSubmitErrors([]);

    // 6. Final form completeness check
    const checkFormCompletion = () => {
      const allValues = form.getFieldsValue(true);
      const isComplete = Object.keys(allValues).every(
        (key) => allValues[key] !== undefined && allValues[key] !== ""
      );
      setIsFormComplete(isComplete);
    };

    checkFormCompletion();
  };
  const onChangeDraft = (value) => {
    const draft = draftsData.find(d => d.draftId === value);
    if (!draft) return;

    console.log("Selected Draft:", draft);
    setFormValuesFromDraft(draft);
    selectedRef.current = {
      Draft_Name: draft.Draft_Name,
      Draft_Id: draft.draftId,
      accountNumber: draft.Account_Number
    };

    newSelectedRef.current = draft.Draft_Name;

    setWebsiteURL("");
    setCaption("");
  };

  const newAccountNumbers = Array.isArray(accountis) ? accountis?.map(acc => ({ value: acc, label: acc })) : [];
  console.log("New Account Numbers:", newAccountNumbers);

  const getAccountDetails = (Account_Number) => {
    if (!Account_Number) return null;

    const matched = imageHashArray.find(
      (acc) => acc.accountNumber === Account_Number
    );

    return matched ? matched : null;
  };


  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span>Create a new campaign</span>
        </div>
      }
      className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
      dropdownClassName={theme === "dark" && "custom-dropdown"}
      open={visible}
      onCancel={handleDrawerClose}
      footer={null}
      centered
      width="85%"
      bodyStyle={{
        height: '80vh',
        overflowY: 'auto',
        padding: 10,
        backgroundColor: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
      }}
      style={{ borderRadius: '12px' }}
    >
      {/* <Button
        type="primary"
        style={{
          border: "1.5px solid #4caf50",
          borderRadius: "8px",
          marginBottom: "7px",
          marginLeft: "2px",
        }}
        onClick={() => setIsTemplatesModalOpen(true)}
      >
        Campaign Templates
      </Button> */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex' }}>
          <Button
            type="primary"
            style={{
              border: "1.5px solid #4caf50",
              borderRadius: "8px",
              marginBottom: "7px",
              marginLeft: "2px",
            }}
            onClick={() => setIsTemplatesModalOpen(true)}
          >
            Campaign Templates
          </Button>
          <div style={{ marginLeft: '20px' }}>
            <Select
              placeholder="Select report category"
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
              value={popupInputs.reportCat || undefined}
              optionLabelProp="value"
              onChange={(val) => {
                setPopupInputs(s => ({ ...s, reportCat: val }));
                if (errors.reportCat) setErrors((e) => ({ ...e, reportCat: "" }));
              }}
              showSearch
              filterOption={(input, option) =>
                (option?.name || "").toLowerCase().includes(input.toLowerCase())
              }
              options={reportCategories.map(c => ({
                value: `${c.name}`,
                name: c.name,
                id: c.categoryId,

                label: (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8

                  }}>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 200
                    }} title={`${c.name} - ${c.accountNumber}`}>
                      {c.name} - {c.accountNumber}
                    </span>
                    <span style={{ display: "flex", gap: 10 }}>
                      <FaPenToSquare
                        style={{ fontSize: 12 }}
                        title="Edit"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setRCurrentCategory(c);
                          setREditedName(c.name);
                          setREditModalVisible(true);
                        }}
                      />
                      <FaTrashCan
                        style={{ fontSize: 12, color: "#EC7117" }}
                        title="Delete"
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setRCurrentCategory(c);
                          setRDeleteModalVisible(true);
                        }}
                      />
                    </span>
                  </div>
                )
              }))}

              style={{ width: 240 }}
              dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #eee" }}>
                    <Input
                      size="small"
                      placeholder="New report category"
                      value={newReportCategory}
                      onChange={(e) => setNewReportCategory(e.target.value)}
                      onPressEnter={addReportCategory}
                      className={theme === "dark" ? "custom-input-dark" : "custom-input-light"}
                    />
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={addReportCategory}
                      style={{ backgroundColor: "#91c25f", border: "1px solid #4caf50" }}
                    />
                  </div>
                </div>
              )}
            />
            {errors.reportCat && <div style={{ color: "red", fontSize: 12 }}>{errors.reportCat}</div>}
          </div>

          <div style={{ marginLeft: '20px' }}>
            <Select
              value={budgetType}   // "daily" or "lifetime"
              onChange={(value) => setBudgetType(value)}
              // style={{ height: "20px" }}
              options={[
                { label: "Daily", value: "daily" },
                { label: "Lifetime", value: "lifetime" },
              ]}
            // disabled={watchedHasAdsetBudget} // if adset budget enabled, disable this
            // getPopupContainer={(triggerNode) => triggerNode.parentElement}
            />
          </div>
          <div style={{ marginLeft: '20px' }}>
            {selectedTemplate && (
              <div>
                <strong>Selected Template:</strong> {selectedTemplate.Draft_Name}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div>
            <Tooltip title={geo === "Geos" ? "Turn off to launch campaign in multiple geos at once" : "Turn on to launch campaign in individual geo"}
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Switch
                checked={geo === "Geos"}        // switch ON when "Geos"
                onChange={(checked) => setGeos(checked ? "Geos" : "Geo")}
                checkedChildren="Geos"
                unCheckedChildren="Geo"
                style={{
                  marginRight: "10px",
                  backgroundColor: geo === "Geos" ? "#91C25F" : "#d9d9d9",
                  color: "#fff"
                }}
              />
            </Tooltip>
          </div>

          <div>
            <Tooltip title="Turn on to launch campaigns in multiple Pixels"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Switch
                checked={pixel === "Pixels"}        // switch ON when "Geos"
                onChange={(checked) => setPixels(checked ? "Pixels" : "Pixel")}
                checkedChildren="Pixels"
                unCheckedChildren="Pixel"
                style={{
                  marginRight: "10px",
                  backgroundColor: pixel === "Pixels" ? "#91C25F" : "#d9d9d9",
                  color: "#fff"
                }}
              />
            </Tooltip>
          </div>

          <div>
            <Tooltip title="Turn on to launch campaigns in multiple Pages"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Switch
                checked={page === "Pages"}        // switch ON when "Pages"
                onChange={(checked) => setPages(checked ? "Pages" : "Page")}
                checkedChildren="Pages"
                unCheckedChildren="Page"
                style={{
                  marginRight: "10px",
                  backgroundColor: page === "Pages" ? "#91C25F" : "#d9d9d9",
                  color: "#fff"
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      <Modal
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
          }`}
        title="Campaign Templates"
        open={isTemplatesModalOpen}
        onCancel={() => setIsTemplatesModalOpen(false)}
        footer={null}
        width={900}

      >
        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
            className={
              theme === "dark"
                ? "custom-input-dark"
                : "custom-input-light"
            }
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ marginTop: -20 }}>Accounts</span>
            <Select
              placeholder="Filter by Accounts"
              value={selectedAccount}
              onChange={(value) => setSelectedAccount(value)}
              style={{ width: 200 }}
              options={[{ value: "ALL", label: "All Accounts" }, ...newAccountNumbers]}
              dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ marginTop: -20 }}>Objectives</span>
            <Select
              placeholder="Filter by Objective"
              value={selectedObjective}
              onChange={(value) => setSelectedObjective(value)}
              style={{ width: 200 }}
              options={objectiveOptions}
              dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
            />
          </div>
          {/* <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ marginTop: -20 }}>Categories</span>
            <Select
              placeholder="Filter by Category"
              value={selectedCategory || "ALL"}
              onChange={(value) => setSelectedCategory(value)}
              style={{ width: 200 }}
              options={categoryOptions}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </div> */}
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {groupedDrafts.map((draft) => {
            const cents = draft?.camapaignlevel?.Daily_amount ?? 0;
            const budget = (cents / 100).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            });
            console.log("Website URL:", draft?.adsetlevel_1?.addlevel?.Website_URL);
            console.log("Caption:", draft?.adsetlevel_1?.addlevel?.Caption);
            return (
              <div
                key={draft.draftId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  backgroundColor: theme === "dark" ? "#383737" : "#fff",
                  minWidth: 0,
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <p
                    title={draft.Draft_Name}
                    style={{
                      margin: 0,
                      flex: 1,
                      minWidth: 0,
                      fontSize: '14px',
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.25,
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {draft.Draft_Name}
                  </p>

                  <div style={{ display: "flex", gap: 10 }}>
                    <FaShareFromSquare
                      style={{ fontSize: 14, cursor: "pointer" }}
                      title="Share"
                      onClick={() => {
                        setSelectedDraftForShare(draft);
                        setShareTemplate(true);
                      }}
                    />
                    <FaPenToSquare
                      onClick={() => handleEditDraft(draft)}
                      style={{ fontSize: 14, cursor: "pointer" }}
                      title="Edit"
                    />
                    <FaTrashCan
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(draft.groupId);
                      }}
                      style={{ fontSize: 14, color: "#EC7117", cursor: "pointer" }}
                      title="Delete"
                    />
                  </div>
                </div>

                {/* Details grid: label left, value right with ellipsis */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    rowGap: 6,
                    columnGap: 12,
                    fontSize: '12px',
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {/* <span style={{ color: "#B4B4B4" }}>Account Number</span>
                  <div
                    style={{
                      textAlign: "right",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflowWrap: "anywhere",
                    }}
                  >

                    <div>{draft?.Account_Number ?? "-"}</div>
                    {getAccountDetails(draft?.Account_Number) && (
                      <div style={{
                        textAlign: "right",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflowWrap: "anywhere",
                      }}>
                        {getAccountDetails(draft?.Account_Number)?.accountName}
                      </div>
                    )}
                  </div> */}
                  {draft.accounts.length > 1 ? (<span style={{ color: "#B4B4B4" }}>Accounts</span>) : (<span style={{ color: "#B4B4B4" }}>Account</span>)}
                  {/* <span style={{ color: "#B4B4B4" }}>Account</span> */}
                  <div style={{ textAlign: "right" }}>
                    {draft.accounts.length > 1 ? (
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 250 }}>
                            {draft.accounts.map((acc) => {
                              const details = getAccountDetails(acc);
                              return (
                                <div
                                  key={acc}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 6,
                                    borderBottom: "1px solid #eee",
                                    padding: "2px 0",
                                  }}
                                >
                                  <span>{acc}</span>
                                  <span style={{ color: "#888" }}>{details?.accountName ?? "-"}</span>
                                </div>
                              );
                            })}
                          </div>
                        }
                        overlayInnerStyle={{
                          backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: "14px",
                        }}

                      >
                        {/* <MdOutlineNumbers
                          style={{ fontSize: 16, color: "#91c25f", cursor: "pointer" }}
                        /> */}
                        <span>Multiple Accounts</span>
                      </Tooltip>
                    ) : (
                      <div>
                        <div>{draft.accounts[0]}</div>
                        {getAccountDetails(draft.accounts[0]) && (
                          <div style={{ color: "#888", fontSize: 11 }}>
                            {getAccountDetails(draft.accounts[0])?.accountName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* <span style={{ color: "#B4B4B4" }}>Category</span>
                  <span
                    title={draft?.Category ?? "-"}
                    style={{
                      textAlign: "right",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {draft?.Category ?? "-"}

                  </span> */}

                  <span style={{ color: "#B4B4B4" }}>Objective</span>
                  <span
                    title={draft?.camapaignlevel?.Objectives ?? "-"}
                    style={{
                      textAlign: "right",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {draft?.camapaignlevel?.Objectives ?? "-"}
                  </span>

                  <span style={{ color: "#B4B4B4" }}>Budget</span>
                  <span
                    style={{
                      textAlign: "right",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${budget}/day
                  </span>
                </div>

                <Button
                  type="primary"
                  style={{ marginTop: "auto" }}
                  onClick={() => {
                    onChangeDraft(draft.draftId);
                    setSelectedTemplate(draft);
                    setIsTemplatesModalOpen(false);
                    setIsEditingDraft(false);
                    selectedRef.current = null;
                    newSelectedRef.current = "";
                    setPopupInputs({ input1: "", input2: "" });
                  }}
                >
                  Use This Template
                </Button>
              </div>
            );
          })}

          {filteredDrafts.length === 0 && (
            <p style={{ textAlign: "center", gridColumn: "1/-1", color: theme === "dark" ? "#fff" : "#999", }}>
              No templates found
            </p>
          )}
        </div>

      </Modal>
      {/* <Modal
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Are you sure you want to delete this draft?
          </span>
        }
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
        visible={deleteModal.visible}         // v4
        onOk={onConfirmDelete}
        onCancel={onCancelDelete}
        confirmLoading={deleting}
        okText="Yes, Delete"
        okType="primary"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>This action cannot be undone.</p>
      </Modal> */}
      <Modal
        title="Delete Draft"
        open={deleteModal.visible}
        onCancel={onCancelDelete}
        okText="Yes, Delete"
        cancelText="Close"
        confirmLoading={deleting}
        onOk={onConfirmDelete}
      >
        <p>This draft is present in these accounts:</p>
        <ul>
          {matchedAccounts.length > 0
            ? matchedAccounts.map((acc, idx) => <li key={idx}>{acc}</li>)
            : <li>No matching accounts found</li>
          }
        </ul>
        <p>Are you want delete this draft?</p>
      </Modal>
      <Modal
        title={`Share Template: ${selectedDraftForShare?.Draft_Name || ""}`}
        open={shareTemplate}
        onCancel={() => setShareTemplate(false)}
        onOk={handleShareDraft}
        okText="Share"
        cancelText="Close"
        confirmLoading={loading}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Project Select */}
          <Select
            showSearch
            placeholder="Select Projects"
            style={{ width: '100%' }}
            onChange={handleKeyChange}
            value={selectedKey}
            dropdownClassName={theme === "dark" && "custom-dropdown"}
            className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          {/* Account Select with checkboxes */}
          <Select
            showSearch
            onSearch={setSearchText}
            searchValue={searchText}
            placeholder="Select Account"
            open={isOpen}
            onDropdownVisibleChange={setIsOpen}
            value={
              selectedValue.length === 0
                ? undefined
                : selectedValue.length === 1
                  ? selectedValue[0]
                  : `${selectedValue[0]}, +${selectedValue.length - 1} more`
            }
            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
            style={{
              width: '100%',
              whiteSpace: 'nowrap',
              color: theme === 'dark' ? 'white' : undefined,
              border: '1px solid #4CAF50',
              borderRadius: '6px',
            }}
            optionFilterProp="value"
            dropdownRender={() => (
              <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
                {renderAccountsCheckboxes(theme)}
              </div>
            )}
          />
        </div>
      </Modal>


      {/* <Select
        value={newSelectedRef.current}
        placeholder="Select draft"
        style={{
          width: 160,
          border: "1.5px solid #4caf50",
          borderRadius: "8px",
          marginBottom: "7px",
          marginLeft: "2px",
        }}
        onChange={onChangeDraft}
        dropdownClassName={theme === "dark" && "custom-dropdown"}
        className={theme === "dark" ? "dark-theme" : "light-theme"}
      >
        
        {Array.isArray(draftsData) &&
          draftsData.map((draft) => (
           
            <Select.Option key={draft.draftId} value={draft.draftId}>
              {draft.Draft_Name}
            </Select.Option>
          ))}

       
      </Select> */}

      <Spin spinning={loading}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onValuesChange={handleFormChange}
          initialValues={initialValues}
          className={theme === "dark" ? "form-dark" : "form-light"}
        >
          <Collapse
            accordion
            activeKey={activeKey} // Bind active key state
            onChange={(key) => setActiveKey([key])}
            className={
              theme === "dark"
                ? "custom-collapse-dark"
                : "custom-collapse-light"
            }
          >
            <Panel
              header="CAMPAIGN LEVEL"
              key="1"
              style={{
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            >
              <div
                style={{
                  display: "flex",
                  // backgroundColor: theme === "dark" ? "#333" : "#f5f5f5",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                <Form.Item
                  name="Account_Number"
                  label={
                    <span style={{ color: "#B4B4B4" }}>Account number</span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select an option!",
                    },
                  ]}
                  // style={{ width: 200, }}
                  style={{ flex: 0.19 }}
                >
                  {/* <Input
                    value={accountNumber}
                    onChange={Accountchange}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                  /> */}
                  <Select
                    mode="multiple"
                    value={accountis}                // array of strings
                    onChange={Accountchange}             // gets string[]
                    options={newAccountNumbers}             // [{value,label}]
                    placeholder="Select account(s)"
                    // showSearch
                    optionFilterProp="label"
                    allowClear
                    maxTagCount={1}                                      // 👈 always show only the first selected
                    maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
                    className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </Form.Item>
                <Form.Item
                  name="Name"
                  label={
                    <span style={{ color: "#B4B4B4" }}>Campaign name</span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select an option!",
                    },
                  ]}
                  // style={{ width: 200, marginLeft: "1%" }}
                  style={{ flex: 0.25, marginLeft: "1%" }}
                >
                  <Input
                    onChange={handleNameChange}
                    style={{ width: "100%" }}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
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
                  style={{ flex: 0.13, marginLeft: "1%" }}
                // style={{ width: 170, marginLeft: "1%" }}
                >
                  <Select
                    // onChange={getpixelandpageid}
                    variant="filled"
                    options={[
                      { value: "OUTCOME_LEADS", label: "Leads", title: "" },
                      { value: "OUTCOME_SALES", label: "Sales", title: "" },
                      // {
                      //   value: "OUTCOME_ENGAGEMENT",
                      //   label: "Engagement",
                      //   title: "",
                      // },
                      // {
                      //   value: "OUTCOME_AWARENESS",
                      //   label: "Awareness",
                      //   title: "",
                      // },
                      // { value: "OUTCOME_TRAFFIC", label: "Traffic", title: "" },
                      // {
                      //   value: "OUTCOME_APP_PROMOTION",
                      //   label: "App promotion",
                      //   title: "",
                      // },
                    ]}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
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
                  style={{ flex: 0.15, marginLeft: "1%" }}
                // style={{ width: 160, marginLeft: "1%" }}
                >
                  <Select
                    variant="filled"
                    mode="multiple"
                    allowClear
                    options={[
                      { value: "HOUSING", label: "Housing", title: "" },
                      {
                        value: "FINANCIAL_PRODUCTS_SERVICES",
                        label: "Credit",
                        title: "",
                      },
                      { value: "EMPLOYMENT", label: "Employment", title: "" },
                      // {
                      //   value: "ISSUES_ELECTIONS_POLITICS",
                      //   label: "Politics",
                      //   title: "",
                      // },
                      { value: "NONE", label: "None", title: "" },
                    ]}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme-category" : "light-theme"
                      } green-border-select`}
                  />
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const categories = getFieldValue("Special_categories") || [];
                    // if "NONE" is selected, hide the countries field
                    const showCountries = categories.length > 0 && !categories.includes("NONE");

                    return showCountries ? (
                      <Form.Item
                        name="countries"
                        label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                        rules={[
                          {
                            required: true,
                            message: "Please select at least one country!",
                          },
                        ]}
                        style={{ width: "140px", marginLeft: "1%" }}
                        initialValue={["US"]} // default
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          // options={[
                          //   { value: "US", label: "United States" },
                          //   { value: "GB", label: "United Kingdom" },
                          //   { value: "AU", label: "Australia" },
                          //   { value: "IN", label: "India" },
                          //   { value: "AE", label: "United Arab Emirates" },
                          //   { value: "CA", label: "Canada" },
                          //   { value: "DE", label: "Germany" },
                          //   { value: "FR", label: "France" },
                          //   { value: "JP", label: "Japan" },
                          //   { value: "CN", label: "China" },
                          //   { value: "BR", label: "Brazil" },
                          //   { value: "ZA", label: "South Africa" },
                          //   { value: "RU", label: "Russia" },
                          //   { value: "IT", label: "Italy" },
                          //   { value: "ES", label: "Spain" },
                          //   { value: "SG", label: "Singapore" },
                          //   { value: "NZ", label: "New Zealand" },
                          //   { value: "MX", label: "Mexico" },
                          // ]}
                          showSearch
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
                            { value: "PL", label: "Poland", title: "" },
                            { value: "PT", label: "Portugal", title: "" },
                            { value: "RO", label: "Romania", title: "" },
                            { value: "SK", label: "Slovakia", title: "" },
                            { value: "SI", label: "Slovenia", title: "" },
                            { value: "SE", label: "Sweden", title: "" },
                          ]}
                          dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                          className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                        />
                      </Form.Item>
                    ) : null;
                  }}
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
                  style={{ flex: 0.2, marginLeft: "1%" }}
                // style={{ width: 170, marginLeft: "1%" }}
                >
                  <Select
                    variant="filled"
                    options={[
                      {
                        value: "LOWEST_COST_WITHOUT_CAP",
                        label: "Highest Volume",
                        title: "",
                      },
                      {
                        value: "LOWEST_COST_WITH_BID_CAP",
                        label: "Bid Cap",
                        title: "",
                      },
                      {
                        value: "COST_CAP",
                        label: "Cost per Result Goal",
                        title: "",
                      },
                      {
                        value: "LOWEST_COST_WITH_MIN_ROAS",
                        label: "ROAS Goal",
                        title: "",
                      },
                    ]}
                    onChange={handleBidStrategyChange}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  />
                </Form.Item>
                {/*1234*/}
                {/* <Form.Item
                                    name="Daily_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ flex: 0.1, marginLeft: "2%" }}
                                // tooltip={adsetLevelDailyBudget !== "" ? "You have enabled daily budget in the Adset Level" : ""}
                                >
                                    <Tooltip title={adsetLevelDailyBudget !== 0 ? "You have enabled daily budget in the Adset Level" : ""}>
                                        <Input
                                            type="number"
                                            placeholder="$"
                                            value={campaignLevelDailyBudget}
                                            onChange={onChangeCampaignLevelDailyBudget}
                                            readOnly={adsetLevelDailyBudget !== 0 ? true : false}
                                            step="0.01"
                                            onWheel={(e) => e.target.blur()}
                                            style={{
                                                backgroundColor: adsetLevelDailyBudget !== 0 ? '#f0f0f0' : 'transparent',
                                                borderRadius: '6px',
                                                borderColor: adsetLevelDailyBudget !== 0 ? 'transparent' : undefined,
                                                fontSize: '14px',
                                                color: '#333',
                                                width: '200px',
                                                boxSizing: 'border-box'
                                            }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Tooltip>
                                </Form.Item>  */}
                {/*pk*/}
                {/* <Tooltip title={isAnyAdsetBudgetSet ? 'You have enabled daily budget in the Adset Level' : ''}>
                                    <Form.Item
                                    name="Daily_amount"
                                    label="Campaign Daily Budget"
                                    rules={[
                                        {
                                        validator(_, value) {
                                            if (isAnyAdsetBudgetSet) return Promise.resolve();
                                            const parsed = parseFloat(value);
                                            if (!parsed || parsed <= 0) {
                                            return Promise.reject(new Error('Please enter a valid daily budget'));
                                            }
                                            return Promise.resolve();
                                        }
                                        }
                                    ]}
                                    >
                                    <InputNumber
                                        placeholder="$"
                                        readOnly={isAnyAdsetBudgetSet}
                                        step={0.01}
                                        min={0}
                                        onWheel={(e) => e.target.blur()}
                                        style={{
                                        backgroundColor: isAnyAdsetBudgetSet ? '#f0f0f0' : 'transparent',
                                        width: 200
                                        }}
                                    />
                                    </Form.Item>
                                </Tooltip> */}
                {/* <Tooltip
        // title={isAnyAdsetBudgetSet ? 'You have enabled daily budget in the Adset Level' : ''}
      >
        <Form.Item
          name="Daily_amount"
          label="Daily Budget"
        //   rules={[
        //     {
        //       validator(_, value) {
        //         const parsedCampaign = parseFloat(value || 0);
        //         const parsedAdsets = (form.getFieldValue('adsets') || []).map(a =>
        //           parseFloat(a?.DailyAdd_amount || 0)
        //         );

        //         const isAnyAdsetFilled = parsedAdsets.some(val => val > 0);
        //         const isAnyBudgetSet = parsedCampaign > 0 || isAnyAdsetFilled;

        //         if (!isAnyBudgetSet) {
        //           return Promise.reject(
        //             new Error("No budget is given at both Campaign and Adset levels")
        //           );
        //         }

        //         if (isAnyAdsetFilled) return Promise.resolve();

        //         if (parsedCampaign <= 0) {
        //           return Promise.reject(new Error("Please enter a valid daily budget"));
        //         }

        //         return Promise.resolve();
        //       }
        //     }
        //   ]}
        rules={[
            {
                validator(_, value) {
                    const parsedCampaign = parseFloat(value || 0);
                    const parsedAdsets = (form.getFieldValue('adsets') || []).map(a =>
                        parseFloat(a?.DailyAdd_amount || 0)
                    );
    
                    // Check if any adset has a filled budget
                    const isAnyAdsetFilled = parsedAdsets.some(val => val > 0);
    
                    // If either the campaign or any adset has a budget, validation passes
                    const isAnyBudgetSet = parsedCampaign > 0 || isAnyAdsetFilled;
    
                    // If no budget is provided at both campaign and adset levels
                    if (!isAnyBudgetSet) {
                        return Promise.reject(
                            new Error("No budget is given at both Campaign and Adset levels")
                        );
                    }
    
                    // If any adset budget is filled, no need to validate the campaign level budget
                    if (isAnyAdsetFilled) return Promise.resolve();
    
                    // If campaign budget is not filled and no adset budget is provided
                    if (parsedCampaign <= 0) {
                        return Promise.reject(new Error("Please enter a valid daily budget"));
                    }
    
                    return Promise.resolve();
                }
            }
        ]}
        >
          <InputNumber
            placeholder="$"
            min={0}
            step={0.01}
            // readOnly={isAnyAdsetBudgetSet}
            onWheel={(e) => e.target.blur()}
            style={{
            //   backgroundColor: isAnyAdsetBudgetSet ? '#f0f0f0' : 'transparent',
              width: 200
            }}
          />
        </Form.Item>
      </Tooltip> */}
                {/* <Tooltip
                  title={
                    isAnyAdsetBudgetSet
                      ? "You have enabled daily budget in the Adset Level"
                      : ""
                  }
                >
                  <Form.Item
                    name="Daily_amount"
                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                    rules={[
                      {
                        required: !(
                          isAnyAdsetBudgetSet || campaignLevelDailyBudget > 0
                        ),
                        message:
                          "Please enter a valid daily budget for the Campaign",
                      },
                    ]}
                    style={{ marginLeft: "1%" }}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder="$"
                      value={campaignLevelDailyBudget}
                      onChange={(value) => {
                        setCampaignLevelDailyBudget(value);
                        setIsCampaignBudgetActive(value > 0);
                      }}
                      readOnly={isAnyAdsetBudgetSet} // Make campaign budget read-only if any adset has a budget
                      style={{
                        flex: 0.2,
                        color: theme === "dark" ? "#fff" : "#000",
                      }}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                    />
                  </Form.Item>
                </Tooltip> */}
                <Tooltip
                  title={
                    watchedHasAdsetBudget
                      ? "You have enabled budget at Adset level — Campaign budget is disabled."
                      : ""
                  }
                  overlayInnerStyle={{
                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    // fontWeight: 500,
                  }}
                >
                  <Form.Item
                    name="Daily_amount"
                    label={<span style={{ color: "#B4B4B4" }}>{`${budgetType} budget`}</span>}

                    required={!watchedHasAdsetBudget}
                    rules={[
                      {
                        required: !(watchedHasAdsetBudget || Number(watchedCampaignBudget) > 0),
                        message: "Please enter a valid daily budget for the Campaign",
                      },
                    ]}
                    style={{ marginLeft: "1%", marginBottom: 24 }}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder="$"
                      readOnly={watchedHasAdsetBudget} // only depends on watchedAdsets
                      style={{
                        flex: 0.2,
                        color: theme === "dark" ? "#fff" : "#000",
                      }}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                    />
                  </Form.Item>
                </Tooltip>
                <Form.Item
                  name="Status"
                  label={<span style={{ color: "#B4B4B4" }}>Status</span>}
                  rules={[
                    {
                      required: true,
                      message: "Please select an option!",
                    },
                  ]}
                  style={{ flex: 0.1, marginLeft: "1%" }}
                // style={{ width: 160, marginLeft: "1%" }}
                >
                  <Select
                    variant="filled"
                    options={[
                      { value: "ACTIVE", label: "ACTIVE", title: "" },
                      { value: "PAUSED", label: "PAUSED", title: "" },
                    ]}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  />
                </Form.Item>
              </div>
            </Panel>
            {/* {adsets.map((adset, index) => {
                              <AdsetComponent
                              key={adset.id}
                              index={index}
                              adset={adset}
                              theme={theme}
                              campaignName={campaignName}
                              imagehash={imagehash}
                              selectedFiles={selectedFiles}
                              setSelectedFiles={setSelectedFiles}
                              selectedFilesFromMedia={selectedFilesFromMedia}
                              setSelectedFilesFromMedia={setSelectedFilesFromMedia}
                              selectedFilesFromCreatives={selectedFilesFromCreatives}
                              setSelectedFilesFromCreatives={setSelectedFilesFromCreatives}
                              form={form}
                              campaignLevelDailyBudget={campaignLevelDailyBudget}
                              isCampaignBudgetActive={isCampaignBudgetActive}
                              isAnyAdsetBudgetSet={isAnyAdsetBudgetSet}
                              showBidAmount={showBidAmount}
                              updateAdMediaData={updateAdMediaData}
                              addAdset={addAdset}
                              removeAdset={removeAdset}
                              cloneAdset={cloneAdset}
                              onClickCreativesDrawer={onClickCreativesDrawer}
                              onClickEdit={onClickEdit}
                              currentDate={currentDate}
                              localesdata={localesdata}
                              getUrlBuilder={getUrlBuilder}
                              editedImages={editedImages}
                            />
                          
                            
                        })} */}
            {adsets.map((adset, index) => {
              return (
                <AdsetComponent
                  theme={theme}
                  setSelectedPublishers={setSelectedPublishers}
                  selectedPublishers={selectedPublishers}
                  selectedPositions={selectedPositions}
                  setSelectedPositions={setSelectedPositions}
                  form={form}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  selectedFilesFromMedia={selectedFilesFromMedia}
                  selectedFilesFromCreatives={selectedFilesFromCreatives}
                  setSelectedFilesFromMedia={setSelectedFilesFromMedia}
                  setSelectedFilesFromCreatives={setSelectedFilesFromCreatives}
                  isCampaignBudgetActive={isCampaignBudgetActive}
                  handleAdsetChange={handleAdsetChange}
                  showBidAmount={showBidAmount}
                  index={index}
                  adset={adset}
                  localesdata={localesdata}
                  addAdset={addAdset}
                  cloneAdset={cloneAdset}
                  removeAdset={removeAdset}
                  handleFieldChange={handleFieldChange}
                  network={network}
                  accountis={accountis}
                  imagehash={imagehash}
                  pixel_id_list={pixel_id_list}
                  page_id_list={page_id_list}
                  pageidList={pageidList}
                  pixelIdList={pixelIdList}
                  setDefaultUrlData={setDefaultUrlData}
                  defaultUrlData={defaultUrlData}
                  budgetType={budgetType}
                  page={page}
                  pixel={pixel}
                  geo={geo}
                />
              );
              // <ffff/>
            })}
          </Collapse>
          {/* <Form.Item label=" ">
                        {isFormComplete && (
                            <Button type="primary" htmlType="submit" style={{ background: '#21c55d', minWidth: '200px' }}>
                                Submit
                            </Button>
                        )}
                    </Form.Item> */}
          <Form.Item label=" ">
            {/* {(isFormComplete || newSelectedRef.current) && ( */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div>
                {/* <Button
  type="primary"
  style={{ background: '#21c55d', minWidth: '200px', borderWidth: '0px' }}
  onClick={async () => {
    try {
      const values = await form.validateFields(); // Validates all form fields

      // Check if campaign-level and adset-level budgets are both zero
      const campaignLevelDailyBudget = values.Daily_amount;
      const isCampaignBudgetActive = parseFloat(campaignLevelDailyBudget) > 0;
      const isAnyAdsetBudgetSet = values.adsets.some(adset => parseFloat(adset.DailyAdd_amount) > 0);

      if (!isAnyAdsetBudgetSet && !isCampaignBudgetActive && campaignLevelDailyBudget === 0) {
        throw {
          errorFields: [
            {
              name: ['Daily_amount'], // The field where error occurs
              errors: ['Daily budget cannot be zero on both Adset and Campaign levels'], // The error message
            },
          ],
        };
      }

      setSubmitErrors([]);  // Clear previous errors

      console.log("Form values:", values); // Log form values to verify

      // Call the onFinish logic, passing in the values
      onFinish(values); // Trigger the existing logic for form submission

      // Show confirmation modal (if needed)
      setIsModalVisible(true);

      // Save values if needed
      setFormValues(values);

    } catch (err) {
      // Catch any validation errors thrown by form.validateFields
      const allErrors = err?.errorFields?.map((field) => ({
        name: field.name?.[0],       // field name
        message: field.errors?.[0],  // validation message
      }));
      setSubmitErrors(allErrors); // Capture and show validation errors
    }
  }}
>
  Submit
</Button> */}


                {/* Inline input boxes */}

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 8, }}>
                  <Modal
                    className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                    title="Edit Category"
                    visible={editModalVisible}
                    onOk={async () => {
                      if (editedName.trim() && currentCategory) {
                        await renameCategory(
                          currentCategory.accountNumber,   // ✅ pass the right account number
                          currentCategory.categoryId,
                          editedName.trim()
                        );
                        setEditModalVisible(false);
                        setEditedName("");
                        setCurrentCategory(null);
                      }
                    }}
                    onCancel={() => {
                      setEditModalVisible(false);
                      setEditedName("");
                      setCurrentCategory(null);
                    }}
                    okText="Save"
                  >
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className={theme === "dark" ? "custom-input-dark" : "custom-input-light"}
                    />
                  </Modal>
                  <Modal
                    className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                    title="Delete Category"
                    visible={deleteModalVisible}
                    onOk={async () => {
                      if (currentCategory) {
                        await deleteCategory(
                          currentCategory.accountNumber,   // ✅ use the category’s own account
                          currentCategory.categoryId
                        );
                        setDeleteModalVisible(false);
                        setCurrentCategory(null);
                      }
                    }}
                    onCancel={() => {
                      setDeleteModalVisible(false);
                      setCurrentCategory(null);
                    }}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <p>Are you sure you want to delete the category "{currentCategory?.name}"?</p>
                  </Modal>

                </div>
                <Modal
                  title="Edit Accounts"
                  open={isEditAccountsModalOpen}
                  onCancel={() => setIsEditAccountsModalOpen(false)}
                  okText="Yes, Update"
                  cancelText="Close"
                  confirmLoading={confirmLoading}
                  onOk={async () => {
                    // setIsEditAccountsModalOpen(false);
                    setConfirmLoading(true);

                    try {
                      const allValues = form.getFieldsValue(true);
                      const accountsToUpdate = matchedAccounts;

                      for (const accountNumber of accountsToUpdate) {
                        const draftData = await MultipleAdsetsDraftFetching(allValues, accountNumber);
                        if (!draftData) continue;

                        let filteredPayload;
                        if (Array.isArray(draftData)) {
                          filteredPayload = draftData.find(d => d.Account_Number === accountNumber);
                        } else {
                          filteredPayload = Object.values(draftData).find(d => d.Account_Number === accountNumber);
                        }
                        if (!filteredPayload) continue;
                        filteredPayload = {
                          ...filteredPayload,
                          Category: popupInputs.input1,
                          Draft_Name: popupInputs.input2,
                        };
                        for (const accountNumber of matchedAccounts) {
                          const draftData = await MultipleAdsetsDraftFetching(allValues, accountNumber);
                          if (!draftData) continue;

                          let filteredPayload = Array.isArray(draftData)
                            ? draftData.find(d => d.Account_Number === accountNumber)
                            : Object.values(draftData).find(d => d.Account_Number === accountNumber);

                          if (!filteredPayload) continue;

                          filteredPayload = {
                            ...filteredPayload,
                            Category: popupInputs.input1,
                            Draft_Name: popupInputs.input2,
                          };

                          await fetch("https://www.testapi.adsgoat.in/api/NewupdateDraftSmart", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json", Authorization: token },
                            body: JSON.stringify({
                              accountNumber,
                              // draftId: selectedRef.current.draftId,
                              groupId: selectedRef.current.groupId,
                              payload: filteredPayload,
                            }),
                          });
                        }

                        message.success("Draft updated successfully for all accounts in this group");
                        setIsEditAccountsModalOpen(false);
                        await postDraftSaveCleanup();
                      }



                    } catch (err) {
                      console.error("Save draft (edit) error:", err);
                      message.error(err?.message || "Failed to update draft");
                    } finally {
                      setConfirmLoading(false);
                    }
                  }}
                >
                  <p>This draft is present in these accounts:</p>
                  <ul>
                    {matchedAccounts.length > 0
                      ? matchedAccounts.map((acc, idx) => <li key={idx}>{acc}</li>)
                      : <li>No matching accounts found</li>
                    }
                  </ul>
                </Modal>
                <Modal
                  title="Delete Report Category"
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                  open={rDeleteModalVisible}
                  onOk={async () => {
                    if (!rCurrentCategory) return;
                    await deleteReportCategory(
                      rCurrentCategory.accountNumber ?? (Array.isArray(account) ? account[0] : account),
                      rCurrentCategory.categoryId
                    );
                    setRDeleteModalVisible(false);
                    setRCurrentCategory(null);
                  }}

                  onCancel={() => {
                    setRDeleteModalVisible(false);
                    setRCurrentCategory(null);
                  }}
                  okText="Delete"
                  okButtonProps={{ danger: true, type: "primary" }}
                >
                  <p>Are you sure you want to delete “{rCurrentCategory?.name}”?</p>
                </Modal>
                <Modal
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                  title="Edit Report Category"
                  visible={rEditModalVisible}
                  onOk={async () => {
                    if (rEditedName.trim() && rCurrentCategory) {
                      await renameReportCategory(
                        rCurrentCategory.accountNumber,
                        rCurrentCategory.categoryId,
                        rEditedName.trim()
                      );
                      setREditModalVisible(false);
                      setREditedName("");
                      setRCurrentCategory(null);
                    }
                  }}
                  onCancel={() => {
                    setREditModalVisible(false);
                    setREditedName("");
                    setRCurrentCategory(null);
                  }}
                  okText="Save"
                >
                  <Input
                    value={rEditedName}
                    onChange={(e) => setREditedName(e.target.value)}
                    className={theme === "dark" ? "custom-input-dark" : "custom-input-light"}
                  />
                </Modal>

                <div style={{ display: 'flex', marginTop: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button
                      type="primary"
                      style={{
                        background: "#91c25f",
                        minWidth: "120px",
                        borderWidth: "0px",
                      }}
                      onClick={async () => {
                        const cat = (popupInputs?.reportCat || "").trim();
                        if (!cat) {
                          setErrors((e) => ({ ...e, reportCat: "Report category is required" }));
                          // message.error("Category is required");
                          return;
                        }

                        try {
                          const values = await form.validateFields();

                          // Check if campaign-level and adset-level budgets are both zero
                          const campaignLevelDailyBudget = values.Daily_amount;
                          const isCampaignBudgetActive =
                            parseFloat(campaignLevelDailyBudget) > 0;

                          // Check if any adset has a budget
                          const isAnyAdsetBudgetSet = values.adsets.some(
                            (adset) => parseFloat(adset.DailyAdd_amount) > 0
                          );

                          // If Campaign Budget is not set, check Adsets
                          if (!isCampaignBudgetActive) {
                            const isAllAdsetsFilled = values.adsets.every(
                              (adset) => parseFloat(adset.DailyAdd_amount) > 0
                            );

                            if (!isAllAdsetsFilled) {
                              throw {
                                errorFields: [
                                  {
                                    name: ["Daily_amount"],
                                    errors: [
                                      "Daily budget cannot be zero on both Adset and Campaign levels",
                                    ],
                                  },
                                ],
                              };
                            }
                          }

                          // Clear any previous errors
                          setSubmitErrors([]);
                          console.log("Form values:", values);

                          // Call the onFinish logic, passing in the values
                          onFinish(values);

                          // Optionally trigger confirmation modal (as per your logic)
                          setIsModalVisible(true);

                          // Save values if needed
                          setFormValues(values);
                          setIsCreateCampaignorDraft("createcampaign");
                        } catch (err) {
                          const allErrors = err?.errorFields?.map((field) => ({
                            name: field.name?.[0],
                            message: field.errors?.[0],
                          }));
                          setSubmitErrors(allErrors);
                        }
                      }}
                    >
                      Submit
                    </Button>
                    {errors.reportCat && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        {errors.reportCat}
                      </div>
                    )}
                  </div>
                  <Popconfirm
                    icon={null}
                    overlayInnerStyle={{
                      backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                      color: theme === "dark" ? "#fff" : "#333",
                    }}
                    description={
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* <span style={{ color: theme === "dark" ? "#fff" : "#333" }} >Template Category</span>
                        <Select
                          placeholder="Select template category"
                          className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
                          dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                          value={popupInputs.input1 || undefined}
                          style={{ width: 280 }}
                          onChange={(val) => {
                            setPopupInputs((s) => ({ ...s, input1: val }));
                            if (errors.input1) setErrors((e) => ({ ...e, input1: "" }));
                          }}
                          showSearch
                          optionLabelProp="value"
                          filterOption={(input, option) =>
                            (option?.name || "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={categories.map((c) => ({
                            value: `${c.name}`,
                            name: c.name,
                            id: c.categoryId,
                            label: (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                <span style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 200
                                }} title={`${c.name} - ${c.accountNumber}`}>
                                  {c.name} - {c.accountNumber}
                                </span>
                                <span style={{ display: "flex", gap: 10 }}>
                                  <FaPenToSquare
                                    style={{ fontSize: 12, cursor: "pointer" }}
                                    title="Edit"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onClick={(e) => {
                                      e.preventDefault(); e.stopPropagation();
                                      setCurrentCategory(c);
                                      setEditedName(c.name);
                                      setEditModalVisible(true);
                                    }}
                                  />
                                  <FaTrashCan
                                    style={{ fontSize: 12, color: "#EC7117", cursor: "pointer" }}
                                    title="Delete"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onClick={(e) => {
                                      e.preventDefault(); e.stopPropagation();
                                      setCurrentCategory(c);
                                      setDeleteModalVisible(true);
                                    }}
                                  />
                                </span>
                              </div>
                            ),

                          }))}
                          dropdownRender={(menu) => (
                            <div>
                              {menu}
                              <div
                                style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #eee" }}

                              >

                                <Input
                                  size="small"
                                  placeholder="New category"
                                  value={newCategory}
                                  onChange={(e) => setNewCategory(e.target.value)}
                                  onPressEnter={(e) => { e.preventDefault(); addCategory(); }}
                                  className={theme === "dark" ? "custom-input-dark" : "custom-input-light"}
                                />
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<PlusOutlined />}
                                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addCategory(); }}
                                  style={{ backgroundColor: "#91c25f", border: "1px solid #4caf50", fontSize: 10, width: 20, height: 20 }}
                                />
                              </div>
                            </div>
                          )}
                        /> */}

                        {errors.input1 && <div style={{ color: "red", fontSize: 12 }}>{errors.input1}</div>}

                        {/* Input for Template Name */}
                        <span style={{ color: theme === "dark" ? "#fff" : "#333" }}>Template Name</span>
                        <Input
                          placeholder="Template Name"
                          value={popupInputs.input2}
                          onChange={(e) => setPopupInputs((s) => ({ ...s, input2: e.target.value }))}
                          status={errors.input2 ? "error" : ""}
                          className={
                            theme === "dark"
                              ? "custom-input-dark"
                              : "custom-input-light"
                          }
                          style={{ width: 250 }}

                        />
                        {errors.input2 && (
                          <div style={{ color: "red", fontSize: 12 }}>
                            {errors.input2}
                          </div>
                        )}
                      </div>
                    }
                    open={open}
                    onOpenChange={setOpen}
                    // onConfirm={handleConfirm}
                    onConfirm={isEditingDraft ? handleSaveEditedDraft : handleConfirm}
                    // onCancel={handleCancelPop}
                    cancelButtonProps={{
                      style: {
                        backgroundColor: theme === "dark" ? "#555" : "transparent",
                        color: theme === "dark" ? "#fff" : "#000",
                        border: "1px solid #4caf50",
                      },
                    }}
                    okButtonProps={{
                      loading: confirmLoading,
                      style: {
                        backgroundColor: "#91C25F",
                        color: "#000",
                        border: "none",
                      },
                    }}
                  >
                    <Button
                      type="primary"
                      style={{
                        background: "#91c25f",
                        minWidth: "120px",
                        borderWidth: "0px",
                        marginLeft: "10px",
                      }}
                      onClick={() => setOpen(true)}
                    >
                      {isEditingDraft ? "Save" : "Save Template"} {/* 🔑 dynamic label */}

                    </Button>
                  </Popconfirm>
                  {/* {isEditingDraft ? (
                    <Button
                      type="primary"
                      loading={confirmLoading}
                      style={{ background: "#91c25f", minWidth: "120px", marginLeft: 20, borderWidth: 0 }}
                      onClick={handleSaveEditedDraft}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      loading={confirmLoading}
                      style={{ background: "#91c25f", minWidth: "120px", marginLeft: 20, borderWidth: 0 }}
                      onClick={handleConfirm} // your existing "create new draft" handler
                    >
                      Save Template
                    </Button>
                  )} */}
                </div>


                {/* <Popconfirm
                  icon={<ExclamationCircleFilled className="Exckamationicon" />}
                  title={
                    <span
                      style={{
                        color: theme === "dark" ? "#FFFFFF" : "#333",
                        fontWeight: 600,
                      }}
                    >
                      Enter required fields
                    </span>
                  }
                  overlayInnerStyle={{
                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                    color: theme === "dark" ? "#fff" : "#333",
                  }}
                  description={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div>
                        <Input
                          placeholder="Title"
                          value={popupInputs.input1}
                          className={
                            theme === "dark"
                              ? "custom-input-dark"
                              : "custom-input-light"
                          }
                          onChange={(e) =>
                            setPopupInputs((prev) => ({
                              ...prev,
                              input1: e.target.value,
                            }))
                          }
                          status={errors.input1 ? "error" : ""}
                        />
                        {errors.input1 && (
                          <div style={{ color: "red", fontSize: "12px" }}>
                            {errors.input1}
                          </div>
                        )}
                      </div>

                      <div>
                        <Input
                          placeholder="Draft Name"
                          value={popupInputs.input2}
                          className={
                            theme === "dark"
                              ? "custom-input-dark"
                              : "custom-input-light"
                          }
                          onChange={(e) =>
                            setPopupInputs((prev) => ({
                              ...prev,
                              input2: e.target.value,
                            }))
                          }
                          status={errors.input2 ? "error" : ""}
                        />
                        {errors.input2 && (
                          <div style={{ color: "red", fontSize: "12px" }}>
                            {errors.input2}
                          </div>
                        )}
                      </div>
                    </div>
                  }
                  open={open}
                  onOpenChange={setOpen}
                  onConfirm={handleConfirm}
                  onCancel={handleCancelPop}
                  cancelButtonProps={{
                    style: {
                      backgroundColor:
                        theme === "dark" ? "#555" : " transparent",
                      color: theme === "dark" ? "#fff" : "#000",
                      border: "1px solid #4caf50",
                    },
                  }}
                  okButtonProps={{
                    loading: confirmLoading,
                    style: {
                      backgroundColor: "#91C25F",
                      color: "#000",
                      border: "none",
                    },
                  }}
                >
                  <Button
                    type="primary"
                    style={{
                      background: "#91c25f",
                      minWidth: "100px",
                      borderWidth: "0px",
                      marginLeft: "10px",
                    }}
                    onClick={() => setOpen(true)}
                  >
                    Draft
                  </Button>
                </Popconfirm> */}

                {/* <Button
  type="primary"
  style={{ background: '#11dd44', minWidth: '100px', borderWidth: '0px', marginLeft: '10px' }}
  onClick={async () => {
    try {
      const values = await form.validateFields(); // Validates all form fields

      // Check if campaign-level and adset-level budgets are both zero
      const campaignLevelDailyBudget = values.Daily_amount;
      const isCampaignBudgetActive = parseFloat(campaignLevelDailyBudget) > 0;

      // Check if any adset has a budget
      const isAnyAdsetBudgetSet = values.adsets.some(adset => parseFloat(adset.DailyAdd_amount) > 0);
      
      // If Campaign Budget is not set, check Adsets
      if (!isCampaignBudgetActive) {
        const isAllAdsetsFilled = values.adsets.every(adset => parseFloat(adset.DailyAdd_amount) > 0);
        
        if (!isAllAdsetsFilled) {
          throw {
            errorFields: [
              {
                name: ['Daily_amount'], // The field where error occurs
                errors: ['Daily budget cannot be zero on both Adset and Campaign levels'], // The error message
              },
            ],
          };
        }
      }

      // Clear any previous errors
      setSubmitErrors([]);
      console.log("Form values:", values); // Log form values to verify

      // Call the onFinish logic, passing in the values
      onFinish(values); // Trigger the existing logic for form submission

      // Optionally trigger confirmation modal (as per your logic)
      setIsModalVisible(true);

      // Save values if needed
      setFormValues(values);

      setIsCreateCampaignorDraft("draft");

    } catch (err) {
      // Catch any validation errors thrown by form.validateFields
      const allErrors = err?.errorFields?.map((field) => ({
        name: field.name?.[0],       // field name
        message: field.errors?.[0],  // validation message
      }));
      setSubmitErrors(allErrors); // Capture and show validation errors
    }
  }}
>
  Draft
</Button> */}
              </div>

              {/* Show validation messages beside button */}
              {submitErrors.length > 0 && (
                <div style={{ color: "red", marginTop: 8 }}>
                  {submitErrors.map((err, index) => (
                    <div key={index}>
                      <strong>{err.name}:</strong> {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* )} */}
          </Form.Item>

          {isImgEditorShown && currentFile && (
            <FabricCanvas
              fileId={currentFile.name} // Pass a unique identifier
              initialImage={
                currentFile?.originFileObj
                  ? URL.createObjectURL(currentFile.originFileObj)
                  : currentFile?.url
              }
              closeCanvasModal={closeCanvasModal}
              onSaveEditedImage={handleSaveEditedImage}
            />
          )}

          {/* {isImgEditorShown && currentFile && (
                        <FabricCanvas
                            initialImage={URL.createObjectURL(currentFile)}
                            openCanvasModal={() => setIsImgEditorShown(true)}
                            closeCanvasModal={closeCanvasModal}
                            selectedFile={currentFile}
                        />
                    )} */}
          <Modal
            title="Confirmation"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
              }`}
          >
            <p>Are you sure you want to submit?</p>
          </Modal>
        </Form>
      </Spin>
      {
        openCreativesDrawer && (
          <Drawer
            title="Select Creatives"
            width="95%"
            open={openCreativesDrawer}
            onClose={() => setOpenCreativesDrawer(false)}
            style={{
              backgroundColor: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            <ImageUploadPage
              selectedFilesData={selectedFilesData}
              fromCampaigns={true}
              network={network}
              Account_Number={accountis}
            />
          </Drawer>
        )
      }
    </Modal >
  );
};

export default CreateCampaignDrawer;
