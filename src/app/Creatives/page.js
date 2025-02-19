"use client"
import { redirect } from 'next/navigation';
import { useTokenContext } from "../components/parent";
import React, { useState, useEffect } from 'react';
import { Upload, Modal, Input, Button, Row, Col, Select, message, notification, Badge } from 'antd';
import { EditOutlined, UploadOutlined, PlusOutlined, SearchOutlined, CheckCircleFilled, CloseCircleFilled, ReloadOutlined, EyeOutlined, DeleteOutlined} from '@ant-design/icons';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton } from 'antd';
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment"; // Import moment for date manipulation
import { v4 as uuidv4 } from 'uuid';

import dayjs from 'dayjs';
const { RangePicker} = DatePicker;
const { Option } = Select;

// Dynamically import the FabricCanvas to avoid SSR issues
const FabricCanvas = dynamic(() => import("../Campaigns/camp-components/Fabricanvas"), { ssr: false });
const CreateCampaign = dynamic(() => import("./components/text"), { ssr: false });

const ImageUploadPage = () => {
    const [images, setImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
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
        } else {
            setOptions([]);  // Clear options if no accounts exist
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
        } else {
            setValueOptions([]);
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
                    name: file.filename || `Unnamed File ${file.key}`, // 🔹 Use filename from API or default text
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
    if (userdetails?.role !== "Admin") {
        router.push("/Dashboard");
        return null;
    }
    // **Convert Base64 to File Object**
    const base64ToFile = async (base64, filename) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    const handleUrlUpload = async () => {
        if (!urlInput.trim()) {
            message.error("Please enter a valid image URL.");
            return;
        }
        // Show preview instead of uploading immediately
        setPreviewFile({ url: urlInput, name: `image_${Date.now()}.jpg` }); // Store URL as preview file
        setFileInputName(""); // Reset filename input
        setIsModalVisible(true); // Open existing modal
    };

    const handleCancel = () =>{
        setIsModalVisible(false);
        setPreviewFile(null);
    }

    const handleFileChange = ({ fileList }) => {
        if (fileList.length === 0) return;
        console.log(fileList);
        setPreviewFile(null);
        setPendingFile(null);
        setEditedFile(null); 
        // Preview selected file
        const file = fileList[fileList.length-1].originFileObj;
        const previewUrl = URL.createObjectURL(file);
        // Show confirmation popup before uploading
        setPreviewFile({ uid: file.uid, url: previewUrl });
        setPendingFile(file);
        setIsModalVisible(true); // Show modal to confirm upload
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
        const uniqueFilename = `edited-${uuidv4()}.png`; // Unique name with UUID
        const editedFileObj = await base64ToFile(editedImage.imageBase64, uniqueFilename);
        
        if (!editedFileObj) {
            console.error("Failed to convert edited image to file.");
            return;
        }
    
        setEditedFile(editedFileObj);
        setPreviewFile({ uid: fileId, url: editedImage.imageBase64, name: uniqueFilename });
        setIsEditorVisible(false);
        setIsModalVisible(true);
    };
    
    const handleConfirmUpload = async () => {
        let fileToUpload = editedFile || pendingFile;

        if (!previewFile || !userdetails?.userName || !fileInputName.trim()) {
            message.error("User name is missing, no file selected, or file name is empty!");
            return;
        }

        // If the file is from a URL, convert it into a File object before uploading
        if (previewFile.url) {
            try {
                const response = await fetch(previewFile.url);
                if (!response.ok) {
                    message.error("Failed to fetch image from URL.");
                    return;
                }

                const blob = await response.blob();
                fileToUpload = new File([blob], `${fileInputName.trim()}.jpg`, { type: blob.type });
            } catch (error) {
                console.error("Error fetching file from URL:", error);
                return;
            }
        }
        //Ensure `fileToUpload` exists before checking `size`
        if (!fileToUpload) {
            message.error("No file available for upload!");
            return;
        }
         // Check file size (Limit: 5MB)
        const MAX_FILE_SIZE = 1024 * 1024; // 5MB
        if (fileToUpload.size > MAX_FILE_SIZE) {
            message.error("❌ File size exceeds 5MB limit! Please upload a smaller file.");
            return;
        }

        const uniqueFilename = `${Date.now()}-${fileInputName.trim()}${fileToUpload.name.substring(fileToUpload.name.lastIndexOf("."))}`;
        const uploadDate = startDate || moment().format("YYYY-MM-DD");
    
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("uploadDate", uploadDate);
        formData.append("filename", uniqueFilename); // 🔹 Send unique filename
    
        try {
            const response = await axios.post("https://prodapis.adsgoat.in/uploadUserFiles", formData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    "Content-Type": "multipart/form-data",
                    "username": userdetails?.userName,
                },
            });
    
            const newImageUrl = response.data.imageUrl;
            if (!newImageUrl) {
                message.error("No image URL returned from server!");
                return;
            }
            // 🔹 Add image with selected date
            const newImage = { 
                uid: Date.now(),
                name: fileInputName.trim(), // Save the chosen filename
                status: 'done', 
                url: newImageUrl, 
                uploadDate 
            };
    
            setImages((prevImages) => [newImage, ...prevImages]);
            setFilteredImages((prevImages) => [newImage, ...prevImages]);
            // Show success notification
            notification.success({
                message: "Upload Successful",
                description: "Your file has been uploaded successfully!",
            });
            // Refresh images
            setTimeout(fetchUserImages, 500);  
        } catch (error) {
            console.error("Upload Error:", error.response ? error.response.data : error.message);
        }
        setIsModalVisible(false);
        setPreviewFile(null);
        setPendingFile(null);
        setEditedFile(null);
        setSelectedImage(null);
        setFileInputName("");
        setUrlInput("");
    };
    
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
        setIsViewModalVisible(false);
        setViewedImage(null);
    };
    // Open modal when delete icon is clicked
    const showDeleteModal = (image) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
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

    return (
        <div style={{ padding: '20px' }}>
            <CreateCampaign 
                visible={cdrawerVisible} 
                accountis={selectedAccountNumber} 
                onClose={onCloseDrawer} 
                // changeRRefrst={changeRRefrst} 
                network={selectedKey} 
                imageFiles={selectedImages} 
                onDeleteFile={handleDeleteFile} 
                selectedAccountNumber={selectedAccountNumber}
            />

            <h1>Image Upload and Edit</h1>
            <Row justify="start" align="middle" gutter={[16, 16]}>
                <Col span={3}>
                        <Select
                            showSearch
                            placeholder="Select Network"
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
                        placeholder="Select Account"
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
                </Col>
                <Col span={5}>
                    <ConfigProvider>
                        <RangePicker
                            presets={rangePresets}
                            onChange={handleChange}
                            disabledDate={disabledDate}
                            defaultValue={[dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')]}
                            format="YYYY-MM-DD"
                            allowClear={true}  // 🔹 Enables clearing the selection
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
                    <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />} style={{ display: 'flex', justifyContent: 'center', maxWidth: '160px' }}>
                        Create Campaign
                        {selectedImages.length > 0 && (
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
                        )}
                    </Button>                   
                </Col>                
                <Button type="primary" onClick={fetchUserImages} icon={<ReloadOutlined />} />                  
            </Row>
            {/* URL Input for Image */}
            <div style={{ display: 'flex', marginBottom: '20px', marginTop: '10px' }}>
                <Input
                    placeholder="Enter Image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{ width: '300px', marginRight: '10px' }}
                />
                <Button type="primary" onClick={handleUrlUpload} icon={<UploadOutlined />}>
                    Upload from URL
                </Button>
                <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg"
                >
                    <Button style={{marginLeft: '10px'}} icon={<UploadOutlined />}>Select Files</Button>
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
                    return (
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
                            <img
                                src={image.url}
                                alt="Uploaded Image"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <p>
                                 {image?.name}
                            </p>
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
                title="View Image"
                open={isViewModalVisible}
                onCancel={handleCloseViewModal}
                footer={null}
                width={600}
            >
                {viewedImage && (
                    <img 
                        src={viewedImage.url} 
                        alt="Viewed Image"
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                )}
            </Modal>
            {/* Confirmation Modal for Uploaded Image */}
            <Modal
                title="Confirm Upload"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="edit" type="primary" onClick={handleEditUploadedFile} icon={<EditOutlined />}>
                        Edit
                    </Button>,
                    <Button key="confirm" type="default" onClick={handleConfirmUpload}>
                        Confirm
                    </Button>
                ]}                 
            >
                {previewFile && (
                    <>
                        <img
                            src={previewFile.url}
                            alt="Uploaded Preview"
                            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                        />
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

export default ImageUploadPage;
