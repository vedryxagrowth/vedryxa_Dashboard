"use client";
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import { Button, Card, Input, Typography, List, Avatar, Upload, Modal, message as antdMessage } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useTokenContext } from './parent';
import Draggable from "react-draggable";

const { Text } = Typography;

export default function ChatWidget() {
    const { userdetails } = useTokenContext();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: "Hello! I'm here to assist with your development tasks. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);

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
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages([...messages, newMessage]);

            let imageUrl = '';

            // Upload the image if it exists
            if (imageFile) {
                try {
                    const formData = new FormData();
                    formData.append("file", imageFile, imageFile.name);
                    const uploadResponse = await axios.post('https://www.testapi.adsgoat.in/uploadissues', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': localStorage.getItem("token"),
                        },
                    });



                    if (uploadResponse.status === 200) {
                        imageUrl = uploadResponse.data.imageUrl; // Assuming the API returns the uploaded image URL here
                        const updatedMessage = {
                            ...newMessage,
                            image: imageUrl,
                        };
                        setMessages((prevMessages) => [...prevMessages.slice(0, -1), updatedMessage]);
                    } else {
                        antdMessage.error("Failed to upload image.");
                    }
                } catch (error) {
                    antdMessage.error("Error uploading image.");
                    console.error("Error uploading image:", error);
                }
            }

            const data = {
                imageUrl: imageUrl || '',
                message: message
            };

            try {
                const payload = {
                    username: userdetails?.userName,
                    text: message,
                    image_url: imageUrl
                };

                // Define the headers
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token"),
                };

                // Send the POST request
                const response = await axios.post('https://www.testapi.adsgoat.in/send-to-slack', payload, { headers });

                console.log("Message sent successfully to Slack:", response.data);
            } catch (error) {
                console.error("Error sending message to Slack:", error);
            }

            setMessage('');
            setImageFile(null);
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

    return (
        <div>
            <Draggable>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<MessageOutlined />}
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
                            position: 'fixed',
                            bottom: 70,
                            right: 20,
                            zIndex: 1000,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            borderRadius: 12,
                            paddingBottom: 0,
                        }}
                    >
                        <div
                            id="chat-messages"
                            style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                paddingBottom: '5px',
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
                                                    {item.text}
                                                    {item.image && (
                                                        <div style={{ marginTop: '10px' }}>
                                                            <img src={item.image} alt="uploaded" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'right' }}>{item.time}</div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', bottom: 0, backgroundColor: '#fff', borderTop: '1px solid #ddd', padding: '5px 1px' }}>
                            <Button icon={<PaperClipOutlined />} onClick={handleAttachmentClick} style={{ borderRadius: '50%', backgroundColor: '#25D366', borderColor: '#ddd', padding: '10px', marginRight: '10px' }} />
                            <Input placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} onPressEnter={handleSendMessage} style={{ borderRadius: '20px', padding: '10px 16px', border: '1px solid #ddd', width: 'calc(100% - 50px)', fontSize: '14px' }} />
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} style={{ borderRadius: '50%', backgroundColor: '#25D366', borderColor: '#25D366', padding: '10px' }} />
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
                visible={isAttachmentModalVisible}
                onCancel={() => setIsAttachmentModalVisible(false)}
                footer={null}
            >
                <Upload beforeUpload={handleImageSelect} showUploadList={false} accept="image/*">
                    <Button icon={<PaperClipOutlined />}>Upload Image</Button>
                </Upload>
            </Modal>
        </div>
    );
}


