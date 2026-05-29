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
import { Description } from "@mui/icons-material";

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
const getFileType = (name = "") => {
  if (name.endsWith(".jpg")) return "image/jpg";
  if (name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  return "video/";
};

const mapped = (data) =>
  data.flatMap((file, fileIndex) => {
    const filenames = Array.isArray(file.filename)
      ? file.filename.map(f => f.filename)
      : [file.filename];

    return filenames.map((filename, i) => ({
      id: file.id,
      uid: `-${Date.now()}-${fileIndex}-${i}`,
      name: filename,
      status: "done",
      type: getFileType(filename),
      url: filename,
      Addid: file.Addid || null,
    }));
  });

// const mapped = (data) =>
//   data.map((file, i) => ({
//     id: file?.id,
//     uid: `-${Date.now()}-${i}`,
//     name: file?.filename,
//     status: "done",
//     type: file?.filename?.endsWith(".jpg")
//       ? "image/jpg"
//       : file?.filename?.endsWith(".jpeg")
//         ? "image/jpeg"
//         : file?.filename.endsWith(".png")
//           ? "image/png"
//           : "video/",
//     url: file?.filename,
//     Addid: file?.Addid || null,
//   }));

const AddComponent = ({
  imagehash,
  network,
  accountis,
  isViewAdset,
  viewSingleAd,
  newAddLevelData,
  setNewAddLevelData,
  activeMediaIndex,
  setSelectedFilesFromAdset,
  setSelectedFilesFromCreativesFromAdset,
  setSelectedFilesFromMediaFromAdset,
}) => {
  const { theme } = useTokenContext();
  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] =
    useState(false);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [addName, setAddName] = useState("");
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [creativeIndex, setCreativeIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState("creative");
  const [editedImages, setEditedImages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState(
    []
  );
  const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState([]);
  const [form] = Form.useForm();
  // console.log(viewSingleAd, "viewSingleAd in AddComponent");
  // console.log(activeMediaIndex, "activeMediaIndex in AddComponent");
  // console.log(accountis, "accountis in AddComponent");
  // console.log(selectedFiles, "selectedFiles in AddComponent");
  // console.log(selectedFilesFromMedia, "selectedFilesFromMedia in AddComponent");
  // console.log(
  //   selectedFilesFromCreatives,
  //   "selectedFilesFromCreatives in AddComponent"
  // );

  const onReturnUrl = (text) => {
    setIsModalVisibleForURLBuilder(false);
    setWebsiteURL(text);
    // const currentAdsets = form.getFieldValue("adsets") || [];
    // const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      setNewAddLevelData((prev) => {
        return prev.map((item, idx) =>
          item.id === viewSingleAd.id
            ? {
              ...item,
              Website_URL: text,
              Caption: text.split("//")[1].split("/")[0],
            }
            : item
        );
      });

      // updatedAdsets[index] = {
      //     ...updatedAdsets[index],
      //     Website_URL: text,
      //     Caption: text.split('//')[1].split("/")[0],
      // };
      form.setFieldsValue({
        Website_URL: text,
        Caption: text.split("//")[1].split("/")[0],
      });
    } else {
      setCaption(text.split("/")[0]);
      form.setFieldsValue({ Website_URL: text, Caption: text.split("/")[0] });
      // updatedAdsets[index] = {
      //     ...updatedAdsets[index],
      //     Website_URL: text,
      //     Caption: text.split('/')[0],
      // };
      setNewAddLevelData((prev) => {
        return prev.map((item, idx) =>
          item.id === viewSingleAd.id
            ? {
              ...item,
              Website_URL: text,
              Caption: text.split("/")[0],
            }
            : item
        );
      });
    }
  };

  const onChangeAddNameForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setAddName(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, AddName: updatedAddName } : ad
      )
    );
  };

  const onChangePrimaryTextForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setPrimaryText(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, message: updatedAddName } : ad
      )
    );
  };

  const onChangeHeadlineForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setHeadline(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, headline: updatedAddName } : ad
      )
    );
  };

  const onChangeDescriptionForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setDescription(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, Description: updatedAddName } : ad
      )
    );
  };

  const onChangeWebsiteURLForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setWebsiteURL(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, Website_URL: updatedAddName } : ad
      )
    );
  };

  const onChangeDisplayLinkForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setCaption(updatedAddName);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, Caption: updatedAddName } : ad
      )
    );
  };

  const onClickEdit = () => {
    setIsModalVisibleForURLBuilder(true);
  };

  const getUrlBuilder = useMemo(() => {
    switch (network) {
      case "FB_Mnet":
        return (
          <MnetUrlBuilder
            defaultValues={websiteURL}
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_Tonic1":
        return (
          <TonicUrlBuilder
            accountis={accountis}
            defaultValues={websiteURL}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            accountis={accountis}
            defaultValues={websiteURL}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            accountis={accountis}
            defaultValues={websiteURL}
            onReturnMessage={onReturnUrl}
          />
        );
    }
  }, [network, accountis, onReturnUrl]);

  const handleCancelForURLBuilder = () => {
    setIsModalVisibleForURLBuilder(false);
  };

  const onClickCreativesDrawer = (adset) => {
    // console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
    setCreativeIndex(adset.id);
  };

  const selectedFilesData = (data, index, adsetId = creativeIndex) => {
    // const mapped = data.map((file, i) => ({
    //   id: file?.id || uuidv4(),
    //   uid: file.uid || `-${Date.now()}-${i}`,
    //   name: file?.name,
    //   status: "done",
    //   type: file?.url?.endsWith(".jpg")
    //     ? "image/jpg"
    //     : file?.url?.endsWith(".jpeg")
    //     ? "image/jpeg"
    //     : file?.url?.endsWith(".png")
    //     ? "image/png"
    //     : "video/",
    //   url: file?.url,
    //   adsetId, // optional: keep if you want to identify source later
    // }));

    const mapped = [
      {
        id: data[0]?.id || uuidv4(),
        uid: data[0]?.uid || `-${Date.now()}-0`,
        name: data[0]?.name,
        status: "done",
        type: data[0]?.url?.endsWith(".jpg")
          ? "image/jpg"
          : data[0]?.url?.endsWith(".jpeg")
            ? "image/jpeg"
            : data[0]?.url?.endsWith(".png")
              ? "image/png"
              : "video/",
        url: data[0]?.url,
        adsetId,
      },
    ];

    // ✅ Set flat array (no adsetId nesting)
    setSelectedFilesFromCreatives((prev) => [...prev, ...mapped]);
    setSelectedFiles((prev) => [...prev, ...mapped]);
    setNewAddLevelData((prevArray) =>
      prevArray.map((ad) =>
        ad.id === viewSingleAd.id ? { ...ad, filename: mapped[0] } : ad
      )
    );
    const targetIndex = newAddLevelData.findIndex(
      (item) => item.id === viewSingleAd.id
    );

    function insertAtIndex(array, index, newObject) {
      // Clamp index to be within 0 and array.length
      const safeIndex = Math.min(Math.max(index, 0), array.length);

      return [
        ...array.slice(0, safeIndex), // elements before the insert position
        newObject, // the new object to insert
        ...array.slice(safeIndex), // elements from insert position onward
      ];
    }

    // Usage in React state setter:
    // setSelectedFilesFromAdset((prevArray) => {
    //   const newObject =
    //     {
    //       ...mapped[0],
    //       id: viewSingleAd.id,
    //       ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
    //     } || {};
    //   const insertIndex = targetIndex; // dynamically set this as you like

    //   return insertAtIndex(prevArray, insertIndex, newObject);
    // });

    // setSelectedFilesFromCreativesFromAdset((prevArray) => {
    //   const newObject =
    //     {
    //       ...mapped[0],
    //       id: viewSingleAd.id,
    //       ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
    //     } || {};
    //   const insertIndex = targetIndex; // dynamically set this as you like

    //   return insertAtIndex(prevArray, insertIndex, newObject);
    // });
    setSelectedFilesFromAdset((prev) =>
      prev.map((f) => {
        if (f.id === viewSingleAd.id) {
          return {
            ...mapped[0],
            id: viewSingleAd.id,
            ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
          };
        } else {
          return f;
        }
      })
    );
    // setSelectedFilesFromCreativesFromAdset((prev) =>
    //   prev.map((f) => {
    //     if (f.id === viewSingleAd.id) {
    //       return {
    //         ...mapped[0],
    //         id: viewSingleAd.id,
    //         ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
    //       };
    //     } else {
    //       return f;
    //     }
    //   })
    // );
    setSelectedFilesFromCreativesFromAdset((prev) => {
      const newObject = {
        ...mapped[0],
        id: viewSingleAd.id,
        ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
      };

      const index = prev.findIndex((f) => f.id === viewSingleAd.id);

      if (index !== -1) {
        // ✅ Update existing object
        return prev.map((f, i) => (i === index ? newObject : f));
      } else {
        // ❌ Not Found: Insert at targetIndex
        const safeIndex = Math.max(0, Math.min(targetIndex, prev.length));
        return [
          ...prev.slice(0, safeIndex),
          newObject,
          ...prev.slice(safeIndex),
        ];
      }
    });

    setSelectedFilesFromMediaFromAdset((prev) =>
      prev.filter((f) => f?.id !== viewSingleAd?.id)
    );

    // ✅ Update form's top-level MediaContent field
    const currentMedia = form.getFieldValue("MediaContent") || [];
    form.setFieldsValue({
      MediaContent: [...currentMedia, ...mapped],
    });

    form.validateFields(["MediaContent"]);
    setOpenCreativesDrawer(false);
  };

  let initialValues = {
    Website_URL: viewSingleAd?.Website_URL || "",
    Caption: viewSingleAd?.Caption || "",
    headline: viewSingleAd?.headline || "",
    Description: viewSingleAd?.Description || "",
    message: viewSingleAd?.message || "",
    page_id: viewSingleAd?.page_id || "",
    AddName: viewSingleAd?.AddName || "",
  };

  useEffect(() => {
    // console.log(viewSingleAd, "viewSingleAd in useEffect");
    // console.log(typeof viewSingleAd.filename, "viewSingleAd.filename type");
    // console.log(
    //   typeof viewSingleAd.filename === "object" &&
    //   viewSingleAd.filename !== null
    // );
    if (
      typeof viewSingleAd.filename === "object" &&
      viewSingleAd.filename !== null
    ) {
      if (viewSingleAd?.filename?.url) {
        setSelectedFiles([
          {
            uid: uuidv4(),
            name: viewSingleAd?.filename.url,
            status: "done",
            type: viewSingleAd?.filename?.url?.endsWith(".jpg")
              ? "image/jpg"
              : viewSingleAd?.filename?.url?.endsWith(".jpeg")
                ? "image/jpeg"
                : viewSingleAd?.filename.url?.endsWith(".png")
                  ? "image/png"
                  : "video/",
            url: viewSingleAd?.filename?.url,
          },
        ]);
        setSelectedFilesFromCreatives([
          {
            uid: uuidv4(),
            name: viewSingleAd?.filename?.url,
            status: "done",
            type: viewSingleAd?.filename?.url?.endsWith(".jpg")
              ? "image/jpg"
              : viewSingleAd?.filename?.url?.endsWith(".jpeg")
                ? "image/jpeg"
                : viewSingleAd?.filename.url?.endsWith(".png")
                  ? "image/png"
                  : "video/",
            url: viewSingleAd?.filename?.url,
          },
        ]);
        setSelectedFilesFromMedia([]);
        setSelectedOption("creative");
      } else {
        // console.log(
        //   viewSingleAd.filename,
        //   "viewSingleAd.filename in useEffect 1"
        // );
        setSelectedFiles([viewSingleAd.filename]);
        setSelectedFilesFromMedia([viewSingleAd.filename]);
        setSelectedOption("upload");
        setSelectedFilesFromCreatives([]);
      }
    } else {
      // console.log(
      //   viewSingleAd.filename,
      //   "viewSingleAd.filename in useEffect 2"
      // );
      setSelectedFiles([
        {
          uid: uuidv4(),
          name: viewSingleAd?.filename,
          status: "done",
          type: viewSingleAd?.filename?.endsWith(".jpg")
            ? "image/jpg"
            : viewSingleAd?.filename?.endsWith(".jpeg")
              ? "image/jpeg"
              : viewSingleAd?.filename.endsWith(".png")
                ? "image/png"
                : "video/",
          url: viewSingleAd?.filename,
        },
      ]);
      setSelectedFilesFromCreatives([
        {
          uid: uuidv4(),
          name: viewSingleAd?.filename,
          status: "done",
          type: viewSingleAd?.filename?.endsWith(".jpg")
            ? "image/jpg"
            : viewSingleAd?.filename?.endsWith(".jpeg")
              ? "image/jpeg"
              : viewSingleAd?.filename.endsWith(".png")
                ? "image/png"
                : "video/",
          url: viewSingleAd?.filename,
        },
      ]);
      setSelectedFilesFromMedia([]);
      setSelectedOption("creative");
    }
    form.setFieldsValue({
      Website_URL: viewSingleAd?.Website_URL || "",
      Caption: viewSingleAd?.Caption || "",
      headline: viewSingleAd?.headline || "",
      Description: viewSingleAd?.Description || "",
      message: viewSingleAd?.message || "",
      page_id: viewSingleAd?.page_id || "",
      AddName: viewSingleAd?.AddName || "",
    });
    setAddName(viewSingleAd?.AddName || "");
    setPrimaryText(viewSingleAd?.message || "");
    setHeadline(viewSingleAd?.headline || "");
    setCaption(viewSingleAd?.Caption || "");
    setDescription(viewSingleAd?.Description || "");
    setWebsiteURL(viewSingleAd?.Website_URL || "");
  }, [viewSingleAd]);

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={initialValues}
    //   style={{ maxWidth: 700, margin: "0 auto", padding: "1rem" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        {/* <div
            style={{
            display: "flex",
            justifyContent: "space-between",
            }}
        > */}
        <div style={{ flex: "70%", marginRight: "5%" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Form.Item
                label={<span style={{ color: "#B4B4B4" }}>Select source</span>}
                style={{ flex: 1 }}
              >
                <Select
                  disabled={selectedFiles.length > 0}
                  value={selectedOption || "creative"}
                  onChange={(value) => {
                    setSelectedOption(value);
                    form.validateFields(["MediaContent"]); // Revalidate when switching source
                  }}
                  style={{ marginBottom: 16 }}
                  dropdownClassName={theme === "dark" && "custom-dropdown"}
                  className={`${theme === "dark" ? "dark-theme" : "light-theme"
                    } green-border-select`}
                >
                  <Option value="upload">Upload</Option>
                  <Option value="creative">Creative library</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="MediaContent"
                rules={[
                  {
                    validator: async () => {
                      // Default to empty array if the value for the index is undefined
                      const mediaFiles = selectedFilesFromMedia || [];
                      const creativeFiles = selectedFilesFromCreatives || [];

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
                      display: selectedOption === "upload" ? "block" : "none",
                    }}
                  >
                    <Upload
                      beforeUpload={() => false}
                      //   disabled={isViewAdset}
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
                      //   onChange={(info) => {
                      //     const newFiles = info.fileList.map((file) => ({
                      //       ...file,
                      //       uid: file.uid || `-${Date.now()}`,
                      //       source: "media",
                      //       adsetId: viewSingleAd.id, // Include adset identifier in file
                      //       thumbUrl:
                      //         file.thumbUrl ||
                      //         (file.originFileObj
                      //           ? URL.createObjectURL(file.originFileObj)
                      //           : undefined),
                      //     }));

                      //     // Update selectedFiles (flat array)
                      //     setSelectedFiles((prev) => {
                      //       const existingUids = new Set(prev.map((f) => f.uid));
                      //       const updated = [
                      //         ...prev,
                      //         ...newFiles.filter((f) => !existingUids.has(f.uid)),
                      //       ];
                      //       return updated;
                      //     });

                      //     // Update selectedFilesFromMedia (flat array)
                      //     setSelectedFilesFromMedia((prev) => {
                      //       const existingUids = new Set(prev.map((f) => f.uid));
                      //       const updated = [
                      //         ...prev,
                      //         ...newFiles.filter((f) => !existingUids.has(f.uid)),
                      //       ];
                      //       return updated;
                      //     });

                      //     // Update form field
                      //     const formMedia =
                      //       form.getFieldValue([
                      //         "adsets",
                      //         index,
                      //         "MediaContent",
                      //       ]) || [];
                      //     const existingUidsInForm = new Set(
                      //       formMedia.map((f) => f.uid)
                      //     );
                      //     const updatedFormMedia = [
                      //       ...formMedia,
                      //       ...newFiles.filter(
                      //         (f) => !existingUidsInForm.has(f.uid)
                      //       ),
                      //     ];

                      //     form.setFieldsValue({
                      //       adsets: {
                      //         [index]: {
                      //           MediaContent: updatedFormMedia,
                      //         },
                      //       },
                      //     });

                      //     form.validateFields([
                      //       ["adsets", index, "MediaContent"],
                      //     ]);
                      //   }}

                      onChange={(info) => {
                        if (!info.fileList || info.fileList.length === 0)
                          return;
                        const newFiles = info.fileList.map((file) => ({
                          ...file,
                          id: uuidv4(),
                          uid: file.uid || `-${Date.now()}`,
                          source: "media",
                          adsetId: viewSingleAd.id,
                          thumbUrl:
                            file.thumbUrl ||
                            (file.originFileObj
                              ? URL.createObjectURL(file.originFileObj)
                              : undefined),
                        }));

                        if (!newFiles[0]) return;

                        // console.log(newFiles[0], "newFiles[0] in onChange");

                        setSelectedFiles((prev) => {
                          const existingUids = new Set(prev.map((f) => f.uid));
                          return [
                            ...prev,
                            ...newFiles.filter((f) => !existingUids.has(f.uid)),
                          ];
                        });

                        setSelectedFilesFromMedia((prev) => {
                          const existingUids = new Set(prev.map((f) => f.uid));
                          return [
                            ...prev,
                            ...newFiles.filter((f) => !existingUids.has(f.uid)),
                          ];
                        });
                        setNewAddLevelData((prevArray) =>
                          prevArray.map((ad) =>
                            ad.id === viewSingleAd.id
                              ? {
                                ...ad,
                                filename: newFiles[0],
                                uid: newFiles[0].uid,
                              }
                              : ad
                          )
                        );
                        const targetIndex = newAddLevelData.findIndex(
                          (item) => item.id === viewSingleAd.id
                        );

                        function insertAtIndex(array, index, newObject) {
                          // Clamp index to be within 0 and array.length
                          const safeIndex = Math.min(
                            Math.max(index, 0),
                            array.length
                          );

                          return [
                            ...array.slice(0, safeIndex), // elements before the insert position
                            newObject, // the new object to insert
                            ...array.slice(safeIndex), // elements from insert position onward
                          ];
                        }

                        // Usage in React state setter:
                        // setSelectedFilesFromAdset((prevArray) => {
                        //   const newObject =
                        //     {
                        //       ...newFiles[0],
                        //       id: viewSingleAd.id,
                        //       ...(viewSingleAd.Addid
                        //         ? { Addid: viewSingleAd.Addid }
                        //         : {}),
                        //     } || {};
                        //   const insertIndex = targetIndex; // dynamically set this as you like

                        //   return insertAtIndex(
                        //     prevArray,
                        //     insertIndex,
                        //     newObject
                        //   );
                        // });

                        // setSelectedFilesFromMediaFromAdset((prevArray) => [
                        //   ...prevArray,
                        //   {
                        //     ...newFiles[0],
                        //     id: viewSingleAd.id,
                        //     ...(viewSingleAd.Addid
                        //       ? { Addid: viewSingleAd.Addid }
                        //       : {}),
                        //     canDelete: false,
                        //   },
                        // ]);

                        setSelectedFilesFromAdset((prev) =>
                          prev.map((f) => {
                            if (f.id === viewSingleAd.id) {
                              return {
                                ...newFiles[0],
                                id: viewSingleAd.id,
                                ...(viewSingleAd.Addid
                                  ? { Addid: viewSingleAd.Addid }
                                  : {}),
                              };
                            } else {
                              return f;
                            }
                          })
                        );
                        setSelectedFilesFromMediaFromAdset((prev) => {
                          const index = prev.findIndex(
                            (f) => f.id === viewSingleAd.id
                          );

                          const newObject = {
                            ...newFiles[0],
                            id: viewSingleAd.id,
                            canDelete: viewSingleAd.Addid ? false : true,
                            ...(viewSingleAd.Addid
                              ? { Addid: viewSingleAd.Addid }
                              : {}),
                          };

                          if (index !== -1) {
                            // ID exists: update
                            return prev.map((f, i) =>
                              i === index ? newObject : f
                            );
                          } else {
                            // ID not found: append
                            return [...prev, newObject];
                          }
                        });

                        setSelectedFilesFromCreativesFromAdset((prev) =>
                          prev.filter((f) => f.id !== viewSingleAd.id)
                        );

                        // ✅ Ensure formMedia is always an array
                        const rawFormMedia = form.getFieldValue("MediaContent");
                        const formMedia = Array.isArray(rawFormMedia)
                          ? rawFormMedia
                          : [];

                        const existingUidsInForm = new Set(
                          formMedia.map((f) => f.uid)
                        );
                        const updatedFormMedia = [
                          ...formMedia,
                          ...newFiles.filter(
                            (f) => !existingUidsInForm.has(f.uid)
                          ),
                        ];

                        form.setFieldsValue({
                          MediaContent: updatedFormMedia,
                        });

                        form.validateFields(["MediaContent"]);
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

                      //   onRemove={(fileToRemove) => {
                      //     // Remove from selectedFilesFromMedia
                      //     setSelectedFilesFromMedia((prev) =>
                      //       prev.filter((f) => f.uid !== fileToRemove.uid)
                      //     );

                      //     // Remove from selectedFiles
                      //     setSelectedFiles((prev) =>
                      //       prev.filter((f) => f.uid !== fileToRemove.uid)
                      //     );

                      //     // Remove from form field
                      //     const updatedFormMedia = (
                      //       form.getFieldValue([
                      //         "adsets",
                      //         index,
                      //         "MediaContent",
                      //       ]) || []
                      //     ).filter((f) => f.uid !== fileToRemove.uid);

                      //     form.setFieldsValue({
                      //       adsets: {
                      //         [index]: {
                      //           MediaContent: updatedFormMedia,
                      //         },
                      //       },
                      //     });

                      //     form.validateFields([
                      //       ["adsets", index, "MediaContent"],
                      //     ]);

                      //     return true;
                      //   }}
                      //   multiple
                      onRemove={(fileToRemove) => {
                        // Remove from selectedFilesFromMedia
                        setSelectedFilesFromMedia((prev) =>
                          prev.filter((f) => f.uid !== fileToRemove.uid)
                        );

                        // Remove from selectedFiles
                        setSelectedFiles((prev) =>
                          prev.filter((f) => f.uid !== fileToRemove.uid)
                        );

                        // setSelectedFilesFromAdset((prev) =>
                        //   prev.filter((f) => f.id !== viewSingleAd.id)
                        // );

                        // setSelectedFilesFromMediaFromAdset((prev) =>
                        //   prev.filter((f) => f.id !== viewSingleAd.id)
                        // );

                        // Safely get MediaContent array from form (top-level, not nested)
                        const rawFormMedia = form.getFieldValue("MediaContent");
                        const formMedia = Array.isArray(rawFormMedia)
                          ? rawFormMedia
                          : [];

                        const updatedFormMedia = formMedia.filter(
                          (f) => f.uid !== fileToRemove.uid
                        );

                        // Directly update top-level MediaContent field
                        form.setFieldsValue({
                          MediaContent: updatedFormMedia,
                        });

                        // Validate
                        form.validateFields(["MediaContent"]);

                        return true;
                      }}
                      className={
                        theme === "dark" ? "upload-dark" : "upload-light"
                      }
                      maxCount={1}
                      fileList={selectedFilesFromMedia || []}
                      listType="picture"
                      accept="image/*, video/*"
                    >
                      <Button
                        disabled={selectedFiles.length > 0}
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
                        disabled={selectedFiles.length > 0}
                        icon={<UploadOutlined />}
                        onClick={() => {
                          onClickCreativesDrawer(viewSingleAd);
                        }}
                        className="dark-icon-button"
                        style={{
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                      >
                        Select files
                      </Button>

                      {selectedFilesFromCreatives?.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          {selectedFilesFromCreatives.map((file, index) => (
                            <div
                              key={index}
                              // style={{
                              //   display: "flex",
                              //   alignItems: "center",
                              //   marginBottom: 8,
                              // }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                width: 365,
                                marginTop: 10,
                                padding: 8,                         // ✅ space inside border
                                border: theme === "dark"
                                  ? "1px solid #444"
                                  : "1px solid #d9d9d9",            // ✅ light theme border
                                borderRadius: 6,                    // ✅ rounded corners
                                background: theme === "dark"
                                  ? "#1f1f1f"
                                  : "#fff",
                              }}
                            >
                              {/* <PaperClipOutlined style={{ marginRight: 8 }} /> */}
                              {/* <Tooltip title={file.name}> */}
                              {file.type?.startsWith("image/") ? (
                                <img
                                  src={
                                    file.originFileObj
                                      ? URL.createObjectURL(file.originFileObj)
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
                              ) : (
                                <video
                                  src={file.originFileObj
                                    ? URL.createObjectURL(file.originFileObj)
                                    : file.url}
                                  width={50}
                                  height={40}
                                  muted
                                  preload="metadata"
                                  style={{ borderRadius: 4, flexShrink: 0 }}
                                />
                              )}
                              <span
                                style={{
                                  // maxWidth: 160,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  paddingLeft: 8,
                                  color: theme === "dark" ? "#fff" : "#000",
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
                              {!isViewAdset && (
                                <DeleteOutlined
                                  onClick={() => {
                                    // 1. Remove from selectedFilesFromCreatives
                                    setSelectedFilesFromCreatives([]);

                                    // 2. Remove from selectedFiles
                                    setSelectedFiles([]);

                                    // 3. Update the top-level form field `MediaContent`
                                    const currentMedia =
                                      form.getFieldValue("MediaContent") || [];
                                    const updatedMedia = currentMedia.filter(
                                      (f) => f.uid !== file.uid
                                    );

                                    form.setFieldsValue({
                                      MediaContent: updatedMedia,
                                    });

                                    // 4. Validate only the `MediaContent` field
                                    form.validateFields(["MediaContent"]);
                                  }}
                                  style={{
                                    color: "red",
                                    marginLeft: 12,
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Form.Item>
            </div>

            <Form.Item
              name="page_id"
              initialValue={imagehash?.pageID}
              label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 3, marginLeft: "1%" }}
            >
              <Input
                style={{ width: "23%" }}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            </Form.Item>
          </div>
          <Form.Item
            name="AddName"
            initialValue={viewSingleAd.AddName || ""}
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
              onChange={(e) => onChangeAddNameForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
            />
          </Form.Item>
          <Form.Item
            //  label={<span style={{ color: "#B4B4B4" }}>Primary text</span>}
            name="message"
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
              onChange={(e) => onChangePrimaryTextForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
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
            label="Headline"
            name="headline"
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
              onChange={(e) => onChangeHeadlineForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
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
            initialValue={"Find More"}
          // tooltip="This is a required field"
          >
            <TextArea
              placeholder="Description"
              autoSize={{ minRows: 2, maxRows: 10 }}
              onChange={(e) => onChangeDescriptionForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
            />
          </Form.Item>
          <Form.Item
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
                  <span>Website_URL</span>
                  {/* <Tooltip
                    // title="This is a required field"
                    overlayInnerStyle={{
                      backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                      color: theme === "dark" ? "#ffffff" : "#000000",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: "14px",
                    }}
                  >
                    <QuestionCircleOutlined
                      style={{ marginLeft: 4, cursor: "pointer" }}
                    />
                  </Tooltip> */}
                </div>
                <EditOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => onClickEdit()}
                />
              </div>
            }
            labelCol={{ style: { width: "100%" } }} // Makes the label full width
            wrapperCol={{ style: { width: "100%" } }} // Ensures TextArea takes the same full width
            name="Website_URL"
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
              onChange={(e) => onChangeWebsiteURLForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
            />
          </Form.Item>
          <Form.Item
            label="Display Link"
            name="Caption"
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
              onChange={(e) => onChangeDisplayLinkForIndividualAd(e)}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
            />
          </Form.Item>
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

        <div style={{ flex: "30%" }}>
          {selectedFiles && selectedFiles.length > 0
            ? selectedFiles.map((file, i) => (
              <Badge
                key={i}
                count={
                  file?.url?.endsWith(".png") ||
                    file?.url?.endsWith(".jpg") ||
                    file?.url?.endsWith(".jpeg") ||
                    file?.url?.endsWith(".mp4") ? null : (
                    <EditOutlined
                      style={{
                        fontSize: "25px",
                        color: "#fff",
                      }}
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
                      backgroundColor: theme === "dark" ? "#4f4f4d" : "#fff",
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
                                  ? URL.createObjectURL(file.originFileObj)
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
                                ? URL.createObjectURL(file.originFileObj)
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
                                <GlobalOutlined style={{ opacity: "0.6" }} />
                              </>
                            ) : (
                              <GlobalOutlined style={{ opacity: "0.6" }} />
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

                    {/* <div className="ad-image"> */}
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
                          src={
                            file?.originFileObj
                              ? URL.createObjectURL(file.originFileObj)
                              : file?.url
                          }
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
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                    {/* </div> */}

                    {/* <div
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
                                  ? URL.createObjectURL(file.originFileObj)
                                  : file?.url
                              }
                            />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div> */}

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
                        <LikeOutlined style={{ fontSize: "20px" }} /> Like
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
                        <ShareAltOutlined style={{ fontSize: "20px" }} />{" "}
                        Share
                      </div>
                    </div>
                  </div>
                </div>
              </Badge>
            ))
            : null}
        </div>
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
        {/* </div> */}
      </div>
    </Form>
  );
};

const AdsetComponent = ({
  index,
  adset,
  imagehash,
  isViewAdset,
  viewCampaignData,
  campaignLevelDailyBudget,
  network,
  accountis,
  onClose,
  changeRRefrst,
}) => {
  const [dailyBudget, setDailyBudget] = useState(
    adset.Daily_amount ? adset.Daily_amount / 100 : 0
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const [addlevelData, setAddLevelData] = useState(adset.addlevel || []);
  const [newAddLevelData, setNewAddLevelData] = useState(adset.addlevel || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] =
    useState(false);
  // const [primaryText, setPrimaryText] = useState(
  //   adset.addlevel[0]?.message || ""
  // );
  const [primaryText, setPrimaryText] = useState(
    Array.isArray(adset?.addlevel?.[0]?.message)
      ? adset.addlevel[0].message
      : [adset?.addlevel?.[0]?.message || ""]
  );
  const [headline, setHeadline] = useState(
    Array.isArray(adset?.addlevel?.[0]?.headline)
      ? adset.addlevel[0].headline
      : [adset?.addlevel?.[0]?.headline || ""]
  );
  const [caption, setCaption] = useState(adset.addlevel[0]?.Caption || "");
  const [description, setDescription] = useState(
    Array.isArray(adset?.addlevel?.[0]?.Description)
      ? adset.addlevel[0].Description
      : [adset?.addlevel?.[0]?.Description || ""]
  );
  const [websiteURL, setWebsiteURL] = useState(
    adset.addlevel[0]?.Website_URL || ""
  );
  const [addName, setAddName] = useState(
    adset?.is_dynamic_creative ? adset.addlevel[0].AddName : adset.addlevel[0].AddName.split("_").slice(0, -1).join("_") || ""
  );
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [creativeIndex, setCreativeIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState("creative");
  const [editedImages, setEditedImages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(mapped(adset.addlevel));
  const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState(
    mapped(adset.addlevel)
  );
  const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState(
    getPositionsByKeys(adset.position || [])
  );
  const [submitErrors, setSubmitErrors] = useState([]);
  const [formValues, setFormValues] = useState(null);
  const [selectedPublishers, setSelectedPublishers] = useState(
    adset.publisher_platforms || []
  ); // Initialize as an empty object
  const [drawerVisible, setDrawerVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewSingleAd, setViewSingleAd] = useState({});

  // console.log(selectedPositions, "selectedPositions in adset component");
  // console.log(adset.id, "adset id in adset component");
  // console.log(selectedPublishers, "selectedPublishers in adset component");
  // console.log(selectedPositions);
  // console.log(adset, "adset in adset component");
  const [form] = Form.useForm();
  const { theme } = useTokenContext();
  // console.log(isModalVisible);
  // console.log(selectedFiles, "selectedFiles in adset component");
  // console.log(
  //   selectedFilesFromMedia,
  //   "selectedFilesFromMedia in adset component"
  // );
  // console.log(
  //   selectedFilesFromCreatives,
  //   "selectedFilesFromCreatives in adset component"
  // );
  // console.log(viewSingleAd, "viewSingleAd in adset component");
  // console.log(
  //   viewSingleAd &&
  //   console.log(viewSingleAd, "viewSingleAd ---- in adset component")
  // );
  // console.log(addlevelData, "addlevelData in adset component");
  // console.log(newAddLevelData, "newAddLevelData in adset component");

  const closeDrawer = () => {
    setDrawerVisible(false);
    setOpenCreativesDrawer(false);
    setCreativeIndex(null);
    setSelectedFiles([]);
    setSelectedFilesFromCreatives([]);
    setSelectedFilesFromMedia([]);
    setEditedImages({});
    setSelectedPositions([]);
    setSelectedPublishers([]);
    setIsModalVisibleForURLBuilder(false);
    form.resetFields(); // Reset the form fields
    onClose(); // Call the onClose function passed as a prop
  };

  const onReturnUrl = (text) => {
    setIsModalVisibleForURLBuilder(false);
    setWebsiteURL(text);
    // const currentAdsets = form.getFieldValue("adsets") || [];
    // const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      setNewAddLevelData((prev) => {
        return prev.map((item, idx) => ({
          ...item,
          Website_URL: text,
          Caption: text.split("//")[1].split("/")[0],
        }));
      });

      // updatedAdsets[index] = {
      //     ...updatedAdsets[index],
      //     Website_URL: text,
      //     Caption: text.split('//')[1].split("/")[0],
      // };
      form.setFieldsValue({
        Website_URL: text,
        Caption: text.split("//")[1].split("/")[0],
      });
    } else {
      setCaption(text.split("/")[0]);
      form.setFieldsValue({ Website_URL: text, Caption: text.split("/")[0] });
      // updatedAdsets[index] = {
      //     ...updatedAdsets[index],
      //     Website_URL: text,
      //     Caption: text.split('/')[0],
      // };
      setNewAddLevelData((prev) => {
        return prev.map((item, idx) => ({
          ...item,
          Website_URL: text,
          Caption: text.split("/")[0],
        }));
      });
    }

    // Update the form with the new adsets
    // form.setFieldsValue({
    //     adsets: updatedAdsets
    // });

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

  function extractValuesByPartialLabel(dataArray, labelName) {
    // console.log(dataArray, labelName);
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

  const getUrlBuilder = useMemo(() => {
    switch (network) {
      case "FB_Mnet":
        return (
          <MnetUrlBuilder
            defaultValues={websiteURL}
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_Tonic1":
        return (
          <TonicUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
            defaultValues={websiteURL}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
            defaultValues={websiteURL}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            accountis={accountis}
            onReturnMessage={onReturnUrl}
            defaultValues={websiteURL}
          />
        );
    }
  }, [network, accountis, onReturnUrl]);

  const handleOk = async () => {
    // setLoading(true); // Start the spinner
    // setIsModalVisible(false); // Close the modal
    // console.log("Form Values:", formValues);
    // console.log("SelectedFiles:", selectedFiles);
    // console.log("adMediaData:", adMediaData);
    // console.log("MultipleAdsestsFetching", await MultipleAdsestsFetching(formValues));
    // console.log(selectedPositions, "selectedPositions");

    // abcd
    // const campaignData = await MultipleAdsestsFetching(formValues);
    // console.log("Campaign Data:", campaignData);
    // const newAdsetData = {};

    // efgh

    const getFilenameDeatials = async (file) => {
      // console.log(file, "file in getFilenameDeatials");
      const token = viewCampaignData?.camapaignlevel?.access_token;
      let mediaHashArray = {};
      const onSuccess = (status, response) => {
        // console.log("Upload success:", response);
      };

      const onError = (status, error) => {
        console.error("Upload error:", error);
      };
      let fileBlob = null;
      let s3FileUrl = null;
      const folderPath = `${network}/${viewCampaignData.Account_Number}/${viewCampaignData.campaign_name}`;
      const uploadFileToS3 = async (fileBlob, fileName, folderPath) => {
        const fullPath = `${folderPath}/${fileName}`;
        const formData = new FormData();
        formData.append("file", fileBlob, fileName);
        formData.append("filename", fullPath); // required in body

        try {
          const response = await fetch(
            "https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
            {
              method: "POST",
              headers: {
                Authorization: localStorage.getItem("token"),
                username: imagehash.username || "default-user", // required in headers
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

      if (file?.url) {
        // console.log(file, "file in getFilenameDeatials with url");
        const response = await fetch(
          `https://app.vyaktimetrics.com/creatives/userfiles/s3?s3Url=${file.url}`,
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
            `https://graph.facebook.com/v20.0/act_${viewCampaignData?.Account_Number}/adimages`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (fbResponse.status === 200) {
            onSuccess("ok", fbResponse);
            mediaHashArray = {
              filename: s3FileUrl,
              imag_hash: fbResponse.data?.images?.[fileName]?.hash,
            };
          } else {
            onError("error", fbResponse);
            console.error("Image upload failed");
          }
        } else if (file.url.endsWith(".mp4")) {
          fbResponse = await axios.post(
            `https://graph.facebook.com/v20.0/act_${viewCampaignData?.Account_Number}/advideos`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (fbResponse.status === 200) {
            const videoid = fbResponse?.data?.id;
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const thumbnailResponse = await axios.get(
              `https://graph.facebook.com/v20.0/${videoid}`,
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
            mediaHashArray = {
              filename: s3FileUrl,
              videoid: videoid,
              thambnailurl: uri,
            };
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

          //   if (!response.data.imageUrl) {
          //     onError("Error: Image URL not returned from custom API");
          //     console.error(
          //       "Image upload to custom API failed, imageUrl missing"
          //     );
          //     continue;
          //   }

          fbResponse = await axios.post(
            `https://graph.facebook.com/v20.0/act_${viewCampaignData?.Account_Number}/adimages`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (response.status === 200 && fbResponse.status === 200) {
            onSuccess("ok", response);
            mediaHashArray = {
              filename: s3FileUrl,
              imag_hash: fbResponse.data?.images?.[safeName]?.hash,
            };
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

          //   if (response.status !== 200) {
          //     onError("error", response);
          //     console.error("Video upload to custom API failed");
          //     continue;
          //   }

          fbResponse = await axios.post(
            `https://graph.facebook.com/v20.0/act_${viewCampaignData?.Account_Number}/advideos`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (fbResponse.status === 200) {
            const videoid = fbResponse?.data?.id;
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const thumbnailResponse = await axios.get(
              `https://graph.facebook.com/v20.0/${videoid}`,
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
            mediaHashArray = {
              filename: s3FileUrl,
              videoid: videoid,
              thambnailurl: uri,
            };
          } else {
            onError("error", fbResponse);
            console.error("Video upload to Facebook failed");
          }
        }
      }
      return mediaHashArray;
    };

    // console.log("Form Values:", formValues);
    // console.log(addlevelData, "addlevelData in adset component");
    // console.log(newAddLevelData, "newAddLevelData in adset component");
    // console.log("Selected Files:", selectedFiles);
    // console.log(viewSingleAd, "viewSingleAd in adset component");
    // console.log(viewCampaignData, "viewCampaignData in adset component");
    // console.log(adset, "adset in adset component");
    let re_lunch = false;

    const newAddLevel = await Promise.all(
      newAddLevelData.map(async (item) => {
        // console.log(item, "item in newAddLevel");
        const getItem = addlevelData.find((i) => i.id === item.id) || {};
        if (Object.keys(getItem).length > 0) {
          const newUpdatedAd = { id: item.id, page_id: item.page_id };
          if (Object.keys(getItem).length > 0 && item.Addid) {
            newUpdatedAd["Addid"] = item.Addid;
          }
          if (Object.keys(getItem).length > 0 && item.Ad_Status) {
            newUpdatedAd["Ad_Status"] = item.Ad_Status;
          }
          if (Object.keys(getItem).length > 0 && item.status) {
            newUpdatedAd["status"] = item.status;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.message === getItem.message
          ) {
            newUpdatedAd["message"] = item.message;
          } else {
            newUpdatedAd["message"] = item.message;
            newUpdatedAd["re_lunch"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.headline === getItem.headline
          ) {
            newUpdatedAd["headline"] = item.headline;
          } else {
            newUpdatedAd["headline"] = item.headline;
            newUpdatedAd["re_lunch"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.Description === getItem.Description
          ) {
            newUpdatedAd["Description"] = item.Description;
          } else {
            newUpdatedAd["Description"] = item.Description;
            newUpdatedAd["re_lunch"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.Caption === getItem.Caption
          ) {
            newUpdatedAd["Caption"] = item.Caption;
          } else {
            newUpdatedAd["Caption"] = item.Caption;
            newUpdatedAd["re_lunch"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.Website_URL === getItem.Website_URL
          ) {
            newUpdatedAd["Website_URL"] = item.Website_URL;
          } else {
            newUpdatedAd["Website_URL"] = item.Website_URL;
            newUpdatedAd["re_lunch"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.AddName === getItem.AddName
          ) {
            newUpdatedAd["AddName"] = item.AddName;
          } else {
            newUpdatedAd["AddName"] = item.AddName;
            newUpdatedAd["re_lunch_addname"] = true;
            re_lunch = true;
          }
          if (
            Object.keys(getItem).length > 0 &&
            item.filename === getItem.filename
          ) {
            newUpdatedAd["filename"] = item.filename;
            if (item.imag_hash) {
              newUpdatedAd["imag_hash"] = item.imag_hash;
            } else {
              newUpdatedAd["videoid"] = getItem.videoid;
              newUpdatedAd["thambnailurl"] = getItem.thambnailurl;
            }
          } else {
            re_lunch = true;
            newUpdatedAd["filename"] = item.filename;
            const updatedFilesDeatils = await getFilenameDeatials(
              item.filename
            );
            if (Object.keys(updatedFilesDeatils).length > 0) {
              if (updatedFilesDeatils.imag_hash) {
                newUpdatedAd["imag_hash"] = updatedFilesDeatils.imag_hash;
                newUpdatedAd["filename"] = updatedFilesDeatils.filename;
                newUpdatedAd["re_lunch"] = true;
              } else if (updatedFilesDeatils.videoid) {
                newUpdatedAd["videoid"] = updatedFilesDeatils.videoid;
                newUpdatedAd["thambnailurl"] = updatedFilesDeatils.thambnailurl;
                newUpdatedAd["filename"] = updatedFilesDeatils.filename;
                newUpdatedAd["re_lunch"] = true;
              }
            }
          }
          return newUpdatedAd;
        } else {
          const fileData = await getFilenameDeatials(item.filename);
          re_lunch = true;
          const newAd = {
            id: item.id,
            page_id: item.page_id,
            message: item.message,
            headline: item.headline,
            Description: item.Description,
            Caption: item.Caption,
            Website_URL: item.Website_URL,
            AddName: item.AddName,
          };
          if (Object.keys(fileData).length > 0 && fileData.imag_hash) {
            newAd["imag_hash"] = fileData.imag_hash;
            newAd["filename"] = fileData.filename;
          }
          if (Object.keys(fileData).length > 0 && fileData.videoid) {
            newAd["videoid"] = fileData.videoid;
            newAd["filename"] = fileData.filename;
            newAd["thambnailurl"] = fileData.thambnailurl;
          }
          return newAd;
        }
      })
    );

    // console.log("New Add Level Data:", newAddLevel);

    let AdsetsData = { id: adset.id, buying_type: "AUCTION" };
    if (adset.Adsetid) {
      AdsetsData["Adsetid"] = adset.Adsetid;
    }
    if (adset.Status) {
      AdsetsData["Status"] = adset.Status;
    }
    if (adset["re_lunch_adsetname"]) {
      AdsetsData["re_lunch_adsetname"] = adset["re_lunch_adsetname"];
    }
    if (adset["re_lunch_bid_amount"]) {
      AdsetsData["re_lunch_bid_amount"] = adset["re_lunch_bid_amount"];
    }
    if (adset["re_lunch_daily_amount"]) {
      AdsetsData["re_lunch_daily_amount"] = adset["re_lunch_daily_amount"];
    }
    if (adset["re_lunch_targeting"]) {
      AdsetsData["re_lunch_targeting"] = adset["re_lunch_targeting"];
    }
    if (adset.Adsetid && adset.AdsetName !== formValues.AdsetName) {
      AdsetsData["AdsetName"] = formValues.AdsetName;
      AdsetsData["re_lunch_adsetname"] = true;
      re_lunch = true;
    } else {
      AdsetsData["AdsetName"] = formValues.AdsetName;
    }
    if (
      adset.Adsetid &&
      adset.bid_amount &&
      adset.bid_amount / 100 !== formValues.bid_amount
    ) {
      AdsetsData["bid_amount"] = parseFloat(formValues.bid_amount) * 100;
      AdsetsData["re_lunch_bid_amount"] = true;
      re_lunch = true;
    } else {
      AdsetsData["bid_amount"] = parseFloat(formValues.bid_amount) * 100 || 0;
    }
    if (
      adset.Adsetid &&
      adset.Daily_amount &&
      adset.Daily_amount !==
      (formValues.DailyAdd_amount
        ? parseFloat(formValues.DailyAdd_amount) * 100
        : "")
    ) {
      AdsetsData["Daily_amount"] = formValues.DailyAdd_amount
        ? parseFloat(formValues.DailyAdd_amount) * 100
        : "";
      AdsetsData["re_lunch_daily_amount"] = true;
      re_lunch = true;
    } else {
      AdsetsData["Daily_amount"] = formValues.DailyAdd_amount
        ? parseFloat(formValues.DailyAdd_amount) * 100
        : "";
    }
    if (adset.Adsetid) {
      AdsetsData["optimization_goal"] = adset.optimization_goal;
      AdsetsData["billing_event"] = adset.billing_event;
      AdsetsData["start_time"] = adset.start_time;
      AdsetsData["action_source"] = adset.action_source;
      AdsetsData["custom_event_type"] = adset.custom_event_type;
      AdsetsData["pixel_id"] = adset.pixel_id;
    } else {
      AdsetsData["optimization_goal"] = formValues.optimization_goal;
      AdsetsData["billing_event"] = formValues.billing_event;
      AdsetsData["start_time"] = moment(formValues.DatePicker.$d)
        .tz(imagehash.timeZone)
        .format("YYYY-MM-DDTHH:mm:ssZ");
      AdsetsData["action_source"] = formValues.action_source;
      AdsetsData["custom_event_type"] = formValues.custom_event_type;
      AdsetsData["pixel_id"] = formValues.pixel_id;
    }
    if (
      adset.Adsetid &&
      adset.countries &&
      adset.countries !== formValues.countries
    ) {
      AdsetsData["countries"] = formValues.countries;
      AdsetsData["re_lunch_targeting"] = true;
      re_lunch = true;
    } else {
      AdsetsData["countries"] = formValues.countries;
    }
    if (
      adset.Adsetid &&
      adset.Min_Age &&
      adset.Min_Age !== formValues.Min_Age
    ) {
      AdsetsData["Min_Age"] = formValues.Min_Age;
      AdsetsData["re_lunch_targeting"] = true;
      re_lunch = true;
    } else {
      AdsetsData["Min_Age"] = formValues.Min_Age;
    }
    if (
      adset.Adsetid &&
      adset.Max_Age &&
      adset.Max_Age !== formValues.Max_Age
    ) {
      AdsetsData["Max_Age"] = formValues.Max_Age;
      AdsetsData["re_lunch_targeting"] = true;
      re_lunch = true;
    } else {
      AdsetsData["Max_Age"] = formValues.Max_Age;
    }
    if (
      adset.Adsetid &&
      adset.locales &&
      JSON.stringify(adset.locales) !== JSON.stringify(formValues.Language)
    ) {
      AdsetsData["locales"] = formValues.Language;
      AdsetsData["re_lunch_targeting"] = true;
      re_lunch = true;
    } else {
      AdsetsData["locales"] = formValues.Language;
    }
    if (
      adset.Adsetid &&
      adset.Gender &&
      adset.Gender !== parseInt(formValues.Gender)
    ) {
      AdsetsData["Gender"] = parseInt(formValues.Gender);
      AdsetsData["re_lunch_targeting"] = true;
      re_lunch = true;
    } else {
      AdsetsData["Gender"] = parseInt(formValues.Gender);
    }
    if (adset.Adsetid && adset.placements) {
      // console.log(adset.placements, "adset placements in adset component");
      if (
        adset.placements === "Advance" &&
        formValues.placements === "Advance"
      ) {
        AdsetsData["placements"] = formValues.placements;
      } else if (
        adset.placements === "manual" &&
        formValues.placements === "Advance"
      ) {
        AdsetsData["placements"] = formValues.placements;
        AdsetsData["re_lunch_targeting"] = true;
        re_lunch = true;
      } else if (
        adset.placements === "Advance" &&
        formValues.placements === "manual"
      ) {
        AdsetsData["placements"] = formValues.placements;
        AdsetsData["Facebook_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Facebook") || [];
        AdsetsData["instagram_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Instagram") || [];
        AdsetsData["audience_network_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Audience") || [];
        AdsetsData["messenger_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Messenger") || [];
        AdsetsData["position"] = formValues.positions.map((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            if ("key" in item) return item.key;
            if ("value" in item) return item.value;
            return null; // optional: return null if neither exists
          }
          return item;
        });
        AdsetsData["device_platforms"] = formValues.device_platforms;

        AdsetsData["re_lunch_targeting"] = true;
        re_lunch = true;
      } else if (
        adset.placements === "manual" &&
        formValues.placements === "manual"
      ) {
        // console.log(adset.placements);
        AdsetsData["placements"] = formValues.placements;
        if (
          JSON.stringify(adset.publisher_platforms) !==
          JSON.stringify(formValues.platforms)
        ) {
          AdsetsData["publisher_platforms"] = formValues.platforms;
          AdsetsData["re_lunch_targeting"] = true;
          re_lunch = true;
        } else {
          AdsetsData["publisher_platforms"] = formValues.platforms;
        }
        if (
          JSON.stringify(adset.Facebook_positions) !==
          JSON.stringify(
            extractValuesByPartialLabel(selectedPositions, "Facebook")
          )
        ) {
          AdsetsData["Facebook_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Facebook") || [];
          AdsetsData["re_lunch_targeting"] = true;
          re_lunch = true;
        } else {
          AdsetsData["Facebook_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Facebook") || [];
        }
        if (
          JSON.stringify(adset.instagram_positions) !==
          JSON.stringify(
            extractValuesByPartialLabel(selectedPositions, "Instagram")
          )
        ) {
          AdsetsData["instagram_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Instagram") || [];
          AdsetsData["re_lunch_targeting"] = true;
        } else {
          AdsetsData["instagram_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Instagram") || [];
        }
        if (
          JSON.stringify(adset.audience_network_positions) !==
          JSON.stringify(
            extractValuesByPartialLabel(selectedPositions, "Audience")
          )
        ) {
          AdsetsData["audience_network_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Audience") || [];
          AdsetsData["re_lunch_targeting"] = true;
          re_lunch = true;
        } else {
          AdsetsData["audience_network_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Audience") || [];
        }
        if (
          JSON.stringify(adset.messenger_positions) !==
          JSON.stringify(
            extractValuesByPartialLabel(selectedPositions, "Messenger")
          )
        ) {
          AdsetsData["messenger_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Messenger") || [];
          AdsetsData["re_lunch_targeting"] = true;
          re_lunch = true;
        } else {
          AdsetsData["messenger_positions"] =
            extractValuesByPartialLabel(selectedPositions, "Messenger") || [];
        }
        AdsetsData["position"] = formValues.positions.map((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            if ("key" in item) return item.key;
            if ("value" in item) return item.value;
            return null; // optional: return null if neither exists
          }
          return item;
        });
        if (
          JSON.stringify(adset.device_platforms) !==
          JSON.stringify(formValues.device_platforms)
        ) {
          AdsetsData["device_platforms"] = formValues.device_platforms;
          AdsetsData["re_lunch_targeting"] = true;
          re_lunch = true;
        } else {
          AdsetsData["device_platforms"] = formValues.device_platforms;
        }
      }
    } else {
      AdsetsData["placements"] = formValues.placements;
      if (formValues.placements === "manual") {
        AdsetsData["publisher_platforms"] = formValues.platforms;
        AdsetsData["Facebook_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Facebook") || [];
        AdsetsData["instagram_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Instagram") || [];
        AdsetsData["audience_network_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Audience") || [];
        AdsetsData["messenger_positions"] =
          extractValuesByPartialLabel(selectedPositions, "Messenger") || [];
        AdsetsData["position"] = formValues.positions.map((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            if ("key" in item) return item.key;
            if ("value" in item) return item.value;
            return null; // optional: return null if neither exists
          }
          return item;
        });
        AdsetsData["device_platforms"] = formValues.device_platforms;
      }
    }

    AdsetsData["addlevel"] = newAddLevel;

    // console.log("Adsets Data:", AdsetsData);

    try {
      if (AdsetsData) {
        const token = localStorage.getItem("token");
        // console.log("Campaign Data:", campaignData);
        //https://www.testapi.adsgoat.in
        const response = await fetch(
          //https://www.testapi.adsgoat.in
          "https://www.testapi.adsgoat.in/api/neweditAdset",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              adsetId: adset.id,
              identifier: viewCampaignData?.identifier,
              updatedAdsetObject: AdsetsData,
              re_launch: re_lunch,
            }),
          }
        );

        if (response.ok) {
          message.success("Campaign created successfully");
          // console.log("Form data submitted successfully");
          setLoading(false); // Stop the spinner
          setSelectedFilesFromCreatives([]);
          setSelectedFilesFromMedia([{}]);
          setSelectedFiles([{}]);
          onClose();
          setSelectedPositions([]);
          form.resetFields(); // Reset the form fields
          changeRRefrst && changeRRefrst(); // Call the changeRRefrst function if it exists
          // setAdsets([{ id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "Adset 1" }]);
          // isManual !== "manual" && setIsManual(false);
          // newSelectedRef.current = null; // Reset the newSelectedRef
        } else {
          console.error("Failed to submit form data");
        }
      }
    } catch (error) {
      console.error("Error during campaign creation:", error);
      message.error("An error occurred while creating the campaign.");
    } finally {
      setLoading(false); // Stop the spinner after the process is complete
    }

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
      // console.log({
      //   publisher_platforms: values.publisher_platforms,
      //   ...selectedPlatforms,
      //   ...values,
      // });

      // setIsModalVisible(true);
      setFormValues({
        publisher_platforms: values.publisher_platforms,
        ...selectedPlatforms,
        ...values,
      });
    }
    // setIsModalVisible(true);
  };

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
    const publishers = selectedPublishers || [];

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

  const handlePublisherChange = (value) => {
    setSelectedPublishers(value);

    // Optionally reset selected positions for this adset
    // setSelectedPositions(prev => ({
    //     ...prev,
    //     [adset.id]: [] // clear when publishers change
    // }));
  };

  const handleCancelForURLBuilder = () => {
    setIsModalVisibleForURLBuilder(false);
  };

  const onClickCreativesDrawer = (adset, index) => {
    // console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
    setCreativeIndex(adset.id);
  };

  const handlePositionChange = (values, options) => {
    // console.log(values, "values");
    // console.log(options, "options");
    const formatted = options.map((opt) => ({
      key: opt.value,
      label: opt.label || opt.children,
    }));
    // console.log(formatted, "formatted positions");
    setSelectedPositions(formatted);
    // setSelectedPositions(prevState => ({
    //     ...prevState, // Spread the previous state to preserve other entries
    //     [adset.id]: formatted // Set the formatted array at the specific index
    // }));
  };

  const onClickEdit = (index) => {
    setIsModalVisibleForURLBuilder(true);
  };

  const customRequest = async (data, index, onSuccess, onError, id) => {
    if (!imagehash || imagehash.length === 0) {
      onError("Image hash data not loaded");
      return [];
    }
    const token = imagehash.token;
    const account = imagehash.accountNumber;

    const createS3Folder = async (folderPath) => {
      try {
        const response = await fetch(
          "https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("token"),
              username: imagehash.username || "default-user",
              "x-folder": folderPath.endsWith("/")
                ? folderPath
                : folderPath + "/",
              "x-action": "create-folder",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to create folder");
        const data = await response.json();
        // console.log("Folder created:", folderPath);
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
          "https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("token"),
              username: imagehash.username || "default-user", // required in headers
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

          const folderPath = `${network}/${imagehash.accountNumber}/${formValues ? formValues.Name : "Drafts"
            }`;
          await createS3Folder(folderPath);
          let fileBlob = null;
          let s3FileUrl = null;

          if (file?.url) {
            const response = await fetch(
              `https://app.vyaktimetrics.com/creatives/userfiles/s3?s3Url=${file.url}`,
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
                `https://graph.facebook.com/v20.0/act_${account}/adimages`,
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
                `https://graph.facebook.com/v20.0/act_${account}/advideos`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (fbResponse.status === 200) {
                const videoid = fbResponse?.data?.id;
                await new Promise((resolve) => setTimeout(resolve, 10000));

                const thumbnailResponse = await axios.get(
                  `https://graph.facebook.com/v20.0/${videoid}`,
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
                `https://graph.facebook.com/v20.0/act_${account}/adimages`,
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
                `https://graph.facebook.com/v20.0/act_${account}/advideos`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (fbResponse.status === 200) {
                const videoid = fbResponse?.data?.id;
                await new Promise((resolve) => setTimeout(resolve, 10000));

                const thumbnailResponse = await axios.get(
                  `https://graph.facebook.com/v20.0/${videoid}`,
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
      if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
        mediaHashArray = await uploadFilesSequentially(selectedFiles);
      }
      // console.log(
      //   "All media files uploaded successfully. Media Hash Array:",
      //   mediaHashArray
      // );
      return mediaHashArray;
    } catch (error) {
      console.error("One or more media uploads failed:", error);
      return [];
    }
  };

  const MultipleAdsestsFetching = async (values) => {
    // let AllAdsetsData = {
    //     campaign_name: values.Name,
    //     Account_Number: values.Account_Number,
    //     Approval: "PENDING_APPROVAL",
    //     fbstatus: "No-Live",
    //     camapaignlevel: {
    //         createdby: session?.user?.name,
    //         Name: values.Name,
    //         Objectives: values.Objectives,
    //         Special_categories: values.Special_categories,
    //         Bid_strategy: values.Bid_strategy,
    //         Daily_amount: parseFloat(values.Daily_amount) * 100,
    //         Status: values.Status,
    //         access_token: imagehash.token,
    //         createdDate: moment().tz(imagehash.timeZone).format('YYYY-MM-DD')
    //     },
    // };
    const onSuccess = (status, response) => {
      // console.log("Upload success:", response);
    };

    const onError = (status, error) => {
      console.error("Upload error:", error);
    };

    // for (let i = 0; i < values.adsets.length; i++) {
    let AdsetsData = {};

    const imageHashArray = await customRequest(
      selectedFiles,
      onSuccess,
      onError
    );
    const addLevelData = imageHashArray.map((media, index) => {
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
    AdsetsData = {
      id: uuidv4(),
      AdsetName: values.AdsetName,
      Daily_amount: values.DailyAdd_amount
        ? parseFloat(values.DailyAdd_amount) * 100
        : "",
      optimization_goal: values.optimization_goal,
      billing_event: values.billing_event,
      start_time: moment(values.DatePicker.$d)
        .tz(imagehash.timeZone)
        .format("YYYY-MM-DDTHH:mm:ssZ"), //values.DatePicker.$d
      action_source: values.action_source,
      custom_event_type: values.custom_event_type,
      pixel_id: values.pixel_id,
      bid_amount: values.bid_amount ? parseFloat(values.bid_amount) * 100 : 0,
      countries: values.countries,
      Min_Age: values.Min_Age,
      Max_Age: values.Max_Age,
      Gender: parseInt(values.Gender),
      locales: values.Language,
      placements: values.placements,
      ...(values.placements !== "Advance" && {
        publisher_platforms: values.platforms,
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
      addlevel: addLevelData,
    };
    // AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
    // };
    return AdsetsData;
  };

  // const tooltipMsg = isCampaignBudgetActive
  //     ? 'You have enabled daily budget in the campaign level'
  //     : isAnyAdsetBudgetSet
  //         ? 'You have enabled daily budget in the Adset Level'
  //         : '';

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
      id: uuidv4(),
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
      adsetId, // optional: keep if you want to identify source later
    }));

    const getNextAddNumber = (prev) => {
      const numbers = prev
        .map((item) => {
          const parts = item.AddName?.split("_");
          const lastPart = parts?.[parts.length - 1]; // Get the last part
          return lastPart ? parseInt(lastPart, 10) : 0;
        })
        .filter((n) => !isNaN(n));

      const max = numbers.length > 0 ? Math.max(...numbers) : 0;
      return max + 1;
    };

    // ✅ Set flat array (no adsetId nesting)
    setSelectedFilesFromCreatives((prev) => [...prev, ...mapped]);
    setSelectedFiles((prev) => [...prev, ...mapped]);
    setNewAddLevelData((prev) => {
      const nextAddNumber = getNextAddNumber(prev); // e.g., 3

      const mappedWithAddName = mapped.map((item, i) => ({
        id: item.id,
        AddName: `${addName}_${nextAddNumber + i}`,
        filename: item,
        page_id: form.getFieldValue("page_id"),
        message: primaryText,
        headline: headline,
        Description: description, // Add_3, Add_4, etc.
        Caption: caption,
        Website_URL: websiteURL,
      }));

      return [...prev, ...mappedWithAddName];
    });

    // ✅ Update form's top-level MediaContent field
    const currentMedia = form.getFieldValue("MediaContent") || [];
    form.setFieldsValue({
      MediaContent: [...currentMedia, ...mapped],
    });

    form.validateFields(["MediaContent"]);
    setOpenCreativesDrawer(false);
  };

  // useEffect(() => {
  //     const creatives = selectedFilesFromCreatives?.[adset.id];
  //     if (Array.isArray(creatives) && creatives.length > 0) {
  //         setSelectedOption("creative");
  //     } else {
  //         setSelectedOption("upload");
  //     }
  // }, [selectedFilesFromCreatives, adset.id]);

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
    if (selectedFilesFromCreatives.length > 0) {
      setSelectedOption("creative");
    } else if (selectedFilesFromMedia.length > 0) {
      setSelectedOption("upload");
    } else {
      setSelectedOption("creative");
    }
  }, [selectedFilesFromCreatives, selectedFilesFromMedia]);

  const updateTheNewAddLevelData = (data) => {
    setNewAddLevelData((prev) => {
      // Deduplicate: Collect IDs that are already in AddLevel
      const existingIdsInAddLevel = new Set(prev.map((item) => item.id));

      // Only keep files that are not already present in AddLevel data
      const filteredNew = data.filter(
        (file) => !existingIdsInAddLevel.has(file.id)
      );

      // Utility: Find the next Add number
      const getNextAddNumber = () => {
        const numbers = prev
          .map((item) => {
            const parts = item.AddName?.split("_");
            const lastPart = parts?.[parts.length - 1];
            return lastPart ? parseInt(lastPart, 10) : 0;
          })
          .filter((n) => !isNaN(n));
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;
        return max + 1;
      };

      const nextAddNumber = getNextAddNumber();

      // Map filtered-new files to new AddLevel data objects
      const mappedWithAddName = filteredNew.map((item, i) => ({
        id: item.id,
        AddName: `${addName}_${nextAddNumber + i}`,
        filename: item,
        page_id: form.getFieldValue("page_id"),
        message: primaryText,
        headline: headline,
        Description: description,
        Caption: caption,
        Website_URL: websiteURL,
      }));

      // Return the new state by appending only unique, new files
      return [...prev, ...mappedWithAddName];
    });
  };

  //   const updateTheNewAddLevelData = (data) => {
  //     const getNextAddNumber = (prev) => {
  //       const numbers = prev
  //         .map((item) => {
  //           const parts = item.AddName?.split("_");
  //           const lastPart = parts?.[parts.length - 1]; // Get the last part
  //           return lastPart ? parseInt(lastPart, 10) : 0;
  //         })
  //         .filter((n) => !isNaN(n));

  //       const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  //       return max + 1;
  //     };
  //     setNewAddLevelData((prev) => {
  //       const existingIdsInAddLevel = new Set(selectedFiles.map((f) => f.id));

  //       const alreadyInSelected = new Set(selectedFiles.map((f) => f.uid));

  //       const trulyNewFiles = data.filter((f) => !alreadyInSelected.has(f.uid));

  //       const filteredNew = trulyNewFiles.filter(
  //         (file) => !existingIdsInAddLevel.has(file.id)
  //       );

  //       const nextAddNumber = getNextAddNumber(prev);

  //       const mappedWithAddName = filteredNew.map((item, i) => ({
  //         id: item.id,
  //         AddName: `${addName}_${nextAddNumber + i}`,
  //         filename: item,
  //         page_id: form.getFieldValue("page_id"),
  //         message: primaryText,
  //         headline: headline,
  //         Description: description,
  //         Caption: caption,
  //         Website_URL: websiteURL,
  //       }));

  //       return [...prev, ...mappedWithAddName];
  //     });
  //   };
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
  //     if (adset?.DailyAdd_amount !== undefined) {
  //         form.setFields([
  //             {
  //                 name: ['adsets', index, 'DailyAdd_amount'],
  //                 value: adset.DailyAdd_amount,
  //             },
  //         ]);
  //     }
  // }, [adset?.DailyAdd_amount]);

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
  //     setSelectedPublishers(adset.publisher_platforms || []);

  // }, [adset])

  return (
    <Spin spinning={loading}>
      <Modal
        title={adset.AdsetName || `Edit Adset`}
        className={` ${theme === "dark" ? "dark-theme-modal" : ""}`}
        onCancel={closeDrawer}
        visible={drawerVisible}
        width="85%"
        footer={null}
        centered
        bodyStyle={{
          height: "80vh",
          overflowY: "auto",
          padding: 10,
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
        }}
        style={{ borderRadius: "12px" }}
      >
        <Form
          key={adset.id}
          form={form} // still using the same form instance
          initialValues={{
            AdsetName: adset.AdsetName,
            optimization_goal: adset.optimization_goal || "OFFSITE_CONVERSIONS",
            billing_event: adset.billing_event || "IMPRESSIONS",
            DatePicker: dayjs(),
            action_source: adset.action_source || "website",
            custom_event_type: adset.custom_event_type || "LEAD",
            countries: adset.countries || "US",
            Min_Age: adset.Min_Age || "18",
            Max_Age: adset.Max_Age || "65",
            Gender: adset.Gender || "0",
            Language: adset.locales || ["English (US)"],
            placements: adset.placements || "Advance",
            bid_amount: adset.bid_amount ? adset.bid_amount / 100 : 0,
            //   DailyAdd_amount: adset.DailyAdd_amount || 0,
            pixel_id: adset.pixel_id || "",
            DailyAdd_amount: adset.Daily_amount ? adset.Daily_amount / 100 : 0,
            Website_URL: adset.addlevel[0].Website_URL || "",
            Caption: adset.addlevel[0].Caption || "",
            MediaContent: adset.MediaContent || [], // Ensure this is an array
            positions: getPositionsByKeys(adset.position || []), // Ensure this is an array
            platforms: adset.publisher_platforms || "",
            device_platforms: adset.device_platforms || "",
            headline: adset.addlevel[0].headline || "",
            Description: adset.addlevel[0].Description || "",
            message: adset.addlevel[0].message || "",
            page_id: adset.addlevel[0].page_id || "",
            AddName:
              adset?.is_dynamic_creative ? adset.addlevel[0].AddName : adset.addlevel[0].AddName.split("_").slice(0, -1).join("_") || ""
          }}
          layout="vertical"
          disabled={isViewAdset}
        >
          <Collapse
            defaultActiveKey={["open"]}
            expandIconPosition="start"
            className={
              theme === "dark"
                ? "custom-collapse-dark"
                : "custom-collapse-light"
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
                >
                  <span
                    style={{
                      color: theme === "dark" ? "#fff" : "#000",
                      alignContent: "center",
                    }}
                  >
                    {adset.AdsetName}
                  </span>

                  {adset?.is_dynamic_creative && (<div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px" }}>Dynamic Creative</span>
                    <Form.Item
                      name={["adsets", index, "isDynamicCreative"]}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      {/* <Switch
                                    size="small"
                                    onClick={(checked, e) => {
                                      e.stopPropagation(); // ⛔ prevent panel collapse
                                    }}
                                  /> */}
                      <Switch
                        size="small"
                        disabled
                        checked={adset?.is_dynamic_creative}
                        style={{ backgroundColor: adset.is_dynamic_creative ? "#91C25F" : undefined }}
                      // onClick={(checked, e) => e.stopPropagation()}
                      // onChange={(checked) => {
                      //   console.log("Dynamic Creative:", checked);

                      //   // if (!checked) {
                      //   // Example: clear dynamic creative assets
                      //   form.setFieldsValue({
                      //     adsets: {
                      //       [index]: {
                      //         isDynamicCreative: checked,
                      //       },
                      //     },
                      //   });
                      //   // }
                      // }}
                      />
                    </Form.Item>
                  </div>)}


                  {/* <div>
                                {index !== 0 && (
                                    <Popconfirm
                                        title="Are you sure to delete this Adset?"
                                        onConfirm={(e) => {
                                            e.stopPropagation(); // Prevent panel collapse
                                            removeAdset(index, adset.id)
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        style={{ float: 'right', marginLeft: '10px' }}
                                    >
                                        <Button
                                            type="text"
                                            onClick={(e) => e.stopPropagation()} // Prevent panel collapse
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                )}
                                <Button
                                    type="text"
                                    icon={<PlusOutlined style={{ color: theme === 'dark' ? '#fff' : '#000' }} />}
                                    // onClick={() => {
                                    //     const updatedAdsets = adsets.filter((_, i) => i !== index);
                                    //     setAdsets(updatedAdsets);
                                    //     setActiveKey(['1']); // Reset to the first panel
                                    // }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent panel 
                                        addAdset()
                                    }}
                                    style={{ float: 'right', marginLeft: '10px' }}
                                />
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent panel collapse
                                        cloneAdset(adset.id)
                                    }}
                                    style={{ float: 'right', marginLeft: '10px' }}
                                />
                            </div> */}
                </div>
              }
              key="open"
              forceRender
              className="adset-collapse-panel"
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <Form.Item
                  name="AdsetName"
                  initialValue={adset.AdsetName || ""}
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
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
                    onChange={(e) => {
                      const value = e.target.value; // Correct way to get the value
                      form.setFieldsValue({ AdsetName: value });
                    }}
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
                  style={{ flex: "120px" }}
                  initialValue={
                    adset.optimization_goal || "OFFSITE_CONVERSIONS"
                  }
                >
                  <Select
                    disabled={true}
                    options={[
                      { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                      { value: "LINK_CLICKS", label: "Clicks" },
                      { value: "REACH", label: "Reach" },
                      { value: "VALUE", label: "Value" },
                    ]}
                    // onChange={(value) => handleFieldChange(index, "optimization_goal", value)}
                    // defaultValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  />
                </Form.Item>
                <Form.Item
                  name="billing_event"
                  label={
                    <span style={{ color: "#B4B4B4" }}>Billing event</span>
                  }
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
                     disabled={true}
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
                <Form.Item
                  name="DatePicker"
                  label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
                  rules={[
                    {
                      required: true,
                      message: "Please input!",
                    },
                  ]}
                  style={{ flex: "150px" }}
                  initialValue={dayjs()}
                >
                  <DatePicker
                    disabled={true}
                    showTime
                    dropdownClassName={
                      theme === "dark" ? "dark-theme-dropdown" : ""
                    }
                    className="green-border-picker"
                    //                                 onChange={(value, dateString) => {
                    //     console.log("Local Time:", dateString)
                    //     console.log("UTC ISO:", moment(value).utc().format("YYYY-MM-DDTHH:mm:ssZ"))
                    //   }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  name="action_source"
                  label={
                    <span style={{ color: "#B4B4B4" }}>Action source</span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select an option!",
                    },
                  ]}
                  style={{ flex: "120px" }}
                  initialValue={adset.action_source || "website"}
                >
                  <Select
                    disabled={true}
                    options={[
                      { value: "website", label: "Website" },
                      { value: "email", label: "Email" },
                      { value: "app", label: "App" },
                      { value: "phone_call", label: "Phone Call" },
                    ]}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  // defaultValue={adset.action_source || "website"}
                  // onChange={(value) => handleFieldChange(index, "action_source", value)}
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
                  style={{ flex: "120px" }}
                  initialValue={adset.custom_event_type || "LEAD"}
                >
                  <Select
                    disabled={true}
                    options={[
                      { value: "LEAD", label: "Lead" },
                      { value: "PURCHASE", label: "Purchase" },
                      { value: "SEARCH", label: "Search" },
                      { value: "CONTACT", label: "Contact" },
                    ]}
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  // defaultValue={adset.custom_event_type || "LEAD"}
                  // onChange={(value) => handleFieldChange(index, "custom_event_type", value)}
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
                <Form.Item
                  name="pixel_id"
                  initialValue={
                    typeof imagehash?.pixelID === "object"
                      ? imagehash.pixelID.Universal
                      : imagehash?.pixelID
                  }
                  label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                  rules={[
                    {
                      required: true,
                      message: "Please select an option!",
                    },
                  ]}
                  style={{ flex: "140px" }}
                >
                  {typeof imagehash?.pixelID === "object" ? (
                    <Select
                      defaultValue={imagehash?.pixelID?.Universal}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                      disabled={true}
                    >
                      {Object.entries(imagehash.pixelID).map(
                        ([label, value]) => (
                          <Select.Option key={value} value={value}>
                            {`${label} - ${value}`}
                          </Select.Option>
                        )
                      )}
                    </Select>
                  ) : (
                    <Input
                      disabled={adset.Adsetid ? true : false}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                    />
                  )}
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

                <Form.Item
                  name="DailyAdd_amount"
                  label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                // rules={[
                //     {
                //         required: !(isCampaignBudgetActive || form.getFieldValue(['adsets', index, 'DailyAdd_amount']) > 0),
                //         message: `Please enter a valid number > 0 in Adset ${index + 1}`
                //     }
                // ]}
                >
                  <Tooltip
                  // title={isCampaignBudgetActive ? 'You have enabled daily budget in the Campaign Level' : ''}
                  >
                    <InputNumber
                      disabled={
                        adset.Daily_amount === "" ||
                          adset.Daily_amount === null ||
                          adset.Daily_amount === undefined ||
                          adset.Daily_amount === 0
                          ? true
                          : false
                      }
                      placeholder="$"
                      min={0}
                      step={0.01}
                      value={dailyBudget}
                      onChange={(value) => {
                        // Handle the change, updating the adset value both in the form and the adset state
                        // handleAdsetChange(index, value);

                        // // Ensure that 'adsets' is defined and is an array
                        // const adsets = form.getFieldValue("adsets") || []; // Fallback to empty array if undefined

                        // // Update only the DailyAdd_amount in the form without disturbing other values
                        // const updatedAdsets = adsets.map((ad, i) =>
                        //   i === index ? { ...ad, DailyAdd_amount: value } : ad
                        // );

                        form.setFieldsValue({
                          DailyAdd_amount: value,
                        });
                        setDailyBudget(value);
                      }}
                      // readOnly={isCampaignBudgetActive} // Make adset budget read-only if campaign budget is active
                      style={{ width: 120 }}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                    />
                  </Tooltip>
                </Form.Item>

                {adset.bid_amount && adset.bid_amount > 0 && (
                  <Form.Item
                    name="bid_amount"
                    label={
                      <span style={{ color: "#B4B4B4" }}>
                        Cost per Result Goal
                      </span>
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
                        if (
                          event.key === "ArrowUp" ||
                          event.key === "ArrowDown"
                        ) {
                          event.preventDefault();
                        }
                      }}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
                      }
                    />
                  </Form.Item>
                )}
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "green",
                }}
              >
                Targeting
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <Form.Item
                  name="countries"
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

                    // defaultValue={adset.countries || "US"}
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
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
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
                  name="Max_Age"
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
                  name="Gender"
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
                </Form.Item>
                <Form.Item
                  name="Language"
                  label={<span style={{ color: "#B4B4B4" }}>Language</span>}
                  rules={[
                    { required: true, message: "Please select an option!" },
                  ]}
                  style={{ flex: "1 1 150px" }}
                  initialValue={adset.Language || "English (US)"}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select Language"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
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
                  name="placements"
                  rules={[{ required: true, message: "Please select a mode!" }]}
                  initialValue={adset.placements || "Advance"}
                >
                  <Select
                    placeholder="Select a mode"
                    dropdownClassName={theme === "dark" && "custom-dropdown"}
                    className={`${theme === "dark" ? "dark-theme" : "light-theme"
                      } green-border-select`}
                  >
                    <Option value="Advance" title={null}>
                      Advance
                    </Option>
                    <Option value="manual" title={null}>
                      Manual
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  shouldUpdate={(prev, cur) =>
                    prev.placements !== cur.placements
                  }
                >
                  {({ getFieldValue }) => {
                    const placementValue = getFieldValue("placements"); // ✅ flat field name
                    return placementValue === "manual" ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "16px",
                          width: "100%",
                          flexWrap: "wrap",
                        }}
                      >
                        <Form.Item
                          name="platforms"
                          label={
                            <span style={{ color: "#B4B4B4" }}>Platforms</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select an option!",
                            },
                          ]}
                          style={{ flex: 1, minWidth: "210px" }}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Select Platforms"
                            onChange={handlePublisherChange}
                            value={selectedPublishers}
                            dropdownClassName={
                              theme === "dark" && "custom-dropdown"
                            }
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                              } green-border-select`}
                          >
                            {publisherOptions.map((option) => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="positions"
                          label={
                            <span style={{ color: "#B4B4B4" }}>Positions</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select an option!",
                            },
                          ]}
                          style={{ flex: 2, minWidth: "215px" }}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Select Positions"
                            value={(selectedPositions?.[adset.id] || []).map(
                              (pos) => pos.key
                            )}
                            onChange={handlePositionChange}
                            dropdownClassName={
                              theme === "dark" && "custom-dropdown"
                            }
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                              } green-border-select`}
                          >
                            {Array.isArray(selectedPublishers) &&
                              selectedPublishers.length > 0 &&
                              getPositionOptions().map((position) => (
                                <Option
                                  key={`${position.key}_${position.label}`}
                                  value={position.key}
                                >
                                  {position.label}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="device_platforms"
                          label={
                            <span style={{ color: "#B4B4B4" }}>Device</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select an option!",
                            },
                          ]}
                          style={{ flex: 1, minWidth: "215px" }}
                        >
                          <Select
                            mode="multiple"
                            allowClear
                            placeholder="Please select"
                            options={[
                              { value: "mobile", label: "Mobile" },
                              { value: "desktop", label: "Desktop" },
                            ]}
                            dropdownClassName={
                              theme === "dark" && "custom-dropdown"
                            }
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                              } green-border-select`}
                          />
                        </Form.Item>
                      </div>
                    ) : null;
                  }}
                </Form.Item>
                {/* </div> */}
              </div>
              <Collapse
                defaultActiveKey={["open"]}
                expandIconPosition="start"
                className={
                  theme === "dark"
                    ? "custom-collapse-dark"
                    : "custom-collapse-light"
                }
              >
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
                      <span
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setViewSingleAd({}); 
                      //   setActiveMediaIndex(null);
                      // }}
                      >
                        AD LEVEL
                      </span>
                      {(selectedFiles || []).length > 0 && (!(adset?.is_dynamic_creative)) && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Breadcrumb separator={<span style={{ color: theme === "dark" ? "#fff" : "#333" }}>/</span>}>
                            <div style={{ display: 'flex' }}>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewSingleAd({});
                                  setActiveMediaIndex(-1);
                                }}
                                style={{
                                  fontWeight: activeMediaIndex === -1 ? "500" : "normal",
                                  color:
                                    activeMediaIndex === -1
                                      ? "#91C25F"
                                      : theme === "dark"
                                        ? "#fff"
                                        : "#333",
                                  cursor: "pointer",
                                  backgroundColor:
                                    activeMediaIndex === -1
                                      ? theme === "dark"
                                        ? "rgba(145,194,95,0.2)"
                                        : "rgba(145,194,95,0.15)"
                                      : "transparent",
                                  border:
                                    activeMediaIndex === -1
                                      ? "1px solid #4caf50"
                                      : "2px solid transparent",
                                  borderRadius: "6px",
                                  padding: "1px 2px",
                                  transition: "all 0.2s ease-in-out",
                                  fontSize: '8px'
                                }}
                              >
                                <MoreOutlined />
                              </span>
                              <span style={{ color: theme === "dark" ? "#fff" : "#333", marginRight: '10px', marginLeft: '5px' }}>/</span>
                            </div>
                            {newAddLevelData.map((_, i) => (
                              <Breadcrumb.Item key={i}>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewSingleAd(newAddLevelData[i]);
                                    setActiveMediaIndex(i);
                                  }}
                                  style={{
                                    fontWeight: activeMediaIndex === i ? "500" : "normal",
                                    color:
                                      activeMediaIndex === i
                                        ? "#91C25F"
                                        : theme === "dark"
                                          ? "#fff"
                                          : "#333",
                                    cursor: "pointer",
                                    backgroundColor:
                                      activeMediaIndex === i
                                        ? theme === "dark"
                                          ? "rgba(145,194,95,0.2)"
                                          : "rgba(145,194,95,0.15)"
                                        : "transparent",
                                    border:
                                      activeMediaIndex === i
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
                  {viewSingleAd && Object.keys(viewSingleAd).length > 0 && (
                    <AddComponent
                      imagehash={imagehash}
                      accountis={accountis}
                      network={network}
                      isViewAdset={isViewAdset}
                      viewSingleAd={viewSingleAd}
                      newAddLevelData={newAddLevelData}
                      setNewAddLevelData={setNewAddLevelData}
                      activeMediaIndex={activeMediaIndex}
                      setSelectedFilesFromAdset={setSelectedFiles}
                      setSelectedFilesFromCreativesFromAdset={
                        setSelectedFilesFromCreatives
                      }
                      setSelectedFilesFromMediaFromAdset={
                        setSelectedFilesFromMedia
                      }
                    />
                  )}
                  {Object.keys(viewSingleAd).length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: "70%", marginRight: "5%" }}>
                        <div style={{ display: "flex", gap: "16px" }}>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <Form.Item
                              label={
                                <span style={{ color: "#B4B4B4" }}>
                                  Select source
                                </span>
                              }
                              style={{ flex: 1 }}
                            >
                              <Select
                                value={selectedOption || "creative"}
                                onChange={(value) => {
                                  setSelectedOption(value);
                                  form.validateFields(["MediaContent"]); // Revalidate when switching source
                                }}
                                style={{ marginBottom: 16 }}
                                dropdownClassName={
                                  theme === "dark" && "custom-dropdown"
                                }
                                className={`${theme === "dark"
                                  ? "dark-theme"
                                  : "light-theme"
                                  } green-border-select`}
                              >
                                <Option value="upload">Upload</Option>
                                <Option value="creative">
                                  Creative library
                                </Option>
                              </Select>
                            </Form.Item>

                            <Form.Item
                              name="MediaContent"
                              rules={[
                                {
                                  validator: async () => {
                                    // Default to empty array if the value for the index is undefined
                                    const mediaFiles =
                                      selectedFilesFromMedia || [];
                                    const creativeFiles =
                                      selectedFilesFromCreatives || [];

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
                                      selectedOption === "upload"
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  <Upload
                                    // beforeUpload={() => false}
                                    disabled={isViewAdset}
                                    itemRender={(
                                      originNode,
                                      file,
                                      fileList,
                                      actions
                                    ) => {
                                      // console.log(file);
                                      // Show delete icon only if `canDelete: true`
                                      return (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {originNode}
                                          {file.canDelete !== false && (
                                            <Button
                                              size="small"
                                              type="text"
                                              icon={<DeleteOutlined />}
                                              onClick={() => actions.remove()}
                                              style={{ marginLeft: 8 }}
                                            />
                                          )}
                                        </div>
                                      );
                                    }}
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

                                    //1234
                                    onChange={(info) => {
                                      const allFiles = info.fileList.map(
                                        (file) => ({
                                          ...file,
                                          id: file.id || uuidv4(),
                                          canDelete: true,
                                          uid: file.uid,
                                          source: "media",
                                          adsetId: adset.id,
                                          thumbUrl:
                                            file.thumbUrl ||
                                            (file.originFileObj
                                              ? URL.createObjectURL(
                                                file.originFileObj
                                              )
                                              : undefined),
                                        })
                                      );

                                      setNewAddLevelData((prev) => {
                                        const getNextAddNumber = (prev) => {
                                          const numbers = prev
                                            .map((item) => {
                                              const parts =
                                                item.AddName?.split("_");
                                              const lastPart =
                                                parts?.[parts.length - 1];
                                              return lastPart
                                                ? parseInt(lastPart, 10)
                                                : 0;
                                            })
                                            .filter((n) => !isNaN(n));
                                          const max =
                                            numbers.length > 0
                                              ? Math.max(...numbers)
                                              : 0;
                                          return max + 1;
                                        };

                                        const nextAddNumber =
                                          getNextAddNumber(prev);

                                        // ✅ Step: Filter only new files that are not already in prev based on uid
                                        const existingUids = new Set(
                                          prev.map((item) => item.uid)
                                        );
                                        const trulyNewFiles = allFiles.filter(
                                          (item) => !existingUids.has(item.uid)
                                        );

                                        const mappedWithAddName =
                                          trulyNewFiles.map((item, i) => ({
                                            id: item.id,
                                            AddName: `${addName}_${nextAddNumber + i
                                              }`,
                                            filename: item,
                                            uid: item.uid,
                                            page_id:
                                              form.getFieldValue("page_id"),
                                            message: primaryText,
                                            headline: headline,
                                            Description: description,
                                            Caption: caption,
                                            Website_URL: websiteURL,
                                          }));

                                        return [...prev, ...mappedWithAddName];
                                      });

                                      // ✅ Step 1: Update selected files
                                      setSelectedFiles((prev) => {
                                        const existingUids = new Set(
                                          prev.map((f) => f.uid)
                                        );
                                        const updated = [
                                          ...prev,
                                          ...allFiles.filter(
                                            (f) => !existingUids.has(f.uid)
                                          ),
                                        ];
                                        return updated;
                                      });

                                      setSelectedFilesFromMedia((prev) => {
                                        const existingUids = new Set(
                                          prev.map((f) => f.uid)
                                        );
                                        const updated = [
                                          ...prev,
                                          ...allFiles.filter(
                                            (f) => !existingUids.has(f.uid)
                                          ),
                                        ];
                                        return updated;
                                      });

                                      //   setNewAddLevelData((prev) => {
                                      //         const getNextAddNumber = (prev) => {
                                      //               const numbers = prev
                                      //                 .map((item) => {
                                      //                   const parts =
                                      //                     item.AddName?.split("_");
                                      //                   const lastPart =
                                      //                     parts?.[parts.length - 1];
                                      //                   return lastPart
                                      //                     ? parseInt(lastPart, 10)
                                      //                     : 0;
                                      //                 })
                                      //                 .filter((n) => !isNaN(n));
                                      //               const max =
                                      //                 numbers.length > 0
                                      //                   ? Math.max(...numbers)
                                      //                   : 0;
                                      //               return max + 1;
                                      //             };
                                      //             const nextAddNumber =
                                      //               getNextAddNumber(prev); // e.g., 3

                                      //         const mappedWithAddName = allFiles.map(
                                      //             (item, i) => ({
                                      //                 id: item.id,
                                      //                 AddName: `${addName}_${
                                      //                 nextAddNumber + i
                                      //                 }`, // e.g., Add_4, Add_5
                                      //                 filename: item,
                                      //                 uid: item.uid,
                                      //                 page_id:
                                      //                 form.getFieldValue("page_id"),
                                      //                 message: primaryText,
                                      //                 headline: headline,
                                      //                 Description: description,
                                      //                 Caption: caption,
                                      //                 Website_URL: websiteURL,
                                      //             })
                                      //             ); // Map to the required structure
                                      //         return [...prev, ...mappedWithAddName];
                                      //   })

                                      // ✅ Step 2: Filter o

                                      //   const newUids = allFiles.map(
                                      //     (f) => f.uid
                                      //   );
                                      //   const alreadyInSelected = new Set(
                                      //     selectedFiles.map((f) => f.uid)
                                      //   );
                                      //   const trulyNewFiles = allFiles.filter(
                                      //     (f) => !alreadyInSelected.has(f.uid)
                                      //   );

                                      //   const newAds = trulyNewFiles.map(
                                      //     (item, i) => ({
                                      //       id: item.id, // e.g., Add_4, Add_5
                                      //       filename: item,
                                      //       page_id:
                                      //         form.getFieldValue("page_id"),
                                      //       message: primaryText,
                                      //       headline: headline,
                                      //       Description: description,
                                      //       Caption: caption,
                                      //       Website_URL: websiteURL,
                                      //     })
                                      //   ); // Map to the required structure
                                      //   //   );

                                      //   // ✅ Step 3: Update newAddLevelData with only truly new files
                                      //   //   updateTheNewAddLevelData(allFiles);

                                      //   setNewAddLevelData((prev) => {
                                      //     const getNextAddNumber = (prev) => {
                                      //       const numbers = prev
                                      //         .map((item) => {
                                      //           const parts =
                                      //             item.AddName?.split("_");
                                      //           const lastPart =
                                      //             parts?.[parts.length - 1];
                                      //           return lastPart
                                      //             ? parseInt(lastPart, 10)
                                      //             : 0;
                                      //         })
                                      //         .filter((n) => !isNaN(n));
                                      //       const max =
                                      //         numbers.length > 0
                                      //           ? Math.max(...numbers)
                                      //           : 0;
                                      //       return max + 1;
                                      //     };
                                      //     const nextAddNumber =
                                      //       getNextAddNumber(prev); // e.g., 3
                                      //     const mappedWithAddName = newAds.map(
                                      //       (item, i) => ({
                                      //         ...item,
                                      //         AddName: `${addName}_${
                                      //           nextAddNumber + i
                                      //         }`,
                                      //       })
                                      //     );
                                      //     return [...prev, ...mappedWithAddName];
                                      //   });
                                      //kkkk

                                      //   setNewAddLevelData((prev) => {
                                      //     const existingIds = new Set(
                                      //       prev.map((item) => item.id)
                                      //     );

                                      //     // Filter only newly added files
                                      //     const newUniqueFiles = newFiles.filter(
                                      //       (file) => !existingIds.has(file.id)
                                      //     );

                                      //     const nextAddNumber =
                                      //       getNextAddNumber(prev); // e.g., 3

                                      //     const mappedWithAddName =
                                      //       newUniqueFiles.map((item, i) => ({
                                      //         id: item.id,
                                      //         AddName: `${addName}_${
                                      //           nextAddNumber + i
                                      //         }`, // e.g., Add_4, Add_5
                                      //         filename: item.url,
                                      //         page_id:
                                      //           form.getFieldValue("page_id"),
                                      //         message: primaryText,
                                      //         headline: headline,
                                      //         Description: description,
                                      //         Caption: caption,
                                      //         Website_URL: websiteURL,
                                      //       }));

                                      //     return [...prev, ...mappedWithAddName];
                                      //   });

                                      // Update form field
                                      const formMedia =
                                        form.getFieldValue(["MediaContent"]) ||
                                        [];
                                      //   const existingUidsInForm = new Set(
                                      //     (formMedia || []).map((f) => f.uid)
                                      //   );
                                      const existingUidsInForm = new Set(
                                        Array.isArray(formMedia)
                                          ? formMedia.map((f) => f.uid)
                                          : []
                                      );
                                      const updatedFormMedia = [
                                        ...formMedia,
                                        ...allFiles.filter(
                                          (f) => !existingUidsInForm.has(f.uid)
                                        ),
                                      ];

                                      form.setFieldsValue({
                                        MediaContent: updatedFormMedia,
                                      });

                                      form.validateFields(["MediaContent"]);
                                    }}
                                    //456

                                    // onChange={(info) => {
                                    //   console.log(
                                    //     "onChange fired",
                                    //     info.fileList.map((f) => f.uid)
                                    //   );
                                    //   const allFiles = info.fileList.map(
                                    //     (file) => ({
                                    //       ...file,
                                    //       id: file.id || uuidv4(),
                                    //       canDelete: true,
                                    //       uid: file.uid,
                                    //       source: "media",
                                    //       adsetId: adset.id,
                                    //       thumbUrl:
                                    //         file.thumbUrl ||
                                    //         (file.originFileObj
                                    //           ? URL.createObjectURL(
                                    //               file.originFileObj
                                    //             )
                                    //           : undefined),
                                    //     })
                                    //   );

                                    //   const existingUids = new Set(
                                    //     (selectedFilesFromMedia || []).map(
                                    //       (f) => f.uid
                                    //     )
                                    //   );

                                    //   const trulyNewFiles = allFiles.filter(
                                    //     (f) => !existingUids.has(f.uid)
                                    //   );

                                    //   // 🧠 Only map new files to newAds
                                    //   const newAds = trulyNewFiles.map(
                                    //     (item) => ({
                                    //       id: item.id,
                                    //       filename: item,
                                    //       page_id:
                                    //         form.getFieldValue("page_id"),
                                    //       message: primaryText,
                                    //       headline: headline,
                                    //       Description: description,
                                    //       Caption: caption,
                                    //       Website_URL: websiteURL,
                                    //     })
                                    //   );

                                    //   // 🧠 Update newAddLevelData only with truly new files
                                    //   setNewAddLevelData((prev) => {
                                    //     const existingIds = new Set(
                                    //       prev.map((item) => item.id)
                                    //     );

                                    //     const newAds = allFiles
                                    //       .filter(
                                    //         (f) => !existingIds.has(f.uid)
                                    //       ) // ✅ Avoid duplicates
                                    //       .map((item) => ({
                                    //         id: item.id,
                                    //         filename: item,
                                    //         uid: item.uid,
                                    //         page_id:
                                    //           form.getFieldValue("page_id"),
                                    //         message: primaryText,
                                    //         headline: headline,
                                    //         Description: description,
                                    //         Caption: caption,
                                    //         Website_URL: websiteURL,
                                    //       }));

                                    //     const getNextAddNumber = (prev) => {
                                    //       const numbers = prev
                                    //         .map((item) => {
                                    //           const parts =
                                    //             item.AddName?.split("_");
                                    //           const lastPart =
                                    //             parts?.[parts.length - 1];
                                    //           return lastPart
                                    //             ? parseInt(lastPart, 10)
                                    //             : 0;
                                    //         })
                                    //         .filter((n) => !isNaN(n));
                                    //       const max =
                                    //         numbers.length > 0
                                    //           ? Math.max(...numbers)
                                    //           : 0;
                                    //       return max + 1;
                                    //     };

                                    //     const nextAddNumber =
                                    //       getNextAddNumber(prev);

                                    //     const mappedWithAddName = newAds.map(
                                    //       (item, i) => ({
                                    //         ...item,
                                    //         AddName: `${addName}_${
                                    //           nextAddNumber + i
                                    //         }`,
                                    //       })
                                    //     );

                                    //     return [...prev, ...mappedWithAddName];
                                    //   });

                                    //   // ✅ Then update selectedFiles and selectedFilesFromMedia
                                    //   const updated = [
                                    //     ...selectedFilesFromMedia,
                                    //     ...trulyNewFiles,
                                    //   ];

                                    //   setSelectedFiles(updated);
                                    //   setSelectedFilesFromMedia(updated);

                                    //   // ✅ Update form field
                                    //   const formMedia =
                                    //     form.getFieldValue([
                                    //       "adsets",
                                    //       index,
                                    //       "MediaContent",
                                    //     ]) || [];
                                    //   const formUids = new Set(
                                    //     formMedia.map((f) => f.uid)
                                    //   );
                                    //   const updatedFormMedia = [
                                    //     ...formMedia,
                                    //     ...trulyNewFiles.filter(
                                    //       (f) => !formUids.has(f.uid)
                                    //     ),
                                    //   ];

                                    //   form.setFieldsValue({
                                    //     adsets: {
                                    //       [index]: {
                                    //         MediaContent: updatedFormMedia,
                                    //       },
                                    //     },
                                    //   });

                                    //   form.validateFields([
                                    //     ["adsets", index, "MediaContent"],
                                    //   ]);
                                    // }}
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
                                      // Remove from selectedFilesFromMedia
                                      if (fileToRemove.canDelete === false) {
                                        return false; // ❌ Prevent removal
                                      }
                                      setSelectedFilesFromMedia((prev) =>
                                        prev.filter(
                                          (f) => f.uid !== fileToRemove.uid
                                        )
                                      );

                                      // Remove from selectedFiles
                                      setSelectedFiles((prev) =>
                                        prev.filter(
                                          (f) => f.uid !== fileToRemove.uid
                                        )
                                      );

                                      setNewAddLevelData((prev) => {
                                        // Step 1: Remove the object with the matching file.id
                                        const filtered = prev.filter(
                                          (f) => f.uid !== fileToRemove.uid
                                        );
                                        // Step 2: Reassign AddName as Add_1, Add_2, ...
                                        const updated = filtered.map(
                                          (item, index) => ({
                                            ...item,
                                            AddName: `${addName}_${index + 1}`,
                                          })
                                        );
                                        return updated;
                                      });

                                      // Remove from form field
                                      const updatedFormMedia = (
                                        form.getFieldValue(["MediaContent"]) ||
                                        []
                                      ).filter(
                                        (f) => f.uid !== fileToRemove.uid
                                      );

                                      form.setFieldsValue({
                                        MediaContent: updatedFormMedia,
                                      });

                                      form.validateFields(["MediaContent"]);

                                      return true;
                                    }}
                                    multiple
                                    maxCount={10}
                                    fileList={selectedFilesFromMedia || []}
                                    showUploadList={{ showRemoveIcon: false }}
                                    listType="picture"
                                    accept="image/*, video/*"
                                  >
                                    <Button
                                      icon={<UploadOutlined />}
                                      className="dark-icon-button"
                                      style={{
                                        color:
                                          theme === "dark" ? "white" : "#000",
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
                                        color:
                                          theme === "dark" ? "#fff" : "#000",
                                      }}
                                    >
                                      Select files
                                    </Button>

                                    {selectedFilesFromCreatives?.length > 0 && (
                                      <div style={{ marginTop: "10px" }}>
                                        {selectedFilesFromCreatives.map(
                                          (file, index) => (
                                            <div
                                              key={index}
                                              // style={{
                                              //   display: "flex",
                                              //   alignItems: "center",
                                              //   marginBottom: 8,
                                              // }}
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                width: 365,
                                                marginTop: 10,
                                                padding: 8,                         // ✅ space inside border
                                                border: theme === "dark"
                                                  ? "1px solid #444"
                                                  : "1px solid #d9d9d9",            // ✅ light theme border
                                                borderRadius: 6,                    // ✅ rounded corners
                                                background: theme === "dark"
                                                  ? "#1f1f1f"
                                                  : "#fff",
                                              }}
                                            >
                                              {/* <PaperClipOutlined style={{ marginRight: 8 }} /> */}
                                              {/* <Tooltip title={file.name}> */}
                                              {file.type?.startsWith(
                                                "image/"
                                              ) ? (
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
                                              ) : (
                                                <video
                                                  src={file.originFileObj
                                                    ? URL.createObjectURL(file.originFileObj)
                                                    : file.url}
                                                  width={50}
                                                  height={40}
                                                  muted
                                                  preload="metadata"
                                                  style={{ borderRadius: 4, flexShrink: 0 }}
                                                />
                                              )}
                                              <span
                                                style={{
                                                  // maxWidth: 160,
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  whiteSpace: "nowrap",
                                                  paddingLeft: 8,
                                                  color:
                                                    theme === "dark"
                                                      ? "#fff"
                                                      : "#000",
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
                                              {!isViewAdset && !file.Addid && (
                                                <DeleteOutlined
                                                  onClick={() => {
                                                    // 1. Remove from selectedFilesFromCreatives
                                                    setSelectedFilesFromCreatives(
                                                      (prev) =>
                                                        prev.filter(
                                                          (f) =>
                                                            f.uid !== file.uid
                                                        )
                                                    );

                                                    // 2. Remove from selectedFiles
                                                    setSelectedFiles((prev) =>
                                                      prev.filter(
                                                        (f) =>
                                                          f.uid !== file.uid
                                                      )
                                                    );

                                                    setNewAddLevelData(
                                                      (prev) => {
                                                        // Step 1: Remove the object with the matching file.id
                                                        const filtered =
                                                          prev.filter(
                                                            (f) =>
                                                              f.id !== file.id
                                                          );

                                                        // Step 2: Reassign AddName as Add_1, Add_2, ...
                                                        const updated =
                                                          filtered.map(
                                                            (item, index) => ({
                                                              ...item,
                                                              AddName: `${addName}_${index + 1
                                                                }`,
                                                            })
                                                          );

                                                        return updated;
                                                      }
                                                    );

                                                    // 3. Update the top-level form field `MediaContent`
                                                    const currentMedia =
                                                      form.getFieldValue(
                                                        "MediaContent"
                                                      ) || [];
                                                    const updatedMedia =
                                                      currentMedia.filter(
                                                        (f) =>
                                                          f.uid !== file.uid
                                                      );

                                                    form.setFieldsValue({
                                                      MediaContent:
                                                        updatedMedia,
                                                    });

                                                    // 4. Validate only the `MediaContent` field
                                                    form.validateFields([
                                                      "MediaContent",
                                                    ]);
                                                  }}
                                                  style={{
                                                    color: "red",
                                                    marginLeft: 12,
                                                    cursor: "pointer",
                                                  }}
                                                />
                                              )}
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
                            initialValue={imagehash?.pageID}
                            label={
                              <span style={{ color: "#B4B4B4" }}>Page id</span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Please select an option!",
                              },
                            ]}
                            style={{ flex: 2, marginLeft: "1%" }}
                          >
                            <Input
                              style={{ width: "60%" }}
                              className={
                                theme === "dark"
                                  ? "custom-input-dark"
                                  : "custom-input-light"
                              }
                            />
                          </Form.Item>
                        </div>
                        <Form.Item
                          name="AddName"
                          initialValue={adset.AddName || ""}
                          label={
                            <span style={{ color: "#B4B4B4" }}>Ad name</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select an option!",
                            },
                          ]}
                        >
                          <Input
                            style={{ width: "60%" }}
                            onChange={(e) => {
                              setAddName(e.target.value);
                              setNewAddLevelData((prev) => {
                                return prev.map((item, idx) => ({
                                  ...item,
                                  AddName: `${e.target.value}_${idx + 1}`,
                                }));
                              });
                            }}
                            className={
                              theme === "dark"
                                ? "custom-input-dark"
                                : "custom-input-light"
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label={
                            <span style={{ color: "#B4B4B4" }}>
                              Primary text
                            </span>
                          }
                          name="message"
                          rules={[
                            {
                              required: true,
                              message: "Please enter a message!",
                            },
                          ]}
                          required
                        // tooltip="This is a required field"
                        >
                          {primaryText.map((text, index) => (
                            <TextArea
                              key={index}
                              value={text}
                              placeholder="Primary text"
                              autoSize={{ minRows: 2, maxRows: 10 }}
                              style={{ marginBottom: "8px" }}
                              onChange={(e) => {
                                setPrimaryText(e.target.value);
                                setNewAddLevelData((prev) => {
                                  return prev.map((item, idx) => ({
                                    ...item,
                                    message: `${e.target.value}`,
                                  }));
                                });
                              }}
                              className={
                                theme === "dark"
                                  ? "custom-input-dark"
                                  : "custom-input-light"
                              }
                            />
                          ))}
                        </Form.Item>
                        <Form.Item
                          label={
                            <span style={{ color: "#B4B4B4" }}>Headline</span>
                          }
                          name="headline"
                          rules={[
                            {
                              required: true,
                              message: "Please enter a Name!",
                            },
                          ]}
                          required
                        // tooltip="This is a required field"
                        >
                          {headline.map((text, index) => (
                            <TextArea
                              key={index}
                              value={text}
                              placeholder="Headline"
                              style={{ marginBottom: "8px" }}
                              autoSize={{ minRows: 2, maxRows: 10 }}
                              onChange={(e) => {
                                setHeadline(e.target.value);
                                setNewAddLevelData((prev) => {
                                  return prev.map((item, idx) => ({
                                    ...item,
                                    headline: `${e.target.value}`,
                                  }));
                                });
                              }}
                              className={
                                theme === "dark"
                                  ? "custom-input-dark"
                                  : "custom-input-light"
                              }
                            />
                          ))}
                        </Form.Item>

                        <Form.Item
                          label={
                            <span style={{ color: "#B4B4B4" }}>
                              Description
                            </span>
                          }
                          name="Description"
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
                          {description.map((text, index) => (
                            <TextArea
                              key={index}
                              value={text}
                              placeholder="Description"
                              style={{ marginBottom: "8px" }}
                              autoSize={{ minRows: 2, maxRows: 10 }}
                              onChange={(e) => {
                                setDescription(e.target.value);
                                setNewAddLevelData((prev) => {
                                  return prev.map((item, idx) => ({
                                    ...item,
                                    Description: `${e.target.value}`,
                                  }));
                                });
                              }}
                              className={
                                theme === "dark"
                                  ? "custom-input-dark"
                                  : "custom-input-light"
                              }
                            />
                          ))}
                        </Form.Item>
                        <Form.Item
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
                                <span style={{ color: "#B4B4B4" }}>
                                  Website_URL
                                </span>
                                {/* <Tooltip
                                  // title="This is a required field"
                                  overlayInnerStyle={{
                                    backgroundColor:
                                      theme === "dark" ? "#2b2b2b" : "#ffffff",
                                    color:
                                      theme === "dark" ? "#ffffff" : "#000000",
                                    borderRadius: 6,
                                    padding: "6px 10px",
                                    fontSize: "14px",
                                  }}
                                >
                                  <QuestionCircleOutlined
                                    style={{ marginLeft: 4, cursor: "pointer" }}
                                  />
                                </Tooltip> */}
                              </div>
                              <EditOutlined
                                style={{ cursor: "pointer" }}
                                onClick={() => onClickEdit(index)}
                              />
                            </div>
                          }
                          labelCol={{ style: { width: "100%" } }} // Makes the label full width
                          wrapperCol={{ style: { width: "100%" } }} // Ensures TextArea takes the same full width
                          name="Website_URL"
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
                            onChange={(e) => {
                              setWebsiteURL(e.target.value);
                              setNewAddLevelData((prev) => {
                                return prev.map((item, idx) => ({
                                  ...item,
                                  Website_URL: `${e.target.value}`,
                                }));
                              });
                            }}
                            className={
                              theme === "dark"
                                ? "custom-input-dark"
                                : "custom-input-light"
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label={
                            <span style={{ color: "#B4B4B4" }}>
                              Display link
                            </span>
                          }
                          name="Caption"
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
                            onChange={(e) => {
                              setCaption(e.target.value);
                              setNewAddLevelData((prev) => {
                                return prev.map((item, idx) => ({
                                  ...item,
                                  Caption: `${e.target.value}`,
                                }));
                              });
                            }}
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

                      <div style={{ flex: "30%" }}>
                        {selectedFiles && selectedFiles.length > 0
                          ? selectedFiles.map((file, i) => (
                            <Badge
                              key={i}
                              count={
                                file?.url?.endsWith(".png") ||
                                  file?.url?.endsWith(".jpg") ||
                                  file?.url?.endsWith(".jpeg") ||
                                  file?.url?.endsWith(".mp4") ? null : (
                                  <EditOutlined
                                    style={{
                                      fontSize: "25px",
                                      color: "#fff",
                                    }}
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
                                          color:
                                            theme === "dark"
                                              ? "white"
                                              : "#000",
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
                                      <CloseOutlined
                                        style={{ fontSize: "20px" }}
                                      />
                                    </div>
                                    <div className="moreoptions">
                                      <MoreOutlined
                                        style={{ fontSize: "20px" }}
                                      />
                                    </div>
                                  </div>

                                  <div
                                    className="ad-desc"
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                      color:
                                        theme === "dark" ? "white" : "#000",
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
                                        Your browser does not support the
                                        video tag.
                                      </video>
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
                                        Your browser does not support the
                                        video tag.
                                      </video>
                                    )}
                                  </div>

                                  <div className="ad-cta">
                                    <div className="details">
                                      <div
                                        className="link"
                                        style={{
                                          color:
                                            theme === "dark"
                                              ? "white"
                                              : "#000",
                                        }}
                                      >
                                        {caption}
                                      </div>
                                      <div
                                        className="title"
                                        style={{
                                          color:
                                            theme === "dark"
                                              ? "white"
                                              : "#000",
                                        }}
                                      >
                                        {headline}
                                      </div>
                                      <div
                                        className="desc"
                                        style={{
                                          color:
                                            theme === "dark"
                                              ? "white"
                                              : "#000",
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
                                        color:
                                          theme === "dark" ? "white" : "#000",
                                      }}
                                    >
                                      <LikeOutlined
                                        style={{ fontSize: "20px" }}
                                      />{" "}
                                      Like
                                    </div>
                                    <div
                                      className="comment"
                                      style={{
                                        color:
                                          theme === "dark" ? "white" : "#000",
                                      }}
                                    >
                                      <CommentOutlined
                                        style={{ fontSize: "20px" }}
                                      />{" "}
                                      Comment
                                    </div>
                                    <div
                                      className="share"
                                      style={{
                                        color:
                                          theme === "dark" ? "white" : "#000",
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
                      </div>
                    </div>
                  )}
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

          {!isViewAdset && (
            <Button
              type="primary"
              style={{
                background: "#91c25f",
                minWidth: "200px",
                borderWidth: "0px",
                marginTop: "10px",
              }}
              onClick={async () => {
                try {
                  const values = await form.validateFields(); // Validates all form fields

                  // Check if campaign-level and adset-level budgets are both zero
                  // const campaignLevelDailyBudget = values.Daily_amount;
                  // const isCampaignBudgetActive = parseFloat(campaignLevelDailyBudget) > 0;

                  //     // Check if any adset has a budget
                  // const isAnyAdsetBudgetSet = values.adsets.some(adset => parseFloat(adset.DailyAdd_amount) > 0);

                  //     // If Campaign Budget is not set, check Adsets
                  // if (!isCampaignBudgetActive) {
                  //     const isAllAdsetsFilled = values.adsets.every(adset => parseFloat(adset.DailyAdd_amount) > 0);

                  //     if (!isAllAdsetsFilled) {
                  //         throw {
                  //             errorFields: [
                  //                 {
                  //                     name: ['Daily_amount'], // The field where error occurs
                  //                     errors: ['Daily budget cannot be zero on both Adset and Campaign levels'], // The error message
                  //                 },
                  //             ],
                  //         };
                  //     }
                  // }

                  // Clear any previous errors
                  setSubmitErrors([]);
                  setIsModalVisible(true);
                  // console.log("Form values:", values); // Log form values to verify

                  // Call the onFinish logic, passing in the values
                  onFinish(values); // Trigger the existing logic for form submission

                  // Optionally trigger confirmation modal (as per your logic)
                  // setIsModalVisible(true);

                  // Save values if needed
                  setFormValues(values);
                  setIsCreateCampaignorDraft("createcampaign");
                  // setIsModalVisible(true);
                } catch (err) {
                  // Catch any validation errors thrown by form.validateFields
                  const allErrors = err?.errorFields?.map((field) => ({
                    name: field.name?.[0], // field name
                    message: field.errors?.[0], // validation message
                  }));
                  setSubmitErrors(allErrors); // Capture and show validation errors
                }
              }}
            >
              Submit
            </Button>
          )}
          {submitErrors?.length > 0 && (
            <div style={{ color: "red", marginTop: 8 }}>
              {submitErrors.map((err, index) => (
                <div key={index}>
                  <strong>{err.name}:</strong> {err.message}
                </div>
              ))}
            </div>
          )}

          {isModalVisible && (
            <Modal
              title="Confirmation"
              open={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                }`}
            >
              <p>Are you sure you want to submit?</p>
            </Modal>
          )}
        </Form>
      </Modal>
    </Spin>
  );
};

export default AdsetComponent;
