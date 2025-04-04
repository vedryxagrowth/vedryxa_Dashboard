"use client"
import { redirect } from 'next/navigation';
import { useTokenContext } from "../../components/parent";
import React, { useState, useEffect } from 'react';
import { Upload, Modal, Input, Button, Row, Col, Select, message, notification, Badge } from 'antd';
import { EditOutlined, UploadOutlined, PlusOutlined, SearchOutlined, CheckCircleFilled, CloseCircleFilled, ReloadOutlined, EyeOutlined, DeleteOutlined, CopyOutlined} from '@ant-design/icons';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton, Tooltip } from 'antd';
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment"; // Import moment for date manipulation
import { v4 as uuidv4 } from 'uuid';

import dayjs from 'dayjs';
const { RangePicker} = DatePicker;
const { Option } = Select;

// Dynamically import the FabricCanvas to avoid SSR issues
const FabricCanvas = dynamic(() => import("./Fabricanvas"), { ssr: false });
// const CreateCampaign = dynamic(() => import("./components/text"), { ssr: false });

const CreativesDrawer = ({selectedFilesData}) => {
    const [images, setImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [pendingFiles, setPendingFiles] = useState(null);
    const [editedFile, setEditedFile] = useState(null);
    const [filteredImages, setFilteredImages] = useState([]); // Store filtered images

    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [valueOptions, setValueOptions] = useState([]);
    const [options, setOptions] = useState([]);
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const [startDate, setStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);
    const [loading, setLoading] = useState(false);
    const [viewedImage, setViewedImage] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [cdrawerVisible, setDrawerVisible] = useState(false);
    const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [fileInputName, setFileInputName] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // State to store search input

    const [editingUid, setEditingUid] = useState(null);
    const [inlineName, setInlineName] = useState("");

    const [uploadingIndex, setUploadingIndex] = useState(0); // Index of the file being uploaded
    const [totalFiles, setTotalFiles] = useState(0); // Total selected files count


     // Track the current file index from pendingFiless
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
     // Add a new state for controlling the Upload component key
    const [uploadKey, setUploadKey] = useState(Date.now());

    const [uploadFileList, setUploadFileList] = useState([]);


    const { userdetails } = useTokenContext();
    const router = useRouter();
    // **Fetch user images when the component mounts**
    useEffect(() => {
        if (userdetails?.userName) {
            fetchUserImages();
        }
    }, [userdetails?.userName]);

    useEffect(() => {
        if (userdetails?.adAccounts && Object.keys(userdetails.adAccounts).length > 0) {
            const adAccountOptions = Object.keys(userdetails.adAccounts).map(key => ({
                value: key,
                label: key
            }));
            setOptions(adAccountOptions);
            // Auto-select the first project key
            if (!selectedKey) {
                const firstKey = adAccountOptions[0].value;
                setSelectedKey(firstKey);
            }
        } else {
            setOptions([]);  // Clear options if no accounts exist
            setSelectedKey(null);
        }
    }, [userdetails]);  // Add userdetails as dependency
    
    useEffect(() => {
        if (selectedKey && userdetails?.adAccounts?.[selectedKey]?.length > 0) {
            const accounts = userdetails.adAccounts[selectedKey].map(account => ({
                value: account.accountNumber,  // Ensure `value` is a string/number
                label: account.accountNumber,  // Display account number as label
                accountName: account.accountName, // Store extra info for display
                status: account.status // Store status for conditional rendering
            }));
            setValueOptions(accounts);
            // Auto-select the first account
            if (accounts.length > 0 && !selectedValue) {
                setSelectedValue(accounts[0].value);
            }
        } else {
            setValueOptions([]);
            setSelectedValue(null);
        }
    }, [selectedKey, userdetails]);

    const fetchUserImages = async () => {
        if (!userdetails?.userName) {
            console.error("User name is missing");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get("https://prodapis.adsgoat.in/getUserFiles", {
                headers: { 
                    "username": userdetails.userName,
                    Authorization: localStorage.getItem("token"),
                 },
            });

            if (response.data.images && Array.isArray(response.data.images)) {
                const imagesWithFileNames = response.data.images.map(file => ({
                    uid: file.key,
                    name: file.filename || file.key.split('/').pop(), // 🔹 Use filename from API or default text
                    status: 'done',
                    url: `https://sudheer-fbimages.s3.amazonaws.com/${file.key}`,
                    uploadDate: moment(file.uploadDate).format("YYYY-MM-DD"), // Assuming `uploadDate` is sent with the file
                }));
    
                setImages(imagesWithFileNames);
                setFilteredImages(imagesWithFileNames);
            }
        } catch (error) {
            console.error("Error fetching images:", error.response ? error.response.data : error.message);
        } finally{
            setLoading(false);
        }
    };
    // Prevent rendering until userdetails is available
    if (!userdetails) {
        return <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }} />;
    }
    // Redirect non-admin users
    if (userdetails?.role === "Revenue_Partner") {
        router.push("/Dashboard");
        return null;
    }
    // **Convert Base64 to File Object**
    const base64ToFile = async (base64, filename) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    // const handleUploadURL = async () => {
    //     if (!urlInput.trim()) {
    //         message.error("Please enter a valid image or video URL.");
    //         return;
    //     }
    
    //     try {
    //         // 🔹 Ensure proper URL fetching (No unnecessary changes)
    //         const proxyUrl = `https://prodapis.adsgoat.in/proxy?url=${encodeURIComponent(urlInput)}`;
    //         const response = await fetch(proxyUrl);
    
    //         if (!response.ok) {
    //             throw new Error("Failed to fetch file from URL.");
    //         }
    
    //         const blob = await response.blob();
    //         let contentType = response.headers.get("content-type") || "";
    //         let fileType = "";
    //         let fileExtension = "";
    
    //         // 🔹 Determine file type correctly
    //         if (contentType.includes("image")) {
    //             fileType = "image";
    //             fileExtension = contentType.split("/")[1] || "jpg";
    //         } else if (contentType.includes("video")) {
    //             fileType = "video";
    //             fileExtension = contentType.split("/")[1] || "mp4";
    //         } else {
    //             throw new Error("Unsupported file type. Please provide a direct link to an image or video.");
    //         }
    
    //         // 🔹 Generate unique filename
    //         const fileName = `url_file_${Date.now()}.${fileExtension}`;
    //         const file = new File([blob], fileName, { type: contentType });
    
    //         // ✅ Reset preview to avoid conflicts with old URLs
    //         setPreviewFile(null);
    //         setUploadFileList([]);
    //         setPendingFiles(prev => (prev ? [...prev, file] : [file])); // Add URL file to pending list
    //         setTotalFiles(prev => prev + 1); // Update total file count
    
    //         // ✅ Show new file in preview
    //         setPreviewFile({
    //             url: URL.createObjectURL(blob),
    //             name: fileName,
    //             file: file
    //         });
    
    //         setFileInputName(fileName.replace(/\.[^/.]+$/, "")); // Remove extension from filename
    //         setUrlInput(""); // ✅ Clear input field after successful upload
    //         setIsModalVisible(true); // Keep modal open
    //     } catch (error) {
    //         console.error("Upload Error:", error);
    //         message.error("Failed to fetch file. Ensure it's a direct link to an image or video.");
    //     }
    // };
    
    
    
    
    // const handleCancel = () =>{
    //     setIsModalVisible(false);
    //     setPreviewFile(null);
    // }

    // Update your handleCancel function to clear file-related states and update uploadKey
    
    // const handleUploadURL = async () => {
    //     if (!urlInput.trim()) {
    //         message.error("Please enter a valid image or video URL.");
    //         return;
    //     }
    
    //     try {
    //         console.log("⬇️ Fetching file from URL:", urlInput);
    
    //         setLoading(true); // Show loading state
    
    //         const proxyUrl = `https://prodapis.adsgoat.in/proxy?url=${encodeURIComponent(urlInput)}`;
    //         const response = await fetch(proxyUrl);
    
    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch file. HTTP Status: ${response.status}`);
    //         }
    
    //         const contentType = response.headers.get("content-type") || "";
    //         console.log("✅ Detected Content-Type:", contentType);
    
    //         if (!contentType.startsWith("image") && !contentType.startsWith("video")) {
    //             throw new Error("Unsupported file type. Ensure it's a direct link to an image or video.");
    //         }
    
    //         // Get file extension based on Content-Type
    //         let fileExtension = contentType.split("/")[1] || (contentType.includes("image") ? "jpg" : "mp4");
    
    //         if (!fileExtension || fileExtension.length > 4) {
    //             console.warn("⚠️ Invalid file extension detected, defaulting...");
    //             fileExtension = contentType.includes("image") ? "jpg" : "mp4";
    //         }
    
    //         // Generate a unique filename
    //         const fileName = `url_file_${Date.now()}.${fileExtension}`;
    
    //         // 🔹 Use Streams for large files
    //         const reader = response.body.getReader();
    //         const chunks = [];
    //         let receivedLength = 0;
    //         const contentLength = response.headers.get("content-length");
    
    //         while (true) {
    //             const { done, value } = await reader.read();
    //             if (done) break;
    //             chunks.push(value);
    //             receivedLength += value.length;
    
    //             // Optional: Show progress (if content length is available)
    //             if (contentLength) {
    //                 console.log(`Downloading: ${Math.round((receivedLength / contentLength) * 100)}%`);
    //             }
    //         }
    
    //         const blob = new Blob(chunks, { type: contentType });
    //         const file = new File([blob], fileName, { type: contentType });
    
    //         console.log("✅ Created File:", file);
    
    //         // ✅ Reset and update state
    //         setPreviewFile({
    //             url: URL.createObjectURL(blob),
    //             name: fileName,
    //             file: file,
    //             type: contentType.startsWith("video") ? "video" : "image",
    //         });
    
    //         setPendingFiles(prev => (prev ? [...prev, file] : [file]));
    //         setTotalFiles(prev => prev + 1);
    //         setFileInputName(fileName.replace(/\.[^/.]+$/, ""));
    //         setUrlInput(""); // Clear input field
    //         setIsModalVisible(true);
    //     } catch (error) {
    //         console.error("❌ Upload Error:", error);
    //         message.error(error.message || "Failed to fetch file. Ensure it's a direct link to an image or video.");
    //     } finally {
    //         setLoading(false); // Hide loading state
    //     }
    // };

    const handleUploadURL = async () => {
        if (!urlInput.trim()) {
            message.error("Please enter a valid URL.");
            return;
        }
    
        try {
            setLoading(true);
            let finalUrl = urlInput.trim();
    
            // ✅ Handle base64 Data URLs
            if (finalUrl.startsWith("data:")) {
                const matches = finalUrl.match(/^data:(.+);base64,(.+)$/);
                if (!matches) throw new Error("Invalid data URL format.");
    
                const contentType = matches[1];
                const base64Data = matches[2];
                const byteString = atob(base64Data);
                const uint8Array = new Uint8Array(byteString.length);
                for (let i = 0; i < byteString.length; i++) {
                    uint8Array[i] = byteString.charCodeAt(i);
                }
    
                const blob = new Blob([uint8Array], { type: contentType });
                const ext = contentType.split("/")[1] || "jpg";
                const fileName = `data_url_${Date.now()}.${ext}`;
                const file = new File([blob], fileName, { type: contentType });
    
                setPreviewFile({
                    url: URL.createObjectURL(blob),
                    name: fileName,
                    file,
                    type: contentType.startsWith("video") ? "video" : "image",
                });
    
                setPendingFiles(prev => (prev ? [...prev, file] : [file]));
                setTotalFiles(prev => prev + 1);
                setFileInputName(fileName.replace(/\.[^/.]+$/, ""));
                setUrlInput("");
                setIsModalVisible(true);
                return;
            }
    
            // Try to extract real image from Google redirect-style URL
            const urlObj = new URL(finalUrl);
            const imgurlParam = urlObj.searchParams.get("imgurl");
            if (imgurlParam && imgurlParam.startsWith("http")) {
                finalUrl = decodeURIComponent(imgurlParam);
            }
    
            // Use backend proxy
            const proxyUrl = `https://prodapis.adsgoat.in/proxy?url=${encodeURIComponent(finalUrl)}`;
            const response = await fetch(proxyUrl);
    
            if (!response.ok) {
                throw new Error(`Failed to fetch file. Status: ${response.status}`);
            }
    
            const contentType = response.headers.get("content-type") || "";
    
            if (!contentType.startsWith("image") && !contentType.startsWith("video")) {
                throw new Error("The URL does not point to a valid image or video file.");
            }
    
            const extension = contentType.split("/")[1] || "jpg";
            const blob = await response.blob();
            const fileName = `url_file_${Date.now()}.${extension}`;
            const file = new File([blob], fileName, { type: contentType });
    
            setPreviewFile({
                url: URL.createObjectURL(blob),
                name: fileName,
                file,
                type: contentType.startsWith("video") ? "video" : "image",
            });
    
            setPendingFiles(prev => (prev ? [...prev, file] : [file]));
            setTotalFiles(prev => prev + 1);
            setFileInputName(fileName.replace(/\.[^/.]+$/, ""));
            setUrlInput("");
            setIsModalVisible(true);
        } catch (error) {
            console.error("❌ Upload Error:", error);
            message.error(error.message || "Failed to fetch or decode the file.");
        } finally {
            setLoading(false);
        }
    };
    
    
    
    
    const handleCancel = () => {
        setIsModalVisible(false);
        setPreviewFile(null);
        setPendingFiles([]);
        setUploadFileList([]);
        setCurrentFileIndex(0);
        setFileInputName("");
        setEditedFile(null);
      };
      

