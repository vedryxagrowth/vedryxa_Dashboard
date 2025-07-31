"use client"
import React, { useEffect, useMemo } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Badge, Tooltip, InputNumber, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined, QuestionCircleOutlined, PaperClipOutlined,DeleteOutlined, CopyOutlined  } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import MnetUrlBuilder from './urlbuilder/mnet';
import TonicUrlBuilder from './urlbuilder/tonic';
import System1UrlBuilder from './urlbuilder/system1';
import DActiveUrlBuilder from './urlbuilder/dactive';
import CreativesDrawer from './creativesDrawer';
import ImageUploadPage from '../../Creatives/page';
import { NodeNextRequest } from 'next/dist/server/base-http/node';
import { useTokenContext } from "../../components/parent";

const FabricCanvas = dynamic(() => import('./Fabricanvas'), { ssr: false });

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
        { key: "profile_feed-f", label: "Facebook Profile Feed" },
        { key: "search", label: "Facebook Search" },
        { key: "story_f", label: "Facebook Stories" },
        { key: "right_hand_column", label: "Facebook Right Column" },
        { key: "instant_article", label: "Facebook Instant Articles" },
        { key: "biz_disco_feed", label: "Facebook Business Explore" } // Added Business Explore
    ],
    instagram: [
        { key: "stream", label: "Instagram Stream" },
        { key: "story_i", label: "Instagram Stories" },
        { key: "explore", label: "Instagram Explore" },
        { key: "explore_home", label: "Instagram Explore Home" },
        { key: "reels", label: "Instagram Reels" },
        { key: "profile_feed-i", label: "Instagram Profile Feed" },
        { key: "ig_search", label: "Instagram Search" },
        { key: "profile_reels", label: "Instagram Profile Reels" }
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
    ]
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
    { key: "rewarded_video", label: "Audience Network Rewarded Video" }
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

