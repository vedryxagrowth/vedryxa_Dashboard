"use client";

import { useEffect, useState } from "react";
import {
    Table,
    Spin,
    Empty,
    Typography,
    Space,
    Tag,
    Select,
} from "antd";
import {
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { useTokenContext } from "../../components/parent";

const { Text, Title } = Typography;

export default function CampaignHistoryPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const account = searchParams.get("account");
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const token = localStorage.getItem("token");
    const { theme } = useTokenContext();
    const [activityFilter, setActivityFilter] = useState("All");
    useEffect(() => {
        if (!account || !id) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `https://prodapis.adsgoat.in/History/get?account=${account}&id=${id}`,
                    {
                        method: "POST",
                        headers: { Authorization: token },
                    }
                );
                const result = await res.json();
                setData(result?.data || []);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [account, id, token]);
    const renderReadableExtraData = (extra, eventType) => {
        const textColor = { color: theme === "dark" ? "#ffffff" : "#000000" };

        if (!extra || typeof extra !== "object" || Object.keys(extra).length === 0)
            return <Text style={textColor}>—</Text>;

        const safeVal = (v) =>
            v === null || v === undefined
                ? "-"
                : typeof v === "object"
                    ? JSON.stringify(v)
                    : String(v);

        const extractValue = (obj, key) => {
            if (!obj) return "-";
            if (typeof obj !== "object") return obj;
            return obj[key] ?? obj.new_value ?? obj.old_value ?? safeVal(obj);
        };

        let sentence = "";

        if (eventType?.startsWith("create_")) {
            return <Text style={textColor}>—</Text>;
        }

        if (extra.type === "run_status" || extra.run_status) {
            const oldV = extra.old_value || extractValue(extra.run_status, "old_value");
            const newV = extra.new_value || extractValue(extra.run_status, "new_value");
            sentence =
                !oldV || oldV === "-" || oldV === newV
                    ? `Status set to ${newV}`
                    : `Status changed from ${oldV} → ${newV}`;
        }

        else if (extra.type === "composite_data") {
            const oldVal = extra.old_value || {};
            const newVal = extra.new_value || {};

            if (!extra.old_value && !extra.new_value && Object.keys(extra).length === 1) {
                sentence = "—";
            } else {
                const oldBudget = extractValue(oldVal, "old_value");
                const newBudget = extractValue(newVal, "new_value");

                if (oldVal.type === "payment_amount" && newVal.type === "payment_amount") {
                    sentence = `Budget changed from ${oldBudget} ${oldVal.currency || ""} → ${newBudget} ${newVal.currency || ""}${newVal.additional_value ? ` (${newVal.additional_value})` : ""}`;
                } else if (newVal.type === "payment_amount") {
                    sentence = `Budget set to ${newBudget} ${newVal.currency || ""}${newVal.additional_value ? ` (${newVal.additional_value})` : ""}`;
                } else {
                    sentence = "Composite data updated";
                }
            }
        }

        // targeting
        else if (
            extra.type === "targets_spec" ||
            extra.type === "target_spec" ||
            Array.isArray(extra.old_value) ||
            Array.isArray(extra.new_value)
        ) {
            try {
                const oldTargets = Array.isArray(extra.old_value) ? extra.old_value : [];
                const newTargets = Array.isArray(extra.new_value) ? extra.new_value : [];
                const changes = [];
                const shorten = (str) => (str.length > 120 ? str.slice(0, 120) + "..." : str);

                oldTargets.forEach((item, i) => {
                    const field = item.content?.replace(":", "")?.trim() || "Field";
                    const oldText = (item.children || []).join(", ");
                    const newText = (newTargets[i]?.children || []).join(", ");
                    if (oldText !== newText)
                        changes.push(`${field}: ${shorten(oldText || "-")} → ${shorten(newText || "-")}`);
                });

                sentence =
                    changes.length > 0
                        ? `Targeting updated — ${changes.join("; ")}`
                        : "Targeting updated";
            } catch {
                sentence = "Targeting updated";
            }
        }

        // optimization goal
        else if (extra.type === "optimization_goal") {
            const oldVal = extractValue(extra, "old_value");
            const newVal = extractValue(extra, "new_value");
            sentence =
                !oldVal || oldVal === "-" || oldVal === newVal
                    ? `Optimization goal set to ${newVal}`
                    : `Optimization goal changed from ${oldVal} → ${newVal}`;
        }

        // generic
        else if (extra.old_value !== undefined && extra.new_value !== undefined) {
            const oldVal = extractValue(extra, "old_value");
            const newVal = extractValue(extra, "new_value");
            sentence =
                !oldVal || oldVal === "-" || oldVal === newVal
                    ? `Set to ${newVal}`
                    : `Changed from ${oldVal} → ${newVal}`;
        }

        // fallback
        if (!sentence) {
            for (const [key, value] of Object.entries(extra)) {
                if (typeof value === "object" && value.old_value !== undefined && value.new_value !== undefined) {
                    const oldVal = extractValue(value, "old_value");
                    const newVal = extractValue(value, "new_value");
                    sentence =
                        !oldVal || oldVal === "-" || oldVal === newVal
                            ? `${key.replace(/_/g, " ")} set to ${newVal}`
                            : `${key.replace(/_/g, " ")} changed from ${oldVal} → ${newVal}`;
                    break;
                }
            }
        }

        if (!sentence || sentence.trim() === "" || sentence === "{}") sentence = "—";
        return <Text style={textColor}>{sentence}</Text>;
    };


    const renderActivityDetails = (record) => {
        const { old_value, new_value, extra_data } = record;
        const textColor = { color: theme === "dark" ? "#ffffff" : "#000000" };

        return (
            <div>
                {(old_value || new_value) && (
                    <Text style={textColor}>
                        From{" "}
                        <Tag color={theme === "dark" ? "#444" : "default"}>{old_value || "-"}</Tag> →{" "}
                        <Tag color={theme === "dark" ? "#595959" : "#91c25f"}>{new_value || "-"}</Tag>
                    </Text>
                )}
                {renderReadableExtraData(extra_data, record.event_type)}
            </div>
        );
    };
    const filterOptions = [
        { value: "All", label: "All" },
        { value: "Bid", label: "Bid" },
        { value: "Budget", label: "Budget" },
        { value: "Campaigns", label: "Campaigns" },
        { value: "Schedule", label: "Schedule" },
        { value: "Run Status", label: "Run Status" },
        { value: "Targeting", label: "Targeting" },
    ];
    const columns = [
        {
            title: "Activity",
            dataIndex: "event_type",
            key: "event_type",
            render: (text) => (
                <Text strong style={{ textTransform: "capitalize", color: theme === "dark" ? "#ffffff" : "#000000" }}>
                    {text.replace(/_/g, " ")}
                </Text>
            ),
        },
        {
            title: "Details",
            key: "activity_details",
            width: 500,
            render: (_, record) => (
                <div
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        maxWidth: "500px",

                    }}
                >
                    {renderActivityDetails(record)}
                </div>
            ),
        },

        {
            title: "Item Changed",
            key: "item_changed",
            render: (_, record) => (
                <>
                    <Text strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                        {record.object_name}
                    </Text>
                    <br />
                    <Text style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                        {record.object_type || ""}.ID: {record.object_id}
                    </Text>
                </>
            ),
        },
        {
            title: "User",
            dataIndex: "actor_name",
            key: "changed_by",
            render: (text) => (
                <Space>
                    <UserOutlined style={{ color: "#91c25f" }} />
                    <Text style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>{text}</Text>
                </Space>
            ),
        },
        {
            title: "Date",
            dataIndex: "event_time",
            key: "date_time",
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: "#91c25f" }} />
                    <Text style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                        {new Date(date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </Space>
            ),
        },
    ];
    const filteredData =
        activityFilter === "All"
            ? data
            : data.filter((item) => {
                const activityName = (item.event_type || "").toLowerCase();
                switch (activityFilter) {
                    case "Bid":
                        return activityName.includes("bid");
                    case "Budget":
                        return activityName.includes("budget");
                    case "Campaigns":
                        return activityName.includes("campaign");
                    case "Schedule":
                        return (
                            activityName.includes("schedule") ||
                            activityName.includes("time")
                        );
                    case "Run Status":
                        return (
                            activityName.includes("run_status") ||
                            activityName.includes("status")
                        );
                    case "Targeting":
                        return activityName.includes("target");
                    default:
                        return true;
                }
            });

    return (
        <div
        >
            {/* <div style={{ marginBottom: 16,padding:"10px" }}>
                <Title level={4} style={{ color: theme === "dark" ? "#ffffff" : "#000000", marginBottom: 4 }}>
                    {type} Activity History
                </Title>
                <Text style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                    Account: <b>{account}</b>
                </Text>
            </div> */}
            <div
                style={{
                    marginBottom: 16,
                    padding: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <Title level={4} style={{ color: theme === "dark" ? "#fff" : "#000", marginBottom: 4 }}>
                        {type} Activity History
                    </Title>
                    <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                        Account: <b>{account}</b>
                    </Text>
                </div>

                <div>
                    <Space>
                        <Text style={{ color: theme === "dark" ? "#fff" : "#000", fontWeight: 500 }}>
                            Activity Type:
                        </Text>
                        <Select
                            value={activityFilter}
                            onChange={setActivityFilter}
                            style={{
                                width: 200,
                                borderColor: "#91c25f",
                            }}
                            options={filterOptions}
                            dropdownStyle={{
                                backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
                                color: theme === "dark" ? "#fff" : "#000",
                            }}
                            optionRender={(option) => (
                                <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                                    {option.label}
                                </Text>
                            )}
                        />
                    </Space>
                </div>
            </div>


            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", height: "50vh" }}>
                    <Spin size="large" />
                </div>
            ) : data.length > 0 ? (
                <Table
                    columns={columns}
                    // dataSource={data}
                    dataSource={filteredData}
                    rowKey={(record) => record.object_id + record.event_time}
                    pagination={{ pageSize: 6, showSizeChanger: false }}
                    bordered
                    className={theme === "dark" ? "custom-pagination-dark" : "custom-pagination-light"}
                />
            ) : (
                <Empty description="No activity found" />
            )}
        </div>
    );
}
