"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
  Drawer,
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
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useTokenContext } from "../../components/parent";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import MnetUrlBuilder from './urlbuilder/mnet';
import TonicUrlBuilder from './urlbuilder/tonic';
import System1UrlBuilder from './urlbuilder/system1';
import DActiveUrlBuilder from './urlbuilder/dactive';
import ImageUploadPage from '../../Creatives/page';

const FabricCanvas = dynamic(() => import('./Fabricanvas'), { ssr: false });

const { Option } = Select;
const { TextArea } = Input;

const Createnewads = ({ data, rerenders, onClose, network, visible, adsData }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageshow, setimageshow] = useState(null);
  const [filesof, setfilesof] = useState(null)
  const [primaryText, setPrimaryText] = useState('');
  const [caption, setCaption] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('Find More');
  const [websiteURL, setWebsiteURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
  const [editedImages, setEditedImages] = useState({});
  const [imagehash, setimagehash] = useState('')
  // const [selectedFiles, setSelectedFiles] = useState([]);
  const [isImgEditorShown, setIsImgEditorShown] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); // File to be edited
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [selectedOption, setSelectedOption] = useState("upload");
  const [selectedFilesFromCreatives, setSelectedFilesFromCreatives] = useState([]);
  const [selectedFilesFromMedia, setSelectedFilesFromMedia] = useState([]);
  const [openCreativesDrawer, setOpenCreativesDrawer] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  console.log(data, "data from createads component");
  console.log(adsData, "adsData from createads component");
  console.log(network, "network from createads component");
  const { theme } = useTokenContext();

  var token = localStorage.getItem("token")
  console.log(data, "selectedRow")
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
  console.log(addName,"data");

  useEffect(()=>{
      if (visible) {
        form.resetFields();          // Reset form fields to their initialValues
        setWebsiteURL(''); 
        setPrimaryText('');          // Clear primary text field
        setCaption('');              // Clear caption field
        setHeadline('');             // Clear headline field
        setDescription('');          // Clear description field
        setSelectedFile(null)
        // setSelectedPublishers([]);   // Clear selected publishers
        // setSelectedPositions({});    // Clear selected positions
        // setIsFormComplete(false);
        setAddName(getNextAddName(adsData))
        form.setFieldsValue({ AddName: getNextAddName(adsData) });
    }
  },[visible])

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
      // setSelectedFiles(info.fileList.map(file => file.originFileObj));
    } else {
      setSelectedFile(null); // Clear the selected file if fileList is empty
    }
  };
  let s3UrlPath = "";
  let hashid = "";
  // const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
  //   const token = imagehash.token;
  //   const account = imagehash.accountNumber;
  //   let thambnailurl = "";

  //   try {
  //     let response, fbResponse;

  //     if (filesof.type.startsWith('image/')) {
  //       // Upload image
  //       response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
  //         headers: {
  //           'Authorization': localStorage.getItem("token"),
  //           "Content-Type": "multipart/form-data"
  //         },
  //       });

  //       const formData = new FormData();
  //       formData.append("filename", selectedFile);  // Changed selectedFile to filesof.name
  //       formData.append("access_token", token);

  //       fbResponse = await axios.post(
  //         `https://graph.facebook.com/v19.0/act_${account}/adimages`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       if (response.status === 200 && fbResponse.status === 200) {
  //         onSuccess("ok", response);
  //         console.log(response);
  //         hashid = fbResponse.data?.images?.[selectedFile?.name]?.hash;
  //         console.log("hashid is", hashid);
  //         s3UrlPath = response.data.imageUrl;
  //         return {
  //           type: 'image',
  //           filename: s3UrlPath,
  //           imag_hash: hashid,
  //         };
  //       } else {
  //         onError("error", response);
  //       }

  //     } else if (filesof.type.startsWith('video/')) {
  //       // Upload video
  //       response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
  //         headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
  //       });

  //       if (response.status !== 200) {
  //         onError("error", response);
  //         throw new Error("Video upload to custom API failed");
  //       }

  //       const formData = new FormData();
  //       formData.append("access_token", token);
  //       formData.append("filename", selectedFile);  // Changed selectedFile to filesof.name

  //       fbResponse = await axios.post(
  //         `https://graph.facebook.com/v19.0/act_${account}/advideos`,
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       if (fbResponse.status === 200) {
  //         const videoid = fbResponse?.data?.id;
  //         await new Promise(resolve => setTimeout(resolve, 10000));

  //         // Get thumbnail URL
  //         const thumbnailResponse = await axios.get(`https://graph.facebook.com/v19.0/${videoid}`, {
  //           params: {
  //             access_token: token,
  //             fields: 'thumbnails',
  //             is_preferred: true
  //           }
  //         });

  //         const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
  //         thambnailurl = preferredThumbnail ? preferredThumbnail.uri : "";

  //         onSuccess("ok", fbResponse);
  //         s3UrlPath = response.data.imageUrl;
  //         hashid = videoid;

  //         console.log("videoid is", videoid);
  //         console.log("Thumbnail URL is", thambnailurl);
  //         return {
  //           type: 'video',
  //           filename: s3UrlPath,
  //           videoid: videoid,
  //           thambnailurl: thambnailurl,
  //         };
  //       } else {
  //         onError("error", fbResponse);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     onError("error", error);
  //   }
  // };

  const customRequest = async (imagehash, onSuccess, onError) => {
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
                        const editedImage = editedImages[fileId];
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

  const onClickCreativesDrawer = () => {
    console.log("Creatives Drawer Opened");
    setOpenCreativesDrawer(true);
  }

  // const selectedFilesData = (data) => {
  //   console.log("Selected Files Data:", data);
  //   setSelectedFiles(prev => [...prev, ...data.map((file, index)=>{
  //       return({
  //           uid: file.uid || `-${index+1}`,
  //           name: file?.name,
  //           status: 'done',
  //           type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //           url: file?.url,
  //       })
  //   })]);
  //   setSelectedFilesFromCreatives(prev => [...prev, ...data.map((file, index)=>{
  //       return({
  //           uid: file.uid || `-${index+1}`,
  //           name: file?.name,
  //           status: 'done',
  //           type: `${file?.url?.endsWith(".jpg") || file?.url?.endsWith(".png") || file?.url?.endsWith(".jpeg") ? file?.url?.endsWith(".jpg") ? "image/jpg" : file?.url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" : "video/"}`,
  //           url: file?.url,
  //       })
  //   })]);
  //   setOpenCreativesDrawer(false);
    
  //   if (data.length > 0) {
  //       const currentMediaContent = form.getFieldValue("MediaContent") || [];
    
  //       const newFiles = data.map((file, index) => ({
  //           uid: file.uid || `-${index + 1}`,
  //           name: file?.name,
  //           status: 'done',
  //           type: file?.url?.endsWith(".jpg")
  //               ? "image/jpg"
  //               : file?.url?.endsWith(".jpeg")
  //               ? "image/jpeg"
  //               : file?.url?.endsWith(".png")
  //               ? "image/png"
  //               : "video/",
  //           url: file?.url,
  //       }));
    
  //       const updatedMediaContent = [...currentMediaContent, ...newFiles];
    
  //       form.setFieldsValue({ MediaContent: updatedMediaContent });
  //       form.validateFields(["MediaContent"]);
  //   }
  // }

  const selectedFilesData = (data) => {
    console.log("Selected Files Data:", data);
  
    const firstFile = data[0];
    if (!firstFile) return;
  
    const fileType = firstFile?.url?.endsWith(".jpg")
      ? "image/jpg"
      : firstFile?.url?.endsWith(".jpeg")
      ? "image/jpeg"
      : firstFile?.url?.endsWith(".png")
      ? "image/png"
      : "video/";
  
    const formattedFile = {
      uid: firstFile.uid || `-1`,
      name: firstFile?.name,
      status: 'done',
      type: fileType,
      url: firstFile?.url,
    };
  
    setSelectedFiles([formattedFile]);
    setSelectedFilesFromCreatives([formattedFile]);
    setOpenCreativesDrawer(false);
  
    form.setFieldsValue({ MediaContent: [formattedFile] });
    form.validateFields(["MediaContent"]);
  };
  

  const handleBeforeUpload = (file) => {
    setfilesof(file);
    const formData = new FormData();
    formData.append("file", file);
    setimageshow(formData);
    return false;
  };

  // const handleModalOk = async () => {
  //   setIsModalVisible(false);
  //   if (formData) {
  //     const onSuccess = (status, response) => {
  //       console.log("Upload success:", response);
  //       // Add any success handling logic here
  //     };

  //     const onError = (status, error) => {
  //       console.error("Upload error:", error);
  //       // Add any error handling logic here
  //     };

  //     try {
  //       const response = await axios.get(
  //         `https://www.testapi.adsgoat.in/api/hashimageidentity/${data?.Account_Number}`,
  //         {
  //           headers: {
  //             Authorization: token,
  //           },
  //         }
  //       );
  //       console.log("siddu account data", response.data);
  //       const imagehash = response.data[0];

  //       const mediaData = await customRequest(imageshow, imagehash, onSuccess, onError);

  //       let newAddData;
  //       if (mediaData.type === 'image') {
  //         newAddData = {
  //           ...formData,
  //           id: uuidv4(),
  //           filename: mediaData.filename,
  //           imag_hash: mediaData.imag_hash,
  //         };
  //       } else if (mediaData.type === 'video') {
  //         newAddData = {
  //           ...formData,
  //           id: uuidv4(),
  //           filename: mediaData.filename,
  //           videoid: mediaData.videoid,
  //           thambnailurl: mediaData.thambnailurl,
  //         };
  //       }

  //       await postData(newAddData);
  //       rerenders();
  //       onClose();

  //     } catch (error) {
  //       console.error("Error fetching campaign data:", error);
  //       // Handle error
  //     }
  //   }
  // };
  const handleModalOk = async () => {
    setLoading(true); // Start the spinner
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

      try {
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

        const mediaData = await customRequest(imagehash, onSuccess, onError);
        console.log(mediaData, "mediaData from customRequest");
        console.log(formData, "formData from UI");

        let newAddData;
        if (mediaData[0].videoid) {
          newAddData = {
            ...formData,
            id: uuidv4(),
            filename: mediaData[0].filename,
            videoid: mediaData[0].videoid,
            thambnailurl: mediaData[0].thambnailurl,
          };
        } else {
          
          newAddData = {
            ...formData,
            id: uuidv4(),
            filename: mediaData[0].filename,
            imag_hash: mediaData[0].imag_hash,
          };
        }

        delete newAddData.MediaContent

        console.log(newAddData, "newAddData from UI");

        await postData(newAddData);
        rerenders();
        onClose();
        setSelectedFiles([]); // Clear selected files after submission
        setSelectedFilesFromCreatives([]); // Clear selected files from creatives
        setSelectedFilesFromMedia([]); // Clear selected files from media

        setLoading(false); // Stop the spinner after the process is complete
        message.success("Your ad is created successfully", 2);

      } catch (error) {
        console.error("Error fetching campaign data:", error);
        setLoading(false); // Stop the spinner in case of error
        message.error("There was an error processing your request.");
      }
    } else {
      setLoading(false); // Stop the spinner if formData is not available
    }
  };

  useEffect(() => {
    // Update the form field value for Website_URL whenever websiteURL changes
    form.setFieldsValue({ Website_URL: websiteURL, Caption: caption });

    // Check if all required fields are complete
    // const checkFormCompletion = () => {
    //     const allValues = form.getFieldsValue(true);
    //     const isComplete = Object.keys(allValues).every(
    //         key => allValues[key] !== undefined && allValues[key] !== ''
    //     );
    //     setIsFormComplete(isComplete);
    // };

    // // Trigger form completion check
    // checkFormCompletion();

  }, [websiteURL, form]);

  const imageHashCaller = async()=>{
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

  useEffect(()=>{
    if(visible){
      imageHashCaller();
    }
  },[visible])


  const postData = async (values) => {
    try {
      const data1 = {
        id: values.id,
        AddName: values.AddName,
        filename: values.filename,
        page_id: values.page_id,
        message: values.message,
        headline: values.headline,
        Description: values.Description,
        Caption: values.Caption,
        Website_URL: values.Website_URL,
        // Ad_Status: "ACTIVE"
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
      //https://www.testapi.adsgoat.in
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
        message.success("Your ad is created successfully", 2, () => {
          setIsModalVisible(false);
        });
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
    if(network === "FB_Mnet" || network === "FB_DomainActive"){
      setCaption(text.split('//')[1].split("/")[0]);

    }else{
        setCaption(text.split('/')[0]);

    }
    form.setFieldsValue(initialValue);
    // form.resetFields()
    // console.log(text, "text");
  }

  const getUrlBuilder = useMemo(() => {
    switch (network) {
        case 'FB_Mnet':
            return <MnetUrlBuilder accountis={data?.Account_Number} onReturnMessage={onReturnUrl} />
        case 'FB_Tonic1':
            return <TonicUrlBuilder accountis={data?.Account_Number} onReturnMessage={onReturnUrl} />
        case 'FB_System1':
            return <System1UrlBuilder accountis={data?.Account_Number} onReturnMessage={onReturnUrl} />
        case 'FB_DomainActive':
            return <DActiveUrlBuilder accountis={data?.Account_Number} onReturnMessage={onReturnUrl} />
    }
    
},[network, data, onReturnUrl])



  // const [imageHashes, setImageHashes] = useState([]);

  const onClickEdit = () => {
    setIsModalVisibleForURLBuilder(true);
  };

  const handleCancelForURLBuilder = () => {
    setIsModalVisibleForURLBuilder(false);
  };

  const closeCanvasModal = () => {
    console.log("Closing editor...");
    // setIsImgEditorShown(false);
    setIsImgEditorShown(false); // Close the image editor
  };



  const handleModalCancel = () => {
    setIsModalVisible(false);
    console.log('Modal cancel clicked');
  };
  var initialValue = {
    page_id: data?.addlevel[0]?.page_id,
    Website_URL: websiteURL,
    Description: "Find More",
    Caption: caption,
    AddName: addName
  }

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

  // console.log(editedImages, "edit bro");

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
                {/* <Form.Item
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
                    maxCount={1}
                    accept="image/*, video/*"
                  >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                  </Upload>
                </Form.Item> */}
                <div style={{display:'flex', flexDirection:'column'}}>
                                        <Form.Item
                                            label={<span style={{ color: "#B4B4B4" }}>Select Source</span>}
                                            style={{ flex: 1 }}
                                            >
                                            <Select
                                                defaultValue="upload"
                                                onChange={(value) => {
                                                setSelectedOption(value);
                                                form.validateFields(["MediaContent"]); // Revalidate when switching source
                                                }}
                                                style={{ marginBottom: 16 }}
                                                disabled={selectedFiles.length > 0 && true} 
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                                            multiple={false}
                                                            maxCount={1}
                                                            fileList={selectedFilesFromMedia}
                                                            listType="picture"
                                                            accept="image/*, video/*"
                                                        >
                                                            <Button icon={<UploadOutlined /> }  disabled={selectedFiles.length > 0 && true}  className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}>Select Files</Button>
                                                        </Upload>
                                                    </div>

                                                    {/* Creative Library UI */}
                                                    {selectedOption === "creative" && (
                                                    <div>
                                                        <Button className="dark-icon-button" icon={<UploadOutlined />} onClick={onClickCreativesDrawer}  disabled={selectedFiles.length > 0 && true}>
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
                  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
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
                label="Display Link"
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
            {/* <div style={{ flex: "30%" }}>
              {selectedFile && (
               <Badge
                    count={
                        <EditOutlined
                            style={{ fontSize: '25px', color: '#fff' }}
                            onClick={() => handleEditClick(selectedFile)}
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
               >
                <div className="container-ad-preview">
                  <div className="ad-preview">
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
                            muted 
                          />
                        )}
                      </div>

                      <div className="title">
                        <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          {addName}
                        </div>                                                          
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
                    <div className="ad-image" style={{ width: '400px', height: '400px' }}>
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={editedImageUrl || URL.createObjectURL(selectedFile)}
                          alt="ad content"
                          style={{ width: '400px', height: '400px', objectFit: 'cover' }}
                        />
                      ) : (
                        <video
                          controls
                          style={{ width: '400px', height: '400px', objectFit: 'cover' }}
                        >
                          <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
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
              //  </Badge>
              )}
            </div> */}
            <div style={{ flex: "30%" }}>
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
                                                        <div className="ad-preview" style={{ width: "350px" , backgroundColor: theme === "dark" && "#4d4c49"}}>
                                                            <div className="ad-heading">
                                                                <div className="img">
                                                                    {/* {file?.filename?.endsWith('.png') && console.log(file)} */}
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
                                                                    <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal',color : theme === "dark" && "white" }} >
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
                                                            <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color : theme === "dark" && "white", marginBottom:'10px' }}>
                                                                {primaryText}
                                                            </div>
                                                            <div className="ad-image" style={{ width: '350px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {file?.url?.endsWith('.png') || file?.url?.endsWith('.jpg') || file?.url?.endsWith(".jpeg") ? (
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

                                                            <div className="ad-cta" style={{marginTop: "10px"}}>
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
                                    </div>

          </div>
          <Form.Item>
            <Space>
              <Button style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} htmlType="submit">
                Submit
              </Button>
              <Button className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}  onClick={handleClear}>Clear</Button>
            </Space>
          </Form.Item>
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
                    {/* <CreativesDrawer
                        selectedFilesData={selectedFilesData}
                        
                    /> */}
                    <ImageUploadPage selectedFilesData={selectedFilesData} fromCampaigns={true} network={network} Account_Number={data?.Account_Number} />
                </Drawer>
      )}
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
        title="Form Data"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p>Display form data in modal</p>
        {/* {formData && (
          <pre>{JSON.stringify(formData, null, 2)}</pre> //
        )} */}
      </Modal>
      <Modal
        title="URL Builder"
        visible={isModalVisibleForURLBuilder}
        onCancel={handleCancelForURLBuilder}
                                        
        footer={null}
        width="80%" // Set width of the modal
        bodyStyle={{ height: '50vh', overflowY: 'auto' }}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
      >
        {getUrlBuilder}
      </Modal>
    </>
  );
};

export default Createnewads;
