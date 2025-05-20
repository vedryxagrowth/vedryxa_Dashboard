"use client";
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import { Button, Card, Input, Typography, List, Avatar, Upload, Modal, message as antdMessage, Flex, Spin, Select, Tooltip, Skeleton } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined, PaperClipOutlined, LoadingOutlined, PictureFilled, CopyFilled, OpenAIFilled } from '@ant-design/icons';
import { useTokenContext } from './parent';
import Draggable from "react-draggable";
const { Option } = Select;

const { Text } = Typography;

export default function ChatWithAI() {
    const { userdetails } = useTokenContext();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: "Hello! I'm here to assist with your development tasks. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    
    const [chats, setChats] = useState([]);
    const [responses, setResponses] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
    const [isModelVisible, setIsModelVisible]= useState(false);
    const [imageSize, setImageSize] = useState("1024x1024");
    const [copyText, setCopyText] = useState("Copy");

    // Ref to detect clicks outside of the chat
    const chatRef = useRef(null);
    // console.log(userdetails, "siddu")

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleAttachmentClick = () => {
        setIsAttachmentModalVisible(true);
    };

    const handleImageSelect = (file) => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (imageTypes.includes(file.type)) {
            setImageFile(file);
            setIsAttachmentModalVisible(false);
        } else {
            antdMessage.error('Please upload a valid image file (JPG, PNG, GIF)');
        }
        return false;
    };

    const handleSendMessage = async () => {
        if (message.trim() || imageFile) {
            const newMessage = {
                sender: userdetails.userName,
                text: message,
                image: imageFile ? imageFile : "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            // if(imageFile){
            //     console.log(URL.createObjectURL(imageFile), "image");
            //     const formData = new FormData();
            //     formData.append("file", imageFile);
            //     formData.append("upload_preset", "your_upload_preset"); 
            //     const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload";

            //     try {
            //     const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            //         method: "POST",
            //         body: formData,
            //     });

            //     const data = await response.json();
            //     const imageUrl = data.secure_url;  // The image URL returned by Cloudinary
            //     console.log("Image uploaded successfully:", imageUrl);

            //     // Now you can use this URL in the API request
            //     } catch (error) {
            //     console.error("Error uploading image:", error);
            //     }
            // }

            // setMessages([...messages, newMessage]);
            const newResponse = {
                sender: userdetails.userName,
                text: "loading",
                image: imageFile ? imageFile : "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChats([...chats, newMessage]);
            setResponses([...responses, newResponse]);

            let imageUrl = '';

            let requestBody = {
                model: "gpt-4",  // Ensure you're using GPT-4 with image processing
                messages: [
                  { role: "user", content: message },
                ],
              };
              
              // Conditionally add the image field only if `imageFile` is not empty or undefined
            if (imageFile) {
                requestBody.image = URL.createObjectURL(imageFile);  // Add the image field if imageFile is available
            }

            try {
                const headers = {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("token"),
                };
                const response = await axios.get(`https://prodapis.adsgoat.in/chatGpt/Prompts?message=${message}`, { headers });
          
                const data = await response.data;
          
                if (response.status === 200) {
                //   setReply(data.choices[0]?.message?.content || "No response from AI.");
                  const updatedResponses = responses.filter(item => item.text !== 'loading');
                  setResponses([...updatedResponses, {text: data || "No response from AI.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]);
                //   console.log(data?.choices[0]?.message?.content);
                } else {
                  const updatedResponses = responses.filter(item => item.text !== 'loading');

                  setReply("Error: " + (data.error?.message || "Something went wrong."));
                }
              
            }catch(error){
                console.log(error);
            }

            // Upload the image if it exists
            // if (imageFile) {
            //     try {
            //         const formData = new FormData();
            //         formData.append("file", imageFile, imageFile.name);
            //         const uploadResponse = await axios.post('https://www.testapi.adsgoat.in/uploadissues', formData, {
            //             headers: {
            //                 'Content-Type': 'multipart/form-data',
            //                 'Authorization': localStorage.getItem("token"),
            //             },
            //         });



            //         if (uploadResponse.status === 200) {
            //             imageUrl = uploadResponse.data.imageUrl; // Assuming the API returns the uploaded image URL here
            //             const updatedMessage = {
            //                 ...newMessage,
            //                 image: imageUrl,
            //             };
            //             setMessages((prevMessages) => [...prevMessages.slice(0, -1), updatedMessage]);
            //         } else {
            //             antdMessage.error("Failed to upload image.");
            //         }
            //     } catch (error) {
            //         antdMessage.error("Error uploading image.");
            //         console.error("Error uploading image:", error);
            //     }
            // }

            // const data = {
            //     imageUrl: imageUrl || '',
            //     message: message
            // };

            // try {
            //     const payload = {
            //         username: userdetails?.userName,
            //         text: message,
            //         image_url: imageUrl
            //     };

            //     // Define the headers
            //     const headers = {
            //         'Content-Type': 'application/json',
            //         'Authorization': localStorage.getItem("token"),
            //     };

            //     // Send the POST request
            //     const response = await axios.post('https://www.testapi.adsgoat.in/send-to-slack', payload, { headers });

            //     console.log("Message sent successfully to Slack:", response.data);
            // } catch (error) {
            //     console.error("Error sending message to Slack:", error);
            // }

            setMessage('');
            setImageFile(null);
        }
    };

    const handleSendImage = async () => {
        setIsModelVisible(false);
        if (imagePrompt.trim() && imageSize) {
            const newMessage = {
                sender: userdetails.userName,
                text: imagePrompt,
                image: imageFile ? imageFile : "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            
            const newResponse = {
                sender: userdetails.userName,
                text: "loading",
                image: imageFile ? imageFile : "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChats([...chats, newMessage]);
            setResponses([...responses, newResponse]);

            let imageUrl = '';

            const requestBody = {
                prompt: imagePrompt,
                n: 1,
                size: imageSize
            };
              
              // Conditionally add the image field only if `imageFile` is not empty or undefined
            // if (imageFile) {
            //     requestBody.image = URL.createObjectURL(imageFile);  // Add the image field if imageFile is available
            // }

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token"),
                };
                const response = await axios.post(`https://prodapis.adsgoat.in/ChatGpt/Images/`,{ requestBody }, { headers });
          
                const data = await response.data;
                // console.log(data);
                // console.log(data?.data[0]?.url);
          
                if (response.status === 200) {
                //   setReply(data.choices[0]?.message?.content || "No response from AI.");
                  const updatedResponses = responses.filter(item => item.text !== 'loading');
                  setResponses([...updatedResponses, {text: data, image: data,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]);
                //   console.log(data?.choices[0]?.message?.content);
                } else {
                  setReply("Error: " + (data.error?.message || "Something went wrong."));
                }
              
            }catch(error){
                console.log(error);
            }

            

            setImagePrompt('');
            setImageSize("1024x1024");
        }
    };

    const handleRemoveAttachment = () => {
        setImageFile(null);
    };

    useEffect(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    const pixelOptions = [
        { label: 'Facebook Feed Image (1200x630)', value: '1024x1024' },
        // { label: 'Facebook Feed Image (1200x630)', value: '1024x1792' },
        { label: 'Facebook Profile Picture (180x180)', value: '256x256' },
        { label: 'Facebook Cover Photo (820x312)', value: '512x512' },
        // { label: 'Facebook Event Image (1920x1080)', value: '1792x1024' },
        // { label: 'Facebook Carousel Ad Image (1080x1080)', value: '1080x1080' },
    ];

    const handleChange = (value) => {
        setImageSize(value);
    };

    const handleAddImage = () =>{
        setIsModelVisible(true);
    }

    // Close chat when clicking outside
    // useEffect(() => {
    //     function handleClickOutside(event) {
    //         if (chatRef.current && !chatRef.current.contains(event.target)) {
    //             setIsOpen(false);
    //         }
    //     }
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, [chatRef]);

    const handleCopy = (text) => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopyText("Copied");
            setTimeout(() => {
                setCopyText("Copy");
            }, 1000);
          })
          .catch((err) => {
            antdMessage.error('Failed to copy text!');
            console.error(err);
        });
    };

    return (
        <div>
            <Draggable>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<OpenAIFilled />}
                    size="large"
                    style={{
                        position: 'fixed',
                        bottom: 50,
                        right: 100,
                        zIndex: 1000,
                        backgroundColor: '#25D366',
                        borderColor: '#25D366',
                        // cursor: 'move'
                    }}
                    onClick={toggleChat}
                />
            </Draggable>
            {/* <Draggable>
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{
                        backgroundColor: 'rgba(242, 107, 41, 0.8)',
                        color: '#fff', // White text color
                        borderRadius: '20px', // Rounded corners for pill shape
                        padding: '10px 20px', // Padding for size
                        fontWeight: 'bold', // Bold text
                        border: 'none', // Remove default border
                        zIndex: 1000
                    }}
                    // style={{
                    //     position: 'fixed',
                    //     bottom: 20,
                    //     right: 20,
                    //     zIndex: 1000,
                    //     backgroundColor: '#25D366',
                    //     borderColor: '#25D366',
                    //     padding: '0 15px', // Add padding to fit the text comfortably
                    //     height: 'auto' // Adjust height to fit the text if needed
                    // }}
                    onClick={toggleChat}
                >
                    Support
                </Button>
            </Draggable> */}


            {isOpen && (
                <div ref={chatRef}>
                    <Card
                        title={
                            <div style={{ display: 'flex', justifyContent: "space-between" }}>
                                <Avatar style={{ backgroundColor: '#0078d7', color: '#fff' }}>
                                    {userdetails.userName ? userdetails.userName.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                                <span> Tech-Support</span>
                                <Button
                                    icon={<CloseOutlined />}
                                    shape="circle"
                                    onClick={() => setIsOpen(false)}
                                    style={{ border: 'none', boxShadow: 'none', background: 'none', color: '#888' }}
                                />
                            </div>
                        }
                        bordered={false}
                        style={{
                            width: 350,
                            maxHeight:425,
                            position: 'fixed',
                            bottom: 70,
                            right: 20,
                            zIndex: 1000,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            borderRadius: 12,
                            paddingBottom: 0,
                        }}
                    >
                        <div style={{display:'flex', flexDirection:"column", height:"100%"}}>
                            <div
                                id="chat-messages"
                                style={{
                                    // maxHeight: '300px',
                                    height:'280px',
                                    overflowY: 'auto',
                                    paddingBottom: '5px'
                                }}
                            >
                                <List
                                    dataSource={messages}
                                    renderItem={(item) => (
                                        <List.Item style={{ justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                            <List.Item.Meta
                                                avatar={
                                                    item.sender === 'assistant' ? (
                                                        <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#f56a00' }} />
                                                    ) : (
                                                        <Avatar style={{ backgroundColor: '#0078d7', color: '#fff' }}>
                                                            {userdetails.userName ? userdetails.userName.charAt(0).toUpperCase() : 'U'}
                                                        </Avatar>
                                                    )
                                                }
                                                description={
                                                    <div style={{ background: item.sender === 'assistant' ? '#f1f1f1' : '#f1f1f1', color: '#000', padding: '5px 5px', borderRadius: '12px', maxWidth: '80%', wordBreak: 'break-word', fontSize: '14px' }}>
                                                        {/* {item.image && (
                                                            <div style={{ marginTop: '10px' }}>
                                                                <img src={URL.createObjectURL(item.image)} alt="uploaded" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                                            </div>
                                                        )} */}
                                                        {item.text}
                                                        <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'right' }}>{item.time}</div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                                {Array.isArray(chats) && Array.isArray(responses) && chats.length > 0 && chats.map((chatItem, index) => {
                                // Combine chat and response
                                    const responseItem = responses[index];

                                    return (
                                        <div key={index}>
                                        {/* Render chat item */}
                                        <List
                                            dataSource={[chatItem]} // Pass an array with the current chat item
                                            renderItem={(item) => (
                                                <List.Item
                                                    style={{
                                                        display: 'flex', // Make sure the item uses flex layout
                                                        justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                                                        alignItems: 'flex-start', // Align items vertically
                                                    }}
                                                >
                                                    <List.Item.Meta
                                                        description={
                                                            <div style={{display:'flex', justifyContent:'flex-end'}}>
                                                                <div
                                                                    style={{
                                                                        background: '#f1f1f1', // Unified background color
                                                                        color: '#000',
                                                                        padding: '8px',
                                                                        borderRadius: '12px',
                                                                        maxWidth: '80%',
                                                                        wordBreak: 'break-word',
                                                                        fontSize: '14px',
                                                                    }}
                                                                >
                                                                    {item.image && (
                                                                        <div style={{ marginTop: '10px' }}>
                                                                            <img
                                                                                src={URL.createObjectURL(item.image)}
                                                                                alt="uploaded"
                                                                                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {item.text}
                                                                    <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'right' }}>
                                                                        {item.time}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                        avatar={null} // Remove avatar here because we'll display it after the description
                                                    />
                                                    
                                                    {/* Display avatar after the description */}
                                                    <Avatar
                                                        icon={item.sender === 'assistant' ? <RobotOutlined /> : null}
                                                        style={{
                                                            backgroundColor: item.sender === 'assistant' ? '#f56a00' : '#0078d7',
                                                            color: item.sender === 'assistant' ? '#fff' : '#fff',
                                                            marginRight:'10px',
                                                            marginLeft: '5px', // Ensure there's some space between the text and the avatar
                                                            alignSelf: 'center', // Vertically align the avatar with the text
                                                        }}
                                                    >
                                                        {item.sender !== 'assistant' && (userdetails.userName ? userdetails.userName.charAt(0).toUpperCase() : 'U')}
                                                    </Avatar>
                                                </List.Item>
                                            )}
                                        />
                                        {/* Render response item */}
                                        {responseItem && responseItem.text !== "loading" ? (
                                            <List
                                            dataSource={[responseItem]} // Pass responseItem as an array
                                            renderItem={(item) => (
                                                <List.Item
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between', // Move avatar to the right
                                                    alignItems: 'center', // Align items vertically
                                                }}
                                                >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#f56a00' }} />
                                                    }
                                                    description={
                                                    <div>
                                                        {item.image && (
                                                        <div style={{ marginTop: '10px' }}>
                                                            <img
                                                            src={item.image}
                                                            alt="uploaded"
                                                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                        )}
                                                        <div
                                                            style={{
                                                            background: '#f1f1f1', // Unified background color
                                                            color: '#000',
                                                            padding: '8px',
                                                            borderRadius: '12px',
                                                            maxWidth: '80%',
                                                            wordBreak: 'break-word',
                                                            fontSize: '14px',
                                                            }}
                                                        >
                                                            
                                                            {item.text}
                                                            <Tooltip title={copyText}>
                                                                <CopyFilled
                                                                    onClick={() => handleCopy(item.text)}
                                                                    style={{
                                                                    position: 'absolute',
                                                                    top: '14px',
                                                                    right: '8px',
                                                                    fontSize: '16px',
                                                                    color: '#aaa',
                                                                    cursor: 'pointer',
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                            <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'right' }}>
                                                            {item.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    }
                                                    
                                                />
                                                </List.Item>
                                            )}
                                            />
                                        ) : <div style={{display:'flex', justifyContent:"center"}}>
                                                {/* <Flex align="center" gap="middle">
                                                    <Spin indicator={<LoadingOutlined spin />} />
                                                </Flex> */}
                                                <div style={{ padding: '24px' }}>
                                                    <Skeleton active paragraph={{ rows: 10 }} />
                                                </div>
                                            </div>}
                                        </div>
                                    );
                                })}


                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  bottom: 0, backgroundColor: '#fff', borderTop: '1px solid #ddd', padding: '5px 1px' }}>
                                <Button icon={<PictureFilled />} onClick={handleAddImage} style={{ borderRadius: '50%', backgroundColor: '#25D366', borderColor: '#ddd', padding: '8px', marginRight: '10px' }} />
                                <Input placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} onPressEnter={handleSendMessage} style={{ borderRadius: '20px', padding: '10px 16px', border: '1px solid #ddd', width: 'calc(100% - 50px)', fontSize: '14px' }} />
                                <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} style={{ borderRadius: '50%', backgroundColor: '#25D366', borderColor: '#25D366', padding: '10px' }} />
                            </div>
                        </div>

                        {(imageFile || videoFile) && (
                            <div style={{ marginTop: '10px', textAlign: 'center', position: 'relative' }}>
                                {imageFile && (
                                    <div>
                                        <img src={URL.createObjectURL(imageFile)} alt="image-preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                                        <Button icon={<CloseOutlined />} onClick={handleRemoveAttachment} style={{ position: 'absolute', top: 0, right: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            )}
            <Modal
                title="Choose Attachment"
                visible={isModelVisible}
                onCancel={() => setIsModelVisible(false)}
                footer={null}
            >
                <Input placeholder="Please Enter Image details" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
                    <Select
                        value={imageSize}
                        style={{ width: 250 }}
                        onChange={handleChange}
                    >
                        {pixelOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                            {option.value}
                            </Option>
                        ))}
                    </Select>
                    <Button onClick={handleSendImage}>Submit</Button>
                </div>
            </Modal>
            {/* <Modal
                title="Choose Attachment"
                visible={isAttachmentModalVisible}
                onCancel={() => setIsAttachmentModalVisible(false)}
                footer={null}
            >
                <Upload beforeUpload={handleImageSelect} showUploadList={false} accept="image/*">
                    <Button icon={<PaperClipOutlined />}>Upload Image</Button>
                </Upload>
            </Modal> */}
        </div>
    );
}


