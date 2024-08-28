"use client";
import React, { useState } from 'react';
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Upload,
    Modal,
    Space
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
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
export default function Viewads({ selectedRow, viewdata }) {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState(null);

    // console.log(viewdata, "viewdata")

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

    const handleModalOk = () => {
        setIsModalVisible(false);
        console.log('Modal ok clicked');
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        console.log('Modal cancel clicked');
    };
    var initialValue = {
        AddName: viewdata?.AddName,
        filename: viewdata?.filename,
        page_id: viewdata?.page_id,
        message: viewdata?.message,
        headline: viewdata?.headline,
        Description: viewdata?.Description,
        Caption: viewdata?.Caption,
        Website_URL: viewdata?.Website_URL,
        urlParameters: viewdata?.urlParameters,
    }
    return (
        <>
            {/* <h1>hello Edit ${selectedRow.campaign_name}</h1> */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValue}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: "70%", marginRight: "5%" }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="page_id"
                                label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select an option!",
                                    },
                                ]}
                                style={{ flex: 3, marginLeft: "1%" }}
                            >
                                <Input style={{ width: "45%" }} disabled />
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
                            <Input style={{ width: "60%" }} disabled />
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
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="Primary text"
                                autoSize={{ minRows: 2, maxRows: 10 }}
                                disabled
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
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="Headline"
                                autoSize={{ minRows: 2, maxRows: 10 }}
                                disabled
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
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="Description"
                                autoSize={{ minRows: 2, maxRows: 10 }}
                                disabled
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
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="Caption"
                                autoSize={{ minRows: 2, maxRows: 10 }}
                                disabled
                            />
                        </Form.Item>
                        <Form.Item
                            label="Website_URL"
                            name="Website_URL"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select Website_URL!",
                                },
                            ]}
                            required
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="Website_URL"
                                autoSize={{ minRows: 5, maxRows: 15 }}
                                disabled
                            />
                        </Form.Item>
                        <Form.Item
                            label="URL Parameters"
                            name="urlParameters"
                            tooltip="This is a required field"
                        >
                            <TextArea
                                placeholder="URL Parameters"
                                autoSize={{ minRows: 5, maxRows: 15 }}
                                disabled
                            />
                        </Form.Item>
                    </div>

                    <div style={{ flex: "30%" }}>
                        {viewdata?.filename && (
                            <div className="container-ad-preview">
                                <div className="ad-preview">
                                    <div className="ad-heading">
                                        <div className="img">
                                            {viewdata?.filename?.toLowerCase().endsWith('.mp4') ? (
                                                <video
                                                    controls
                                                    width="40"
                                                    height="40"
                                                >
                                                    <source src={viewdata?.filename} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img
                                                    src={viewdata?.filename}
                                                    alt="page id"
                                                    width="40"
                                                    height="40"
                                                />
                                            )}
                                        </div>

                                        <div className="title">
                                            <div className="main">{"Facebook Page"}</div>
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
                                    <div className="ad-desc">{"adMessage"}</div>
                                    <div className="ad-image" style={{ width: '100%', height: '300px' }}>
                                        {viewdata.filename?.toLowerCase().endsWith('.mp4') ? (
                                            <video
                                                controls
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            >
                                                <source src={viewdata.filename} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <img
                                                src={viewdata.filename}
                                                alt="ad content"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>

                                    <div className="ad-cta">
                                        <div className="details">
                                            <div className="link">{"adCaption"}</div>
                                            <div className="title">{"adName"}</div>
                                            <div className="desc">{"adDesc"}</div>
                                        </div>
                                        <div className="ad-button">
                                            <button type="button">Learn More</button>
                                        </div>
                                    </div>
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
                        )}
                    </div>


                </div>
                {/* <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button onClick={handleClear}>Clear</Button>
                    </Space>
                </Form.Item> */}
            </Form>

            {/* <Modal
                title="Form Data"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <p>Display form data in modal</p>
                
            </Modal> */}
        </>
    )
}