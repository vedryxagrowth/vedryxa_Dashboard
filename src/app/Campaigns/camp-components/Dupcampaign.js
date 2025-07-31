"use client"
import React from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Badge, Tooltip, Skeleton, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined, QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef, useEffect } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
const FabricCanvas = dynamic(() => import('./Fabricanvas'), { ssr: false });
import MnetUrlBuilder from './urlbuilder/mnet';
import TonicUrlBuilder from './urlbuilder/tonic';
import System1UrlBuilder from './urlbuilder/system1';
import DActiveUrlBuilder from './urlbuilder/dactive';
import ImageUploadPage from '../../Creatives/page';
import { useTokenContext } from "../../components/parent";

const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;
const publisherOptions = [
    { label: 'Facebook', value: 'facebook',title:"" },
    { label: 'Instagram', value: 'instagram',title:"" },
    { label: 'Messenger', value: 'messenger',title:"" },
    { label: 'Audience Network', value: 'audience_network',title:"" }
];
const positionOptions = {
    facebook: [
        { key: "feed", label: "Facebook Feed",title:"" },
        { key: "marketplace", label: "Facebook Marketplace",title:"" },
        { key: "video_feeds", label: "Facebook Video Feeds" ,title:""},
        { key: "instream_video", label: "Facebook In-Stream Videos",title:"" },
        { key: "facebook_reels", label: "Facebook Reels",title:"" },
        { key: "profile_feed-f", label: "Facebook Profile Feed",title:"" },
        { key: "search", label: "Facebook Search",title:"" },
        { key: "story_f", label: "Facebook Stories",title:"" },
        { key: "right_hand_column", label: "Facebook Right Column",title:"" },
        { key: "instant_article", label: "Facebook Instant Articles" ,title:""},
        { key: "biz_disco_feed", label: "Facebook Business Explore",title:"" } // Added Business Explore
    ],
    instagram: [
        { key: "stream", label: "Instagram Stream",title:"" },
        { key: "story_i", label: "Instagram Stories",title:"" },
        { key: "explore", label: "Instagram Explore" ,title:""},
        { key: "explore_home", label: "Instagram Explore Home",title:"" },
        { key: "reels", label: "Instagram Reels",title:"" },
        { key: "profile_feed-i", label: "Instagram Profile Feed",title:"" },
        { key: "ig_search", label: "Instagram Search",title:"" },
        { key: "profile_reels", label: "Instagram Profile Reels",title:"" }
    ],
    messenger: [
        { key: "messenger_home", label: "Messenger Home",title:"" },
        { key: "story_m", label: "Messenger Stories" ,title:""},
        { key: "sponsored_messages", label: "Messenger Sponsored Messages",title:"" },
        // { key: "messenger_inbox", label: "Messenger Inbox" }
    ],
    audience_network: [
        { key: "classic", label: "Audience Network Classic",title:"" },
        { key: "rewarded_video", label: "Audience Network Rewarded Video",title:"" },
        // { key: "instream_video", label: "Audience Network In-Stream Video" }
    ]
};

