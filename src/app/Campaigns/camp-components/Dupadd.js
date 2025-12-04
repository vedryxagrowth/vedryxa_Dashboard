"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Upload,
    Modal,
    Space,
    message,
    Spin,
    Tooltip,
    Badge
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    CommentOutlined,
    GlobalOutlined,
    LikeOutlined,
    MoreOutlined,
    ShareAltOutlined,
    UploadOutlined,
    QuestionCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useTokenContext } from "../../components/parent";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import MnetUrlBuilder from './urlbuilder/mnet';
import TonicUrlBuilder from './urlbuilder/tonic';
import System1UrlBuilder from './urlbuilder/system1';
import DActiveUrlBuilder from './urlbuilder/dactive';

const FabricCanvas = dynamic(() => import('./Fabricanvas'), { ssr: false });

const { Option } = Select;
const { TextArea } = Input;

const Duplicatenewads = ({ data, dupdata, changeRRefrst, onClose, rerenders, network, visible, adsData }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageshow, setimageshow] = useState(null);
    const [filesof, setfilesof] = useState(null)
    var token = localStorage.getItem("token")
    const [primaryText, setPrimaryText] = useState('');
    const [caption, setCaption] = useState(dupdata.Caption);
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [websiteURL, setWebsiteURL] = useState(dupdata.Website_URL);
    const [loading, setLoading] = useState(false);
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    const [editedImages, setEditedImages] = useState({});
    const [imagehash, setimagehash] = useState('')
    // const [selectedFiles, setSelectedFiles] = useState([]);
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);
    const [currentFile, setCurrentFile] = useState(null); // File to be edited
    const [editedImageUrl, setEditedImageUrl] = useState(null);
    const { theme } = useTokenContext();
    console.log(network);
    console.log(dupdata, "duplicatedata")
    console.log(selectedFile, "selectedFileselectedFile")
    function getNextAddName(data) {
        let maxNumber = -Infinity;
        let prefix = "";

        data.forEach(obj => {
            const parts = obj.AddName.split("_");
            const lastIndex = parseInt(parts[parts.length - 1], 10);

            if (!isNaN(lastIndex) && lastIndex > maxNumber) {
                maxNumber = lastIndex;
                prefix = parts.slice(0, -1).join("_"); // Get prefix (all parts except the last)
            }
        });

        return `${prefix}_${maxNumber + 1}`; // Return prefix with incremented max number
    }
    const [addName, setAddName] = useState(getNextAddName(adsData));

    useEffect(() => {
        if (visible) {
            form.resetFields();          // Reset form fields to their initialValues
            setWebsiteURL(dupdata.Website_URL);
            setPrimaryText(dupdata.message);          // Clear primary text field
            setCaption(dupdata.Caption);              // Clear caption field
            setHeadline(dupdata.headline);             // Clear headline field
            setDescription(dupdata.Description);          // Clear description field
            setSelectedFile(null)
            setAddName(getNextAddName(adsData))
            form.setFieldsValue({ AddName: getNextAddName(adsData) });
        }
    }, [visible])

    useEffect(() => {
        form.setFieldsValue({ Website_URL: websiteURL, Caption: caption });

    }, [websiteURL, form]);

    const handleSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                console.log('Form data:', values);
                setFormData(values);
                setIsModalVisible(true);
            })
            .catch((errorInfo) => {
                console.log('Validation failed:', errorInfo);
            });
    };

    const handleClear = () => {
        form.resetFields();
    };

    const handleChange = (info) => {
        if (info.fileList.length > 0) {
            // Update the selected file
            setSelectedFile(info.fileList[0].originFileObj);
        } else {
            setSelectedFile(null); // Clear the selected file if fileList is empty
        }
    };

    let s3UrlPath = "";
    let hashid = "";

    // const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
    //     const token = imagehash[0].token;
    //     const account = imagehash[0].extAccountId;

    //     try {
    //         const response = await axios.post("/api/uploadImage", imageshow, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });

    //         const formData = new FormData();
    //         formData.append("filename", filesof);
    //         formData.append("access_token", token);

    //         const hasrespons = await axios.post(
    //             `https://graph.facebook.com/v20.0/act_${account}/adimages`,
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );

    //         if (response.status === 200 && hasrespons.status === 200) {
    //             onSuccess("ok", response);
    //             console.log(response);
    //             hashid = hasrespons.data?.images?.[filesof.name]?.hash;
    //             console.log("hashid is", hashid);
    //             s3UrlPath = response.data.imageUrl;
    //         } else {
    //             onError("error", response);
    //         }
    //     } catch (error) {
    //         console.error("Error uploading file:", error);
    //         onError("error", error);
    //     }
    // };

    const handleEditClick = (file) => {
        setCurrentFile(file); // Set the file to be edited
        setIsImgEditorShown(true); // Open the image editor
    };

    const handleSaveEditedImage = (fileId, editedImageObject) => {
        if (!editedImageObject) {
            console.error("Edited image data is null or undefined");
            return;
        }

        // Set the new edited image URL
        const editedImageURL = URL.createObjectURL(editedImageObject);
        setEditedImageUrl(editedImageURL);

        // Close FabricCanvas immediately, allowing its "Save As" modal to show on top
        setIsImgEditorShown(false);
    };

    const closeCanvasModal = () => {
        console.log("Closing editor...");
        // setIsImgEditorShown(false);
        setIsImgEditorShown(false); // Close the image editor
    };

    const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
        const token = imagehash.token;
        const account = imagehash.accountNumber;
        let thambnailurl = "";

        try {
            let response, fbResponse;

            if (filesof.type.startsWith('image/')) {
                // Upload image
                response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
                    headers: {
                        'Authorization': localStorage.getItem("token")
                    },
                });
                const formData = new FormData();
                formData.append("filename", selectedFile);
                formData.append("access_token", token);

                fbResponse = await axios.post(
                    `https://graph.facebook.com/v20.0/act_${account}/adimages`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (response.status === 200 && fbResponse.status === 200) {
                    onSuccess("ok", response);
                    console.log(response);
                    hashid = fbResponse.data?.images?.[selectedFile?.name]?.hash;
                    console.log("hashid is", hashid);
                    s3UrlPath = response.data.imageUrl;
                    return {
                        type: 'image',
                        filename: s3UrlPath,
                        imag_hash: hashid,
                    };
                } else {
                    onError("error", response);
                }

            } else if (filesof.type.startsWith('video/')) {
                // Upload video
                response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
                    headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
                });

                if (response.status !== 200) {
                    onError("error", response);
                    throw new Error("Video upload to custom API failed");
                }

                const formData = new FormData();
                formData.append("access_token", token);
                formData.append("filename", selectedFile);

                fbResponse = await axios.post(
                    `https://graph.facebook.com/v20.0/act_${account}/advideos`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (fbResponse.status === 200) {
                    const videoid = fbResponse?.data?.id;
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    // Get thumbnail URL
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
                    s3UrlPath = response.data.imageUrl;
                    hashid = videoid;
                    thambnailurl = uri;

                    console.log("videoid is", videoid);
                    console.log("Thumbnail URL is", uri);
                    return {
                        type: 'video',
                        filename: s3UrlPath,
                        videoid: videoid,
                        thambnailurl: thambnailurl,
                    };
                } else {
                    onError("error", fbResponse);
                }
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            onError("error", error);
        }
    };


    const handleBeforeUpload = (file) => {
        setfilesof(file);
        const formData = new FormData();
        formData.append("file", file);
        setimageshow(formData);
        return false;
    };

    // const handleModalOk = async () => {
    //     setIsModalVisible(false);
    //     if (formData) {
    //         const onSuccess = (status, response) => {
    //             console.log("Upload success:", response);


    //             // Add any success handling logic here
    //         };

    //         const onError = (status, error) => {
    //             console.error("Upload error:", error);
    //             // Add any error handling logic here
    //         };

    //         try {
    //             const response = await axios.get(
    //                 `https://www.testapi.adsgoat.in/api/hashimageidentity/${data?.Account_Number}`,
    //                 {
    //                     headers: {
    //                         Authorization: token,
    //                     },
    //                 }
    //             );
    //             console.log("siddu account data", response.data);
    //             const imagehash = response.data;

    //             await customRequest(imageshow, imagehash, onSuccess, onError);

    //             const newAddData = { ...formData, id: uuidv4() };
    //             await postData(newAddData);
    //             rerenders()
    //             onClose()

    //         } catch (error) {
    //             console.error("Error fetching campaign data:", error);
    //             // Handle error
    //         }
    //     }
    // };
    const handleModalOk = async () => {
        setLoading(true); // Start loading
        try {
            setIsModalVisible(false);

            if (formData) {
                const onSuccess = (status, response) => {
                    console.log("Upload success:", response);
                    // Add any success handling logic here
                };

                const onError = (status, error) => {
                    console.error("Upload error:", error);
                    // Add any error handling logic here
                };

                const response = await axios.get(
                    `https://www.testapi.adsgoat.in/api/hashimageidentity/${data?.Account_Number}`,
                    {
                        headers: {
                            Authorization: token,
                        },
                    }
                );

                console.log("siddu account data", response.data);
                const imagehash = response.data[0];

                const mediaData = await customRequest(imageshow, imagehash, onSuccess, onError);

                let newAddData;
                if (mediaData.type === 'image') {
                    newAddData = {
                        ...formData,
                        id: uuidv4(),
                        filename: mediaData.filename,
                        imag_hash: mediaData.imag_hash,
                    };
                } else if (mediaData.type === 'video') {
                    newAddData = {
                        ...formData,
                        id: uuidv4(),
                        filename: mediaData.filename,
                        videoid: mediaData.videoid,
                        thambnailurl: mediaData.thambnailurl,
                    };
                }

                await postData(newAddData);
                rerenders();
                onClose();

                // Hide loading message and show success message
                setLoading(false); // Stop loading
                message.success("Your ad is created successfully", 2);

            }
        } catch (error) {
            console.error("Error:", error);
            setLoading(false); // Stop loading in case of error
            message.error("There was an error processing your request.");
        }
    };


    // const postData = async (values) => {
    //     try {
    //         const data1 = {
    //             id: values.id,
    //             AddName: values.AddName,
    //             filename: s3UrlPath,
    //             imag_hash: hashid,
    //             page_id: values.page_id,
    //             message: values.message,
    //             headline: values.headline,
    //             Description: values.Description,
    //             Caption: values.Caption,
    //             Website_URL: values.Website_URL,
    //             urlParameters: values.urlParameters,
    //         };

    //         console.log(data1, "from UI");

    //         const response = await fetch(
    //             `https://www.testapi.adsgoat.in/api/Createadd/${data.identifier}`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: token,
    //                 },
    //                 body: JSON.stringify(data1),
    //             }
    //         );

    //         // Check if the request was successful
    //         if (response.ok) {
    //             console.log("Form data submitted successfully");
    //             message.success("Your add is created successfully", 2, () => {
    //                 setIsModalVisible(false);
    //             }); // Close the drawer or perform any other action
    //         } else {
    //             console.error("Failed to submit form data");
    //         }
    //     } catch (error) {
    //         console.error("Error submitting form data:", error);
    //     }
    // };

    const imageHashCaller = async () => {
        try {
            const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${data.Account_Number}`,
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
        if (visible) {
            imageHashCaller();
        }
    }, [visible])

    const postData = async (values) => {
        try {
            const data1 = {
                id: values.id,
                AddName: values.AddName,
                filename: s3UrlPath,
                page_id: values.page_id,
                message: values.message,
                headline: values.headline,
                Description: values.Description,
                Caption: values.Caption,
                Website_URL: values.Website_URL,
                // urlParameters: values.urlParameters,
            };

            // Include image hash or video ID and thumbnail URL if available
            if (values.imag_hash) {
                data1.imag_hash = values.imag_hash;
            } else if (values.videoid) {
                data1.videoid = values.videoid;
                data1.thambnailurl = values.thambnailurl;
            }

            console.log(data1, "from UI");

            const response = await fetch(
                `https://www.testapi.adsgoat.in/api/Createadd/${data.identifier}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: JSON.stringify(data1),
                }
            );

            if (response.ok) {
                console.log("Form data submitted successfully");
                message.success("Your add is created successfully", 2, () => {
                    setIsModalVisible(false);
                }); // Close the drawer or perform any other action
            } else {
                console.error("Failed to submit form data");
            }
        } catch (error) {
            console.error("Error submitting form data:", error);
        }
    };

    const onReturnUrl = (text) => {
        setIsModalVisibleForURLBuilder(false);
        setWebsiteURL(text);
        if (network === "FB_Mnet" || network === "FB_DomainActive") {
            setCaption(text.split('//')[1].split("/")[0]);

        } else {
            setCaption(text.split('/')[0]);

        }
        form.setFieldsValue(initialValue);
        // form.resetFields()
        // console.log(text, "text");
    }

    const getUrlBuilder = (network) => {
        switch (network) {
            case 'FB_Mnet':
                return <MnetUrlBuilder onReturnMessage={onReturnUrl} />
            case 'FB_Tonic1':
                return <TonicUrlBuilder onReturnMessage={onReturnUrl} />
            case 'FB_System1':
                return <System1UrlBuilder onReturnMessage={onReturnUrl} />
            case 'FB_DomainActive':
                return <DActiveUrlBuilder onReturnMessage={onReturnUrl} />
        }
    }



    // const [imageHashes, setImageHashes] = useState([]);

    const onClickEdit = () => {
        setIsModalVisibleForURLBuilder(true);
    };

    const handleCancelForURLBuilder = () => {
        setIsModalVisibleForURLBuilder(false);
    };


    const handleModalCancel = () => {
        setIsModalVisible(false);
        console.log('Modal cancel clicked');
    };
    var initialValue = {
        page_id: dupdata.page_id,
        AddName: addName,
        Caption: caption,
        Description: dupdata.Description,
        Website_URL: websiteURL,
        headline: dupdata.headline,
        id: dupdata.id,
        filename: dupdata.filename,
        message: dupdata.message,
        // urlParameters: dupdata.urlParameters,
    }

    return (
        <>
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={initialValue}
                    className={theme === 'dark' ? 'form-dark' : 'form-light'}
                >
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
                                    className="custom-dark-mode"
                                >
                                    <Upload
                                        beforeUpload={handleBeforeUpload}
                                        onChange={handleChange}
                                        maxCount={1}
                                        accept="image/*, video/*"
                                    >
                                        <Button className="dark-icon-button" icon={<UploadOutlined />} style={{ color: theme === "dark" ? "white" : "#000" }}>Select file</Button>
                                    </Upload>
                                </Form.Item>
                                <Form.Item
                                    name="page_id"
                                    // initialValue={pageid}
                                    label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option!",
                                        },
                                    ]}
                                    style={{ flex: 3, marginLeft: "1%" }}
                                >
                                    <Input style={{ width: "45%" }} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                                </Form.Item>
                            </div>
                            <Form.Item
                                name="AddName"
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
                            // tooltip="This is a required field"
                            >
                                <TextArea
                                    placeholder="Primary text"
                                    autoSize={{ minRows: 2, maxRows: 10 }}
                                    onChange={(e) => setPrimaryText(e.target.value)}
                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}

                                />
                            </Form.Item>

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
                                name="Description"
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
                                            <span style={{ color: "#B4B4B4" }}>Website_URL</span>
                                            {/* <Tooltip title="This is a required field">
                                        <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'pointer' }} />
                                        </Tooltip> */}
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
                                    value={websiteURL}
                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: "#B4B4B4" }}>Display link</span>}
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
                                    onChange={(e) => setCaption(e.target.value)}
                                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                />
                            </Form.Item>
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
                            {selectedFile ? (
                                // <div className="container-ad-preview">
                                //     <div className="ad-preview">
                                //         <div className="ad-heading">
                                //             <div className="img" style={{ width: '40px', height: '40px' }}>
                                //                 {selectedFile.type.startsWith('image/') ? (
                                //                     <img
                                //                         src={URL.createObjectURL(selectedFile)}
                                //                         alt="page id"
                                //                         width="40"
                                //                         height="40"
                                //                         style={{ objectFit: 'cover' }}
                                //                     />
                                //                 ) : (
                                //                     <video
                                //                         src={URL.createObjectURL(selectedFile)}
                                //                         width="40"
                                //                         height="40"
                                //                         style={{ objectFit: 'cover' }}
                                //                         muted
                                //                         autoPlay
                                //                         loop
                                //                     />
                                //                 )}
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
                                //         <div className="ad-image" style={{ width: '100%', height: '300px' }}>
                                //             {selectedFile.type.startsWith('image/') ? (
                                //                 <img
                                //                     src={URL.createObjectURL(selectedFile)}
                                //                     alt="ad content"
                                //                     style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                //                 />
                                //             ) : (
                                //                 <video
                                //                     controls
                                //                     style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                //                 >
                                //                     <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                                //                     Your browser does not support the video tag.
                                //                 </video>
                                //             )}
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
                                // <Badge
                                //         count={
                                //             <EditOutlined
                                //                 style={{ fontSize: '25px', color: '#fff' }}
                                //                 onClick={() => handleEditClick(selectedFile)} // Edit icon click handler
                                //             />
                                //         }
                                //         style={{
                                //             backgroundColor: '#52c41a',
                                //             borderRadius: '50%',
                                //             position: 'absolute',
                                //             top: '5px',
                                //             right: '5px',
                                //             zIndex: 10,
                                //             cursor: 'pointer',
                                //         }}
                                //         offset={[5, 5]}
                                //         // key={index}
                                // >
                                <div className="container-ad-preview">
                                    <div className="ad-preview" style={{ width: "350px", backgroundColor: theme === "dark" && "#4d4c49" }}>
                                        <div className="ad-heading">
                                            <div className="img">
                                                {selectedFile.type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="page id"
                                                        width="40"
                                                        height="40"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <video
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="page id"
                                                        width="40"
                                                        height="30"
                                                        style={{ objectFit: 'cover' }}
                                                        muted // Muted to prevent sound on preview
                                                    />
                                                )}
                                            </div>

                                            <div className="title" style={{ color: theme === "dark" && "white" }}>
                                                <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                    {addName}
                                                </div>
                                                {imagehash?.pageName ? (
                                                    <>
                                                        {imagehash.pageName} <GlobalOutlined style={{ opacity: "0.6" }} />
                                                    </>
                                                ) : (
                                                    <GlobalOutlined style={{ opacity: "0.6" }} />
                                                )}                                               <div className="sub">
                                                    {/* Sponsored <GlobalOutlined style={{ opacity: "0.6" }} /> */}
                                                </div>
                                            </div>
                                            <div className="close">
                                                <CloseOutlined style={{ fontSize: "20px" }} />
                                            </div>
                                            <div className="moreoptions">
                                                <MoreOutlined style={{ fontSize: "20px" }} />
                                            </div>
                                        </div>
                                        <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: theme === "dark" && "white" }}>
                                            {primaryText}
                                        </div>
                                        <div className="ad-image" style={{ width: '100%', height: '300px' }}>
                                            {selectedFile.type.startsWith('image/') ? (
                                                <img
                                                    src={editedImageUrl || URL.createObjectURL(selectedFile)}
                                                    alt="ad content"
                                                    // style={{ width: '300px', height: '200px', objectFit: 'cover' }}
                                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                />
                                            ) : (
                                                <video
                                                    controls
                                                    // style={{ width: '300px', height: '200px', objectFit: 'cover' }}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                >
                                                    <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                        </div>

                                        <div className="ad-cta">
                                            <div className="details" style={{ color: theme === "dark" && "white" }}>
                                                <div className="link">{caption}</div>
                                                <div className="title">{headline}</div>
                                                <div className="desc">{description}</div>
                                            </div>
                                            <div className="ad-button">
                                                <button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }}>Learn More</button>
                                            </div>
                                        </div>
                                        <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
                                            {websiteURL}
                                        </a>                                                <div className="icons">
                                            <div className="like" style={{ color: theme === "dark" && "white" }}>
                                                <LikeOutlined style={{ fontSize: "20px" }} />
                                                Like
                                            </div>
                                            <div className="comment" style={{ color: theme === "dark" && "white" }}>
                                                <CommentOutlined style={{ fontSize: "20px" }} />
                                                Comment
                                            </div>
                                            <div className="share" style={{ color: theme === "dark" && "white" }}>
                                                <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                Share
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                // {/* </Badge> */}
                            ) :
                                <div className="container-ad-preview">
                                    <div className="ad-preview" style={{ width: "350px", backgroundColor: theme === "dark" && "#4d4c49" }}>
                                        <div className="ad-heading">
                                            <div className="filename" style={{ width: '40px', height: '40px', backgroundColor: theme === "dark" ? "#7a7973" : "#333", borderRadius: '50%', marginRight: '10px' }}>
                                                {initialValue.fileType === 'image' ? (
                                                    <img
                                                        src={initialValue.filename}
                                                        alt="page id"
                                                        width="40"
                                                        height="40"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <video
                                                        src={initialValue.filename}
                                                        width="40"
                                                        height="40"
                                                        style={{ objectFit: 'cover' }}
                                                        muted
                                                        autoPlay
                                                        loop
                                                    />
                                                )}
                                            </div>

                                            <div className="title" style={{ color: theme === "dark" && "white" }}>
                                                <div className="main" >{"Facebook Page"}</div>
                                                <div className="sub">
                                                    {imagehash?.pageName ? (
                                                        <>
                                                            {imagehash.pageName} <GlobalOutlined style={{ opacity: "0.6" }} />
                                                        </>
                                                    ) : (
                                                        <GlobalOutlined style={{ opacity: "0.6" }} />
                                                    )}
                                                    {/* Sponsored <GlobalOutlined style={{ opacity: "0.6" }} /> */}
                                                </div>
                                            </div>
                                            <div className="close">
                                                <CloseOutlined style={{ fontSize: "20px" }} />
                                            </div>
                                            <div className="moreoptions">
                                                <MoreOutlined style={{ fontSize: "20px" }} />
                                            </div>
                                        </div>
                                        <div className="ad-desc" style={{ color: theme === "dark" && "white" }}>{"adMessage"}</div>
                                        <div className="ad-image" style={{ width: '350px', height: '200px' }}>
                                            {initialValue.fileType === 'image' ? (
                                                <img
                                                    src={initialValue.filename}
                                                    alt="ad content"
                                                    style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <video
                                                    controls
                                                    style={{ width: '350px', height: '200px', objectFit: 'cover' }}
                                                >
                                                    <source src={initialValue.filename} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                        </div>

                                        <div className="ad-cta">
                                            <div className="details" style={{ color: theme === "dark" && "white" }}>
                                                <div className="link">{"adCaption"}</div>
                                                <div className="title">{"adName"}</div>
                                                <div className="desc">{"adDesc"}</div>
                                            </div>
                                            <div className="ad-button">
                                                <button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }}>Learn More</button>
                                            </div>
                                        </div>
                                        <div className="icons">
                                            <div className="like" style={{ color: theme === "dark" && "white" }}>
                                                <LikeOutlined style={{ fontSize: "20px" }} />
                                                Like
                                            </div>
                                            <div className="comment" style={{ color: theme === "dark" && "white" }}>
                                                <CommentOutlined style={{ fontSize: "20px" }} />
                                                Comment
                                            </div>
                                            <div className="share" style={{ color: theme === "dark" && "white" }}>
                                                <ShareAltOutlined style={{ fontSize: "20px" }} />
                                                Share
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                    </div>
                    <Form.Item>
                        <Space>
                            <Button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }} htmlType="submit">
                                Submit
                            </Button>
                            <Button className="dark-icon-button" style={{ color: theme === "dark" ? "white" : "#000" }} onClick={handleClear}>Clear</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
            {isImgEditorShown && currentFile && (
                // <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <FabricCanvas
                    fileId={currentFile.name} // Pass a unique identifier
                    initialImage={URL.createObjectURL(currentFile)}
                    closeCanvasModal={closeCanvasModal}
                    onSaveEditedImage={handleSaveEditedImage}
                    style={{ width: '100%', height: '100%', zIndex: 10000 }}
                />
                // </div>
            )}
            <Modal
                title="URL Builder"
                visible={isModalVisibleForURLBuilder}
                onCancel={handleCancelForURLBuilder}

                footer={null}
                width="80%" // Set width of the modal
                // bodyStyle={{ height: '50vh', overflowY: 'auto' }}
                styles={{
                    body: {
                        height: "50vh",
                        overflowY: "auto",
                    },
                }}
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
            >
                {getUrlBuilder(network)}
            </Modal>
            <Modal
                title="Form Data"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <p>Display form data in modal</p>
                {/* {formData && (
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        )} */}
            </Modal>
        </>
    );
};

export default Duplicatenewads;