function getPositionsByKeys(keys) {
    const keySet = new Set(keys); // Faster lookup
    return allPositions.filter(pos => keySet.has(pos.key));
}


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
    currentDate,
    localesdata,
    handleFieldChange,
    network,
    accountis,
    handleAdsetChange,
    setSelectedPositions,
    selectedPositions,
    selectedPublishers,
    setSelectedPublishers,
  }) => {
    const [activeMediaIndex, setActiveMediaIndex] = useState({});
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    const [primaryText, setPrimaryText] = useState('');
    const [headline, setHeadline] = useState('');
    const [caption, setCaption] = useState('');
    const [description, setDescription] = useState('');
    const [websiteURL, setWebsiteURL] = useState('');
    const [addName, setAddName] = useState(campaignName);
    const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
    const [creativeIndex, setCreativeIndex] = useState(null);
    const [selectedOption, setSelectedOption] = useState("upload");
    const [editedImages, setEditedImages] = useState({});
    console.log(selectedPositions, "selectedPositions in adset component");
    console.log(adset.id, "adset id in adset component");
    console.log(selectedPublishers, "selectedPublishers in adset component");
    console.log(selectedPositions?.[adset.id]);
    console.log(adset, "adset in adset component");

    const onReturnUrl = (text) => {
        setIsModalVisibleForURLBuilder(false);
        setWebsiteURL(text);
        const currentAdsets = form.getFieldValue("adsets") || [];
        const updatedAdsets = [...currentAdsets];
        if (network === "FB_Mnet" || network === "FB_DomainActive") {
            setCaption(text.split('//')[1].split("/")[0]);
            updatedAdsets[index] = {
                ...updatedAdsets[index],
                Website_URL: text,
                Caption: text.split('//')[1].split("/")[0],
            };

        } else {
            setCaption(text.split('/')[0]);
            updatedAdsets[index] = {
                ...updatedAdsets[index],
                Website_URL: text,
                Caption: text.split('/')[0],
            };

        }

        
        

        // Update the form with the new adsets
        form.setFieldsValue({
            adsets: updatedAdsets
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
    }

    const getUrlBuilder = useMemo(() => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_Tonic1':
                return <TonicUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_System1':
                return <System1UrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_DomainActive':
                return <DActiveUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
        }
        
    },[network, accountis, onReturnUrl])

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
      
        const combined = publishers.flatMap(pub => positionOptions[pub] || []);
      
        // De-duplicate by `key`
        const unique = Array.from(new Map(combined.map(pos => [pos.key, pos])).values());
      
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
        setSelectedPublishers(prev => ({
          ...prev,
          [adset.id]: value
        }));
      
        // Optionally reset selected positions for this adset
        setSelectedPositions(prev => ({
          ...prev,
          [adset.id]: [] // clear when publishers change
        }));
      };

    const handleCancelForURLBuilder = () => {
      setIsModalVisibleForURLBuilder(false);
    };

    const onClickCreativesDrawer = (adset, index) => {
        console.log("Creatives Drawer Opened");
        setOpenCreativesDrawer(true);
        setCreativeIndex(adset.id);
    }

    const handlePositionChange = (values, options) => {
        console.log(values, "values");
        console.log(options, "options");
        const formatted = options.map(opt => ({
          key: opt.value,
          label: opt.label || opt.children
        }));
        console.log(formatted, "formatted positions");
        // setSelectedPositions(formatted);
        setSelectedPositions(prevState => ({
            ...prevState, // Spread the previous state to preserve other entries
            [adset.id]: formatted // Set the formatted array at the specific index
        }));
    };

    const onClickEdit = (index) => {
        setIsModalVisibleForURLBuilder(true);
    }
  
    const tooltipMsg = isCampaignBudgetActive
      ? 'You have enabled daily budget in the campaign level'
      : isAnyAdsetBudgetSet
      ? 'You have enabled daily budget in the Adset Level'
      : '';
    
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
          status: 'done',
          type: file?.url?.endsWith(".jpg") ? "image/jpg" :
                file?.url?.endsWith(".jpeg") ? "image/jpeg" :
                file?.url?.endsWith(".png") ? "image/png" : "video/",
          url: file?.url,
        }));
      
        setSelectedFilesFromCreatives(prev => ({
          ...prev,
          [adsetId]: [...(prev[adsetId] || []), ...mapped],
        }));
      
        setSelectedFiles(prev => ({
          ...prev,
          [adsetId]: [...(prev[adsetId] || []), ...mapped],
        }));
      
        form.setFieldsValue({
          adsets: {
            [index]: {
              MediaContent: [...(form.getFieldValue(['adsets', index, 'MediaContent']) || []), ...mapped],
            }
          }
        });
      
        form.validateFields([['adsets', index, 'MediaContent']]);
        setOpenCreativesDrawer(false);
    };

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
                positions: selectedPositions[adset.id].map(pos => pos.key),
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
              name: ['adsets', index, 'DailyAdd_amount'],
              value: adset.DailyAdd_amount,
            },
          ]);
        }
      }, [adset?.DailyAdd_amount]);

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
        
            <Collapse accordion>
                <Panel header={
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{ color: theme === 'dark' ? '#fff' : '#000', alignContent:'center' }}>{adset.AdsetPanelName}</span>
                    
                    <div>
                        {index !==0 && (
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
                            onClick={(e)=>{
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
                                cloneAdset(adset.id)}} 
                            style={{ float: 'right', marginLeft: '10px' }}
                        />
                    </div>

                </div>
            } key={adset.id} forceRender>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <Form.Item
                        name={['adsets', index, "AdsetName"]}
                        initialValue={campaignName}
                        label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 200px' }}
                    >
                        <Input 
                        onChange={(e) => {
                            const value = e.target.value;  // Correct way to get the value
                            form.setFieldsValue({
                              adsets: [
                                ...form.getFieldValue("adsets").slice(0, index),  // Get previous adsets before the current index
                                { ...form.getFieldValue("adsets")[index], AddName: value }, // Update AddName for the current adset
                                ...form.getFieldValue("adsets").slice(index + 1),  // Get adsets after the current index
                              ]
                            });
                          }}
                        
            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "optimization_goal"]}
                        label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
                    >
                        <Select
                            options={[
                                { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                                { value: "LINK_CLICKS", label: "Clicks" },
                                { value: "REACH", label: "Reach" },
                                { value: "VALUE", label: "Value" }
                            ]}
                            // onChange={(value) => handleFieldChange(index, "optimization_goal", value)}
                            // defaultValue={adset.optimization_goal || "OFFSITE_CONVERSIONS"}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "billing_event"]}
                        label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.billing_event || "IMPRESSIONS"}
                    >
                        <Select
                            options={[
                                { value: "IMPRESSIONS", label: "Impressions" },
                                { value: "VALUE", label: "Value" }
                            ]}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            // defaultValue={adset.billing_event || "IMPRESSIONS"}
                            // onChange={(value) => handleFieldChange(index, "billing_event", value)}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "DatePicker"]}
                        label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
                        rules={[
                            {
                                required: true,
                                message: 'Please input!',
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={currentDate ? dayjs(currentDate) : dayjs()}
                    >
                        <DatePicker showTime  dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}
    //                                 onChange={(value, dateString) => {
    //     console.log("Local Time:", dateString)
    //     console.log("UTC ISO:", moment(value).utc().format("YYYY-MM-DDTHH:mm:ssZ"))
    //   }}
                        style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "action_source"]}
                        label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.action_source || "website"}
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
                            // defaultValue={adset.action_source || "website"}
                            // onChange={(value) => handleFieldChange(index, "action_source", value)}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "custom_event_type"]}
                        label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.custom_event_type || "LEAD"}
                    >
                        <Select
                            options={[
                                { value: "LEAD", label: "Lead" },
                                { value: "PURCHASE", label: "Purchase" },
                                { value: "SEARCH", label: "Search" },
                                { value: "CONTACT", label: "Contact" },
                            ]}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                            typeof imagehash?.pixelID === 'object'
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
                        style={{ flex: '1 1 200px' }}
                        >
                        {typeof imagehash?.pixelID === 'object' ? (
                            <Select
                            defaultValue={imagehash?.pixelID?.Universal}
                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            >
                            {Object.entries(imagehash.pixelID).map(([label, value]) => (
                                <Select.Option key={value} value={value}>
                                {`${label} - ${value}`}
                                </Select.Option>
                            ))}
                            </Select>
                        ) : (
                            <Input
                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
    name={['adsets', index, "DailyAdd_amount"]}
    label={`Adset ${index + 1} Daily Budget`}
    rules={[
        {
            required: !(isCampaignBudgetActive || form.getFieldValue(['adsets', index, 'DailyAdd_amount']) > 0),
            message: `Please enter a valid number > 0 in Adset ${index + 1}`
        }
    ]}
>
    <Tooltip title={isCampaignBudgetActive ? 'You have enabled daily budget in the Campaign Level' : ''}>
        <InputNumber
            placeholder="$"
            min={0}
            step={0.01}
            value={adset.DailyAdd_amount}
            onChange={value => {
                // Handle the change, updating the adset value both in the form and the adset state
                handleAdsetChange(index, value);

                // Ensure that 'adsets' is defined and is an array
                const adsets = form.getFieldValue('adsets') || []; // Fallback to empty array if undefined

                // Update only the DailyAdd_amount in the form without disturbing other values
                const updatedAdsets = adsets.map((ad, i) =>
                    i === index ? { ...ad, DailyAdd_amount: value } : ad
                );

                form.setFieldsValue({
                    adsets: updatedAdsets
                });
            }}
            readOnly={isCampaignBudgetActive} // Make adset budget read-only if campaign budget is active
            style={{ width: 200 }}
        />
    </Tooltip>
</Form.Item>


                    {showBidAmount && (
                        <Form.Item
                            name={['adsets', index, "bid_amount"]}
                            label={<span style={{ color: "#B4B4B4" }}>Cost per Result Goal</span>}
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
                            style={{ flex: '1 1 150px' }}
                        >
                            <Input
                                type="number"
                                placeholder="$"
                                step="0.1"
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
                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            />

                        </Form.Item>
                    )}
                </div>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "green" }}>Targeting</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <Form.Item
                        name={['adsets', index, "countries"]}
                        label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.countries || "US"}
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
                            // defaultValue={adset.countries || "US"}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "Min_Age"]}
                        label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.Min_Age || "18"}
                    >
                        <Select
                            options={[
                                { value: "18", label: "18" },
                                { value: "25", label: "25" },
                                { value: "35", label: "35" },
                                { value: "40", label: "40", disabled: true },
                            ]}
                            // defaultValue={adset.Min_Age || "18"}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "Max_Age"]}
                        label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.Max_Age || "65"}
                    >
                        <Select
                            options={[
                                { value: "20", label: "20" },
                                { value: "30", label: "30" },
                                { value: "65", label: "65+" },
                                { value: "80", label: "80", disabled: true },
                            ]}
                            // defaultValue={adset.Max_Age || "65"}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "Gender"]}
                        label={<span style={{ color: "#B4B4B4" }}> Gender</span>}
                        rules={[
                            {
                                required: true,
                                message: "Please select an option!",
                            },
                        ]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.Gender || "0"}
                    >
                        <Select
                            options={[
                                { value: "0", label: "All" },
                                { value: "1", label: "Male" },
                                { value: "2", label: "Female" },
                            ]}
                            // defaultValue={"0"}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        />
                    </Form.Item>
                    <Form.Item
                        name={['adsets', index, "Language"]}

                        label={<span style={{ color: "#B4B4B4" }}>Language</span>}
                        rules={[{ required: true, message: "Please select an option!" }]}
                        style={{ flex: '1 1 150px' }}
                        initialValue={adset.Language || "English (US)"}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            placeholder="Select Language"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            // defaultValue={adset.Language || "English (US)"}
                        >
                            {localesdata.map(option => (
                                <Option key={option.key} value={option.key}>
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
    label="Placements"
    name={['adsets', index, "placements"]}
    rules={[{ required: true, message: 'Please select a mode!' }]}
    initialValue={adset.placements || "Advance"}
    >
    <Select
    placeholder="Select a mode"
    dropdownClassName={theme === 'dark' && "custom-dropdown"}
    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
    // defaultValue={adset.placements || "Advance"}
    >
    <Option value="Advance">Advance</Option>
    <Option value="manual">Manual</Option>
    </Select>
    </Form.Item>
    {/* <div style={{display:'flex', flexDirection:"row", justifyContent:'center', alignItems:"center", width:'100%'}}> */}

    <Form.Item shouldUpdate={(prevValues, curValues) =>
    prevValues.adsets?.[index]?.placements !== curValues.adsets?.[index]?.placements
    }>
    {({ getFieldValue }) => {
    const placementValue = getFieldValue(['adsets', index, 'placements']);
    return placementValue === 'manual' ? (
    <div style={{
    display: 'flex',
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "flex-start",
    gap: '16px', // spacing between items
    width: '100%',
    flexWrap: 'wrap' // optional for responsive wrapping
    }}>
    <Form.Item
    name={['adsets', index, "platforms"]}
    label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
    rules={[{ required: true, message: "Please select an option!" }]}
    // style={{ flex: '1 1 300px' }}
    style={{ flex: 1, minWidth: '250px' }}
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
  style={{ flex: 2, minWidth: '300px' }}
>
  <Select
    mode="multiple"
    placeholder="Select Positions"
    value={(selectedPositions?.[adset.id] || []).map(pos => pos.key)} // ✅ fixed
    onChange={handlePositionChange}
    dropdownClassName={theme === 'dark' && "custom-dropdown"}
    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
  >
    {Array.isArray(selectedPublishers?.[adset.id]) &&
      selectedPublishers[adset.id].length > 0 &&
      getPositionOptions().map(position => (
        <Option key={`${position.key}_${position.label}`} value={position.key}>
          {position.label}
        </Option>
      ))}
  </Select>
</Form.Item>


    <Form.Item
    name={['adsets', index, "device_platforms"]}
    label={<span style={{ color: "#B4B4B4" }}>Device</span>}
    rules={[{ required: true, message: "Please select an option!" }]}
    // style={{ flex: '1 1 200px' }}
    style={{ flex: 1, minWidth: '200px' }}
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
    </div>
    ) : null;
    }}
    </Form.Item>
    {/* </div> */}

                </div>
                <Collapse defaultActiveKey={['open']} expandIconPosition="start">
                    <Panel 
                    key="open" forceRender
                    header={
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <span>AD LEVEL</span>
                        {(selectedFiles[index] || []).length > 0 && (
    <div onClick={(e) => e.stopPropagation()}>
    <Breadcrumb separator="/">
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
    fontWeight: activeMediaIndex[index] === i ? "900" : "normal",
    color: activeMediaIndex[index] === i ? "#91C25F" : "#888",
    cursor: "pointer",
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
                                <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                            <Form.Item
                                                label={<span style={{ color: "#B4B4B4" }}>Select source</span>}
                                                style={{ flex: 1 }}
                                                >
                                                <Select
                                                    value={selectedOption}
                                                    onChange={(value) => {
                                                    setSelectedOption(value);
                                                    form.validateFields(["MediaContent"]); // Revalidate when switching source
                                                    }}
                                                    style={{ marginBottom: 16 }}
                                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                >
                                                    <Option value="upload">Upload</Option>
                                                    <Option value="creative">Creative library</Option>
                                                </Select>
                                                </Form.Item>

                                                <Form.Item
                                                name={['adsets', index, "MediaContent"]}
                                                rules={[
                                                    {
                                                      validator: async () => {
                                                        // Default to empty array if the value for the index is undefined
                                                        const mediaFiles = selectedFilesFromMedia[adset.id] || [];
                                                        const creativeFiles = selectedFilesFromCreatives[adset.id] || [];
                                                  
                                                        // Check if there are any files selected based on the selected option
                                                        if (
                                                          (selectedOption === "upload" && mediaFiles.length === 0) ||
                                                          (selectedOption === "creative" && creativeFiles.length === 0)
                                                        ) {
                                                          throw new Error("Please select Upload!");
                                                        }
                                                        return Promise.resolve();
                                                      }
                                                    }
                                                  ]}
                                                >
                                                    <div>
                                                        {/* Upload UI */}
                                                        <div className="custom-dark-mode"  style={{ display: selectedOption === "upload" ? "block" : "none" }}>
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
                (file.originFileObj ? URL.createObjectURL(file.originFileObj) : undefined),
            }));
          
            setSelectedFiles((prev) => {
              const existingUids = new Set((prev[adset.id] || []).map((f) => f.uid));
              const updated = [...(prev[adset.id] || []), ...newFiles.filter(f => !existingUids.has(f.uid))];
              return { ...prev, [adset.id]: updated };
            });
          
            setSelectedFilesFromMedia((prev) => {
              const existingUids = new Set((prev[adset.id] || []).map((f) => f.uid));
              const updated = [...(prev[adset.id] || []), ...newFiles.filter(f => !existingUids.has(f.uid))];
              return { ...prev, [adset.id]: updated };
            });
          
            const formMedia = form.getFieldValue(['adsets', index, 'MediaContent']) || [];
            form.setFieldsValue({
              adsets: {
                [index]: {
                  MediaContent: [...formMedia, ...newFiles],
                },
              },
            });
          
            form.validateFields([['adsets', index, 'MediaContent']]);
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
              const updated = (prev[adset.id] || []).filter(f => f.uid !== fileToRemove.uid);
              return { ...prev, [adset.id]: updated };
            });
          
            setSelectedFiles((prev) => {
              const updated = (prev[adset.id] || []).filter(f => f.uid !== fileToRemove.uid);
              return { ...prev, [adset.id]: updated };
            });
          
            const updatedFormMedia = (form.getFieldValue(['adsets', index, 'MediaContent']) || []).filter(
              f => f.uid !== fileToRemove.uid
            );
          
            form.setFieldsValue({
              adsets: {
                [index]: {
                  MediaContent: updatedFormMedia,
                },
              },
            });
          
            form.validateFields([['adsets', index, 'MediaContent']]);
            return true;
        }}
        multiple
        maxCount={10}
        fileList={selectedFilesFromMedia[adset.id] || []}
        listType="picture"
        accept="image/*, video/*"
      >
        <Button icon={<UploadOutlined />} className="dark-icon-button" style={{ color: theme === "dark" ? "white" : "#000" }}>
          Select Files
        </Button>
      </Upload>

                                                        </div>

                                                        {/* Creative Library UI */}
                                                        {selectedOption === "creative" && (
                                                        <div>
                                                            <Button icon={<UploadOutlined />} onClick={()=>{onClickCreativesDrawer(adset, index)}} className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}>
                                                            Select Files
                                                            </Button>

                                                            {selectedFilesFromCreatives[adset.id]?.length > 0 && (
                                                            <div style={{ marginTop: "10px" }}>
                                                                {selectedFilesFromCreatives[adset.id].map((file, index) => (
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
                                                                        color: theme === 'dark' ? '#fff' : '#000',
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
    const updatedCreatives = selectedFilesFromCreatives[adset.id].filter(
      (f) => f.uid !== file.uid
    );
    setSelectedFilesFromCreatives((prev) => {
      const updated = { ...prev, [adset.id]: updatedCreatives };  // Update the adset.id specifically
      return updated;
    });

    // Update selectedFiles for the current adset (adset.id)
    const updatedFiles = selectedFiles[adset.id].filter((f) => f.uid !== file.uid);
    setSelectedFiles((prev) => {
      const updated = { ...prev, [adset.id]: updatedFiles };  // Update the index specifically
      return updated;
    });

    // Update form values with the new MediaContent array
    form.setFieldsValue({
      MediaContent: updatedCreatives
    });

    // Trigger validation
    form.validateFields(["MediaContent"]);
  }}
  style={{ color: "red", marginLeft: 12, cursor: "pointer" }}
/>
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
                                        <Input style={{ width: "45%" }}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                    </Form.Item>
                                </div>
                                <Form.Item
                                    name={['adsets', index, "AddName"]}
                                    initialValue={campaignName}
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
                                        onChange={(e) => setAddName(e.target.value)}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Primary text"
                                    name={['adsets', index, "message"]}
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
                                        onChange={(e) => setPrimaryText(e.target.value)}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}

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
                                    name={['adsets', index, "headline"]}
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
                                        onChange={(e) => setHeadline(e.target.value)}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Description"
                                    name={['adsets', index, "Description"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a Description!",
                                        },
                                    ]}
                                    required
                                    initialValue={"Find More"}
                                    tooltip="This is a required field">
                                    <TextArea
                                        placeholder="Description"
                                        autoSize={{ minRows: 2, maxRows: 10 }}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', paddingRight: '50px' }}>
                                                <span>Website_URL</span>
                                                <Tooltip title="This is a required field">
                                                    <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'pointer' }} />
                                                </Tooltip>
                                            </div>
                                            <EditOutlined style={{ cursor: 'pointer' }} onClick={() => onClickEdit(index)} />
                                        </div>
                                    }
                                    labelCol={{ style: { width: '100%' } }}  // Makes the label full width
                                    wrapperCol={{ style: { width: '100%' } }}  // Ensures TextArea takes the same full width
                                    name={['adsets', index, "Website_URL"]}
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
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}

                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Display Link"
                                    name={['adsets', index, "Caption"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a Caption!",
                                        },
                                    ]}
                                    required
                                    tooltip="This is a required field">
                                    <TextArea
                                        placeholder="Display Link"
                                        autoSize={{ minRows: 2, maxRows: 10 }}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                                    bodyStyle={{ height: '50vh', overflowY: 'auto' }}
                                    className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
  {selectedFiles[adset.id] && selectedFiles[adset.id].length > 0 ? (
    selectedFiles[adset.id].map((file, i) => (
      <Badge
        key={i}
        count={
          file?.url?.endsWith('.png') ||
          file?.url?.endsWith('.jpg') ||
          file?.url?.endsWith('.jpeg') ||
          file?.url?.endsWith('.mp4')
            ? null
            : (
              <EditOutlined
                style={{ fontSize: '25px', color: '#fff' }}
                onClick={() => handleEditClick(file)}
              />
            )
        }
        style={{
          backgroundColor: '#52c41a',
          borderRadius: '50%',
          position: 'absolute',
          top: '5px',
          right: '5px',
          zIndex: 10,
          cursor: 'pointer',
        }}
        offset={[5, 5]}
      >
        <div className="container-ad-preview">
          <div className="ad-preview" style={{ width: "350px", backgroundColor: theme === "dark" ? "#4f4f4d" : "#fff" }}>
            <div className="ad-heading">
              <div className="img">
                {file?.url?.endsWith('.png') ||
                file?.url?.endsWith('.jpg') ||
                file?.url?.endsWith('.jpeg') ? (
                  <img
                    src={file?.url}
                    alt="preview"
                    width="40"
                    height="40"
                    style={{ objectFit: 'cover' }}
                  />
                ) : file?.url?.endsWith('.mp4') ? (
                  <video
                    src={file?.url}
                    width="40"
                    height="30"
                    style={{ objectFit: 'cover' }}
                    muted
                  />
                ) : file?.type?.startsWith('image/') ? (
                  <img
                    src={editedImages[file?.name]
                      ? editedImages[file?.name]
                      : file?.originFileObj
                        ? URL.createObjectURL(file.originFileObj)
                        : file?.url}
                    alt="preview"
                    width="40"
                    height="40"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <video
                    src={file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url}
                    width="40"
                    height="30"
                    style={{ objectFit: 'cover' }}
                    muted
                  />
                )}
              </div>

              <div className="title">
                <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: theme === "dark" ? "white" : "#000" }}>
                  {addName}
                  <div className="sub">
                    {imagehash?.pageName ? (
                      <>
                        {imagehash.pageName} <GlobalOutlined style={{ opacity: "0.6" }} />
                      </>
                    ) : (
                      <GlobalOutlined style={{ opacity: "0.6" }} />
                    )}
                  </div>
                </div>
              </div>

              <div className="close"><CloseOutlined style={{ fontSize: "20px" }} /></div>
              <div className="moreoptions"><MoreOutlined style={{ fontSize: "20px" }} /></div>
            </div>

            <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: theme === "dark" ? "white" : "#000" }}>
              {primaryText}
            </div>

            <div className="ad-image" style={{ width: '350px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {file?.url?.endsWith('.png') ||
              file?.url?.endsWith('.jpg') ||
              file?.url?.endsWith('.jpeg') ? (
                <img
                  src={file?.url}
                  alt="ad"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : file?.url?.endsWith('.mp4') ? (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                >
                  <source src={file?.url} />
                  Your browser does not support the video tag.
                </video>
              ) : file?.type?.startsWith('image/') ? (
                <img
                  src={editedImages[file?.name]
                    ? editedImages[file?.name]
                    : file?.originFileObj
                      ? URL.createObjectURL(file.originFileObj)
                      : file?.url}
                  alt="ad"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                >
                  <source src={file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            <div className="ad-cta">
              <div className="details">
                <div className="link" style={{ color: theme === "dark" ? "white" : "#000" }}>{caption}</div>
                <div className="title" style={{ color: theme === "dark" ? "white" : "#000" }}>{headline}</div>
                <div className="desc" style={{ color: theme === "dark" ? "white" : "#000" }}>{description}</div>
              </div>
              <div className="ad-button">
                <button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }}>
                  Learn More
                </button>
              </div>
            </div>

            <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
              {websiteURL}
            </a>

            <div className="icons">
              <div className="like" style={{ color: theme === "dark" ? "white" : "#000" }}>
                <LikeOutlined style={{ fontSize: "20px" }} /> Like
              </div>
              <div className="comment" style={{ color: theme === "dark" ? "white" : "#000" }}>
                <CommentOutlined style={{ fontSize: "20px" }} /> Comment
              </div>
              <div className="share" style={{ color: theme === "dark" ? "white" : "#000" }}>
                <ShareAltOutlined style={{ fontSize: "20px" }} /> Share
              </div>
            </div>
          </div>
        </div>
      </Badge>
    ))
  ) : null}
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
                        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                    >
                        {/* <CreativesDrawer
                            selectedFilesData={selectedFilesData}
                            
                        /> */}
                        <ImageUploadPage selectedFilesData={selectedFilesData} fromCampaigns={true} network={network} Account_Number={accountis} />
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
                                    bodyStyle={{ height: '50vh', overflowY: 'auto' }}
                                    className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                                >
                                    {getUrlBuilder}
                                </Modal>
                </Panel>
            
            </Collapse>
    );
};
const CreateCampaignDrawer = ({ visible, onClose, changeRRefrst, accountis, network}) => {
    // const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    // const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [submitErrors, setSubmitErrors] = useState([]);

    const [accountNumber, setAccountNumber] = useState(accountis);
    const [imagehash, setimagehash] = useState('')
    const { data: session } = useSession();
    var token = localStorage.getItem("token")
    const [showBidAmount, setShowBidAmount] = useState(false);
    const [selectedPublishers, setSelectedPublishers] = useState({});
    const [selectedPositions, setSelectedPositions] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [addName, setAddName] = useState('');
    const [primaryText, setPrimaryText] = useState('');
    const [caption, setCaption] = useState('');
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [websiteURL, setWebsiteURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null); // File to be edited
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);
    const [editedImages, setEditedImages] = useState({});
    const [isManual, setIsManual] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [campaignLevelDailyBudget, setCampaignLevelDailyBudget] = useState(0);
    const [adsetLevelDailyBudget, setAdsetLevelDailyBudget] = useState(0);
    const [activeKey, setActiveKey] = useState(['1']); // State to control active panels
    const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState({});
    const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState({});
    const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
    const [adsets, setAdsets] = useState([{ id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName:"Adset 1" }]);
    const [creativeIndex, setCreativeIndex] = useState(0);
    const selectedRef = useRef({});
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
    const [popupInputs, setPopupInputs] = useState({ input1: '', input2: '' });
    const [errors, setErrors] = useState({ input1: '', input2: '' });
    const [refreshDraft, setRefreshDraft] = useState(false);
    console.log(draftsData, "draftsData in CreateCampaignDrawer");
  
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
          input1: popupInputs.input1.trim() ? '' : 'First input is required',
          input2: popupInputs.input2.trim() ? '' : 'Second input is required',
        };
      
        setErrors(newErrors);
      
        const hasErrors = Object.values(newErrors).some((msg) => msg !== '');
        if (hasErrors) {
          return Promise.reject(); // keep Popconfirm open
        }
      
        setConfirmLoading(true);
      
        try {
          const allValues = form.getFieldsValue(true);
      
          const draftData = await MultipleAdsetsDraftFetching(allValues);
          const totalDraftData = {id: uuidv4(), Title: popupInputs.input1, Draft_Name: popupInputs.input2, ...draftData }
        //   console.log(totalDraftData, "totalDraftData in handleConfirm");

          const response = await fetch('https://www.testapi.adsgoat.in/api/submitDraftData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            body: JSON.stringify({ draftData: totalDraftData, email: session?.user?.email, userName: session?.user?.name })
          
          });
          if(response.status === 200 || response.status === 201) {
            setRefreshDraft(prev => !prev); 
          }
          console.log("Draft data submitted successfully:", response);
      
          // Close only after successful fetch and processing
          return new Promise((resolve) => {
            setTimeout(() => {
              setConfirmLoading(false);
              setOpen(false); // 👈 Close here after everything is done
              setPopupInputs({ input1: '', input2: '' });
              setErrors({ input1: '', input2: '' });
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
      setPopupInputs({ input1: '', input2: '' });
      setErrors({ input1: '', input2: '' });
    };

    // Track if any adset has a budget set
    // useEffect(() => {
    //     const anyAdsetFilled = adsets.some(adset => adset.DailyAdd_amount > 0);
    //     setIsAnyAdsetBudgetSet(anyAdsetFilled);
    // }, [adsets]);

    useEffect(() => {
        const adsets = form.getFieldValue('adsets') || [];
        const anyAdsetFilled = adsets.some(adset => adset?.DailyAdd_amount > 0);
        setIsAnyAdsetBudgetSet(anyAdsetFilled);
    }, [form]);

    // Function to update adset value
    const handleAdsetChange = (index, value) => {
        const newAdsets = [...adsets];
        newAdsets[index].DailyAdd_amount = value;
        setAdsets(newAdsets);
        if(value > 0) {
            setIsAnyAdsetBudgetSet(true);
        }
        else {
            const adsets = form.getFieldValue('adsets') || [];
            const anyAdsetFilled = adsets.some(adset => adset?.DailyAdd_amount > 0);
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
            form.resetFields();          // Reset form fields to their initialValues
            setWebsiteURL('');           // Clear website URL
            setSelectedFiles({});        // Clear selected files
            setCampaignName('');         // Clear campaign name
            setPrimaryText('');          // Clear primary text field
            setCaption('');              // Clear caption field
            setHeadline('');             // Clear headline field
            setDescription('');          // Clear description field
            setSelectedPublishers({});   // Clear selected publishers
            setSelectedPositions({});    // Clear selected positions
            setIsFormComplete(false);    // Reset form completion state
            setCampaignName('');
            setAddName('');
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
            [field]: value,  // Update only the specific field
        };
        form.setFieldsValue({ adsets: updatedAdsets });
    };

    const updateAdMediaData = (index, files) => {
        const adset = form.getFieldValue(['adsets', index]) || {};
        console.log(adset, "adset in updateAdMediaData");
        console.log(files, "files in updateAdMediaData");
        console.log(index, "index in updateAdMediaData");
        console.log(form.getFieldValue("adsets"), "form.getFieldValue('adsets') in updateAdMediaData");
        const formatted = files.map((file) => ({
          AddName: adset.AddName || "",
          Caption: adset.Caption || "",
          Description: adset.Description || "",
          message: adset.message || "",
          filename: file.name || "",
          headline: adset.headline || "",
          Website_URL: adset.Website_URL || ""
        }));
      
        setAdMediaData((prev) => ({
          ...prev,
          [index]: formatted
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
    const adsetNames = adsets.map(adset => adset.AdsetPanelName);
    let highestNumber = 0;

    // Loop to find the highest number in adset names
    adsetNames.forEach((name) => {
        if (typeof name === 'string') {
          const match = name.match(/^Adset (\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (num > highestNumber) {
              highestNumber = num;
            }
          }
        }
      });
      

    return `Adset ${highestNumber + 1}`;
};

// Helper function to get default adset data
const getDefaultAdset = (campaignName, caption, websiteURL, imagehash, currentDate) => {
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
        MediaContent: [],  // Default MediaContent as empty array
    };
};

// For adding a new adset
// For adding a new adset
// For adding a new adset
// For adding a new adset
const addAdset = () => {
    const newAdsetName = getNextAdsetName(adsets); // Get the next highest number
    const newAdset = { 
        id: uuidv4(),
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
        MediaContent: [],  // Default MediaContent as empty array
    };
    setAdsets((prevAdsets) => [...prevAdsets, newAdset]);

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
    const adsetIndex = adsets.findIndex(ad => ad.id === adsetId);
    if (adsetIndex === -1) return;
  
    const originalAdset = adsets[adsetIndex];
    const newId = uuidv4();
  
    const baseName = originalAdset.AdsetPanelName;
    const copyCount = adsets.filter(ad => ad.AdsetPanelName.startsWith(baseName)).length;
    const newPanelName = copyCount > 0 ? `${baseName}(${copyCount})_Copy` : `${baseName}_Copy`;
  
    const clonedAdset = {
      ...originalAdset,
      id: newId,
      AdsetPanelName: newPanelName,
    };
  
    const currentFormAdsets = form.getFieldValue('adsets') || [];
  
    // ✅ Match by UUID not index!
    const formIndex = currentFormAdsets.findIndex((_, i) => adsets[i]?.id === adsetId);
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
      setter(old => ({ ...old, [newId]: [...(old[adsetId] || [])] }));
    };
  
    cloneFiles(selectedFiles, setSelectedFiles);
    cloneFiles(selectedFilesFromMedia, setSelectedFilesFromMedia);
    cloneFiles(selectedFilesFromCreatives, setSelectedFilesFromCreatives);
  
    // ✅ Clone selectedPositions
    setSelectedPositions(prev => ({
      ...prev,
      [newId]: [...(prev[adsetId] || [])],
    }));
    setSelectedPublishers(prev => ({
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
    setAdsets(prevAdsets => {
      const updatedAdsets = prevAdsets.filter(ad => ad.id !== adsetid);
  
      // Step 3: Rebuild form values by matching UUIDs
      const newFormAdsets = updatedAdsets.map(updatedAdset => {
        const oldIndex = prevAdsets.findIndex(old => old.id === updatedAdset.id);
        return currentFormAdsets[oldIndex]; // retain values of other adsets
      });

      console.log(newFormAdsets, "newFormAdsets in removeAdset");
  
      // Step 4: Set updated form values
      form.setFieldsValue({ adsets: newFormAdsets });
  
      return updatedAdsets;
    });
  
    // Step 5: Clean up all related file states
    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[adsetid];
      return updated;
    });
  
    setSelectedFilesFromMedia(prev => {
      const updated = { ...prev };
      delete updated[adsetid];
      return updated;
    });
  
    setSelectedFilesFromCreatives(prev => {
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
        setEditedImages(prev => ({
            ...prev,
            [fileId]: editedImageObject.imageBase64 || editedImageObject.imageUrl
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
            setCaption(text.split('//')[1].split("/")[0]);
            updatedAdsets[urlBuilderIndex] = {
                ...updatedAdsets[urlBuilderIndex],
                Website_URL: text,
                Caption: text.split('//')[1].split("/")[0],
            };

        } else {
            setCaption(text.split('/')[0]);
            updatedAdsets[urlBuilderIndex] = {
                ...updatedAdsets[urlBuilderIndex],
                Website_URL: text,
                Caption: text.split('/')[0],
            };

        }

        
        

        // Update the form with the new adsets
        form.setFieldsValue({
            adsets: updatedAdsets
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
    }

    // const onChangeCampaignLevelDailyBudget = (event) => {
    //     setCampaignLevelDailyBudget(parseFloat(event.target.value));
    //     console.log(event.target.value);
    // }

    const onChangeAdsetLevelDailyBudget = (event) => {
        setAdsetLevelDailyBudget(parseFloat(event.target.value));
        console.log(event.target.value);
        console.log(parseFloat(event.target.value));
    }


    const getUrlBuilder = useMemo(() => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_Tonic1':
                return <TonicUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_System1':
                return <System1UrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
            case 'FB_DomainActive':
                return <DActiveUrlBuilder accountis={accountis} onReturnMessage={onReturnUrl} />
        }
        
    },[network, accountis, onReturnUrl])



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
        const formatted = options.map(opt => ({
          key: opt.value,
          label: opt.label || opt.children
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
        setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP" || value === "COST_CAP");
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
                key => allValues[key] !== undefined && allValues[key] !== ''
            );
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();

    }, [websiteURL, form]);

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ Name: campaignName, AdsetName: campaignName, AddName: campaignName });

        // Check if all required fields are complete
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
            const isComplete = Object.keys(allValues).every(
                key => allValues[key] !== undefined && allValues[key] !== ''
            );
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();

    }, [campaignName, form]);


    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ Daily_amount: campaignLevelDailyBudget, DailyAdd_amount: adsetLevelDailyBudget });

        // Check if all required fields are complete
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
            const isComplete = Object.keys(allValues).every(
                key => allValues[key] !== undefined && allValues[key] !== ''
            );
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();

    }, [campaignLevelDailyBudget, form]);

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ Daily_amount: campaignLevelDailyBudget, DailyAdd_amount: adsetLevelDailyBudget });

        // Check if all required fields are complete
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
            const isComplete = Object.keys(allValues).every(
                key => allValues[key] !== undefined && allValues[key] !== ''
            );
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();

    }, [adsetLevelDailyBudget, form]);

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ pixel_id: imagehash?.pixelID, page_id: imagehash?.pageID, });

        // Check if all required fields are complete
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
            const isComplete = Object.keys(allValues).every(
                key => allValues[key] !== undefined && allValues[key] !== ''
            );
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();
        if (imagehash) {
            if (imagehash.pixelID === null || imagehash.pixelID === undefined || imagehash.pixelID === "") {
                message.error('There is no PageID and PixelID for this account. Contact your manager', 10);
            }
        }

    }, [imagehash, form]);

    const Accountchange = (e) => {
        setAccountNumber(e.target.value);
    };
    // const handlepositionChange = async (values) => {
    //     console.log(values, "handlepositionChange")
    // }

    const fetchAccountDetails = async () => {
        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${accountNumber}`,
                {
                    headers: {
                        'Authorization': token
                    }
                }
            );
            console.log("account data", ...response?.data);


            setimagehash(...response?.data)
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            // Handle error
        }
    }

    const fetchDraftDeatils = async () => {
        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/getDraftData?email=${session?.user?.email}`,
                {
                    headers: {
                        'Authorization': token
                    }
                }
            );
            // console.log("account data", ...response?.data);
            console.log("Draft data fetched successfully:", response.data);
            // console.log((Array.isArray(response?.data?.Drafts && response?.data?.Drafts.length > 0) ? response?.data?.Drafts : []));
            setDraftsData((Array.isArray(response?.data?.Drafts) && response?.data?.Drafts.length > 0) ? response?.data?.Drafts : []); ;
            // setimagehash(...response?.data)
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            // Handle error
        }
    }

    useEffect(() => {
        if (accountNumber && visible) {
            fetchAccountDetails();
        }
    }, [accountNumber, visible]);

    useEffect(() => {
        fetchDraftDeatils();
    }, [refreshDraft]);

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
        const isComplete = Object.values(allValues).every(value => value !== undefined && value !== '');
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
                const response = await fetch("https://prodapis.adsgoat.in/uploadUserFiles", {
                    method: "POST",
                    headers: {
                        Authorization: localStorage.getItem("token"),
                        username: imagehash.username || "default-user",
                        "x-folder": folderPath.endsWith("/") ? folderPath : folderPath + "/",
                        "x-action": "create-folder"
                    }
                });
        
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
                const response = await fetch("https://prodapis.adsgoat.in/uploadUserFiles", {
                    method: "POST",
                    headers: {
                        Authorization: localStorage.getItem("token"),
                        username: imagehash.username || "default-user", // required in headers
                    },
                    body: formData,
                });
        
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
                    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
                        onError("Unsupported file type");
                        continue;
                    }
    
                    const folderPath = `${network}/${imagehash.accountNumber}/${formValues ? formValues.Name : "Drafts"}`;
                    await createS3Folder(folderPath); 
                    let fileBlob = null;
                    let s3FileUrl = null;
    
                    if (file?.url) {
                        const response = await fetch(`https://prodapis.adsgoat.in/s3?s3Url=${file.url}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: localStorage.getItem("token"),
                            },
                        });
    
                        fileBlob = await response.blob();
                        s3FileUrl = await uploadFileToS3(fileBlob, file.name, folderPath);
    
                        const formData = new FormData();
                        formData.append("file", fileBlob, file.name);
                        formData.append('access_token', token);
    
                        let fbResponse;
                        if (file.url.endsWith('.png') || file.url.endsWith('.jpg') || file.url.endsWith(".jpeg")) {
                            const fileName = file.name.split('/').pop();
    
                            fbResponse = await axios.post(
                                `https://graph.facebook.com/v20.0/act_${account}/adimages`,
                                formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
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
                        } else if (file.url.endsWith('.mp4')) {
                            fbResponse = await axios.post(
                                `https://graph.facebook.com/v20.0/act_${account}/advideos`,
                                formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );
    
                            if (fbResponse.status === 200) {
                                const videoid = fbResponse?.data?.id;
                                await new Promise(resolve => setTimeout(resolve, 10000));
    
                                const thumbnailResponse = await axios.get(
                                    `https://graph.facebook.com/v20.0/${videoid}`,
                                    {
                                        params: {
                                            access_token: token,
                                            fields: 'thumbnails',
                                            is_preferred: true
                                        }
                                    }
                                );
    
                                const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
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
                        fileBlob = editedImage ? await fetch(editedImage).then(res => res.blob()) : file.originFileObj;
                        s3FileUrl = await uploadFileToS3(fileBlob, safeName, folderPath);
    
                        const formData = new FormData();
                        formData.append("file", fileBlob, safeName);
                        formData.append('access_token', token);
    
                        let response, fbResponse;
    
                        if (file.type.startsWith('image/')) {
                            response = await axios.post(
                                'https://www.testapi.adsgoat.in/upload',
                                formData,
                                {
                                    headers: {
                                        'Authorization': localStorage.getItem("token"),
                                        "Content-Type": "multipart/form-data"
                                    },
                                }
                            );
    
                            if (!response.data.imageUrl) {
                                onError("Error: Image URL not returned from custom API");
                                console.error("Image upload to custom API failed, imageUrl missing");
                                continue;
                            }
    
                            fbResponse = await axios.post(
                                `https://graph.facebook.com/v20.0/act_${account}/adimages`,
                                formData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
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
                        } else if (file.type.startsWith('video/')) {
                            response = await axios.post(
                                'https://www.testapi.adsgoat.in/upload',
                                formData,
                                {
                                    headers: {
                                        'Authorization': localStorage.getItem("token"),
                                        "Content-Type": "multipart/form-data"
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
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );
    
                            if (fbResponse.status === 200) {
                                const videoid = fbResponse?.data?.id;
                                await new Promise(resolve => setTimeout(resolve, 10000));
    
                                const thumbnailResponse = await axios.get(
                                    `https://graph.facebook.com/v20.0/${videoid}`,
                                    {
                                        params: {
                                            access_token: token,
                                            fields: 'thumbnails',
                                            is_preferred: true
                                        }
                                    }
                                );
    
                                const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
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
            if(Array.isArray(selectedFiles[id]) && selectedFiles[id].length > 0){
                mediaHashArray = await uploadFilesSequentially(selectedFiles[id]);
            }
            console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
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
        if(values.placements === 'manual'){
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
        }
    };

    const submitDraftData = async() =>{

        const campaignData = await MultipleAdsestsFetching(formValues);

        try {
            if(campaignData) {
                // console.log("Campaign Data:", campaignData);
                //https://www.testapi.adsgoat.in
                const response = await fetch('https://www.testapi.adsgoat.in/api/newSubmitFormData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token
                    },
                    body: JSON.stringify(campaignData)
                });
    
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
    }

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

        try {
            if(campaignData) {
                // console.log("Campaign Data:", campaignData);
                //https://www.testapi.adsgoat.in
                const response = await fetch('https://www.testapi.adsgoat.in/api/newsubmitFormData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token
                    },
                    body: JSON.stringify(campaignData)
                });
    
                if (response.ok) {
                    message.success('Campaign created successfully');
                    console.log('Form data submitted successfully');
                    setLoading(false); // Stop the spinner
                    setSelectedFilesFromCreatives({});
                    setSelectedFilesFromMedia({});
                    setSelectedFiles({});
                    onClose();
                    setSelectedPositions({});
                    setAdsets([{ id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName:"Adset 1" }]);
                    isManual !== "manual" && setIsManual(false);
                    newSelectedRef.current = null; // Reset the newSelectedRef 
                } else {
                    console.error('Failed to submit form data');
                }
            }
        } catch (error) {
            console.error("Error during campaign creation:", error);
            message.error("An error occurred while creating the campaign.");
        }
        finally {
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
          .filter(item => item.label.toLowerCase().includes(labelName.toLowerCase()))
          .map(item => {
            if (item.key.includes('story_')) return 'story';
            if (item.key.includes('profile_feed-')) return 'profile_feed';
            return item.key;
          });
    }

    const MultipleAdsestsFetching = async (values) => {
        let AllAdsetsData = {
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
                Daily_amount: parseFloat(values.Daily_amount) * 100,
                Status: values.Status,
                access_token: imagehash.token,
                createdDate: moment().tz(imagehash.timeZone).format('YYYY-MM-DD')
            },
        };
        const onSuccess = (status, response) => {
                    console.log("Upload success:", response);
        };
    
        const onError = (status, error) => {
                    console.error("Upload error:", error);
        };
        
        for(let i=0; i < values.adsets.length; i++){
            let AdsetsData = {};
            
            const imageHashArray = await customRequest(values.adsets[i], i, onSuccess, onError, adsets[i].id);
            const addLevelData = imageHashArray.map((media, index) => {
                if (media.imag_hash) {
                    // This is an image
                    return {
                        id: uuidv4(),
                        AddName: `${values.adsets[i].AddName}_${index + 1}`,
                        filename: media.filename,
                        imag_hash: media.imag_hash,
                        page_id: values.page_id,
                        message: values.adsets[i].message,
                        headline: values.adsets[i].headline,
                        Description: values.adsets[i].Description,
                        Caption: values.adsets[i].Caption,
                        Website_URL: values.adsets[i].Website_URL,
                        
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
                        page_id: values.page_id,
                        message: values.adsets[i].message,
                        headline: values.adsets[i].headline,
                        Description: values.adsets[i].Description,
                        Caption: values.adsets[i].Caption,
                        Website_URL: values.adsets[i].Website_URL,
                        // urlParameters: values.urlParameters
                    };
                }
            });
            AdsetsData[`adsetlevel_${i + 1}`]={
                id: uuidv4(),
                AdsetName: values.adsets[i].AdsetName,
                Daily_amount: values.adsets[i].DailyAdd_amount ? parseFloat(values.adsets[i].DailyAdd_amount) * 100 : "",
                optimization_goal: values.adsets[i].optimization_goal,
                billing_event: values.adsets[i].billing_event,
                start_time: moment(values.adsets[i].DatePicker.$d).tz(imagehash.timeZone).format("YYYY-MM-DDTHH:mm:ssZ"),//values.adsets[i].DatePicker.$d
                action_source: values.adsets[i].action_source,
                custom_event_type: values.adsets[i].custom_event_type,
                pixel_id: values.pixel_id,
                bid_amount: values.adsets[i].bid_amount ? parseFloat(values.adsets[i].bid_amount) * 100 : 0,
                countries: values.adsets[i].countries,
                Min_Age: values.adsets[i].Min_Age,
                Max_Age: values.adsets[i].Max_Age,
                Gender: parseInt(values.adsets[i].Gender),
                locales: values.adsets[i].Language,
                placements: values.adsets[i].placements,
                ...(values.adsets[i].placements !== 'Advance' && {
                    publisher_platforms: values.adsets[i].platforms,
                    Facebook_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Facebook') || [],
                    instagram_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Instagram') || [],
                    audience_network_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Audience') || [],
                    messenger_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Messenger') || [],
                    position: values.adsets[i].positions,
                    device_platforms: values.adsets[i].device_platforms,
                }),
                buying_type: "AUCTION",
                addlevel:addLevelData
            }
            AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
        };
        return AllAdsetsData;
    };

    const MultipleAdsetsDraftFetching = async (values) => {
        let AllAdsetsData = {
            // id: uuidv4(),
            // Draft_Name:"",
            createdby: session?.user?.name,
            createdDate: moment().tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss'),
            editedDate: moment().tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss'),
            camapaignlevel: {
                // createdby: session?.user?.name,
                Name: values.Name || "",
                Objectives: values.Objectives || "",
                Special_categories: values.Special_categories || "NONE",
                Bid_strategy: values.Bid_strategy,
                Daily_amount: parseFloat(values.Daily_amount) * 100 || 0,
                Status: values.Status,
                // access_token: imagehash.token,
                createdDate: moment().tz(imagehash.timeZone).format('YYYY-MM-DD')
            },
        };
        const onSuccess = (status, response) => {
            console.log("Upload success:", response);
        };
    
        const onError = (status, error) => {
            console.error("Upload error:", error);
        };

        console.log("Adsets:", values);
        
        for(let i=0; i < values.adsets.length; i++){
            let AdsetsData = {};
            
            const imageHashArray = await customRequest(values.adsets[i], i, onSuccess, onError, adsets[i].id);
            console.log("Image Hash Array:", imageHashArray);
            const addLevelData = imageHashArray && imageHashArray.length > 0 ?  
            {
                AddName: `${values.adsets[i].AddName}` || "",
                // filename: media.filename,
                // imag_hash: media.imag_hash,
                Ads: imageHashArray.map(media => media.filename),
                page_id: values.page_id,
                message: values.adsets[i].message,
                headline: values.adsets[i].headline,
                Description: values.adsets[i].Description,
                Caption: values.adsets[i].Caption,
                Website_URL: values.adsets[i].Website_URL,
            } : {
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
            AdsetsData[`adsetlevel_${i + 1}`]={
                id: uuidv4(),
                AdsetName: values.adsets[i].AdsetName || "",
                Daily_amount: values.adsets[i].DailyAdd_amount ? parseFloat(values.adsets[i].DailyAdd_amount) * 100 : "",
                optimization_goal: values.adsets[i].optimization_goal || "",
                billing_event: values.adsets[i].billing_event || "",
                start_time: moment(values.adsets[i].DatePicker.$d).tz(imagehash.timeZone).format("YYYY-MM-DDTHH:mm:ssZ"),//values.adsets[i].DatePicker.$d
                action_source: values.adsets[i].action_source || "",
                custom_event_type: values.adsets[i].custom_event_type || "",
                pixel_id: values.pixel_id,
                bid_amount: values.adsets[i].bid_amount ? parseFloat(values.adsets[i].bid_amount) * 100 : 0,
                countries: values.adsets[i].countries || "",
                Min_Age: values.adsets[i].Min_Age || "",
                Max_Age: values.adsets[i].Max_Age || "",
                Gender: parseInt(values.adsets[i].Gender) || 0,
                locales: values.adsets[i].Language || [6],
                placements: values.adsets[i].placements || "Advance",
                ...(values.adsets[i].placements !== 'Advance' && {
                    publisher_platforms: values.adsets[i].platforms,
                    Facebook_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Facebook') || [],
                    instagram_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Instagram') || [],
                    audience_network_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Audience') || [],
                    messenger_positions: extractValuesByPartialLabel(selectedPositions[adsets[i].id], 'Messenger') || [],
                    position: values.adsets[i].positions,
                    device_platforms: values.adsets[i].device_platforms,
                }),
                buying_type: "AUCTION",
                addlevel:addLevelData || []
            }
            AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
        };
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
                ...(Object.keys(selectedRef.current).length > 0 ? selectedRef.current : {}),
                camapaignlevel: {
                    createdby: session?.user?.name,
                    Name: values.Name,
                    Objectives: values.Objectives,
                    Special_categories: values.Special_categories,
                    Bid_strategy: values.Bid_strategy,
                    Daily_amount: parseFloat(values.Daily_amount) * 100,
                    Status: values.Status,
                    access_token: imagehash.token,
                    createdDate: moment().tz(imagehash.timeZone).format('YYYY-MM-DD')
                },
                adsetlevel: {
                    AdsetName: values.AdsetName,
                    Daily_amount: values.DailyAdd_amount ? parseFloat(values.DailyAdd_amount) * 100 : "",
                    optimization_goal: values.optimization_goal,
                    billing_event: values.billing_event,
                    start_time: moment(values.DatePicker.$d).tz(imagehash.timeZone).format("YYYY-MM-DDTHH:mm:ssZ"),
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
                    ...(values.placements !== 'Advance' && {
                        publisher_platforms: values.publisher_platforms,
                        Facebook_positions: extractValuesByPartialLabel(selectedPositions, 'Facebook') || [],
                        instagram_positions: extractValuesByPartialLabel(selectedPositions, 'Instagram') || [],
                        audience_network_positions: extractValuesByPartialLabel(selectedPositions, 'Audience') || [],
                        messenger_positions: extractValuesByPartialLabel(selectedPositions, 'Messenger') || [],
                        position: values.positions,
                        device_platforms: values.device_platforms,
                    }),
                    buying_type: "AUCTION",
                },
                addlevel: addLevelData
            };

            // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Facebook'));

            // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Instagram'));

            // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Messenger'));

            // console.log("Data to Submit:", extractValuesByPartialLabel(selectedPositions, 'Audience'));

            // console.log("selectedPositions:", selectedPositions);

            console.log("Final Data to Submit:", data1);
            // https://www.testapi.adsgoat.in
            const response = await fetch('https://www.testapi.adsgoat.in/api/submitFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                },
                body: JSON.stringify(data1)
            });

            if (response.ok) {
                console.log('Form data submitted successfully');
                setSelectedFilesFromCreatives({});
                setSelectedFilesFromMedia({});
                setSelectedFiles({});
                onClose();
                setSelectedPositions({});
                isManual !== "manual" && setIsManual(false);
                newSelectedRef.current = null; // Reset the newSelectedRef 
            } else {
                console.error('Failed to submit form data');
            }
        } catch (error) {
            console.error('Error submitting form data:', error);
        } finally {
            setLoading(false); // Stop the spinner after the process is complete
        }

    };

    console.log("test:");

    const handleChange = (info) => {
        const newFiles = info.fileList.map(file => ({
          ...file,
          uid: file.uid || `-${Date.now()}`,
          source: "media",
        }));
      
        setSelectedFiles(prev => {
          const existingUids = new Set(prev.map(f => f.uid));
          const filteredNewFiles = newFiles.filter(f => !existingUids.has(f.uid));
          return [...prev, ...filteredNewFiles];
        });
      
        // 👇 Update selectedFilesFromMedia — preserve + append
        setSelectedFilesFromMedia(prev => {
          const existingUids = new Set(prev.map(f => f.uid));
          const filteredNewFiles = newFiles.filter(f => !existingUids.has(f.uid));
          return [...prev, ...filteredNewFiles];
        });
      };

    const currentDate = dayjs();
    console.log(moment(), "currentDate")
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
        adsets: [getDefaultAdset(campaignName, caption, websiteURL, imagehash, currentDate)]  // 🔁 only one initial adset
    };

    useEffect(() => {
        // Update the form fields when accountis changes
        form.setFieldsValue({ Account_Number: accountis });
    }, [accountis, form]);


    const handleDrawerClose = () => {
        form.resetFields();          // Reset form fields to their initialValues
        setWebsiteURL('');           // Clear website URL
        setSelectedFiles({});        // Clear selected files
        setCampaignName('');         // Clear campaign name
        setPrimaryText('');          // Clear primary text field
        setCaption('');              // Clear caption field
        setHeadline('');             // Clear headline field
        setDescription('');          // Clear description field
        setSelectedPublishers({});   // Clear selected publishers
        setSelectedPositions({});    // Clear selected positions
        setIsFormComplete(false);    // Reset form completion state
        setCampaignName('');
        setAddName('');
        setCampaignLevelDailyBudget(0); // Reset campaign level daily budget
        setAdsetLevelDailyBudget(0);
        // setCampaignLevelDailyBudget(0);
        setAdsets([{ id: uuidv4(), DailyAdd_amount: 0, AdsetPanelName:"Adset 1" }]);
        onClose(); // Call onClose handler to close the drawer
        setActiveKey(['1']);
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
    }

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
          status: 'done',
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
        const currentMediaContent = form.getFieldValue(['adsets', creativeIndex, 'MediaContent']) || [];
        const updatedMediaContent = [...currentMediaContent, ...mappedFiles];
      
        form.setFieldsValue({
          adsets: {
            [creativeIndex]: {
              MediaContent: updatedMediaContent
            }
          }
        });
      
        form.validateFields([['adsets', creativeIndex, 'MediaContent']]);
    };

    console.log("Selected Files:", selectedFiles);

    const handleRemoveFile = (uidToRemove) => {
        setSelectedFilesFromCreatives(prev =>
            prev.filter(file => file.uid !== uidToRemove)
        );
        setSelectedFiles(prev =>
            prev.filter(file => file.uid !== uidToRemove)
        );
    };

    const handleRemove = (fileToRemove) => {
        setSelectedFilesFromMedia(prev => prev.filter(file => file.uid !== fileToRemove.uid));
        setSelectedFiles(prev =>
          prev.filter(file => file.uid !== fileToRemove.uid)
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

    const setFormValuesFromDraft = (draft) => {
    if (!draft) return;

    // 1. Extract adsetlevel_* blocks
    const adsetKeys = Object.keys(draft).filter((key) => key.startsWith("adsetlevel_"));
    const adsetObjects = adsetKeys.map((key) => draft[key]);

    // 2. Update adsets state based on adsetlevel_* count
    setAdsets(
        adsetObjects.map((adsetObj, index) => ({
        id: adsetObj.id ?? uuidv4(),
        AdsetPanelName: `Adset ${index + 1}`,
        DailyAdd_amount: adsetObj.Daily_amount ? adsetObj.Daily_amount / 100 : 0,
        }))
    );

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
        Caption: adsetObj.addlevel?.Caption,
        Website_URL: adsetObj.addlevel?.Website_URL,
        MediaContent: adsetObj.addlevel?.Ads || [],
    }));

    // 4. Update the form fields
    form.setFieldsValue({
        adsets: updatedFormAdsets,
        Name: draft?.camapaignlevel?.Name,
        Objectives: draft?.camapaignlevel?.Objectives,
        Special_categories: draft?.camapaignlevel?.Special_categories,
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
          status: 'done',
          type: file?.endsWith('.jpg')
            ? 'image/jpg'
            : file?.endsWith('.jpeg')
            ? 'image/jpeg'
            : file?.endsWith('.png')
            ? 'image/png'
            : 'video/',
          url: file,
    }));

    adsetObjects.forEach((adsetObj) => {
        const uuid = adsetObj.id ?? uuidv4();

        updatedSelectedFiles[uuid] = adsetObj.addlevel?.Ads ? mapped(adsetObj.addlevel?.Ads) : [];
        updatedSelectedCreatives[uuid] = adsetObj.addlevel?.Ads ? mapped(adsetObj.addlevel?.Ads) : [];
        updatedSelectedPositions[uuid] = getPositionsByKeys(adsetObj.position || []);
        updatedSelectedPublishers[uuid] = adsetObj.publisher_platforms || [];
    });

    setSelectedFiles(updatedSelectedFiles);
    setSelectedFilesFromCreatives(updatedSelectedCreatives);
    setSelectedPositions(updatedSelectedPositions);
    setSelectedPublishers(updatedSelectedPublishers);

    setIsManual(draft?.adsetObjects?.[0]?.placements === "manual" ? "manual" : false);
    setAddName(adsetObjects[0]?.addlevel?.AddName || "");
    setSelectedOption(adsetObjects[0]?.addlevel?.Ads?.length > 0 ? "creative" : "upload");

    if (draft?.adsetObjects?.[0]?.Daily_amount) {
        setAdsetLevelDailyBudget(draft.adsetObjects[0].Daily_amount / 100);
    }

    setShowBidAmount(draft?.camapaignlevel?.Bid_strategy !== "LOWEST_COST_WITHOUT_CAP");
    setSubmitErrors([]);

    // 6. Final form completeness check
    const checkFormCompletion = () => {
        const allValues = form.getFieldsValue(true);
        const isComplete = Object.keys(allValues).every(
        key => allValues[key] !== undefined && allValues[key] !== ''
        );
        setIsFormComplete(isComplete);
    };

    checkFormCompletion();
    };

      
      

    const onChangeDraft = (value) => {
        const draft = draftsData.find(draft => draft.id === value);
        console.log("Selected Draft:", value);
        console.log("Drafts Data:", draftsData.find(draft => draft.id === value));
        setFormValuesFromDraft(draftsData.find(draft => draft.id === value));
        selectedRef.current = {Draft_Name: draft?.Draft_Name, Draft_Id: draft?.id};
        newSelectedRef.current = draft?.Draft_Name;
        setWebsiteURL("");
        setCaption("");
    }

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Create a new campaign</span>
                    <Select value={newSelectedRef.current} placeholder="Select Draft" style={{ width: 150 }} onChange={onChangeDraft}
                                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
                        {/* {draftsData.map((draft) => (
                            <Select.Option value={draft.id}>{draft.Draft_Name}</Select.Option>
                        ))} */}
                        {Array.isArray(draftsData) && draftsData.map((draft) => (
                        <Select.Option key={draft.id} value={draft.id}>
                            {draft.Draft_Name}
                        </Select.Option>
                        ))}

                        {/* <Select.Option value="creative">Creative</Select.Option>
                        <Select.Option value="video">Video</Select.Option> */}
                    </Select>
                </div>
            }
            width="100%"
            open={visible}
            onClose={handleDrawerClose}
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
        >

            <Spin spinning={loading}>
                <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues} className={theme === 'dark' ? 'form-dark' : 'form-light'}>
                    <Collapse accordion activeKey={activeKey} // Bind active key state
                        onChange={(key) => setActiveKey([key])}  className={theme === 'dark' ? 'custom-collapse-dark' : 'custom-collapse-light'} >
                        <Panel header="CAMPAIGN LEVEL" key="1" style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
                            <div style={{ display: "flex", backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000'}}>
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
                                    <Input value={accountNumber} onChange={Accountchange}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
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
                                        style={{ width: "100%", marginLeft: "3%" }}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                                        // onChange={getpixelandpageid}
                                        variant="filled"
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads" },
                                            { value: "OUTCOME_SALES", label: "Sales" },
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App promotion" }

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                            { value: "FINANCIAL_PRODUCTS_SERVICES", label: "Credit" },
                                            { value: "EMPLOYMENT", label: "Employment" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
                                            { value: "NONE", label: "None" }

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme-category' : 'light-theme'}
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
                                            { value: "COST_CAP", label: "Cost per Result Goal" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" }
                                        ]}
                                        onChange={handleBidStrategyChange}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
      <Tooltip title={isAnyAdsetBudgetSet ? 'You have enabled daily budget in the Adset Level' : ''}>
                    <Form.Item
                        name="Daily_amount"
                        label="Campaign Daily Budget"
                        rules={[
                            {
                                required: !(isAnyAdsetBudgetSet || campaignLevelDailyBudget > 0),
                                message: "Please enter a valid daily budget for the Campaign"
                            }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            placeholder="$"
                            value={campaignLevelDailyBudget}
                            onChange={value => {
                                setCampaignLevelDailyBudget(value);
                                setIsCampaignBudgetActive(value > 0);
                            }}
                            readOnly={isAnyAdsetBudgetSet} // Make campaign budget read-only if any adset has a budget
                            style={{ width: 200 }}
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
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "ACTIVE", label: "ACTIVE" },
                                            { value: "PAUSED", label: "PAUSED" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                            return(<AdsetComponent setSelectedPublishers={setSelectedPublishers} selectedPublishers={selectedPublishers} selectedPositions={selectedPositions} setSelectedPositions={setSelectedPositions} form={form} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} selectedFilesFromMedia={selectedFilesFromMedia} selectedFilesFromCreatives={selectedFilesFromCreatives} setSelectedFilesFromMedia={setSelectedFilesFromMedia} setSelectedFilesFromCreatives={setSelectedFilesFromCreatives} isCampaignBudgetActive={isCampaignBudgetActive} handleAdsetChange={handleAdsetChange} showBidAmount={showBidAmount} index={index} adset={adset} localesdata={localesdata} addAdset={addAdset} cloneAdset={cloneAdset} removeAdset={removeAdset} handleFieldChange={handleFieldChange} network={network} accountis={accountis} />)
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
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
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
<Button
  type="primary"
  style={{ background: '#21c55d', minWidth: '200px', borderWidth: '0px' }}
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
      setIsCreateCampaignorDraft("createcampaign");

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
</Button>

<Popconfirm
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
      <Button type="primary" style={{ background: '#11dd44', minWidth: '100px', borderWidth: '0px', marginLeft: '10px' }} onClick={() => setOpen(true)}>
        Draft
      </Button>
    </Popconfirm>

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
                                initialImage={currentFile?.originFileObj ? URL.createObjectURL(currentFile.originFileObj) : currentFile?.url}
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
                        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}>
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
                    style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                >
                    <ImageUploadPage selectedFilesData={selectedFilesData} fromCampaigns={true} network={network} Account_Number={accountis} />
                </Drawer>
            )}
        </Drawer>
    );
};

export default CreateCampaignDrawer;
