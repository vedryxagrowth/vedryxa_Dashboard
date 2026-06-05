"use client"
import { redirect } from 'next/navigation';
import { useTokenContext } from "../components/parent";
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Modal, Input, Button, Row, Col, Select, message, notification, Badge } from 'antd';
import { CopyOutlined, FileAddOutlined, ArrowLeftOutlined, EditOutlined, UploadOutlined, PlusOutlined, SearchOutlined, CheckCircleFilled, CloseCircleFilled, ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton, Tooltip, Checkbox } from 'antd';
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment"; // Import moment for date manipulation
import { v4 as uuidv4 } from 'uuid';

import { MdEdit, MdDriveFileRenameOutline } from "react-icons/md";
import { HiOutlineDuplicate } from "react-icons/hi";

import Selecto from "react-selecto";

import dayjs from 'dayjs';
import { Token } from '@mui/icons-material';
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dynamically import the FabricCanvas to avoid SSR issues
const FabricCanvas = dynamic(() => import("../Campaigns/camp-components/Fabricanvas"), { ssr: false });
const CreateCampaign = dynamic(() => import("./components/text"), { ssr: false });

const ImageUploadPage = ({ selectedFilesData, fromCampaigns, network, Account_Number }) => {
    // console.log("Selected Files Data:", selectedFilesData);
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
    const selectedImagesRef = useRef([]);
    const previousSearchResults = useRef(null);

    const [editingUid, setEditingUid] = useState(null);
    const [inlineName, setInlineName] = useState("");

    const [uploadingIndex, setUploadingIndex] = useState(0); // Index of the file being uploaded
    const [totalFiles, setTotalFiles] = useState(0); // Total selected files count

    const [isTrashView, setIsTrashView] = useState(false);
    const [multiRenameMap, setMultiRenameMap] = useState({});
    const [draggableUid, setDraggableUid] = useState(null);
    const [clickTimeout, setClickTimeout] = useState(null);

    const [checkboxSelected, setCheckboxSelected] = useState([]);

    const selectoRef = useRef(null);


    // Track the current file index from pendingFiless
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    // Add a new state for controlling the Upload component key
    const [uploadKey, setUploadKey] = useState(Date.now());

    const [uploadFileList, setUploadFileList] = useState([]);

    const [currentFolder, setCurrentFolder] = useState(""); // current path in S3 ("" for root)
    const [clipboardFile, setClipboardFile] = useState([]); // holds copied file object
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        targetKey: null, // <-- key of the folder clicked (optional if needed for delete)
        isFolder: false,
    });
    const menuRef = useRef(null);
    const [menuHeight, setMenuHeight] = useState(160);

    // const [newFolderModal, setNewFolderModal] = useState(false);
    const [newFolderModal, setNewFolderModal] = useState({
        visible: false,
        name: "",
        mode: "create", // "create" or "rename"
        folderToRename: null, // holds folder object if renaming
    });

    const [newFolderName, setNewFolderName] = useState("");
    const [deleteFolderModal, setDeleteFolderModal] = useState({
        visible: false,
        folder: null,
    });

    const { userdetails, apiClient } = useTokenContext();
    const { theme } = useTokenContext();
    const router = useRouter();

    const uploadPrefix = `${selectedKey}/${selectedAccountNumber}/`;
    var token = localStorage.getItem("token")
    const [networksWithStatus, setNetworksWithStatus] = useState([]);
    const [highlightedFolders, setHighlightedFolders] = useState([]);
    useEffect(() => {
        const fetchNetworksData = async () => {
            try {
                //https://prodapis.adsgoat.in/get/networksData/
                const res = await apiClient.get('/creatives/commonapis/networksdata', {
                    headers: {
                        Authorization: token,

                    }
                });
                setNetworksWithStatus(res.data);
            } catch (error) {
                console.error('Error fetching networksData:', error);
            }
        };
        fetchNetworksData();
    }, []);
    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);

    //    useEffect(() => {
    //     if (!images) return;

    //     // Always show all items if search is empty
    //     if (!searchQuery.trim()) {
    //         setFilteredImages(images);
    //         return;
    //     }

    //     const query = searchQuery.toLowerCase();

    //     // Apply search on whatever current folder images you have
    //     const filtered = images.filter(img =>
    //         img.name?.toLowerCase().includes(query)
    //     );

    //     setFilteredImages(filtered);
    // }, [searchQuery, images, currentFolder]);




    useEffect(() => {
        const handleClickOutside = (e) => {
            const grid = document.getElementById("file-grid");
            if (!grid?.contains(e.target)) {
                setSelectedImages([]);
                selectedImagesRef.current = [];

                // ✅ Proper way to clear Selecto selection
                selectoRef.current?.setSelectedTargets([]);
            }
        };

        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);


    useEffect(() => {
        const handleKeyDown = async (e) => {
            const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
            if (isInputFocused) return;

            // Copy
            if (e.ctrlKey && e.key === 'c') {
                if (selectedImages?.length > 0) {
                    setClipboardFile(selectedImages.map(file => ({
                        ...file,
                        action: 'copy',
                        isFolder: file.isFolder
                    })));
                    setSelectedImages([]);
                }
            }

            // Cut
            if (e.ctrlKey && e.key === 'x') {
                if (selectedImages?.length > 0) {
                    setClipboardFile(selectedImages.map(file => ({
                        ...file,
                        action: 'cut',
                        isFolder: file.isFolder
                    })));
                    setFilteredImages(prev => prev.filter(file => !selectedImages.some(sel => sel.uid === file.uid)));
                    setSelectedImages([]);
                }
            }

            // Paste
            if (e.ctrlKey && e.key === 'v' && clipboardFile?.length > 0) {
                for (const file of clipboardFile) {
                    const sourceKey = file.uid;
                    const name = file.name;
                    const destinationKey = `${uploadPrefix}${currentFolder}${name}${file.isFolder ? '/' : ''}`;
                    const exists = images.some(img => img.name === name);

                    const doPaste = async (finalKey) => {
                        try {
                            if (file.action === 'copy') {
                                if (file.isFolder) {
                                    await apiClient.post("/creatives/folders/copyfolder", {
                                        sourceKey,
                                        destinationKey: finalKey
                                    }, {
                                        headers: {
                                            Authorization: localStorage.getItem("token"),
                                            username: userdetails.userName,
                                        }
                                    });
                                } else {
                                    const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(file.url)}`;
                                    const res = await fetch(proxyUrl, {
                                        method: "GET",
                                        headers: {
                                            Authorization: localStorage.getItem("token")
                                        },
                                    });
                                    const blob = await res.blob();
                                    const fileName = finalKey.split('/').pop();
                                    const formData = new FormData();
                                    formData.append("file", new File([blob], fileName, { type: blob.type }));
                                    formData.append("filename", finalKey);
                                    formData.append("folder", currentFolder);

                                    await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", formData, {
                                        headers: {
                                            Authorization: localStorage.getItem("token"),
                                            username: userdetails.userName,
                                        },
                                    });
                                }
                            } else if (file.action === 'cut') {
                                if (sourceKey === finalKey) {
                                    message.warning("Cannot move to the same location");
                                    return;
                                }

                                await apiClient.post("/creatives/folders/moveFileOrFolder", {
                                    sourceKey,
                                    destinationKey: finalKey
                                }, {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                        username: userdetails.userName,
                                    }
                                });
                            }
                            fetchUserImages();
                            setClipboardFile([]);
                        } catch (err) {
                            console.error("Paste failed:", err);
                            message.error("Paste failed");
                        }
                    };

                    if (exists) {
                        const dotIndex = name.lastIndexOf(".");
                        const base = dotIndex !== -1 ? name.substring(0, dotIndex) : name;
                        const ext = dotIndex !== -1 ? name.substring(dotIndex) : "";

                        Modal.confirm({
                            title: `${file.isFolder ? "Folder" : "File"} already exists`,
                            content: "What would you like to do?",
                            okText: "Replace",
                            cancelText: "Create New",
                            onOk: () => doPaste(destinationKey),
                            onCancel: () => {
                                let suffix = 1;
                                let newName = `${base}(${suffix})${ext}`;
                                while (images.some(img => img.name === newName)) {
                                    suffix++;
                                    newName = `${base}(${suffix})${ext}`;
                                }
                                const newKey = `${uploadPrefix}${currentFolder}${newName}${file.isFolder ? '/' : ''}`;
                                doPaste(newKey);
                            }
                        });
                    } else {
                        doPaste(destinationKey);
                    }
                }
            }
        };

        const handleDrop = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const files = Array.from(e.dataTransfer.files);
            if (!files.length) return;

            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("filename", `${uploadPrefix}${currentFolder}${file.name}`);
                formData.append("folder", currentFolder);

                try {
                    await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", formData, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails.userName,
                        }
                    });
                } catch (err) {
                    console.error("Drag-and-drop upload error:", err);
                    message.error(`Failed to upload: ${file.name}`);
                }
            }

            fetchUserImages();
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("drop", handleDrop);
        window.addEventListener("dragover", handleDragOver);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("drop", handleDrop);
            window.removeEventListener("dragover", handleDragOver);
        };
    }, [clipboardFile, currentFolder, selectedImages, images]);

    useEffect(() => {
        const handleClick = (e) => {
            if (
                contextMenu.visible &&
                !e.target.closest(".custom-context-menu") &&
                e.button !== 2
            ) {
                setContextMenu({ visible: false });
            }
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("contextmenu", handleClick); // Also hide on right-click elsewhere

        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("contextmenu", handleClick);
        };
    }, [contextMenu.visible]);

    useEffect(() => {
        if (userdetails?.userName && selectedKey && selectedAccountNumber) {
            fetchUserImages();
        }
    }, [isTrashView, userdetails?.userName, selectedKey, selectedAccountNumber, currentFolder]);

    useEffect(() => {
        if (network && userdetails?.adAccounts && Object.keys(userdetails.adAccounts).length > 0) {
            const adAccountOptions = Object.keys(userdetails.adAccounts).map(key => ({
                value: key,
                label: key
            }));
            setOptions(adAccountOptions);
            setSelectedKey(network);
            setSelectedAccountNumber(Account_Number);
            setSelectedValue(Account_Number);
        } else {
            if (userdetails?.adAccounts && Object.keys(userdetails.adAccounts).length > 0) {
                const adAccountOptions = Object.keys(userdetails.adAccounts).map(key => ({
                    value: key,
                    label: key
                }));
                setOptions(adAccountOptions);
                // Set default project/account if not already selected
                if (!selectedKey) {
                    const defaultProject = Object.keys(userdetails.adAccounts)[0];
                    const defaultAccount = userdetails.adAccounts[defaultProject]?.[0]?.accountNumber;

                    if (defaultProject && defaultAccount) {
                        setSelectedKey(defaultProject);
                        setSelectedAccountNumber(defaultAccount);
                        setSelectedValue(defaultAccount);
                    }
                }
            } else {
                setOptions([]);  // Clear options if no accounts exist
            }
        }
    }, [userdetails, network]);  // Add userdetails as dependency

    useEffect(() => {
        if (selectedKey && userdetails?.adAccounts?.[selectedKey]?.length > 0) {
            const accounts = userdetails.adAccounts[selectedKey].map(account => ({
                value: account.accountNumber,  // Ensure `value` is a string/number
                label: account.accountNumber,  // Display account number as label
                accountName: account.accountName, // Store extra info for display
                status: account.status // Store status for conditional rendering
            }));
            setValueOptions(accounts);
        } else {
            setValueOptions([]);
        }
    }, [selectedKey, userdetails]);

    const fetchUserImages = async () => {
        if (!userdetails?.userName || !selectedKey || !selectedAccountNumber) {
            console.error("Missing user/project/account info");
            return;
        }

        setLoading(true);

        // const uploadPrefix = `${selectedKey}/${selectedAccountNumber}/${userdetails.userName}/`;

        // const fullPath = `${uploadPrefix}${currentFolder || ""}`; // currentFolder can be "" or "folder/"
        const uploadPrefix = `${selectedKey}/${selectedAccountNumber}/`; // ensure consistent prefix
        const normalPath = `${uploadPrefix}${currentFolder || ""}`;
        const trashPath = `${selectedKey}/${selectedAccountNumber}`; // <-- no trailing slash for Trash API    

        try {
            const response = isTrashView
                ? await apiClient.get("/creatives/trashfiles", {
                    headers: {
                        username: userdetails.userName,
                        "x-folder": trashPath,
                        Authorization: localStorage.getItem("token"),
                    },
                })
                : await apiClient.get("/creatives/userfiles/getuserfiles", {
                    //https://prodapis.adsgoat.in/getUserFiles
                    headers: {
                        username: userdetails.userName,
                        "x-folder": normalPath,
                        Authorization: localStorage.getItem("token"),
                    },
                });

            if (Array.isArray(response.data.images)) {
                const filteredItems = response.data.images
                    .filter(file => {
                        const key = file.key;
                        if (key === (isTrashView ? trashPath : normalPath)) return false;

                        const relativePath = key.replace(isTrashView ? `${trashPath}/Trashfiles/` : normalPath, '');
                        const isImmediateChild = relativePath !== '' && !relativePath.includes('/');
                        return isImmediateChild || (key.endsWith('/') && !relativePath.slice(0, -1).includes('/'));
                    })
                    .map(file => {
                        const isFolder = file.key.endsWith('/');
                        const lastModified = file.LastModified
                            ? moment(file.LastModified).format("YYYY-MM-DD HH:mm")
                            : null;

                        return {
                            uid: file.key,
                            name: file.key.split('/').filter(Boolean).pop(),
                            status: 'done',
                            url: isFolder ? null : `https://sudheer-fbimages.s3.amazonaws.com/${file.key}`,
                            isFolder,
                            createdDate: file.createdDate || lastModified,
                            modifiedDate: file.modifiedDate || lastModified,
                            uploadDate: file.uploadDate || moment(file.modifiedDate || file.createdDate || lastModified).format("YYYY-MM-DD"),
                        };
                    });

                setImages(filteredItems);
                setFilteredImages(filteredItems);

            }
        } catch (error) {
            console.error("Error fetching images:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Prevent rendering until userdetails is available
    if (!userdetails) {
        // return <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }} />;
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 20 }} />
            </div>
        );
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

    const handleUploadURL = async () => {
        if (!urlInput.trim()) {
            message.error("Please enter a valid URL.");
            return;
        }

        // FULL RESET: avoid ghost upload from clipboard/paste
        setClipboardFile(null);
        setPreviewFile(null);
        setEditedFile(null);
        setPendingFiles([]);
        setUploadingIndex(0);
        setUploadFileList([]);
        setFileInputName("");

        try {
            setLoading(true);
            let finalUrl = urlInput.trim();

            //Handle base64 Data URLs
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
            const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(finalUrl)}`;
            const response = await fetch(proxyUrl, {
                method: "GET",
                headers: {
                    Authorization: localStorage.getItem("token")
                },
            });

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
            console.error("Upload Error:", error);
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
            const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(image.url)}`;
            // console.log("Cloning using Proxy:", proxyUrl);

            const response = await fetch(proxyUrl, {
                method: "GET",
                headers: {
                    Authorization: localStorage.getItem("token")
                },
            });
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
            // formData.append("filename", clonedFileName);
            // formData.append("filename", `${currentFolder}${clonedFileName}`);
            formData.append("filename", `${uploadPrefix}${currentFolder}${clonedFileName}`);
            formData.append("folder", currentFolder); // include the folder for backend

            const uploadResponse = await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", formData, {
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

    const handleEditFile = (image) => {
        if (!image || !image.url) {
            message.error("Invalid image selected for editing.");
            return;
        }

        // 🔹 Proxy the image URL
        const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(image.url)}`;

        // console.log("Editing Image URL:", proxyUrl);

        // Set selected image for editing
        // setSelectedImage(image);
        setSelectedImage({ ...image, url: proxyUrl });
        setIsEditorVisible(true);
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
        // formData.append("filename", filename);
        // formData.append("filename", `${currentFolder}${fileInputName.trim()}.${extension}`);
        formData.append("filename", `${uploadPrefix}${currentFolder}${fileInputName.trim()}.${extension}`);
        formData.append("folder", currentFolder); // pass the current folder as a separate field

        try {
            const response = await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", formData, {
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

            // Add uploaded file to images list
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

            // Move to the next file in the queue
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

    const handleKeyChange = (key) => {
        setSelectedKey(key);
        setSelectedValue(null); // Reset the selected account
        setValueOptions([]); // Reset the account list before updating
        setSelectedAccountNumber(""); // Clear selected account number
        setImages([]);       // Clear image view
        setFilteredImages([]);
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

    const handleImageSelect = (image, e) => {
        if (!image || image.isFolder) return;

        const isCtrlOrMeta = e?.ctrlKey || e?.metaKey;
        const isShift = e?.shiftKey;

        setSelectedImages((prev) => {
            const isSelected = prev.some((img) => img.uid === image.uid);

            if (isCtrlOrMeta || isShift) {
                return isSelected
                    ? prev.filter((img) => img.uid !== image.uid)
                    : [...prev, image];
            }

            if (isSelected && prev.length === 1) {
                return [];
            }

            return [image];
        });

        selectedImagesRef.current = selectedImages;
    };


    // const handleImageSelect = (image) => {
    //     if (image.isFolder) return;
    //     const fileType = getFileType(image.url);

    //     setSelectedImages((prevSelected) => {
    //         const isAlreadySelected = prevSelected.some((img) => img.uid === image.uid);
    //         const updatedList = isAlreadySelected
    //             ? prevSelected.filter((img) => img.uid !== image.uid)
    //             : [...prevSelected, { ...image, type: fileType }];

    //         // Update ref immediately!
    //         selectedImagesRef.current = updatedList;

    //         return updatedList;
    //     });
    // };


    // const showDrawer = () => {
    //     setDrawerVisible(true);
    // };

    const onSubmitData = () => {
        // const selected = selectedImagesRef.current;

        // if (!selected || selected.length === 0) {
        //     message.warning("Please select at least one file to create a campaign.");
        //     return;
        // }

        // console.log("Selected files for campaign:", selected);

        selectedFilesData(checkboxSelected); // force state update
        setCheckboxSelected([]);
        setDrawerVisible(true);
    }

    const showDrawer = () => {
        // const selected = selectedImagesRef.current;

        // if (!selected || selected.length === 0) {
        //     message.warning("Please select at least one file to create a campaign.");
        //     return;
        // }

        // console.log("Selected files for campaign:", selected);

        // setSelectedImages([...selected]); // force state update
        setSelectedImages(checkboxSelected);
        setDrawerVisible(true);
    };


    // const onCloseDrawer = () => {
    //     setDrawerVisible(false);
    //     setSelectedImages([]);
    // };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
        setSelectedImages([]);
        setCheckboxSelected([]);
        selectedImagesRef.current = [];
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

    const handleMultiRename = async () => {
        if (!Array.isArray(editingUid)) return;

        for (let uid of editingUid) {
            const oldItem = images.find(img => img.uid === uid);
            const newName = multiRenameMap[uid]?.trim();

            if (!newName || newName === extractDisplayName(oldItem.name)) continue;

            const isFolder = oldItem.isFolder;
            const lastSlashIndex = oldItem.uid.lastIndexOf('/');
            const basePath = oldItem.uid.substring(0, lastSlashIndex + 1); // with trailing slash

            const extension = isFolder ? '' : oldItem.name.includes('.') ? oldItem.name.substring(oldItem.name.lastIndexOf('.')) : '';
            const newKey = isFolder
                ? `${basePath}${newName}/`
                : `${basePath}${newName}${extension}`;

            try {
                if (isFolder) {
                    await apiClient.post("/creatives/folders/renamefolder", {
                        oldFolderKey: oldItem.uid,
                        newFolderKey: newKey,
                    }, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails?.userName,
                        },
                    });
                } else {
                    await apiClient.post("/creatives/userfiles/renameuserfile", {
                        key: oldItem.uid,
                        newFilename: newKey,
                    }, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails?.userName,
                        },
                    });
                }
            } catch (err) {
                console.error("Rename failed:", err);
            }
        }

        message.success("Items renamed");
        setEditingUid(null);
        setMultiRenameMap({});
        fetchUserImages();
    };

    const handleInlineRename = async (image) => {
        if (!inlineName.trim()) {
            message.error("Name cannot be empty");
            return;
        }

        const itemsToRename = Array.isArray(editingUid)
            ? images.filter(img => editingUid.includes(img.uid))
            : [image];

        for (let index = 0; index < itemsToRename.length; index++) {
            const item = itemsToRename[index];
            const isFolder = item.isFolder;
            const oldKey = item.uid;

            const lastSlashIndex = oldKey.lastIndexOf('/');
            const basePath = oldKey.substring(0, lastSlashIndex + 1); // keep trailing slash

            const extension = item.name.includes('.') ? item.name.substring(item.name.lastIndexOf('.')) : '';
            const suffix = itemsToRename.length > 1 ? (index === 0 ? '' : `(${index})`) : '';
            const newName = `${inlineName.trim()}${suffix}`;
            const newKey = isFolder
                ? `${basePath}${newName}/`
                : `${basePath}${newName}${extension}`;

            if (newKey === oldKey) continue;

            try {
                if (isFolder) {
                    await apiClient.post("/creatives/folders/renamefolder", {
                        oldFolderKey: oldKey,
                        newFolderKey: newKey,
                    }, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails?.userName,
                        },
                    });
                } else {
                    await apiClient.post("/creatives/userfiles/renameuserfile", {
                        key: oldKey,
                        newFilename: newKey,
                    }, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails?.userName,
                        },
                    });
                }
            } catch (err) {
                console.error("Rename failed:", err);
            }
        }

        message.success("Items renamed");
        setEditingUid(null);
        setInlineName("");
        fetchUserImages();
    };

    const handleConfirmDelete = async () => {
        if (!imageToDelete || !userdetails?.userName) return;
        try {
            const response = await apiClient.delete("/creatives/userfiles/deleteuserfiles", {
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
            fetchUserImages();
        } catch (error) {
            console.error("Error deleting image:", error.response ? error.response.data : error.message);
        } finally {
            setIsDeleteModalOpen(false); // Close modal
            setImageToDelete(null);
        }
    };


    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredImages(images);
            return;
        }

        const filtered = images.filter(img =>
            img.name.toLowerCase().includes(query)
        );

        setFilteredImages(filtered);
        previousSearchResults.current = filtered;

    };


    const extractDisplayName = (name) => {
        if (!name) return '';
        const baseName = name.split('/').pop(); // get filename from path
        return baseName.substring(0, baseName.lastIndexOf('.')) || baseName;
    };

    const handleFolderClick = (folderName) => {
        // 🧹 Clear previous selections
        setSelectedImages([]);
        selectedImagesRef.current = [];
        if (searchQuery.trim() !== "") {
            setCurrentFolder(folderName + "/");
            return;
        }

        const newPath = `${currentFolder}${folderName}/`;
        setCurrentFolder(newPath);
    };

    const clearSelection = () => {
        setSelectedImages([]);
        selectedImagesRef.current = [];
    };
    const [isHoveredEdit, setIsHoveredEdit] = useState(false);
    const [isHoveredRename, setIsHoveredRename] = useState(false);
    const [isHoveredDuplicate, setIsHoveredDuplicate] = useState(false);
    const [isHoveredCopy, setIsHoveredCopy] = useState(false);
    const [isHoveredCut, setIsHoveredCut] = useState(false);
    const [isHoveredDelete, setIsHoveredDelete] = useState(false);
    const [isHoveredRestore, setIsHoveredRestore] = useState(false);

    const getMenuPosRightOfTarget = (event) => {
        const gapX = 12; // used only for right-side spacing
        const gapY = 8;

        const targetRect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 180;
        const menuHeight = 160;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let x, y;

        // Determine if there's space to the right
        const fitsRight = targetRect.right + menuWidth + gapX <= vw;
        const fitsBelow = targetRect.bottom + gapY + menuHeight <= vh;

        // If it fits on the right, add small gap
        if (fitsRight) {
            x = targetRect.right + gapX;
        } else {
            // If not, stick the menu directly against the left of the file — no gap
            x = targetRect.left - menuWidth + 200;
        }

        // Vertical logic (with small gap always below)
        if (fitsBelow) {
            y = targetRect.bottom + gapY;
        } else {
            y = targetRect.top - menuHeight;
        }

        // Final clamp to viewport
        x = Math.max(0, Math.min(x, vw - menuWidth));
        y = Math.max(0, Math.min(y, vh - menuHeight));

        return { x, y };
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };
    const downloadFile = async (fileUrl, filename) => {
        const safeName = filename || fileUrl.split("/").pop();
        try {
            const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(fileUrl)}`;
            const res = await fetch(proxyUrl, {
                method: "GET",
                headers: {
                    Authorization: localStorage.getItem("token")
                },
            });

            if (res.ok) {
                const blob = await res.blob();
                if (blob.size > 0) {
                    downloadBlob(blob, safeName);
                    return { ok: true };
                }
            }

            console.warn("Proxy failed or returned empty blob → fallback to direct");
        } catch (err) {
            console.warn("Proxy crashed → fallback to direct", err);
        }
        try {
            const res2 = await fetch(fileUrl);

            if (!res2.ok) throw new Error("Direct fetch failed: " + res2.status);

            const blob2 = await res2.blob();
            if (blob2.size === 0) throw new Error("Empty blob");

            downloadBlob(blob2, safeName);
            return { ok: true };

        } catch (err) {
            console.error("Direct download failed:", safeName, err);
            return { ok: false };
        }
    };










    return (
        <div
            style={{ padding: '20px', minHeight: '100vh', position: 'relative' }}
            onContextMenu={(e) => {
                e.preventDefault();

                const isMultiSelected = selectedImages.length > 1 && selectedImages.some(img => img.uid === image.uid);

                // Optional: prevent opening when clicking on file thumbnails or toolbars
                const blockedTags = ['IMG', 'VIDEO', 'BUTTON', 'INPUT', 'SPAN', 'SVG', 'PATH'];
                if (blockedTags.includes(e.target.tagName)) return;

                setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    target: null,
                    isFolder: false
                    // folderToDelete: image, // store the clicked folder
                });
            }}
        >
            <CreateCampaign
                visible={cdrawerVisible}
                accountis={selectedAccountNumber}
                onClose={onCloseDrawer}
                // changeRRefrst={changeRRefrst} 
                network={selectedKey}
                // imageFiles={selectedImages} 
                imageFiles={checkboxSelected}
                onDeleteFile={handleDeleteFile}
                selectedAccountNumber={selectedAccountNumber}
            />
            <h1 style={{ fontSize: '20px', color: theme === 'dark' ? '#ffffff' : '#384551' }}>Creative library</h1>
            <div
                style={{
                    // backgroundColor: theme === 'dark' ? 'black' : '#f5f5f5', // or any color
                    // padding: '10px',
                    // borderRadius: '8px',
                    // border: '1px solid #ccc',
                    marginBottom: '10px',
                }}
            >
                {/* 
                <Row justify="start" align="middle" gutter={[2, 4]}>
                    <Col xs={10} md={4}>
                        <Select
                            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                            showSearch
                            placeholder="Select Projects"
                            style={{ width: '80%' }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}

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
                    <Col xs={10} md={5} style={{ marginLeft:'-30px' }}>
                        <Select
                            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                            showSearch
                            placeholder="Select Accounts"
                            style={{ width: '80%',marginRight:'5px' }}
                            onChange={handleValueChange}
                            disabled={!selectedKey}
                            value={selectedValue}
                            selectedAccountNumber={selectedAccountNumber}
                            optionLabelProp="value"
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
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
                    </Col>
                    <Col xs={14} md={5} span={4} style={{ marginLeft: '-40px' }} className="Dashboard-Details-1">
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#91C25F',
                                    colorTextLightSolid: '#000',
                                },
                            }}>
                            <RangePicker
                                className="green-border-picker"
                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={[dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]}
                                format="YYYY-MM-DD"
                                allowClear={true}
                                // className="Dashboard-Details-1"
                                style={{ width: '90%',marginRight:'5px' }}
                                dropdownClassName={`${theme === 'dark' ? 'Dashboard-Details-1 dark-theme-dropdown' : 'Dashboard-Details-1'} custom-green-calendar`}

                            />

                        </ConfigProvider>
                    </Col>
                    <Col xs={14} md={6} span={5} style={{ marginLeft: '0px' }} className="Dashboard-Details-2">
                        <ConfigProvider>
                            <RangePicker

                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={[dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]}
                                format="YYYY-MM-DD"
                                allowClear={true}
                                style={{ width: '100%' }}
                                dropdownClassName={`custom-single-month-picker Dashboard-Details-2 ${theme === 'dark' ? 'dark-theme-dropdown' : ''}`}
                            />

                        </ConfigProvider>
                    </Col>
                    <Col>
                        {fromCampaigns === true ? (

                            <Button onClick={onSubmitData} className={theme === 'dark' ? 'dark-theme' : 'light-theme'} style={{ display: 'flex', border: 'none', justifyContent: 'center', maxWidth: '160px', backgroundColor: '#91C25F', color: theme === 'dark' ? 'black' : undefined }}>
                                Submit
                                {checkboxSelected.length > 0 && (
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
                                        {checkboxSelected.length}
                                    </Badge>
                                )}
                            </Button>
                        ) :
                            <Button
                                onClick={showDrawer}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                icon={<PlusOutlined style={{
                                    color: theme === 'dark' ? '#ffffff' : 'black',
                                }} />}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    border: '1px solid #4caf50',
                                    maxWidth: '160px',
                                    backgroundColor: 'transparent',
                                    color: theme === 'dark' ? '#ffffff' : 'black',
                                    transition: 'background 0.3s',
                                    marginLeft: '-22px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#91C25F'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                New campaign
                                {checkboxSelected.length > 0 && (
                                    <Badge
                                        style={{
                                            color: 'red',
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            fontSize: '12px',
                                            padding: '2px 6px',
                                            borderRadius: '50%'
                                        }}
                                        className="Badge"
                                        variant="destructive"
                                    >
                                        {checkboxSelected.length}
                                    </Badge>
                                )}
                            </Button>
                        }
                    </Col>
                </Row> */}
                <Row justify="start" align="middle" gutter={[8, 0]}>  {/* Adjusting the horizontal gap to 15px */}
                    <Col>
                        <Select
                            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                            showSearch
                            placeholder="Select Projects"
                            style={{ width: '160px' }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                            // dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            classNames={{
                                popup: {
                                    root: theme === 'dark' ? 'custom-dropdown' : ''
                                }
                            }}


                        >
                            {/* {options.length > 0 ? (
                                options.map(option => (
                                    <Option key={option.value} value={option.value} title={null}>
                                        {option.label}

                                    </Option>
                                ))
                            ) : (
                                <Option disabled></Option>
                            )} */}
                            {options.length > 0 ? (
                                options
                                    .sort((a, b) => {
                                        const aActive = networksWithStatus.find(n => n.Network === a.label)?.Status === "Active" ? 1 : 0;
                                        const bActive = networksWithStatus.find(n => n.Network === b.label)?.Status === "Active" ? 1 : 0;
                                        return bActive - aActive; // active first
                                    })
                                    .map(option => {
                                        const isActive = networksWithStatus.find(n => n.Network === option.label)?.Status === "Active";
                                        return (
                                            <Option key={option.value} value={option.value} title={null}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {isActive ? (
                                                        <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                                                    ) : (
                                                        <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
                                                    )}
                                                    <span>{option.label}</span>
                                                </div>
                                            </Option>
                                        );
                                    })
                            ) : (
                                <Option disabled></Option>
                            )}

                        </Select>
                    </Col>

                    <Col>
                        <Select
                            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                            showSearch
                            placeholder="Select Accounts"
                            style={{ width: '230px' }}
                            onChange={handleValueChange}
                            disabled={!selectedKey}
                            value={selectedValue}

                            // selectedAccountNumber={selectedAccountNumber}
                            optionLabelProp="value"
                            // dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            classNames={{
                                popup: {
                                    root: theme === 'dark' ? 'custom-dropdown' : ''
                                }
                            }}

                            filterOption={(input, option) => {
                                const number = option.value?.toString()?.toLowerCase() || "";
                                const name = option.accountname?.toString()?.toLowerCase() || "";

                                return (
                                    number.includes(input.toLowerCase()) ||
                                    name.includes(input.toLowerCase())
                                );
                            }}
                        >
                            {valueOptions.length > 0 ? (
                                valueOptions.map(option => (
                                    <Select.Option key={option.value} value={option.value} accountname={option.accountName}>
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
                                                maxWidth: '70%',
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
                                                    <CheckCircleFilled style={{ color: '#91C25F', fontSize: '15px' }} className='black-icon-active-1' />
                                                ) : (
                                                    <CloseCircleFilled style={{ color: '#EC7117', fontSize: '15px' }} className='black-icon-pause-1' />
                                                )}
                                            </span>
                                        </div>
                                    </Select.Option>
                                ))
                            ) : (
                                <Select.Option disabled></Select.Option>
                            )}
                        </Select>
                    </Col>

                    <Col>
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#91C25F',
                                    colorTextLightSolid: '#000',
                                },
                            }}>
                            <RangePicker
                                className="green-border-picker"
                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={[dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]}
                                format="YYYY-MM-DD"
                                allowClear={true}
                                style={{ width: '240px' }}
                                // dropdownClassName={`${theme === 'dark' ? 'Dashboard-Details-1 dark-theme-dropdown' : 'Dashboard-Details-1'}`}
                                classNames={{
                                    popup: {
                                        root: theme === 'dark' ? 'Dashboard-Details-1 dark-theme-dropdown' : 'Dashboard-Details-1'
                                    }
                                }}

                            />
                        </ConfigProvider>
                    </Col>

                    {/* <Col>
                        <Button
                            onClick={showDrawer}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            icon={<PlusOutlined style={{ color: theme === 'dark' ? '#ffffff' : 'black' }} />}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                border: '1px solid #4caf50',
                                maxWidth: '160px',
                                backgroundColor: 'transparent',
                                color: theme === 'dark' ? '#ffffff' : 'black',
                                transition: 'background 0.3s',

                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#91C25F'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Create campaign
                            {checkboxSelected.length > 0 && (
                                <Badge
                                    style={{
                                        color: 'red',
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        fontSize: '12px',
                                        padding: '2px 6px',
                                        borderRadius: '50%'
                                    }}
                                    className="Badge"
                                    variant="destructive"
                                >
                                    {checkboxSelected.length}
                                </Badge>
                            )}
                        </Button>
                    </Col> */}
                    <Col>
                        {fromCampaigns === true ? (

                            <Button onClick={onSubmitData} className={theme === 'dark' ? 'dark-theme' : 'light-theme'} style={{ display: 'flex', border: 'none', justifyContent: 'center', maxWidth: '160px', backgroundColor: '#91C25F', color: theme === 'dark' ? 'black' : undefined }}>
                                Submit
                                {checkboxSelected.length > 0 && (
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
                                        {checkboxSelected.length}
                                    </Badge>
                                )}
                            </Button>
                        ) : ("")
                            // <Button
                            //     onClick={showDrawer}
                            //     className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            //     icon={<PlusOutlined style={{
                            //         color: theme === 'dark' ? '#ffffff' : 'black',
                            //     }} />}
                            //     style={{
                            //         display: 'flex',
                            //         justifyContent: 'center',
                            //         border: '1px solid #4caf50',
                            //         maxWidth: '160px',
                            //         backgroundColor: 'transparent',
                            //         color: theme === 'dark' ? '#ffffff' : 'black',
                            //         transition: 'background 0.3s',
                            //         marginLeft: '0px'
                            //     }}
                            //     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#91C25F'}
                            //     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            // >
                            //     New campaign
                            //     {checkboxSelected.length > 0 && (
                            //         <Badge
                            //             style={{
                            //                 color: 'red',
                            //                 position: 'absolute',
                            //                 top: '-5px',
                            //                 right: '-5px',
                            //                 fontSize: '12px',
                            //                 padding: '2px 6px',
                            //                 borderRadius: '50%'
                            //             }}
                            //             className="Badge"
                            //             variant="destructive"
                            //         >
                            //             {checkboxSelected.length}
                            //         </Badge>
                            //     )}
                            // </Button>
                        }
                    </Col>
                </Row>



                {/* URL Input for Image */}
                <div className='upload-container-11'>
                    <Col className='container'>
                        <Input
                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            placeholder="Image URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleUploadURL();
                            }}
                            style={{
                                width: '180px',
                                marginRight: '10px',
                                border: '1px solid #4caf50',
                                // backgroundColor: theme === 'dark' ? '#2c2c2c' : undefined,
                                // color: theme === 'dark' ? '#fff' : undefined
                            }}
                        />
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
                            <Button
                                style={{
                                    marginLeft: '-4px',
                                    border: '1px solid #4caf50',
                                    backgroundColor: theme === 'dark' ? '#5d5b5b' : undefined,
                                    color: theme === 'dark' ? '#fff' : undefined
                                }}
                                icon={<UploadOutlined style={{ color: theme === 'dark' ? '#fff' : undefined }} />}
                            >
                                Upload
                            </Button>
                        </Upload>
                    </Col>
                    <Col className='container'>
                        <Input
                            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                            placeholder="Search..."
                            // suffix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={handleSearch} // Call function on user input
                            style={{ width: '170px', border: '1px solid #4caf50' }}
                        />
                        <Button style={{ backgroundColor: '#91C25F', border: 'none', marginLeft: '7px' }} onClick={fetchUserImages} icon={<ReloadOutlined className="black-icon" />} />
                        <Button
                            icon={<DeleteOutlined className="black-icon" />}
                            onClick={() => setIsTrashView(prev => !prev)}
                            style={{
                                backgroundColor: isTrashView ? '#e6f7ff' : '#91C25F',
                                color: isTrashView ? '#1d39c4' : 'black',
                                border: isTrashView ? '1px solid #91d5ff' : '1px solid #4caf50',
                                marginLeft: '5px',
                                fontWeight: 500,
                            }}
                        >
                            {isTrashView ? 'Back to files' : 'Trash'}
                        </Button>
                    </Col>

                </div>
            </div>

            <div style={{ display: 'flex' }}>
                {currentFolder && (
                    <Button type="link" icon={<ArrowLeftOutlined style={{ color: theme === 'dark' ? '#91C25F' : 'black' }} />} onClick={() => {
                        if (searchQuery.trim() !== "" && previousSearchResults.current) {
                            setFilteredImages(previousSearchResults.current);
                            return;

                        }
                        const segments = currentFolder.split('/').filter(Boolean);
                        const newPath = segments.slice(0, -1).join('/') + (segments.length > 1 ? '/' : '');
                        setCurrentFolder(newPath);
                    }}>
                    </Button>
                )}

                {currentFolder && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: theme === 'dark' ? '#91C25F' : '#000' }}>
                        {currentFolder
                            .split('/')
                            .filter(Boolean) // remove empty
                            .map((folder, idx, arr) => {
                                const fullPath = arr.slice(0, idx + 1).join('/') + '/';
                                return (
                                    <span key={idx}>
                                        {idx > 0 && ' / '}
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '5px',
                                            }}
                                            onClick={() => setCurrentFolder(fullPath)}
                                        >
                                            {folder}
                                        </span>
                                    </span>
                                );
                            })}
                    </div>
                )}
            </div>

            {
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        {/* <Spin size="large" tip="Loading files..." /> */}
                        <div style={{ padding: '24px' }}>
                            <Skeleton active paragraph={{ rows: 20 }} />
                        </div>
                    </div>
                ) : (<div
                    id="file-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '10px',
                        marginTop: '20px',
                        // border: '2px solid #91C25F',
                        border: isTrashView ? '2px solid #91d5ff' : '2px solid #91C25F',
                        padding: '10px',
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {filteredImages.map((image) => {
                        const isSelected = selectedImages.some((img) => img.uid === image.uid);
                        const isVideo = image.url?.match(/\.(mp4|mov)$/i);

                        return (
                            <div key={`${image.uid}-${isSelected}`}>
                                <div
                                    className="selectable"
                                    data-uid={image.uid}
                                    data-is-folder={image.isFolder ? "true" : "false"}
                                    draggable
                                    // draggable={!image.isFolder}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("drag-item-key", image.uid);
                                        e.dataTransfer.setData("drag-item-name", image.name);
                                    }}
                                    onDragEnd={() => setDraggableUid(null)}
                                    // onContextMenu={(e) => {
                                    //     e.preventDefault();
                                    //     e.stopPropagation();
                                    //     const isMultiSelected = selectedImages.length > 1 && selectedImages.some(img => img.uid === image.uid);
                                    //     setContextMenu({
                                    //         visible: true,
                                    //         x: e.clientX,
                                    //         y: e.clientY,
                                    //         target: image,
                                    //         isFolder: image.isFolder,
                                    //         selectedList: isMultiSelected ? selectedImages : null,
                                    //     });
                                    // }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const isMultiSelected = selectedImages.length > 1 && selectedImages.some(img => img.uid === image.uid);

                                        const pos = getMenuPosRightOfTarget(e);

                                        setContextMenu({
                                            visible: true,
                                            x: pos.x,
                                            y: pos.y,
                                            target: image,
                                            isFolder: image.isFolder,
                                            selectedList: isMultiSelected ? selectedImages : null,
                                        });
                                    }}

                                    style={{
                                        position: 'relative',
                                        marginLeft: '0px',
                                        width: '150px',
                                        height: '150px',
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'visible',
                                        padding: '0px',
                                        // backgroundColor: hoveredImage === image.uid ? '#E6FFEA' : 'transparent', // light blue on hover
                                        backgroundColor:
                                            hoveredImage === image.uid
                                                ? theme === 'dark'
                                                    ? '#91C25F'
                                                    : '#91C25F'
                                                : 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        transition: 'background-color 0.2s ease-in-out',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={() => setHoveredImage(image.uid)}
                                    onMouseLeave={() => setHoveredImage(null)}
                                    onClick={(e) => handleImageSelect(image, e)}
                                // onClick={(e) => {
                                //     if (image.isFolder) return; // clicking folder still opens it, not select
                                //     handleImageSelect(image);
                                // }}
                                >
                                    {!image.isFolder && (
                                        <Checkbox
                                            className="custom-checkbox"
                                            checked={checkboxSelected.some((img) => img.uid === image.uid)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                const fileWithType = { ...image, type: getFileType(image.url) };
                                                setCheckboxSelected((prev) => {
                                                    if (e.target.checked) {
                                                        const updated = [...prev, fileWithType];
                                                        selectedImagesRef.current = updated;
                                                        return updated;
                                                    } else {
                                                        const updated = prev.filter((img) => img.uid !== image.uid);
                                                        selectedImagesRef.current = updated;
                                                        return updated;
                                                    }
                                                });
                                                if (!e.target.checked) {
                                                    setSelectedImages((prev) =>
                                                        prev.filter((img) => img.uid !== image.uid)
                                                    );
                                                }
                                                setHighlightedFolders(prev => {
                                                    const uid = image.uid;
                                                    if (!uid) return prev;
                                                    const folderKey = uid.substring(0, uid.lastIndexOf("/") + 1);

                                                    if (e.target.checked) {

                                                        return [...new Set([...prev, folderKey])];
                                                    }
                                                    const selectedNow = checkboxSelected.filter(f => f.uid !== uid);
                                                    const hasOtherFilesInSameFolder = selectedNow.some(f =>
                                                        f.uid.startsWith(folderKey)
                                                    );

                                                    if (hasOtherFilesInSameFolder) {
                                                        return prev;
                                                    }
                                                    return prev.filter(k => k !== folderKey);
                                                });

                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: 5,
                                                left: 5,
                                                zIndex: 10,
                                            }}
                                        />
                                    )}

                                    {image.isFolder ? (
                                        <div
                                            onMouseEnter={() => setHoveredImage(image.uid)}
                                            onMouseLeave={() => setHoveredImage(null)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                backgroundColor:
                                                    highlightedFolders.includes(image.uid)
                                                        ? 'rgba(145, 194, 95, 0.20)'
                                                        : hoveredImage === image.uid
                                                            ? 'rgba(145, 194, 95, 0.15)'
                                                            : 'transparent',

                                                border:
                                                    highlightedFolders.includes(image.uid)
                                                        ? '2px solid #91C25F'
                                                        : '1px solid transparent',


                                            }}

                                            // onClick={(e) => {
                                            //     e.stopPropagation();
                                            //     if (image.isFolder) {
                                            //         setSelectedImages([]);
                                            //         selectedImagesRef.current = [];
                                            //         handleFolderClick(image.name);
                                            //     } else {
                                            //         handleImageSelect(image);
                                            //     }
                                            // }}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                const isCtrl = e.ctrlKey || e.metaKey;
                                                if (isCtrl) {
                                                    setSelectedImages(prev => {
                                                        const already = prev.some(f => f.uid === image.uid);
                                                        return already
                                                            ? prev.filter(f => f.uid !== image.uid)
                                                            : [...prev, image];
                                                    });
                                                    selectedImagesRef.current = selectedImages;
                                                    return;
                                                }


                                                if (image.isFolder) {
                                                    setSelectedImages([]);
                                                    selectedImagesRef.current = [];
                                                    handleFolderClick(image.name);
                                                } else {
                                                    handleImageSelect(image);
                                                }
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                const sourceKey = e.dataTransfer.getData("drag-item-key");
                                                const sourceName = e.dataTransfer.getData("drag-item-name");
                                                if (!sourceKey || !sourceName || sourceKey === image.uid) return;

                                                const targetKey = `${uploadPrefix}${currentFolder}${image.name}/`;
                                                const destinationKey = `${targetKey}${sourceName}${sourceKey.endsWith("/") ? '/' : ''}`;

                                                await apiClient.post("/creatives/folders/moveFileOrFolder", {
                                                    sourceKey,
                                                    destinationKey,
                                                }, {
                                                    headers: {
                                                        Authorization: localStorage.getItem("token"),
                                                        username: userdetails.userName,
                                                    },
                                                });

                                                fetchUserImages();
                                            }}
                                        >
                                            <img
                                                src="https://img.icons8.com/fluency/48/folder-invoices.png"
                                                alt="Folder"
                                                // style={{ width: '40px', height: '40px', marginBottom: '8px' }}
                                                style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    marginBottom: '8px',
                                                    transition: 'transform 0.2s ease-in-out',
                                                }}
                                            />
                                            {/* <Tooltip title={image.name}> */}
                                            <div
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    width: '100%',
                                                    // color: '#000',
                                                    color: theme === 'dark' ? '#fff' : '#000',
                                                    maxWidth: '130px',
                                                }}
                                            >
                                                {image.name}
                                            </div>
                                            {/* </Tooltip> */}
                                            {/* Show hover tooltip only if this folder is hovered */}
                                            {hoveredImage === image.uid && (
                                                <div
                                                    style={{
                                                        maxWidth: '250px',
                                                        position: 'absolute',
                                                        bottom: '100%',
                                                        marginBottom: '6px',
                                                        // backgroundColor: '#fdfdfd',
                                                        backgroundColor: theme === 'dark' ? '#222' : '#fdfdfd',
                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                        border: '1px solid #ccc',
                                                        padding: '6px 10px',
                                                        fontSize: '11px',
                                                        // whiteSpace: 'nowrap',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                        borderRadius: '4px',
                                                        zIndex: 10,
                                                        // overflow: 'hidden',
                                                        // textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    <div>Created: {moment(image.createdDate).format("YYYY-MM-DD HH:mm")}</div>
                                                    <div>Modified: {moment(image.modifiedDate).format("YYYY-MM-DD HH:mm")}</div>
                                                    <div style={{
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'normal',
                                                        overflowWrap: 'anywhere',
                                                        marginTop: '4px'
                                                    }}>{image.name}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        isVideo ? (
                                            <video
                                                src={image.url}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                onLoadedData={(e) => e.target.play().catch(() => { })}
                                            />
                                        ) : (
                                            <img
                                                src={image.url}
                                                alt="Uploaded"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )
                                    )}

                                    {isSelected && !checkboxSelected.some(img => img.uid === image.uid) && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#91C25F',
                                                color: 'black',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                zIndex: 10,
                                            }}
                                        >
                                            ✓
                                        </div>
                                    )}

                                    {!image.isFolder && hoveredImage === image.uid && (
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
                                                borderRadius: '8px',
                                            }}
                                        >
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
                                                    border: 'none',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {!image.isFolder && (
                                    <div
                                        style={{
                                            marginTop: '6px',
                                            fontSize: '13px',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere',
                                            maxWidth: '150px',
                                            textAlign: 'center',
                                        }}
                                        title={image.name}
                                    >
                                        {(typeof editingUid === 'string' && editingUid === image.uid) ||
                                            (Array.isArray(editingUid) && editingUid.includes(image.uid) && image.uid === editingUid[0]) ? (
                                            <Input
                                                size="small"
                                                value={inlineName}
                                                onChange={(e) => setInlineName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleInlineRename(image); // single or multi handled internally
                                                }}
                                                onBlur={() => setEditingUid(null)}
                                                autoFocus
                                            />
                                        ) : (
                                            extractDisplayName(image.name)
                                        )}

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>)
            }

            {/* Ant Design Modal for Delete Confirmation */}
            <Modal
                title="Confirm deletion"
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
                destroyOnHidden={true} // 🔹 Ensures video stops playing when closed
            >
                {viewedImage && viewedImage.url ? (
                    viewedImage.url?.match(/\.(mp4|mov)$/i) ? (
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleConfirmUpload(); // ✅ Trigger upload when Enter is pressed
                                }
                            }}
                            style={{ marginTop: 10 }}
                        />
                    </>
                )}

            </Modal>
            {/* Image Editor */}
            {
                isEditorVisible && selectedImage && (
                    <FabricCanvas
                        fileId={selectedImage.uid}
                        initialImage={selectedImage.url}
                        closeCanvasModal={() => setIsEditorVisible(false)}
                        onSaveEditedImage={(fileId, editedImage) => handleSaveEditedImage(fileId, editedImage)}
                    />
                )
            }

            {
                contextMenu.visible && (
                    <div
                        className="custom-context-menu"
                        ref={menuRef}
                        // style={{
                        //     position: 'fixed',
                        //     top: (contextMenu.y + menuHeight > window.innerHeight
                        //         ? contextMenu.y - menuHeight
                        //         : contextMenu.y),
                        //     left: contextMenu.x,
                        //     background: theme === 'dark' ? '#000' : '#fff',
                        //     boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        //     zIndex: 9999,
                        //     borderRadius: '6px',
                        //     padding: '4px 0',
                        //     fontWeight: 500,
                        //     cursor: 'pointer',
                        //     minWidth: '160px'
                        // }}
                        style={{
                            position: 'fixed',
                            top: `${contextMenu.y}px`,
                            left: `${contextMenu.x}px`,
                            zIndex: 9999,
                            width: '180px',
                            background: theme === 'dark' ? '#2a2a2a' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#000',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderRadius: '6px',
                            padding: '8px 0'
                        }}
                        onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
                    >
                        {/* Right-click on blank space */}
                        {!contextMenu.target && (
                            <>
                                <div
                                    style={{ padding: '8px 12px' }}
                                    onClick={() => {
                                        setNewFolderModal({ visible: true, name: '', mode: 'create', folderToRename: null });
                                        setContextMenu({ ...contextMenu, visible: false });
                                    }}
                                >
                                    ➕ New Folder
                                </div>

                                {clipboardFile?.length > 0 && (
                                    <div
                                        style={{ padding: '8px 12px' }}
                                        onClick={async () => {
                                            try {
                                                await Promise.all(
                                                    clipboardFile.map(async (file) => {
                                                        const sourceKey = file.uid;
                                                        const name = file.name;
                                                        let destinationKey = `${uploadPrefix}${currentFolder}${name}${file.isFolder ? '/' : ''}`;

                                                        if (file.action === "copy") {
                                                            if (file.isFolder) {
                                                                // 📁 Copy folder
                                                                await apiClient.post("/creatives/folders/copyfolder", {
                                                                    sourceKey, destinationKey,
                                                                }, {
                                                                    headers: {
                                                                        Authorization: localStorage.getItem("token"),
                                                                        username: userdetails.userName,
                                                                    }
                                                                });
                                                            } else {
                                                                // 📄 Copy file
                                                                const cloneNumber = getCloneNumber(name);
                                                                const dotIndex = name.lastIndexOf(".");
                                                                const base = name.substring(0, dotIndex);
                                                                const ext = name.substring(dotIndex);
                                                                const newName = `${base}(${cloneNumber})${ext}`;
                                                                destinationKey = `${uploadPrefix}${currentFolder}${newName}`;

                                                                const proxyUrl = `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(file.url)}`;
                                                                const res = await fetch(proxyUrl, {
                                                                    method: "GET",
                                                                    headers: {
                                                                        Authorization: localStorage.getItem("token")
                                                                    },
                                                                });
                                                                const blob = await res.blob();

                                                                const formData = new FormData();
                                                                formData.append("file", new File([blob], newName, { type: blob.type }));
                                                                formData.append("filename", destinationKey);
                                                                formData.append("folder", currentFolder);

                                                                await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", formData, {
                                                                    headers: {
                                                                        Authorization: localStorage.getItem("token"),
                                                                        username: userdetails.userName,
                                                                    }
                                                                });
                                                            }
                                                        }

                                                        if (file.action === "cut") {
                                                            // ✂️ Move file or folder
                                                            await apiClient.post("/creatives/folders/moveFileOrFolder", {
                                                                sourceKey,
                                                                destinationKey,
                                                            }, {
                                                                headers: {
                                                                    Authorization: localStorage.getItem("token"),
                                                                    username: userdetails.userName,
                                                                }
                                                            });
                                                        }
                                                    })
                                                );
                                                setSelectedImages([]);
                                                fetchUserImages();
                                                setClipboardFile(null);
                                                setContextMenu({ ...contextMenu, visible: false });
                                                // message.success(`Pasted ${clipboardFile.length} item(s)`);
                                            } catch (err) {
                                                console.error("Paste error:", err);
                                                message.error("Failed to paste some items.");
                                            }
                                        }}
                                    >
                                        📄 Paste
                                    </div>
                                )}
                            </>
                        )}

                        {/* Right-click on Trash item */}
                        {isTrashView && (contextMenu.selectedList?.length > 0 || contextMenu.target) && (
                            <>

                                <div style={{ padding: '8px 12px', fontWeight: 'bold' }}>
                                    {contextMenu.selectedList?.length > 0
                                        ? `${contextMenu.selectedList.length} selected`
                                        : contextMenu.target?.name}
                                </div>

                                {/* Delete Permanently */}
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        color: 'red',
                                        backgroundColor: isHoveredDelete ? '#e6f7ff' : 'transparent',
                                        cursor: 'pointer',
                                    }}
                                    onClick={async () => {
                                        const items = contextMenu.selectedList?.length > 0 ? contextMenu.selectedList : [contextMenu.target];
                                        try {
                                            await Promise.all(items.map(item =>
                                                apiClient.delete("/creatives/trashfiles", {
                                                    headers: {
                                                        Authorization: localStorage.getItem("token"),
                                                        username: userdetails.userName,
                                                        "x-file": item.uid,
                                                    },
                                                })
                                            ));
                                            setSelectedImages([]);
                                            // message.success("Deleted permanently");
                                            fetchUserImages();
                                        } catch (err) {
                                            console.error("Permanent delete failed", err);
                                            message.error("Failed to delete permanently.");
                                        }
                                        setContextMenu({ ...contextMenu, visible: false });
                                    }}
                                    onMouseEnter={() => setIsHoveredDelete(true)}
                                    onMouseLeave={() => setIsHoveredDelete(false)}
                                >
                                    ❌ Delete Permanently
                                </div>

                                {/* Restore */}
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: isHoveredRestore ? '#e6f7ff' : 'transparent',
                                        color: isHoveredRestore ? '#333' : 'inherit',
                                        cursor: 'pointer',

                                    }}
                                    onClick={async () => {
                                        const items = contextMenu.selectedList?.length > 0 ? contextMenu.selectedList : [contextMenu.target];
                                        try {
                                            await Promise.all(items.map(async (item) => {
                                                const trashKey = item.uid;
                                                const match = trashKey.match(/Trashfiles\/(?:[^/]+\/)?(.+)/);
                                                const relativePath = match?.[1];
                                                if (!relativePath) throw new Error("Invalid original path");

                                                const originalKey = `${selectedKey}/${selectedAccountNumber}/${relativePath}`;
                                                await apiClient.post("/creatives/trashfiles", {
                                                    trashKey,
                                                    originalKey,
                                                }, {
                                                    headers: {
                                                        Authorization: localStorage.getItem("token"),
                                                        username: userdetails.userName,
                                                    },
                                                });
                                            }));
                                            setSelectedImages([]);
                                            // message.success("Restored successfully");
                                            fetchUserImages();
                                        } catch (err) {
                                            console.error("Restore failed", err);
                                            message.error("Failed to restore some items.");
                                        }

                                        setContextMenu({ ...contextMenu, visible: false });
                                    }}
                                    onMouseEnter={() => setIsHoveredRestore(true)}
                                    onMouseLeave={() => setIsHoveredRestore(false)}
                                >
                                    🔁 Restore
                                </div>
                            </>
                        )}

                        {/* MULTI SELECT context (not in Trash) */}
                        {!isTrashView && contextMenu.selectedList?.length > 1 && (

                            <>
                                <div
                                    style={{ padding: "8px 12px", cursor: "pointer" }}
                                    onClick={async () => {
                                        const selected = contextMenu.selectedList;

                                        let allFiles = [];

                                        for (const item of selected) {

                                            // 1️⃣ If it's a FILE → push directly
                                            if (!item.isFolder) {
                                                allFiles.push({
                                                    uid: item.uid,
                                                    name: item.name,
                                                    url: item.url,
                                                    type: getFileType(item.url),
                                                });
                                                continue;
                                            }

                                            // 2️⃣ If it's a FOLDER → fetch files inside
                                            try {
                                                const res = await apiClient.get("/creatives/userfiles/getuserfiles", {
                                                    headers: {
                                                        username: userdetails.userName,
                                                        "x-folder": item.uid,
                                                        Authorization: localStorage.getItem("token"),
                                                    },
                                                });

                                                const files = res.data.images
                                                    .filter(f => !f.key.endsWith("/"))
                                                    .map(f => ({
                                                        uid: f.key,
                                                        name: f.key.split("/").pop(),
                                                        url: `https://sudheer-fbimages.s3.amazonaws.com/${f.key}`,
                                                        type: getFileType(f.key),
                                                    }));

                                                allFiles.push(...files);

                                            } catch (err) {
                                                console.error("Folder load failed:", err);
                                            }
                                        }

                                        // 3️⃣ Merge files into checkboxSelected
                                        setCheckboxSelected(prev => {
                                            const merged = [...prev, ...allFiles].filter(
                                                (v, i, arr) => arr.findIndex(t => t.uid === v.uid) === i
                                            );
                                            selectedImagesRef.current = merged;
                                            return merged;
                                        });

                                        // 4️⃣ Highlight parent folders (for files)
                                        setHighlightedFolders(prev => {
                                            const keys = allFiles.map(f =>
                                                f.uid.substring(0, f.uid.lastIndexOf("/") + 1)
                                            );
                                            return [...new Set([...prev, ...keys])];
                                        });

                                        setContextMenu({ ...contextMenu, visible: false });

                                        message.success(`${allFiles.length} items added to campaign`);
                                    }}
                                >
                                    ➕ Add to Campaign
                                </div>


                                <div style={{ padding: '8px 12px', fontWeight: 'bold' }}>
                                    {contextMenu.selectedList.length} selected
                                </div>

                                <div style={{ padding: '8px 12px' }} onClick={() => {
                                    setClipboardFile(contextMenu.selectedList.map(item => ({
                                        ...item,
                                        action: 'copy',
                                        isFolder: item.isFolder
                                    })));
                                    setSelectedImages([]);
                                    selectedImagesRef.current = [];
                                    // message.success("Items copied");
                                    setContextMenu({ ...contextMenu, visible: false });
                                }}>
                                    <CopyOutlined style={{ marginRight: 8 }} />
                                    Copy
                                </div>

                                <div style={{ padding: '8px 12px' }} onClick={() => {
                                    setClipboardFile(contextMenu.selectedList.map(item => ({
                                        ...item,
                                        action: 'cut',
                                        isFolder: item.isFolder
                                    })));
                                    setFilteredImages(prev =>
                                        prev.filter(item => !contextMenu.selectedList.some(sel => sel.uid === item.uid))
                                    );
                                    setSelectedImages([]);
                                    selectedImagesRef.current = [];
                                    // message.success("Items cut");
                                    setContextMenu({ ...contextMenu, visible: false });
                                }}>
                                    ✂️ Cut
                                </div>

                                <div style={{ padding: '8px 12px', color: 'red' }} onClick={async () => {
                                    try {
                                        await Promise.all(
                                            contextMenu.selectedList.map(item => {
                                                const isFolder = item.isFolder;
                                                if (isFolder) {
                                                    return apiClient.delete("/creatives/folders/deletefolder", {
                                                        headers: {
                                                            Authorization: localStorage.getItem("token"),
                                                            username: userdetails.userName,
                                                            "x-folder": item.uid,
                                                        },
                                                    });
                                                } else {
                                                    return apiClient.delete("/creatives/userfiles/deleteuserfiles", {
                                                        headers: {
                                                            Authorization: localStorage.getItem("token"),
                                                            username: userdetails.userName,
                                                            "file-key": item.uid,
                                                        },
                                                    });
                                                }
                                            })
                                        );
                                        setSelectedImages([]);
                                        // message.success("Selected items moved to bin");
                                        fetchUserImages();
                                        setContextMenu({ ...contextMenu, visible: false });
                                    } catch (err) {
                                        console.error("Bulk delete failed:", err);
                                        message.error("Failed to move some items to bin.");
                                    }
                                }}
                                >
                                    🗑️ Move to Bin
                                </div>

                                <div
                                    style={{ padding: '8px 12px' }}
                                    onClick={() => {
                                        const firstName = contextMenu.selectedList[0]?.name.split('.')[0] || 'Renamed';
                                        setInlineName(firstName);
                                        setEditingUid(contextMenu.selectedList.map(f => f.uid)); // multi rename mode
                                        setSelectedImages([]);
                                        selectedImagesRef.current = [];
                                        setContextMenu({ ...contextMenu, visible: false });
                                    }}
                                >
                                    ✏️ Rename All
                                </div>
                            </>
                        )}

                        {/* SINGLE SELECT fallback (file or folder) */}
                        {!isTrashView && !contextMenu.selectedList?.length && contextMenu.target && (
                            <>
                                {/* <div style={{ padding: '8px 12px', fontWeight: 'bold' }}>{contextMenu.target.name}</div> */}

                                {contextMenu.isFolder ? (
                                    <>
                                        <div
                                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                                            onClick={async () => {
                                                const folderKey = contextMenu.target.uid;

                                                // 1️⃣ Fetch files inside that folder
                                                const res = await apiClient.get("/creatives/userfiles/getuserfiles", {
                                                    headers: {
                                                        username: userdetails.userName,
                                                        "x-folder": folderKey,
                                                        Authorization: localStorage.getItem("token"),
                                                    },
                                                });

                                                // 2️⃣ Extract ONLY files
                                                const files = res.data.images
                                                    .filter((file) => !file.key.endsWith("/")) // skip folders
                                                    .map((file) => ({
                                                        uid: file.key,
                                                        name: file.key.split("/").pop(),
                                                        url: `https://sudheer-fbimages.s3.amazonaws.com/${file.key}`,
                                                        type: getFileType(file.key),
                                                    }));

                                                // 3️⃣ Save to submit selection
                                                setCheckboxSelected(prev => {
                                                    // remove duplicates using uid
                                                    const merged = [...prev, ...files].filter(
                                                        (v, i, arr) => arr.findIndex(t => t.uid === v.uid) === i
                                                    );

                                                    selectedImagesRef.current = merged;
                                                    return merged;
                                                });
                                                setHighlightedFolders(prev => [...new Set([...prev, folderKey])]);

                                                setContextMenu({ ...contextMenu, visible: false });

                                                message.success(`${files.length} files added to campaign`);
                                            }}
                                        >
                                            ➕ Add to Campaign
                                        </div>


                                        <div style={{ padding: '8px 12px' }} onClick={() => {
                                            handleFolderClick(contextMenu.target.name);
                                            setSelectedImages([]);
                                            setContextMenu({ ...contextMenu, visible: false });
                                        }}>📂 Open</div>

                                        <div style={{ padding: '8px 12px' }} onClick={() => {
                                            setNewFolderModal({
                                                visible: true,
                                                name: contextMenu.target.name,
                                                mode: "rename",
                                                folderToRename: contextMenu.target,
                                            });
                                            setSelectedImages([]);
                                            setContextMenu({ ...contextMenu, visible: false });
                                        }}>
                                            <MdDriveFileRenameOutline style={{ fontSize: '16px', marginRight: '8px' }} />
                                            Rename
                                        </div>

                                        <div style={{ padding: '8px 12px' }} onClick={() => {
                                            setClipboardFile([{ ...contextMenu.target, action: "copy", isFolder: true }]);
                                            setSelectedImages([]);
                                            // message.success("Folder copied");
                                            setContextMenu({ ...contextMenu, visible: false });
                                        }}>
                                            <CopyOutlined style={{ marginRight: 8 }} />
                                            Copy
                                        </div>

                                        <div style={{ padding: '8px 12px' }} onClick={() => {
                                            setClipboardFile([{ ...contextMenu.target, action: "cut", isFolder: true }]);
                                            setFilteredImages(prev => prev.filter(f => f.uid !== contextMenu.target.uid));
                                            setSelectedImages([]);
                                            // message.success("Folder cut");
                                            setContextMenu({ ...contextMenu, visible: false });
                                        }}>
                                            ✂️ Cut
                                        </div>

                                        <div style={{ padding: '8px 12px', color: 'red' }} onClick={() => {
                                            setDeleteFolderModal({ visible: true, folder: contextMenu.target });
                                            setSelectedImages([]);
                                            setContextMenu({ ...contextMenu, visible: false });
                                        }}>🗑️ Move to Bin</div>
                                    </>
                                ) : (
                                    <>

                                        <div
                                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                                            onClick={async () => {
                                                try {
                                                    const target = contextMenu.target;
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                    const url = target?.url;
                                                    const name = target?.name || (target?.uid?.split('/').pop() || 'file');
                                                    if (!url) {
                                                        message.error("File URL unavailable for download");
                                                        return;
                                                    }
                                                    message.info(`Downloading ${name}...`);
                                                    const res = await downloadFile(url, name);
                                                    if (res.ok) message.success(`Downloaded ${name}`);
                                                    else message.error(`Failed to download ${name}`);
                                                } catch (err) {
                                                    console.error(err);
                                                    message.error("Download failed");
                                                }
                                            }}
                                        >
                                            ⬇️ Download
                                        </div>

                                        <div>
                                            {/* Edit div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isHoveredEdit ? '#e6f7ff' : 'transparent',
                                                    color: isHoveredEdit ? '#333' : 'inherit',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    handleEditFile(contextMenu.target);
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredEdit(true)}
                                                onMouseLeave={() => setIsHoveredEdit(false)}
                                            >
                                                <MdEdit style={{ fontSize: '16px', marginRight: '8px' }} />
                                                Edit
                                            </div>

                                            {/* Rename div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isHoveredRename ? '#e6f7ff' : 'transparent',
                                                    color: isHoveredRename ? '#333' : 'inherit',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    setEditingUid(contextMenu.target.uid);
                                                    setInlineName(extractDisplayName(contextMenu.target.name));
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredRename(true)}
                                                onMouseLeave={() => setIsHoveredRename(false)}
                                            >
                                                <MdDriveFileRenameOutline style={{ fontSize: '16px', marginRight: '8px' }} />
                                                Rename
                                            </div>

                                            {/* Duplicate div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isHoveredDuplicate ? '#e6f7ff' : 'transparent',
                                                    color: isHoveredDuplicate ? '#333' : 'inherit',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    handleCloneFile(contextMenu.target);
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredDuplicate(true)}
                                                onMouseLeave={() => setIsHoveredDuplicate(false)}
                                            >
                                                <HiOutlineDuplicate style={{ fontSize: '16px', marginRight: '8px' }} />
                                                Duplicate
                                            </div>

                                            {/* Delete div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    color: 'red',
                                                    backgroundColor: isHoveredDelete ? '#e6f7ff' : 'transparent',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    showDeleteModal(contextMenu.target);
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredDelete(true)}
                                                onMouseLeave={() => setIsHoveredDelete(false)}
                                            >
                                                🗑️ Move to Bin
                                            </div>

                                            {/* Copy div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isHoveredCopy ? '#e6f7ff' : 'transparent',
                                                    color: isHoveredCopy ? '#333' : 'inherit',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    setClipboardFile([{ ...contextMenu.target, action: 'copy', isFolder: false }]);
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredCopy(true)}
                                                onMouseLeave={() => setIsHoveredCopy(false)}
                                            >
                                                <CopyOutlined style={{ marginRight: 8 }} />
                                                Copy
                                            </div>

                                            {/* Cut div */}
                                            <div
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: isHoveredCut ? '#e6f7ff' : 'transparent',
                                                    color: isHoveredCut ? '#333' : 'inherit',
                                                    cursor: 'pointer',

                                                }}
                                                onClick={() => {
                                                    setClipboardFile([{ ...contextMenu.target, action: 'cut', isFolder: false }]);
                                                    setFilteredImages(prev => prev.filter(f => f.uid !== contextMenu.target.uid));
                                                    setSelectedImages([]);
                                                    setContextMenu({ ...contextMenu, visible: false });
                                                }}
                                                onMouseEnter={() => setIsHoveredCut(true)}
                                                onMouseLeave={() => setIsHoveredCut(false)}
                                            >
                                                ✂️ Cut
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )
            }

            <Modal
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                title={newFolderModal.mode === "rename" ? "Rename Folder" : "Create New Folder"}
                open={newFolderModal.visible}
                onOk={async () => {
                    const { name, mode, folderToRename } = newFolderModal;
                    if (!name.trim()) {
                        message.error("Folder name is required!");
                        return;
                    }

                    const baseKey = `${uploadPrefix}${currentFolder}${name}/`;
                    const folderExists = images.some(img => img.uid === baseKey && img.isFolder);

                    const createFolder = async (key) => {
                        await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", new FormData(), {
                            headers: {
                                Authorization: localStorage.getItem("token"),
                                username: userdetails.userName,
                                "x-folder": key,
                                "x-action": "create-folder",
                            },
                        });
                        message.success("Folder created");
                        fetchUserImages();
                        setNewFolderModal({ visible: false, name: '', mode: 'create', folderToRename: null });
                    };

                    const replaceFolder = async () => {
                        await apiClient.delete("/creatives/folders/deletefolder", {
                            headers: {
                                Authorization: localStorage.getItem("token"),
                                username: userdetails.userName,
                                "x-folder": baseKey,
                            },
                        });
                        await createFolder(baseKey);
                    };

                    if (mode === "create") {
                        if (folderExists) {
                            Modal.confirm({
                                title: "Folder already exists",
                                content: "A folder with this name already exists. Replace it or create a new one?",
                                okText: "Replace",
                                cancelText: "Create New",
                                onOk: replaceFolder,
                                onCancel: async () => {
                                    let suffix = 1;
                                    let newName = `${name}(${suffix})`;
                                    let newKey = `${uploadPrefix}${currentFolder}${newName}/`;
                                    while (images.some(img => img.uid === newKey)) {
                                        suffix++;
                                        newName = `${name}(${suffix})`;
                                        newKey = `${uploadPrefix}${currentFolder}${newName}/`;
                                    }
                                    await createFolder(newKey);
                                },
                            });
                        } else {
                            await createFolder(baseKey);
                        }
                        return;
                    }

                    if (mode === "rename") {
                        const oldKey = folderToRename?.uid;
                        if (!oldKey) return;

                        const segments = oldKey.split('/');
                        segments[segments.length - 2] = name;
                        const newKey = segments.slice(0, -1).join('/') + '/';

                        await apiClient.post("/creatives/folders/renamefolder", {
                            oldFolderKey: oldKey,
                            newFolderKey: newKey,
                        }, {
                            headers: {
                                Authorization: localStorage.getItem("token"),
                                username: userdetails.userName,
                            },
                        });

                        message.success("Folder renamed");
                        fetchUserImages();
                        setNewFolderModal({ visible: false, name: '', mode: 'create', folderToRename: null });
                    }
                }}
                onCancel={() =>
                    setNewFolderModal({ visible: false, name: '', mode: 'create', folderToRename: null })
                }
            >
                <Input
                    placeholder="Enter folder name"
                    value={newFolderModal.name}
                    onChange={(e) =>
                        setNewFolderModal((prev) => ({ ...prev, name: e.target.value }))
                    }
                    onKeyDown={async (e) => {
                        if (e.key !== "Enter") return;

                        const { name, mode, folderToRename } = newFolderModal;
                        if (!name.trim()) {
                            message.error("Folder name is required!");
                            return;
                        }

                        const baseKey = `${uploadPrefix}${currentFolder}${name}/`;
                        const folderExists = images.some(img => img.uid === baseKey && img.isFolder);

                        const createFolder = async (key) => {
                            await axios.post("https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles", new FormData(), {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                    username: userdetails.userName,
                                    "x-folder": key,
                                    "x-action": "create-folder",
                                },
                            });
                            message.success("Folder created");
                            fetchUserImages();
                            setNewFolderModal({ visible: false, name: '', mode: 'create', folderToRename: null });
                        };

                        const replaceFolder = async () => {
                            await axios.delete("https://app.vyaktimetrics.com/creatives/folders/deletefolder", {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                    username: userdetails.userName,
                                    "x-folder": baseKey,
                                },
                            });
                            await createFolder(baseKey);
                        };

                        if (mode === "create") {
                            if (folderExists) {
                                Modal.confirm({
                                    title: "Folder already exists",
                                    content: "A folder with this name already exists. Replace it or create a new one?",
                                    okText: "Replace",
                                    cancelText: "Create New",
                                    onOk: replaceFolder,
                                    onCancel: async () => {
                                        let suffix = 1;
                                        let newName = `${name}(${suffix})`;
                                        let newKey = `${uploadPrefix}${currentFolder}${newName}/`;
                                        while (images.some(img => img.uid === newKey)) {
                                            suffix++;
                                            newName = `${name}(${suffix})`;
                                            newKey = `${uploadPrefix}${currentFolder}${newName}/`;
                                        }
                                        await createFolder(newKey);
                                    },
                                });
                            } else {
                                await createFolder(baseKey);
                            }
                            return;
                        }

                        if (mode === "rename") {
                            const oldKey = folderToRename?.uid;
                            const segments = oldKey.split('/');
                            segments[segments.length - 2] = name;
                            const newKey = segments.slice(0, -1).join('/') + '/';

                            await apiClient.post("/creatives/folders/renamefolder", {
                                oldFolderKey: oldKey,
                                newFolderKey: newKey,
                            }, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                    username: userdetails.userName,
                                },
                            });

                            message.success("Folder renamed");
                            fetchUserImages();
                            setNewFolderModal({ visible: false, name: '', mode: 'create', folderToRename: null });
                        }
                    }}
                />
            </Modal>

            {/* Delete Folder Modal */}
            <Modal
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                title="Delete Folder"
                open={deleteFolderModal.visible}
                onOk={async () => {
                    const folderKey = deleteFolderModal.folder?.uid;
                    if (!folderKey) return;

                    await axios.delete("https://app.vyaktimetrics.com/creatives/folders/deletefolder", {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            username: userdetails.userName,
                            "x-folder": folderKey,
                        },
                    });

                    setDeleteFolderModal({ visible: false, folder: null });
                    fetchUserImages();
                }}
                onCancel={() => setDeleteFolderModal({ visible: false, folder: null })}
                okButtonProps={{ danger: true }}
                okText="Delete"
            >
                Are you sure you want to delete folder <b>"{deleteFolderModal.folder?.name}"</b>?
            </Modal>

            <Selecto
                container="#file-grid"
                className="selecto-area"
                ref={selectoRef}
                selectableTargets={[".selectable"]}
                hitRate={0}
                selectByClick={false}
                selectFromInside={false}
                toggleContinueSelect={["shift"]}
                continueSelect={true}
                ratio={0}
                onSelectEnd={(e) => {
                    const selectedFromDrag = e.selected
                        .map((el) => {
                            const uid = el.getAttribute("data-uid");
                            const isFolder = el.getAttribute("data-is-folder") === "true";
                            // if (!uid || isFolder) return null;
                            return filteredImages.find((img) => img.uid === uid);
                        })
                        .filter(Boolean);

                    // Merge with existing selectedImages (avoid duplicates)
                    setSelectedImages(prev => {
                        const merged = [...prev, ...selectedFromDrag];
                        const unique = merged.filter(
                            (item, index, self) => index === self.findIndex(t => t.uid === item.uid)
                        );
                        selectedImagesRef.current = unique;
                        return unique;
                    });
                }}
                dragContainer={window}
                style={{ pointerEvents: 'none' }}  // Prevent Selecto layer from blocking clicks                                            
            />
        </div >
    );
};

export default ImageUploadPage;