//    // In your handleFileChange function, clear any previous file list and then set new ones:
//    const handleFileChange = ({ fileList }) => {
//         if (fileList.length === 0) return;
//         setUploadFileList(fileList);
//         const files = fileList.map(item => item.originFileObj);
//         setPendingFiles(files);

//         if (files.length > 0) {
//             const firstFile = files[0];
//             setPreviewFile({
//                 uid: firstFile.uid || firstFile.name,
//                 url: URL.createObjectURL(firstFile),
//                 name: firstFile.name,
//                 file: firstFile
//             });
//             setFileInputName(firstFile.name.split('.').slice(0, -1).join('.'));
//             setIsModalVisible(true);
//         }
//     };

    const handleFileChange = ({ fileList }) => {
        if (fileList.length === 0) return;

        setUploadFileList(fileList);
        const files = fileList.map(item => item.originFileObj);

        setPendingFiles(files);
        setUploadingIndex(0);
        setTotalFiles(files.length); // Set total file count

         // Preview the first file
        if (files.length > 0) {
            setPreviewFile({
                uid: files[0].uid || files[0].name,
                url: URL.createObjectURL(files[0]),
                name: files[0].name,
                file: files[0]
            });
            setFileInputName(files[0].name.split('.').slice(0, -1).join('.'));
            setIsModalVisible(true);
        }
    };

    
    const previewNextFile = (files, index) => {
        if (index >= files.length) {
            setIsModalVisible(false); // Close modal when all files are uploaded
            return;
        }
    
        const nextFile = files[index];
        setPreviewFile({
            uid: nextFile.uid || nextFile.name,
            url: URL.createObjectURL(nextFile),
            name: nextFile.name,
            file: nextFile
        });
    
        setFileInputName(nextFile.name.split('.').slice(0, -1).join('.'));
        setIsModalVisible(true); // Keep modal open
    };
    
    

    // const handleFileChange = ({ fileList }) => {
    //     if (fileList.length === 0) return;
    //     console.log(fileList);
    //     setPreviewFile(null);
    //     setPendingFiles(null);
    //     setEditedFile(null); 
    //     // Preview selected file
    //     const file = fileList[fileList.length-1].originFileObj;
    //     const previewUrl = URL.createObjectURL(file);
    //     // Show confirmation popup before uploading
    //     setPreviewFile({ uid: file.uid, url: previewUrl });
    //     setPendingFiles(file);
    //     setIsModalVisible(true); // Show modal to confirm upload
    // };
    
    const handleEditUploadedFile = () => {
        if (previewFile) {
            setSelectedImage(previewFile); // Set the selected image to previewFile
            setIsEditorVisible(true); // Open the editor
            setIsModalVisible(false); // Close the confirmation modal
        } else {
            console.error("No file selected for editing");
        }
    };

    const handleSaveEditedImage = async (fileId, editedImage) => {
        if (!editedImage || !editedImage.imageBase64) {
            message.error("Edited image is not valid.");
            return;
        }
    
        try {
            const uniqueFilename = `edited-${uuidv4()}.png`; // ✅ Ensure unique name
            const editedFileObj = await base64ToFile(editedImage.imageBase64, uniqueFilename);
    
            setEditedFile(editedFileObj);
            setPreviewFile({ 
                uid: fileId, 
                url: editedImage.imageBase64, 
                name: uniqueFilename 
            });
    
            setIsEditorVisible(false);
            setIsModalVisible(true); // ✅ Show modal for upload confirmation
        } catch (error) {
            console.error("Error saving edited image:", error);
            message.error("Failed to save edited image.");
        }
    };
    
    

    // Inside your component:
    const getCloneNumber = (originalFileName) => {
        const dotIndex = originalFileName.lastIndexOf(".");
        const extension = dotIndex !== -1 ? originalFileName.substring(dotIndex) : "";
        const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
    
        // Match pattern `filename(0)`, `filename(1)`, `filename(2)`, etc.
        const regex = /(.*)\((\d+)\)$/;
        let match = baseName.match(regex);
    
        let baseWithoutNumber = baseName;
        let latestCloneNumber = -1;
    
        if (match) {
            baseWithoutNumber = match[1]; // Extract base name without number
            latestCloneNumber = parseInt(match[2], 10); // Extract last number in parentheses
        }
    
        // Find the highest existing number
        images.forEach((img) => {
            const imgMatch = img.name.match(new RegExp(`^${baseWithoutNumber}\\((\\d+)\\)${extension}$`));
            if (imgMatch) {
                const num = parseInt(imgMatch[1], 10);
                if (num > latestCloneNumber) {
                    latestCloneNumber = num;
                }
            }
        });
    
        // Next clone number should be latestCloneNumber + 1
        return latestCloneNumber + 1;
    };
    
    const handleCloneFile = async (image) => {
        try {

            // 🔹 Use proxy to fetch the image and bypass CORS restrictions
            const proxyUrl = `https://prodapis.adsgoat.in/proxy?url=${encodeURIComponent(image.url)}`;
            console.log("Cloning using Proxy:", proxyUrl);

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch the file. Check CORS settings on the file host.");
            }
            const blob = await response.blob();
    
            const dotIndex = image.name.lastIndexOf(".");
            const extension = dotIndex !== -1 ? image.name.substring(dotIndex) : "";
            const baseName = dotIndex !== -1 ? image.name.substring(0, dotIndex) : image.name;
    
            // Determine next clone number correctly
            const cloneNumber = getCloneNumber(image.name);
            const clonedFileName = `${baseName}(${cloneNumber})${extension}`;
    
            const clonedFile = new File([blob], clonedFileName, { type: blob.type });
    
            const uploadDate = startDate || moment().format("YYYY-MM-DD");
            const formData = new FormData();
            formData.append("file", clonedFile);
            formData.append("uploadDate", uploadDate);
            formData.append("filename", clonedFileName);
    
            const uploadResponse = await axios.post("https://prodapis.adsgoat.in/uploadUserFiles", formData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "username": userdetails?.userName,
                },
            });
    
            const newImageUrl = uploadResponse.data.imageUrl;
            if (!newImageUrl) {
                message.error("No image URL returned from server!");
                return;
            }
    
            const newImage = {
                uid: uuidv4(),
                name: clonedFileName,
                status: "done",
                url: newImageUrl,
                uploadDate,
            };
    
            setImages((prev) => [newImage, ...prev]);
            setFilteredImages((prev) => [newImage, ...prev]);
            notification.success({ message: "Cloned", description: "File cloned successfully" });
        } catch (error) {
            console.error("Clone Error:", error);
            message.error("Failed to clone file. " + error.message);
        }
    };

    useEffect(() => {
        if (selectedImage) {
            setIsEditorVisible(true);
        }
    }, [selectedImage]);
    
     
    // EDIT HANDLER: Open editor if file has valid URL
    // const handleEditFile = async (image) => {
    //     if (!image || !image.url) {
    //         message.error("Invalid image selected for editing.");
    //         return;
    //     }
    
    //     try {
    //         // Ensure we are passing a valid image URL
    //         const response = await fetch(image.url, { mode: 'no-cors' });
            
    //         if (!response.ok && response.status !== 0) { // Handle CORS errors
    //             throw new Error("Image cannot be loaded. It might be blocked by CORS.");
    //         }
    
    //         setSelectedImage(image); // ✅ Set selected image
    //         setIsEditorVisible(true); // ✅ Open the editor
    //         setIsModalVisible(false); // ✅ Close the upload confirmation modal
    //     } catch (error) {
    //         console.error("Error opening editor:", error);
    //         message.error("Failed to open image editor. Check if the image is accessible.");
    //     }
    // };

    const handleEditFile = (image) => {
        if (!image || !image.url) {
            message.error("Invalid image selected for editing.");
            return;
        }

        // 🔹 Proxy the image URL
        const proxyUrl = `https://prodapis.adsgoat.in/proxy?url=${encodeURIComponent(image.url)}`;

        console.log("📌 Editing Image URL:", proxyUrl); // ✅ Debugging step
    
        // ✅ Set selected image for editing
        // setSelectedImage(image);
        setSelectedImage({ ...image, url: proxyUrl });
        
        // ✅ Open the editor
        setIsEditorVisible(true);
        
        // ✅ Close the upload confirmation modal (optional)
        setIsModalVisible(false);
    };
    
    
    
    // --- Modified: Handle sequential upload for multiple files ---
    const handleConfirmUpload = async () => {
        let fileToUpload = null;
    
        // 🔹 Check if an edited file exists and prioritize it for upload
        if (editedFile) {
            fileToUpload = editedFile;
            setEditedFile(null); // Reset after selection
        } else if (pendingFiles && pendingFiles.length > 0) {
            fileToUpload = pendingFiles[uploadingIndex]; // Take the next file from pending queue
        }
    
        if (!fileToUpload || !userdetails?.userName || !fileInputName.trim()) {
            message.error("No files to upload!");
            return;
        }
    
        const extension = fileToUpload.name.split('.').pop();
        const filename = `${fileInputName.trim()}.${extension}`;
        const uploadDate = moment().format("YYYY-MM-DD");
    
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("uploadDate", uploadDate);
        formData.append("filename", filename);
    
        try {
            const response = await axios.post("https://prodapis.adsgoat.in/uploadUserFiles", formData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "username": userdetails?.userName,
                },
            });
    
            const newFileUrl = response.data.imageUrl;
            if (!newFileUrl) {
                message.error("No file URL returned from server!");
                return;
            }
    
            // ✅ Add uploaded file to images list
            const newFile = { 
                uid: Date.now(),
                name: filename,
                status: "done", 
                url: newFileUrl, 
                uploadDate 
            };
            setImages(prev => [newFile, ...prev]);
    
            notification.success({
                message: `Uploaded ${uploadingIndex + 1}/${totalFiles}`,
                description: `${filename} uploaded successfully!`,
            });
    
            fetchUserImages();
    
            // ✅ Move to the next file in the queue
            const nextIndex = uploadingIndex + 1;
            setUploadingIndex(nextIndex);
    
            if (pendingFiles && nextIndex < pendingFiles.length) {
                setTimeout(() => {
                    previewNextFile(pendingFiles, nextIndex);
                }, 300);
            } else {
                setIsModalVisible(false);
                setUploadingIndex(0);
                setTotalFiles(0);
                setPendingFiles([]);
                setUploadFileList([]);
                setPreviewFile(null);
                setFileInputName("");
            }
    
        } catch (error) {
            console.error("Upload Error:", error.response ? error.response.data : error.message);
        }
    };


    // const handleConfirmUpload = async () => {
    //     let fileToUpload = editedFile || (pendingFiles && pendingFiles[uploadingIndex]);
    
    //     if (!fileToUpload || !userdetails?.userName || !fileInputName.trim()) {
    //         message.error("No files to upload!");
    //         return;
    //     }
    
    //     const extension = fileToUpload.name.split('.').pop();
    //     const filename = `${fileInputName.trim()}.${extension}`;
    //     const uploadDate = moment().format("YYYY-MM-DD");
    
    //     const formData = new FormData();
    //     formData.append("file", fileToUpload);
    //     formData.append("uploadDate", uploadDate);
    //     formData.append("filename", filename);
    
    //     try {
    //         const response = await axios.post("https://prodapis.adsgoat.in/uploadUserFiles", formData, {
    //             headers: {
    //                 Authorization: localStorage.getItem("token"),
    //                 "username": userdetails?.userName,
    //             },
    //         });
    
    //         const newFileUrl = response.data.imageUrl;
    //         if (!newFileUrl) {
    //             message.error("No file URL returned from server!");
    //             return;
    //         }
    
    //         // ✅ Add uploaded file
    //         setImages(prev => [{ 
    //             uid: Date.now(),
    //             name: filename,
    //             status: "done",
    //             url: newFileUrl,
    //             uploadDate
    //         }, ...prev]);
    
    //         notification.success({
    //             message: `Uploaded ${uploadingIndex + 1}/${totalFiles}`,
    //             description: `${filename} uploaded successfully!`,
    //         });
    
    //         fetchUserImages();
    
    //         // ✅ Move to next file
    //         const nextIndex = uploadingIndex + 1;
    //         setUploadingIndex(nextIndex);
    
    //         if (pendingFiles && nextIndex < pendingFiles.length) {
    //             setTimeout(() => previewNextFile(pendingFiles, nextIndex), 300);
    //         } else {
    //             setIsModalVisible(false);
    //             setUploadingIndex(0);
    //             setTotalFiles(0);
    //             setPendingFiles([]);
    //             setUploadFileList([]);
    //             setPreviewFile(null);
    //             setFileInputName("");
    //         }
    //     } catch (error) {
    //         console.error("Upload Error:", error.response ? error.response.data : error.message);
    //     }
    // };
    
    
    const handleKeyChange = (key) => {
        setSelectedKey(key);
        setSelectedValue(null); // Reset the selected account
        setValueOptions([]); // Reset the account list before updating
    };
    
    const handleValueChange = (value) => {
        setSelectedValue(value);
        setSelectedAccountNumber(value); // ✅ Updates selected account
    };
    
    const rangePresets = [
        {
            label: 'Today',
            value: [dayjs(), dayjs()],
        },
        {
            label: 'Yesterday',
            value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
        },
        {
            label: 'Last 7 Days',
            value: [dayjs().subtract(7, 'day'), dayjs()],
        },
        {
            label: 'Last 14 Days',
            value: [dayjs().subtract(14, 'day'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().subtract(30, 'day'), dayjs()],
        },
        {
            label: 'Last 60 Days',
            value: [dayjs().subtract(60, 'day'), dayjs()],
        },
        {
            label: 'Last 90 Days',
            value: [dayjs().subtract(90, 'day'), dayjs()],
        },
        {
            label: 'This Month',
            value: [dayjs().startOf('month'), dayjs()],
        },
        {
            label: 'Last Month',
            value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
        },
    ];
    // Function to disable future dates
    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };
    // Handle date range change
    const handleChange = (dates) => {
        if (!dates || dates.length === 0) {
            setFilteredImages(images);
            setStartDate(null);
            setEndDate(null);
            return;
        }
    
        const [start, end] = dates;
        const formattedStart = start.format('YYYY-MM-DD');
        const formattedEnd = end.format('YYYY-MM-DD');
    
        setStartDate(formattedStart);
        setEndDate(formattedEnd);
        // 🔹 Filter images based on selected date range
        setFilteredImages(images.filter(img => 
            img.uploadDate >= formattedStart && img.uploadDate <= formattedEnd
        ));
    };

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        if (["jpg", "jpeg", "png"].includes(extension)) return `image/${extension}`;
        if (["mp4", "mov"].includes(extension)) return `video/${extension}`;
        return "unknown"; // Fallback if the format is unsupported
    };
    
    const handleImageSelect = (image) => {
        const fileType = getFileType(image.url); // Determine file type
        setSelectedImages((prevSelected) => {
            if (prevSelected.some((img) => img.uid === image.uid)) {
                return prevSelected.filter((img) => img.uid !== image.uid); // Deselect
            }
            return [...prevSelected, { ...image, type: fileType }]; // Add type dynamically
        });
    };
    
    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setSelectedImages([]);
    };

    const handleDeleteFile = (fileToDelete) => {
        setSelectedImages((prevFiles) => {
            const updatedFiles = prevFiles.filter(file => file.uid !== fileToDelete.uid);
            return updatedFiles;
        });
    };
    
    const handleViewImage = (image) => {
        setViewedImage(image);
        setIsViewModalVisible(true);
    };
    
    const handleCloseViewModal = () => {
        setIsViewModalVisible(false); // 🔹 Close modal
        setTimeout(() => setViewedImage(null), 300); // 🔹 Reset image after modal transition
    };
    
    // Open modal when delete icon is clicked
    const showDeleteModal = (image) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
    };

    const handleInlineRename = async (image) => {
        if (!inlineName.trim()) {
          message.error("Filename cannot be empty");
          return;
        }
      
        const oldKey = image.uid;  // Make sure uid matches S3 key exactly
        const fileExtension = image.name.substring(image.name.lastIndexOf('.'));
        const newKey = `${userdetails.userName}/${inlineName.trim()}${fileExtension}`;
      
        try {
          await axios.post(
            "https://prodapis.adsgoat.in/renameUserFile",
            {
              key: oldKey,        // Current S3 Key
              newFilename: newKey // New S3 Key with username/ prefix
            },
            {
              headers: {
                Authorization: localStorage.getItem("token"),
                username: userdetails?.userName,
              },
            }
          );
      
          message.success("File renamed successfully!");
          fetchUserImages();
          setEditingUid(null);
          setInlineName("");
        } catch (error) {
          console.error("Rename Error:", error.response ? error.response.data : error.message);
          message.error("Failed to rename file. " + error.message);
        }
      };
      

   // Handle delete after confirmation
   const handleConfirmDelete = async () => {
        if (!imageToDelete || !userdetails?.userName) return;
        try {
            const response = await axios.delete("https://prodapis.adsgoat.in/deleteUserFiles", {
                headers: { 
                    "username": userdetails.userName,
                    Authorization: localStorage.getItem("token"),
                    "file-key": imageToDelete.uid, // Send key in headers
                },
                data: { key: imageToDelete.uid },
            });
            // Remove image from UI
            setImages((prevImages) => prevImages.filter(img => img.uid !== imageToDelete.uid));
            setFilteredImages((prevImages) => prevImages.filter(img => img.uid !== imageToDelete.uid));
        } catch (error) {
            console.error("Error deleting image:", error.response ? error.response.data : error.message);
        } finally {
            setIsDeleteModalOpen(false); // Close modal
            setImageToDelete(null);
        }
    };

    // Function to handle search input changes
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase(); // Convert to lowercase for case-insensitive search
        setSearchQuery(query);
        // Filter images based on filename
        if (query.trim() === "") {
            setFilteredImages(images); // Reset if empty search
        } else {
            const filtered = images.filter(image =>
                image.name.toLowerCase().includes(query)
            );
            setFilteredImages(filtered);
        }
    };

    const extractDisplayName = (name) => {
        if (!name) return '';
        const baseName = name.split('/').pop(); // get filename from path
        return baseName.substring(0, baseName.lastIndexOf('.')) || baseName;
    };
    
    const onClickSubmit = () => {
        selectedFilesData(selectedImages);
        
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* <CreateCampaign 
                visible={cdrawerVisible} 
                accountis={selectedAccountNumber} 
                onClose={onCloseDrawer} 
                // changeRRefrst={changeRRefrst} 
                network={selectedKey} 
                imageFiles={selectedImages} 
                onDeleteFile={handleDeleteFile} 
                selectedAccountNumber={selectedAccountNumber}
            /> */}

            <h1>Image Upload and Edit</h1>
            <Row justify="start" align="middle" gutter={[16, 16]}>
                {/* <Col span={3}>
                        <Select
                            showSearch
                            placeholder="Select Projects"
                            style={{ width: '100%' }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                        >
                            {options.length > 0 ? (
                                options.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))
                            ) : (
                                <Option disabled></Option>
                            )}
                        </Select>
                </Col>
                <Col span={4}>
                    <Select
                        showSearch
                        placeholder="Select Accounts"
                        style={{ width: '100%' }}
                        onChange={handleValueChange}
                        disabled={!selectedKey}
                        value={selectedValue}
                        selectedAccountNumber={selectedAccountNumber} 
                        optionLabelProp="value"                         
                    >
                        {valueOptions.length > 0 ? (
                            valueOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '5px 0',
                                        overflow: 'hidden',                  
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            maxWidth: '70%'
                                        }}>
                                            <p style={{
                                                margin: '0px',
                                                fontWeight: 'bold',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {option.label}
                                            </p>                                    
                                                {option.accountName && (
                                                    <p style={{
                                                        margin: '0px',
                                                        fontSize: '12px',
                                                        color: 'gray',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {option.accountName}
                                                    </p>
                                                )}
                                        </div>
                                        <span style={{ marginLeft: '10px', flexShrink: 0 }}>
                                            {option.status === "Active" ? (
                                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px' }} />
                                            ) : (
                                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px' }} />
                                            )}
                                        </span>                             
                                    </div>
                                </Select.Option>
                            ))
                        ) : (
                            <Select.Option disabled></Select.Option>
                        )}
                    </Select>                       
                </Col> */}
                <Col span={5}>
                    <ConfigProvider>
                        <RangePicker
                            presets={rangePresets}
                            onChange={handleChange}
                            disabledDate={disabledDate}
                            defaultValue={[dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]}
                            format="YYYY-MM-DD"
                            allowClear={true}
                            style={{ width: '100%' }}
                        />
                        
                    </ConfigProvider>                       
                </Col>
                <Col span={3}>
                    <Input
                        placeholder="Search by filename..."
                        suffix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={handleSearch} // Call function on user input
                    />                       
                </Col>
                <Col>
                    <Button onClick={onClickSubmit}  style={{ display: 'flex', border:'none', justifyContent: 'center', maxWidth: '160px', backgroundColor: '#C7F39A' }}>
                        Submit
                        {/* {selectedImages.length > 0 && (
                            <Badge
                                style={{ 
                                    color: 'red', 
                                    position: 'absolute', // 🔹 Keeps it from affecting button width
                                    top: '-5px', 
                                    right: '-5px', 
                                    fontSize: '12px', 
                                    padding: '2px 6px', 
                                    borderRadius: '50%' // 🔹 Makes it circular }}
                                }}
                                className="Badge"
                                variant="destructive"
                            >
                                {selectedImages.length}
                            </Badge>
                        )} */}
                    </Button>                   
                </Col>                
                <Button style={{backgroundColor: '#C7F39A', border:'none'}} onClick={fetchUserImages} icon={<ReloadOutlined />} />                  
            </Row>
            {/* URL Input for Image */}
            <div style={{ display: 'flex', marginBottom: '20px', marginTop: '10px' }}>
                <Input
                    placeholder="Enter Image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{ width: '300px', marginRight: '10px', border: 'none' }}
                />

                <Button 
                    style={{ backgroundColor: '#C7F39A', border: 'none' }} 
                    onClick={handleUploadURL} // 🔹 Calls the function
                    icon={<UploadOutlined />}
                >
                    Upload from URL
                </Button>

                <Upload
                    key={uploadKey}
                    fileList={uploadFileList} // Controlled file list
                    multiple
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    // accept=".png,.jpg,.jpeg,.mp4,.mov"
                    accept="image/*, video/*" 
                >
                    <Button style={{marginLeft: '10px', border:'none'}} icon={<UploadOutlined />}>Select Files</Button>
                </Upload>
            </div>
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', // 🔹 Dynamically fills available space
                gap: '10px',
                marginTop: '20px',}}
            >
                {filteredImages.map((image) => {
                    const isSelected = selectedImages.some((img) => img.uid === image.uid);
                    const isEditing = editingUid === image.uid;
                    const isVideo = image.url.match(/\.(mp4|mov)$/i);
                    return (
                        <div>
                            <div 
                                key={image.uid} 
                                style={{
                                    position: 'relative', 
                                    width: '150px', 
                                    height: '150px', 
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={() => setHoveredImage(image.uid)}
                                onMouseLeave={() => setHoveredImage(null)}
                                onClick={() => handleImageSelect(image)}
                            >
                                {/* Checkmark Badge for Selected Images */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: 'blue',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        zIndex: 10
                                    }}>
                                        ✓
                                    </div>
                                )}

                                {image.url.match(/\.(mp4|mov)$/i) ? (
                                    <video 
                                        src={image.url} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        playsInline
                                        onLoadedData={(e) => e.target.play().catch(() => console.log("Autoplay blocked"))}
                                    />
                                ) : (
                                    <img 
                                        src={image.url} 
                                        alt="Uploaded" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                )}
                                
                                {/* View & Delete Icons (Show Only on Hover) */}
                                {hoveredImage === image.uid && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {/* View Icon */}
                                        <Button 
                                            type="text"
                                            shape="circle"
                                            icon={<EyeOutlined />} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewImage(image);
                                            }}
                                            style={{
                                                color: 'white',
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                border: 'none'
                                            }}
                                        />
                                        {/* Edit Icon */}
                                        <Button 
                                            type="text"
                                            shape="circle"
                                            icon={<EditOutlined />} 
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditFile(image);
                                            }}
                                            disabled={image.url.match(/\.(mp4|mov)$/i)} // 🔹 Disable for videos
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',                                
                                                color: 'white',
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                border: 'none',
                                                cursor: image.url.match(/\.(mp4|mov)$/i) ? "not-allowed" : "pointer", // Show disabled cursor for videos
                                                opacity: image.url.match(/\.(mp4|mov)$/i) ? 0.5 : 1 // Reduce opacity for disabled button
                                            }}
                                        />
                                        {/* Delete Icon */}
                                        <Button 
                                            type="text"
                                            shape="circle"
                                            icon={<DeleteOutlined />} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showDeleteModal(image);
                                            }}
                                            style={{
                                                color: 'red',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                border: 'none'
                                            }}
                                        />
                                    </div>   
                                )}
                            </div>
                             {/* Inline Rename and Clone Operations Below Image */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: '5px',
                                }}
                            >
                                {isEditing ? (
                                    <>
                                    <Input
                                        size="small"
                                        style={{ width: '110px' }}
                                        value={inlineName}
                                        onChange={(e) => setInlineName(e.target.value)}
                                        autoFocus
                                    />
                                    <CheckCircleFilled
                                        style={{ color: 'green', marginLeft: '5px', cursor: 'pointer' }}
                                        onClick={() => handleInlineRename(image)}
                                    />
                                    <CloseCircleFilled
                                        style={{ color: 'red', marginLeft: '5px', cursor: 'pointer' }}
                                        onClick={() => setEditingUid(null)}
                                    />
                                    </>
                                ) : (
                                    <>
                                    <Tooltip title={extractDisplayName(image.name)}>
                                        <div
                                            style={{
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            fontWeight: '300',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            // marginTop: '8px',
                                            cursor: 'default',
                                            }}
                                        >
                                            {extractDisplayName(image.name)}
                                        </div>
                                    </Tooltip>
                                    <EditOutlined
                                        style={{ cursor: 'pointer', color: 'gray', marginLeft: '5px' }}
                                        onClick={() => {
                                        setEditingUid(image.uid);
                                        setInlineName(extractDisplayName(image.name));
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={<CopyOutlined />}
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloneFile(image);
                                        }}
                                        style={{
                                        color: 'grey',
                                        border: 'none',
                                        marginLeft: '5px',
                                        }}
                                    />
                                    </>
                                )}
                            </div>
                        </div>  
                    );
                })}
            </div>
            {/* Ant Design Modal for Delete Confirmation */}
            <Modal
                title="Confirm Deletion"
                open={isDeleteModalOpen}
                onOk={handleConfirmDelete} // Call delete function on confirmation
                onCancel={() => setIsDeleteModalOpen(false)} // Close modal on cancel
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{ danger: true }} // Make confirm button red                
            >
                <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            </Modal>
            {/* View Image Modal */}
            <Modal
                key={viewedImage?.uid || "modal"} // 🔹 Forces re-render when viewedImage changes
                title="View File"
                open={isViewModalVisible}
                onCancel={handleCloseViewModal} // 🔹 Calls function to close modal
                footer={null}
                width={600}
                destroyOnClose={true} // 🔹 Ensures video stops playing when closed
            >
                {viewedImage && viewedImage.url ? (
                    viewedImage.url.match(/\.(mp4|mov)$/i) ? (
                        <video 
                            key={viewedImage.url} // 🔹 Ensures re-render when a new file is viewed
                            controls 
                            width="100%" 
                            style={{ borderRadius: '8px' }}
                        >
                            <source src={viewedImage.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img 
                            key={viewedImage.url} // 🔹 Ensures image updates correctly
                            src={viewedImage.url} 
                            alt="Viewed File"
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    )
                ) : null}
            </Modal>

            {/* Confirmation Modal for Uploaded Image */}
            <Modal
                // key={viewedImage?.uid || "modal"}
                // title="Confirm Upload"
                title={`Confirm Upload (${uploadingIndex + 1}/${totalFiles})`} // Show progress count
                open={isModalVisible}
                onCancel={handleCancel}
                // onAfterClose={() => {
                //     setPendingFiles([]);
                //     setUploadFileList([]);
                //     setCurrentFileIndex(0);
                //     setPreviewFile(null);
                //     setFileInputName("");
                //     setEditedFile(null);
                //     setUploadKey(Date.now());
                // }}
                footer={[
                    <Button 
                        key="edit" 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={handleEditUploadedFile} 
                        disabled={previewFile && previewFile.name.match(/\.(mp4|mov)$/i)} // Disable for videos
                    >
                        Edit
                    </Button>,
                    <Button key="confirm" type="default" onClick={handleConfirmUpload}>
                        Confirm
                    </Button>
                ]}                 
            >

                {previewFile && (
                    <>
                        {(() => {
                        const ext = previewFile.name.split('.').pop().toLowerCase();
                        if (ext === 'mp4' || ext === 'mov') {
                            return (
                            <video
                                width="100%"
                                height="auto"
                                controls
                                style={{ borderRadius: '8px' }}
                            >
                                <source src={previewFile.url} type={`video/${ext}`} />
                                Your browser does not support the video tag.
                            </video>
                            );
                        }
                        return (
                            <img
                            src={previewFile.url}
                            alt="Uploaded Preview"
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        );
                        })()}
                        <Input 
                        placeholder="Enter file name" 
                        value={fileInputName}
                        onChange={(e) => setFileInputName(e.target.value)}
                        style={{ marginTop: 10 }}
                        />
                    </>
                )}
  
            </Modal>
            {/* Image Editor */}
            {isEditorVisible && selectedImage && (
                <FabricCanvas
                    fileId={selectedImage.uid}
                    initialImage={selectedImage.url}
                    closeCanvasModal={() => setIsEditorVisible(false)}
                    onSaveEditedImage={(fileId, editedImage) => handleSaveEditedImage(fileId, editedImage)}
                />
            )}
        </div>
    );
};

export default CreativesDrawer;