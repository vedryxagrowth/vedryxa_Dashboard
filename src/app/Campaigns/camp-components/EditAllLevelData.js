"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Badge, Tooltip, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined, QuestionCircleOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
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
    { label: 'Facebook', value: 'facebook', title: "" },
    { label: 'Instagram', value: 'instagram', title: "" },
    { label: 'Messenger', value: 'messenger', title: "" },
    { label: 'Audience Network', value: 'audience_network', title: "" }
];
const positionOptions = {
    facebook: [
        { key: "feed", label: "Facebook Feed", title: "" },
        { key: "marketplace", label: "Facebook Marketplace", title: "" },
        { key: "video_feeds", label: "Facebook Video Feeds", title: "" },
        { key: "instream_video", label: "Facebook In-Stream Videos", title: "" },
        { key: "facebook_reels", label: "Facebook Reels", title: "" },
        { key: "profile_feed", label: "Facebook Profile Feed", title: "" },
        { key: "search", label: "Facebook Search", title: "" },
        { key: "story", label: "Facebook Stories", title: "" },
        { key: "right_hand_column", label: "Facebook Right Column", title: "" },
        { key: "instant_article", label: "Facebook Instant Articles", title: "" },
        { key: "biz_disco_feed", label: "Facebook Business Explore", title: "" } // Added Business Explore
    ],
    instagram: [
        { key: "stream", label: "Instagram Stream", title: "" },
        { key: "story", label: "Instagram Stories", title: "" },
        { key: "explore", label: "Instagram Explore", title: "" },
        { key: "explore_home", label: "Instagram Explore Home", title: "" },
        { key: "reels", label: "Instagram Reels", title: "" },
        { key: "profile_feed", label: "Instagram Profile Feed", title: "" },
        { key: "ig_search", label: "Instagram Search", title: "" },
        { key: "profile_reels", label: "Instagram Profile Reels", title: "" }
    ],
    messenger: [
        { key: "messenger_home", label: "Messenger Home", title: "" },
        { key: "story", label: "Messenger Stories", title: "" },
        { key: "sponsored_messages", label: "Messenger Sponsored Messages", title: "" },
        // { key: "messenger_inbox", label: "Messenger Inbox" }
    ],
    audience_network: [
        { key: "classic", label: "Audience Network Classic", title: "" },
        { key: "rewarded_video", label: "Audience Network Rewarded Video", title: "" },
        { key: "instream_video", label: "Audience Network In-Stream Video", title: "" }
    ]
};

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

