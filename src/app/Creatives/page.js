"use client"
import { useTokenContext } from "../components/parent";
// pages/image-upload.js
// pages/image-upload.js
// import React, { useState } from 'react';
// import { Upload, Modal, Input, Button } from 'antd';
// import { EditOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
// import Image from 'next/image';

// const ImageUploadPage = () => {
//     const [images, setImages] = useState([]);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [urlInput, setUrlInput] = useState('');

//     // Handle image upload from files
//     const handleFileChange = ({ fileList }) => {
//         const uploadedImages = fileList.map(file => ({
//             uid: file.uid,
//             url: URL.createObjectURL(file.originFileObj),
//         }));
//         setImages([...images, ...uploadedImages]);
//     };

//     // Handle image upload from URL
//     const handleUrlUpload = () => {
//         if (urlInput) {
//             setImages([...images, { uid: Date.now(), url: urlInput }]);
//             setUrlInput(''); // Clear input after upload
//         }
//     };

//     // Show modal for editing the image
//     const showModal = (image) => {
//         setSelectedImage(image);
//         setIsModalVisible(true);
//     };

//     // Close modal
//     const handleCancel = () => {
//         setIsModalVisible(false);
//         setSelectedImage(null);
//     };

//     return (
//         <div style={{ padding: '20px' }}>
//             <h1>Image Upload and Edit</h1>

//             {/* URL Input for Image */}
//             <div style={{ display: 'flex', marginBottom: '20px' }}>
//                 <Input
//                     placeholder="Enter Image URL"
//                     value={urlInput}
//                     onChange={(e) => setUrlInput(e.target.value)}
//                     style={{ width: '300px', marginRight: '10px' }}
//                 />
//                 <Button type="primary" onClick={handleUrlUpload} icon={<UploadOutlined />}>
//                     Upload from URL
//                 </Button>
//             </div>

//             {/* File Upload for Image */}
//             <Upload
//                 multiple
//                 listType="picture-card"
//                 showUploadList={false}
//                 beforeUpload={() => false}
//                 onChange={handleFileChange}
//             >
//                 <div>
//                     <PlusOutlined />
//                     <div style={{ marginTop: 8 }}>Upload</div>
//                 </div>
//             </Upload>

//             {/* Display Images with Edit Icon */}
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
//                 {images.map((image) => (
//                     <div key={image.uid} style={{ position: 'relative', width: '150px', height: '150px' }}>
//                         <img
//                             src={image.url}
//                             alt="Uploaded Image"
//                             style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
//                         />
//                         <EditOutlined
//                             style={{
//                                 position: 'absolute',
//                                 top: '5px',
//                                 right: '5px',
//                                 fontSize: '20px',
//                                 color: '#fff',
//                                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                                 borderRadius: '50%',
//                                 padding: '5px',
//                                 cursor: 'pointer',
//                             }}
//                             onClick={() => showModal(image)}
//                         />
//                     </div>
//                 ))}
//             </div>

//             {/* Modal for Editing Image */}
//             <Modal
//                 title="Edit Image"
//                 visible={isModalVisible}
//                 onCancel={handleCancel}
//                 footer={null}
//             >
//                 {selectedImage && (
//                     <img
//                         src={selectedImage.url}
//                         alt="Selected Image"
//                         style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
//                     />
//                 )}
//             </Modal>
//         </div>
//     );
// };

// export default ImageUploadPage;
// pages/image-upload.js
import React, { useState } from 'react';
import { Upload, Modal, Input, Button } from 'antd';
import { EditOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Image from 'next/image';
import dynamic from "next/dynamic";

// Dynamically import the FabricCanvas to avoid SSR issues
const FabricCanvas = dynamic(() => import("../Campaigns/camp-components/Fabricanvas"), { ssr: false });

const ImageUploadPage = () => {
    const [images, setImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const [urlInput, setUrlInput] = useState('');

    // Handle image upload from files
    const handleFileChange = ({ fileList }) => {
        const uploadedImages = fileList.map(file => ({
            uid: file.uid,
            url: URL.createObjectURL(file.originFileObj),
        }));
        setImages([...images, ...uploadedImages]);
    };

    // Handle image upload from URL
    const handleUrlUpload = () => {
        if (urlInput) {
            setImages([...images, { uid: Date.now(), url: urlInput }]);
            setUrlInput(''); // Clear input after upload
        }
    };

    // Show editor for editing the image
    const openEditor = (image) => {
        setSelectedImage(image);
        setIsEditorVisible(true);
    };

    const handleSaveEditedImage = (fileId, editedImage) => {
        // Update the edited image in the images list
        setImages((prevImages) => prevImages.map(img => img.uid === fileId ? { ...img, url: editedImage.imageBase64 } : img));
        setIsEditorVisible(false); // Close editor after saving
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Image Upload and Edit</h1>

            {/* URL Input for Image */}
            <div style={{ display: 'flex', marginBottom: '20px' }}>
                <Input
                    placeholder="Enter Image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{ width: '300px', marginRight: '10px' }}
                />
                <Button type="primary" onClick={handleUrlUpload} icon={<UploadOutlined />}>
                    Upload from URL
                </Button>
            </div>

            {/* File Upload for Image */}
            <Upload
                multiple
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleFileChange}
            >
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            </Upload>

            {/* Display Images with Edit Icon */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                {images.map((image) => (
                    <div key={image.uid} style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <img
                            src={image.url}
                            alt="Uploaded Image"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <EditOutlined
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                fontSize: '20px',
                                color: '#fff',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '50%',
                                padding: '5px',
                                cursor: 'pointer',
                            }}
                            onClick={() => openEditor(image)}
                        />
                    </div>
                ))}
            </div>

            {/* Image Editor */}
            {isEditorVisible && selectedImage && (
                <FabricCanvas
                    fileId={selectedImage.uid}
                    initialImage={selectedImage.url}
                    closeCanvasModal={() => setIsEditorVisible(false)}
                    onSaveEditedImage={handleSaveEditedImage}
                />
            )}
        </div>
    );
};

export default ImageUploadPage;
