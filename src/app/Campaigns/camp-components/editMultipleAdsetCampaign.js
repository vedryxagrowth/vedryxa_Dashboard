"use client";
import React, { use, useEffect, useMemo } from "react";
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
  Alert,
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
  InfoCircleOutlined
} from "@ant-design/icons";
import { FaPenToSquare, FaShareFromSquare, FaTrashCan } from "react-icons/fa6";
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
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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

const AddComponent = ({
  view,
  imagehash,
  adset,
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
  console.log(viewSingleAd, "viewSingleAd in AddComponent");
  console.log(activeMediaIndex, "activeMediaIndex in AddComponent");
  console.log(accountis, "accountis in AddComponent");
  console.log(selectedFiles, "selectedFiles in AddComponent");
  console.log(selectedFilesFromMedia, "selectedFilesFromMedia in AddComponent");
  console.log(
    selectedFilesFromCreatives,
    "selectedFilesFromCreatives in AddComponent"
  );

  const onReturnUrl = (text) => {
    setIsModalVisibleForURLBuilder(false);
    setWebsiteURL(text);
    // const currentAdsets = form.getFieldValue("adsets") || [];
    // const updatedAdsets = [...currentAdsets];
    if (network === "FB_Mnet" || network === "FB_DomainActive") {
      setCaption(text.split("//")[1].split("/")[0]);
      //   setNewAddLevelData((prev) => {
      //     return prev.map((item, idx) =>
      //       item.id === viewSingleAd.id
      //         ? {
      //             ...item,
      //             Website_URL: text,
      //             Caption: text.split("//")[1].split("/")[0],
      //           }
      //         : item
      //     );
      //   });
      setNewAddLevelData((prev) => {
        const key = adset.id;
        const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

        const next = list.map((ad) =>
          ad?.id === viewSingleAd?.id
            ? {
              ...ad,
              Website_URL: text,
              Caption: text.split("//")[1].split("/")[0],
            }
            : ad
        );

        return { ...prev, [key]: next };
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
      //   setNewAddLevelData((prev) => {
      //     return prev.map((item, idx) =>
      //       item.id === viewSingleAd.id
      //         ? {
      //             ...item,
      //             Website_URL: text,
      //             Caption: text.split("/")[0],
      //           }
      //         : item
      //     );
      //   });
      setNewAddLevelData((prev) => {
        const key = adset.id;
        const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

        const next = list.map((ad) =>
          ad?.id === viewSingleAd?.id
            ? { ...ad, Website_URL: text, Caption: text.split("/")[0] }
            : ad
        );

        return { ...prev, [key]: next };
      });
    }
  };

  const onChangeAddNameForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setAddName(updatedAddName);

    // setNewAddLevelData((prevArray) => {
    //   const existingAdsetArrayUsingAdsetId = prevArray[adset.id];
    //   let editedExistingAdsetArrayUsingAdsetId = [];
    //   if (existingAdsetArrayUsingAdsetId) {
    //     editedExistingAdsetArrayUsingAdsetId =
    //       existingAdsetArrayUsingAdsetId.map((ad) => {
    //         ad.id === viewSingleAd.id ? { ...ad, AddName: updatedAddName } : ad;
    //       });
    //   }
    //   return {
    //     ...prevArray,
    //     [adset.id]: editedExistingAdsetArrayUsingAdsetId || [],
    //   };
    // });

    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id ? { ...ad, AddName: updatedAddName } : ad
      );

      return { ...prev, [key]: next };
    });

    // setNewAddLevelData((prevArray) =>
    //   prevArray.map((ad) =>
    //     ad.id === viewSingleAd.id ? { ...ad, AddName: updatedAddName } : ad
    //   )
    // );
  };

  const onChangePrimaryTextForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id ? { ...ad, message: updatedAddName } : ad
      );

      return { ...prev, [key]: next };
    });
  };

  const onChangeHeadlineForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setHeadline(updatedAddName);
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id ? { ...ad, headline: updatedAddName } : ad
      );

      return { ...prev, [key]: next };
    });
  };

  const onChangeDescriptionForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setDescription(updatedAddName);
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id
          ? { ...ad, Description: updatedAddName }
          : ad
      );

      return { ...prev, [key]: next };
    });
  };

  const onChangeWebsiteURLForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setWebsiteURL(updatedAddName);
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id
          ? { ...ad, Website_URL: updatedAddName }
          : ad
      );

      return { ...prev, [key]: next };
    });
  };

  const onChangeDisplayLinkForIndividualAd = (e) => {
    const updatedAddName = e.target.value;
    setCaption(updatedAddName);
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id ? { ...ad, Caption: updatedAddName } : ad
      );

      return { ...prev, [key]: next };
    });
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
    console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
    setCreativeIndex(adset.id);
  };

  const selectedFilesData = (data, index, adsetId = creativeIndex) => {
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
    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.map((ad) =>
        ad?.id === viewSingleAd?.id ? { ...ad, filename: mapped[0] } : ad
      );

      return { ...prev, [key]: next };
    });
    // const targetIndex = newAddLevelData.findIndex(
    //   (item) => item.id === viewSingleAd.id
    // );

    const arr = Array.isArray(newAddLevelData?.[adset.id])
      ? newAddLevelData[adset.id]
      : [];
    const targetIndex = arr.findIndex((item) => item?.id === viewSingleAd?.id);

    // function insertAtIndex(array, index, newObject) {
    //   // Clamp index to be within 0 and array.length
    //   const safeIndex = Math.min(Math.max(index, 0), array.length);

    //   return [
    //     ...array.slice(0, safeIndex), // elements before the insert position
    //     newObject, // the new object to insert
    //     ...array.slice(safeIndex), // elements from insert position onward
    //   ];
    // }

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
    // setSelectedFilesFromAdset((prev) =>
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

    setSelectedFilesFromAdset(
      (prev) => {
        const key = adset.id;
        const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

        const next = list.map((ad) =>
          ad?.id === viewSingleAd?.id
            ? {
              ...mapped[0],
              id: viewSingleAd.id,
              ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
            }
            : ad
        );

        return { ...prev, [key]: next };
      }

      //   // prev.map((f) => {
      //   //   if (f.id === viewSingleAd.id) {
      //   //     return {
      //   //       ...mapped[0],
      //   //       id: viewSingleAd.id,
      //   //       ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
      //   //     };
      //   //   } else {
      //   //     return f;
      //   //   }
      //   // })
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
    // setSelectedFilesFromCreativesFromAdset((prev) => {
    //   const newObject = {
    //     ...mapped[0],
    //     id: viewSingleAd.id,
    //     ...(viewSingleAd.Addid ? { Addid: viewSingleAd.Addid } : {}),
    //   };

    //   const index = prev.findIndex((f) => f.id === viewSingleAd.id);

    //   if (index !== -1) {
    //     // ✅ Update existing object
    //     return prev.map((f, i) => (i === index ? newObject : f));
    //   } else {
    //     // ❌ Not Found: Insert at targetIndex
    //     const safeIndex = Math.max(0, Math.min(targetIndex, prev.length));
    //     return [
    //       ...prev.slice(0, safeIndex),
    //       newObject,
    //       ...prev.slice(safeIndex),
    //     ];
    //   }
    // });

    setSelectedFilesFromCreativesFromAdset((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev?.[key]) ? prev[key].filter(Boolean) : [];
      console.log(list, "list in selectedFilesFromCreativesFromAdset");
      const idx = list.findIndex((f) => f?.id === viewSingleAd?.id);
      console.log(idx, "idx in selectedFilesFromCreativesFromAdset");
      console.log(
        targetIndex,
        "targetIndex in selectedFilesFromCreativesFromAdset"
      );

      // what to store when inserting a new item
      const makeNew = {
        ...mapped?.[0],
        id: viewSingleAd?.id,
        ...(viewSingleAd?.Addid ? { Addid: viewSingleAd.Addid } : {}), // <-- mirrors your reference code
      };

      console.log(makeNew, "makeNew in selectedFilesFromCreativesFromAdset");

      // if your items might key on Addid/_id, expand this matcher

      if (idx !== -1) {
        // update existing (only the filename, per your reference)
        const next = list.map((f, i) => (i === idx ? makeNew : f));
        console.log(next, "next in selectedFilesFromCreativesFromAdset");
        return { ...prev, [key]: next };
      }

      // not found → insert at targetIndex (clamped)
      const safeIndex = Math.max(
        0,
        Math.min(targetIndex ?? list.length, list.length)
      );
      console.log(
        safeIndex,
        "safeIndex in selectedFilesFromCreativesFromAdset"
      );
      const next = [
        ...list.slice(0, safeIndex),
        makeNew,
        ...list.slice(safeIndex),
      ];
      console.log(
        next,
        "next in selectedFilesFromCreativesFromAdset after insert"
      );
      return { ...prev, [key]: next };
    });

    setSelectedFilesFromMediaFromAdset((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

      const next = list.filter((ad) => ad?.id !== viewSingleAd?.id);

      return { ...prev, [key]: next };
    });

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
    console.log(viewSingleAd, "viewSingleAd in useEffect");
    console.log(typeof viewSingleAd.filename, "viewSingleAd.filename type");
    console.log(
      typeof viewSingleAd.filename === "object" &&
      viewSingleAd.filename !== null
    );
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
        console.log(
          viewSingleAd.filename,
          "viewSingleAd.filename in useEffect 1"
        );
        setSelectedFiles([viewSingleAd.filename]);
        setSelectedFilesFromMedia([viewSingleAd.filename]);
        setSelectedOption("upload");
        setSelectedFilesFromCreatives([]);
      }
    } else {
      console.log(
        viewSingleAd.filename,
        "viewSingleAd.filename in useEffect 2"
      );
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

                        console.log(newFiles[0], "newFiles[0] in onChange");

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
                        // setNewAddLevelData((prevArray) =>
                        //   prevArray.map((ad) =>
                        //     ad.id === viewSingleAd.id
                        //       ? {
                        //           ...ad,
                        //           filename: newFiles[0],
                        //           uid: newFiles[0].uid,
                        //         }
                        //       : ad
                        //   )
                        // );
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((ad) =>
                            ad?.id === viewSingleAd?.id
                              ? {
                                ...ad,
                                filename: newFiles[0],
                                uid: newFiles[0].uid,
                              }
                              : ad
                          );

                          return { ...prev, [key]: next };
                        });
                        // const targetIndex = newAddLevelData.findIndex(
                        //   (item) => item.id === viewSingleAd.id
                        // );
                        const arr = Array.isArray(newAddLevelData?.[adset.id])
                          ? newAddLevelData[adset.id]
                          : [];
                        const targetIndex = arr.findIndex(
                          (item) => item?.id === viewSingleAd?.id
                        );

                        // function insertAtIndex(array, index, newObject) {
                        //   // Clamp index to be within 0 and array.length
                        //   const safeIndex = Math.min(
                        //     Math.max(index, 0),
                        //     array.length
                        //   );

                        //   return [
                        //     ...array.slice(0, safeIndex), // elements before the insert position
                        //     newObject, // the new object to insert
                        //     ...array.slice(safeIndex), // elements from insert position onward
                        //   ];
                        // }

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

                        // setSelectedFilesFromAdset((prev) =>
                        //   prev.map((f) => {
                        //     if (f.id === viewSingleAd.id) {
                        //       return {
                        //         ...newFiles[0],
                        //         id: viewSingleAd.id,
                        //         ...(viewSingleAd.Addid
                        //           ? { Addid: viewSingleAd.Addid }
                        //           : {}),
                        //       };
                        //     } else {
                        //       return f;
                        //     }
                        //   })
                        // );

                        setSelectedFilesFromAdset((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          console.log(list, "list in selectedFilesFromAdset");

                          const next = list.map((ad) =>
                            ad?.id === viewSingleAd?.id
                              ? {
                                ...newFiles[0],
                                id: viewSingleAd.id,
                                ...(viewSingleAd.Addid
                                  ? { Addid: viewSingleAd.Addid }
                                  : {}),
                              }
                              : ad
                          );
                          console.log(next, "next in selectedFilesFromAdset");
                          console.log({ ...prev, [key]: next });

                          return { ...prev, [key]: next };
                        });

                        // setSelectedFilesFromMediaFromAdset((prev) => {
                        //   const index = prev.findIndex(
                        //     (f) => f.id === viewSingleAd.id
                        //   );

                        //   const newObject = {
                        //     ...newFiles[0],
                        //     id: viewSingleAd.id,
                        //     canDelete: viewSingleAd.Addid ? false : true,
                        //     ...(viewSingleAd.Addid
                        //       ? { Addid: viewSingleAd.Addid }
                        //       : {}),
                        //   };

                        //   if (index !== -1) {
                        //     // ID exists: update
                        //     return prev.map((f, i) =>
                        //       i === index ? newObject : f
                        //     );
                        //   } else {
                        //     // ID not found: append
                        //     return [...prev, newObject];
                        //   }
                        // });

                        // setSelectedFilesFromCreativesFromAdset((prev) =>
                        //   prev.filter((f) => f.id !== viewSingleAd.id)
                        // );

                        setSelectedFilesFromMediaFromAdset((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev?.[key])
                            ? prev[key].filter(Boolean)
                            : [];
                          console.log(
                            list,
                            "list in selectedFilesFromCreativesFromAdset"
                          );
                          const idx = list.findIndex(
                            (f) => f?.id === viewSingleAd?.id
                          );
                          console.log(
                            idx,
                            "idx in selectedFilesFromCreativesFromAdset"
                          );
                          console.log(
                            targetIndex,
                            "targetIndex in selectedFilesFromCreativesFromAdset"
                          );

                          // what to store when inserting a new item
                          const makeNew = {
                            ...newFiles?.[0],
                            id: viewSingleAd?.id,
                            ...(viewSingleAd?.Addid
                              ? { Addid: viewSingleAd.Addid }
                              : {}),
                            canDelete: viewSingleAd.Addid ? false : true, // <-- mirrors your reference code
                          };

                          console.log(
                            makeNew,
                            "makeNew in selectedFilesFromCreativesFromAdset"
                          );

                          // if your items might key on Addid/_id, expand this matcher

                          if (idx !== -1) {
                            // update existing (only the filename, per your reference)
                            const next = list.map((f, i) =>
                              i === idx ? makeNew : f
                            );
                            console.log(
                              next,
                              "next in selectedFilesFromCreativesFromAdset"
                            );
                            return { ...prev, [key]: next };
                          }

                          // not found → insert at targetIndex (clamped)
                          const safeIndex = Math.max(
                            0,
                            Math.min(targetIndex ?? list.length, list.length)
                          );
                          console.log(
                            safeIndex,
                            "safeIndex in selectedFilesFromCreativesFromAdset"
                          );
                          const next = [
                            ...list.slice(0, safeIndex),
                            makeNew,
                            ...list.slice(safeIndex),
                          ];
                          console.log(
                            next,
                            "next in selectedFilesFromCreativesFromAdset after insert"
                          );
                          return { ...prev, [key]: next };
                        });

                        setSelectedFilesFromCreativesFromAdset((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          console.log(
                            list,
                            "list in selectedFilesFromCreativesFromAdset"
                          );

                          const next = list.filter(
                            (ad) => ad?.id !== viewSingleAd?.id
                          );
                          console.log(
                            next,
                            "next in selectedFilesFromCreativesFromAdset"
                          );

                          return { ...prev, [key]: next };
                        });

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
                              )}
                              <span
                                style={{
                                  maxWidth: 160,
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
                              {/* {!isViewAdset  */}
                              {!view
                                && (
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
              initialValue={adset?.page_id || ""}
              label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              // style={{ flex: 1, marginLeft: "1%" }}
              style={{ flex: "140px" }}
            >
              <Input
                style={{ width: "23%" }}
                disabled={true}
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
            label={<span style={{ color: "#B4B4B4" }}>Primary text</span>}
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
                    title="This is a required field"
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
            // bodyStyle={{ height: "50vh", overflowY: "auto" }}
            styles={{
              body: {
                height: "50vh",
                overflowY: "auto",
              },
            }}
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
                        padding: "15px",
                        margin: '10px'
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
  addlevelData,
  newAddLevelData,
  setAddLevelData,
  setNewAddLevelData,
  view,
  setIsAnyAdsetBudgetSet,
  pageIDList,
  pixelIDLIst,
  budgetType
}) => {
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
  const [viewSingleAd, setViewSingleAd] = useState({});

  console.log(pixelIDLIst, "pixelIDLIst in adset component");
  console.log(pageIDList, "pageIDList in adset component");
  console.log(adset.pixel_id, "adset.pixel_id in adset component");
  console.log(adset.page_id, "adset.page_id in adset component");
  console.log(selectedPositions, "selectedPositions in adset component");
  console.log(adset.id, "adset id in adset component");
  console.log(selectedPublishers, "selectedPublishers in adset component");
  console.log(selectedPositions?.[adset.id]);
  console.log(adset, "adset in adset component");
  console.log(selectedFiles, "selectedFiles in adset component");
  console.log(adset.id, "adset id in adset component");
  console.log(adset, "adset in adset component");
  console.log(
    selectedFiles[adset.id],
    "selectedFiles for adset id in adset component"
  );

  console.log(addlevelData, "addlevelData in adset component");
  console.log(newAddLevelData, "newAddLevelData in adset component");

  const currentDate = dayjs();
  const after30Days = currentDate.add(30, "day");

  const objectiveValue = Form.useWatch("Objectives", form) ?? "";

  const optimizationGoalValue = Form.useWatch(["adsets", index, "optimization_goal"], form) ?? "";

  const Billing_Event_options = {
    OFFSITE_CONVERSIONS: [{ value: "IMPRESSIONS", label: "Impressions" }],
    VALUE: [{ value: "IMPRESSIONS", label: "Impressions" }],
    LANDING_PAGE_VIEWS: [{ value: "IMPRESSIONS", label: "Impressions" }],
    LINK_CLICKS: [{ value: "IMPRESSIONS", label: "Impressions" }, { value: "LINK_CLICKS", label: "Link Clicks" }],
    REACH: [{ value: "IMPRESSIONS", label: "Impressions" }],
    IMPRESSIONS: [{ value: "IMPRESSIONS", label: "Impressions" }]
  }

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

  const adsetLocationCountry = Form.useWatch(["adsets", index, "countries"], form);

  // console.log(adsetLocationCountry);


  const campaignCountries = Form.useWatch("countries", form) || [];
  const hasCountries = Array.isArray(campaignCountries) && campaignCountries.length > 0;

  // console.log(campaignCountries);

  const newCampaignCountries = campaignCountries && campaignCountries.length > 0 ? campaignCountries.map(item => {
    return allCountries.find(item1 => item1.value === item)
  }) : allCountries;

  console.log(newCampaignCountries);

  const Optimization_goal_values = {
    OUTCOME_LEADS: [
      { value: "OFFSITE_CONVERSIONS", label: "Maximize number of conversions" },
      { value: "LANDING_PAGE_VIEWS", label: "Maximize number of landing page views" },
      { value: "LINK_CLICKS", label: "Maximize number of link clicks" },
      { value: "REACH", label: "Maximize daily unique reach" },
      { value: "IMPRESSIONS", label: "Maximize number of impressions" },
    ],
    OUTCOME_SALES: [
      { value: "OFFSITE_CONVERSIONS", label: "Maximize number of conversions" },
      { value: "VALUE", label: "Maximize value of conversions" },
      { value: "LANDING_PAGE_VIEWS ", label: "Maximize number of landing page views" },
      { value: "LINK_CLICKS", label: "Maximize number of link clicks" },
      { value: "REACH", label: "Maximize daily unique reach" },
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

  const adsetsValues = form.getFieldValue("adsets") || [];
  const currentValue = adsetsValues[index]?.optimization_goal ?? "";

  const optionsForIndex =
    index === 0
      ? optionsForOptimz_goal
      : optionsForOptimz_goal.map((o) => ({ ...o, disabled: o.value !== currentValue }));

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
      setNewAddLevelData((prev) => {
        const key = adset.id;
        const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

        const next = list.map((ad) => ({
          ...ad,
          Website_URL: text,
          Caption: text.split("//")[1].split("/")[0],
        }));

        return { ...prev, [key]: next };
      });
    } else {
      setCaption(text.split("/")[0]);
      updatedAdsets[index] = {
        ...updatedAdsets[index],
        Website_URL: text,
        Caption: text.split("/")[0],
      };
      setNewAddLevelData((prev) => {
        const key = adset.id;
        const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];

        const next = list.map((ad) => ({
          ...ad,
          Website_URL: text,
          Caption: text.split("/")[0],
        }));

        return { ...prev, [key]: next };
      });
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
            defaultValues={websiteURL}
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_System1":
        return (
          <System1UrlBuilder
            defaultValues={websiteURL}
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
      case "FB_DomainActive":
        return (
          <DActiveUrlBuilder
            defaultValues={websiteURL}
            accountis={accountis}
            onReturnMessage={onReturnUrl}
          />
        );
    }
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

  const handlePublisherChange = (value) => {
    setSelectedPublishers((prev) => ({
      ...prev,
      [adset.id]: value,
    }));

    // Optionally reset selected positions for this adset
    // setSelectedPositions((prev) => ({
    //   ...prev,
    //   [adset.id]: [], // clear when publishers change
    // }));
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
      adsetId,
    }));

    setSelectedFilesFromCreatives((prev) => ({
      ...prev,
      [adsetId]: [...(prev[adsetId] || []), ...mapped],
    }));

    setSelectedFiles((prev) => ({
      ...prev,
      [adsetId]: [...(prev[adsetId] || []), ...mapped],
    }));

    setNewAddLevelData((prev) => {
      const key = adset.id;
      const list = Array.isArray(prev[key]) ? prev[key].filter(Boolean) : [];
      const getNextAddNumber = (prev) => {
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
      const nextAddNumber = list?.length + 1 || getNextAddNumber(list);
      const newAds = mapped.map((item, i) => ({
        id: item.id,
        AddName: `${addName}_${nextAddNumber + i}`,
        filename: item,
        uid: item.uid,
        page_id: form.getFieldValue("page_id"),
        message: primaryText,
        headline: headline,
        Description: description,
        Caption: caption,
        Website_URL: websiteURL,
      }));
      const next = [...list, ...newAds];
      return { ...prev, [key]: next };
    });
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
    if (adset?.addlevel) {
      setCaption(adset?.addlevel[0]?.Caption || "");
      setPrimaryText(adset?.addlevel[0]?.message || "");
      setAddName(adset?.AdsetName);
      setHeadline(adset?.addlevel[0]?.headline || "");
      setDescription(adset?.addlevel[0]?.Description || "");
      setWebsiteURL(adset?.addlevel[0]?.Website_URL || "");
    }
    if (adset?.pixel_id) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            pixel_id: adset.pixel_id
          },
        }
      });
      // form.setFieldsValue({
      //   pixel_id: adset.pixel_id
      // })
    }
    if (adset?.addlevel) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            page_id: adset?.addlevel[0]?.page_id || ""
          },
        }
      });
      // form.setFieldsValue({
      //   page_id: adset.page_id
      // });
    }
    if (adset?.start_time) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            DatePicker: dayjs(adset.start_time).tz("America/New_York"),
          },
        }
      });
    }
    if (adset?.end_time) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            DatePickerEnd: dayjs(adset.end_time).tz(imagehash?.timeZone),
          },
        }
      });
    }
    if (adset?.beneficiary) {
      form.setFieldsValue({
        adsets: {
          [index]: {
            Beneficiary: adset.beneficiary,
            Payer: adset.payer
          },
        }
      });
    }
  }, [adset, index, imagehash]);

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
  useEffect(() => {
    if (adset?.DailyAdd_amount !== undefined) {
      form.setFields([
        {
          name: ["adsets", index, "DailyAdd_amount"],
          value: adset.DailyAdd_amount,
        },
      ]);
    }
  }, [adset?.DailyAdd_amount]);

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
          >
            <span
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                alignContent: "center",
              }}
            >
              {adset.AdsetPanelName}
            </span>

            {!view && (
              <div>
                {index !== 0 && !adset.Adsetid && (
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
            )}
          </div>
        }
        className="adset-collapse-panel"
        key={adset.id}
        forceRender
      >
        <div style={{ display: "flex", height: "0px" }}>
          <Form.Item
            name={["adsets", index, "id"]}
            initialValue={adset.id}
          ></Form.Item>
          <Form.Item
            name={["adsets", index, "Adsetid"]}
            initialValue={adset.Adsetid}
          ></Form.Item>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <Form.Item
            name={["adsets", index, "AdsetName"]}
            initialValue={campaignName}
            label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 250px" }}
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
            style={{ flex: "1 1 150px" }}
            initialValue={adset.action_source || "website"}
          >
            <Select
              disabled={adset.Adsetid || view ? true : false}
              options={
                Action_Source_Values[objectiveValue] || []
                //   [
                //   { value: "website", label: "Website" },
                //   { value: "email", label: "Email" },
                //   { value: "app", label: "App" },
                //   { value: "phone_call", label: "Phone Call" },
                // ]
              }
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            // defaultValue={adset.action_source || "website"}
            // onChange={(value) => handleFieldChange(index, "action_source", value)}
            />
          </Form.Item>
          <Form.Item
            name={["adsets", index, "optimization_goal"]}
            label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "1 1 140px" }}
            initialValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
          >
            {/* <Select
              disabled={adset.Adsetid || view ? true : false}
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
            /> */}
            {index === 0 ? (
              <Select
                options={optionsForIndex}
                disabled={adset?.Adsetid ? true : false}
                value={currentValue}
                onChange={(val) => handleFirstOptimizationChange(val)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
              />
            ) : (
              // Select stays enabled but only the current option is enabled to pick
              <Select
                options={optionsForIndex}
                disabled={adset?.Adsetid ? true : false}
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
            style={{ flex: "1 1 140px" }}
            initialValue={adset.custom_event_type || "LEAD"}
          >
            <Select
              disabled={adset?.Adsetid ? true : false}
              //   options={
              //     [
              //     { value: "LEAD", label: "Lead" },
              //     { value: "PURCHASE", label: "Purchase" },
              //     { value: "SEARCH", label: "Search" },
              //     { value: "CONTACT", label: "Contact" },
              //   ]
              // }
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
            style={{ flex: "1 1 140px" }}
            initialValue={adset.billing_event || "IMPRESSIONS"}
          >
            <Select
              disabled={adset.Adsetid || view ? true : false}
              options={
                //   [
                //   { value: "IMPRESSIONS", label: "Impressions" },
                //   { value: "VALUE", label: "Value" },
                // ]
                Billing_Event_options[optimizationGoalValue] || []
              }
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
          <Form.Item
            // name="pixel_id"
            name={["adsets", index, "pixel_id"]}
            // initialValue={
            //   typeof imagehash?.pixelID === "object"
            //     ? imagehash.pixelID.Universal || Object.values(imagehash.pixelID)[0]
            //     : imagehash?.pixelID
            // }
            initialValue={adset?.pixel_id}
            label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
            rules={[
              {
                required: true,
                message: "Please select an option!",
              },
            ]}
            style={{ flex: "120px" }}
          >
            <Select
              // mode="multiple"
              options={pixelIDLIst}
              disabled={adset?.Adsetid}
              placeholder="Select pixel"
              // optionFilterProp="label"
              // allowClear
              // maxTagCount={1}
              // maxTagPlaceholder={(omitted) => `+${omitted.length}`}
              // className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
              dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
              style={{ width: "100%", borderRadius: 8 }}
            />
            {/* {typeof imagehash?.pixelID === "object" ? (
              <Select
                defaultValue={imagehash?.pixelID?.Universal}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              >
                {Object.entries(imagehash.pixelID).map(([label, value]) => (
                  <Select.Option key={value} value={value}>
                    {`${label} - ${value}`}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input
                disabled={adset.Adsetid || view ? true : false}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            )} */}
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
            name={["adsets", index, "DatePicker"]}
            label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
            rules={[
              {
                required: true,
                message: "Please input!",
              },
            ]}
            style={{ flex: "150px" }}
          // initialValue={adset?.start_time ? dayjs(adset?.start_time) : dayjs()}
          >
            <DatePicker
              disabled={adset.Adsetid || view ? true : false}
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
              label={<span style={{ color: "#B4B4B4" }}>End Time</span>}
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
          <Form.Item
            name={["adsets", index, "DailyAdd_amount"]}
            label={<span style={{ color: "#B4B4B4" }}>{`${budgetType.charAt(0).toUpperCase()}${budgetType.slice(1).toLowerCase()} budget`}</span>}
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
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
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
                  //   handleAdsetChange(index, value);

                  //   // Ensure that 'adsets' is defined and is an array
                  //   const adsets = form.getFieldValue("adsets") || []; // Fallback to empty array if undefined

                  //   // Update only the DailyAdd_amount in the form without disturbing other values
                  //   const updatedAdsets = adsets.map((ad, i) =>
                  //     i === index ? { ...ad, DailyAdd_amount: value } : ad
                  //   );

                  //   form.setFieldsValue({
                  //     adsets: updatedAdsets,
                  //   });
                  const finalValue = value === null ? 0 : value;

                  // Update adset value in the component state
                  handleAdsetChange(index, finalValue);

                  // Ensure that 'adsets' is defined and is an array
                  const adsets = form.getFieldValue("adsets") || [];

                  // Update only the DailyAdd_amount without disturbing other values
                  const updatedAdsets = adsets.map((ad, i) =>
                    i === index ? { ...ad, DailyAdd_amount: finalValue } : ad
                  );

                  form.setFieldsValue({ adsets: updatedAdsets });
                  const hasBudget = updatedAdsets.some(
                    (ad) => Number(ad.DailyAdd_amount) > 0
                  );
                  setIsAnyAdsetBudgetSet(hasBudget);

                  // // Trigger validation for this specific field
                  // form.validateFields([["adsets", index, "DailyAdd_amount"]]);
                }}
                readOnly={isCampaignBudgetActive} // Make adset budget read-only if campaign budget is active
                style={{ width: 120 }}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
              />
            </Tooltip>
          </Form.Item>
          {showBidAmount && (
            <Form.Item
              name={["adsets", index, "bid_amount"]}
              label={
                <span style={{ color: "#B4B4B4" }}>Cost per Result Goal</span>
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
            color: "green",
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
              // defaultValue={adset.countries || "US"}
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
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            />
          </Form.Item> */}
          <Form.Item noStyle key={index}>
            <Form.Item
              name={["adsets", index, "countries"]}
              label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
              required={true}
              style={{ flex: "0 0 140px" }}
            // rules={[
            //   {
            //     validator: (_, value) =>
            //       value && value.length > 0
            //         ? Promise.resolve()
            //         : Promise.reject(new Error("At least one country is required")),
            //   },
            // ]}
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
                // disabled={(geo === "Geos" && index !== 0)}
                options={newCampaignCountries}
                getPopupContainer={(trigger) => trigger.parentNode}
                dropdownClassName={theme === "dark" ? "custom-dropdown" : ""}
                className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`}
              // change handler: only needs to actively update when first index and geo === "Geos"
              // onChange={(val) => {
              //   if (geo === "Geos" && index === 0) {
              //     handleFirstCountriesChange(val);
              //   } else {
              //     // For independent mode, let Ant Form handle the change automatically.
              //     // If you need side effects when geo !== "Geos", handle them here.
              //   }
              // }}
              />
            </Form.Item>
          </Form.Item>

          {BeneficiaryAndPayer && (
            <>
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
            initialValue={JSON.stringify(adset?.Gender) || "1"}
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
                  </Form.Item>

                  <Form.Item
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
                  </Form.Item>
                </div>
              ) : null;
            }}
          </Form.Item>
          {/* </div> */}
        </div>
        <Collapse defaultActiveKey={["open"]} expandIconPosition="start">
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
                //   setActiveMediaIndex({});
                // }}
                >
                  AD LEVEL
                </span>
                {(newAddLevelData[adset.id] || []).length > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Breadcrumb separator={<span style={{ color: theme === "dark" ? "#fff" : "#333" }}>/</span>}>
                      <div style={{ display: 'flex' }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewSingleAd({});
                            setActiveMediaIndex((prev) => ({
                              ...prev,
                              [index]: -1, // 🔹 mark -1 as active for MoreOutlined
                            }));
                          }}
                          style={{
                            fontWeight: activeMediaIndex[index] === -1 ? "500" : "normal",
                            color:
                              activeMediaIndex[index] === -1
                                ? "#91C25F"
                                : theme === "dark"
                                  ? "#fff"
                                  : "#333",
                            cursor: "pointer",
                            backgroundColor:
                              activeMediaIndex[index] === -1
                                ? theme === "dark"
                                  ? "rgba(145,194,95,0.2)"
                                  : "rgba(145,194,95,0.15)"
                                : "transparent",
                            border:
                              activeMediaIndex[index] === -1
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
                      {newAddLevelData[adset.id].map((_, i) => (
                        <Breadcrumb.Item key={i}>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewSingleAd(newAddLevelData[adset.id][i]);
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
            {viewSingleAd && Object.keys(viewSingleAd).length > 0 && (
              <AddComponent
                view={view}
                adset={adset}
                imagehash={imagehash}
                accountis={accountis}
                network={network}
                isViewAdset={false}
                viewSingleAd={viewSingleAd}
                newAddLevelData={newAddLevelData}
                setNewAddLevelData={setNewAddLevelData}
                activeMediaIndex={activeMediaIndex}
                setSelectedFilesFromAdset={setSelectedFiles}
                setSelectedFilesFromCreativesFromAdset={
                  setSelectedFilesFromCreatives
                }
                setSelectedFilesFromMediaFromAdset={setSelectedFilesFromMedia}
              />
            )}
            {Object.keys(viewSingleAd).length === 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ flex: "70%", marginRight: "5%" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Form.Item
                        label={
                          <span style={{ color: "#B4B4B4" }}>
                            Select source
                          </span>
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
                              //   beforeUpload={() => false}
                              disabled={view}
                              itemRender={(
                                originNode,
                                file,
                                fileList,
                                actions
                              ) => {
                                console.log(file);
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
                              //   onChange={(info) => {
                              //     const newFiles = info.fileList.map((file) => ({
                              //       ...file,
                              //       uid: file.uid || `-${Date.now()}`,
                              //       source: "media",
                              //       thumbUrl:
                              //         file.thumbUrl ||
                              //         (file.originFileObj
                              //           ? URL.createObjectURL(file.originFileObj)
                              //           : undefined),
                              //     }));

                              //     setSelectedFiles((prev) => {
                              //       const existingUids = new Set(
                              //         (prev[adset.id] || []).map((f) => f.uid)
                              //       );
                              //       const updated = [
                              //         ...(prev[adset.id] || []),
                              //         ...newFiles.filter(
                              //           (f) => !existingUids.has(f.uid)
                              //         ),
                              //       ];
                              //       return { ...prev, [adset.id]: updated };
                              //     });

                              //     setSelectedFilesFromMedia((prev) => {
                              //       const existingUids = new Set(
                              //         (prev[adset.id] || []).map((f) => f.uid)
                              //       );
                              //       const updated = [
                              //         ...(prev[adset.id] || []),
                              //         ...newFiles.filter(
                              //           (f) => !existingUids.has(f.uid)
                              //         ),
                              //       ];
                              //       return { ...prev, [adset.id]: updated };
                              //     });

                              //     const formMedia =
                              //       form.getFieldValue([
                              //         "adsets",
                              //         index,
                              //         "MediaContent",
                              //       ]) || [];
                              //     form.setFieldsValue({
                              //       adsets: {
                              //         [index]: {
                              //           MediaContent: [...formMedia, ...newFiles],
                              //         },
                              //       },
                              //     });

                              //     form.validateFields([
                              //       ["adsets", index, "MediaContent"],
                              //     ]);
                              //   }}
                              //1234
                              onChange={(info) => {
                                const allFiles = info.fileList.map((file) => ({
                                  ...file,
                                  id: file.id || uuidv4(),
                                  canDelete: true,
                                  uid: file.uid,
                                  source: "media",
                                  adsetId: adset.id,
                                  thumbUrl:
                                    file.thumbUrl ||
                                    (file.originFileObj
                                      ? URL.createObjectURL(file.originFileObj)
                                      : undefined),
                                }));

                                setNewAddLevelData((prev) => {
                                  const getNextAddNumber = (prev) => {
                                    const numbers = prev
                                      .map((item) => {
                                        const parts = item.AddName?.split("_");
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

                                  const key = adset.id;
                                  const list = Array.isArray(prev[key])
                                    ? prev[key].filter(Boolean)
                                    : [];

                                  const nextAddNumber =
                                    list?.length + 1 || getNextAddNumber(list);

                                  // ✅ Step: Filter only new files that are not already in prev based on uid
                                  const existingUids = new Set(
                                    list.map((item) => item.uid)
                                  );
                                  const trulyNewFiles = (allFiles || []).filter(
                                    (item) => !existingUids.has(item?.uid)
                                  );

                                  const mappedWithAddName = trulyNewFiles.map(
                                    (item, i) => ({
                                      id: item.id,
                                      AddName: `${addName}_${nextAddNumber + i
                                        }`,
                                      filename: item,
                                      uid: item.uid,
                                      page_id: form.getFieldValue("page_id"),
                                      message: primaryText,
                                      headline: headline,
                                      Description: description,
                                      Caption: caption,
                                      Website_URL: websiteURL,
                                    })
                                  );

                                  return {
                                    ...prev,
                                    [key]: [...list, ...mappedWithAddName],
                                  };
                                });

                                // ✅ Step 1: Update selected files
                                // setSelectedFiles((prev) => {
                                //   const existingUids = new Set(
                                //     prev[adset.id].map((f) => f.uid)
                                //   );
                                //   const updated = [
                                //     ...prev[adset.id],
                                //     ...allFiles.filter(
                                //       (f) => !existingUids.has(f.uid)
                                //     ),
                                //   ];
                                //   return {...prev, [adset.id]: updated };
                                // });

                                // setSelectedFilesFromMedia((prev) => {
                                //   const existingUids = new Set(
                                //     prev[adset.id].map((f) => f.uid)
                                //   );
                                //   const updated = [
                                //     ...prev[adset.id],
                                //     ...allFiles.filter(
                                //       (f) => !existingUids.has(f.uid)
                                //     ),
                                //   ];
                                //   return {...prev, [adset.id]: updated };
                                // });

                                setSelectedFiles((prev) => {
                                  const key = adset.id;
                                  const list = Array.isArray(prev?.[key])
                                    ? prev[key].filter(Boolean)
                                    : [];
                                  const existingUids = new Set(
                                    list.map((f) => f?.uid).filter(Boolean)
                                  );
                                  const appended = (allFiles || []).filter(
                                    (f) => !existingUids.has(f?.uid)
                                  );
                                  return {
                                    ...prev,
                                    [key]: [...list, ...appended],
                                  };
                                });

                                // ✅ Mirror for Media list
                                setSelectedFilesFromMedia((prev) => {
                                  const key = adset.id;
                                  const list = Array.isArray(prev?.[key])
                                    ? prev[key].filter(Boolean)
                                    : [];
                                  const existingUids = new Set(
                                    list.map((f) => f?.uid).filter(Boolean)
                                  );
                                  const appended = (allFiles || []).filter(
                                    (f) => !existingUids.has(f?.uid)
                                  );
                                  return {
                                    ...prev,
                                    [key]: [...list, ...appended],
                                  };
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
                                  form.getFieldValue([
                                    "adsets",
                                    index,
                                    "MediaContent",
                                  ]) || [];
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
                                  adsets: {
                                    [index]: {
                                      MediaContent: updatedFormMedia,
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
                                if (fileToRemove.canDelete === false) {
                                  return false; // ❌ Prevent removal
                                }
                                setSelectedFilesFromMedia((prev) => {
                                  const updated = (prev[adset.id] || []).filter(
                                    (f) => f.uid !== fileToRemove.uid
                                  );
                                  if (updated.length === 0) {
                                    setSelectedOption("creative");
                                  }
                                  return { ...prev, [adset.id]: updated };
                                });

                                setSelectedFiles((prev) => {
                                  const updated = (prev[adset.id] || []).filter(
                                    (f) => f.uid !== fileToRemove.uid
                                  );
                                  return { ...prev, [adset.id]: updated };
                                });

                                setNewAddLevelData((prev) => {
                                  const key = adset.id;
                                  const list = Array.isArray(prev[key])
                                    ? prev[key].filter(Boolean)
                                    : [];
                                  const fileIndex = list.findIndex(
                                    (f) => f.uid === fileToRemove.uid
                                  );
                                  const filtered = list.filter(
                                    (f) => f.uid !== fileToRemove.uid
                                  );
                                  const renumber = (arr, start) => {
                                    const p = String(
                                      arr[start]?.AddName ??
                                      arr[0]?.AddName ??
                                      "AddName"
                                    ).replace(/_?\d+$/, "");
                                    for (let i = start; i < arr.length; i++)
                                      arr[i] = {
                                        ...arr[i],
                                        AddName: `${p}_${i + 1}`,
                                      };
                                    return arr;
                                  };
                                  const arr = renumber(filtered, fileIndex);
                                  return {
                                    ...prev,
                                    [key]: arr,
                                  };
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
                              showUploadList={{ showRemoveIcon: false }}
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
                                          {!view && !file.Addid && (
                                            <DeleteOutlined
                                              onClick={() => {
                                                // Update selectedFilesFromCreatives for the current adset (index)
                                                const updatedCreatives =
                                                  selectedFilesFromCreatives[
                                                    adset.id
                                                  ].filter(
                                                    (f) => f.uid !== file.uid
                                                  );
                                                setSelectedFilesFromCreatives(
                                                  (prev) => {
                                                    const updated = {
                                                      ...prev,
                                                      [adset.id]:
                                                        updatedCreatives,
                                                    }; // Update the adset.id specifically
                                                    return updated;
                                                  }
                                                );

                                                // Update selectedFiles for the current adset (adset.id)
                                                const updatedFiles =
                                                  selectedFiles[adset.id].filter(
                                                    (f) => f.uid !== file.uid
                                                  );
                                                setSelectedFiles((prev) => {
                                                  const updated = {
                                                    ...prev,
                                                    [adset.id]: updatedFiles,
                                                  }; // Update the index specifically
                                                  return updated;
                                                });

                                                setNewAddLevelData((prev) => {
                                                  const key = adset.id;
                                                  const list = Array.isArray(
                                                    prev[key]
                                                  )
                                                    ? prev[key].filter(Boolean)
                                                    : [];
                                                  const fileIndex =
                                                    list.findIndex(
                                                      (f) => f.id === file.id
                                                    );
                                                  const filtered = list.filter(
                                                    (f) => f.id !== file.id
                                                  );
                                                  const renumber = (
                                                    arr,
                                                    start
                                                  ) => {
                                                    const p = String(
                                                      arr[start]?.AddName ??
                                                      arr[0]?.AddName ??
                                                      "AddName"
                                                    ).replace(/_?\d+$/, "");
                                                    for (
                                                      let i = start;
                                                      i < arr.length;
                                                      i++
                                                    )
                                                      arr[i] = {
                                                        ...arr[i],
                                                        AddName: `${p}_${i + 1}`,
                                                      };
                                                    return arr;
                                                  };
                                                  const arr = renumber(
                                                    filtered,
                                                    fileIndex
                                                  );
                                                  return {
                                                    ...prev,
                                                    [key]: arr,
                                                  };
                                                });

                                                // Update form values with the new MediaContent array
                                                form.setFieldsValue({
                                                  MediaContent: updatedCreatives,
                                                });

                                                // Trigger validation
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
                      // name="page_id"
                      name={["adsets", index, "page_id"]}
                      initialValue={adset?.page_id}
                      label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                      rules={[
                        {
                          required: true,
                          message: "Please select an option!",
                        },
                      ]}
                      style={{ flex: "140px" }}
                    >
                      <Select
                        // mode="multiple"
                        options={pageIDList}
                        disabled={adset?.Adsetid}
                        placeholder="Select page"
                        onChange={(value) => {
                          // setAddName(e.target.value);
                          setNewAddLevelData((prev) => {
                            const key = adset.id;
                            const list = Array.isArray(prev[key])
                              ? prev[key].filter(Boolean)
                              : [];

                            const next = list.map((item, idx) => ({
                              ...item,
                              page_id: value,
                            }));

                            return { ...prev, [key]: next };
                          });
                        }}

                        // optionFilterProp="label"
                        // allowClear
                        // maxTagCount={1}
                        // maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                        // className={`single-row-select green-border-select ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
                        dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                        style={{ width: "100%", borderRadius: 8 }}
                      />
                      {/* <Input
                        style={{ width: "23%" }}
                        className={
                          theme === "dark"
                            ? "custom-input-dark"
                            : "custom-input-light"
                        }
                      /> */}
                    </Form.Item>
                  </div>
                  <Form.Item
                    name={["adsets", index, "AddName"]}
                    initialValue={campaignName}
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
                      onChange={(e) => {
                        setAddName(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            AddName: `${e.target.value}_${idx + 1}`,
                          }));

                          return { ...prev, [key]: next };
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
                      <span style={{ color: "#B4B4B4" }}>Primary text</span>
                    }
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
                      onChange={(e) => {
                        setPrimaryText(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            message: `${e.target.value}`,
                          }));

                          return { ...prev, [key]: next };
                        });
                      }}
                      className={
                        theme === "dark"
                          ? "custom-input-dark"
                          : "custom-input-light"
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
                      onChange={(e) => {
                        setHeadline(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            headline: `${e.target.value}`,
                          }));

                          return { ...prev, [key]: next };
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
                      <span style={{ color: "#B4B4B4" }}>Description</span>
                    }
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
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            Description: `${e.target.value}`,
                          }));

                          return { ...prev, [key]: next };
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
                          {/* <Tooltip title="This is a required field">
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
                      onChange={(e) => {
                        setWebsiteURL(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            Website_URL: `${e.target.value}`,
                          }));

                          return { ...prev, [key]: next };
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
                      <span style={{ color: "#B4B4B4" }}>Display link</span>
                    }
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
                      onChange={(e) => {
                        setCaption(e.target.value);
                        setNewAddLevelData((prev) => {
                          const key = adset.id;
                          const list = Array.isArray(prev[key])
                            ? prev[key].filter(Boolean)
                            : [];

                          const next = list.map((item, idx) => ({
                            ...item,
                            Caption: `${e.target.value}`,
                          }));

                          return { ...prev, [key]: next };
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
                    // bodyStyle={{ height: "50vh", overflowY: "auto" }}
                    styles={{
                      body: {
                        height: "50vh",
                        overflowY: "auto",
                      },
                    }}
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
                                    color:
                                      theme === "dark" ? "white" : "#000",
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
                                marginTop: '4px',
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
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>

                            <div className="ad-cta">
                              <div className="details">
                                <div
                                  className="link"
                                  style={{
                                    color:
                                      theme === "dark" ? "white" : "#000",
                                    marginTop: '10px'
                                  }}

                                >
                                  {caption}
                                </div>
                                <div
                                  className="title"
                                  style={{
                                    color:
                                      theme === "dark" ? "white" : "#000",
                                    marginTop: '5px'
                                  }}
                                >
                                  {headline}
                                </div>
                                <div
                                  className="desc"
                                  style={{
                                    color:
                                      theme === "dark" ? "white" : "#000",
                                    marginTop: '5px'
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
                                padding: "5px",
                                marginTop: '15px',
                                marginLeft: '10px'
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
                                <CommentOutlined
                                  style={{ fontSize: "20px" }}
                                />{" "}
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
          // bodyStyle={{ height: "50vh", overflowY: "auto" }}
          styles={{
            body: {
              height: "50vh",
              overflowY: "auto",
            },
          }}
          className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
            }`}
        >
          {getUrlBuilder}
        </Modal>
      </Panel>
    </Collapse>
  );
};

const EditMultipleAdsetCampaignDrawer = ({
  visible,
  onClose,
  changeRRefrst,
  accountis,
  network,
  selectedRow,
  view,
}) => {
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
  const [imagehash, setimagehash] = useState("");
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
  const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState(
    {}
  );
  const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState({});
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [adsets, setAdsets] = useState([
    { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "ADSET 1" },
  ]);
  const [creativeIndex, setCreativeIndex] = useState(0);
  const selectedRef = useRef({});
  const newSelectedRef = useRef(null);
  const { userdetails } = useTokenContext();
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
  const [popupInputs, setPopupInputs] = useState({ reportCat: "", input2: "" });
  const [newReportCategory, setNewReportCategory] = useState("");
  const [reportCategories, setReportCategories] = useState([]);
  const [rEditModalVisible, setREditModalVisible] = useState(false);
  const [rDeleteModalVisible, setRDeleteModalVisible] = useState(false);
  const [rCurrentCategory, setRCurrentCategory] = useState(null);
  const [rEditedName, setREditedName] = useState("");
  const [errors, setErrors] = useState({ input1: "", input2: "" });
  const [refreshDraft, setRefreshDraft] = useState(false);
  const [fullCampaignData, setFullCampaignData] = useState(null);
  const [addlevelData, setAddLevelData] = useState({});
  const [newAddLevelData, setNewAddLevelData] = useState({});
  console.log(draftsData, "draftsData in CreateCampaignDrawer");
  console.log(selectedRow, "selectedRow in EditMultipleAdsetCampaignDrawer");
  const [pixelIDLIst, setPixelIDList] = useState([]);
  const [pageIDList, setPageIDList] = useState([]);
  const [budgetType, setBudgetType] = useState("daily");

  console.log(pixelIDLIst, "pixelIDLIst in EditMultipleAdsetCampaignDrawer");
  console.log(pageIDList, "pageIDList in EditMultipleAdsetCampaignDrawer");

  const objectiveValue = Form.useWatch("Objectives", form);
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

  const handleConfirm = async () => {
    const newErrors = {
      input1: popupInputs.input1.trim() ? "" : "First input is required",
      input2: popupInputs.input2.trim() ? "" : "Second input is required",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((msg) => msg !== "");
    if (hasErrors) {
      return Promise.reject(); // keep Popconfirm open
    }

    setConfirmLoading(true);

    try {
      const allValues = form.getFieldsValue(true);

      const draftData = await MultipleAdsetsDraftFetching(allValues);
      const totalDraftData = {
        id: uuidv4(),
        Title: popupInputs.input1,
        Draft_Name: popupInputs.input2,
        ...draftData,
      };
      //   console.log(totalDraftData, "totalDraftData in handleConfirm");

      const response = await fetch(
        "https://www.testapi.adsgoat.in/api/submitDraftData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            draftData: totalDraftData,
            email: session?.user?.email,
            userName: session?.user?.name,
          }),
        }
      );
      if (response.status === 200 || response.status === 201) {
        setRefreshDraft((prev) => !prev);
      }
      console.log("Draft data submitted successfully:", response);

      // Close only after successful fetch and processing
      return new Promise((resolve) => {
        setTimeout(() => {
          setConfirmLoading(false);
          setOpen(false); // 👈 Close here after everything is done
          setPopupInputs({ input1: "", input2: "" });
          setErrors({ input1: "", input2: "" });
          resolve(); // must resolve to properly finish Popconfirm
        }, 500);
      });
    } catch (err) {
      console.error("❌ Error during MultipleAdsetsDraftFetching:", err);
      setConfirmLoading(false);
      return Promise.reject(); // keep Popconfirm open
    }
  };

  const handleCancelPop = () => {
    setOpen(false);
    setPopupInputs({ input1: "", input2: "" });
    setErrors({ input1: "", input2: "" });
  };

  // Track if any adset has a budget set
  // useEffect(() => {
  //     const anyAdsetFilled = adsets.some(adset => adset.DailyAdd_amount > 0);
  //     setIsAnyAdsetBudgetSet(anyAdsetFilled);
  // }, [adsets]);

  const addReportCategory = async () => {
    const name = newReportCategory.trim();
    if (!name || !(selectedRow?.Account_Number)) return;

    const accounts = Array.isArray(selectedRow?.Account_Number) ? selectedRow?.Account_Number : [selectedRow?.Account_Number];

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
    if (!catId || !clean || !(accountNumber)) return;

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

  const fetchData = async (selectedRow) => {
    try {
      if (selectedRow) {
        const response = await axios.get(
          `https://www.testapi.adsgoat.in/api/newviecampaigndata/${selectedRow.identifier}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        console.log("hello viewdata", ...response.data);
        setFullCampaignData(response?.data[0]);
        setBudgetType(response?.data[0]?.camapaignlevel?.Budget_type || "daily")
        setPopupInputs(prev => ({
          ...prev,
          reportCat: response?.data[0]?.Category  // <-- value coming from API
        }));

        setFormValuesFromDraft(response?.data[0]);
        // const enrichedPanels = (response?.data[0]?.addlevel || []).map((item, index) => {
        //     const selectedOption = item.selectedOption || "creative";

        //     const defaultFile = item.filename
        //         ? [
        //             {
        //                 uid: `file-${index}`,
        //                 name: item.filename.split("/").pop(),
        //                 url: item.filename,
        //                 type: item.filename.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
        //                 source: selectedOption === "upload" ? "media" : "creative",
        //             },
        //         ]
        //         : [];

        //     return {
        //         ...item,
        //         key: `panel-${index}`,
        //         selectedOption,
        //         selectedFilesFromMedia: [], // selectedOption === "upload" ? defaultFile : []
        //         selectedFilesFromCreatives: selectedOption === "creative" ? defaultFile : [],
        //         selectedFiles: defaultFile,
        //     };
        // });

        // setPanels(enrichedPanels);
      }
    } catch (error) {
      console.error("Error fetching campaign list:", error);
    }
  };

  const fetchCategories = async (selectedRow) => {
    try {
      if (selectedRow) {
        const resp = await axios.post(
          "https://www.testapi.adsgoat.in/api/getreportcategories",
          { accounts: [String(selectedRow?.Account_Number)] },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (resp.data?.ok) {
          setReportCategories(resp.data.categories);
        }
      }

    } catch (error) {
      console.error("Error fetching report categories:", error);
    }
  };

  useEffect(() => {
    // Run only when objectiveValue changes
    if (objectiveValue) {
      const adsets = form.getFieldValue("adsets") || [];

      const updatedAdsets = adsets.map((adset) => ({
        ...adset,
        optimization_goal: "OFFSITE_CONVERSIONS",
        custom_event_type:
          objectiveValue === "OUTCOME_LEADS" ? "LEAD" : "PURCHASE",
        action_source: "website",
        billing_event: "IMPRESSIONS",
      }));

      form.setFieldsValue({
        adsets: updatedAdsets,
      });
    }
  }, [objectiveValue, form]);

  // useEffect(() => {
  //   fetchData(selectedRow);
  //   fetchCategories(selectedRow);
  // }, [selectedRow]);
  useEffect(() => {
    const run = async () => {
      await fetchData(selectedRow);
      await fetchCategories(selectedRow);
    };
    run();
  }, [selectedRow]);

  useEffect(() => {
    if (fullCampaignData) {
      console.log(
        fullCampaignData,
        "fullCampaignData in EditMultipleAdsetCampaignDrawer"
      );
      if (fullCampaignData?.camapaignlevel?.Daily_amount > 0) {
        setIsCampaignBudgetActive(true);
        setIsAnyAdsetBudgetSet(false);
      } else {
        setIsCampaignBudgetActive(false);
        setIsAnyAdsetBudgetSet(true);
      }
    }
  }, [fullCampaignData]);

  useEffect(() => {
    const adsets = form.getFieldValue("adsets") || [];
    const anyAdsetFilled = adsets.some((adset) => adset?.DailyAdd_amount > 0);
    setIsAnyAdsetBudgetSet(anyAdsetFilled);
  }, [form]);

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
      // setCampaignLevelDailyBudget(0);
      setSelectedOption("upload");
      setIsManual(false);
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
    const newUUID = uuidv4();
    const newAdset = {
      id: newUUID,
      AdsetPanelName: newAdsetName,
      AdsetName: "", // Add default values for the new adset
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
      AddName: "",
      Description: "Find More",
      Caption: "",
      Website_URL: "",
      pixel_id: "", // Or set it based on your requirement
      start_date: new Date(),
      MediaContent: [], // Default MediaContent as empty array
    };
    setAdsets((prevAdsets) => [...prevAdsets, newAdset]);
    setAddLevelData((prev) => ({
      ...prev,
      [newUUID]: [],
    }));
    setNewAddLevelData((prev) => ({
      ...prev,
      [newUUID]: [],
    }));

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

  // const cloneAdset = (adsetId) => {
  //   const adsetIndex = adsets.findIndex((ad) => ad.id === adsetId);
  //   if (adsetIndex === -1) return;

  //   const originalAdset = adsets[adsetIndex];
  //   const newId = uuidv4();

  //   const baseName = originalAdset.AdsetPanelName;
  //   const copyCount = adsets.filter((ad) =>
  //     ad.AdsetPanelName.startsWith(baseName)
  //   ).length;
  //   const newPanelName =
  //     copyCount > 0 ? `${baseName}(${copyCount})_Copy` : `${baseName}_Copy`;

  //   const { Adsetid, ...rest } = originalAdset;

  //   const clonedAdset = {
  //     ...rest,
  //     id: newId,
  //     AdsetPanelName: newPanelName,
  //   };

  //   const currentFormAdsets = form.getFieldValue("adsets") || [];

  //   // ✅ Match by UUID not index!
  //   const formIndex = currentFormAdsets.findIndex(
  //     (_, i) => adsets[i]?.id === adsetId
  //   );
  //   const clonedFormData = { ...currentFormAdsets[formIndex] };

  //   // ✅ Add `_Copy` to AdsetName and AddName if present
  //   if (clonedFormData.AdsetName) {
  //     clonedFormData.AdsetName = `${clonedFormData.AdsetName}_Copy`;
  //   }
  //   if (clonedFormData.AddName) {
  //     clonedFormData.AddName = `${clonedFormData.AddName}_Copy`;
  //   }

  //   const updatedFormAdsets = [...currentFormAdsets, clonedFormData];
  //   const updatedAdsets = [...adsets, clonedAdset];

  //   // ✅ Set both states
  //   setAdsets(updatedAdsets);
  //   form.setFieldsValue({ adsets: updatedFormAdsets });

  //   // ✅ Clone media/file states by UUID
  //   const cloneFiles = (prev, setter) => {
  //     setter((old) => ({
  //       ...old,
  //       [newId]: (old[adsetId] || []).map(({ Addid, ...rest }) => rest), // remove Addid
  //     }));
  //   };

  //   cloneFiles(selectedFiles, setSelectedFiles);
  //   cloneFiles(selectedFilesFromMedia, setSelectedFilesFromMedia);
  //   cloneFiles(selectedFilesFromCreatives, setSelectedFilesFromCreatives);

  //   setAddLevelData((prev) => ({
  //     ...prev,
  //     [newId]: prev[adsetId] ? [...prev[adsetId]] : []}));

  //   setNewAddLevelData((prev) => ({
  //     ...prev,
  //     [newId]: prev[adsetId] ? [...prev[adsetId]] : []}));

  //   // ✅ Clone selectedPositions
  //   setSelectedPositions((prev) => ({
  //     ...prev,
  //     [newId]: [...(prev[adsetId] || [])],
  //   }));
  //   setSelectedPublishers((prev) => ({
  //     ...prev,
  //     [newId]: [...(prev[adsetId] || [])],
  //   }));

  //   // ✅ Open the last panel (the newly cloned one)
  //   setActiveKey([`${updatedAdsets.length - 1}`]);
  // };

  const cloneAdset = (adsetId) => {
    const adsetIndex = adsets.findIndex((ad) => ad.id === adsetId);
    if (adsetIndex === -1) return;

    const originalAdset = adsets[adsetIndex];
    const newId = uuidv4(); // ✅ new unique id every time

    const baseName = originalAdset.AdsetPanelName;
    const copyCount = adsets.filter((ad) =>
      ad.AdsetPanelName.startsWith(baseName)
    ).length;
    const newPanelName =
      copyCount > 0 ? `${baseName}(${copyCount})_Copy` : `${baseName}_Copy`;

    // ✅ remove Adsetid (FB id) and Addid
    const { Adsetid, Addid, ...rest } = originalAdset;

    const clonedAdset = {
      ...rest,
      id: newId,
      AdsetPanelName: newPanelName,
    };

    const currentFormAdsets = form.getFieldValue("adsets") || [];

    // ✅ Match by UUID not index
    const formIndex = currentFormAdsets.findIndex(
      (_, i) => adsets[i]?.id === adsetId
    );
    const clonedFormData = { ...currentFormAdsets[formIndex] };

    // ✅ Assign the new unique id to the cloned form entry
    clonedFormData.id = newId;

    // ✅ Add `_Copy` suffixes if present
    if (clonedFormData.AdsetName) {
      clonedFormData.AdsetName = `${clonedFormData.AdsetName}_Copy`;
    }
    if (clonedFormData.AddName) {
      clonedFormData.AddName = `${clonedFormData.AddName}_Copy`;
    }

    const updatedFormAdsets = [...currentFormAdsets, clonedFormData];
    const updatedAdsets = [...adsets, clonedAdset];

    // ✅ Update both states
    setAdsets(updatedAdsets);
    form.setFieldsValue({ adsets: updatedFormAdsets });

    // ✅ Clone media/file states by UUID (remove Addid)
    const cloneFiles = (prev, setter) => {
      setter((old) => ({
        ...old,
        [newId]: (old[adsetId] || []).map(({ Addid, ...rest }) => rest),
      }));
    };

    cloneFiles(selectedFiles, setSelectedFiles);
    cloneFiles(selectedFilesFromMedia, setSelectedFilesFromMedia);
    cloneFiles(selectedFilesFromCreatives, setSelectedFilesFromCreatives);

    // ✅ Clone AddLevelData with newId
    // setAddLevelData((prev) => ({
    //   ...prev,
    //   [newId]: prev[adsetId] ? [...prev[adsetId]] : [],
    // }));

    // setNewAddLevelData((prev) => ({
    //   ...prev,
    //   [newId]: prev[adsetId] ? [...prev[adsetId]] : [],
    // }));

    setAddLevelData((prev) => ({
      ...prev,
      [newId]: prev[adsetId]
        ? prev[adsetId].map(({ Addid, Ad_Status, ...rest }) => rest)
        : [],
    }));

    setNewAddLevelData((prev) => ({
      ...prev,
      [newId]: prev[adsetId]
        ? prev[adsetId].map(({ Addid, Ad_Status, ...rest }) => rest)
        : [],
    }));

    // ✅ Clone positions & publishers
    setSelectedPositions((prev) => ({
      ...prev,
      [newId]: [...(prev[adsetId] || [])],
    }));
    setSelectedPublishers((prev) => ({
      ...prev,
      [newId]: [...(prev[adsetId] || [])],
    }));

    // ✅ Expand the cloned panel
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
    if (visible) {
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
        const pixelIDs = imagehash?.pixelID || [];
        const pageIDs = imagehash?.pageID || [];
        let uniquePixelIDs;
        let uniquePageIDs;
        if (pixelIDs && typeof pixelIDs === "object") {
          const result = Object.entries(pixelIDs).map(([key, value]) => ({
            value,
            label: `${key} - ${value}`
          }));
          uniquePixelIDs = result
        } else {
          uniquePixelIDs = [{ value: pixelIDs, label: pixelIDs }]
        }
        if (pageIDs && typeof pageIDs === "object") {
          const result = Object.entries(pageIDs).map(([key, value]) => ({
            value,
            label: `${key} - ${value}`
          }));
          uniquePageIDs = result
        }
        else {
          uniquePageIDs = [{ value: pageIDs, label: pageIDs }]
        }
        setPixelIDList(uniquePixelIDs);
        setPageIDList(uniquePageIDs);
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
    }
  }, [visible, imagehash, form]);

  const Accountchange = (e) => {
    setAccountNumber(e.target.value);
  };
  // const handlepositionChange = async (values) => {
  //     console.log(values, "handlepositionChange")
  // }

  const fetchAccountDetails = async () => {
    try {
      const response = await axios.get(
        `https://www.testapi.adsgoat.in/api/hashimageidentity/${accountNumber}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log("account data", ...response?.data);

      setimagehash(...response?.data);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      // Handle error
    }
  };

  const fetchDraftDeatils = async () => {
    try {
      const response = await axios.get(
        `https://www.testapi.adsgoat.in/api/getDraftData?email=${session?.user?.email}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      // console.log("account data", ...response?.data);
      console.log("Draft data fetched successfully:", response.data);
      // console.log((Array.isArray(response?.data?.Drafts && response?.data?.Drafts.length > 0) ? response?.data?.Drafts : []));
      setDraftsData(
        Array.isArray(response?.data?.Drafts) &&
          response?.data?.Drafts.length > 0
          ? response?.data?.Drafts
          : []
      );
      // setimagehash(...response?.data)
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      // Handle error
    }
  };

  useEffect(() => {
    if (accountNumber && visible) {
      fetchAccountDetails();
    }
  }, [accountNumber, visible]);

  //   useEffect(() => {
  //     fetchDraftDeatils();
  //   }, [refreshDraft]);

  const handleNameChange = async (e) => {
    // console.log("Account Number:", accountNumber);
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
          "https://prodapis.adsgoat.in/uploadUserFiles",
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
    const campaignData = await MultipleAdsestsFetching(formValues);

    console.log(fullCampaignData, "fullCampaignData");

    console.log("Campaign Data:", campaignData);

    try {
      if (campaignData) {
        // console.log("Campaign Data:", campaignData);
        //https://www.testapi.adsgoat.in
        const response = await fetch(
          "https://www.testapi.adsgoat.in/api/newEditFormData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({ ...campaignData, ...(fullCampaignData?.campaignid ? { re_launch: true } : {}) }),
          }
        );

        if (response.ok) {
          message.success("Campaign created successfully");
          console.log("Form data submitted successfully");
          setLoading(false); // Stop the spinner
          setSelectedFilesFromCreatives({});
          setSelectedFilesFromMedia({});
          setSelectedFiles({});
          onClose();
          setSelectedPositions({});
          setAdsets([
            { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "Adset 1" },
          ]);
          isManual !== "manual" && setIsManual(false);
          newSelectedRef.current = null; // Reset the newSelectedRef
          changeRRefrst();
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
    //efgh 1234

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
    // let AllAdsetsData = {
    //   identifier: fullCampaignData.identifier,
    //   campaign_name: values.Name,
    //   Account_Number: values.Account_Number,
    //   Approval: "PENDING_APPROVAL",
    //   fbstatus: "No-Live",
    //   camapaignlevel: {
    //     createdby: session?.user?.name,
    //     Name: values.Name,
    //     Objectives: values.Objectives,
    //     Special_categories: values.Special_categories,
    //     Bid_strategy: values.Bid_strategy,
    //     Daily_amount: parseFloat(values.Daily_amount) * 100,
    //     Status: values.Status,
    //     access_token: imagehash.token,
    //     createdDate: moment().tz(imagehash.timeZone).format("YYYY-MM-DD"),
    //     ...(fullCampaignData.camapaignlevel.campaignid
    //       ? { campaignid: fullCampaignData.camapaignlevel.campaignid }
    //       : {}),
    //   },
    // };
    let send_re_launch_status = false;
    let number = 1;
    let AllAdsetsData = {};
    AllAdsetsData["identifier"] = fullCampaignData.identifier;
    AllAdsetsData["campaign_name"] = values?.Name;
    AllAdsetsData["Account_Number"] = fullCampaignData.Account_Number;
    AllAdsetsData["Approval"] = fullCampaignData.Approval;
    AllAdsetsData["fbstatus"] = fullCampaignData.fbstatus === "Processing" ? "No-Live" : fullCampaignData.fbstatus;
    AllAdsetsData["Category"] = fullCampaignData.Category;
    if (fullCampaignData.Approvedby) AllAdsetsData["Approvedby"] = fullCampaignData.Approvedby;
    if (fullCampaignData.Approveddate) AllAdsetsData["Approveddate"] = fullCampaignData.Approveddate;
    if (fullCampaignData.camapaignlevel.campaignid) {
      AllAdsetsData["camapaignlevel"] = {};
      AllAdsetsData["camapaignlevel"]["Editedby"] = session?.user?.name;
      AllAdsetsData["camapaignlevel"]["EditedDate"] = moment().tz(imagehash.timeZone).format("YYYY-MM-DD");
      AllAdsetsData["camapaignlevel"]["Budget_type"] = budgetType;
      AllAdsetsData["camapaignlevel"]["campaignid"] =
        fullCampaignData.camapaignlevel.campaignid;
      AllAdsetsData["camapaignlevel"]["createdDate"] =
        fullCampaignData.camapaignlevel.createdDate;
      AllAdsetsData["camapaignlevel"]["createdby"] =
        fullCampaignData.camapaignlevel.createdby;
      AllAdsetsData["camapaignlevel"]["access_token"] =
        fullCampaignData.camapaignlevel.access_token;
      AllAdsetsData["camapaignlevel"]["Status"] =
        fullCampaignData.camapaignlevel.Status;
      AllAdsetsData["camapaignlevel"]["Objectives"] =
        fullCampaignData.camapaignlevel.Objectives;
      if (fullCampaignData.camapaignlevel.Name === values.Name) {
        AllAdsetsData["camapaignlevel"]["Name"] =
          fullCampaignData.camapaignlevel.Name;
      } else {
        AllAdsetsData["camapaignlevel"]["Name"] = values.Name;
        AllAdsetsData["camapaignlevel"]["re_lunch_campaign_name"] = true;
        send_re_launch_status = true;
      }
      if (values.countries && values.countries.length > 0) {
        AllAdsetsData["camapaignlevel"]["Special_categories_countries"] = values.countries;
      }
      if (
        JSON.stringify(fullCampaignData.camapaignlevel.Special_categories) ===
        JSON.stringify(values.Special_categories)
      ) {
        AllAdsetsData["camapaignlevel"]["Special_categories"] =
          fullCampaignData.camapaignlevel.Special_categories;
      } else {
        AllAdsetsData["camapaignlevel"]["Special_categories"] =
          values.Special_categories;
        AllAdsetsData["camapaignlevel"]["re_lunch_special_categories"] = true;
        send_re_launch_status = true;
      }
      if (
        JSON.stringify(fullCampaignData.camapaignlevel.Bid_strategy) ===
        JSON.stringify(values.Bid_strategy)
      ) {
        AllAdsetsData["camapaignlevel"]["Bid_strategy"] =
          fullCampaignData.camapaignlevel.Bid_strategy;
      } else {
        AllAdsetsData["camapaignlevel"]["Bid_strategy"] = values.Bid_strategy;
        AllAdsetsData["camapaignlevel"]["re_lunch_bid_strategy"] = true;
        send_re_launch_status = true;
      }
      if (
        fullCampaignData.camapaignlevel.Daily_amount ===
        parseFloat(values.Daily_amount) * 100
      ) {
        AllAdsetsData["camapaignlevel"]["Daily_amount"] =
          fullCampaignData.camapaignlevel.Daily_amount;
      } else {
        if (
          fullCampaignData.camapaignlevel.Daily_amount > 0 &&
          parseFloat(values.Daily_amount) * 100 > 0
        ) {
          AllAdsetsData["camapaignlevel"]["Daily_amount"] =
            parseFloat(values.Daily_amount) * 100;
          AllAdsetsData["camapaignlevel"]["re_lunch_daily_amount"] = true;
          send_re_launch_status = true;
        } else if (
          fullCampaignData.camapaignlevel.Daily_amount > 0 &&
          parseFloat(values.Daily_amount) * 100 === 0
        ) {
          AllAdsetsData["camapaignlevel"]["Daily_amount"] = 0;
          AllAdsetsData["camapaignlevel"]["re_lunch_daily_amount"] = true;
          AllAdsetsData["camapaignlevel"][
            "re_lunch_daily_amount_in_adsets"
          ] = true;
          send_re_launch_status = true;
        } else if (
          fullCampaignData.camapaignlevel.Daily_amount === 0 &&
          parseFloat(values.Daily_amount) * 100 > 0
        ) {
          AllAdsetsData["camapaignlevel"]["Daily_amount"] =
            parseFloat(values.Daily_amount) * 100;
          AllAdsetsData["camapaignlevel"]["re_lunch_daily_amount"] = true;
          AllAdsetsData["camapaignlevel"][
            "re_lunch_daily_amount_in_campaign"
          ] = true;
          send_re_launch_status = true;
        }
      }
    }
    else {
      AllAdsetsData["camapaignlevel"] = {
        createdby: fullCampaignData.camapaignlevel.createdby,
        Editedby: session?.user?.name,
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
        access_token: imagehash.token,
        createdDate: fullCampaignData.camapaignlevel.createdDate,
        EditedDate: moment().tz(imagehash.timeZone).format("YYYY-MM-DD"),
        ...(fullCampaignData.camapaignlevel.campaignid
          ? { campaignid: fullCampaignData.camapaignlevel.campaignid }
          : {}),
      };
    }

    const onSuccess = (status, response) => {
      console.log("Upload success:", response);
    };

    const onError = (status, error) => {
      console.error("Upload error:", error);
    };

    let re_lunch = false;

    for (let newAdset of values.adsets) {
      console.log(newAdset, "newAdset");
      let AdsetsData = { buying_type: "AUCTION" };
      const adsetKeys = Object.keys(fullCampaignData).filter((key) =>
        key.startsWith("adsetlevel_")
      );
      console.log(adsetKeys, "adsetKeys");
      const adsetObjects = adsetKeys.map((key) => fullCampaignData[key]);
      console.log(adsetObjects, "adsetObjects");

      const findMatchingAdset = adsetObjects.find(
        (adset) => adset.id === newAdset.id
      );

      console.log(findMatchingAdset, "findMatchingAdset");

      const formValuesObject = values.adsets.find(
        (adset) => adset.id === newAdset.id
      );

      console.log(formValuesObject, "formValuesObject");

      //   const newAddLevelData = n || [];
      //   const addlevelData = formValuesObject.addlevelData || [];

      const getFilenameDeatials = async (file) => {
        console.log(file, "file in getFilenameDeatials");
        const token = fullCampaignData?.camapaignlevel?.access_token;
        let mediaHashArray = {};
        const onSuccess = (status, response) => {
          console.log("Upload success:", response);
        };

        const onError = (status, error) => {
          console.error("Upload error:", error);
        };
        let fileBlob = null;
        let s3FileUrl = null;
        const folderPath = `${network}/${fullCampaignData.Account_Number}/${fullCampaignData.campaign_name}`;
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
          console.log(file, "file in getFilenameDeatials with url");
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
              `https://graph.facebook.com/v20.0/act_${fullCampaignData?.Account_Number}/adimages`,
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
              `https://graph.facebook.com/v20.0/act_${fullCampaignData?.Account_Number}/advideos`,
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
              `https://graph.facebook.com/v20.0/act_${fullCampaignData?.Account_Number}/adimages`,
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
              `https://graph.facebook.com/v20.0/act_${fullCampaignData?.Account_Number}/advideos`,
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

      const newAddLevel = await Promise.all(
        newAddLevelData[newAdset.id].map(async (item) => {
          console.log(item, "item in newAddLevel");
          const getItem =
            addlevelData[newAdset.id].find((i) => i.id === item.id) || {};
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
              send_re_launch_status = true;
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
              send_re_launch_status = true;
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
              send_re_launch_status = true;
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
              send_re_launch_status = true;
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
              send_re_launch_status = true;
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
              send_re_launch_status = true;
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
                  send_re_launch_status = true;
                } else if (updatedFilesDeatils.videoid) {
                  newUpdatedAd["videoid"] = updatedFilesDeatils.videoid;
                  newUpdatedAd["thambnailurl"] =
                    updatedFilesDeatils.thambnailurl;
                  newUpdatedAd["filename"] = updatedFilesDeatils.filename;
                  newUpdatedAd["re_lunch"] = true;
                  send_re_launch_status = true;
                }
              }
            }
            return newUpdatedAd;
          } else {
            const fileData = await getFilenameDeatials(item.filename);
            re_lunch = true;
            send_re_launch_status = true;
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

      console.log(newAddLevel, "newAddLevel");

      //   const imageHashArray = await customRequest(
      //     values.adsets[i],
      //     i,
      //     onSuccess,
      //     onError,
      //     adsets[i].id
      //   );
      //   const addLevelData = imageHashArray.map((media, index) => {
      //     if (media.imag_hash) {
      //       // This is an image
      //       return {
      //         id: uuidv4(),
      //         AddName: `${values.adsets[i].AddName}_${index + 1}`,
      //         filename: media.filename,
      //         imag_hash: media.imag_hash,
      //         page_id: values.page_id,
      //         message: values.adsets[i].message,
      //         headline: values.adsets[i].headline,
      //         Description: values.adsets[i].Description,
      //         Caption: values.adsets[i].Caption,
      //         Website_URL: values.adsets[i].Website_URL,

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
      //         page_id: values.page_id,
      //         message: values.adsets[i].message,
      //         headline: values.adsets[i].headline,
      //         Description: values.adsets[i].Description,
      //         Caption: values.adsets[i].Caption,
      //         Website_URL: values.adsets[i].Website_URL,
      //         // urlParameters: values.urlParameters
      //       };
      //     }
      //   });
      if (findMatchingAdset && formValuesObject) {
        console.log("found matching adset and form values");
        if (findMatchingAdset.Adsetid) {
          AdsetsData["Adsetid"] = findMatchingAdset.Adsetid;
          AdsetsData["id"] = findMatchingAdset.id;
          AdsetsData["Budget_type"] = budgetType;
        } else {
          AdsetsData["id"] = formValuesObject.id;
          AdsetsData["Budget_type"] = budgetType;
        }
        if (formValuesObject.AdsetName === findMatchingAdset.AdsetName) {
          AdsetsData["AdsetName"] = findMatchingAdset.AdsetName;
        } else {
          AdsetsData["AdsetName"] = formValuesObject.AdsetName || "";
          AdsetsData["re_lunch_adset_name"] = true;
          send_re_launch_status = true;
        }
        if (findMatchingAdset.Status) {
          AdsetsData["Status"] = findMatchingAdset.Status;
        }
        if (findMatchingAdset["re_lunch_adsetname"]) {
          AdsetsData["re_lunch_adsetname"] =
            findMatchingAdset["re_lunch_adsetname"];
        }
        if (findMatchingAdset["re_lunch_bid_amount"]) {
          AdsetsData["re_lunch_bid_amount"] =
            findMatchingAdset["re_lunch_bid_amount"];
        }
        if (findMatchingAdset["re_lunch_daily_amount"]) {
          AdsetsData["re_lunch_daily_amount"] =
            findMatchingAdset["re_lunch_daily_amount"];
        }
        if (findMatchingAdset["re_lunch_targeting"]) {
          AdsetsData["re_lunch_targeting"] =
            findMatchingAdset["re_lunch_targeting"];
        }
        if (findMatchingAdset["re_lunch_endtime"]) {
          AdsetsData["re_lunch_endtime"] =
            findMatchingAdset["re_lunch_endtime"];
        }
        if (findMatchingAdset["re_lunch_beneficiary_payer"]) {
          AdsetsData["re_lunch_beneficiary_payer"] =
            findMatchingAdset["re_lunch_beneficiary_payer"];
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.AdsetName !== formValuesObject.AdsetName
        ) {
          AdsetsData["AdsetName"] = formValuesObject.AdsetName;
          AdsetsData["re_lunch_adsetname"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["AdsetName"] = formValuesObject.AdsetName;
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.bid_amount &&
          findMatchingAdset.bid_amount / 100 !== formValuesObject.bid_amount
        ) {
          AdsetsData["bid_amount"] = formValuesObject.bid_amount
            ? parseFloat(formValuesObject.bid_amount) * 100
            : 0;
          AdsetsData["re_lunch_bid_amount"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["bid_amount"] = formValuesObject.bid_amount
            ? parseFloat(formValuesObject.bid_amount) * 100
            : 0;
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.Daily_amount &&
          findMatchingAdset.Daily_amount !==
          (formValuesObject.DailyAdd_amount
            ? parseFloat(formValuesObject.DailyAdd_amount) * 100
            : "")
        ) {
          AdsetsData["Daily_amount"] = formValuesObject.DailyAdd_amount
            ? parseFloat(formValuesObject.DailyAdd_amount) * 100
            : "";
          AdsetsData["re_lunch_daily_amount"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["Daily_amount"] = formValuesObject.DailyAdd_amount
            ? parseFloat(formValuesObject.DailyAdd_amount) * 100
            : "";
        }
        if (findMatchingAdset.Adsetid) {
          AdsetsData["optimization_goal"] = findMatchingAdset.optimization_goal;
          AdsetsData["billing_event"] = findMatchingAdset.billing_event;
          AdsetsData["start_time"] = findMatchingAdset.start_time;
          AdsetsData["action_source"] = findMatchingAdset.action_source;
          AdsetsData["custom_event_type"] = findMatchingAdset.custom_event_type;
          AdsetsData["pixel_id"] = findMatchingAdset.pixel_id;
        } else {
          AdsetsData["optimization_goal"] = formValuesObject.optimization_goal;
          AdsetsData["billing_event"] = formValuesObject.billing_event;
          AdsetsData["start_time"] = moment(formValuesObject.DatePicker.$d)
            .tz(imagehash.timeZone)
            .format("YYYY-MM-DDTHH:mm:ssZ");
          AdsetsData["action_source"] = formValuesObject.action_source;
          AdsetsData["custom_event_type"] = formValuesObject.custom_event_type;
          AdsetsData["pixel_id"] = findMatchingAdset.pixel_id;
        }
        if (budgetType === "lifetime") {
          const newEnd = dayjs(formValuesObject.DatePickerEnd)
            .format("YYYY-MM-DDTHH:mm:ssZ");

          AdsetsData["end_time"] = newEnd;

          if (findMatchingAdset?.Adsetid && findMatchingAdset.end_time !== newEnd) {
            AdsetsData["re_lunch_endtime"] = true;
            send_re_launch_status = true;
            re_lunch = true;
          }
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.countries &&
          findMatchingAdset.countries !== formValuesObject.countries
        ) {
          AdsetsData["countries"] = formValuesObject.countries;
          // if (formValuesObject.Beneficiary) {
          //   AdsetsData["beneficiary"] = formValuesObject.Beneficiary
          //   if (formValuesObject.Payer) {
          //     AdsetsData["payer"] = formValuesObject.Payer
          //   } else {
          //     AdsetsData["payer"] = formValuesObject.Beneficiary
          //   }
          // }
          AdsetsData["re_lunch_targeting"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["countries"] = formValuesObject.countries;
          // if (formValuesObject.Beneficiary) {
          //   AdsetsData["beneficiary"] = formValuesObject.Beneficiary
          //   if (formValuesObject.Payer) {
          //     AdsetsData["payer"] = formValuesObject.Payer
          //   } else {
          //     AdsetsData["payer"] = formValuesObject.Beneficiary
          //   }
          // }
        }
        if (findMatchingAdset.Adsetid) {
          // countries
          const newCountries = formValuesObject.countries;
          if (findMatchingAdset.countries && findMatchingAdset.countries !== newCountries) {
            AdsetsData["countries"] = newCountries;
            AdsetsData.re_lunch_targeting = true;
            send_re_launch_status = true;
            re_lunch = true;
          } else {
            AdsetsData.countries = newCountries;
          }

          // beneficiary/payer — only if form provides beneficiary
          if (formValuesObject.Beneficiary) {
            const newBeneficiary = formValuesObject.Beneficiary;
            const newPayer = formValuesObject.Payer ?? formValuesObject.Beneficiary;
            const existingBeneficiary = findMatchingAdset.beneficiary;
            const existingPayer = findMatchingAdset.payer ?? findMatchingAdset.beneficiary;

            // 1) No existing beneficiary but new provided -> add + flag
            if (!existingBeneficiary && newBeneficiary) {
              AdsetsData.beneficiary = newBeneficiary;
              AdsetsData.payer = newPayer;
              AdsetsData.re_lunch_beneficiary_payer = true;
              send_re_launch_status = true;
              re_lunch = true;
            }
            // 2) Existing present but changed -> update + flag
            else if (
              (existingBeneficiary && existingBeneficiary !== newBeneficiary) ||
              (existingPayer && existingPayer !== newPayer)
            ) {
              AdsetsData.beneficiary = newBeneficiary;
              AdsetsData.payer = newPayer;
              AdsetsData.re_lunch_beneficiary_payer = true;
              send_re_launch_status = true;
              re_lunch = true;
            }
            // 3) Values exist and unchanged -> copy (no flag)
            else {
              AdsetsData.beneficiary = newBeneficiary;
              AdsetsData.payer = newPayer;
            }
          }
        } else {
          if (formValuesObject.Beneficiary) {
            const newBeneficiary = formValuesObject.Beneficiary;
            const newPayer = formValuesObject.Payer ?? formValuesObject.Beneficiary;
            AdsetsData.beneficiary = newBeneficiary;
            AdsetsData.payer = newPayer;
          }
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.Min_Age &&
          findMatchingAdset.Min_Age !== formValuesObject.Min_Age
        ) {
          AdsetsData["Min_Age"] = formValuesObject.Min_Age;
          AdsetsData["re_lunch_targeting"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["Min_Age"] = formValuesObject.Min_Age;
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.Max_Age &&
          findMatchingAdset.Max_Age !== formValuesObject.Max_Age
        ) {
          AdsetsData["Max_Age"] = formValuesObject.Max_Age;
          AdsetsData["re_lunch_targeting"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["Max_Age"] = formValuesObject.Max_Age;
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.locales &&
          JSON.stringify(findMatchingAdset.locales) !==
          JSON.stringify(formValuesObject.Language)
        ) {
          AdsetsData["locales"] = formValuesObject.Language;
          AdsetsData["re_lunch_targeting"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["locales"] = formValuesObject.Language;
        }
        if (
          findMatchingAdset.Adsetid &&
          findMatchingAdset.Gender &&
          findMatchingAdset.Gender !== parseInt(formValuesObject.Gender)
        ) {
          AdsetsData["Gender"] = parseInt(formValuesObject.Gender);
          AdsetsData["re_lunch_targeting"] = true;
          send_re_launch_status = true;
          re_lunch = true;
        } else {
          AdsetsData["Gender"] = parseInt(formValuesObject.Gender);
        }
        if (findMatchingAdset.Adsetid && findMatchingAdset.placements) {
          console.log(
            findMatchingAdset.placements,
            "adset placements in adset component"
          );
          if (
            findMatchingAdset.placements === "Advance" &&
            formValuesObject.placements === "Advance"
          ) {
            AdsetsData["placements"] = formValuesObject.placements;
          } else if (
            findMatchingAdset.placements === "manual" &&
            formValuesObject.placements === "Advance"
          ) {
            AdsetsData["placements"] = formValuesObject.placements;
            AdsetsData["re_lunch_targeting"] = true;
            send_re_launch_status = true;
            re_lunch = true;
          } else if (
            findMatchingAdset.placements === "Advance" &&
            formValuesObject.placements === "manual"
          ) {
            AdsetsData["placements"] = formValuesObject.placements;
            AdsetsData["Facebook_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Facebook"
              ) || [];
            AdsetsData["instagram_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Instagram"
              ) || [];
            AdsetsData["audience_network_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Audience"
              ) || [];
            AdsetsData["messenger_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Messenger"
              ) || [];
            AdsetsData["position"] = formValuesObject.positions.map((item) => {
              if (item && typeof item === "object" && !Array.isArray(item)) {
                if ("key" in item) return item.key;
                if ("value" in item) return item.value;
                return null; // optional: return null if neither exists
              }
              return item;
            });
            AdsetsData["device_platforms"] = formValuesObject.device_platforms;
            AdsetsData["publisher_platforms"] = formValuesObject.platforms;

            AdsetsData["re_lunch_targeting"] = true;
            send_re_launch_status = true;
            re_lunch = true;
          } else if (
            findMatchingAdset.placements === "manual" &&
            formValuesObject.placements === "manual"
          ) {
            console.log(findMatchingAdset.placements);
            AdsetsData["placements"] = formValuesObject.placements;
            if (
              JSON.stringify(findMatchingAdset.publisher_platforms) !==
              JSON.stringify(formValuesObject.platforms)
            ) {
              AdsetsData["publisher_platforms"] = formValuesObject.platforms;
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
              re_lunch = true;
            } else {
              AdsetsData["publisher_platforms"] = formValuesObject.platforms;
            }
            if (
              JSON.stringify(findMatchingAdset.Facebook_positions) !==
              JSON.stringify(
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Facebook"
                )
              )
            ) {
              AdsetsData["Facebook_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Facebook"
                ) || [];
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
              re_lunch = true;
            } else {
              AdsetsData["Facebook_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Facebook"
                ) || [];
            }
            if (
              JSON.stringify(findMatchingAdset.instagram_positions) !==
              JSON.stringify(
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Instagram"
                )
              )
            ) {
              AdsetsData["instagram_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Instagram"
                ) || [];
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
            } else {
              AdsetsData["instagram_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Instagram"
                ) || [];
            }
            if (
              JSON.stringify(findMatchingAdset.audience_network_positions) !==
              JSON.stringify(
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Audience"
                )
              )
            ) {
              AdsetsData["audience_network_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Audience"
                ) || [];
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
              re_lunch = true;
            } else {
              AdsetsData["audience_network_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Audience"
                ) || [];
            }
            if (
              JSON.stringify(findMatchingAdset.messenger_positions) !==
              JSON.stringify(
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Messenger"
                )
              )
            ) {
              AdsetsData["messenger_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Messenger"
                ) || [];
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
              re_lunch = true;
            } else {
              AdsetsData["messenger_positions"] =
                extractValuesByPartialLabel(
                  selectedPositions[formValuesObject?.id],
                  "Messenger"
                ) || [];
            }
            AdsetsData["position"] = formValuesObject.positions.map((item) => {
              if (item && typeof item === "object" && !Array.isArray(item)) {
                if ("key" in item) return item.key;
                if ("value" in item) return item.value;
                return null; // optional: return null if neither exists
              }
              return item;
            });
            if (
              JSON.stringify(findMatchingAdset.device_platforms) !==
              JSON.stringify(formValuesObject.device_platforms)
            ) {
              AdsetsData["device_platforms"] =
                formValuesObject.device_platforms;
              AdsetsData["re_lunch_targeting"] = true;
              send_re_launch_status = true;
              re_lunch = true;
            } else {
              AdsetsData["device_platforms"] =
                formValuesObject.device_platforms;
            }
          }
        } else {
          AdsetsData["placements"] = formValuesObject.placements;
          if (formValuesObject.placements === "manual") {
            AdsetsData["publisher_platforms"] = formValuesObject.platforms;
            AdsetsData["Facebook_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Facebook"
              ) || [];
            AdsetsData["instagram_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Instagram"
              ) || [];
            AdsetsData["audience_network_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Audience"
              ) || [];
            AdsetsData["messenger_positions"] =
              extractValuesByPartialLabel(
                selectedPositions[formValuesObject?.id],
                "Messenger"
              ) || [];
            AdsetsData["position"] = formValuesObject.positions.map((item) => {
              if (item && typeof item === "object" && !Array.isArray(item)) {
                if ("key" in item) return item.key;
                if ("value" in item) return item.value;
                return null; // optional: return null if neither exists
              }
              return item;
            });
            AdsetsData["device_platforms"] = formValuesObject.device_platforms;
          }
        }
        AdsetsData["buying_type"] = "AUCTION";
        AdsetsData["addlevel"] = newAddLevel;
      } else {
        console.log("No matching adset found, using form values only");
        AdsetsData["id"] = formValuesObject.id || uuidv4();
        AdsetsData["AdsetName"] = formValuesObject.AdsetName || "";
        AdsetsData["Daily_amount"] = formValuesObject.DailyAdd_amount
          ? parseFloat(formValuesObject.DailyAdd_amount) * 100
          : "";
        AdsetsData["bid_amount"] = formValuesObject.bid_amount
          ? parseFloat(formValuesObject.bid_amount) * 100
          : 0;
        AdsetsData["optimization_goal"] = formValuesObject.optimization_goal;
        AdsetsData["billing_event"] = formValuesObject.billing_event;
        AdsetsData["start_time"] = moment(formValuesObject.DatePicker.$d)
          .tz(imagehash.timeZone)
          .format("YYYY-MM-DDTHH:mm:ssZ"); //formValuesObject.DatePicker.$d
        AdsetsData["action_source"] = formValuesObject.action_source;
        AdsetsData["custom_event_type"] = formValuesObject.custom_event_type;
        AdsetsData["pixel_id"] = formValuesObject.pixel_id;
        AdsetsData["countries"] = formValuesObject.countries;
        AdsetsData["Min_Age"] = formValuesObject.Min_Age;
        AdsetsData["Max_Age"] = formValuesObject.Max_Age;
        AdsetsData["Gender"] = parseInt(formValuesObject.Gender);
        AdsetsData["locales"] = formValuesObject.Language;
        AdsetsData["placements"] = formValuesObject.placements;
        if (formValuesObject.placements !== "Advance") {
          AdsetsData["publisher_platforms"] = formValuesObject.platforms;
          AdsetsData["Facebook_positions"] =
            extractValuesByPartialLabel(
              selectedPositions[adsets[i].id],
              "Facebook"
            ) || [];
          AdsetsData["instagram_positions"] =
            extractValuesByPartialLabel(
              selectedPositions[adsets[i].id],
              "Instagram"
            ) || [];
          AdsetsData["audience_network_positions"] =
            extractValuesByPartialLabel(
              selectedPositions[adsets[i].id],
              "Audience"
            ) || [];
          AdsetsData["messenger_positions"] =
            extractValuesByPartialLabel(
              selectedPositions[adsets[i].id],
              "Messenger"
            ) || [];
          AdsetsData["position"] = formValuesObject.positions;
          AdsetsData["device_platforms"] = formValuesObject.device_platforms;
        } else {
          AdsetsData["placements"] = formValuesObject.placements;
        }
        if (budgetType === "lifetime") {
          const newEnd =
            dayjs(formValuesObject.DatePickerEnd.$d)
              .tz(imagehash.timeZone)
              .format("YYYY-MM-DDTHH:mm:ssZ");

          AdsetsData["end_time"] = newEnd;
        }
        if (formValuesObject.Beneficiary) {
          AdsetsData["beneficiary"] = formValuesObject.Beneficiary
          if (formValuesObject.Payer) {
            AdsetsData["payer"] = formValuesObject.Payer
          } else {
            AdsetsData["payer"] = formValuesObject.Beneficiary
          }
        }

        AdsetsData["buying_type"] = "AUCTION";
        AdsetsData["addlevel"] = newAddLevel;
      }

      //   AdsetsData[`adsetlevel_${i + 1}`] = {
      //     id: uuidv4(),
      //   AdsetName: values.adsets[i].AdsetName,
      //   Daily_amount: values.adsets[i].DailyAdd_amount
      //     ? parseFloat(values.adsets[i].DailyAdd_amount) * 100
      //     : "",
      //   optimization_goal: values.adsets[i].optimization_goal,
      //   billing_event: values.adsets[i].billing_event,
      //   start_time: moment(values.adsets[i].DatePicker.$d)
      //     .tz(imagehash.timeZone)
      //     .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
      //   action_source: values.adsets[i].action_source,
      //   custom_event_type: values.adsets[i].custom_event_type,
      //   pixel_id: values.pixel_id,
      //   bid_amount: values.adsets[i].bid_amount
      //     ? parseFloat(values.adsets[i].bid_amount) * 100
      //     : 0,
      //   countries: values.adsets[i].countries,
      //   Min_Age: values.adsets[i].Min_Age,
      //   Max_Age: values.adsets[i].Max_Age,
      //   Gender: parseInt(values.adsets[i].Gender),
      //   locales: values.adsets[i].Language,
      //   placements: values.adsets[i].placements,
      //   ...(values.adsets[i].placements !== "Advance" && {
      //     publisher_platforms: values.adsets[i].platforms,
      //     Facebook_positions:
      //       extractValuesByPartialLabel(
      //         selectedPositions[adsets[i].id],
      //         "Facebook"
      //       ) || [],
      //     instagram_positions:
      //       extractValuesByPartialLabel(
      //         selectedPositions[adsets[i].id],
      //         "Instagram"
      //       ) || [],
      //     audience_network_positions:
      //       extractValuesByPartialLabel(
      //         selectedPositions[adsets[i].id],
      //         "Audience"
      //       ) || [],
      //     messenger_positions:
      //       extractValuesByPartialLabel(
      //         selectedPositions[adsets[i].id],
      //         "Messenger"
      //       ) || [],
      //     position: values.adsets[i].positions,
      //     device_platforms: values.adsets[i].device_platforms,
      //   }),
      //   buying_type: "AUCTION",
      //     addlevel: addLevelData,
      //   };
      AllAdsetsData = {
        ...AllAdsetsData,
        [`adsetlevel_${number}`]: AdsetsData,
      };
      number++;
    }
    return { ...AllAdsetsData, ...(fullCampaignData?.fbstatus === "Live" ? { re_launch: fullCampaignData.re_launch ? fullCampaignData.re_launch : send_re_launch_status } : {}) };
  };

  const MultipleAdsetsDraftFetching = async (values) => {
    let AllAdsetsData = {
      // id: uuidv4(),
      // Draft_Name:"",
      createdby: session?.user?.name,
      createdDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      editedDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      camapaignlevel: {
        // createdby: session?.user?.name,
        Name: values.Name || "",
        Objectives: values.Objectives || "",
        Special_categories: values.Special_categories || "NONE",
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
        values.adsets[i],
        i,
        onSuccess,
        onError,
        adsets[i].id
      );
      console.log("Image Hash Array:", imageHashArray);
      const addLevelData =
        imageHashArray && imageHashArray.length > 0
          ? {
            AddName: `${values.adsets[i].AddName}` || "",
            // filename: media.filename,
            // imag_hash: media.imag_hash,
            Ads: imageHashArray.map((media) => media.filename),
            page_id: values.page_id,
            message: values.adsets[i].message,
            headline: values.adsets[i].headline,
            Description: values.adsets[i].Description,
            Caption: values.adsets[i].Caption,
            Website_URL: values.adsets[i].Website_URL,
          }
          : {
            AddName: `${values.adsets[i].AddName}` || "",
            Ads: [],
            page_id: values.page_id || "",
            message: values.adsets[i].message || "",
            headline: values.adsets[i].headline || "",
            Description: values.adsets[i].Description || "",
            Caption: values.adsets[i].Caption || "",
            Website_URL: values.adsets[i].Website_URL || "",
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
        start_time: moment(values.adsets[i].DatePicker.$d)
          .tz(imagehash.timeZone)
          .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
        action_source: values.adsets[i].action_source || "",
        custom_event_type: values.adsets[i].custom_event_type || "",
        pixel_id: values.pixel_id,
        bid_amount: values.adsets[i].bid_amount
          ? parseFloat(values.adsets[i].bid_amount) * 100
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
    return AllAdsetsData;
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
    Account_Number: accountis === "All" ? "" : accountis,
    Daily_amount: 0, // Initial daily budget for the campaign
    Name: campaignName,
    adsets: [
      getDefaultAdset(
        campaignName,
        caption,
        websiteURL,
        imagehash,
        currentDate
      ),
    ], // 🔁 only one initial adset
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
      { id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName: "Adset 1" },
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const setFormValuesFromDraft = (draft) => {
    if (!draft) return;

    // 1. Extract adsetlevel_* blocks
    const adsetKeys = Object.keys(draft).filter((key) =>
      key.startsWith("adsetlevel_")
    );
    const adsetObjects = adsetKeys.map((key) => draft[key]);

    console.log("Adset Objects:", adsetObjects);

    // 2. Update adsets state based on adsetlevel_* count
    setAdsets(
      adsetObjects.map((adsetObj, index) => ({
        id: adsetObj.id ?? uuidv4(),
        AdsetPanelName: `ADSET ${index + 1}`,
        DailyAdd_amount: adsetObj.Daily_amount
          ? adsetObj.Daily_amount / 100
          : 0,
        Adsetid: adsetObj.Adsetid || "",
        ...adsetObj, // Spread the adsetObj properties
      }))
    );

    setAddLevelData((prev) => {
      const adsetAddLevelData = {};
      adsetObjects.forEach((adsetObj, index) => {
        adsetAddLevelData[adsetObj.id] = adsetObj.addlevel;
      });
      return { ...prev, ...adsetAddLevelData };
    });

    setNewAddLevelData((prev) => {
      const adsetAddLevelData = {};
      adsetObjects.forEach((adsetObj, index) => {
        adsetAddLevelData[adsetObj.id] = adsetObj.addlevel;
      });
      return { ...prev, ...adsetAddLevelData };
    });

    // 3. Map adset form values
    const updatedFormAdsets = adsetObjects.map((adsetObj, index) => ({
      id: adsetObj.id ?? uuidv4(),
      AdsetPanelName: `Adset ${index + 1}`,
      AdsetName: adsetObj.AdsetName,
      DailyAdd_amount: adsetObj.Daily_amount ? adsetObj.Daily_amount / 100 : 0,
      optimization_goal: adsetObj.optimization_goal,
      billing_event: adsetObj.billing_event,
      action_source: adsetObj.action_source,
      custom_event_type: adsetObj.custom_event_type,
      pixel_id: adsetObj.pixel_id,
      page_id: adsetObj.page_id,
      bid_amount: adsetObj.bid_amount / 100,
      countries: adsetObj.countries,
      Min_Age: adsetObj.Min_Age,
      Max_Age: adsetObj.Max_Age,
      Gender: JSON.stringify(adsetObj.Gender),
      platforms: adsetObj.publisher_platforms || [],
      device_platforms: adsetObj.device_platforms || [],
      Language: adsetObj.locales,
      placements: adsetObj.placements,
      position: adsetObj.position || [],
      AddName: adsetObj.addlevel[0]?.AddName.split("_").slice(0, -1).join("_"),
      filename: adsetObj.addlevel[0]?.filename,
      message: adsetObj.addlevel[0]?.message,
      headline: adsetObj.addlevel[0]?.headline,
      Description: adsetObj.addlevel[0]?.Description || "Find More",
      Caption: adsetObj.addlevel[0]?.Caption,
      Website_URL: adsetObj.addlevel[0]?.Website_URL,
      MediaContent: adsetObj.addlevel[0] || [],
    }));

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
        id: file?.id,
        uid: `-${Date.now()}-${i}`,
        name: file?.filename,
        status: "done",
        type: file?.filename?.endsWith(".jpg")
          ? "image/jpg"
          : file?.filename?.endsWith(".jpeg")
            ? "image/jpeg"
            : file?.filename?.endsWith(".png")
              ? "image/png"
              : "video/",
        url: file?.filename,
        Addid: file?.Addid || null,
      }));

    adsetObjects.forEach((adsetObj) => {
      const uuid = adsetObj.id ?? uuidv4();

      updatedSelectedFiles[uuid] = adsetObj.addlevel
        ? mapped(adsetObj.addlevel)
        : [];
      updatedSelectedCreatives[uuid] = adsetObj.addlevel
        ? mapped(adsetObj.addlevel)
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
      setIsAnyAdsetBudgetSet(true);
      setIsCampaignBudgetActive(false);
    }
    if (draft?.camapaignlevel?.Daily_amount > 0) {
      setCampaignLevelDailyBudget(draft.camapaignlevel.Daily_amount / 100);
      setIsCampaignBudgetActive(true);
      setIsAnyAdsetBudgetSet(false);
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
    const draft = draftsData.find((draft) => draft.id === value);
    console.log("Selected Draft:", value);
    console.log(
      "Drafts Data:",
      draftsData.find((draft) => draft.id === value)
    );
    setFormValuesFromDraft(draftsData.find((draft) => draft.id === value));
    selectedRef.current = {
      Draft_Name: draft?.Draft_Name,
      Draft_Id: draft?.id,
    };
    newSelectedRef.current = draft?.Draft_Name;
    setWebsiteURL("");
    setCaption("");
  };
  const handleUpdateApprovalForAdsets = async (id, newApprovalValue) => {
    try {
      //https://www.testapi.adsgoat.in
      const response = await fetch(
        `https://www.testapi.adsgoat.in/api/newupdateApproval/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            Approval: newApprovalValue, // New approval value
            Approved: userdetails?.userName, // Username of the person who approved it
            datetime: moment()
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm [IST]"), // Current datetime in IST
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        fetchData(selectedRow);

        message.success("Approval confirmed");
        // setIsModalVisible(false); // Close modal after updating
        changeRRefrst();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
      } else {
        console.error("Failed to update approval");
        // Handle failure
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };
  return (
    <Modal
      title={
        view
          ? `View Campaign Details ----> ${selectedRow?.Account_Number} / ${selectedRow?.campaign_name}`
          : `${selectedRow?.campaign_name}`
      }
      // <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      //   {/* <span>{selectedRow?.campaign_name}</span> */}

      // </div>

      className={` ${theme === "dark" ? "dark-theme-modal" : ""}`}
      open={visible}
      onCancel={handleDrawerClose}
      footer={null}
      centered
      width="85%"
      // bodyStyle={{
      //   height: "80vh",
      //   overflowY: "auto",
      //   padding: 10,
      //   backgroundColor: theme === "dark" ? "#333" : "#fff",
      //   color: theme === "dark" ? "#fff" : "#000",
      // }}
      styles={{
        body: {
          height: "80vh",
          overflowY: "auto",
          padding: 10,
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
        },
      }}
      style={{ borderRadius: "12px" }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '10px' }}>
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
          <div>
            <Select
              value={budgetType}   // "daily" or "lifetime"
              onChange={(value) => setBudgetType(value)}
              disabled={fullCampaignData?.camapaignlevel?.campaignid ? true : false}
              // style={{ height: "20px" }}
              options={[
                { label: "Daily", value: "daily" },
                { label: "Lifetime", value: "lifetime" },
              ]}
              style={{ width: 100 }}
            // disabled={watchedHasAdsetBudget} // if adset budget enabled, disable this
            // getPopupContainer={(triggerNode) => triggerNode.parentElement}
            />
          </div>
        </div>
        {fullCampaignData?.Approval === "PENDING_APPROVAL" && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  borderColor: "#91C25F",
                  borderWidth: 0,
                  // marginBottom: "10px",
                  cursor: "pointer",
                  marginLeft: "10px",
                  height: "32px",
                }}
                onClick={() => setShowApprovalModal(true)}
              >
                Approve
              </Button>
            </div>
            <div>
              <Alert
                message={fullCampaignData.Approval}
                // description="This Camapaign"
                type="info"
                // showIcon
                // banner
                className="blinking"
                style={{
                  textAlign: "center",
                  // marginRight: "10px",
                  backgroundColor: theme === "dark" && "#444",
                  color: theme === "dark" && "#fff",
                  // marginBottom: "10px",
                  height: "32px",
                  marginLeft: "10px",
                }}
              />
            </div>
          </div>
        )}
      </div>


      <Modal
        title="Confirm Approval"
        open={showApprovalModal}
        onOk={() => {
          handleUpdateApprovalForAdsets(selectedRow.identifier, "Approved");
          setShowApprovalModal(false);
        }}
        onCancel={() => setShowApprovalModal(false)}
        okText="Ok"
        cancelText="Cancel"
      >
        <p>Are you sure you want to approve this campaign?</p>
      </Modal>

      {/* <Select value={newSelectedRef.current} placeholder="Select draft"
                style={{
                    width: 160,
                    border: '1.5px solid #4caf50',
                    borderRadius: '8px',
                    marginBottom:'7px'
                }} onChange={onChangeDraft}
                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                {Array.isArray(draftsData) && draftsData.map((draft) => (
                    <Select.Option key={draft.id} value={draft.id}>
                        {draft.Draft_Name}
                    </Select.Option>
                ))}

            </Select> */}

      <Spin spinning={loading}>
        <Form
          disabled={view && view === true}
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
                  style={{ flex: 0.25 }}
                >
                  <Input
                    value={accountNumber}
                    onChange={Accountchange}
                    className={
                      theme === "dark"
                        ? "custom-input-dark"
                        : "custom-input-light"
                    }
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
                  style={{ flex: 0.15, marginLeft: "1%" }}
                // style={{ width: 170, marginLeft: "1%" }}
                >
                  <Select
                    // onChange={getpixelandpageid}
                    variant="filled"
                    disabled={fullCampaignData?.camapaignlevel?.campaignid}
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
                  style={{ flex: 0.12, marginLeft: "1%" }}
                // style={{ width: 160, marginLeft: "1%" }}
                >
                  <Select
                    variant="filled"
                    mode="multiple"
                    disabled={fullCampaignData?.camapaignlevel?.campaignid}
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
                {((fullCampaignData?.camapaignlevel?.campaignid) && (fullCampaignData?.camapaignlevel?.Special_categories_countries)) && (
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
                            disabled={fullCampaignData?.camapaignlevel?.campaignid}
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
                )}
                {!(fullCampaignData?.camapaignlevel?.campaignid) && (
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
                            disabled={fullCampaignData?.camapaignlevel?.campaignid}
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
                )}
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
                {/*pk*/}
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
                <Tooltip
                  overlayInnerStyle={{
                    backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: "14px",
                  }}
                  title={
                    isAnyAdsetBudgetSet
                      ? "You have enabled daily budget in the Adset Level"
                      : ""
                  }
                >
                  <Form.Item
                    name="Daily_amount"
                    label={
                      <span style={{ color: "#B4B4B4" }}>{`${budgetType.charAt(0).toUpperCase()}${budgetType.slice(1).toLowerCase()} budget`}</span>
                    }
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
                  view={view}
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
                  addlevelData={addlevelData}
                  newAddLevelData={newAddLevelData}
                  setAddLevelData={setAddLevelData}
                  setNewAddLevelData={setNewAddLevelData}
                  setIsAnyAdsetBudgetSet={setIsAnyAdsetBudgetSet}
                  imagehash={imagehash}
                  pixelIDLIst={pixelIDLIst}
                  pageIDList={pageIDList}
                  budgetType={budgetType}
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
                {!view && (
                  <Button
                    type="primary"
                    style={{
                      background: "#91c25f",
                      minWidth: "200px",
                      borderWidth: "0px",
                    }}
                    onClick={async () => {
                      try {
                        const values = await form.validateFields(); // Validates all form fields

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
                                  name: ["Daily_amount"], // The field where error occurs
                                  errors: [
                                    "Daily budget cannot be zero on both Adset and Campaign levels",
                                  ], // The error message
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
                        setIsCreateCampaignorDraft("createcampaign");
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

                {/* <Popconfirm
                                    title="Enter required fields"
                                    description={
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div>
                                                <Input
                                                    placeholder="Title"
                                                    value={popupInputs.input1}
                                                    onChange={(e) =>
                                                        setPopupInputs((prev) => ({
                                                            ...prev,
                                                            input1: e.target.value,
                                                        }))
                                                    }
                                                    status={errors.input1 ? 'error' : ''}
                                                />
                                                {errors.input1 && (
                                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                                        {errors.input1}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Input
                                                    placeholder="Draft Name"
                                                    value={popupInputs.input2}
                                                    onChange={(e) =>
                                                        setPopupInputs((prev) => ({
                                                            ...prev,
                                                            input2: e.target.value,
                                                        }))
                                                    }
                                                    status={errors.input2 ? 'error' : ''}
                                                />
                                                {errors.input2 && (
                                                    <div style={{ color: 'red', fontSize: '12px' }}>
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
                                    okButtonProps={{ loading: confirmLoading }}
                                >
                                    <Button type="primary" style={{ background: '#91c25f', minWidth: '100px', borderWidth: '0px', marginLeft: '10px' }} onClick={() => setOpen(true)}>
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
          <ImageUploadPage
            selectedFilesData={selectedFilesData}
            fromCampaigns={true}
            network={network}
            Account_Number={accountis}
          />
        </Drawer>
      )}
    </Modal>
  );
};

export default EditMultipleAdsetCampaignDrawer;
