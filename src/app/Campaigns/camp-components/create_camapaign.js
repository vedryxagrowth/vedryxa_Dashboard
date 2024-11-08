"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Badge, Tooltip } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

import MnetUrlBuilder from './urlbuilder/mnet';
import TonicUrlBuilder from './urlbuilder/tonic';
import System1UrlBuilder from './urlbuilder/system1';


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
        { key: "profile_feed", label: "Facebook Profile Feed" },
        { key: "search", label: "Facebook search" },
        { key: "story_fb", label: "Facebook Stories" }
    ],
    instagram: [
        { key: "stream", label: "Instagram Stream" },
        { key: "story_in", label: "Instagram Story" },
        { key: "explore", label: "Instagram Explore" },
        { key: "explore_home", label: "Instagram Explore Home" },
        { key: "reels", label: "Instagram Reels" },
        { key: "profile_feed_in", label: "Instagram Profile Feed" },
        { key: "ig_search", label: "Instagram Search" },
        { key: "profile_reels", label: "Instagram Profile Reels" }
    ],
    messenger: [
        { key: "messenger_home", label: "Messenger Home" },
        { key: "story_ms", label: "Messenger Story" },
        { key: "sponsored_messages", label: "Messenger sponsored messages" }
    ],
    audience_network: [
        { key: "classic", label: "Audience Network Classic" },
        { key: "rewarded_video", label: "Audience Network Rewarded Video" }
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

const CreateCampaignDrawer = ({ visible, onClose, changeRRefrst, accountis, network }) => {
    // const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    // const [imageshow, setimageshow] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [accountNumber, setAccountNumber] = useState(accountis);
    const [imagehash, setimagehash] = useState(null)
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

    const handleModeChange = (value) => {
        setIsManual(value === "manual");
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
        // console.log(text, "text");
    }


    const getUrlBuilder = (network) => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder onReturnMessage={onReturnUrl} />
            case 'FB_Tonic':
                return <TonicUrlBuilder onReturnMessage={onReturnUrl} />
            case 'FB_System1':
                return <System1UrlBuilder onReturnMessage={onReturnUrl} />
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
        form.setFieldsValue({ Website_URL: websiteURL });

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

    const Accountchange = (e) => {
        setAccountNumber(e.target.value);
    };
    // const handlepositionChange = async (values) => {
    //     console.log(values, "handlepositionChange")
    // }
    const handleNameChange = async (e) => {
        // console.log("Account Number:", accountNumber);
        const newName = e.target.value;
        setCampaignName(newName);

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
    };

    const handleFormChange = (changedValues, allValues) => {
        if (!allValues) return; // Return early if allValues is undefined

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

        const uploadPromises = selectedFiles.map(async (file) => {
            try {
                const formData = new FormData();
                const fileId = file.name;
                const editedImage = editedImages[fileId];

                // Use edited image if available, otherwise original file
                const uploadFile = editedImage ? await fetch(editedImage).then(res => res.blob()) : file;

                // Log the MIME type of the file
                const fileType = uploadFile.type;
                console.log("File type:", fileType);

                if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
                    onError("Unsupported file type");
                    return;
                }

                formData.append("file", uploadFile, `blob/${file.name}`);


                let response, fbResponse;

                if (file.type.startsWith('image/')) {
                    response = await axios.post('https://www.testapi.adsgoat.in/upload', formData, {
                        headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
                    });
                    if (!response.data.imageUrl) {
                        onError("Error: Image URL not returned from custom API");
                        throw new Error("Image upload to custom API failed, imageUrl missing");
                    }

                    console.log("Custom API response imageUrl:", response);

                    formData.append('file', file);
                    formData.append('access_token', token);

                    fbResponse = await axios.post(`https://graph.facebook.com/v20.0/act_${account}/adimages`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.status === 200 && fbResponse.status === 200) {
                        onSuccess("ok", response);
                        return {
                            filename: response.data.imageUrl,
                            imag_hash: fbResponse.data?.images?.[file.name]?.hash,
                        };
                    } else {
                        onError("error", response);
                        throw new Error("Image upload failed");
                    }
                } else if (file.type.startsWith('video/')) {
                    response = await axios.post('https://www.testapi.adsgoat.in/upload', formData, {
                        headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
                    });

                    if (response.status !== 200) {
                        onError("error", response);
                        throw new Error("Video upload to custom API failed");
                    }

                    formData.append('access_token', token);

                    fbResponse = await axios.post(`https://graph.facebook.com/v20.0/act_${account}/advideos`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (fbResponse.status === 200) {
                        const videoid = fbResponse?.data?.id;
                        await new Promise(resolve => setTimeout(resolve, 10000));

                        const thumbnailResponse = await axios.get(`https://graph.facebook.com/v20.0/${videoid}`, {
                            params: {
                                access_token: token,
                                fields: 'thumbnails',
                                is_preferred: true
                            }
                        });

                        const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
                        const uri = preferredThumbnail ? preferredThumbnail.uri : "";

                        onSuccess("ok", fbResponse);

                        return {
                            filename: response.data.imageUrl,
                            videoid: videoid,
                            thambnailurl: uri,
                        };
                    } else {
                        onError("error", fbResponse);
                        throw new Error("Video upload to Facebook failed");
                    }
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                onError("error", error);
                throw error;
            }
        });

        try {
            const mediaHashArray = await Promise.all(uploadPromises);
            console.log("All media files uploaded successfully. Media Hash Array:", mediaHashArray);
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

    //                 fbResponse = await axios.post(`https://graph.facebook.com/v19.0/act_${account}/adimages`, formData, {
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
    //                 fbResponse = await axios.post(`https://graph.facebook.com/v19.0/act_${account}/advideos`, formData, {
    //                     headers: { 'Content-Type': 'multipart/form-data' }
    //                 });

    //                 if (fbResponse.status === 200) {
    //                     const videoid = fbResponse?.data?.id;
    //                     console.log(fbResponse, response, token, videoid, "all are from the 2nd API");
    //                     await new Promise(resolve => setTimeout(resolve, 10000));

    //                     // Get thumbnail URL
    //                     const thumbnailResponse = await axios.get(`https://graph.facebook.com/v19.0/${videoid}`, {
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
                const imageHashArray = await customRequest(onSuccess, onError);

                if (imageHashArray.length > 0) {  // Only proceed if all images are uploaded successfully
                    console.log("Image Hashes just before postData:", imageHashArray);
                    await postData({ ...formValues, imageHashes: imageHashArray });
                    changeRRefrst();
                    message.success("Campaign created successfully");
                } else {
                    message.error("Failed to upload one or more images. Campaign creation aborted.");
                }
            } catch (error) {
                console.error("Error:", error);
                message.error("An error occurred during the campaign creation process.");
            } finally {
                setLoading(false); // Stop the spinner after the process is complete
            }

        }
    };

    const postData = async (values) => {
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

            console.log("Add Level Data:", addLevelData);

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
                    Daily_amount: parseInt(values.Daily_amount) * 100,
                    Status: values.Status,
                    access_token: imagehash.token,
                    createdDate: moment().tz('Asia/Kolkata').format('YYYY-MM-DD')
                },
                adsetlevel: {
                    AdsetName: values.AdsetName,
                    Daily_amount: values.DailyAdd_amount ? parseInt(values.DailyAdd_amount) * 100 : '',
                    optimization_goal: values.optimization_goal,
                    billing_event: values.billing_event,
                    start_time: moment(values.DatePicker.$d).utc().format("YYYY-MM-DDTHH:mm:ssZ"),
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
                        Facebook_positions: values.facebook_positions || [],
                        instagram_positions: values.instagram_positions || [],
                        audience_network_positions: values.audience_network_positions || [],
                        messenger_positions: values.messenger_positions || [],
                        position: values.positions,
                        device_platforms: values.device_platforms,
                    }),
                    buying_type: "AUCTION"
                },
                addlevel: addLevelData
            };

            console.log("Final Data to Submit:", data1);

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



    const handleChange = (info) => {
        setSelectedFiles(info.fileList.map(file => file.originFileObj));
    };

    const currentDate = moment();
    console.log(moment(), "currentDate")
    let initialValues = {
        Status: "PAUSED",
        // Objectives: "OUTCOME_LEADS",
        Special_categories: "NONE",
        Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        Status: "PAUSED",
        optimization_goal: "OFFSITE_CONVERSIONS",
        billing_event: "IMPRESSIONS",
        action_source: "website",
        custom_event_type: "LEAD",
        countries: "US",
        Min_Age: "18",
        Max_Age: "65",
        Gender: "0",
        positions: ["feed"],
        publisher_platforms: ["facebook"],
        Account_Number: accountis == "All" ? '' : accountis,
        Language: [6],
        Website_URL: websiteURL,
        placements: "Advance"
        // device_platforms: "mobile",

    };
    useEffect(() => {
        // Update the form fields when accountis changes
        form.setFieldsValue({ Account_Number: accountis });
    }, [accountis, form]);


    const handleDrawerClose = () => {
        form.setFieldsValue(initialValues);
        form.resetFields()
        setWebsiteURL('')
        onClose(); // Call onClose handler to close the drawer
    };

    return (
        <Drawer
            title="Create a new campaign"
            width="95%"
            open={visible}
            onClose={handleDrawerClose}
        >
            <Spin spinning={loading}>
                <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={initialValues}>
                    <Collapse accordion defaultActiveKey={['1']} >
                        <Panel header="CAMPAIGN LEVEL" key="1">
                            <div style={{ display: "flex" }}>
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
                                    <Input value={accountNumber} onChange={Accountchange} />
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
                                        style={{ width: "100%", marginLeft: "3%" }}
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
                                            { value: "CREDIT", label: "Credit" },
                                            { value: "EMPLOYMENT", label: "Employment" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
                                            { value: "NONE", label: "None" }

                                        ]}
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
                                            { value: "COST_CAP", label: "Cost Cap" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" }
                                        ]}
                                        onChange={handleBidStrategyChange}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Daily_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ flex: 0.1, marginLeft: "2%" }}>
                                    <Input
                                        type="number"
                                        placeholder="$"

                                    />
                                </Form.Item>
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
                                    style={{ flex: '1 1 200px' }}
                                >
                                    <Input />
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                                            { value: "LINK_CLICKS", label: "Clicks" },
                                            { value: "REACH", label: "Reach" },
                                            { value: "VALUE", label: "Value" }
                                        ]}
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "IMPRESSIONS", label: "Impressions" },
                                            { value: "VALUE", label: "Value" }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="DatePicker"
                                    label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input!',
                                        },
                                    ]}
                                    style={{ flex: '1 1 150px' }}
                                    initialValue={currentDate}
                                >
                                    <DatePicker style={{ width: '100%' }} />
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "website", label: "Website" },
                                            { value: "email", label: "Email" },
                                            { value: "app", label: "App" },
                                            { value: "phone_call", label: "Phone Call" }
                                        ]}
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
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
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="DailyAdd_amount"
                                    label={<span style={{ color: "#B4B4B4" }}>Daily budget</span>}
                                    style={{ flex: '1 1 200px' }}>
                                    <Input
                                        type="number"
                                        placeholder="$"
                                    />
                                </Form.Item>
                                {showBidAmount && (
                                    <Form.Item
                                        name="bid_amount"
                                        label={<span style={{ color: "#B4B4B4" }}>Bid amount</span>}
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
                                )}
                            </div>
                            <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "green" }}>Targeting</span>
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
                                        options={[
                                            { value: "US", label: "United States" },
                                            { value: "GB", label: "United Kingdom" },
                                            { value: "AU", label: "Australia" },
                                            { value: "IN", label: "India" },
                                            { value: "AE", label: "United Arab Emirates" },
                                        ]}
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
                                    style={{ flex: '1 1 150px' }}
                                >
                                    <Select
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
                                    label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
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
                                            { value: "20", label: "20" },
                                            { value: "30", label: "30" },
                                            { value: "65", label: "65+" },
                                            { value: "80", label: "80", disabled: true },
                                        ]}
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
                                        options={[
                                            { value: "0", label: "All" },
                                            { value: "1", label: "Male" },
                                            { value: "2", label: "Female" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Language"

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
                                    >
                                        {localesdata.map(option => (
                                            <Option key={option.key} value={option.key}>
                                                {option.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Placements"
                                    name="placements"
                                    rules={[{ required: true, message: 'Please select a mode!' }]}
                                >
                                    <Select placeholder="Select a mode" onChange={handleModeChange}>
                                        <Option value="Advance">Advance</Option>
                                        <Option value="manual">Manual</Option>

                                    </Select>
                                </Form.Item>
                                {isManual && (
                                    <>
                                        <Form.Item
                                            name="publisher_platforms"
                                            label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
                                            rules={[{ required: true, message: "Please select an option!" }]}
                                            style={{ flex: '1 1 300px' }}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Publishers"
                                                onChange={handlePublisherChange}
                                                value={selectedPublishers}
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
                                            style={{ flex: '1 1 400px' }}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Positions"
                                                value={selectedPositions}
                                                onChange={handlePositionChange}
                                            >
                                                {selectedPublishers.length > 0 && getPositionOptions()?.map(position => (
                                                    <Option key={`${position.key}_${position.label}`} value={position.key}>
                                                        {position.label}
                                                    </Option>
                                                ))}
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
                                        <Form.Item
                                            name="MediaContent"
                                            label={<span style={{ color: "#B4B4B4" }}>Upload</span>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select Upload!",
                                                },
                                            ]}
                                            style={{ flex: 1 }}
                                        >
                                            <Upload
                                                beforeUpload={handleBeforeUpload}
                                                onChange={handleChange}
                                                multiple
                                                maxCount={10} // Limit to 10 files, for example
                                                accept="image/*, video/*"
                                            >
                                                <Button icon={<UploadOutlined />}>Select Files</Button>
                                            </Upload>
                                        </Form.Item>

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
                                            <Input style={{ width: "45%" }} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item
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
                                    </Form.Item>
                                    <Form.Item
                                        label="Primary text"
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


                                        />
                                    </Form.Item>
                                    <Form.Item
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
                                    </Form.Item>
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
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Headline"
                                            autoSize={{ minRows: 2, maxRows: 10 }}
                                            onChange={(e) => setHeadline(e.target.value)}

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
                                        tooltip="This is a required field">
                                        <TextArea
                                            placeholder="Description"
                                            autoSize={{ minRows: 2, maxRows: 10 }}
                                            onChange={(e) => setDescription(e.target.value)}

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
                                            onChange={(e) => setWebsiteURL(e.target.value)}


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
                                    {selectedFiles.length > 0 && (
                                        selectedFiles.map((file, index) => (
                                            <Badge
                                                count={
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
                                                                {file.type.startsWith('image/') ? (
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="40"
                                                                        style={{ objectFit: 'cover' }}
                                                                    />


                                                                ) : (
                                                                    <video
                                                                        src={URL.createObjectURL(file)}
                                                                        alt="page id"
                                                                        width="40"
                                                                        height="30"
                                                                        style={{ objectFit: 'cover' }}
                                                                        muted // Muted to prevent sound on preview
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="title">
                                                                <div className="main">{addName}</div>
                                                                <div className="sub">
                                                                    Sponsored <GlobalOutlined style={{ opacity: "0.6" }} />
                                                                </div>
                                                            </div>
                                                            <div className="close">
                                                                <CloseOutlined style={{ fontSize: "20px" }} />
                                                            </div>
                                                            <div className="moreoptions">
                                                                <MoreOutlined style={{ fontSize: "20px" }} />
                                                            </div>
                                                        </div>
                                                        <div className="ad-desc">{primaryText}</div>
                                                        <div className="ad-image" style={{ width: '350px', height: '200px' }}>
                                                            {file.type.startsWith('image/') ? (
                                                                <img
                                                                    src={editedImages[file.name] || URL.createObjectURL(file)} // Use edited image if available
                                                                    alt="ad content"
                                                                    style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <video
                                                                    controls
                                                                    style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                                >
                                                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            )}
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
                                                        </a>
                                                        <div className="icons">
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
                                    )}
                                </div>

                            </div>


                        </Panel>
                    </Collapse>
                    <Form.Item label=" ">
                        {isFormComplete && (
                            <Button type="primary" htmlType="submit" style={{ background: '#21c55d', minWidth: '200px' }}>
                                Submit
                            </Button>
                        )}
                    </Form.Item>
                    {isImgEditorShown && currentFile && (
                        <FabricCanvas
                            fileId={currentFile.name} // Pass a unique identifier
                            initialImage={URL.createObjectURL(currentFile)}
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
                        onCancel={handleCancel}>
                        <p>Are you sure you want to submit?</p>
                    </Modal>
                </Form>
            </Spin>
        </Drawer>
    );
};

export default CreateCampaignDrawer;
