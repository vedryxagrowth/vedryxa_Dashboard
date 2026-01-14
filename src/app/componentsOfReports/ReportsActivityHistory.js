import React, { useState, useEffect } from "react";
import { DatePicker, Select, Table, Modal, message, Flex } from "antd";
import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment-timezone";
import { useTokenContext } from '../components/parent';

const { RangePicker } = DatePicker;


/* =========================
History Modal Component
========================= */
const CampaignHistoryModal = ({ open, onClose, campaignId, accountNumber }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [storageData, setStorageData] = useState([]);
    const [newData, setNewData] = useState([]);
    const [changedByOptions, setChangedByOptions] = useState([{ label: "Anyone", value: "all" }]);
    const [activityTypeFilter, setActivityTypeFilter] = useState("All");
    const [changedByFilter, setChangedByFilter] = useState("all");
    const { apiClient, theme } = useTokenContext();

    useEffect(() => {
        if (!activityTypeFilter) return;
        console.log(changedByFilter)
        let newDatatoUpdatetoState = []

        switch (activityTypeFilter) {
            case "all":
                newDatatoUpdatetoState = (storageData);
                break;
            case "campaigns":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "campaign")
                break;
            case "adsets":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "adset")
                break;
            case "ads":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "ad")
                break;
            case "Comment":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Comment")
                break;
            case "Pin":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Pin")
                break;
            case "Bid":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Bid")
                break;
            case "Budget":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Budget")
                break;
            case "Category":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Category")
                break;
            default:
                newDatatoUpdatetoState = (storageData);
        }
        if (changedByFilter === "all") {
            setData(newDatatoUpdatetoState)
        } else {
            setData(newDatatoUpdatetoState.filter(item => item.updatedBy === changedByFilter))
        }
        setData(newDatatoUpdatetoState)
    }, [changedByFilter, activityTypeFilter, storageData]);


    useEffect(() => {
        if (!open || !campaignId || !accountNumber) return;


        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/getReportsActivityHistory?accountNumber=${accountNumber}&campaignid=${campaignId}`);
                const responseData = res.data;
                const newResponseData = [responseData.campaign, ...(responseData.adsets), ...(responseData.ads)]
                const objectsActivityHistory = newResponseData.reduce((acc, item) => {
                    if (Array.isArray(item?.ActivityHistory)) {
                        const updatedHistory = item.ActivityHistory.map(historyItem => ({
                            ...historyItem,
                            level: item.level
                        }));

                        acc.push(...updatedHistory);
                    }
                    return acc;
                }, []);

                const updatedByOptions = Array.from(
                    new Map(
                        objectsActivityHistory
                            .filter(item => item.updatedBy)
                            .map(item => {
                                const normalizedUpdatedBy = String(item.updatedBy)
                                    .trim()
                                    .toLowerCase(); // normalize key

                                return [
                                    normalizedUpdatedBy, // unique Map key
                                    {
                                        label: item.updatedBy.trim(), // display clean value
                                        value: item.updatedBy.trim(),
                                        level: item.level
                                    }
                                ];
                            })
                    ).values()
                );

                setChangedByOptions([{ label: "Anyone", value: "all" }, ...updatedByOptions])



                setNewData(newResponseData || []);
                setData(objectsActivityHistory)
                setStorageData(objectsActivityHistory)
            } catch (err) {
                message.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };


        fetchHistory();
    }, [open, campaignId, accountNumber]);

    const onChangeActivityType = (type) => {
        setActivityTypeFilter(type?.value);
    }

    const onChangeChangedBy = (type) => {
        setChangedByFilter(type?.value);
    }

    const columns = [
        { title: "Activity", dataIndex: "updateType" },
        { title: "Activity details", dataIndex: "updateDetail" },
        {
            title: "Item changed", dataIndex: "campaignname",
            render: (text, record) => {
                const level = record.level;
                let name;
                let type;
                let id;
                if (level === "campaign") {
                    name = record.campaignname
                    type = "Campaign ID"
                    id = record.campaignid
                } else if (level === "adset") {
                    name = record.adsetname
                    type = "Ad set ID"
                    id = record.adsetid
                } else if (level === "ad") {
                    name = record.adname
                    type = "Ad ID"
                    id = record.ad_id
                }


                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "10px" }}>{name}</span>
                        <span style={{ fontSize: "12px" }}>
                            {type}: {id}
                        </span>
                    </div>
                );
            },
        },
        { title: "Changed by", dataIndex: "updatedBy" },
        { title: "Date and time", dataIndex: "updateAt" },
    ];


    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width="90%"
            styles={{
                body: {
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            dropdownClassName={theme === "dark" && "custom-dropdown"}
            title="Campaign Activity History"
        >
            <div style={{ height: "100%" }}>
                {/* <div className="flex items-center justify-between px-6 py-4" style={{display:"flex"}}>
                    <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-xl">←</span>
                        <span className="text-base font-medium">Performance overview</span>
                    </div>
                    <RangePicker suffixIcon={<CalendarOutlined />} />
                </div> */}


                {/* Filters */}
                <div className="flex justify-end gap-3 px-6" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "5px" }}>
                    <Select
                        className="w-64"
                        // style={{ marginRight: "5px" }}
                        labelInValue
                        defaultValue={{ label: "All", value: "all" }}
                        labelRender={(option) => `Activity history: ${option.label}`}
                        options={[
                            { label: "All", value: "all" },
                            { label: "Ads", value: "ads" },
                            { label: "Ad Sets", value: "adsets" },
                            { label: "Bid", value: "Bid" },
                            { label: "Budget", value: "Budget" },
                            { label: "Campaigns", value: "campaigns" },
                            { label: "Comments", value: "Comment" },
                            { label: "Category", value: "Cateoty" },
                            { label: "Pin", value: "Pin" },

                        ]}
                        onChange={onChangeActivityType}
                        dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                        style={{
                            width: '160px',
                            backgroundColor: theme === 'dark' ? '#333' : undefined,
                            color: theme === 'dark' ? '#fff' : undefined,
                            border: '1px solid #4CAF50',
                            borderRadius: '6px',
                            marginRight: "5px"
                        }}
                    />


                    <Select
                        className="w-64"
                        labelInValue
                        defaultValue={{ label: "Anyone", value: "all" }}
                        labelRender={(option) => `Changed by: ${option.label}`}
                        options={changedByOptions}
                        onChange={onChangeChangedBy}
                        dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                        style={{
                            // width: '180px',
                            backgroundColor: theme === 'dark' ? '#333' : undefined,
                            color: theme === 'dark' ? '#fff' : undefined,
                            border: '1px solid #4CAF50',
                            borderRadius: '6px'
                        }}
                    />
                    {/* <RangePicker suffixIcon={<CalendarOutlined />} /> */}
                </div>

                <Table
                    size="small"
                    style={{
                        width: "100%",
                        // height: "calc(100vh - 300px)",
                        // minHeight: '100%',
                        tableLayout: "fixed",
                    }}
                    columns={columns}
                    className={`custom-dark-table ${theme === "dark"
                        ? "dark-mode-pagination"
                        : "light-mode-pagination"
                        }`}
                    dataSource={data.sort((a, b) =>
                        moment(b.updateAt, "DD-MM-YYYY hh:mm A", true).valueOf() -
                        moment(a.updateAt, "DD-MM-YYYY hh:mm A", true).valueOf()
                    )}
                    loading={loading}
                    rowKey={(r, i) => i}
                    pagination={false}
                    scroll={{
                        x: "auto",
                        y: "calc(68vh)",
                    }}
                    locale={{
                        emptyText: (
                            <div className="py-16 text-center text-slate-500">
                                No activity during selected date range
                            </div>
                        ),
                    }}
                    components={{
                        body: {
                            row: (props) => (
                                <tr
                                    {...props}
                                    style={{
                                        ...props.style,
                                        height: "30px",
                                    }}
                                />
                            ),
                            cell: (props) => (
                                <td
                                    {...props}
                                    style={{
                                        ...props.style,
                                        paddingTop: "6px",
                                        paddingBottom: "6px",
                                        fontSize: "13px",
                                    }}
                                />
                            ),
                        },
                    }}
                />
            </div>
        </Modal>
    );
}

export default CampaignHistoryModal;