const allPositions = [
    { key: "feed", label: "Facebook Feed" ,title:""},
    { key: "marketplace", label: "Facebook Marketplace",title:"" },
    { key: "video_feeds", label: "Facebook Video Feeds" ,title:""},
    { key: "instream_video", label: "Facebook In-Stream Videos",title:"" },
    { key: "facebook_reels", label: "Facebook Reels" ,title:""},
    { key: "profile_feed-f", label: "Facebook Profile Feed",title:"" },
    { key: "search", label: "Facebook Search",title:"" },
    { key: "story_f", label: "Facebook Stories",title:"" },
    { key: "right_hand_column", label: "Facebook Right Column" ,title:""},
    { key: "instant_article", label: "Facebook Instant Articles",title:"" },
    { key: "biz_disco_feed", label: "Facebook Business Explore",title:"" },
  
    { key: "stream", label: "Instagram Stream",title:"" },
    { key: "story_i", label: "Instagram Stories",title:"" },
    { key: "explore", label: "Instagram Explore",title:"" },
    { key: "explore_home", label: "Instagram Explore Home",title:"" },
    { key: "reels", label: "Instagram Reels",title:"" },
    { key: "profile_feed-i", label: "Instagram Profile Feed" ,title:""},
    { key: "ig_search", label: "Instagram Search",title:"" },
    { key: "profile_reels", label: "Instagram Profile Reels" ,title:""},
  
    { key: "messenger_home", label: "Messenger Home",title:"" },
    { key: "story_m", label: "Messenger Stories",title:"" },
    { key: "sponsored_messages", label: "Messenger Sponsored Messages",title:"" },
  
    { key: "classic", label: "Audience Network Classic",title:"" },
    { key: "rewarded_video", label: "Audience Network Rewarded Video" ,title:""}
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
//         { key: "right_column", label: "Facebook Right Column" },
//         { key: "instant_articles", label: "Facebook Instant Articles" },
//         { key: "business_explore", label: "Facebook Business Explore" } // Added Business Explore
//     ],
//     instagram: [
//         { key: "stream", label: "Instagram Stream" },
//         { key: "story_in", label: "Instagram Stories" },
//         { key: "explore", label: "Instagram Explore" },
//         { key: "explore_home", label: "Instagram Explore Home" },
//         { key: "reels", label: "Instagram Reels" },
//         { key: "profile_feed_in", label: "Instagram Profile Feed" },
//         { key: "ig_search", label: "Instagram Search" },
//         { key: "profile_reels", label: "Instagram Profile Reels" }
//     ],
//     messenger: [
//         { key: "messenger_home", label: "Messenger Home" },
//         { key: "story_ms", label: "Messenger Stories" },
//         { key: "sponsored_messages", label: "Messenger Sponsored Messages" },
//         { key: "messenger_inbox", label: "Messenger Inbox" }
//     ],
//     audience_network: [
//         { key: "classic", label: "Audience Network Classic" },
//         { key: "rewarded_video", label: "Audience Network Rewarded Video" },
//         { key: "in_stream", label: "Audience Network In-Stream Video" }
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

const DuplicateCampaignDrawer = ({ visible, onClose, selectedRow, changeRRefrst, network }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    // console.log("heyy", formValues?.Account_Number)
    // const [accountNumber, setAccountNumber] = useState('');
    const [imagehash, setimagehash] = useState(null)
    const [filesof, setfilesof] = useState(null)
    const [pixelids, setpixelid] = useState(null)
    const [pageid, setpageid] = useState(null)
    const { data: session } = useSession();
    const [DuplicatedampaignData, setDuplicatedampaignData] = useState(null);
    // console.log(DuplicatedampaignData, "DuplicatedampaignData in clone")
    const [defaultURlBuilder, setDefaultURLBuilder] = useState("");
    var token = localStorage.getItem("token")
    const [showBidAmount, setShowBidAmount] = useState(false);
    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [addName, setAddName] = useState('');
    const [primaryText, setPrimaryText] = useState('');
    const [caption, setCaption] = useState('');
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [websiteURL, setWebsiteURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [currentFile, setCurrentFile] = useState(null); // File to be edited
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);
    const [editedImages, setEditedImages] = useState({});
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    const [campaignLevelDailyBudget, setCampaignLevelDailyBudget] = useState(0);
    const [adsetLevelDailyBudget, setAdsetLevelDailyBudget] = useState(0);
    const [defaultImages, setDefaultImages] = useState([]);
    const [selectedOption, setSelectedOption] = useState("creative");
    const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState([]);
    const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState([]);
    const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
    const [submitErrors, setSubmitErrors] = useState([]);

    const { theme } = useTokenContext();

    useEffect(() => {
        if (visible) {
            form.resetFields();          // Reset form fields to their initialValues
            setWebsiteURL('');           // Clear website URL
            setSelectedFiles([]);        // Clear selected files
            setCampaignName('');         // Clear campaign name
            setPrimaryText('');          // Clear primary text field
            setCaption('');              // Clear caption field
            setHeadline('');             // Clear headline field
            setDescription('');          // Clear description field
            setSelectedPublishers([]);   // Clear selected publishers
            setSelectedPositions([]);    // Clear selected positions
            setIsFormComplete(false);    // Reset form completion state
            setCampaignName('');
            setAddName('');
            setCampaignLevelDailyBudget(0);
            setAdsetLevelDailyBudget(0);
        }
    }, [visible]);

    const onClickCreativesDrawer = () => {
        console.log("Creatives Drawer Opened");
        setOpenCreativesDrawer(true);
    }

    const selectedFilesData = (data) => {
        console.log("Selected Files Data:", data);
        setSelectedFiles(prev => [...prev, ...data.map((file, index)=>{
            return({
                uid: file.uid || `-${index+1}`,
                name: file?.name,
                status: 'done',
                type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
                url: file?.url,
            })
        })]);
        setSelectedFilesFromCreatives(prev => [...prev, ...data.map((file, index)=>{
            return({
                uid: file.uid || `-${index+1}`,
                name: file?.name,
                status: 'done',
                type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
                url: file?.url,
            })
        })]);
        setOpenCreativesDrawer(false);
        
        if (data.length > 0) {
            const currentMediaContent = form.getFieldValue("MediaContent") || [];
        
            const newFiles = data.map((file, index) => ({
                uid: file.uid || `-${index + 1}`,
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
        
            const updatedMediaContent = [...currentMediaContent, ...newFiles];
        
            form.setFieldsValue({ MediaContent: updatedMediaContent });
            form.validateFields(["MediaContent"]);
        }
    }


    const handleEditClick = (file) => {
        setCurrentFile(file); // Set the file to be edited
        setIsImgEditorShown(true); // Open the image editor
    };
    const handleSaveEditedImage = (fileId, editedImageObject) => {
        setEditedImages(prev => ({
            ...prev,
            [fileId]: editedImageObject.imageBase64 || editedImageObject.imageUrl
        }));
        console.log(fileId);
        console.log(editedImageObject);
        closeCanvasModal();
    };

    const closeCanvasModal = () => {
        setIsImgEditorShown(false); // Close the image editor
    };
    const onReturnUrl = (text) => {
        setIsModalVisibleForURLBuilder(false);
        setWebsiteURL(text);
        if (network === "FB_Mnet" || network === "FB_DomainActive") {
            setCaption(text.split('//')[1].split("/")[0]);

        } else {
            setCaption(text.split('/')[0]);

        }
        // console.log(text, "text");
    }

    const onChangeCampaignLevelDailyBudget = (event) => {
        const value = event.target.value;
    
        // Allow empty input and prevent NaN issues
        if (value === "" || value === ".") {
            setCampaignLevelDailyBudget(value); // Allow typing "."
            return;
        }
    
        // Convert to float and update state
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
            setCampaignLevelDailyBudget(floatValue);
        }
        
        form.setFieldsValue({ Daily_amount: floatValue }); // Update form state
    
        // console.log("Updated Value:", floatValue);
    };

    const onChangeAdsetLevelDailyBudget = (event) => {
        const value = event.target.value;
    
        // Allow empty input and prevent NaN issues
        if (value === "" || value === ".") {
            setAdsetLevelDailyBudget(value); // Allow typing "."
            return;
        }
    
        // Convert to float and update state
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
            setAdsetLevelDailyBudget(floatValue);
        }
        
        form.setFieldsValue({ DailyAdd_amount: floatValue }); // Update form state
    
        // console.log("Updated Value:", floatValue);
        // setAdsetLevelDailyBudget(parseFloat(event.target.value));
    }


    const getUrlBuilder = (network) => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder defaultValues={defaultURlBuilder} onReturnMessage={onReturnUrl} /> //hi
            case 'FB_Tonic1':
                return <TonicUrlBuilder defaultValues={defaultURlBuilder} onReturnMessage={onReturnUrl} />
            case 'FB_System1':
                return <System1UrlBuilder defaultValues={defaultURlBuilder} onReturnMessage={onReturnUrl} />
            case 'FB_DomainActive':
                return <DActiveUrlBuilder defaultValues={defaultURlBuilder} onReturnMessage={onReturnUrl} />
        }
    }



    // const [imageHashes, setImageHashes] = useState([]);

    const onClickEdit = () => {
        setIsModalVisibleForURLBuilder(true);
    };

    const handleCancelForURLBuilder = () => {
        setIsModalVisibleForURLBuilder(false);
    };

    const handleModeChange = (value) => {
        setIsManual(value === "manual");
    };


    useEffect(() => {
        if (DuplicatedampaignData) {
            setSelectedPublishers(DuplicatedampaignData?.adsetlevel?.publisher_platforms || []);
            setSelectedPositions(DuplicatedampaignData?.adsetlevel?.position || ["feed"]);
            setAdsetLevelDailyBudget(DuplicatedampaignData?.adsetlevel?.Daily_amount ? (DuplicatedampaignData?.adsetlevel?.Daily_amount) / 100 : 0);
            setCampaignLevelDailyBudget((DuplicatedampaignData?.camapaignlevel?.Daily_amount) / 100);
            setDefaultURLBuilder(DuplicatedampaignData?.addlevel[0]?.Website_URL);
            DuplicatedampaignData?.adsetlevel?.placements === "manual" ? setIsManual("manual") : setIsManual(false);
            setSelectedFiles(DuplicatedampaignData?.addlevel?.map((file, index)=>{
                return({
                    uid: `-${index+1}`,
                    name: file?.filename,
                    status: 'done',
                    type: `${file?.filename?.endsWith(".jpg") || file?.filename?.endsWith(".png") ? file?.filename?.endsWith(".jpg") ? "image/jpg" : "image/png" : "video/"}`,
                    url: file?.filename,
                })
            }));
            setSelectedFilesFromCreatives(DuplicatedampaignData?.addlevel?.map((file, index)=>{
                return({
                    uid: `-${index+1}`,
                    name: file?.filename,
                    status: 'done',
                    type: `${file?.filename?.endsWith(".jpg") || file?.filename?.endsWith(".png") ? file?.filename?.endsWith(".jpg") ? "image/jpg" : "image/png" : "video/"}`,
                    url: file?.filename,
                })
            }));

            setSelectedPositions(getPositionsByKeys(DuplicatedampaignData?.adsetlevel?.position || []));

            setCampaignName(`${DuplicatedampaignData?.camapaignlevel?.Name || ""}_Copy`);

            
            // form.setFieldsValue({
            //     MediaContent: fileList, // Ensure the selected files are added to the form value
            //   });
            
            // setCaption(DuplicatedampaignData?.addlevel[0]?.Caption);
            // setPrimaryText(DuplicatedampaignData?.addlevel[0]?.message);
            // setDescription(DuplicatedampaignData?.addlevel[0]?.Description);
            // setHeadline(DuplicatedampaignData?.addlevel[0]?.headline);
            console.log(DuplicatedampaignData?.adsetlevel?.placements);
            form.setFieldsValue({
                positions: DuplicatedampaignData?.adsetlevel?.position || ["feed"],
                Account_Number: DuplicatedampaignData?.Account_Number,
                // createdby:DuplicatedampaignData?.camapaignlevel?.createdby,
                // Name: DuplicatedampaignData?.camapaignlevel?.Name,
                Objectives: DuplicatedampaignData?.camapaignlevel?.Objectives,
                Special_categories: DuplicatedampaignData?.camapaignlevel?.Special_categories,
                Bid_strategy: DuplicatedampaignData?.camapaignlevel?.Bid_strategy,
                Daily_amount: (DuplicatedampaignData?.camapaignlevel?.Daily_amount) / 100,
                Status: DuplicatedampaignData?.camapaignlevel?.Status,
                // AdsetName: DuplicatedampaignData?.adsetlevel?.AdsetName,
                DailyAdd_amount: DuplicatedampaignData?.adsetlevel?.Daily_amount ? (DuplicatedampaignData?.adsetlevel?.Daily_amount) / 100 : 0,
                optimization_goal: DuplicatedampaignData?.adsetlevel?.optimization_goal,
                billing_event: DuplicatedampaignData?.adsetlevel?.billing_event,
                // start_time: DuplicatedampaignData?.adsetlevel?.start_time,
                action_source: DuplicatedampaignData?.adsetlevel?.action_source,
                custom_event_type: DuplicatedampaignData?.adsetlevel?.custom_event_type,
                pixel_id: DuplicatedampaignData?.adsetlevel?.pixel_id,
                bid_amount: (DuplicatedampaignData?.adsetlevel?.bid_amount) / 100,
                countries: DuplicatedampaignData?.adsetlevel?.countries,
                Min_Age: DuplicatedampaignData?.adsetlevel?.Min_Age,
                Max_Age: DuplicatedampaignData?.adsetlevel?.Max_Age,
                Gender: DuplicatedampaignData?.adsetlevel?.Gender,
                publisher_platforms: DuplicatedampaignData?.adsetlevel?.publisher_platforms ? DuplicatedampaignData?.adsetlevel?.publisher_platforms : "",
                device_platforms: DuplicatedampaignData?.adsetlevel?.device_platforms ? DuplicatedampaignData?.adsetlevel?.device_platforms : "",
                Language: DuplicatedampaignData?.adsetlevel?.locales,
                placements: DuplicatedampaignData?.adsetlevel?.placements,
                // Facebook_positions: DuplicatedampaignData?.adsetlevel?.Facebook_positions,
                // buying_type: DuplicatedampaignData?.adsetlevel?.buying_type,
                // AddName: DuplicatedampaignData?.addlevel[0]?.AddName,
                filename: DuplicatedampaignData?.addlevel[0]?.filename,
                page_id: DuplicatedampaignData?.addlevel[0]?.page_id,
                message: DuplicatedampaignData?.addlevel[0]?.message,
                headline: DuplicatedampaignData?.addlevel[0]?.headline,
                Description: "Find More",
                Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
                Website_URL: DuplicatedampaignData?.addlevel[0]?.Website_URL,
                Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
                pixel_id: DuplicatedampaignData?.addlevel[0]?.pixel_id,
                page_id: DuplicatedampaignData?.addlevel[0]?.page_id,
                MediaContent: (DuplicatedampaignData?.addlevel?.map((file, index)=>{
                    return({
                        uid: `-${index+1}`,
                        name: file?.filename,
                        status: 'done',
                        url: file?.filename,
                    })
                }))
            });
        }
    }, [DuplicatedampaignData, form]);

    useEffect(() => {
        // Update the form field value for Website_URL whenever websiteURL changes
        form.setFieldsValue({ Name: campaignName, AdsetName: campaignName, AddName: campaignName });

        // Check if all required fields are complete
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
        
            // If manualStatus is false, we ignore 'publisher_platforms' and 'device_platforms'
            const fieldsToSkip = isManual === false ? ['publisher_platforms', 'device_platforms'] : [];
        
            // Find the keys of the form items that are empty, except the ones to skip
            const emptyFields = Object.keys(allValues).filter(
                key => !fieldsToSkip.includes(key) && (allValues[key] === undefined || allValues[key] === '')
            );
        
            // Log the empty fields
            if (emptyFields.length > 0) {
                console.log('Empty fields:', emptyFields);
            } else {
                console.log('All fields are complete');
            }
            
            // Check if all form fields are filled, considering the skipped fields
            const isComplete = emptyFields.length === 0;
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();

    }, [campaignName, form]);



    const handlePublisherChange = (value) => {
        setSelectedPublishers(value);
        // setSelectedPositions(["feed"]); // Set default positions to "feed"
        // form.resetFields(['positions']); // Reset positions field
    };

    const handlePositionChange = (values, options) => {
        // console.log(values, "values");
        // console.log(options, "options");
        const formatted = options.map(opt => ({
          value: opt.value,
          label: opt.label || opt.children
        }));
        setSelectedPositions(formatted);
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
    console.log(selectedRow, "selectedRow")



    useEffect(() => {
        const fetchData = async () => {
            try {
                if (selectedRow) {
                    const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${selectedRow.identifier}`,
                        {
                            headers: {
                                Authorization: token,
                            }
                        }
                    );
                    console.log("hello viewdata", ...response.data);
                    setDuplicatedampaignData(response?.data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign list:", error);
            }
        };

        fetchData();
    }, [selectedRow]);

    const fetchAccountDetails = async () => {
        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${selectedRow?.Account_Number}`,
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

    useEffect(() => {
        if (selectedRow && visible) {
            fetchAccountDetails();
        }
    }, [selectedRow, visible]);

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

    const handleBidStrategyChange = (value) => {
        // Show bid_amount if the selected bid strategy is "Bid Cap", otherwise hide it
        // setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP");
        setShowBidAmount(value === "LOWEST_COST_WITH_BID_CAP" || value === "COST_CAP");
        // setShowBidAmount(["LOWEST_COST_WITH_BID_CAP", "COST_CAP"].includes(value));
    };
    // const Accountchange = (e) => {
    //     setAccountNumber(e.target.value);
    // };
    // const handlepositionChange = async (values) => {
    //     console.log(values, "handlepositionChange")
    // }
    const handleNameChange = async (e) => {
        const newName = e.target.value;
        setCampaignName(newName);
        

        // console.log("Account Number:", accountNumber);

        // try {
        //     const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${selectedRow?.Account_Number}`,
        //         {
        //             headers: {
        //                 'Authorization': token
        //             }
        //         }
        //     );
        //     console.log("siddu account data", response.data);
        //     setimagehash(...response?.data)
        // } catch (error) {
        //     console.error("Error fetching campaign data:", error);
        //     // Handle error
        // }
    };

    const getpixelandpageid = async () => {
        try {
            // Make the GET request to the Facebook Graph API
            const Pixeldata = await axios.get(
                `https://graph.facebook.com/v20.0/act_${imagehash.accountNumber}/adspixels`,
                {
                    params: {
                        fields: 'id,name',
                        access_token: imagehash?.token
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
                `https://graph.facebook.com/v20.0/act_${imagehash.accountNumber}/adcreatives`,
                {
                    params: {
                        fields: 'object_story_spec{page_id}',
                        access_token: imagehash?.token,
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

    const customRequest = async (onSuccess, onError) => {
        if (!imagehash || imagehash.length === 0) {
            onError("Image hash data not loaded");
            return [];
        }
        const token = imagehash.token;
        const account = imagehash.accountNumber;

        const uploadFilesSequentially = async (selectedFiles) => {
            const mediaHashArray = [];
        
            for (const file of selectedFiles) {
                try {
                    const fileType = file.type;
                    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
                        onError("Unsupported file type");
                        continue;
                    }
        
                    if (file?.url) {
                        if (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") || file?.url?.endsWith('.mp4')) {
                            const formData = new FormData();
                            const response = await fetch(`https://prodapis.adsgoat.in/s3?s3Url=${file.url}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: localStorage.getItem("token"),
                                },
                            });
        
                            const uploadFile = await response.blob();
                            if (!(uploadFile instanceof Blob)) {
                                console.error("The fetched file is not a Blob:", uploadFile);
                                continue;
                            }
        
                            formData.append("file", uploadFile, file.name);
                            // console.log(formData);
        
                            let fbResponse;
                            if (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") ) {
                                formData.append('file', uploadFile, file.name);
                                formData.append('access_token', token);
                                const fileName = file.name.split('/').pop();
        
                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${account}/adimages`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                );
                                
        
                                if (fbResponse.status === 200) {
                                    onSuccess("ok", response);
                                    mediaHashArray.push({
                                        filename: file?.url,
                                        imag_hash: fbResponse.data?.images?.[fileName]?.hash,
                                    });
                                } else {
                                    onError("error", response);
                                    console.error("Image upload failed");
                                }
                            } else if (file?.url?.endsWith('.mp4')) {
                                formData.append('access_token', token);
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
                                    // console.log(videoid);
                                    // console.log(uri);
        
                                    onSuccess("ok", fbResponse);
                                    mediaHashArray.push({
                                        filename: file?.url,
                                        videoid: videoid,
                                        thambnailurl: uri,
                                    });
                                } else {
                                    onError("error", fbResponse);
                                    console.error("Video upload to Facebook failed");
                                }
                            }
                        }
                    } else {
                        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                            const formData = new FormData();
                            const uniqueId = uuidv4(); // Generate a unique ID for the file
                            const fileId = `${uniqueId}_${file.name}`;
                            const editedImage = editedImages[file.name];
                            const uploadFile = editedImage ? await fetch(editedImage).then(res => res.blob()) : null;
        
                            console.log(file.originFileObj.name);
        
                            if (uploadFile) {
                                formData.append("file", uploadFile, `blob/${uniqueId}_${file.name}`);
                            } else {
                                formData.append("file", file.originFileObj, `blob/${uniqueId}_${file.originFileObj.name}`);
                            }
        
                            // console.log(formData);
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
        
                                // console.log("Custom API response imageUrl:", response);
                                formData.append('access_token', token);
        
                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${account}/adimages`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                );

                                // console.log("Facebook API response:", fbResponse.data);
        
                                if (response.status === 200 && fbResponse.status === 200) {
                                    onSuccess("ok", response);
                                    mediaHashArray.push({
                                        filename: response.data.imageUrl,
                                        imag_hash: fbResponse.data?.images?.[fileId]?.hash,
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
        
                                formData.append('access_token', token);
        
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
                                        filename: response.data.imageUrl,
                                        videoid: videoid,
                                        thambnailurl: uri,
                                    });
                                } else {
                                    onError("error", fbResponse);
                                    console.error("Video upload to Facebook failed");
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error uploading file:", error);
                    onError("error", error);
                }
            }
        
            // console.log("All media files uploaded successfully:", mediaHashArray);
            return mediaHashArray;
        };

        try {
            const mediaHashArray = uploadFilesSequentially(selectedFiles);
            console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
            return mediaHashArray;
        } catch (error) {
            console.error("One or more media uploads failed:", error);
            return [];
        }
    };
    // let s3UrlPath = "";
    // let hashid = "";
    // const customRequest = async (onSuccess, onError) => {
    //     if (!imagehash || imagehash.length === 0) {
    //         onError("Image hash data not loaded");
    //         return [];
    //     }

    //     const token = imagehash?.token;
    //     const account = imagehash?.accountNumber;

    //     // Create an array of upload promises
    //     const uploadPromises = selectedFiles.map(async (file) => {
    //         const formData = new FormData();
    //         formData.append("file", file);

    //         try {
    //             let response, fbResponse;

    //             if (file.type.startsWith('image/')) {
    //                 // Upload image
    //                 response = await axios.post("/api/uploadImage", formData, {
    //                     headers: { "Content-Type": "multipart/form-data" },
    //                 });

    //                 formData.append('filename', file.name);
    //                 formData.append('access_token', token);

    //                 fbResponse = await axios.post(`https://graph.facebook.com/v20.0/act_${account}/adimages`, formData, {
    //                     headers: { 'Content-Type': 'multipart/form-data' }
    //                 });

    //                 if (response.status === 200 && fbResponse.status === 200) {
    //                     onSuccess("ok", response);
    //                     return {
    //                         filename: response.data.imageUrl,
    //                         imag_hash: fbResponse.data?.images?.[file.name]?.hash,
    //                     };
    //                 } else {
    //                     onError("error", response);
    //                     throw new Error("Image upload failed");
    //                 }

    //             } else if (file.type.startsWith('video/')) {
    //                 // Upload video
    //                 response = await axios.post("https://www.testapi.adsgoat.in/upload", formData, {
    //                     headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
    //                 });

    //                 if (response.status !== 200) {
    //                     onError("error", response);
    //                     throw new Error("Video upload to custom API failed");
    //                 }

    //                 formData.append('access_token', token);

    //                 // Upload video to Facebook
    //                 fbResponse = await axios.post(`https://graph.facebook.com/v20.0/act_${account}/advideos`, formData, {
    //                     headers: { 'Content-Type': 'multipart/form-data' }
    //                 });

    //                 if (fbResponse.status === 200) {
    //                     const videoid = fbResponse?.data?.id;
    //                     await new Promise(resolve => setTimeout(resolve, 10000));

    //                     // Get thumbnail URL
    //                     const thumbnailResponse = await axios.get(`https://graph.facebook.com/v20.0/${videoid}`, {
    //                         params: {
    //                             access_token: token,
    //                             fields: 'thumbnails',
    //                             is_preferred: true
    //                         }
    //                     });

    //                     const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
    //                     const uri = preferredThumbnail ? preferredThumbnail.uri : "";

    //                     onSuccess("ok", fbResponse);

    //                     return {
    //                         filename: response.data.imageUrl,
    //                         videoid: videoid,
    //                         thambnailurl: uri,
    //                     };
    //                 } else {
    //                     onError("error", fbResponse);
    //                     throw new Error("Video upload to Facebook failed");
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error uploading file:", error);
    //             onError("error", error);
    //             throw error;
    //         }
    //     });

    //     try {
    //         const mediaHashArray = await Promise.all(uploadPromises);
    //         return mediaHashArray;
    //     } catch (error) {
    //         return [];
    //     }
    // };

    const handleBeforeUpload = (file) => {
        setfilesof(file);
        const formData = new FormData();
        formData.append("file", file);
        setimageshow(formData);
        // console.log(formData);
        // console.log(file);

        return false; // Prevent auto-upload
    };

    const handleOk = async () => {
        setLoading(true); // Start the spinner
        setIsModalVisible(false); // Close the modal

        if (formValues) {
            const onSuccess = (status, response) => {
                console.log("Upload success:", response);
            };

            const onError = (status, error) => {
                console.error("Upload error:", error);
            };

            try {
                const mediaHashArray = await customRequest(onSuccess, onError);
                // console.log(mediaHashArray, "mediaHashArray");

                if (mediaHashArray.length > 0) {
                    // Create addlevel objects based on uploaded media
                    const addLevelData = mediaHashArray.map((media, index) => {
                        if (media.imag_hash) {
                            return {
                                id: uuidv4(), // Unique ID for each ad
                                AddName: `${formValues.AddName}_${index + 1}`,
                                filename: media.filename,
                                imag_hash: media.imag_hash,
                                page_id: formValues.page_id,
                                message: formValues.message,
                                headline: formValues.headline,
                                Description: formValues.Description,
                                Caption: formValues.Caption,
                                Website_URL: formValues.Website_URL,
                                // urlParameters: formValues.urlParameters,
                            };
                        } else if (media.videoid) {
                            return {
                                id: uuidv4(), // Unique ID for each ad
                                AddName: `${formValues.AddName}_${index + 1}`,
                                filename: media.filename,
                                videoid: media.videoid,
                                thambnailurl: media.thambnailurl,
                                page_id: formValues.page_id,
                                message: formValues.message,
                                headline: formValues.headline,
                                Description: formValues.Description,
                                Caption: formValues.Caption,
                                Website_URL: formValues.Website_URL,
                                // urlParameters: formValues.urlParameters,
                            };
                        }
                    });
                    // console.log(addLevelData, "addLevelData");

                    // Proceed with posting data, including the addLevelData
                    await postData({ ...formValues, addlevel: addLevelData });
                    changeRRefrst();
                    message.success("Campaign created successfully");
                } else {
                    message.error("Failed to upload one or more files. Campaign creation aborted.");
                }
            } catch (error) {
                message.error("An error occurred during the campaign creation process.");
            } finally {
                setLoading(false); // Stop the spinner after the process is complete
            }

        }
        else {
            setLoading(false); // Stop the spinner if no form data
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onFinish = async () => {
        try {
            // Validate fields first
            await form.validateFields();
    
            // Get all form fields, even empty ones (null or undefined)
            const allValues = form.getFieldsValue(true); 
            let formData = { ...allValues }; // Use allValues instead of only validated values
    
            if (isManual) {
                // Only process selectedPlatforms if isManual is true
                const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
                    acc[publisher + '_positions'] = allValues.positions?.filter(position =>
                        positionOptions[publisher]?.map(option => option.key).includes(position)
                    );
                    return acc;
                }, {});
    
                formData = {
                    publisher_platforms: allValues.publisher_platforms,
                    ...selectedPlatforms,
                    ...allValues
                };
            }
    
            // console.log("All Form Values:", allValues); // Logs all fields
            console.log("Final Form Data:", formData); // Logs processed data
    
            setFormValues(formData);
            setIsModalVisible(true);
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
        }
    };

    // const onFinish = () => {
    //     form
    //         .validateFields()
    //         .then((values) => {
    //             let formData = { ...values };

    //             if (isManual) {
    //                 // Only process selectedPlatforms if isManual is true
    //                 const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
    //                     acc[publisher + '_positions'] = values.positions.filter(position =>
    //                         positionOptions[publisher]?.map(option => option.key).includes(position)
    //                     );
    //                     return acc;
    //                 }, {});

    //                 formData = {
    //                     publisher_platforms: values.publisher_platforms,
    //                     ...selectedPlatforms,
    //                     ...values
    //                 };
    //             }
    //             console.log(values);
    //             console.log(formData);

    //             setFormValues(formData);
    //             setIsModalVisible(true);
    //         })
    //         .catch((errorInfo) => {
    //             console.log('Validation failed:', errorInfo);
    //         });
    // };

    // const onFinish = () => {
    //     form
    //         .validateFields()
    //         .then((values) => {
    //             const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
    //                 acc[publisher + '_positions'] = values.positions.filter(position =>
    //                     positionOptions[publisher].map(option => option.key).includes(position)
    //                 );
    //                 return acc;
    //             }, {});
    //             setFormValues({
    //                 publisher_platforms: values.publisher_platforms,
    //                 ...selectedPlatforms,
    //                 ...values
    //             });
    //             setIsModalVisible(true);
    //         })
    //         .catch((errorInfo) => {
    //             console.log('Validation failed:', errorInfo);
    //         });
    // };

    function extractValuesByPartialLabel(dataArray, labelName) {
        return dataArray
            .filter(item => item.label?.toLowerCase().includes(labelName.toLowerCase()))
            .map(item => {
                if (item.key.includes('story_')) return 'story';
                if (item.key.includes('profile_feed-')) return 'profile_feed';
                return item.key;
            });
    }

    const postData = async (values) => {
        setLoading(true); // Start the spinner post
        console.log(selectedPositions)
        try {
            const dataToSubmit = {
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
                    Daily_amount: parseFloat(campaignLevelDailyBudget) * 100,
                    Status: "PAUSED",
                    access_token: imagehash.token,
                    createdDate: moment().tz(imagehash.timeZone).format('YYYY-MM-DD')
                },
                adsetlevel: {
                    AdsetName: values.AdsetName,
                    Daily_amount: adsetLevelDailyBudget !== 0 ? parseFloat(adsetLevelDailyBudget) * 100 : "",
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
                    placements: values.placements,
                    // publisher_platforms: values.publisher_platforms,
                    // Facebook_positions: values.facebook_positions || [],
                    // instagram_positions: values.instagram_positions || [],
                    // audience_network_positions: values.audience_network_positions || [],
                    // messenger_positions: values.messenger_positions || [],
                    // position: values.positions,
                    locales: values.Language,
                    ...(values.placements !== 'Advance' && {
                        publisher_platforms: values.publisher_platforms,
                        Facebook_positions: extractValuesByPartialLabel(selectedPositions, 'Facebook') || [],
                        instagram_positions: extractValuesByPartialLabel(selectedPositions, 'Instagram') || [],
                        audience_network_positions: extractValuesByPartialLabel(selectedPositions, 'Audience') || [],
                        messenger_positions: extractValuesByPartialLabel(selectedPositions, 'Messenger') || [],
                        position: values.positions,
                        device_platforms: values.device_platforms,
                    }),
                    // device_platforms: values.device_platforms,
                    buying_type: "AUCTION",
                },
                addlevel: values.addlevel, // Use the addlevel array created in handleOk
            };

            
            console.log(dataToSubmit);
            const response = await fetch('https://www.testapi.adsgoat.in/api/submitFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (response.ok) {
                console.log('Form data submitted successfully');
                isManual !== "manual" && setIsManual(false); 
                onClose(); // Close the drawer or perform any other action
                message.success("Campaign was created");
                // changeRRefrst();
            } else {
                console.error('Failed to submit form data');
            }
        } catch (error) {
            console.error('Error submitting form data:', error);
        } finally {
            setLoading(false); // Stop the spinner after the process is complete
        }

    };

    const handleChange = (info) => { 
        console.log(info);
        setSelectedFiles(info.fileList.map(file => ({
          ...file,
          uid: file.uid || `-${Date.now()}`,  // Ensure there's a valid uid
        })));
        const checkFormCompletion = () => {
            const allValues = form.getFieldsValue(true);
        
            // If manualStatus is false, we ignore 'publisher_platforms' and 'device_platforms'
            const fieldsToSkip = isManual === false ? ['publisher_platforms', 'device_platforms'] : [];
        
            // Find the keys of the form items that are empty, except the ones to skip
            const emptyFields = Object.keys(allValues).filter(
                key => !fieldsToSkip.includes(key) && (allValues[key] === undefined || allValues[key] === '')
            );
        
            // Log the empty fields
            if (emptyFields.length > 0) {
                console.log('Empty fields:', emptyFields);
            } else {
                console.log('All fields are complete');
            }
            
            // Check if all form fields are filled, considering the skipped fields
            const isComplete = emptyFields.length === 0;
            setIsFormComplete(isComplete);
        };

        // Trigger form completion check
        checkFormCompletion();
      };
    useEffect(() => {
        // Update the Website_URL form field whenever websiteURL changes
        if (websiteURL) {
            form.setFieldsValue({ Website_URL: websiteURL, Caption: caption });
        }
    }, [websiteURL, form]);
    const currentDate = dayjs();
    const initialValues = {
        Account_Number: DuplicatedampaignData?.Account_Number,
        // createdby:DuplicatedampaignData?.camapaignlevel?.createdby,
        // Name: DuplicatedampaignData?.camapaignlevel?.Name,
        Objectives: DuplicatedampaignData?.camapaignlevel?.Objectives,
        Special_categories: DuplicatedampaignData?.camapaignlevel?.Special_categories,
        Bid_strategy: DuplicatedampaignData?.camapaignlevel?.Bid_strategy,
        Daily_amount: campaignLevelDailyBudget,
        Status: DuplicatedampaignData?.camapaignlevel?.Status,
        // AdsetName: DuplicatedampaignData?.adsetlevel?.AdsetName,
        DatePicker: currentDate,
        DailyAdd_amount: adsetLevelDailyBudget,
        optimization_goal: DuplicatedampaignData?.adsetlevel?.optimization_goal,
        billing_event: DuplicatedampaignData?.adsetlevel?.billing_event,
        // start_time: DuplicatedampaignData?.adsetlevel?.start_time,
        action_source: DuplicatedampaignData?.adsetlevel?.action_source,
        custom_event_type: DuplicatedampaignData?.adsetlevel?.custom_event_type,
        pixel_id: DuplicatedampaignData?.adsetlevel?.pixel_id,
        bid_amount: (DuplicatedampaignData?.adsetlevel?.bid_amount) / 100,
        countries: DuplicatedampaignData?.adsetlevel?.countries,
        Min_Age: DuplicatedampaignData?.adsetlevel?.Min_Age,
        Max_Age: DuplicatedampaignData?.adsetlevel?.Max_Age,
        Gender: DuplicatedampaignData?.adsetlevel?.Gender,
        publisher_platforms: DuplicatedampaignData?.adsetlevel?.publisher_platforms,
        device_platforms: DuplicatedampaignData?.adsetlevel?.device_platforms,
        Language: DuplicatedampaignData?.adsetlevel?.locales,
        placements: DuplicatedampaignData?.adsetlevel?.placements,
        // Facebook_positions: DuplicatedampaignData?.adsetlevel?.Facebook_positions,
        // buying_type: DuplicatedampaignData?.adsetlevel?.buying_type,
        // AddName: DuplicatedampaignData?.addlevel[0]?.AddName,
        filename: DuplicatedampaignData?.addlevel[0]?.filename,
        page_id: DuplicatedampaignData?.addlevel[0]?.page_id,
        message: DuplicatedampaignData?.addlevel[0]?.message,
        headline: DuplicatedampaignData?.addlevel[0]?.headline,
        Description: "Find More",
        Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
        Website_URL: DuplicatedampaignData?.addlevel[0]?.Website_URL,
        Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
        pixel_id: DuplicatedampaignData?.addlevel[0]?.pixel_id,
        page_id: DuplicatedampaignData?.addlevel[0]?.page_id,
        Name: campaignName,
        AdsetName: campaignName,
        AddName: campaignName
        // urlParameters: DuplicatedampaignData?.addlevel[0]?.urlParameters,

    };
    const handleDrawerClose = () => {
        form.resetFields();          // Reset form fields to their initialValues
        setWebsiteURL('');           // Clear website URL
        setSelectedFiles([]);        // Clear selected files
        setCampaignName('');         // Clear campaign name
        setPrimaryText('');          // Clear primary text field
        setCaption('');              // Clear caption field
        setHeadline('');             // Clear headline field
        setDescription('');          // Clear description field
        setSelectedPublishers([]);   // Clear selected publishers
        setSelectedPositions([]);    // Clear selected positions
        setIsFormComplete(false);    // Reset form completion state
        setCampaignName('');
        setAddName('');
        setCampaignLevelDailyBudget(0);
        setAdsetLevelDailyBudget(0);
        onClose(); // Call onClose handler to close the drawer
        isManual !== "manual" && setIsManual(false); 
        setSelectedPositions([]);
    };

    // console.log(selectedFiles);
    // console.log(DuplicatedampaignData);
    // console.log(initialValues)

    {selectedFiles && selectedFiles.length > 0 ? (
        selectedFiles.map((file, index) => (console.log(file?.name, index)))): null}

    return (
        <Drawer
            title={selectedRow?.campaign_name}
            width="95%"
            open={visible}
            onClose={handleDrawerClose}
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
        >
            {DuplicatedampaignData?.identifier === selectedRow?.identifier ? (
                 (loading ? (
                    <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '300px',
                    }}
                    >
                        <Spin size="large" />
                        <div style={{ marginTop: 10, fontSize: 16, color: theme === 'dark' ? '#fff' : '#555' }}>Loading...</div>
                    </div>
                ): ( <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues} className={theme === 'dark' ? 'form-dark' : 'form-light'}>
                    <Collapse accordion defaultActiveKey={['1']} className={theme === 'dark' ? 'custom-collapse-dark' : 'custom-collapse-light'}>
                        <Panel header="CAMPAIGN LEVEL" key="1" style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
                            <div style={{ display: "flex", backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
                                <Form.Item
                                    name="Account_Number"
                                    label={<span style={{ color: "#B4B4B4" }}>Account number</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.25 }}>
                                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
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
                                    style={{ flex: 0.25, marginLeft: "1%" }}>
                                    <Input onChange={handleNameChange}
                                        style={{ width: "100%", }}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                                    style={{ flex: 0.15, marginLeft: "1%" }}>
                                    <Select onChange={getpixelandpageid}

                                        variant="filled"
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads",title:"" },
                                            { value: "OUTCOME_SALES", label: "Sales" ,title:""},
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement",title:"" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness",title:"" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic",title:"" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App promotion",title:"" }

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}

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
                                    style={{ flex: 0.12, marginLeft: "1%" }}>
                                    <Select

                                        variant="filled"
                                        mode="multiple"
                                        allowClear
                                        options={[
                                            { value: "HOUSING", label: "Housing",title:"" },
                                            { value: "FINANCIAL_PRODUCTS_SERVICES", label: "Credit",title:"" },
                                            { value: "EMPLOYMENT", label: "Employment" ,title:""},
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics",title:"" },
                                            { value: "NONE", label: "None" ,title:""}

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme-category' : 'light-theme'} green-border-select`}
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
                                    style={{ flex: 0.2, marginLeft: "1%" }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume",title:"" },
                                            { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap",title:"" },
                                            { value: "COST_CAP", label: "Cost Per Result Goal",title:"" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal",title:"" }
                                        ]}
                                        onChange={handleBidStrategyChange}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Daily_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ marginLeft: "1%" }}
                                // tooltip={adsetLevelDailyBudget !== "" ? "You have enabled daily budget in the Adset Level" : ""}
                                >
                                    <Tooltip title={adsetLevelDailyBudget !== 0 ? "You have enabled daily budget in the Adset Level" : ""}>
                                        <InputNumber
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
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                // width: '200px',
                                                flex: 0.2,
                                                boxSizing: 'border-box'
                                            }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Tooltip>
                                </Form.Item> {/*pk*/}
                                <Form.Item
                                    name="Status"
                                    label={<span style={{ color: "#B4B4B4" }}>Status</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.1, marginLeft: "1%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "ACTIVE", label: "ACTIVE",title:"" },
                                            { value: "PAUSED", label: "PAUSE",title:"" },

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>

                            </div>
                        </Panel>
                        <Panel header="ADSET LEVEL" key="2">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                <Form.Item
                                    name="AdsetName"
                                    initialValue={campaignName}
                                    label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 200px' }}>
                                    <Input
                                        style={{ width: "100%" }}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                                    style={{ flex: '1 1 120px', }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "OFFSITE_CONVERSIONS", label: "Conversions",title:"" },
                                            { value: "LINK_CLICKS", label: "Clicks",title:"" },
                                            { value: "REACH", label: "Reach" ,title:""},
                                            { value: "VALUE", label: "Value" ,title:""}
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
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
                                    style={{ flex: '1 1 120px' }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "IMPRESSIONS", label: "Impressions",title:"" },
                                            { value: "VALUE", label: "Value",title:"" }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="DatePicker"
                                    label={<span style={{ color: "#B4B4B4" }}>Start time</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px',color: theme === 'dark' ? '#fff' : '#000', }}
                                    initialValue={currentDate}

                                >
                                    <DatePicker   className={`green-border-picker ${theme === 'dark' ? 'custom-datepicker-dark' : 'custom-datepicker-light'}`} showTime dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}/>
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
                                    style={{ flex: '1 1 120px' }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "website", label: "Website",title:"" },
                                            { value: "email", label: "Email",title:"" },
                                            { value: "app", label: "App" ,title:""},
                                            { value: "phone_call", label: "Phone Call",title:"" }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
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
                                    style={{ flex: '1 1 120px' }}>
                                    <Select

                                        variant="filled"
                                        options={[
                                            { value: "LEAD", label: "Lead",title:"" },
                                            { value: "PURCHASE", label: "Purchase",title:"" },
                                            { value: "SEARCH", label: "Search",title:"" },
                                            { value: "CONTACT", label: "Contact" ,title:""},
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                         className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                {/* <Form.Item
                                    name="pixel_id"
                                    initialValue={pixelids}
                                    label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 200px' }}>
                                    <Input
                                        style={{ width: "100%" }}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />
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
                                    style={{ flex: '1 1 150px' }}
                                    >
                                    {typeof imagehash?.pixelID === 'object' ? (
                                        <Select
                                        defaultValue={imagehash?.pixelID?.Universal}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        >
                                        {Object.entries(imagehash.pixelID).map(([label, value]) => (
                                            <Select.Option key={value} value={value} title={null}>
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
                                <Form.Item
                                    name="DailyAdd_amount" // Make sure this name matches the field you want to capture
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ flex: '1 1 200px' }}
                                >
                                    <Tooltip title={campaignLevelDailyBudget !== 0 ? "You have enabled daily budget in the Campaign Level" : ""}>
                                        <Input
                                            type="number"
                                            placeholder="$"
                                            value={adsetLevelDailyBudget}
                                            onWheel={(e) => e.target.blur()}
                                            onChange={onChangeAdsetLevelDailyBudget}
                                            readOnly={campaignLevelDailyBudget !== 0} // This will keep the field readonly
                                            step="0.01"
                                            style={{
                                                backgroundColor: campaignLevelDailyBudget !== 0 ? '#f0f0f0' : 'transparent',
                                                borderRadius: '6px',
                                                borderColor: campaignLevelDailyBudget !== 0 ? 'transparent' : undefined,
                                                fontSize: '14px',
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                width: '200px',
                                                boxSizing: 'border-box'
                                            }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Tooltip>
                                </Form.Item>
                                {(DuplicatedampaignData?.camapaignlevel?.Bid_strategy === "LOWEST_COST_WITH_BID_CAP" ||
                                    DuplicatedampaignData?.camapaignlevel?.Bid_strategy === "COST_CAP" || showBidAmount) && (
                                        <Form.Item
                                            name="bid_amount"
                                            label={<span style={{ color: "#B4B4B4" }}>Cost per result goal</span>}
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
                                            <InputNumber
                                                type="number"
                                                placeholder="$"
                                                onWheel={(e) => e.target.blur()}
                                                onKeyPress={(event) => {
                                                    const charCode = event.charCode;
                                                    const charStr = String.fromCharCode(charCode);
                                                    const regex = /^[0-9]*\.?[0-9]*$/;
                                                    if (!regex.test(charStr)) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                style={{color: theme === "dark" ? "white" : "#000"}}
                                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                            />
                                        </Form.Item>
                                    )}

                                {/* {(DuplicatedampaignData?.camapaignlevel?.Bid_strategy === "LOWEST_COST_WITH_BID_CAP" ||
                                    DuplicatedampaignData?.camapaignlevel?.Bid_strategy === "COST_CAP"
                                ) ? (
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
                                        style={{ flex: 0.1, marginLeft: "2%" }}
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
                                        />
                                    </Form.Item>
                                ) : (showBidAmount && (<Form.Item
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
                                    style={{ flex: 0.1, marginLeft: "2%" }}
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
                                    />
                                </Form.Item>))} */}


                            </div>
                            <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px"  }}>
                                <Form.Item
                                    name="countries"
                                    label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 140px' }}>
                                    <Select
                                        variant="filled"

                                        options={[
                                            { value: "US", label: "United States",title:"" },
                                            { value: "GB", label: "United Kingdom",title:"" },
                                            { value: "AU", label: "Australia",title:"" },
                                            { value: "IN", label: "India",title:"" },
                                            { value: "AE", label: "United Arab Emirates",title:"" },
                                            { value: "CA", label: "Canada",title:"" },
                                            { value: "DE", label: "Germany" ,title:""},
                                            { value: "FR", label: "France",title:"" },
                                            { value: "JP", label: "Japan",title:"" },
                                            { value: "CN", label: "China",title:"" },
                                            { value: "BR", label: "Brazil",title:"" },
                                            { value: "ZA", label: "South Africa",title:"" },
                                            { value: "RU", label: "Russia",title:"" },
                                            { value: "IT", label: "Italy",title:"" },
                                            { value: "ES", label: "Spain",title:"" },
                                            { value: "SG", label: "Singapore" ,title:""},
                                            { value: "NZ", label: "New Zealand",title:"" },
                                            { value: "MX", label: "Mexico",title:"" }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                         className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Min_Age"
                                    label={<span style={{ color: "#B4B4B4" }}>Min age</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "18", label: "18" ,title:""},
                                            { value: "25", label: "25" ,title:""},
                                            { value: "35", label: "35" ,title:""},
                                            { value: "40", label: "40", disabled: true ,title:""},
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                         className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Max_Age"
                                    label={<span style={{ color: "#B4B4B4" }}>Max age</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "20", label: "20",title:"" },
                                            { value: "30", label: "30" ,title:""},
                                            { value: "65", label: "65+",title:"" },
                                            { value: "80", label: "80", disabled: true,title:"" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                         className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
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
                                    style={{ flex: '1 1 150px' }}
                                    >
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "0", label: "All",title:"" },
                                            { value: "1", label: "Male" ,title:""},
                                            { value: "2", label: "Female" ,title:""},
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Language"
                                    label={<span style={{ color: "#B4B4B4" }}>Language</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}>
                                    <Select
                                        showSearch
                                        mode="multiple" // or "tags" if you want to allow selecting multiple options
                                        value={DuplicatedampaignData?.adsetlevel?.locales}
                                        placeholder="Select language"
                                        optionFilterProp="children"
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                         className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    >
                                        {localesdata.map(option => (
                                            <Option key={option.key} value={option.key} title={null}>
                                                {option.name}
                                            </Option>
                                        ))}
                                    </Select>

                                </Form.Item>
                                <Form.Item
                                    label={<span style={{ color: "#B4B4B4" }}>Placements</span>}
                                    name="placements"
                                    rules={[{ required: true, message: 'Please select a mode!' }]}
                                >
                                    <Select placeholder="Select a mode" onChange={handleModeChange}
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                       className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}>
                                        <Option value="Advance" title={null}>Advance</Option>
                                        <Option value="manual" title={null}>Manual</Option>

                                    </Select>
                                </Form.Item>
                                {isManual && (
                                    <>
                                        <Form.Item
                                            name="publisher_platforms"
                                            label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                            rules={[{ required: true, message: "Please select an option!" }]}
                                            // style={{ marginRight: "10px" }}
                                            style={{ flex: '1 1 210px' }}
                                        >

                                            <Select
                                                mode="multiple"
                                                placeholder="Select Platforms"
                                                onChange={handlePublisherChange}
                                                value={selectedPublishers}
                                                style={{ width: 300 }}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                 className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            >
                                                {publisherOptions.map(option => (
                                                    <Option key={option.value} value={option.value} title={null}>
                                                        {option.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="positions"
                                            label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                            rules={[{ required: true, message: "Please select an option!" }]}
                                            style={{ flex: '1 1 215px' }}
                                        // style={{ marginRight: "10px" }}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Positions"
                                                value={selectedPositions.map(pos => pos.value)}
                                                onChange={handlePositionChange}
                                                // style={{ width: 400 }}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                 className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            >
                                                {selectedPublishers && selectedPublishers.length > 0 ? (
                                                    getPositionOptions()?.map(position => (
                                                        <Option key={`${position.key}_${position.label}`} value={position.key} title={null}>
                                                            {position.label}
                                                        </Option>
                                                    ))
                                                ) : (
                                                    <Option value="">Empty</Option>
                                                )}

                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name="device_platforms"
                                            label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select an option!",
                                                },
                                            ]}
                                            style={{ flex: '1 1 215px' }}>
                                            <Select
                                                mode="multiple"
                                                variant="filled"
                                                allowClear
                                                style={{ width: 200 }}
                                                placeholder="Please select"
                                                options={[
                                                    { value: "mobile", label: "Mobile" ,title:""},
                                                    { value: "desktop", label: "Desktop",title:"" }
                                                ]}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            />
                                        </Form.Item>
                                    </>
                                )}
                                {/* <Form.Item
                                    name="publisher_platforms"
                                    label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                    rules={[{ required: true, message: "Please select an option!" }]}
                                    // style={{ marginRight: "10px" }}
                                    style={{ flex: 0.18, marginLeft: "2%" }}
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
                                    style={{ flex: 0.18, marginLeft: "2%" }}
                                // style={{ marginRight: "10px" }}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Select Positions"
                                        value={selectedPositions}
                                        onChange={handlePositionChange}
                                        style={{ width: 400 }}
                                    >
                                        {selectedPublishers && selectedPublishers.length > 0 ? (
                                            getPositionOptions().map(position => (
                                                <Option key={`${position.key}_${position.label}`} value={position.key}>
                                                    {position.label}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="">Empty</Option>
                                        )}

                                    </Select>
                                </Form.Item>
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
                                        style={{ width: 200 }}
                                        placeholder="Please select"
                                        options={[
                                            { value: "mobile", label: "Mobile" },
                                            { value: "desktop", label: "Desktop" }
                                        ]}
                                    />
                                </Form.Item> */}
                            </div>
                        </Panel>
                        <Panel header="AD LEVEL" key="3">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: "70%", marginRight: "5%" }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {/* <Form.Item
                                            name="MediaContent"
                                            label={<span style={{ color: "#B4B4B4" }}>Upload</span>}
                                            rules={[
                                                {
                                                    validator: (_, value) => {
                                                        // Check if no files are selected after removal
                                                        if (selectedFiles.length === 0) {
                                                            return Promise.reject(new Error('Please select Upload!'));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                },
                                            ]}
                                            style={{ flex: 1 }}
                                        >
                                            <Upload
                                                beforeUpload={handleBeforeUpload}
                                                onChange={handleChange}
                                                multiple // Add this line to enable multiple file selection
                                                maxCount={10} // Adjust the max count as needed
                                                accept="image/*, video/*"
                                                fileList={selectedFiles}
                                                onRemove={(file) => {
                                                    setSelectedFiles((prevFiles) =>
                                                        prevFiles.filter((item) => item.uid !== file.uid)
                                                    );
                                                }}
                                            >
                                                <Button icon={<UploadOutlined />}>Select Files</Button>
                                            </Upload>

                                        </Form.Item> */}
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <Form.Item
                                                label={<span style={{ color: "#B4B4B4" }}>Select source</span>}
                                                style={{ flex: 1 }}
                                                >
                                                <Select
                                                    defaultValue="creative"
                                                    onChange={(value) => {
                                                    setSelectedOption(value);
                                                    form.validateFields(["MediaContent"]); // Revalidate when switching source
                                                    }}
                                                    style={{ marginBottom: 16 }}
                                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                     className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
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
                                                        if (
                                                        (selectedOption === "upload" && selectedFilesFromMedia.length === 0) ||
                                                        (selectedOption === "creative" && selectedFilesFromCreatives.length === 0)
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
                                                        <div className="custom-dark-mode" style={{ display: selectedOption === "upload" ? "block" : "none" }}>
                                                            <Upload
                                                                beforeUpload={() => false}
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
                                                                    const existingUids = new Set(prev.map((f) => f.uid));
                                                                    const filteredNewFiles = newFiles.filter((f) => !existingUids.has(f.uid));
                                                                    const updated = [...prev, ...filteredNewFiles];
                                                                    form.setFieldsValue({ MediaContent: updated });
                                                                    form.validateFields(["MediaContent"]);
                                                                    return updated;
                                                                });

                                                                setSelectedFilesFromMedia((prev) => {
                                                                    const existingUids = new Set(prev.map((f) => f.uid));
                                                                    const filteredNewFiles = newFiles.filter((f) => !existingUids.has(f.uid));
                                                                    const updated = [...prev, ...filteredNewFiles];
                                                                    form.setFieldsValue({ MediaContent: updated });
                                                                    form.validateFields(["MediaContent"]);
                                                                    return updated;
                                                                });
                                                                }}
                                                                onRemove={(fileToRemove) => {
                                                                setSelectedFilesFromMedia((prev) => {
                                                                    const updated = prev.filter((file) => file.uid !== fileToRemove.uid);
                                                                    form.setFieldsValue({ MediaContent: updated });
                                                                    form.validateFields(["MediaContent"]);
                                                                    return updated;
                                                                });

                                                                setSelectedFiles((prev) => {
                                                                    const updated = prev.filter((file) => file.uid !== fileToRemove.uid);
                                                                    form.setFieldsValue({ MediaContent: updated });
                                                                    form.validateFields(["MediaContent"]);
                                                                    return updated;
                                                                });

                                                                return true;
                                                                }}
                                                                multiple
                                                                maxCount={10}
                                                                fileList={selectedFilesFromMedia}
                                                                listType="picture"
                                                                accept="image/*, video/*"
                                                            >
                                                                <Button icon={<UploadOutlined />}  className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}>Select files</Button>
                                                            </Upload>
                                                        </div>

                                                        {/* Creative Library UI */}
                                                        {selectedOption === "creative" && (
                                                        <div>
                                                            <Button icon={<UploadOutlined />} onClick={onClickCreativesDrawer}  className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}>
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
                                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                                        }}

                                                                    >
                                                                        {file.name}
                                                                    </span>
                                                                    {/* </Tooltip> */}

                                                                    

                                                                    <DeleteOutlined
                                                                    onClick={() => {
                                                                        const updated = selectedFilesFromCreatives.filter(
                                                                        (f) => f.uid !== file.uid
                                                                        );
                                                                        setSelectedFilesFromCreatives(updated);
                                                                        setSelectedFiles((prev) =>
                                                                        prev.filter((f) => f.uid !== file.uid)
                                                                        );
                                                                        form.setFieldsValue({ MediaContent: updated });
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
                                            <Input style={{ width: "23%" }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item
                                        name="AddName"
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
                                            onChange={(e) => setAddName(e.target.value)}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                                        label={<span style={{ color: "#B4B4B4" }}>Headline</span>}
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
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ color: "#B4B4B4" }}>Description</span>}
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
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Form.Item>

                                    {/* <Form.Item
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
                                            onChange={(e) => setWebsiteURL(e.target.value)}

                                        />
                                    </Form.Item> */}
                                    <Form.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '50px' }}>
                                                    <span style={{ color: "#B4B4B4" }}>Website_URL</span>
                                                    <Tooltip title="This is a required field">
                                                        <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'pointer' }} />
                                                    </Tooltip>
                                                </div>
                                                <EditOutlined style={{ cursor: 'pointer' }} onClick={onClickEdit} />
                                            </div>
                                        }
                                        labelCol={{ style: { width: '100%' } }}  // Makes the label full width
                                        wrapperCol={{ style: { width: '100%' } }}  // Ensures TextArea takes the same full width
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
                                            value={websiteURL}
                                            onChange={(e) => setWebsiteURL(e.target.value)}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}

                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={<span style={{ color: "#B4B4B4" }}>Display link</span>}
                                        name="Caption"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a Display Link!",
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
                                        {getUrlBuilder(network)}
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
                                    {selectedFiles && selectedFiles.length > 0 ? (
                                        selectedFiles.map((file, index) => (
                                            <Badge
                                                count={
                                                    (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith('.mp4')) ? 
                                                    null:
                                                    <EditOutlined
                                                        style={{ fontSize: '25px', color: '#fff' }}
                                                        onClick={() => handleEditClick(file)} // Edit icon click handler
                                                    />
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
                                                key={index}
                                            >
                                                <div key={index} className="container-ad-preview">
                                                    <div className="ad-preview" style={{ width: "350px", backgroundColor: theme === "dark" && "#4f4f4d" }}>
                                                        <div className="ad-heading">
                                                            <div className="img">
                                                                {/* {file?.filename?.endsWith('.png') && console.log(file)} */}
                                                                {file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') ? (
                                                                    <img
                                                                        src={file?.url}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="40"
                                                                        style={{ objectFit: 'cover' }}
                                                                    />
                                                                ) : file?.url?.endsWith('.mp4') ? (
                                                                    <video
                                                                        src={file?.url}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="30"
                                                                        style={{ objectFit: 'cover' }}
                                                                        muted // Muted to prevent sound on preview
                                                                    />
                                                                ) : 
                                                                file?.type?.startsWith('image/') ? (
                                                                    <img
                                                                        src={editedImages[file?.name] ? editedImages[file?.name]:  file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="40"
                                                                        style={{ objectFit: 'cover' }}
                                                                    />
                                                                ) 
                                                                : 
                                                                (
                                                                    <video
                                                                        src={file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="30"
                                                                        style={{ objectFit: 'cover' }}
                                                                        muted // Muted to prevent sound on preview
                                                                    />
                                                                )
                                                                // null
                                                                }

                                                                
                                                            </div>

                                                            <div className="title">
                                                                <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal',color : theme === "dark" && "white" }}>
                                                                    {addName}
                                                                    {/* </div>                                                            <div className="sub">
                                                                    Sponsored <GlobalOutlined style={{ opacity: "0.6" }} /> */}
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
                                                            <div className="close">
                                                                <CloseOutlined style={{ fontSize: "20px" }} />
                                                            </div>
                                                            <div className="moreoptions">
                                                                <MoreOutlined style={{ fontSize: "20px" }} />
                                                            </div>
                                                        </div>
                                                        <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal',color : theme === "dark" && "white" }}>
                                                            {primaryText}
                                                        </div>
                                                        <div className="ad-image" style={{ width: '350px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') ? (
                                                                    <img
                                                                        src={file?.url}
                                                                        alt="ad content"
                                                                        // style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                    />
                                                                ) : file?.url?.endsWith('.mp4') ? (
                                                                    <video
                                                                    controls
                                                                    // style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                    >
                                                                        <source src={file?.url} />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) 
                                                                :
                                                                file?.type?.startsWith('image/') ? (
                                                                    <img
                                                                        src={editedImages[file?.name] ? editedImages[file?.name]:  file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url} // Use edited image if available
                                                                        alt="ad content"
                                                                        // style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                    />
                                                                ) : 
                                                                (
                                                                    <video
                                                                        controls
                                                                        // style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                    >
                                                                        <source src={file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url} />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                )
                                                                // null
                                                                }
                                                        </div>

                                                        <div className="ad-cta">
                                                            <div className="details">
                                                                <div className="link" style={{color : theme === "dark" && "white"}}>{caption}</div>
                                                                <div className="title" style={{color : theme === "dark" && "white"}}>{headline}</div>
                                                                <div className="desc" style={{color : theme === "dark" && "white"}}>{description}</div>
                                                            </div>
                                                            <div className="ad-button">
                                                                <button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}}>Learn More</button>
                                                            </div>
                                                        </div>
                                                        <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
                                                            {websiteURL}
                                                        </a>                                                <div className="icons">
                                                            <div className="like" style={{color : theme === "dark" && "white"}}>
                                                                <LikeOutlined style={{ fontSize: "20px" }} />
                                                                Like
                                                            </div>
                                                            <div className="comment" style={{color : theme === "dark" && "white"}}>
                                                                <CommentOutlined style={{ fontSize: "20px" }} />
                                                                Comment
                                                            </div>
                                                            <div className="share" style={{color : theme === "dark" && "white"}}>
                                                                <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                                Share
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Badge>

                                        ))
                                    ) : (
                                        // <div className="container-ad-preview">
                                        //     <div className="ad-preview">
                                        //         <div className="ad-heading">
                                        //             <div className="filename">
                                        //                 <img
                                        //                     src={initialValues?.filename}
                                        //                     alt="page id"
                                        //                     width="40"
                                        //                     height="40"
                                        //                 />
                                        //             </div>
                                        //             <div className="title">
                                        //                 <div className="main">{"Facebook Page"}</div>
                                        //                 <div className="sub">
                                        //                     Sponsored <GlobalOutlined style={{ opacity: "0.6" }} />
                                        //                 </div>
                                        //             </div>
                                        //             <div className="close">
                                        //                 <CloseOutlined style={{ fontSize: "20px" }} />
                                        //             </div>
                                        //             <div className="moreoptions">
                                        //                 <MoreOutlined style={{ fontSize: "20px" }} />
                                        //             </div>
                                        //         </div>
                                        //         <div className="ad-desc">{"adMessage"}</div>
                                        //         <div className="ad-image">
                                        //             <img
                                        //                 src={initialValues?.filename}
                                        //                 alt="ad content"
                                        //             />
                                        //         </div>
                                        //         <div className="ad-cta">
                                        //             <div className="details">
                                        //                 <div className="link">{"adCaption"}</div>
                                        //                 <div className="title">{"adName"}</div>
                                        //                 <div className="desc">{"adDesc"}</div>
                                        //             </div>
                                        //             <div className="ad-button">
                                        //                 <button type="button">Learn More</button>
                                        //             </div>
                                        //         </div>
                                        //         <div className="icons">
                                        //             <div className="like">
                                        //                 <LikeOutlined style={{ fontSize: "20px" }} />
                                        //                 Like
                                        //             </div>
                                        //             <div className="comment">
                                        //                 <CommentOutlined style={{ fontSize: "20px" }} />
                                        //                 Comment
                                        //             </div>
                                        //             <div className="share">
                                        //                 <ShareAltOutlined style={{ fontSize: "20px" }} />
                                        //                 Share
                                        //             </div>
                                        //         </div>
                                        //     </div>
                                        // </div>
                                        null
                                    )}
                                </div>
                            </div>


                        </Panel>
                    </Collapse>
                    <Form.Item label=" ">
                    {/* {isFormComplete && ( */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <Button
                            type="primary"
                            style={{ background: '#91C25F', minWidth: '200px', borderWidth:'0px' ,border:'1px solid #4caf50'}}
                            onClick={async () => {
                            try {
                                const values = await form.validateFields(); // Validates all form fields

                                // Clear existing validation errors
                                

                                if (((adsetLevelDailyBudget === 0 && campaignLevelDailyBudget === 0) ||
                                isNaN(adsetLevelDailyBudget) || isNaN(campaignLevelDailyBudget))) {
                                    // Throw a validation error manually in the same format as AntD expects
                                    throw {
                                      errorFields: [
                                        {
                                          name: ['Daily_amount'], // This should match your Form.Item name path
                                          errors: ['Daily budget cannot be zero on both Adset and Campaign levels'],
                                        },
                                      ],
                                    };
                                }

                                setSubmitErrors([]);

                                // Optionally trigger your existing logic
                                onFinish(values); // If you want to reuse your existing logic

                                // Show confirmation modal
                                setIsModalVisible(true);

                                // Save values if needed
                                setFormValues(values);
                            } catch (err) {
                                const allErrors = err?.errorFields?.map((field) => ({
                                name: field.name?.[0],       // field name
                                message: field.errors?.[0],  // validation message
                                }));
                                setSubmitErrors(allErrors);
                            }
                            }}
                        >
                            Submit
                        </Button>

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
                    <Modal
                        title="Confirmation"
                        open={isModalVisible}
                        onOk={handleOk}
                        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                        onCancel={handleCancel}>
                        <p>Are you sure you want to submit?</p>
                    </Modal>
                </Form>) )
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    {/* <Spin size="large" /> */}
                    <div style={{ padding: '24px' }}>
                        <Skeleton active paragraph={{ rows: 20 }} />
                    </div>
                </div>
            )}
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
                    <ImageUploadPage selectedFilesData={selectedFilesData} fromCampaigns={true} network={network} Account_Number={selectedRow?.Account_Number} />
                </Drawer>
            )}
        </Drawer>
    );
};

export default DuplicateCampaignDrawer;