const EditAllLevelDataDrawer = ({ visible, onClose, changeRRefrst, accountis, network, selectedRow }) => {
    // const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    // const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [submitErrors, setSubmitErrors] = useState([]);
    const [DuplicatedampaignData, setDuplicatedampaignData] = useState(null);

    const [accountNumber, setAccountNumber] = useState(accountis);
    const [imagehash, setimagehash] = useState('')
    const { data: session } = useSession();
    var token = localStorage.getItem("token")
    const [showBidAmount, setShowBidAmount] = useState(false);
    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedPositions, setSelectedPositions] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
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
    const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState([]);
    const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState([]);
    const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
    const [defaultURlBuilder, setDefaultURLBuilder] = useState("");
    const [selectedOption, setSelectedOption] = useState("upload");
    const [changedFields, setChangedFields] = useState({});
    const [panels, setPanels] = useState([]); // State to manage dynamic panels
    const [levelWiseChanges, setLevelWiseChanges] = useState({});
    const [activePanelKey, setActivePanelKey] = useState(null);
    const { theme } = useTokenContext();


    const handleModeChange = (value) => {
        setIsManual(value === "manual");
    };

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
                    // console.log("hello viewdata", ...response.data);
                    setDuplicatedampaignData(response?.data[0]);
                    const enrichedPanels = (response?.data[0]?.addlevel || []).map((item, index) => {
                        const selectedOption = item.selectedOption || "creative";

                        const defaultFile = item.filename
                            ? [
                                {
                                    uid: `file-${index}`,
                                    name: item.filename.split("/").pop(),
                                    url: item.filename,
                                    type: item.filename.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
                                    source: selectedOption === "upload" ? "media" : "creative",
                                },
                            ]
                            : [];

                        return {
                            ...item,
                            key: `panel-${index}`,
                            selectedOption,
                            selectedFilesFromMedia: [], // selectedOption === "upload" ? defaultFile : []
                            selectedFilesFromCreatives: selectedOption === "creative" ? defaultFile : [],
                            selectedFiles: defaultFile,
                        };
                    });

                    setPanels(enrichedPanels);
                }
            } catch (error) {
                console.error("Error fetching campaign list:", error);
            }
        };

        fetchData();
    }, [selectedRow]);

    const updatePanel = (key, field, value) => {
        setPanels((prevPanels) =>
            prevPanels.map((panel) =>
                panel.key === key ? { ...panel, [field]: value } : panel
            )
        );
    };

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
            setSelectedPositions({});    // Clear selected positions
            setIsFormComplete(false);    // Reset form completion state
            setCampaignName('');
            setAddName('');
            setAdsetLevelDailyBudget(0);
            setCampaignLevelDailyBudget(0);

        }
    }, [visible]);

    useEffect(() => {
        if (DuplicatedampaignData) {
            setSelectedPublishers(DuplicatedampaignData?.adsetlevel?.publisher_platforms || []);
            setSelectedPositions(DuplicatedampaignData?.adsetlevel?.position || ["feed"]);
            setAdsetLevelDailyBudget(DuplicatedampaignData?.adsetlevel?.Daily_amount ? (DuplicatedampaignData?.adsetlevel?.Daily_amount) / 100 : 0);
            setCampaignLevelDailyBudget((DuplicatedampaignData?.camapaignlevel?.Daily_amount) / 100);
            setDefaultURLBuilder(DuplicatedampaignData?.addlevel[0]?.Website_URL);
            setSelectedOption("creative");
            (DuplicatedampaignData?.camapaignlevel?.Bid_strategy === "COST_CAP") && setShowBidAmount("COST_CAP");
            setSelectedFilesFromCreatives(DuplicatedampaignData?.addlevel?.map((file, index) => {
                return ({
                    uid: `-${index + 1}`,
                    name: file?.filename,
                    status: 'done',
                    type: `${file?.filename?.endsWith(".jpg") || file?.filename?.endsWith(".png") ? file?.filename?.endsWith(".jpg") ? "image/jpg" : "image/png" : "video/"}`,
                    url: file?.filename,
                })
            }));
            setSelectedFiles(DuplicatedampaignData?.addlevel?.map((file, index) => {
                return ({
                    uid: `-${index + 1}`,
                    name: file?.filename,
                    status: 'done',
                    type: `${file?.filename?.endsWith(".jpg") || file?.filename?.endsWith(".png") ? file?.filename?.endsWith(".jpg") ? "image/jpg" : "image/png" : "video/"}`,
                    url: file?.filename,
                })
            }));
            DuplicatedampaignData?.adsetlevel?.placements === "manual" ? setIsManual(true) : setIsManual(false);
            // form.setFieldsValue({
            //     MediaContent: fileList, // Ensure the selected files are added to the form value
            //   });

            // setCaption(DuplicatedampaignData?.addlevel[0]?.Caption);
            // setPrimaryText(DuplicatedampaignData?.addlevel[0]?.message);
            // setDescription(DuplicatedampaignData?.addlevel[0]?.Description);
            // setHeadline(DuplicatedampaignData?.addlevel[0]?.headline);
            // console.log(DuplicatedampaignData?.adsetlevel?.placements);
            form.setFieldsValue({
                Campaign: {
                    Account_Number: DuplicatedampaignData?.Account_Number,
                    // createdby:DuplicatedampaignData?.camapaignlevel?.createdby,
                    Name: DuplicatedampaignData?.camapaignlevel?.Name,
                    Objectives: DuplicatedampaignData?.camapaignlevel?.Objectives,
                    Special_categories: DuplicatedampaignData?.camapaignlevel?.Special_categories,
                    Bid_strategy: DuplicatedampaignData?.camapaignlevel?.Bid_strategy,
                    Daily_amount: (DuplicatedampaignData?.camapaignlevel?.Daily_amount) / 100,
                    Status: DuplicatedampaignData?.camapaignlevel?.Status,
                },
                Adset: {
                    AdsetName: DuplicatedampaignData?.adsetlevel?.AdsetName,
                    positions: DuplicatedampaignData?.adsetlevel?.position || ["feed"],
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
                },
                // Facebook_positions: DuplicatedampaignData?.adsetlevel?.Facebook_positions,
                // buying_type: DuplicatedampaignData?.adsetlevel?.buying_type,
                // AddName: DuplicatedampaignData?.adsetlevel?.AdsetName,
                filename: DuplicatedampaignData?.addlevel[0]?.filename,
                // page_id: DuplicatedampaignData?.addlevel[0]?.page_id,
                Ad: {
                    message: DuplicatedampaignData?.addlevel[0]?.message,
                    headline: DuplicatedampaignData?.addlevel[0]?.headline,
                    Description: DuplicatedampaignData?.addlevel[0]?.Description,
                    Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
                    Website_URL: DuplicatedampaignData?.addlevel[0]?.Website_URL,
                    Caption: DuplicatedampaignData?.addlevel[0]?.Caption,
                    pixel_id: DuplicatedampaignData?.addlevel[0]?.pixel_id,
                    page_id: DuplicatedampaignData?.addlevel[0]?.page_id
                }
                // MediaContent: (DuplicatedampaignData?.addlevel?.map((file, index)=>{
                //     return({
                //         uid: `-${index+1}`,
                //         name: file?.filename,
                //         status: 'done',
                //         url: file?.filename,
                //     })
                // }))
            });
        }
    }, [DuplicatedampaignData, form]);




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
        if (network === "FB_Mnet" || network === "FB_DomainActive") {
            setCaption(text.split('//')[1].split("/")[0]);
            form.setFieldsValue({
                Ad: {
                    Website_URL: text, // merge or update the changed fields
                    Caption: text.split('//')[1].split("/")[0],
                },
            });
            setLevelWiseChanges((prev) => {
                const existingAd = prev?.Ad || {};
                const existingAds = existingAd?.Ads || [];

                return {
                    ...prev,
                    Ad: {
                        ...existingAd, // ✅ Preserve all existing keys (like Ads)
                        Ads: existingAds, // ✅ Explicitly reassign Ads to be safe
                        Website_URL: text,
                        Caption: text.split('//')[1].split("/")[0],
                    },
                };
            });

            // setChangedFields((prev) => ({
            //     ...prev,
            //     Website_URL: text, // merge or update the changed fields
            //     Caption: text.split('//')[1].split("/")[0],  // merge or update the changed fields
            // }));

        } else {
            setCaption(text.split('/')[0]);
            form.setFieldsValue({
                Ad: {
                    Website_URL: text, // merge or update the changed fields
                    Caption: text.split('/')[0],
                },
            });
            setLevelWiseChanges((prev) => {
                const existingAd = prev?.Ad || {};
                const existingAds = existingAd?.Ads || [];

                return {
                    ...prev,
                    Ad: {
                        ...existingAd, // ✅ Preserve all existing keys (like Ads)
                        Ads: existingAds, // ✅ Explicitly reassign Ads to be safe
                        Website_URL: text,
                        Caption: text.split('/')[0],
                    },
                };
            });
            // Update the levelWiseChanges state
            // setChangedFields((prev) => ({
            //     ...prev,
            //     Website_URL: text, // merge or update the changed fields
            //     Caption: text.split('/')[0],  // merge or update the changed fields
            //   }));

        }
        // console.log(text, "text");
    }

    const onChangeCampaignLevelDailyBudget = (event) => {
        setCampaignLevelDailyBudget(parseFloat(event.target.value));
        // form.setFieldsValue({ Daily_amount: event.target.value });
        // setChangedFields((prev) => ({
        //     ...prev,
        //     Daily_amount: event.target.value, // merge or update the changed fields
        //   }));
        // console.log(event.target.value);
        setLevelWiseChanges((prev) => ({
            ...prev,
            Campaign: {
                ...prev.Campaign, // ✅ correct capitalization
                Daily_amount: parseFloat(event.target.value) * 100,
            },
        })); // Update the levelWiseChanges state
    }

    const onChangeAdsetLevelDailyBudget = (event) => {
        setAdsetLevelDailyBudget(parseFloat(event.target.value));
    }


    const getUrlBuilder = (network) => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder defaultValues={defaultURlBuilder} onReturnMessage={onReturnUrl} />
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


    const handlePublisherChange = (value) => {
        setSelectedPublishers(value);
        setSelectedPositions([]); // Clear positions when publisher selection changes
    };

    const handlePositionChange = (value) => {
        setSelectedPositions(value);
        setSelectedPositions(["feed"]); // Set default positions to "feed"
        // form.resetFields(['positions']);
    };

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
            // console.log("account data", ...response?.data);


            setimagehash(...response?.data)
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

    const handleNameChange = async (e) => {
        // console.log("Account Number:", accountNumber);
        const newName = e.target.value;
        setCampaignName(newName);
    };

    const handleFormChange = (changedValues, allValues) => {
        if (!allValues) return; // Return early if allValues is undefined
        setChangedFields((prev) => ({
            ...prev,
            ...changedValues, // merge or update the changed fields
        }));

        setLevelWiseChanges((prev) => {
            const updated = { ...prev };

            for (const [level, fields] of Object.entries(changedValues)) {
                updated[level] = {
                    ...(prev[level] || {}),
                    ...fields,
                };
            }

            // console.log("📦 Current level-wise changes:", updated);
            return updated;
        });

        // const levelWise = Object.fromEntries(
        //     Object.entries(changedValues).map(([level, fields]) => [
        //       level,
        //       { ...fields },
        //     ])
        // );

        // console.log(levelWise);

        // const groupedByPanel = {};

        // Object.entries(allValues).forEach(([fieldName, value]) => {
        //     const inputEl = document.querySelector(`[name="${fieldName}"]`);

        //     if (inputEl) {
        //     const panelEl = inputEl.closest('.panel'); // Traverse DOM to find parent panel
        //     const panelKey = panelEl?.getAttribute('data-panel');

        //     if (panelKey) {
        //         if (!groupedByPanel[panelKey]) groupedByPanel[panelKey] = {};
        //         groupedByPanel[panelKey][fieldName] = value;
        //     }
        //     }
        // });

        // console.log('🔍 Grouped by Panel:', groupedByPanel);
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
                            const response = await fetch(`https://app.vyaktimetrics.com/creatives/userfiles/s3?s3Url=${file.url}`, {
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
                            if (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg")) {
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
                            const editedImage = editedImages[fileId];
                            const uploadFile = editedImage ? await fetch(editedImage).then(res => res.blob()) : null;

                            // console.log(file.originFileObj.name);

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
            // console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
            return mediaHashArray;
        } catch (error) {
            console.error("One or more media uploads failed:", error);
            return [];
        }
    };


    // const customRequest = async (onSuccess, onError) => {
    //     if (!imagehash || imagehash.length === 0) {
    //         onError("Image hash data not loaded");
    //         return [];
    //     }
    //     const token = imagehash.token;
    //     const account = imagehash.accountNumber;

    //     // Create an array of upload promises
    //     const uploadPromises = selectedFiles.map(async (file) => {
    //         const formData = new FormData();
    //         formData.append("file", file);

    //         try {
    //             let response, fbResponse;

    //             if (file.type.startsWith('image/')) {
    //                 // Upload image
    //                 response = await axios.post('https://www.testapi.adsgoat.in/upload', formData, {
    //                     headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
    //                 });

    //                 formData.append('filename', file.name);
    //                 formData.append('access_token', token);

    //                 fbResponse = await axios.post(`https://graph.facebook.com/v11.0/act_${account}/adimages`, formData, {
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
    //                 // Upload video to custom /upload API
    //                 response = await axios.post('https://www.testapi.adsgoat.in/upload', formData, {
    //                     headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
    //                 });

    //                 if (response.status !== 200) {
    //                     onError("error", response);
    //                     throw new Error("Video upload to custom API failed");
    //                 }

    //                 formData.append('access_token', token);

    //                 // Upload video to Facebook
    //                 fbResponse = await axios.post(`https://graph.facebook.com/v11.0/act_${account}/advideos`, formData, {
    //                     headers: { 'Content-Type': 'multipart/form-data' }
    //                 });

    //                 if (fbResponse.status === 200) {
    //                     const videoid = fbResponse?.data?.id;
    //                     console.log(fbResponse, response, token, videoid, "all are from the 2nd API");
    //                     await new Promise(resolve => setTimeout(resolve, 10000));

    //                     // Get thumbnail URL
    //                     const thumbnailResponse = await axios.get(`https://graph.facebook.com/v11.0/${videoid}`, {
    //                         params: {
    //                             access_token: token,
    //                             fields: 'thumbnails',
    //                             is_preferred: true
    //                         }
    //                     });

    //                     console.log('Thumbnail Response:', thumbnailResponse.data.thumbnails.data);
    //                     const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);

    //                     const uri = preferredThumbnail ? preferredThumbnail.uri : "";

    //                     onSuccess("ok", fbResponse);

    //                     return {
    //                         filename: response.data.imageUrl,  // Return filename from the custom API response
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
    //         // Wait for all uploads to complete
    //         const mediaHashArray = await Promise.all(uploadPromises);
    //         console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
    //         return mediaHashArray;
    //     } catch (error) {
    //         console.error("One or more media uploads failed:", error);
    //         return [];  // Return an empty array if any upload fails
    //     }
    // };


    const handleBeforeUpload = (file) => {
        return false; // Prevent auto-upload
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const onFinish = (values) => {
        const selectedPlatforms = selectedPublishers.reduce((acc, publisher) => {
            acc[publisher + '_positions'] = values.positions.filter(position =>
                positionOptions[publisher].map(option => option.key).includes(position)
            );
            return acc;
        }, {});
    //    console.log ({
    //         publisher_platforms: values.publisher_platforms,
    //         ...selectedPlatforms, ...values
    //     });

        setIsModalVisible(true);
        setFormValues({
            publisher_platforms: values.publisher_platforms,
            ...selectedPlatforms,
            ...values
        });
    };
    const handleOk = async () => {
        setLoading(true); // Start the spinner
        setIsModalVisible(false); // Close the modal

        if (formValues) {
            const onSuccess = (status, response) => {
                // console.log("Upload success:", response);
            };

            const onError = (status, error) => {
                console.error("Upload error:", error);
            };

            try {
                // console.log(levelWiseChanges, "changedFields on Submit");
                const ads = levelWiseChanges?.Ad?.Ads || [];
                // console.log(ads, "ads on Submit");
                const token = imagehash?.token;
                // const account = imagehash?.accountNumber;
                const adsData = await Promise.all(ads.map(async (file, index) => {
                    // console.log(file, "file on Submit");
                    if (file?.filename?.source === "media") {
                        if (file?.filename?.type.startsWith('image/') || file?.filename?.type.startsWith('video/')) {
                            // console.log(file, "file on Submit");
                            const formData = new FormData();
                            const uniqueId = uuidv4(); // Generate a unique ID for the file
                            const fileId = `${uniqueId}_${file?.filename.name}`;
                            // console.log(fileId, "fileId on Submit");
                            const editedImage = "";
                            const uploadFile = editedImage ? await fetch(editedImage).then(res => res.blob()) : null;

                            // console.log(file.originFileObj.name);

                            if (uploadFile) {
                                formData.append("file", uploadFile, `blob/${uniqueId}_${file?.filename.name}`);
                            } else {
                                formData.append("file", file?.filename.originFileObj, `blob/${uniqueId}_${file?.filename.originFileObj.name}`);
                            }

                            // console.log(formData);
                            let response, fbResponse;

                            if (file?.filename.type.startsWith('image/')) {
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
                                    // onError("Error: Image URL not returned from custom API");
                                    console.error("Image upload to custom API failed, imageUrl missing");
                                    // continue;
                                }

                                // console.log("Custom API response imageUrl:", response);
                                formData.append('access_token', token);

                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${accountNumber}/adimages`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                );

                                // console.log("Facebook API response:", fbResponse.data);

                                if (response.status === 200 && fbResponse.status === 200) {
                                    // onSuccess("ok", response);
                                    return ({
                                        id: file.id,
                                        AddName: file.AddName,
                                        filename: response.data.imageUrl,
                                        imag_hash: fbResponse.data?.images?.[fileId]?.hash,
                                    });
                                } else {
                                    // onError("error", response);
                                    console.error("Image upload failed");
                                }
                            } else if (file?.filename.type.startsWith('video/')) {
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
                                    // onError("error", response);
                                    console.error("Video upload to custom API failed");
                                    // continue;
                                }

                                formData.append('access_token', token);

                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${accountNumber}/advideos`,
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

                                    // onSuccess("ok", fbResponse);
                                    return ({
                                        id: file.id,
                                        AddName: file.AddName,
                                        filename: response.data.imageUrl,
                                        videoid: videoid,
                                        thambnailurl: uri,
                                    });
                                } else {
                                    // onError("error", fbResponse);
                                    console.error("Video upload to Facebook failed");
                                }
                            }
                        }
                    } else if (file?.filename?.url) {
                        if (file?.filename?.url?.endsWith('.png') || file?.filename?.url?.endsWith('.jpg') || file?.filename?.url?.endsWith(".jpeg") || file?.filename?.url?.endsWith('.mp4')) {
                            const formData = new FormData();
                            const response = await fetch(`https://app.vyaktimetrics.com/creatives/userfiles/s3?s3Url=${file?.filename?.url}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: localStorage.getItem("token"),
                                },
                            });

                            const uploadFile = await response.blob();
                            if (!(uploadFile instanceof Blob)) {
                                console.error("The fetched file is not a Blob:", uploadFile);
                                // continue;
                            }

                            formData.append("file", uploadFile, file?.filename.name);
                            // console.log(formData);

                            let fbResponse;
                            if (file?.filename?.url?.endsWith('.png') || file?.filename?.url?.endsWith('.jpg') || file?.filename?.url?.endsWith(".jpeg")) {
                                formData.append('file', uploadFile, file?.filename.name);
                                formData.append('access_token', token);
                                const fileName = file?.filename.name.split('/').pop();

                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${accountNumber}/adimages`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                );


                                if (fbResponse.status === 200) {
                                    // onSuccess("ok", response);
                                    return ({
                                        id: file.id,
                                        AddName: file.AddName,
                                        filename: file?.filename?.url,
                                        imag_hash: fbResponse.data?.images?.[fileName]?.hash,
                                    });
                                } else {
                                    // onError("error", response);
                                    console.error("Image upload failed");
                                }
                            } else if (file?.filename?.url?.endsWith('.mp4')) {
                                formData.append('access_token', token);
                                // console.log("formData", formData);
                                fbResponse = await axios.post(
                                    `https://graph.facebook.com/v20.0/act_${accountNumber}/advideos`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                );

                                // console.log("Facebook API response:", fbResponse.data);

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

                                    // onSuccess("ok", fbResponse);
                                    return ({
                                        id: file.id,
                                        AddName: file.AddName,
                                        filename: file?.filename?.url,
                                        videoid: videoid,
                                        thambnailurl: uri,
                                    });
                                } else {
                                    // onError("error", fbResponse);
                                    console.error("Video upload to Facebook failed");
                                }
                            }
                        }
                    }
                    else {
                        return ({
                            id: file.id,
                            AddName: file.AddName,
                        });
                    }


                }));

                // console.log("Ads Data:", adsData);

                const allLevelData = {
                    id: DuplicatedampaignData?.identifier,
                    Campaign: levelWiseChanges?.Campaign || {},
                    Adset: levelWiseChanges?.Adset || {},
                    Ad: {
                        ...(levelWiseChanges?.Ad || {}),
                        Ads: adsData || []
                    }
                };
                // console.log("All Level Values:", allLevelData);
                const payload = {
                    accountnumber: accountNumber,
                    identifier: DuplicatedampaignData?.identifier,
                    updates: allLevelData,
                    re_launch: DuplicatedampaignData?.fbstatus === "Live" ? true : false,
                };
                // console.log("Payload for Update:", payload);
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem("token"),
                };
                const updateData = await axios.post('https://www.testapi.adsgoat.in/api/updateCampaignData', payload, { headers });
                //https://www.testapi.adsgoat.in
                if (updateData.status === 200) {
                    message.open({
                        type: 'success',
                        content: "Campaign updated successfully",
                        className: theme === 'dark' ? 'dark-message' : '',
                    })
                    changeRRefrst();
                    setLevelWiseChanges({});
                    setActivePanelKey(null);
                    setChangedFields({});
                    setPanels([]);
                    setIsManual(false);
                    onClose();
                }



                // const imageHashArray = await customRequest(onSuccess, onError);
                // console.log("Image Hash Array:", imageHashArray);

                // if (imageHashArray.length > 0) {  // Only proceed if all images are uploaded successfully
                //     console.log("Image Hashes just before postData:", { ...formValues, imageHashes: imageHashArray });
                //     await postData({ ...formValues, imageHashes: imageHashArray });
                //     changeRRefrst();
                //     message.success("Campaign created successfully");
                // } else {
                //     message.error("Failed to upload one or more images. Campaign creation aborted.");
                // }
            } catch (error) {
                console.error("Error:", error);
                message.error("An error occurred during the campaign creation process.");
            } finally {
                setLoading(false);
            }

        }
    };

    const postData = async (values) => {
        // console.log("Form Values:", values);
        setLoading(true); // Start the spinner
        try {
            // console.log("Image Hashes before creating addlevel:", values.imageHashes);

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

            // console.log("Add Level Data:", moment(values.DatePicker.$d).utc().format("YYYY-MM-DDTHH:mm:ssZ"),);

            const data1 = {
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
                adsetlevel: {
                    AdsetName: values.AdsetName,
                    Daily_amount: values.DailyAdd_amount ? parseFloat(values.DailyAdd_amount) * 100 : "",
                    optimization_goal: values.optimization_goal,
                    billing_event: values.billing_event,
                    start_time: moment(values.DatePicker.$d).tz(imagehash.timeZone).format("YYYY-MM-DDTHH:mm:ssZ"),
                    action_source: values.action_source,
                    custom_event_type: values.custom_event_type,
                    pixel_id: values.pixel_id,
                    bid_amount: values.bid_amount ? parseFloat(values.bid_amount) : 0,
                    countries: values.countries,
                    Min_Age: values.Min_Age,
                    Max_Age: values.Max_Age,
                    Gender: parseInt(values.Gender),
                    locales: values.Language,
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
                    buying_type: "AUCTION",
                },
                addlevel: addLevelData
            };

            // console.log("Final Data to Submit:", data1);

            const response = await fetch('https://www.testapi.adsgoat.in/api/submitFormData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                },
                body: JSON.stringify(data1)
            });

            if (response.ok) {
                // console.log('Form data submitted successfully');
                setSelectedFilesFromCreatives([]);
                setSelectedFilesFromMedia([]);
                setSelectedFiles([]);
                onClose();
            } else {
                console.error('Failed to submit form data');
            }
        } catch (error) {
            console.error('Error submitting form data:', error);
        } finally {
            setLoading(false); // Stop the spinner after the process is complete
        }

    };

    // console.log("test:");

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
    // console.log(moment(), "currentDate")
    let initialValues = {
        Status: "PAUSED",
        // Objectives: "OUTCOME_LEADS",
        Special_categories: "NONE",
        Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        Status: "PAUSED",
        DatePicker: currentDate,
        optimization_goal: "OFFSITE_CONVERSIONS",
        billing_event: "IMPRESSIONS",
        action_source: "website",
        custom_event_type: "LEAD",
        countries: "US",
        Min_Age: "18",
        Max_Age: "65",
        Gender: "0",
        positions: [],
        publisher_platforms: [],
        Account_Number: accountis == "All" ? '' : accountis,
        Language: [6],
        Website_URL: websiteURL,
        placements: "Advance",
        DailyAdd_amount: adsetLevelDailyBudget,
        Description: "Find More",
        Caption: caption,
        Name: campaignName,
        AdsetName: campaignName,
        AddName: campaignName,
        pixel_id: imagehash?.pixelID,
        page_id: imagehash?.pageID

        // AddName: 
        // device_platforms: "mobile",

    };
    useEffect(() => {
        // Update the form fields when accountis changes
        form.setFieldsValue({ Account_Number: accountis });
    }, [accountis, form]);


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
        setSelectedPositions({});    // Clear selected positions
        setIsFormComplete(false);    // Reset form completion state
        setCampaignName('');
        setAddName('');
        setAdsetLevelDailyBudget(0);
        setCampaignLevelDailyBudget(0);
        onClose(); // Call onClose handler to close the drawer
        setActiveKey(['1']);
        setLevelWiseChanges({});
        setActivePanelKey(null);
        setChangedFields({});
        setPanels([]);
        setIsManual(false); // Reset manual mode
    };

    const handleSelectChange = (value) => {
        setSelectedOption(value);
    };

    const onClickCreativesDrawer = (panelKey) => {
        // console.log("Creatives Drawer Opened");
        // const onClickCreativesDrawer = (panelKey) => {
        //     setActivePanelKey(panelKey);
        //     setOpenCreativesDrawer(true);
        //   };
        setActivePanelKey(panelKey);
        setOpenCreativesDrawer(true);
    }

    const selectedFilesData = (data) => {
        // console.log("Selected Files Data:", data);
        setSelectedFiles(prev => [...prev, ...data.map((file, index) => {
            return ({
                uid: file.uid || `-${index + 1}`,
                name: file?.name,
                status: 'done',
                type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
                url: file?.url,
            })
        })]);
        setSelectedFilesFromCreatives(prev => [...prev, ...data.map((file, index) => {
            return ({
                uid: file.uid || `-${index + 1}`,
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
        if (!activePanelKey || !data || data.length === 0) return;

        // Only take the first file
        const file = data[0];

        const enrichedFile = {
            uid: file.uid || `-${index + 1}`,
            name: file?.name,
            thumbUrl: file.thumbUrl || file.url,
            status: 'done',
            type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
            url: file?.url,
        };

        const enrichedFiles = [enrichedFile]; // wrap in array

        setPanels((prev) =>
            prev.map((panel) =>
                panel.key === activePanelKey
                    ? {
                        ...panel,
                        selectedFiles: enrichedFiles,
                        selectedFilesFromCreatives: enrichedFiles,
                        selectedFilesFromMedia: [],
                    }
                    : panel
            )
        );



        // ✅ Update form only for this panel
        form.setFieldsValue({ [`MediaContent_${activePanelKey}`]: enrichedFiles });
        form.validateFields([`MediaContent_${activePanelKey}`]);

        // ✅ Update setLevelWiseChanges
        const currentPanel = panels.find(p => p.key === activePanelKey);
        const fileData = enrichedFile; // or data[0], your enriched object

        setLevelWiseChanges(prev => {
            const newEntry = {
                id: currentPanel.id,
                filename: fileData,
                AddName: currentPanel.AddName,
            };

            const existingAd = prev?.Ad || {};
            const existingAds = existingAd?.Ads || [];

            const updatedAds = [
                ...existingAds.filter(item => item.id !== newEntry.id),
                newEntry,
            ];

            return {
                ...prev,
                Ad: {
                    ...existingAd,       // ✅ Preserve other keys inside Ad
                    Ads: updatedAds,     // ✅ Update only Ads array
                },
            };
        });



    }

    // console.log("Selected Files:", selectedFiles);

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

    // console.log(changedFields, "changedFields");
    // console.log(levelWiseChanges, "levelWiseChanges");

    return (
        <Modal
            title={`${DuplicatedampaignData ? DuplicatedampaignData.campaign_name : "Edit Campaign"}`}
            className={` ${theme === 'dark' ? 'dark-theme-modal' : ''}`}

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
            {loading ? (
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
            ) : (
                <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues} className={theme === 'dark' ? 'form-dark' : 'form-light'}>
                    <Collapse accordion activeKey={activeKey} // Bind active key state
                        onChange={(key) => setActiveKey([key])} className={theme === 'dark' ? 'custom-collapse-dark' : 'custom-collapse-light'} >
                        <Panel header="CAMPAIGN LEVEL" key="1" style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
                            <div style={{ display: "flex" }}>
                                <Form.Item
                                    name={["Campaign", "Account_Number"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Account number</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.16 }}>
                                    <Input value={accountNumber} onChange={Accountchange} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                </Form.Item>
                                <Form.Item
                                    name={["Campaign", "Name"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Campaign name</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.25, marginLeft: '1%' }}>
                                    <Input onChange={handleNameChange}
                                        style={{ width: "100%", }}
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Campaign", "Objectives"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Objectives</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.15, marginLeft: "1.5%" }}>
                                    <Select
                                        // onChange={getpixelandpageid}
                                        variant="filled"
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads", title: "" },
                                            { value: "OUTCOME_SALES", label: "Sales", title: "" },
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement", title: "" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness", title: "" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic", title: "" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App promotion", title: "" }

                                        ]}
                                        disabled={true} // Disable the select field
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Campaign", "Special_categories"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Categories</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.15, marginLeft: "1%" }}>
                                    <Select

                                        variant="filled"
                                        mode="multiple"
                                        allowClear
                                        options={[
                                            { value: "HOUSING", label: "Housing", title: "" },
                                            { value: "FINANCIAL_PRODUCTS_SERVICES", label: "Credit", title: "" },
                                            { value: "EMPLOYMENT", label: "Employment", title: "" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics", title: "" },
                                            { value: "NONE", label: "None", title: "" }

                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme-category' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Campaign", "Bid_strategy"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Bid strategy</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 0.15, marginLeft: "1%" }}>
                                    <Select
                                        variant="filled"
                                        options={[
                                            { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume", title: "" },
                                            { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap", title: "" },
                                            { value: "COST_CAP", label: "Cost per Result Goal", title: "" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal", title: "" }
                                        ]}
                                        onChange={handleBidStrategyChange}
                                        disabled={true}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Campaign", "Daily_amount"]}
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
                                            style={{
                                                backgroundColor: adsetLevelDailyBudget !== 0 ? '#f0f0f0' : 'transparent',
                                                borderRadius: '6px',
                                                borderColor: adsetLevelDailyBudget !== 0 ? 'transparent' : undefined,
                                                fontSize: '14px',
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                // width: '110px',
                                                flex: 0.2,
                                                boxSizing: 'border-box'
                                            }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Tooltip>
                                </Form.Item> {/*pk*/}
                                <Form.Item
                                    name={["Campaign", "Status"]}
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
                                            { value: "ACTIVE", label: "ACTIVE", title: "" },
                                            { value: "PAUSED", label: "PAUSE", title: "" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                            </div>
                        </Panel>

                        <Panel header="ADSET LEVEL" key="2" forceRender>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "17px" }}>
                                <Form.Item
                                    name={["Adset", "AdsetName"]}
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
                                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "optimization_goal"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 120px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "OFFSITE_CONVERSIONS", label: "Conversions", title: "" },
                                            { value: "LINK_CLICKS", label: "Clicks", title: "" },
                                            { value: "REACH", label: "Reach", title: "" },
                                            { value: "VALUE", label: "Value", title: "" }
                                        ]}
                                        disabled={true}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "billing_event"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 120px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "IMPRESSIONS", label: "Impressions", title: "" },
                                            { value: "VALUE", label: "Value", title: "" }
                                        ]}
                                        disabled={true}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "DatePicker"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Start time</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px', color: theme === 'dark' ? '#fff' : '#000', }}
                                    initialValue={currentDate}
                                >
                                    <DatePicker
                                        className={`green-border-picker ${theme === 'dark' ? 'custom-datepicker-dark' : 'custom-datepicker-light'}`}
                                        showTime
                                        disabled={true} dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}
                                        //                                 onChange={(value, dateString) => {
                                        //     console.log("Local Time:", dateString)
                                        //     console.log("UTC ISO:", moment(value).utc().format("YYYY-MM-DDTHH:mm:ssZ"))
                                        //   }}
                                        style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "action_source"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 120px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "website", label: "Website", title: "" },
                                            { value: "email", label: "Email", title: "" },
                                            { value: "app", label: "App", title: "" },
                                            { value: "phone_call", label: "Phone Call", title: "" }
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "custom_event_type"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 120px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "LEAD", label: "Lead", title: "" },
                                            { value: "PURCHASE", label: "Purchase", title: "" },
                                            { value: "SEARCH", label: "Search", title: "" },
                                            { value: "CONTACT", label: "Contact", title: "" },
                                        ]}
                                        disabled={true}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "pixel_id"]}
                                    initialValue={imagehash?.pixelID}
                                    label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Input
                                        disabled={true} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />

                                </Form.Item>
                                {/*pk*/}
                                <Form.Item
                                    name={["Adset", "DailyAdd_amount"]} // Make sure this name matches the field you want to capture
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ flex: '1 1 200px' }}
                                >
                                    <Tooltip title={campaignLevelDailyBudget !== 0 ? "You have enabled daily budget in the Campaign Level" : ""}>
                                        <InputNumber
                                            type="number"
                                            placeholder="$"
                                            value={adsetLevelDailyBudget}
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
                                {showBidAmount && (
                                    <Form.Item
                                        name={["Adset", "bid_amount"]}
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
                                        style={{ flex: '1 1 140px', marginRight: '67%' }}
                                    >
                                        <InputNumber
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
                                            style={{ color: theme === "dark" ? "#fff" : "#000", width: '140px' }}
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Form.Item>
                                )}
                            </div>
                            <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                <Form.Item
                                    name={["Adset", "countries"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 140px' }}
                                >
                                    <Select
                                        // options={[
                                        //     { value: "US", label: "United States", title: "" },
                                        //     { value: "GB", label: "United Kingdom", title: "" },
                                        //     { value: "AU", label: "Australia", title: "" },
                                        //     { value: "IN", label: "India", title: "" },
                                        //     { value: "AE", label: "United Arab Emirates", title: "" },
                                        //     { value: "CA", label: "Canada", title: "" },
                                        //     { value: "DE", label: "Germany", title: "" },
                                        //     { value: "FR", label: "France", title: "" },
                                        //     { value: "JP", label: "Japan", title: "" },
                                        //     { value: "CN", label: "China", title: "" },
                                        //     { value: "BR", label: "Brazil", title: "" },
                                        //     { value: "ZA", label: "South Africa", title: "" },
                                        //     { value: "RU", label: "Russia", title: "" },
                                        //     { value: "IT", label: "Italy", title: "" },
                                        //     { value: "ES", label: "Spain", title: "" },
                                        //     { value: "SG", label: "Singapore", title: "" },
                                        //     { value: "NZ", label: "New Zealand", title: "" },
                                        //     { value: "MX", label: "Mexico", title: "" }
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
                                             {value: "NO", label: "Norway",title:""},
                                            { value: "PL", label: "Poland", title: "" },
                                            { value: "PT", label: "Portugal", title: "" },
                                            { value: "RO", label: "Romania", title: "" },
                                            { value: "SK", label: "Slovakia", title: "" },
                                            { value: "SI", label: "Slovenia", title: "" },
                                            { value: "SE", label: "Sweden", title: "" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "Min_Age"]}
                                    label={<span style={{ color: "#B4B4B4" }}>Min age</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "18", label: "18", title: "" },
                                            { value: "25", label: "25", title: "" },
                                            { value: "35", label: "35", title: "" },
                                            { value: "40", label: "40", disabled: true, title: "" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "Max_Age"]}
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
                                        options={[
                                            { value: "20", label: "20", title: "" },
                                            { value: "30", label: "30", title: "" },
                                            { value: "65", label: "65+", title: "" },
                                            { value: "80", label: "80", disabled: true, title: "" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "Gender"]}
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
                                        options={[
                                            { value: "0", label: "All", title: "" },
                                            { value: "1", label: "Male", title: "" },
                                            { value: "2", label: "Female", title: "" },
                                        ]}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["Adset", "Language"]}

                                    label={<span style={{ color: "#B4B4B4" }}>Language</span>}
                                    rules={[{ required: true, message: "Please select an option!" }]}
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        mode="multiple"
                                        showSearch
                                        placeholder="Select Language"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().includes(input.toLowerCase())
                                        }
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
                                    name={["Adset", "placements"]}
                                    rules={[{ required: true, message: 'Please select a mode!' }]}

                                >
                                    <Select placeholder="Select a mode" onChange={handleModeChange} disabled={true}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}>
                                        <Option value="Advance" >Advance</Option>
                                        <Option value="manual">Manual</Option>

                                    </Select>
                                </Form.Item>
                                {isManual && (
                                    <>
                                        <Form.Item
                                            name={["Adset", "publisher_platforms"]}
                                            label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                            rules={[{ required: true, message: "Please select an option!" }]}
                                            style={{ flex: '1 1 210px' }}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Platforms"
                                                onChange={handlePublisherChange}
                                                value={selectedPublishers}
                                                disabled={true}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            >
                                                {publisherOptions.map(option => (
                                                    <Option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name={["Adset", "positions"]}
                                            label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
                                            rules={[{ required: true, message: "Please select an option!" }]}
                                            style={{ flex: '1 1 210px' }}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Positions"
                                                value={selectedPositions}
                                                onChange={handlePositionChange}
                                                disabled={true}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            >
                                                {selectedPublishers.length > 0 && getPositionOptions()?.map(position => (
                                                    <Option key={`${position.key}_${position.label}`} value={position.key}>
                                                        {position.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name={["Adset", "device_platforms"]}
                                            label={<span style={{ color: "#B4B4B4" }}>Device</span>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select an option!",
                                                },
                                            ]}
                                            style={{ flex: '1 1 210px' }}
                                        >
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                placeholder="Please select"
                                                options={[
                                                    { value: "mobile", label: "Mobile", title: "" },
                                                    { value: "desktop", label: "Desktop", title: "" }
                                                ]}
                                                disabled={true}
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                            />
                                        </Form.Item>
                                    </>
                                )}
                            </div>
                        </Panel>

                        <Panel header="AD LEVEL" key="3">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: "70%", marginRight: "5%" }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>

                                        <Collapse style={{ width: '100%' }}>
                                            {panels.map((panel) => (
                                                <Panel header={panel.AddName || "Untitled"} key={panel.key} style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
                                                            {/* Ad Name Input */}
                                                            <Form.Item
                                                                label={<span style={{ color: "#B4B4B4" }}>Ad name</span>}
                                                                name={`AddName_${panel.key}`}
                                                                rules={[{ required: true, message: 'Please enter Ad Name' }]}
                                                                initialValue={panel.AddName || ""}
                                                            >
                                                                <Input
                                                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                                                    value={panel.AddName}
                                                                    onChange={(e) => {
                                                                        const newAddName = e.target.value;

                                                                        // ✅ Update local panel state
                                                                        updatePanel(panel.key, "AddName", newAddName);

                                                                        // ✅ Sync AddName in setLevelWiseChanges
                                                                        setLevelWiseChanges((prev) => {
                                                                            const existingAd = prev.Ad || {};
                                                                            const existingAds = existingAd.Ads || [];

                                                                            const adIndex = existingAds.findIndex(ad => ad.id === panel.id);
                                                                            let updatedAds;

                                                                            if (adIndex >= 0) {
                                                                                // If ad exists, update it
                                                                                updatedAds = existingAds.map((ad) =>
                                                                                    ad.id === panel.id ? { ...ad, AddName: newAddName } : ad
                                                                                );
                                                                            } else {
                                                                                // If ad doesn't exist, add it
                                                                                updatedAds = [...existingAds, { id: panel.id, AddName: newAddName }];
                                                                            }

                                                                            return {
                                                                                ...prev,
                                                                                Ad: {
                                                                                    ...existingAd,
                                                                                    Ads: updatedAds,
                                                                                },
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder="Enter Ad Name"
                                                                    style={{ width: "30%" }}
                                                                />

                                                            </Form.Item>

                                                            {/* Select Source Dropdown */}
                                                            <Form.Item label={<span style={{ color: "#B4B4B4" }}>Select source</span>}>
                                                                <Select
                                                                    value={panel.selectedOption}
                                                                    onChange={(value) => {
                                                                        updatePanel(panel.key, "selectedOption", value);
                                                                        form.validateFields([`MediaContent_${panel.key}`]);
                                                                    }}
                                                                    style={{ marginBottom: 16, width: "30%" }}
                                                                    disabled={!(panel.selectedFiles.length === 0 && panel.selectedFilesFromCreatives.length === 0 && panel.selectedFilesFromMedia.length === 0)}
                                                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                                    className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                                                >
                                                                    <Option value="upload">Upload</Option>
                                                                    <Option value="creative">Creative library</Option>
                                                                </Select>
                                                            </Form.Item>

                                                            {/* File Selection Section with Validation */}
                                                            <Form.Item
                                                                name={`MediaContent_${panel.key}`}
                                                                rules={[
                                                                    {
                                                                        validator: async () => {
                                                                            const current = panels.find(p => p.key === panel.key);
                                                                            if (
                                                                                (current.selectedOption === "upload" && current.selectedFilesFromMedia.length === 0) ||
                                                                                (current.selectedOption === "creative" && current.selectedFilesFromCreatives.length === 0)
                                                                            ) {
                                                                                throw new Error("Please select Upload!");
                                                                            }
                                                                            return Promise.resolve();
                                                                        },
                                                                    },
                                                                ]}
                                                            >
                                                                <div className="custom-dark-mode"  >
                                                                    {/* Upload Section */}
                                                                    {panel.selectedOption === "upload" && (
                                                                        <Upload
                                                                            key={`${panel.key}-${panel.selectedFilesFromMedia.map(f => f.uid).join(",")}`} // force re-render
                                                                            beforeUpload={() => false}
                                                                            multiple
                                                                            maxCount={1} // ensures only one file is accepted at UI level
                                                                            listType="picture"
                                                                            accept="image/*,video/*"
                                                                            fileList={panel.selectedFilesFromMedia}
                                                                            onChange={(info) => {
                                                                                const firstFileRaw = info.fileList[0]; // only take the first file
                                                                                if (!firstFileRaw) return;

                                                                                const enrichedFile = {
                                                                                    ...firstFileRaw,
                                                                                    uid: firstFileRaw.uid || `media-${Date.now()}`,
                                                                                    source: "media",
                                                                                    thumbUrl:
                                                                                        firstFileRaw.thumbUrl ||
                                                                                        (firstFileRaw.originFileObj
                                                                                            ? URL.createObjectURL(firstFileRaw.originFileObj)
                                                                                            : undefined),
                                                                                };

                                                                                const newFiles = [enrichedFile]; // only the first file in array form

                                                                                // ✅ Update state
                                                                                updatePanel(panel.key, "selectedFilesFromMedia", newFiles);
                                                                                updatePanel(panel.key, "selectedFilesFromCreatives", []);
                                                                                updatePanel(panel.key, "selectedFiles", newFiles);
                                                                                // ✅ Update setLevelWiseChanges
                                                                                const fileData = enrichedFile; // based on local upload

                                                                                setLevelWiseChanges(prev => {
                                                                                    const newEntry = {
                                                                                        id: panel.id,
                                                                                        filename: enrichedFile,
                                                                                        AddName: panel.AddName,
                                                                                    };

                                                                                    const existingAd = prev.Ad || {};
                                                                                    const existingAds = existingAd.Ads || [];

                                                                                    const updatedAds = [
                                                                                        ...existingAds.filter(item => item.id !== panel.id),
                                                                                        newEntry,
                                                                                    ];

                                                                                    return {
                                                                                        ...prev,
                                                                                        Ad: {
                                                                                            ...existingAd,
                                                                                            Ads: updatedAds,
                                                                                        },
                                                                                    };
                                                                                });
                                                                                // }}

                                                                                form.setFieldsValue({ [`MediaContent_${panel.key}`]: newFiles });
                                                                                form.validateFields([`MediaContent_${panel.key}`]);
                                                                            }}

                                                                            onRemove={(fileToRemove) => {
                                                                                const filtered = panel.selectedFilesFromMedia.filter(
                                                                                    (f) => f.uid !== fileToRemove.uid
                                                                                );

                                                                                updatePanel(panel.key, "selectedFilesFromMedia", filtered);
                                                                                updatePanel(panel.key, "selectedFiles", filtered);

                                                                                form.setFieldsValue({ [`MediaContent_${panel.key}`]: filtered });
                                                                                form.validateFields([`MediaContent_${panel.key}`]);

                                                                                // ❌ Optionally remove from setLevelWiseChanges if no file remains
                                                                                if (filtered.length === 0) {
                                                                                    setLevelWiseChanges(prev => {
                                                                                        const remaining = (prev?.Ad?.Ads || []).filter(item => item.id !== panel.id);
                                                                                        return {
                                                                                            ...prev,
                                                                                            Ad: {
                                                                                                Ads: remaining,
                                                                                            },
                                                                                        };
                                                                                    });
                                                                                }

                                                                                return true;
                                                                            }}
                                                                        >
                                                                            <Button
                                                                                icon={<UploadOutlined />}
                                                                                disabled={
                                                                                    !(
                                                                                        panel.selectedFiles.length === 0 &&
                                                                                        panel.selectedFilesFromCreatives.length === 0 &&
                                                                                        panel.selectedFilesFromMedia.length === 0
                                                                                    )
                                                                                }
                                                                                className="dark-icon-button" style={{ color: theme === "dark" ? "white" : "#000" }}
                                                                            >
                                                                                Select files
                                                                            </Button>
                                                                        </Upload>
                                                                    )}


                                                                    {/* Creative Library Section */}
                                                                    {panel.selectedOption === "creative" && (
                                                                        <div>
                                                                            <Button
                                                                                disabled={
                                                                                    !(
                                                                                        panel.selectedFiles.length === 0 &&
                                                                                        panel.selectedFilesFromCreatives.length === 0 &&
                                                                                        panel.selectedFilesFromMedia.length === 0
                                                                                    )
                                                                                }
                                                                                icon={<UploadOutlined />}
                                                                                onClick={() =>
                                                                                    onClickCreativesDrawer(panel.key)
                                                                                }
                                                                                className="dark-icon-button" style={{ color: theme === "dark" ? "white" : "#000" }}
                                                                            >
                                                                                Select files
                                                                            </Button>

                                                                            {panel.selectedFilesFromCreatives?.length > 0 && (
                                                                                <div style={{ marginTop: "10px" }}>
                                                                                    {panel.selectedFilesFromCreatives.map((file) => (
                                                                                        <div
                                                                                            key={file.uid}
                                                                                            style={{
                                                                                                display: "flex",
                                                                                                alignItems: "center",
                                                                                                marginBottom: 8,
                                                                                            }}
                                                                                        >
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
                                                                                            <DeleteOutlined
                                                                                                onClick={() => {
                                                                                                    const current = panels.find((p) => p.key === panel.key);
                                                                                                    const updated = current.selectedFilesFromCreatives.filter(
                                                                                                        (f) => f.uid !== file.uid
                                                                                                    );

                                                                                                    updatePanel(panel.key, "selectedFilesFromCreatives", updated);
                                                                                                    updatePanel(panel.key, "selectedFiles", updated);

                                                                                                    form.setFieldsValue({
                                                                                                        [`MediaContent_${panel.key}`]: updated,
                                                                                                    });
                                                                                                    form.validateFields([`MediaContent_${panel.key}`]);
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
                                                        <div>
                                                            {panel.selectedFiles.map((file) => (
                                                                <div
                                                                    key={file.uid}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        marginBottom: 8,
                                                                    }}
                                                                >
                                                                    {file.type?.startsWith("image/") && (
                                                                        <img
                                                                            // style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                            src={
                                                                                file.originFileObj
                                                                                    ? URL.createObjectURL(file.originFileObj)
                                                                                    : file.url
                                                                            }
                                                                            alt="preview"
                                                                            style={{
                                                                                maxWidth: '100%', maxHeight: '100%',
                                                                                width: 300,
                                                                                height: 300,
                                                                                objectFit: "contain",
                                                                                borderRadius: 4,
                                                                                marginLeft: 8,

                                                                            }}

                                                                        />
                                                                    )}
                                                                    {file.type?.startsWith("video/") &&
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
                                                                    }

                                                                </div>))}
                                                        </div>
                                                    </div>
                                                    {/* <div key={index} className="container-ad-preview">
                                                        <div className="ad-preview" style={{ width: "350px" }}>
                                                            <div className="ad-heading">
                                                                <div className="img">
                                                                    {panel?.url?.endsWith('.png') || panel?.url?.endsWith('.jpg') || panel?.url?.endsWith(".jpeg") ? (
                                                                        <img
                                                                            src={panel?.url}
                                                                            alt="page id"
                                                                            width="40"
                                                                            height="40"
                                                                            style={{ objectFit: 'cover' }}
                                                                        />
                                                                    ) : panel?.url?.endsWith('.mp4') ? (
                                                                        <video
                                                                            src={file?.url}
                                                                            alt="page id"
                                                                            width="40"
                                                                            height="30"
                                                                            style={{ objectFit: 'cover' }}
                                                                            muted 
                                                                        />
                                                                    ) : 
                                                                    panel?.type?.startsWith('image/') ? (
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
                                                                            muted 
                                                                        />
                                                                    )
                                                                    }
                                                                </div>

                                                                <div className="title">
                                                                    <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
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
                                                                <div className="close">
                                                                    <CloseOutlined style={{ fontSize: "20px" }} />
                                                                </div>
                                                                <div className="moreoptions">
                                                                    <MoreOutlined style={{ fontSize: "20px" }} />
                                                                </div>
                                                            </div>
                                                            <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                                {primaryText}
                                                            </div>
                                                            <div className="ad-image" style={{ width: '350px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {panel?.url?.endsWith('.png') || panel?.url?.endsWith('.jpg') || panel?.url?.endsWith(".jpeg") ? (
                                                                        <img
                                                                            src={panel?.url}
                                                                            alt="ad content"
                                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                        />
                                                                    ) : panel?.url?.endsWith('.mp4') ? (
                                                                        <video
                                                                        controls
                                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                        >
                                                                            <source src={panel?.url} />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    ) 
                                                                    :
                                                                    file?.type?.startsWith('image/') ? (
                                                                        <img
                                                                            src={editedImages[file?.name] ? editedImages[file?.name]:  file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url} // Use edited image if available
                                                                            alt="ad content"
                                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                        />
                                                                    ) : 
                                                                    (
                                                                        <video
                                                                            controls
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
                                                                    <div className="link">{caption}</div>
                                                                    <div className="title">{headline}</div>
                                                                    <div className="desc">{description}</div>
                                                                </div>
                                                                <div className="ad-button">
                                                                    <button type="button">Learn More</button>
                                                                </div>
                                                            </div>
                                                            <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
                                                                {websiteURL}
                                                            </a>                                                <div className="icons">
                                                                <div className="like">
                                                                    <LikeOutlined style={{ fontSize: "20px" }} />
                                                                    Like
                                                                </div>
                                                                <div className="comment">
                                                                    <CommentOutlined style={{ fontSize: "20px" }} />
                                                                    Comment
                                                                </div>
                                                                <div className="share">
                                                                    <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                                    Share
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </Panel>
                                            ))}
                                        </Collapse>




                                        {/* <div style={{display:'flex', flexDirection:'column'}}>
                                        <Form.Item
                                            label={<span style={{ color: "#B4B4B4" }}>Select Source</span>}
                                            style={{ flex: 1 }}
                                            >
                                            <Select
                                                defaultValue={selectedOption}
                                                onChange={(value) => {
                                                handleSelectChange(value);
                                                form.validateFields(["MediaContent"]); // Revalidate when switching source
                                                }}
                                                style={{ marginBottom: 16 }}
                                            >
                                                <Option value="upload">Upload</Option>
                                                <Option value="creative">Creative Library</Option>
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
                                                    <div style={{ display: selectedOption === "upload" ? "block" : "none" }}>
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
                                                            <Button icon={<UploadOutlined />}>Select Files</Button>
                                                        </Upload>
                                                    </div>

                                                    {selectedOption === "creative" && (
                                                    <div>
                                                        <Button icon={<UploadOutlined />} onClick={onClickCreativesDrawer}>
                                                        Select Files
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
                                                                    }}
                                                                >
                                                                    {file.name}
                                                                </span>

                                                                

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
                                    </div> */}


                                    </div>
                                    <Form.Item
                                        name={["Ad", "page_id"]}
                                        initialValue={imagehash?.pageID}
                                        label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select an option!",
                                            },
                                        ]}
                                        style={{ flex: 3, marginTop: "1%" }}
                                    // Disable the input field
                                    >
                                        <Input style={{ width: "15%" }} disabled={true} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                    </Form.Item>
                                    {/* <Form.Item
                                        name="AddName"
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

                                        />
                                    </Form.Item> */}
                                    <Form.Item
                                        label={<span style={{ color: "#B4B4B4" }}>Primary text</span>}
                                        name={["Ad", "message"]}
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
                                            placeholder={<span style={{ color: "#B4B4B4" }}>Primary text</span>}
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
                                        name={["Ad", "headline"]}
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
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ color: "#B4B4B4" }}>Description</span>}
                                        name={["Ad", "Description"]}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please enter a Description!",
                                            },
                                        ]}
                                        required
                                    // tooltip="This is a required field"
                                    >
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
                                                    <span style={{ color: "#B4B4B4" }} >Website_URL</span>
                                                    {/* <Tooltip title="This is a required field">
                                                        <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'pointer' }} />
                                                    </Tooltip> */}
                                                </div>
                                                <EditOutlined style={{ cursor: 'pointer' }} onClick={onClickEdit} />
                                            </div>
                                        }
                                        labelCol={{ style: { width: '100%' } }}  // Makes the label full width
                                        wrapperCol={{ style: { width: '100%' } }}  // Ensures TextArea takes the same full width
                                        name={["Ad", "Website_URL"]}
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
                                        label={<span style={{ color: "#B4B4B4" }}>Display link</span>}
                                        name={["Ad", "Caption"]}
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
                                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                        />
                                    </Form.Item>
                                    <Modal
                                        title="URL builder"
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

                                {/* <div style={{ flex: "30%" }}>
                                        {selectedFiles && selectedFiles.length > 0 ? (
                                            selectedFiles.map((file, index) => (
                                                <Badge
                                                    count={
                                                        (file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") || file?.url?.endsWith('.mp4')) ? 
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
                                                        <div className="ad-preview" style={{ width: "350px" }}>
                                                            <div className="ad-heading">
                                                                <div className="img">
                                                                    {file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") ? (
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
                                                                            muted 
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
                                                                            muted 
                                                                        />
                                                                    )
                                                                    }
                                                                </div>

                                                                <div className="title">
                                                                    <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
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
                                                                <div className="close">
                                                                    <CloseOutlined style={{ fontSize: "20px" }} />
                                                                </div>
                                                                <div className="moreoptions">
                                                                    <MoreOutlined style={{ fontSize: "20px" }} />
                                                                </div>
                                                            </div>
                                                            <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                                {primaryText}
                                                            </div>
                                                            <div className="ad-image" style={{ width: '350px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") ? (
                                                                        <img
                                                                            src={file?.url}
                                                                            alt="ad content"
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
                                                                    ) 
                                                                    :
                                                                    file?.type?.startsWith('image/') ? (
                                                                        <img
                                                                            src={editedImages[file?.name] ? editedImages[file?.name]:  file?.originFileObj ? URL.createObjectURL(file.originFileObj) : file?.url} // Use edited image if available
                                                                            alt="ad content"
                                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                        />
                                                                    ) : 
                                                                    (
                                                                        <video
                                                                            controls
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
                                                                    <div className="link">{caption}</div>
                                                                    <div className="title">{headline}</div>
                                                                    <div className="desc">{description}</div>
                                                                </div>
                                                                <div className="ad-button">
                                                                    <button type="button">Learn More</button>
                                                                </div>
                                                            </div>
                                                            <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
                                                                {websiteURL}
                                                            </a>                                                <div className="icons">
                                                                <div className="like">
                                                                    <LikeOutlined style={{ fontSize: "20px" }} />
                                                                    Like
                                                                </div>
                                                                <div className="comment">
                                                                    <CommentOutlined style={{ fontSize: "20px" }} />
                                                                    Comment
                                                                </div>
                                                                <div className="share">
                                                                    <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                                    Share
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Badge>

                                            ))
                                        ) : null
                                        // (
                                        //     <div className="container-ad-preview">
                                        //         <div className="ad-preview">
                                        //             <div className="ad-heading">
                                        //                 <div className="filename">
                                        //                     <img
                                        //                         src={initialValues?.filename}
                                        //                         alt="page id"
                                        //                         width="40"
                                        //                         height="40"
                                        //                     />
                                        //                 </div>
                                        //                 <div className="title">
                                        //                     <div className="main">{"Facebook Page"}</div>
                                        //                     <div className="sub">
                                        //                         Sponsored <GlobalOutlined style={{ opacity: "0.6" }} />
                                        //                     </div>
                                        //                 </div>
                                        //                 <div className="close">
                                        //                     <CloseOutlined style={{ fontSize: "20px" }} />
                                        //                 </div>
                                        //                 <div className="moreoptions">
                                        //                     <MoreOutlined style={{ fontSize: "20px" }} />
                                        //                 </div>
                                        //             </div>
                                        //             <div className="ad-desc">{"adMessage"}</div>
                                        //             <div className="ad-image">
                                        //                 <img
                                        //                     src={initialValues?.filename}
                                        //                     alt="ad content"
                                        //                 />
                                        //             </div>
                                        //             <div className="ad-cta">
                                        //                 <div className="details">
                                        //                     <div className="link">{"adCaption"}</div>
                                        //                     <div className="title">{"adName"}</div>
                                        //                     <div className="desc">{"adDesc"}</div>
                                        //                 </div>
                                        //                 <div className="ad-button">
                                        //                     <button type="button">Learn More</button>
                                        //                 </div>
                                        //             </div>
                                        //             <div className="icons">
                                        //                 <div className="like">
                                        //                     <LikeOutlined style={{ fontSize: "20px" }} />
                                        //                     Like
                                        //                 </div>
                                        //                 <div className="comment">
                                        //                     <CommentOutlined style={{ fontSize: "20px" }} />
                                        //                     Comment
                                        //                 </div>
                                        //                 <div className="share">
                                        //                     <ShareAltOutlined style={{ fontSize: "20px" }} />
                                        //                     Share
                                        //                 </div>
                                        //             </div>
                                        //         </div>
                                        //     </div>
                                        // )
                                        }
                                    </div> */}

                            </div>


                        </Panel>
                    </Collapse>
                    {/* <Form.Item label=" ">
                        {isFormComplete && (
                            <Button type="primary" htmlType="submit" style={{ background: '#21c55d', minWidth: '200px' }}>
                                Submit
                            </Button>
                        )}
                    </Form.Item> */}
                    <Form.Item label=" ">
                        {/* {isFormComplete && ( */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <Button
                                type="primary"
                                style={{ background: '#91C25F', minWidth: '200px', borderWidth: '0px', border: '1px solid #4caf50' }}
                                onClick={async () => {
                                    try {
                                        const values = await form.validateFields(); // Validates all form fields

                                        // Clear existing validation errors
                                        // console.log("hi");

                                        if (((adsetLevelDailyBudget === 0 && campaignLevelDailyBudget === 0) ||
                                            isNaN(adsetLevelDailyBudget) || isNaN(campaignLevelDailyBudget))) {
                                            // Throw a validation error manually in the same format as AntD expects
                                            throw {
                                                errorFields: [
                                                    {
                                                        name: ['Daily_amount'],
                                                        errors: ['Daily budget cannot be zero on both Adset and Campaign levels'],
                                                    },
                                                ],
                                            };
                                        }
                                        setSubmitErrors([]);
                                        // Optionally trigger your existing logic
                                        // onFinish(values); // If you want to reuse your existing logic

                                        // Show confirmation modal

                                        setIsModalVisible(true);
                                        // Save values if needed
                                        setFormValues(values);
                                    } catch (err) {
                                        const allErrors = err?.errorFields?.map((field) => ({
                                            name: field.name?.[0],       // field name
                                            message: field.errors?.[0],  // validation message
                                        }));
                                        // console.log("Errors:", allErrors);
                                        setSubmitErrors(allErrors);
                                    }
                                }}
                            >
                                Submit
                            </Button>

                            {/* Show validation messages beside button */}
                            {(submitErrors?.length) > 0 && (
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
            )}


            {openCreativesDrawer && (
                <Drawer
                    title="Select creatives"
                    width="100%"
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
        </Modal>
    );
};

export default EditAllLevelDataDrawer;
