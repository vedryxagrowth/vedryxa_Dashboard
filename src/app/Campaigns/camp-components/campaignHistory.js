import React, { useState, useEffect } from "react";
import { Select, Table, Modal, message } from "antd";
import moment from "moment-timezone";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTokenContext } from "../../components/parent";

const timeZoneShortToFull = {
    EDT: "America/New_York",
    UTC: "Atlantic/Azores",
    EEST: "Europe/Athens",
    CST: "America/Mexico_City",
    PDT: "America/Los_Angeles",
    BST: "Europe/London",
    GMT: "Africa/Accra",
    IST: "Asia/Kolkata",
    MST: "America/Dawson",
    CDT: "America/Chicago",
    AST: "America/Puerto_Rico",
    DST: "Asia/Dubai",
    HST: "Pacific/Honolulu",
    EST: "America/Toronto",
    CEST: "Europe/Paris",
    CET: "Europe/Berlin",
};


const CampaignHistoryModal = ({ open, onClose, identifier, adAccounts }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [storageData, setStorageData] = useState([]);
    const [changedByOptions, setChangedByOptions] = useState([
        { label: "Anyone", value: "all" },
    ]);
    const [activityTypeFilter, setActivityTypeFilter] = useState("all");
    const [changedByFilter, setChangedByFilter] = useState("all");

    const { theme } = useTokenContext();
    const token = localStorage.getItem("token");


    const getAccountTimezone = (accountNumber, adAccounts) => {
        const accounts = Object.values(adAccounts || {}).flat();
        const acc = accounts.find(
            (a) => String(a.accountNumber) === String(accountNumber)
        );
        return timeZoneShortToFull[acc?.timeZone] || "Asia/Kolkata";
    };

    const convertToTimezoneAndFormat = (date, targetTz) => {
        const m = moment.tz(date, "DD-MM-YYYY hh:mm A", "Asia/Kolkata");

        return m
            .tz(targetTz)
            .isSame(moment().tz(targetTz), "year")
            ? m.tz(targetTz).format("DD MMM [at] HH:mm")
            : m.tz(targetTz).format("MMM DD, YYYY [at] h:mm A");
    };



    useEffect(() => {
        let filtered = [...storageData];

        switch (activityTypeFilter) {
            case "campaigns":
                filtered = filtered.filter((i) => i.level === "campaign");
                break;
            case "adsets":
                filtered = filtered.filter((i) => i.level === "adset");
                break;
            case "ads":
                filtered = filtered.filter((i) => i.level === "ad");
                break;
            case "budget":
                filtered = filtered.filter((i) => i.editType === "BUDGET");
                break;
            case "status":
                filtered = filtered.filter((i) => i.editType === "STATUS");
                break;
            case "approve":
                filtered = filtered.filter((i) => i.editType === "APPROVE");
                break;
            case "reject":
                filtered = filtered.filter((i) => i.editType === "REJECT");
                break;
            case "comment":
                filtered = filtered.filter((i) => i.editType === "COMMENT");
                break;
            case "edit":
                filtered = filtered.filter((i) => i.editType === "EDIT");
                break;
            case "category":
                filtered = filtered.filter((i) => i.editType === "CATEGORY");
                break;
            default:
                break;
        }

        if (changedByFilter !== "all") {
            filtered = filtered.filter((i) => i.updatedBy === changedByFilter);
        }

        setData(filtered);
    }, [activityTypeFilter, changedByFilter, storageData]);


    useEffect(() => {
        if (!open || !identifier) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    // `https://www.testapi.adsgoat.in/api/getCampaignActivityHistory/${identifier}`,
                    `https://fblaunching.vyaktimetrics.com/campaigns/history/${identifier}`,
                    {
                        method: "GET",
                        headers: { Authorization: token },
                    }
                );

                const json = await res.json();

                if (json?.status !== 200) {
                    message.error("Failed to load history");
                    return;
                }

                const history = json?.data?.activityHistory || [];
                // const accountNumber = json.accountNumber; 
                const accountNumber =
                    json?.data?.accountNumber ||
                    history?.[0]?.accountNumber ||
                    history?.[0]?.Account;
                const accountTz = getAccountTimezone(accountNumber, adAccounts);

                const formattedHistory = history.map((item) => ({
                    ...item,
                    _rawUpdateAt: item.updateAt,
                    updateAt: convertToTimezoneAndFormat(item.updateAt, "Asia/Kolkata"),
                    account: convertToTimezoneAndFormat(item.updateAt, accountTz),
                }));



                const updatedByOptions = Array.from(
                    new Map(
                        formattedHistory
                            .filter((i) => i.updatedBy)
                            .map((i) => [
                                i.updatedBy.trim().toLowerCase(),
                                { label: i.updatedBy.trim(), value: i.updatedBy.trim() },
                            ])
                    ).values()
                );

                setChangedByOptions([
                    { label: "Anyone", value: "all" },
                    ...updatedByOptions,
                ]);

                setStorageData(formattedHistory);
                setData(formattedHistory);
            } catch (err) {
                message.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [open, identifier, adAccounts, token]);

    const columns = [
        { title: "Activity", dataIndex: "updateType" },

        {
            title: "Activity details",
            dataIndex: "updateDetail",
            render: (value) => {
                if (!value) return null;

                const items = Array.isArray(value) ? value : [value];
                const filtered = items.filter((item) => {
                    const text = item.replace(/\s/g, "");
                    return !(
                        text.includes("null→null") ||
                        text.includes("null→[]") ||
                        text.includes("[]→[]")
                    );
                });

                if (!filtered.length) return null;

                const isLong = filtered.length > 2 || filtered.join("").length > 80;

                const tooltipContent = (
                    <div style={{ maxHeight: 250, overflowY: "auto" }}>
                        {filtered.map((item, i) => (
                            <div key={i}>{item}</div>
                        ))}
                    </div>
                );

                if (isLong) {
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 220,
                                }}
                            >
                                {filtered[0]}
                            </span>
                            <Tooltip
                                title={tooltipContent}
                                placement="topLeft"
                                overlayInnerStyle={{
                                    backgroundColor:
                                        theme === "dark" ? "#2b2b2b" : "#ffffff",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                }}
                            >
                                <InfoCircleOutlined
                                    style={{ fontSize: 14, color: "#1890ff", cursor: "pointer" }}
                                />
                            </Tooltip>
                        </div>
                    );
                }

                return (
                    <div>
                        {filtered.map((item, i) => (
                            <div key={i}>{item}</div>
                        ))}
                    </div>
                );
            },
        },

        {
            title: "Item changed",
            render: (_, record) => {
                let name = "";
                let type = "";
                let id = "";

                if (record.level === "campaign") {
                    name = record.campaignname;
                    type = "Campaign ID";
                    id = record.campaignid;
                } else if (record.level === "adset") {
                    name = record.adsetname;
                    type = "Ad Set ID";
                    id = record.adsetid;
                } else if (record.level === "ad") {
                    name = record.adname;
                    type = "Ad ID";
                    id = record.adid;
                }

                return (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>{name}</div>
                        {id && (
                            <div style={{ fontSize: 12 }}>
                                {type}: {id}
                            </div>
                        )}
                    </div>
                );
            },
        },

        { title: "Changed by", dataIndex: "updatedBy" },

        {
            title: "Date and time",
            align: "center",
            render: (_, record) => (
                <div style={{ fontSize: 10 }}>
                    <div>IST: {record.updateAt}</div>
                    <div>Acc TZ: {record.account}</div>
                </div>
            ),
        },
    ];


    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width="90%"
            title="Campaign Activity History"
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                }`}
            styles={{
                body: {
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <Select
                    labelInValue
                    defaultValue={{ label: "All", value: "all" }}
                    labelRender={(o) => `Activity history: ${o.label}`}
                    options={[
                        { label: "All", value: "all" },
                        { label: "Campaigns", value: "campaigns" },
                        { label: "Ad Sets", value: "adsets" },
                        { label: "Ads", value: "ads" },
                        { label: "Budget", value: "budget" },
                        { label: "Status", value: "status" },
                        { label: "Category", value: "category" },
                        { label: "Comment", value: "comment" },
                        { label: "Approve", value: "approve" },
                        { label: "Reject", value: "reject" },
                        { label: "Edit", value: "edit" },
                    ]}
                    onChange={(v) => setActivityTypeFilter(v.value)}
                    style={{ width: 180 }}
                />

                <Select
                    labelInValue
                    defaultValue={{ label: "Anyone", value: "all" }}
                    labelRender={(o) => `Changed by: ${o.label}`}
                    options={changedByOptions}
                    onChange={(v) => setChangedByFilter(v.value)}
                    style={{ width: 180 }}
                />
            </div>

            {/* Table */}
            <Table
                size="small"
                loading={loading}
                columns={columns}
                dataSource={[...data].sort(
                    (a, b) =>
                        moment(b._rawUpdateAt, "DD-MM-YYYY hh:mm A").valueOf() -
                        moment(a._rawUpdateAt, "DD-MM-YYYY hh:mm A").valueOf()
                )}
                rowKey={(_, i) => i}
                pagination={false}
                scroll={{ y: "68vh" }}
                locale={{
                    emptyText: (
                        <div style={{ padding: 40, textAlign: "center" }}>
                            No activity during selected date range
                        </div>
                    ),
                }}
            />
        </Modal>
    );
};

export default CampaignHistoryModal;
