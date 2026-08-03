"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Modal,
    Tabs,
    Input,
    Select,
    Button,
    Space,
    Tag,
    message,
    Segmented
} from "antd";
import {
    PlusOutlined,
    ThunderboltOutlined,
    CloseOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useTokenContext } from "../../../components/parent";

const { TextArea } = Input;
import JoditEditor from "jodit-react";

export default function AddSuggestedKeywordModal({
    open,
    onClose,
    // onSuccess,
    storeInState
}) {
    const { theme } = useTokenContext();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [termInput, setTermInput] = useState("");
    const [languages, setLanguages] = useState([]);
    const [verticles, setVerticles] = useState([]);
    const [contentVisited, setContentVisited] = useState(false);

    const [form, setForm] = useState({
        nativeKeyword: "",
        englishId: "",
        language: "",
        vertical: "",
        terms: [],
        title: "",
        excerpt: "",
        content: "",
    });

    const editor = useRef(null);

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: "Write article content...",
            height: 350,
            toolbarAdaptive: false,
            showCharsCounter: true,
            showWordsCounter: true,
            theme: theme === "dark" ? "dark" : "default",

            style: {
                background:
                    theme === "dark" ? "#2A2A2A" : "#ffffff",
                color:
                    theme === "dark" ? "#ffffff" : "#000000",
            },
            buttons: [
                "undo",
                "redo",
                "|",
                "paragraph",
                "fontsize",
                "bold",
                "italic",
                "underline",
                "|",
                "ul",
                "ol",
                "|",
                "left",
                "center",
                "right",
                "justify",
                "|",
                "image",
                "link",
                "|",
                "source"
            ]
        }),
        [theme]
    );

    useEffect(() => {
        if (open) {
            const getData = async () => {
                const token = localStorage.getItem("token")
                const response = await axios.get("https://fblaunching.vyaktimetrics.com/open/open/predicto/keyword/article/languagesandverticle-list", {
                    headers: { Authorization: token },
                })
                setLanguages(response.data.Languages)
                setVerticles(response.data.Verticals)
            }
            getData();
        }
    }, [open])

    const resetForm = () => {
        setForm({
            nativeKeyword: "",
            englishId: "",
            language: "",
            vertical: "",
            terms: [],
            title: "",
            excerpt: "",
            content: "",
        });

        setTermInput("");
        setActiveTab("general");
    };

    const addTerm = () => {
        if (!termInput.trim()) return;

        if (form.terms.includes(termInput.trim())) {
            message.warning("Term already added");
            return;
        }

        setForm({
            ...form,
            terms: [...form.terms, termInput.trim()],
        });

        setTermInput("");
    };

    const removeTerm = (term) => {
        setForm({
            ...form,
            terms: form.terms.filter((t) => t !== term),
        });
    };

    const generateTerms = () => {
        if (!form.nativeKeyword.trim()) {
            message.warning("Enter native keyword first");
            return;
        }

        const generated = [
            `${form.nativeKeyword} guide`,
            `${form.nativeKeyword} tips`,
            `${form.nativeKeyword} benefits`,
            `${form.nativeKeyword} examples`,
            `${form.nativeKeyword} tutorial`,
        ];

        setForm({
            ...form,
            terms: [...new Set([...form.terms, ...generated])],
        });
    };

    const handleSubmit = async () => {
        if (!form.nativeKeyword) {
            message.error("Native keyword is required");
            return;
        }
        if (!form.englishId) {
            message.error("English ID is required");
            return;
        }

        if (!form.terms.length) {
            message.error("Terms is required");
            return;
        }

        if (!form.language) {
            message.error("Language is required");
            return;
        }

        if (!form.vertical) {
            message.error("Vertical is required");
            return;
        }

        // Validate content fields only if user visited Content tab
        if (contentVisited) {
            if (!form.title?.trim()) {
                message.error("Title is required");
                return;
            }

            if (!form.excerpt?.trim()) {
                message.error("Excerpt is required");
                return;
            }

            const plainContent = form.content
                ?.replace(/<[^>]*>/g, "")
                ?.trim();

            if (!plainContent) {
                message.error("Content is required");
                return;
            }
        }

        const payload = {
            keywords: [
                {
                    keyword: form.englishId,
                    native_keyword: form.nativeKeyword,
                    language: form.language,
                    vertical: form.vertical,
                    status: "pending",
                    search_volume: 0,
                    competition: 0,
                    notes: "",
                    article_headline: form.title || null,
                    article_excerpt: form.excerpt || null,
                    article_content: form.content || null,
                    suggested_keywords: form.terms,
                },
            ],
        };

        console.log(payload)

        try {
            setLoading(true);
            

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `https://fblaunching.vyaktimetrics.com/open/predicto/keyword/articlecreate`,
                payload,
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201 || response.status === 200) {
                const responseData = response.data.data;

                storeInState(responseData);
                setForm({
                    nativeKeyword: "",
                    englishId: "",
                    language: "",
                    vertical: "",
                    terms: [],
                    title: "",
                    excerpt: "",
                    content: "",
                })
                // resetForm();

                // if (onSuccess) {
                //     onSuccess();
                // }

                // onClose();
            }
        } catch (error) {
            console.error(error);

            message.error(
                error?.response?.data?.detail?.[0]?.msg ||
                error?.response?.data?.message ||
                "Failed to create article"
            );
        } finally {
            setLoading(false);
        }

        // test

        // try {
        //     setLoading(true);

        //     const response = await fetch(
        //         "/api/keywords/create-article",
        //         {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //             body: JSON.stringify(payload),
        //         }
        //     );

        //     if (!response.ok) {
        //         throw new Error("Failed");
        //     }

        //     message.success("Suggested keyword created");

        //     resetForm();

        //     if (onSuccess) {
        //         onSuccess();
        //     }

        //     onClose();
        // } catch (error) {
        //     console.error(error);
        //     message.error("Failed to create article");
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            dropdownClassName={theme === "dark" && "custom-dropdown"}
            footer={null}
            width={480}
            centered
            destroyOnClose
            closeIcon={<CloseOutlined />}
        >
            <div
                style={{
                    marginBottom: 18,
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        // fontSize: 34,
                        fontWeight: 700,
                    }}
                >
                    Add Suggested Keyword
                </h3>

                <p
                    style={{
                        marginTop: 8,
                        color: "#667085",
                        // fontSize: 18,
                    }}
                >
                    Add a new suggested keyword
                </p>
            </div>

            <div style={{ marginBottom: 12 }}>
                <Segmented
                    block
                    value={activeTab}
                    // onChange={setActiveTab}
                    onChange={(value) => {
                        setActiveTab(value);

                        if (value === "content") {
                            setContentVisited(true);
                        }
                        else {
                            setContentVisited(false)
                        }
                    }}
                    options={[
                        {
                            label: (
                                <div
                                    style={{
                                        // paddingTop: 10,
                                        // paddingBottom: 4,
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                >
                                    General
                                </div>
                            ),
                            value: "general",
                        },
                        {
                            label: (
                                <div
                                    style={{
                                        // paddingTop: 10,
                                        // paddingBottom: 4,
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                >
                                    Content
                                </div>
                            ),
                            value: "content",
                        },
                    ]}
                    style={{
                        width: "100%",
                        background: "#eef2f6",
                        padding: 6,
                        borderRadius: 14,
                        height: 40,
                        color: theme === "dark" ? "#fff" : "#000",
                        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "#eef2f6",
                    }}
                />

                <div style={{ marginTop: 15 }}>
                    {activeTab === "general" && (
                        <div style={{
                            maxHeight: "50vh",
                            overflowY: "auto",
                        }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16,
                                    marginBottom: 20,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                            fontWeight: 500,
                                            fontSize: "14px"
                                        }}
                                    >
                                        Native Keyword (Main)
                                    </label>

                                    <Input
                                        // className="small-placeholder"
                                        className={theme === 'dark' ? 'small-placeholder custom-input-dark' : 'small-placeholder custom-input-light'}
                                        // size="large"
                                        placeholder="Main article keyword"
                                        value={form.nativeKeyword}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nativeKeyword: e.target.value,
                                            })
                                        }
                                        style={{ height: "32px" }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                            fontWeight: 600,
                                            fontSize: "14px"
                                        }}
                                    >
                                        English ID
                                    </label>

                                    <Input
                                        // className="small-placeholder"
                                        className={theme === 'dark' ? 'small-placeholder custom-input-dark' : 'small-placeholder custom-input-light'}
                                        // size="large"
                                        placeholder="english-id-format"
                                        value={form.englishId}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                englishId: e.target.value,
                                            })
                                        }
                                        style={{ height: "32px" }}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                            fontWeight: 600,
                                            fontSize: "14px"
                                        }}
                                    >
                                        Language
                                    </label>

                                    <Select
                                        // className="small-placeholder"
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'small-placeholder dark-theme' : 'small-placeholder light-theme'}
                                        showSearch
                                        // size="large"
                                        style={{ width: "100%", height: "32px" }}
                                        placeholder="Select language"
                                        value={form.language || undefined}
                                        onChange={(value) =>
                                            setForm({
                                                ...form,
                                                language: value,
                                            })
                                        }
                                        options={languages}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                            fontWeight: 600,
                                            fontSize: "14px"
                                        }}
                                    >
                                        Vertical
                                    </label>

                                    <Select
                                        size="large"
                                        showSearch
                                        // className="small-placeholder"
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        className={theme === 'dark' ? 'small-placeholder dark-theme' : 'small-placeholder light-theme'}
                                        style={{ width: "100%", height: "32px" }}
                                        placeholder="Select vertical"
                                        value={form.vertical || undefined}
                                        onChange={(value) =>
                                            setForm({
                                                ...form,
                                                vertical: value,
                                            })
                                        }
                                        options={verticles}
                                    />
                                </div>
                            </div>

                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 10,
                                    }}
                                >
                                    <label
                                        style={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        Terms
                                    </label>

                                    {/* <Button
                                        type="text"
                                        icon={<ThunderboltOutlined />}
                                        onClick={generateTerms}
                                    >
                                        Generate Terms
                                    </Button> */}
                                </div>

                                <div
                                    style={{
                                        color: "#667085",
                                        marginBottom: 12,
                                    }}
                                >
                                    Add related terms and drag to reorder them
                                </div>

                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Input
                                        // size="large"
                                        // className="small-placeholder"
                                        className={theme === 'dark' ? 'small-placeholder custom-input-dark' : 'small-placeholder custom-input-light'}
                                        placeholder="Add a new term"
                                        value={termInput}
                                        onChange={(e) =>
                                            setTermInput(e.target.value)
                                        }
                                    />

                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={addTerm}
                                        style={{ marginLeft: "10px" }}
                                    />
                                </div>

                                {/* <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                        marginTop: 15,
                                    }}
                                >
                                    {form.terms.map((term) => (
                                        <Tag
                                            key={term}
                                            closable
                                            onClose={() =>
                                                removeTerm(term)
                                            }
                                        >
                                            {term}
                                        </Tag>
                                    ))}
                                </div> */}
                                <div
                                    style={{
                                        marginTop: 15,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    {form.terms.map((term, index) => (
                                        <div
                                            key={`${term}-${index}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "10px 12px",
                                                border: `1px solid ${theme === "dark" ? "#434343" : "#d9d9d9"
                                                    }`,
                                                borderRadius: 8,
                                                background:
                                                    theme === "dark" ? "#1f1f1f" : "#f9fafb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        cursor: "grab",
                                                        color: theme === "dark" ? "#8c8c8c" : "#999",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    ⋮⋮
                                                </span>

                                                <span
                                                    style={{
                                                        color:
                                                            theme === "dark" ? "#fff" : "#000",
                                                    }}
                                                >{term}</span>
                                            </div>

                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeTerm(term)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "content" && (
                        <div
                            style={{
                                height: "50vh",
                                overflowY: "auto",
                                paddingRight: 8,
                            }}
                        >
                            <div style={{ marginBottom: 10 }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontWeight: 600,
                                        fontSize: "14px"
                                    }}
                                >
                                    Title
                                </label>

                                <Input
                                    // size="large"
                                    className={theme === 'dark' ? 'small-placeholder custom-input-dark' : 'small-placeholder custom-input-light'}
                                    maxLength={255}
                                    placeholder="Enter title"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontWeight: 600,
                                        fontSize: "14px"
                                    }}
                                >
                                    Excerpt
                                </label>

                                <TextArea
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Brief description"
                                    value={form.excerpt}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            excerpt: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontWeight: 600,
                                        fontSize: "14px"
                                    }}
                                >
                                    Content
                                </label>

                                <TextArea
                                    rows={12}
                                    placeholder="Write article content..."
                                    value={form.content}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            content: e.target.value,
                                        })
                                    }
                                />
                            </div> */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontWeight: 600,
                                        fontSize: "14px",
                                    }}
                                >
                                    Content
                                </label>

                                <JoditEditor
                                    ref={editor}
                                    value={form.content}
                                    config={config}
                                    onBlur={(newContent) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            content: newContent,
                                        }))
                                    }

                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 24,
                }}
            >
                <Button
                    // size="large"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="primary"
                    // size="large"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Add Suggested Keyword
                </Button>
            </div>
        </Modal>
    );
}