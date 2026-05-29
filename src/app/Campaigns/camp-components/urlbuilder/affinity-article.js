"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Row, Col, Tooltip, Tabs, Radio, Table } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
// import TextArea from 'antd/es/input/TextArea';
const { TextArea } = Input;
const { Option } = Select;
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { useTokenContext } from '../../../components/parent';
import JoditEditor from "jodit-react";

const CreateArticle = ({ theme, onCreate }) => {
    const [form] = Form.useForm();
    const { apiClient, userdetails } = useTokenContext();
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token")


    const convertHTMLToArray = (html) => {
        if (!html) return [];


        // Split content by headings (h1–h6)
        const sections = html.split(/(?=<h[1-6]>)/g);


        // Clean and return only non-empty sections
        return sections
            .map(section => section.trim())
            .filter(section => section.length > 0);
    };


    const cleanText = (text) => {
        if (!text) return "";


        let cleaned = text;


        try {
            cleaned = JSON.parse(`"${cleaned.replace(/"/g, '\\"')}"`);
        } catch (e) { }


        const textarea = document.createElement("textarea");
        textarea.innerHTML = cleaned;


        return textarea.value;
    };


    const convertToHTML = (text) => {
        const cleaned = cleanText(text);
        return `<p>${cleaned.trim()}</p>`;
    };


    const uploadFileToS3 = async (fileBlob, fileName, folderPath) => {
        const fullPath = `${folderPath}/${fileName}`;
        const formData = new FormData();
        formData.append("file", fileBlob, fileName);
        formData.append("filename", fullPath); // required in body


        try {
            const response = await fetch(
                "https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
                {
                    method: "POST",
                    headers: {
                        Authorization: localStorage.getItem("token"),
                        username: "default-user", // required in headers
                    },
                    body: formData,
                }
            );


            if (!response.ok) throw new Error("S3 upload failed");


            const data = await response.json();
            return data.imageUrl;
        } catch (err) {
            console.error("Error uploading to S3:", err);
            return null;
        }
    };


    // const onFinish = (values) => {
    //     console.log("Form Values:", values);
    //     const html = form.getFieldValue("paragraphs");
    //     const formattedParagraphs = convertHTMLToArray(values.paragraphs);
    //     const description = convertToHTML(values.description);
    //     // const paragraphsArray = splitHtmlToParagraphs(html);


    //     // console.log(paragraphsArray);
    //     console.log(description)
    //     console.log(formattedParagraphs);
    //     console.log("HTML Content:", html);
    // };
    // const onFinish = async (values) => {
    //     try {
    //         const html = form.getFieldValue("paragraphs");


    //         const payload = {
    //             domain_name: "sample.com", // replace dynamically if needed
    //             post_source_id: 34, // replace if dynamic
    //             title: values.title?.trim().slice(0, 200), // max 200 chars
    //             description: convertToHTML(values.description), // must be HTML <p>...</p>
    //             image: values.image?.[0]?.url || values.image?.[0]?.response?.url || "",
    //             category: values.category || "Services",
    //             paragraphs: convertHTMLToArray(html), // should return array of HTML strings
    //         };


    //         console.log("Final Payload:", payload);


    //         const response = await fetch("https://www.apis.com/", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "X-API-KEY": "ajnsljanl",
    //             },
    //             body: JSON.stringify(payload),
    //         });


    //         const data = await response.json();
    //         console.log("API Response:", data);


    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };
    const onFinish = async (values) => {
        setLoading(true);
        try {
            let s3FileUrl = "";
            const folderPath = "Affinity/Article/";


            // ✅ Get file from Upload component
            const file = values.image?.[0];


            if (file) {
                const uniqueId = uuidv4();
                const safeName = `blob_${uniqueId}_${file.name}`;


                // ✅ Directly use original file
                const fileBlob = file.originFileObj;


                // ✅ Upload to S3
                s3FileUrl = await uploadFileToS3(
                    fileBlob,
                    safeName,
                    folderPath
                );
            }


            // ✅ Prepare payload
            const payload = {
                domain_name: "munchable.com",
                post_source_id: 7,
                title: values.title?.trim().slice(0, 200),
                description: convertToHTML(values.description),
                image: s3FileUrl, // 🔥 S3 URL here
                category: values.category || "Services",
                paragraphs: convertHTMLToArray(values.paragraphs),
            };


            // console.log("Final Payload:", payload);


            // ✅ API call
            // const response = await fetch("https://www.apis.com/", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "X-API-KEY": "ajnsljanl",
            //     },
            //     body: JSON.stringify(payload),
            // });


            // const data = await response.json();
            // console.log("API Response:", data);
            // const response = await axios.post(
            //     "https://www.digitapis.com/post_data.php",
            //     payload,
            //     {
            //         headers: {
            //             "Content-Type": "application/json",
            //             "X-API-KEY": "fd15e3e2a172eb077ef65185cf703df82d140d8dcb351b0c3b35cc66d5eb6af6",
            //         },
            //     }
            // );
            // 🔹 First API


            // const { data: firstResponse } = await axios.post(
            //     "https://www.digitapis.com/post_data.php",
            //     payload,
            //     {
            //         headers: {
            //             "X-API-KEY": "fd15e3e2a172eb077ef65185cf703df82d140d8dcb351b0c3b35cc66d5eb6af6",
            //         },
            //     }
            // );


            // console.log("First API Response:", firstResponse);


            // // 🔹 Call second API ONLY if first succeeds
            // const { data: secondResponse } = await apiClient.post(
            //     "http://localhost:8000/affinity/article",
            //     {
            //        data: payload
            //     }
            // );


            // console.log("Second API Response:", secondResponse);






            // console.log("API Response:", response.data);


            // const response = await apiClient.post(
            //     "/affinity/article",
            //     { data: payload },
            //     {
            //         params: {
            //             username: userdetails.userName,
            //         },
            //     }
            // );

            const response = await axios({
                method: "POST",
                url: "https://fblaunching.vyaktimetrics.com/open/affinity/article",
                data: { data: payload },
                params: {
                    username: userdetails.userName,
                },
                headers: {
                    Authorization: token,
                },
            });


            if (response.status === 200 || response.status === 201) {
                onCreate({
                    id: response.data.trace_id,
                    title: payload?.title,
                    domain: payload?.domain_name,
                    createdAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A"),
                    createdBy: userdetails.userName,
                    createdUserEmail: userdetails.email,
                });


                form.resetFields();
                setLoading(false);
                message.success("Article created successfully!");
            }


            // console.log(response.message);
            // console.log(response.insertedId);


        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
            message.error("Failed to create article. Please try again.");
        }
    };


    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };


    const getTextFromHTML = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };


    return (
        <div style={{
            maxWidth: "90%", margin: "0 auto",
            height: "72vh",          // 👈 fixed height (adjust as needed)
            overflowY: "auto",       // 👈 enables vertical scroll
            padding: "16px",         // optional for spacing
            border: "1px solid #f0f0f0", // optional UI
            borderRadius: "8px",     // optional UI
            // background: "#fff"
            background: theme === "dark" ? "#1f1f1f" : "#fff",
        }}>
            {/* <h2>Create Article</h2> */}
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label={
                            <span style={{ color: "#B4B4B4" }}>Title</span>
                        }
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Please enter title",
                            },
                            {
                                max: 200,
                                message: "Title must be within 200 characters",
                            },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();


                                    // ❌ Check for HTML tags
                                    const hasHTML = /<[^>]*>/g.test(value);


                                    if (hasHTML) {
                                        return Promise.reject("Title must be plain text (no HTML allowed)");
                                    }


                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            className={
                                theme === "dark"
                                    ? "custom-input-dark"
                                    : "custom-input-light"
                            }
                            placeholder="Enter article title"
                            maxLength={200} // 👈 UI restriction also
                            showCount       // 👈 shows character count
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: "#B4B4B4" }}>Description</span>
                        }
                        name="description"
                        rules={[
                            {
                                required: true,
                                validator: (_, value) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject("Please enter description");
                                    }


                                    const textLength = value.trim().length;


                                    if (textLength < 350) {
                                        return Promise.reject("Description must be at least 350 characters");
                                    }


                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <TextArea rows={4} placeholder="Enter description" />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: "#B4B4B4" }}>Upload Image</span>
                        }
                        name="image"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Please upload an image" }]}
                    >
                        <Upload
                            listType="picture"
                            maxCount={1} // ✅ only one file
                            accept=".jpg,.jpeg,.png,.webp" // ✅ restrict file picker
                            customRequest={({ onSuccess }) =>
                                setTimeout(() => onSuccess("ok"), 0)
                            }
                            beforeUpload={(file) => {
                                const isValidType = [
                                    "image/jpeg",
                                    "image/jpg",
                                    "image/png",
                                    "image/webp",
                                ].includes(file.type);


                                if (!isValidType) {
                                    message.error("Only JPG, JPEG, PNG, WEBP files are allowed");
                                    return Upload.LIST_IGNORE;
                                }


                                const isLt2MB = file.size / 1024 / 1024 < 2;


                                if (!isLt2MB) {
                                    message.error("Image must be smaller than 2MB");
                                    return Upload.LIST_IGNORE;
                                }


                                return new Promise((resolve) => {
                                    const img = new Image();
                                    const objectUrl = URL.createObjectURL(file);


                                    img.onload = () => {
                                        // console.log(img.width, img.height);


                                        const isValidSize =
                                            Math.abs(img.width - 670) <= 2 &&
                                            Math.abs(img.height - 235) <= 2;


                                        if (!isValidSize) {
                                            message.error("Image must be ~670 × 235 pixels");
                                            resolve(Upload.LIST_IGNORE);
                                        } else {
                                            resolve(file);
                                        }


                                        URL.revokeObjectURL(objectUrl);
                                    };


                                    img.onerror = () => {
                                        message.error("Invalid image file");
                                        resolve(Upload.LIST_IGNORE);
                                    };


                                    img.src = objectUrl;
                                });
                            }}
                        >
                            <Button icon={<UploadOutlined />} className="dark-icon-button"
                                style={{
                                    color: theme === "dark" ? "white" : "#000",
                                }}>Click to Upload</Button>
                        </Upload>
                    </Form.Item>




                    {/* Category */}
                    <Form.Item
                        label={
                            <span style={{ color: "#B4B4B4" }}>Category</span>
                        }
                        name="category"
                        rules={[{ required: true, message: "Please select category" }]}
                    >
                        <Select
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
                            dropdownClassName={theme === "dark" ? "custom-dropdown" : undefined}
                            placeholder="Select category">
                            <Option value="Automotive">Automotive</Option>
                            <Option value="Education">Education</Option>
                            <Option value="Finance">Finance</Option>
                            <Option value="Healthcare">Healthcare</Option>
                            <Option value="Home Services">Home Services</Option>
                            <Option value="Jobs">Jobs</Option>
                            <Option value="Lifestyle">Lifestyle</Option>
                            <Option value="Real Estate">Real Estate</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: "#B4B4B4" }}>Paragraphs</span>
                        }
                        name="paragraphs"
                        validateTrigger="onChange"
                        rules={[
                            {
                                validator: (_, value) => {
                                    const text = getTextFromHTML(value || "").trim();


                                    if (!text) {
                                        return Promise.reject("Content cannot be empty");
                                    }


                                    if (text.length < 4000) {
                                        return Promise.reject("Content must be at least 4000 characters");
                                    }


                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <JoditEditor
                            config={{
                                toolbarSticky: false,
                                askBeforePasteHTML: false,
                                askBeforePasteFromWord: false,
                                defaultActionOnPaste: "insert_clear_html",
                                theme: theme === "dark" ? "dark" : "default", // 👈 built-in theme (limited but useful)


                                style: {
                                    background: theme === "dark" ? "#2A2A2A" : "#ffffff",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                },


                                containerStyle: theme === "dark"
                                    ? {
                                        background: "#1f1f1f",
                                        border: "1px solid #303030",
                                        borderRadius: "8px",
                                    }
                                    : {},
                            }}
                            value={form.getFieldValue("paragraphs") || ""}
                            onChange={(newContent) => {
                                form.setFieldsValue({ paragraphs: newContent });


                                // 🔥 THIS LINE FIXES YOUR ISSUE
                                form.validateFields(["paragraphs"]);
                            }}
                        />
                    </Form.Item>


                    {/* Submit */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Submit Article
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
};


const ArticlesList = ({ theme, newArticle }) => {
    const { apiClient } = useTokenContext();
    const [articles, setArticles] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const token = localStorage.getItem("token")
    const columns = [
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Domain',
            dataIndex: 'domain',
            key: 'domain',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => {
                if (!record.article_link) return text;

                return (
                    <Tooltip
                        title={
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <CopyOutlined
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(record.article_link);
                                    }}
                                />
                                Copy link
                            </span>
                        }
                        overlayInnerStyle={{
                            backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                            color: theme === "dark" ? "#ffffff" : "#000000",
                            borderRadius: 6,

                        }}
                    >
                        <a
                            href={record.article_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#1890ff" }}
                        >
                            {text}
                        </a>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                    }}
                >
                    {text}

                    {loadingId === record.id ? (
                        <Spin size="small" />
                    ) : (
                        (record.status !== "PUBLISHED_STATUS") && (
                            <Tooltip
                                title="Click on the icon to get article status"
                                overlayInnerStyle={{
                                    backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                    borderRadius: 6,
                                }}
                            >
                                <InfoCircleOutlined
                                    style={{ cursor: "pointer", color: "green" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleIconClick(record.id, record.domain);
                                    }}
                                />
                            </Tooltip>
                        )
                    )}
                </span>
            )
        },
    ];

    const handleIconClick = async (id, domain) => {
        try {
            setLoadingId(id);
            // const res = await apiClient.post('/affinity/getArticleStatus/', {
            //     id,
            //     domain
            // });
            const res = await axios({
                method: "POST",
                url: "https://fblaunching.vyaktimetrics.com/open/affinity/getArticleStatus/",
                data: {
                    id,
                    domain,
                },
                headers: {
                    Authorization: token,
                },
            });
            const { status, articleLink } = res.data.data;
            setArticles((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status: status,
                            article_link: articleLink,
                        }
                        : item
                )
            );

            // console.log(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };
    const handleCopy = (link) => {
        navigator.clipboard.writeText(link);
        message.success("Link copied");
    };
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // const response = await apiClient.get("/affinity/article");
                const response = await axios({
                    method: "GET",
                    url: "https://fblaunching.vyaktimetrics.com/open/affinity/article",
                    headers: {
                        Authorization: token,
                    },
                });
                const results = response.data.data || [];
                setArticles(results.map(article => ({
                    id: article.trace_id,
                    title: article?.data?.title,
                    domain: article?.data?.domain_name,
                    createdAt: article.createdAt,
                    createdBy: article.createdBy,
                    status: article.status,
                    article_link: article.article_link
                }))
                );
            } catch (error) {
                console.error("Error fetching articles:", error);
            }
        };
        fetchArticles();
    }, []);


    useEffect(() => {
        if (newArticle) {
            setArticles((prev) => [newArticle, ...prev]); // 👈 prepend
        }
    }, [newArticle]);


    return (
        <div
            style={{
                maxWidth: "100%",
                margin: "0 auto",
                height: "72vh",
                padding: "16px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                background: theme === "dark" ? "#1f1f1f" : "#fff",
                overflow: "hidden", // 👈 VERY IMPORTANT
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Table
                style={{
                    width: "100%",
                    flex: 1,
                }}
                className={`custom-dark-table ${theme === "dark"
                    ? "dark-mode-pagination"
                    : "light-mode-pagination"
                    }`}
                scroll={{
                    x: "auto",
                    y: "calc(72vh - 120px)",
                }}
                dataSource={articles}
                columns={columns}
            />
        </div>
    );
};


const AffinityArticleBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, primaryText,
    headline,
    description, campaign_name }) => {
    // Initial data array
    const [mode, setMode] = useState('top');
    const [newArticle, setNewArticle] = useState(null);
    const { theme } = useTokenContext();
    const handleModeChange = e => {
        setMode(e.target.value);
    };
    const sendTheArticleData = (data) => {
        setNewArticle(data);
    };
    // const combinedRac =
    //     [primaryText, headline, description]
    //         .filter(Boolean)
    //         .join(",");
    // const components = {
    //     top: <CreateArticle />,
    //     left: <ArticlesList />,
    // };


    return (
        <div>
            <Row style={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
                <Radio.Group onChange={handleModeChange} value={mode} style={{ marginBottom: 8 }}>
                    <Radio.Button value="top">Create Article</Radio.Button>
                    <Radio.Button value="left">Articles List</Radio.Button>
                </Radio.Group>
            </Row>
            {/* {components[mode]} */}
            <div style={{ display: mode === "top" ? "block" : "none" }}>
                <CreateArticle theme={theme} onCreate={sendTheArticleData} />
            </div>


            <div style={{ display: mode === "left" ? "block" : "none" }}>
                <ArticlesList theme={theme} newArticle={newArticle} />
            </div>
        </div>
    );
};


export default AffinityArticleBuilder;

